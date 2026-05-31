-- ============================================================
-- Migration 043: Đăng ký hộ dân mới (tự khai công khai)
-- ============================================================
-- Dành cho hộ/người dân MỚI chưa có hồ sơ trên hệ thống.
-- Họ tự khai qua link/QR công khai → cán bộ duyệt → tạo ho_dan + nhan_khau.

CREATE TABLE IF NOT EXISTS dang_ky_ho_moi (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Thông tin hộ
  chu_ho          TEXT NOT NULL,
  dia_chi         TEXT NOT NULL,
  so_dien_thoai   TEXT,
  so_nha          TEXT,
  duong           TEXT,
  to_dan_pho      TEXT,
  loai_cu_tru     TEXT NOT NULL DEFAULT 'THUONG_TRU' CHECK (loai_cu_tru IN ('THUONG_TRU','TAM_TRU')),

  -- Danh sách thành viên: [{ho_ten, ngay_sinh, gioi_tinh, cccd, quan_he, nghe_nghiep}]
  thanh_vien      JSONB NOT NULL DEFAULT '[]',

  -- Người khai (để cán bộ liên hệ xác minh)
  nguoi_khai_sdt  TEXT,
  ghi_chu         TEXT,

  -- Trạng thái duyệt
  trang_thai      TEXT NOT NULL DEFAULT 'CHO_DUYET' CHECK (trang_thai IN ('CHO_DUYET','DA_DUYET','TU_CHOI')),
  ho_id_tao       UUID REFERENCES ho_dan(id) ON DELETE SET NULL,  -- hộ được tạo sau khi duyệt
  can_bo_duyet_id UUID,
  can_bo_duyet_ten TEXT,
  ngay_duyet      TIMESTAMPTZ,
  ly_do_tu_choi   TEXT,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_dkhm_trang_thai ON dang_ky_ho_moi (trang_thai) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_dkhm_created    ON dang_ky_ho_moi (created_at DESC);

ALTER TABLE dang_ky_ho_moi ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='dang_ky_ho_moi' AND policyname='dkhm_all') THEN
    CREATE POLICY "dkhm_all" ON dang_ky_ho_moi FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND tablename='dang_ky_ho_moi'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE dang_ky_ho_moi;
  END IF;
END $$;

COMMENT ON TABLE dang_ky_ho_moi IS 'Đăng ký hộ dân mới do người dân tự khai (chờ cán bộ duyệt → tạo ho_dan + nhan_khau)';
