import Link from 'next/link'
import { ArrowLeft, ClipboardCheck, Inbox } from 'lucide-react'
import { layDanhSachYeuCau } from './actions'
import DuyetClient from './DuyetClient'

export const dynamic = 'force-dynamic'

export default async function DuyetCapNhatPage() {
  const yeuCau = await layDanhSachYeuCau('CHO_DUYET')

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/dan-cu" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-2 transition-colors">
          <ArrowLeft size={14} /> Quản lý dân cư
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <ClipboardCheck size={24} className="text-[#1E3A5F]" />
          Duyệt thông tin tự khai
          {yeuCau.length > 0 && (
            <span className="text-sm bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full font-bold">{yeuCau.length}</span>
          )}
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Xem xét và xác nhận thông tin do người dân tự khai qua QR trước khi cập nhật chính thức
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4 text-slate-500">
          <Inbox size={16} />
          <span className="text-sm font-semibold">Yêu cầu chờ duyệt</span>
        </div>
        <DuyetClient initial={yeuCau} />
      </div>
    </div>
  )
}
