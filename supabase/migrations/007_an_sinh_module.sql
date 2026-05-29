-- ============================================================
-- KP25 SMART COMMUNITY OS — Module An sinh Xã hội số
-- Migration: 007_an_sinh_module
-- Quy định: Tháng 05/2026 — Khu phố 25, Phường Long Trường, TP.HCM
-- ============================================================

-- ── ENUMS ────────────────────────────────────────────────────

-- Loại đối tượng BHYT (Luật BHYT sửa đổi + Nghị định 146/2018)
CREATE TYPE doi_tuong_bhyt AS ENUM (
  'NGUOI_LAO_DONG_DOANH_NGHIEP',  -- Người lao động doanh nghiệp
  'CAN_BO_CONG_CHUC',             -- CBCC viên chức nhà nước
  'HOC_SINH_SINH_VIEN',           -- Học sinh sinh viên
  'HO_GIA_DINH',                  -- Hộ gia đình (tham gia theo hộ)
  'HO_NGHEO',                     -- Hộ nghèo — Nhà nước đóng 100%
  'CAN_NGHEO',                    -- Cận nghèo — Nhà nước hỗ trợ 70%
  'NGUOI_CAO_TUOI_80',            -- Từ 80 tuổi — miễn phí 100%
  'BHTN',                         -- Người đang hưởng BHTN
  'TRE_EM_DUOI_6',                -- Trẻ em dưới 6 tuổi — miễn phí
  'NGUOI_CO_CONG',                -- Người có công với cách mạng
  'DTTS_VUNG_KHO',                -- Dân tộc thiểu số vùng khó khăn
  'TU_NGUYEN'                     -- Tự nguyện tham gia
);

CREATE TYPE trang_thai_bhyt AS ENUM (
  'CON_HAN',         -- Thẻ còn hiệu lực
  'SAP_HET_HAN',     -- Còn < 30 ngày
  'HET_HAN',         -- Đã hết hạn
  'CHUA_CO'          -- Chưa có thẻ BHYT
);

CREATE TYPE loai_ho_ngheo AS ENUM (
  'NGHEO',           -- Hộ nghèo
  'CAN_NGHEO'        -- Hộ cận nghèo
);

CREATE TYPE trang_thai_ho_ngheo AS ENUM (
  'DANG_HUONG',      -- Đang trong diện hộ nghèo/cận nghèo
  'THOAT_NGHEO',     -- Đã thoát nghèo
  'HET_HAN_XET'      -- Hết thời hạn xét duyệt, chờ xét lại
);

CREATE TYPE suc_khoe_nct AS ENUM (
  'TOT',             -- Sức khỏe tốt, tự sinh hoạt
  'ON_DINH',         -- Ổn định, có hạn chế nhẹ
  'YEU',             -- Yếu, cần hỗ trợ
  'CAN_CHAM_SOC'     -- Cần chăm sóc thường xuyên
);

-- ── BẢNG BHYT ────────────────────────────────────────────────
-- Theo dõi thẻ BHYT của từng nhân khẩu trong KP25
-- Nghị định 146/2018/NĐ-CP, cập nhật 2026

CREATE TABLE bhyt (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Liên kết hộ dân (nullable: BHYT có thể nhập độc lập chờ khớp)
  ho_dan_id        UUID REFERENCES ho_dan(id) ON DELETE SET NULL,

  -- Thông tin chủ thẻ
  ho_ten           TEXT        NOT NULL,
  ngay_sinh        DATE,
  gioi_tinh        TEXT,                  -- NAM | NU | KHAC
  so_cccd          TEXT,

  -- Thông tin thẻ
  ma_the_bhyt      TEXT        UNIQUE,    -- VD: DN4123456789
  doi_tuong        doi_tuong_bhyt NOT NULL DEFAULT 'HO_GIA_DINH',
  noi_dang_ky_kcb  TEXT,                  -- Bệnh viện / Trạm y tế đăng ký KCB ban đầu
  phan_tram_huong  SMALLINT    DEFAULT 80 CHECK (phan_tram_huong BETWEEN 0 AND 100),
                                          -- % chi phí BHYT chi trả (80% hoặc 100% nếu ưu đãi)

  -- Thời hạn thẻ
  han_the_tu       DATE,
  han_the_den      DATE,
  trang_thai       trang_thai_bhyt NOT NULL DEFAULT 'CON_HAN',

  -- Đóng BHYT
  co_quan_dong     TEXT,                  -- Cơ quan/đơn vị đóng BHYT
  muc_dong_thang   DECIMAL(12,0),         -- Mức đóng hàng tháng (VND)

  ghi_chu          TEXT,

  -- Audit
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at       TIMESTAMPTZ,
  created_by       UUID,
  updated_by       UUID
);

