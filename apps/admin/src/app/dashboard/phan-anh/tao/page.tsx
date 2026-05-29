import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import TaoPhanAnhForm from './TaoPhanAnhForm'

export const metadata: Metadata = { title: 'Tạo phản ánh mới' }

export default function TaoPhanAnhPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link
          href="/dashboard/phan-anh"
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors mt-1 shrink-0"
        >
          <ArrowLeft size={16} />
          Quay lại
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tạo phản ánh mới</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Ghi nhận và phân loại phản ánh từ người dân
          </p>
        </div>
      </div>

      <TaoPhanAnhForm />
    </div>
  )
}
