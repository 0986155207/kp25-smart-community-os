-- ============================================================
-- Migration 044: NỀN TẢNG ĐA KHU PHỐ (MULTI-TENANT)
-- Mục tiêu: nhân rộng mô hình KP25 ra toàn bộ khu phố
--           thuộc Phường Long Trường, trên CÙNG MỘT hệ thống.
--
-- Nguyên tắc:
--   • Thêm chiều "đơn vị" (khu phố) vào toàn bộ dữ liệu.
--   • KP25 là đơn vị mặc định (UUID cố định) → dữ liệu cũ
--     và mọi bản ghi mới (chưa chỉ định) đều thuộc KP25.
--     ⇒ App hiện tại CHẠY KHÔNG ĐỔI cho tới khi mở rộng thật.
--   • RLS phân quyền theo khu phố: admin phường thấy tất cả,
--     cán bộ thấy đúng khu phố của mình. Cán bộ CHƯA gán khu phố
--     vẫn thấy tất cả (an toàn cho giai đoạn chuyển tiếp).
--
-- CHẠY THỦ CÔNG trong Supabase SQL Editor.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────────────────────
-- 1. BẢNG ĐƠN VỊ (KHU PHỐ)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.don_vi (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ma            TEXT UNIQUE NOT NULL,                 -- 'KP25'
  ten           TEXT NOT NULL,                        -- 'Khu phố 25'
  ten_day_du    TEXT,                                 -- 'Khu phố 25, Phường Long Trường, TP.HCM'
  loai          TEXT NOT NULL DEFAULT 'KHU_PHO',      -- KHU_PHO | TO_DAN_PHO | PHUONG
  phuong        TEXT NOT NULL DEFAULT 'Phường Long Trường',
  tinh_thanh    TEXT NOT NULL DEFAULT 'TP. Hồ Chí Minh',
  slug          TEXT UNIQUE,                          -- 'kp25' → dùng cho route/subdomain portal
  dia_chi       TEXT,                                 -- địa chỉ trụ sở / nhà văn hóa
  truong_kp_ten TEXT,
  truong_kp_sdt TEXT,
  bi_thu_ten    TEXT,
  bi_thu_sdt    TEXT,
  mau_chu_dao   TEXT DEFAULT '#8B1A1A',               -- màu thương hiệu của portal khu phố
  logo_url      TEXT,
  thu_tu        INTEGER NOT NULL DEFAULT 0,           -- sắp xếp hiển thị
  is_active     BOOLEAN NOT NULL DEFAULT true,
  ghi_chu       TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at    TIMESTAMPTZ,
  created_by    UUID,
  updated_by    UUID
);

CREATE INDEX IF NOT EXISTS idx_don_vi_slug      ON public.don_vi(slug);
CREATE INDEX IF NOT EXISTS idx_don_vi_active    ON public.don_vi(is_active);
CREATE INDEX IF NOT EXISTS idx_don_vi_deleted   ON public.don_vi(deleted_at);

-- Trigger updated_at (hàm update_updated_at đã có từ migration 001)
DROP TRIGGER IF EXISTS trg_don_vi_updated_at ON public.don_vi;
CREATE TRIGGER trg_don_vi_updated_at
  BEFORE UPDATE ON public.don_vi
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ─────────────────────────────────────────────────────────────
-- 2. SEED ĐƠN VỊ KP25 (UUID CỐ ĐỊNH — app tham chiếu làm mặc định)
--    KP25_DON_VI_ID = '00000000-0000-4000-8000-000000000025'
-- ─────────────────────────────────────────────────────────────
INSERT INTO public.don_vi
  (id, ma, ten, ten_day_du, slug, phuong, truong_kp_ten, truong_kp_sdt, bi_thu_ten, mau_chu_dao, thu_tu)
VALUES
  ('00000000-0000-4000-8000-000000000025',
   'KP25',
   'Khu phố 25',
   'Khu phố 25, Phường Long Trường, TP. Hồ Chí Minh',
   'kp25',
   'Phường Long Trường',
   'Nguyễn Thị Hồng Thủy',
   '0773735317',
   'Phan Tấn Tài',
   '#8B1A1A',
   25)
ON CONFLICT (ma) DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- 3. GẮN KHÓA don_vi_id VÀO CÁC BẢNG DỮ LIỆU
--    DEFAULT = KP25 ⇒ dữ liệu cũ + bản ghi mới (chưa chỉ định) đều thuộc KP25.
-- ─────────────────────────────────────────────────────────────

