-- ──────────────────────────────────────────────────────────────────
-- Migration 038: Phản ánh AI Smart — Thêm cột phân tích AI + GPS
-- ──────────────────────────────────────────────────────────────────

-- 1. Thêm loại mới CHIEU_SANG vào enum loai_phan_anh
ALTER TYPE loai_phan_anh ADD VALUE IF NOT EXISTS 'CHIEU_SANG';

-- 2. Thêm các cột AI cho bảng phan_anh
ALTER TABLE phan_anh
  ADD COLUMN IF NOT EXISTS ai_da_phan_tich   BOOLEAN        DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS ai_muc_do         TEXT,
  ADD COLUMN IF NOT EXISTS ai_tieu_de        TEXT,
  ADD COLUMN IF NOT EXISTS ai_tom_tat        TEXT,
  ADD COLUMN IF NOT EXISTS ai_tinh_nang      JSONB          DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS ai_de_xuat        TEXT,
  ADD COLUMN IF NOT EXISTS ai_do_tin_cay     SMALLINT       CHECK (ai_do_tin_cay BETWEEN 0 AND 100);

-- 3. Index nhanh cho trường hợp lọc đã phân tích AI
CREATE INDEX IF NOT EXISTS idx_phan_anh_ai_da_phan_tich
  ON phan_anh(ai_da_phan_tich)
  WHERE ai_da_phan_tich = TRUE;

-- 4. Index địa lý (PostGIS chưa có → dùng btree trên toa_do_lat)
CREATE INDEX IF NOT EXISTS idx_phan_anh_toa_do
  ON phan_anh(toa_do_lat, toa_do_lng)
  WHERE toa_do_lat IS NOT NULL;

-- 5. Comment cho các cột mới
COMMENT ON COLUMN phan_anh.ai_da_phan_tich  IS 'True nếu đã được AI phân tích';
COMMENT ON COLUMN phan_anh.ai_muc_do        IS 'Mức độ ưu tiên do AI gợi ý';
COMMENT ON COLUMN phan_anh.ai_tieu_de       IS 'Tiêu đề do AI gợi ý';
COMMENT ON COLUMN phan_anh.ai_tom_tat       IS 'Tóm tắt ngắn do AI tạo ra';
COMMENT ON COLUMN phan_anh.ai_tinh_nang     IS 'Danh sách vấn đề cụ thể AI phát hiện [string[]]';
COMMENT ON COLUMN phan_anh.ai_de_xuat       IS 'Đề xuất hành động xử lý từ AI';
COMMENT ON COLUMN phan_anh.ai_do_tin_cay    IS 'Độ tin cậy phân tích AI (0-100)';
