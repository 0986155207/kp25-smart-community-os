import { KHU_PHO } from '@/lib/khu-pho'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import {
  ArrowLeft, CalendarDays, MapPin, Phone, Users, Clock,
  Pencil, Star, Trash2, CheckCircle2, PlayCircle, XCircle,
} from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import {
  laySuKienById, capNhatTrangThaiSuKien, xoaSuKien, toggleNoiBat,
} from '../actions'
import { LOAI_SK_CFG, TRANG_THAI_SK_CFG, type TrangThaiSuKien } from '../constants'

export const metadata: Metadata = { title: `Chi tiết sự kiện — ${KHU_PHO.ma}` }

// ─── Server actions ────────────────────────────────────────────
async function handleCapNhatTrangThai(formData: FormData) {
  'use server'
  const id        = formData.get('id') as string
  const trangThai = formData.get('trang_thai') as TrangThaiSuKien
  await capNhatTrangThaiSuKien(id, trangThai)
  redirect(`/dashboard/su-kien/${id}`)
}

async function handleToggleNoiBat(formData: FormData) {
  'use server'
  const id     = formData.get('id') as string
  const noiBat = formData.get('noi_bat') === 'true'
  await toggleNoiBat(id, noiBat)
  redirect(`/dashboard/su-kien/${id}`)
}

async function handleXoa(formData: FormData) {
  'use server'
  const id = formData.get('id') as string
  await xoaSuKien(id)
  redirect('/dashboard/su-kien')
}

interface Props { params: Promise<{ id: string }> }

