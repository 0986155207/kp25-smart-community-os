import { cn } from '@/lib/utils'
import { KHU_PHO } from '@/lib/khu-pho'

interface Props {
  /** Class cho khung logo: kích thước, bo góc, shadow… (KHÔNG chứa class nền) */
  boxClass: string
  /** Class nền khi dùng logo chữ */
  bgClass?: string
  /** Class cỡ chữ khi dùng logo chữ */
  textClass?: string
  /** Độ đậm chữ */
  weightClass?: string
}

/**
 * Logo khu phố — dùng chung cho Sidebar / trang Đăng nhập.
 *  • Có NEXT_PUBLIC_KP_LOGO_URL  → hiển thị ảnh logo riêng của khu phố.
 *  • Không có                    → hiển thị badge chữ (vd "KP" + "25").
 */
export default function LogoKhuPho({
  boxClass,
  bgClass = 'bg-[#8B1A1A]',
  textClass = 'text-xs',
  weightClass = 'font-bold',
}: Props) {
  if (KHU_PHO.logoUrl) {
    return (
      <div className={cn(boxClass, 'bg-white overflow-hidden')}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={KHU_PHO.logoUrl}
          alt={`Logo ${KHU_PHO.ten}`}
          className="w-full h-full object-contain"
        />
      </div>
    )
  }

  return (
    <div className={cn(boxClass, bgClass)}>
      <span className={cn('text-white', weightClass, textClass)}>{KHU_PHO.logoChu}</span>
      <span className={cn('text-[#FCD34D]', weightClass, textClass)}>{KHU_PHO.logoSo}</span>
    </div>
  )
}
