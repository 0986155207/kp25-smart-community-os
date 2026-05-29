import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import {
  ArrowLeft, UserCheck, Calendar, MapPin, Phone, FileText,
  CheckCircle2, AlertTriangle, Trash2, RotateCcw, Shield,
} from 'lucide-react'
import { format } from 'date-fns'
import { layTamTruById, capNhatTrangThaiTamTru, xoaTamTru } from '../../actions'
import {
  TRANG_THAI_TAM_TRU_LABEL, LY_DO_TAM_TRU_LABEL,
  type TrangThaiTamTru,
} from '../../constants'

export const metadata: Metadata = { title: 'Chi tiết tạm trú — KP25' }

// ─── Actions ──────────────────────────────────────────────────
async function handleCapNhatTrangThai(formData: FormData) {
  'use server'
  const id        = formData.get('id') as string
  const trangThai = formData.get('trang_thai') as TrangThaiTamTru
  await capNhatTrangThaiTamTru(id, trangThai)
  redirect(`/dashboard/dan-cu/tam-tru-tam-vang/tam-tru/${id}`)
}

async function handleXoa(formData: FormData) {
  'use server'
  const id = formData.get('id') as string
  await xoaTamTru(id)
  redirect('/dashboard/dan-cu/tam-tru-tam-vang?tab=tam-tru')
}

interface Props {
  params: Promise<{ id: string }>
}

const TT_COLOR: Record<TrangThaiTamTru, string> = {
  DANG_TAM_TRU: 'bg-blue-100 text-blue-700 border border-blue-200',
  HET_HAN:      'bg-amber-100 text-amber-700 border border-amber-200',
  DA_ROI_DI:    'bg-slate-100 text-slate-500 border border-slate-200',
}

