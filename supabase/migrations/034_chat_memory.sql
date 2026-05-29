-- ============================================================
-- 034: AI Memory — Lưu lịch sử hội thoại chatbot
-- Không yêu cầu auth, dùng session_key từ localStorage
-- ============================================================

-- ── Bảng phiên hội thoại ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_key TEXT        NOT NULL UNIQUE,   -- UUID lưu trong localStorage
  tieu_de     TEXT,                           -- tự sinh từ tin nhắn đầu
  so_tin_nhan INTEGER     NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Bảng tin nhắn ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID        NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  vai_tro    TEXT        NOT NULL CHECK (vai_tro IN ('user', 'assistant')),
  noi_dung   TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Indexes ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_chat_messages_session
  ON public.chat_messages(session_id, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_key
  ON public.chat_sessions(session_key);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_updated
  ON public.chat_sessions(updated_at DESC);

-- ── Auto-update updated_at ────────────────────────────────────
CREATE OR REPLACE FUNCTION public.update_chat_session_timestamp()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE public.chat_sessions
  SET updated_at   = NOW(),
      so_tin_nhan  = so_tin_nhan + 1
  WHERE id = NEW.session_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_chat_message_inserted ON public.chat_messages;
CREATE TRIGGER trg_chat_message_inserted
  AFTER INSERT ON public.chat_messages
  FOR EACH ROW EXECUTE FUNCTION public.update_chat_session_timestamp();

-- ── RLS: chỉ service_role được truy cập (API route dùng service key) ──
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Không tạo policy anon → chặn truy cập trực tiếp từ client
-- Tất cả đọc/ghi qua API route với service_role key

-- ── Thêm vào Realtime publication (admin có thể monitor) ─────
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_sessions;
