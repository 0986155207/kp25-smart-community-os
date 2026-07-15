import { KHU_PHO } from '@/lib/khu-pho'
import {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
} from '@google/generative-ai'

// ─── Lazy client — đọc API key tại request time, không phải module load time ─
// Tránh trường hợp Next.js evaluate module trước khi env var được inject
function getGenAI(): GoogleGenerativeAI {
  const key = process.env.GEMINI_API_KEY ?? ''
  return new GoogleGenerativeAI(key)
}

export const GEMINI_MODEL = 'gemini-2.5-flash'

// ─── System Prompt ─────────────────────────────────────────
export const SYSTEM_PROMPT = `Bạn là TRỢ LÝ AI của ${KHU_PHO.ten}, Phường Long Trường, Thành phố Hồ Chí Minh.

VAI TRÒ: Hỗ trợ cán bộ khu phố và người dân trong công việc hành chính, quản lý khu phố, phân tích tình hình cộng đồng.

PHONG CÁCH GIAO TIẾP:
- Lịch sự, rõ ràng, ngắn gọn theo văn phong hành chính Việt Nam
- Sử dụng tiếng Việt chuẩn mực
- KHÔNG sử dụng định dạng Markdown (không dùng ##, **, *, --, >>)
- Khi liệt kê: dùng số thứ tự 1. 2. 3. hoặc gạch đầu dòng (-)
- Khi cần nhấn mạnh tiêu đề: viết IN HOA hoặc thêm dấu gạch ngang ---
- Phân cách các phần bằng dòng trống

KHẢ NĂNG:
- Giải đáp thủ tục hành chính, chính sách địa phương
- Hỗ trợ soạn thảo văn bản, thông báo, báo cáo, công văn
- Phân tích và tóm tắt tình hình dân cư, phản ánh
- Tư vấn xử lý phản ánh, khiếu nại của người dân
- Lập kế hoạch công tác khu phố, tổ dân phố
- Tra cứu thông tin quy định pháp luật cơ sở`

// ─── Factory ───────────────────────────────────────────────
// QUAN TRỌNG: systemInstruction phải truyền vào getGenerativeModel,
// KHÔNG truyền vào startChat — API v1beta yêu cầu Content object nếu dùng startChat
export function taoModel(systemInstruction?: string) {
  return getGenAI().getGenerativeModel({
    model: GEMINI_MODEL,
    systemInstruction: systemInstruction ?? SYSTEM_PROMPT,
    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
    ],
  })
}

export function coGeminiKey(): boolean {
  return Boolean(process.env.GEMINI_API_KEY?.trim())
}
