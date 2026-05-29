import { NextRequest, NextResponse } from 'next/server'
import { getGeminiModel, buildChatHistory } from '@/lib/gemini/client'
import { createServiceClient }              from '@/lib/supabase/server'
import { buildApiResponse, buildApiError }  from '@/lib/utils'

export const runtime    = 'nodejs'
export const maxDuration = 30

// Số tin nhắn tối đa đưa vào context (để tránh token limit)
const MAX_CONTEXT = 30

// ─── Strip Markdown — đảm bảo AI không dùng ký hiệu Markdown ──
function stripMarkdown(text: string): string {
  return text
    // In đậm: **text** hoặc __text__
    .replace(/\*\*([^*\n]+)\*\*/g, '$1')
    .replace(/__([^_\n]+)__/g, '$1')
    // In nghiêng: _text_ (không ảnh hưởng dấu * đầu dòng)
    .replace(/_([^_\n]+)_/g, '$1')
    // Tiêu đề: ## Heading → Heading
    .replace(/^#{1,6}\s+(.+)/gm, '$1')
    // Đường kẻ ngang
    .replace(/^[-*_]{3,}\s*$/gm, '')
    // Bullet list đầu dòng: * item hoặc - item → xóa dấu
    .replace(/^[ \t]*[-*+]\s+/gm, '')
    // Blockquote: > text
    .replace(/^>\s+/gm, '')
    // Code block
    .replace(/^`{3}[\s\S]*?`{3}/gm, '')
    // Inline code: `text`
    .replace(/`([^`]+)`/g, '$1')
    // Dọn dẹp dòng trống thừa
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

// ─── Sửa thông tin hành chính — Thủ Đức đã bị giải thể ────────
function fixAdminTerms(text: string): string {
  return text
    // Bảo hiểm xã hội Thành phố Thủ Đức → BHXH TP.HCM
    .replace(/Bảo hiểm xã hội\s+[Tt]hành phố\s+Thủ Đức/g, 'Bảo hiểm xã hội TP.HCM')
    .replace(/BHXH\s+[Tt]hành phố\s+Thủ Đức/g, 'BHXH TP.HCM')
    .replace(/BHXH\s+Thủ Đức/g, 'BHXH TP.HCM')
    // Trung tâm ... Thành phố Thủ Đức → ... TP.HCM
    .replace(/[Tt]hành phố\s+Thủ Đức/g, 'TP.HCM')
    .replace(/[Tt][Pp]\.\s*Thủ Đức/g, 'TP.HCM')
    // Quận Thủ Đức
    .replace(/[Qq]uận\s+Thủ Đức/g, 'TP.HCM')
    // Phòng ban cấp Thủ Đức → cấp TP.HCM
    .replace(/\s+Thủ Đức\b/g, ' TP.HCM')
}

function cleanReply(text: string): string {
  return fixAdminTerms(stripMarkdown(text))
}

// ─── GET /api/chat?sessionKey=xxx — Tải lịch sử hội thoại ────
export async function GET(req: NextRequest) {
  try {
    const sessionKey = req.nextUrl.searchParams.get('sessionKey')
    if (!sessionKey) {
      return NextResponse.json(buildApiResponse({ messages: [] }, 'Không có session'))
    }

    const svc = createServiceClient()

    // Tìm session theo key
    const { data: session } = await svc
      .from('chat_sessions')
      .select('id, tieu_de, so_tin_nhan, created_at')
      .eq('session_key', sessionKey)
      .single()

    if (!session) {
      return NextResponse.json(buildApiResponse({ messages: [], session: null }, 'Session mới'))
    }

    // Lấy tin nhắn gần nhất (giới hạn MAX_CONTEXT)
    const { data: messages } = await svc
      .from('chat_messages')
      .select('id, vai_tro, noi_dung, created_at')
      .eq('session_id', session.id)
      .order('created_at', { ascending: true })
      .limit(MAX_CONTEXT)

    return NextResponse.json(
      buildApiResponse({
        session: {
          id:         session.id,
          tieuDe:     session.tieu_de,
          soTinNhan:  session.so_tin_nhan,
          createdAt:  session.created_at,
        },
        messages: (messages ?? []).map(m => ({
          id:        m.id,
          vaiTro:    m.vai_tro,
          noiDung:   m.noi_dung,
          createdAt: m.created_at,
        })),
      }, 'Tải lịch sử thành công')
    )
  } catch (err) {
    console.error('[Chat GET]', err)
    return NextResponse.json(buildApiResponse({ messages: [] }, 'Lỗi tải lịch sử'))
  }
}

// ─── POST /api/chat — Gửi tin nhắn + lưu DB ──────────────────
interface ChatRequest {
  message:    string
  sessionKey: string
}

export async function POST(req: NextRequest) {
  try {
    const body: ChatRequest = await req.json()
    const { message, sessionKey } = body

    if (!message?.trim()) {
      return NextResponse.json(buildApiError('Tin nhắn không được trống'), { status: 400 })
    }
    if (message.length > 2000) {
      return NextResponse.json(buildApiError('Tin nhắn quá dài (tối đa 2000 ký tự)'), { status: 400 })
    }
    if (!sessionKey?.trim()) {
      return NextResponse.json(buildApiError('Thiếu session key'), { status: 400 })
    }

    const svc = createServiceClient()

    // ── 1. Upsert session ──────────────────────────────────────
    let sessionId: string

    const { data: existing } = await svc
      .from('chat_sessions')
      .select('id, tieu_de, so_tin_nhan')
      .eq('session_key', sessionKey)
      .maybeSingle()

    if (existing) {
      sessionId = existing.id
    } else {
      // Tạo session mới, tiêu đề lấy từ tin nhắn đầu tiên
      const tieuDe = message.trim().slice(0, 60)
      const { data: newSession, error: createErr } = await svc
        .from('chat_sessions')
        .insert({ session_key: sessionKey, tieu_de: tieuDe })
        .select('id')
        .single()

      if (createErr || !newSession) {
        console.error('[Chat] Lỗi tạo session:', createErr)
        // Tiếp tục mà không lưu DB (graceful degradation)
        return await handleWithoutMemory(message)
      }
      sessionId = newSession.id
    }

    // ── 2. Load lịch sử gần nhất từ DB ────────────────────────
    const { data: dbMessages } = await svc
      .from('chat_messages')
      .select('vai_tro, noi_dung')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
      .limit(MAX_CONTEXT)

    const history = (dbMessages ?? []) as Array<{ vai_tro: 'user' | 'assistant'; noi_dung: string }>

    // ── 3. Gửi đến Gemini với đầy đủ context ──────────────────
    const model       = getGeminiModel()
    const chatHistory = buildChatHistory(history)
    const chat        = model.startChat({ history: chatHistory })
    const result      = await chat.sendMessage(message.trim())
    const reply       = cleanReply(result.response.text())

    // ── 4. Lưu user message + AI response vào DB ──────────────
    await svc.from('chat_messages').insert([
      { session_id: sessionId, vai_tro: 'user',      noi_dung: message.trim() },
      { session_id: sessionId, vai_tro: 'assistant',  noi_dung: reply },
    ])

    // Cập nhật tiêu đề session nếu là tin nhắn đầu (chưa có tiêu đề hay)
    if (!existing || existing.so_tin_nhan === 0) {
      await svc
        .from('chat_sessions')
        .update({ tieu_de: message.trim().slice(0, 60) })
        .eq('id', sessionId)
    }

    return NextResponse.json(
      buildApiResponse({ reply, sessionId }, 'Trả lời thành công'),
      { status: 200 }
    )
  } catch (error) {
    console.error('[AI Chat Error]:', error)

    if (error instanceof Error && error.message.includes('API key')) {
      return NextResponse.json(buildApiError('Lỗi cấu hình AI'), { status: 500 })
    }
    return NextResponse.json(
      buildApiError('Không thể xử lý yêu cầu. Vui lòng thử lại.'),
      { status: 500 }
    )
  }
}

// ─── Fallback: trả lời không có memory (khi DB lỗi) ──────────
async function handleWithoutMemory(message: string) {
  const model  = getGeminiModel()
  const chat   = model.startChat({ history: [] })
  const result = await chat.sendMessage(message)
  const reply  = cleanReply(result.response.text())
  return NextResponse.json(
    buildApiResponse({ reply, sessionId: null }, 'Trả lời thành công (không lưu)'),
    { status: 200 }
  )
}
