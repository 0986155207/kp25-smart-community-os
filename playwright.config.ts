import { defineConfig, devices } from '@playwright/test'

/**
 * KP25 Smart Community OS — Playwright E2E config
 * Docs: https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect:  { timeout: 8_000 },

  /* Chạy tests song song */
  fullyParallel: true,
  /* Báo lỗi nếu test bị để lại .only() */
  forbidOnly: !!process.env['CI'],
  /* Retry 1 lần trên CI */
  retries: process.env['CI'] ? 1 : 0,
  /* Số worker */
  workers: process.env['CI'] ? 2 : undefined,

  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ...(process.env['CI'] ? [['github'] as ['github']] : []),
  ],

  use: {
    baseURL:           process.env['PLAYWRIGHT_BASE_URL'] ?? 'http://localhost:3000',
    trace:             'on-first-retry',
    screenshot:        'only-on-failure',
    video:             'on-first-retry',
    locale:            'vi-VN',
    timezoneId:        'Asia/Ho_Chi_Minh',
    /* Giả lập mobile Vietnamese user */
    geolocation:       { latitude: 10.8, longitude: 106.81 },
  },

  projects: [
    /* Portal (web - port 3000) */
    {
      name:    'portal-desktop',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env['PLAYWRIGHT_WEB_URL'] ?? 'http://localhost:3000',
      },
      testMatch: 'e2e/portal/**/*.spec.ts',
    },
    {
      name:    'portal-mobile',
      use: {
        ...devices['Galaxy S8'],
        baseURL: process.env['PLAYWRIGHT_WEB_URL'] ?? 'http://localhost:3000',
      },
      testMatch: 'e2e/portal/**/*.spec.ts',
    },
    /* Admin (admin - port 3001) */
    {
      name:    'admin-desktop',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env['PLAYWRIGHT_ADMIN_URL'] ?? 'http://localhost:3001',
      },
      testMatch: 'e2e/admin/**/*.spec.ts',
    },
  ],

  /* Khởi động server trước khi chạy tests */
  webServer: [
    {
      command:           'npm run dev:web',
      url:               'http://localhost:3000',
      reuseExistingServer: !process.env['CI'],
      timeout:           60_000,
    },
    {
      command:           'npm run dev:admin',
      url:               'http://localhost:3001',
      reuseExistingServer: !process.env['CI'],
      timeout:           60_000,
    },
  ],
})
