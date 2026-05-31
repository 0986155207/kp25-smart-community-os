'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { guiSms } from '@/lib/notifications/sms'
import { ghiAuditLog } from '@/lib/audit'

// URL web công khai (production). Fallback nếu env chưa set.
function webUrl(): string {
  const u = process.env.NEXT_PUBLIC_WEB_URL
  if (u && !u.includes('localhost')) return u.replace(/\/$/, '')
  return 'https://smart-kp25-web.vercel.app'
}

// Link tự khai của 1 hộ
function linkTuKhai(token: string): string {
  return `${webUrl()}/qr/${token}/cap-nhat`
}

// Nội dung SMS (không dấu, ngắn gọn — 1 segment GSM-7)
function noiDungSms(link: string): string {
  return `KP25 Long Truong: Cap nhat thong tin ho dan tai ${link} - chi 2 phut, mien phi.`
}

// ════════════════════════════════════════════════════════════
//  THỐNG KÊ CHIẾN DỊCH
// ════════════════════════════════════════════════════════════
export interface ThongKeChienDich {
  tongHo:        number
  hoCoSdt:       number
  hoChuaGui:     number   // có SĐT, chưa gửi SMS
  hoDaGui:       number
  yeuCauChoDuyet: number  // số người đã tự khai chờ duyệt
}

export async function layThongKeChienDich(): Promise<ThongKeChienDich> {
  try {
    const supabase = await createClient()

    const [allRes, sdtRes, daGuiRes, choDuyetRes] = await Promise.all([
      supabase.from('ho_dan').select('id', { count: 'exact', head: true }).is('deleted_at', null),
      supabase.from('ho_dan').select('id', { count: 'exact', head: true })
        .is('deleted_at', null).not('so_dien_thoai', 'is', null),
      supabase.from('ho_dan').select('id', { count: 'exact', head: true })
        .is('deleted_at', null).not('tu_khai_sms_gui_luc', 'is', null),
      supabase.from('yeu_cau_cap_nhat_dan_cu').select('id', { count: 'exact', head: true })
        .eq('trang_thai', 'CHO_DUYET').is('deleted_at', null),
    ])

    const hoCoSdt = sdtRes.count ?? 0
    const hoDaGui = daGuiRes.count ?? 0

    return {
      tongHo:        allRes.count ?? 0,
      hoCoSdt,
      hoDaGui,
      hoChuaGui:     Math.max(0, hoCoSdt - hoDaGui),
      yeuCauChoDuyet: choDuyetRes.count ?? 0,
    }
  } catch (err) {
    console.error('[layThongKeChienDich]', err)
    return { tongHo: 0, hoCoSdt: 0, hoChuaGui: 0, hoDaGui: 0, yeuCauChoDuyet: 0 }
  }
}

// ════════════════════════════════════════════════════════════
//  GỬI SMS HÀNG LOẠT (theo batch để tránh timeout)
// ════════════════════════════════════════════════════════════
export interface KetQuaBatch {
  daGui:    number
  thatBai:  number
  conLai:   boolean    // còn hộ chưa gửi
  tongDaXuLy: number
  message:  string
}

