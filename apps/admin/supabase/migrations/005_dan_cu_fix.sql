-- ============================================================
-- FIX: Module Dân cư — thêm cột còn thiếu cho nhan_khau
-- Chạy khi bảng nhan_khau đã tồn tại từ migration cũ
-- ============================================================

-- ─── 1. Thêm cột còn thiếu vào ho_dan ───────────────────────
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

-- ─── 2. Thêm cột còn thiếu vào nhan_khau ─────────────────────
ALTER TABLE public.nhan_khau ADD COLUMN IF NOT EXISTS ho_dan_id         UUID REFERENCES public.ho_dan(id) ON DELETE CASCADE;
ALTER TABLE public.nhan_khau ADD COLUMN IF NOT EXISTS ho_ten            TEXT;
ALTER TABLE public.nhan_khau ADD COLUMN IF NOT EXISTS ngay_sinh         DATE;
ALTER TABLE public.nhan_khau ADD COLUMN IF NOT EXISTS gioi_tinh         TEXT DEFAULT 'NAM';
ALTER TABLE public.nhan_khau ADD COLUMN IF NOT EXISTS so_cccd           TEXT;
ALTER TABLE public.nhan_khau ADD COLUMN IF NOT EXISTS quan_he_chu_ho    TEXT DEFAULT 'KHAC';
ALTER TABLE public.nhan_khau ADD COLUMN IF NOT EXISTS tinh_trang_cu_tru TEXT DEFAULT 'THUONG_TRU';
ALTER TABLE public.nhan_khau ADD COLUMN IF NOT EXISTS nghe_nghiep       TEXT;
ALTER TABLE public.nhan_khau ADD COLUMN IF NOT EXISTS ghi_chu           TEXT;
ALTER TABLE public.nhan_khau ADD COLUMN IF NOT EXISTS updated_at        TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.nhan_khau ADD COLUMN IF NOT EXISTS deleted_at        TIMESTAMPTZ;

-- ─── 3. RLS ──────────────────────────────────────────────────
ALTER TABLE public.ho_dan    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nhan_khau ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ho_dan_select"    ON public.ho_dan;
DROP POLICY IF EXISTS "ho_dan_insert"    ON public.ho_dan;
DROP POLICY IF EXISTS "ho_dan_update"    ON public.ho_dan;
DROP POLICY IF EXISTS "nhan_khau_select" ON public.nhan_khau;
DROP POLICY IF EXISTS "nhan_khau_insert" ON public.nhan_khau;
DROP POLICY IF EXISTS "nhan_khau_update" ON public.nhan_khau;

CREATE POLICY "ho_dan_select" ON public.ho_dan    FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "ho_dan_insert" ON public.ho_dan    FOR INSERT WITH CHECK (true);
CREATE POLICY "ho_dan_update" ON public.ho_dan    FOR UPDATE USING (true);

CREATE POLICY "nhan_khau_select" ON public.nhan_khau FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "nhan_khau_insert" ON public.nhan_khau FOR INSERT WITH CHECK (true);
CREATE POLICY "nhan_khau_update" ON public.nhan_khau FOR UPDATE USING (true);

-- ─── 4. SECURITY DEFINER functions ───────────────────────────
CREATE OR REPLACE FUNCTION public.xoa_mem_ho_dan(p_id uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE ho_dan SET deleted_at = NOW() WHERE id = p_id AND deleted_at IS NULL;
  RETURN FOUND;
END; $$;

CREATE OR REPLACE FUNCTION public.xoa_mem_nhan_khau(p_id uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE nhan_khau SET deleted_at = NOW() WHERE id = p_id AND deleted_at IS NULL;
  RETURN FOUND;
END; $$;

GRANT EXECUTE ON FUNCTION public.xoa_mem_ho_dan(uuid)    TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.xoa_mem_nhan_khau(uuid) TO anon, authenticated;

-- ─── 5. Indexes ──────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_ho_dan_deleted_at     ON public.ho_dan(deleted_at);
CREATE INDEX IF NOT EXISTS idx_ho_dan_tinh_trang_ho  ON public.ho_dan(tinh_trang_ho);
CREATE INDEX IF NOT EXISTS idx_ho_dan_chu_ho_ten     ON public.ho_dan(chu_ho_ten);
CREATE INDEX IF NOT EXISTS idx_nhan_khau_ho_dan_id   ON public.nhan_khau(ho_dan_id);
CREATE INDEX IF NOT EXISTS idx_nhan_khau_deleted_at  ON public.nhan_khau(deleted_at);

-- ─── 6. Updated_at trigger ───────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS ho_dan_set_updated_at    ON public.ho_dan;
DROP TRIGGER IF EXISTS nhan_khau_set_updated_at ON public.nhan_khau;

CREATE TRIGGER ho_dan_set_updated_at
  BEFORE UPDATE ON public.ho_dan
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER nhan_khau_set_updated_at
  BEFORE UPDATE ON public.nhan_khau
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
