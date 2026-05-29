-- =============================================================
-- KP25 — Migration 011: RBAC Cán bộ Khu phố
-- Tạo bảng can_bo + seed 5 cán bộ chính thức
-- =============================================================

-- ── Bảng cán bộ khu phố ────────────────────────────────────
CREATE TABLE IF NOT EXISTS can_bo (
  id            UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT    NOT NULL UNIQUE,
  ho_ten        TEXT    NOT NULL,
  vai_tro       TEXT    NOT NULL,   -- BI_THU | TRUONG_KHU_PHO | CONG_AN | AN_NINH | PHU_TRACH_NCT
  chuc_vu       TEXT,               -- Tên hiển thị chức vụ
  so_dien_thoai TEXT,
  ghi_chu       TEXT,
  hoat_dong     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── RLS ────────────────────────────────────────────────────
ALTER TABLE can_bo ENABLE ROW LEVEL SECURITY;

-- Xoá policy cũ nếu đã tồn tại trước khi tạo lại
DROP POLICY IF EXISTS "can_bo_select"      ON can_bo;
DROP POLICY IF EXISTS "can_bo_service_all" ON can_bo;

-- Authenticated users có thể đọc danh sách cán bộ
CREATE POLICY "can_bo_select" ON can_bo
  FOR SELECT TO authenticated
  USING (true);

-- Chỉ service_role mới được ghi (dùng trong server actions)
CREATE POLICY "can_bo_service_all" ON can_bo
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- ── Index ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_can_bo_email    ON can_bo(email);
CREATE INDEX IF NOT EXISTS idx_can_bo_vai_tro  ON can_bo(vai_tro);
CREATE INDEX IF NOT EXISTS idx_can_bo_hoat_dong ON can_bo(hoat_dong);

-- ── Seed 5 cán bộ chính thức ───────────────────────────────
INSERT INTO can_bo (email, ho_ten, vai_tro, chuc_vu, so_dien_thoai) VALUES
  (
    'phantantai.kp25@gmail.com',
    'Phan Tấn Tài',
    'BI_THU',
    'Bí thư chi bộ',
    NULL
  ),
  (
    'hongthuykp25@gmail.com',
    'Nguyễn Thị Hồng Thủy',
    'TRUONG_KHU_PHO',
    'Trưởng khu phố',
    NULL
  ),
  (
    'tranhuhung.kp25@gmail.com',
    'Trần Hữu Hùng',
    'CONG_AN',
    'Công an khu vực',
    NULL
  ),
  (
    'maingocrhan.kp25@gmail.com',
    'Mai Ngọc Nhân',
    'AN_NINH',
    'An ninh khu phố',
    NULL
  ),
  (
    'maithanxuan.kp25@gmail.com',
    'Mai Thị Thanh Xuân',
    'PHU_TRACH_NCT',
    'Phụ trách NCT',
    NULL
  )
ON CONFLICT (email) DO UPDATE SET
  ho_ten   = EXCLUDED.ho_ten,
  vai_tro  = EXCLUDED.vai_tro,
  chuc_vu  = EXCLUDED.chuc_vu;

-- ── Trigger updated_at ─────────────────────────────────────
CREATE OR REPLACE FUNCTION update_can_bo_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_can_bo_updated_at ON can_bo;
CREATE TRIGGER trg_can_bo_updated_at
  BEFORE UPDATE ON can_bo
  FOR EACH ROW EXECUTE FUNCTION update_can_bo_updated_at();
