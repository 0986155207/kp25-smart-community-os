'use client'

import { KHU_PHO } from '@/lib/khu-pho'
import { useState, useRef, useEffect, useCallback } from 'react'
import {
  Send, Bot, User, Loader2, RefreshCw, Sparkles,
  History, Clock, MessageSquare,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn, formatRelativeTime } from '@/lib/utils'
import toast from 'react-hot-toast'

// ─── Types ────────────────────────────────────────────────────
interface Message {
  id:        string
  vaiTro:    'user' | 'assistant'
  noiDung:   string
  createdAt: string
}

interface SessionInfo {
  id:        string
  tieuDe:    string | null
  soTinNhan: number
  createdAt: string
}

// ─── Constants ───────────────────────────────────────────────
const STORAGE_KEY = 'kp25-chat-session'

const WELCOME_MESSAGE: Message = {
  id:        'welcome',
  vaiTro:    'assistant',
  noiDung:   `Xin chào! Tôi là Trợ lý AI của ${KHU_PHO.ten}, Phường Long Trường, TP.HCM.\n\nTôi có thể hỗ trợ bạn:\n1. Tra cứu thông tin hành chính\n2. Hướng dẫn thủ tục, quy trình\n3. Tiếp nhận phản ánh hiện trường\n4. Thông tin về các hoạt động khu phố\n\nBạn cần hỗ trợ gì ạ?`,
  createdAt: new Date().toISOString(),
}

const SUGGESTED_QUESTIONS = [
  'Thủ tục đăng ký tạm trú ở khu phố như thế nào?',
  'Làm sao để gửi phản ánh về rác thải trên đường?',
  'Ban quản lý khu phố làm việc những giờ nào?',
  'Tôi cần liên hệ ai để xin giấy xác nhận cư trú?',
]

