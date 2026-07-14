# Hướng dẫn CHIA SẺ ứng dụng cho khu phố khác (Phường Long Trường)

Tài liệu này hướng dẫn nhân rộng KP25 SMART COMMUNITY OS cho các khu phố khác,
đảm bảo: **dữ liệu đúng khu phố**, **giao diện mang tên khu phố đó**, và **mỗi khu
phố dùng KHÓA GEMINI API RIÊNG**.

---

## 1. Mô hình khuyến nghị: "Triển khai riêng cho từng khu phố, dùng chung 1 database"

```
                    ┌──────────── Supabase (1 database chung) ────────────┐
                    │  Bảng don_vi: KP25, KP01, KP02...                   │
                    │  Dữ liệu gắn don_vi_id + RLS cách ly theo khu phố   │
                    └───────▲────────────▲────────────▲───────────────────┘
                            │            │            │
        ┌───────────────────┴──┐  ┌──────┴───────┐  ┌─┴────────────────┐
        │  KP25 (Vercel)       │  │ KP01 (Vercel)│  │ KP02 (Vercel)    │
        │  portal + admin      │  │ portal+admin │  │ portal+admin     │
        │  GEMINI_API_KEY = A  │  │ KEY = B      │  │ KEY = C          │
        │  KP_SLUG = kp25      │  │ KP_SLUG=kp01 │  │ KP_SLUG=kp02     │
        │  kp25.longtruong.net │  │ kp01...      │  │ kp02...          │
        └──────────────────────┘  └──────────────┘  └──────────────────┘
```

**Vì sao mô hình này?**
- **Khóa Gemini riêng:** app đọc `process.env.GEMINI_API_KEY` → mỗi Vercel project đặt
  khóa riêng của khu phố đó. Đây là lý do chính chọn mô hình triển khai riêng
  (biến môi trường thuộc về từng deployment).
- **Giao diện tên khu phố riêng:** mỗi deployment đặt `NEXT_PUBLIC_KP_SLUG` → app tải
  thông tin khu phố (tên, màu, logo) từ bảng `don_vi` để hiển thị.
- **Dữ liệu đúng khu phố:** portal lọc theo khu phố của deployment; admin cách ly bằng
  RLS (cán bộ chỉ thấy khu phố mình). Dùng chung DB nên **Phường quản lý tập trung**,
  migrations chạy 1 lần, nâng cấp đồng loạt.
- **Tên miền riêng** cho từng khu phố.

> So sánh: có thể dùng CHUNG 1 deployment đa khu phố, nhưng khi đó khóa Gemini phải lưu
> trong DB (khó bảo mật, không "riêng" theo nghĩa hạ tầng). Vì yêu cầu khóa Gemini riêng,
> **triển khai riêng là lựa chọn đúng**.

Có thể dùng **chung một GitHub repo** cho tất cả khu phố — chỉ khác biến môi trường.
Nâng cấp code: đẩy lên repo → mỗi Vercel project tự build lại (hoặc redeploy).

---

## 2. Đã sẵn sàng vs Cần bổ sung code

| Hạng mục | Trạng thái |
|---|---|
| Bảng `don_vi` + `don_vi_id` trên dữ liệu | ✅ Sẵn sàng (migration 044) |
| Cách ly RLS theo khu phố (admin) | ✅ Sẵn sàng (migration 047 + sync profiles) |
| Khóa Gemini theo env (mỗi deployment 1 khóa) | ✅ Sẵn sàng (đọc `GEMINI_API_KEY`) |
| Giao diện đọc tên/màu khu phố theo env | ⏳ **Cần bổ sung code** |
| Portal lọc dữ liệu theo khu phố của deployment | ⏳ **Cần bổ sung code** |
| Gán `don_vi_id` khi tạo hộ dân trong admin | ⏳ **Cần bổ sung code** |

**Phần cần bổ sung (một lần, cho toàn hệ thống):**
1. Module cấu hình `khu-pho` đọc `NEXT_PUBLIC_KP_SLUG`/`KP_ID` từ env, tải bản ghi `don_vi`.
2. Thay branding cứng "KP25 / Khu phố 25" bằng giá trị từ config (portal header, tiêu đề,
   sidebar admin, logo, màu chủ đạo).
3. Portal lọc các truy vấn công khai theo `don_vi_id` của deployment.
4. Admin "Thêm hộ dân / nhân khẩu" tự gán `don_vi_id` = khu phố của cán bộ đang đăng nhập.

> Sau khi bổ sung (làm 1 lần), việc thêm khu phố mới chỉ còn là **cấu hình + deploy**,
> không phải sửa code.

---

## 3. Biến môi trường cho mỗi khu phố

Đặt trên Vercel (Project Settings → Environment Variables) cho CẢ portal và admin:

| Biến | Ý nghĩa | Chung hay riêng |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL Supabase | Chung (1 DB) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Khóa anon | Chung |
| `SUPABASE_SERVICE_ROLE_KEY` | Khóa service role | Chung |
| `GEMINI_API_KEY` | **Khóa Gemini của khu phố** | **RIÊNG từng khu phố** |
| `NEXT_PUBLIC_KP_SLUG` | Định danh khu phố (vd `kp01`) | RIÊNG |
| `JWT_SECRET` / khác | (nếu có) | Chung |

