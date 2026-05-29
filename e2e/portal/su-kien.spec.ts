import { test, expect } from '@playwright/test'

// ═══════════════════════════════════════════════════════════════
// Trang Sự kiện Portal
// ═══════════════════════════════════════════════════════════════
test.describe('Trang Sự kiện', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/su-kien')
  })

  // ── Render cơ bản ─────────────────────────────────────────
  test('hiển thị tiêu đề "Lịch sự kiện"', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /lịch sự kiện/i })).toBeVisible()
  })

  test('hiển thị thanh lọc theo loại sự kiện', async ({ page }) => {
    await expect(page.getByRole('link', { name: /tất cả/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /văn hóa/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /thể thao/i })).toBeVisible()
  })

  test('bộ lọc "Tất cả" active mặc định', async ({ page }) => {
    const btn = page.getByRole('link', { name: /tất cả/i })
    // Kiểm tra class active (bg-[#1E3A5F])
    await expect(btn).toHaveClass(/bg-\[#1E3A5F\]/)
  })

  // ── Lọc theo loại ────────────────────────────────────────
  test('click lọc "Văn hóa" → URL có query loai=VAN_HOA', async ({ page }) => {
    await page.getByRole('link', { name: /văn hóa/i }).click()
    await expect(page).toHaveURL(/loai=VAN_HOA/)
  })

  test('click lọc "Thể thao" → URL có query loai=THE_THAO', async ({ page }) => {
    await page.getByRole('link', { name: /thể thao/i }).click()
    await expect(page).toHaveURL(/loai=THE_THAO/)
  })

  // ── Trạng thái rỗng ───────────────────────────────────────
  test('hiển thị empty state khi không có sự kiện trong bộ lọc', async ({ page }) => {
    // Dùng URL có filter mà DB chắc chắn không có dữ liệu test
    await page.goto('/su-kien?loai=KHAC')
    // Nếu không có sự kiện → hiển thị empty state
    const emptyState = page.getByText(/chưa có sự kiện nào|không có sự kiện/i)
    // Chỉ kiểm tra nếu thực sự không có thẻ sự kiện
    const cards = page.locator('a[href^="/su-kien/"]')
    const cardCount = await cards.count()
    if (cardCount === 0) {
      await expect(emptyState).toBeVisible()
    }
  })

  // ── Chi tiết sự kiện ──────────────────────────────────────
  test('click vào thẻ sự kiện → mở trang chi tiết', async ({ page }) => {
    const cards = page.locator('a[href^="/su-kien/"]')
    const count = await cards.count()
    if (count === 0) {
      // Không có dữ liệu test → skip
      test.skip()
    }
    await cards.first().click()
    await expect(page).toHaveURL(/\/su-kien\/.+/)
  })
})

// ═══════════════════════════════════════════════════════════════
// Trang chi tiết sự kiện
// ═══════════════════════════════════════════════════════════════
test.describe('Chi tiết Sự kiện', () => {

  test('trang 404 khi ID không tồn tại', async ({ page }) => {
    const res = await page.goto('/su-kien/00000000-0000-0000-0000-000000000000')
    // Next.js notFound() → 404
    expect(res?.status()).toBe(404)
  })

  test('nút "Quay lại lịch sự kiện" hoạt động', async ({ page }) => {
    // Chỉ chạy nếu có sự kiện trong DB
    await page.goto('/su-kien')
    const cards = page.locator('a[href^="/su-kien/"]')
    if (await cards.count() === 0) test.skip()

    await cards.first().click()
    await expect(page).toHaveURL(/\/su-kien\/.+/)

    await page.getByRole('link', { name: /quay lại/i }).click()
    await expect(page).toHaveURL('/su-kien')
  })
})
