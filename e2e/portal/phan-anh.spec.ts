import { test, expect } from '@playwright/test'

// ═══════════════════════════════════════════════════════════════
// Form Phản ánh hiện trường
// ═══════════════════════════════════════════════════════════════
test.describe('Form Phản ánh', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/phan-anh/tao')
  })

  // ── Render ────────────────────────────────────────────────
  test('hiển thị form phản ánh', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /phản ánh/i })).toBeVisible()
  })

  test('có trường tiêu đề / nội dung', async ({ page }) => {
    // Input hoặc textarea cho tiêu đề
    const tieuDeField = page.getByPlaceholder(/tiêu đề|tên phản ánh/i)
      .or(page.getByLabel(/tiêu đề/i))
    await expect(tieuDeField.first()).toBeVisible()
  })

  // ── Validation ────────────────────────────────────────────
  test('submit form rỗng → hiện thông báo lỗi validation', async ({ page }) => {
    const submitBtn = page.getByRole('button', { name: /gửi phản ánh|gửi/i })
    await submitBtn.click()

    // Phải xuất hiện ít nhất 1 thông báo lỗi
    const errors = page.locator('[class*="error"], [class*="text-red"], p.text-red-')
    const count  = await errors.count()
    expect(count).toBeGreaterThan(0)
  })

  // ── Điều hướng ───────────────────────────────────────────
  test('có link quay lại danh sách phản ánh', async ({ page }) => {
    const backLink = page.getByRole('link', { name: /quay lại|phản ánh/i })
    await expect(backLink.first()).toBeVisible()
  })
})

// ═══════════════════════════════════════════════════════════════
// Danh sách Phản ánh
// ═══════════════════════════════════════════════════════════════
test.describe('Danh sách Phản ánh', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/phan-anh')
  })

  test('hiển thị tiêu đề trang phản ánh', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /phản ánh/i })).toBeVisible()
  })

  test('có nút tạo phản ánh mới', async ({ page }) => {
    const createBtn = page.getByRole('link', { name: /tạo.*phản ánh|gửi.*phản ánh|phản ánh mới/i })
      .or(page.getByRole('link', { name: /\+/i }))
    const count = await createBtn.count()
    // Có thể là button hoặc link
    if (count === 0) {
      const btn = page.getByRole('button', { name: /tạo|gửi|thêm/i })
      await expect(btn.first()).toBeVisible()
    } else {
      await expect(createBtn.first()).toBeVisible()
    }
  })
})
