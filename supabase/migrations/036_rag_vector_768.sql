-- =============================================================
-- KP25 — Migration 036: RAG vector 768 chiều (gemini-embedding-001 với outputDimensionality=768)
-- Lý do: gemini-embedding-001 hỗ trợ outputDimensionality để nén 3072 → 768
--        HNSW index giới hạn tối đa 2000 dims → dùng 768 an toàn
-- =============================================================

-- ── 1. Xóa HNSW index trước (bắt buộc trước khi ALTER TYPE) ──
DROP INDEX IF EXISTS idx_chunks_embedding;

-- ── 2. Đổi kiểu cột embedding về 768 chiều ───────────────────
-- (nếu đang là vector(3072) do migration trước chạy lỗi giữa chừng)
ALTER TABLE tai_lieu_chunks
  ALTER COLUMN embedding TYPE vector(768);

-- ── 3. Tạo lại HNSW index với 768 dims ───────────────────────
CREATE INDEX IF NOT EXISTS idx_chunks_embedding
  ON tai_lieu_chunks USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- ── 4. Cập nhật function tìm kiếm semantic dùng vector(768) ──
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
