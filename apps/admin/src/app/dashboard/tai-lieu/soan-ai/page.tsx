'use client'

import { useState, useRef, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Sparkles, Copy, Check, Loader2,
  Save, RefreshCw, ChevronDown, BookOpen,
  ScrollText, FileCheck2, ClipboardList, BookMarked,
  FileText, Lightbulb, FolderOpen, AlertCircle,
} from 'lucide-react'
import { themTaiLieu } from '../actions'

// ── Cấu hình mẫu văn bản ──────────────────────────────────────
const MAU_VAN_BAN = [
  {
    loai: 'NGHI_QUYET',
    label: 'Nghị quyết',
    icon: ScrollText,
    mauSac: 'bg-red-50 border-red-200 text-red-700',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    mo_ta: 'Nghị quyết chi bộ, hội nghị, đại hội',
    truong: [
      { key: 'so_hieu',   label: 'Số hiệu',     placeholder: '01/NQ-CB',           required: true },
      { key: 'don_vi',    label: 'Chi bộ/Đơn vị', placeholder: 'Chi bộ Khu phố 25', required: true },
      { key: 'dia_diem',  label: 'Địa điểm',     placeholder: 'Nhà văn hoá KP25',   required: true },
      { key: 'thoi_gian', label: 'Thời gian',    placeholder: '14g00, ngày 15/03/2026', required: true },
      { key: 'chu_tri',   label: 'Chủ trì',      placeholder: 'Phan Tấn Tài — Bí thư chi bộ', required: true },
      { key: 'thu_ky',    label: 'Thư ký',        placeholder: 'Nguyễn Thị Hồng Thủy', required: false },
      { key: 'thanh_phan', label: 'Số người tham dự', placeholder: '25 đảng viên, 3 đại biểu mời', required: true },
      { key: 'noi_dung',  label: 'Nội dung chính cần nghị quyết', placeholder: 'Mô tả các vấn đề cần ra nghị quyết, kết quả biểu quyết...', required: true, textarea: true },
      { key: 'quyet_nghi', label: 'Các điều quyết nghị (tuỳ chọn)', placeholder: '1. Thông qua chỉ tiêu...\n2. Giao Ban chi uỷ...', required: false, textarea: true },
    ],
  },
  {
    loai: 'BIEN_BAN',
    label: 'Biên bản',
    icon: BookMarked,
    mauSac: 'bg-amber-50 border-amber-200 text-amber-700',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    mo_ta: 'Biên bản họp khu phố, hội nghị dân cư',
    truong: [
      { key: 'ten_cuoc_hop', label: 'Tên cuộc họp',    placeholder: 'Họp khu phố tháng 03/2026', required: true },
      { key: 'so_hieu',      label: 'Số biên bản',     placeholder: '03/BB-KP25',               required: false },
      { key: 'dia_diem',     label: 'Địa điểm',        placeholder: 'Nhà văn hoá Khu phố 25',   required: true },
      { key: 'thoi_gian_bat_dau', label: 'Giờ bắt đầu', placeholder: '19g00, ngày 20/03/2026',  required: true },
      { key: 'thoi_gian_ket_thuc', label: 'Giờ kết thúc', placeholder: '21g00',                 required: false },
      { key: 'chu_tri',      label: 'Chủ trì',          placeholder: 'Nguyễn Thị Hồng Thủy',    required: true },
      { key: 'thu_ky',       label: 'Thư ký',           placeholder: 'Phan Tấn Tài',             required: true },
      { key: 'thanh_phan',   label: 'Thành phần tham dự', placeholder: '120 hộ dân, đại diện ban ngành...', required: true },
      { key: 'noi_dung',     label: 'Nội dung thảo luận', placeholder: 'Các vấn đề được đưa ra thảo luận...', required: true, textarea: true },
      { key: 'ket_luan',     label: 'Kết luận / Quyết định', placeholder: 'Kết luận chung, các quyết định được thông qua...', required: true, textarea: true },
    ],
  },
  {
    loai: 'BAO_CAO',
    label: 'Báo cáo',
    icon: ClipboardList,
    mauSac: 'bg-violet-50 border-violet-200 text-violet-700',
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-600',
    mo_ta: 'Báo cáo tổng kết, báo cáo định kỳ',
    truong: [
      { key: 'tieu_de',    label: 'Tên báo cáo',      placeholder: 'Báo cáo tổng kết công tác an ninh trật tự năm 2025', required: true },
      { key: 'so_hieu',    label: 'Số hiệu',          placeholder: '05/BC-KP25',              required: false },
      { key: 'don_vi',     label: 'Đơn vị báo cáo',  placeholder: 'Khu phố 25',              required: true },
      { key: 'ky_bao_cao', label: 'Kỳ báo cáo',      placeholder: 'Năm 2025 / Quý I/2026',   required: true },
      { key: 'ket_qua',    label: 'Kết quả đạt được', placeholder: 'Nêu các thành tích, kết quả nổi bật...', required: true, textarea: true },
      { key: 'han_che',    label: 'Hạn chế, tồn tại', placeholder: 'Những khó khăn, tồn tại cần khắc phục...', required: false, textarea: true },
      { key: 'phuong_huong', label: 'Phương hướng sắp tới', placeholder: 'Nhiệm vụ, mục tiêu trong kỳ tới...', required: true, textarea: true },
      { key: 'kien_nghi',  label: 'Kiến nghị, đề xuất', placeholder: 'Đề xuất lên cấp trên nếu có...', required: false, textarea: true },
    ],
  },
  {
    loai: 'THONG_BAO',
    label: 'Thông báo',
    icon: BookOpen,
    mauSac: 'bg-blue-50 border-blue-200 text-blue-700',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    mo_ta: 'Thông báo triệu tập, thông báo sự kiện',
    truong: [
      { key: 'tieu_de',   label: 'Tiêu đề thông báo', placeholder: 'Thông báo triệu tập Hội nghị dân cư', required: true },
      { key: 'so_hieu',   label: 'Số hiệu',           placeholder: '04/TB-KP25',             required: false },
      { key: 'kinh_gui',  label: 'Kính gửi',          placeholder: 'Toàn thể hộ dân Khu phố 25', required: true },
      { key: 'noi_dung',  label: 'Nội dung thông báo', placeholder: 'Nội dung cần thông báo đến người dân...', required: true, textarea: true },
      { key: 'thoi_han',  label: 'Thời hạn/Thời gian', placeholder: 'Trước ngày 20/03/2026 / 19g00 ngày 25/03/2026', required: false },
      { key: 'yeu_cau',   label: 'Yêu cầu thực hiện', placeholder: 'Đề nghị các hộ dân thực hiện...', required: false, textarea: true },
    ],
  },
  {
    loai: 'HUONG_DAN',
    label: 'Hướng dẫn',
    icon: Lightbulb,
    mauSac: 'bg-teal-50 border-teal-200 text-teal-700',
    iconBg: 'bg-teal-100',
    iconColor: 'text-teal-600',
    mo_ta: 'Hướng dẫn thủ tục, quy trình hành chính',
    truong: [
      { key: 'tieu_de',  label: 'Tiêu đề hướng dẫn', placeholder: 'Hướng dẫn đăng ký tạm trú cho người thuê nhà', required: true },
      { key: 'so_hieu',  label: 'Số hiệu',           placeholder: '02/HD-KP25',              required: false },
      { key: 'doi_tuong', label: 'Đối tượng áp dụng', placeholder: 'Hộ dân có người thuê trọ, người thuê nhà', required: true },
      { key: 'noi_dung', label: 'Nội dung thủ tục/quy trình', placeholder: 'Mô tả chi tiết quy trình, các bước thực hiện...', required: true, textarea: true },
      { key: 'ho_so',    label: 'Hồ sơ cần chuẩn bị', placeholder: 'CCCD, tờ khai CT02, hợp đồng thuê nhà...', required: false, textarea: true },
      { key: 'thoi_gian', label: 'Thời gian giải quyết', placeholder: '3 ngày làm việc', required: false },
      { key: 'co_quan',  label: 'Cơ quan tiếp nhận', placeholder: 'Công an Phường Long Trường', required: false },
    ],
  },
  {
    loai: 'QUY_CHE',
    label: 'Quy chế',
    icon: FileText,
    mauSac: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    mo_ta: 'Quy chế, nội quy hoạt động',
    truong: [
      { key: 'tieu_de',   label: 'Tên quy chế',       placeholder: 'Quy chế hoạt động Ban quản lý Khu phố 25', required: true },
      { key: 'so_hieu',   label: 'Số hiệu',           placeholder: '01/QC-KP25',              required: false },
      { key: 'doi_tuong', label: 'Đối tượng áp dụng', placeholder: 'Ban quản lý và hộ dân Khu phố 25', required: true },
      { key: 'pham_vi',   label: 'Phạm vi điều chỉnh', placeholder: 'Tổ chức, hoạt động, quyền và nghĩa vụ...', required: false },
      { key: 'noi_dung',  label: 'Nội dung chính cần quy định', placeholder: 'Chức năng, nhiệm vụ, quyền hạn, trách nhiệm...', required: true, textarea: true },
      { key: 'so_chuong', label: 'Số chương/điều dự kiến', placeholder: '4 chương, 15 điều', required: false },
    ],
  },
] as const