export default async function ChiTietTamTruPage({ params }: Props) {
  const { id } = await params
  const record = await layTamTruById(id)
  if (!record) notFound()

  const fmt = (d: string | null) => d ? format(new Date(d), 'dd/MM/yyyy') : '—'

  return (
    <div className="max-w-3xl mx-auto space-y-5">

      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/dan-cu/tam-tru-tam-vang?tab=tam-tru"
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
        >
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <UserCheck size={20} className="text-blue-600" />
            <h1 className="text-xl font-bold text-slate-900">{record.ho_ten}</h1>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${TT_COLOR[record.trang_thai]}`}>
              {TRANG_THAI_TAM_TRU_LABEL[record.trang_thai]}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Hồ sơ tạm trú · Đăng ký {fmt(record.created_at)}
            {record.so_to_khai && ` · Tờ khai #${record.so_to_khai}`}
          </p>
        </div>
      </div>

      {/* Thông tin chính */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h2 className="font-bold text-slate-700 text-sm mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
          <FileText size={15} className="text-blue-600" />
          Thông tin người tạm trú
        </h2>
        <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
          <Row label="Họ và tên"   value={record.ho_ten} />
          <Row label="Ngày sinh"   value={fmt(record.ngay_sinh)} />
          <Row label="Giới tính"   value={record.gioi_tinh === 'NAM' ? 'Nam' : record.gioi_tinh === 'NU' ? 'Nữ' : record.gioi_tinh ?? '—'} />
          <Row label="CCCD / CMND" value={record.so_cccd ?? '—'} mono />
          <Row label="Nơi sinh"    value={record.noi_sinh ?? '—'} />
          <Row label="Quốc tịch"   value={record.quoc_tich} />
          <Row label="Dân tộc"     value={record.dan_toc ?? '—'} />
        </div>
      </div>

      {/* Địa chỉ */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h2 className="font-bold text-slate-700 text-sm mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
          <MapPin size={15} className="text-blue-600" />
          Địa chỉ
        </h2>
        <div className="space-y-3 text-sm">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide block mb-0.5">Thường trú (gốc)</span>
            <span className="text-slate-700">{record.dia_chi_thuong_tru}</span>
            {record.tinh_thanh_goc && <span className="text-slate-400 ml-2 text-xs">· {record.tinh_thanh_goc}</span>}
          </div>
          <div>
            <span className="text-xs font-semibold text-blue-500 uppercase tracking-wide block mb-0.5">Tạm trú tại KP25</span>
            <span className="text-slate-700 font-medium">{record.dia_chi_tam_tru}</span>
          </div>
          {record.chu_nha_ho_ten && (
            <div className="border-t border-slate-100 pt-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide block mb-1">Chủ nhà</span>
              <div className="flex items-center gap-3">
                <span className="text-slate-700 font-medium">{record.chu_nha_ho_ten}</span>
                {record.chu_nha_sdt && (
                  <a href={`tel:${record.chu_nha_sdt}`} className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
                    <Phone size={11} /> {record.chu_nha_sdt}
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Thời hạn & lý do */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h2 className="font-bold text-slate-700 text-sm mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
          <Calendar size={15} className="text-blue-600" />
          Thời hạn & lý do tạm trú
        </h2>
        <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
          <Row label="Lý do"                value={LY_DO_TAM_TRU_LABEL[record.ly_do_tam_tru] ?? record.ly_do_tam_tru} />
          <Row label="Ngày bắt đầu"         value={fmt(record.ngay_bat_dau)} />
          <Row label="Ngày kết thúc"        value={fmt(record.ngay_ket_thuc)} />
          <Row label="Trạng thái"           value={TRANG_THAI_TAM_TRU_LABEL[record.trang_thai]} />
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide block mb-0.5">CA khu vực xét duyệt</span>
            <div className="flex items-center gap-3">
              <span className="text-slate-700 font-medium flex items-center gap-1.5">
                <Shield size={13} className="text-violet-500" />
                Trần Hữu Hùng
              </span>
              <a href="tel:0988897709" className="flex items-center gap-1 text-xs text-blue-600 hover:underline font-semibold">
                <Phone size={10} /> 0988 897 709
              </a>
            </div>
          </div>
          {record.can_bo_tiep_nhan && <Row label="Cán bộ tiếp nhận" value={record.can_bo_tiep_nhan} />}
        </div>
        {record.ghi_chu && (
          <div className="mt-4 border-t border-slate-100 pt-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide block mb-1">Ghi chú</span>
            <p className="text-sm text-slate-600">{record.ghi_chu}</p>
          </div>
        )}
      </div>

      {/* Thao tác */}
      {record.trang_thai === 'DANG_TAM_TRU' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h2 className="font-bold text-slate-700 text-sm mb-4 pb-2 border-b border-slate-100">Cập nhật trạng thái</h2>
          <div className="flex flex-wrap gap-3">
            <form action={handleCapNhatTrangThai}>
              <input type="hidden" name="id" value={record.id} />
              <input type="hidden" name="trang_thai" value="HET_HAN" />
              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                <AlertTriangle size={14} /> Đánh dấu hết hạn
              </button>
            </form>
            <form action={handleCapNhatTrangThai}>
              <input type="hidden" name="id" value={record.id} />
              <input type="hidden" name="trang_thai" value="DA_ROI_DI" />
              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                <CheckCircle2 size={14} /> Xác nhận đã rời đi
              </button>
            </form>
          </div>
        </div>
      )}

      {record.trang_thai === 'HET_HAN' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h2 className="font-bold text-slate-700 text-sm mb-4 pb-2 border-b border-slate-100">Cập nhật trạng thái</h2>
          <div className="flex flex-wrap gap-3">
            <form action={handleCapNhatTrangThai}>
              <input type="hidden" name="id" value={record.id} />
              <input type="hidden" name="trang_thai" value="DANG_TAM_TRU" />
              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                <RotateCcw size={14} /> Gia hạn tạm trú
              </button>
            </form>
            <form action={handleCapNhatTrangThai}>
              <input type="hidden" name="id" value={record.id} />
              <input type="hidden" name="trang_thai" value="DA_ROI_DI" />
              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                <CheckCircle2 size={14} /> Xác nhận đã rời đi
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Xoá */}
      <div className="flex justify-end pb-4">
        <form action={handleXoa}>
          <input type="hidden" name="id" value={record.id} />
          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-2 text-xs text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-red-200"
          >
            <Trash2 size={13} /> Xoá hồ sơ này
          </button>
        </form>
      </div>
    </div>
  )
}

// ─── Helper component ─────────────────────────────────────────
function Row({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide block mb-0.5">{label}</span>
      <span className={`text-slate-700 ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  )
}
