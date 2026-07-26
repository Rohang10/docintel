import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.logging import setup_logging, logger
from app.core.middleware import TenantAndAuditMiddleware
from app.api.v1.router import api_router
from app.db.session import engine
from app.db.base import Base

# Import all models to ensure metadata registration
from app.models import tenant, user, document, chunk, query_session, audit_log

@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_logging()
    logger.info("Initializing Secure Document Query System Backend...")
    
    # Run DB verification asynchronously in background so server startup is instant (0.1s)
    async def init_db_background():
        try:
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
            logger.info("Database connection & schema verified successfully.")
        except Exception as e:
            logger.warning(f"Primary database connection slow/failed ({e}). Configuring local SQLite fallback...")
            from sqlalchemy.ext.asyncio import create_async_engine
            from app.db import session
            session.engine = create_async_engine("sqlite+aiosqlite:///./docintel.db", echo=False, future=True)
            session.AsyncSessionLocal.configure(bind=session.engine)
            async with session.engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
            logger.info("Local SQLite fallback initialized.")

        try:
            from sqlalchemy import update
            from app.models.document import Document
            from app.db.session import AsyncSessionLocal
            async with AsyncSessionLocal() as db:
                await db.execute(
                    update(Document)
                    .where(Document.status.in_(["pending", "extracting", "masking", "chunking", "embedding"]))
                    .values(status="failed", error_message="Server restarted while document was processing. Please delete and re-upload.")
                )
                await db.commit()
            logger.info("Cleaned up orphaned processing documents from prior server sessions.")
        except Exception as e:
            logger.warning(f"Orphaned document cleanup skipped: {e}")

    asyncio.create_task(init_db_background())
    # No local embedding model to warm up — using Gemini API (zero RAM, free tier compatible)

    yield
    logger.info("Shutting down Secure Document Query System Backend...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# CORS Setup - Supports all domains, localhost, Vercel, Render, and custom deployment domains
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_origin_regex=r"https?://.*",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["X-Process-Time-Ms", "Content-Type", "Authorization", "X-Tenant-ID"]
)

# Tenant & Audit Middleware with CORS Preflight Handling
app.add_middleware(TenantAndAuditMiddleware)

# Include Router
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {
        "status": "success",
        "message": "Backend connected successfully"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
