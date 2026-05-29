-- ============================================================
-- KP25 SMART COMMUNITY OS — Database Schema
-- Khu phố 25, Phường Long Trường, TP.HCM
-- Migration: 001_initial_schema
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE vai_tro AS ENUM (
  'SUPER_ADMIN',
  'ADMIN_PHUONG',
  'BI_THU',
  'TRUONG_KHU_PHO',
  'CONG_AN',
  'DOAN_THE',
  'CAN_BO',
  'NGUOI_DAN'
);

CREATE TYPE trang_thai_ho AS ENUM (
  'THUONG_TRU',
  'TAM_TRU',
  'TAM_VANG'
);

CREATE TYPE gioi_tinh AS ENUM (
  'NAM',
  'NU',
  'KHAC'
);

CREATE TYPE loai_phan_anh AS ENUM (
  'AN_NINH',
  'MOI_TRUONG',
  'HA_TANG',
  'AN_SINH',
  'GIAO_THONG',
  'KHAC'
);

CREATE TYPE trang_thai_phan_anh AS ENUM (
  'MOI',
  'DANG_XU_LY',
  'CHO_PHAN_HOI',
  'DA_XU_LY',
  'DONG'
);

CREATE TYPE muc_do_uu_tien AS ENUM (
  'KHAN_CAP',
  'CAO',
  'TRUNG_BINH',
  'THAP'
);

-- ============================================================
-- PROFILES (mở rộng Supabase Auth)
-- ============================================================

CREATE TABLE profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  ho_ten        TEXT NOT NULL,
  so_dien_thoai TEXT UNIQUE,
  email         TEXT,
  vai_tro       vai_tro NOT NULL DEFAULT 'NGUOI_DAN',
  avatar_url    TEXT,
  ho_id         UUID,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at    TIMESTAMPTZ,
  created_by    UUID,
  updated_by    UUID
);

-- ============================================================
-- HỘ DÂN
-- ============================================================

CREATE TABLE ho_dan (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ma_ho         TEXT UNIQUE NOT NULL,
  chu_ho        TEXT NOT NULL,
  dia_chi_day   TEXT NOT NULL,
  so_nha        TEXT,
  duong         TEXT,
  to_truong     TEXT,
  so_dien_thoai TEXT,
  email         TEXT,
  trang_thai    trang_thai_ho NOT NULL DEFAULT 'THUONG_TRU',
  so_nhan_khau  INTEGER NOT NULL DEFAULT 0,
  ghi_chu       TEXT,
  toa_do_lat    DECIMAL(10, 8),
  toa_do_lng    DECIMAL(11, 8),
  qr_code       TEXT UNIQUE,
  qr_token      TEXT UNIQUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at    TIMESTAMPTZ,
  created_by    UUID REFERENCES profiles(id),
  updated_by    UUID REFERENCES profiles(id)
);

CREATE INDEX idx_ho_dan_ma_ho ON ho_dan(ma_ho);
CREATE INDEX idx_ho_dan_chu_ho ON ho_dan USING gin(chu_ho gin_trgm_ops);
CREATE INDEX idx_ho_dan_trang_thai ON ho_dan(trang_thai);
CREATE INDEX idx_ho_dan_deleted_at ON ho_dan(deleted_at);

-- ============================================================
-- NHÂN KHẨU
-- ============================================================

CREATE TABLE nhan_khau (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ho_id               UUID NOT NULL REFERENCES ho_dan(id) ON DELETE CASCADE,
  ho_ten              TEXT NOT NULL,
  ngay_sinh           DATE,
  gioi_tinh           gioi_tinh NOT NULL DEFAULT 'NAM',
  cccd                TEXT UNIQUE,
  cmnd                TEXT,
  quan_he             TEXT NOT NULL DEFAULT 'Chủ hộ',
  nghe_nghiep         TEXT,
  trinh_do_hoc_van    TEXT,
  so_dien_thoai       TEXT,
  email               TEXT,
  trang_thai          TEXT NOT NULL DEFAULT 'THUONG_TRU',
  ghi_chu             TEXT,
  profile_id          UUID REFERENCES profiles(id),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at          TIMESTAMPTZ,
  created_by          UUID REFERENCES profiles(id),
  updated_by          UUID REFERENCES profiles(id)
);

CREATE INDEX idx_nhan_khau_ho_id ON nhan_khau(ho_id);
CREATE INDEX idx_nhan_khau_ho_ten ON nhan_khau USING gin(ho_ten gin_trgm_ops);
CREATE INDEX idx_nhan_khau_cccd ON nhan_khau(cccd);

-- ============================================================
-- PHẢN ÁNH HIỆN TRƯỜNG
-- ============================================================

