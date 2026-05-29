'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import {
  UserCheck, UserMinus, AlertCircle, CheckCircle2, Layers,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

// ─── Loại sự kiện realtime ────────────────────────────────────
type RealtimeEvent =
  | { table: 'phan_anh';             eventType: 'INSERT'; record: { id: string; tieu_de: string; trang_thai: string } }
  | { table: 'phan_anh';             eventType: 'UPDATE'; record: { id: string; tieu_de: string; trang_thai: string } }
  | { table: 'dang_ky_tam_tru';      eventType: 'INSERT'; record: { id: string; ho_ten: string; dia_chi_tam_tru: string } }
  | { table: 'dang_ky_tam_vang';     eventType: 'INSERT'; record: { id: string; ho_ten: string; dia_chi_tam_vang: string } }
  | { table: 'workflow_assignments'; eventType: 'INSERT'; record: { id: string; ai_tom_tat: string | null; ai_loai: string | null } }

// ─── Label trạng thái ─────────────────────────────────────────
const TRANG_THAI_LABEL: Record<string, string> = {
  MOI:          'Mới',
  DANG_XU_LY:   'Đang xử lý',
  DA_XU_LY:     'Đã xử lý',
  DONG:         'Đã đóng',
}

// ─── Toast renderer ──────────────────────────────────────────
function showToast(evt: RealtimeEvent) {
  let title = ''
  let body  = ''
  let icon: React.ReactNode

  if (evt.table === 'phan_anh' && evt.eventType === 'INSERT') {
    title = 'Phản ánh mới'
    body  = evt.record.tieu_de
    icon  = <AlertCircle size={18} className="text-orange-500" />
  } else if (evt.table === 'phan_anh' && evt.eventType === 'UPDATE') {
    title = 'Cập nhật phản ánh'
    body  = `${evt.record.tieu_de} → ${TRANG_THAI_LABEL[evt.record.trang_thai] ?? evt.record.trang_thai}`
    icon  = <CheckCircle2 size={18} className="text-blue-500" />
  } else if (evt.table === 'dang_ky_tam_tru') {
    title = 'Đăng ký tạm trú mới'
    body  = `${evt.record.ho_ten} · ${evt.record.dia_chi_tam_tru}`
    icon  = <UserCheck size={18} className="text-blue-600" />
  } else if (evt.table === 'dang_ky_tam_vang') {
    title = 'Khai báo tạm vắng mới'
    body  = `${evt.record.ho_ten} · ${evt.record.dia_chi_tam_vang}`
    icon  = <UserMinus size={18} className="text-orange-500" />
  } else if (evt.table === 'workflow_assignments') {
    title = 'Workflow mới — AI đã phân tích'
    body  = evt.record.ai_tom_tat ?? `Loại: ${evt.record.ai_loai ?? '—'}`
    icon  = <Layers size={18} className="text-violet-600" />
  }

  toast.custom(
    (t) => (
      <div
        className={`flex items-start gap-3 bg-white border border-slate-200 shadow-xl rounded-2xl p-4 w-80 transition-all ${
          t.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
        }`}
      >
        {/* Top color bar rendered via border-top trick */}
        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8B1A1A] animate-pulse" />
            <p className="text-[10px] font-bold text-[#8B1A1A] uppercase tracking-wide">Realtime · KP25</p>
          </div>
          <p className="text-sm font-semibold text-slate-800 leading-tight">{title}</p>
          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">{body}</p>
        </div>
        <button
          onClick={() => toast.dismiss(t.id)}
          className="text-slate-300 hover:text-slate-500 transition-colors shrink-0 text-lg leading-none mt-0.5"
          aria-label="Đóng"
        >
          ×
        </button>
      </div>
    ),
    { duration: 7000, position: 'bottom-right' }
  )
}

// ─── Main component ───────────────────────────────────────────
export default function RealtimeNotifier() {
  const router     = useRouter()
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>['channel']> | null>(null)

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel('kp25-admin-realtime', {
        config: { broadcast: { self: false } },
      })
      // ─ Phản ánh: INSERT mới
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'phan_anh' },
        (payload) => {
          showToast({
            table: 'phan_anh',
            eventType: 'INSERT',
            record: payload.new as { id: string; tieu_de: string; trang_thai: string },
          })
          router.refresh()
        }
      )
      // ─ Phản ánh: UPDATE trạng thái
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'phan_anh' },
        (payload) => {
          const oldTT = (payload.old as { trang_thai?: string }).trang_thai
          const newTT = (payload.new as { trang_thai?: string }).trang_thai
          // Chỉ hiển thị toast khi trạng thái thực sự thay đổi
          if (oldTT !== newTT) {
            showToast({
              table: 'phan_anh',
              eventType: 'UPDATE',
              record: payload.new as { id: string; tieu_de: string; trang_thai: string },
            })
          }
          router.refresh()
        }
      )
      // ─ Tạm trú: INSERT mới
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'dang_ky_tam_tru' },
        (payload) => {
          showToast({
            table: 'dang_ky_tam_tru',
            eventType: 'INSERT',
            record: payload.new as { id: string; ho_ten: string; dia_chi_tam_tru: string },
          })
          router.refresh()
        }
      )
      // ─ Tạm vắng: INSERT mới
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'dang_ky_tam_vang' },
        (payload) => {
          showToast({
            table: 'dang_ky_tam_vang',
            eventType: 'INSERT',
            record: payload.new as { id: string; ho_ten: string; dia_chi_tam_vang: string },
          })
          router.refresh()
        }
      )
      // ─ Workflow: AI tạo mới
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'workflow_assignments' },
        (payload) => {
          showToast({
            table: 'workflow_assignments',
            eventType: 'INSERT',
            record: payload.new as { id: string; ai_tom_tat: string | null; ai_loai: string | null },
          })
          router.refresh()
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[KP25 Realtime] Kết nối thành công')
        }
      })

    channelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
    }
  }, [router])

  // Component này không render gì ra UI — chỉ side-effects
  return null
}

