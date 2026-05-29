import { vi } from 'vitest'

/**
 * Tạo Supabase chainable mock dùng Proxy.
 * Bất kỳ method chain nào đều trả về chính mock,
 * các method terminal (single, maybeSingle, limit) được override riêng.
 */
export function createSupabaseMock(overrides: {
  single?:      ReturnType<typeof vi.fn>
  maybeSingle?: ReturnType<typeof vi.fn>
  limit?:       ReturnType<typeof vi.fn>
  insert?:      ReturnType<typeof vi.fn>
  update?:      ReturnType<typeof vi.fn>
  upsert?:      ReturnType<typeof vi.fn>
}) {
  const {
    single      = vi.fn().mockResolvedValue({ data: null,  error: null }),
    maybeSingle = vi.fn().mockResolvedValue({ data: null,  error: null }),
    limit       = vi.fn().mockResolvedValue({ data: [],    error: null }),
    insert      = vi.fn().mockResolvedValue({ data: null,  error: null }),
    update      = vi.fn(),
    upsert      = vi.fn().mockResolvedValue({ data: null,  error: null }),
  } = overrides

  // update().eq() → trả về resolved
  update.mockReturnValue({
    eq: vi.fn().mockResolvedValue({ data: null, error: null }),
  })

  // Proxy handler: method chain trả về chính nó
  const terminals = { single, maybeSingle, limit, insert, update, upsert }

  function makeProxy(): object {
    return new Proxy({} as Record<string, unknown>, {
      get(_t, prop: string) {
        if (prop in terminals) return terminals[prop as keyof typeof terminals]
        return vi.fn(() => makeProxy())
      },
    })
  }

  const client = {
    from: vi.fn(() => makeProxy()),
  }

  return { client, single, maybeSingle, limit, insert, update, upsert }
}
