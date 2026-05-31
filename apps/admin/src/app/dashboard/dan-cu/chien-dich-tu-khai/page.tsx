import Link from 'next/link'
import { ArrowLeft, Megaphone, Inbox } from 'lucide-react'
import { layThongKeChienDich } from './actions'
import ChienDichClient from './ChienDichClient'

export const dynamic = 'force-dynamic'

export default async function ChienDichTuKhaiPage() {
  const thongKe = await layThongKeChienDich()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link href="/dashboard/dan-cu" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-2 transition-colors">
          <ArrowLeft size={14} /> Quản lý dân cư
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Megaphone size={24} className="text-[#1E3A5F]" />
          Chiến dịch mời người dân tự khai
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Gửi link tự khai cá nhân hóa qua SMS đến từng hộ + thông báo phát động qua nhóm Zalo Cộng đồng KP25
        </p>
      </div>

      {/* Banner số người chờ duyệt */}
      {thongKe.yeuCauChoDuyet > 0 && (
        <Link
          href="/dashboard/dan-cu/duyet-cap-nhat"
          className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl hover:bg-amber-100 transition-colors"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
            <Inbox size={18} className="text-amber-600" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-amber-800 text-sm">
              Có {thongKe.yeuCauChoDuyet} yêu cầu tự khai đang chờ duyệt
            </p>
            <p className="text-xs text-amber-600">Người dân đã phản hồi — nhấn để xem và xác nhận</p>
          </div>
          <span className="text-amber-600 text-sm font-semibold shrink-0">Duyệt ngay →</span>
        </Link>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6">
        <ChienDichClient thongKe={thongKe} />
      </div>
    </div>
  )
}
