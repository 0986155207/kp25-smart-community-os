-- ============================================================
-- MODULE DÂN CƯ / HỘ DÂN — Migration 005
-- KP25 SMART COMMUNITY OS
-- Chạy trong Supabase SQL Editor
-- ============================================================

-- ─── 1. BẢNG HỘ DÂN ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ho_dan (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  so_nha         TEXT,
  duong          TEXT,
  to_dan_pho     TEXT,
  dia_chi_day_du TEXT,
  chu_ho_ten     TEXT        NOT NULL DEFAULT '',
  chu_ho_sdt     TEXT,
  chu_ho_cccd    TEXT,
  so_nhan_khau   INTEGER     DEFAULT 0,
  tinh_trang_ho  TEXT        DEFAULT 'THUONG_TRU',
  ghi_chu        TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW(),
  deleted_at     TIMESTAMPTZ,
  created_by     UUID
);

-- Thêm cột nếu chưa có (an toàn để chạy lại nhiều lần)
ALTER TABLE public.ho_dan ADD COLUMN IF NOT EXISTS so_nha         TEXT;
ALTER TABLE public.ho_dan ADD COLUMN IF NOT EXISTS duong          TEXT;
ALTER TABLE public.ho_dan ADD COLUMN IF NOT EXISTS to_dan_pho     TEXT;
ALTER TABLE public.ho_dan ADD COLUMN IF NOT EXISTS dia_chi_day_du TEXT;
ALTER TABLE public.ho_dan ADD COLUMN IF NOT EXISTS chu_ho_ten     TEXT;
ALTER TABLE public.ho_dan ADD COLUMN IF NOT EXISTS chu_ho_sdt     TEXT;
ALTER TABLE public.ho_dan ADD COLUMN IF NOT EXISTS chu_ho_cccd    TEXT;
ALTER TABLE public.ho_dan ADD COLUMN IF NOT EXISTS so_nhan_khau   INTEGER DEFAULT 0;
ALTER TABLE public.ho_dan ADD COLUMN IF NOT EXISTS tinh_trang_ho  TEXT    DEFAULT 'THUONG_TRU';
ALTER TABLE public.ho_dan ADD COLUMN IF NOT EXISTS ghi_chu        TEXT;
ALTER TABLE public.ho_dan ADD COLUMN IF NOT EXISTS updated_at     TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.ho_dan ADD COLUMN IF NOT EXISTS deleted_at     TIMESTAMPTZ;

-- ─── 2. BẢNG NHÂN KHẨU ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.nhan_khau (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  ho_dan_id         UUID        NOT NULL REFERENCES public.ho_dan(id) ON DELETE CASCADE,
  ho_ten            TEXT        NOT NULL DEFAULT '',
  ngay_sinh         DATE,
  gioi_tinh         TEXT        DEFAULT 'NAM',
  so_cccd           TEXT,
  quan_he_chu_ho    TEXT        DEFAULT 'KHAC',
  tinh_trang_cu_tru TEXT        DEFAULT 'THUONG_TRU',
  nghe_nghiep       TEXT,
  ghi_chu           TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  deleted_at        TIMESTAMPTZ
);

-- ─── 3. ROW LEVEL SECURITY ───────────────────────────────────
ALTER TABLE public.ho_dan    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nhan_khau ENABLE ROW LEVEL SECURITY;

-- Xoá policy cũ nếu tồn tại
DROP POLICY IF EXISTS "allow_all_ho_dan"        ON public.ho_dan;
DROP POLICY IF EXISTS "ho_dan_select"           ON public.ho_dan;
DROP POLICY IF EXISTS "ho_dan_insert"           ON public.ho_dan;
DROP POLICY IF EXISTS "ho_dan_update"           ON public.ho_dan;
DROP POLICY IF EXISTS "allow_all_nhan_khau"     ON public.nhan_khau;
DROP POLICY IF EXISTS "nhan_khau_select"        ON public.nhan_khau;
DROP POLICY IF EXISTS "nhan_khau_insert"        ON public.nhan_khau;
DROP POLICY IF EXISTS "nhan_khau_update"        ON public.nhan_khau;

