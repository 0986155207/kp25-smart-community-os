# Rà soát bảo mật Supabase — KP25 SMART COMMUNITY OS

Tài liệu xử lý các cảnh báo của **Supabase Security/Performance Advisor**
(Dashboard → Advisors). Cập nhật khi có thay đổi DDL.

---

## 1. Function Search Path Mutable (67 warnings) — ĐÃ XỬ LÝ

**Mức độ:** Cảnh báo bảo mật (cao với hàm `SECURITY DEFINER`).

**Nguyên nhân:** hàm trong schema `public` không cố định `search_path`
→ nguy cơ "search_path hijacking".

**Khắc phục:** chạy migration **`045_fix_function_search_path.sql`** — quét và gắn
`SET search_path = public, pg_temp` cho mọi hàm do dự án tạo (bỏ qua hàm extension).

> Các hàm tạo từ migration 044 trở đi đã tự có `SET search_path` ngay khi định nghĩa.
> Quy ước: **mọi hàm mới phải khai báo** `... LANGUAGE ... SET search_path = public`.

Sau khi chạy 045, vào Advisors → **Rerun linter** → nhóm cảnh báo này về 0.

---

## 2. Các mục cần thao tác trên Dashboard (không sửa bằng SQL)

Thường nằm trong tab **Info / Warnings** còn lại:

### a) Leaked Password Protection (khuyến nghị bật)
Authentication → Providers → Email → bật **"Leaked password protection"**
(đối chiếu HaveIBeenPwned, chặn mật khẩu đã lộ).

### b) Multi-Factor Authentication (khuyến nghị)
Authentication → bật thêm phương thức MFA (TOTP) cho tài khoản cán bộ/quản trị.

### c) Auth OTP / Session
- OTP expiry nên ≤ 1 giờ.
- Bật **"Confirm email"** nếu dùng đăng ký email.

> Các tài khoản đăng nhập hệ thống là **cán bộ** (số lượng nhỏ) → nên bật MFA.

---

## 3. Extension in Public (nếu có cảnh báo)

`uuid-ossp`, `pg_trgm`, `vector` đang cài trong schema `public`.
Supabase khuyến nghị chuyển sang schema `extensions`. **Rủi ro cao** vì nhiều
hàm/migration tham chiếu trực tiếp — **không tự ý đổi** trên production.
Nếu cần, lên kế hoạch riêng + kiểm thử trên nhánh trước. Tạm thời chấp nhận
(đây là cấu hình mặc định phổ biến).

---

## 4. RLS (Row Level Security)

- Tab **Errors = 0** → không có bảng public nào thiếu RLS nghiêm trọng.
- App admin dùng **service role** (bypass RLS) cho nghiệp vụ; RLS là lớp bảo vệ
  cho truy cập trực tiếp từ client (anon/authenticated).
- Khi thêm bảng mới: **luôn** `ENABLE ROW LEVEL SECURITY` + tạo policy phù hợp,
  rồi chạy lại Advisor để kiểm tra.

---

## 5. Performance Advisor (tham khảo)

Các gợi ý hiệu năng thường gặp + hướng xử lý:
- **Unindexed foreign keys** → thêm index cho cột khóa ngoại hay lọc/join
  (migration 044 đã thêm index cho mọi `don_vi_id`).
- **Unused index** → cân nhắc bỏ index không dùng (chỉ khi chắc chắn).
- **Auth RLS InitPlan** → bọc `auth.uid()` bằng `(SELECT auth.uid())` trong policy
  để Postgres cache, tránh gọi lại mỗi dòng (tối ưu khi bảng lớn).

---

## Quy trình chuẩn sau mỗi thay đổi DDL

1. Chạy migration trong SQL Editor.
2. Advisors → **Rerun linter**.
3. Xử lý Errors trước, rồi Warnings, cuối cùng Info.
4. Hàm mới: nhớ `SET search_path = public`. Bảng mới: nhớ bật RLS + policy.
