"""
DataPilot – Workflows API

Endpoints:
  POST   /api/workflows/plan          – preview AI workflow execution plan
  POST   /api/workflows/              – create & run a new workflow
  GET    /api/workflows/stats         – workflow KPI aggregate stats
  GET    /api/workflows/              – list all workflows
  GET    /api/workflows/{id}          – get workflow details + step log
  POST   /api/workflows/{id}/rerun    – re-run an existing workflow
  DELETE /api/workflows/{id}          – delete a workflow and its datasets
"""
from __future__ import annotations
import json
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.config import settings
from app.models.workflow import Workflow
from app.models.dataset import Dataset
from app.services.requirement_parser import parse_requirement
from app.services.pipeline import run_pipeline
from app.connectors.base import get_connector, list_connectors

router = APIRouter()


# ── Schemas ───────────────────────────────────────────────────────────────────

class WorkflowCreate(BaseModel):
    name: str
    requirement: str
    connector_id: str = "demo"


class WorkflowSummary(BaseModel):
    id: int
    name: str
    requirement: str
    status: str
    source_connector: str | None
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True


class WorkflowDetail(WorkflowSummary):
    parsed_intent: dict
    steps_log: list
    error_message: str | None


class WorkflowStats(BaseModel):
    total: int
    completed: int
    failed: int
    running: int
    pending: int
    total_records_processed: int
    avg_quality_score: float


class PlannedStep(BaseModel):
    step: str
    description: str
    status: str = "planned"


class WorkflowPlan(BaseModel):
    name: str
    requirement: str
    connector_id: str
    parsed_intent: dict
    planned_steps: list[PlannedStep]
    estimated_records: int
    domain: str
    fields_requested: list[str]
    quality_ops_planned: list[str]
    ai_mode: str


# ── Routes ───────────────────────────────────────────────────────────────────

@router.post("/plan", response_model=WorkflowPlan)
def plan_workflow(payload: WorkflowCreate):
    """
    AI-powered execution planner: Understands requirement and generates
    the multi-step pipeline design before execution.
    """
    intent = parse_requirement(payload.requirement)
    domain = intent.get("domain", "general")
    conn_id = payload.connector_id
    if not conn_id or conn_id == "auto":
        conn_id = intent.get("suggested_connector", "demo")

    try:
        conn = get_connector(conn_id)
        conn_name = conn.meta.display_name
    except KeyError:
        conn_name = "Built-in Source"

    quality_ops = intent.get("quality_ops", ["fill_nulls", "deduplicate", "validate_types"])

    planned_steps = [
        PlannedStep(
            step="intent_understanding",
            description=f"AI extracts domain '{domain}' with objective: {intent.get('objective', '')}",
        ),
        PlannedStep(
            step="data_collection",
            description=f"Connect to '{conn_name}' ({conn_id}) and extract ~{intent.get('record_limit', 100)} records",
        ),
    ]

    if "fill_nulls" in quality_ops:
        planned_steps.append(PlannedStep(
            step="null_imputation",
            description="Identify missing fields and apply type-aware default & median imputation",
        ))

    if "validate_types" in quality_ops:
        planned_steps.append(PlannedStep(
            step="schema_validation",
            description="Validate column datatypes, format constraints, and anomaly bounds",
        ))

    if "deduplicate" in quality_ops:
        planned_steps.append(PlannedStep(
            step="deduplication",
            description="Compute row hashes and prune redundant entries",
        ))

    planned_steps.append(PlannedStep(
        step="quality_scoring",
        description="Compute composite quality index (completeness, uniqueness, validity 0-100)",
    ))
    planned_steps.append(PlannedStep(
        step="dataset_persistence",
        description="Persist clean dataset with cryptographic provenance and audit lineage",
    ))

    return WorkflowPlan(
        name=payload.name,
        requirement=payload.requirement,
        connector_id=conn_id,
        parsed_intent=intent,
        planned_steps=planned_steps,
        estimated_records=intent.get("record_limit", 100),
        domain=domain,
        fields_requested=intent.get("columns", []),
        quality_ops_planned=quality_ops,
        ai_mode=settings.AI_MODEL,
    )


