'use client'

import { KHU_PHO } from '@/lib/khu-pho'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Bot, Send, Plus, Copy, Check, Loader2, AlertCircle,
  Sparkles, ChevronRight, Database, BookOpen,
} from 'lucide-react'
import { layNguCanhAI } from './actions'

// ─── Types ─────────────────────────────────────────────────
type TinNhan = {
  id:       string
  role:     'user' | 'assistant'
  content:  string
  thoiGian: Date
  nguon?:   Array<{ tieu_de: string; so_hieu: string | null; do_tuong_dong: number }>
}

// ─── Gợi ý câu hỏi ─────────────────────────────────────────
const GOI_Y = [
  { icon: '📊', title: 'Tình hình dân cư', prompt: 'Tóm tắt tình hình dân cư khu phố hiện tại cho tôi.' },
  { icon: '📋', title: 'Phản ánh tồn đọng', prompt: 'Có bao nhiêu phản ánh chưa được xử lý? Tôi cần ưu tiên xử lý cái gì trước?' },
  { icon: '📝', title: 'Soạn thông báo', prompt: 'Giúp tôi soạn thảo một thông báo mời họp khu phố định kỳ tháng này.' },
  { icon: '⚖️', title: 'Thủ tục hành chính', prompt: 'Hướng dẫn thủ tục đăng ký thường trú cho hộ dân mới chuyển đến.' },
  { icon: '🔒', title: 'An ninh trật tự', prompt: 'Các biện pháp nào hiệu quả để tăng cường an ninh trật tự tại khu phố?' },
  { icon: '📈', title: 'Báo cáo nhanh', prompt: 'Giúp tôi tổng hợp báo cáo công tác khu phố trong tháng vừa qua.' },
]

// ─── Utility ───────────────────────────────────────────────
function id() { return Math.random().toString(36).slice(2) }

function formatTime(d: Date) {
  return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}

