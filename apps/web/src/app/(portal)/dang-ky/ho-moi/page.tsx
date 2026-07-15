import { KHU_PHO } from '@/lib/khu-pho'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, HomeIcon, Info } from 'lucide-react'
import HoMoiForm from './HoMoiForm'

export const metadata: Metadata = {
  title: `Kê khai thông tin hộ dân — ${KHU_PHO.ma}`,
  description: `Kê khai, cập nhật thông tin hộ dân ${KHU_PHO.ten}, Phường Long Trường, TP.HCM — dành cho cả hộ đã có và hộ mới`,
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
        <h1 className="text-2xl font-bold text-slate-900">Kê khai thông tin hộ dân</h1>
        <p className="text-slate-500 text-sm leading-relaxed">
          Dành cho <strong>cả hộ đã có</strong> (bổ sung thông tin còn thiếu) <strong>và hộ mới</strong> chuyển đến.<br />
          Kê khai thông tin → cán bộ xác minh → cập nhật vào hệ thống.
        </p>
      </div>

      {/* Hướng dẫn */}
      <div className="flex items-start gap-2 p-3.5 bg-blue-50 border border-blue-100 rounded-xl">
        <Info size={15} className="text-blue-500 shrink-0 mt-0.5" />
        <div className="text-xs text-blue-700 leading-relaxed">
          <p className="font-semibold mb-1">Lưu ý khi kê khai:</p>
          <ul className="space-y-0.5 list-disc list-inside">
            <li><strong>Hộ đã có thông tin</strong> trong hệ thống: kê khai để bổ sung/cập nhật — cán bộ sẽ gộp vào hồ sơ sẵn có, không tạo trùng</li>
            <li><strong>Hộ mới</strong>: kê khai để tạo hồ sơ và được cấp mã QR riêng</li>
            <li>Khai đầy đủ <strong>tất cả thành viên</strong> trong hộ</li>
            <li>Người khai cung cấp số điện thoại để cán bộ liên hệ xác minh</li>
          </ul>
        </div>
      </div>

      <HoMoiForm />
    </div>
  )
}
