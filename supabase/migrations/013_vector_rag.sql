-- =============================================================
-- KP25 — Migration 013: AI Vector RAG
-- pgvector + chunks + semantic search function
-- =============================================================

-- ── Enable pgvector extension ─────────────────────────────────
CREATE EXTENSION IF NOT EXISTS vector;

-- ── Bảng chunks văn bản (đơn vị nhúng) ───────────────────────
CREATE TABLE IF NOT EXISTS tai_lieu_chunks (
  id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  tai_lieu_id UUID    NOT NULL REFERENCES tai_lieu(id) ON DELETE CASCADE,
  noi_dung    TEXT    NOT NULL,
  vi_tri      INT     NOT NULL DEFAULT 0,   -- Thứ tự chunk trong tài liệu
  embedding   vector(768),                  -- Gemini text-embedding-004
  da_nhung    BOOLEAN DEFAULT FALSE,        -- Đã nhúng xong
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── RLS ────────────────────────────────────────────────────────
ALTER TABLE tai_lieu_chunks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "chunks_select"      ON tai_lieu_chunks;
DROP POLICY IF EXISTS "chunks_service_all" ON tai_lieu_chunks;

CREATE POLICY "chunks_select" ON tai_lieu_chunks
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "chunks_service_all" ON tai_lieu_chunks
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── HNSW Index (cosine similarity, hoạt động tốt trên dataset nhỏ) ──
CREATE INDEX IF NOT EXISTS idx_chunks_embedding
  ON tai_lieu_chunks USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

CREATE INDEX IF NOT EXISTS idx_chunks_tai_lieu_id ON tai_lieu_chunks(tai_lieu_id);
CREATE INDEX IF NOT EXISTS idx_chunks_da_nhung    ON tai_lieu_chunks(da_nhung);

-- ── Bảng lịch sử nhúng ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rag_lich_su (
  id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  tai_lieu_id UUID    REFERENCES tai_lieu(id) ON DELETE CASCADE,
  so_chunk    INT     DEFAULT 0,
  trang_thai  TEXT    DEFAULT 'THANH_CONG', -- THANH_CONG | LOI
  loi         TEXT,
  thoi_gian   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE rag_lich_su ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "rag_ls_select" ON rag_lich_su;
DROP POLICY IF EXISTS "rag_ls_svc"    ON rag_lich_su;

CREATE POLICY "rag_ls_select" ON rag_lich_su FOR SELECT TO authenticated USING (true);
CREATE POLICY "rag_ls_svc"    ON rag_lich_su FOR ALL    TO service_role  USING (true) WITH CHECK (true);

-- ── Function tìm kiếm semantic ────────────────────────────────
CREATE OR REPLACE FUNCTION tim_kiem_semantic(
  query_embedding vector(768),
  gioi_han        INT   DEFAULT 5,
  nguong          FLOAT DEFAULT 0.4
)
RETURNS TABLE (
  chunk_id       UUID,
  tai_lieu_id    UUID,
  tieu_de        TEXT,
  loai           TEXT,
  so_hieu        TEXT,
  noi_dung       TEXT,
  vi_tri         INT,
  do_tuong_dong  FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id                                              AS chunk_id,
    c.tai_lieu_id,
    t.tieu_de,
    t.loai,
    t.so_hieu,
    c.noi_dung,
    c.vi_tri,
    (1 - (c.embedding <=> query_embedding))::FLOAT    AS do_tuong_dong
  FROM tai_lieu_chunks c
  JOIN tai_lieu t ON t.id = c.tai_lieu_id
  WHERE
    c.da_nhung = TRUE
    AND t.deleted_at IS NULL
    AND (1 - (c.embedding <=> query_embedding)) >= nguong
  ORDER BY c.embedding <=> query_embedding
  LIMIT gioi_han;
END;
$$;
