from typing import List, Dict, Any, Optional
import asyncio
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.chunk import DocumentChunk
from app.models.document import Document
from app.services.rag.embedder import embedder

def cosine_similarity(vec1: List[float], vec2: List[float]) -> float:
    if not vec1 or not vec2 or len(vec1) != len(vec2):
        return 0.0
    dot = sum(a * b for a, b in zip(vec1, vec2))
    norm1 = sum(a * a for a in vec1) ** 0.5
    norm2 = sum(b * b for b in vec2) ** 0.5
    if norm1 == 0 or norm2 == 0:
        return 0.0
    return dot / (norm1 * norm2)

class VectorRetriever:
    async def retrieve_relevant_chunks(
        self,
        db: AsyncSession,
        tenant_id: str,
        query: str,
        document_ids: Optional[List[str]] = None,
        top_k: int = 5,
        threshold: float = 0.3
    ) -> List[Dict[str, Any]]:
        query_vec = await asyncio.to_thread(embedder.embed_text, query)
        
        # 1. Fetch chunks belonging strictly to tenant_id
        stmt = select(DocumentChunk, Document.name.label("doc_name")).join(
            Document, DocumentChunk.document_id == Document.id
        ).where(DocumentChunk.tenant_id == tenant_id)
        
        if document_ids and len(document_ids) > 0:
            stmt = stmt.where(DocumentChunk.document_id.in_(document_ids))
            
        result = await db.execute(stmt)
        rows = result.all()
        
        scored_chunks = []
        for chunk, doc_name in rows:
            embedding = chunk.embedding_json or []
            similarity = cosine_similarity(query_vec, embedding) if embedding else 0.5
            
            scored_chunks.append({
                "chunk_id": chunk.id,
                "document_id": chunk.document_id,
                "document_name": doc_name,
                "content": chunk.content,
                "page_number": chunk.page_number,
                "similarity": round(similarity, 4),
                "metadata": chunk.metadata_json or {}
            })
            
        # Sort by highest similarity
        scored_chunks.sort(key=lambda x: x["similarity"], reverse=True)
        return [c for c in scored_chunks if c["similarity"] >= threshold][:top_k]

retriever = VectorRetriever()
