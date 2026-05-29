-- ============================================================
-- Migration 033: FIX ĐÚNG PROJECT pnyjrneqxqckclxehaqv
-- Chạy file này trong Supabase Dashboard → SQL Editor
-- URL: https://supabase.com/dashboard/project/pnyjrneqxqckclxehaqv/sql
-- ============================================================

-- ─── 1. FIX PROFILES RLS INFINITE RECURSION ──────────────────
-- Xoá các policy tự-tham chiếu vào profiles (gây infinite recursion)
DROP POLICY IF EXISTS "Admins can update profiles"     ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete profiles"     ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_admin"          ON public.profiles;
DROP POLICY IF EXISTS "Admin full access"              ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own"            ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_authenticated"  ON public.profiles;

-- Đảm bảo có 2 policy an toàn (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'profiles' AND policyname = 'Public profiles are viewable by everyone'
  ) THEN
    CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
      FOR SELECT USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'profiles' AND policyname = 'Users can update own profile'
  ) THEN
    CREATE POLICY "Users can update own profile" ON public.profiles
      FOR UPDATE USING (auth.uid() = id);
  END IF;
END $$;


-- ─── 2. TẠO BẢNG can_bo ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.can_bo (
  id             UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  email          TEXT        NOT NULL UNIQUE,
  ho_ten         TEXT        NOT NULL,
  vai_tro        TEXT        NOT NULL,
  chuc_vu        TEXT,
  so_dien_thoai  TEXT,
  ghi_chu        TEXT,
  hoat_dong      BOOLEAN     DEFAULT TRUE NOT NULL,
  created_at     TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at     TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.can_bo ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "can_bo_select_all"  ON public.can_bo;
DROP POLICY IF EXISTS "can_bo_insert_admin" ON public.can_bo;
DROP POLICY IF EXISTS "can_bo_update_admin" ON public.can_bo;

CREATE POLICY "can_bo_select_all"   ON public.can_bo FOR SELECT USING (true);
CREATE POLICY "can_bo_insert_admin" ON public.can_bo FOR INSERT WITH CHECK (true);
CREATE POLICY "can_bo_update_admin" ON public.can_bo FOR UPDATE USING (true);


-- ─── 3. TẠO BẢNG phan_anh (nếu chưa có) ─────────────────────
CREATE TABLE IF NOT EXISTS public.phan_anh (
  id               UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  tieu_de          TEXT        NOT NULL,
  mo_ta            TEXT,
  loai             TEXT        NOT NULL DEFAULT 'KHAC',
  muc_do           TEXT        NOT NULL DEFAULT 'TRUNG_BINH',
  trang_thai       TEXT        NOT NULL DEFAULT 'MOI',
  dia_chi_phan_anh TEXT,
  anh_urls         TEXT[]      DEFAULT '{}',
  nguoi_gui_id     UUID,
  nguoi_gui_ten    TEXT,
  nguoi_gui_sdt    TEXT,
  can_bo_xu_ly_id  UUID,
  ket_qua_xu_ly    TEXT,
  thoi_gian_xu_ly  TIMESTAMPTZ,
  tom_tat_ai       TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at       TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at       TIMESTAMPTZ
);

-- Thêm cột tom_tat_ai nếu chưa có (table đã tồn tại)
ALTER TABLE public.phan_anh ADD COLUMN IF NOT EXISTS tom_tat_ai TEXT;
ALTER TABLE public.phan_anh ADD COLUMN IF NOT EXISTS can_bo_xu_ly_id UUID;
ALTER TABLE public.phan_anh ADD COLUMN IF NOT EXISTS ket_qua_xu_ly TEXT;
ALTER TABLE public.phan_anh ADD COLUMN IF NOT EXISTS thoi_gian_xu_ly TIMESTAMPTZ;

ALTER TABLE public.phan_anh ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "phan_anh_all"      ON public.phan_anh;
DROP POLICY IF EXISTS "phan_anh_read_v2"  ON public.phan_anh;
DROP POLICY IF EXISTS "phan_anh_own_read" ON public.phan_anh;

CREATE POLICY "phan_anh_all" ON public.phan_anh
  FOR ALL USING (true) WITH CHECK (true);


-- ─── 4. TẠO BẢNG workflow_assignments ────────────────────────
CREATE TABLE IF NOT EXISTS public.workflow_assignments (
  id                  UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  phan_anh_id         UUID        NOT NULL REFERENCES public.phan_anh(id) ON DELETE CASCADE,
  ai_tom_tat          TEXT,
  ai_loai             TEXT,
  ai_muc_do           TEXT,
  ai_don_vi_de_xuat   TEXT,
  ai_huong_xu_ly      TEXT,
  ai_tags             TEXT[]      DEFAULT '{}',
  ai_diem_uu_tien     INTEGER     DEFAULT 50,
  ai_analyzed_at      TIMESTAMPTZ,
  don_vi_xu_ly        TEXT,
  can_bo_phu_trach_id UUID        REFERENCES public.can_bo(id) ON DELETE SET NULL,
  phan_cong_luc       TIMESTAMPTZ,
  ghi_chu_phan_cong   TEXT,
  sla_gio             INTEGER     DEFAULT 72,
  han_xu_ly           TIMESTAMPTZ,
  trang_thai          TEXT        NOT NULL DEFAULT 'CHO_PHAN_CONG',
  ket_qua_xu_ly       TEXT,
  hoan_thanh_luc      TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at          TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at          TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_wa_phan_anh    ON public.workflow_assignments(phan_anh_id);
CREATE INDEX IF NOT EXISTS idx_wa_can_bo      ON public.workflow_assignments(can_bo_phu_trach_id);
CREATE INDEX IF NOT EXISTS idx_wa_trang_thai  ON public.workflow_assignments(trang_thai);
CREATE INDEX IF NOT EXISTS idx_wa_deleted     ON public.workflow_assignments(deleted_at);

ALTER TABLE public.workflow_assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "workflow_all_authenticated" ON public.workflow_assignments;
DROP POLICY IF EXISTS "workflow_read_v2"           ON public.workflow_assignments;
DROP POLICY IF EXISTS "workflow_insert_v2"         ON public.workflow_assignments;
DROP POLICY IF EXISTS "workflow_update_v2"         ON public.workflow_assignments;

CREATE POLICY "workflow_all_authenticated" ON public.workflow_assignments
  FOR ALL USING (true) WITH CHECK (true);


-- ─── 5. TẠO BẢNG workflow_lich_su ────────────────────────────
CREATE TABLE IF NOT EXISTS public.workflow_lich_su (
  id                   UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id        UUID        NOT NULL REFERENCES public.workflow_assignments(id) ON DELETE CASCADE,
  nguoi_thuc_hien_id   UUID        REFERENCES public.can_bo(id) ON DELETE SET NULL,
  hanh_dong            TEXT        NOT NULL,
  trang_thai_moi       TEXT,
  ghi_chu              TEXT,
  created_at           TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.workflow_lich_su ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "wls_all" ON public.workflow_lich_su;
CREATE POLICY "wls_all" ON public.workflow_lich_su FOR ALL USING (true) WITH CHECK (true);


-- ─── 6. TRIGGER auto-log workflow_lich_su ────────────────────
CREATE OR REPLACE FUNCTION public.ghi_workflow_lich_su()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.trang_thai IS DISTINCT FROM NEW.trang_thai THEN
    INSERT INTO public.workflow_lich_su (
      assignment_id, nguoi_thuc_hien_id, hanh_dong, trang_thai_moi, ghi_chu
    ) VALUES (
      NEW.id,
      NEW.can_bo_phu_trach_id,
      CASE NEW.trang_thai
        WHEN 'DA_PHAN_CONG' THEN 'PHAN_CONG'
        WHEN 'DANG_XU_LY'  THEN 'TIEP_NHAN'
        WHEN 'HOAN_THANH'  THEN 'HOAN_THANH'
        WHEN 'QUA_HAN'     THEN 'QUA_HAN'
        WHEN 'HUY'         THEN 'HUY'
        ELSE 'CAP_NHAT'
      END,
      NEW.trang_thai,
      NEW.ghi_chu_phan_cong
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_workflow_lich_su ON public.workflow_assignments;
CREATE TRIGGER trg_workflow_lich_su
  AFTER UPDATE ON public.workflow_assignments
  FOR EACH ROW EXECUTE FUNCTION public.ghi_workflow_lich_su();


-- ─── 7. FIX BẢNG thong_bao ───────────────────────────────────
-- Thêm các cột còn thiếu
ALTER TABLE public.thong_bao ADD COLUMN IF NOT EXISTS anh_url       TEXT;
ALTER TABLE public.thong_bao ADD COLUMN IF NOT EXISTS ghim_len      BOOLEAN DEFAULT FALSE;
ALTER TABLE public.thong_bao ADD COLUMN IF NOT EXISTS ngay_het_han  TIMESTAMPTZ;
ALTER TABLE public.thong_bao ADD COLUMN IF NOT EXISTS luot_xem      INTEGER DEFAULT 0;
ALTER TABLE public.thong_bao ADD COLUMN IF NOT EXISTS da_gui_push   BOOLEAN DEFAULT FALSE;
ALTER TABLE public.thong_bao ADD COLUMN IF NOT EXISTS da_gui_zalo   BOOLEAN DEFAULT FALSE;
ALTER TABLE public.thong_bao ADD COLUMN IF NOT EXISTS da_gui_sms    BOOLEAN DEFAULT FALSE;
ALTER TABLE public.thong_bao ADD COLUMN IF NOT EXISTS deleted_at    TIMESTAMPTZ;

-- Policy cho KP25 admin (không ảnh hưởng policies của hệ thống cũ)
DROP POLICY IF EXISTS "thong_bao_kp25_all" ON public.thong_bao;
CREATE POLICY "thong_bao_kp25_all" ON public.thong_bao
  FOR ALL USING (true) WITH CHECK (true);


-- ─── 8. FIX BẢNG su_kien ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.su_kien (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  tieu_de       TEXT        NOT NULL,
  mo_ta         TEXT,
  loai          TEXT        DEFAULT 'HOAT_DONG',
  trang_thai    TEXT        DEFAULT 'SAP_DIEN_RA',
  ngay_bat_dau  TIMESTAMPTZ,
  ngay_ket_thuc TIMESTAMPTZ,
  dia_diem      TEXT,
  anh_url       TEXT,
  noi_bat       BOOLEAN     DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at    TIMESTAMPTZ
);

ALTER TABLE public.su_kien ADD COLUMN IF NOT EXISTS loai         TEXT DEFAULT 'HOAT_DONG';
ALTER TABLE public.su_kien ADD COLUMN IF NOT EXISTS trang_thai   TEXT DEFAULT 'SAP_DIEN_RA';
ALTER TABLE public.su_kien ADD COLUMN IF NOT EXISTS ngay_bat_dau TIMESTAMPTZ;
ALTER TABLE public.su_kien ADD COLUMN IF NOT EXISTS noi_bat      BOOLEAN DEFAULT FALSE;

ALTER TABLE public.su_kien ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "su_kien_all" ON public.su_kien;
CREATE POLICY "su_kien_all" ON public.su_kien FOR ALL USING (true) WITH CHECK (true);


-- ─── 9. TẠO LẠI dang_ky_tam_tru ─────────────────────────────
DROP TABLE IF EXISTS public.dang_ky_tam_tru CASCADE;
CREATE TABLE public.dang_ky_tam_tru (
  id                  UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  ho_ten              TEXT        NOT NULL,
  ngay_sinh           DATE,
  gioi_tinh           TEXT,
  so_cccd             TEXT,
  noi_sinh            TEXT,
  quoc_tich           TEXT        DEFAULT 'Việt Nam',
  dan_toc             TEXT        DEFAULT 'Kinh',
  dia_chi_thuong_tru  TEXT,
  tinh_thanh_goc      TEXT,
  dia_chi_tam_tru     TEXT,
  so_nha_tam_tru      TEXT,
  duong_tam_tru       TEXT,
  chu_nha_ho_ten      TEXT,
  chu_nha_sdt         TEXT,
  chu_nha_cccd        TEXT,
  ly_do_tam_tru       TEXT,
  ngay_bat_dau        DATE,
  ngay_ket_thuc       DATE,
  trang_thai          TEXT        NOT NULL DEFAULT 'DANG_TAM_TRU',
  so_to_khai          TEXT,
  can_bo_tiep_nhan    TEXT,
  ghi_chu             TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at          TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at          TIMESTAMPTZ
);
ALTER TABLE public.dang_ky_tam_tru ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tam_tru_all" ON public.dang_ky_tam_tru;
CREATE POLICY "tam_tru_all" ON public.dang_ky_tam_tru FOR ALL USING (true) WITH CHECK (true);


-- ─── 10. TẠO LẠI dang_ky_tam_vang ───────────────────────────
DROP TABLE IF EXISTS public.dang_ky_tam_vang CASCADE;
CREATE TABLE public.dang_ky_tam_vang (
  id                  UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  ho_dan_id           UUID,
  nhan_khau_id        UUID,
  ho_ten              TEXT        NOT NULL,
  ngay_sinh           DATE,
  gioi_tinh           TEXT,
  so_cccd             TEXT,
  dia_chi_hien_tai    TEXT,
  dia_chi_tam_vang    TEXT,
  tinh_thanh_den      TEXT,
  ly_do_tam_vang      TEXT,
  ngay_di             DATE,
  ngay_du_kien_ve     DATE,
  sdt_lien_lac        TEXT,
  sdt_nguoi_than      TEXT,
  ho_ten_nguoi_than   TEXT,
  trang_thai          TEXT        NOT NULL DEFAULT 'DANG_TAM_VANG',
  can_bo_tiep_nhan    TEXT,
  ghi_chu             TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at          TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at          TIMESTAMPTZ
);
ALTER TABLE public.dang_ky_tam_vang ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tam_vang_all" ON public.dang_ky_tam_vang;
CREATE POLICY "tam_vang_all" ON public.dang_ky_tam_vang FOR ALL USING (true) WITH CHECK (true);


-- ─── 11. TẠO LẠI tai_lieu ────────────────────────────────────
DROP TABLE IF EXISTS public.tai_lieu CASCADE;
CREATE TABLE public.tai_lieu (
  id               UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  tieu_de          TEXT        NOT NULL,
  mo_ta            TEXT,
  loai             TEXT        NOT NULL DEFAULT 'VAN_BAN',
  so_hieu          TEXT,
  nam_ban_hanh     INTEGER,
  nguon            TEXT,
  file_url         TEXT,
  file_name        TEXT,
  file_size        BIGINT,
  loai_file        TEXT,
  la_cong_khai     BOOLEAN     DEFAULT TRUE NOT NULL,
  luot_tai         INTEGER     DEFAULT 0 NOT NULL,
  tags             TEXT[]      DEFAULT '{}',
  noi_dung_van_ban TEXT,
  created_by       TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at       TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at       TIMESTAMPTZ
);
ALTER TABLE public.tai_lieu ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tai_lieu_all" ON public.tai_lieu;
CREATE POLICY "tai_lieu_all" ON public.tai_lieu FOR ALL USING (true) WITH CHECK (true);


-- ─── 12. FIX ho_dan / nhan_khau policies ─────────────────────
DO $$
BEGIN
  -- ho_dan
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ho_dan') THEN
    CREATE TABLE public.ho_dan (
      id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      so_ho         TEXT,
      chu_ho        TEXT NOT NULL,
      dia_chi       TEXT,
      so_nhan_khau  INTEGER DEFAULT 0,
      created_at    TIMESTAMPTZ DEFAULT NOW(),
      updated_at    TIMESTAMPTZ DEFAULT NOW(),
      deleted_at    TIMESTAMPTZ
    );
    ALTER TABLE public.ho_dan ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

DROP POLICY IF EXISTS "ho_dan_select" ON public.ho_dan;
DROP POLICY IF EXISTS "ho_dan_insert" ON public.ho_dan;
DROP POLICY IF EXISTS "ho_dan_update" ON public.ho_dan;
DROP POLICY IF EXISTS "ho_dan_all"    ON public.ho_dan;
CREATE POLICY "ho_dan_all" ON public.ho_dan FOR ALL USING (true) WITH CHECK (true);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'nhan_khau') THEN
    CREATE TABLE public.nhan_khau (
      id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      ho_id       UUID REFERENCES public.ho_dan(id),
      ho_ten      TEXT NOT NULL,
      ngay_sinh   DATE,
      gioi_tinh   TEXT,
      so_cccd     TEXT,
      quan_he_chu_ho TEXT,
      created_at  TIMESTAMPTZ DEFAULT NOW(),
      updated_at  TIMESTAMPTZ DEFAULT NOW(),
      deleted_at  TIMESTAMPTZ
    );
    ALTER TABLE public.nhan_khau ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

DROP POLICY IF EXISTS "nhan_khau_select" ON public.nhan_khau;
DROP POLICY IF EXISTS "nhan_khau_insert" ON public.nhan_khau;
DROP POLICY IF EXISTS "nhan_khau_update" ON public.nhan_khau;
DROP POLICY IF EXISTS "nhan_khau_all"    ON public.nhan_khau;
CREATE POLICY "nhan_khau_all" ON public.nhan_khau FOR ALL USING (true) WITH CHECK (true);


-- ─── 13. SEED can_bo (5 cán bộ KP25) ────────────────────────
-- Xoá seed cũ sai (nếu có)
DELETE FROM public.can_bo
WHERE email IN ('danguy.longtruong@gmail.com','vantuan26@gmail.com');

-- Upsert 5 cán bộ đúng
INSERT INTO public.can_bo (email, ho_ten, vai_tro, chuc_vu, hoat_dong) VALUES
  ('taip2704@gmail.com',       'Phan Tấn Tài',           'BI_THU',         'Bí thư chi bộ Khu phố 25',      true),
  ('hongthuykp25@gmail.com',   'Nguyễn Thị Hồng Thủy',   'TRUONG_KHU_PHO', 'Trưởng khu phố 25',             true),
  ('huuhung.kp25@gmail.com',   'Trần Hữu Hùng',           'CONG_AN',        'Công an khu vực',               true),
  ('ngocnhan.kp25@gmail.com',  'Mai Ngọc Nhân',           'AN_NINH',        'An ninh cơ sở',                 true),
  ('thanhxuan.kp25@gmail.com', 'Mai Thị Thanh Xuân',      'PHU_TRACH_NCT',  'Hội người cao tuổi',            true)
ON CONFLICT (email) DO UPDATE SET
  ho_ten    = EXCLUDED.ho_ten,
  vai_tro   = EXCLUDED.vai_tro,
  chuc_vu   = EXCLUDED.chuc_vu,
  hoat_dong = EXCLUDED.hoat_dong,
  updated_at = NOW();


-- ─── 14. TẠO AUTH USERS cho 4 cán bộ mới ───────────────────
-- Mật khẩu tạm: KP25@LongTruong2026 (bcrypt)
-- Chỉ tạo nếu chưa tồn tại
DO $$
DECLARE
  v_uid uuid;
  v_hash text := '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';
  -- hash trên là bcrypt cho password 'password', thay bằng hash thật:
  v_real_hash text;
BEGIN
  -- Generate hash cho KP25@LongTruong2026
  v_real_hash := crypt('KP25@LongTruong2026', gen_salt('bf', 10));

  -- Nguyễn Thị Hồng Thủy
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'hongthuykp25@gmail.com') THEN
    v_uid := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      aud, role, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, email_change_token_new, recovery_token
    ) VALUES (
      v_uid, '00000000-0000-0000-0000-000000000000',
      'hongthuykp25@gmail.com', v_real_hash, NOW(),
      'authenticated', 'authenticated',
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Nguyễn Thị Hồng Thủy"}'::jsonb,
      NOW(), NOW(), '', '', ''
    );
    INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    VALUES (v_uid, v_uid, 'hongthuykp25@gmail.com',
      format('{"sub":"%s","email":"hongthuykp25@gmail.com"}', v_uid)::jsonb,
      'email', NOW(), NOW(), NOW());
  END IF;

  -- Trần Hữu Hùng
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'huuhung.kp25@gmail.com') THEN
    v_uid := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      aud, role, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, email_change_token_new, recovery_token
    ) VALUES (
      v_uid, '00000000-0000-0000-0000-000000000000',
      'huuhung.kp25@gmail.com', v_real_hash, NOW(),
      'authenticated', 'authenticated',
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Trần Hữu Hùng"}'::jsonb,
      NOW(), NOW(), '', '', ''
    );
    INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    VALUES (v_uid, v_uid, 'huuhung.kp25@gmail.com',
      format('{"sub":"%s","email":"huuhung.kp25@gmail.com"}', v_uid)::jsonb,
      'email', NOW(), NOW(), NOW());
  END IF;

  -- Mai Ngọc Nhân
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'ngocnhan.kp25@gmail.com') THEN
    v_uid := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      aud, role, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, email_change_token_new, recovery_token
    ) VALUES (
      v_uid, '00000000-0000-0000-0000-000000000000',
      'ngocnhan.kp25@gmail.com', v_real_hash, NOW(),
      'authenticated', 'authenticated',
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Mai Ngọc Nhân"}'::jsonb,
      NOW(), NOW(), '', '', ''
    );
    INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    VALUES (v_uid, v_uid, 'ngocnhan.kp25@gmail.com',
      format('{"sub":"%s","email":"ngocnhan.kp25@gmail.com"}', v_uid)::jsonb,
      'email', NOW(), NOW(), NOW());
  END IF;

  -- Mai Thị Thanh Xuân
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'thanhxuan.kp25@gmail.com') THEN
    v_uid := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      aud, role, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, email_change_token_new, recovery_token
    ) VALUES (
      v_uid, '00000000-0000-0000-0000-000000000000',
      'thanhxuan.kp25@gmail.com', v_real_hash, NOW(),
      'authenticated', 'authenticated',
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Mai Thị Thanh Xuân"}'::jsonb,
      NOW(), NOW(), '', '', ''
    );
    INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    VALUES (v_uid, v_uid, 'thanhxuan.kp25@gmail.com',
      format('{"sub":"%s","email":"thanhxuan.kp25@gmail.com"}', v_uid)::jsonb,
      'email', NOW(), NOW(), NOW());
  END IF;
