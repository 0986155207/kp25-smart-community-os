-- ============================================================
-- Migration 020: Kích hoạt Supabase Realtime cho các bảng chính
-- Mục đích: Admin dashboard nhận cập nhật tức thì,
--           Cổng dân cư theo dõi trạng thái hồ sơ live
-- ============================================================

-- ─── Kích hoạt Realtime trên từng bảng ───────────────────────
-- Supabase Realtime sử dụng publication "supabase_realtime"

-- Phản ánh hiện trường
ALTER PUBLICATION supabase_realtime ADD TABLE phan_anh;

-- Đăng ký tạm trú / tạm vắng
ALTER PUBLICATION supabase_realtime ADD TABLE dang_ky_tam_tru;
ALTER PUBLICATION supabase_realtime ADD TABLE dang_ky_tam_vang;

-- Thông báo
ALTER PUBLICATION supabase_realtime ADD TABLE thong_bao;

-- Hộ dân (tuỳ chọn — dùng cho GIS map realtime)
ALTER PUBLICATION supabase_realtime ADD TABLE ho_dan;

-- ─── Index hỗ trợ filter realtime (id equality filter) ───────
-- Supabase Realtime filter `id=eq.xxx` cần index trên cột id
-- (thường đã có primary key, nhưng thêm index explicit cho các
--  bảng hay dùng filter)
CREATE INDEX IF NOT EXISTS idx_phan_anh_id          ON phan_anh(id);
CREATE INDEX IF NOT EXISTS idx_tam_tru_id           ON dang_ky_tam_tru(id);
CREATE INDEX IF NOT EXISTS idx_tam_vang_id          ON dang_ky_tam_vang(id);
CREATE INDEX IF NOT EXISTS idx_tam_tru_so_cccd      ON dang_ky_tam_tru(so_cccd);
CREATE INDEX IF NOT EXISTS idx_tam_vang_so_cccd     ON dang_ky_tam_vang(so_cccd);

-- ─── Ghi chú vận hành ─────────────────────────────────────────
-- Sau khi chạy migration này, kiểm tra trong Supabase Dashboard:
--   Database → Replication → supabase_realtime publication
--   Xác nhận các bảng trên đã xuất hiện trong danh sách.
--
-- Client-side: @supabase/supabase-js v2 + @supabase/ssr
--   supabase.channel('ten-kenh')
--     .on('postgres_changes', { event: '*', schema: 'public', table: 'phan_anh' }, cb)
--     .subscribe()
