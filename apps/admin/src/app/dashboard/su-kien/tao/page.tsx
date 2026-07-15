import { KHU_PHO } from '@/lib/khu-pho'
import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft, CalendarDays } from 'lucide-react'
import { taoMoiSuKien } from '../actions'
import SuKienForm from '../SuKienForm'

export const metadata: Metadata = { title: `Tạo sự kiện — ${KHU_PHO.ma}` }

export default function TaoSuKienPage() {
  async function handleSubmit(formData: FormData) {
    'use server'
    const result = await taoMoiSuKien(formData)
    if (result.success && result.id) {
      redirect(`/dashboard/su-kien/${result.id}`)
    }
    redirect(`/dashboard/su-kien/tao?error=${encodeURIComponent(result.error ?? 'Lỗi không xác định')}`)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/su-kien" className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center">
            <CalendarDays size={18} className="text-[#8B1A1A]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Tạo sự kiện mới</h1>
            <p className="text-xs text-slate-500">Sự kiện sẽ hiển thị trên portal dân cư sau khi xuất bản</p>
          </div>
        </div>
      </div>

      <SuKienForm submitLabel="Tạo sự kiện" onSubmit={handleSubmit} />
    </div>
  )
}
