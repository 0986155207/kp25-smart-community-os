import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft, Pencil } from 'lucide-react'
import { laySuKienById, capNhatSuKien } from '../../actions'
import SuKienForm from '../../SuKienForm'

export const metadata: Metadata = { title: 'Chỉnh sửa sự kiện — KP25' }

interface Props { params: Promise<{ id: string }> }

export default async function SuaSuKienPage({ params }: Props) {
  const { id } = await params
  const sk = await laySuKienById(id)
  if (!sk) notFound()

  async function handleSubmit(formData: FormData) {
    'use server'
    const result = await capNhatSuKien(id, formData)
    if (result.success) redirect(`/dashboard/su-kien/${id}`)
    redirect(`/dashboard/su-kien/${id}/sua?error=${encodeURIComponent(result.error ?? 'Lỗi')}`)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link href={`/dashboard/su-kien/${id}`} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
            <Pencil size={16} className="text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Chỉnh sửa sự kiện</h1>
            <p className="text-xs text-slate-500 line-clamp-1">{sk.tieu_de}</p>
          </div>
        </div>
      </div>

      <SuKienForm defaultValues={sk} submitLabel="Lưu thay đổi" onSubmit={handleSubmit} />
    </div>
  )
}
