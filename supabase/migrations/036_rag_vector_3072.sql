-- =============================================================
-- KP25 — Migration 036: Cập nhật RAG vector từ 768 → 3072 chiều
-- Lý do: gemini-embedding-001 (model mới) trả về 3072 dims
--        thay vì text-embedding-004 (768 dims, không còn trên API này)
-- =============================================================

-- ── 1. Xóa HNSW index trước (bắt buộc trước khi ALTER TYPE) ──
DROP INDEX IF EXISTS idx_chunks_embedding;

-- ── 2. Đổi kiểu cột embedding: 768 → 3072 ────────────────────
-- Bảng đang trống (chưa embed thành công) nên không mất dữ liệu
ALTER TABLE tai_lieu_chunks
  ALTER COLUMN embedding TYPE vector(3072);

-- ── 3. Tạo lại HNSW index với dimension mới ──────────────────
CREATE INDEX IF NOT EXISTS idx_chunks_embedding
  ON tai_lieu_chunks USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- ── 4. Cập nhật function tìm kiếm semantic ───────────────────
CREATE OR REPLACE FUNCTION tim_kiem_semantic(
  query_embedding vector(3072),
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