CREATE TABLE phan_anh (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tieu_de           TEXT NOT NULL,
  mo_ta             TEXT NOT NULL,
  loai              loai_phan_anh NOT NULL DEFAULT 'KHAC',
  muc_do            muc_do_uu_tien NOT NULL DEFAULT 'TRUNG_BINH',
  trang_thai        trang_thai_phan_anh NOT NULL DEFAULT 'MOI',
  dia_chi_phan_anh  TEXT,
  toa_do_lat        DECIMAL(10, 8),
  toa_do_lng        DECIMAL(11, 8),
  anh_urls          TEXT[] DEFAULT '{}',
  video_urls        TEXT[] DEFAULT '{}',
  nguoi_gui_id      UUID REFERENCES profiles(id),
  nguoi_gui_ten     TEXT,
  nguoi_gui_sdt     TEXT,
  can_bo_xu_ly_id   UUID REFERENCES profiles(id),
  thoi_gian_xu_ly   TIMESTAMPTZ,
  ket_qua_xu_ly     TEXT,
  ai_danh_gia       TEXT,
  ai_phan_loai      loai_phan_anh,
  sla_deadline      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at        TIMESTAMPTZ,
  created_by        UUID REFERENCES profiles(id),
  updated_by        UUID REFERENCES profiles(id)
);

CREATE INDEX idx_phan_anh_trang_thai ON phan_anh(trang_thai);
CREATE INDEX idx_phan_anh_loai ON phan_anh(loai);
CREATE INDEX idx_phan_anh_muc_do ON phan_anh(muc_do);
CREATE INDEX idx_phan_anh_created_at ON phan_anh(created_at DESC);
CREATE INDEX idx_phan_anh_can_bo ON phan_anh(can_bo_xu_ly_id);

-- Lịch sử xử lý phản ánh
CREATE TABLE phan_anh_lich_su (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phan_anh_id     UUID NOT NULL REFERENCES phan_anh(id) ON DELETE CASCADE,
  trang_thai_cu   trang_thai_phan_anh,
  trang_thai_moi  trang_thai_phan_anh NOT NULL,
  ghi_chu         TEXT,
  can_bo_id       UUID REFERENCES profiles(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- THÔNG BÁO
-- ============================================================

CREATE TABLE thong_bao (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tieu_de               TEXT NOT NULL,
  noi_dung              TEXT NOT NULL,
  loai                  TEXT NOT NULL DEFAULT 'THONG_BAO_CHUNG',
  anh_url               TEXT,
  file_dinh_kem_urls    TEXT[] DEFAULT '{}',
  nguoi_tao_id          UUID REFERENCES profiles(id),
  da_gui_push           BOOLEAN NOT NULL DEFAULT false,
  da_gui_zalo           BOOLEAN NOT NULL DEFAULT false,
  da_gui_sms            BOOLEAN NOT NULL DEFAULT false,
  luot_xem              INTEGER NOT NULL DEFAULT 0,
  ghim_len              BOOLEAN NOT NULL DEFAULT false,
  ngay_het_han          TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at            TIMESTAMPTZ,
  created_by            UUID REFERENCES profiles(id),
  updated_by            UUID REFERENCES profiles(id)
);

CREATE INDEX idx_thong_bao_created_at ON thong_bao(created_at DESC);
CREATE INDEX idx_thong_bao_ghim ON thong_bao(ghim_len);
CREATE INDEX idx_thong_bao_loai ON thong_bao(loai);

-- ============================================================
-- SỰ KIỆN
-- ============================================================

CREATE TABLE su_kien (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tieu_de         TEXT NOT NULL,
  mo_ta           TEXT,
  dia_diem        TEXT,
  thoi_gian_bat_dau TIMESTAMPTZ NOT NULL,
  thoi_gian_ket_thuc TIMESTAMPTZ,
  anh_url         TEXT,
  nguoi_to_chuc   TEXT,
  so_luong_tham_gia INTEGER,
  is_public       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ,
  created_by      UUID REFERENCES profiles(id),
  updated_by      UUID REFERENCES profiles(id)
);

-- ============================================================
-- AI CHAT
-- ============================================================

CREATE TABLE chat_sessions (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nguoi_dung_id UUID REFERENCES profiles(id),
  session_token TEXT UNIQUE,
  tieu_de       TEXT NOT NULL DEFAULT 'Hội thoại mới',
  metadata      JSONB DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE chat_messages (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id  UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  vai_tro     TEXT NOT NULL CHECK (vai_tro IN ('user', 'assistant')),
  noi_dung    TEXT NOT NULL,
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_chat_messages_session ON chat_messages(session_id);
CREATE INDEX idx_chat_sessions_nguoi_dung ON chat_sessions(nguoi_dung_id);

-- ============================================================
-- AUDIT LOGS
-- ============================================================

CREATE TABLE audit_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bang        TEXT NOT NULL,
  hanh_dong   TEXT NOT NULL,
  ban_ghi_id  TEXT,
  gia_tri_cu  JSONB,
  gia_tri_moi JSONB,
  nguoi_dung_id UUID REFERENCES profiles(id),
  ip_address  INET,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_bang ON audit_logs(bang);
CREATE INDEX idx_audit_logs_nguoi_dung ON audit_logs(nguoi_dung_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_ho_dan_updated_at
  BEFORE UPDATE ON ho_dan
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_nhan_khau_updated_at
  BEFORE UPDATE ON nhan_khau
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_phan_anh_updated_at
  BEFORE UPDATE ON phan_anh
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_thong_bao_updated_at
  BEFORE UPDATE ON thong_bao
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto tính số nhân khẩu trong hộ
CREATE OR REPLACE FUNCTION cap_nhat_so_nhan_khau()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE ho_dan
  SET so_nhan_khau = (
    SELECT COUNT(*) FROM nhan_khau
    WHERE ho_id = COALESCE(NEW.ho_id, OLD.ho_id)
    AND deleted_at IS NULL
  )
  WHERE id = COALESCE(NEW.ho_id, OLD.ho_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_nhan_khau_so_luong
  AFTER INSERT OR UPDATE OR DELETE ON nhan_khau
  FOR EACH ROW EXECUTE FUNCTION cap_nhat_so_nhan_khau();

-- Auto tạo profile khi user đăng ký
CREATE OR REPLACE FUNCTION xu_ly_dang_ky_moi()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, ho_ten, email, so_dien_thoai)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'ho_ten', 'Người dùng'),
    NEW.email,
    NEW.phone
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_auth_dang_ky_moi
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION xu_ly_dang_ky_moi();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ho_dan ENABLE ROW LEVEL SECURITY;
ALTER TABLE nhan_khau ENABLE ROW LEVEL SECURITY;
ALTER TABLE phan_anh ENABLE ROW LEVEL SECURITY;
ALTER TABLE thong_bao ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Profiles: tự xem profile mình, admin xem tất cả
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_select_admin" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.vai_tro IN ('SUPER_ADMIN', 'ADMIN_PHUONG', 'BI_THU', 'TRUONG_KHU_PHO', 'CAN_BO')
    )
  );

-- Thông báo: ai cũng đọc được
CREATE POLICY "thong_bao_public_read" ON thong_bao
  FOR SELECT USING (deleted_at IS NULL);

-- Phản ánh: người gửi xem của mình, cán bộ xem tất cả
CREATE POLICY "phan_anh_own_read" ON phan_anh
  FOR SELECT USING (
    nguoi_gui_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.vai_tro IN ('SUPER_ADMIN', 'ADMIN_PHUONG', 'BI_THU', 'TRUONG_KHU_PHO', 'CONG_AN', 'CAN_BO')
    )
  );

CREATE POLICY "phan_anh_insert" ON phan_anh
  FOR INSERT WITH CHECK (true);

-- Chat: chỉ xem session của mình
CREATE POLICY "chat_sessions_own" ON chat_sessions
  FOR ALL USING (nguoi_dung_id = auth.uid() OR nguoi_dung_id IS NULL);

CREATE POLICY "chat_messages_own" ON chat_messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM chat_sessions cs
      WHERE cs.id = chat_messages.session_id
      AND (cs.nguoi_dung_id = auth.uid() OR cs.nguoi_dung_id IS NULL)
    )
  );

