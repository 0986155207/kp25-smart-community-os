/**
 * KP25 Admin — Tạo toàn bộ PWA icons từ logo.png gốc
 * Chạy: node apps/admin/scripts/generate-icons.mjs
 */

import sharp from 'sharp'
import { mkdirSync, existsSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const LOGO = join(__dirname, '../../../logo.png')        // C:\Tai\KP25 SMART COMMUNITY OS\logo.png
const OUT  = join(__dirname, '../public/icons')

if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true })

// ── Tạo icon từ logo gốc, nền trắng ──────────────────────────
async function makeIcon(size, padding = 0) {
  const inner = size - padding * 2
  // Resize logo vừa khung inner, giữ tỷ lệ, nền trắng
  const logoResized = await sharp(LOGO)
    .resize(inner, inner, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .flatten({ background: '#ffffff' })
    .toBuffer()

  if (padding === 0) return logoResized

  // Đặt logo vào canvas trắng size×size với padding
  return sharp({
    create: { width: size, height: size, channels: 3, background: { r: 255, g: 255, b: 255 } },
  })
    .composite([{ input: logoResized, gravity: 'center' }])
    .png()
    .toBuffer()
}

// ── Badge: logo nhỏ trên nền đỏ đô, tròn ─────────────────────
async function makeBadge(size) {
  const pad    = Math.round(size * 0.08)
  const inner  = size - pad * 2
  const radius = size / 2

  const logoResized = await sharp(LOGO)
    .resize(inner, inner, { fit: 'contain', background: { r: 139, g: 26, b: 26, alpha: 1 } })
    .flatten({ background: '#8B1A1A' })
    .toBuffer()

  // Tạo nền tròn đỏ đô
  const circleMask = Buffer.from(
    `<svg><circle cx="${size/2}" cy="${size/2}" r="${radius}" fill="white"/></svg>`
  )

  return sharp({
    create: { width: size, height: size, channels: 4, background: { r: 139, g: 26, b: 26, alpha: 1 } },
  })
    .composite([
      { input: circleMask, blend: 'dest-in' },
      { input: logoResized, gravity: 'center' },
    ])
    .png()
    .toBuffer()
}

// ── Apple touch icon: logo + viền bo góc (rounded rect) ──────
async function makeAppleIcon(size) {
  const r   = Math.round(size * 0.18)   // corner-radius iOS style
  const pad = Math.round(size * 0.06)

  const logoResized = await sharp(LOGO)
    .resize(size - pad * 2, size - pad * 2, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .flatten({ background: '#ffffff' })
    .toBuffer()

  // Rounded rect mask
  const mask = Buffer.from(
    `<svg width="${size}" height="${size}">
       <rect width="${size}" height="${size}" rx="${r}" ry="${r}" fill="white"/>
     </svg>`
  )

  return sharp({
    create: { width: size, height: size, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 0 } },
  })
    .composite([
      { input: mask, blend: 'dest-over' },
      { input: logoResized, gravity: 'center' },
    ])
    .flatten({ background: '#ffffff' })
    .png()
    .toBuffer()
}

// ── Danh sách tasks ───────────────────────────────────────────
const tasks = [
  { name: 'icon-32x32.png',         fn: () => makeIcon(32)   },
  { name: 'icon-72x72.png',         fn: () => makeIcon(72)   },
  { name: 'icon-96x96.png',         fn: () => makeIcon(96)   },
  { name: 'icon-128x128.png',       fn: () => makeIcon(128)  },
  { name: 'icon-144x144.png',       fn: () => makeIcon(144)  },
  { name: 'icon-152x152.png',       fn: () => makeIcon(152)  },
  { name: 'icon-192x192.png',       fn: () => makeIcon(192)  },
  { name: 'icon-384x384.png',       fn: () => makeIcon(384)  },
  { name: 'icon-512x512.png',       fn: () => makeIcon(512)  },
  { name: 'apple-touch-icon.png',   fn: () => makeAppleIcon(180) },
  { name: 'badge-72.png',           fn: () => makeBadge(72)  },
  // Shortcut icons: dùng logo + padding nhỏ
  { name: 'shortcut-phan-anh.png',  fn: () => makeIcon(96, 6) },
  { name: 'shortcut-ban-do.png',    fn: () => makeIcon(96, 6) },
  { name: 'shortcut-su-kien.png',   fn: () => makeIcon(96, 6) },
]

// ── Generate ──────────────────────────────────────────────────
console.log('⚙️  Generating KP25 Admin PWA icons từ logo.png...\n')

for (const { name, fn } of tasks) {
  const buf = await fn()
  await sharp(buf).png().toFile(join(OUT, name))
  console.log(`  ✓  ${name}`)
}

// safari-pinned-tab.svg — dạng đơn sắc (Safari tự tô màu qua meta)
const safariSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="48" fill="black"/>
  <text x="50" y="44" font-family="Arial,sans-serif" font-size="22" font-weight="900"
    text-anchor="middle" dominant-baseline="middle" fill="white">LONG</text>
  <text x="50" y="66" font-family="Arial,sans-serif" font-size="22" font-weight="900"
    text-anchor="middle" dominant-baseline="middle" fill="white">TRƯỜNG</text>
</svg>`

writeFileSync(join(OUT, 'safari-pinned-tab.svg'), safariSvg)
console.log('  ✓  safari-pinned-tab.svg')

console.log(`\n✅  Xong! Tất cả ${tasks.length + 1} icons đã được lưu vào:\n    apps/admin/public/icons/\n`)
