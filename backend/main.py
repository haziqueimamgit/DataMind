"""
DataPilot Backend – Application Entry Point
"""
import uvicorn
from app.main import create_app

app = create_app()

if __name__ == "__main__":
    from app.core.config import settings
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="info",
    )
