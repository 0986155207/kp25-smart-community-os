'use client'

import { KHU_PHO } from '@/lib/khu-pho'
import { useState, useTransition, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  Search, UserCheck, UserMinus, ChevronRight,
  Loader2, AlertCircle, CheckCircle2, Clock, ArrowRight,
  MapPin, Calendar, FileText, Wifi,
} from 'lucide-react'
import { traCuuTheoCCCD } from '../actions'
import { createClient } from '@/lib/supabase/client'

// ─── Types ───────────────────────────────────────────────────────
type TamTruItem = {
  id: string; trang_thai: string; dia_chi_tam_tru: string
  ngay_bat_dau: string; ngay_ket_thuc: string | null
  ly_do_tam_tru: string; created_at: string
}
type TamVangItem = {
  id: string; trang_thai: string; dia_chi_tam_vang: string
  ngay_di: string; ngay_du_kien_ve: string | null
  ly_do_tam_vang: string; created_at: string
}

// ─── Config ──────────────────────────────────────────────────────
const TRANG_THAI_TRU: Record<string, { label: string; cls: string; icon: React.ElementType }> = {
  DANG_TAM_TRU: { label: 'Đang tạm trú',  cls: 'bg-blue-100 text-blue-700',    icon: CheckCircle2 },
  HET_HAN:      { label: 'Hết hạn',       cls: 'bg-amber-100 text-amber-700',   icon: Clock       },
  DA_ROI_DI:    { label: 'Đã rời đi',     cls: 'bg-slate-100 text-slate-500',   icon: ArrowRight  },
}
const TRANG_THAI_VANG: Record<string, { label: string; cls: string; icon: React.ElementType }> = {
  DANG_VANG: { label: 'Đang vắng',   cls: 'bg-orange-100 text-orange-700',  icon: UserMinus   },
  DA_VE:     { label: 'Đã về',       cls: 'bg-emerald-100 text-emerald-700',icon: CheckCircle2 },
  QUA_HAN:   { label: 'Quá hạn',     cls: 'bg-red-100 text-red-700',        icon: AlertCircle },
}
const LY_DO_TRU: Record<string, string> = {
  LAM_VIEC: 'Làm việc', HOC_TAP: 'Học tập', NHAN_VIEC: 'Nhận việc làm',
  CHUA_BENH: 'Chữa bệnh', KINH_DOANH: 'Kinh doanh', KHAC: 'Khác',
}
const LY_DO_VANG: Record<string, string> = {
  LAM_VIEC: 'Làm việc', HOC_TAP: 'Học tập', CHUA_BENH: 'Chữa bệnh',
  DU_LICH: 'Du lịch', THAM_THAN: 'Thăm thân nhân', KHAC: 'Khác',
}

function fmt(d: string) {
  const [y, m, day] = d.split('-')
  return `${day}/${m}/${y}`
}

