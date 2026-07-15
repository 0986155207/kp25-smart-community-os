import { KHU_PHO } from '@/lib/khu-pho'
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import {
  Calendar, MapPin, Clock, Users, Phone, Building2,
  User, ChevronLeft, Share2, CheckCircle2, Star, CalendarDays,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatDate, formatDateTime, truncate } from '@/lib/utils'
import { LOAI_SK, TRANG_THAI_SK } from '../page'
import DangKyForm from './DangKyForm'

// ─── Types ───────────────────────────────────────────────────
interface SuKienChiTiet {
  id: string
  tieuDe: string
  moTa: string | null
  noiDungDayDu: string | null
  loai: string
  trangThai: string
  ngayBatDau: string
  ngayKetThuc: string | null
  diaDiem: string
  diaChiCuThe: string | null
  anhBiaUrl: string | null
  soLuongDuKien: number | null
  soLuongThucTe: number | null
  canDangKy: boolean
  hanDangKy: string | null
  donViToChuc: string | null
  nguoiPhuTrach: string | null
  sdtLienHe: string | null
  noiBat: boolean
  createdAt: string
}

// ─── Fetch ───────────────────────────────────────────────────
async function getSuKienById(id: string): Promise<SuKienChiTiet | null> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('su_kien')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    if (!data) return null

    return {
      id:              data['id']               as string,
      tieuDe:          data['tieu_de']          as string,
      moTa:            data['mo_ta']            as string | null,
      noiDungDayDu:    data['noi_dung_day_du']  as string | null,
      loai:            data['loai']             as string,
      trangThai:       data['trang_thai']       as string,
      ngayBatDau:      data['ngay_bat_dau']     as string,
      ngayKetThuc:     data['ngay_ket_thuc']    as string | null,
      diaDiem:         data['dia_diem']         as string,
      diaChiCuThe:     data['dia_chi_cu_the']   as string | null,
      anhBiaUrl:       data['anh_bia_url']      as string | null,
      soLuongDuKien:   data['so_luong_du_kien'] as number | null,
      soLuongThucTe:   data['so_luong_thuc_te'] as number | null,
      canDangKy:       (data['can_dang_ky']     ?? false) as boolean,
      hanDangKy:       data['han_dang_ky']      as string | null,
      donViToChuc:     data['don_vi_to_chuc']   as string | null,
      nguoiPhuTrach:   data['nguoi_phu_trach']  as string | null,
      sdtLienHe:       data['sdt_lien_he']      as string | null,
      noiBat:          (data['noi_bat']         ?? false) as boolean,
      createdAt:       data['created_at']       as string,
    }
  } catch {
    return null
  }
}

async function getSuKienKhac(currentId: string, loai: string): Promise<{ id: string; tieuDe: string; ngayBatDau: string; diaDiem: string }[]> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('su_kien')
      .select('id, tieu_de, ngay_bat_dau, dia_diem')
      .is('deleted_at', null)
      .neq('id', currentId)
      .neq('trang_thai', 'NHAP')
      .neq('trang_thai', 'HUY')
      .eq('loai', loai)
      .order('ngay_bat_dau', { ascending: true })
      .limit(3)
    return (data ?? []).map(r => ({
      id:          r['id']           as string,
      tieuDe:      r['tieu_de']      as string,
      ngayBatDau:  r['ngay_bat_dau'] as string,
      diaDiem:     r['dia_diem']     as string,
    }))
  } catch {
    return []
  }
}

// ─── Metadata ─────────────────────────────────────────────────
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const sk = await getSuKienById(id)
  if (!sk) return { title: 'Sự kiện không tồn tại' }
  return {
    title: sk.tieuDe,
    description: sk.moTa ?? `Sự kiện tại ${sk.diaDiem} – ${KHU_PHO.ten}`,
    openGraph: {
      title: sk.tieuDe,
      description: sk.moTa ?? '',
      images: sk.anhBiaUrl ? [{ url: sk.anhBiaUrl }] : [],
    },
  }
}