> Chỉ cần `NEXT_PUBLIC_KP_SLUG` — app tự tải tên/màu/logo từ bảng `don_vi` theo slug.
> Nếu muốn cố định không phụ thuộc DB, có thể thêm `NEXT_PUBLIC_KP_TEN`, `NEXT_PUBLIC_KP_MAU`.

---

## 4. RUNBOOK — Onboard MỘT khu phố mới (từng bước)

### Bước 1 — Khai báo khu phố (trong admin KP25)
- Admin → **Quản lý Khu phố** → **Thêm khu phố**: nhập mã (VD `KP01`), tên
  (`Khu phố 1`), slug (`kp01`), trưởng KP, bí thư, màu chủ đạo, logo.
- Ghi lại `don_vi_id` (UUID) và `slug` của khu phố.

### Bước 2 — Tạo tài khoản cán bộ khu phố đó
- Tạo user Supabase Auth (email + mật khẩu) cho từng cán bộ khu phố.
- Thêm bản ghi `can_bo` cho họ với **`don_vi_id` = khu phố mới**, `hoat_dong = true`.
  (Có thể qua mục Phân quyền của admin, hoặc SQL.)
- Khi cán bộ đăng nhập, hệ thống tự đồng bộ `profiles` → RLS cho họ thấy **đúng khu phố mình**.

### Bước 3 — Tạo khóa Gemini API RIÊNG cho khu phố
- Vào **Google AI Studio** (aistudio.google.com) → API Keys → **Create API key**.
- Nên tạo trong một Google Cloud project riêng của khu phố để tách hạn mức/chi phí.
- Lưu khóa an toàn (sẽ dán vào Vercel ở bước 5). **Không commit vào code.**

### Bước 4 — Tạo 2 project Vercel (portal + admin)
- Vercel → **Add New Project** → import **cùng GitHub repo** này (2 lần: 1 cho portal, 1 cho admin).
- Cấu hình build:
  - Portal: `buildCommand = cd apps/web && npx next build`, `outputDirectory = apps/web/.next`.
  - Admin: `buildCommand = cd apps/admin && npx next build`, `outputDirectory = apps/admin/.next`.
  - `installCommand = npm install --legacy-peer-deps` cho cả hai.

### Bước 5 — Đặt biến môi trường (mục 3) cho mỗi project
- Dán các biến chung (Supabase) + **`GEMINI_API_KEY` = khóa riêng khu phố** (bước 3)
  + `NEXT_PUBLIC_KP_SLUG` = `kp01`.

### Bước 6 — Gán tên miền
- Mỗi project 1 tên miền: VD `kp01.longtruong.net` (portal), `admin-kp01.longtruong.net` (admin).

### Bước 7 — Deploy & kiểm tra
- Deploy cả hai. Kiểm tra:
  - Portal hiển thị **tên + màu Khu phố 1** (không phải KP25).
  - Số liệu (hộ dân, nhân khẩu…) = **của Khu phố 1**.
  - Admin: cán bộ KP01 đăng nhập chỉ thấy dữ liệu KP01.
  - Hỏi AI hoạt động (dùng khóa Gemini riêng).

---

## 5. Cách hoạt động (tóm tắt kỹ thuật)

- **Tên khu phố trên giao diện:** deployment đặt `NEXT_PUBLIC_KP_SLUG` → app tra bảng
  `don_vi` (ten, mau_chu_dao, logo_url) → render header/tiêu đề/sidebar theo khu phố.
- **Dữ liệu đúng khu phố:**
  - *Admin:* cán bộ đăng nhập → `profiles.don_vi_id` được đồng bộ từ `can_bo` → RLS
    (`co_quyen_don_vi`) chỉ trả dữ liệu khu phố đó.
  - *Portal:* các truy vấn công khai lọc theo `don_vi_id` của deployment (từ slug).
- **Khóa Gemini riêng:** mọi lời gọi AI đọc `process.env.GEMINI_API_KEY` của chính
  deployment đó → khu phố A không dùng hạn mức/khóa của khu phố B.

---

## 6. Quản trị & bảo trì

- **Nâng cấp:** đẩy code lên repo chung → redeploy từng project (hoặc bật auto-deploy
  theo nhánh). Một lần sửa, mọi khu phố hưởng lợi.
- **Migrations:** chạy 1 lần trên DB chung (không lặp theo khu phố).
- **Giám sát cấp phường:** tài khoản `ADMIN_PHUONG`/`SUPER_ADMIN` xem được mọi khu phố
  (RLS `la_admin_phuong`). Có thể làm một portal/dashboard tổng cấp phường sau này.
- **Tách chi phí AI:** mỗi khu phố tự chịu hạn mức Gemini của mình (khóa riêng).

---

## 7. Phương án thay thế (khi cần cách ly tuyệt đối)

Nếu một khu phố cần **database riêng hoàn toàn** (không chung dữ liệu với phường):
tạo Supabase project riêng, chạy toàn bộ migrations, và trỏ deployment của khu phố đó
sang DB riêng. Đánh đổi: phường mất cái nhìn tập trung, phải bảo trì nhiều DB. **Không
khuyến nghị** trừ khi có yêu cầu pháp lý về tách dữ liệu.
