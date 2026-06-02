# Nhân rộng KP25 ra toàn Phường Long Trường (Đa khu phố)

Tài liệu này mô tả nền tảng **đa khu phố (multi-tenant)** — dùng **một hệ thống
duy nhất** để phục vụ tất cả khu phố thuộc Phường Long Trường, do Phường quản lý
tập trung. Mô hình KP25 trở thành kiểu mẫu nhân rộng cho các khu phố còn lại.

---

## 1. Mô hình đã chọn

**Đa khu phố tập trung (multi-tenant):**

- 1 hệ thống + 1 database duy nhất.
- Thêm chiều dữ liệu **"đơn vị" (khu phố)** — bảng `don_vi` — vào toàn bộ dữ liệu.
- Mỗi khu phố có dữ liệu dân cư, phản ánh, thông báo… riêng.
- Lãnh đạo phường xem được toàn bộ; cán bộ chỉ thấy khu phố mình phụ trách.
- Chi phí thấp nhất, bảo trì & nâng cấp đồng loạt cho mọi khu phố.

**Đơn vị mặc định:** Khu phố 25
`KP25_DON_VI_ID = 00000000-0000-4000-8000-000000000025`

> Mọi dữ liệu cũ và mọi bản ghi mới chưa chỉ định đơn vị đều **mặc định thuộc KP25**.
> Nhờ vậy hệ thống hiện tại **chạy không đổi** cho tới khi mở rộng thật.

---

## 2. Thay đổi kỹ thuật trong đợt này (nền tảng)

### a) Database — migration `044_da_khu_pho.sql`
- Tạo bảng `don_vi` (mã, tên, slug, phường, trưởng KP, bí thư, màu chủ đạo, logo…).
- Seed sẵn **KP25** với UUID cố định.
- Thêm cột `don_vi_id` vào: `ho_dan`, `nhan_khau`, `phan_anh`, `thong_bao`,
  `su_kien`, `can_bo` (NOT NULL, DEFAULT = KP25) và `profiles` (nullable).
  Tự thêm cho các bảng phụ trợ nếu tồn tại (`dang_ky_tam_tru/vang`, `tai_lieu`,
  `chien_dich_tu_khai`, `ho_moi_dang_ky`, `workflow_assignments`…).
- Index `don_vi_id` cho mọi bảng.
- Hàm RLS phân quyền theo khu phố:
  - `don_vi_cua_toi()` — khu phố của user hiện tại.
  - `la_admin_phuong()` — SUPER_ADMIN / ADMIN_PHUONG: thấy mọi khu phố.
  - `co_quyen_don_vi(uuid)` — TRUE nếu là admin phường, **hoặc** cán bộ chưa gán
    khu phố (giai đoạn chuyển tiếp), **hoặc** đúng khu phố của mình.
- Cập nhật RLS `ho_dan` / `nhan_khau` / `phan_anh` thêm phạm vi `co_quyen_don_vi`.

### b) Mã nguồn
- `packages/types`: thêm `DonVi`, `LoaiDonVi`, hằng số `KP25_DON_VI_ID`.
- App admin: thêm module **Quản lý Khu phố** (`/dashboard/khu-pho`) — thêm / sửa /
  xóa khu phố, xem số hộ · nhân khẩu · cán bộ từng khu phố. Menu nằm ở nhóm
  "Hệ thống" (vai trò BI_THU, TRUONG_KHU_PHO).

---

## 3. Cách chạy migration

> Migration chạy **thủ công** trong **Supabase SQL Editor** (workflow tự động đã tắt).

1. Mở Supabase → **SQL Editor** → New query.
2. Dán toàn bộ nội dung `supabase/migrations/044_da_khu_pho.sql`.
3. **Run**.
4. Kiểm tra (chạy từng dòng cuối file):
   ```sql
   SELECT id, ma, ten FROM public.don_vi;                       -- phải có KP25
   SELECT don_vi_id, COUNT(*) FROM public.ho_dan GROUP BY 1;    -- tất cả = KP25
   ```

Migration **idempotent** (chạy lại nhiều lần an toàn): dùng `IF NOT EXISTS`,
`ON CONFLICT DO NOTHING`, `ADD COLUMN IF NOT EXISTS`.

---

## 4. Các bước nhân rộng cho khu phố mới (sau khi có nền tảng)

1. **Khai báo khu phố** — Admin → *Quản lý Khu phố* → *Thêm khu phố*
   (mã, tên, trưởng KP, bí thư, màu…).
2. **Gán cán bộ** vào khu phố — cập nhật `profiles.don_vi_id` (và/hoặc
   `can_bo.don_vi_id`) cho cán bộ phụ trách khu phố đó.
   - Khi cán bộ **đã được gán**, họ chỉ còn thấy dữ liệu khu phố mình.
   - Cán bộ **chưa gán** vẫn thấy tất cả (an toàn cho chuyển tiếp).
3. **Nhập dữ liệu dân cư** của khu phố (import Excel / phiếu kê khai / tự khai QR)
   — nhớ gán `don_vi_id` của khu phố tương ứng khi tạo bản ghi.
4. **Portal người dân**: phân tách theo khu phố qua `slug`
   (ví dụ `/<slug>` hoặc subdomain) — lọc thông báo/sự kiện/phản ánh theo
   `don_vi_id` của khu phố đang xem.

---

## 5. Việc còn lại (roadmap mở rộng đầy đủ)

Nền tảng đã sẵn sàng. Để chạy thật nhiều khu phố cần làm thêm:

- [ ] **Bộ chọn khu phố** cho lãnh đạo phường ở thanh đầu trang admin
      (lọc nhanh dashboard theo từng khu phố / toàn phường).
- [ ] **Gán `don_vi_id` khi ghi dữ liệu** trong các server action còn lại
      (mặc định đang lấy KP25 nhờ DEFAULT — cần truyền đúng khu phố khi đa đơn vị).
- [ ] **Lọc đọc theo khu phố** trong các truy vấn admin (hiện đọc toàn bộ — đúng cho
      giai đoạn 1 khu phố; khi nhiều khu phố cần `.eq('don_vi_id', …)`).
- [ ] **Portal đa khu phố**: route/subdomain theo `slug`, branding theo `mau_chu_dao`/`logo_url`.
- [ ] **Dashboard tổng hợp cấp phường**: gộp số liệu mọi khu phố.
- [ ] Mở rộng `don_vi_id` cho các bảng an sinh (BHYT, hộ nghèo, NCT) nếu cần lọc trực tiếp.

---

## 6. Lưu ý vận hành

- **Không xóa** được Khu phố 25 (đơn vị mặc định) và không xóa khu phố còn hộ dân
  (hệ thống chặn để tránh mất dữ liệu).
- App admin dùng **service role** cho thao tác quản trị → RLS chủ yếu là lớp bảo vệ
  cho truy cập trực tiếp (client). Việc lọc dữ liệu theo khu phố ở admin thực hiện
  thêm ở tầng truy vấn (xem mục 5).
