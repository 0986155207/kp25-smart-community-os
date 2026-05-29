-- ============================================================
-- Migration 023–030: KP25 Production Schema Fix
-- Applied via Supabase MCP trực tiếp vào DB
-- Ngày: 2026-05-27
-- ============================================================

-- Các migration đã được apply qua Supabase MCP:
--
-- 023: Tạo can_bo, workflow_assignments, dang_ky_tam_tru, dang_ky_tam_vang
-- 024: Tạo workflow_lich_su + trigger auto-log
-- 025: Thêm phan_anh, thong_bao, ho_dan, nhan_khau vào Realtime publication
-- 026: Recreate dang_ky_tam_tru/vang với đúng columns
-- 027: Thêm cột còn thiếu vào thong_bao (anh_url, ghim_len, ngay_het_han...)
-- 028: Thêm cột còn thiếu vào su_kien (loai, trang_thai, ngay_bat_dau, noi_bat)
-- 029: Recreate tai_lieu với đúng columns
-- 030: Thêm tom_tat_ai vào phan_anh

-- ─── SEED DATA (đã chạy thủ công) ───────────────────────────

-- Seed can_bo (3 cán bộ dựa theo auth users)
INSERT INTO public.can_bo (email, ho_ten, vai_tro, chuc_vu, hoat_dong) VALUES
  ('taip2704@gmail.com',          'Phan Anh Tài',  'BI_THU',         'Bí thư chi bộ Khu phố 25', true),
  ('danguy.longtruong@gmail.com', 'Đặng Uy',       'TRUONG_KHU_PHO', 'Trưởng khu phố 25',        true),
  ('vantuan26@gmail.com',         'Văn Tuấn',      'CAN_BO',         'Cán bộ khu phố',           true)
ON CONFLICT (email) DO NOTHING;

-- Seed phan_anh mẫu (5 bản ghi)
-- (xem data đã insert trong session)

-- ─── SCHEMAS ─────────────────────────────────────────────────

-- can_bo table
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

-- workflow_assignments table
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

-- workflow_lich_su table
CREATE TABLE IF NOT EXISTS public.workflow_lich_su (
  id                   UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id        UUID        NOT NULL REFERENCES public.workflow_assignments(id) ON DELETE CASCADE,
  nguoi_thuc_hien_id   UUID        REFERENCES public.can_bo(id) ON DELETE SET NULL,
  hanh_dong            TEXT        NOT NULL,
  trang_thai_moi       TEXT,
  ghi_chu              TEXT,
  created_at           TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
