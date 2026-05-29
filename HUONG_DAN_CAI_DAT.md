# HƯỚNG DẪN CÀI ĐẶT KP25 SMART COMMUNITY OS

## Bước 1 — Cài đặt Node.js & npm

Tải Node.js 20+ tại: https://nodejs.org (chọn LTS)

Kiểm tra:
```
node --version   # phải >= 20.0.0
npm --version    # phải >= 10.0.0
```

## Bước 2 — Cài đặt dependencies

Mở terminal trong thư mục dự án:
```
npm install
```

## Bước 3 — Tạo Supabase project

1. Truy cập https://supabase.com → Đăng ký / Đăng nhập
2. Nhấn "New project"
3. Đặt tên: `kp25-smart-community`
4. Chọn region: Singapore (gần Việt Nam nhất)
5. Đặt Database Password (lưu lại)
6. Đợi project khởi tạo (~2 phút)

**Lấy API Keys:**
- Vào Settings → API
- Copy "Project URL" → NEXT_PUBLIC_SUPABASE_URL
- Copy "anon public" → NEXT_PUBLIC_SUPABASE_ANON_KEY
- Copy "service_role" → SUPABASE_SERVICE_ROLE_KEY

## Bước 4 — Khởi tạo Database

1. Vào Supabase Dashboard → SQL Editor
2. Nhấn "New query"
3. Copy toàn bộ nội dung file: `supabase/migrations/001_initial_schema.sql`
4. Paste vào và nhấn "Run"
5. Đợi chạy xong (khoảng 5-10 giây)

**Tạo Storage bucket:**
1. Vào Storage → New bucket
2. Tên: `kp25-uploads`
3. Tick "Public bucket"
4. Nhấn Save

## Bước 5 — Lấy Gemini API Key

1. Truy cập: https://aistudio.google.com
2. Đăng nhập tài khoản Google
3. Nhấn "Get API key" → "Create API key"
4. Copy key → GEMINI_API_KEY

## Bước 6 — Tạo file .env

Tạo file `.env` trong thư mục gốc với nội dung:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhb...
SUPABASE_SERVICE_ROLE_KEY=eyJhb...
GEMINI_API_KEY=AIzaSy...
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_ADMIN_URL=http://localhost:3001
```

## Bước 7 — Chạy ứng dụng

```
npm run dev
```

Mở trình duyệt:
- Portal dân: http://localhost:3000
- Admin cán bộ: http://localhost:3001

## Deploy lên Vercel (Online)

### Portal (apps/web):
1. Truy cập https://vercel.com → New Project
2. Import từ GitHub hoặc upload thư mục `apps/web`
3. Thêm Environment Variables (từ .env)
4. Deploy

### Admin (apps/admin):
Tương tự, nhưng thư mục `apps/admin`

## Ghi chú

- File logo: Đặt `icon-192.png` và `icon-512.png` vào `apps/web/public/`
- Logo UBND: File `logo-ubnd-longtruong.jpg` đã có sẵn
- Cần hỗ trợ: Liên hệ qua hệ thống hoặc tạo issue trên GitHub
