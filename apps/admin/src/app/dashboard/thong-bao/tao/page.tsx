import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Bell } from 'lucide-react'
import ThongBaoForm from '../ThongBaoForm'

export const metadata: Metadata = { title: 'Tạo thông báo mới' }

export default function TaoThongBaoPage() {
  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/thong-bao"
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors shrink-0"
        >
          <ArrowLeft size={16} />
          Quay lại
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <Bell size={20} className="text-[#1E3A5F]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Tạo thông báo mới</h1>
            <p className="text-slate-500 text-sm">Thông báo sẽ hiển thị trên portal dân cư ngay sau khi đăng</p>
          </div>
        </div>
      </div>

      <ThongBaoForm mode="create" />
    </div>
  )
}
