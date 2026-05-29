'use client'

import { useState, useTransition } from 'react'
import {
  MessageSquare, Users, Send, Clock, CheckCircle,
  XCircle, Copy, Inbox, Reply, AlertCircle, RefreshCw,
  ExternalLink,
} from 'lucide-react'
import { traLoiTinNhan } from './actions'

// ─── Kiểu dữ liệu ─────────────────────────────────────────────
interface ZaloMessage {
  id:           string
  direction:    'INBOUND' | 'OUTBOUND'
  zalo_user_id: string
  display_name: string | null
  noi_dung:     string
  trang_thai:   string
  created_at:   string
}

interface ZaloBroadcast {
  id:           string
  tieu_de:      string
  trang_thai:   string
  kenh:         string[]
  created_at:   string
  sent_at:      string | null
  copied_at:    string | null
  loai:         string
}

interface Props {
  messages:   ZaloMessage[]
  broadcasts: ZaloBroadcast[]
  followers:  number
  oaActive:   boolean
}

// ─── Badge trạng thái broadcast ───────────────────────────────
const TRANG_THAI_BCAST: Record<string, { label: string; color: string }> = {
  DRAFT:     { label: 'Nháp',          color: 'text-slate-500 bg-slate-100' },
  SCHEDULED: { label: 'Lên lịch',      color: 'text-blue-600 bg-blue-50' },
  SENDING:   { label: 'Đang gửi',      color: 'text-amber-600 bg-amber-50' },
  SENT:      { label: 'Đã gửi',        color: 'text-green-600 bg-green-50' },
  FAILED:    { label: 'Thất bại',      color: 'text-red-600 bg-red-50' },
  COPIED:    { label: 'Đã copy Group', color: 'text-emerald-600 bg-emerald-50' },
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
  })
}

