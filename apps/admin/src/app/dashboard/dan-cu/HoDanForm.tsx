'use client'

import { KHU_PHO } from '@/lib/khu-pho'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, Save, ArrowLeft, Home, User, Phone, MapPin, FileText, Hash } from 'lucide-react'
import toast from 'react-hot-toast'
import { taoHoDan, capNhatHoDan } from './actions'

// trang_thai_ho ENUM: THUONG_TRU | TAM_TRU | TAM_VANG
const TRANG_THAI_OPTIONS = [
  { value: 'THUONG_TRU', label: 'Thường trú', desc: 'Đăng ký thường trú tại hộ', dotBg: 'bg-emerald-500' },
  { value: 'TAM_TRU', label: 'Tạm trú', desc: 'Đăng ký tạm trú (KT3/KT4)', dotBg: 'bg-blue-500' },
  { value: 'TAM_VANG', label: 'Tạm vắng', desc: 'Chủ hộ đi vắng dài ngày', dotBg: 'bg-slate-400' },
]

interface DefaultValues {
  maHo?: string
  chuHo?: string
  diaChiDay?: string
  soNha?: string
  duong?: string
  toTruong?: string
  soDienThoai?: string
  soNhanKhau?: number
  trangThai?: string
  ghiChu?: string
}

interface Props {
  mode: 'create' | 'edit'
  id?: string
  defaultValues?: DefaultValues
}

function sinhMaHoClient(): string {
  const now = new Date()
  const yy = now.getFullYear().toString().slice(-2)
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const rand = Math.floor(Math.random() * 9999).toString().padStart(4, '0')
  return `${KHU_PHO.ma}-${yy}${mm}-${rand}`
}

