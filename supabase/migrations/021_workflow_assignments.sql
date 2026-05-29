-- ============================================================
-- Migration 021: Workflow AI — Tự động phân công xử lý
-- Khu phố 25 · Long Trường · TP.HCM
-- ============================================================

-- ─── ENUM trạng thái workflow ─────────────────────────────────
CREATE TYPE trang_thai_workflow AS ENUM (
  'CHO_PHAN_CONG',   -- AI đã phân tích, chờ admin gán cán bộ
  'DA_PHAN_CONG',    -- Đã gán cán bộ, chờ tiếp nhận
  'DANG_XU_LY',      -- Cán bộ đang xử lý
  'HOAN_THANH',      -- Đã hoàn thành
  'QUA_HAN',         -- Quá hạn SLA
  'HUY'              -- Huỷ (phản ánh trùng lặp, không hợp lệ)
);

-- ─── Bảng phân công workflow ──────────────────────────────────
CREATE TABLE workflow_assignments (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Liên kết phản ánh
  phan_anh_id         UUID NOT NULL REFERENCES phan_anh(id) ON DELETE CASCADE,

  -- Kết quả AI phân tích
  ai_tom_tat          TEXT,                   -- Tóm tắt nội dung
  ai_loai             TEXT,                   -- Loại AI đề xuất
  ai_muc_do           TEXT,                   -- Mức độ AI đề xuất
  ai_don_vi_de_xuat   TEXT,                   -- Đơn vị AI đề xuất phụ trách
  ai_huong_xu_ly      TEXT,                   -- Hướng xử lý AI đề xuất
  ai_tags             TEXT[] DEFAULT '{}',    -- Nhãn phân loại
  ai_diem_uu_tien     INTEGER DEFAULT 50,     -- 0-100, điểm ưu tiên AI
  ai_analyzed_at      TIMESTAMPTZ,            -- Thời điểm AI phân tích

  -- Phân công
  don_vi_xu_ly        TEXT,                   -- Đơn vị thực tế phụ trách
  can_bo_phu_trach_id UUID REFERENCES profiles(id),  -- Cán bộ được giao
  phan_cong_boi_id    UUID REFERENCES profiles(id),  -- Admin phân công
  phan_cong_luc       TIMESTAMPTZ,

  -- SLA
  sla_gio             INTEGER DEFAULT 72,     -- Số giờ cho phép xử lý
  han_xu_ly           TIMESTAMPTZ,            -- Deadline = phan_cong_luc + sla_gio

  -- Trạng thái
  trang_thai          trang_thai_workflow NOT NULL DEFAULT 'CHO_PHAN_CONG',

  -- Kết quả
  ghi_chu_phan_cong   TEXT,                   -- Ghi chú khi phân công
  ket_qua_xu_ly       TEXT,                   -- Kết quả sau khi hoàn thành
  hoan_thanh_luc      TIMESTAMPTZ,

  -- Metadata
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at          TIMESTAMPTZ,
  created_by          UUID REFERENCES profiles(id),
  updated_by          UUID REFERENCES profiles(id)
);