export default async function ChiTietSuKienPage({ params }: Props) {
  const { id } = await params
  const sk = await laySuKienById(id)
  if (!sk) notFound()

  const cfg   = LOAI_SK_CFG[sk.loai] ?? LOAI_SK_CFG.KHAC
  const ttCfg = TRANG_THAI_SK_CFG[sk.trang_thai]
  const Icon  = cfg.Icon
  const start = new Date(sk.ngay_bat_dau)
  const end   = sk.ngay_ket_thuc ? new Date(sk.ngay_ket_thuc) : null

  const fmtDt = (d: Date) => format(d, 'HH:mm — EEEE, dd/MM/yyyy', { locale: vi })
  const isLive = sk.trang_thai === 'DANG_DIEN_RA'

  return (
    <div className="max-w-3xl mx-auto space-y-5">

      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/su-kien" className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.badge}`}>
              <Icon size={11} /> {cfg.label}
            </span>
            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full ${ttCfg.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${ttCfg.dot} ${isLive ? 'animate-pulse' : ''}`} />
              {ttCfg.label}
            </span>
            {sk.noi_bat && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                <Star size={9} fill="currentColor" /> Nổi bật
              </span>
            )}
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1 line-clamp-2">{sk.tieu_de}</h1>
        </div>
        <Link
          href={`/dashboard/su-kien/${sk.id}/sua`}
          className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-semibold rounded-xl transition-colors shrink-0"
        >
          <Pencil size={14} /> Sửa
        </Link>
      </div>

      {/* Ảnh bìa */}
      {sk.anh_bia_url && (
        <div className="rounded-2xl overflow-hidden bg-slate-100 aspect-video">
          <img src={sk.anh_bia_url} alt={sk.tieu_de} className="w-full h-full object-cover" />
        </div>
      )}

      {/* Thông tin chính */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Thời gian + địa điểm */}
        <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          <div className="p-5">
            <div className="flex items-center gap-2 text-slate-400 mb-2">
              <Clock size={14} />
              <span className="text-xs font-semibold uppercase tracking-wide">Thời gian</span>
            </div>
            <div className="font-semibold text-slate-800 text-sm">{fmtDt(start)}</div>
            {end && (
              <div className="text-slate-400 text-xs mt-1">
                Kết thúc: {fmtDt(end)}
              </div>
            )}
          </div>
          <div className="p-5">
            <div className="flex items-center gap-2 text-slate-400 mb-2">
              <MapPin size={14} />
              <span className="text-xs font-semibold uppercase tracking-wide">Địa điểm</span>
            </div>
            <div className="font-semibold text-slate-800 text-sm">{sk.dia_diem}</div>
            {sk.dia_chi_cu_the && (
              <div className="text-slate-400 text-xs mt-1">{sk.dia_chi_cu_the}</div>
            )}
          </div>
        </div>

        {/* Tham dự */}
        {(sk.so_luong_du_kien || sk.so_luong_thuc_te) && (
          <div className="px-5 py-4 border-t border-slate-100">
            <div className="flex items-center gap-2 text-slate-400 mb-2">
              <Users size={14} />
              <span className="text-xs font-semibold uppercase tracking-wide">Tham dự</span>
            </div>
            <div className="flex items-center gap-6 text-sm">
              {sk.so_luong_du_kien && (
                <div>
                  <span className="text-2xl font-bold text-blue-700">{sk.so_luong_du_kien.toLocaleString('vi-VN')}</span>
                  <span className="text-slate-400 ml-1 text-xs">người dự kiến</span>
                </div>
              )}
              {sk.so_luong_thuc_te && (
                <div>
                  <span className="text-2xl font-bold text-emerald-700">{sk.so_luong_thuc_te.toLocaleString('vi-VN')}</span>
                  <span className="text-slate-400 ml-1 text-xs">người thực tế</span>
                </div>
              )}
            </div>
            {sk.can_dang_ky && (
              <div className="mt-2 text-xs text-blue-600 font-medium bg-blue-50 rounded-lg px-3 py-1.5 inline-block">
                ✅ Yêu cầu đăng ký tham dự
                {sk.han_dang_ky && ` · Hạn: ${format(new Date(sk.han_dang_ky), 'dd/MM/yyyy HH:mm')}`}
              </div>
            )}
          </div>
        )}

        {/* Ban tổ chức */}
        {(sk.don_vi_to_chuc || sk.nguoi_phu_trach) && (
          <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-4 flex-wrap text-sm">
              {sk.don_vi_to_chuc && (
                <div>
                  <span className="text-xs text-slate-400">Đơn vị tổ chức: </span>
                  <span className="font-medium text-slate-700">{sk.don_vi_to_chuc}</span>
                </div>
              )}
              {sk.nguoi_phu_trach && (
                <div>
                  <span className="text-xs text-slate-400">Phụ trách: </span>
                  <span className="font-medium text-slate-700">{sk.nguoi_phu_trach}</span>
                </div>
              )}
              {sk.sdt_lien_he && (
                <a href={`tel:${sk.sdt_lien_he}`} className="flex items-center gap-1 text-blue-600 hover:underline">
                  <Phone size={12} /> {sk.sdt_lien_he}
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mô tả */}
      {sk.mo_ta && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h2 className="font-bold text-slate-700 text-sm mb-3 flex items-center gap-2">
            <CalendarDays size={14} className="text-[#8B1A1A]" /> Mô tả sự kiện
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed">{sk.mo_ta}</p>
        </div>
      )}

      {/* Nội dung chi tiết */}
      {sk.noi_dung_day_du && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h2 className="font-bold text-slate-700 text-sm mb-3">Chương trình chi tiết</h2>
          <div className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{sk.noi_dung_day_du}</div>
        </div>
      )}

      {/* Ghi chú nội bộ */}
      {sk.ghi_chu && (
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
          <p className="text-xs font-bold text-amber-600 uppercase tracking-wide mb-1">Ghi chú nội bộ</p>
          <p className="text-sm text-amber-800">{sk.ghi_chu}</p>
        </div>
      )}

      {/* ── Thao tác trạng thái ──────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h2 className="font-bold text-slate-700 text-sm mb-4 pb-2 border-b border-slate-100">Thao tác</h2>
        <div className="flex flex-wrap gap-3">

          {/* Toggle nổi bật */}
          <form action={handleToggleNoiBat}>
            <input type="hidden" name="id" value={sk.id} />
            <input type="hidden" name="noi_bat" value={sk.noi_bat ? 'false' : 'true'} />
            <button
              type="submit"
              className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-colors ${
                sk.noi_bat
                  ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                  : 'bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700'
              }`}
            >
              <Star size={14} fill={sk.noi_bat ? 'currentColor' : 'none'} />
              {sk.noi_bat ? 'Bỏ nổi bật' : 'Đánh dấu nổi bật'}
            </button>
          </form>

          {/* Trạng thái */}
          {sk.trang_thai === 'SAP_DIEN_RA' && (
            <form action={handleCapNhatTrangThai}>
              <input type="hidden" name="id" value={sk.id} />
              <input type="hidden" name="trang_thai" value="DANG_DIEN_RA" />
              <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors">
                <PlayCircle size={14} /> Bắt đầu sự kiện
              </button>
            </form>
          )}

          {sk.trang_thai === 'DANG_DIEN_RA' && (
            <form action={handleCapNhatTrangThai}>
              <input type="hidden" name="id" value={sk.id} />
              <input type="hidden" name="trang_thai" value="DA_KET_THUC" />
              <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl transition-colors">
                <CheckCircle2 size={14} /> Kết thúc sự kiện
              </button>
            </form>
          )}

          {(sk.trang_thai === 'SAP_DIEN_RA' || sk.trang_thai === 'NHAP') && (
            <form action={handleCapNhatTrangThai}>
              <input type="hidden" name="id" value={sk.id} />
              <input type="hidden" name="trang_thai" value="HUY" />
              <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 text-sm font-semibold rounded-xl transition-colors">
                <XCircle size={14} /> Huỷ sự kiện
              </button>
            </form>
          )}
        </div>

        {/* Xoá */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <form action={handleXoa}>
            <input type="hidden" name="id" value={sk.id} />
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 text-xs text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-red-200"
            >
              <Trash2 size={12} /> Xoá sự kiện này
            </button>
          </form>
        </div>
      </div>

      {/* Metadata */}
      <p className="text-xs text-slate-400 text-right pb-4">
        Tạo: {format(new Date(sk.created_at), 'HH:mm dd/MM/yyyy')}
        {sk.updated_at !== sk.created_at && ` · Cập nhật: ${format(new Date(sk.updated_at), 'HH:mm dd/MM/yyyy')}`}
      </p>
    </div>
  )
}
