'use client'

import { useState } from 'react'
import { FileText, Loader2, ChevronDown, Download } from 'lucide-react'

interface Props {
  filter?: string
  totalCount: number
}

const FILTER_LABELS: Record<string, string> = {
  all:          'Tất cả',
  tu_80:        'Từ 80 tuổi',
  co_don:       'Sống cô đơn',
  tro_cap:      'Nhận trợ cấp',
  can_cham_soc: 'Cần chăm sóc',
}

export default function ExportWordButton({ filter = 'all', totalCount }: Props) {
  const [loading,  setLoading]  = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  async function handleExport(selectedFilter: string) {
    setMenuOpen(false)
    setLoading(true)
    try {
      const url = `/api/nct/export-word?filter=${selectedFilter}`
      const res = await fetch(url)
      if (!res.ok) throw new Error('Lỗi server')

      const blob = await res.blob()
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)

      // Lấy tên file từ header nếu có
      const cd = res.headers.get('content-disposition') ?? ''
      const match = cd.match(/filename\*?=(?:UTF-8'')?(.+)/i)
      a.download = match ? decodeURIComponent(match[1]!.replace(/['"]/g, '')) : `DS_NCT_KP25.docx`

      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(a.href)
    } catch (err) {
      alert('Không thể tạo file Word. Vui lòng thử lại.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const currentFilter = filter || 'all'

  return (
    <div className="relative">
      <div className="flex items-stretch rounded-xl overflow-hidden border border-emerald-300 shadow-sm">
        {/* Nút chính — xuất theo filter đang chọn */}
        <button
          onClick={() => handleExport(currentFilter)}
          disabled={loading || totalCount === 0}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <FileText size={15} />
          )}
          {loading ? 'Đang tạo...' : 'Xuất Word'}
          {!loading && (
            <span className="text-xs bg-emerald-500 px-1.5 py-0.5 rounded-full font-bold">
              {totalCount}
            </span>
          )}
        </button>

        {/* Dropdown — xuất theo filter khác */}
        <button
          onClick={() => setMenuOpen(v => !v)}
          disabled={loading}
          className="px-2 py-2 bg-emerald-600 hover:bg-emerald-700 text-white border-l border-emerald-500 transition-colors disabled:opacity-50"
          title="Chọn danh sách xuất"
        >
          <ChevronDown size={14} className={`transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Dropdown menu */}
      {menuOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-[998]"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute right-0 top-full mt-1.5 z-[999] bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden min-w-[220px]">
            <div className="px-3 py-2 bg-slate-50 border-b border-slate-100">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Xuất danh sách</p>
            </div>
            {([
              { key: 'all',          label: 'Tất cả người cao tuổi', icon: '👥' },
              { key: 'tu_80',        label: 'Từ 80 tuổi trở lên',   icon: '🔵' },
              { key: 'co_don',       label: 'Sống cô đơn',           icon: '🟡' },
              { key: 'tro_cap',      label: 'Nhận trợ cấp xã hội',  icon: '🟢' },
              { key: 'can_cham_soc', label: 'Cần chăm sóc đặc biệt', icon: '🔴' },
            ] as const).map(opt => (
              <button
                key={opt.key}
                onClick={() => handleExport(opt.key)}
                className={`flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-left hover:bg-emerald-50 transition-colors ${
                  currentFilter === opt.key ? 'bg-emerald-50 font-semibold text-emerald-700' : 'text-slate-700'
                }`}
              >
                <span>{opt.icon}</span>
                <span className="flex-1">{opt.label}</span>
                <Download size={13} className="text-slate-400" />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
