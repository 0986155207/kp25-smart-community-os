-- ============================================================
-- Migration 006: Hàm xoá hàng loạt bypass RLS
-- Chạy trong Supabase SQL Editor
-- ============================================================

-- Fix RLS policy nhan_khau: thêm WITH CHECK(true) tường minh
-- để tránh PostgreSQL tự kế thừa WITH CHECK từ SELECT policy
DROP POLICY IF EXISTS "nhan_khau_update" ON public.nhan_khau;
CREATE POLICY "nhan_khau_update" ON public.nhan_khau
  FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "ho_dan_update" ON public.ho_dan;
CREATE POLICY "ho_dan_update" ON public.ho_dan
  FOR UPDATE USING (true) WITH CHECK (true);

-- ─── Hàm xoá toàn bộ nhân khẩu (SECURITY DEFINER) ──────────
CREATE OR REPLACE FUNCTION public.xoa_toan_bo_nhan_khau()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  so_dong integer;
BEGIN
  UPDATE nhan_khau
  SET deleted_at = NOW()
  WHERE deleted_at IS NULL;
  GET DIAGNOSTICS so_dong = ROW_COUNT;
  RETURN so_dong;
END;
$$;

-- ─── Hàm xoá toàn bộ hộ dân (SECURITY DEFINER) ──────────────
CREATE OR REPLACE FUNCTION public.xoa_toan_bo_ho_dan()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  so_dong integer;
BEGIN
  UPDATE ho_dan
  SET deleted_at = NOW()
  WHERE deleted_at IS NULL;
  GET DIAGNOSTICS so_dong = ROW_COUNT;
  RETURN so_dong;
END;
$$;

-- ─── Hàm xoá dữ liệu trùng (SECURITY DEFINER) ───────────────
-- Giữ bản cũ nhất của mỗi nhóm (chu_ho + dia_chi_day)
-- Xoá nhân khẩu trước, sau đó xoá hộ dân trùng
CREATE OR REPLACE FUNCTION public.xoa_trung_ho_dan(
  OUT so_ho_xoa  integer,
  OUT so_nk_xoa  integer
)
RETURNS record
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  so_ho_xoa := 0;
  so_nk_xoa := 0;

  -- Xoá nhân khẩu thuộc hộ trùng
  UPDATE nhan_khau
  SET deleted_at = NOW()
  WHERE deleted_at IS NULL
    AND ho_id IN (
      SELECT id FROM (
        SELECT id,
          ROW_NUMBER() OVER (
            PARTITION BY UPPER(TRIM(chu_ho)), UPPER(TRIM(dia_chi_day))
            ORDER BY created_at ASC
          ) AS rn
        FROM ho_dan
        WHERE deleted_at IS NULL
      ) t
      WHERE rn > 1
    );
  GET DIAGNOSTICS so_nk_xoa = ROW_COUNT;

  -- Xoá hộ dân trùng (giữ bản cũ nhất mỗi nhóm)
  UPDATE ho_dan
  SET deleted_at = NOW()
  WHERE deleted_at IS NULL
    AND id IN (
      SELECT id FROM (
        SELECT id,
          ROW_NUMBER() OVER (
            PARTITION BY UPPER(TRIM(chu_ho)), UPPER(TRIM(dia_chi_day))
            ORDER BY created_at ASC
          ) AS rn
        FROM ho_dan
        WHERE deleted_at IS NULL
      ) t
      WHERE rn > 1
    );
  GET DIAGNOSTICS so_ho_xoa = ROW_COUNT;
END;
$$;

-- Cấp quyền gọi
GRANT EXECUTE ON FUNCTION public.xoa_toan_bo_nhan_khau() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.xoa_toan_bo_ho_dan()    TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.xoa_trung_ho_dan()      TO anon, authenticated;
