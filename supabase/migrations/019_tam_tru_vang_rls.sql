-- ================================================================
-- Migration 019: RLS Policies — Tạm trú / Tạm vắng
-- Cho phép người dân (anon) gửi đơn qua cổng thông tin
-- ================================================================

-- Bật RLS nếu chưa bật
ALTER TABLE dang_ky_tam_tru  ENABLE ROW LEVEL SECURITY;
ALTER TABLE dang_ky_tam_vang ENABLE ROW LEVEL SECURITY;

-- ── Tạm trú ─────────────────────────────────────────────────────

-- Cán bộ đã đăng nhập: toàn quyền
CREATE POLICY "Authenticated full access tam_tru"
ON dang_ky_tam_tru FOR ALL TO authenticated
USING (deleted_at IS NULL)
WITH CHECK (true);

-- Cổng dân cư (anon): chỉ INSERT đơn mới
CREATE POLICY "Anon insert dang_ky_tam_tru"
ON dang_ky_tam_tru FOR INSERT TO anon
WITH CHECK (true);

-- Cổng dân cư (anon): tra cứu đơn của mình qua CCCD
CREATE POLICY "Anon select dang_ky_tam_tru by cccd"
ON dang_ky_tam_tru FOR SELECT TO anon
USING (deleted_at IS NULL);

-- ── Tạm vắng ───────────────────────────────────────────────────

-- Cán bộ đã đăng nhập: toàn quyền
CREATE POLICY "Authenticated full access tam_vang"
ON dang_ky_tam_vang FOR ALL TO authenticated
USING (deleted_at IS NULL)
WITH CHECK (true);

-- Cổng dân cư (anon): chỉ INSERT đơn mới
CREATE POLICY "Anon insert dang_ky_tam_vang"
ON dang_ky_tam_vang FOR INSERT TO anon
WITH CHECK (true);

-- Cổng dân cư (anon): tra cứu đơn của mình qua CCCD
CREATE POLICY "Anon select dang_ky_tam_vang by cccd"
ON dang_ky_tam_vang FOR SELECT TO anon
USING (deleted_at IS NULL);
