-- ============================================================
-- Migration 015: Thêm toa_do_nguon cho ho_dan
-- Phân biệt độ chính xác GPS:
--   NULL       → chưa có GPS (dùng vị trí ước tính trên bản đồ)
--   'GEOCODE'  → tự động geocode qua Nominatim/OpenStreetMap
--   'GPS'      → GPS thực tế admin chụp tại hiện trường
--   'MANUAL'   → tọa độ nhập tay
-- ============================================================

ALTER TABLE ho_dan
  ADD COLUMN IF NOT EXISTS toa_do_nguon TEXT;

-- Index tăng tốc query filter hộ đã/chưa có GPS
CREATE INDEX IF NOT EXISTS idx_ho_dan_toa_do
  ON ho_dan(toa_do_lat, toa_do_lng)
  WHERE toa_do_lat IS NOT NULL;

-- Đánh dấu hộ đã có tọa độ trước đó là MANUAL
UPDATE ho_dan
  SET toa_do_nguon = 'MANUAL'
  WHERE toa_do_lat IS NOT NULL
    AND toa_do_lng IS NOT NULL
    AND toa_do_nguon IS NULL;
