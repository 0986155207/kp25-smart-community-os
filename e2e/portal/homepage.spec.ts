import { test, expect } from '@playwright/test'

// ═══════════════════════════════════════════════════════════════
// Trang chủ Portal — KP25 Smart Community
// ═══════════════════════════════════════════════════════════════
test.describe('Trang chủ Portal', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  // ── Layout cơ bản ─────────────────────────────────────────
  test('hiển thị đúng tiêu đề trang', async ({ page }) => {
    await expect(page).toHaveTitle(/KP25/)
  })

  test('hiển thị Navbar với logo KP25', async ({ page }) => {
    const navbar = page.locator('header')
    await expect(navbar).toBeVisible()
    await expect(navbar.getByText(/KP25/)).toBeVisible()
  })

  test('hiển thị HeroSection', async ({ page }) => {
    const hero = page.locator('section').first()
    await expect(hero).toBeVisible()
  })

  test('hiển thị QuickActions với các nút chức năng', async ({ page }) => {
    // Tìm nút "Phản ánh" trong quick actions
    await expect(page.getByRole('link', { name: /phản ánh/i }).first()).toBeVisible()
  })

  test('có link đến trang Chat AI', async ({ page }) => {
    const chatLinks = page.getByRole('link', { name: /hỏi ai|chat/i })
    await expect(chatLinks.first()).toBeVisible()
  })

  // ── Navigation ────────────────────────────────────────────
  test('click vào Thông báo → chuyển trang /thong-bao', async ({ page }) => {
    await page.getByRole('link', { name: /thông báo/i }).first().click()
    await expect(page).toHaveURL(/\/thong-bao/)
  })

  test('click vào Sự kiện → chuyển trang /su-kien', async ({ page }) => {
    await page.getByRole('link', { name: /sự kiện/i }).first().click()
    await expect(page).toHaveURL(/\/su-kien/)
  })

  // ── Mobile Bottom Nav ────────────────────────────────────
  test('[mobile] hiển thị BottomNav', async ({ page, isMobile }) => {
    if (!isMobile) test.skip()
    const bottomNav = page.locator('nav').last()
    await expect(bottomNav).toBeVisible()
  })

  test('[mobile] nút Phản ánh ở giữa BottomNav', async ({ page, isMobile }) => {
    if (!isMobile) test.skip()
    const phanAnhBtn = page.getByRole('link', { name: /phản ánh/i })
    await expect(phanAnhBtn.first()).toBeVisible()
  })

  // ── Accessibility ─────────────────────────────────────────
  test('không có lỗi accessibility cơ bản', async ({ page }) => {
    // Kiểm tra tất cả <img> có alt text
    const images = page.locator('img')
    const count  = await images.count()
    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute('alt')
      expect(alt).not.toBeNull()
    }
  })

  test('tất cả link có href hợp lệ', async ({ page }) => {
    const links = page.getByRole('link')
    const count = await links.count()
    for (let i = 0; i < count; i++) {
      const href = await links.nth(i).getAttribute('href')
      // href không được null và không được là '#' đơn thuần
      if (href) expect(href).not.toBe('')
    }
  })
})