export default function HoDanForm({ mode, id, defaultValues }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [maHo, setMaHo] = useState(defaultValues?.maHo ?? sinhMaHoClient())
  const [chuHo, setChuHo] = useState(defaultValues?.chuHo ?? '')
  const [diaChiDay, setDiaChiDay] = useState(defaultValues?.diaChiDay ?? '')
  const [soNha, setSoNha] = useState(defaultValues?.soNha ?? '')
  const [duong, setDuong] = useState(defaultValues?.duong ?? '')
  const [toTruong, setToTruong] = useState(defaultValues?.toTruong ?? '')
  const [soDienThoai, setSoDienThoai] = useState(defaultValues?.soDienThoai ?? '')
  const [soNhanKhau, setSoNhanKhau] = useState(String(defaultValues?.soNhanKhau ?? 0))
  const [trangThai, setTrangThai] = useState(defaultValues?.trangThai ?? 'THUONG_TRU')
  const [ghiChu, setGhiChu] = useState(defaultValues?.ghiChu ?? '')
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate(): boolean {
    const errs: Record<string, string> = {}
    if (!chuHo.trim()) errs['chuHo'] = 'Vui lòng nhập tên chủ hộ'
    else if (chuHo.trim().length < 2) errs['chuHo'] = 'Tối thiểu 2 ký tự'
    if (!diaChiDay.trim()) errs['diaChiDay'] = 'Vui lòng nhập địa chỉ đầy đủ'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    startTransition(async () => {
      const fd = new FormData()
      fd.append('maHo', maHo)
      fd.append('chuHo', chuHo)
      fd.append('diaChiDay', diaChiDay)
      fd.append('soNha', soNha)
      fd.append('duong', duong)
      fd.append('toTruong', toTruong)
      fd.append('soDienThoai', soDienThoai)
      fd.append('soNhanKhau', soNhanKhau)
      fd.append('trangThai', trangThai)
      fd.append('ghiChu', ghiChu)

      const result =
        mode === 'create'
          ? await taoHoDan(fd)
          : await capNhatHoDan(id!, fd)

      if (result.success) {
        toast.success(result.message)
        const targetId = mode === 'create' && 'id' in result ? result.id : id
        router.push(targetId ? `/dashboard/dan-cu/${targetId}` : '/dashboard/dan-cu')
      } else {
        toast.error(result.message, { duration: 6000 })
      }
    })
  }

  const backHref = mode === 'edit' ? `/dashboard/dan-cu/${id}` : '/dashboard/dan-cu'

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link
          href={backHref}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors mt-1 shrink-0"
        >
          <ArrowLeft size={16} />
          Quay lại
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {mode === 'create' ? 'Thêm hộ dân mới' : 'Chỉnh sửa hộ dân'}
          </h1>
          <p className="text-slate-500 text-sm mt-1">{KHU_PHO.ten} · Long Trường · TP.HCM</p>
        </div>
      </div>

      {/* Mã hộ + Thông tin chủ hộ */}
      <div className="card space-y-4">
        <h2 className="font-semibold text-slate-800 flex items-center gap-2">
          <User size={16} className="text-[#8B1A1A]" />
          Thông tin chủ hộ
        </h2>

        {/* Mã hộ */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            <Hash size={13} className="inline mr-1" />
            Mã hộ <span className="text-slate-400 font-normal">(tự động tạo, có thể sửa)</span>
          </label>
          <div className="flex gap-2">
            <input
              value={maHo}
              onChange={(e) => setMaHo(e.target.value)}
              className="input font-mono text-sm"
              placeholder={`${KHU_PHO.ma}-YYMM-XXXX`}
              disabled={mode === 'edit'}
            />
            {mode === 'create' && (
              <button
                type="button"
                onClick={() => setMaHo(sinhMaHoClient())}
                className="px-3 py-2 rounded-lg border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50 transition-colors shrink-0"
              >
                Tạo mới
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Tên chủ hộ */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Họ tên chủ hộ <span className="text-red-500">*</span>
            </label>
            <input
              value={chuHo}
              onChange={(e) => { setChuHo(e.target.value); if (errors['chuHo']) setErrors((p) => ({ ...p, chuHo: '' })) }}
              className={`input ${errors['chuHo'] ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' : ''}`}
              placeholder="Nguyễn Văn An"
            />
            {errors['chuHo'] && <p className="text-red-500 text-xs mt-1">{errors['chuHo']}</p>}
          </div>

          {/* SĐT */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              <Phone size={13} className="inline mr-1" />
              Số điện thoại
            </label>
            <input
              value={soDienThoai}
              onChange={(e) => setSoDienThoai(e.target.value)}
              className="input"
              placeholder="Nhập số điện thoại"
              type="tel"
            />
          </div>

          {/* Số nhân khẩu */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              <Home size={13} className="inline mr-1" />
              Số nhân khẩu khai báo
            </label>
            <input
              value={soNhanKhau}
              onChange={(e) => setSoNhanKhau(e.target.value)}
              className="input"
              type="number"
              min={0}
              max={99}
            />
          </div>
        </div>
      </div>

      {/* Địa chỉ */}
      <div className="card space-y-4">
        <h2 className="font-semibold text-slate-800 flex items-center gap-2">
          <MapPin size={16} className="text-blue-500" />
          Địa chỉ
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Số nhà</label>
            <input
              value={soNha}
              onChange={(e) => setSoNha(e.target.value)}
              className="input"
              placeholder="63/15"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Đường / Hẻm</label>
            <input
              value={duong}
              onChange={(e) => setDuong(e.target.value)}
              className="input"
              placeholder="Đường số 1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Tổ / Khu vực</label>
            <input
              value={toTruong}
              onChange={(e) => setToTruong(e.target.value)}
              className="input"
              placeholder="Tổ 1, Hẻm 63..."
            />
          </div>
        </div>

        {/* Địa chỉ đầy đủ — bắt buộc */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Địa chỉ đầy đủ <span className="text-red-500">*</span>
          </label>
          <input
            value={diaChiDay}
            onChange={(e) => { setDiaChiDay(e.target.value); if (errors['diaChiDay']) setErrors((p) => ({ ...p, diaChiDay: '' })) }}
            className={`input ${errors['diaChiDay'] ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' : ''}`}
            placeholder={`63/15 Đường số 1, ${KHU_PHO.ten}, Long Trường, TP.HCM`}
          />
          {errors['diaChiDay'] && <p className="text-red-500 text-xs mt-1">{errors['diaChiDay']}</p>}
          <p className="text-xs text-slate-400 mt-1">Nhập đầy đủ để tiện tra cứu và in QR</p>
        </div>
      </div>

      {/* Tình trạng + Ghi chú */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="card space-y-3">
          <h2 className="font-semibold text-slate-800">Tình trạng cư trú</h2>
          <div className="space-y-2.5">
            {TRANG_THAI_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                  trangThai === opt.value
                    ? 'border-[#8B1A1A] bg-red-50/50'
                    : 'border-slate-100 hover:border-slate-200'
                }`}
              >
                <input
                  type="radio"
                  name="trangThai"
                  value={opt.value}
                  checked={trangThai === opt.value}
                  onChange={() => setTrangThai(opt.value)}
                  className="mt-0.5 w-4 h-4 text-[#8B1A1A] border-slate-300 focus:ring-[#8B1A1A]"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${opt.dotBg} shrink-0`} />
                    <span className="text-sm font-semibold text-slate-800">{opt.label}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{opt.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="card space-y-3">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2">
            <FileText size={16} className="text-slate-400" />
            Ghi chú
          </h2>
          <textarea
            value={ghiChu}
            onChange={(e) => setGhiChu(e.target.value)}
            className="input resize-none"
            rows={6}
            placeholder="Đặc điểm nhà, tình trạng an sinh, ghi chú của tổ trưởng..."
          />
        </div>
      </div>

      {/* Submit */}
      <div className="flex gap-3 pb-6">
        <button type="submit" disabled={isPending} className="btn-primary">
          {isPending ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          {mode === 'create' ? 'Thêm hộ dân' : 'Lưu thay đổi'}
        </button>
        <Link
          href={backHref}
          className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
        >
          Huỷ bỏ
        </Link>
      </div>
    </form>
  )
}
