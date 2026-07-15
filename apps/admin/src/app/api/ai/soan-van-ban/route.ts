import { KHU_PHO } from '@/lib/khu-pho'
import { NextRequest } from 'next/server'
import { taoModel, coGeminiKey } from '@/lib/gemini'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

// ── Prompt template cho từng loại văn bản ─────────────────────
const TEMPLATE_PROMPT: Record<string, (data: Record<string, string>) => string> = {

  NGHI_QUYET: (d) => `Soạn NGHỊ QUYẾT HỘI NGHỊ CHI BỘ / KHU PHỐ với thông tin sau:

Tên chi bộ/đơn vị: ${d.don_vi ?? 'Chi bộ {KHU_PHO.ten}'}
Số hiệu nghị quyết: ${d.so_hieu ?? ''}
Địa điểm: ${d.dia_diem ?? 'Nhà văn hoá {KHU_PHO.ten}'}
Thời gian: ${d.thoi_gian ?? ''}
Chủ trì: ${d.chu_tri ?? ''}
Thư ký: ${d.thu_ky ?? ''}
Tổng số thành phần tham dự: ${d.thanh_phan ?? ''}
Nội dung chính cần nghị quyết:
${d.noi_dung ?? ''}
Các quyết nghị cụ thể (nếu có):
${d.quyet_nghi ?? ''}`,

  BIEN_BAN: (d) => `Soạn BIÊN BẢN HỌP KHU PHỐ với thông tin sau:

Tên cuộc họp: ${d.ten_cuoc_hop ?? 'Họp khu phố định kỳ'}
Số biên bản: ${d.so_hieu ?? ''}
Địa điểm: ${d.dia_diem ?? 'Nhà văn hoá {KHU_PHO.ten}'}
Thời gian bắt đầu: ${d.thoi_gian_bat_dau ?? ''}
Thời gian kết thúc: ${d.thoi_gian_ket_thuc ?? ''}
Chủ trì: ${d.chu_tri ?? ''}
Thư ký: ${d.thu_ky ?? ''}
Thành phần tham dự: ${d.thanh_phan ?? ''}
Nội dung thảo luận:
${d.noi_dung ?? ''}
Kết luận/Quyết định:
${d.ket_luan ?? ''}`,

  BAO_CAO: (d) => `Soạn BÁO CÁO TỔNG KẾT / CÔNG TÁC với thông tin sau:

Tên báo cáo: ${d.tieu_de ?? 'Báo cáo công tác khu phố'}
Số hiệu: ${d.so_hieu ?? ''}
Kỳ báo cáo: ${d.ky_bao_cao ?? ''}
Đơn vị báo cáo: ${d.don_vi ?? '{KHU_PHO.ten}, Phường Long Trường'}
Kết quả đạt được:
${d.ket_qua ?? ''}
Hạn chế, tồn tại:
${d.han_che ?? ''}
Phương hướng, nhiệm vụ sắp tới:
${d.phuong_huong ?? ''}
Kiến nghị, đề xuất:
${d.kien_nghi ?? ''}`,

  THONG_BAO: (d) => `Soạn THÔNG BÁO với thông tin sau:

Tiêu đề thông báo: ${d.tieu_de ?? ''}
Số hiệu: ${d.so_hieu ?? ''}
Kính gửi / Đối tượng nhận: ${d.kinh_gui ?? 'Toàn thể hộ dân {KHU_PHO.ten}'}
Nội dung cần thông báo:
${d.noi_dung ?? ''}
Thời hạn thực hiện (nếu có): ${d.thoi_han ?? ''}
Yêu cầu cụ thể: ${d.yeu_cau ?? ''}`,

  QUY_CHE: (d) => `Soạn QUY CHẾ / NỘI QUY với thông tin sau:

Tên quy chế: ${d.tieu_de ?? ''}
Số hiệu: ${d.so_hieu ?? ''}
Đối tượng áp dụng: ${d.doi_tuong ?? 'Ban quản lý và toàn thể hộ dân {KHU_PHO.ten}'}
Phạm vi điều chỉnh: ${d.pham_vi ?? ''}
Nội dung chính cần quy định:
${d.noi_dung ?? ''}
Số chương/điều dự kiến: ${d.so_chuong ?? '4 chương, 12 điều'}`,

  HUONG_DAN: (d) => `Soạn VĂN BẢN HƯỚNG DẪN / QUY TRÌNH với thông tin sau:

Tiêu đề hướng dẫn: ${d.tieu_de ?? ''}
Số hiệu: ${d.so_hieu ?? ''}
Đối tượng thực hiện: ${d.doi_tuong ?? 'Hộ dân {KHU_PHO.ten}'}
Thủ tục/Quy trình cần hướng dẫn:
${d.noi_dung ?? ''}
Hồ sơ cần chuẩn bị: ${d.ho_so ?? ''}
Thời gian giải quyết: ${d.thoi_gian ?? ''}
Cơ quan tiếp nhận: ${d.co_quan ?? ''}`,

  KHAC: (d) => `Soạn văn bản hành chính với nội dung sau:

Tiêu đề: ${d.tieu_de ?? ''}
Số hiệu: ${d.so_hieu ?? ''}
Đơn vị: ${d.don_vi ?? '{KHU_PHO.ten}, Phường Long Trường, TP.HCM'}
Nội dung chính:
${d.noi_dung ?? ''}`,
}

