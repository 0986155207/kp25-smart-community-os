'use client'

import { useState, useTransition } from 'react'
import toast from 'react-hot-toast'
import {
  User, Home, ChevronDown, Check, Loader2, Save,
  Sparkles, AlertCircle, Filter, X,
} from 'lucide-react'
import { capNhatHoSoNhanh, type HoSoThieuItem } from './actions'
import { TRUONG_HO_SO } from './constants'

// ─── Config trường để render input ───────────────────────────
const FIELD_META: Record<string, { label: string; type: 'text' | 'date' | 'select'; options?: { v: string; l: string }[] }> = {
  ho_ten:              { label: 'Họ tên', type: 'text' },
  ngay_sinh:           { label: 'Ngày sinh', type: 'date' },
  gioi_tinh:           { label: 'Giới tính', type: 'select', options: [{ v: 'NAM', l: 'Nam' }, { v: 'NU', l: 'Nữ' }, { v: 'KHAC', l: 'Khác' }] },
  cccd:                { label: 'Số CCCD', type: 'text' },
  cccd_ngay_cap:       { label: 'Ngày cấp CCCD', type: 'date' },
  cccd_noi_cap:        { label: 'Nơi cấp CCCD', type: 'text' },
  quan_he:             { label: 'Quan hệ chủ hộ', type: 'select', options: ['Chủ hộ', 'Vợ / Chồng', 'Con', 'Cha / Mẹ', 'Anh / Chị / Em', 'Ông / Bà', 'Cháu', 'Thành viên khác'].map(q => ({ v: q, l: q })) },
  noi_sinh:            { label: 'Nơi sinh', type: 'text' },
  nguyen_quan:         { label: 'Nguyên quán', type: 'text' },
  dan_toc:             { label: 'Dân tộc', type: 'text' },
  ton_giao:            { label: 'Tôn giáo', type: 'text' },
  tinh_trang_hon_nhan: { label: 'Tình trạng hôn nhân', type: 'select', options: [{ v: 'DOC_THAN', l: 'Độc thân' }, { v: 'DA_KET_HON', l: 'Đã kết hôn' }, { v: 'LY_HON', l: 'Ly hôn' }, { v: 'GOA', l: 'Góa' }] },
  nghe_nghiep:         { label: 'Nghề nghiệp', type: 'text' },
  so_dien_thoai:       { label: 'Số điện thoại', type: 'text' },
}

const LABEL: Record<string, string> = Object.fromEntries(TRUONG_HO_SO.map(t => [t.key, t.label]))

interface Props {
  initialItems: HoSoThieuItem[]
  tong: number
}

export default function HoSoThieuClient({ initialItems, tong }: Props) {
  const [items, setItems]   = useState(initialItems)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  function patchItem(id: string, phanTram: number, patch: Record<string, string | null>) {
    setItems(prev => prev.map(it => {
      if (it.id !== id) return it
      const merged = { ...it, ...patch, phanTram } as Record<string, unknown>
      // recompute thiếu
      const thieu = TRUONG_HO_SO
        .filter(t => { const v = merged[t.key]; return v === null || v === undefined || (typeof v === 'string' && v.trim() === '') })
        .map(t => t.key)
      return { ...merged, thieu } as unknown as HoSoThieuItem
    }))
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
          <Check size={30} className="text-emerald-500" />
        </div>
        <h3 className="font-bold text-slate-800">Tất cả hồ sơ đã đầy đủ!</h3>
        <p className="text-sm text-slate-500 mt-1">Không có hồ sơ nào thiếu thông tin theo bộ lọc hiện tại.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2.5">
      {items.map(item => (
        <HoSoRow
          key={item.id}
          item={item}
          expanded={expandedId === item.id}
          onToggle={() => setExpandedId(expandedId === item.id ? null : item.id)}
          onSaved={patchItem}
        />
      ))}
      {items.length < tong && (
        <p className="text-center text-xs text-slate-400 pt-3">
          Hiển thị {items.length} / {tong} hồ sơ — dùng bộ lọc để thu hẹp
        </p>
      )}
    </div>
  )
}

