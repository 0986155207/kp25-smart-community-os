import { KHU_PHO } from '@/lib/khu-pho'
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'

export interface KetQuaTimKiem {
  loai:   'ho_dan' | 'nhan_khau' | 'phan_anh' | 'thong_bao' | 'su_kien' | 'tai_lieu'
  id:     string
  tieuDe: string
  moTa?:  string
  meta?:  string
  href:   string
}

// ─── Bỏ dấu tiếng Việt để tìm kiếm không dấu ────────────────
function boVietDau(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')   // strip combining diacritics
    .replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .toLowerCase()
}

// ─── Tách query thành từng từ (bỏ trống) ─────────────────────
function tachTu(q: string): string[] {
  return q.trim().split(/\s+/).filter(w => w.length >= 1)
}

// ─── Áp dụng tìm kiếm từng từ (AND giữa các từ, OR giữa fields)
// Giải quyết lỗi PostgREST: khoảng trắng trong pattern làm vỡ .or() filter
// Ví dụ "Thu Hà" → AND(ho_ten ILIKE '%thu%', ho_ten ILIKE '%hà%')
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyWordSearch(query: any, words: string[], fields: string[]): any {
  for (const word of words) {
    const pat        = `%${word.toLowerCase()}%`
    const filterStr  = fields.map(f => `${f}.ilike.${pat}`).join(',')
    query = query.or(filterStr)
  }
  return query
}

const TRANG_THAI_LABEL: Record<string, string> = {
  MOI: 'Mới', DANG_XU_LY: 'Đang xử lý',
  DA_XU_LY: 'Đã xử lý', DONG: 'Đã đóng', CHO_PHAN_HOI: 'Chờ phản hồi',
}

