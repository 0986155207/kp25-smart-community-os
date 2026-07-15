import { KHU_PHO } from '@/lib/khu-pho'
import type { Metadata } from 'next'
import { layDanhSachCanBo } from './actions'
import { layCanBoHienTai } from '@/lib/auth'
import PhanQuyenClient from './PhanQuyenClient'
import { notFound } from 'next/navigation'

export const metadata: Metadata = { title: `Phân quyền — ${KHU_PHO.ma}` }
export const revalidate = 0

export default async function PhanQuyenPage() {
  // Chỉ Bí thư mới được vào trang này
  const canBo = await layCanBoHienTai()
  if (canBo?.vai_tro !== 'BI_THU') notFound()

  const canBoList = await layDanhSachCanBo()

  return (
    <PhanQuyenClient
      canBoList={canBoList}
      currentEmail={canBo.email}
    />
  )
}
