-- ============================================================
-- Migration 041: Mở rộng hồ sơ dân cư — thêm các trường còn thiếu
-- ============================================================
-- Bổ sung các trường cần thiết cho hồ sơ nhân khẩu đầy đủ
-- theo chuẩn quản lý cư trú Việt Nam.

-- ── Mở rộng bảng nhan_khau ──────────────────────────────────
ALTER TABLE nhan_khau
  ADD COLUMN IF NOT EXISTS noi_sinh                 TEXT,
  ADD COLUMN IF NOT EXISTS nguyen_quan              TEXT,
  ADD COLUMN IF NOT EXISTS dan_toc                  TEXT DEFAULT 'Kinh',
  ADD COLUMN IF NOT EXISTS ton_giao                 TEXT DEFAULT 'Không',
  ADD COLUMN IF NOT EXISTS quoc_tich                TEXT DEFAULT 'Việt Nam',
  ADD COLUMN IF NOT EXISTS cccd_ngay_cap            DATE,
  ADD COLUMN IF NOT EXISTS cccd_noi_cap             TEXT,
  ADD COLUMN IF NOT EXISTS tinh_trang_hon_nhan      TEXT,
  ADD COLUMN IF NOT EXISTS noi_lam_viec             TEXT,
  ADD COLUMN IF NOT EXISTS trinh_do_chuyen_mon      TEXT,
  ADD COLUMN IF NOT EXISTS ngay_dang_ky_thuong_tru  DATE,
  ADD COLUMN IF NOT EXISTS dia_chi_thuong_tru       TEXT;

COMMENT ON COLUMN nhan_khau.noi_sinh             IS 'Nơi sinh (tỉnh/thành)';
COMMENT ON COLUMN nhan_khau.nguyen_quan          IS 'Nguyên quán';
COMMENT ON COLUMN nhan_khau.dan_toc              IS 'Dân tộc (mặc định Kinh)';
COMMENT ON COLUMN nhan_khau.ton_giao             IS 'Tôn giáo (mặc định Không)';
COMMENT ON COLUMN nhan_khau.quoc_tich            IS 'Quốc tịch (mặc định Việt Nam)';
COMMENT ON COLUMN nhan_khau.cccd_ngay_cap        IS 'Ngày cấp CCCD';
COMMENT ON COLUMN nhan_khau.cccd_noi_cap         IS 'Nơi cấp CCCD';
COMMENT ON COLUMN nhan_khau.tinh_trang_hon_nhan  IS 'DOC_THAN | DA_KET_HON | LY_HON | GOA';
COMMENT ON COLUMN nhan_khau.noi_lam_viec         IS 'Nơi làm việc / học tập';
COMMENT ON COLUMN nhan_khau.trinh_do_chuyen_mon  IS 'Trình độ chuyên môn';

-- ── Mở rộng bảng ho_dan ─────────────────────────────────────
ALTER TABLE ho_dan
  ADD COLUMN IF NOT EXISTS so_ho_khau   TEXT,
  ADD COLUMN IF NOT EXISTS ngay_lap_ho  DATE;

COMMENT ON COLUMN ho_dan.so_ho_khau  IS 'Số sổ hộ khẩu / mã định danh cư trú';

-- ── Bảng yêu cầu cập nhật từ người dân (self-declaration) ───
-- Người dân tự khai → cán bộ duyệt mới áp dụng vào nhan_khau
CREATE TABLE IF NOT EXISTS yeu_cau_cap_nhat_dan_cu (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Liên kết
  ho_id           UUID REFERENCES ho_dan(id)    ON DELETE CASCADE,
  nhan_khau_id    UUID REFERENCES nhan_khau(id) ON DELETE SET NULL,

  -- Loại: THEM_MOI (thêm nhân khẩu) | CAP_NHAT (sửa thông tin)
  loai            TEXT NOT NULL DEFAULT 'CAP_NHAT' CHECK (loai IN ('THEM_MOI','CAP_NHAT')),

  -- Snapshot
  ho_ten          TEXT,
  nguoi_gui_sdt   TEXT,            -- SĐT người gửi (để xác thực)

  -- Dữ liệu đề xuất (JSONB chứa các trường cần cập nhật)
  du_lieu_moi     JSONB NOT NULL DEFAULT '{}',
  du_lieu_cu      JSONB DEFAULT '{}',   -- snapshot giá trị cũ để so sánh

  -- Trạng thái duyệt
  trang_thai      TEXT NOT NULL DEFAULT 'CHO_DUYET' CHECK (trang_thai IN ('CHO_DUYET','DA_DUYET','TU_CHOI')),
  can_bo_duyet_id UUID,
  can_bo_duyet_ten TEXT,
  ngay_duyet      TIMESTAMPTZ,
  ly_do_tu_choi   TEXT,
  ghi_chu         TEXT,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_yccn_trang_thai ON yeu_cau_cap_nhat_dan_cu (trang_thai) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_yccn_ho         ON yeu_cau_cap_nhat_dan_cu (ho_id)       WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_yccn_created    ON yeu_cau_cap_nhat_dan_cu (created_at DESC);

ALTER TABLE yeu_cau_cap_nhat_dan_cu ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='yeu_cau_cap_nhat_dan_cu' AND policyname='yccn_all') THEN
    CREATE POLICY "yccn_all" ON yeu_cau_cap_nhat_dan_cu FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Realtime
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'yeu_cau_cap_nhat_dan_cu'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE yeu_cau_cap_nhat_dan_cu;
  END IF;
END $$;

COMMENT ON TABLE yeu_cau_cap_nhat_dan_cu IS 'Yêu cầu cập nhật thông tin dân cư do người dân tự khai (chờ cán bộ duyệt)';
