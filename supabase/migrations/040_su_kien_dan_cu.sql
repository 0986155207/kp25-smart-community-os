-- ============================================================
-- Migration 040: Nhật ký sự kiện dân cư (Quick Event Log)
-- Module: Cập nhật nhanh biến động dân cư
-- ============================================================
-- Bảng này là "sổ nhật ký" thống nhất ghi lại MỌI biến động dân cư
-- (sinh, mất, chuyển đến, chuyển đi, tạm trú, tạm vắng, hộ nghèo,
--  thoát nghèo...) bất kể nó tác động đến bảng nào.
-- Mục đích: timeline tập trung + audit + duyệt sự kiện quan trọng.

CREATE TABLE IF NOT EXISTS su_kien_dan_cu (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Loại sự kiện
  loai_su_kien     TEXT NOT NULL CHECK (loai_su_kien IN (
    'SINH',          -- Khai sinh / thêm nhân khẩu mới
    'MAT',           -- Khai tử
    'CHUYEN_DEN',    -- Chuyển đến (nhập thường trú)
    'CHUYEN_DI',     -- Chuyển đi (xóa thường trú)
    'TAM_TRU',       -- Đăng ký tạm trú
    'TAM_VANG',      -- Khai báo tạm vắng
    'VE_THUONG_TRU', -- Trở về thường trú (hết tạm trú/vắng)
    'HO_NGHEO',      -- Công nhận hộ nghèo/cận nghèo
    'THOAT_NGHEO',   -- Thoát nghèo
    'CAP_NHAT',      -- Cập nhật thông tin khác
    'KET_HON',       -- Kết hôn
    'KHAC'           -- Khác
  )),

  -- Liên kết (có thể null nếu chỉ ghi nhận chung)
  ho_id            UUID REFERENCES ho_dan(id)    ON DELETE SET NULL,
  nhan_khau_id     UUID REFERENCES nhan_khau(id) ON DELETE SET NULL,

  -- Snapshot thông tin (giữ lại kể cả khi bản ghi gốc bị xóa)
  ho_ten           TEXT,                 -- Tên người liên quan
  dia_chi          TEXT,                 -- Địa chỉ snapshot
  mo_ta            TEXT NOT NULL,        -- Mô tả sự kiện (tiếng Việt rõ ràng)
  du_lieu          JSONB DEFAULT '{}',   -- Dữ liệu chi tiết (ngày, lý do...)

  -- Trạng thái duyệt
  trang_thai       TEXT NOT NULL DEFAULT 'DA_DUYET' CHECK (trang_thai IN (
    'CHO_DUYET',     -- Chờ cán bộ cấp trên duyệt
    'DA_DUYET',      -- Đã duyệt / áp dụng
    'TU_CHOI'        -- Từ chối
  )),

  -- Người ghi nhận / duyệt
  can_bo_ghi_id    UUID,
  can_bo_ghi_ten   TEXT,
  can_bo_duyet_id  UUID,
  can_bo_duyet_ten TEXT,
  ngay_duyet       TIMESTAMPTZ,
  ly_do_tu_choi    TEXT,

  -- Thời gian sự kiện thực tế (khác với created_at = lúc ghi nhận)
  ngay_su_kien     DATE NOT NULL DEFAULT CURRENT_DATE,

  -- Metadata
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at       TIMESTAMPTZ
);

-- ── Indexes ─────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_skdc_loai        ON su_kien_dan_cu (loai_su_kien)  WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_skdc_ho          ON su_kien_dan_cu (ho_id)          WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_skdc_nhan_khau   ON su_kien_dan_cu (nhan_khau_id)   WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_skdc_trang_thai  ON su_kien_dan_cu (trang_thai)     WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_skdc_ngay        ON su_kien_dan_cu (ngay_su_kien DESC);
CREATE INDEX IF NOT EXISTS idx_skdc_created     ON su_kien_dan_cu (created_at DESC);

-- ── Trigger updated_at ──────────────────────────────────────
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'set_updated_at') THEN
    DROP TRIGGER IF EXISTS trg_skdc_updated_at ON su_kien_dan_cu;
    CREATE TRIGGER trg_skdc_updated_at
      BEFORE UPDATE ON su_kien_dan_cu
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
END $$;

-- ── RLS ─────────────────────────────────────────────────────
ALTER TABLE su_kien_dan_cu ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='su_kien_dan_cu' AND policyname='skdc_all') THEN
    CREATE POLICY "skdc_all" ON su_kien_dan_cu FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- ── Realtime ────────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'su_kien_dan_cu'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE su_kien_dan_cu;
  END IF;
END $$;

-- ── Comments ────────────────────────────────────────────────
COMMENT ON TABLE  su_kien_dan_cu IS 'Sổ nhật ký thống nhất ghi lại mọi biến động dân cư tại Khu phố 25';
COMMENT ON COLUMN su_kien_dan_cu.du_lieu       IS 'JSONB chứa dữ liệu chi tiết tùy loại sự kiện';
COMMENT ON COLUMN su_kien_dan_cu.ngay_su_kien  IS 'Ngày sự kiện thực tế xảy ra (khác created_at = lúc ghi nhận)';
