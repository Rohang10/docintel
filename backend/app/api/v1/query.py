import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete

from app.db.session import get_db
from app.api.deps import get_current_user_claims
from app.models.query_session import QuerySession
from app.schemas.query import QueryRequest, QuerySessionResponse, SourceCitation, QueryMessage
from app.services.rag.retriever import retriever
from app.services.rag.prompt_guard import prompt_guard, InjectionRisk
from app.services.rag.generator import generator

router = APIRouter()

@router.post("/sessions", response_model=QuerySessionResponse)
async def create_query_session(
    data: QueryRequest,
    claims: dict = Depends(get_current_user_claims),
    db: AsyncSession = Depends(get_db)
):
    tenant_id = claims["tenant_id"]
    user_id = claims["sub"]

    session = QuerySession(
        tenant_id=tenant_id,
        user_id=user_id,
        title=data.content[:40] + ("..." if len(data.content) > 40 else ""),
        document_ids=data.document_ids or [],
        messages=[]
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)

    return QuerySessionResponse(
        id=session.id,
        tenant_id=session.tenant_id,
        title=session.title,
        document_ids=session.document_ids or [],
        messages=[],
        created_at=session.created_at
    )

@router.get("/sessions", response_model=List[QuerySessionResponse])
async def list_query_sessions(
    claims: dict = Depends(get_current_user_claims),
    db: AsyncSession = Depends(get_db)
):
    tenant_id = claims["tenant_id"]
    result = await db.execute(select(QuerySession).where(QuerySession.tenant_id == tenant_id).order_by(QuerySession.updated_at.desc()))
    sessions = result.scalars().all()

    return [
        QuerySessionResponse(
            id=s.id,
            tenant_id=s.tenant_id,
            title=s.title,
            document_ids=s.document_ids or [],
            messages=s.messages or [],
            created_at=s.created_at
        )
        for s in sessions
    ]

@router.post("/stream")
async def stream_query(
    data: QueryRequest,
    claims: dict = Depends(get_current_user_claims),
    db: AsyncSession = Depends(get_db)
):
    tenant_id = claims["tenant_id"]

    # 1. Prompt Injection Guard check on query
    query_risk, matched_patterns = prompt_guard.scan(data.content)
    if query_risk == InjectionRisk.BLOCKED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Query blocked by Prompt Injection Guard (Adversarial patterns detected: {matched_patterns})"
        )

    # 2. Vector Retrieval (tenant-scoped)
    relevant_chunks = await retriever.retrieve_relevant_chunks(
        db=db,
        tenant_id=tenant_id,
        query=data.content,
        document_ids=data.document_ids,
        top_k=5
    )

    # 3. Prompt Injection Guard on retrieved document context
    safe_chunks = prompt_guard.sanitize_context(relevant_chunks)

    # Prepare citations payload
    citations = [
        SourceCitation(
            document_id=c["document_id"],
            document_name=c["document_name"],
            page_number=c["page_number"],
            content_snippet=c["content"][:200] + "...",
            similarity=c["similarity"]
        ).model_dump()
        for c in safe_chunks
    ]

    async def event_generator():
        # Start event with citations metadata
        yield f"data: {json.dumps({'type': 'start', 'sources': citations})}\n\n"

        full_answer = ""
        async for token in generator.stream_response(data.content, safe_chunks):
            full_answer += token
            yield f"data: {json.dumps({'type': 'token', 'content': token})}\n\n"

        yield f"data: {json.dumps({'type': 'end', 'sources': citations, 'token_count': len(full_answer.split())})}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")
