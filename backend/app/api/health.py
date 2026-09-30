"""
DataPilot – Health & Status API
"""
from datetime import datetime
from fastapi import APIRouter
from pydantic import BaseModel
from app.core.config import settings
from app.connectors.base import list_connectors

router = APIRouter()


class HealthResponse(BaseModel):
    status: str
    app: str
    version: str
    environment: str
    ai_mode: str
    timestamp: str
    connectors_available: list[str]


@router.get("/health", response_model=HealthResponse)
def health_check():
    """Returns current system health and configuration summary."""
    return HealthResponse(
        status="ok",
        app=settings.APP_NAME,
        version=settings.APP_VERSION,
        environment=settings.ENVIRONMENT,
        ai_mode=settings.AI_MODEL,
        timestamp=datetime.utcnow().isoformat() + "Z",
        connectors_available=[c.connector_id for c in list_connectors()],
    )
