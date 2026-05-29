import { test, expect, type Page } from '@playwright/test'

// ─── Helper: đăng nhập admin test ────────────────────────────
async function loginAdmin(page: Page) {
  const testEmail = process.env['TEST_ADMIN_EMAIL'] ?? 'taip2704@gmail.com'
  const testPass  = process.env['TEST_ADMIN_PASSWORD'] ?? ''

  if (!testPass) {
    test.skip()
    return
  }

  await page.goto('/dang-nhap')
  await page.getByLabel(/email/i).or(page.getByPlaceholder(/email/i)).fill(testEmail)
  await page.getByLabel(/mật khẩu/i).or(page.getByPlaceholder(/mật khẩu/i)).fill(testPass)
  await page.getByRole('button', { name: /đăng nhập/i }).click()
  await expect(page).toHaveURL(/dashboard/, { timeout: 15000 })
}

// ═══════════════════════════════════════════════════════════════
// Admin Dashboard — Không cần auth (public pages)
// ═══════════════════════════════════════════════════════════════
test.describe('Admin — Trang đăng nhập', () => {

  test('trang chủ admin redirect về /dang-nhap', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/dang-nhap|dashboard/)
  })

  test('trang /dang-nhap có meta title', async ({ page }) => {
    await page.goto('/dang-nhap')
    await expect(page).toHaveTitle(/KP25|Admin|Đăng nhập/i)
  })

  test('trang /dang-nhap load trong 3 giây', async ({ page }) => {
    const start = Date.now()
    await page.goto('/dang-nhap')
    const elapsed = Date.now() - start
    expect(elapsed).toBeLessThan(3000)
  })
})

// ═══════════════════════════════════════════════════════════════
// Admin Dashboard — Sau đăng nhập (cần TEST_ADMIN_PASSWORD)
// ═══════════════════════════════════════════════════════════════
test.describe('Admin Dashboard (sau đăng nhập)', () => {

  test.beforeEach(async ({ page }) => {
    await loginAdmin(page)
  })

  test('hiển thị sidebar navigation', async ({ page }) => {
    await expect(page.locator('nav, aside').first()).toBeVisible()
  })

  test('có menu item "Dân cư"', async ({ page }) => {
    await expect(page.getByRole('link', { name: /dân cư/i })).toBeVisible()
  })

  test('có menu item "Phản ánh"', async ({ page }) => {
    await expect(page.getByRole('link', { name: /phản ánh/i })).toBeVisible()
  })

  test('có menu item "Sự kiện"', async ({ page }) => {
    await expect(page.getByRole('link', { name: /sự kiện/i })).toBeVisible()
  })

  test('hiển thị thông tin người dùng hiện tại', async ({ page }) => {
    // Avatar hoặc tên người dùng
    const userInfo = page.locator('[class*="avatar"], [class*="user"]')
      .or(page.getByText(/Phan Tấn Tài|admin/i))
    await expect(userInfo.first()).toBeVisible()
  })

  // ── Dashboard metrics ────────────────────────────────────
  test('trang dashboard hiển thị số liệu thống kê', async ({ page }) => {
    await page.goto('/dashboard')
    // Tìm các card số liệu (thường có format số)
    const numbers = page.locator('[class*="stat"], [class*="metric"], [class*="count"]')
      .or(page.locator('div').filter({ hasText: /^\d+$/ }))
    await expect(numbers.first()).toBeVisible({ timeout: 8000 })
  })

  // ── Phản ánh module ───────────────────────────────────────
  test('trang /dashboard/phan-anh load OK', async ({ page }) => {
    await page.goto('/dashboard/phan-anh')
    await expect(page).not.toHaveURL(/404|error/)
    await expect(page.getByRole('heading', { name: /phản ánh/i })).toBeVisible({ timeout: 8000 })
  })

  // ── Dân cư module ─────────────────────────────────────────
  test('trang /dashboard/dan-cu/ho-dan load OK', async ({ page }) => {
    await page.goto('/dashboard/dan-cu/ho-dan')
    await expect(page).not.toHaveURL(/404|error/)
  })

  // ── RAG module ────────────────────────────────────────────
  test('trang /dashboard/ai/rag load OK', async ({ page }) => {
    await page.goto('/dashboard/ai/rag')
    await expect(page.getByText(/nhúng văn bản/i)).toBeVisible({ timeout: 8000 })
  })
})
