import { NextRequest } from 'next/server'
import { coGeminiKey, SYSTEM_PROMPT, taoModel } from '@/lib/gemini'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export type TinNhan = {
  role: 'user' | 'assistant'
  content: string
}

export async function POST(req: NextRequest) {
  // ── Kiểm tra API key ──────────────────────────────────────
  if (!coGeminiKey()) {
    return Response.json(
      { error: 'Chưa cấu hình GEMINI_API_KEY. Vui lòng thêm vào .env.local.' },
      { status: 503 }
    )
  }

  try {
    const { messages, context } = (await req.json()) as {
      messages: TinNhan[]
      context?: string
    }

    if (!messages?.length) {
      return Response.json({ error: 'Không có tin nhắn' }, { status: 400 })
    }

    // ── System prompt + ngữ cảnh động (phải đặt trong getGenerativeModel) ─
    const systemFull = context
      ? `${SYSTEM_PROMPT}\n\nDU_LIEU_HIEN_TAI:\n${context}`
      : SYSTEM_PROMPT

    const model = taoModel(systemFull)

    // ── Lịch sử hội thoại (trừ tin nhắn cuối = input hiện tại) ─
    const history = messages.slice(0, -1).map((m) => ({
      role: m.role === 'user' ? ('user' as const) : ('model' as const),
      parts: [{ text: m.content }],
    }))

    const chat = model.startChat({ history })

    const lastMessage = messages[messages.length - 1]!
    const result = await chat.sendMessageStream(lastMessage.content)

    // ── Streaming response ────────────────────────────────────
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text()
            if (text) {
              controller.enqueue(encoder.encode(text))
            }
          }
        } catch (streamErr) {
          console.error('[AI Stream]', streamErr)
          controller.enqueue(
            encoder.encode('\n\nXin lỗi, đã có lỗi trong quá trình xử lý. Vui lòng thử lại.')
          )
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-store',
        'X-Accel-Buffering': 'no',
      },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[AI Chat ERROR]', msg)
    if (msg.includes('API_KEY') || msg.includes('401') || msg.includes('403')) {
      return Response.json({ error: 'GEMINI_API_KEY không hợp lệ hoặc chưa được cấu hình trên Vercel.' }, { status: 503 })
    }
    if (msg.includes('quota') || msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED')) {
      return Response.json({ error: 'Đã vượt quá giới hạn API Gemini. Vui lòng thử lại sau.' }, { status: 429 })
    }
    return Response.json(
      { error: `Không thể kết nối AI: ${msg}` },
      { status: 500 }
    )
  }
}