// ─── Component ────────────────────────────────────────────────
export default function ChatInterface() {
  const [messages,    setMessages]    = useState<Message[]>([WELCOME_MESSAGE])
  const [input,       setInput]       = useState('')
  const [loading,     setLoading]     = useState(false)
  const [loadingHist, setLoadingHist] = useState(true)
  const [sessionKey,  setSessionKey]  = useState<string | null>(null)
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null)
  const [isResume,    setIsResume]    = useState(false)  // có lịch sử hay không

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef       = useRef<HTMLTextAreaElement>(null)

  // ── Auto-scroll ──────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── Khởi tạo session key từ localStorage ─────────────────────
  useEffect(() => {
    let key = localStorage.getItem(STORAGE_KEY)
    if (!key) {
      key = crypto.randomUUID()
      localStorage.setItem(STORAGE_KEY, key)
    }
    setSessionKey(key)
  }, [])

  // ── Load lịch sử khi có sessionKey ───────────────────────────
  const loadHistory = useCallback(async (key: string) => {
    setLoadingHist(true)
    try {
      const res  = await fetch(`/api/chat?sessionKey=${encodeURIComponent(key)}`)
      const json = await res.json()

      const msgs: Message[] = json.data?.messages ?? []
      const sess: SessionInfo | null = json.data?.session ?? null

      if (msgs.length > 0) {
        setMessages(msgs)
        setSessionInfo(sess)
        setIsResume(true)
      }
      // Nếu không có lịch sử → giữ welcome message
    } catch {
      // Lỗi load history — không ảnh hưởng chat
    } finally {
      setLoadingHist(false)
    }
  }, [])

  useEffect(() => {
    if (sessionKey) loadHistory(sessionKey)
  }, [sessionKey, loadHistory])

  // ── Gửi tin nhắn ────────────────────────────────────────────
  async function sendMessage(text: string) {
    if (!text.trim() || loading || !sessionKey) return

    const userMsg: Message = {
      id:        crypto.randomUUID(),
      vaiTro:    'user',
      noiDung:   text.trim(),
      createdAt: new Date().toISOString(),
    }

    setMessages(prev => {
      // Bỏ welcome message khi gửi tin đầu tiên
      const filtered = prev.filter(m => m.id !== 'welcome')
      return [...filtered, userMsg]
    })
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message:    text.trim(),
          sessionKey,
        }),
      })

      if (!res.ok) throw new Error('Lỗi kết nối AI')

      const json = await res.json()
      const reply = json.data?.reply ?? 'Xin lỗi, tôi không thể trả lời lúc này.'

      const aiMsg: Message = {
        id:        crypto.randomUUID(),
        vaiTro:    'assistant',
        noiDung:   reply,
        createdAt: new Date().toISOString(),
      }

      setMessages(prev => [...prev, aiMsg])

      // Cập nhật thông tin session nếu lần đầu
      if (!sessionInfo) {
        setSessionInfo({
          id:        json.data?.sessionId ?? '',
          tieuDe:    text.slice(0, 60),
          soTinNhan: 2,
          createdAt: new Date().toISOString(),
        })
      }
    } catch {
      toast.error('Không thể kết nối AI. Vui lòng thử lại.')
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  // ── Cuộc hội thoại mới ───────────────────────────────────────
  function newConversation() {
    const newKey = crypto.randomUUID()
    localStorage.setItem(STORAGE_KEY, newKey)
    setSessionKey(newKey)
    setSessionInfo(null)
    setIsResume(false)
    setMessages([{
      ...WELCOME_MESSAGE,
      id:        'welcome-new',
      createdAt: new Date().toISOString(),
    }])
    toast.success('Đã bắt đầu cuộc hội thoại mới', { icon: '✨' })
  }

  const isFirstMessage = messages.length <= 1 && !loading

  // ─── Render ──────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-[#1E3A5F] to-[#2d5986] text-white shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <Sparkles size={20} className="text-[#FCD34D]" />
          </div>
          <div>
            <div className="font-bold text-base">AI Trợ lý {KHU_PHO.ten}</div>
            <div className="text-xs text-white/70 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Trực tuyến · Gemini 2.5 Flash · Có nhớ ngữ cảnh
            </div>
          </div>
        </div>
        <button
          onClick={newConversation}
          className="p-2 rounded-lg hover:bg-white/20 transition-colors"
          title="Cuộc hội thoại mới"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* ── Banner tiếp tục hội thoại cũ ─────────────────────── */}
      <AnimatePresence>
        {isResume && sessionInfo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-blue-50 border-b border-blue-100 px-4 py-2.5 flex items-center gap-2 shrink-0"
          >
            <History size={13} className="text-blue-500 shrink-0" />
            <p className="text-xs text-blue-700 flex-1 min-w-0">
              <span className="font-semibold">Tiếp tục hội thoại</span>
              {sessionInfo.tieuDe && (
                <span className="text-blue-500"> · {sessionInfo.tieuDe.slice(0, 45)}{sessionInfo.tieuDe.length > 45 ? '...' : ''}</span>
              )}
              <span className="text-blue-400"> · {sessionInfo.soTinNhan} tin nhắn</span>
            </p>
            <button
              onClick={newConversation}
              className="text-[11px] text-blue-500 hover:text-blue-700 font-medium shrink-0"
            >
              Hội thoại mới
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Danh sách tin nhắn ──────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">

        {/* Loading history skeleton */}
        {loadingHist && (
          <div className="flex flex-col gap-3 animate-pulse">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0" />
              <div className="h-16 w-3/4 bg-slate-100 rounded-2xl" />
            </div>
            <div className="flex gap-3 flex-row-reverse">
              <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0" />
              <div className="h-10 w-1/2 bg-slate-100 rounded-2xl" />
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0" />
              <div className="h-20 w-2/3 bg-slate-100 rounded-2xl" />
            </div>
          </div>
        )}

        {/* Tin nhắn */}
        {!loadingHist && (
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className={cn(
                  'flex gap-3',
                  msg.vaiTro === 'user' ? 'flex-row-reverse' : 'flex-row'
                )}
              >
                {/* Avatar */}
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1',
                  msg.vaiTro === 'user'
                    ? 'bg-[#1E3A5F]'
                    : 'bg-gradient-to-br from-[#8B1A1A] to-[#1E3A5F]'
                )}>
                  {msg.vaiTro === 'user'
                    ? <User size={16} className="text-white" />
                    : <Bot  size={16} className="text-white" />}
                </div>

                {/* Bubble */}
                <div className={cn(
                  'max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap',
                  msg.vaiTro === 'user'
                    ? 'bg-[#1E3A5F] text-white rounded-tr-sm'
                    : 'bg-slate-50 text-slate-800 border border-slate-100 rounded-tl-sm'
                )}>
                  {msg.noiDung}
                  <div className={cn(
                    'text-xs mt-1.5 flex items-center gap-1',
                    msg.vaiTro === 'user' ? 'text-white/50 justify-end' : 'text-slate-400'
                  )}>
                    <Clock size={9} />
                    {formatRelativeTime(msg.createdAt)}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {/* Typing indicator */}
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#8B1A1A] to-[#1E3A5F] flex items-center justify-center">
              <Bot size={16} className="text-white" />
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Câu hỏi gợi ý ──────────────────────────────────── */}
      {isFirstMessage && !loadingHist && (
        <div className="px-4 pb-2 shrink-0">
          <p className="text-xs text-slate-400 mb-2 flex items-center gap-1">
            <MessageSquare size={10} /> Câu hỏi gợi ý:
          </p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                className="text-xs px-3 py-1.5 rounded-full border border-[#8B1A1A]/20
                           text-[#8B1A1A] hover:bg-[#8B1A1A]/10 transition-colors text-left"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Input ───────────────────────────────────────────── */}
      <div className="px-4 pb-4 pt-2 border-t border-slate-100 shrink-0">
        <div className="flex gap-3 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nhập câu hỏi của bạn... (Enter để gửi)"
            rows={1}
            disabled={loading || loadingHist}
            className="flex-1 input resize-none min-h-[44px] max-h-32 py-3 disabled:opacity-60"
            onInput={(e) => {
              const t = e.target as HTMLTextAreaElement
              t.style.height = 'auto'
              t.style.height = Math.min(t.scrollHeight, 128) + 'px'
            }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading || loadingHist}
            className="btn-primary h-[44px] w-[44px] p-0 rounded-xl shrink-0
                       disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Gửi"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-2 text-center">
          AI nhớ lịch sử hội thoại của bạn · Thông tin quan trọng hãy kiểm tra với Ban quản lý
        </p>
      </div>
    </div>
  )
}
