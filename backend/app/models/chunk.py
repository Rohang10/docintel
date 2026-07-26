import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Integer, DateTime, JSON, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base

from sqlalchemy.types import TypeDecorator, String, JSON
import json

try:
    from pgvector.sqlalchemy import Vector
    class AsyncpgVector(Vector):
        def bind_processor(self, dialect):
            if getattr(dialect, "driver", None) == "asyncpg":
                def process(value):
                    return value
                return process
            return super().bind_processor(dialect)
    VectorColumnType = AsyncpgVector(3072)
except ImportError:
    class VectorType(TypeDecorator):
        impl = String
        cache_ok = True

        def load_dialect_impl(self, dialect):
            if dialect.name == "postgresql":
                from sqlalchemy.dialects.postgresql import VARCHAR
                return dialect.type_descriptor(VARCHAR())
            return dialect.type_descriptor(JSON())

        def bind_processor(self, dialect):
            if dialect.name == "postgresql":
                def process(value):
                    if value is None:
                        return None
                    if isinstance(value, (list, tuple)):
                        return json.dumps(value)
                    return str(value)
                return process
            else:
                def process(value):
                    return value
                return process

        def result_processor(self, dialect, coltype):
            def process(value):
                if value is None:
                    return None
                if isinstance(value, str):
                    try:
                        return json.loads(value)
                    except Exception:
                        return [float(x) for x in value.strip('[]').split(',') if x.strip()]
                return value
            return process

    VectorColumnType = VectorType

class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id: Mapped[str] = mapped_column(String(36), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    document_id: Mapped[str] = mapped_column(String(36), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    chunk_index: Mapped[int] = mapped_column(Integer, nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    content_hash: Mapped[str] = mapped_column(String(64), nullable=False)
    embedding_json: Mapped[list] = mapped_column("embedding", VectorColumnType, nullable=True) # pgvector compatible storage
    page_number: Mapped[int] = mapped_column(Integer, nullable=True)
    token_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    metadata_json: Mapped[dict] = mapped_column("metadata", JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