-- ─── Lịch sử thay đổi workflow ───────────────────────────────
CREATE TABLE workflow_lich_su (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id       UUID NOT NULL REFERENCES workflow_assignments(id) ON DELETE CASCADE,
  trang_thai_cu       trang_thai_workflow,
  trang_thai_moi      trang_thai_workflow NOT NULL,
  hanh_dong           TEXT NOT NULL,          -- 'PHAN_CONG', 'TIEP_NHAN', 'CAP_NHAT', 'HOAN_THANH', 'QUA_HAN'
  ghi_chu             TEXT,
  nguoi_thuc_hien_id  UUID REFERENCES profiles(id),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Quy tắc phân công tự động ───────────────────────────────
-- Admin cấu hình: loại phản ánh → đơn vị phụ trách → SLA
CREATE TABLE workflow_quy_tac (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  loai_phan_anh   TEXT NOT NULL UNIQUE,   -- AN_NINH, MOI_TRUONG, HA_TANG...
  don_vi          TEXT NOT NULL,          -- Đơn vị phụ trách
  sla_khan_cap    INTEGER NOT NULL DEFAULT 4,    -- giờ
  sla_cao         INTEGER NOT NULL DEFAULT 24,   -- giờ
  sla_trung_binh  INTEGER NOT NULL DEFAULT 72,   -- giờ
  sla_thap        INTEGER NOT NULL DEFAULT 168,  -- giờ (1 tuần)
  mo_ta           TEXT,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Seed quy tắc mặc định ───────────────────────────────────
INSERT INTO workflow_quy_tac
  (loai_phan_anh, don_vi, sla_khan_cap, sla_cao, sla_trung_binh, sla_thap, mo_ta)
VALUES
  ('AN_NINH',    'Công an Khu phố 25',          2,  8,  24, 72,  'Vấn đề an ninh, trật tự, tội phạm'),
  ('MOI_TRUONG', 'Tổ vệ sinh môi trường',        4, 24,  72, 168, 'Rác thải, ô nhiễm, môi trường sống'),
  ('HA_TANG',    'Tổ hạ tầng kỹ thuật',          4, 24,  72, 168, 'Đường sá, đèn đường, cơ sở vật chất'),
  ('AN_SINH',    'Tổ an sinh xã hội',             8, 48, 120, 240, 'Hỗ trợ xã hội, người yếu thế'),
  ('GIAO_THONG', 'Tổ giao thông trật tự đô thị', 2,  8,  48, 120, 'Tắc đường, vi phạm giao thông, bãi đỗ xe'),
  ('KHAC',       'Ban Quản lý Khu phố 25',        8, 48, 120, 240, 'Các vấn đề khác chưa phân loại');

-- ─── Indexes ──────────────────────────────────────────────────
CREATE INDEX idx_workflow_phan_anh    ON workflow_assignments(phan_anh_id);
CREATE INDEX idx_workflow_trang_thai  ON workflow_assignments(trang_thai);
CREATE INDEX idx_workflow_can_bo      ON workflow_assignments(can_bo_phu_trach_id);
CREATE INDEX idx_workflow_han_xu_ly   ON workflow_assignments(han_xu_ly);
CREATE INDEX idx_workflow_created_at  ON workflow_assignments(created_at DESC);
CREATE INDEX idx_workflow_ls_assign   ON workflow_lich_su(assignment_id);

-- ─── Trigger updated_at ───────────────────────────────────────
CREATE TRIGGER trg_workflow_updated_at
  BEFORE UPDATE ON workflow_assignments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_workflow_quy_tac_updated_at
  BEFORE UPDATE ON workflow_quy_tac
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── Tự động ghi lịch sử khi workflow đổi trạng thái ─────────
CREATE OR REPLACE FUNCTION ghi_workflow_lich_su()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.trang_thai IS DISTINCT FROM NEW.trang_thai THEN
    INSERT INTO workflow_lich_su
      (assignment_id, trang_thai_cu, trang_thai_moi, hanh_dong, nguoi_thuc_hien_id)
    VALUES (
      NEW.id,
      OLD.trang_thai,
      NEW.trang_thai,
      CASE NEW.trang_thai
        WHEN 'DA_PHAN_CONG' THEN 'PHAN_CONG'
        WHEN 'DANG_XU_LY'   THEN 'TIEP_NHAN'
        WHEN 'HOAN_THANH'   THEN 'HOAN_THANH'
        WHEN 'QUA_HAN'      THEN 'QUA_HAN'
        WHEN 'HUY'          THEN 'HUY'
        ELSE                     'CAP_NHAT'
      END,
      NEW.updated_by
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_workflow_lich_su
  AFTER UPDATE ON workflow_assignments
  FOR EACH ROW EXECUTE FUNCTION ghi_workflow_lich_su();

-- ─── RLS ──────────────────────────────────────────────────────
ALTER TABLE workflow_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_lich_su     ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_quy_tac     ENABLE ROW LEVEL SECURITY;

-- Cán bộ xem assignment của mình + admin xem tất cả
CREATE POLICY "workflow_read" ON workflow_assignments
  FOR SELECT USING (
    can_bo_phu_trach_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.vai_tro IN ('SUPER_ADMIN','ADMIN_PHUONG','BI_THU','TRUONG_KHU_PHO','CAN_BO')
    )
  );

CREATE POLICY "workflow_insert" ON workflow_assignments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.vai_tro IN ('SUPER_ADMIN','ADMIN_PHUONG','BI_THU','TRUONG_KHU_PHO','CAN_BO')
    )
  );

CREATE POLICY "workflow_update" ON workflow_assignments
  FOR UPDATE USING (
    can_bo_phu_trach_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.vai_tro IN ('SUPER_ADMIN','ADMIN_PHUONG','BI_THU','TRUONG_KHU_PHO')
    )
  );

CREATE POLICY "workflow_lich_su_read" ON workflow_lich_su
  FOR SELECT USING (true);

CREATE POLICY "workflow_quy_tac_read" ON workflow_quy_tac
  FOR SELECT USING (true);

CREATE POLICY "workflow_quy_tac_manage" ON workflow_quy_tac
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.vai_tro IN ('SUPER_ADMIN','ADMIN_PHUONG','BI_THU')
    )
  );

-- ─── Realtime ─────────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE workflow_assignments;