-- 3a. profiles: cho phép NULL (admin phường / người dùng chưa gán khu phố)
ALTER TABLE IF EXISTS public.profiles
  ADD COLUMN IF NOT EXISTS don_vi_id UUID REFERENCES public.don_vi(id);

-- 3b. Bảng dữ liệu lõi: NOT NULL DEFAULT KP25
DO $$
DECLARE
  t TEXT;
  bang_loi TEXT[] := ARRAY[
    'ho_dan', 'nhan_khau', 'phan_anh', 'thong_bao', 'su_kien', 'can_bo'
  ];
BEGIN
  FOREACH t IN ARRAY bang_loi LOOP
    IF to_regclass('public.' || t) IS NOT NULL THEN
      EXECUTE format(
        'ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS don_vi_id UUID NOT NULL DEFAULT %L REFERENCES public.don_vi(id)',
        t, '00000000-0000-4000-8000-000000000025'
      );
      EXECUTE format(
        'CREATE INDEX IF NOT EXISTS %I ON public.%I(don_vi_id)',
        'idx_' || t || '_don_vi', t
      );
    END IF;
  END LOOP;
END $$;

-- 3c. Bảng phụ trợ (nếu tồn tại): NOT NULL DEFAULT KP25
DO $$
DECLARE
  t TEXT;
  bang_phu TEXT[] := ARRAY[
    'dang_ky_tam_tru', 'dang_ky_tam_vang', 'tai_lieu',
    'su_kien_dang_ky', 'chien_dich_tu_khai', 'ho_moi_dang_ky',
    'workflow_assignments'
  ];
BEGIN
  FOREACH t IN ARRAY bang_phu LOOP
    IF to_regclass('public.' || t) IS NOT NULL THEN
      EXECUTE format(
        'ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS don_vi_id UUID NOT NULL DEFAULT %L REFERENCES public.don_vi(id)',
        t, '00000000-0000-4000-8000-000000000025'
      );
      EXECUTE format(
        'CREATE INDEX IF NOT EXISTS %I ON public.%I(don_vi_id)',
        'idx_' || t || '_don_vi', t
      );
    END IF;
  END LOOP;
END $$;

-- ─────────────────────────────────────────────────────────────
-- 4. RLS HELPER FUNCTIONS (SECURITY DEFINER — tránh đệ quy)
-- ─────────────────────────────────────────────────────────────

-- 4.0. Đảm bảo các helper cũ tồn tại (phòng khi migration 022 chưa chạy)
CREATE OR REPLACE FUNCTION public.la_can_bo()
RETURNS BOOLEAN
LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND deleted_at IS NULL
    AND vai_tro IN (
      'SUPER_ADMIN','ADMIN_PHUONG','BI_THU','TRUONG_KHU_PHO',
      'CONG_AN','CAN_BO','DOAN_THE'
    )
  )
$$;

CREATE OR REPLACE FUNCTION public.la_quan_ly()
RETURNS BOOLEAN
LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND deleted_at IS NULL
    AND vai_tro IN ('SUPER_ADMIN','ADMIN_PHUONG','BI_THU','TRUONG_KHU_PHO')
  )
$$;

GRANT EXECUTE ON FUNCTION public.la_can_bo()  TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.la_quan_ly() TO anon, authenticated;

-- Đơn vị (khu phố) của user hiện tại
CREATE OR REPLACE FUNCTION public.don_vi_cua_toi()
RETURNS UUID
LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public
AS $$
  SELECT don_vi_id FROM public.profiles
  WHERE id = auth.uid() AND deleted_at IS NULL
  LIMIT 1
$$;

-- Admin cấp phường (xem được mọi khu phố)
CREATE OR REPLACE FUNCTION public.la_admin_phuong()
RETURNS BOOLEAN
LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND deleted_at IS NULL
    AND vai_tro IN ('SUPER_ADMIN', 'ADMIN_PHUONG')
  )
$$;

-- Có quyền truy cập 1 đơn vị?
--   • Admin phường: luôn TRUE
--   • Cán bộ chưa gán khu phố (don_vi_cua_toi IS NULL): TRUE (chuyển tiếp)
--   • Còn lại: chỉ đúng khu phố của mình
CREATE OR REPLACE FUNCTION public.co_quyen_don_vi(p_don_vi UUID)
RETURNS BOOLEAN
LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public
AS $$
  SELECT
    public.la_admin_phuong()
    OR public.don_vi_cua_toi() IS NULL
    OR p_don_vi IS NOT DISTINCT FROM public.don_vi_cua_toi()
