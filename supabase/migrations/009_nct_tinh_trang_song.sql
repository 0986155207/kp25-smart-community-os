-- ============================================================
-- KP25 — Migration 009: Thêm tình trạng sống cho Người cao tuổi
--        và đồng bộ trạng thái "Đã mất" vào bảng nhân khẩu
-- Chạy tại: https://supabase.com/dashboard/project/pnyjrneqxqckclxehaqv/sql/new
-- ============================================================

-- ── 1. Bảng nguoi_cao_tuoi ──────────────────────────────────
ALTER TABLE nguoi_cao_tuoi
  ADD COLUMN IF NOT EXISTS da_mat           BOOLEAN  DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS ngay_mat         DATE,
  ADD COLUMN IF NOT EXISTS nguyen_nhan_mat  TEXT;

-- Index để lọc NCT còn sống / đã mất nhanh
CREATE INDEX IF NOT EXISTS idx_nct_da_mat ON nguoi_cao_tuoi(da_mat) WHERE deleted_at IS NULL;

-- ── 2. Bảng nhan_khau — thêm tình trạng tử vong ─────────────
ALTER TABLE nhan_khau
  ADD COLUMN IF NOT EXISTS da_mat   BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS ngay_mat DATE;

-- Index để lọc nhân khẩu còn sống / đã mất nhanh
CREATE INDEX IF NOT EXISTS idx_nk_da_mat ON nhan_khau(da_mat) WHERE deleted_at IS NULL;

-- ── 3. Kiểm tra ──────────────────────────────────────────────
SELECT
  'nguoi_cao_tuoi' AS bang,
  COUNT(*) FILTER (WHERE da_mat = FALSE OR da_mat IS NULL) AS con_song,
  COUNT(*) FILTER (WHERE da_mat = TRUE)                    AS da_mat
FROM nguoi_cao_tuoi
WHERE deleted_at IS NULL

UNION ALL

SELECT
  'nhan_khau' AS bang,
  COUNT(*) FILTER (WHERE da_mat = FALSE OR da_mat IS NULL) AS con_song,
  COUNT(*) FILTER (WHERE da_mat = TRUE)                    AS da_mat
FROM nhan_khau
WHERE deleted_at IS NULL;
