// ─── Gửi SMS qua ESMS.vn API ─────────────────────────────────
// Docs: https://esms.vn/tailieu/ESMS-API-Document.pdf
// SmsType 2 = giao dịch (không cần đăng ký brandname)
// IsUnicode 0 = không dấu (160 ký tự/tin), 1 = có dấu (70 ký tự/tin)

interface EsmsResponse {
  CodeResult?:     string
  SMSID?:          string
  ErrorMessage?:   string
  UserSendStatus?: string[]
}

/** Chuẩn hóa SĐT về dạng 84xxxxxxxxx */
function chuanHoaSdt(sdt: string): string {
  const s = sdt.replace(/\D/g, '')          // loại bỏ ký tự không phải số
  if (s.startsWith('84')) return s
  if (s.startsWith('0'))  return '84' + s.slice(1)
  return s
}

/** Gửi 1 SMS */
export async function guiSms(sdt: string, noiDung: string): Promise<void> {
  const apiKey    = process.env.ESMS_API_KEY
  const secretKey = process.env.ESMS_SECRET_KEY
  if (!apiKey || !secretKey) {
    console.warn('[SMS] ESMS_API_KEY hoặc ESMS_SECRET_KEY chưa được cấu hình')
    return
  }
  if (!sdt?.trim()) return

  const phone   = chuanHoaSdt(sdt.trim())
  const content = noiDung.slice(0, 155)   // giữ dưới 160 ký tự (1 SMS)

  try {
    const res = await fetch(
      'https://rest.esms.vn/MainService.svc/json/SendMultipleMessage_V4_post_json/',
      {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ApiKey:    apiKey,
          Content:   content,
          Phone:     phone,
          SecretKey: secretKey,
          SmsType:   '2',   // giao dịch — không cần brandname
          IsUnicode: '0',   // không dấu → 160 ký tự/SMS
        }),
      }
    )

    const data = (await res.json()) as EsmsResponse
    if (data.CodeResult !== '100') {
      console.error('[SMS] ESMS lỗi, CodeResult:', data.CodeResult, '|', data.ErrorMessage)
    } else {
      console.log('[SMS] Gửi OK, SMSID:', data.SMSID, '→', phone)
    }
  } catch (err) {
    console.error('[SMS] Lỗi kết nối ESMS:', err)
  }
}

/** Gửi cùng nội dung đến nhiều SĐT (bất đồng bộ song song) */
export async function guiSmsNhieu(sdts: string[], noiDung: string): Promise<void> {
  const uniqueSdts = [...new Set(sdts.filter(Boolean))]
  if (uniqueSdts.length === 0) return
  await Promise.allSettled(uniqueSdts.map(sdt => guiSms(sdt, noiDung)))
}