@router.get("/stats", response_model=WorkflowStats)
def get_workflow_stats(db: Session = Depends(get_db)):
    """Summary KPI metrics across all workflows."""
    workflows = db.query(Workflow).all()
    datasets = db.query(Dataset).all()

    total = len(workflows)
    completed = sum(1 for w in workflows if w.status == "completed")
    failed = sum(1 for w in workflows if w.status == "failed")
    running = sum(1 for w in workflows if w.status == "running")
    pending = sum(1 for w in workflows if w.status == "pending")

    total_records = sum(d.row_count for d in datasets)
    avg_quality = round(sum(d.quality_score for d in datasets) / len(datasets), 1) if datasets else 0.0

    return WorkflowStats(
        total=total,
        completed=completed,
        failed=failed,
        running=running,
        pending=pending,
        total_records_processed=total_records,
        avg_quality_score=avg_quality,
    )


@router.post("/", response_model=WorkflowDetail, status_code=201)
def create_workflow(payload: WorkflowCreate, db: Session = Depends(get_db)):
    """Parse NL requirement, run the data pipeline, persist results."""
    # Resolve connector if auto
    conn_id = payload.connector_id
    wf = Workflow(
        name=payload.name,
        requirement=payload.requirement,
        status="running",
        source_connector=conn_id,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    db.add(wf)
    db.commit()
    db.refresh(wf)

    try:
        intent = parse_requirement(payload.requirement)
        wf.parsed_intent = json.dumps(intent)

        if not conn_id or conn_id == "auto":
            conn_id = intent.get("suggested_connector", "demo")
            wf.source_connector = conn_id

        steps, dataset_id = run_pipeline(
            workflow_id=wf.id,
            connector_id=conn_id,
            intent=intent,
            db=db,
        )

        wf.status = "completed"
        wf.steps_log = json.dumps(steps)
        wf.updated_at = datetime.utcnow()

    except Exception as exc:
        wf.status = "failed"
        wf.error_message = str(exc)
        wf.updated_at = datetime.utcnow()

    db.add(wf)
    db.commit()
    db.refresh(wf)

    return _to_detail(wf)


@router.get("/", response_model=list[WorkflowSummary])
def list_workflows(db: Session = Depends(get_db)):
    rows = db.query(Workflow).order_by(Workflow.created_at.desc()).all()
    return [
        WorkflowSummary(
            id=r.id,
            name=r.name,
            requirement=r.requirement,
            status=r.status,
            source_connector=r.source_connector,
            created_at=r.created_at.isoformat(),
            updated_at=r.updated_at.isoformat(),
        )
        for r in rows
    ]


@router.get("/{workflow_id}", response_model=WorkflowDetail)
def get_workflow(workflow_id: int, db: Session = Depends(get_db)):
    wf = db.query(Workflow).filter(Workflow.id == workflow_id).first()
    if not wf:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return _to_detail(wf)


@router.post("/{workflow_id}/rerun", response_model=WorkflowDetail)
def rerun_workflow(workflow_id: int, db: Session = Depends(get_db)):
    wf = db.query(Workflow).filter(Workflow.id == workflow_id).first()
    if not wf:
        raise HTTPException(status_code=404, detail="Workflow not found")

    wf.status = "running"
    wf.error_message = None
    wf.updated_at = datetime.utcnow()
    db.commit()

    try:
        intent = parse_requirement(wf.requirement)
        wf.parsed_intent = json.dumps(intent)
        conn_id = wf.source_connector or intent.get("suggested_connector", "demo")

        steps, dataset_id = run_pipeline(
            workflow_id=wf.id,
            connector_id=conn_id,
            intent=intent,
            db=db,
        )

        wf.status = "completed"
        wf.steps_log = json.dumps(steps)
        wf.updated_at = datetime.utcnow()

    except Exception as exc:
        wf.status = "failed"
        wf.error_message = str(exc)
        wf.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(wf)
    return _to_detail(wf)


@router.delete("/{workflow_id}", status_code=204)
def delete_workflow(workflow_id: int, db: Session = Depends(get_db)):
    wf = db.query(Workflow).filter(Workflow.id == workflow_id).first()
    if not wf:
        raise HTTPException(status_code=404, detail="Workflow not found")

    # Delete related datasets
    db.query(Dataset).filter(Dataset.workflow_id == workflow_id).delete()
    db.delete(wf)
    db.commit()
    return None


# ── Helper ───────────────────────────────────────────────────────────────────

def _to_detail(wf: Workflow) -> WorkflowDetail:
    return WorkflowDetail(
        id=wf.id,
        name=wf.name,
        requirement=wf.requirement,
        status=wf.status,
        source_connector=wf.source_connector,
        created_at=wf.created_at.isoformat(),
        updated_at=wf.updated_at.isoformat(),
        parsed_intent=wf.get_parsed_intent(),
        steps_log=wf.get_steps_log(),
        error_message=wf.error_message,
    )
