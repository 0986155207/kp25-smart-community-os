import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { createSupabaseMock } from '../helpers/supabase-mock'

// ─── Shared mock refs ─────────────────────────────────────────
let mockSingle      = vi.fn()
let mockLimit       = vi.fn()
let mockInsert      = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

// ─── Helpers ─────────────────────────────────────────────────
function makeRequest(body: object) {
  return new NextRequest('http://localhost/api/su-kien/dang-ky', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  })
}

const VALID_SK = {
  id:          'sk-001',
  can_dang_ky: true,
  trang_thai:  'SAP_DIEN_RA',
  han_dang_ky: null,
}

const VALID_BODY = {
  suKienId:    'sk-001',
  hoTen:       'Phan Tấn Tài',
  soDienThoai: '0909123456',
  soNguoi:     2,
}

// ═══════════════════════════════════════════════════════════════
describe('POST /api/su-kien/dang-ky', () => {

  let POST: (req: NextRequest) => Promise<Response>

  beforeEach(async () => {
    vi.resetModules()

    mockSingle = vi.fn().mockResolvedValue({ data: VALID_SK, error: null })
    mockLimit  = vi.fn().mockResolvedValue({ data: [],       error: null })
    mockInsert = vi.fn().mockResolvedValue({ data: null,     error: null })

    const { createSupabaseMock } = await import('../helpers/supabase-mock')
    const { client } = createSupabaseMock({ single: mockSingle, limit: mockLimit, insert: mockInsert })

    const supabaseMod = await import('@/lib/supabase/server')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(supabaseMod.createClient).mockResolvedValue(client as unknown as any)

    const mod = await import('@/app/api/su-kien/dang-ky/route')
    POST = mod.POST
  })

  // ── Validation input ──────────────────────────────────────
  it('400 khi thiếu suKienId', async () => {
    const res = await POST(makeRequest({ hoTen: 'A', soDienThoai: '0901' }))
    expect(res.status).toBe(400)
    const json = await res.json() as { success: boolean }
    expect(json.success).toBe(false)
  })

  it('400 khi thiếu hoTen', async () => {
    const res = await POST(makeRequest({ suKienId: 'sk-001', soDienThoai: '0901234567' }))
    expect(res.status).toBe(400)
  })

  it('400 khi thiếu soDienThoai', async () => {
    const res = await POST(makeRequest({ suKienId: 'sk-001', hoTen: 'Nguyễn A' }))
    expect(res.status).toBe(400)
  })

  // ── Business rules ────────────────────────────────────────
  it('404 khi sự kiện không tồn tại', async () => {
    mockSingle.mockResolvedValueOnce({ data: null, error: null })
    const res = await POST(makeRequest({ ...VALID_BODY, suKienId: 'sk-999' }))
    expect(res.status).toBe(404)
  })

  it('400 khi sự kiện không có đăng ký', async () => {
    mockSingle.mockResolvedValueOnce({ data: { ...VALID_SK, can_dang_ky: false }, error: null })
    const res = await POST(makeRequest(VALID_BODY))
    expect(res.status).toBe(400)
    const json = await res.json() as { message: string }
    expect(json.message).toContain('không cần đăng ký')
  })

  it('400 khi sự kiện đã kết thúc', async () => {
    mockSingle.mockResolvedValueOnce({ data: { ...VALID_SK, trang_thai: 'DA_KET_THUC' }, error: null })
    const res = await POST(makeRequest(VALID_BODY))
    expect(res.status).toBe(400)
  })

  it('400 khi hết hạn đăng ký', async () => {
    mockSingle.mockResolvedValueOnce({
      data: { ...VALID_SK, han_dang_ky: '2020-01-01T00:00:00.000Z' },
      error: null,
    })
    const res = await POST(makeRequest(VALID_BODY))
    expect(res.status).toBe(400)
    const json = await res.json() as { message: string }
    expect(json.message).toContain('hạn đăng ký')
  })

  it('409 khi SĐT đã đăng ký rồi', async () => {
    mockLimit.mockResolvedValueOnce({ data: [{ id: 'dk-001' }], error: null })
    const res = await POST(makeRequest(VALID_BODY))
    expect(res.status).toBe(409)
    const json = await res.json() as { message: string }
    expect(json.message).toContain('đã đăng ký')
  })

  it('200 và success=true khi hợp lệ', async () => {
    const res = await POST(makeRequest(VALID_BODY))
    expect(res.status).toBe(200)
    const json = await res.json() as { success: boolean; message: string }
    expect(json.success).toBe(true)
    expect(json.message).toContain('thành công')
  })
})
