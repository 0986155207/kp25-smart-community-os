import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import {
  ArrowLeft, UserMinus, Calendar, MapPin, Phone, FileText,
  CheckCircle2, AlertTriangle, Trash2,
} from 'lucide-react'
import { format } from 'date-fns'
import { layTamVangById, capNhatTrangThaiTamVang, xoaTamVang } from '../../actions'
import {
  TRANG_THAI_TAM_VANG_LABEL, LY_DO_TAM_VANG_LABEL,
  type TrangThaiTamVang,
} from '../../constants'

export const metadata: Metadata = { title: 'Chi tiết tạm vắng — KP25' }

// ─── Actions ──────────────────────────────────────────────────
async function handleCapNhatTrangThai(formData: FormData) {
  'use server'
  const id        = formData.get('id') as string
  const trangThai = formData.get('trang_thai') as TrangThaiTamVang
  const ngayVe    = formData.get('ngay_thuc_te_ve') as string | null
  await capNhatTrangThaiTamVang(id, trangThai, ngayVe ?? undefined)
  redirect(`/dashboard/dan-cu/tam-tru-tam-vang/tam-vang/${id}`)
}

async function handleXoa(formData: FormData) {
  'use server'
  const id = formData.get('id') as string
  await xoaTamVang(id)
  redirect('/dashboard/dan-cu/tam-tru-tam-vang?tab=tam-vang')
}

interface Props {
  params: Promise<{ id: string }>
}

const TT_COLOR: Record<TrangThaiTamVang, string> = {
  DANG_VANG: 'bg-orange-100 text-orange-700 border border-orange-200',
  DA_VE:     'bg-emerald-100 text-emerald-700 border border-emerald-200',
  QUA_HAN:   'bg-red-100 text-red-700 border border-red-200',
}

export default async function ChiTietTamVangPage({ params }: Props) {
  const { id } = await params
  const record = await layTamVangById(id)
  if (!record) notFound()

  const fmt = (d: string | null) => d ? format(new Date(d), 'dd/MM/yyyy') : '—'
  const today = new Date().toISOString().split('T')[0]!

  return (
    <div className="max-w-3xl mx-auto space-y-5">

      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/dan-cu/tam-tru-tam-vang?tab=tam-vang"
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
        >
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <UserMinus size={20} className="text-orange-600" />
            <h1 className="text-xl font-bold text-slate-900">{record.ho_ten}</h1>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${TT_COLOR[record.trang_thai]}`}>
              {TRANG_THAI_TAM_VANG_LABEL[record.trang_thai]}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Khai báo tạm vắng · Ngày đi: {fmt(record.ngay_di)}
          </p>
        </div>
      </div>

      {/* Thông tin cá nhân */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h2 className="font-bold text-slate-700 text-sm mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
          <FileText size={15} className="text-orange-600" />
          Thông tin người tạm vắng
        </h2>
        <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
          <Row label="Họ và tên"   value={record.ho_ten} />
          <Row label="Ngày sinh"   value={fmt(record.ngay_sinh)} />
          <Row label="Giới tính"   value={record.gioi_tinh === 'NAM' ? 'Nam' : record.gioi_tinh === 'NU' ? 'Nữ' : record.gioi_tinh ?? '—'} />
          <Row label="CCCD / CMND" value={record.so_cccd ?? '—'} mono />
          {record.sdt_lien_lac && (
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide block mb-0.5">SĐT liên lạc</span>
              <a href={`tel:${record.sdt_lien_lac}`} className="flex items-center gap-1 text-blue-600 hover:underline text-sm">
                <Phone size={12} /> {record.sdt_lien_lac}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Địa chỉ */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h2 className="font-bold text-slate-700 text-sm mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
          <MapPin size={15} className="text-orange-600" />
          Địa chỉ
        </h2>
        <div className="space-y-3 text-sm">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide block mb-0.5">Địa chỉ tại KP25</span>
            <span className="text-slate-700 font-medium">{record.dia_chi_hien_tai}</span>
          </div>
          <div className="border-t border-slate-100 pt-3">
            <span className="text-xs font-semibold text-orange-500 uppercase tracking-wide block mb-0.5">Nơi đến tạm vắng</span>
            <span className="text-slate-700">{record.dia_chi_tam_vang}</span>
            {record.tinh_thanh_den && (
              <span className="text-slate-400 ml-2 text-xs">· {record.tinh_thanh_den}</span>
            )}
          </div>
          {record.ho_ten_nguoi_than && (
            <div className="border-t border-slate-100 pt-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide block mb-1">Người thân liên hệ</span>
              <div className="flex items-center gap-3">
                <span className="text-slate-700 font-medium">{record.ho_ten_nguoi_than}</span>
                {record.sdt_nguoi_than && (
                  <a href={`tel:${record.sdt_nguoi_than}`} className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
                    <Phone size={11} /> {record.sdt_nguoi_than}
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Thời gian & lý do */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h2 className="font-bold text-slate-700 text-sm mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
          <Calendar size={15} className="text-orange-600" />
          Thời gian & lý do tạm vắng
        </h2>
        <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
          <Row label="Lý do tạm vắng"    value={LY_DO_TAM_VANG_LABEL[record.ly_do_tam_vang] ?? record.ly_do_tam_vang} />
          <Row label="Ngày rời đi"        value={fmt(record.ngay_di)} />
          <Row label="Dự kiến về"         value={fmt(record.ngay_du_kien_ve)} />
          <Row label="Ngày về thực tế"    value={fmt(record.ngay_thuc_te_ve)} />
          <Row label="Trạng thái"         value={TRANG_THAI_TAM_VANG_LABEL[record.trang_thai]} />
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
      {record.trang_thai !== 'DA_VE' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h2 className="font-bold text-slate-700 text-sm mb-4 pb-2 border-b border-slate-100">Cập nhật trạng thái</h2>

          {/* Xác nhận đã về — có nhập ngày về */}
          <form action={handleCapNhatTrangThai} className="flex items-end gap-3 flex-wrap">
            <input type="hidden" name="id" value={record.id} />
            <input type="hidden" name="trang_thai" value="DA_VE" />
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Ngày về thực tế</label>
              <input
                name="ngay_thuc_te_ve"
                type="date"
                defaultValue={today}
                className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              <CheckCircle2 size={14} /> Xác nhận đã về
            </button>
          </form>

          {record.trang_thai === 'DANG_VANG' && (
            <form action={handleCapNhatTrangThai} className="mt-3">
              <input type="hidden" name="id" value={record.id} />
              <input type="hidden" name="trang_thai" value="QUA_HAN" />
              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                <AlertTriangle size={14} /> Đánh dấu quá hạn
              </button>
            </form>
          )}
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
            <Trash2 size={13} /> Xoá khai báo này
          </button>
        </form>
      </div>
    </div>
  )
}

// ─── Helper ───────────────────────────────────────────────────
function Row({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide block mb-0.5">{label}</span>
      <span className={`text-slate-700 ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  )
}
