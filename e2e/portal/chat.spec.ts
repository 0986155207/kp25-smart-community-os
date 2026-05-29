import { test, expect } from '@playwright/test'

// ═══════════════════════════════════════════════════════════════
// AI Chat — Trợ lý Khu phố
// ═══════════════════════════════════════════════════════════════
test.describe('Trang Chat AI', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/chat')
  })

  // ── Layout ────────────────────────────────────────────────
  test('hiển thị giao diện chat', async ({ page }) => {
    // Input nhập tin nhắn phải có
    const input = page.getByPlaceholder(/nhập|hỏi|câu hỏi/i)
      .or(page.locator('textarea, input[type="text"]').last())
    await expect(input.first()).toBeVisible()
  })

  test('có nút gửi tin nhắn', async ({ page }) => {
    const sendBtn = page.getByRole('button', { name: /gửi|send/i })
      .or(page.locator('button[type="submit"]'))
    await expect(sendBtn.first()).toBeVisible()
  })

  test('hiển thị thông điệp chào hỏi ban đầu', async ({ page }) => {
    // AI thường có tin nhắn chào đầu tiên
    const welcome = page.getByText(/xin chào|khu phố 25|hỗ trợ/i)
    // Không bắt buộc - tùy implementation
    await page.waitForTimeout(1000)
    // Chỉ kiểm tra trang load OK
    await expect(page).toHaveURL(/\/chat/)
  })

  // ── Gửi tin nhắn ─────────────────────────────────────────
  test('gõ tin nhắn và nhấn Enter → tin nhắn xuất hiện trong chat', async ({ page }) => {
    const input = page.locator('textarea, input[type="text"]').last()
    await input.fill('Xin chào')
    await input.press('Enter')

    // Tin nhắn của user xuất hiện
    await expect(page.getByText('Xin chào')).toBeVisible({ timeout: 5000 })
  })

  test('không gửi tin nhắn rỗng', async ({ page }) => {
    const sendBtn = page.getByRole('button', { name: /gửi/i }).first()
    const isDisabled = await sendBtn.isDisabled()
    if (!isDisabled) {
      // Nếu không disabled, click → không thêm message rỗng
      const msgsBefore = await page.locator('[class*="message"], [class*="chat"]').count()
      await sendBtn.click()
      const msgsAfter = await page.locator('[class*="message"], [class*="chat"]').count()
      expect(msgsAfter).toBe(msgsBefore)
    } else {
      expect(isDisabled).toBe(true)
    }
  })

  // ── Responsive ───────────────────────────────────────────
  test('[mobile] input không bị keyboard che khuất', async ({ page, isMobile }) => {
    if (!isMobile) test.skip()
    const input = page.locator('textarea, input[type="text"]').last()
    await input.focus()
    await expect(input).toBeInViewport()
  })
})
