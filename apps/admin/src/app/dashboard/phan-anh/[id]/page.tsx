import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, AlertCircle, MapPin, Phone, User,
  Clock, Calendar, Image as ImageIcon, CheckCircle,
  Video, Film,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatDateTime, mapPhanAnh } from '@/lib/utils'
import XuLyPanel from './XuLyPanel'
import DeleteButton from './DeleteButton'

export const metadata: Metadata = { title: 'Chi tiết phản ánh' }
export const revalidate = 0

// ─── Config ─────────────────────────────────────────────────
const TRANG_THAI_CFG: Record<string, { label: string; badge: string; color: string; bg: string }> = {
  MOI: { label: 'Mới', badge: 'badge-yellow', color: 'text-amber-600', bg: 'bg-amber-50' },
  DANG_XU_LY: { label: 'Đang xử lý', badge: 'badge-blue', color: 'text-blue-600', bg: 'bg-blue-50' },
  DA_XU_LY: { label: 'Đã xử lý', badge: 'badge-green', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  DONG: { label: 'Đã đóng', badge: 'badge-gray', color: 'text-slate-500', bg: 'bg-slate-100' },
}

const MUC_DO_CFG: Record<string, { label: string; badge: string; color: string }> = {
  KHAN_CAP: { label: 'Khẩn cấp', badge: 'badge-red', color: 'text-red-600' },
  CAO: { label: 'Cao', badge: 'badge-orange', color: 'text-orange-600' },
  TRUNG_BINH: { label: 'Trung bình', badge: 'badge-yellow', color: 'text-amber-600' },
  THAP: { label: 'Thấp', badge: 'badge-gray', color: 'text-slate-500' },
}

const LOAI_LABEL: Record<string, string> = {
  AN_NINH: 'An ninh',
  MOI_TRUONG: 'Môi trường',
  CO_SO_HA_TANG: 'Cơ sở hạ tầng',
  HA_TANG: 'Hạ tầng',
  AN_SINH: 'An sinh',
  GIAO_THONG: 'Giao thông',
  KHAC: 'Khác',
}

// ─── Page ────────────────────────────────────────────────────
export default async function ChiTietPhanAnhPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data } = await supabase
    .from('phan_anh')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (!data) notFound()

  const item = mapPhanAnh(data)
  const ttCfg = TRANG_THAI_CFG[item.trangThai] ?? TRANG_THAI_CFG['MOI']!
  const mdCfg = MUC_DO_CFG[item.mucDo] ?? MUC_DO_CFG['TRUNG_BINH']!

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Back + header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <Link
            href="/dashboard/phan-anh"
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors mt-1 shrink-0"
          >
            <ArrowLeft size={16} />
            Quay lại
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className={`badge ${ttCfg.badge}`}>{ttCfg.label}</span>
              <span className={`badge ${mdCfg.badge}`}>{mdCfg.label}</span>
              <span className="badge badge-gray">{LOAI_LABEL[item.loai] ?? item.loai}</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 leading-tight">{item.tieuDe}</h1>
            <p className="text-slate-400 text-sm mt-1 flex items-center gap-1">
              <Calendar size={13} />
              Gửi lúc {formatDateTime(item.createdAt)}
            </p>
          </div>
        </div>

        {/* Nút xoá — chỉ hiện khi đã xử lý hoặc đã đóng */}
        {(item.trangThai === 'DA_XU_LY' || item.trangThai === 'DONG') && (
          <DeleteButton id={item.id} tieuDe={item.tieuDe} />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cột trái — Nội dung */}
        <div className="lg:col-span-2 space-y-5">

          {/* Mô tả */}
          <div className="card">
            <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <AlertCircle size={16} className="text-orange-500" />
              Nội dung phản ánh
            </h2>
            <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{item.moTa}</p>
          </div>

          {/* Địa điểm */}
          {item.diaChiPhanAnh && (
            <div className="card">
              <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <MapPin size={16} className="text-blue-500" />
                Địa điểm xảy ra
              </h2>
              <p className="text-slate-700">{item.diaChiPhanAnh}</p>
              {item.toaDoLat && item.toaDoLng && (
                <a
                  href={`https://www.google.com/maps?q=${item.toaDoLat},${item.toaDoLng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-2 text-sm text-[#8B1A1A] hover:underline"
                >
                  <MapPin size={13} />
                  Xem trên bản đồ
                </a>
              )}
            </div>
          )}

          {/* Hình ảnh hiện trường */}
          {item.anhUrls.length > 0 && (
            <div className="card">
              <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <ImageIcon size={16} className="text-violet-500" />
                Hình ảnh hiện trường
                <span className="text-xs font-normal text-slate-400 ml-1">
                  {item.anhUrls.length} ảnh
                </span>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {item.anhUrls.map((url, i) => (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative block rounded-xl overflow-hidden aspect-[4/3] bg-slate-100 border border-slate-100"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={`Ảnh hiện trường ${i + 1}`}
                      className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-semibold bg-black/50 px-2 py-1 rounded-lg">
                        Xem ảnh
                      </span>
                    </div>
                    <div className="absolute bottom-1.5 left-1.5 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded-md font-medium">
                      {i + 1}/{item.anhUrls.length}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Video hiện trường */}
          {item.videoUrls.length > 0 && (
            <div className="card">
              <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <Film size={16} className="text-amber-500" />
                Video hiện trường
                <span className="text-xs font-normal text-slate-400 ml-1">
                  {item.videoUrls.length} video
                </span>
              </h2>
              <div className="space-y-4">
                {item.videoUrls.map((url, i) => (
                  <div
                    key={i}
                    className="rounded-xl overflow-hidden bg-slate-900 border border-slate-200"
                  >
                    {/* Header bar */}
                    <div className="flex items-center justify-between px-3 py-2 bg-slate-800">
                      <div className="flex items-center gap-2 text-slate-300 text-xs font-medium">
                        <Video size={13} className="text-amber-400" />
                        Video {i + 1}
                        {item.videoUrls.length > 1 && (
                          <span className="text-slate-500">/ {item.videoUrls.length}</span>
                        )}
                      </div>
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-slate-400 hover:text-white transition-colors"
                      >
                        Mở ngoài ↗
                      </a>
                    </div>
                    {/* Video player */}
                    <video
                      src={url}
                      controls
                      playsInline
                      preload="metadata"
                      className="w-full max-h-[400px] bg-black"
                      style={{ display: 'block' }}
                    >
                      Trình duyệt không hỗ trợ video.
                    </video>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Kết quả xử lý (đã hoàn thành) */}
          {item.ketQuaXuLy && (item.trangThai === 'DA_XU_LY' || item.trangThai === 'DONG') && (
            <div className="card border-emerald-100 bg-emerald-50/50">
              <h2 className="font-semibold text-emerald-800 mb-3 flex items-center gap-2">
                <CheckCircle size={16} className="text-emerald-600" />
                Kết quả xử lý
              </h2>
              <p className="text-emerald-700 leading-relaxed whitespace-pre-wrap">{item.ketQuaXuLy}</p>
              {item.thoiGianXuLy && (
                <p className="text-emerald-500 text-xs mt-2 flex items-center gap-1">
                  <Clock size={11} />
                  Hoàn thành lúc {formatDateTime(item.thoiGianXuLy)}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Cột phải — Thông tin & xử lý */}
        <div className="space-y-5">

          {/* Thông tin người gửi */}
          <div className="card">
            <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <User size={16} className="text-slate-500" />
              Người phản ánh
            </h2>
            <div className="space-y-3">
              {item.nguoiGuiTen && (
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                    <User size={16} className="text-slate-500" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Họ tên</p>
                    <p className="text-sm font-semibold text-slate-900">{item.nguoiGuiTen}</p>
                  </div>
                </div>
              )}
              {item.nguoiGuiSdt && (
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                    <Phone size={16} className="text-slate-500" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Số điện thoại</p>
                    <a
                      href={`tel:${item.nguoiGuiSdt}`}
                      className="text-sm font-semibold text-[#8B1A1A] hover:underline"
                    >
                      {item.nguoiGuiSdt}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Thông tin hồ sơ */}
          <div className="card">
            <h2 className="font-semibold text-slate-800 mb-4">Thông tin hồ sơ</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Loại</span>
                <span className="font-medium text-slate-700">{LOAI_LABEL[item.loai] ?? item.loai}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Mức độ</span>
                <span className={`font-semibold ${mdCfg.color}`}>{mdCfg.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Trạng thái</span>
                <span className={`badge ${ttCfg.badge}`}>{ttCfg.label}</span>
              </div>
              <hr className="border-slate-100" />
              <div className="flex justify-between">
                <span className="text-slate-400">Ngày gửi</span>
                <span className="text-slate-700">{formatDateTime(item.createdAt)}</span>
              </div>
              {item.thoiGianXuLy && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Ngày xử lý</span>
                  <span className="text-slate-700">{formatDateTime(item.thoiGianXuLy)}</span>
                </div>
              )}
              {(item.anhUrls.length > 0 || item.videoUrls.length > 0) && (
                <>
                  <hr className="border-slate-100" />
                  {item.anhUrls.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Hình ảnh</span>
                      <span className="text-slate-700 flex items-center gap-1">
                        <ImageIcon size={12} className="text-violet-400" />
                        {item.anhUrls.length} ảnh
                      </span>
                    </div>
                  )}
                  {item.videoUrls.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Video</span>
                      <span className="text-slate-700 flex items-center gap-1">
                        <Film size={12} className="text-amber-400" />
                        {item.videoUrls.length} video
                      </span>
                    </div>
                  )}
                </>
              )}
              <hr className="border-slate-100" />
              <div className="flex justify-between">
                <span className="text-slate-400">Mã phản ánh</span>
                <span className="text-slate-500 text-xs font-mono">{item.id.slice(0, 8).toUpperCase()}</span>
              </div>
            </div>
          </div>

          {/* Panel xử lý */}
          <div className="card">
            <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <CheckCircle size={16} className="text-[#8B1A1A]" />
              Xử lý phản ánh
            </h2>
            <XuLyPanel
              id={item.id}
              tieuDe={item.tieuDe}
              moTa={item.moTa}
              loai={item.loai}
              mucDo={item.mucDo}
              diaChiPhanAnh={item.diaChiPhanAnh ?? ''}
              currentTrangThai={item.trangThai}
              currentKetQua={item.ketQuaXuLy}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
