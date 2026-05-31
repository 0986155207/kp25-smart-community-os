'use client'

import { useState, useTransition } from 'react'
import toast from 'react-hot-toast'
import {
  Home, User, Phone, Clock, Check, X, Loader2, MapPin, Users, Trash2,
} from 'lucide-react'
import { duyetHoMoi, tuChoiHoMoi, type HoMoiItem, type ThanhVienKhai } from './actions'

const GT: Record<string, string> = { NAM: 'Nam', NU: 'Nữ', KHAC: 'Khác' }

export default function DuyetHoMoiClient({ initial }: { initial: HoMoiItem[] }) {
  const [items, setItems] = useState(initial)
  function remove(id: string) { setItems(prev => prev.filter(i => i.id !== id)) }

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
          <Check size={30} className="text-emerald-500" />
        </div>
        <h3 className="font-bold text-slate-800">Không có đăng ký chờ duyệt</h3>
        <p className="text-sm text-slate-500 mt-1">Tất cả đăng ký hộ dân mới đã được xử lý.</p>
      </div>
    )
  }

  return <div className="space-y-4">{items.map(it => <Card key={it.id} item={it} onResolved={() => remove(it.id)} />)}</div>
}

function Card({ item, onResolved }: { item: HoMoiItem; onResolved: () => void }) {
  const [chuHo, setChuHo]         = useState(item.chu_ho)
  const [diaChi, setDiaChi]       = useState(item.dia_chi)
  const [sdt, setSdt]             = useState(item.so_dien_thoai ?? '')
  const [to, setTo]               = useState(item.to_dan_pho ?? '')
  const [loaiCuTru, setLoaiCuTru] = useState(item.loai_cu_tru)
  const [tv, setTv]               = useState<ThanhVienKhai[]>(item.thanh_vien)
  const [rejecting, setRejecting] = useState(false)
  const [lyDo, setLyDo]           = useState('')
  const [pending, start]          = useTransition()

  function setTvField(i: number, k: keyof ThanhVienKhai, v: string) {
    setTv(prev => prev.map((t, idx) => idx === i ? { ...t, [k]: v } : t))
  }
  function xoaTv(i: number) { setTv(prev => prev.filter((_, idx) => idx !== i)) }

  function approve() {
    start(async () => {
      const res = await duyetHoMoi(item.id, {
        chu_ho: chuHo, dia_chi: diaChi, so_dien_thoai: sdt, to_dan_pho: to, loai_cu_tru: loaiCuTru, thanh_vien: tv,
      })
      if (res.success) { toast.success(res.message); onResolved() } else toast.error(res.message)
    })
  }
  function reject() {
    start(async () => {
      const res = await tuChoiHoMoi(item.id, lyDo)
      if (res.success) { toast.success(res.message); onResolved() } else toast.error(res.message)
    })
  }

  const inp = 'w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/10'

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-slate-100 bg-slate-50/50">
        <div className="w-10 h-10 rounded-xl bg-[#1E3A5F]/10 flex items-center justify-center shrink-0">
          <Home size={18} className="text-[#1E3A5F]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-slate-800 text-sm">{item.chu_ho}</p>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Users size={11} /> {item.thanh_vien.length} thành viên
            {item.nguoi_khai_sdt && <><span>·</span><Phone size={11} /> {item.nguoi_khai_sdt}</>}
          </div>
        </div>
        <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-1 rounded-full font-semibold flex items-center gap-1 shrink-0">
          <Clock size={10} /> Chờ duyệt
        </span>
      </div>

      <div className="p-4 space-y-4">
        {/* Thông tin hộ */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Chủ hộ</label>
            <input value={chuHo} onChange={e => setChuHo(e.target.value)} className={inp} />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Số điện thoại</label>
            <input value={sdt} onChange={e => setSdt(e.target.value)} className={inp} />
          </div>
          <div className="col-span-2">
            <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1"><MapPin size={10} /> Địa chỉ</label>
            <input value={diaChi} onChange={e => setDiaChi(e.target.value)} className={inp} />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Tổ dân phố</label>
            <input value={to} onChange={e => setTo(e.target.value)} className={inp} />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Hình thức</label>
            <select value={loaiCuTru} onChange={e => setLoaiCuTru(e.target.value)} className={inp}>
              <option value="THUONG_TRU">Thường trú</option>
              <option value="TAM_TRU">Tạm trú</option>
            </select>
          </div>
        </div>

        {/* Thành viên */}
        <div>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-2">Thành viên ({tv.length})</p>
          <div className="space-y-2">
            {tv.map((t, i) => (
              <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <User size={14} className="text-slate-400 shrink-0" />
                <input value={t.ho_ten} onChange={e => setTvField(i, 'ho_ten', e.target.value)}
                  className="flex-1 min-w-0 bg-transparent text-sm font-medium text-slate-800 focus:outline-none" placeholder="Họ tên" />
                <span className="text-xs text-slate-400 shrink-0">{t.quan_he}</span>
                <span className="text-xs text-slate-400 shrink-0 hidden sm:inline">{GT[t.gioi_tinh] ?? t.gioi_tinh}</span>
                {t.cccd && <span className="text-[10px] text-slate-400 font-mono shrink-0 hidden md:inline">{t.cccd}</span>}
                {tv.length > 1 && (
                  <button onClick={() => xoaTv(i)} className="text-slate-300 hover:text-red-500 shrink-0"><Trash2 size={13} /></button>
                )}
              </div>
            ))}
          </div>
        </div>

        {item.ghi_chu && (
          <p className="text-xs text-slate-500 italic">Ghi chú: {item.ghi_chu}</p>
        )}
      </div>

      {/* Hành động */}
      {!rejecting ? (
        <div className="flex items-center gap-2 p-4 border-t border-slate-100">
          <button onClick={approve} disabled={pending}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 disabled:opacity-60 transition-all">
            {pending ? <Loader2 size={14} className="animate-spin" /> : <Check size={15} />}
            Duyệt & tạo hồ sơ
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
              {pending ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />} Xác nhận từ chối
            </button>
            <button onClick={() => setRejecting(false)} className="px-4 py-2 text-slate-500 text-sm font-medium">Hủy</button>
          </div>
        </div>
      )}
    </div>
  )
}
