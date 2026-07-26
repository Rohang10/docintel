from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class QueryRequest(BaseModel):
    content: str
    document_ids: Optional[List[str]] = None
    session_id: Optional[str] = None

class SourceCitation(BaseModel):
    document_id: str
    document_name: str
    page_number: Optional[int] = None
    content_snippet: str
    similarity: float

class QueryMessage(BaseModel):
    role: str
    content: str
    sources: Optional[List[SourceCitation]] = None
    created_at: Optional[datetime] = None

class QuerySessionResponse(BaseModel):
    id: str
    tenant_id: str
    title: Optional[str] = None
    document_ids: Optional[List[str]] = None
    messages: List[QueryMessage] = []
    created_at: datetime
