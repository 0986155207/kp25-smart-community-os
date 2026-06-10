-- ============================================================
-- Migration 046: TỐI ƯU HIỆU NĂNG (Supabase Performance Advisor)
--   A. Thêm index cho các khóa ngoại hay join/filter (unindexed FK).
--   B. Tối ưu RLS: bọc auth.uid() bằng (SELECT auth.uid()) — tránh
--      tính lại mỗi dòng (cảnh báo "Auth RLS InitPlan"); đồng thời
--      sửa policy profiles đệ quy còn sót (migration 022 chưa chạy ở DB này).
--
-- An toàn & idempotent. Phụ thuộc migration 044 (cần hàm la_can_bo).
-- CHẠY THỦ CÔNG trong Supabase SQL Editor (sau 044, 045).
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- A. INDEX CHO KHÓA NGOẠI (chỉ những cột thực sự hay join/lọc)
-- ─────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_phan_anh_nguoi_gui   ON public.phan_anh(nguoi_gui_id);
CREATE INDEX IF NOT EXISTS idx_nhan_khau_profile    ON public.nhan_khau(profile_id);
CREATE INDEX IF NOT EXISTS idx_profiles_don_vi      ON public.profiles(don_vi_id);
CREATE INDEX IF NOT EXISTS idx_profiles_ho_id       ON public.profiles(ho_id);

-- phan_anh_lich_su (FK phan_anh_id hay join để lấy lịch sử)
DO $$
BEGIN
  IF to_regclass('public.phan_anh_lich_su') IS NOT NULL THEN
    CREATE INDEX IF NOT EXISTS idx_pa_lich_su_phan_anh ON public.phan_anh_lich_su(phan_anh_id);
  END IF;
END $$;

-- workflow_assignments + workflow_lich_su (nếu tồn tại)
DO $$
BEGIN
  IF to_regclass('public.workflow_assignments') IS NOT NULL THEN
    CREATE INDEX IF NOT EXISTS idx_wf_assign_phan_anh   ON public.workflow_assignments(phan_anh_id);
    CREATE INDEX IF NOT EXISTS idx_wf_assign_can_bo     ON public.workflow_assignments(can_bo_phu_trach_id);
  END IF;
  IF to_regclass('public.workflow_lich_su') IS NOT NULL THEN
    CREATE INDEX IF NOT EXISTS idx_wf_lich_su_assign    ON public.workflow_lich_su(assignment_id);
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────
-- B. TỐI ƯU RLS — bọc auth.uid() trong (SELECT auth.uid())
-- ─────────────────────────────────────────────────────────────

-- profiles: bỏ policy đệ quy cũ (migration 001) + tạo policy không đệ quy
DROP POLICY IF EXISTS "profiles_select_own"           ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_admin"         ON public.profiles;  -- đệ quy → bỏ
DROP POLICY IF EXISTS "profiles_select_authenticated" ON public.profiles;
CREATE POLICY "profiles_select_authenticated" ON public.profiles
  FOR SELECT USING (
    (SELECT auth.uid()) IS NOT NULL
    AND deleted_at IS NULL
  );

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (
    (SELECT auth.uid()) = id
    OR public.la_can_bo()
  );

-- phan_anh: tối ưu auth.uid() trong policy đọc
DROP POLICY IF EXISTS "phan_anh_own_read" ON public.phan_anh;
DROP POLICY IF EXISTS "phan_anh_read_v2"  ON public.phan_anh;
CREATE POLICY "phan_anh_read_v2" ON public.phan_anh
  FOR SELECT USING (
    deleted_at IS NULL
    AND (
      nguoi_gui_id = (SELECT auth.uid())
      OR (SELECT auth.uid()) IS NULL
      OR (public.la_can_bo() AND public.co_quyen_don_vi(don_vi_id))
    )
  );

-- chat_sessions / chat_messages: KHÔNG đụng tới.
-- Migration 034 đã dựng lại bảng chat theo mô hình ẩn danh (session_key từ
-- localStorage), RLS bật nhưng KHÔNG có policy → chặn client trực tiếp, chỉ
-- service role truy cập. Dọn policy cũ (nếu còn sót từ migration 001) cho sạch:
DROP POLICY IF EXISTS "chat_sessions_own" ON public.chat_sessions;
DROP POLICY IF EXISTS "chat_messages_own" ON public.chat_messages;

-- ─────────────────────────────────────────────────────────────
-- GHI CHÚ (không chạy):
--   • Các FK cột audit (created_by/updated_by/nguoi_tao_id/can_bo_id) hầu như
--     không bao giờ lọc theo → KHÔNG thêm index để tránh phình index + chậm ghi.
--     Nếu muốn Advisor sạch tuyệt đối nhóm "Unindexed FK", có thể thêm sau,
--     nhưng cân nhắc đánh đổi.
--   • Index gin trên ho_ten/chu_ho (pg_trgm) đã có — phục vụ tìm kiếm mờ.
-- ─────────────────────────────────────────────────────────────
