-- Enable required Postgres extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ─────────────────────────────────────────────────────────────────────
-- TENANTS
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tenants (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            TEXT NOT NULL,
    slug            TEXT UNIQUE NOT NULL,
    plan            TEXT NOT NULL DEFAULT 'free',  -- free | pro | enterprise
    settings        JSONB NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────
-- USER PROFILES (extends auth.users)
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_profiles (
    id              UUID PRIMARY KEY,
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    role            TEXT NOT NULL DEFAULT 'member', -- admin | member | viewer
    display_name    TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_tenant ON user_profiles(tenant_id);

-- ─────────────────────────────────────────────────────────────────────
-- DOCUMENTS
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS documents (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    uploaded_by     UUID NOT NULL,
    name            TEXT NOT NULL,
    original_name   TEXT NOT NULL,
    file_type       TEXT NOT NULL,     -- pdf | docx | txt
    file_size       BIGINT NOT NULL,
    storage_path    TEXT NOT NULL,     -- Supabase Storage path (encrypted)
    status          TEXT NOT NULL DEFAULT 'pending',
                    -- pending | extracting | masking | chunking | embedding | ready | failed
    page_count      INTEGER,
    chunk_count     INTEGER,
    pii_entities    JSONB NOT NULL DEFAULT '[]',  -- detected entity types
    metadata        JSONB NOT NULL DEFAULT '{}',
    error_message   TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_documents_tenant ON documents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_documents_created ON documents(tenant_id, created_at DESC);

-- ─────────────────────────────────────────────────────────────────────
-- DOCUMENT CHUNKS (gemini-embedding-001 dense vector embeddings: 3072 dimensions)
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS document_chunks (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    document_id     UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    chunk_index     INTEGER NOT NULL,
    content         TEXT NOT NULL,    -- PII-masked text
    content_hash    TEXT NOT NULL,    -- SHA-256 of original content
    embedding       VECTOR(3072),     -- gemini-embedding-001 dimension
    page_number     INTEGER,
    token_count     INTEGER NOT NULL,
    metadata        JSONB NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chunks_tenant_doc ON document_chunks(tenant_id, document_id);

-- ─────────────────────────────────────────────────────────────────────
-- QUERY SESSIONS
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS query_sessions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL,
    title           TEXT,
    document_ids    UUID[],           -- scoped documents (NULL = all)
    messages        JSONB NOT NULL DEFAULT '[]',
    total_tokens    INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_tenant_user ON query_sessions(tenant_id, user_id);

-- ─────────────────────────────────────────────────────────────────────
-- AUDIT LOGS
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id),
    user_id         UUID,
    action          TEXT NOT NULL,    -- document.upload | query.execute | auth.login
    resource_type   TEXT,
    resource_id     UUID,
    metadata        JSONB NOT NULL DEFAULT '{}',
    ip_address      INET,
    user_agent      TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_tenant_created ON audit_logs(tenant_id, created_at DESC);
