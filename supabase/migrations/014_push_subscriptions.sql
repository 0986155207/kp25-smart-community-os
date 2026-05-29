-- =============================================================
-- KP25 — Migration 014: Push Notification Subscriptions
-- Lưu FCM token của từng thiết bị cán bộ
-- =============================================================

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT    NOT NULL,              -- Email cán bộ (liên kết can_bo)
  fcm_token   TEXT    NOT NULL UNIQUE,       -- FCM registration token
  device_name TEXT,                          -- Tên thiết bị (browser/OS)
  platform    TEXT    DEFAULT 'web',         -- web | android | ios
  active      BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  last_seen   TIMESTAMPTZ DEFAULT NOW()
);

-- ── Bảng lịch sử push đã gửi ─────────────────────────────────
CREATE TABLE IF NOT EXISTS push_lich_su (
  id           UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  tieu_de      TEXT    NOT NULL,
  noi_dung     TEXT,
  url_dich     TEXT,
  so_thiet_bi  INT     DEFAULT 0,    -- Số thiết bị nhận được
  so_thanh_cong INT    DEFAULT 0,    -- Gửi thành công
  so_loi       INT     DEFAULT 0,    -- Gửi lỗi
  nguoi_gui    TEXT,                 -- Email người gửi
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── RLS ────────────────────────────────────────────────────────
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_lich_su       ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "push_sub_select" ON push_subscriptions;
DROP POLICY IF EXISTS "push_sub_own"    ON push_subscriptions;
DROP POLICY IF EXISTS "push_sub_svc"    ON push_subscriptions;
DROP POLICY IF EXISTS "push_ls_select"  ON push_lich_su;
DROP POLICY IF EXISTS "push_ls_svc"     ON push_lich_su;

-- Mỗi user chỉ xem token của mình
CREATE POLICY "push_sub_select" ON push_subscriptions
  FOR SELECT TO authenticated
  USING (true);

-- Service role quản lý toàn bộ
CREATE POLICY "push_sub_svc" ON push_subscriptions
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "push_ls_select" ON push_lich_su
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "push_ls_svc" ON push_lich_su
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── Indexes ────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_push_sub_email   ON push_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_push_sub_active  ON push_subscriptions(active);
CREATE INDEX IF NOT EXISTS idx_push_sub_token   ON push_subscriptions(fcm_token);
