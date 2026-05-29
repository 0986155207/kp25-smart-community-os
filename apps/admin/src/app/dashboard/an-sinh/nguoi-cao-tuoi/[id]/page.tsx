import { notFound } from 'next/navigation'
import { layChiTietNCT } from '../actions'
import NguoiCaoTuoiEditForm from './NguoiCaoTuoiEditForm'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  const nct = await layChiTietNCT(id)
  return { title: nct ? `${nct.ho_ten} — Cập nhật NCT` : 'Không tìm thấy' }
}

export default async function NCTEditPage({ params }: Props) {
  const { id } = await params
  const nct = await layChiTietNCT(id)
  if (!nct) notFound()
  return <NguoiCaoTuoiEditForm nct={nct} />
}
