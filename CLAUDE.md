 CLAUDE.md 

````md
# CLAUDE.md
# KP25 SMART COMMUNITY OS
# Khu phố 25 – Long Trường – TP.HCM, cấp hành chính chỉ còn 2 cấp ( không còn Thủ Đức )
# Production-Ready AI Smart Community Platform

---

# 1. TỔNG QUAN DỰ ÁN

Bạn đang phát triển hệ thống:

# “KP25 SMART COMMUNITY OS”

Đây là nền tảng chuyển đổi số toàn diện cho Khu phố 25 – Long Trường – TP.HCM, lấy cảm hứng từ mô hình “Khu phố số” của phường Tân Hưng – TP.HCM năm 2026.

Hệ thống không phải website thông thường.Trước khi triển khai cần xem xét mô hình khu phố số của Phường Tân Hưng - TPHCM

Đây là:

- Community Operating System
- Smart Community Platform
- AI-native Governance Platform
- Digital Neighborhood Infrastructure
- Smart Ward Mini Platform

Mục tiêu:
- phục vụ người dân,
- hỗ trợ chính quyền cơ sở,
- số hóa toàn bộ quy trình vận hành khu phố,
- vận hành 24/7,
- realtime,
- AI-first.

---

# 2. TRIẾT LÝ KIẾN TRÚC

Toàn bộ hệ thống phải tuân thủ:

## PRINCIPLES

### 1. AI-FIRST
AI không phải tính năng phụ.

AI là lõi trung tâm:
- AI Assistant
- AI Routing
- AI Analytics
- AI Search
- AI Workflow
- AI Summarization
- AI OCR
- AI Governance

---

### 2. MOBILE-FIRST

Ưu tiên:
- điện thoại,
- mạng yếu,
- người dùng lớn tuổi.

Tất cả giao diện:
- responsive,
- touch-friendly,
- dễ đọc,
- font lớn,
- thao tác đơn giản.

---

### 3. GOVERNMENT-GRADE

Hệ thống phải:
- ổn định,
- audit được,
- bảo mật,
- realtime,
- dễ mở rộng,
- có logging đầy đủ.

---

### 4. DATA-CENTRIC

Mọi thứ phải xoay quanh:
- dữ liệu,
- dashboard,
- realtime analytics,
- workflow.

---

### 5. COMMUNITY EXPERIENCE

Thiết kế phải:
- thân thiện,
- gần gũi,
- dễ sử dụng,
- phù hợp mọi độ tuổi.

---

# 3. KIẾN TRÚC TỔNG THỂ

```txt
Người dân
    ↓
QR Một Chạm / Mobile App / PWA / Web
    ↓
AI Assistant Khu Phố
    ↓
API Gateway
    ↓
Core Services
    ↓
Database + AI Vector DB
    ↓
Realtime Dashboard
    ↓
Lãnh đạo / Cán bộ / Công an / Đoàn thể
````

---

# 4. TECH STACK BẮT BUỘC

## FRONTEND

Bắt buộc:

* Next.js 15+
* App Router
* TypeScript
* TailwindCSS
* shadcn/ui
* Framer Motion
* PWA
* Zustand
* React Query
* React Hook Form
* Zod

---

## BACKEND

Ưu tiên:

* NestJS

Bao gồm:

* REST API
* WebSocket Gateway
* Queue Workers
* Event Bus
* Scheduler
* RBAC
* Audit Logs

---

## DATABASE

Bắt buộc:

* PostgreSQL
* Prisma ORM

Ngoài ra:

* Redis
* pgvector

---

## AI STACK

Bắt buộc hỗ trợ:

* Gemini, model: gemini-2.5-flash

Framework:

* LangChain

Tính năng:

* RAG
* Semantic Search
* Embeddings
* AI Memory
* Prompt Templates
* Context Injection

---

## DEVOPS

Bắt buộc:

* Docker
* Docker Compose
* GitHub Actions
* CI/CD
* Health Checks
* Structured Logging
* Monitoring

---

# 5. KIẾN TRÚC SOURCE CODE

Monorepo structure:

```txt
/apps
    /web
    /admin
    /api
    /worker

/packages
    /ui
    /config
    /types
    /utils
    /ai
    /auth

/infrastructure
    /docker
    /nginx
    /monitoring

/docs

