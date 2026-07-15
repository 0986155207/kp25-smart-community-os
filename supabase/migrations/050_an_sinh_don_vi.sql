-- ============================================================
-- Migration 050: GẮN KHÓA KHU PHỐ CHO CÁC BẢNG AN SINH
--
--   Migration 044 đã thêm don_vi_id cho dữ liệu lõi nhưng BỎ SÓT
--   3 bảng an sinh: bhyt, ho_ngheo, nguoi_cao_tuoi.
--   → Dashboard/Báo cáo của khu phố mới sẽ đếm nhầm số liệu
--     an sinh của khu phố khác.
--
--   DEFAULT = KP25 ⇒ dữ liệu hiện có giữ nguyên, không đổi hiển thị.
--
-- CHẠY THỦ CÔNG trong Supabase SQL Editor.
-- ============================================================

DO $$
DECLARE
  t TEXT;
  bang TEXT[] := ARRAY['bhyt', 'ho_ngheo', 'nguoi_cao_tuoi'];
BEGIN
  FOREACH t IN ARRAY bang LOOP
    IF to_regclass('public.' || t) IS NOT NULL THEN
      EXECUTE format(
        'ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS don_vi_id UUID NOT NULL DEFAULT %L REFERENCES public.don_vi(id)',
        t, '00000000-0000-4000-8000-000000000025'
      );
      EXECUTE format(
        'CREATE INDEX IF NOT EXISTS %I ON public.%I(don_vi_id)',
        'idx_' || t || '_don_vi', t
      );
    END IF;
  END LOOP;
END $$;

-- ─────────────────────────────────────────────────────────────
-- KIỂM TRA
-- ─────────────────────────────────────────────────────────────
-- SELECT 'bhyt' AS bang, don_vi_id, COUNT(*) FROM public.bhyt GROUP BY 2
-- UNION ALL SELECT 'ho_ngheo', don_vi_id, COUNT(*) FROM public.ho_ngheo GROUP BY 2
-- UNION ALL SELECT 'nguoi_cao_tuoi', don_vi_id, COUNT(*) FROM public.nguoi_cao_tuoi GROUP BY 2;
-- → tất cả phải là don_vi_id của KP25
