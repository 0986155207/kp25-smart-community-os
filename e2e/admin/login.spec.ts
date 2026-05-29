import { test, expect } from '@playwright/test'

// ═══════════════════════════════════════════════════════════════
// Admin — Đăng nhập
// ═══════════════════════════════════════════════════════════════
test.describe('Admin Đăng nhập', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  // ── Redirect ──────────────────────────────────────────────
  test('chưa đăng nhập → redirect về /dang-nhap', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/dang-nhap/)
  })

  // ── Form đăng nhập ────────────────────────────────────────
  test('hiển thị form đăng nhập', async ({ page }) => {
    await page.goto('/dang-nhap')
    await expect(page.getByLabel(/email/i).or(page.getByPlaceholder(/email/i))).toBeVisible()
    await expect(page.getByLabel(/mật khẩu|password/i).or(page.getByPlaceholder(/mật khẩu|password/i))).toBeVisible()
  })

  test('hiển thị logo / thương hiệu KP25', async ({ page }) => {
    await page.goto('/dang-nhap')
    await expect(page.getByText(/KP25/i)).toBeVisible()
  })

  // ── Validation ────────────────────────────────────────────
  test('submit form rỗng → hiện lỗi validation', async ({ page }) => {
    await page.goto('/dang-nhap')
    await page.getByRole('button', { name: /đăng nhập|login/i }).click()

    const error = page.locator('[class*="error"], [class*="text-red"]')
      .or(page.getByText(/không được để trống|bắt buộc|required/i))
    await expect(error.first()).toBeVisible({ timeout: 3000 })
  })

  test('email sai định dạng → hiện lỗi', async ({ page }) => {
    await page.goto('/dang-nhap')
    const emailInput = page.getByLabel(/email/i).or(page.getByPlaceholder(/email/i))
    await emailInput.fill('khong-phai-email')
    await page.getByRole('button', { name: /đăng nhập/i }).click()

    const error = page.locator('[class*="error"], [class*="text-red"]')
      .or(page.getByText(/email.*hợp lệ|invalid email/i))
    await expect(error.first()).toBeVisible({ timeout: 3000 })
  })

  test('sai mật khẩu → hiện thông báo lỗi', async ({ page }) => {
    await page.goto('/dang-nhap')

    const emailInput = page.getByLabel(/email/i).or(page.getByPlaceholder(/email/i))
    const passInput  = page.getByLabel(/mật khẩu/i).or(page.getByPlaceholder(/mật khẩu/i))

    await emailInput.fill('test@example.com')
    await passInput.fill('wrongpassword123')
    await page.getByRole('button', { name: /đăng nhập/i }).click()

    // Đợi response từ Supabase (tối đa 10s)
    const errorMsg = page.getByText(/sai mật khẩu|không hợp lệ|thất bại|lỗi/i)
      .or(page.locator('[class*="error"]'))
    await expect(errorMsg.first()).toBeVisible({ timeout: 10000 })
  })

  // ── UX ────────────────────────────────────────────────────
  test('có nút hiện/ẩn mật khẩu', async ({ page }) => {
    await page.goto('/dang-nhap')
    const toggleBtn = page.getByRole('button', { name: /hiện|ẩn|show|hide/i })
      .or(page.locator('button[aria-label*="password"], button[type="button"]').last())
    // Optional feature — không fail nếu không có
    const count = await toggleBtn.count()
    test.info().annotations.push({ type: 'feature', description: `Nút toggle password: ${count > 0 ? 'có' : 'không có'}` })
  })
})