// ─── Component ─────────────────────────────────────────────
export default function AIChatClient() {
  const [messages, setMessages]         = useState<TinNhan[]>([])
  const [input, setInput]               = useState('')
  const [isStreaming, setIsStreaming]    = useState(false)
  const [streamText, setStreamText]     = useState('')
  const [nguCanh, setNguCanh]           = useState('')
  const [dangTaiNgC, setDangTaiNgC]     = useState(true)
  const [copied, setCopied]             = useState<string | null>(null)
  const [error, setError]               = useState<string | null>(null)
  const [useRag, setUseRag]             = useState(true)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef    = useRef<HTMLTextAreaElement>(null)
  const abortRef       = useRef<AbortController | null>(null)

  // ── Lấy ngữ cảnh lúc load ──────────────────────────────
  useEffect(() => {
    layNguCanhAI().then((ctx) => {
      setNguCanh(ctx)
      setDangTaiNgC(false)
    })
  }, [])

  // ── Auto-scroll ─────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamText])

  // ── Gửi tin nhắn ────────────────────────────────────────
  const guiTinNhan = useCallback(async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || isStreaming) return

    setError(null)
    setInput('')

    const userMsg: TinNhan = { id: id(), role: 'user', content: trimmed, thoiGian: new Date() }
    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setIsStreaming(true)
    setStreamText('')

    const apiMessages = updatedMessages.map((m) => ({
      role: m.role,
      content: m.content,
    }))

    abortRef.current = new AbortController()

    try {
      const res = await fetch('/api/ai/rag-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages, context: nguCanh, useRag }),
        signal: abortRef.current.signal,
      })

      if (!res.ok) {
        const data = await res.json() as { error?: string }
        throw new Error(data.error ?? `Lỗi HTTP ${res.status}`)
      }

      if (!res.body) throw new Error('Không có dữ liệu phản hồi')

      // Đọc RAG sources từ header (đã được encodeURIComponent ở server)
      const ragSourcesHeader = res.headers.get('X-RAG-Sources')
      let nguon: TinNhan['nguon'] = []
      if (ragSourcesHeader) {
        try { nguon = JSON.parse(decodeURIComponent(ragSourcesHeader)) as TinNhan['nguon'] } catch { /* ignore */ }
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let fullText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        fullText += chunk
        setStreamText(fullText)
      }

      // Kết thúc stream → thêm tin nhắn hoàn chỉnh
      const aiMsg: TinNhan = {
        id: id(),
        role: 'assistant',
        content: fullText,
        thoiGian: new Date(),
        nguon,
      }
      setMessages((prev) => [...prev, aiMsg])
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setError((err as Error).message || 'Không thể kết nối AI. Vui lòng thử lại.')
      }
    } finally {
      setIsStreaming(false)
      setStreamText('')
    }
  }, [messages, isStreaming, nguCanh])

  // ── Phím tắt Enter ──────────────────────────────────────
  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void guiTinNhan(input)
    }
  }

  // ── Auto-resize textarea ─────────────────────────────────
  function onInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value)
    const el = e.target
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }

  // ── Copy ──────────────────────────────────────────────────
  async function copyMsg(msgId: string, content: string) {
    await navigator.clipboard.writeText(content)
    setCopied(msgId)
    setTimeout(() => setCopied(null), 2000)
  }

  // ── Reset ─────────────────────────────────────────────────
  function reset() {
    abortRef.current?.abort()
    setMessages([])
    setStreamText('')
    setIsStreaming(false)
    setError(null)
    setTimeout(() => textareaRef.current?.focus(), 100)
  }

  const coTinNhan = messages.length > 0 || isStreaming

  // ════════════════════════════════════════════════════════
  return (
    <div className="flex flex-col h-full min-h-0">

      {/* ── Header ──────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1E3A5F] to-[#2d5a9e] flex items-center justify-center shadow-sm">
            <Bot size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900">Trợ lý AI {KHU_PHO.ma}</h1>
            <div className="flex items-center gap-1.5 text-xs">
              {dangTaiNgC ? (
                <span className="text-slate-400 flex items-center gap-1">
                  <Loader2 size={10} className="animate-spin" />
                  Đang tải ngữ cảnh...
                </span>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-emerald-600 font-medium">Sẵn sàng</span>
                  <span className="text-slate-300">·</span>
                  <span className="text-slate-400">gemini-2.5-flash</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* RAG Toggle */}
          <button
            onClick={() => setUseRag(v => !v)}
            title={useRag ? 'RAG đang bật — AI tìm kiếm trong tài liệu' : 'RAG đang tắt'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              useRag
                ? 'bg-[#1E3A5F] text-white'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            <Database size={13} />
            RAG {useRag ? 'Bật' : 'Tắt'}
          </button>

          {coTinNhan && (
            <button
              onClick={reset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            >
              <Plus size={14} />
              Hội thoại mới
            </button>
          )}
        </div>
      </div>

      {/* ── Khu vực tin nhắn ────────────────────────────── */}
      <div className="flex-1 overflow-y-auto min-h-0">

        {/* Welcome screen */}
        {!coTinNhan && (
          <div className="flex flex-col items-center justify-center min-h-full px-6 py-12 text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#1E3A5F] to-[#2d5a9e] flex items-center justify-center mb-5 shadow-lg">
              <Sparkles size={36} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Xin chào! Tôi là Trợ lý AI</h2>
            <p className="text-slate-500 max-w-md mb-8 leading-relaxed">
              Hỗ trợ cán bộ {KHU_PHO.ten} trong công tác hành chính, phân tích dữ liệu, soạn thảo văn bản và giải đáp quy định.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full max-w-2xl">
              {GOI_Y.map((g) => (
                <button
                  key={g.title}
                  onClick={() => void guiTinNhan(g.prompt)}
                  className="text-left p-4 rounded-xl border border-slate-200 bg-white hover:border-[#1E3A5F] hover:bg-blue-50 transition-all group"
                >
                  <div className="text-xl mb-2">{g.icon}</div>
                  <div className="font-semibold text-slate-800 text-sm group-hover:text-[#1E3A5F]">{g.title}</div>
                  <div className="text-xs text-slate-400 mt-0.5 line-clamp-2">{g.prompt}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Danh sách tin nhắn */}
        {coTinNhan && (
          <div className="px-6 py-4 space-y-4 max-w-4xl mx-auto w-full">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {/* Avatar AI */}
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-lg bg-[#1E3A5F] flex items-center justify-center shrink-0 mt-1">
                    <Bot size={15} className="text-white" />
                  </div>
                )}

                <div className={`group max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                  {/* Bubble */}
                  <div
                    className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-[#1E3A5F] text-white rounded-br-sm'
                        : 'bg-white border border-slate-100 text-slate-800 shadow-sm rounded-bl-sm'
                    }`}
                  >
                    {msg.content}
                  </div>

                  {/* Nguồn RAG */}
                  {msg.role === 'assistant' && msg.nguon && msg.nguon.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2 px-1">
                      {msg.nguon.map((n, i) => (
                        <span
                          key={i}
                          className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#1E3A5F]/10
                            text-[10px] text-[#1E3A5F] font-medium"
                          title={`Độ tương đồng: ${n.do_tuong_dong}%`}
                        >
                          <BookOpen size={9} />
                          {n.so_hieu ?? n.tieu_de.slice(0, 30)}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Meta + Copy */}
                  <div className="flex items-center gap-2 mt-1 px-1">
                    <span className="text-[10px] text-slate-400">{formatTime(msg.thoiGian)}</span>
                    <button
                      onClick={() => void copyMsg(msg.id, msg.content)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-slate-600"
                    >
                      {copied === msg.id
                        ? <Check size={12} className="text-emerald-500" />
                        : <Copy size={12} />}
                    </button>
                  </div>
                </div>

                {/* Avatar User */}
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-lg bg-[#8B1A1A] flex items-center justify-center shrink-0 mt-1 text-xs font-bold text-white">
                    CB
                  </div>
                )}
              </div>
            ))}

            {/* Streaming bubble */}
            {isStreaming && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-lg bg-[#1E3A5F] flex items-center justify-center shrink-0 mt-1">
                  <Bot size={15} className="text-white" />
                </div>
                <div className="max-w-[85%]">
                  <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-white border border-slate-100 shadow-sm text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                    {streamText
                      ? <>{streamText}<span className="inline-block w-0.5 h-4 bg-[#1E3A5F] ml-0.5 animate-pulse align-middle" /></>
                      : (
                        <div className="flex items-center gap-2 text-slate-400">
                          <Loader2 size={14} className="animate-spin" />
                          <span>Đang suy nghĩ...</span>
                        </div>
                      )
                    }
                  </div>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-700 max-w-[85%]">
                <AlertCircle size={14} />
                <span>{error}</span>
                <button
                  onClick={() => setError(null)}
                  className="ml-auto text-red-400 hover:text-red-600 underline text-xs"
                >
                  Đóng
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* ── Gợi ý nhanh (khi có tin nhắn) ──────────────── */}
      {coTinNhan && !isStreaming && (
        <div className="px-6 py-2 border-t border-slate-50 bg-slate-50/50 shrink-0">
          <div className="flex gap-2 overflow-x-auto pb-1 max-w-4xl mx-auto">
            {GOI_Y.slice(0, 4).map((g) => (
              <button
                key={g.title}
                onClick={() => void guiTinNhan(g.prompt)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-xs text-slate-600 hover:border-[#1E3A5F] hover:text-[#1E3A5F] whitespace-nowrap transition-colors shrink-0"
              >
                <span>{g.icon}</span>
                {g.title}
                <ChevronRight size={10} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Input area ──────────────────────────────────── */}
      <div className="px-6 py-4 border-t border-slate-100 bg-white shrink-0">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end gap-3 bg-slate-50 rounded-2xl border border-slate-200 focus-within:border-[#1E3A5F] focus-within:ring-1 focus-within:ring-[#1E3A5F]/20 transition-all px-4 py-3">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={onInput}
              onKeyDown={onKeyDown}
              placeholder={isStreaming ? 'AI đang trả lời...' : 'Nhập câu hỏi... (Enter để gửi, Shift+Enter để xuống dòng)'}
              disabled={isStreaming || dangTaiNgC}
              rows={1}
              className="flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 resize-none focus:outline-none disabled:opacity-50 min-h-[24px] max-h-[160px]"
              style={{ height: '24px' }}
            />

            <button
              onClick={() => void guiTinNhan(input)}
              disabled={!input.trim() || isStreaming || dangTaiNgC}
              className="w-8 h-8 rounded-lg bg-[#1E3A5F] text-white flex items-center justify-center hover:bg-[#2d5a9e] transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
              {isStreaming
                ? <Loader2 size={15} className="animate-spin" />
                : <Send size={15} />
              }
            </button>
          </div>

          <p className="text-center text-[10px] text-slate-300 mt-2">
            Trợ lý AI có thể mắc lỗi. Hãy kiểm tra thông tin quan trọng trước khi sử dụng.
          </p>
        </div>
      </div>
    </div>
  )
}
