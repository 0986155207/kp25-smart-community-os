'use client'

import { useState } from 'react'
import { User, UserPlus, Loader2, Check, Phone, ChevronRight } from 'lucide-react'

interface NhanKhau { id: string; ho_ten: string; quan_he: string }

interface Props {
  token: string
  nhanKhau: NhanKhau[]
}

// Các trường người dân được tự khai
const FIELDS: { key: string; label: string; type: 'text' | 'date' | 'select'; options?: { v: string; l: string }[] }[] = [
  { key: 'so_dien_thoai',       label: 'Số điện thoại', type: 'text' },
  { key: 'nghe_nghiep',         label: 'Nghề nghiệp', type: 'text' },
  { key: 'noi_lam_viec',        label: 'Nơi làm việc / học tập', type: 'text' },
  { key: 'tinh_trang_hon_nhan', label: 'Tình trạng hôn nhân', type: 'select', options: [
    { v: 'DOC_THAN', l: 'Độc thân' }, { v: 'DA_KET_HON', l: 'Đã kết hôn' }, { v: 'LY_HON', l: 'Ly hôn' }, { v: 'GOA', l: 'Góa' },
  ] },
  { key: 'nguyen_quan',  label: 'Nguyên quán', type: 'text' },
  { key: 'noi_sinh',     label: 'Nơi sinh', type: 'text' },
  { key: 'dan_toc',      label: 'Dân tộc', type: 'text' },
  { key: 'ton_giao',     label: 'Tôn giáo', type: 'text' },
  { key: 'email',        label: 'Email', type: 'text' },
]

type Mode = 'pick' | 'form' | 'done'

export default function TuKhaiForm({ token, nhanKhau }: Props) {
  const [mode, setMode]       = useState<Mode>('pick')
  const [picked, setPicked]   = useState<NhanKhau | null>(null)
  const [sdt, setSdt]         = useState('')
  const [form, setForm]       = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [err, setErr]         = useState('')

  function setField(k: string, v: string) {
    setForm(prev => ({ ...prev, [k]: v }))
  }

  async function submit() {
    setErr('')
    if (!sdt || !/^0\d{9}$/.test(sdt)) { setErr('Số điện thoại không hợp lệ (10 chữ số)'); return }
    const duLieuMoi = Object.fromEntries(Object.entries(form).filter(([, v]) => v.trim() !== ''))
    if (Object.keys(duLieuMoi).length === 0) { setErr('Vui lòng điền ít nhất một thông tin'); return }

    setLoading(true)
    try {
      const res = await fetch('/api/dan-cu/tu-khai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          loai: 'CAP_NHAT',
          nhanKhauId: picked?.id,
          hoTen: picked?.ho_ten ?? '',
          nguoiGuiSdt: sdt,
          duLieuMoi,
        }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) { setErr(json.message ?? 'Lỗi gửi yêu cầu'); return }
      setMode('done')
    } catch {
      setErr('Lỗi kết nối. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  // ── Done ──
  if (mode === 'done') {
    return (
      <div className="text-center py-6">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
          <Check size={30} className="text-emerald-600" />
        </div>
        <h3 className="font-bold text-slate-800 text-lg">Đã gửi yêu cầu!</h3>
        <p className="text-sm text-slate-500 mt-2 leading-relaxed">
          Cán bộ khu phố sẽ xem xét và xác nhận thông tin của bạn trong thời gian sớm nhất.
        </p>
        <button onClick={() => { setMode('pick'); setPicked(null); setForm({}); setSdt('') }}
          className="mt-5 text-sm text-[#1E3A5F] font-semibold hover:underline">
          Khai thêm thông tin khác
        </button>
      </div>
    )
  }

  // ── Pick person ──
  if (mode === 'pick') {
    return (
      <div>
        <h2 className="font-bold text-slate-800 mb-1">Chọn người cần cập nhật</h2>
        <p className="text-sm text-slate-400 mb-4">Bạn là ai trong hộ này?</p>
        <div className="space-y-2">
          {nhanKhau.map(nk => (
            <button key={nk.id} onClick={() => { setPicked(nk); setMode('form') }}
              className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-[#1E3A5F] hover:shadow-sm transition-all text-left">
              <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                <User size={16} className="text-slate-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 text-sm">{nk.ho_ten}</p>
                <p className="text-xs text-slate-400">{nk.quan_he}</p>
              </div>
              <ChevronRight size={15} className="text-slate-300" />
            </button>
          ))}
          {nhanKhau.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-4">Hộ này chưa có nhân khẩu nào trong hệ thống.</p>
          )}
        </div>
      </div>
    )
  }

  // ── Form ──
  return (
    <div>
      <button onClick={() => setMode('pick')} className="text-sm text-slate-500 hover:text-slate-700 mb-3">← Chọn lại người</button>

      <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 mb-4">
        <User size={16} className="text-slate-500" />
        <div>
          <p className="font-bold text-sm text-slate-800">{picked?.ho_ten}</p>
          <p className="text-xs text-slate-400">{picked?.quan_he}</p>
        </div>
      </div>

      {/* SĐT xác thực */}
      <div className="mb-4">
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          Số điện thoại của bạn <span className="text-red-500">*</span>
          <span className="font-normal text-slate-400"> (để cán bộ liên hệ xác minh)</span>
        </label>
        <div className="relative">
          <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="tel" value={sdt} onChange={e => setSdt(e.target.value.replace(/\D/g, '').slice(0, 10))}
            placeholder="Nhập số điện thoại của bạn"
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/10" />
        </div>
      </div>

      <p className="text-xs font-semibold text-slate-500 mb-2">Điền thông tin cần cập nhật (để trống nếu không đổi)</p>
      <div className="space-y-3">
        {FIELDS.map(f => (
          <div key={f.key}>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">{f.label}</label>
            {f.type === 'select' ? (
              <select value={form[f.key] ?? ''} onChange={e => setField(f.key, e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/10">
                <option value="">— Chọn —</option>
                {f.options?.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
              </select>
            ) : (
              <input type={f.type} value={form[f.key] ?? ''} onChange={e => setField(f.key, e.target.value)}
                placeholder={f.label}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/10" />
            )}
          </div>
        ))}
      </div>

      {err && <p className="text-xs text-red-500 mt-3">{err}</p>}

      <button onClick={submit} disabled={loading}
        className="w-full mt-4 py-3 bg-[#1E3A5F] text-white font-bold text-sm rounded-xl hover:bg-[#162d4a] disabled:opacity-60 flex items-center justify-center gap-2 transition-all">
        {loading ? <><Loader2 size={15} className="animate-spin" /> Đang gửi...</> : <><UserPlus size={15} /> Gửi yêu cầu cập nhật</>}
      </button>
    </div>
  )
}
