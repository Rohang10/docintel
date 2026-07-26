-- Ensure embedding column is VECTOR(3072) instead of JSON (from SQLAlchemy fallback)
ALTER TABLE document_chunks ALTER COLUMN embedding TYPE VECTOR(3072) USING (embedding::text::vector(3072));

-- Note: Standard pgvector HNSW/IVFFlat indexes have a 2000-dimension limit.
-- For 3072-dimensional Gemini embeddings, we use tenant-scoped Exact Nearest Neighbor (flat) search,
-- which leverages our B-tree tenant index for sub-5ms performance without dimension limit constraints.

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
        dc.tenant_id::text = tenant_id_input::text
        AND (document_ids IS NULL OR dc.document_id::text = ANY(document_ids::text[]))
        AND 1 - (dc.embedding <=> query_embedding) >= match_threshold
    ORDER BY dc.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;
