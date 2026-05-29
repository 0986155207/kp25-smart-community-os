-- ================================================================
-- Migration 017: Module Sự kiện Khu phố 25
-- ================================================================

CREATE TABLE IF NOT EXISTS su_kien (
  id                          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Nội dung chính
  tieu_de                     TEXT        NOT NULL,
  mo_ta                       TEXT,
  noi_dung_day_du             TEXT,                        -- Rich text / Markdown

  -- Phân loại
  loai                        TEXT        NOT NULL DEFAULT 'KHAC'
                              CHECK (loai IN (
                                'CHINH_TRI','VAN_HOA','THE_THAO',
                                'TU_THIEN','HOP_MAT','AN_NINH',
                                'SUCK_KHOE','GIAO_DUC','KHAC'
                              )),

  -- Trạng thái
  trang_thai                  TEXT        NOT NULL DEFAULT 'SAP_DIEN_RA'
                              CHECK (trang_thai IN (
                                'NHAP','SAP_DIEN_RA','DANG_DIEN_RA',
                                'DA_KET_THUC','HUY'
                              )),

  -- Thời gian
  ngay_bat_dau                TIMESTAMPTZ NOT NULL,
  ngay_ket_thuc               TIMESTAMPTZ,

  -- Địa điểm
  dia_diem                    TEXT        NOT NULL,        -- Tên địa điểm
  dia_chi_cu_the              TEXT,                        -- Địa chỉ đầy đủ

  -- Hình ảnh
  anh_bia_url                 TEXT,

  -- Tham gia
  so_luong_du_kien            INTEGER,                     -- Số người dự kiến tham dự
  so_luong_thuc_te            INTEGER,                     -- Số thực tế
  can_dang_ky                 BOOLEAN     NOT NULL DEFAULT FALSE,
  han_dang_ky                 TIMESTAMPTZ,

  -- Ban tổ chức
  don_vi_to_chuc              TEXT        DEFAULT 'Ban điều hành KP25',
  nguoi_phu_trach             TEXT,
  sdt_lien_he                 TEXT,

  -- Nổi bật & ghim
  noi_bat                     BOOLEAN     NOT NULL DEFAULT FALSE,

  -- Ghi chú nội bộ
  ghi_chu                     TEXT,

  -- Audit
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at   TIMESTAMPTZ,
  created_by   TEXT,
  updated_by   TEXT
);

-- Bảng đăng ký tham dự (nếu can_dang_ky = true)
CREATE TABLE IF NOT EXISTS dang_ky_su_kien (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  su_kien_id      UUID        NOT NULL REFERENCES su_kien(id) ON DELETE CASCADE,
  ho_dan_id       UUID        REFERENCES ho_dan(id) ON DELETE SET NULL,
  ho_ten          TEXT        NOT NULL,
  so_dien_thoai   TEXT,
  so_nguoi        INTEGER     NOT NULL DEFAULT 1,
  ghi_chu         TEXT,
  trang_thai      TEXT        NOT NULL DEFAULT 'CHO_XAC_NHAN'
                  CHECK (trang_thai IN ('CHO_XAC_NHAN','DA_XAC_NHAN','VANG_MAT','HUY')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Indexes ────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_su_kien_trang_thai    ON su_kien(trang_thai)    WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_su_kien_loai          ON su_kien(loai)          WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_su_kien_ngay_bd       ON su_kien(ngay_bat_dau)  WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_dang_ky_sk_su_kien_id ON dang_ky_su_kien(su_kien_id);

-- ── Trigger updated_at ────────────────────────────────────────
DROP TRIGGER IF EXISTS trg_su_kien_updated_at ON su_kien;
CREATE TRIGGER trg_su_kien_updated_at
  BEFORE UPDATE ON su_kien
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── Auto-update trạng thái theo thời gian ─────────────────────
-- UPDATE su_kien SET trang_thai = 'DANG_DIEN_RA'
--   WHERE trang_thai = 'SAP_DIEN_RA' AND ngay_bat_dau <= NOW() AND (ngay_ket_thuc IS NULL OR ngay_ket_thuc > NOW()) AND deleted_at IS NULL;
-- UPDATE su_kien SET trang_thai = 'DA_KET_THUC'
--   WHERE trang_thai IN ('SAP_DIEN_RA','DANG_DIEN_RA') AND ngay_ket_thuc < NOW() AND deleted_at IS NULL;
