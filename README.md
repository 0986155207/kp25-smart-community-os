# KP25 SMART COMMUNITY OS

> Hệ điều hành số cộng đồng — Khu phố 25, Phường Long Trường, TP.HCM

## Tổng quan

KP25 Smart Community OS là nền tảng chuyển đổi số toàn diện phục vụ người dân và cán bộ Khu phố 25. Vận hành 24/7, AI-first, mobile-first.

## Kiến trúc

```
apps/
├── web/          # Portal người dân (Next.js 15) — cổng chính
├── admin/        # Dashboard cán bộ (Next.js 15) — quản trị

packages/
├── types/        # Shared TypeScript types
├── config/       # Shared config (Tailwind, TSConfig)

supabase/
├── migrations/   # SQL schema & migrations

infrastructure/
├── nginx/        # Reverse proxy config
├── docker/       # Docker utilities
```

## Tech Stack

| Layer | Công nghệ |
|---|---|
| Frontend | Next.js 15, TypeScript, TailwindCSS, shadcn/ui |
| AI | Google Gemini 2.5 Flash |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (QR + OTP + Email) |
| Realtime | Supabase Realtime |
| Storage | Supabase Storage |
| Deploy | Vercel (web/admin) |
| Cache | Redis |

## Bắt đầu nhanh

### 1. Clone & cài đặt

```bash
git clone <repo-url>
cd KP25\ SMART\ COMMUNITY\ OS
npm install
```

### 2. Cấu hình môi trường

```bash
cp .env.example .env
# Điền các giá trị vào .env
```

**Các biến bắt buộc:**

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
GEMINI_API_KEY=your-gemini-key
```

### 3. Khởi tạo database

Vào Supabase Dashboard → SQL Editor → chạy file:
```
supabase/migrations/001_initial_schema.sql
```

### 4. Chạy development

```bash
# Chạy tất cả apps
npm run dev

# Hoặc chạy từng app
cd apps/web && npm run dev    # http://localhost:3000
cd apps/admin && npm run dev  # http://localhost:3001
```

## Lấy API Keys

### Gemini API
1. Truy cập: https://aistudio.google.com
2. Tạo API key mới
3. Điền vào `.env`: `GEMINI_API_KEY=...`

### Supabase
1. Truy cập: https://supabase.com
2. Tạo project mới
3. Vào Settings → API → lấy URL và anon key
4. Điền vào `.env`

## Deploy lên Vercel

### Portal (apps/web)
```bash
# Cài Vercel CLI
npm i -g vercel

cd apps/web
vercel --prod
```

### Admin (apps/admin)
```bash
cd apps/admin
vercel --prod
```

## Modules

| Module | Mô tả | Trạng thái |
|---|---|---|
| Portal khu phố | Trang chủ, thông báo, thống kê | ✅ |
| AI Chatbot | Hỏi đáp 24/7 Gemini 2.5 Flash | ✅ |
| Phản ánh hiện trường | Upload ảnh, GPS, theo dõi | ✅ |
| Dashboard cán bộ | KPI, stats, quản lý | ✅ |
| Dân cư / Hộ dân | CRUD hộ dân, nhân khẩu | 🔄 |
| GIS Map | Bản đồ khu phố LeafletJS | 🔄 |
| QR "Một chạm" | QR code hộ dân | 🔄 |
| Thông báo push | SMS, Zalo, Email | 🔄 |
| KPI & Workflow | Giao việc, SLA | 🔄 |

## Cấu trúc Database

Xem chi tiết: `supabase/migrations/001_initial_schema.sql`

**Bảng chính:**
- `profiles` — Người dùng (liên kết Supabase Auth)
- `ho_dan` — Hộ dân
- `nhan_khau` — Nhân khẩu
- `phan_anh` — Phản ánh hiện trường
- `thong_bao` — Thông báo
- `chat_sessions` — Phiên chat AI
- `chat_messages` — Tin nhắn chat
- `audit_logs` — Nhật ký hệ thống

## Liên hệ

Khu phố 25, Phường Long Trường, TP.HCM
