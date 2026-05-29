import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { mapHoDan } from '@/lib/utils'
import HoDanForm from '../../HoDanForm'

export const metadata: Metadata = { title: 'Chỉnh sửa hộ dân' }

export default async function SuaHoDanPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data } = await supabase
    .from('ho_dan')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (!data) notFound()

  const item = mapHoDan(data)

  return (
    <HoDanForm
      mode="edit"
      id={id}
      defaultValues={{
        maHo: item.maHo,
        chuHo: item.chuHo,
        diaChiDay: item.diaChiDay,
        soNha: item.soNha,
        duong: item.duong,
        toTruong: item.toTruong,
        soDienThoai: item.soDienThoai,
        soNhanKhau: item.soNhanKhau,
        trangThai: item.trangThai,
        ghiChu: item.ghiChu,
      }}
    />
  )
}
