"""
DataPilot – Source Connector Abstraction Layer

Each connector:
  1. Extends BaseConnector
  2. Implements fetch() → returns a pandas DataFrame
  3. Declares its connector_id and display metadata

Registry at the bottom maps connector_id → connector class.
"""
from __future__ import annotations
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
import pandas as pd


@dataclass
class ConnectorMeta:
    """Human-readable metadata about a connector."""
    connector_id: str
    display_name: str
    description: str
    is_demo: bool = False
    requires_auth: bool = False
    supported_domains: list[str] = field(default_factory=list)


class BaseConnector(ABC):
    """Abstract base class every source connector must implement."""

    meta: ConnectorMeta  # override in subclass

    @abstractmethod
    def fetch(self, **kwargs) -> pd.DataFrame:
        """
        Pull raw data from the source.
        kwargs are connector-specific parameters (e.g., query, limit, date range).
        Must return a pandas DataFrame – never an empty object on success.
        """
        ...

    def validate_connection(self) -> bool:
        """Optional: ping the source before fetching. Returns True if reachable."""
        return True


# ── Registry ────────────────────────────────────────────────────────────────

_REGISTRY: dict[str, type[BaseConnector]] = {}


def register_connector(cls: type[BaseConnector]) -> type[BaseConnector]:
    """Decorator – registers a connector class in the global registry."""
    _REGISTRY[cls.meta.connector_id] = cls
    return cls


def get_connector(connector_id: str) -> BaseConnector:
    """Instantiate a connector by its id. Raises KeyError if unknown."""
    if connector_id not in _REGISTRY:
        raise KeyError(f"Unknown connector: '{connector_id}'. Available: {list(_REGISTRY)}")
    return _REGISTRY[connector_id]()


def list_connectors() -> list[ConnectorMeta]:
    """Return metadata for all registered connectors."""
    return [cls.meta for cls in _REGISTRY.values()]


# ── Auto-discover connectors in this package ────────────────────────────────
# Import submodules so their @register_connector decorators fire.
from app.connectors import demo_connector  # noqa: E402, F401
from app.connectors import jobs_connector  # noqa: E402, F401
from app.connectors import market_connector  # noqa: E402, F401
from app.connectors import leads_connector  # noqa: E402, F401