export async function guiSmsTuKhaiBatch(opts: {
  chiHoChuaGui: boolean   // true = chỉ gửi hộ chưa từng gửi
  soLuong?:     number    // mặc định 25/batch
}): Promise<KetQuaBatch> {
  try {
    const supabase = await createClient()
    const limit = Math.min(opts.soLuong ?? 25, 40)

    // Lấy hộ có SĐT, (tùy chọn) chưa gửi
    let query = supabase
      .from('ho_dan')
      .select('id, chu_ho, so_dien_thoai, qr_token')
      .is('deleted_at', null)
      .not('so_dien_thoai', 'is', null)
      .order('created_at', { ascending: true })
      .limit(limit)

    if (opts.chiHoChuaGui) {
      query = query.is('tu_khai_sms_gui_luc', null)
    }

    const { data, error } = await query
    if (error) {
      return { daGui: 0, thatBai: 0, conLai: false, tongDaXuLy: 0, message: `Lỗi: ${error.message}` }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const hoList = (data ?? []) as any[]
    if (hoList.length === 0) {
      return { daGui: 0, thatBai: 0, conLai: false, tongDaXuLy: 0, message: 'Đã gửi xong tất cả hộ' }
    }

    let daGui = 0, thatBai = 0

    for (const ho of hoList) {
      try {
        // Đảm bảo có qr_token
        let token = ho.qr_token as string | null
        if (!token) {
          token = crypto.randomUUID()
          await supabase.from('ho_dan').update({ qr_token: token }).eq('id', ho.id)
        }

        const sdt = String(ho.so_dien_thoai).trim()
        if (!/^0\d{9}$/.test(sdt)) { thatBai++; continue }

        await guiSms(sdt, noiDungSms(linkTuKhai(token)))

        // Đánh dấu đã gửi
        await supabase
          .from('ho_dan')
          .update({
            tu_khai_sms_gui_luc: new Date().toISOString(),
            tu_khai_sms_so_lan:  ((ho.tu_khai_sms_so_lan as number) ?? 0) + 1,
          })
          .eq('id', ho.id)

        daGui++
      } catch (e) {
        console.error('[guiSmsTuKhaiBatch] item', ho.id, e)
        thatBai++
      }
    }

    // Còn hộ chưa gửi không?
    let conLai = false
    if (opts.chiHoChuaGui) {
      const { count } = await supabase
        .from('ho_dan')
        .select('id', { count: 'exact', head: true })
        .is('deleted_at', null)
        .not('so_dien_thoai', 'is', null)
        .is('tu_khai_sms_gui_luc', null)
      conLai = (count ?? 0) > 0
    } else {
      conLai = hoList.length === limit
    }

    if (daGui > 0) {
      ghiAuditLog({ hanh_dong: 'GUI_THONG_BAO', bang: 'ho_dan', mo_ta: `Gửi SMS mời tự khai cho ${daGui} hộ` }).catch(() => {})
    }
    revalidatePath('/dashboard/dan-cu/chien-dich-tu-khai')

    return {
      daGui, thatBai, conLai,
      tongDaXuLy: hoList.length,
      message: `Đã gửi ${daGui} SMS${thatBai > 0 ? `, ${thatBai} thất bại` : ''}`,
    }
  } catch (err) {
    console.error('[guiSmsTuKhaiBatch]', err)
    return { daGui: 0, thatBai: 0, conLai: false, tongDaXuLy: 0, message: err instanceof Error ? err.message : 'Lỗi không xác định' }
  }
}

// ════════════════════════════════════════════════════════════
//  TIN NHẮN ZALO GROUP (copy-paste vào nhóm Cộng đồng KP25)
// ════════════════════════════════════════════════════════════
export async function taoTinNhanGroupTuKhai(): Promise<string> {
  const base = webUrl()
  const hanChot = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    .toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Ho_Chi_Minh' })

  return `📋 THÔNG BÁO: CẬP NHẬT THÔNG TIN DÂN CƯ KHU PHỐ 25

Kính gửi bà con Khu phố 25,

Nhằm hoàn thiện hồ sơ dân cư số, phục vụ tốt hơn cho công tác an sinh và thông báo khẩn cấp, Ban quản lý khu phố mời bà con cập nhật thông tin hộ gia đình.

✅ CÁCH LÀM (chỉ 2 phút):
1. Mỗi hộ sẽ nhận 1 tin nhắn SMS chứa đường link riêng
2. Bấm vào link → điền thông tin → gửi
3. Hoặc quét mã QR dán tại nhà / liên hệ Tổ trưởng

🎁 LỢI ÍCH KHI CẬP NHẬT:
• Nhận thông báo khẩn cấp (an ninh, thiên tai) kịp thời
• Được hỗ trợ an sinh đúng đối tượng
• Xác nhận cư trú nhanh, không cần đến trụ sở

⏰ Thời hạn: trước ngày ${hanChot}

🌐 Cổng thông tin: ${base}

Trân trọng cảm ơn sự hợp tác của bà con!
-- Ban quản lý Khu phố 25, Phường Long Trường`
}
