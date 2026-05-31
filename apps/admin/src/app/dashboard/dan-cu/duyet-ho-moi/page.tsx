import Link from 'next/link'
import { ArrowLeft, HomeIcon, Inbox } from 'lucide-react'
import { layDanhSachHoMoi } from './actions'
import DuyetHoMoiClient from './DuyetHoMoiClient'

export const dynamic = 'force-dynamic'

export default async function DuyetHoMoiPage() {
  const danhSach = await layDanhSachHoMoi('CHO_DUYET')

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/dan-cu" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-2 transition-colors">
          <ArrowLeft size={14} /> Quản lý dân cư
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <HomeIcon size={24} className="text-[#1E3A5F]" />
          Duyệt đăng ký hộ dân mới
          {danhSach.length > 0 && (
            <span className="text-sm bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full font-bold">{danhSach.length}</span>
          )}
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Hộ mới chuyển đến tự khai báo — xác minh thông tin và tạo hồ sơ chính thức (hộ dân + nhân khẩu)
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4 text-slate-500">
          <Inbox size={16} />
          <span className="text-sm font-semibold">Đăng ký chờ duyệt</span>
        </div>
        <DuyetHoMoiClient initial={danhSach} />
      </div>
    </div>
  )
}