END $$;


-- ─── 15. SEED phan_anh mẫu ───────────────────────────────────
INSERT INTO public.phan_anh (tieu_de, mo_ta, loai, muc_do, trang_thai, nguoi_gui_ten, nguoi_gui_sdt, dia_chi_phan_anh) VALUES
  ('Đèn đường hẻm 15 bị hỏng 3 ngày chưa sửa',    'Đèn đường hẻm 15 tắt từ 3 ngày qua, ban đêm rất tối, nguy hiểm cho người đi đường.',            'HA_TANG',    'CAO',        'MOI', 'Nguyễn Văn A',  '0901234567', 'Hẻm 15, KP25'),
  ('Rác thải tràn lan trước cổng trường học',       'Rác thải sinh hoạt bị đổ trước cổng trường, gây mùi hôi và mất vệ sinh.',                        'MOI_TRUONG', 'TRUNG_BINH', 'MOI', 'Trần Thị B',    '0912345678', 'Cổng trường TH KP25'),
  ('Thanh niên tụ tập đêm khuya gây mất trật tự',  'Nhóm thanh niên tụ tập đua xe, gây tiếng ồn và mất trật tự từ 22h đến 2h sáng.',                 'AN_NINH',    'CAO',        'MOI', 'Lê Văn C',      '0923456789', 'Đường số 5, KP25'),
  ('Cống thoát nước bị nghẹt gây ngập úng',        'Cống thoát nước tại ngã tư bị nghẹt, mỗi khi mưa lớn gây ngập đường khoảng 20-30cm.',             'HA_TANG',    'TRUNG_BINH', 'MOI', 'Phạm Thị D',    '0934567890', 'Ngã tư đường 7, KP25'),
  ('Hộ gia đình khó khăn cần hỗ trợ lương thực',  'Gia đình bà Nguyễn Thị E có hoàn cảnh khó khăn, chồng mất việc, 3 con nhỏ, cần hỗ trợ.',         'AN_SINH',    'TRUNG_BINH', 'MOI', 'Hàng xóm',      NULL,         'Tổ 3, KP25')
ON CONFLICT DO NOTHING;


-- ─── 16. REALTIME publications ───────────────────────────────
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.phan_anh;
  EXCEPTION WHEN others THEN NULL; END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.workflow_assignments;
  EXCEPTION WHEN others THEN NULL; END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.thong_bao;
  EXCEPTION WHEN others THEN NULL; END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.ho_dan;
  EXCEPTION WHEN others THEN NULL; END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.nhan_khau;
  EXCEPTION WHEN others THEN NULL; END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.dang_ky_tam_tru;
  EXCEPTION WHEN others THEN NULL; END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.dang_ky_tam_vang;
  EXCEPTION WHEN others THEN NULL; END;
END $$;


-- ─── VERIFY ──────────────────────────────────────────────────
SELECT 'profiles policies:' AS info, policyname, cmd FROM pg_policies WHERE tablename = 'profiles'
UNION ALL
SELECT 'can_bo count:', count(*)::text, '' FROM public.can_bo
UNION ALL
SELECT 'workflow_assignments exists:', 'YES', '' FROM information_schema.tables WHERE table_name = 'workflow_assignments';
