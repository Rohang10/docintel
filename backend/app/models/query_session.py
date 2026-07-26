import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Integer, DateTime, JSON, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base

class QuerySession(Base):
    __tablename__ = "query_sessions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id: Mapped[str] = mapped_column(String(36), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id: Mapped[str] = mapped_column(String(36), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=True)
    document_ids: Mapped[list] = mapped_column(JSON, default=list)
    messages: Mapped[list] = mapped_column(JSON, default=list)
    total_tokens: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
