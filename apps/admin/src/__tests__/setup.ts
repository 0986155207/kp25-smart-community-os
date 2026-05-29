import '@testing-library/jest-dom'
import { vi, beforeAll, afterAll } from 'vitest'

vi.mock('next/navigation', () => ({
  useRouter:       () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
  usePathname:     () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient:        vi.fn(),
  createServiceClient: vi.fn(),
}))

vi.mock('framer-motion', () => ({
  motion:          { div: vi.fn(({ children }: { children: unknown }) => children) },
  AnimatePresence: vi.fn(({ children }: { children: unknown }) => children),
}))

const originalError = console.error
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    if (typeof args[0] === 'string' && args[0].includes('Warning:')) return
    originalError(...args)
  }
})
afterAll(() => { console.error = originalError })
