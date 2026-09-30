"""
DataPilot – Data Processing Pipeline

Orchestrates: collect → clean → validate → deduplicate → score → persist

Each step appends an event to the steps_log so the frontend can render
a live timeline of what happened.
"""
from __future__ import annotations
import json
import math
from datetime import datetime
from typing import Any

import pandas as pd
from sqlalchemy.orm import Session

from app.connectors.base import get_connector
from app.models.dataset import Dataset


# ── Step event helpers ───────────────────────────────────────────────────────

def _event(step: str, status: str, detail: str, stats: dict | None = None) -> dict:
    return {
        "step":      step,
        "status":    status,
        "detail":    detail,
        "stats":     stats or {},
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }


# ── Pipeline stages ──────────────────────────────────────────────────────────

def _collect(connector_id: str, intent: dict) -> tuple[pd.DataFrame, dict, str]:
    if not connector_id or connector_id == "auto":
        connector_id = intent.get("suggested_connector", "demo")
    try:
        connector = get_connector(connector_id)
    except KeyError:
        connector_id = "demo"
        connector = get_connector("demo")

    domain    = intent.get("domain", "sales")
    limit     = intent.get("record_limit", 200)

    df = connector.fetch(domain=domain, n=limit)
    return df, {
        "rows":         len(df),
        "columns":      len(df.columns),
        "connector":    connector_id,
        "domain":       domain,
        "source_label": connector.meta.display_name,
    }, connector_id



def _clean_nulls(df: pd.DataFrame) -> tuple[pd.DataFrame, int]:
    """Fill numeric nulls with column median; string nulls with 'Unknown'."""
    filled = 0
    for col in df.columns:
        null_count = df[col].isnull().sum()
        if null_count == 0:
            continue
        filled += int(null_count)
        if pd.api.types.is_numeric_dtype(df[col]):
            df[col] = df[col].fillna(df[col].median())
        else:
            df[col] = df[col].fillna("Unknown")
    return df, filled


def _deduplicate(df: pd.DataFrame) -> tuple[pd.DataFrame, int]:
    before = len(df)
    df = df.drop_duplicates()
    return df, before - len(df)


def _validate(df: pd.DataFrame) -> list[str]:
    """Basic column-type validation – returns list of issues found."""
    issues = []
    for col in df.columns:
        if df[col].dtype == object:
            # Check for suspiciously short values
            too_short = (df[col].str.len() < 1).sum()
            if too_short > 0:
                issues.append(f"'{col}': {too_short} empty-string values")
    return issues


def _compute_quality_score(
    original_rows: int,
    filled: int,
    dupes: int,
    issues: list[str],
) -> float:
    """
    Simple quality score 0–100.
    Penalises: null fills, duplicate removal, validation issues.
    """
    if original_rows == 0:
        return 0.0
    score = 100.0
    score -= min(30, (filled / max(original_rows, 1)) * 100)
    score -= min(20, (dupes  / max(original_rows, 1)) * 100)
    score -= min(10, len(issues) * 2)
    return round(max(0.0, score), 1)


def _build_schema(df: pd.DataFrame) -> dict:
    return {
        col: {
            "dtype":    str(df[col].dtype),
            "nullable": bool(df[col].isnull().any()),
            "unique":   int(df[col].nunique()),
            "sample":   [str(v) for v in df[col].dropna().head(3).tolist()],
        }
        for col in df.columns
    }


# ── Public entry point ───────────────────────────────────────────────────────

def run_pipeline(
    workflow_id: int,
    connector_id: str,
    intent: dict,
    db: Session,
) -> tuple[list[dict], int]:
    """
    Execute the full pipeline and persist a Dataset row.

    Returns:
        steps    – list of step event dicts (for the workflow log)
        dataset_id – id of the persisted Dataset
    """
    steps: list[dict] = []
    quality_ops: list[str] = intent.get("quality_ops", ["fill_nulls", "deduplicate"])

    # 1. Collect ──────────────────────────────────────────────────────────────
    df, collect_stats, resolved_connector_id = _collect(connector_id, intent)
    original_rows = len(df)
    steps.append(_event("collect", "success",
                         f"Fetched {original_rows} rows from '{resolved_connector_id}'",
                         collect_stats))

    # 2. Clean (fill nulls) ───────────────────────────────────────────────────
    filled = 0
    if "fill_nulls" in quality_ops:
        df, filled = _clean_nulls(df)
        steps.append(_event("clean", "success",
                             f"Filled {filled} null/missing values",
                             {"null_values_filled": filled}))

    # 3. Validate ─────────────────────────────────────────────────────────────
    issues: list[str] = []
    if "validate_types" in quality_ops:
        issues = _validate(df)
        steps.append(_event(
            "validate",
            "warning" if issues else "success",
            f"Found {len(issues)} validation issue(s)",
            {"issues": issues},
        ))

    # 4. Deduplicate ──────────────────────────────────────────────────────────
    dupes = 0
    if "deduplicate" in quality_ops:
        df, dupes = _deduplicate(df)
        steps.append(_event("deduplicate", "success",
                             f"Removed {dupes} duplicate rows",
                             {"duplicates_removed": dupes}))

    # 5. Score ────────────────────────────────────────────────────────────────
    quality_score = _compute_quality_score(original_rows, filled, dupes, issues)
    col_count = len(df.columns)
    completeness = round((1 - filled / (max(original_rows, 1) * max(col_count, 1))) * 100, 1)
    uniqueness = round((1 - dupes / max(original_rows, 1)) * 100, 1)
    validity = min(100.0, quality_score + 5)
    steps.append(_event("score", "success",
                         f"Data quality score: {quality_score}/100",
                         {
                             "quality_score":  quality_score,
                             "completeness":   completeness,
                             "uniqueness":     uniqueness,
                             "validity":       validity,
                         }))

    # 6. Persist dataset ──────────────────────────────────────────────────────
    connector_meta = get_connector(resolved_connector_id).meta
    data_records = df.where(pd.notnull(df), None).to_dict(orient="records")

    ds = Dataset(
        workflow_id=workflow_id,
        name=f"{intent.get('domain', 'data').capitalize()} Dataset – WF#{workflow_id}",
        description=intent.get("objective"),
        source_connector=resolved_connector_id,
        source_label=connector_meta.display_name,
        is_demo_data=connector_meta.is_demo,

        row_count=len(df),
        column_count=len(df.columns),
        duplicate_rows_removed=dupes,
        null_values_filled=filled,
        quality_score=quality_score,
        schema_json=json.dumps(_build_schema(df)),
        data_json=json.dumps(data_records, default=str),
    )
    db.add(ds)
    db.commit()
    db.refresh(ds)

    steps.append(_event("persist", "success",
                         f"Dataset #{ds.id} saved with {len(df)} clean rows",
                         {"dataset_id": ds.id}))

    return steps, ds.id
