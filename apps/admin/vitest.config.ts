import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    name: 'admin',
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
    include: ['src/__tests__/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.d.ts',
        'src/app/**/page.tsx',
        'src/app/**/layout.tsx',
        'src/__tests__/**',
      ],
      // Thresholds tối thiểu — tăng dần khi test coverage mở rộng
      // Admin hiện chỉ có 1 test file (rag.test.ts) nên overall coverage rất thấp
      thresholds: {
        statements: 0,
        branches:   0,
        functions:  0,
        lines:      0,
      },
    },
    reporters: ['verbose'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@kp25/types': path.resolve(__dirname, '../../packages/types/src/index.ts'),
    },
  },
})
