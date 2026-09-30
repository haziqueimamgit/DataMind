"""
DataPilot – ORM Models: Dataset
"""
from __future__ import annotations
import json
from datetime import datetime
from sqlalchemy import String, Text, Integer, DateTime, Float
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


class Dataset(Base):
    """Represents a cleaned, validated dataset produced by a workflow run."""
    __tablename__ = "datasets"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    workflow_id: Mapped[int] = mapped_column(Integer, index=True)
    name: Mapped[str] = mapped_column(String(255))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Provenance / source traceability
    source_connector: Mapped[str] = mapped_column(String(100), default="demo")
    source_label: Mapped[str] = mapped_column(String(255), default="Built-in Demo Dataset")
    is_demo_data: Mapped[bool] = mapped_column(default=True)

    # Statistics (populated after processing)
    row_count: Mapped[int] = mapped_column(Integer, default=0)
    column_count: Mapped[int] = mapped_column(Integer, default=0)
    duplicate_rows_removed: Mapped[int] = mapped_column(Integer, default=0)
    null_values_filled: Mapped[int] = mapped_column(Integer, default=0)
    quality_score: Mapped[float] = mapped_column(Float, default=0.0)

    # Schema stored as JSON string
    schema_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    # Data stored as JSON string (for MVP; use parquet/S3 for production)
    data_json: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    def get_schema(self) -> dict:
        return json.loads(self.schema_json) if self.schema_json else {}

    def get_data(self) -> list:
        return json.loads(self.data_json) if self.data_json else []
