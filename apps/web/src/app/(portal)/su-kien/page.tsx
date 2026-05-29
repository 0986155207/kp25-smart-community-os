import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, MapPin, Clock, Users, ChevronRight, CalendarDays, Star } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatDate, formatDateTime } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Sự kiện',
  description: 'Lịch sự kiện, hoạt động cộng đồng Khu phố 25 – Phường Long Trường',
}

export const revalidate = 60

// ─── Types ───────────────────────────────────────────────────
interface SuKien {
  id: string
  tieuDe: string
  moTa: string | null
  loai: string
  trangThai: string
  ngayBatDau: string
  ngayKetThuc: string | null
  diaDiem: string
  diaChiCuThe: string | null
  anhBiaUrl: string | null
  soLuongDuKien: number | null
  canDangKy: boolean
  hanDangKy: string | null
  donViToChuc: string | null
  nguoiPhuTrach: string | null
  sdtLienHe: string | null
  noiBat: boolean
  createdAt: string
}

// ─── Config nhãn / màu ───────────────────────────────────────
export const LOAI_SK: Record<string, { label: string; color: string; bg: string }> = {
  CHINH_TRI:  { label: 'Chính trị',   color: '#8B1A1A', bg: '#FEF2F2' },
  VAN_HOA:    { label: 'Văn hóa',     color: '#7C3AED', bg: '#F5F3FF' },
  THE_THAO:   { label: 'Thể thao',    color: '#059669', bg: '#ECFDF5' },
  TU_THIEN:   { label: 'Từ thiện',    color: '#D97706', bg: '#FFFBEB' },
  HOP_MAT:    { label: 'Họp mặt',     color: '#1E3A5F', bg: '#EFF6FF' },
  AN_NINH:    { label: 'An ninh',     color: '#374151', bg: '#F9FAFB' },
  SUCK_KHOE:  { label: 'Sức khỏe',   color: '#DB2777', bg: '#FDF2F8' },
  GIAO_DUC:   { label: 'Giáo dục',   color: '#B45309', bg: '#FFFBEB' },
  KHAC:       { label: 'Khác',        color: '#6B7280', bg: '#F3F4F6' },
}

export const TRANG_THAI_SK: Record<string, { label: string; color: string; bg: string; dot?: string }> = {
  SAP_DIEN_RA:   { label: 'Sắp diễn ra',   color: '#1D4ED8', bg: '#EFF6FF',    dot: '#3B82F6' },
  DANG_DIEN_RA:  { label: 'Đang diễn ra',  color: '#065F46', bg: '#ECFDF5',    dot: '#10B981' },
  DA_KET_THUC:   { label: 'Đã kết thúc',   color: '#6B7280', bg: '#F3F4F6',    dot: '#9CA3AF' },
  HUY:           { label: 'Đã hủy',         color: '#991B1B', bg: '#FEF2F2',    dot: '#EF4444' },
}

// ─── Fetch data ──────────────────────────────────────────────
async function getSuKien(loaiFilter?: string): Promise<SuKien[]> {
  try {
    const supabase = await createClient()
    let q = supabase
      .from('su_kien')
      .select('*')
      .is('deleted_at', null)
      .neq('trang_thai', 'NHAP')
      .order('noiBat', { ascending: false })
      .order('ngay_bat_dau', { ascending: true })

    if (loaiFilter && loaiFilter !== 'TAT_CA') {
      q = q.eq('loai', loaiFilter)
    }

    const { data } = await q.limit(50)

    return (data ?? []).map((r) => ({
      id:             r['id']              as string,
      tieuDe:         r['tieu_de']         as string,
      moTa:           r['mo_ta']           as string | null,
      loai:           r['loai']            as string,
      trangThai:      r['trang_thai']      as string,
      ngayBatDau:     r['ngay_bat_dau']    as string,
      ngayKetThuc:    r['ngay_ket_thuc']   as string | null,
      diaDiem:        r['dia_diem']        as string,
      diaChiCuThe:    r['dia_chi_cu_the']  as string | null,
      anhBiaUrl:      r['anh_bia_url']     as string | null,
      soLuongDuKien:  r['so_luong_du_kien'] as number | null,
      canDangKy:      (r['can_dang_ky']    ?? false) as boolean,
      hanDangKy:      r['han_dang_ky']     as string | null,
      donViToChuc:    r['don_vi_to_chuc']  as string | null,
      nguoiPhuTrach:  r['nguoi_phu_trach'] as string | null,
      sdtLienHe:      r['sdt_lien_he']     as string | null,
      noiBat:         (r['noi_bat']        ?? false) as boolean,
      createdAt:      r['created_at']      as string,
    }))
  } catch {
    return []
  }
}

