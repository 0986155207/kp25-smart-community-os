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
- **Giao diện + logo riêng:** mỗi deployment đặt các biến `NEXT_PUBLIC_KP_*` (tên, mã, màu,
  logo) → app hiển thị đúng thương hiệu khu phố; favicon và icon PWA cũng **sinh động** theo
  khu phố, không cần upload file ảnh.
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
| Giao diện đọc tên/màu khu phố theo env | ✅ Đã triển khai |
| Logo khu phố (logo chữ tự đổi; logo ảnh riêng tùy chọn) | ✅ Đã triển khai |
| Favicon + icon PWA + manifest sinh động theo khu phố | ✅ Đã triển khai |
| Ranh giới khu phố — vẽ trên bản đồ, lưu vào CSDL | ✅ Đã triển khai (migration 048) |
| Toàn bộ chữ "KP25"/"Khu phố 25" trên giao diện → đọc từ cấu hình | ✅ Đã triển khai (342 chỗ) |
| Danh bạ cán bộ (Trưởng KP, Bí thư, Công an KV, An ninh), email, UBND → CSDL | ✅ Đã triển khai (migration 049) |
| Portal lọc dữ liệu theo khu phố của deployment | ✅ Đã triển khai |
| Gán `don_vi_id` khi tạo hộ/nhân khẩu trong admin | ✅ Đã triển khai |
| Lọc số liệu TỔNG ở admin Dashboard/Báo cáo/Tìm kiếm theo khu phố | ✅ Đã triển khai (migration 050) |

**Đã có (làm 1 lần, cho toàn hệ thống):**
1. Module `lib/khu-pho.ts` (cả web + admin) đọc `NEXT_PUBLIC_KP_*` từ env, mặc định KP25.
2. Branding động: header/footer/hero/tiêu đề portal, sidebar/login/tiêu đề admin, logo, mã hộ.
3. Portal lọc truy vấn công khai (trang chủ, thông báo, sự kiện, phản ánh, bản đồ) theo `KP_ID`.
4. Admin tạo hộ/nhân khẩu (thêm mới, import, duyệt hộ mới) tự gán `don_vi_id = KP_ID`.
5. **Mọi chữ hiển thị** đọc từ `KHU_PHO` — không còn "KP25" cứng trong giao diện.
6. **Danh bạ cán bộ + liên hệ** đọc từ `don_vi` (migration 049); vai trò bỏ trống thì tự ẩn.
7. **Ranh giới bản đồ** vẽ trên giao diện, lưu vào `don_vi` (migration 048).
8. **Số liệu tổng** ở Dashboard/Báo cáo/Tìm kiếm lọc theo `don_vi_id` — migration 050 bổ sung
   khóa khu phố cho 3 bảng an sinh (`bhyt`, `ho_ngheo`, `nguoi_cao_tuoi`) mà migration 044 bỏ sót.

**Còn lại (chỉ phát sinh khi mở rộng sang PHƯỜNG khác, không phải khu phố khác):**
- Nội dung nghiệp vụ trong `thu-tuc/data.ts` mô tả quy trình theo Phường Long Trường
  (UBND phường, hotline phường) — đúng cho mọi khu phố **trong phường này**.

---

## 3. Biến môi trường cho mỗi khu phố

Đặt trên Vercel (Project Settings → Environment Variables) cho CẢ portal và admin:

