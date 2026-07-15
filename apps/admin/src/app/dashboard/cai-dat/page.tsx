import { KHU_PHO } from '@/lib/khu-pho'
import { notFound } from 'next/navigation'
import { layCanBoHienTai } from '@/lib/auth'
import { coQuyen } from '@/lib/auth-config'
import CaiDatClient from './CaiDatClient'

export const metadata = { title: `Cài đặt — ${KHU_PHO.ma} Admin` }

export default async function CaiDatPage() {
  const canBo = await layCanBoHienTai()

  if (!canBo || !coQuyen(canBo.vai_tro, '/dashboard/cai-dat')) {
    notFound()
  }

  return <CaiDatClient canBo={canBo} />
}