// ─── 1 dòng hồ sơ ────────────────────────────────────────────
function HoSoRow({ item, expanded, onToggle, onSaved }: {
  item: HoSoThieuItem
  expanded: boolean
  onToggle: () => void
  onSaved: (id: string, phanTram: number, patch: Record<string, string | null>) => void
}) {
  const [form, setForm] = useState<Record<string, string>>({})
  const [saving, startSave] = useTransition()

  // Màu theo độ hoàn thiện
  const ptColor = item.phanTram >= 80 ? 'text-emerald-600 bg-emerald-50'
    : item.phanTram >= 50 ? 'text-amber-600 bg-amber-50'
    : 'text-red-600 bg-red-50'
  const barColor = item.phanTram >= 80 ? 'bg-emerald-500'
    : item.phanTram >= 50 ? 'bg-amber-500'
    : 'bg-red-500'

  function setField(k: string, v: string) {
    setForm(prev => ({ ...prev, [k]: v }))
  }

  function save() {
    // Chỉ gửi các trường đã nhập
    const payload: Record<string, string | null> = {}
    for (const [k, v] of Object.entries(form)) {
      if (v !== undefined && v !== '') payload[k] = v
    }
    if (Object.keys(payload).length === 0) {
      toast.error('Chưa có thông tin nào để lưu')
      return
    }
    startSave(async () => {
      const res = await capNhatHoSoNhanh(item.id, payload)
      if (res.success) {
        toast.success(res.message)
        onSaved(item.id, res.phanTram ?? item.phanTram, payload)
        setForm({})
      } else {
        toast.error(res.message)
      }
    })
  }

  return (
    <div className={`rounded-xl border transition-all ${expanded ? 'border-[#1E3A5F] shadow-sm' : 'border-slate-200'}`}>
      {/* Header row */}
      <button onClick={onToggle} className="w-full flex items-center gap-3 p-3.5 text-left">
        <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
          <User size={16} className="text-slate-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-800 text-sm truncate">{item.ho_ten || '(Chưa có tên)'}</p>
          <p className="text-xs text-slate-400 truncate flex items-center gap-1">
            <Home size={10} /> {item.chu_ho} · {item.dia_chi}
          </p>
        </div>
        {/* Completeness */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="hidden sm:block w-20">
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full ${barColor} rounded-full transition-all`} style={{ width: `${item.phanTram}%` }} />
            </div>
          </div>
          <span className={`text-xs font-bold px-2 py-1 rounded-lg ${ptColor}`}>{item.phanTram}%</span>
          <ChevronDown size={16} className={`text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Missing fields chips (collapsed view) */}
      {!expanded && item.thieu.length > 0 && (
        <div className="px-3.5 pb-3 flex flex-wrap gap-1.5">
          {item.thieu.slice(0, 6).map(k => (
            <span key={k} className="text-[10px] px-2 py-0.5 bg-red-50 text-red-500 rounded-full font-medium">
              Thiếu {LABEL[k]}
            </span>
          ))}
          {item.thieu.length > 6 && (
            <span className="text-[10px] px-2 py-0.5 text-slate-400">+{item.thieu.length - 6} trường</span>
          )}
        </div>
      )}

      {/* Expanded: inline edit form — chỉ hiện trường còn thiếu */}
      {expanded && (
        <div className="border-t border-slate-100 p-4 bg-slate-50/50">
          {item.thieu.length === 0 ? (
            <p className="text-sm text-emerald-600 flex items-center gap-2">
              <Check size={15} /> Hồ sơ đã đầy đủ thông tin.
            </p>
          ) : (
            <>
              <p className="text-xs font-semibold text-slate-500 mb-3 flex items-center gap-1.5">
                <AlertCircle size={12} /> Điền các trường còn thiếu ({item.thieu.length})
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {item.thieu.map(k => {
                  const meta = FIELD_META[k]
                  if (!meta) return null
                  return (
                    <div key={k}>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">{meta.label}</label>
                      {meta.type === 'select' ? (
                        <select
                          value={form[k] ?? ''}
                          onChange={e => setField(k, e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/10"
                        >
                          <option value="">— Chọn —</option>
                          {meta.options?.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                        </select>
                      ) : (
                        <input
                          type={meta.type}
                          value={form[k] ?? ''}
                          onChange={e => setField(k, e.target.value)}
                          placeholder={meta.label}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/10"
                        />
                      )}
                    </div>
                  )
                })}
              </div>
              <div className="flex items-center justify-end gap-2 mt-4">
                <button onClick={save} disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#1E3A5F] text-white text-sm font-semibold rounded-lg hover:bg-[#162d4a] disabled:opacity-60 transition-all">
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  Lưu thông tin
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
