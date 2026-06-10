-- ============================================================
-- Migration 045: KHẮC PHỤC CẢNH BÁO BẢO MẬT SUPABASE
--   "Function Search Path Mutable"
--
-- Vấn đề: các hàm trong schema public KHÔNG cố định search_path
--   → nguy cơ "search_path hijacking" (đặc biệt với SECURITY DEFINER).
--
-- Giải pháp: gắn `SET search_path = public, pg_temp` cho TẤT CẢ hàm
--   do dự án tạo (bỏ qua hàm thuộc extension — không sở hữu, không nên sửa).
--
-- An toàn & idempotent: chạy lại nhiều lần không sao. Không đổi logic hàm,
--   chỉ cố định môi trường phân giải tên schema.
--
-- CHẠY THỦ CÔNG trong Supabase SQL Editor.
-- ============================================================

DO $$
DECLARE
  r RECORD;
  cnt INT := 0;
BEGIN
  FOR r IN
    SELECT
      p.oid,
      p.proname,
      pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.prokind = 'f'                        -- chỉ FUNCTION (bỏ aggregate/window/procedure)
      -- Bỏ qua hàm thuộc về extension (vd: pg_trgm, vector, uuid-ossp)
      AND NOT EXISTS (
        SELECT 1 FROM pg_depend d
        WHERE d.objid = p.oid AND d.deptype = 'e'
      )
      -- Chỉ những hàm CHƯA cố định search_path (tránh đụng hàm đã đúng)
      AND NOT EXISTS (
        SELECT 1 FROM unnest(COALESCE(p.proconfig, ARRAY[]::text[])) AS cfg
        WHERE cfg LIKE 'search_path=%'
      )
  LOOP
    EXECUTE format(
      'ALTER FUNCTION public.%I(%s) SET search_path = public, pg_temp',
      r.proname, r.args
    );
    cnt := cnt + 1;
  END LOOP;

  RAISE NOTICE 'Đã cố định search_path cho % hàm trong schema public.', cnt;
END $$;

-- ─────────────────────────────────────────────────────────────
-- KIỂM TRA SAU KHI CHẠY
-- ─────────────────────────────────────────────────────────────
-- Liệt kê các hàm CÒN LẠI chưa cố định search_path (chỉ nên còn hàm extension):
--
-- SELECT n.nspname, p.proname
-- FROM pg_proc p
-- JOIN pg_namespace n ON n.oid = p.pronamespace
-- WHERE n.nspname = 'public'
--   AND p.prokind = 'f'
--   AND NOT EXISTS (SELECT 1 FROM pg_depend d WHERE d.objid = p.oid AND d.deptype = 'e')
--   AND NOT EXISTS (
--     SELECT 1 FROM unnest(COALESCE(p.proconfig, ARRAY[]::text[])) AS cfg
--     WHERE cfg LIKE 'search_path=%'
--   );
-- → Phải trả về 0 dòng.