-- ── BẢNG HỘ NGHÈO / CẬN NGHÈO ───────────────────────────────
-- Chuẩn nghèo đa chiều 2021-2025 (QĐ 09/2021/QĐ-TTg)
-- Áp dụng đô thị TP.HCM 2026:
--   Nghèo:     ≤ 2.000.000 VND/người/tháng
--   Cận nghèo: 2.000.001 – 3.000.000 VND/người/tháng

CREATE TABLE ho_ngheo (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ho_dan_id          UUID REFERENCES ho_dan(id) ON DELETE CASCADE,

  loai               loai_ho_ngheo NOT NULL,    -- NGHEO | CAN_NGHEO
  trang_thai         trang_thai_ho_ngheo NOT NULL DEFAULT 'DANG_HUONG',

  -- Thông tin xét duyệt
  nam_xet_duyet      SMALLINT    NOT NULL,       -- Năm xét duyệt (VD: 2026)
  quyet_dinh_so      TEXT,                       -- Số quyết định công nhận
  ngay_quyet_dinh    DATE,
  ngay_het_han       DATE,                       -- Thường là 31/12 năm xét duyệt

  -- Tiêu chí xét duyệt
  thu_nhap_bq        DECIMAL(12,0),              -- Thu nhập bình quân/người/tháng (VND)
  so_thanh_vien      SMALLINT,
  ly_do_ngheo        TEXT,                       -- Lý do chính: thiếu đất sx, bệnh tật, ...

  -- Thiếu hụt đa chiều (điền nếu áp dụng tiêu chí mới 2026)
  thieu_y_te         BOOLEAN DEFAULT FALSE,
  thieu_gd           BOOLEAN DEFAULT FALSE,
  thieu_nha_o        BOOLEAN DEFAULT FALSE,
  thieu_nc_vs        BOOLEAN DEFAULT FALSE,      -- Thiếu nước sạch/vệ sinh
  thieu_thong_tin    BOOLEAN DEFAULT FALSE,

  -- Hỗ trợ đang nhận
  ho_tro_bhyt        BOOLEAN DEFAULT TRUE,
  ho_tro_giao_duc    BOOLEAN DEFAULT FALSE,
  ho_tro_nha_o       BOOLEAN DEFAULT FALSE,
  so_tien_ho_tro     DECIMAL(12,0),              -- Trợ cấp hàng tháng (VND)

  -- Thoát nghèo
  ngay_thoat_ngheo   DATE,
  ly_do_thoat_ngheo  TEXT,

  ghi_chu            TEXT,

  -- Audit
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at         TIMESTAMPTZ,
  created_by         UUID,
  updated_by         UUID
);

-- ── BẢNG NGƯỜI CAO TUỔI ──────────────────────────────────────
-- Luật Người cao tuổi 2009, Nghị định 20/2021/NĐ-CP
-- Chế độ 2026:
--   Từ 60 tuổi : ưu tiên KCB, miễn phí dịch vụ văn hóa công
--   Từ 80 tuổi : trợ cấp xã hội nếu không có lương hưu/trợ cấp
--   Mức trợ cấp: ≥ 360.000 VND/tháng (theo QĐ 20/2021, HCMC có thể cao hơn)

CREATE TABLE nguoi_cao_tuoi (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ho_dan_id          UUID REFERENCES ho_dan(id) ON DELETE SET NULL,

  -- Thông tin cá nhân
  ho_ten             TEXT        NOT NULL,
  ngay_sinh          DATE        NOT NULL,
  gioi_tinh          TEXT,
  so_cccd            TEXT,
  dia_chi_day        TEXT,

  -- Sức khỏe & chăm sóc
  tinh_trang_sk      suc_khoe_nct NOT NULL DEFAULT 'ON_DINH',
  benh_man_tinh      TEXT,                       -- Các bệnh mãn tính đang điều trị
  song_co_don        BOOLEAN     DEFAULT FALSE,  -- Sống một mình, không người thân
  co_nguoi_cham_soc  BOOLEAN     DEFAULT TRUE,
  ten_nguoi_cham_soc TEXT,
  sdt_nguoi_cham_soc TEXT,

  -- Phúc lợi đang hưởng
  co_luong_huu       BOOLEAN     DEFAULT FALSE,
  muc_luong_huu      DECIMAL(12,0),
  co_bhyt            BOOLEAN     DEFAULT FALSE,
  ma_the_bhyt        TEXT,                       -- Tham chiếu
  nhan_tro_cap_xh    BOOLEAN     DEFAULT FALSE,  -- Nhận trợ cấp xã hội hàng tháng
  muc_tro_cap_xh     DECIMAL(12,0),              -- Mức trợ cấp (VND/tháng)
  quyet_dinh_tro_cap TEXT,                       -- Số quyết định hưởng trợ cấp

  -- Chế độ đặc biệt
  la_liet_si         BOOLEAN     DEFAULT FALSE,
  la_nguoi_co_cong   BOOLEAN     DEFAULT FALSE,
  la_dtts            BOOLEAN     DEFAULT FALSE,  -- Dân tộc thiểu số

  ghi_chu            TEXT,
  ngay_cap_nhat_sk   DATE,                       -- Ngày cập nhật sức khỏe gần nhất

  -- Audit
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at         TIMESTAMPTZ,
  created_by         UUID,
  updated_by         UUID
);

