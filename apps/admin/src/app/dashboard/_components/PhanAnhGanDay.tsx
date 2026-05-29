import Link from 'next/link'
import { AlertCircle, ArrowRight, Flame, Clock, CheckCircle2, XCircle, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatRelativeTime } from '@/lib/utils'
import type { PhanAnhGanDay as PhanAnhType } from '../actions'

const TRANG_THAI_CFG: Record<string, { label: string; Icon: React.ElementType; cls: string }> = {
  MOI:          { label: 'Mới',         Icon: AlertCircle,   cls: 'text-amber-500 bg-amber-50'   },
  DANG_XU_LY:   { label: 'Xử lý',      Icon: Clock,         cls: 'text-blue-500 bg-blue-50'     },
  CHO_PHAN_HOI: { label: 'Chờ PH',     Icon: MessageSquare, cls: 'text-violet-500 bg-violet-50' },
  DA_XU_LY:     { label: 'Hoàn thành', Icon: CheckCircle2,  cls: 'text-emerald-500 bg-emerald-50'},
  DONG:         { label: 'Đóng',       Icon: XCircle,       cls: 'text-slate-400 bg-slate-50'   },
}

const MUC_DO_CFG: Record<string, string> = {
  KHAN_CAP:   'text-red-600 font-bold',
  CAO:        'text-orange-600',
  TRUNG_BINH: 'text-slate-500',
  THAP:       'text-slate-400',
}

const LOAI_LABEL: Record<string, string> = {
  AN_NINH:    'An ninh',
  MOI_TRUONG: 'Môi trường',
  HA_TANG:    'Hạ tầng',
  AN_SINH:    'An sinh',
  GIAO_THONG: 'Giao thông',
  KHAC:       'Khác',
}

export default function PhanAnhGanDay({ items }: { items: PhanAnhType[] }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Flame size={16} className="text-amber-500" />
          <h3 className="font-bold text-slate-900 text-sm">Phản ánh gần đây</h3>
        </div>
        <Link
          href="/dashboard/phan-anh"
          className="text-xs text-[#8B1A1A] font-medium flex items-center gap-1 hover:underline"
        >
          Tất cả <ArrowRight size={12} />
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-slate-300 text-sm py-8">
          Chưa có phản ánh nào
        </div>
      ) : (
        <div className="space-y-1.5">
          {items.map(pa => {
            const cfg = TRANG_THAI_CFG[pa.trang_thai] ?? TRANG_THAI_CFG.MOI!
            const { Icon } = cfg
            return (
              <Link
                key={pa.id}
                href={`/dashboard/phan-anh/${pa.id}`}
                className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors group"
              >
                <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5', cfg.cls)}>
                  <Icon size={13} />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{pa.tieu_de}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-slate-400">{LOAI_LABEL[pa.loai] ?? pa.loai}</span>
                    <span className="text-slate-300">·</span>
                    <span className={cn('text-[10px]', MUC_DO_CFG[pa.muc_do] ?? 'text-slate-400')}>
                      {pa.muc_do === 'KHAN_CAP' ? '⚠ Khẩn cấp' : pa.muc_do}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="text-[10px] text-slate-400">{formatRelativeTime(pa.created_at)}</span>
                  </div>
                </div>

                <span className={cn(
                  'text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 mt-1',
                  cfg.cls
                )}>
                  {cfg.label}
                </span>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
