-- ================================================================
-- Migration 016: Đăng ký Tạm trú / Tạm vắng
-- KP25 Smart Community OS
-- ================================================================

-- ── Bảng đăng ký tạm trú ──────────────────────────────────────
-- Người từ nơi khác đến ở tạm trong KP25
CREATE TABLE IF NOT EXISTS dang_ky_tam_tru (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Thông tin người đăng ký
  ho_ten            TEXT        NOT NULL,
  ngay_sinh         DATE,
  gioi_tinh         TEXT        CHECK (gioi_tinh IN ('NAM', 'NU', 'KHAC')),
  so_cccd           TEXT,
  noi_sinh          TEXT,
  quoc_tich         TEXT        NOT NULL DEFAULT 'VN',
  dan_toc           TEXT        DEFAULT 'Kinh',

  -- Địa chỉ thường trú (nơi cư trú gốc)
  dia_chi_thuong_tru TEXT       NOT NULL,
  tinh_thanh_goc     TEXT,

  -- Địa chỉ tạm trú trong KP25
  dia_chi_tam_tru    TEXT       NOT NULL,
  so_nha_tam_tru     TEXT,
  duong_tam_tru      TEXT,

  -- Chủ nhà / chủ cơ sở
  chu_nha_ho_ten     TEXT,
  chu_nha_sdt        TEXT,
  chu_nha_cccd       TEXT,

  -- Lý do và thời gian
  ly_do_tam_tru      TEXT       NOT NULL DEFAULT 'LAM_VIEC'
                     CHECK (ly_do_tam_tru IN ('LAM_VIEC','HOC_TAP','NHAN_VIEC','CHUA_BENH','KINH_DOANH','KHAC')),
  ngay_bat_dau       DATE       NOT NULL,
  ngay_ket_thuc      DATE,

  -- Trạng thái
  trang_thai         TEXT       NOT NULL DEFAULT 'DANG_TAM_TRU'
                     CHECK (trang_thai IN ('DANG_TAM_TRU','HET_HAN','DA_ROI_DI')),

  -- Hành chính
  so_to_khai         TEXT,
  can_bo_tiep_nhan   TEXT,
  ghi_chu            TEXT,

  -- Audit
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at   TIMESTAMPTZ,
  created_by   TEXT,
  updated_by   TEXT
);

-- ── Bảng đăng ký tạm vắng ─────────────────────────────────────
-- Người thuộc KP25 đi vắng tạm thời
CREATE TABLE IF NOT EXISTS dang_ky_tam_vang (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Liên kết hộ dân (nếu có)
  ho_dan_id             UUID        REFERENCES ho_dan(id) ON DELETE SET NULL,
  nhan_khau_id          UUID        REFERENCES nhan_khau(id) ON DELETE SET NULL,

  -- Thông tin người đi vắng
  ho_ten                TEXT        NOT NULL,
  ngay_sinh             DATE,
  gioi_tinh             TEXT        CHECK (gioi_tinh IN ('NAM', 'NU', 'KHAC')),
  so_cccd               TEXT,

  -- Địa chỉ tại KP25 (nơi đang khai báo)
  dia_chi_hien_tai      TEXT        NOT NULL,

  -- Nơi đến tạm vắng
  dia_chi_tam_vang      TEXT        NOT NULL,
  tinh_thanh_den        TEXT,

  -- Lý do và thời gian
  ly_do_tam_vang        TEXT        NOT NULL DEFAULT 'LAM_VIEC'
                        CHECK (ly_do_tam_vang IN ('LAM_VIEC','HOC_TAP','CHUA_BENH','KHU','DU_LICH','THAM_THAN','KHAC')),
  ngay_di               DATE        NOT NULL,
  ngay_du_kien_ve       DATE,
  ngay_thuc_te_ve       DATE,

  -- Liên hệ
  sdt_lien_lac          TEXT,
  sdt_nguoi_than        TEXT,
  ho_ten_nguoi_than     TEXT,

  -- Trạng thái
  trang_thai            TEXT        NOT NULL DEFAULT 'DANG_VANG'
                        CHECK (trang_thai IN ('DANG_VANG','DA_VE','QUA_HAN')),

  -- Hành chính
  can_bo_tiep_nhan      TEXT,
  ghi_chu               TEXT,

  -- Audit
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at   TIMESTAMPTZ,
  created_by   TEXT,
  updated_by   TEXT
);

-- ── Indexes ────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_tam_tru_trang_thai   ON dang_ky_tam_tru(trang_thai)  WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_tam_tru_ho_ten        ON dang_ky_tam_tru(ho_ten)      WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_tam_tru_so_cccd       ON dang_ky_tam_tru(so_cccd)     WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_tam_tru_ngay_kt       ON dang_ky_tam_tru(ngay_ket_thuc) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_tam_vang_trang_thai   ON dang_ky_tam_vang(trang_thai) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_tam_vang_ho_ten        ON dang_ky_tam_vang(ho_ten)    WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_tam_vang_ho_dan_id    ON dang_ky_tam_vang(ho_dan_id)  WHERE deleted_at IS NULL;

-- ── Trigger updated_at tự động ────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_tam_tru_updated_at  ON dang_ky_tam_tru;
DROP TRIGGER IF EXISTS trg_tam_vang_updated_at ON dang_ky_tam_vang;

CREATE TRIGGER trg_tam_tru_updated_at
  BEFORE UPDATE ON dang_ky_tam_tru
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_tam_vang_updated_at
  BEFORE UPDATE ON dang_ky_tam_vang
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── Auto-expire: đánh dấu hết hạn ────────────────────────────
-- Chạy định kỳ hoặc gọi từ ứng dụng
-- UPDATE dang_ky_tam_tru SET trang_thai = 'HET_HAN'
--   WHERE trang_thai = 'DANG_TAM_TRU' AND ngay_ket_thuc < CURRENT_DATE AND ngay_ket_thuc IS NOT NULL AND deleted_at IS NULL;
-- UPDATE dang_ky_tam_vang SET trang_thai = 'QUA_HAN'
--   WHERE trang_thai = 'DANG_VANG' AND ngay_du_kien_ve < CURRENT_DATE AND ngay_du_kien_ve IS NOT NULL AND deleted_at IS NULL;
