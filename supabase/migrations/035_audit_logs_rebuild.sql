-- ============================================================
-- 035: Audit Logs — Rebuild bảng nhật ký hoạt động
-- Tương thích hệ thống can_bo (không dùng profiles)
-- ============================================================

-- Xóa bảng cũ (chưa có data thực, schema cũ sai reference)
DROP TABLE IF EXISTS public.audit_logs CASCADE;

-- ── Bảng nhật ký hoạt động ───────────────────────────────────
CREATE TABLE public.audit_logs (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Hành động thực hiện
  hanh_dong     TEXT        NOT NULL,
  -- Các giá trị: DANG_NHAP | DANG_XUAT | TAO | CAP_NHAT | XOA | XUAT_KHAU | XEM_CHI_TIET | GUI_THONG_BAO

  -- Bảng dữ liệu bị ảnh hưởng
  bang          TEXT,
  -- Ví dụ: phan_anh | ho_dan | thong_bao | su_kien | can_bo | bhyt | ho_ngheo

  -- ID bản ghi bị ảnh hưởng
  ban_ghi_id    TEXT,

  -- Mô tả ngắn tiếng Việt — hiển thị trực tiếp
  mo_ta         TEXT        NOT NULL,

  -- Giá trị trước/sau (cho UPDATE)
  gia_tri_cu    JSONB,
  gia_tri_moi   JSONB,

  -- Cán bộ thực hiện (denormalized để không mất log khi xóa cán bộ)
  can_bo_id     UUID        REFERENCES public.can_bo(id) ON DELETE SET NULL,
  can_bo_email  TEXT,
  can_bo_ten    TEXT,

  -- Metadata kỹ thuật
  ip_address    INET,
  user_agent    TEXT,

  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Indexes ──────────────────────────────────────────────────
CREATE INDEX idx_audit_hanh_dong   ON public.audit_logs(hanh_dong);
CREATE INDEX idx_audit_bang        ON public.audit_logs(bang);
CREATE INDEX idx_audit_can_bo      ON public.audit_logs(can_bo_id);
CREATE INDEX idx_audit_created_at  ON public.audit_logs(created_at DESC);
CREATE INDEX idx_audit_ban_ghi     ON public.audit_logs(ban_ghi_id);

-- ── RLS ──────────────────────────────────────────────────────
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Cán bộ đã đăng nhập có thể xem log
CREATE POLICY "audit_read_authenticated" ON public.audit_logs
  FOR SELECT TO authenticated
  USING (true);

-- Chỉ service_role mới được ghi (qua server actions)
CREATE POLICY "audit_insert_service" ON public.audit_logs
  FOR INSERT TO service_role
  WITH CHECK (true);