-- Policies cho ho_dan
-- SELECT: chỉ xem hộ chưa bị xoá
CREATE POLICY "ho_dan_select" ON public.ho_dan
  FOR SELECT USING (deleted_at IS NULL);

-- INSERT: cho phép thêm mới
CREATE POLICY "ho_dan_insert" ON public.ho_dan
  FOR INSERT WITH CHECK (true);

-- UPDATE: USING (true) để cho phép soft-delete (set deleted_at)
-- mà không bị chặn bởi SELECT policy
CREATE POLICY "ho_dan_update" ON public.ho_dan
  FOR UPDATE USING (true);

-- Policies cho nhan_khau
CREATE POLICY "nhan_khau_select" ON public.nhan_khau
  FOR SELECT USING (deleted_at IS NULL);

CREATE POLICY "nhan_khau_insert" ON public.nhan_khau
  FOR INSERT WITH CHECK (true);

CREATE POLICY "nhan_khau_update" ON public.nhan_khau
  FOR UPDATE USING (true);

-- ─── 4. SECURITY DEFINER FUNCTIONS (bypass RLS khi xoá mềm) ─
-- Giống pattern đã dùng cho phan_anh

CREATE OR REPLACE FUNCTION public.xoa_mem_ho_dan(p_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE ho_dan
  SET deleted_at = NOW()
  WHERE id = p_id
    AND deleted_at IS NULL;
  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.xoa_mem_nhan_khau(p_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE nhan_khau
  SET deleted_at = NOW()
  WHERE id = p_id
    AND deleted_at IS NULL;
  RETURN FOUND;
END;
$$;

-- Cấp quyền gọi function
GRANT EXECUTE ON FUNCTION public.xoa_mem_ho_dan(uuid)    TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.xoa_mem_nhan_khau(uuid) TO anon, authenticated;

-- ─── 5. INDEXES ──────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_ho_dan_deleted_at     ON public.ho_dan(deleted_at);
CREATE INDEX IF NOT EXISTS idx_ho_dan_tinh_trang_ho  ON public.ho_dan(tinh_trang_ho);
CREATE INDEX IF NOT EXISTS idx_ho_dan_chu_ho_ten     ON public.ho_dan(chu_ho_ten);
CREATE INDEX IF NOT EXISTS idx_nhan_khau_ho_dan_id   ON public.nhan_khau(ho_dan_id);
CREATE INDEX IF NOT EXISTS idx_nhan_khau_deleted_at  ON public.nhan_khau(deleted_at);

-- ─── 6. UPDATED_AT TRIGGER ───────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS ho_dan_set_updated_at    ON public.ho_dan;
DROP TRIGGER IF EXISTS nhan_khau_set_updated_at ON public.nhan_khau;

CREATE TRIGGER ho_dan_set_updated_at
  BEFORE UPDATE ON public.ho_dan
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER nhan_khau_set_updated_at
  BEFORE UPDATE ON public.nhan_khau
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─── 7. DỮ LIỆU MẪU (tuỳ chọn, xoá nếu không cần) ──────────
-- INSERT INTO public.ho_dan (chu_ho_ten, so_nha, duong, to_dan_pho, dia_chi_day_du, so_nhan_khau, tinh_trang_ho)
-- VALUES
--   ('Nguyễn Văn An',  '25',   'Đường Long Trường', 'Tổ 1', '25 Đường Long Trường, KP25, Long Trường, TP.HCM', 4, 'THUONG_TRU'),
--   ('Trần Thị Bình',  '12/3', 'Hẻm 18',            'Tổ 2', '12/3 Hẻm 18, KP25, Long Trường, TP.HCM',         3, 'THUONG_TRU'),
--   ('Lê Văn Cường',   '8A',   'Đường Long Phước',  'Tổ 3', '8A Đường Long Phước, KP25, Long Trường, TP.HCM', 2, 'TAM_TRU');
