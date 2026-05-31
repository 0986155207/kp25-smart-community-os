-- ============================================================
-- Migration 042: Chiến dịch tự khai — tracking gửi SMS
-- ============================================================
-- Đánh dấu hộ đã được gửi SMS mời tự khai (tránh gửi trùng,
-- thống kê tiến độ chiến dịch).

ALTER TABLE ho_dan
  ADD COLUMN IF NOT EXISTS tu_khai_sms_gui_luc TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS tu_khai_sms_so_lan  SMALLINT DEFAULT 0;

COMMENT ON COLUMN ho_dan.tu_khai_sms_gui_luc IS 'Lần cuối gửi SMS mời tự khai cho hộ này';
COMMENT ON COLUMN ho_dan.tu_khai_sms_so_lan  IS 'Số lần đã gửi SMS mời tự khai';

-- Đảm bảo mọi hộ đều có qr_token (cần cho link tự khai)
UPDATE ho_dan
SET qr_token = gen_random_uuid()::text
WHERE qr_token IS NULL AND deleted_at IS NULL;
