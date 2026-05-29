-- ──────────────────────────────────────────────────────────────────
-- Migration 039: Module Zalo — OA + Group Communication
-- ──────────────────────────────────────────────────────────────────

-- 1. Người theo dõi Zalo OA
CREATE TABLE IF NOT EXISTS zalo_subscribers (
  id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  zalo_user_id    TEXT        NOT NULL UNIQUE,    -- Zalo UID
  display_name    TEXT,
  avatar_url      TEXT,
  phone           TEXT,                            -- nếu share qua OAuth
  ho_dan_id       UUID        REFERENCES ho_dan(id)     ON DELETE SET NULL,
  profile_id      UUID        REFERENCES profiles(id)   ON DELETE SET NULL,
  following       BOOLEAN     DEFAULT TRUE,         -- false = unfollow
  last_interaction TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_zalo_sub_following ON zalo_subscribers(following) WHERE following = TRUE;
CREATE INDEX IF NOT EXISTS idx_zalo_sub_phone     ON zalo_subscribers(phone) WHERE phone IS NOT NULL;

-- 2. Lịch sử broadcast / chiến dịch gửi tin
CREATE TABLE IF NOT EXISTS zalo_broadcasts (
  id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  tieu_de         TEXT        NOT NULL,
  noi_dung        TEXT        NOT NULL,
  noi_dung_nhom   TEXT,                          -- phiên bản rút gọn cho Group
  loai            TEXT        NOT NULL DEFAULT 'TEXT'
                              CHECK (loai IN ('TEXT', 'IMAGE', 'TEMPLATE', 'THONG_BAO', 'SU_KIEN', 'PHAN_ANH')),
  kenh            TEXT[]      NOT NULL DEFAULT ARRAY['GROUP'],  -- 'OA', 'GROUP'
  trang_thai      TEXT        NOT NULL DEFAULT 'DRAFT'
                              CHECK (trang_thai IN ('DRAFT','SCHEDULED','SENDING','SENT','FAILED','COPIED')),
  tham_chieu_loai TEXT,                          -- 'thong_bao', 'su_kien', 'phan_anh'
  tham_chieu_id   UUID,                          -- FK tới record nguồn
  so_nguoi_nhan   INTEGER     DEFAULT 0,
  so_delivered    INTEGER     DEFAULT 0,
  so_failed       INTEGER     DEFAULT 0,
  scheduled_at    TIMESTAMPTZ,
  sent_at         TIMESTAMPTZ,
  copied_at       TIMESTAMPTZ,                   -- khi cán bộ copy vào group
  error_message   TEXT,
  created_by      UUID        REFERENCES profiles(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_zalo_bcast_trang_thai ON zalo_broadcasts(trang_thai);
CREATE INDEX IF NOT EXISTS idx_zalo_bcast_created_at ON zalo_broadcasts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_zalo_bcast_kenh       ON zalo_broadcasts USING GIN(kenh);

-- 3. Tin nhắn riêng qua OA (inbound & outbound)
CREATE TABLE IF NOT EXISTS zalo_messages (
  id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  direction       TEXT        NOT NULL CHECK (direction IN ('INBOUND','OUTBOUND')),
  zalo_user_id    TEXT        NOT NULL,
  display_name    TEXT,
  noi_dung        TEXT        NOT NULL,
  media_url       TEXT,
  msg_id          TEXT        UNIQUE,            -- Zalo message_id để tránh duplicate
  trang_thai      TEXT        NOT NULL DEFAULT 'RECEIVED'
                              CHECK (trang_thai IN ('RECEIVED','REPLIED','PENDING','SENT','FAILED')),
  can_bo_rep_id   UUID        REFERENCES profiles(id) ON DELETE SET NULL,
  rep_noi_dung    TEXT,                          -- Nội dung trả lời (nếu có)
  rep_at          TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_zalo_msg_user    ON zalo_messages(zalo_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_zalo_msg_dir     ON zalo_messages(direction, trang_thai);

-- 4. Webhook events log (raw)
CREATE TABLE IF NOT EXISTS zalo_webhook_events (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  event_name  TEXT        NOT NULL,
  payload     JSONB       NOT NULL,
  processed   BOOLEAN     DEFAULT FALSE,
  error       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_zalo_webhook_unprocessed ON zalo_webhook_events(processed) WHERE processed = FALSE;

-- 5. OA config / token storage (1 row per OA)
CREATE TABLE IF NOT EXISTS zalo_oa_config (
  id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  oa_id           TEXT        NOT NULL UNIQUE,
  oa_name         TEXT,
  oa_avatar       TEXT,
  access_token    TEXT,                          -- encrypted in prod
  refresh_token   TEXT,
  token_expires_at TIMESTAMPTZ,
  trang_thai      TEXT        NOT NULL DEFAULT 'PENDING'
                              CHECK (trang_thai IN ('PENDING','ACTIVE','SUSPENDED','EXPIRED')),
  follower_count  INTEGER     DEFAULT 0,
  last_synced_at  TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Triggers auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_zalo_sub_updated_at') THEN
    CREATE TRIGGER trg_zalo_sub_updated_at BEFORE UPDATE ON zalo_subscribers
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_zalo_bcast_updated_at') THEN
    CREATE TRIGGER trg_zalo_bcast_updated_at BEFORE UPDATE ON zalo_broadcasts
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- 7. RLS
ALTER TABLE zalo_subscribers     ENABLE ROW LEVEL SECURITY;
ALTER TABLE zalo_broadcasts      ENABLE ROW LEVEL SECURITY;
ALTER TABLE zalo_messages        ENABLE ROW LEVEL SECURITY;
ALTER TABLE zalo_webhook_events  ENABLE ROW LEVEL SECURITY;
ALTER TABLE zalo_oa_config       ENABLE ROW LEVEL SECURITY;

-- Chỉ cán bộ được đọc/ghi
CREATE POLICY "zalo_can_bo_all" ON zalo_subscribers     FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "zalo_bcast_all"  ON zalo_broadcasts      FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "zalo_msg_all"    ON zalo_messages         FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "zalo_hook_all"   ON zalo_webhook_events  FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "zalo_cfg_all"    ON zalo_oa_config       FOR ALL USING (auth.role() = 'authenticated');

-- Service role insert webhook (từ API route không auth)
CREATE POLICY "zalo_webhook_insert" ON zalo_webhook_events FOR INSERT WITH CHECK (TRUE);

-- 8. Seed OA config mặc định (trạng thái PENDING)
INSERT INTO zalo_oa_config (oa_id, oa_name, trang_thai)
VALUES ('pending_oa_id', 'Khu phố 25 - Long Trường', 'PENDING')
ON CONFLICT (oa_id) DO NOTHING;

-- 9. Enable Realtime cho messages (live inbox)
ALTER PUBLICATION supabase_realtime ADD TABLE zalo_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE zalo_broadcasts;