-- ── INDEXES ──────────────────────────────────────────────────

CREATE INDEX idx_bhyt_ho_dan_id   ON bhyt(ho_dan_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_bhyt_trang_thai  ON bhyt(trang_thai) WHERE deleted_at IS NULL;
CREATE INDEX idx_bhyt_han_the_den ON bhyt(han_the_den) WHERE deleted_at IS NULL;
CREATE INDEX idx_bhyt_doi_tuong   ON bhyt(doi_tuong)   WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX idx_bhyt_ma_the ON bhyt(ma_the_bhyt) WHERE deleted_at IS NULL AND ma_the_bhyt IS NOT NULL;

CREATE INDEX idx_ho_ngheo_ho_dan  ON ho_ngheo(ho_dan_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_ho_ngheo_loai    ON ho_ngheo(loai)      WHERE deleted_at IS NULL;
CREATE INDEX idx_ho_ngheo_nam     ON ho_ngheo(nam_xet_duyet) WHERE deleted_at IS NULL;
CREATE INDEX idx_ho_ngheo_tt      ON ho_ngheo(trang_thai) WHERE deleted_at IS NULL;

CREATE INDEX idx_nct_ho_dan       ON nguoi_cao_tuoi(ho_dan_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_nct_ngay_sinh    ON nguoi_cao_tuoi(ngay_sinh) WHERE deleted_at IS NULL;
CREATE INDEX idx_nct_tro_cap      ON nguoi_cao_tuoi(nhan_tro_cap_xh) WHERE deleted_at IS NULL;

-- ── RLS POLICIES ─────────────────────────────────────────────

ALTER TABLE bhyt           ENABLE ROW LEVEL SECURITY;
ALTER TABLE ho_ngheo       ENABLE ROW LEVEL SECURITY;
ALTER TABLE nguoi_cao_tuoi ENABLE ROW LEVEL SECURITY;

-- BHYT: authenticated read, insert/update/delete
CREATE POLICY "bhyt_select" ON bhyt FOR SELECT TO authenticated USING (deleted_at IS NULL);
CREATE POLICY "bhyt_insert" ON bhyt FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "bhyt_update" ON bhyt FOR UPDATE TO authenticated USING (true);
CREATE POLICY "bhyt_delete" ON bhyt FOR UPDATE TO authenticated USING (true);

-- Hộ nghèo
CREATE POLICY "ho_ngheo_select" ON ho_ngheo FOR SELECT TO authenticated USING (deleted_at IS NULL);
CREATE POLICY "ho_ngheo_insert" ON ho_ngheo FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "ho_ngheo_update" ON ho_ngheo FOR UPDATE TO authenticated USING (true);

-- Người cao tuổi
CREATE POLICY "nct_select" ON nguoi_cao_tuoi FOR SELECT TO authenticated USING (deleted_at IS NULL);
CREATE POLICY "nct_insert" ON nguoi_cao_tuoi FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "nct_update" ON nguoi_cao_tuoi FOR UPDATE TO authenticated USING (true);

-- ── TRIGGER updated_at ───────────────────────────────────────

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

CREATE TRIGGER bhyt_updated_at           BEFORE UPDATE ON bhyt           FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER ho_ngheo_updated_at       BEFORE UPDATE ON ho_ngheo       FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER nguoi_cao_tuoi_updated_at BEFORE UPDATE ON nguoi_cao_tuoi FOR EACH ROW EXECUTE FUNCTION set_updated_at();