// ─── Page ────────────────────────────────────────────────────
export default async function SuKienChiTietPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [sk, skKhac] = await Promise.all([
    getSuKienById(id),
    getSuKienById(id).then(s => s ? getSuKienKhac(id, s.loai) : []),
  ])

  if (!sk) notFound()

  const loaiCfg = LOAI_SK[sk.loai]  ?? LOAI_SK['KHAC']!
  const ttCfg   = TRANG_THAI_SK[sk.trangThai] ?? TRANG_THAI_SK['SAP_DIEN_RA']!

  const coTheDangKy = sk.canDangKy
    && sk.trangThai === 'SAP_DIEN_RA'
    && (!sk.hanDangKy || new Date(sk.hanDangKy) > new Date())

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">

      {/* ── Back ───────────────────────────────────────────── */}
      <Link
        href="/su-kien"
        className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-800
                   text-sm font-medium mb-6 transition-colors"
      >
        <ChevronLeft size={18} />
        Quay lại lịch sự kiện
      </Link>

      {/* ── Ảnh bìa ────────────────────────────────────────── */}
      {sk.anhBiaUrl && (
        <div className="relative h-64 md:h-80 w-full rounded-2xl overflow-hidden mb-6 bg-slate-100">
          <Image src={sk.anhBiaUrl} alt={sk.tieuDe} fill className="object-cover" priority />
          {sk.noiBat && (
            <span className="absolute top-4 left-4 flex items-center gap-1.5
                             bg-amber-400 text-amber-900 text-xs font-bold
                             px-3 py-1.5 rounded-full shadow-lg">
              <Star size={12} fill="currentColor" /> Sự kiện nổi bật
            </span>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── Nội dung chính ────────────────────────────────── */}
        <div className="lg:col-span-2">

          {/* Badges */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold"
                  style={{ color: loaiCfg.color, background: loaiCfg.bg }}>
              {loaiCfg.label}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold"
                  style={{ color: ttCfg.color, background: ttCfg.bg }}>
              {sk.trangThai === 'DANG_DIEN_RA' && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
              )}
              {ttCfg.label}
            </span>
          </div>

          {/* Tiêu đề */}
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 leading-snug mb-4">
            {sk.tieuDe}
          </h1>

          {/* Mô tả ngắn */}
          {sk.moTa && (
            <p className="text-slate-600 text-base leading-relaxed mb-6 border-l-4 border-slate-200 pl-4">
              {sk.moTa}
            </p>
          )}

          {/* Nội dung đầy đủ */}
          {sk.noiDungDayDu && (
            <div className="prose prose-slate max-w-none mb-8">
              <div className="bg-slate-50 rounded-xl p-5 text-slate-700 leading-relaxed whitespace-pre-wrap text-sm">
                {sk.noiDungDayDu}
              </div>
            </div>
          )}

          {/* Đăng ký tham dự */}
          {coTheDangKy && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 size={20} className="text-[#8B1A1A]" />
                <h2 className="text-lg font-bold text-slate-900">Đăng ký tham dự</h2>
              </div>
              {sk.hanDangKy && (
                <p className="text-sm text-amber-700 bg-amber-50 px-4 py-2 rounded-lg mb-4">
                  Hạn đăng ký: <strong>{formatDateTime(sk.hanDangKy)}</strong>
                </p>
              )}
              <DangKyForm suKienId={sk.id} tenSuKien={sk.tieuDe} />
            </div>
          )}

          {/* Hết hạn đăng ký */}
          {sk.canDangKy && !coTheDangKy && sk.trangThai === 'SAP_DIEN_RA' && (
            <div className="bg-slate-50 rounded-xl p-4 mb-6 text-center">
              <p className="text-slate-500 text-sm font-medium">
                Đã hết hạn đăng ký tham dự
              </p>
            </div>
          )}

          {/* Sự kiện liên quan */}
          {skKhac.length > 0 && (
            <div>
              <h2 className="text-base font-bold text-slate-900 mb-3">
                Sự kiện cùng chủ đề
              </h2>
              <div className="space-y-3">
                {skKhac.map(s => (
                  <Link
                    key={s.id}
                    href={`/su-kien/${s.id}`}
                    className="flex items-center gap-3 p-3 rounded-xl border border-slate-100
                               hover:border-slate-200 hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center
                                    justify-center shrink-0">
                      <CalendarDays size={18} className="text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 text-sm line-clamp-1">
                        {s.tieuDe}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {formatDate(s.ngayBatDau)} · {s.diaDiem}
                      </p>
                    </div>
                    <ChevronLeft size={16} className="text-slate-300 rotate-180 shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Thông tin phụ (sidebar) ──────────────────────── */}
        <div className="space-y-4">

          {/* Card thông tin sự kiện */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wide">
              Thông tin sự kiện
            </h3>
            <div className="space-y-3.5">

              <div className="flex gap-3">
                <Calendar size={18} className="text-[#1E3A5F] shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">Thời gian bắt đầu</p>
                  <p className="text-sm font-semibold text-slate-800">
                    {formatDateTime(sk.ngayBatDau)}
                  </p>
                </div>
              </div>

              {sk.ngayKetThuc && (
                <div className="flex gap-3">
                  <Clock size={18} className="text-[#1E3A5F] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">Thời gian kết thúc</p>
                    <p className="text-sm font-semibold text-slate-800">
                      {formatDateTime(sk.ngayKetThuc)}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <MapPin size={18} className="text-[#1E3A5F] shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">Địa điểm</p>
                  <p className="text-sm font-semibold text-slate-800">{sk.diaDiem}</p>
                  {sk.diaChiCuThe && (
                    <p className="text-xs text-slate-500 mt-0.5">{sk.diaChiCuThe}</p>
                  )}
                </div>
              </div>

              {sk.soLuongDuKien && (
                <div className="flex gap-3">
                  <Users size={18} className="text-[#1E3A5F] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">Quy mô dự kiến</p>
                    <p className="text-sm font-semibold text-slate-800">
                      {sk.soLuongDuKien} người
                      {sk.soLuongThucTe ? ` · Thực tế: ${sk.soLuongThucTe}` : ''}
                    </p>
                  </div>
                </div>
              )}

              {sk.donViToChuc && (
                <div className="flex gap-3">
                  <Building2 size={18} className="text-[#1E3A5F] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">Đơn vị tổ chức</p>
                    <p className="text-sm font-semibold text-slate-800">{sk.donViToChuc}</p>
                  </div>
                </div>
              )}

              {sk.nguoiPhuTrach && (
                <div className="flex gap-3">
                  <User size={18} className="text-[#1E3A5F] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">Người phụ trách</p>
                    <p className="text-sm font-semibold text-slate-800">{sk.nguoiPhuTrach}</p>
                  </div>
                </div>
              )}

              {sk.sdtLienHe && (
                <div className="flex gap-3">
                  <Phone size={18} className="text-[#1E3A5F] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">Liên hệ</p>
                    <a
                      href={`tel:${sk.sdtLienHe}`}
                      className="text-sm font-semibold text-[#1E3A5F] hover:underline"
                    >
                      {sk.sdtLienHe}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Nút chia sẻ */}
          <ShareButton tieuDe={sk.tieuDe} />

          {/* Thêm vào lịch */}
          <a
            href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(sk.tieuDe)}&dates=${sk.ngayBatDau.replace(/[-:]/g,'').replace('.000Z','Z')}/${(sk.ngayKetThuc ?? sk.ngayBatDau).replace(/[-:]/g,'').replace('.000Z','Z')}&details=${encodeURIComponent(sk.moTa ?? '')}&location=${encodeURIComponent(sk.diaChiCuThe ?? sk.diaDiem)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl
                       border border-slate-200 bg-white text-slate-700 text-sm font-semibold
                       hover:bg-slate-50 transition-colors"
          >
            <Calendar size={16} />
            Thêm vào Google Calendar
          </a>
        </div>
      </div>
    </div>
  )
}

// ─── Client component: Share button ──────────────────────────
function ShareButton({ tieuDe }: { tieuDe: string }) {
  // Server-rendered version (Client Component inline workaround)
  return (
    <button
      onClick={undefined}
      data-share-title={tieuDe}
      id="share-btn"
      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl
                 bg-[#1E3A5F] text-white text-sm font-semibold
                 hover:bg-[#152d4a] transition-colors"
    >
      <Share2 size={16} />
      Chia sẻ sự kiện
    </button>
  )
}