export async function GET(req: NextRequest) {
  const rawQ = new URL(req.url).searchParams.get('q')?.trim() ?? ''
  if (rawQ.length < 2) return NextResponse.json({ results: [] })

  const svc    = createServiceClient()
  const words  = tachTu(rawQ)         // ["Thu", "Hà"]  ← split by spaces
  const results: KetQuaTimKiem[] = []

  // Chạy tất cả queries song song
  const [hoDan, nhanKhau, phanAnh, thongBao, suKien, taiLieu] = await Promise.all([

    // ── Hộ dân ──────────────────────────────────────────────
    applyWordSearch(
      svc.from('ho_dan')
        .select('id, ma_ho, chu_ho, dia_chi_day, so_dien_thoai').eq('don_vi_id', KHU_PHO.id)
        .is('deleted_at', null)
        .limit(5),
      words,
      ['chu_ho', 'ma_ho', 'dia_chi_day', 'so_dien_thoai']
    ),

    // ── Nhân khẩu ───────────────────────────────────────────
    applyWordSearch(
      svc.from('nhan_khau')
        .select('id, ho_ten, cccd, quan_he, ho_id').eq('don_vi_id', KHU_PHO.id)
        .is('deleted_at', null)
        .limit(6),
      words,
      ['ho_ten', 'cccd']
    ),

    // ── Phản ánh ────────────────────────────────────────────
    applyWordSearch(
      svc.from('phan_anh')
        .select('id, tieu_de, mo_ta, trang_thai, loai, dia_chi_phan_anh').eq('don_vi_id', KHU_PHO.id)
        .is('deleted_at', null)
        .limit(5),
      words,
      ['tieu_de', 'mo_ta', 'dia_chi_phan_anh']
    ),

    // ── Thông báo ───────────────────────────────────────────
    applyWordSearch(
      svc.from('thong_bao')
        .select('id, tieu_de, noi_dung, loai').eq('don_vi_id', KHU_PHO.id)
        .is('deleted_at', null)
        .limit(4),
      words,
      ['tieu_de', 'noi_dung']
    ),

    // ── Sự kiện ─────────────────────────────────────────────
    applyWordSearch(
      svc.from('su_kien')
        .select('id, tieu_de, mo_ta, dia_diem, ngay_bat_dau').eq('don_vi_id', KHU_PHO.id)
        .is('deleted_at', null)
        .limit(3),
      words,
      ['tieu_de', 'mo_ta', 'dia_diem']
    ),

    // ── Tài liệu ────────────────────────────────────────────
    applyWordSearch(
      svc.from('tai_lieu')
        .select('id, tieu_de, mo_ta, loai').eq('don_vi_id', KHU_PHO.id)
        .is('deleted_at', null)
        .limit(3),
      words,
      ['tieu_de', 'mo_ta']
    ),
  ])

  // ─── Map kết quả ──────────────────────────────────────────
  for (const h of (hoDan.data ?? [])) {
    results.push({
      loai:   'ho_dan',
      id:     h.id,
      tieuDe: h.chu_ho,
      moTa:   h.dia_chi_day,
      meta:   h.ma_ho,
      href:   `/dashboard/dan-cu/${h.id}`,
    })
  }

  for (const nk of (nhanKhau.data ?? [])) {
    results.push({
      loai:   'nhan_khau',
      id:     nk.id,
      tieuDe: nk.ho_ten,
      moTa:   nk.cccd ? `CCCD: ${nk.cccd}` : undefined,
      meta:   nk.quan_he,
      href:   `/dashboard/dan-cu/${nk.ho_id}`,
    })
  }

  for (const pa of (phanAnh.data ?? [])) {
    results.push({
      loai:   'phan_anh',
      id:     pa.id,
      tieuDe: pa.tieu_de,
      moTa:   (pa.mo_ta ?? pa.dia_chi_phan_anh)?.slice(0, 80),
      meta:   TRANG_THAI_LABEL[pa.trang_thai] ?? pa.trang_thai,
      href:   `/dashboard/phan-anh/${pa.id}`,
    })
  }

  for (const tb of (thongBao.data ?? [])) {
    results.push({
      loai:   'thong_bao',
      id:     tb.id,
      tieuDe: tb.tieu_de,
      moTa:   tb.noi_dung?.slice(0, 80),
      meta:   tb.loai,
      href:   `/dashboard/thong-bao/${tb.id}`,
    })
  }

  for (const sk of (suKien.data ?? [])) {
    const ngay = sk.ngay_bat_dau
      ? new Date(sk.ngay_bat_dau).toLocaleDateString('vi-VN')
      : undefined
    results.push({
      loai:   'su_kien',
      id:     sk.id,
      tieuDe: sk.tieu_de,
      moTa:   sk.dia_diem,
      meta:   ngay,
      href:   `/dashboard/su-kien/${sk.id}`,
    })
  }

  for (const tl of (taiLieu.data ?? [])) {
    results.push({
      loai:   'tai_lieu',
      id:     tl.id,
      tieuDe: tl.tieu_de,
      moTa:   tl.mo_ta?.slice(0, 80),
      meta:   tl.loai,
      href:   `/dashboard/tai-lieu/${tl.id}`,
    })
  }

  // ─── Nếu query không dấu khác query gốc → chạy thêm fallback ─
  // Ví dụ: gõ "Thu Ha" nhưng data lưu "Thu Hà"
  const rawNoDau   = boVietDau(rawQ)
  const wordsDau   = tachTu(rawQ).map(w => boVietDau(w))
  const needFallback = wordsDau.some((w, i) => w !== (tachTu(rawQ)[i]?.toLowerCase() ?? w))

  if (needFallback && results.length < 5) {
    const existingIds = new Set(results.map(r => r.id))

    const [fbHoDan, fbNhanKhau] = await Promise.all([
      applyWordSearch(
        svc.from('ho_dan')
          .select('id, ma_ho, chu_ho, dia_chi_day').eq('don_vi_id', KHU_PHO.id)
          .is('deleted_at', null)
          .limit(5),
        wordsDau,
        ['chu_ho', 'dia_chi_day']
      ),
      applyWordSearch(
        svc.from('nhan_khau')
          .select('id, ho_ten, cccd, quan_he, ho_id').eq('don_vi_id', KHU_PHO.id)
          .is('deleted_at', null)
          .limit(6),
        wordsDau,
        ['ho_ten', 'cccd']
      ),
    ])

    for (const h of (fbHoDan.data ?? [])) {
      if (!existingIds.has(h.id)) {
        existingIds.add(h.id)
        results.push({ loai: 'ho_dan', id: h.id, tieuDe: h.chu_ho, moTa: h.dia_chi_day, meta: h.ma_ho, href: `/dashboard/dan-cu/${h.id}` })
      }
    }
    for (const nk of (fbNhanKhau.data ?? [])) {
      if (!existingIds.has(nk.id)) {
        existingIds.add(nk.id)
        results.push({ loai: 'nhan_khau', id: nk.id, tieuDe: nk.ho_ten, moTa: nk.cccd ? `CCCD: ${nk.cccd}` : undefined, meta: nk.quan_he, href: `/dashboard/dan-cu/${nk.ho_id}` })
      }
    }
  }

  return NextResponse.json({ results })
}
