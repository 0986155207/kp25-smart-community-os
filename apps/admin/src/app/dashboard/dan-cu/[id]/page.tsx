import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Home, Phone, User, MapPin,
  Hash, FileText, Pencil, Users, Crown, FileSpreadsheet, Skull, AlertTriangle, QrCode,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { mapHoDan, mapNhanKhau, formatDate } from '@/lib/utils'
import NhanKhauSection from './NhanKhauSection'
import DeleteButton from './DeleteButton'
import QRCodeButton from './QRCodeButton'

export const metadata: Metadata = { title: 'Chi tiết hộ dân' }
export const revalidate = 0

// ─── Config ─────────────────────────────────────────────────
const TRANG_THAI_CFG: Record<string, { label: string; badge: string; color: string; bg: string }> = {
  THUONG_TRU: { label: 'Thường trú', badge: 'badge-green', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  TAM_TRU: { label: 'Tạm trú', badge: 'badge-blue', color: 'text-blue-600', bg: 'bg-blue-50' },
  TAM_VANG: { label: 'Tạm vắng', badge: 'badge-gray', color: 'text-slate-500', bg: 'bg-slate-100' },
}

// ─── Page ────────────────────────────────────────────────────
export default async function ChiTietHoDanPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [hoDanRes, nhanKhauRes] = await Promise.all([
    supabase.from('ho_dan').select('*').eq('id', id).is('deleted_at', null).single(),
    supabase.from('nhan_khau').select('*').eq('ho_id', id).is('deleted_at', null).order('created_at'),
  ])

  if (!hoDanRes.data) notFound()

  const item = mapHoDan(hoDanRes.data)
  const nhanKhauList = (nhanKhauRes.data ?? []).map(mapNhanKhau)
  const ttCfg = TRANG_THAI_CFG[item.trangThai] ?? TRANG_THAI_CFG['THUONG_TRU']!

  // Kiểm tra chủ hộ đã mất (cần cập nhật chủ hộ mới)
  const chuHoDaMat = nhanKhauList.find(nk => nk.quanHe === 'Chủ hộ' && nk.daMat)

  const diaChi = [item.soNha, item.duong].filter(Boolean).join(' ')

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <Link
            href="/dashboard/dan-cu"
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors mt-1 shrink-0"
          >
            <ArrowLeft size={16} />
            Quay lại
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className={`badge ${ttCfg.badge}`}>{ttCfg.label}</span>
              <span className="badge badge-gray font-mono text-[10px]">{item.maHo}</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">{item.chuHo}</h1>
            <p className="text-slate-400 text-sm mt-1 flex items-center gap-1">
              <MapPin size={13} />
              {item.diaChiDay || diaChi || 'Chưa có địa chỉ'}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <QRCodeButton
            hoId={id}
            chuHo={item.chuHo}
            maHo={item.maHo}
            qrToken={item.qrToken}
            appUrl={process.env.NEXT_PUBLIC_WEB_URL ?? 'http://localhost:3000'}
          />
          <Link
            href={`/dashboard/dan-cu/${id}/sua`}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition-colors"
          >
            <Pencil size={14} />
            Chỉnh sửa
          </Link>
          <DeleteButton id={id} chuHo={item.chuHo} />
        </div>
      </div>

      {/* ── Cảnh báo chủ hộ đã mất ──────────────────────────── */}
      {chuHoDaMat && (
        <div className="flex items-start gap-4 bg-amber-50 border-2 border-amber-300 rounded-2xl p-4">
          <div className="p-2 bg-amber-100 rounded-xl shrink-0 mt-0.5">
            <AlertTriangle size={20} className="text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-amber-800">Chủ hộ đã mất — Cần cập nhật hồ sơ hộ dân</p>
            <p className="text-sm text-amber-700 mt-1">
              <strong>{chuHoDaMat.hoTen}</strong> (Chủ hộ) đã mất
              {chuHoDaMat.ngayMat ? ` ngày ${formatDate(chuHoDaMat.ngayMat)}` : ''}.
              Hộ dân <strong>vẫn tồn tại</strong> vì còn {nhanKhauList.filter(nk => !nk.daMat).length} thành viên
              đang sinh sống tại địa chỉ này. Vui lòng cập nhật chủ hộ mới.
            </p>
          </div>
          <Link
            href={`/dashboard/dan-cu/${id}/sua`}
            className="shrink-0 px-3 py-2 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-xl transition-colors"
          >
            Cập nhật chủ hộ
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cột trái */}
        <div className="lg:col-span-2 space-y-5">

          {/* Thông tin chủ hộ */}
          <div className="card">
            <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <User size={16} className="text-[#8B1A1A]" />
              Thông tin chủ hộ
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoRow icon={<User size={14} className="text-slate-500" />} label="Họ tên chủ hộ" value={item.chuHo} />
              <InfoRow
                icon={<Phone size={14} className="text-slate-500" />}
                label="Số điện thoại"
                value={item.soDienThoai}
                href={item.soDienThoai ? `tel:${item.soDienThoai}` : undefined}
              />
              <InfoRow icon={<Hash size={14} className="text-slate-500" />} label="Mã hộ" value={item.maHo} mono />
              <InfoRow
                icon={<Users size={14} className="text-slate-500" />}
                label="Số nhân khẩu khai báo"
                value={`${item.soNhanKhau} người`}
              />
            </div>
          </div>

          {/* Địa chỉ */}
          <div className="card">
            <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <MapPin size={16} className="text-blue-500" />
              Địa chỉ
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <InfoRow icon={<Home size={14} className="text-slate-500" />} label="Số nhà" value={item.soNha} />
              <InfoRow icon={<MapPin size={14} className="text-slate-500" />} label="Đường / Hẻm" value={item.duong} />
              <InfoRow icon={<MapPin size={14} className="text-slate-500" />} label="Tổ / Khu vực" value={item.toTruong} />
            </div>
            {item.diaChiDay && (
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <p className="text-xs text-slate-400 mb-1">Địa chỉ đầy đủ</p>
                <p className="text-sm text-slate-700">{item.diaChiDay}</p>
              </div>
            )}
          </div>

          {/* Ghi chú */}
          {item.ghiChu && (
            <div className="card">
              <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <FileText size={16} className="text-slate-400" />
                Ghi chú
              </h2>
              <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{item.ghiChu}</p>
            </div>
          )}

          {/* Nhân khẩu */}
          <NhanKhauSection hoId={id} initialData={nhanKhauList} />
        </div>

        {/* Cột phải — sidebar */}
        <div className="space-y-5">
          {/* Tóm tắt */}
          <div className="card">
            <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Home size={16} className="text-[#8B1A1A]" />
              Thông tin hộ
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Tình trạng</span>
                <span className={`badge ${ttCfg.badge}`}>{ttCfg.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Nhân khẩu thực tế</span>
                <span className="font-semibold text-[#1E3A5F]">{nhanKhauList.length} người</span>
              </div>
              {item.toTruong && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Tổ / Khu vực</span>
                  <span className="font-medium text-slate-700">{item.toTruong}</span>
                </div>
              )}
              <hr className="border-slate-100" />
              <div className="flex justify-between">
                <span className="text-slate-400">Ngày lập hồ sơ</span>
                <span className="text-slate-600 text-xs">{formatDate(item.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Cập nhật lần cuối</span>
                <span className="text-slate-600 text-xs">{formatDate(item.updatedAt)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Mã hộ</span>
                <span className="text-slate-600 text-xs font-mono bg-slate-100 px-2 py-0.5 rounded">{item.maHo}</span>
              </div>
            </div>
          </div>

          {/* Thao tác nhanh */}
          <div className="card">
            <h2 className="font-semibold text-slate-800 mb-3">Thao tác nhanh</h2>
            <div className="space-y-1">
              <Link href={`/dashboard/dan-cu/${id}/sua`} className="flex items-center gap-2 p-2.5 rounded-lg hover:bg-slate-50 text-slate-700 text-sm transition-colors">
                <Pencil size={14} className="text-slate-400" />
                Chỉnh sửa hộ dân
              </Link>
              <Link href="/dashboard/dan-cu" className="flex items-center gap-2 p-2.5 rounded-lg hover:bg-slate-50 text-slate-700 text-sm transition-colors">
                <Users size={14} className="text-slate-400" />
                Danh sách hộ dân
              </Link>
              <Link href="/dashboard/dan-cu/them" className="flex items-center gap-2 p-2.5 rounded-lg hover:bg-slate-50 text-slate-700 text-sm transition-colors">
                <Home size={14} className="text-slate-400" />
                Thêm hộ dân mới
              </Link>
              <Link href="/dashboard/dan-cu/nhap-excel" className="flex items-center gap-2 p-2.5 rounded-lg hover:bg-slate-50 text-slate-700 text-sm transition-colors">
                <FileSpreadsheet size={14} className="text-slate-400" />
                Nhập từ Excel
              </Link>
              {item.qrToken && (
                <a
                  href={`${process.env.NEXT_PUBLIC_WEB_URL ?? 'http://localhost:3000'}/qr/${item.qrToken}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2.5 rounded-lg hover:bg-slate-50 text-indigo-600 text-sm transition-colors"
                >
                  <QrCode size={14} className="text-indigo-400" />
                  Xem trang QR công khai
                </a>
              )}
            </div>
          </div>

          {/* Thành viên hộ */}
          {nhanKhauList.length > 0 && (
            <div className="card">
              <h2 className="font-semibold text-slate-800 mb-3">Thành viên</h2>
              <div className="space-y-2">
                {/* Hiển thị Chủ hộ lên đầu */}
                {[...nhanKhauList].sort((a, b) =>
                  a.quanHe === 'Chủ hộ' ? -1 : b.quanHe === 'Chủ hộ' ? 1 : 0
                ).slice(0, 6).map((nk) => {
                  const isChuHo = nk.quanHe === 'Chủ hộ'
                  return (
                    <div
                      key={nk.id}
                      className={`flex items-center gap-2 rounded-lg px-2 py-1.5 ${
                        nk.daMat ? 'opacity-60' : isChuHo ? 'bg-amber-50 border border-amber-100' : ''
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                        nk.daMat ? 'bg-slate-200' : isChuHo ? 'bg-amber-100' : 'bg-blue-50'
                      }`}>
                        {nk.daMat
                          ? <Skull size={12} className="text-slate-400" />
                          : isChuHo
                            ? <Crown size={12} className="text-amber-600" />
                            : <User size={12} className="text-[#1E3A5F]" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <p className={`text-sm font-medium truncate ${
                            nk.daMat ? 'text-slate-400 line-through' : isChuHo ? 'text-amber-800' : 'text-slate-800'
                          }`}>
                            {nk.hoTen}
                          </p>
                          {!nk.daMat && isChuHo && (
                            <Crown size={9} className="text-amber-500 shrink-0" />
                          )}
                          {nk.daMat && (
                            <span className="text-[10px] text-slate-400 shrink-0">Đã mất</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400">
                          {nk.gioiTinh === 'NAM' ? 'Nam' : nk.gioiTinh === 'NU' ? 'Nữ' : 'Khác'}
                          {nk.ngaySinh ? ` · ${formatDate(nk.ngaySinh, 'yyyy')}` : ''}
                          {nk.quanHe ? ` · ${nk.quanHe}` : ''}
                        </p>
                      </div>
                    </div>
                  )
                })}
                {nhanKhauList.length > 6 && (
                  <p className="text-xs text-slate-400 text-center pt-1">+{nhanKhauList.length - 6} người nữa</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Helper ──────────────────────────────────────────────────
function InfoRow({ icon, label, value, href, mono = false }: {
  icon: React.ReactNode; label: string; value?: string; href?: string; mono?: boolean
}) {
  if (!value) return null
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 mt-0.5">{icon}</div>
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        {href ? (
          <a href={href} className={`text-sm font-semibold text-[#8B1A1A] hover:underline ${mono ? 'font-mono' : ''}`}>{value}</a>
        ) : (
          <p className={`text-sm font-semibold text-slate-900 ${mono ? 'font-mono' : ''}`}>{value}</p>
        )}
      </div>
    </div>
  )
}