const SYSTEM_SOAN_THAO = `Bạn là chuyên gia soạn thảo văn bản hành chính Việt Nam cấp cơ sở (khu phố, phường).

QUY TẮC BẮT BUỘC:
- Viết bằng tiếng Việt chuẩn mực, trang trọng, đúng thể thức hành chính
- TUYỆT ĐỐI không dùng Markdown (không ##, **, *, --, >>)
- Tiêu đề phần: viết IN HOA, thêm dấu gạch ngang hai phía --- TIÊU ĐỀ ---
- Danh mục: dùng số thứ tự (1. 2. 3.) hoặc điều khoản (Điều 1. Điều 2.)
- Mỗi phần cách nhau 1 dòng trắng
- Cuối văn bản có phần ký tên đầy đủ theo thể thức hành chính

CẤU TRÚC VĂN BẢN:
- Phần mở đầu: Quốc hiệu, tiêu ngữ, tên cơ quan, số hiệu, địa danh ngày tháng
- Phần nội dung: đầy đủ, chi tiết, logic
- Phần kết: nơi nhận, ký tên, chức danh

ĐƠN VỊ: ${KHU_PHO.ten}, Phường Long Trường, Thành phố Hồ Chí Minh`

export async function POST(req: NextRequest) {
  if (!coGeminiKey()) {
    return Response.json({ error: 'Chưa cấu hình GEMINI_API_KEY' }, { status: 503 })
  }

  try {
    const { loai, du_lieu } = (await req.json()) as {
      loai:    string
      du_lieu: Record<string, string>
    }

    const templateFn = TEMPLATE_PROMPT[loai] ?? TEMPLATE_PROMPT['KHAC']!
    const prompt = `${templateFn(du_lieu)}

YÊU CẦU:
Soạn văn bản hoàn chỉnh, đúng thể thức hành chính Việt Nam.
Nội dung đầy đủ, cụ thể, phù hợp với cấp khu phố.
Không dùng Markdown. Không thêm ghi chú hay giải thích bên ngoài văn bản.`

    const model  = taoModel(SYSTEM_SOAN_THAO)
    const result = await model.generateContentStream(prompt)

    const encoder = new TextEncoder()
    const stream  = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text()
            if (text) controller.enqueue(encoder.encode(text))
          }
        } catch (e) {
          console.error('[SoanVanBan stream]', e)
          controller.enqueue(encoder.encode('\n\nLỗi trong quá trình tạo văn bản.'))
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type':      'text/plain; charset=utf-8',
        'Cache-Control':     'no-cache, no-store',
        'X-Accel-Buffering': 'no',
      },
    })
  } catch (err) {
    console.error('[SoanVanBan]', err)
    return Response.json({ error: 'Lỗi tạo văn bản' }, { status: 500 })
  }
}
