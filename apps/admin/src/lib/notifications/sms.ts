// ─── Gửi SMS qua ESMS.vn API ─────────────────────────────────
// Docs: https://esms.vn/tailieu/ESMS-API-Document.pdf
// SmsType 2 = giao dịch (không cần đăng ký brandname)

interface EsmsResponse {
  CodeResult?:   string
  SMSID?:        string
  ErrorMessage?: string
}

function chuanHoaSdt(sdt: string): string {
  const s = sdt.replace(/\D/g, '')
  if (s.startsWith('84')) return s
  if (s.startsWith('0'))  return '84' + s.slice(1)
  return s
}

export async function guiSms(sdt: string, noiDung: string): Promise<void> {
  const apiKey    = process.env.ESMS_API_KEY
  const secretKey = process.env.ESMS_SECRET_KEY
  if (!apiKey || !secretKey) {
    console.warn('[SMS] ESMS_API_KEY hoặc ESMS_SECRET_KEY chưa được cấu hình')
    return
  }
  if (!sdt?.trim()) return

  const phone   = chuanHoaSdt(sdt.trim())
  const content = noiDung.slice(0, 155)

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
          SmsType:   '2',
          IsUnicode: '0',
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
