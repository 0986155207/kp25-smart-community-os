import type { Metadata } from 'next'
import PhanTichClient from './PhanTichClient'

export const metadata: Metadata = { title: 'AI Phân tích cộng đồng — KP25' }

export default function PhanTichPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">AI Phân tích cộng đồng</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Phân tích tự động toàn bộ dữ liệu dân cư và phản ánh · Khu phố 25
        </p>
      </div>
      <PhanTichClient />
    </div>
  )
}
