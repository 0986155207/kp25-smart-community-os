import { KHU_PHO } from '@/lib/khu-pho'
// ─── Gửi email qua Resend API ────────────────────────────────
// Docs: https://resend.com/docs/api-reference/emails/send-email

interface EmailPayload {
  to:      string | string[]
  subject: string
  html:    string
}

interface ResendResponse {
  id?:      string
  name?:    string
  message?: string
}

export async function guiEmail(payload: EmailPayload): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn('[Email] RESEND_API_KEY chưa được cấu hình — bỏ qua gửi email')
    return
  }

  const recipients = Array.isArray(payload.to) ? payload.to : [payload.to]
  const valid      = recipients.filter(e => e?.includes('@'))
  if (valid.length === 0) {
    console.warn('[Email] Không có địa chỉ email hợp lệ')
    return
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method:  'POST',
      headers: {
        Authorization:  `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from:    process.env.EMAIL_FROM ?? `${KHU_PHO.ma} Smart Community <noreply@kp25.longtruong.vn>`,
        to:      valid,
        subject: payload.subject,
        html:    payload.html,
      }),
    })

    const data = (await res.json()) as ResendResponse
    if (!res.ok) {
      console.error('[Email] Resend lỗi:', res.status, data.message ?? data.name)
    } else {
      console.log('[Email] Gửi OK, id:', data.id, '→', valid.join(', '))
    }
  } catch (err) {
    console.error('[Email] Lỗi kết nối Resend:', err)
  }
}
