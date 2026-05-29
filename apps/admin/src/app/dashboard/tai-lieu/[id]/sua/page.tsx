import { notFound } from 'next/navigation'
import { layTaiLieuChiTiet } from '../../actions'
import SuaClient from './SuaClient'

type Props = { params: Promise<{ id: string }> }

export default async function SuaTaiLieuPage({ params }: Props) {
  const { id } = await params
  const doc = await layTaiLieuChiTiet(id)
  if (!doc) notFound()
  return <SuaClient doc={doc} />
}
