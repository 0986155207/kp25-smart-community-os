-- ============================================================
-- Migration 022: Fix RLS infinite recursion trên bảng profiles
-- Root cause: "profiles_select_admin" tự SELECT từ profiles
--             khi đang evaluate policy → vòng lặp vô tận
-- Fix: dùng SECURITY DEFINER function (bypass RLS bên trong)
-- ============================================================

-- ─── Bước 1: Tạo helper function SECURITY DEFINER ─────────────
-- Hàm này đọc profiles nhưng KHÔNG bị chặn bởi RLS (security definer)
-- → tránh được recursive loop

CREATE OR REPLACE FUNCTION public.la_can_bo()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND deleted_at IS NULL
    AND vai_tro IN (
      'SUPER_ADMIN','ADMIN_PHUONG','BI_THU','TRUONG_KHU_PHO',
      'CONG_AN','AN_NINH','CAN_BO','PHU_TRACH_NCT','DOAN_THE'
    )
  )
$$;

-- Vai trò quản lý cấp cao
CREATE OR REPLACE FUNCTION public.la_quan_ly()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND deleted_at IS NULL
    AND vai_tro IN ('SUPER_ADMIN','ADMIN_PHUONG','BI_THU','TRUONG_KHU_PHO')
  )
$$;

-- Lấy vai trò của user hiện tại (dùng trong logic phức tạp)
CREATE OR REPLACE FUNCTION public.lay_vai_tro()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT vai_tro::TEXT FROM public.profiles
  WHERE id = auth.uid()
  AND deleted_at IS NULL
  LIMIT 1
$$;

-- ─── Bước 2: Xoá policy cũ gây recursion ─────────────────────
DROP POLICY IF EXISTS "profiles_select_admin" ON profiles;
DROP POLICY IF EXISTS "profiles_select_own"   ON profiles;

-- ─── Bước 3: Tạo policy mới không recursive ───────────────────

-- Mọi user đã đăng nhập đều xem được profiles
-- (cần thiết để admin chọn cán bộ, xem danh sách, v.v.)
CREATE POLICY "profiles_select_authenticated" ON profiles
  FOR SELECT USING (
    auth.uid() IS NOT NULL
    AND deleted_at IS NULL
  );

-- Chỉ cán bộ cập nhật profiles (không phải của mình)
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (
    auth.uid() = id
    OR la_can_bo()
  );

-- ─── Bước 4: Fix policy phan_anh dùng profiles ────────────────
-- Xoá policy cũ
DROP POLICY IF EXISTS "phan_anh_own_read" ON phan_anh;

-- Thay bằng policy dùng function
CREATE POLICY "phan_anh_read_v2" ON phan_anh
  FOR SELECT USING (
    deleted_at IS NULL
    AND (
      nguoi_gui_id = auth.uid()
      OR la_can_bo()
      OR auth.uid() IS NULL   -- anon có thể đọc (portal công khai)
    )
  );

-- ─── Bước 5: Fix policy workflow_assignments ──────────────────
DROP POLICY IF EXISTS "workflow_read"   ON workflow_assignments;
DROP POLICY IF EXISTS "workflow_insert" ON workflow_assignments;
DROP POLICY IF EXISTS "workflow_update" ON workflow_assignments;

CREATE POLICY "workflow_read_v2" ON workflow_assignments
  FOR SELECT USING (
    can_bo_phu_trach_id = auth.uid()
    OR la_can_bo()
  );

CREATE POLICY "workflow_insert_v2" ON workflow_assignments
  FOR INSERT WITH CHECK (
    la_can_bo()
    OR auth.uid() IS NULL   -- cho phép service-role / server action
  );

CREATE POLICY "workflow_update_v2" ON workflow_assignments
  FOR UPDATE USING (
    can_bo_phu_trach_id = auth.uid()
    OR la_quan_ly()
  );

-- ─── Bước 6: Fix các policy khác dùng subquery profiles ───────

-- ho_dan
DROP POLICY IF EXISTS "ho_dan_select" ON ho_dan;
CREATE POLICY "ho_dan_select" ON ho_dan
  FOR SELECT USING (deleted_at IS NULL AND la_can_bo());

DROP POLICY IF EXISTS "ho_dan_insert" ON ho_dan;
CREATE POLICY "ho_dan_insert" ON ho_dan
  FOR INSERT WITH CHECK (la_can_bo());

DROP POLICY IF EXISTS "ho_dan_update" ON ho_dan;
CREATE POLICY "ho_dan_update" ON ho_dan
  FOR UPDATE USING (la_can_bo());

-- nhan_khau
DROP POLICY IF EXISTS "nhan_khau_select" ON nhan_khau;
CREATE POLICY "nhan_khau_select" ON nhan_khau
  FOR SELECT USING (deleted_at IS NULL AND la_can_bo());

DROP POLICY IF EXISTS "nhan_khau_insert" ON nhan_khau;
CREATE POLICY "nhan_khau_insert" ON nhan_khau
  FOR INSERT WITH CHECK (la_can_bo());

DROP POLICY IF EXISTS "nhan_khau_update" ON nhan_khau;
CREATE POLICY "nhan_khau_update" ON nhan_khau
  FOR UPDATE USING (la_can_bo());

-- ─── Bước 7: Grant execute cho anon + authenticated ──────────
GRANT EXECUTE ON FUNCTION public.la_can_bo()  TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.la_quan_ly() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.lay_vai_tro() TO anon, authenticated;

-- ─── Kiểm tra sau khi chạy ────────────────────────────────────
-- SELECT la_can_bo();   -- phải trả true nếu đang login với vai trò cán bộ
-- SELECT lay_vai_tro(); -- phải trả vai trò hiện tại
