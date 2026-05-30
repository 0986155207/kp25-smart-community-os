-- ============================================================
-- Migration 039: Thêm cột giấy tờ upload + bucket storage
-- ============================================================

-- ── Thêm cột giay_to_urls vào ho_so_thu_tuc ─────────────────
ALTER TABLE ho_so_thu_tuc
  ADD COLUMN IF NOT EXISTS giay_to_urls TEXT[] DEFAULT NULL;

COMMENT ON COLUMN ho_so_thu_tuc.giay_to_urls
  IS 'Mảng URL các file giấy tờ scan đã upload lên Supabase Storage (bucket: phan-anh-media/ho-so/)';

-- ── Đảm bảo bucket phan-anh-media tồn tại ───────────────────
-- (Nếu đã có rồi thì ON CONFLICT bỏ qua)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'phan-anh-media',
  'phan-anh-media',
  true,
  52428800,   -- 50 MB
  ARRAY[
    'image/jpeg','image/jpg','image/png','image/webp',
    'image/heic','image/gif','video/mp4','video/quicktime',
    'application/pdf'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  allowed_mime_types = EXCLUDED.allowed_mime_types,
  file_size_limit    = EXCLUDED.file_size_limit;

-- ── RLS policies cho storage (idempotent) ────────────────────
-- Anon upload (phản ánh và hồ sơ thủ tục)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'objects'
      AND schemaname = 'storage'
      AND policyname = 'Anon upload phan-anh-media'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "Anon upload phan-anh-media"
        ON storage.objects FOR INSERT TO anon
        WITH CHECK (bucket_id = 'phan-anh-media')
    $policy$;
  END IF;
END $$;

-- Public read
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'objects'
      AND schemaname = 'storage'
      AND policyname = 'Public read phan-anh-media'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "Public read phan-anh-media"
        ON storage.objects FOR SELECT TO public
        USING (bucket_id = 'phan-anh-media')
    $policy$;
  END IF;
END $$;
