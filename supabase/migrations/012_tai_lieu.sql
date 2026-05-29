-- =============================================================
-- KP25 — Migration 012: Module Tài liệu
-- Quản lý văn bản, tài liệu hành chính khu phố
-- =============================================================

CREATE TABLE IF NOT EXISTS tai_lieu (
  id           UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  tieu_de      TEXT    NOT NULL,
  mo_ta        TEXT,
  loai         TEXT    NOT NULL DEFAULT 'KHAC',
  -- NGHI_QUYET | QUYET_DINH | THONG_BAO | BAO_CAO | BIEN_BAN | QUY_CHE | HUONG_DAN | KHAC
  so_hieu      TEXT,               -- Số hiệu văn bản (VD: 12/NQ-KP25)
  nam_ban_hanh INT,                -- Năm ban hành
  nguon        TEXT,               -- Link nguồn hoặc tên nguồn
  file_url     TEXT,               -- URL file (Supabase Storage hoặc Drive)
  file_name    TEXT,               -- Tên file gốc
  file_size    BIGINT,             -- Kích thước bytes
  loai_file    TEXT,               -- pdf | docx | xlsx | ...
  la_cong_khai BOOLEAN DEFAULT TRUE,
  luot_tai     INT     DEFAULT 0,
  tags         TEXT[]  DEFAULT '{}',
  created_by   TEXT,               -- email người tạo
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW(),
  deleted_at   TIMESTAMPTZ
);

-- ── RLS ────────────────────────────────────────────────────────
ALTER TABLE tai_lieu ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tai_lieu_select"      ON tai_lieu;
DROP POLICY IF EXISTS "tai_lieu_service_all" ON tai_lieu;

-- Authenticated users đọc tài liệu công khai
CREATE POLICY "tai_lieu_select" ON tai_lieu
  FOR SELECT TO authenticated
  USING (deleted_at IS NULL);

-- Service role ghi toàn bộ
CREATE POLICY "tai_lieu_service_all" ON tai_lieu
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- ── Indexes ────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_tai_lieu_loai       ON tai_lieu(loai);
CREATE INDEX IF NOT EXISTS idx_tai_lieu_nam        ON tai_lieu(nam_ban_hanh);
CREATE INDEX IF NOT EXISTS idx_tai_lieu_deleted    ON tai_lieu(deleted_at);
CREATE INDEX IF NOT EXISTS idx_tai_lieu_cong_khai  ON tai_lieu(la_cong_khai);
CREATE INDEX IF NOT EXISTS idx_tai_lieu_tieu_de    ON tai_lieu USING gin(tieu_de gin_trgm_ops);

-- ── Trigger updated_at ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_tai_lieu_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_tai_lieu_updated_at ON tai_lieu;
CREATE TRIGGER trg_tai_lieu_updated_at
  BEFORE UPDATE ON tai_lieu
  FOR EACH ROW EXECUTE FUNCTION update_tai_lieu_updated_at();

-- ── Seed một số văn bản mẫu ────────────────────────────────────
INSERT INTO tai_lieu (tieu_de, loai, so_hieu, nam_ban_hanh, mo_ta, la_cong_khai) VALUES
  (
    'Nghị quyết Hội nghị Chi bộ khu phố 25 quý I/2026',
    'NGHI_QUYET', '01/NQ-CB', 2026,
    'Nghị quyết về phương hướng, nhiệm vụ công tác quý I năm 2026 của Chi bộ khu phố 25',
    true
  ),
  (
    'Báo cáo tổng kết công tác an ninh trật tự năm 2025',
    'BAO_CAO', '05/BC-KP25', 2025,
    'Báo cáo tổng kết tình hình an ninh trật tự và phong trào bảo vệ an ninh Tổ quốc năm 2025',
    true
  ),
  (
    'Biên bản họp khu phố tháng 03/2026',
    'BIEN_BAN', '03/BB-KP25', 2026,
    'Biên bản cuộc họp khu phố tháng 03 năm 2026 — bầu ban quản lý và triển khai kế hoạch',
    true
  ),
  (
    'Quy chế hoạt động Ban quản lý khu phố 25',
    'QUY_CHE', '01/QC-KP25', 2026,
    'Quy chế về tổ chức và hoạt động của Ban quản lý khu phố 25, phường Long Trường',
    true
  ),
  (
    'Hướng dẫn đăng ký tạm trú, tạm vắng',
    'HUONG_DAN', '02/HD-KP25', 2026,
    'Hướng dẫn thủ tục khai báo tạm trú, tạm vắng cho hộ gia đình tại khu phố 25',
    true
  )
ON CONFLICT DO NOTHING;
