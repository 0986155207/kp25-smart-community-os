import type { Metadata } from 'next'
import Link from 'next/link'
import { AlertCircle, Plus, Clock, CheckCircle, Loader2, Sparkles, Camera } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatRelativeTime, truncate, mapPhanAnh } from '@/lib/utils'
import type { PhanAnh } from '@kp25/types'
import { TrangThaiPhanAnh } from '@kp25/types'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Phản ánh hiện trường',
  description: 'Gửi và theo dõi phản ánh hiện trường Khu phố 25',
}

export const revalidate = 30

const TRANG_THAI_CONFIG: Record<
  string,
  { label: string; icon: typeof Clock; color: string; badge: string }
> = {
  MOI: { label: 'Mới', icon: Clock, color: 'text-amber-600', badge: 'badge-yellow' },
  DANG_XU_LY: {
    label: 'Đang xử lý',
    icon: Loader2,
    color: 'text-blue-600',
    badge: 'badge-blue',
  },
  DA_XU_LY: {
    label: 'Đã xử lý',
    icon: CheckCircle,
    color: 'text-emerald-600',
    badge: 'badge-green',
  },
  DONG: { label: 'Đã đóng', icon: CheckCircle, color: 'text-slate-500', badge: 'badge-gray' },
}

const LOAI_LABEL: Record<string, string> = {
  AN_NINH: 'An ninh',
  MOI_TRUONG: 'Môi trường',
  HA_TANG: 'Hạ tầng',
  AN_SINH: 'An sinh',
  GIAO_THONG: 'Giao thông',
  KHAC: 'Khác',
}

type PhanAnhWithAI = PhanAnh & { aiDaPhanTich?: boolean; aiTomTat?: string | null }

async function getPhanAnh(): Promise<PhanAnhWithAI[]> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('phan_anh')
      .select('*, ai_da_phan_tich, ai_tom_tat')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(30)
    return (data ?? []).map(row => ({
      ...mapPhanAnh(row),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      aiDaPhanTich: (row as any).ai_da_phan_tich as boolean | null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      aiTomTat: (row as any).ai_tom_tat as string | null,
    })) as PhanAnhWithAI[]
  } catch {
    return []
  }
}

export default async function PhanAnhPage() {
  const items = await getPhanAnh()

  const stats = {
    moi:       items.filter(i => i.trangThai === TrangThaiPhanAnh.MOI).length,
    dangXuLy:  items.filter(i => i.trangThai === TrangThaiPhanAnh.DANG_XU_LY).length,
    daXuLy:    items.filter(i => i.trangThai === TrangThaiPhanAnh.DA_XU_LY).length,
    daAI:      items.filter(i => i.aiDaPhanTich).length,
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-md">
            <Camera size={22} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900">Phản ánh hiện trường</h1>
              <span className="inline-flex items-center gap-1 text-xs font-bold bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">
                <Sparkles size={10} />AI Smart
              </span>
            </div>
            <p className="text-slate-500 text-sm">Khu phố 25 · Phường Long Trường</p>
          </div>
        </div>
        <Link href="/phan-anh/tao" className="btn-primary">
          <Plus size={16} />
          Gửi phản ánh
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="card text-center py-3">
          <div className="text-xl font-bold text-amber-600">{stats.moi}</div>
          <div className="text-xs text-slate-500 mt-0.5">Mới</div>
        </div>
        <div className="card text-center py-3">
          <div className="text-xl font-bold text-blue-600">{stats.dangXuLy}</div>
          <div className="text-xs text-slate-500 mt-0.5">Đang xử lý</div>
        </div>
        <div className="card text-center py-3">
          <div className="text-xl font-bold text-emerald-600">{stats.daXuLy}</div>
          <div className="text-xs text-slate-500 mt-0.5">Đã xử lý</div>
        </div>
        <div className="card text-center py-3 bg-violet-50 border-violet-100">
          <div className="text-xl font-bold text-violet-600">{stats.daAI}</div>
          <div className="text-xs text-violet-400 mt-0.5 flex items-center justify-center gap-1">
            <Sparkles size={9} />AI phân tích
          </div>
        </div>
      </div>

      {/* Danh sách */}
      {items.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <AlertCircle size={56} className="mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium">Chưa có phản ánh nào</p>
          <p className="text-sm mt-1 mb-4">Hãy là người đầu tiên gửi phản ánh</p>
          <Link href="/phan-anh/tao" className="btn-primary inline-flex">
            <Plus size={16} />
            Gửi phản ánh ngay
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const cfg = TRANG_THAI_CONFIG[item.trangThai] ?? TRANG_THAI_CONFIG.MOI
            return (
              <Link
                key={item.id}
                href={`/phan-anh/${item.id}`}
                className="card-hover flex items-start gap-4"
              >
                {/* Ảnh thumbnail */}
                <div className="relative shrink-0">
                  {item.anhUrls && item.anhUrls.length > 0 ? (
                    <img
                      src={item.anhUrls[0]}
                      alt={item.tieuDe}
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-orange-50 flex items-center justify-center">
                      <AlertCircle size={26} className="text-orange-400" />
                    </div>
                  )}
                  {/* AI badge on thumbnail */}
                  {item.aiDaPhanTich && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-violet-600 flex items-center justify-center border-2 border-white">
                      <Sparkles size={9} className="text-white" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    <span className={cn('badge', cfg?.badge ?? 'badge-gray')}>{cfg?.label ?? item.trangThai}</span>
                    <span className="badge badge-gray">{LOAI_LABEL[item.loai] ?? item.loai}</span>
                    {item.aiDaPhanTich && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded-md">
                        <Sparkles size={8} />AI
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-slate-900 truncate">{item.tieuDe}</h3>
                  {/* Ưu tiên hiển thị tóm tắt AI nếu có */}
                  <p className="text-slate-500 text-sm mt-0.5 line-clamp-1">
                    {item.aiTomTat ?? truncate(item.moTa, 90)}
                  </p>
                  <div className="text-xs text-slate-400 mt-1.5 flex items-center gap-3 flex-wrap">
                    {item.diaChiPhanAnh && (
                      <span className="flex items-center gap-1">
                        📍 {truncate(item.diaChiPhanAnh, 40)}
                      </span>
                    )}
                    <span>🕐 {formatRelativeTime(item.createdAt)}</span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
