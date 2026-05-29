import '@testing-library/jest-dom'
import { vi, beforeAll, afterAll } from 'vitest'

// ─── Mock Next.js router ──────────────────────────────────────
vi.mock('next/navigation', () => ({
  useRouter:       () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
  usePathname:     () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// ─── Mock Next.js image & link ────────────────────────────────
vi.mock('next/image', () => ({ default: vi.fn(() => null) }))
vi.mock('next/link',  () => ({ default: vi.fn(({ children }: { children: unknown }) => children) }))

// ─── Mock Supabase client ─────────────────────────────────────
vi.mock('@/lib/supabase/client', () => ({
  createBrowserClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq:     vi.fn().mockReturnThis(),
      is:     vi.fn().mockReturnThis(),
      order:  vi.fn().mockReturnThis(),
      limit:  vi.fn().mockResolvedValue({ data: [], error: null }),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
    auth: {
      getUser:            vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signInWithPassword: vi.fn().mockResolvedValue({ data: null, error: null }),
      signOut:            vi.fn().mockResolvedValue({ error: null }),
    },
  })),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient:        vi.fn(),
  createServiceClient: vi.fn(),
}))

// ─── Mock framer-motion ───────────────────────────────────────
vi.mock('framer-motion', () => ({
  motion:           { div: vi.fn(({ children }: { children: unknown }) => children) },
  AnimatePresence:  vi.fn(({ children }: { children: unknown }) => children),
}))

// ─── Suppress console.error Warning ──────────────────────────
const originalError = console.error
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    if (typeof args[0] === 'string' && args[0].includes('Warning:')) return
    originalError(...args)
  }
})
afterAll(() => { console.error = originalError })
