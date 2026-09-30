"""
DataPilot – Quality Analytics API

Endpoints:
  GET /api/quality/overview   – system-wide data quality health, compliance, distributions
"""
from __future__ import annotations
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.dataset import Dataset

router = APIRouter()


class QualityBucket(BaseModel):
    range: str
    count: int


class QualityOverview(BaseModel):
    total_datasets: int
    avg_quality_score: float
    avg_completeness: float
    avg_uniqueness: float
    datasets_above_80: int
    datasets_below_60: int
    total_records: int
    total_nulls_filled: int
    total_dupes_removed: int
    quality_distribution: list[QualityBucket]


@router.get("/overview", response_model=QualityOverview)
def get_quality_overview(db: Session = Depends(get_db)):
    datasets = db.query(Dataset).all()
    if not datasets:
        return QualityOverview(
            total_datasets=0,
            avg_quality_score=0.0,
            avg_completeness=100.0,
            avg_uniqueness=100.0,
            datasets_above_80=0,
            datasets_below_60=0,
            total_records=0,
            total_nulls_filled=0,
            total_dupes_removed=0,
            quality_distribution=[
                QualityBucket(range="90-100", count=0),
                QualityBucket(range="80-89", count=0),
                QualityBucket(range="70-79", count=0),
                QualityBucket(range="60-69", count=0),
                QualityBucket(range="<60", count=0),
            ],
        )

    total_records = sum(d.row_count for d in datasets)
    total_nulls = sum(d.null_values_filled for d in datasets)
    total_dupes = sum(d.duplicate_rows_removed for d in datasets)
    avg_quality = round(sum(d.quality_score for d in datasets) / len(datasets), 1)

    total_cells = sum(d.row_count * max(d.column_count, 1) for d in datasets)
    avg_completeness = round(max(0.0, min(100.0, (1 - total_nulls / max(total_cells, 1)) * 100)), 1)
    avg_uniqueness = round(max(0.0, min(100.0, (1 - total_dupes / max(total_records + total_dupes, 1)) * 100)), 1)

    above_80 = sum(1 for d in datasets if d.quality_score >= 80)
    below_60 = sum(1 for d in datasets if d.quality_score < 60)

    b_90_100 = sum(1 for d in datasets if d.quality_score >= 90)
    b_80_89 = sum(1 for d in datasets if 80 <= d.quality_score < 90)
    b_70_79 = sum(1 for d in datasets if 70 <= d.quality_score < 80)
    b_60_69 = sum(1 for d in datasets if 60 <= d.quality_score < 70)
    b_below_60 = sum(1 for d in datasets if d.quality_score < 60)

    distribution = [
        QualityBucket(range="90-100", count=b_90_100),
        QualityBucket(range="80-89", count=b_80_89),
        QualityBucket(range="70-79", count=b_70_79),
        QualityBucket(range="60-69", count=b_60_69),
        QualityBucket(range="<60", count=b_below_60),
    ]

    return QualityOverview(
        total_datasets=len(datasets),
        avg_quality_score=avg_quality,
        avg_completeness=avg_completeness,
        avg_uniqueness=avg_uniqueness,
        datasets_above_80=above_80,
        datasets_below_60=below_60,
        total_records=total_records,
        total_nulls_filled=total_nulls,
        total_dupes_removed=total_dupes,
        quality_distribution=distribution,
    )
