import logging
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from app.core.config import settings

logger = logging.getLogger(__name__)

def parse_db_url(raw_url: str) -> str:
    if not raw_url:
        return "sqlite+aiosqlite:///./docintel.db"
    
    if "postgresql" in raw_url:
        try:
            prefix, rest = raw_url.split("://", 1)
            if "@" in rest:
                userinfo, host_part = rest.rsplit("@", 1)
                if ":" in userinfo:
                    user, password = userinfo.split(":", 1)
                    password = password.replace("@", "%40")
                    userinfo = f"{user}:{password}"
                rest = f"{userinfo}@{host_part}"
            clean_url = f"{prefix}://{rest}"
            if clean_url.startswith("postgresql://"):
                clean_url = clean_url.replace("postgresql://", "postgresql+asyncpg://", 1)
            return clean_url
        except Exception:
            pass
            
    if raw_url.startswith("postgresql://"):
        return raw_url.replace("postgresql://", "postgresql+asyncpg://", 1)
        
    return raw_url

db_url = parse_db_url(settings.DATABASE_URL)

try:
    engine = create_async_engine(
        db_url,
        echo=False,
        future=True,
        pool_pre_ping=True if "postgresql" in db_url else False,
    )
except Exception as e:
    logger.warning(f"Failed to create engine for {db_url}: {e}. Falling back to SQLite.")
    db_url = "sqlite+aiosqlite:///./docintel.db"
    engine = create_async_engine(db_url, echo=False, future=True)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

