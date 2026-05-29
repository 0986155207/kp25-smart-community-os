import Link from 'next/link'
import { Heart, Users, ShieldCheck, HandHeart } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ThongKeAnSinh } from '../actions'

interface CardProps {
  label:  string
  value:  number
  unit?:  string
  icon:   React.ElementType
  color:  string
  bg:     string
  border: string
  href:   string
  hint?:  string
}

function AnSinhCard({ label, value, unit, icon: Icon, color, bg, border, href, hint }: CardProps) {
  return (
    <Link
      href={href}
      className={cn(
        'bg-white rounded-2xl border shadow-sm p-4 hover:shadow-md transition-all group',
        border
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', bg)}>
          <Icon size={18} className={color} />
        </div>
        <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full', bg, color)}>
          An sinh
        </span>
      </div>
      <div className="flex items-end gap-1">
        <span className={cn('text-2xl font-bold tabular-nums', color)}>
          {value.toLocaleString('vi-VN')}
        </span>
        {unit && <span className="text-xs text-slate-400 mb-0.5">{unit}</span>}
      </div>
      <p className="text-sm font-medium text-slate-700 mt-0.5">{label}</p>
      {hint && <p className="text-[10px] text-slate-400 mt-0.5">{hint}</p>}
    </Link>
  )
}

export default function ThongKeAnSinh({ data }: { data: ThongKeAnSinh }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Heart size={14} className="text-pink-500" />
        <h2 className="text-sm font-bold text-slate-700">An sinh xã hội</h2>
        <span className="text-xs text-slate-400">— đang theo dõi</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <AnSinhCard
          label="Hộ nghèo"
          value={data.hoNgheo}
          unit="hộ"
          icon={HandHeart}
          color="text-red-600"
          bg="bg-red-50"
          border="border-red-100"
          href="/dashboard/an-sinh/ho-ngheo?loai=NGHEO"
          hint="Đang hưởng trợ cấp"
        />
        <AnSinhCard
          label="Hộ cận nghèo"
          value={data.hoCanNgheo}
          unit="hộ"
          icon={HandHeart}
          color="text-orange-600"
          bg="bg-orange-50"
          border="border-orange-100"
          href="/dashboard/an-sinh/ho-ngheo?loai=CAN_NGHEO"
          hint="Đang hưởng trợ cấp"
        />
        <AnSinhCard
          label="Người cao tuổi"
          value={data.nguoiCaoTuoi}
          unit="người"
          icon={Users}
          color="text-violet-600"
          bg="bg-violet-50"
          border="border-violet-100"
          href="/dashboard/an-sinh/nguoi-cao-tuoi"
          hint="Đang quản lý"
        />
        <AnSinhCard
          label="BHYT còn hiệu lực"
          value={data.bhytConHan}
          unit="thẻ"
          icon={ShieldCheck}
          color="text-teal-600"
          bg="bg-teal-50"
          border="border-teal-100"
          href="/dashboard/an-sinh/bhyt?trang_thai=CON_HAN"
          hint="Thẻ đang hoạt động"
        />
      </div>
    </div>
  )
}
