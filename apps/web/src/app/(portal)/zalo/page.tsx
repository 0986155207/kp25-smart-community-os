import type { Metadata } from 'next'
import Link from 'next/link'
import {
  MessageCircle, UserPlus, Bell, Shield, Info,
  ChevronRight, QrCode, Phone, CheckCircle,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Kênh Zalo — Khu phố 25',
  description: 'Theo dõi Zalo OA và tham gia Group Zalo cộng đồng Khu phố 25 – Long Trường – TP.HCM',
}

export const revalidate = 3600

// ─── Lấy config OA từ DB ─────────────────────────────────────
async function getOAInfo() {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('zalo_oa_config')
      .select('oa_name, trang_thai, follower_count, oa_avatar')
      .single()
    return data
  } catch { return null }
}

// ─── Tính năng kênh Zalo ─────────────────────────────────────
const TINH_NANG = [
  {
    icon: Bell,
    color: 'bg-blue-100 text-blue-600',
    title: 'Nhận thông báo tức thì',
    desc: 'Thông báo họp khu phố, sự kiện, cảnh báo khẩn cấp đến điện thoại bạn ngay lập tức.',
  },
  {
    icon: MessageCircle,
    color: 'bg-emerald-100 text-emerald-600',
    title: 'Trao đổi với cán bộ',
    desc: 'Nhắn tin trực tiếp với ban quản lý khu phố qua Zalo OA — không cần đến trực tiếp.',
  },
  {
    icon: Shield,
    color: 'bg-red-100 text-red-600',
    title: 'Phản ánh hiện trường',
    desc: 'Gửi hình ảnh, vị trí các vấn đề cần xử lý ngay trong Group cộng đồng.',
  },
  {
    icon: Info,
    color: 'bg-violet-100 text-violet-600',
    title: 'Tin tức khu phố',
    desc: 'Các chính sách mới, chương trình an sinh, lịch tiêm chủng và thông tin hữu ích.',
  },
]

// ─── Bước tham gia ────────────────────────────────────────────
const BUOC_THAM_GIA_GROUP = [
  { step: 1, text: 'Mở ứng dụng Zalo trên điện thoại' },
  { step: 2, text: 'Quét mã QR bên dưới hoặc tìm kiếm "KP25 Long Trường"' },
  { step: 3, text: 'Nhấn "Tham gia nhóm" và chờ quản trị viên duyệt' },
  { step: 4, text: 'Đã vào nhóm — bạn sẽ nhận được thông báo từ khu phố' },
]

