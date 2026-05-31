import Link from 'next/link'
import { ArrowLeft, ScanLine, Sparkles } from 'lucide-react'
import QuetCCCDClient from './QuetCCCDClient'

export const dynamic = 'force-dynamic'

export default function QuetCCCDPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link href="/dashboard/dan-cu" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-2 transition-colors">
          <ArrowLeft size={14} /> Quản lý dân cư
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <ScanLine size={24} className="text-[#1E3A5F]" />
          Quét CCCD bằng AI
        </h1>
        <p className="text-slate-500 text-sm mt-0.5 flex items-center gap-1.5">
          <Sparkles size={13} className="text-violet-500" />
          Chụp ảnh CCCD → AI tự động trích xuất thông tin → Xác nhận & lưu vào hộ dân
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6">
        <QuetCCCDClient />
      </div>
    </div>
  )
}