// ─── Component thẻ sự kiện ───────────────────────────────────
function SuKienCard({ sk }: { sk: SuKien }) {
  const loaiCfg  = LOAI_SK[sk.loai]  ?? LOAI_SK['KHAC']!
  const ttCfg    = TRANG_THAI_SK[sk.trangThai] ?? TRANG_THAI_SK['SAP_DIEN_RA']!
  const daKetThuc = sk.trangThai === 'DA_KET_THUC' || sk.trangThai === 'HUY'

  return (
    <Link
      href={`/su-kien/${sk.id}`}
      className={`group block rounded-2xl border bg-white overflow-hidden shadow-sm
                  hover:shadow-md transition-all duration-200 hover:-translate-y-0.5
                  ${daKetThuc ? 'opacity-70' : ''}`}
    >
      {/* Ảnh bìa */}
      {sk.anhBiaUrl ? (
        <div className="relative h-44 w-full overflow-hidden bg-slate-100">
          <Image
            src={sk.anhBiaUrl}
            alt={sk.tieuDe}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {sk.noiBat && (
            <span className="absolute top-3 left-3 flex items-center gap-1
                             bg-amber-400 text-amber-900 text-xs font-bold
                             px-2.5 py-1 rounded-full shadow">
              <Star size={11} fill="currentColor" /> Nổi bật
            </span>
          )}
        </div>
      ) : (
        <div className="h-3 w-full" style={{ background: loaiCfg.color }} />
      )}

      <div className="p-4">
        {/* Badges */}
        <div className="flex items-center gap-2 mb-2.5 flex-wrap">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
                style={{ color: loaiCfg.color, background: loaiCfg.bg }}>
            {loaiCfg.label}
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold"
                style={{ color: ttCfg.color, background: ttCfg.bg }}>
            {sk.trangThai === 'DANG_DIEN_RA' && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
            )}
            {ttCfg.label}
          </span>
          {sk.noiBat && !sk.anhBiaUrl && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full
                             text-xs font-semibold bg-amber-50 text-amber-700">
              <Star size={10} fill="currentColor" /> Nổi bật
            </span>
          )}
        </div>

        {/* Tiêu đề */}
        <h3 className="font-bold text-slate-900 text-base leading-snug mb-3
                       group-hover:text-[#8B1A1A] transition-colors line-clamp-2">
          {sk.tieuDe}
        </h3>

        {/* Thông tin */}
        <div className="space-y-1.5 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="shrink-0 text-slate-400" />
            <span>
              {formatDateTime(sk.ngayBatDau)}
              {sk.ngayKetThuc && ` – ${formatDate(sk.ngayKetThuc, 'dd/MM/yyyy')}`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={14} className="shrink-0 text-slate-400" />
            <span className="truncate">{sk.diaDiem}</span>
          </div>
          {sk.soLuongDuKien && (
            <div className="flex items-center gap-2">
              <Users size={14} className="shrink-0 text-slate-400" />
              <span>Dự kiến {sk.soLuongDuKien} người</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
          <span className="text-xs text-slate-400">
            {sk.donViToChuc ?? 'Ban điều hành KP25'}
          </span>
          {sk.canDangKy && sk.trangThai === 'SAP_DIEN_RA' && (
            <span className="text-xs font-semibold text-[#8B1A1A] bg-red-50
                             px-2.5 py-1 rounded-full">
              Có đăng ký
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

// ─── Page ────────────────────────────────────────────────────
export default async function SuKienPage({
  searchParams,
}: {
  searchParams: Promise<{ loai?: string }>
}) {
  const { loai: loaiFilter } = await searchParams
  const allSuKien = await getSuKien(loaiFilter)

  const sapDienRa  = allSuKien.filter(s => s.trangThai === 'SAP_DIEN_RA')
  const dangDienRa = allSuKien.filter(s => s.trangThai === 'DANG_DIEN_RA')
  const daKetThuc  = allSuKien.filter(s => s.trangThai === 'DA_KET_THUC' || s.trangThai === 'HUY')

  const noiBatList = allSuKien.filter(s => s.noiBat && s.trangThai !== 'DA_KET_THUC' && s.trangThai !== 'HUY')
  const hasFilter  = loaiFilter && loaiFilter !== 'TAT_CA'

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
          <CalendarDays size={24} className="text-[#1E3A5F]" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Lịch sự kiện</h1>
          <p className="text-slate-500">Khu phố 25 · Phường Long Trường</p>
        </div>
      </div>

      {/* ── Bộ lọc loại ────────────────────────────────────── */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide">
        {[
          { key: 'TAT_CA', label: 'Tất cả' },
          ...Object.entries(LOAI_SK).map(([k, v]) => ({ key: k, label: v.label })),
        ].map(({ key, label }) => {
          const active = (!loaiFilter || loaiFilter === 'TAT_CA') ? key === 'TAT_CA' : loaiFilter === key
          const cfg = LOAI_SK[key]
          return (
            <a
              key={key}
              href={key === 'TAT_CA' ? '/su-kien' : `/su-kien?loai=${key}`}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold
                          transition-all border ${
                active
                  ? 'border-[#1E3A5F] bg-[#1E3A5F] text-white shadow'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              {label}
            </a>
          )
        })}
      </div>

      {/* ── Đang diễn ra (LIVE) ─────────────────────────────── */}
      {!hasFilter && dangDienRa.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-lg font-bold text-slate-900">Đang diễn ra</h2>
            <span className="text-sm text-slate-400">({dangDienRa.length} sự kiện)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {dangDienRa.map(sk => <SuKienCard key={sk.id} sk={sk} />)}
          </div>
        </section>
      )}

      {/* ── Sắp diễn ra ────────────────────────────────────── */}
      {!hasFilter && sapDienRa.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={18} className="text-[#1E3A5F]" />
            <h2 className="text-lg font-bold text-slate-900">Sắp diễn ra</h2>
            <span className="text-sm text-slate-400">({sapDienRa.length} sự kiện)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {sapDienRa.map(sk => <SuKienCard key={sk.id} sk={sk} />)}
          </div>
        </section>
      )}

      {/* ── Kết quả lọc theo loại ──────────────────────────── */}
      {hasFilter && allSuKien.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <CalendarDays size={18} className="text-[#1E3A5F]" />
            <h2 className="text-lg font-bold text-slate-900">
              {LOAI_SK[loaiFilter!]?.label ?? loaiFilter}
            </h2>
            <span className="text-sm text-slate-400">({allSuKien.length} sự kiện)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {allSuKien.map(sk => <SuKienCard key={sk.id} sk={sk} />)}
          </div>
        </section>
      )}

      {/* ── Đã kết thúc ────────────────────────────────────── */}
      {!hasFilter && daKetThuc.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={18} className="text-slate-400" />
            <h2 className="text-lg font-bold text-slate-500">Đã kết thúc</h2>
            <span className="text-sm text-slate-400">({daKetThuc.length} sự kiện)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {daKetThuc.map(sk => <SuKienCard key={sk.id} sk={sk} />)}
          </div>
        </section>
      )}

      {/* ── Empty state ────────────────────────────────────── */}
      {allSuKien.length === 0 && (
        <div className="text-center py-20">
          <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center
                          justify-center mx-auto mb-5">
            <CalendarDays size={40} className="text-slate-300" />
          </div>
          <p className="text-xl font-semibold text-slate-600 mb-2">Chưa có sự kiện nào</p>
          <p className="text-slate-400 text-sm">
            {hasFilter ? 'Không có sự kiện trong danh mục này' : 'Hãy quay lại sau để xem lịch sự kiện mới nhất'}
          </p>
          {hasFilter && (
            <a href="/su-kien"
               className="inline-block mt-4 px-5 py-2 rounded-full bg-[#1E3A5F] text-white
                          text-sm font-semibold hover:bg-[#152d4a] transition-colors">
              Xem tất cả sự kiện
            </a>
          )}
        </div>
      )}

    </div>
  )
}