-- ============================================================
-- SEED DATA MẪU
-- ============================================================

-- Thông báo mẫu
INSERT INTO thong_bao (tieu_de, noi_dung, loai, ghim_len, luot_xem) VALUES
(
  'Họp khu phố định kỳ tháng 6/2026',
  'Kính mời toàn thể bà con nhân dân Khu phố 25 tham dự buổi họp khu phố định kỳ tháng 6/2026. Thời gian: 19h00 ngày 15/06/2026. Địa điểm: Nhà văn hóa Khu phố 25. Nội dung: Thông báo tình hình kinh tế - xã hội, an ninh trật tự, vệ sinh môi trường và triển khai các nhiệm vụ tháng tới.',
  'HOP_KHU_PHO',
  true,
  156
),
(
  'Thông báo thu phí vệ sinh môi trường tháng 6/2026',
  'Ban Quản lý Khu phố 25 thông báo đến bà con nhân dân về việc thu phí vệ sinh môi trường tháng 6/2026. Thời gian thu: từ ngày 01/06 đến 15/06/2026. Mức phí: 30.000đ/hộ/tháng. Bà con vui lòng đóng đúng thời gian quy định.',
  'THONG_BAO_CHUNG',
  false,
  89
),
(
  'Khu phố 25 ra mắt Hệ thống chuyển đổi số KP25 Smart Community',
  'Nhằm nâng cao chất lượng phục vụ nhân dân và hiện đại hóa quản lý khu phố, Ban lãnh đạo Khu phố 25 chính thức ra mắt Hệ thống số KP25 Smart Community OS. Người dân có thể sử dụng các tiện ích: phản ánh hiện trường, tra cứu thông tin, nhận thông báo, tương tác với AI hỗ trợ 24/7.',
  'THONG_BAO_CHUNG',
  true,
  312
);
