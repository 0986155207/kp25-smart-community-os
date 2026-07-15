-- ============================================================
-- Migration 048: RANH GIỚI KHU PHỐ (vẽ trên bản đồ, lưu vào DB)
--
--   Trước đây ranh giới bị HARDCODE trong mã nguồn (KP25_POLYGON)
--   → khu phố mới không vẽ được ranh giới riêng.
--   Nay lưu vào bảng don_vi để mỗi khu phố tự vẽ qua giao diện admin.
--
--   ranh_gioi: mảng JSON các đỉnh [[lat,lng], [lat,lng], ...]
--   tam_lat/tam_lng: tâm bản đồ (bỏ trống → app tự tính từ ranh giới)
--   zoom: mức phóng mặc định khi mở bản đồ
--
-- CHẠY THỦ CÔNG trong Supabase SQL Editor.
-- ============================================================

ALTER TABLE public.don_vi
  ADD COLUMN IF NOT EXISTS ranh_gioi JSONB,
  ADD COLUMN IF NOT EXISTS tam_lat   NUMERIC(10, 8),
  ADD COLUMN IF NOT EXISTS tam_lng   NUMERIC(11, 8),
  ADD COLUMN IF NOT EXISTS zoom      SMALLINT NOT NULL DEFAULT 16;

COMMENT ON COLUMN public.don_vi.ranh_gioi IS 'Ranh giới khu phố: mảng đỉnh [[lat,lng], ...]. NULL = chưa vẽ.';
COMMENT ON COLUMN public.don_vi.tam_lat   IS 'Tâm bản đồ (tùy chọn). NULL = tự tính từ ranh_gioi.';
COMMENT ON COLUMN public.don_vi.zoom      IS 'Mức phóng mặc định của bản đồ khu phố.';

-- ─────────────────────────────────────────────────────────────
-- Seed ranh giới KP25 = đúng polygon đang hardcode trong code
-- → sau khi bỏ hardcode, bản đồ KP25 hiển thị y như cũ.
-- ─────────────────────────────────────────────────────────────
UPDATE public.don_vi
SET ranh_gioi = '[
  [10.79869, 106.81107],
  [10.79870, 106.81261],
  [10.80231, 106.81261],
  [10.80082, 106.81084]
]'::jsonb
WHERE id = '00000000-0000-4000-8000-000000000025'
  AND ranh_gioi IS NULL;

-- ─────────────────────────────────────────────────────────────
-- KIỂM TRA
-- ─────────────────────────────────────────────────────────────
-- SELECT ma, ten, jsonb_array_length(ranh_gioi) AS so_dinh, zoom
-- FROM public.don_vi;
-- → KP25 phải có so_dinh = 4
