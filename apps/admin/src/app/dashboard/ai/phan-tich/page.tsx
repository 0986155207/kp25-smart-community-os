import { KHU_PHO } from '@/lib/khu-pho'
import type { Metadata } from 'next'
import PhanTichClient from './PhanTichClient'

export const metadata: Metadata = { title: `AI Phân tích cộng đồng — ${KHU_PHO.ma}` }

export default function PhanTichPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">AI Phân tích cộng đồng</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Phân tích tự động toàn bộ dữ liệu dân cư và phản ánh · {KHU_PHO.ten}
        </p>
      </div>
      <PhanTichClient />
    </div>
  )
}
