-- HNSW Vector index on 3072-dimensional gemini-embedding-001 embeddings using cosine distance
CREATE INDEX IF NOT EXISTS idx_chunks_embedding ON document_chunks
    USING hnsw (embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 64);

-- Tenant-Scoped Vector Similarity Search Function
CREATE OR REPLACE FUNCTION match_chunks(
    query_embedding  VECTOR(3072),
    tenant_id_input  UUID,
    document_ids     UUID[] DEFAULT NULL,
    match_threshold  FLOAT DEFAULT 0.5,
    match_count      INT DEFAULT 5
)
RETURNS TABLE (
    id          UUID,
    document_id UUID,
    content     TEXT,
    similarity  FLOAT,
    page_number INTEGER,
    metadata    JSONB
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        dc.id,
        dc.document_id,
        dc.content,
        1 - (dc.embedding <=> query_embedding) AS similarity,
        dc.page_number,
        dc.metadata
    FROM document_chunks dc
    WHERE
        dc.tenant_id = tenant_id_input
        AND (document_ids IS NULL OR dc.document_id = ANY(document_ids))
        AND 1 - (dc.embedding <=> query_embedding) >= match_threshold
    ORDER BY dc.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;