/scripts
```

---

# 6. QUY TẮC SOURCE CODE

## TYPESCRIPT RULES

* Strict mode bắt buộc
* Không dùng any
* Ưu tiên type-safe
* Ưu tiên functional programming
* Reusable components

---

## CLEAN ARCHITECTURE

Bắt buộc tách:

* domain
* application
* infrastructure
* presentation

---

## API RULES

Mọi API phải:

* validate input,
* rate limit,
* logging,
* audit trail,
* standardized response.

---

## RESPONSE FORMAT

```json
{
  "success": true,
  "message": "Thành công",
  "data": {},
  "timestamp": ""
}
```

---

# 7. UI/UX STANDARDS

## GIAO DIỆN

Phong cách:

* hiện đại,
* hành chính thông minh,
* tối giản,
* chuyên nghiệp.

---

## MÀU SẮC

Primary:

* đỏ đô

Secondary:

* navy
* trắng
* vàng nhạt

---

## COMPONENT RULES

Tất cả component:

* reusable,
* accessible,
* responsive,
* animation nhẹ,
* loading states,
* empty states,
* skeleton loading.

---

# 8. MODULES BẮT BUỘC

# A. PORTAL KHU PHỐ

Bao gồm:

* thông báo,
* sự kiện,
* tin tức,
* chatbot,
* dashboard mini,
* quick actions.

---

# B. QR “MỘT CHẠM”

Mỗi hộ dân:

* QR riêng,
* liên kết định danh.

Cho phép:

* phản ánh,
* tra cứu,
* liên hệ cán bộ,
* hỏi AI,
* khai báo.

---

# C. AI ASSISTANT

AI phải:

* trả lời tiếng Việt, định dạng văn bản theo phong cách hành chính , không sử dụng Markdown ( dấu ##,**,...)
* hỗ trợ hành chính,
* hỗ trợ dân cư,
* hỗ trợ phản ánh,
* hỗ trợ cán bộ.

---

# D. PHẢN ÁNH HIỆN TRƯỜNG

Cho phép:

* upload ảnh,
* video,
* GPS,
* realtime tracking.

Workflow:

```txt
Người dân
→ AI phân loại
→ Chuyển cán bộ
→ Xử lý
→ Phản hồi
```

---

# E. DASHBOARD ĐIỀU HÀNH

Dashboard cho:

* Bí thư,
* Trưởng khu phố,
* Công an,
* Đoàn thể.

Realtime charts:

* phản ánh,
* dân cư,
* KPI,
* an sinh,
* an ninh.

---

# F. GIS MAP

Sử dụng:

* LeafletJS
* OpenStreetMap

Lớp dữ liệu:

* hộ dân,
* camera,
* tuyến đường,
* phản ánh,
* đèn đường,
* an sinh.

---

# G. DÂN CƯ

Module:

* hộ dân,
* nhân khẩu,
* tạm trú,
* an sinh,
* lịch sử thay đổi.

---

# H. THÔNG BÁO

Hỗ trợ:

* push notification,
* email,
* SMS,
* Zalo.

---

# I. KPI & WORKFLOW

Workflow engine:

* giao việc,
* SLA,
* KPI,
* theo dõi tiến độ.

---

# 9. AUTHENTICATION & SECURITY

Bắt buộc:

* JWT
* Refresh Token
* RBAC
* CSRF Protection
* XSS Protection
* Encryption
* Audit Logs

---

# 10. ROLE SYSTEM

| Role         | Quyền      |
| ------------ | ---------- |
| Super Admin  | Toàn quyền |
| Admin Phường | Quản trị   |
| Bí thư       | Điều hành  |
| Trưởng KP    | Quản lý    |
| Công an      | An ninh    |
| Đoàn thể     | Hoạt động  |
| Người dân    | Tương tác  |

---

# 11. DATABASE RULES

Mọi bảng phải có:

```sql
id
created_at
updated_at
deleted_at
created_by
updated_by
```

Soft delete bắt buộc.

---

# 12. AI RULES

## CHATBOT

Phải:

* tự nhiên,
* lịch sự,
* hỗ trợ tiếng Việt chuẩn,
* dễ hiểu với người lớn tuổi.

---

## AI MEMORY

Lưu:

* lịch sử hội thoại,
* ngữ cảnh,
* semantic memory.

---

## RAG

Nguồn dữ liệu:

* PDF
* DOCX
* Google Sheets
* nghị quyết
* thông báo
* văn bản hành chính

---

# 13. PERFORMANCE RULES

Mục tiêu:

* Lighthouse > 90
* First Load < 3s
* Mobile optimized
* Edge caching

---

# 14. ACCESSIBILITY

Bắt buộc:

* keyboard navigation
* contrast chuẩn
* screen-reader friendly
* font readable

---

# 15. LOGGING

Structured logging:

* request logs
* auth logs
* audit logs
* AI logs
* workflow logs

---

# 16. FILES BẮT BUỘC

Generate đầy đủ:

* README.md
* CLAUDE.md
* AGENTS.md
* .env.example
* docker-compose.yml
* Dockerfile
* prisma schema
* API docs
* deployment docs
* architecture docs

---

# 17. DEPLOYMENT

Hỗ trợ:

* Vercel
* Railway
* VPS
* Docker
* Supabase
* Cloudflare

---

# 18. ENVIRONMENT VARIABLES

Ví dụ:

```env
DATABASE_URL=
REDIS_URL=
OPENAI_API_KEY=
GEMINI_API_KEY=
JWT_SECRET=
NEXT_PUBLIC_API_URL=
```

---

# 19. DOCUMENTATION RULES

Tài liệu phải:

* đầy đủ,
* rõ ràng,
* dễ bảo trì,
* tiếng Việt 100%.

---

# 20. CODE QUALITY

Bắt buộc:

* ESLint
* Prettier
* Husky
* Commitlint
* Conventional Commits

---

# 21. TESTING

Generate:

* unit tests
* integration tests
* e2e tests

Framework:

* Vitest
* Playwright

---

# 22. KHÔNG ĐƯỢC LÀM

Không:

* hardcode
* any type
* mock UI sơ sài
* code demo
* duplicated logic

---

# 23. PHẢI LÀM

Phải:

* scalable,
* maintainable,
* production-ready,
* clean architecture,
* reusable.

---

# 24. NGÔN NGỮ

Toàn bộ:

* giao diện,
* docs,
* labels,
* comments,
* chatbot,
* dashboard

PHẢI:

# TIẾNG VIỆT 100%

---

# 25. MỤC TIÊU CUỐI CÙNG

Hệ thống phải đủ chất lượng để:

* triển khai thật tại Khu phố 25,
* vận hành 24/7,
* mở rộng cấp phường,
* nhân rộng toàn TP.HCM.

---

# 26. TINH THẦN THIẾT KẾ

Đây không phải:

> “website hành chính”

Đây là:

> “Hệ điều hành số cho cộng đồng dân cư”

Thiết kế theo tư duy:

* Smart Community OS
* AI Governance
* Community Intelligence
* Digital Neighborhood Infrastructure

---

```
```
