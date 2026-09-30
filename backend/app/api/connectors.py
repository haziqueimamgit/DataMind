"""
DataPilot – Connectors API

Endpoints:
  GET /api/connectors/   – list available source connectors
"""
from fastapi import APIRouter
from pydantic import BaseModel
from app.connectors.base import list_connectors

router = APIRouter()


class ConnectorInfo(BaseModel):
    connector_id: str
    display_name: str
    description: str
    is_demo: bool
    requires_auth: bool
    supported_domains: list[str]


@router.get("/", response_model=list[ConnectorInfo])
def list_available_connectors():
    """Return all registered source connectors."""
    return [
        ConnectorInfo(
            connector_id=c.connector_id,
            display_name=c.display_name,
            description=c.description,
            is_demo=c.is_demo,
            requires_auth=c.requires_auth,
            supported_domains=c.supported_domains,
        )
        for c in list_connectors()
    ]
