import { KHU_PHO } from '@/lib/khu-pho'
import type { Metadata } from 'next'
import { layLichSuPush, layThongKePush } from './actions'
import PushClient from './PushClient'

export const metadata: Metadata = { title: `Gửi thông báo đẩy — ${KHU_PHO.ma}` }
export const dynamic = 'force-dynamic'

export default async function PushPage() {
  const [thongKe, lichSu] = await Promise.all([
    layThongKePush(),
    layLichSuPush(30),
  ])

  return <PushClient thongKe={thongKe} lichSu={lichSu} />
}
