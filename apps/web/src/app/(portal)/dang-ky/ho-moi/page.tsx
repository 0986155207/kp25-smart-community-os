import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, HomeIcon, Info } from 'lucide-react'
import HoMoiForm from './HoMoiForm'

export const metadata: Metadata = {
  title: 'Đăng ký hộ dân mới — KP25',
  description: 'Đăng ký hộ dân mới chuyển đến Khu phố 25, Phường Long Trường, TP.HCM',
}

export default function DangKyHoMoiPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <Link href="/dang-ky" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors">
        <ArrowLeft size={15} /> Dịch vụ đăng ký
      </Link>

      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 rounded-2xl bg-[#1E3A5F]/10 flex items-center justify-center mx-auto">
          <HomeIcon size={28} className="text-[#1E3A5F]" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Đăng ký hộ dân mới</h1>
        <p className="text-slate-500 text-sm leading-relaxed">
          Dành cho hộ mới chuyển đến Khu phố 25 chưa có hồ sơ trên hệ thống.<br />
          Khai báo thông tin → cán bộ xác minh → tạo hồ sơ chính thức.
        </p>
      </div>

      {/* Hướng dẫn */}
      <div className="flex items-start gap-2 p-3.5 bg-blue-50 border border-blue-100 rounded-xl">
        <Info size={15} className="text-blue-500 shrink-0 mt-0.5" />
        <div className="text-xs text-blue-700 leading-relaxed">
          <p className="font-semibold mb-1">Lưu ý khi khai báo:</p>
          <ul className="space-y-0.5 list-disc list-inside">
            <li>Khai đầy đủ <strong>tất cả thành viên</strong> trong hộ</li>
            <li>Thông tin được cán bộ <strong>xác minh trước</strong> khi lưu chính thức</li>
            <li>Người khai cần cung cấp số điện thoại để cán bộ liên hệ</li>
          </ul>
        </div>
      </div>

      <HoMoiForm />
    </div>
  )
}
