'use server'

import { createServiceClient } from '@/lib/supabase/server'
const createClient = () => createServiceClient()

export async function kiemTraBangAnSinh(): Promise<boolean> {
  try {
    const supabase = createClient()
    const { error } = await supabase.from('nguoi_cao_tuoi').select('id').limit(1)
    // PGRST205 = table not found in schema cache
    if (error?.code === 'PGRST205' || error?.code === '42P01') return false
    return true
  } catch {
    return false
  }
}

// ─── Types ────────────────────────────────────────────────────

export interface AnSinhStats {
  // BHYT
  tongBHYT:       number
  bhytConHan:     number
  bhytSapHetHan:  number
  bhytHetHan:     number
  bhytChuaCo:     number
  tyLeBHYT:       number   // %

  // Hộ nghèo / cận nghèo
  tongHoNgheo:    number
  hoNgheo:        number
  hoCaNgheo:      number
  hoThoatNgheo:   number   // trong năm hiện tại

  // Người cao tuổi
  tongNCT:        number
  nctSongCoDon:   number
  nctNhanTroCap:  number
  nctCanChamSoc:  number
}

export async function layThongKeAnSinh(): Promise<AnSinhStats> {
  try {
    const supabase = createClient()

    const [bhytRes, hoNgheoRes, nctRes, hoRes] = await Promise.all([
      supabase.from('bhyt').select('trang_thai').is('deleted_at', null),
      supabase.from('ho_ngheo').select('loai, trang_thai').is('deleted_at', null),
      // Chỉ đếm NCT còn sống (da_mat IS NULL hoặc da_mat = false)
      supabase
        .from('nguoi_cao_tuoi')
        .select('song_co_don, nhan_tro_cap_xh, tinh_trang_sk')
        .is('deleted_at', null)
        .or('da_mat.is.null,da_mat.eq.false'),
      supabase.from('ho_dan').select('id').is('deleted_at', null),
    ])

    const bhyt      = bhytRes.data    ?? []
    const hoNgheo   = hoNgheoRes.data ?? []
    const nct       = nctRes.data     ?? []
    const tongHoDan = (hoRes.data ?? []).length

    const namHienTai = new Date().getFullYear()

    return {
      tongBHYT:      bhyt.length,
      bhytConHan:    bhyt.filter(b => b.trang_thai === 'CON_HAN').length,
      bhytSapHetHan: bhyt.filter(b => b.trang_thai === 'SAP_HET_HAN').length,
      bhytHetHan:    bhyt.filter(b => b.trang_thai === 'HET_HAN').length,
      bhytChuaCo:    bhyt.filter(b => b.trang_thai === 'CHUA_CO').length,
      tyLeBHYT:      tongHoDan > 0 ? Math.round((bhyt.filter(b => b.trang_thai === 'CON_HAN' || b.trang_thai === 'SAP_HET_HAN').length / tongHoDan) * 100) : 0,

      tongHoNgheo:   hoNgheo.filter(h => h.trang_thai === 'DANG_HUONG').length,
      hoNgheo:       hoNgheo.filter(h => h.loai === 'NGHEO'    && h.trang_thai === 'DANG_HUONG').length,
      hoCaNgheo:     hoNgheo.filter(h => h.loai === 'CAN_NGHEO' && h.trang_thai === 'DANG_HUONG').length,
      hoThoatNgheo:  hoNgheo.filter(h => h.trang_thai === 'THOAT_NGHEO').length,

      tongNCT:       nct.length,
      nctSongCoDon:  nct.filter(n => n.song_co_don).length,
      nctNhanTroCap: nct.filter(n => n.nhan_tro_cap_xh).length,
      nctCanChamSoc: nct.filter(n => n.tinh_trang_sk === 'CAN_CHAM_SOC' || n.tinh_trang_sk === 'YEU').length,
    }
  } catch {
    return {
      tongBHYT: 0, bhytConHan: 0, bhytSapHetHan: 0, bhytHetHan: 0, bhytChuaCo: 0, tyLeBHYT: 0,
      tongHoNgheo: 0, hoNgheo: 0, hoCaNgheo: 0, hoThoatNgheo: 0,
      tongNCT: 0, nctSongCoDon: 0, nctNhanTroCap: 0, nctCanChamSoc: 0,
    }
  }
}
