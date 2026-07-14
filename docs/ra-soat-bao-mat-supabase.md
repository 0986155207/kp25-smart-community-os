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

## 3b. RLS Policy Always True — ĐÃ XỬ LÝ (migration 047 + sync profiles)

**Vấn đề nghiêm trọng phát hiện:** migration 033 tạo nhiều policy `USING(true)` không
giới hạn vai trò → **anon đọc được toàn bộ `ho_dan` (SĐT, địa chỉ) và `nhan_khau` (CCCD)**
qua REST API (khóa anon nằm công khai trong web bundle). Đồng thời làm vô hiệu các policy
cách ly khu phố của migration 044.

**Khắc phục (migration 047 + code):**
- **Reroute portal:** các truy vấn `ho_dan` công khai (trang chủ, bản đồ, tra cứu) chuyển
  sang **service role** (server-side) chỉ trả số tổng — không lộ PII ra client.
- **Đồng bộ `can_bo → profiles`** (vai_tro + don_vi_id) trong `layCanBoHienTai` + một lần
  trong migration → RLS `la_can_bo()` / `co_quyen_don_vi()` nhận diện đúng cán bộ.
- **Khóa RLS:**
  - `ho_dan`/`nhan_khau`: chỉ cán bộ **đúng khu phố** (policy 044) + service role. Anon KHÔNG đọc được.
  - Bảng nội bộ (an sinh, cán bộ, tài liệu, push, workflow, zalo, tự khai…): chỉ `la_can_bo()` + service.
  - `audit_logs`: chỉ cán bộ đọc, service ghi.
  - Công khai có chủ đích (thông báo, sự kiện, phản ánh, đăng ký tạm trú/vắng): giữ đọc/nộp
    công khai, siết ghi cho cán bộ.

**Thứ tự triển khai (bắt buộc):** deploy **admin + web mới TRƯỚC**, rồi mới **chạy migration 047**.
Nếu chạy migration trước khi deploy, portal (đọc anon cũ) và admin (chưa sync) sẽ lỗi.

**Kết quả:** vá rò rỉ PII + cách ly đa khu phố hoạt động thật ở tầng RLS.

## 4. RLS (Row Level Security)

- Tab **Errors = 0** → không có bảng public nào thiếu RLS nghiêm trọng.
- App admin dùng **service role** (bypass RLS) cho nghiệp vụ; RLS là lớp bảo vệ
  cho truy cập trực tiếp từ client (anon/authenticated).
- Khi thêm bảng mới: **luôn** `ENABLE ROW LEVEL SECURITY` + tạo policy phù hợp,
  rồi chạy lại Advisor để kiểm tra.

---

## 5. Performance Advisor — ĐÃ XỬ LÝ (migration 046)

Chạy **`046_performance_indexes_rls.sql`**:
- **Unindexed foreign keys** → thêm index cho các FK hay join/lọc:
  `phan_anh.nguoi_gui_id`, `phan_anh_lich_su.phan_anh_id`, `nhan_khau.profile_id`,
  `workflow_assignments.phan_anh_id`/`can_bo_phu_trach_id`, `workflow_lich_su.assignment_id`,
  `profiles.don_vi_id`/`ho_id`. (Migration 044 đã index mọi `don_vi_id` của bảng dữ liệu.)
- **Auth RLS InitPlan** → bọc `auth.uid()` bằng `(SELECT auth.uid())` trong các policy
  `profiles`, `phan_anh`, `chat_sessions`, `chat_messages` → Postgres cache, không tính lại mỗi dòng.
- Tiện thể **sửa policy `profiles` đệ quy** còn sót (migration 022 chưa chạy ở DB này).

Lưu ý không xử lý (có chủ đích):
- **FK cột audit** (`created_by`/`updated_by`/`nguoi_tao_id`…) — không thêm index vì hầu như
  không lọc theo; thêm sẽ phình index + chậm ghi. Cân nhắc nếu muốn Advisor sạch tuyệt đối.
- **Unused index** → chỉ bỏ khi chắc chắn không dùng (theo dõi thêm thời gian).

---

## Quy trình chuẩn sau mỗi thay đổi DDL

1. Chạy migration trong SQL Editor.
2. Advisors → **Rerun linter**.
3. Xử lý Errors trước, rồi Warnings, cuối cùng Info.
4. Hàm mới: nhớ `SET search_path = public`. Bảng mới: nhớ bật RLS + policy.
