'use client'

import { useState, useTransition } from 'react'
import {
  Bell, Send, Users, CheckCircle2, XCircle, Clock,
  Loader2, Smartphone, AlertCircle, ChevronRight,
  Megaphone, Shield, Leaf, CalendarDays, MessageSquare,
} from 'lucide-react'
import type { LichSuPush, ThongKePush } from './actions'

// ── Giao diện ────────────────────────────────────────────────
interface Props {
  thongKe:  ThongKePush
  lichSu:   LichSuPush[]
}

// ── Mẫu thông báo nhanh ──────────────────────────────────────
const MAU_THONG_BAO = [
  {
    icon:  Megaphone,
    color: 'text-blue-600',
    bg:    'bg-blue-50',
    title: 'Thông báo họp khu phố',
    body:  'Khu phố 25 tổ chức họp định kỳ tháng này. Đề nghị bà con sắp xếp tham dự đầy đủ.',
  },
  {
    icon:  Shield,
    color: 'text-red-600',
    bg:    'bg-red-50',
    title: 'Cảnh báo an ninh khu phố',
    body:  'Khu phố ghi nhận một số vụ mất trộm gần đây. Bà con cần cảnh giác và báo ngay cho công an khu phố.',
  },
  {
    icon:  Leaf,
    color: 'text-emerald-600',
    bg:    'bg-emerald-50',
    title: 'Vệ sinh môi trường',
    body:  'Chiến dịch tổng vệ sinh khu phố diễn ra vào Chủ nhật tới. Kính mời bà con cùng tham gia.',
  },
  {
    icon:  CalendarDays,
    color: 'text-purple-600',
    bg:    'bg-purple-50',
    title: 'Sự kiện cộng đồng',
    body:  'Khu phố 25 tổ chức ngày hội văn hoá thể thao. Đăng ký tham gia tại Ban quản lý khu phố.',
  },
]

// ── Tiện ích ─────────────────────────────────────────────────
function thoiGianRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)  return 'Vừa xong'
  if (m < 60) return `${m} phút trước`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} giờ trước`
  const d = Math.floor(h / 24)
  return `${d} ngày trước`
}

// ── Stat card ────────────────────────────────────────────────
function StatCard({
  icon: Icon, label, value, color, bg,
}: {
  icon: React.ElementType; label: string; value: number; color: string; bg: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center shrink-0`}>
        <Icon size={22} className={color} />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800">{value.toLocaleString('vi-VN')}</p>
        <p className="text-sm text-slate-500 mt-0.5">{label}</p>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────
