'use client'

import { useState, useTransition } from 'react'
import toast from 'react-hot-toast'
import {
  User, Phone, Check, X, Loader2, Home, Clock, ArrowRight, Pencil,
} from 'lucide-react'
import { duyetYeuCau, tuChoiYeuCau, type YeuCauItem } from './actions'

const LABEL: Record<string, string> = {
  so_dien_thoai: 'Số điện thoại', email: 'Email', nghe_nghiep: 'Nghề nghiệp',
  noi_lam_viec: 'Nơi làm việc', tinh_trang_hon_nhan: 'Tình trạng hôn nhân',
  nguyen_quan: 'Nguyên quán', noi_sinh: 'Nơi sinh', dan_toc: 'Dân tộc', ton_giao: 'Tôn giáo',
  trinh_do_hoc_van: 'Trình độ học vấn', trinh_do_chuyen_mon: 'Trình độ chuyên môn',
}
const HON_NHAN: Record<string, string> = {
  DOC_THAN: 'Độc thân', DA_KET_HON: 'Đã kết hôn', LY_HON: 'Ly hôn', GOA: 'Góa',
}

function hienThi(k: string, v: unknown): string {
  if (v === null || v === undefined || v === '') return '(trống)'
  if (k === 'tinh_trang_hon_nhan') return HON_NHAN[String(v)] ?? String(v)
  return String(v)
}

export default function DuyetClient({ initial }: { initial: YeuCauItem[] }) {
  const [items, setItems] = useState(initial)

  function remove(id: string) {
    setItems(prev => prev.filter(i => i.id !== id))
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
          <Check size={30} className="text-emerald-500" />
        </div>
        <h3 className="font-bold text-slate-800">Không có yêu cầu chờ duyệt</h3>
        <p className="text-sm text-slate-500 mt-1">Tất cả yêu cầu tự khai của người dân đã được xử lý.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {items.map(yc => <YeuCauCard key={yc.id} yc={yc} onResolved={() => remove(yc.id)} />)}
    </div>
  )
}

function YeuCauCard({ yc, onResolved }: { yc: YeuCauItem; onResolved: () => void }) {
  const [edited, setEdited] = useState<Record<string, string>>({ ...yc.du_lieu_moi })
  const [rejecting, setRejecting] = useState(false)
  const [lyDo, setLyDo] = useState('')
  const [pending, start] = useTransition()

  const keys = Object.keys(yc.du_lieu_moi)

  function approve() {
    start(async () => {
      const res = await duyetYeuCau(yc.id, edited)
      if (res.success) { toast.success(res.message); onResolved() }
      else toast.error(res.message)
    })
  }

  function reject() {
    start(async () => {
      const res = await tuChoiYeuCau(yc.id, lyDo)
      if (res.success) { toast.success(res.message); onResolved() }
      else toast.error(res.message)
    })
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-slate-100 bg-slate-50/50">
        <div className="w-10 h-10 rounded-full bg-[#1E3A5F]/10 flex items-center justify-center shrink-0">
          <User size={17} className="text-[#1E3A5F]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-slate-800 text-sm">{yc.ho_ten}</p>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Home size={11} /> {yc.chu_ho}
            {yc.nguoi_gui_sdt && <><span>·</span><Phone size={11} /> {yc.nguoi_gui_sdt}</>}
          </div>
        </div>
        <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-1 rounded-full font-semibold flex items-center gap-1 shrink-0">
          <Clock size={10} /> Chờ duyệt
        </span>
      </div>

      {/* So sánh cũ → mới + cho phép chỉnh */}
      <div className="p-4 space-y-3">
        {keys.map(k => (
          <div key={k} className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center text-sm">
            <div className="min-w-0">
              <p className="text-[10px] text-slate-400 mb-0.5">{LABEL[k] ?? k} (hiện tại)</p>
              <p className="text-slate-400 text-xs truncate">{hienThi(k, yc.du_lieu_cu[k])}</p>
            </div>
            <ArrowRight size={14} className="text-slate-300 shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] text-emerald-600 mb-0.5 flex items-center gap-1"><Pencil size={9} /> Đề xuất mới</p>
              <input
                value={edited[k] ?? ''}
                onChange={e => setEdited(prev => ({ ...prev, [k]: e.target.value }))}
                className="w-full px-2.5 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50/30 text-sm text-slate-800 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Hành động */}
      {!rejecting ? (
        <div className="flex items-center gap-2 p-4 border-t border-slate-100">
          <button onClick={approve} disabled={pending}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 disabled:opacity-60 transition-all">
            {pending ? <Loader2 size={14} className="animate-spin" /> : <Check size={15} />}
            Duyệt & cập nhật
          </button>
          <button onClick={() => setRejecting(true)} disabled={pending}
            className="px-4 py-2.5 border border-slate-200 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-all">
            Từ chối
          </button>
        </div>
      ) : (
        <div className="p-4 border-t border-slate-100 bg-red-50/30">
          <input value={lyDo} onChange={e => setLyDo(e.target.value)} placeholder="Lý do từ chối (tùy chọn)"
            className="w-full px-3 py-2 rounded-lg border border-red-200 text-sm mb-2 focus:outline-none focus:border-red-400" />
          <div className="flex gap-2">
            <button onClick={reject} disabled={pending}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 disabled:opacity-60 transition-all">
              {pending ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
              Xác nhận từ chối
            </button>
            <button onClick={() => setRejecting(false)} className="px-4 py-2 text-slate-500 text-sm font-medium">Hủy</button>
          </div>
        </div>
      )}
    </div>
  )
}
