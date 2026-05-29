-- ============================================================
-- KP25 — Migration 018: Storage bucket cho Phản ánh Media
-- Tạo bucket phan-anh-media (ảnh + video từ hiện trường)
-- ============================================================

-- ── Tạo bucket (public, max 200MB/file) ─────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'phan-anh-media',
  'phan-anh-media',
  true,
  209715200,   -- 200 MB
  ARRAY[
    'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
    'image/heic', 'image/heif', 'image/gif',
    'video/mp4', 'video/quicktime', 'video/avi',
    'video/x-msvideo', 'video/webm', 'video/x-matroska'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- ── RLS Policies ─────────────────────────────────────────────

-- Cán bộ đã xác thực có thể upload
CREATE POLICY "Authenticated upload phan-anh-media"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'phan-anh-media');

-- Ai cũng có thể xem (public bucket)
CREATE POLICY "Public read phan-anh-media"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'phan-anh-media');

-- Cán bộ có thể xoá file
CREATE POLICY "Authenticated delete phan-anh-media"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'phan-anh-media');

-- Cán bộ có thể update (replace) file
CREATE POLICY "Authenticated update phan-anh-media"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'phan-anh-media');
