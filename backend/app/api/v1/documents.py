import asyncio
from typing import List
from pathlib import Path
from fastapi import APIRouter, Depends, UploadFile, File, BackgroundTasks, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete

from app.db.session import get_db
from app.api.deps import get_current_user_claims
from app.models.document import Document
from app.models.chunk import DocumentChunk
from app.schemas.document import DocumentResponse, DocumentStatusResponse
from app.services.document.storage import storage
from app.services.document.extractor import extractor
from app.services.document.chunker import chunker
from app.services.security.pii_masker import pii_masker
from app.services.rag.embedder import embedder
from app.core.logging import logger

router = APIRouter()

async def process_document_pipeline(document_id: str, tenant_id: str, file_path_str: str, file_type: str, db_session_factory):
    async with db_session_factory() as db:
        result = await db.execute(select(Document).where(Document.id == document_id))
        doc = result.scalar_one_or_none()
        if not doc:
            return

        try:
            doc.status = "extracting"
            await db.commit()

            # Step 1: Text extraction
            pages = await extractor.extract(Path(file_path_str), file_type)
            doc.page_count = len(pages)
            doc.status = "masking"
            await db.commit()

            # Step 2: PII Masking & Semantic Chunking
            masked_pages = []
            detected_pii_entities = set()
            for p in pages:
                masked_text, pii_types = pii_masker.mask(p["text"])
                detected_pii_entities.update(pii_types)
                masked_pages.append({"page": p["page"], "text": masked_text})

            doc.pii_entities = sorted(list(detected_pii_entities))
            doc.status = "chunking"
            await db.commit()

            # Step 3: Chunking & gemini-embedding-001 Batch Embedding
            raw_chunks = chunker.chunk_pages(masked_pages)
            doc.chunk_count = len(raw_chunks)
            doc.status = "embedding"
            await db.commit()

            # Batch encode all chunk vectors via native async Gemini API (zero thread blocking)
            chunk_texts = [c["content"] for c in raw_chunks]
            vecs = await embedder.aembed_documents(chunk_texts)

            chunk_objs = []
            for idx, c in enumerate(raw_chunks):
                chunk_obj = DocumentChunk(
                    tenant_id=tenant_id,
                    document_id=doc.id,
                    chunk_index=c["chunk_index"],
                    content=c["content"],
                    content_hash=c["content_hash"],
                    embedding_json=vecs[idx],
                    page_number=c["page_number"],
                    token_count=c["token_count"],
                    metadata_json={"document_name": doc.name}
                )
                chunk_objs.append(chunk_obj)

            db.add_all(chunk_objs)
            doc.status = "ready"
            await db.commit()
            logger.info(f"Document {document_id} processed successfully with {len(raw_chunks)} chunks.")

        except Exception as e:
            logger.error(f"Error processing document {document_id}: {e}")
            doc.status = "failed"
            doc.error_message = str(e)
            await db.commit()

@router.post("/", response_model=DocumentResponse, status_code=status.HTTP_202_ACCEPTED)
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    claims: dict = Depends(get_current_user_claims),
    db: AsyncSession = Depends(get_db)
):
    tenant_id = claims["tenant_id"]
    user_id = claims["sub"]

    filename = file.filename or "uploaded_document"
    ext = filename.split(".")[-1].lower() if "." in filename else "txt"

    if ext not in ["pdf", "docx", "txt"]:
        raise HTTPException(status_code=400, detail="Unsupported file format. Allowed: pdf, docx, txt")

    content = await file.read()
    if len(content) > 50 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File too large (max 50MB)")

    doc = Document(
        tenant_id=tenant_id,
        uploaded_by=user_id,
        name=filename,
        original_name=filename,
        file_type=ext,
        file_size=len(content),
        storage_path="",
        status="pending"
    )
    db.add(doc)
    await db.commit()
    await db.refresh(doc)

    storage_path, _ = await storage.save_file(tenant_id, doc.id, filename, content)
    doc.storage_path = storage_path
    await db.commit()
    await db.refresh(doc)

    from app.db.session import AsyncSessionLocal
    background_tasks.add_task(
        process_document_pipeline,
        doc.id,
        tenant_id,
        storage_path,
        ext,
        AsyncSessionLocal
    )

    return DocumentResponse(
        id=doc.id,
        tenant_id=doc.tenant_id,
        uploaded_by=doc.uploaded_by,
        name=doc.name,
        original_name=doc.original_name,
        file_type=doc.file_type,
        file_size=doc.file_size,
        status=doc.status,
        page_count=doc.page_count,
        chunk_count=doc.chunk_count,
        pii_entities=doc.pii_entities or [],
        metadata=doc.metadata_json or {},
        error_message=doc.error_message,
        created_at=doc.created_at,
        updated_at=doc.updated_at
    )

@router.get("/", response_model=List[DocumentResponse])
async def list_documents(
    claims: dict = Depends(get_current_user_claims),
    db: AsyncSession = Depends(get_db)
):
    tenant_id = claims["tenant_id"]
    result = await db.execute(select(Document).where(Document.tenant_id == tenant_id).order_by(Document.created_at.desc()))
    docs = result.scalars().all()

    return [
        DocumentResponse(
            id=d.id,
            tenant_id=d.tenant_id,
            uploaded_by=d.uploaded_by,
            name=d.name,
            original_name=d.original_name,
            file_type=d.file_type,
            file_size=d.file_size,
            status=d.status,
            page_count=d.page_count,
            chunk_count=d.chunk_count,
            pii_entities=d.pii_entities or [],
            metadata=d.metadata_json or {},
            error_message=d.error_message,
            created_at=d.created_at,
            updated_at=d.updated_at
        )
        for d in docs
    ]

@router.get("/{document_id}/status", response_model=DocumentStatusResponse)
async def get_document_status(
    document_id: str,
    claims: dict = Depends(get_current_user_claims),
    db: AsyncSession = Depends(get_db)
):
    tenant_id = claims["tenant_id"]
    result = await db.execute(select(Document).where(Document.id == document_id, Document.tenant_id == tenant_id))
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    progress_map = {
        "pending": 10,
        "extracting": 30,
        "masking": 55,
        "chunking": 75,
        "embedding": 90,
        "ready": 100,
        "failed": 0
    }

    return DocumentStatusResponse(
        id=doc.id,
        status=doc.status,
        progress=progress_map.get(doc.status, 0),
        current_step=doc.status.capitalize(),
        chunk_count=doc.chunk_count,
        pii_entities=doc.pii_entities or [],
        error_message=doc.error_message
    )

@router.delete("/{document_id}")
async def delete_document(
    document_id: str,
    claims: dict = Depends(get_current_user_claims),
    db: AsyncSession = Depends(get_db)
):
    tenant_id = claims["tenant_id"]
    result = await db.execute(select(Document).where(Document.id == document_id, Document.tenant_id == tenant_id))
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    if doc.storage_path:
        await storage.delete_file(doc.storage_path)

    await db.execute(delete(DocumentChunk).where(DocumentChunk.document_id == document_id))
    await db.delete(doc)
    await db.commit()

    return {"success": True, "message": "Document deleted successfully"}
