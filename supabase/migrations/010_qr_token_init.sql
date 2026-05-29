-- Migration 010: Khởi tạo QR token cho tất cả hộ dân hiện có
-- Chạy một lần trong Supabase Studio → SQL Editor

-- Cột qr_token đã tồn tại trong schema (001_initial_schema.sql).
-- Chỉ cần điền giá trị cho các hàng chưa có token.

UPDATE ho_dan
SET qr_token = gen_random_uuid()::text
WHERE qr_token IS NULL
  AND deleted_at IS NULL;

-- Index để tra cứu nhanh theo token (nếu chưa có)
CREATE UNIQUE INDEX IF NOT EXISTS idx_ho_dan_qr_token ON ho_dan(qr_token)
  WHERE qr_token IS NOT NULL AND deleted_at IS NULL;