// ─── Hộp thư đến ─────────────────────────────────────────────
function InboxPanel({ messages }: { messages: ZaloMessage[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [replyText, setReplyText]   = useState('')
  const [isPending, startTr]        = useTransition()
  const [error, setError]           = useState<string | null>(null)
  const [sent, setSent]             = useState<string[]>([])

  const unread = messages.filter(m => m.trang_thai === 'RECEIVED' && !sent.includes(m.id))

  function handleReply(msg: ZaloMessage) {
    if (!replyText.trim()) return
    setError(null)
    startTr(async () => {
      try {
        await traLoiTinNhan({
          userId:    msg.zalo_user_id,
          text:      replyText,
          messageId: msg.id,
        })
        setSent(prev => [...prev, msg.id])
        setReplyText('')
        setSelectedId(null)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Gửi thất bại')
      }
    })
  }

  if (messages.length === 0) {
    return (
      <div className="text-center py-10 text-slate-400">
        <Inbox size={40} className="mx-auto mb-3 opacity-20" />
        <p className="text-sm">Chưa có tin nhắn nào</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {unread.length > 0 && (
        <div className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
          {unread.length} tin nhắn chờ trả lời
        </div>
      )}

      {messages.map(msg => {
        const isReplied = sent.includes(msg.id) || msg.trang_thai === 'REPLIED'
        const isSelected = selectedId === msg.id

        return (
          <div
            key={msg.id}
            className={`rounded-xl border p-3.5 transition-colors cursor-pointer ${
              isSelected
                ? 'border-blue-300 bg-blue-50'
                : isReplied
                ? 'border-slate-100 bg-slate-50 opacity-60'
                : 'border-amber-200 bg-amber-50/50 hover:bg-amber-50'
            }`}
            onClick={() => setSelectedId(isSelected ? null : msg.id)}
          >
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                {(msg.display_name ?? 'Z').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-700 truncate">
                    {msg.display_name ?? msg.zalo_user_id}
                  </span>
                  <span className="text-[10px] text-slate-400 shrink-0">
                    {formatTime(msg.created_at)}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{msg.noi_dung}</p>

                {isSelected && (
                  <div className="mt-3 space-y-2" onClick={e => e.stopPropagation()}>
                    <textarea
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      rows={3}
                      placeholder="Soạn câu trả lời..."
                      className="w-full border border-blue-200 rounded-lg px-2.5 py-2 text-xs
                                 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                    />
                    {error && <p className="text-xs text-red-600">{error}</p>}
                    <button
                      type="button"
                      onClick={() => handleReply(msg)}
                      disabled={isPending || !replyText.trim()}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600
                                 text-white text-xs font-bold rounded-lg hover:bg-blue-700
                                 disabled:opacity-50 transition-colors"
                    >
                      {isPending ? <RefreshCw size={11} className="animate-spin" /> : <Reply size={11} />}
                      Gửi trả lời
                    </button>
                  </div>
                )}
              </div>

              {isReplied && (
                <CheckCircle size={14} className="text-green-500 shrink-0 mt-0.5" />
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Lịch sử broadcast ────────────────────────────────────────
function BroadcastHistory({ broadcasts }: { broadcasts: ZaloBroadcast[] }) {
  if (broadcasts.length === 0) {
    return (
      <div className="text-center py-10 text-slate-400">
        <Send size={40} className="mx-auto mb-3 opacity-20" />
        <p className="text-sm">Chưa có broadcast nào</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {broadcasts.map(bc => {
        const cfg = TRANG_THAI_BCAST[bc.trang_thai] ?? { label: bc.trang_thai, color: 'text-slate-500 bg-slate-100' }
        const kenhLabel = bc.kenh?.join(' + ') ?? '-'

        return (
          <div key={bc.id} className="border border-slate-100 rounded-xl p-3.5 hover:bg-slate-50 transition-colors">
            <div className="flex items-start gap-2.5">
              <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${cfg.color}`}>
                {cfg.label}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-800 truncate">{bc.tieu_de}</p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="text-[10px] text-slate-400">{formatTime(bc.created_at)}</span>
                  <span className="text-[10px] text-slate-400">Kênh: {kenhLabel}</span>
                  {bc.sent_at && (
                    <span className="text-[10px] text-green-600">
                      Gửi: {formatTime(bc.sent_at)}
                    </span>
                  )}
                  {bc.copied_at && !bc.sent_at && (
                    <span className="text-[10px] text-emerald-600">
                      Copy: {formatTime(bc.copied_at)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Main Client Component ────────────────────────────────────
export default function ZaloDashboardClient({ messages, broadcasts, followers, oaActive }: Props) {
  const [tab, setTab] = useState<'inbox' | 'history'>('inbox')

  const inboxCount = messages.filter(m => m.trang_thai === 'RECEIVED').length

  return (
    <div className="space-y-4">
      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{followers}</div>
          <div className="text-xs text-slate-500 mt-0.5 flex items-center justify-center gap-1">
            <Users size={11} />
            Người theo dõi OA
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <div className="text-2xl font-bold text-amber-600">{inboxCount}</div>
          <div className="text-xs text-slate-500 mt-0.5 flex items-center justify-center gap-1">
            <MessageSquare size={11} />
            Chờ trả lời
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <div className="text-2xl font-bold text-emerald-600">{broadcasts.length}</div>
          <div className="text-xs text-slate-500 mt-0.5 flex items-center justify-center gap-1">
            <Send size={11} />
            Broadcast
          </div>
        </div>
      </div>

      {/* Tab: hộp thư + lịch sử */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="flex border-b border-slate-100">
          {[
            { key: 'inbox',   label: 'Hộp thư đến', badge: inboxCount },
            { key: 'history', label: 'Lịch sử gửi',  badge: 0 },
          ].map(t => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key as typeof tab)}
              className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
                tab === t.key
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {t.label}
              {t.badge > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="p-4">
          {tab === 'inbox'   && <InboxPanel messages={messages} />}
          {tab === 'history' && <BroadcastHistory broadcasts={broadcasts} />}
        </div>
      </div>

      {/* OA follow link */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-slate-700">Link theo dõi OA</p>
            <p className="text-xs text-slate-500 mt-0.5">
              {oaActive
                ? 'Chia sẻ link này để người dân theo dõi Zalo OA khu phố'
                : 'OA chưa được duyệt — link sẽ có sau khi kích hoạt'}
            </p>
          </div>
          {oaActive && process.env.NEXT_PUBLIC_ZALO_OA_URL && (
            <a
              href={process.env.NEXT_PUBLIC_ZALO_OA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-bold text-blue-600
                         hover:text-blue-700 border border-blue-200 px-3 py-2 rounded-lg"
            >
              <ExternalLink size={13} />
              Xem OA
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
