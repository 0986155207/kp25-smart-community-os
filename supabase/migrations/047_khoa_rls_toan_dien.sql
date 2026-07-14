-- ============================================================
-- Migration 047: KHÓA RLS TOÀN DIỆN
--   Mục tiêu:
--     1) Vá rò rỉ PII: ho_dan/nhan_khau KHÔNG còn đọc được bằng anon.
--     2) Cách ly đa khu phố: cán bộ chỉ thấy dữ liệu khu phố mình.
--     3) Xoá các policy "USING (true)" quá lỏng (Security Advisor).
--
--   Cơ chế:
--     • Đồng bộ profiles.vai_tro + don_vi_id từ can_bo → RLS nhận diện cán bộ.
--     • Bảng nội bộ: chỉ cán bộ (la_can_bo) + service_role.
--     • Bảng công khai (thông báo/sự kiện/phản ánh/đăng ký): giữ đọc/nộp công khai.
--     • ho_dan/nhan_khau: dùng policy 044 (la_can_bo + co_quyen_don_vi).
--
--   PHỤ THUỘC: migration 044 (la_can_bo, la_quan_ly, co_quyen_don_vi, don_vi_id).
--   CHẠY THỦ CÔNG trong Supabase SQL Editor SAU KHI đã deploy web + admin mới.
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- PHẦN 0: ĐỒNG BỘ profiles ← can_bo (một lần cho cán bộ hiện có)
--   Để cán bộ đang đăng nhập không mất quyền ngay khi siết RLS.
-- ─────────────────────────────────────────────────────────────
-- UPSERT: tạo profiles nếu cán bộ chưa có dòng (tài khoản tạo trước trigger),
-- cập nhật vai_tro + don_vi_id nếu đã có.
INSERT INTO public.profiles (id, ho_ten, vai_tro, don_vi_id)
SELECT
  u.id,
  cb.ho_ten,
  CASE cb.vai_tro
    WHEN 'BI_THU'         THEN 'BI_THU'::vai_tro
    WHEN 'TRUONG_KHU_PHO' THEN 'TRUONG_KHU_PHO'::vai_tro
    WHEN 'CONG_AN'        THEN 'CONG_AN'::vai_tro
    ELSE 'CAN_BO'::vai_tro
  END,
  COALESCE(cb.don_vi_id, '00000000-0000-4000-8000-000000000025')
FROM auth.users u
JOIN public.can_bo cb ON lower(cb.email) = lower(u.email)
WHERE cb.hoat_dong = true
ON CONFLICT (id) DO UPDATE
  SET vai_tro = EXCLUDED.vai_tro,
      don_vi_id = EXCLUDED.don_vi_id;

-- ─────────────────────────────────────────────────────────────
-- PHẦN 1: BẢNG NỘI BỘ → chỉ cán bộ + service_role
--   Xoá SẠCH policy cũ của từng bảng, tạo lại policy chuẩn.
-- ─────────────────────────────────────────────────────────────
DO $$
DECLARE
  t   TEXT;
  r   RECORD;
  tbls TEXT[] := ARRAY[
    'bhyt','ho_ngheo','nguoi_cao_tuoi','can_bo',
    'tai_lieu','tai_lieu_chunks','rag_lich_su',
    'push_subscriptions','push_lich_su',
    'workflow_assignments','workflow_lich_su','workflow_quy_tac',
    'zalo_subscribers','zalo_broadcasts','zalo_messages','zalo_webhook_events','zalo_oa_config',
    'su_kien_dan_cu','yeu_cau_cap_nhat_dan_cu','dang_ky_ho_moi'
  ];