export default async function ZaloPage() {
  const oaInfo = await getOAInfo()
  const oaActive = oaInfo?.trang_thai === 'ACTIVE'
  const groupUrl     = process.env.NEXT_PUBLIC_ZALO_GROUP_URL
  const oaUrl        = process.env.NEXT_PUBLIC_ZALO_OA_URL
  const groupQRUrl   = process.env.NEXT_PUBLIC_ZALO_GROUP_QR
  const hotline      = process.env.NEXT_PUBLIC_HOTLINE ?? '0773 735 317'

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">

      {/* ── Header ── */}
      <div className="text-center">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
          <MessageCircle size={36} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Kênh Zalo Khu phố 25</h1>
        <p className="text-slate-500 text-sm mt-1.5">
          Phường Long Trường · TP.HCM
        </p>
      </div>

      {/* ── Banner OA ─────────────────────────────────────────── */}
      <div className={`rounded-2xl border-2 p-5 ${
        oaActive
          ? 'border-blue-200 bg-blue-50'
          : 'border-amber-200 bg-amber-50'
      }`}>
        <div className="flex items-start gap-4">
          {oaInfo?.oa_avatar ? (
            <img
              src={oaInfo.oa_avatar}
              alt="OA Avatar"
              className="w-14 h-14 rounded-2xl object-cover shrink-0"
            />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-blue-200 flex items-center justify-center shrink-0">
              <MessageCircle size={28} className="text-blue-600" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-bold text-slate-800 text-base">
                {oaInfo?.oa_name ?? 'Khu phố 25 – Long Trường'}
              </h2>
              {oaActive ? (
                <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle size={9} />
                  Đang hoạt động
                </span>
              ) : (
                <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                  Sắp ra mắt
                </span>
              )}
            </div>
            <p className="text-sm text-slate-600 mt-1">
              Trang chính thức của Ban quản lý Khu phố 25 trên Zalo
            </p>
            {oaInfo?.follower_count ? (
              <p className="text-xs text-slate-500 mt-1">
                {oaInfo.follower_count.toLocaleString('vi-VN')} người theo dõi
              </p>
            ) : null}

            {oaActive && oaUrl ? (
              <a
                href={oaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-3 text-xs font-bold
                           text-white bg-blue-600 px-4 py-2 rounded-xl hover:bg-blue-700
                           transition-colors"
              >
                <UserPlus size={13} />
                Quan tâm OA ngay
              </a>
            ) : (
              <div className="mt-3 flex items-center gap-2 text-xs text-amber-700">
                <Info size={13} />
                OA đang chờ Zalo phê duyệt — dự kiến ra mắt sắp tới
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Tính năng ──────────────────────────────────────────── */}
      <div>
        <h2 className="font-bold text-slate-800 mb-3 text-base">Lợi ích khi tham gia</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {TINH_NANG.map((f, i) => (
            <div key={i} className="card flex items-start gap-3 py-4">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${f.color}`}>
                <f.icon size={18} />
              </div>
              <div>
                <p className="font-semibold text-slate-800 text-sm">{f.title}</p>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Group Zalo ─────────────────────────────────────────── */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
            <MessageCircle size={20} className="text-emerald-600" />
          </div>
          <div>
            <h2 className="font-bold text-slate-800">Group Zalo Cộng đồng</h2>
            <p className="text-xs text-slate-500">Nhóm trò chuyện trực tiếp của KP25</p>
          </div>
        </div>

        {/* QR code */}
        {groupQRUrl ? (
          <div className="flex flex-col items-center gap-3 mb-5 p-4 bg-slate-50 rounded-xl">
            <img
              src={groupQRUrl}
              alt="QR Code Group Zalo KP25"
              className="w-40 h-40 rounded-xl"
            />
            <p className="text-xs text-slate-500">Quét mã để vào Group</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 mb-5 p-6 bg-slate-50 rounded-xl">
            <QrCode size={48} className="text-slate-300" />
            <p className="text-sm text-slate-400">Mã QR sẽ được cập nhật sắp tới</p>
          </div>
        )}

        {/* Các bước */}
        <div className="space-y-2.5 mb-4">
          {BUOC_THAM_GIA_GROUP.map(b => (
            <div key={b.step} className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center shrink-0">
                {b.step}
              </span>
              <p className="text-sm text-slate-600">{b.text}</p>
            </div>
          ))}
        </div>

        {groupUrl && (
          <a
            href={groupUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 bg-emerald-600
                       text-white font-bold text-sm rounded-xl hover:bg-emerald-700 transition-colors"
          >
            <MessageCircle size={16} />
            Vào Group Zalo ngay
            <ChevronRight size={16} />
          </a>
        )}
      </div>

      {/* ── Liên hệ trực tiếp ─────────────────────────────────── */}
      <div className="card">
        <h2 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
          <Phone size={16} className="text-slate-500" />
          Liên hệ trực tiếp
        </h2>
        <div className="space-y-2">
          <div className="flex items-center justify-between py-2.5 border-b border-slate-100">
            <span className="text-sm text-slate-600">Đường dây nóng KP25</span>
            <a href={`tel:${hotline.replace(/\s/g, '')}`}
               className="text-sm font-bold text-blue-600 hover:underline">
              {hotline}
            </a>
          </div>
          <div className="flex items-center justify-between py-2.5 border-b border-slate-100">
            <span className="text-sm text-slate-600">Gửi phản ánh trực tuyến</span>
            <Link href="/phan-anh/tao"
                  className="text-sm font-bold text-blue-600 hover:underline flex items-center gap-1">
              Gửi ngay <ChevronRight size={13} />
            </Link>
          </div>
          <div className="flex items-center justify-between py-2.5">
            <span className="text-sm text-slate-600">Tra cứu thông tin</span>
            <Link href="/tra-cuu"
                  className="text-sm font-bold text-blue-600 hover:underline flex items-center gap-1">
              Tra cứu <ChevronRight size={13} />
            </Link>
          </div>
        </div>
      </div>

      {/* Footer note */}
      <p className="text-center text-xs text-slate-400 pb-4">
        Khu phố 25 · Phường Long Trường · TP.HCM
      </p>

    </div>
  )
}
