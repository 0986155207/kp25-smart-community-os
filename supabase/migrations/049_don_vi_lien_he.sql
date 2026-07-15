-- ============================================================
-- Migration 049: THÔNG TIN LIÊN HỆ THEO KHU PHỐ
--
--   Các trang portal (Liên hệ, Đăng ký, Dân cư, Hướng dẫn, Footer)
--   đang HARDCODE tên + SĐT cán bộ của Khu phố 25:
--     · Trưởng KP:       Nguyễn Thị Hồng Thủy — 0773735317
--     · Bí thư chi bộ:   Phan Tấn Tài        — 0986155207
--     · Công an khu vực: Trần Hữu Hùng       — 0988897709
--     · An ninh khu phố: Mai Ngọc Nhân       — 0907235682
--     · Email:           taip2704@gmail.com
--   → Khu phố khác dùng sẽ hiện SAI người, SAI số điện thoại.
--
--   Nay lưu vào bảng don_vi để mỗi khu phố có thông tin riêng,
--   quản lý qua giao diện "Quản lý Khu phố".
--
-- CHẠY THỦ CÔNG trong Supabase SQL Editor.
-- ============================================================

ALTER TABLE public.don_vi
  ADD COLUMN IF NOT EXISTS cong_an_ten   TEXT,
  ADD COLUMN IF NOT EXISTS cong_an_sdt   TEXT,
  ADD COLUMN IF NOT EXISTS an_ninh_ten   TEXT,
  ADD COLUMN IF NOT EXISTS an_ninh_sdt   TEXT,
  ADD COLUMN IF NOT EXISTS email         TEXT,
  ADD COLUMN IF NOT EXISTS dia_chi_ubnd  TEXT,
  ADD COLUMN IF NOT EXISTS hotline_ubnd  TEXT;

COMMENT ON COLUMN public.don_vi.cong_an_ten  IS 'Công an khu vực phụ trách khu phố';
COMMENT ON COLUMN public.don_vi.cong_an_sdt  IS 'SĐT công an khu vực';
COMMENT ON COLUMN public.don_vi.an_ninh_ten  IS 'Phụ trách an ninh khu phố (tuần tra, bảo vệ)';
COMMENT ON COLUMN public.don_vi.an_ninh_sdt  IS 'SĐT an ninh khu phố';
COMMENT ON COLUMN public.don_vi.email        IS 'Email liên hệ của khu phố';
COMMENT ON COLUMN public.don_vi.dia_chi_ubnd IS 'Địa chỉ UBND phường (dùng chung trong phường)';
COMMENT ON COLUMN public.don_vi.hotline_ubnd IS 'Tổng đài UBND phường';

-- ─────────────────────────────────────────────────────────────
-- Seed KP25 = đúng thông tin đang hardcode trong code
-- → sau khi bỏ hardcode, portal hiển thị y như cũ.
-- ─────────────────────────────────────────────────────────────
UPDATE public.don_vi
SET
  cong_an_ten   = COALESCE(cong_an_ten,  'Trần Hữu Hùng'),
  cong_an_sdt   = COALESCE(cong_an_sdt,  '0988897709'),
  an_ninh_ten   = COALESCE(an_ninh_ten,  'Mai Ngọc Nhân'),
  an_ninh_sdt   = COALESCE(an_ninh_sdt,  '0907235682'),
  email         = COALESCE(email,        'taip2704@gmail.com'),
  dia_chi_ubnd  = COALESCE(dia_chi_ubnd, '1341 Nguyễn Duy Trinh, Phường Long Trường, TP.HCM'),
  hotline_ubnd  = COALESCE(hotline_ubnd, '02837461111'),
  truong_kp_ten = COALESCE(truong_kp_ten, 'Nguyễn Thị Hồng Thủy'),
  truong_kp_sdt = COALESCE(truong_kp_sdt, '0773735317'),
  bi_thu_ten    = COALESCE(bi_thu_ten,   'Phan Tấn Tài'),
  bi_thu_sdt    = COALESCE(bi_thu_sdt,   '0986155207')
WHERE id = '00000000-0000-4000-8000-000000000025';

-- ─────────────────────────────────────────────────────────────
-- KIỂM TRA
-- ─────────────────────────────────────────────────────────────
-- SELECT ma, truong_kp_ten, truong_kp_sdt, bi_thu_ten, cong_an_ten, cong_an_sdt, email
-- FROM public.don_vi;
