from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class DocumentResponse(BaseModel):
    id: str
    tenant_id: str
    uploaded_by: str
    name: str
    original_name: str
    file_type: str
    file_size: int
    status: str
    page_count: Optional[int] = None
    chunk_count: Optional[int] = None
    pii_entities: List[str] = []
    metadata: Dict[str, Any] = {}
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime

class DocumentStatusResponse(BaseModel):
    id: str
    status: str
    progress: int
    current_step: str
    chunk_count: Optional[int] = None
    pii_entities: List[str] = []
    error_message: Optional[str] = None