BEGIN
  FOREACH t IN ARRAY tbls LOOP
    IF to_regclass('public.'||t) IS NOT NULL THEN
      -- Xoá mọi policy hiện có trên bảng
      FOR r IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename=t LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, t);
      END LOOP;
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
      -- Cán bộ: toàn quyền (RLS nhận diện qua la_can_bo)
      EXECUTE format(
        'CREATE POLICY %I ON public.%I FOR ALL TO authenticated USING (public.la_can_bo()) WITH CHECK (public.la_can_bo())',
        t||'_canbo_all', t);
      -- Service role: bypass (backend tin cậy)
      EXECUTE format(
        'CREATE POLICY %I ON public.%I FOR ALL TO service_role USING (true) WITH CHECK (true)',
        t||'_service', t);
    END IF;
  END LOOP;
END $$;

-- ─────────────────────────────────────────────────────────────
-- PHẦN 2: audit_logs — chỉ LÃNH ĐẠO đọc, service ghi
-- ─────────────────────────────────────────────────────────────
DO $$
DECLARE r RECORD;
BEGIN
  IF to_regclass('public.audit_logs') IS NOT NULL THEN
    FOR r IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='audit_logs' LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.audit_logs', r.policyname);
    END LOOP;
    ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "audit_read_quanly" ON public.audit_logs
      FOR SELECT TO authenticated USING (public.la_can_bo());
    CREATE POLICY "audit_service" ON public.audit_logs
      FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────
-- PHẦN 3: ho_dan / nhan_khau — VÁ PII + cách ly khu phố
--   Bỏ policy blanket USING(true); giữ policy 044 (la_can_bo + co_quyen_don_vi).
-- ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "ho_dan_all"     ON public.ho_dan;
DROP POLICY IF EXISTS "nhan_khau_all"  ON public.nhan_khau;
-- Đảm bảo RLS bật (policy 044 đã tạo ho_dan_select/insert/update + nhan_khau_*)
ALTER TABLE public.ho_dan    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nhan_khau ENABLE ROW LEVEL SECURITY;
-- Service role cho backend (portal/admin server-side)
DROP POLICY IF EXISTS "ho_dan_service" ON public.ho_dan;
CREATE POLICY "ho_dan_service" ON public.ho_dan
  FOR ALL TO service_role USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "nhan_khau_service" ON public.nhan_khau;
CREATE POLICY "nhan_khau_service" ON public.nhan_khau
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────
-- PHẦN 4: profiles — bỏ policy công khai quá lỏng
-- ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile"             ON public.profiles;
-- Policy chuẩn đã tạo ở migration 046 (profiles_select_authenticated, profiles_update_own)

-- ─────────────────────────────────────────────────────────────
-- PHẦN 5: BẢNG CÔNG KHAI — giữ đọc/nộp công khai, siết ghi cho cán bộ
-- ─────────────────────────────────────────────────────────────

-- thong_bao: ai cũng đọc (portal), cán bộ ghi
DROP POLICY IF EXISTS "thong_bao_kp25_all" ON public.thong_bao;
DROP POLICY IF EXISTS "thong_bao_canbo_all" ON public.thong_bao;
CREATE POLICY "thong_bao_canbo_all" ON public.thong_bao
  FOR ALL TO authenticated USING (public.la_can_bo()) WITH CHECK (public.la_can_bo());
DROP POLICY IF EXISTS "thong_bao_service" ON public.thong_bao;
CREATE POLICY "thong_bao_service" ON public.thong_bao
  FOR ALL TO service_role USING (true) WITH CHECK (true);
-- Giữ "thong_bao_public_read" (SELECT deleted_at IS NULL) từ migration 001.

-- su_kien: ai cũng đọc, cán bộ ghi
DROP POLICY IF EXISTS "su_kien_all" ON public.su_kien;
DROP POLICY IF EXISTS "su_kien_public_read" ON public.su_kien;
CREATE POLICY "su_kien_public_read" ON public.su_kien
  FOR SELECT USING (deleted_at IS NULL);
DROP POLICY IF EXISTS "su_kien_canbo_all" ON public.su_kien;
CREATE POLICY "su_kien_canbo_all" ON public.su_kien
  FOR ALL TO authenticated USING (public.la_can_bo()) WITH CHECK (public.la_can_bo());
