import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  Home, Phone, MapPin, Users, QrCode, MessageSquare,
  AlertCircle, ChevronRight, Calendar, Hash, Shield, ArrowLeft, UserCog,
} from 'lucide-react'
import { createServiceClient } from '@/lib/supabase/server'

export const revalidate = 60  // trang này ít thay đổi, cache 1 phút

interface Props {
  params: Promise<{ token: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('ho_dan')
    .select('chu_ho, ma_ho')
    .eq('qr_token', token)
    .is('deleted_at', null)
    .single()

  if (!data) return { title: 'Không tìm thấy — KP25' }
  return {
    title: `Hộ dân: ${data.chu_ho} — KP25`,
    description: `Thông tin hộ dân điện tử Khu phố 25. Mã hộ: ${data.ma_ho}`,
  }
}

const TRANG_THAI_LABEL: Record<string, { label: string; color: string }> = {
  THUONG_TRU: { label: 'Thường trú', color: 'text-emerald-700 bg-emerald-100' },
  TAM_TRU:    { label: 'Tạm trú',    color: 'text-blue-700 bg-blue-100'       },
  TAM_VANG:   { label: 'Tạm vắng',   color: 'text-slate-600 bg-slate-100'     },
}

export default async function QRScanPage({ params }: Props) {
  const { token } = await params

  const supabase = createServiceClient()

  // Lấy thông tin hộ dân theo qr_token
  const { data: ho, error } = await supabase
    .from('ho_dan')
    .select('id, ma_ho, chu_ho, dia_chi_day, so_nha, duong, to_truong, so_dien_thoai, trang_thai, so_nhan_khau, created_at')
    .eq('qr_token', token)
    .is('deleted_at', null)
    .single()

  if (error || !ho) notFound()

  // Đếm nhân khẩu thực tế
  const { count: soNkThucTe } = await supabase
    .from('nhan_khau')
    .select('id', { count: 'exact', head: true })
    .eq('ho_id', ho.id)
    .is('deleted_at', null)
    .or('da_mat.is.null,da_mat.eq.false')

  const ttCfg = TRANG_THAI_LABEL[ho.trang_thai ?? 'THUONG_TRU'] ?? TRANG_THAI_LABEL['THUONG_TRU']!

  const diaChi = ho.dia_chi_day
    || [ho.so_nha, ho.duong, 'Khu phố 25, Phường Long Trường, TP.HCM'].filter(Boolean).join(', ')

  const ngayLap = ho.created_at
    ? new Date(ho.created_at).toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' })
    : '—'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-md mx-auto px-4 py-8 space-y-5">

        {/* Back */}
        <Link href="/qr" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft size={15} />
          Trang QR hộ dân
        </Link>

        {/* ── Phiếu hộ dân điện tử ──────────────────────────── */}
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-slate-100">

          {/* Header card */}
          <div className="bg-gradient-to-r from-[#1E3A5F] to-indigo-700 px-6 py-5 text-white">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <QrCode size={14} className="opacity-70" />
                  <span className="text-xs text-blue-200 font-medium uppercase tracking-wide">Phiếu hộ dân điện tử</span>
                </div>
                <h1 className="text-xl font-bold leading-tight">{ho.chu_ho}</h1>
                <p className="text-blue-200 text-sm mt-0.5">Chủ hộ · Khu phố 25</p>
              </div>
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${ttCfg.color}`}>
                {ttCfg.label}
              </span>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-5 space-y-4">

            {/* Địa chỉ */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                <MapPin size={15} className="text-slate-500" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-400 mb-0.5">Địa chỉ</p>
                <p className="text-sm font-semibold text-slate-800 leading-relaxed">{diaChi}</p>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-slate-50" />

            {/* Grid thông tin */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Hash size={12} className="text-slate-400" />
                  <span className="text-xs text-slate-400">Mã hộ</span>
                </div>
                <p className="text-sm font-bold text-slate-800 font-mono">{ho.ma_ho}</p>
              </div>

              <div className="bg-slate-50 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Users size={12} className="text-slate-400" />
                  <span className="text-xs text-slate-400">Nhân khẩu</span>
                </div>
                <p className="text-sm font-bold text-slate-800">{soNkThucTe ?? ho.so_nhan_khau} người</p>
              </div>

              {ho.to_truong && (
                <div className="bg-slate-50 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <MapPin size={12} className="text-slate-400" />
                    <span className="text-xs text-slate-400">Tổ / Khu vực</span>
                  </div>
                  <p className="text-sm font-bold text-slate-800">{ho.to_truong}</p>
                </div>
              )}

              <div className="bg-slate-50 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Calendar size={12} className="text-slate-400" />
                  <span className="text-xs text-slate-400">Lập hồ sơ</span>
                </div>
                <p className="text-sm font-bold text-slate-800">{ngayLap}</p>
              </div>
            </div>

            {/* SĐT chủ hộ */}
            {ho.so_dien_thoai && (
              <a
                href={`tel:${ho.so_dien_thoai}`}
                className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-100 rounded-xl hover:bg-emerald-100 transition-colors"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                  <Phone size={16} className="text-emerald-700" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-emerald-600 font-medium">Liên hệ chủ hộ</p>
                  <p className="text-sm font-bold text-emerald-800">{ho.so_dien_thoai}</p>
                </div>
                <ChevronRight size={15} className="text-emerald-400" />
              </a>
            )}
          </div>

          {/* Footer card */}
          <div className="px-6 pb-5">
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2">
              <Shield size={13} className="text-blue-500 shrink-0" />
              <p className="text-[11px] text-blue-600 leading-relaxed">
                Thông tin chính thức từ hệ thống KP25 Smart Community OS · Phường Long Trường, TP.HCM
              </p>
            </div>
          </div>
        </div>

        {/* ── Cập nhật thông tin (tự khai) ─────────────────── */}
        <Link
          href={`/qr/${token}/cap-nhat`}
          className="flex items-center gap-3 p-4 bg-gradient-to-r from-[#1E3A5F] to-indigo-700 text-white rounded-2xl shadow-sm hover:opacity-95 transition-opacity group"
        >
          <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
            <UserCog size={18} />
          </div>
          <div className="flex-1">
            <p className="font-bold text-sm">Cập nhật thông tin hộ</p>
            <p className="text-xs text-blue-200">Tự khai báo, bổ sung thông tin cá nhân</p>
          </div>
          <ChevronRight size={16} className="text-blue-200 group-hover:translate-x-0.5 transition-transform" />
        </Link>

        {/* ── Thao tác nhanh ───────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Thao tác nhanh</p>

          {[
            {
              href:    '/phan-anh/tao',
              icon:    AlertCircle,
              label:   'Gửi phản ánh',
              desc:    'Báo cáo vấn đề trong khu phố',
              color:   'text-[#8B1A1A]',
              bg:      'bg-red-50',
            },
            {
              href:    '/chat',
              icon:    MessageSquare,
              label:   'Hỏi AI trợ lý',
              desc:    'Hướng dẫn thủ tục hành chính',
              color:   'text-emerald-700',
              bg:      'bg-emerald-50',
            },
            {
              href:    '/dan-cu',
              icon:    Home,
              label:   'Tra cứu hộ khẩu',
              desc:    'Thông tin đăng ký thường trú',
              color:   'text-[#1E3A5F]',
              bg:      'bg-blue-50',
            },
            {
              href:    '/lien-he',
              icon:    Phone,
              label:   'Liên hệ cán bộ',
              desc:    'Trưởng KP: 0773 735 317',
              color:   'text-indigo-700',
              bg:      'bg-indigo-50',
            },
          ].map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${item.bg}`}>
                <item.icon size={16} className={item.color} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${item.color}`}>{item.label}</p>
                <p className="text-xs text-slate-400 truncate">{item.desc}</p>
              </div>
              <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-500 shrink-0" />
            </Link>
          ))}
        </div>

        {/* ── Footer stamp ────────────────────────────────── */}
        <div className="text-center py-2">
          <p className="text-xs text-slate-400">
            KP25 Smart Community OS · Khu phố 25 · Phường Long Trường · TP.HCM
          </p>
          <p className="text-[10px] text-slate-300 mt-0.5">
            Hệ thống chuyển đổi số cộng đồng dân cư — 2026
          </p>
        </div>

      </div>
    </div>
  )
}
