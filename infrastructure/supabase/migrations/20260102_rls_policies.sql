-- Enable Row Level Security (RLS) on core tables
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE query_sessions ENABLE ROW LEVEL SECURITY;

-- Tenant Isolation Policy for Documents
DROP POLICY IF EXISTS "tenant_isolation_documents" ON documents;
CREATE POLICY "tenant_isolation_documents" ON documents
    FOR ALL USING (
        tenant_id = (
            SELECT tenant_id FROM user_profiles
            WHERE id = auth.uid()
        )
    );

-- Tenant Isolation Policy for Document Chunks (Vector Search Boundary)
DROP POLICY IF EXISTS "tenant_isolation_chunks" ON document_chunks;
CREATE POLICY "tenant_isolation_chunks" ON document_chunks
    FOR ALL USING (
        tenant_id = (
            SELECT tenant_id FROM user_profiles
            WHERE id = auth.uid()
        )
    );

-- Tenant Isolation Policy for Query Sessions
DROP POLICY IF EXISTS "tenant_isolation_sessions" ON query_sessions;
CREATE POLICY "tenant_isolation_sessions" ON query_sessions
    FOR ALL USING (
        tenant_id = (
            SELECT tenant_id FROM user_profiles
            WHERE id = auth.uid()
        )
    );
