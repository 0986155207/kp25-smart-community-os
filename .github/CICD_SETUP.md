# CI/CD Setup — KP25 Smart Community OS
# Hướng dẫn cấu hình chi tiết từng bước

---

## MỤC LỤC

1. [Tổng quan CI/CD](#1-tổng-quan-cicd)
2. [Lấy Supabase Credentials](#2-lấy-supabase-credentials)
3. [Lấy Vercel Credentials](#3-lấy-vercel-credentials)
4. [Cấu hình VPS & SSH](#4-cấu-hình-vps--ssh)
5. [Thêm Secrets vào GitHub](#5-thêm-secrets-vào-github)
6. [Cấu hình GitHub Environments](#6-cấu-hình-github-environments)
7. [Cấu hình Branch Protection](#7-cấu-hình-branch-protection)
8. [Chạy lần đầu tiên](#8-chạy-lần-đầu-tiên)
9. [Xác minh hoạt động](#9-xác-minh-hoạt-động)
10. [Quy trình làm việc hàng ngày](#10-quy-trình-làm-việc-hàng-ngày)
11. [Trigger thủ công](#11-trigger-thủ-công)
12. [Rollback khẩn cấp](#12-rollback-khẩn-cấp)
13. [Xử lý lỗi thường gặp](#13-xử-lý-lỗi-thường-gặp)

---

## 1. Tổng quan CI/CD

### 6 Workflows tự động

| File | Khi nào chạy | Làm gì |
|------|-------------|--------|
| `ci.yml` | Mọi push + PR | Lint → Tests → Build |
| `deploy-preview.yml` | Mỗi PR | Deploy preview lên Vercel, comment URL vào PR |
| `deploy-production.yml` | Merge vào `main` | Deploy Vercel + VPS + DB migration |
| `db-migrate.yml` | Push vào `supabase/migrations/**` | Chạy migration Supabase |
| `health-check.yml` | Mỗi 30 phút | Kiểm tra sức khỏe, tạo Issue nếu lỗi |
| `release.yml` | Thủ công | Bump version, tạo CHANGELOG, tạo GitHub Release |

### Secrets cần cấu hình

```
Supabase    : 6 secrets
Vercel      : 4 secrets
Firebase    : 4 secrets
VPS (tùy)  : 4 secrets
Gemini      : 1 secret
Variables   : 2 variables (không phải secrets)
─────────────────────────
Tổng        : 15 secrets + 2 variables
```

---

## 2. Lấy Supabase Credentials

### 2.1. Mở Project Settings

1. Truy cập [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Chọn project **KP25** (hoặc tạo mới nếu chưa có)
3. Click **Settings** (biểu tượng bánh răng ở thanh sidebar trái)

---

### 2.2. `NEXT_PUBLIC_SUPABASE_URL` và `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Đường dẫn:** Settings → **API**

```
Tìm section "Project URL":
  → Copy giá trị → đây là NEXT_PUBLIC_SUPABASE_URL
  Ví dụ: https://abcdefghijklm.supabase.co

Tìm section "Project API keys" → "anon" "public":
  → Click biểu tượng con mắt để hiện key
  → Copy → đây là NEXT_PUBLIC_SUPABASE_ANON_KEY
  Ví dụ: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### 2.3. `SUPABASE_SERVICE_ROLE_KEY`

**Đường dẫn:** Settings → **API**

```
Tìm section "Project API keys" → "service_role" "secret":
  → CẢNH BÁO: key này có toàn quyền, KHÔNG public
  → Click biểu tượng con mắt → Copy
  → đây là SUPABASE_SERVICE_ROLE_KEY
```

---

### 2.4. `SUPABASE_PROJECT_ID`

**Đường dẫn:** Settings → **General**

```
Tìm section "General settings":
  → "Reference ID" (dạng: abcdefghijklm — 20 ký tự)
  → Copy → đây là SUPABASE_PROJECT_ID

Hoặc lấy từ URL dashboard:
  https://supabase.com/dashboard/project/[PROJECT_ID]/settings/general
                                            ↑ đây
```

---

### 2.5. `SUPABASE_DB_PASSWORD`

**Đường dẫn:** Settings → **Database**

```
Tìm section "Database password":
  → Đây là password bạn đã đặt khi tạo project
  → Nếu quên: click "Reset database password" → đặt mới
  → Copy password mới → đây là SUPABASE_DB_PASSWORD
```

---

### 2.6. `SUPABASE_ACCESS_TOKEN`

Đây là token cá nhân (không phải của project), dùng để Supabase CLI xác thực.

1. Truy cập [https://supabase.com/dashboard/account/tokens](https://supabase.com/dashboard/account/tokens)
2. Click **Generate new token**
3. Đặt tên: `KP25 GitHub Actions`
4. Click **Generate token**
5. **Copy ngay** — token chỉ hiện 1 lần!
6. Đây là `SUPABASE_ACCESS_TOKEN`

---

## 3. Lấy Vercel Credentials

### 3.1. `VERCEL_TOKEN`

1. Truy cập [https://vercel.com/account/tokens](https://vercel.com/account/tokens)
2. Click **Create Token**
3. Đặt tên: `KP25 GitHub Actions`
4. Scope: **Full Account**
5. Expiration: **No expiration** (hoặc 1 năm)
6. Click **Create** → Copy token
7. Đây là `VERCEL_TOKEN`

---

### 3.2. `VERCEL_ORG_ID`

```bash
# Cài Vercel CLI (nếu chưa có)
npm install -g vercel

# Đăng nhập
vercel login
# → Chọn "Continue with GitHub" → xác thực

# Xem org ID
vercel teams ls
# Nếu dùng cá nhân (không có team):
vercel whoami
# → Lấy username, sau đó:
vercel env pull  # hoặc xem bước tiếp theo
```

**Cách dễ nhất** — đọc từ file sau khi link project:

```bash
cd apps/web
vercel link
# → Chọn team/account của bạn
# → Chọn "Create new project" hoặc chọn project đã có

cat .vercel/project.json
# Output:
# {
#   "orgId": "team_xxxxxxxxxxxxxxxx",   ← VERCEL_ORG_ID
#   "projectId": "prj_yyyyyyyyyyyy"    ← VERCEL_WEB_PROJECT_ID
# }
```

---

### 3.3. `VERCEL_WEB_PROJECT_ID` và `VERCEL_ADMIN_PROJECT_ID`

```bash
# Link project portal (apps/web)
cd apps/web
vercel link
# → Chọn project "kp25-web" (hoặc tạo mới)
cat .vercel/project.json
# → Lấy "projectId" → đây là VERCEL_WEB_PROJECT_ID

# Link project admin (apps/admin)
cd ../admin
vercel link
# → Chọn project "kp25-admin" (hoặc tạo mới)
cat .vercel/project.json
# → Lấy "projectId" → đây là VERCEL_ADMIN_PROJECT_ID
```

**Lưu ý:** Thêm `.vercel/` vào `.gitignore` nếu chưa có để tránh commit thông tin này.

---

### 3.4. Cấu hình Environment Variables trên Vercel Dashboard

Vào mỗi project trên Vercel → **Settings** → **Environment Variables** → thêm:

| Key | Value | Environment |
|-----|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` | Production, Preview, Development |
| `GEMINI_API_KEY` | `AIza...` | Production, Preview |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | `AIza...` | Production, Preview, Development |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `kp25-xxx` | Production, Preview, Development |
| `NEXT_PUBLIC_FIREBASE_VAPID_KEY` | `BNxx...` | Production, Preview, Development |

> **Tại sao cần cả 2 nơi?** GitHub Actions dùng secrets khi build (CI). Vercel cũng cần env vars để preview deploys hoạt động đúng.

---

## 4. Cấu hình VPS & SSH

> **Bỏ qua phần này nếu bạn chỉ dùng Vercel** (không deploy Docker lên VPS).

### 4.1. Tạo SSH key pair dành riêng cho GitHub Actions

Chạy trên **máy local** của bạn (không phải trên VPS):

```bash
# Tạo key pair (không đặt passphrase — để trống khi hỏi)
ssh-keygen -t ed25519 -C "github-actions@kp25" -f ~/.ssh/kp25_github_actions

# Kết quả:
# ~/.ssh/kp25_github_actions      ← PRIVATE KEY (sẽ thêm vào GitHub Secrets)
# ~/.ssh/kp25_github_actions.pub  ← PUBLIC KEY (sẽ thêm vào VPS)
```

### 4.2. Thêm Public Key vào VPS

```bash
# Xem nội dung public key
cat ~/.ssh/kp25_github_actions.pub
# Kết quả dạng: ssh-ed25519 AAAAC3Nza... github-actions@kp25

# SSH vào VPS bằng key hiện tại của bạn
ssh ubuntu@YOUR_VPS_IP

# Trên VPS: thêm public key vào authorized_keys
echo "ssh-ed25519 AAAAC3Nza... github-actions@kp25" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

# Kiểm tra
cat ~/.ssh/authorized_keys | grep github-actions
```

### 4.3. Lấy nội dung Private Key (cho `VPS_SSH_KEY`)

```bash
# Trên máy local
cat ~/.ssh/kp25_github_actions
# Copy TOÀN BỘ nội dung bao gồm cả:
# -----BEGIN OPENSSH PRIVATE KEY-----
# ...
# -----END OPENSSH PRIVATE KEY-----
```

Dán toàn bộ nội dung này vào secret `VPS_SSH_KEY`.

### 4.4. Chuẩn bị thư mục trên VPS

```bash
# SSH vào VPS
ssh ubuntu@YOUR_VPS_IP

# Tạo thư mục deploy
sudo mkdir -p /opt/kp25
sudo chown ubuntu:ubuntu /opt/kp25
cd /opt/kp25

# Tạo file docker-compose.yml cho production
cat > docker-compose.yml << 'EOF'
version: '3.8'
services:
  web:
    image: ghcr.io/YOUR_GITHUB_USERNAME/kp25-web:latest
    restart: unless-stopped
    ports:
      - "3000:3000"
    env_file: .env.production
    
  admin:
    image: ghcr.io/YOUR_GITHUB_USERNAME/kp25-admin:latest
    restart: unless-stopped
    ports:
      - "3001:3001"
    env_file: .env.production

  nginx:
    image: nginx:alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/ssl/kp25:ro
EOF

# Tạo file .env.production (điền giá trị thật)
cat > .env.production << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
GEMINI_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=kp25-xxx
NEXT_PUBLIC_FIREBASE_VAPID_KEY=BNxx...
NODE_ENV=production
EOF

# Bảo mật file .env
chmod 600 .env.production
```

### 4.5. Cài Docker trên VPS (nếu chưa có)

```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker ubuntu
newgrp docker

# Kiểm tra
docker --version
docker compose version
```

### 4.6. Xác minh kết nối SSH từ máy local

```bash
# Test kết nối bằng key mới
ssh -i ~/.ssh/kp25_github_actions ubuntu@YOUR_VPS_IP "echo 'SSH OK'"
# → Phải in ra "SSH OK" không cần nhập password
```

---

## 5. Thêm Secrets vào GitHub

**Đường dẫn:** Repository → **Settings** → **Secrets and variables** → **Actions**

### 5.1. Cách thêm từng secret

1. Click **New repository secret**
2. Điền **Name** (VIẾT HOA, không dấu cách)
3. Điền **Secret** (giá trị)
4. Click **Add secret**

### 5.2. Danh sách đầy đủ cần thêm

#### 🔐 Supabase (6 secrets)

| Name | Lấy từ đâu |
|------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API → anon public |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → service_role secret |
| `SUPABASE_ACCESS_TOKEN` | supabase.com/dashboard/account/tokens |
| `SUPABASE_DB_PASSWORD` | Supabase → Settings → Database → Database password |
| `SUPABASE_PROJECT_ID` | Supabase → Settings → General → Reference ID |

#### 🌐 Vercel (4 secrets)

| Name | Lấy từ đâu |
|------|-----------|
| `VERCEL_TOKEN` | vercel.com/account/tokens |
| `VERCEL_ORG_ID` | `.vercel/project.json` → `orgId` |
| `VERCEL_WEB_PROJECT_ID` | `apps/web/.vercel/project.json` → `projectId` |
| `VERCEL_ADMIN_PROJECT_ID` | `apps/admin/.vercel/project.json` → `projectId` |

#### 🤖 AI & Firebase (5 secrets)

| Name | Lấy từ đâu |
|------|-----------|
| `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/app/apikey) |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase Console → Project Settings → General → Web API Key |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase Console → Project Settings → General → Project ID |
| `NEXT_PUBLIC_FIREBASE_VAPID_KEY` | Firebase Console → Project Settings → Cloud Messaging → Web Push certificates |

#### 🖥️ VPS — chỉ nếu dùng Docker deploy (4 secrets)

| Name | Giá trị |
|------|--------|
| `VPS_HOST` | IP hoặc domain VPS (vd: `103.x.x.x` hoặc `kp25.example.com`) |
| `VPS_USER` | Username SSH (thường `ubuntu` hoặc `root`) |
| `VPS_SSH_KEY` | Nội dung file `~/.ssh/kp25_github_actions` (toàn bộ, kể cả header) |
| `VPS_PORT` | Port SSH (mặc định `22`) |

### 5.3. Thêm Variables (không phải secrets — giá trị không bị ẩn)

**Đường dẫn:** Repository → Settings → Secrets and variables → Actions → tab **Variables**

| Name | Giá trị ví dụ |
|------|--------------|
| `PRODUCTION_WEB_URL` | `https://kp25.longtruong.gov.vn` |
| `PRODUCTION_ADMIN_URL` | `https://admin.kp25.longtruong.gov.vn` |

---

## 6. Cấu hình GitHub Environments

Environments cho phép yêu cầu **phê duyệt thủ công** trước khi deploy production.

**Đường dẫn:** Repository → **Settings** → **Environments**

### 6.1. Tạo Environment `production`

1. Click **New environment**
2. Đặt tên: `production`
3. Click **Configure environment**
4. Bật **Required reviewers**:
   - Click **Add required reviewers**
   - Tìm và chọn chính bạn (hoặc người phê duyệt)
   - Click **Save protection rules**
5. Tùy chọn: Bật **Prevent self-review** nếu muốn người khác phải duyệt

### 6.2. Tạo Environment `database`

1. Click **New environment**  
2. Đặt tên: `database`
3. Click **Configure environment**
4. Bật **Required reviewers** → thêm reviewer
5. Bật **Deployment branches** → chọn **Selected branches** → thêm `main`

> **Tại sao cần?** Workflow `deploy-production.yml` và `db-migrate.yml` dùng environments này. Khi một job cần environment có reviewers, GitHub sẽ **dừng lại và chờ phê duyệt** trước khi chạy tiếp.

---

## 7. Cấu hình Branch Protection

Ngăn push thẳng vào `main`, bắt buộc CI phải pass trước khi merge.

**Đường dẫn:** Repository → **Settings** → **Branches** → **Add branch protection rule**

### 7.1. Cấu hình cho branch `main`

**Branch name pattern:** `main`

Bật các tùy chọn sau:

```
✅ Require a pull request before merging
   ✅ Require approvals: 1
   ✅ Dismiss stale pull request approvals when new commits are pushed

✅ Require status checks to pass before merging
   ✅ Require branches to be up to date before merging
   
   → Tìm và thêm status check:
   [Tìm kiếm] "ci-success"  ← job này trong ci.yml là gate chính
   [Tìm kiếm] "✅ CI Passed"

✅ Require conversation resolution before merging

✅ Do not allow bypassing the above settings
```

> **Lưu ý:** Status check `ci-success` chỉ xuất hiện trong danh sách sau khi CI đã chạy ít nhất 1 lần. Nếu chưa thấy: push 1 commit lên branch bất kỳ → tạo PR → CI chạy → quay lại đây tìm kiếm.

---

## 8. Chạy lần đầu tiên

### 8.1. Checklist trước khi bắt đầu

```
□ Đã thêm đủ 15 secrets + 2 variables vào GitHub
□ Đã tạo 2 Vercel projects (web + admin) và link xong
□ Đã chạy Supabase migration thủ công lần đầu
□ Đã cấu hình GitHub Environments (production, database)
□ Đã thêm Branch Protection cho main
□ (Nếu dùng VPS) Đã test SSH kết nối thành công
```

### 8.2. Chạy CI lần đầu

```bash
# Tạo branch test
git checkout -b test/ci-setup

# Tạo file thay đổi nhỏ
echo "# CI Test" >> TEST_CI.md

# Commit và push
git add TEST_CI.md
git commit -m "test: kiểm tra CI pipeline"
git push origin test/ci-setup
```

Sau đó:
1. Vào GitHub → **Pull requests** → **New pull request**
2. Chọn: `base: main` ← `compare: test/ci-setup`
3. Click **Create pull request**
4. Xem tab **Checks** — CI sẽ chạy tự động
5. Xem tab **Deployments** — Preview URL sẽ được comment vào PR

### 8.3. Chạy Migration Supabase lần đầu (thủ công)

```bash
# Cài Supabase CLI
npm install -g supabase

# Đăng nhập
supabase login
# → Mở browser, copy token, paste vào terminal

# Link project
supabase link --project-ref YOUR_PROJECT_ID

# Xem migration chưa apply
supabase db diff

# Apply migration (dry-run trước)
supabase db push --dry-run

# Apply thật
supabase db push
```

### 8.4. Deploy Production lần đầu

Sau khi merge PR test vào main:

1. Vào **Actions** → **Deploy Production**
2. Click **Run workflow**
3. Chọn: `target: vercel`
4. Click **Run workflow**
5. GitHub sẽ hỏi phê duyệt (nếu đã cấu hình Environment) → **Approve and deploy**

---

## 9. Xác minh hoạt động

### 9.1. Kiểm tra CI

Vào **Actions** → chọn workflow run gần nhất của `CI / Kiểm tra chất lượng`:

```
✅ 🔍 Lint & Type Check    → 2-3 phút
✅ 🧪 Unit Tests           → 2-4 phút  
✅ 🏗️ Build Check          → 4-6 phút
✅ ✅ CI Passed             → tổng hợp kết quả
```

### 9.2. Kiểm tra Preview Deploy

Mở PR → xem comments → tìm comment từ `github-actions[bot]`:

```
🚀 Preview Deploy thành công!

| App | URL |
|-----|-----|
| 🏘️ Portal | https://kp25-web-git-feature-xxx.vercel.app |
| ⚙️ Admin  | https://kp25-admin-git-feature-xxx.vercel.app |
```

### 9.3. Kiểm tra Health Check

Vào **Actions** → **Health Check** → chọn run gần nhất:

```
✅ 🏘️ Kiểm tra Portal    → HTTP 200
✅ ⚙️ Kiểm tra Admin     → HTTP 200/302
```

Nếu thấy `⚠️ PRODUCTION_WEB_URL chưa được cấu hình` → thêm Variables ở bước 5.3.

### 9.4. Kiểm tra Release (tùy chọn)

Vào **Actions** → **Release** → **Run workflow**:
- version: `0.1.0`
- release-type: `minor`

Sau khi chạy, vào **Releases** → xem release `v0.1.0` đã được tạo.

---

## 10. Quy trình làm việc hàng ngày

```
Developer
    │
    ▼
git checkout -b feature/ten-tinh-nang
# ... code ...
git push origin feature/ten-tinh-nang
    │
    ▼
Tạo Pull Request → main
    │
    ├── CI tự động chạy:
    │   ├── 🔍 Lint & Type check (~2 phút)
    │   ├── 🧪 Unit tests + comment coverage (~4 phút)
    │   └── 🏗️ Build check (~5 phút)
    │
    ├── Preview deploy tự động:
    │   ├── 🏘️ Portal preview URL
    │   └── ⚙️ Admin preview URL
    │         (comment tự động vào PR)
    │
    ▼
Review & Approve (1 người)
    │
    ▼
Merge vào main
    │
    ├── Deploy Production tự động:
    │   ├── 🌐 Vercel Portal + Admin
    │   ├── 🐳 Docker → VPS (nếu đã cấu hình)
    │   └── 🗄️ DB Migrations (nếu có file mới)
    │
    └── Health check mỗi 30 phút
        └── Tạo Issue tự động nếu có lỗi
```

---

## 11. Trigger thủ công

### 11.1. Deploy Production

```
GitHub → Actions → Deploy Production → Run workflow
→ Branch: main
→ target: vercel | vps | both
→ Click "Run workflow"
```

### 11.2. Chạy DB Migration

```
GitHub → Actions → DB Migrate → Run workflow
→ dry-run: true  (chỉ xem, không thay đổi gì)
           false (apply thật vào database)
→ Click "Run workflow"
```

> **Khuyến nghị:** Luôn chạy `dry-run: true` trước để kiểm tra, sau đó mới `false`.

### 11.3. Tạo Release

```
GitHub → Actions → Release → Run workflow
→ version: 1.2.0
→ release-type: patch | minor | major
→ Click "Run workflow"
```

**Phân biệt:**
- `patch` — Sửa lỗi nhỏ: `1.0.0` → `1.0.1`
- `minor` — Tính năng mới, không phá vỡ: `1.0.0` → `1.1.0`
- `major` — Thay đổi lớn/phá vỡ: `1.0.0` → `2.0.0`

### 11.4. Kích hoạt Health Check ngay

```
GitHub → Actions → Health Check → Run workflow
→ Branch: main
→ Click "Run workflow"
```

---

## 12. Rollback khẩn cấp

### 12.1. Vercel — nhanh nhất (dưới 1 phút)

```
GitHub → Deployments → chọn deployment trước đó → "Redeploy"
```

Hoặc dùng Vercel CLI:

```bash
# Cài Vercel CLI
npm install -g vercel

# Xem danh sách deployments
vercel ls kp25-web --token $VERCEL_TOKEN

# Rollback về deployment trước
vercel rollback [deployment-url] --token $VERCEL_TOKEN
```

### 12.2. VPS Docker — rollback về SHA cụ thể

```bash
# SSH vào VPS
ssh ubuntu@YOUR_VPS_IP

# Xem danh sách images đang có
docker images | grep kp25

# Ví dụ output:
# ghcr.io/.../kp25-web   latest    abc123   2 hours ago   450MB
# ghcr.io/.../kp25-web   def456    def456   1 day ago     448MB

# Rollback về SHA cũ
docker compose stop web
docker tag ghcr.io/.../kp25-web:def456 ghcr.io/.../kp25-web:latest
docker compose up -d web

# Kiểm tra log
docker compose logs -f web --tail=50
```

### 12.3. Database Supabase

1. Vào [Supabase Dashboard](https://supabase.com/dashboard) → chọn project
2. **Database** → **Backups**
3. Chọn backup trước thời điểm xảy ra lỗi
4. Click **Restore**
5. Xác nhận → chờ 5-15 phút

> ⚠️ **Cảnh báo:** Restore database sẽ mất mọi dữ liệu từ sau thời điểm backup. Chỉ dùng khi thực sự cần thiết.

### 12.4. Git revert

```bash
# Xem lịch sử commit
git log --oneline -10

# Tạo revert commit (an toàn hơn reset)
git revert HEAD --no-edit
git push origin main

# → CI/CD sẽ tự động deploy version đã revert
```

---

## 13. Xử lý lỗi thường gặp

### ❌ "Error: NEXT_PUBLIC_SUPABASE_URL is required"

**Nguyên nhân:** Secret chưa được thêm hoặc tên bị sai  
**Giải pháp:**
1. Vào GitHub → Settings → Secrets → kiểm tra tên chính xác (phân biệt HOA/thường)
2. Kiểm tra không có khoảng trắng thừa trong giá trị secret

---

### ❌ "Error: The deployment is not ready"

**Nguyên nhân:** Vercel project chưa được link hoặc `VERCEL_WEB_PROJECT_ID` sai  
**Giải pháp:**
```bash
cd apps/web
vercel link --yes
cat .vercel/project.json
# Cập nhật VERCEL_WEB_PROJECT_ID với projectId mới
```

---

### ❌ CI status check không xuất hiện trong Branch Protection

**Nguyên nhân:** CI chưa chạy lần nào  
**Giải pháp:**
1. Push một commit nhỏ lên branch bất kỳ
2. Tạo PR → chờ CI chạy xong
3. Quay lại Settings → Branches → tìm `ci-success` trong status checks

---

### ❌ "Permission denied (publickey)" khi SSH vào VPS

**Nguyên nhân:** Public key chưa được thêm vào VPS hoặc private key trong secret bị sai  
**Giải pháp:**
```bash
# Kiểm tra public key trên VPS
ssh ubuntu@VPS_IP
cat ~/.ssh/authorized_keys | grep github-actions

# Nếu không có, thêm lại:
echo "CONTENT_OF_PUBLIC_KEY" >> ~/.ssh/authorized_keys

# Kiểm tra private key trong secret có đúng format không
# Phải bắt đầu bằng: -----BEGIN OPENSSH PRIVATE KEY-----
# Phải kết thúc bằng: -----END OPENSSH PRIVATE KEY-----
```

---

### ❌ "supabase: command not found" trong workflow

**Nguyên nhân:** Supabase CLI chưa được cài trong workflow  
**Giải pháp:** Kiểm tra `db-migrate.yml` có bước cài CLI:

```yaml
- name: Cài Supabase CLI
  uses: supabase/setup-cli@v1
  with:
    version: latest
```

---

### ❌ Health check tạo quá nhiều Issues trùng nhau

**Nguyên nhân:** Workflow check bị lỗi khi đọc issues hiện có  
**Giải pháp:** Kiểm tra `GITHUB_TOKEN` có quyền `issues: write` trong workflow `health-check.yml`

---

### ❌ Migration chạy nhưng không thấy thay đổi trong DB

**Nguyên nhân:** `SUPABASE_PROJECT_ID` sai (trỏ vào project khác)  
**Giải pháp:**
```bash
# Kiểm tra project đang được link
supabase status
# → In ra URL project đang kết nối

# Re-link nếu sai
supabase link --project-ref CORRECT_PROJECT_ID
```

---

## Thông tin liên hệ & tài nguyên

| Tài nguyên | Link |
|-----------|------|
| Supabase Docs | https://supabase.com/docs |
| Vercel Docs | https://vercel.com/docs |
| GitHub Actions Docs | https://docs.github.com/en/actions |
| Supabase CLI | https://supabase.com/docs/reference/cli |
| Vercel CLI | https://vercel.com/docs/cli |
| Docker Docs | https://docs.docker.com |

---

*Tài liệu này được cập nhật lần cuối: 2026-05-29*  
*Phiên bản hệ thống: KP25 Smart Community OS v1.0*
