-- ─────────────────────────────────────────────────────────────────
-- Migration 037: Bảng hồ sơ thủ tục hành chính
-- Module: Thủ tục hành chính (cổng dân cư)
-- Ngày: 2026-05-29
-- ─────────────────────────────────────────────────────────────────

-- ── Bảng hồ sơ thủ tục ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ho_so_thu_tuc (
  id                    uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  ma_ho_so              text        NOT NULL UNIQUE,           -- KP25-2026-XXXXXX
  thu_tuc_id            text        NOT NULL,                  -- ID từ data.ts (ht-001, ct-002...)
  thu_tuc_ten           text        NOT NULL,                  -- Tên thủ tục snapshot

  -- Thông tin người nộp
  ho_ten                text        NOT NULL,
  cccd                  text        NOT NULL,
  sdt                   text        NOT NULL,
  email                 text,
  dia_chi               text,                                  -- Địa chỉ nhận kết quả
  ghi_chu_nguoi_nop     text,                                  -- Ghi chú từ người nộp

  -- Trạng thái xử lý
  trang_thai            text        NOT NULL DEFAULT 'TIEP_NHAN'
                        CHECK (trang_thai IN (
                          'TIEP_NHAN',
                          'DANG_XU_LY',
                          'CHO_BO_SUNG',
                          'DA_DUYET',
                          'TU_CHOI',
                          'DA_TRA'
                        )),

  -- Thông tin từ cán bộ xử lý
  can_bo_xu_ly_id       uuid        REFERENCES can_bo(id) ON DELETE SET NULL,
  ghi_chu_can_bo        text,
  can_chuan_bi_bo_sung  text[],                                -- Danh sách giấy tờ cần bổ sung

  -- Thời gian
  ngay_hen_tra          timestamptz,                           -- Ngày dự kiến trả kết quả
  ngay_tra_thuc_te      timestamptz,                           -- Ngày trả thực tế

  -- Metadata
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),
  deleted_at            timestamptz,
  created_by            text,
  updated_by            uuid
);

-- ── Indexes ─────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_ho_so_thu_tuc_ma        ON ho_so_thu_tuc (ma_ho_so);
CREATE INDEX IF NOT EXISTS idx_ho_so_thu_tuc_cccd      ON ho_so_thu_tuc (cccd) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_ho_so_thu_tuc_trang_thai ON ho_so_thu_tuc (trang_thai) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_ho_so_thu_tuc_thu_tuc   ON ho_so_thu_tuc (thu_tuc_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_ho_so_thu_tuc_created   ON ho_so_thu_tuc (created_at DESC);

-- ── Trigger auto-update updated_at ──────────────────────────────
CREATE OR REPLACE TRIGGER trg_ho_so_thu_tuc_updated_at
  BEFORE UPDATE ON ho_so_thu_tuc
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── RLS ─────────────────────────────────────────────────────────
ALTER TABLE ho_so_thu_tuc ENABLE ROW LEVEL SECURITY;

-- Công khai: bất kỳ ai cũng có thể INSERT (nộp hồ sơ mới)
CREATE POLICY "ho_so_thu_tuc_insert_public"
  ON ho_so_thu_tuc FOR INSERT
  WITH CHECK (true);

-- Tra cứu: chỉ đọc bằng mã hồ sơ hoặc CCCD của chính mình (anon)
CREATE POLICY "ho_so_thu_tuc_select_by_ma_or_cccd"
  ON ho_so_thu_tuc FOR SELECT
  USING (deleted_at IS NULL);

-- Cán bộ: xem và cập nhật tất cả hồ sơ
CREATE POLICY "ho_so_thu_tuc_canbo_all"
  ON ho_so_thu_tuc FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM can_bo WHERE deleted_at IS NULL AND trang_thai = 'HOAT_DONG'
    )
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM can_bo WHERE deleted_at IS NULL AND trang_thai = 'HOAT_DONG'
    )
  );

-- ── Audit log trigger ────────────────────────────────────────────
CREATE OR REPLACE FUNCTION audit_ho_so_thu_tuc_changes()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.trang_thai IS DISTINCT FROM NEW.trang_thai THEN
    INSERT INTO audit_logs (
      bang, hanh_dong, ban_ghi_id, du_lieu_cu, du_lieu_moi, thuc_hien_boi
    ) VALUES (
      'ho_so_thu_tuc',
      'CAP_NHAT_TRANG_THAI',
      NEW.id,
      jsonb_build_object('trang_thai', OLD.trang_thai),
      jsonb_build_object('trang_thai', NEW.trang_thai, 'ghi_chu', NEW.ghi_chu_can_bo),
      auth.uid()
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_audit_ho_so_thu_tuc
  AFTER UPDATE ON ho_so_thu_tuc
  FOR EACH ROW EXECUTE FUNCTION audit_ho_so_thu_tuc_changes();

-- ── Realtime ─────────────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE ho_so_thu_tuc;

-- ── Dữ liệu mẫu (dev/staging) ───────────────────────────────────
INSERT INTO ho_so_thu_tuc (
  ma_ho_so, thu_tuc_id, thu_tuc_ten,
  ho_ten, cccd, sdt, email,
  trang_thai, ngay_hen_tra, ghi_chu_can_bo
) VALUES
  (
    'KP25-2026-100001', 'ht-001', 'Đăng ký khai sinh',
    'Nguyễn Thị Mai', '079087654321', '0912345678', 'mai@gmail.com',
    'DANG_XU_LY',
    now() + interval '3 days',
    'Hồ sơ đang được cán bộ hộ tịch kiểm tra'
  ),
  (
    'KP25-2026-100002', 'ct-001', 'Đăng ký thường trú',
    'Trần Văn Bình', '079012345678', '0987654321', null,
    'CHO_BO_SUNG',
    now() + interval '5 days',
    'Thiếu giấy tờ nhà ở'
  ),
  (
    'KP25-2026-100003', 'ht-003', 'Đăng ký kết hôn',
    'Lê Thị Hoa', '079098765432', '0901234567', 'hoa@gmail.com',
    'DA_DUYET',
    now() + interval '2 days',
    'Đã duyệt, mời đến UBND Phường để nhận Giấy chứng nhận kết hôn'
  ),
  (
    'KP25-2026-100004', 'ctt-001', 'Chứng thực bản sao từ bản chính',
    'Phạm Quốc Hùng', '079056789012', '0908765432', null,
    'DA_TRA',
    null,
    'Đã trả kết quả ngày hôm nay'
  )
ON CONFLICT (ma_ho_so) DO NOTHING;

-- ── Comments ────────────────────────────────────────────────────
COMMENT ON TABLE  ho_so_thu_tuc IS 'Hồ sơ thủ tục hành chính do người dân nộp qua cổng Portal KP25';
COMMENT ON COLUMN ho_so_thu_tuc.ma_ho_so              IS 'Mã hồ sơ duy nhất — dạng KP25-YYYY-XXXXXX';
COMMENT ON COLUMN ho_so_thu_tuc.thu_tuc_id             IS 'ID tham chiếu đến danh sách thủ tục tĩnh trong data.ts';
COMMENT ON COLUMN ho_so_thu_tuc.can_chuan_bi_bo_sung   IS 'Mảng tên giấy tờ người dân cần bổ sung (khi trang_thai = CHO_BO_SUNG)';
COMMENT ON COLUMN ho_so_thu_tuc.ngay_hen_tra           IS 'Ngày dự kiến trả kết quả (tính theo ngày làm việc)';
