import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import ImportClient from './ImportClient'

export const metadata: Metadata = { title: 'Nhập dữ liệu từ Excel' }

export default function NhapExcelPage() {
  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link
          href="/dashboard/dan-cu"
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors mt-1 shrink-0"
        >
          <ArrowLeft size={16} />
          Quay lại
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Nhập dữ liệu từ Excel</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Nhập nhanh hàng loạt hộ dân và nhân khẩu từ file Excel hoặc CSV
          </p>
        </div>
      </div>

      <ImportClient />
    </div>
  )
}
