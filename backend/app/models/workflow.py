"""
DataPilot – ORM Models: Workflow
"""
from __future__ import annotations
import json
from datetime import datetime
from sqlalchemy import String, Text, DateTime, JSON
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


class Workflow(Base):
    """Represents one end-to-end data-intelligence run."""
    __tablename__ = "workflows"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255))
    requirement: Mapped[str] = mapped_column(Text)          # raw NL requirement
    parsed_intent: Mapped[str | None] = mapped_column(Text, nullable=True)   # JSON
    status: Mapped[str] = mapped_column(String(50), default="pending")
    # pending | running | completed | failed
    source_connector: Mapped[str | None] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )
    steps_log: Mapped[str | None] = mapped_column(Text, nullable=True)       # JSON list of step events
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)

    def get_parsed_intent(self) -> dict:
        return json.loads(self.parsed_intent) if self.parsed_intent else {}

    def get_steps_log(self) -> list:
        return json.loads(self.steps_log) if self.steps_log else []