export default function PushClient({ thongKe, lichSu }: Props) {
  const [title,         setTitle]         = useState('')
  const [body,          setBody]          = useState('')
  const [url,           setUrl]           = useState('/dashboard')
  const [isPending,     startTransition]  = useTransition()
  const [ketQua,        setKetQua]        = useState<{
    success: boolean; thanh_cong?: number; loi?: number; tong?: number; message: string
  } | null>(null)
  const [lichSuHienTai, setLichSuHienTai] = useState<LichSuPush[]>(lichSu)

  function apMau(mau: typeof MAU_THONG_BAO[number]) {
    setTitle(mau.title)
    setBody(mau.body)
    setKetQua(null)
  }

  function handleGui() {
    if (!title.trim() || !body.trim()) return
    setKetQua(null)

    startTransition(async () => {
      try {
        const res = await fetch('/api/push/send', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ title: title.trim(), body: body.trim(), url }),
        })
        const data = await res.json() as {
          success: boolean; thanh_cong?: number; loi?: number; tong?: number; message?: string; error?: string
        }

        setKetQua({
          success:    data.success ?? false,
          thanh_cong: data.thanh_cong,
          loi:        data.loi,
          tong:       data.tong,
          message:    data.message ?? data.error ?? 'Lỗi không xác định',
        })

        // Reload lịch sử từ server
        if (data.success) {
          setTitle('')
          setBody('')
          // Thêm tạm vào danh sách lịch sử
          const newEntry: LichSuPush = {
            id:            Date.now().toString(),
            tieu_de:       title.trim(),
            noi_dung:      body.trim(),
            url_dich:      url,
            so_thiet_bi:   data.tong       ?? 0,
            so_thanh_cong: data.thanh_cong ?? 0,
            so_loi:        data.loi        ?? 0,
            nguoi_gui:     'Bạn',
            created_at:    new Date().toISOString(),
          }
          setLichSuHienTai(prev => [newEntry, ...prev])
        }
      } catch {
        setKetQua({ success: false, message: 'Lỗi kết nối máy chủ' })
      }
    })
  }

  const canSend = title.trim().length > 0 && body.trim().length > 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Gửi thông báo đẩy</h1>
          <p className="text-sm text-slate-500 mt-1">
            Gửi thông báo trực tiếp đến thiết bị của tất cả cán bộ và người dùng đã đăng ký
          </p>
        </div>
      </div>

      {/* Thống kê */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={Smartphone}
          label="Thiết bị đã đăng ký"
          value={thongKe.tong_thiet_bi}
          color="text-blue-600"
          bg="bg-blue-50"
        />
        <StatCard
          icon={Bell}
          label="Thiết bị đang hoạt động"
          value={thongKe.thiet_bi_hoat_dong}
          color="text-emerald-600"
          bg="bg-emerald-50"
        />
        <StatCard
          icon={Send}
          label="Lần gửi thông báo"
          value={thongKe.so_lan_gui}
          color="text-[#8B1A1A]"
          bg="bg-red-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Cột trái: form soạn ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Mẫu nhanh */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <MessageSquare size={15} className="text-slate-400" />
              Mẫu thông báo nhanh
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {MAU_THONG_BAO.map((mau, idx) => {
                const Icon = mau.icon
                return (
                  <button
                    key={idx}
                    onClick={() => apMau(mau)}
                    className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200
                      hover:border-[#8B1A1A] hover:bg-red-50/40 transition-all text-left group"
                  >
                    <div className={`w-8 h-8 rounded-lg ${mau.bg} flex items-center justify-center shrink-0`}>
                      <Icon size={15} className={mau.color} />
                    </div>
                    <span className="text-xs font-medium text-slate-600 group-hover:text-[#8B1A1A] line-clamp-2">
                      {mau.title}
                    </span>
                    <ChevronRight size={14} className="ml-auto text-slate-300 group-hover:text-[#8B1A1A] shrink-0" />
                  </button>
                )
              })}
            </div>
          </div>

          {/* Form soạn */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
            <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Bell size={15} className="text-[#8B1A1A]" />
              Soạn thông báo
            </h2>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">
                Tiêu đề <span className="text-red-500">*</span>
              </label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="VD: Thông báo họp khu phố tháng 6"
                maxLength={100}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm
                  focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]/30 focus:border-[#8B1A1A] transition-all"
              />
              <p className="text-xs text-slate-400 text-right">{title.length}/100</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">
                Nội dung <span className="text-red-500">*</span>
              </label>
              <textarea
                value={body}
                onChange={e => setBody(e.target.value)}
                rows={4}
                placeholder="Nhập nội dung thông báo ngắn gọn, rõ ràng..."
                maxLength={300}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm
                  resize-none focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]/30 focus:border-[#8B1A1A] transition-all"
              />
              <p className="text-xs text-slate-400 text-right">{body.length}/300</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">
                Đường dẫn khi nhấn thông báo
              </label>
              <input
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="/dashboard"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-mono
                  focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]/30 focus:border-[#8B1A1A] transition-all"
              />
            </div>

            {/* Kết quả */}
            {ketQua && (
              <div className={`flex items-start gap-3 rounded-xl px-4 py-3 text-sm
                ${ketQua.success
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  : 'bg-red-50 border border-red-200 text-red-800'
                }`}
              >
                {ketQua.success
                  ? <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-600" />
                  : <AlertCircle  size={16} className="shrink-0 mt-0.5 text-red-600" />
                }
                <div>
                  <p className="font-medium">{ketQua.message}</p>
                  {ketQua.success && ketQua.tong !== undefined && (
                    <p className="text-xs mt-0.5 opacity-80">
                      Thành công: {ketQua.thanh_cong} · Lỗi: {ketQua.loi} · Tổng: {ketQua.tong} thiết bị
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Nút gửi */}
            <div className="flex justify-end pt-1">
              <button
                onClick={handleGui}
                disabled={!canSend || isPending}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#8B1A1A] text-white
                  text-sm font-semibold hover:bg-[#6B1414] disabled:opacity-50 transition-colors"
              >
                {isPending
                  ? <><Loader2 size={15} className="animate-spin" /> Đang gửi...</>
                  : <><Send size={15} /> Gửi đến {thongKe.thiet_bi_hoat_dong} thiết bị</>
                }
              </button>
            </div>
          </div>
        </div>

        {/* ── Cột phải: lịch sử ── */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
              <Clock size={16} className="text-slate-400" />
              <h2 className="text-sm font-semibold text-slate-700">Lịch sử gửi</h2>
              <span className="ml-auto text-xs text-slate-400">{lichSuHienTai.length} lần</span>
            </div>

            {lichSuHienTai.length === 0 ? (
              <div className="py-10 text-center">
                <Bell size={32} className="mx-auto text-slate-200 mb-2" />
                <p className="text-sm text-slate-400">Chưa có lịch sử gửi</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-[520px] overflow-y-auto">
                {lichSuHienTai.map(item => (
                  <div key={item.id} className="px-5 py-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <p className="text-sm font-semibold text-slate-800 line-clamp-1 flex-1">
                        {item.tieu_de}
                      </p>
                      <span className="text-xs text-slate-400 shrink-0">
                        {thoiGianRelative(item.created_at)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2 mb-2">{item.noi_dung}</p>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-xs text-emerald-600">
                        <CheckCircle2 size={11} />
                        {item.so_thanh_cong}
                      </span>
                      {item.so_loi > 0 && (
                        <span className="flex items-center gap-1 text-xs text-red-500">
                          <XCircle size={11} />
                          {item.so_loi}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Users size={11} />
                        {item.so_thiet_bi}
                      </span>
                      <span className="ml-auto text-xs text-slate-400 truncate max-w-[100px]">
                        {item.nguoi_gui}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Ghi chú */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <p className="text-xs font-semibold text-amber-700 mb-1.5">Lưu ý khi gửi thông báo</p>
            <ul className="text-xs text-amber-600 space-y-1 list-disc list-inside leading-relaxed">
              <li>Chỉ gửi thông báo quan trọng, tránh spam</li>
              <li>Nội dung ngắn gọn, rõ ràng, dễ hiểu</li>
              <li>Thông báo sẽ hiện ngay cả khi người dùng không mở web</li>
              <li>Thiết bị không nhận được sẽ tự động bị vô hiệu hoá</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