$$;

GRANT EXECUTE ON FUNCTION public.don_vi_cua_toi()        TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.la_admin_phuong()       TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.co_quyen_don_vi(UUID)   TO anon, authenticated;

-- ─────────────────────────────────────────────────────────────
-- 5. RLS BẢNG don_vi
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.don_vi ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "don_vi_read"  ON public.don_vi;
CREATE POLICY "don_vi_read" ON public.don_vi
  FOR SELECT USING (deleted_at IS NULL);

DROP POLICY IF EXISTS "don_vi_write" ON public.don_vi;
CREATE POLICY "don_vi_write" ON public.don_vi
  FOR ALL
  USING (public.la_admin_phuong() OR public.la_quan_ly())
  WITH CHECK (public.la_admin_phuong() OR public.la_quan_ly());

-- ─────────────────────────────────────────────────────────────
-- 6. CẬP NHẬT RLS DỮ LIỆU LÕI — THÊM PHẠM VI KHU PHỐ
--    (Giữ nguyên điều kiện la_can_bo() cũ, BỔ SUNG co_quyen_don_vi)
-- ─────────────────────────────────────────────────────────────

-- ho_dan
DROP POLICY IF EXISTS "ho_dan_select" ON public.ho_dan;
CREATE POLICY "ho_dan_select" ON public.ho_dan
  FOR SELECT USING (deleted_at IS NULL AND public.la_can_bo() AND public.co_quyen_don_vi(don_vi_id));

DROP POLICY IF EXISTS "ho_dan_insert" ON public.ho_dan;
CREATE POLICY "ho_dan_insert" ON public.ho_dan
  FOR INSERT WITH CHECK (public.la_can_bo() AND public.co_quyen_don_vi(don_vi_id));

DROP POLICY IF EXISTS "ho_dan_update" ON public.ho_dan;
CREATE POLICY "ho_dan_update" ON public.ho_dan
  FOR UPDATE USING (public.la_can_bo() AND public.co_quyen_don_vi(don_vi_id));

-- nhan_khau
DROP POLICY IF EXISTS "nhan_khau_select" ON public.nhan_khau;
CREATE POLICY "nhan_khau_select" ON public.nhan_khau
  FOR SELECT USING (deleted_at IS NULL AND public.la_can_bo() AND public.co_quyen_don_vi(don_vi_id));

DROP POLICY IF EXISTS "nhan_khau_insert" ON public.nhan_khau;
CREATE POLICY "nhan_khau_insert" ON public.nhan_khau
  FOR INSERT WITH CHECK (public.la_can_bo() AND public.co_quyen_don_vi(don_vi_id));

DROP POLICY IF EXISTS "nhan_khau_update" ON public.nhan_khau;
CREATE POLICY "nhan_khau_update" ON public.nhan_khau
  FOR UPDATE USING (public.la_can_bo() AND public.co_quyen_don_vi(don_vi_id));

-- phan_anh: người gửi xem của mình; cán bộ xem theo khu phố; anon đọc (portal công khai)
DROP POLICY IF EXISTS "phan_anh_own_read" ON public.phan_anh;  -- policy đệ quy cũ (migration 001)
DROP POLICY IF EXISTS "phan_anh_read_v2"  ON public.phan_anh;
CREATE POLICY "phan_anh_read_v2" ON public.phan_anh
  FOR SELECT USING (
    deleted_at IS NULL
    AND (
      nguoi_gui_id = auth.uid()
      OR auth.uid() IS NULL
      OR (public.la_can_bo() AND public.co_quyen_don_vi(don_vi_id))
    )
  );

-- ─────────────────────────────────────────────────────────────
-- 7. (TÙY CHỌN) Đưa don_vi vào realtime publication nếu có
-- ─────────────────────────────────────────────────────────────
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.don_vi;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────
-- KIỂM TRA SAU KHI CHẠY
-- ─────────────────────────────────────────────────────────────
-- SELECT id, ma, ten FROM public.don_vi;                 -- phải có KP25
-- SELECT don_vi_id, COUNT(*) FROM public.ho_dan GROUP BY 1;  -- tất cả = KP25
-- SELECT public.don_vi_cua_toi();                        -- đơn vị của user hiện tại
-- SELECT public.co_quyen_don_vi('00000000-0000-4000-8000-000000000025');
