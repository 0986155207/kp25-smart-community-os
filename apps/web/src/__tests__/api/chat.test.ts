import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// ─── Mock Gemini ──────────────────────────────────────────────
const mockSendMessage = vi.fn().mockResolvedValue({
  response: { text: () => 'Đây là câu trả lời từ AI.' },
})

vi.mock('@/lib/gemini/client', () => ({
  getGeminiModel:   vi.fn(() => ({ startChat: vi.fn(() => ({ sendMessage: mockSendMessage })) })),
  buildChatHistory: vi.fn(() => []),
}))

vi.mock('@/lib/supabase/server', () => ({
  createServiceClient: vi.fn(),
  createClient:        vi.fn(),
}))

// ─── Helpers ─────────────────────────────────────────────────
function makePost(body: object) {
  return new NextRequest('http://localhost/api/chat', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  })
}

function makeGet(params = '') {
  return new NextRequest(`http://localhost/api/chat${params}`)
}

// ─── Tạo mock Supabase với Proxy ─────────────────────────────
function makeSvcMock(opts: {
  sessionData?:  object | null
  messagesData?: object[]
  insertErr?:    object | null
}) {
  const {
    sessionData  = { id: 's1', tieu_de: 'Test', so_tin_nhan: 2 },
    messagesData = [],
    insertErr    = null,
  } = opts

  const maybeSingleFn = vi.fn().mockResolvedValue({ data: sessionData, error: null })
  const singleFn      = vi.fn().mockResolvedValue({ data: sessionData ? { id: (sessionData as Record<string, unknown>)['id'] ?? 'new-session' } : null, error: null })
  const limitFn       = vi.fn().mockResolvedValue({ data: messagesData, error: null })
  const insertFn      = vi.fn().mockResolvedValue({ data: null, error: insertErr })

  return new Proxy({} as Record<string, unknown>, {
    get(_t, prop: string) {
      if (prop === 'from') {
        return vi.fn((_table: string) =>
          new Proxy({} as Record<string, unknown>, {
            get(_t2, p2: string) {
              if (p2 === 'insert') return vi.fn(() => ({
                select: vi.fn(() => ({ single: singleFn })),
                ...insertFn(),
                then: insertFn().then?.bind(insertFn()),
              }))
              if (p2 === 'update') return vi.fn(() => ({ eq: vi.fn().mockResolvedValue({ error: null }) }))
              return vi.fn(() => new Proxy({} as Record<string, unknown>, {
                get(_t3, p3: string) {
                  if (p3 === 'maybeSingle') return maybeSingleFn
                  if (p3 === 'single')      return singleFn
                  if (p3 === 'limit')       return limitFn
                  if (p3 === 'insert')      return insertFn
                  return vi.fn(() => new Proxy({} as Record<string, unknown>, {
                    get(_t4, p4: string) {
                      if (p4 === 'maybeSingle') return maybeSingleFn
                      if (p4 === 'single')      return singleFn
                      if (p4 === 'limit')       return limitFn
                      if (p4 === 'insert')      return insertFn
                      return vi.fn().mockReturnThis()
                    },
                  }))
                },
              }))
            },
          })
        )
      }
      return vi.fn()
    },
  })
}

// ═══════════════════════════════════════════════════════════════
describe('POST /api/chat', () => {

  let POST: (req: NextRequest) => Promise<Response>

  beforeEach(async () => {
    vi.resetModules()
    mockSendMessage.mockResolvedValue({ response: { text: () => 'Đây là câu trả lời từ AI.' } })

    const supabaseMod = await import('@/lib/supabase/server')
    vi.mocked(supabaseMod.createServiceClient).mockReturnValue(
      makeSvcMock({}) as ReturnType<typeof supabaseMod.createServiceClient>
    )

    const mod = await import('@/app/api/chat/route')
    POST = mod.POST
  })

  it('400 khi message rỗng', async () => {
    const res = await POST(makePost({ message: '', sessionKey: 'key-001' }))
    expect(res.status).toBe(400)
    const json = await res.json() as { success: boolean }
    expect(json.success).toBe(false)
  })

  it('400 khi message quá dài (>2000 ký tự)', async () => {
    const res = await POST(makePost({ message: 'a'.repeat(2001), sessionKey: 'key-001' }))
    expect(res.status).toBe(400)
  })

  it('400 khi thiếu sessionKey', async () => {
    const res = await POST(makePost({ message: 'Xin chào' }))
    expect(res.status).toBe(400)
    const json = await res.json() as { message: string }
    expect(json.message).toContain('session key')
  })

  it('gọi Gemini và trả về reply', async () => {
    const res = await POST(makePost({
      message:    'Thủ tục đăng ký tạm trú là gì?',
      sessionKey: 'session-abc',
    }))
    expect(res.status).toBe(200)
    const json = await res.json() as { success: boolean; data: { reply: string } }
    expect(json.success).toBe(true)
    expect(json.data.reply).toBeTruthy()
    expect(mockSendMessage).toHaveBeenCalled()
  })

  it('AI response không chứa Markdown ** và ##', async () => {
    // ## phải ở đầu dòng mới bị strip bởi regex /^#{1,6}\s+(.+)/gm
    mockSendMessage.mockResolvedValueOnce({
      response: {
        text: () => '## Tiêu đề\n\n**Nội dung in đậm** cần hiển thị bình thường\n\n## Bước tiếp theo',
      },
    })
    const res = await POST(makePost({ message: 'Hướng dẫn', sessionKey: 'key-md' }))
    const json = await res.json() as { data: { reply: string } }
    expect(json.data.reply).not.toContain('**')
    // ## ở đầu dòng bị strip
    expect(json.data.reply).not.toMatch(/^##\s/m)
    // Nội dung vẫn còn
    expect(json.data.reply).toContain('Tiêu đề')
  })

  it('AI tự động thay "Thủ Đức" → "TP.HCM"', async () => {
    mockSendMessage.mockResolvedValueOnce({
      response: { text: () => 'Liên hệ BHXH thành phố Thủ Đức để biết thêm.' },
    })
    const res = await POST(makePost({ message: 'BHXH?', sessionKey: 'key-td' }))
    const json = await res.json() as { data: { reply: string } }
    expect(json.data.reply).not.toContain('Thủ Đức')
    expect(json.data.reply).toContain('TP.HCM')
  })
})

// ═══════════════════════════════════════════════════════════════
describe('GET /api/chat', () => {

  let GET: (req: NextRequest) => Promise<Response>

  beforeEach(async () => {
    vi.resetModules()
    const supabaseMod = await import('@/lib/supabase/server')
    vi.mocked(supabaseMod.createServiceClient).mockReturnValue(
      makeSvcMock({}) as ReturnType<typeof supabaseMod.createServiceClient>
    )
    const mod = await import('@/app/api/chat/route')
    GET = mod.GET
  })

  it('trả về messages=[] khi không có sessionKey', async () => {
    const res = await GET(makeGet())
    expect(res.status).toBe(200)
    const json = await res.json() as { data: { messages: unknown[] } }
    expect(json.data.messages).toEqual([])
  })
})