type LoaiVanBan = typeof MAU_VAN_BAN[number]['loai']

// ── Input component ────────────────────────────────────────────
function TruongNhap({
  truong, value, onChange,
}: {
  truong: { key: string; label: string; placeholder: string; required: boolean; textarea?: boolean }
  value: string
  onChange: (v: string) => void
}) {
  const baseClass = `w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5
    text-sm text-slate-800 placeholder-slate-400
    focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 focus:border-[#1E3A5F]
    transition-all`

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-slate-700">
        {truong.label}
        {truong.required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {truong.textarea ? (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={truong.placeholder}
          rows={4}
          required={truong.required}
          className={`${baseClass} resize-y min-h-[80px]`}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={truong.placeholder}
          required={truong.required}
          className={baseClass}
        />
      )}
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────
export default function SoanAIPage() {
  const router = useRouter()
  const [loaiChon, setLoaiChon] = useState<LoaiVanBan>('NGHI_QUYET')
  const [duLieu, setDuLieu]     = useState<Record<string, string>>({})
  const [vanBan, setVanBan]     = useState('')
  const [streaming, setStreaming] = useState(false)
  const [copied, setCopied]       = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const [dangLuu, setDangLuu]   = useState(false)
  const [luuOk, setLuuOk]       = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const mauHienTai = MAU_VAN_BAN.find(m => m.loai === loaiChon)!

  function capNhatTruong(key: string, value: string) {
    setDuLieu(prev => ({ ...prev, [key]: value }))
  }

  async function soanVanBan() {
    setError(null)
    setVanBan('')
    setStreaming(true)
    setLuuOk(false)
    abortRef.current = new AbortController()

    try {
      const res = await fetch('/api/ai/soan-van-ban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loai: loaiChon, du_lieu: duLieu }),
        signal: abortRef.current.signal,
      })

      if (!res.ok) {
        const d = await res.json() as { error?: string }
        throw new Error(d.error ?? `Lỗi ${res.status}`)
      }

      if (!res.body) throw new Error('Không có dữ liệu phản hồi')

      const reader  = res.body.getReader()
      const decoder = new TextDecoder()
      let full = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        full += chunk
        setVanBan(full)
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setError((err as Error).message || 'Lỗi tạo văn bản')
      }
    } finally {
      setStreaming(false)
    }
  }

  async function copyVanBan() {
    await navigator.clipboard.writeText(vanBan)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function luuVaThem() {
    if (!vanBan || dangLuu) return
    setDangLuu(true)
    try {
      const fd = new FormData()
      const tieuDe = duLieu['tieu_de'] ?? duLieu['ten_cuoc_hop'] ?? `${mauHienTai.label} — ${duLieu['so_hieu'] ?? ''}`
      fd.set('tieu_de',      tieuDe)
      fd.set('loai',         loaiChon)
      fd.set('so_hieu',      duLieu['so_hieu'] ?? '')
      fd.set('mo_ta',        vanBan.slice(0, 500))  // 500 ký tự đầu làm mô tả
      fd.set('la_cong_khai', 'true')
      fd.set('nam_ban_hanh', new Date().getFullYear().toString())

      const res = await themTaiLieu(fd)
      if (res.success && res.id) {
        setLuuOk(true)
        setTimeout(() => router.push(`/dashboard/tai-lieu/${res.id}`), 1200)
      } else {
        setError(res.message)
      }
    } finally {
      setDangLuu(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/tai-lieu"
          className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Soạn văn bản với AI</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Nhập thông tin → AI tự soạn văn bản hành chính đúng thể thức
          </p>
        </div>
      </div>

      {/* Layout 2 cột */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">

        {/* ── Cột trái: Form ──────────────────────────────── */}
        <div className="space-y-5">

          {/* Chọn mẫu */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
            <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Chọn loại văn bản</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {MAU_VAN_BAN.map(m => {
                const Icon = m.icon
                const active = loaiChon === m.loai
                return (
                  <button
                    key={m.loai}
                    onClick={() => { setLoaiChon(m.loai); setDuLieu({}); setVanBan('') }}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-xs font-semibold transition-all
                      ${active
                        ? `${m.mauSac} border-current`
                        : 'border-slate-200 text-slate-500 hover:border-slate-300 bg-white'
                      }`}
                  >
                    <div className={`w-8 h-8 rounded-lg ${active ? m.iconBg : 'bg-slate-100'} flex items-center justify-center`}>
                      <Icon size={16} className={active ? m.iconColor : 'text-slate-500'} />
                    </div>
                    {m.label}
                  </button>
                )
              })}
            </div>
            <p className="text-xs text-slate-400">{mauHienTai.mo_ta}</p>
          </div>

          {/* Form nhập liệu */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
            <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Thông tin văn bản</p>
            {mauHienTai.truong.map(t => (
              <TruongNhap
                key={t.key}
                truong={t}
                value={duLieu[t.key] ?? ''}
                onChange={v => capNhatTruong(t.key, v)}
              />
            ))}
          </div>

          {/* Nút soạn */}
          <button
            onClick={() => void soanVanBan()}
            disabled={streaming}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl
              bg-gradient-to-r from-[#1E3A5F] to-[#2d5a9e] text-white font-semibold
              hover:from-[#2d5a9e] hover:to-[#1E3A5F] disabled:opacity-60
              transition-all shadow-sm text-sm"
          >
            {streaming
              ? <><Loader2 size={18} className="animate-spin" />AI đang soạn thảo...</>
              : <><Sparkles size={18} />Soạn văn bản với AI</>
            }
          </button>
        </div>

        {/* ── Cột phải: Preview ───────────────────────────── */}
        <div className="space-y-4 sticky top-6">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-lg ${mauHienTai.iconBg} flex items-center justify-center`}>
                  <mauHienTai.icon size={14} className={mauHienTai.iconColor} />
                </div>
                <span className="text-sm font-semibold text-slate-700">{mauHienTai.label}</span>
                {streaming && (
                  <span className="flex items-center gap-1 text-xs text-[#1E3A5F] font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1E3A5F] animate-pulse" />
                    AI đang viết...
                  </span>
                )}
              </div>
              {vanBan && !streaming && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => void soanVanBan()}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-slate-500
                      hover:bg-slate-100 hover:text-slate-700 transition-colors"
                    title="Soạn lại"
                  >
                    <RefreshCw size={13} />
                    Soạn lại
                  </button>
                  <button
                    onClick={() => void copyVanBan()}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-slate-500
                      hover:bg-slate-100 hover:text-slate-700 transition-colors"
                  >
                    {copied
                      ? <><Check size={13} className="text-emerald-500" />Đã sao chép</>
                      : <><Copy size={13} />Sao chép</>
                    }
                  </button>
                </div>
              )}
            </div>

            {/* Nội dung */}
            <div className="relative min-h-[400px] max-h-[65vh] overflow-y-auto">
              {!vanBan && !streaming ? (
                <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center px-8 py-12">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1E3A5F] to-[#2d5a9e] flex items-center justify-center mb-4 opacity-90">
                    <Sparkles size={28} className="text-white" />
                  </div>
                  <p className="text-slate-500 font-medium">Văn bản sẽ hiện ở đây</p>
                  <p className="text-slate-400 text-sm mt-1">Điền thông tin bên trái → bấm Soạn với AI</p>
                </div>
              ) : (
                <div className="p-5">
                  <pre className="whitespace-pre-wrap text-sm text-slate-800 leading-relaxed font-sans">
                    {vanBan}
                    {streaming && (
                      <span className="inline-block w-0.5 h-4 bg-[#1E3A5F] ml-0.5 animate-pulse align-middle" />
                    )}
                  </pre>
                </div>
              )}
            </div>

            {/* Textarea chỉnh sửa thủ công */}
            {vanBan && !streaming && (
              <div className="border-t border-slate-100 bg-slate-50/50 px-4 py-3">
                <p className="text-xs text-slate-500 mb-2 flex items-center gap-1">
                  <ChevronDown size={12} />
                  Chỉnh sửa trực tiếp văn bản nếu cần:
                </p>
                <textarea
                  value={vanBan}
                  onChange={e => setVanBan(e.target.value)}
                  rows={8}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5
                    text-xs text-slate-700 font-mono resize-y
                    focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F]
                    transition-all"
                />
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          {/* Lưu vào hệ thống */}
          {vanBan && !streaming && (
            <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
              <p className="text-sm font-semibold text-slate-700">Lưu vào hệ thống</p>
              <p className="text-xs text-slate-500">
                Văn bản sẽ được lưu vào mục Tài liệu. Sau đó bạn có thể nhúng vào RAG để AI trích dẫn khi trả lời.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => void luuVaThem()}
                  disabled={dangLuu || luuOk}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    luuOk
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-[#1E3A5F] text-white hover:bg-[#2d5a9e] disabled:opacity-60'
                  }`}
                >
                  {dangLuu
                    ? <><Loader2 size={15} className="animate-spin" />Đang lưu...</>
                    : luuOk
                      ? <><Check size={15} />Đã lưu! Chuyển hướng...</>
                      : <><Save size={15} />Lưu vào Tài liệu</>
                  }
                </button>
                <button
                  onClick={() => void copyVanBan()}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600
                    hover:bg-slate-50 transition-colors flex items-center gap-1.5"
                >
                  {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  {copied ? 'Đã sao' : 'Copy'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
