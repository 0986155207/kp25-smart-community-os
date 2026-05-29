import { NextRequest } from 'next/server'
import { taoModel, coGeminiKey, SYSTEM_PROMPT } from '@/lib/gemini'
import { xayDungNguCanhRAG } from '@/lib/rag'
import type { KetQuaTimKiem } from '@/lib/rag'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export type TinNhan = {
  role:    'user' | 'assistant'
  content: string
}

// Header chuẩn để include nguồn RAG trong response
const RAG_SOURCE_HEADER = 'X-RAG-Sources'

export async function POST(req: NextRequest) {
  if (!coGeminiKey()) {
    return Response.json(
      { error: 'Chưa cấu hình GEMINI_API_KEY' },
      { status: 503 }
    )
  }

  try {
    const { messages, context: baseContext, useRag } = (await req.json()) as {
      messages:    TinNhan[]
      context?:    string
      useRag?:     boolean
    }

    if (!messages?.length) {
      return Response.json({ error: 'Không có tin nhắn' }, { status: 400 })
    }

    const lastUser = messages[messages.length - 1]
    if (!lastUser || lastUser.role !== 'user') {
      return Response.json({ error: 'Tin nhắn cuối phải là user' }, { status: 400 })
    }

    // ── RAG: tìm kiếm semantic nếu bật ──────────────────────
    let ragNguCanh = ''
    let ragNguon:   KetQuaTimKiem[] = []

    if (useRag !== false) {
      try {
        const { nguCanh, nguon } = await xayDungNguCanhRAG(lastUser.content)
        ragNguCanh = nguCanh
        ragNguon   = nguon
      } catch { /* bỏ qua nếu RAG lỗi, dùng context thông thường */ }
    }

    // ── Xây dựng system prompt đầy đủ ───────────────────────
    const parts: string[] = [SYSTEM_PROMPT]

    if (baseContext) {
      parts.push('\nDU_LIEU_HIEN_TAI:\n' + baseContext)
    }

    if (ragNguCanh) {
      parts.push(
        '\nHUONG_DAN_SU_DUNG_TAI_LIEU:',
        'Khi trả lời, ưu tiên dùng thông tin từ tài liệu bên dưới.',
        'Ghi rõ nguồn tài liệu khi trích dẫn, ví dụ: (Nguồn: Nghị quyết 01/NQ-CB).',
        ragNguCanh
      )
    }

    const systemFull = parts.join('\n')
    const model      = taoModel(systemFull)

    // ── Lịch sử hội thoại ────────────────────────────────────
    const history = messages.slice(0, -1).map(m => ({
      role:  m.role === 'user' ? ('user' as const) : ('model' as const),
      parts: [{ text: m.content }],
    }))

    const chat   = model.startChat({ history })
    const result = await chat.sendMessageStream(lastUser.content)

    // ── Streaming response ────────────────────────────────────
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text()
            if (text) controller.enqueue(encoder.encode(text))
          }
        } catch (e) {
          console.error('[RAG Stream]', e)
          controller.enqueue(
            encoder.encode('\n\nXin lỗi, đã có lỗi trong quá trình xử lý.')
          )
        } finally {
          controller.close()
        }
      },
    })

    // Truyền thông tin nguồn RAG qua header
    const sourcesJson = JSON.stringify(
      ragNguon.slice(0, 3).map(s => ({
        tieu_de:      s.tieuDe,
        so_hieu:      s.soHieu,
        loai:         s.loai,
        do_tuong_dong: Math.round(s.doTuongDong * 100),
      }))
    )

    return new Response(stream, {
      headers: {
        'Content-Type':      'text/plain; charset=utf-8',
        'Cache-Control':     'no-cache, no-store',
        'X-Accel-Buffering': 'no',
        [RAG_SOURCE_HEADER]: sourcesJson,
      },
    })
  } catch (err) {
    console.error('[RAG Chat]', err)
    return Response.json(
      { error: 'Không thể kết nối AI. Vui lòng thử lại.' },
      { status: 500 }
    )
  }
}
