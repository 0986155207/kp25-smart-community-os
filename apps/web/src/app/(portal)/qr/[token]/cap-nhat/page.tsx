import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, UserCog } from 'lucide-react'
import { createServiceClient } from '@/lib/supabase/server'
import TuKhaiForm from './TuKhaiForm'

export const dynamic = 'force-dynamic'

interface Props { params: Promise<{ token: string }> }

export default async function CapNhatTuKhaiPage({ params }: Props) {
  const { token } = await params
  const supabase = createServiceClient()

  const { data: ho } = await supabase
    .from('ho_dan')
    .select('id, ma_ho, chu_ho, dia_chi_day')
    .eq('qr_token', token)
    .is('deleted_at', null)
    .single()

  if (!ho) notFound()

  const { data: nhanKhau } = await supabase
    .from('nhan_khau')
    .select('id, ho_ten, quan_he, gioi_tinh')
    .eq('ho_id', ho.id)
    .is('deleted_at', null)
    .or('da_mat.is.null,da_mat.eq.false')
    .order('created_at', { ascending: true })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-md mx-auto px-4 py-8 space-y-5">
        <Link href={`/qr/${token}`} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft size={15} /> Phiếu hộ dân
        </Link>

        <div className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden">
          <div className="bg-gradient-to-r from-[#1E3A5F] to-indigo-700 px-6 py-5 text-white">
            <div className="flex items-center gap-2 mb-1">
              <UserCog size={15} className="opacity-80" />
              <span className="text-xs text-blue-200 font-medium uppercase tracking-wide">Cập nhật thông tin</span>
            </div>
            <h1 className="text-lg font-bold">{ho.chu_ho}</h1>
            <p className="text-blue-200 text-xs mt-0.5">{ho.dia_chi_day}</p>
          </div>

          <div className="p-5">
            <TuKhaiForm
              token={token}
              nhanKhau={(nhanKhau ?? []).map(nk => ({
                id: nk.id as string,
                ho_ten: nk.ho_ten as string,
                quan_he: nk.quan_he as string,
              }))}
            />
          </div>
        </div>

        <p className="text-center text-[11px] text-slate-400 leading-relaxed px-4">
          Thông tin bạn khai sẽ được cán bộ khu phố xác minh trước khi cập nhật chính thức.
          Dữ liệu được bảo mật theo Nghị định 13/2023/NĐ-CP.
        </p>
      </div>
    </div>
  )
}