DROP POLICY IF EXISTS "su_kien_service" ON public.su_kien;
CREATE POLICY "su_kien_service" ON public.su_kien
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- phan_anh: anon đọc/nộp (portal), cán bộ xử lý
DROP POLICY IF EXISTS "phan_anh_all" ON public.phan_anh;
DROP POLICY IF EXISTS "phan_anh_canbo_all" ON public.phan_anh;
CREATE POLICY "phan_anh_canbo_all" ON public.phan_anh
  FOR ALL TO authenticated USING (public.la_can_bo()) WITH CHECK (public.la_can_bo());
DROP POLICY IF EXISTS "phan_anh_service" ON public.phan_anh;
CREATE POLICY "phan_anh_service" ON public.phan_anh
  FOR ALL TO service_role USING (true) WITH CHECK (true);
-- Giữ "phan_anh_read_v2" (046, anon đọc) + "phan_anh_insert" (001, anon nộp).

-- dang_ky_tam_tru / dang_ky_tam_vang: anon nộp + tra cứu theo CCCD, cán bộ quản lý
DROP POLICY IF EXISTS "tam_tru_all"                       ON public.dang_ky_tam_tru;
DROP POLICY IF EXISTS "Authenticated full access tam_tru" ON public.dang_ky_tam_tru;
DROP POLICY IF EXISTS "tam_tru_canbo_all"                 ON public.dang_ky_tam_tru;
CREATE POLICY "tam_tru_canbo_all" ON public.dang_ky_tam_tru
  FOR ALL TO authenticated USING (public.la_can_bo()) WITH CHECK (public.la_can_bo());
DROP POLICY IF EXISTS "tam_tru_service" ON public.dang_ky_tam_tru;
CREATE POLICY "tam_tru_service" ON public.dang_ky_tam_tru
  FOR ALL TO service_role USING (true) WITH CHECK (true);
-- Giữ "Anon insert dang_ky_tam_tru" + "Anon select dang_ky_tam_tru by cccd" (019).

DROP POLICY IF EXISTS "tam_vang_all"                       ON public.dang_ky_tam_vang;
DROP POLICY IF EXISTS "Authenticated full access tam_vang" ON public.dang_ky_tam_vang;
DROP POLICY IF EXISTS "tam_vang_canbo_all"                 ON public.dang_ky_tam_vang;
CREATE POLICY "tam_vang_canbo_all" ON public.dang_ky_tam_vang
  FOR ALL TO authenticated USING (public.la_can_bo()) WITH CHECK (public.la_can_bo());
DROP POLICY IF EXISTS "tam_vang_service" ON public.dang_ky_tam_vang;
CREATE POLICY "tam_vang_service" ON public.dang_ky_tam_vang
  FOR ALL TO service_role USING (true) WITH CHECK (true);
-- Giữ "Anon insert dang_ky_tam_vang" + "Anon select dang_ky_tam_vang by cccd" (019).

-- ─────────────────────────────────────────────────────────────
-- KIỂM TRA SAU KHI CHẠY
-- ─────────────────────────────────────────────────────────────
-- 1) PII không còn đọc anon (chạy với vai trò anon → phải trả 0 dòng / lỗi RLS):
--    SET ROLE anon; SELECT count(*) FROM public.ho_dan; RESET ROLE;
-- 2) Cán bộ đã đồng bộ vai trò:
--    SELECT p.id, p.vai_tro, p.don_vi_id FROM profiles p
--    JOIN auth.users u ON u.id=p.id JOIN can_bo cb ON lower(cb.email)=lower(u.email);
-- 3) Danh sách policy còn "USING (true)" cho anon/authenticated (nên gần 0):
--    SELECT tablename, policyname, roles, qual FROM pg_policies
--    WHERE schemaname='public' AND qual='true'
--      AND roles::text NOT LIKE '%service_role%';