| Biến | Ý nghĩa | Chung hay riêng |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL Supabase | Chung (1 DB) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Khóa anon | Chung |
| `SUPABASE_SERVICE_ROLE_KEY` | Khóa service role | Chung |
| `GEMINI_API_KEY` | **Khóa Gemini của khu phố** | **RIÊNG từng khu phố** |
| `NEXT_PUBLIC_KP_ID` | UUID đơn vị trong bảng `don_vi` (dùng LỌC dữ liệu) | RIÊNG |
| `NEXT_PUBLIC_KP_SLUG` | Định danh khu phố (vd `kp01`) | RIÊNG |
| `NEXT_PUBLIC_KP_MA` | Mã ngắn (logo, mã hộ — vd `KP01`) | RIÊNG |
| `NEXT_PUBLIC_KP_TEN` | Tên hiển thị (vd `Khu phố 1`) | RIÊNG |
| `NEXT_PUBLIC_KP_TEN_DAY_DU` | Tên đầy đủ | RIÊNG |
| `NEXT_PUBLIC_KP_PHUONG` | Tên phường | RIÊNG |
| `NEXT_PUBLIC_KP_MAU` | Màu chủ đạo (hex) — dùng cả cho favicon động | RIÊNG |
| `NEXT_PUBLIC_KP_LOGO_CHU` / `_SO` | Chữ + số trên logo (vd `KP` / `01`) | RIÊNG |
| `NEXT_PUBLIC_KP_LOGO_URL` | (Tùy chọn) URL ảnh logo riêng; bỏ trống = logo chữ | RIÊNG |
| `JWT_SECRET` / khác | (nếu có) | Chung |

> App đọc cấu hình khu phố **trực tiếp từ các biến này** (`lib/khu-pho.ts`), không truy vấn DB
> → nhanh, dùng được ở cả Server lẫn Client. Bỏ trống = mặc định Khu phố 25.
>
> **Logo & icon:** favicon, icon PWA và manifest được **sinh động** từ `KP_MA` + `KP_MAU`
> (`src/app/icon.tsx`, `apple-icon.tsx`, `manifest.ts`) → **không cần upload file ảnh nào**.
> Nếu khu phố có logo ảnh riêng, chỉ cần điền `NEXT_PUBLIC_KP_LOGO_URL` (hoặc trường Logo
> trong mục Quản lý Khu phố) — app tự thay logo chữ bằng ảnh đó.

---

## 4. RUNBOOK — Onboard MỘT khu phố mới (từng bước)

### Bước 1 — Khai báo khu phố (trong admin KP25)
- Admin → **Quản lý Khu phố** → **Thêm khu phố**: nhập mã (VD `KP01`), tên
  (`Khu phố 1`), slug (`kp01`), trưởng KP, bí thư, màu chủ đạo, logo.
- Ghi lại `don_vi_id` (UUID) và `slug` của khu phố.

### Bước 1b — Vẽ ranh giới khu phố
- Tại thẻ khu phố vừa tạo → nhấn **Ranh giới**.
- **Bấm lên bản đồ** để thêm từng đỉnh · **kéo đỉnh** để chỉnh · **bấm vào đỉnh** để xoá.
  Cần ít nhất **3 đỉnh** → nhấn **Lưu ranh giới**.
- Nếu đã có file ranh giới hành chính: dùng **Nhập GeoJSON** (tự đảo [lng,lat] → [lat,lng]).
- Ranh giới dùng chung cho **bản đồ GIS của cán bộ** và **bản đồ công khai trên portal**;
  đồng thời dùng để **rải vị trí ước tính** cho hộ chưa có toạ độ GPS.
- Chưa vẽ ranh giới → bản đồ không hiển thị ranh giới và không rải vị trí ước tính
  (tránh chấm sai chỗ), tâm bản đồ lấy theo dữ liệu thật.

### Bước 1c — Khai báo danh bạ cán bộ
Trong form **Quản lý Khu phố**, điền: Trưởng khu phố, Bí thư chi bộ, **Công an khu vực**,
**An ninh khu phố** (tên + SĐT), **Email liên hệ**. Các thông tin này hiển thị trên
trang Liên hệ, Đăng ký tạm trú, Dân cư, Hướng dẫn và Footer của portal khu phố đó.
Vai trò nào bỏ trống thì **tự ẩn** khỏi giao diện (không hiện thông tin của khu phố khác).

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

- **Tên khu phố trên giao diện:** deployment đặt `NEXT_PUBLIC_KP_*` → `lib/khu-pho.ts`
  đọc trực tiếp → render header/footer/hero/sidebar/login/tiêu đề tab theo khu phố.
- **Logo:** component `LogoKhuPho` — có `KP_LOGO_URL` thì hiện ảnh, không thì hiện badge
  chữ (`KP_LOGO_CHU` + `KP_LOGO_SO`). Favicon/icon PWA sinh động từ `KP_MA` + `KP_MAU`.
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
