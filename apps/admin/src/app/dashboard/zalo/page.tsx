import type { Metadata } from 'next'
import { MessageSquareMore, Users, Radio, Info } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import BroadcastComposer   from './BroadcastComposer'
import GroupComposer        from './GroupComposer'
import ZaloDashboardClient  from './ZaloDashboardClient'

export const metadata: Metadata = {
  title: 'Zalo — KP25 Admin',
  description: 'Quản lý giao tiếp cộng đồng qua Zalo OA và Zalo Group',
}

export const revalidate = 0

// ─── Trạng thái OA ────────────────────────────────────────────
async function getOAConfig() {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('zalo_oa_config')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    return data
  } catch { return null }
}

// ─── Followers ────────────────────────────────────────────────
async function getFollowers(): Promise<number> {
  try {
    const supabase = await createClient()
    const { count } = await supabase
      .from('zalo_subscribers')
      .select('*', { count: 'exact', head: true })
      .eq('following', true)
    return count ?? 0
  } catch { return 0 }
}

// ─── Broadcasts gần đây ───────────────────────────────────────
async function getBroadcasts() {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('zalo_broadcasts')
      .select('id, tieu_de, trang_thai, kenh, loai, created_at, sent_at, copied_at')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(20)
    return data ?? []
  } catch { return [] }
}

// ─── Tin nhắn inbound gần đây ────────────────────────────────
async function getMessages() {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('zalo_messages')
      .select('id, direction, zalo_user_id, display_name, noi_dung, trang_thai, created_at')
      .eq('direction', 'INBOUND')
      .order('created_at', { ascending: false })
      .limit(30)
    return data ?? []
  } catch { return [] }
}

// ─── Page ─────────────────────────────────────────────────────
export default async function ZaloPage() {
  const [oaConfig, followers, broadcasts, messages] = await Promise.all([
    getOAConfig(),
    getFollowers(),
    getBroadcasts(),
    getMessages(),
  ])

  // OA "active" = trang_thai ACTIVE + env token set
  const oaActive =
    oaConfig?.trang_thai === 'ACTIVE' &&
    Boolean(process.env.ZALO_OA_ACCESS_TOKEN)

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-md">
            <MessageSquareMore size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Giao tiếp Zalo</h1>
            <p className="text-slate-500 text-sm">
              OA + Group cộng đồng · Khu phố 25
            </p>
          </div>
        </div>

        {/* Badge trạng thái OA */}
        <div className="flex items-center gap-2">
          {oaActive ? (
            <span className="flex items-center gap-1.5 text-xs font-bold bg-green-100 text-green-700 px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              OA Đang hoạt động
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs font-bold bg-amber-100 text-amber-700 px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              OA Chờ phê duyệt
            </span>
          )}
        </div>
      </div>

      {/* ── Banner thông tin OA ── */}
      {!oaActive && (
        <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-2xl">
          <Info size={18} className="text-blue-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-blue-800">Zalo OA đang chờ phê duyệt</p>
            <p className="text-sm text-blue-700 mt-1 leading-relaxed">
              Khi OA được Zalo chấp thuận, hệ thống sẽ tự động kích hoạt tính năng broadcast và
              nhận tin nhắn. Trong thời gian chờ, bạn có thể dùng{' '}
              <strong>Group Composer</strong> để soạn và chia sẻ tin nhắn vào Group cộng đồng.
            </p>
            <p className="text-xs text-blue-600 mt-2">
              Tên OA đăng ký: <strong>{oaConfig?.oa_name ?? 'Khu phố 25 - Long Trường'}</strong>
              {oaConfig?.oa_id && oaConfig.oa_id !== 'pending_oa_id' && (
                <> · OA ID: <strong>{oaConfig.oa_id}</strong></>
              )}
            </p>
          </div>
        </div>
      )}

      {/* ── Grid chính ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Cột trái: Composer ─────────────────────────────────── */}
        <div className="xl:col-span-2 space-y-6">

          {/* Group Composer — luôn hiển thị */}
          <GroupComposer />

          {/* OA Broadcast Composer */}
          <BroadcastComposer oaActive={oaActive} />

        </div>

        {/* Cột phải: Stats + hộp thư + lịch sử ──────────────────── */}
        <div className="xl:col-span-1">
          <ZaloDashboardClient
            messages={messages as Parameters<typeof ZaloDashboardClient>[0]['messages']}
            broadcasts={broadcasts as Parameters<typeof ZaloDashboardClient>[0]['broadcasts']}
            followers={followers}
            oaActive={oaActive}
          />
        </div>
      </div>

      {/* ── Hướng dẫn Group ── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
          <Users size={16} className="text-emerald-500" />
          Hướng dẫn gửi tin qua Group Zalo
        </h3>
        <ol className="space-y-2 text-sm text-slate-600">
          {[
            'Chọn loại tin nhắn và điền nội dung trong bảng "Soạn tin nhắn Group Zalo" bên trái.',
            'Nhấn "Xem trước" để kiểm tra định dạng trước khi gửi.',
            'Nhấn "Copy tin nhắn" — nội dung sẽ được copy vào clipboard và lưu vào lịch sử.',
            'Mở ứng dụng Zalo → vào Group "KP25 – Long Trường" → dán và gửi.',
            'Hệ thống tự ghi nhận trạng thái "Đã copy Group" vào lịch sử.',
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <span className="shrink-0 w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center mt-0.5">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>

    </div>
  )
}
