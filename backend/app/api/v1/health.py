import time
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from app.core.config import settings
from app.db.session import get_db

router = APIRouter()

@router.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "embedding_model": settings.EMBEDDING_MODEL,
        "llm_providers": {
            "gemini": bool(settings.GEMINI_API_KEY and settings.GEMINI_API_KEY != "your-google-gemini-api-key"),
            "groq": bool(settings.GROQ_API_KEY and settings.GROQ_API_KEY != "your-groq-api-key")
        }
    }

@router.get("/health/db-ping")
async def health_db_ping(db: AsyncSession = Depends(get_db)):
    """
    Production keep-alive ping for Supabase.
    Runs a lightweight query to verify connectivity, refresh activity counter,
    and prevent Supabase Free Tier auto-pausing.
    """
    start_time = time.time()
    try:
        result = await db.execute(text("SELECT current_timestamp, current_database();"))
        row = result.fetchone()
        latency_ms = round((time.time() - start_time) * 1000, 2)
        return {
            "status": "healthy",
            "database": "supabase_postgresql",
            "active": True,
            "db_name": str(row[1]) if row else "postgres",
            "server_timestamp": str(row[0]) if row else None,
            "latency_ms": latency_ms,
            "message": "Keep-alive ping successful. Supabase database active."
        }
    except Exception as e:
        latency_ms = round((time.time() - start_time) * 1000, 2)
        return {
            "status": "degraded",
            "database": "error",
            "active": False,
            "error": str(e),
            "latency_ms": latency_ms
        }

