'use client'

import dynamic from 'next/dynamic'
import type { PhanAnhMap } from './actions'

// dynamic + ssr:false chỉ được phép trong Client Component
const BanDoMap = dynamic(() => import('./BanDoMap'), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3 text-slate-400">
        <div className="w-8 h-8 border-2 border-slate-300 border-t-[#8B1A1A] rounded-full animate-spin" />
        <span className="text-sm">Đang tải bản đồ...</span>
      </div>
    </div>
  ),
})

interface Props {
  phanAnh:  PhanAnhMap[]
  ranhGioi: [number, number][]
  tam:      [number, number] | null
  zoom:     number
}

export default function BanDoMapClient({ phanAnh, ranhGioi, tam, zoom }: Props) {
  return <BanDoMap phanAnh={phanAnh} ranhGioi={ranhGioi} tam={tam} zoom={zoom} />
}