// ─── Component ───────────────────────────────────────────────────
export default function TraCuuPage() {
  const [cccd, setCccd] = useState('')
  const [isPending, startTransition] = useTransition()
  const [searched, setSearched] = useState(false)
  const [result, setResult] = useState<{ tamTru: TamTruItem[]; tamVang: TamVangItem[] } | null>(null)
  const [isRealtime, setIsRealtime] = useState(false)
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>['channel']> | null>(null)

  // ─ Realtime: theo dõi trạng thái các hồ sơ đã tìm thấy
  useEffect(() => {
    if (!result) return

    const supabase = createClient()

    // Huỷ channel cũ nếu có
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
      channelRef.current = null
    }

    const tamTruIds  = result.tamTru.map(r => r.id)
    const tamVangIds = result.tamVang.map(r => r.id)

    if (tamTruIds.length === 0 && tamVangIds.length === 0) return

    const channel = supabase
      .channel(`tra-cuu-${cccd}`)

    // Lắng nghe UPDATE trên từng hồ sơ tạm trú
    tamTruIds.forEach(id => {
      channel.on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'dang_ky_tam_tru', filter: `id=eq.${id}` },
        (payload) => {
          const updated = payload.new as Partial<TamTruItem>
          setResult(prev => {
            if (!prev) return prev
            return {
              ...prev,
              tamTru: prev.tamTru.map(r =>
                r.id === id ? { ...r, ...updated } : r
              ),
            }
          })
        }
      )
    })

    // Lắng nghe UPDATE trên từng hồ sơ tạm vắng
    tamVangIds.forEach(id => {
      channel.on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'dang_ky_tam_vang', filter: `id=eq.${id}` },
        (payload) => {
          const updated = payload.new as Partial<TamVangItem>
          setResult(prev => {
            if (!prev) return prev
            return {
              ...prev,
              tamVang: prev.tamVang.map(r =>
                r.id === id ? { ...r, ...updated } : r
              ),
            }
          })
        }
      )
    })

    channel.subscribe((status) => {
      setIsRealtime(status === 'SUBSCRIBED')
    })

    channelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
      setIsRealtime(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result?.tamTru.length, result?.tamVang.length])

  function handleSearch() {
    const clean = cccd.trim()
    if (!clean) return
    if (clean.length < 9) { return }

    startTransition(async () => {
      const data = await traCuuTheoCCCD(clean)
      setResult(data)
      setSearched(true)
    })
  }

  const total = (result?.tamTru.length ?? 0) + (result?.tamVang.length ?? 0)

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-slate-400 mb-6">
        <Link href="/dang-ky" className="hover:text-slate-600 transition-colors">Đăng ký</Link>
        <ChevronRight size={14} />
        <span className="text-slate-700 font-medium">Tra cứu hồ sơ</span>
      </nav>

      {/* Header */}
      <div className="flex items-center gap-3 mb-7">
        <div className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center shrink-0">
          <Search size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Tra cứu hồ sơ</h1>
          <p className="text-sm text-slate-500">Tạm trú · Tạm vắng — {KHU_PHO.ten}</p>
        </div>
      </div>

      {/* Search box */}
      <div className="card space-y-3">
        <label className="block text-sm font-semibold text-slate-700">
          Nhập số CCCD / CMND để tra cứu
        </label>
        <div className="flex gap-2">
          <input
            className="input font-mono flex-1"
            placeholder="Số CCCD hoặc CMND (9–12 ký tự)"
            value={cccd}
            onChange={e => { setCccd(e.target.value); setSearched(false) }}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            maxLength={12}
          />
          <button
            type="button"
            onClick={handleSearch}
            disabled={isPending || cccd.trim().length < 9}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-sm rounded-xl transition-all disabled:opacity-50 shrink-0"
          >
            {isPending ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            Tra cứu
          </button>
        </div>
        <p className="text-xs text-slate-400">
          Hệ thống sẽ hiển thị tất cả hồ sơ tạm trú và tạm vắng liên quan đến số CCCD này.
        </p>
      </div>

      {/* Results */}
      {searched && result && (
        <div className="mt-6 space-y-5">
          {/* Summary */}
          <div className={`rounded-xl p-4 flex items-center gap-3 ${total > 0 ? 'bg-blue-50 border border-blue-100' : 'bg-slate-50 border border-slate-200'}`}>
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${total > 0 ? 'bg-blue-600' : 'bg-slate-400'}`}>
              <FileText size={16} className="text-white" />
            </div>
            <div className="flex-1">
              {total > 0 ? (
                <>
                  <p className="font-bold text-slate-800">Tìm thấy {total} hồ sơ</p>
                  <p className="text-xs text-slate-500">
                    {result.tamTru.length > 0 && `${result.tamTru.length} tạm trú`}
                    {result.tamTru.length > 0 && result.tamVang.length > 0 && ' · '}
                    {result.tamVang.length > 0 && `${result.tamVang.length} tạm vắng`}
                    {' · CCCD: '}<span className="font-mono font-semibold">{cccd}</span>
                  </p>
                </>
              ) : (
                <>
                  <p className="font-bold text-slate-700">Không tìm thấy hồ sơ nào</p>
                  <p className="text-xs text-slate-500">
                    CCCD <span className="font-mono font-semibold">{cccd}</span> chưa có hồ sơ đăng ký tại {KHU_PHO.ma}.
                  </p>
                </>
              )}
            </div>
            {/* Chỉ báo Realtime */}
            {total > 0 && (
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 shrink-0">
                {isRealtime ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <Wifi size={11} className="text-emerald-500" />
                    <span className="hidden sm:inline">Realtime</span>
                  </>
                ) : (
                  <Loader2 size={11} className="animate-spin" />
                )}
              </div>
            )}
          </div>

          {/* Tạm trú */}
          {result.tamTru.length > 0 && (
            <div>
              <h2 className="font-bold text-slate-700 mb-3 flex items-center gap-2 text-sm">
                <UserCheck size={15} className="text-blue-600" />
                Hồ sơ Tạm trú ({result.tamTru.length})
              </h2>
              <div className="space-y-3">
                {result.tamTru.map(r => {
                  const cfg = TRANG_THAI_TRU[r.trang_thai] ?? TRANG_THAI_TRU['DA_ROI_DI']!
                  return (
                    <div key={r.id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 space-y-3">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.cls}`}>
                          <cfg.icon size={11} />
                          {cfg.label}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          #{r.id.slice(0, 8).toUpperCase()}
                        </span>
                      </div>
                      {/* Info */}
                      <div className="space-y-1.5 text-sm">
                        <div className="flex items-start gap-2">
                          <MapPin size={13} className="text-slate-400 mt-0.5 shrink-0" />
                          <span className="text-slate-700">{r.dia_chi_tam_tru}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500">
                          <Calendar size={13} className="text-slate-400 shrink-0" />
                          {fmt(r.ngay_bat_dau)}
                          {r.ngay_ket_thuc && ` → ${fmt(r.ngay_ket_thuc)}`}
                        </div>
                        <div className="flex items-center gap-2 text-slate-500">
                          <FileText size={13} className="text-slate-400 shrink-0" />
                          Lý do: {LY_DO_TRU[r.ly_do_tam_tru] ?? r.ly_do_tam_tru}
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Nộp ngày {fmt(r.created_at.slice(0, 10))}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Tạm vắng */}
          {result.tamVang.length > 0 && (
            <div>
              <h2 className="font-bold text-slate-700 mb-3 flex items-center gap-2 text-sm">
                <UserMinus size={15} className="text-orange-500" />
                Hồ sơ Tạm vắng ({result.tamVang.length})
              </h2>
              <div className="space-y-3">
                {result.tamVang.map(r => {
                  const cfg = TRANG_THAI_VANG[r.trang_thai] ?? TRANG_THAI_VANG['DANG_VANG']!
                  return (
                    <div key={r.id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 space-y-3">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.cls}`}>
                          <cfg.icon size={11} />
                          {cfg.label}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          #{r.id.slice(0, 8).toUpperCase()}
                        </span>
                      </div>
                      {/* Info */}
                      <div className="space-y-1.5 text-sm">
                        <div className="flex items-start gap-2">
                          <MapPin size={13} className="text-slate-400 mt-0.5 shrink-0" />
                          <span className="text-slate-700">{r.dia_chi_tam_vang}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500">
                          <Calendar size={13} className="text-slate-400 shrink-0" />
                          Đi: {fmt(r.ngay_di)}
                          {r.ngay_du_kien_ve && ` · Dự kiến về: ${fmt(r.ngay_du_kien_ve)}`}
                        </div>
                        <div className="flex items-center gap-2 text-slate-500">
                          <FileText size={13} className="text-slate-400 shrink-0" />
                          Lý do: {LY_DO_VANG[r.ly_do_tam_vang] ?? r.ly_do_tam_vang}
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Khai báo ngày {fmt(r.created_at.slice(0, 10))}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Không có hồ sơ */}
          {total === 0 && (
            <div className="text-center py-8 space-y-3">
              <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto">
                <FileText size={24} className="text-slate-300" />
              </div>
              <p className="text-slate-500 text-sm">
                Chưa có hồ sơ nào. Bạn có thể đăng ký ngay:
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Link href="/dang-ky/tam-tru"
                  className="flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 text-white font-semibold text-sm rounded-xl hover:bg-blue-700 transition-colors">
                  <UserCheck size={15} /> Đăng ký Tạm trú
                </Link>
                <Link href="/dang-ky/tam-vang"
                  className="flex items-center justify-center gap-1.5 px-4 py-2 bg-orange-500 text-white font-semibold text-sm rounded-xl hover:bg-orange-600 transition-colors">
                  <UserMinus size={15} /> Khai báo Tạm vắng
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
