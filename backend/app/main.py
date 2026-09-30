"""
DataPilot – FastAPI Application Factory
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.database import init_db
from app.api import health, workflows, datasets, connectors, quality


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown lifecycle."""
    # ── Startup ──────────────────────────────────────────────────────────
    init_db()
    print(f"[OK] DataPilot {settings.APP_VERSION} started - DB initialised")
    yield
    # ── Shutdown ─────────────────────────────────────────────────────────
    print("[BYE] DataPilot shutting down")


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        description="AI-Powered Data Intelligence Platform – DataPilot",
        docs_url="/api/docs",
        redoc_url="/api/redoc",
        openapi_url="/api/openapi.json",
        lifespan=lifespan,
    )

    # ── CORS ─────────────────────────────────────────────────────────────
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ── Routers ──────────────────────────────────────────────────────────
    app.include_router(health.router, prefix="/api", tags=["health"])
    app.include_router(workflows.router, prefix="/api/workflows", tags=["workflows"])
    app.include_router(datasets.router, prefix="/api/datasets", tags=["datasets"])
    app.include_router(connectors.router, prefix="/api/connectors", tags=["connectors"])
    app.include_router(quality.router, prefix="/api/quality", tags=["quality"])


    return app
