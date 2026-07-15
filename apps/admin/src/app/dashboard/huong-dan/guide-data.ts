import { KHU_PHO } from '@/lib/khu-pho'
// Dữ liệu hướng dẫn sử dụng — Dashboard điều hành KP25 (cán bộ)

export interface GuideStep { title: string; detail: string }
export interface GuideSection {
  id:     string
  icon:   string
  title:  string
  desc:   string
  nhom:   string   // nhóm phân loại
  href?:  string
  steps:  GuideStep[]
  tips?:  string[]
}

export const NHOM_LIST = [
  'Bắt đầu', 'Dân cư', 'Thu thập dữ liệu', 'Nghiệp vụ', 'An sinh', 'Truyền thông', 'AI & Báo cáo', 'Hệ thống',
] as const

export const GUIDE_SECTIONS: GuideSection[] = [
  // ── BẮT ĐẦU ──
  {
    id: 'tong-quan', nhom: 'Bắt đầu', icon: '🎛️',
    title: 'Tổng quan hệ thống',
    desc: `${KHU_PHO.ma} Admin là hệ điều hành số quản lý toàn diện ${KHU_PHO.ten} — dân cư, phản ánh, an sinh, AI.`,
    steps: [
      { title: 'Đăng nhập', detail: 'Truy cập smart-kp25-admin.vercel.app, đăng nhập bằng email cán bộ đã được cấp.' },
      { title: 'Phân quyền theo vai trò', detail: 'Mỗi vai trò (Bí thư, Trưởng KP, Công an, An ninh, Phụ trách NCT) thấy các menu phù hợp với nhiệm vụ.' },
      { title: 'Menu trái', detail: 'Điều hướng theo nhóm: Tổng quan, Trí tuệ nhân tạo, Nghiệp vụ, An sinh, Hệ thống.' },
      { title: 'Tìm kiếm nhanh', detail: 'Ô tìm kiếm trên cùng (Ctrl/⌘ + K) tìm nhanh hộ dân, phản ánh, thủ tục...' },
    ],
    tips: ['Mọi thao tác đều được ghi vào Nhật ký hoạt động để truy vết và minh bạch.'],
  },
  {
    id: 'dashboard', nhom: 'Bắt đầu', icon: '📊',
    title: 'Dashboard điều hành',
    desc: 'Trang tổng quan hiển thị số liệu realtime của khu phố.',
    href: '/dashboard',
    steps: [
      { title: 'Số liệu hôm nay', detail: 'Phản ánh mới, đã xử lý, thông báo, phản ánh khẩn cấp — cập nhật theo thời gian thực.' },
      { title: 'Thống kê tổng', detail: 'Hộ dân, nhân khẩu, tỷ lệ xử lý, an sinh, sự kiện.' },
      { title: 'Biểu đồ xu hướng', detail: 'Theo dõi diễn biến phản ánh, dân cư theo thời gian.' },
      { title: 'Tự làm mới', detail: 'Dữ liệu tự cập nhật mỗi 60 giây hoặc khi có biến động (realtime).' },
    ],
  },
  // ── DÂN CƯ ──
  {
    id: 'quan-ly-dan-cu', nhom: 'Dân cư', icon: '👥',
    title: 'Quản lý hộ dân & nhân khẩu',
    desc: 'Xem, thêm, sửa thông tin hộ dân và từng nhân khẩu.',
    href: '/dashboard/dan-cu',
    steps: [
      { title: 'Danh sách hộ dân', detail: 'Xem toàn bộ hộ, lọc theo trạng thái cư trú, tìm theo tên/địa chỉ.' },
      { title: 'Thêm hộ dân', detail: 'Nút "Thêm hộ dân" → điền chủ hộ, số nhà, đường/hẻm, tổ/khu vực, địa chỉ, cư trú.' },
      { title: 'Xem chi tiết hộ', detail: 'Nhấn vào hộ để xem đầy đủ thông tin + danh sách nhân khẩu.' },
      { title: 'Quản lý nhân khẩu', detail: 'Thêm/sửa nhân khẩu, mở "Thông tin chi tiết" để khai đủ (dân tộc, hôn nhân, CCCD...), đặt chủ hộ, đánh dấu đã mất.' },
      { title: 'Mã QR hộ dân', detail: 'Mỗi hộ có nút "QR" để tải/in/cấp mã QR cho người dân tự tra cứu & cập nhật.' },
    ],
    tips: ['Dùng nút "Dọn trùng CCCD" để gộp các nhân khẩu bị nhập trùng số CCCD.'],
  },
  // ── THU THẬP DỮ LIỆU ──
  {
    id: 'nhap-excel', nhom: 'Thu thập dữ liệu', icon: '📥',
    title: 'Nhập dữ liệu từ Excel',
    desc: 'Import hàng loạt hộ dân và nhân khẩu từ file Excel/Google Sheets.',
    href: '/dashboard/dan-cu/nhap-excel',
    steps: [
      { title: 'Tải mẫu Excel', detail: 'Dùng đúng cấu trúc cột mẫu để hệ thống đọc chính xác.' },
      { title: 'Dán dữ liệu hoặc tải file', detail: 'Hỗ trợ dán từ Google Sheets công khai hoặc tải file Excel.' },
      { title: 'Kiểm tra & xác nhận', detail: 'Hệ thống hiển thị bản xem trước, báo lỗi từng dòng trước khi import.' },
      { title: 'Import', detail: 'Nhập hàng loạt theo batch — phù hợp với 1400+ nhân khẩu.' },
    ],
    tips: ['Đây là cách nhanh nhất để khởi tạo dữ liệu ban đầu từ sổ hộ khẩu / file UBND Phường.'],
  },
  {
    id: 'quet-cccd', nhom: 'Thu thập dữ liệu', icon: '🪪',
    title: 'Quét CCCD bằng AI',
    desc: 'Chụp ảnh CCCD → AI tự động trích xuất thông tin → lưu vào hộ.',
    href: '/dashboard/dan-cu/quet-cccd',
    steps: [
      { title: 'Chọn hộ dân', detail: 'Tìm và chọn hộ sẽ thêm nhân khẩu.' },
      { title: 'Chụp/tải ảnh CCCD', detail: 'Chụp mặt trước CCCD rõ nét, đủ sáng.' },
      { title: 'AI trích xuất', detail: 'Gemini Vision đọc: họ tên, CCCD, ngày sinh, giới tính, quê quán, ngày cấp...' },
      { title: 'Kiểm tra & lưu', detail: 'Xem lại, chỉnh sửa nếu cần, chọn quan hệ chủ hộ rồi lưu.' },
    ],
    tips: ['Nhanh gấp 10 lần gõ tay. AI luôn cho xem lại trước khi lưu — bạn toàn quyền kiểm soát.'],
  },
  {
    id: 'cap-nhat-nhanh', nhom: 'Thu thập dữ liệu', icon: '⚡',
    title: 'Cập nhật nhanh biến động dân cư',
    desc: 'Ghi nhận nhanh: sinh, mất, chuyển đến/đi, tạm trú/vắng, hộ nghèo, thoát nghèo.',
    href: '/dashboard/dan-cu/su-kien-nhanh',
    steps: [
      { title: 'Chọn loại sự kiện', detail: 'Nhấn vào loại biến động (khai sinh, khai tử, chuyển đến...).' },
      { title: 'Chọn hộ/người', detail: 'Tìm hộ, chọn người liên quan.' },
      { title: 'Điền tối thiểu', detail: 'Chỉ điền vài trường cần thiết cho loại sự kiện đó.' },
      { title: 'Ghi nhận', detail: 'Hệ thống tự cập nhật DB + ghi vào sổ nhật ký + audit log.' },
    ],
    tips: ['Phù hợp khi cán bộ đi thực địa, cập nhật ngay tại nhà dân từ điện thoại.'],
  },
  {
    id: 'ho-so-thieu', nhom: 'Thu thập dữ liệu', icon: '📋',
    title: 'Hồ sơ thiếu thông tin',
    desc: 'Rà soát hồ sơ chưa đầy đủ và bổ sung nhanh.',
    href: '/dashboard/dan-cu/ho-so-thieu',
    steps: [
      { title: 'Xem độ hoàn thiện', detail: 'Thống kê % hoàn thiện trung bình, số hồ sơ đầy đủ / cần bổ sung.' },
      { title: 'Lọc theo trường thiếu', detail: 'Nhấn chip "Thiếu CCCD", "Thiếu ngày sinh"... để lọc nhanh.' },
      { title: 'Sửa inline', detail: 'Nhấn vào hồ sơ → điền ngay các trường còn thiếu → lưu.' },
    ],
  },
  // ── NGHIỆP VỤ ──
  {
    id: 'duyet-tu-khai', nhom: 'Nghiệp vụ', icon: '📨',
    title: 'Duyệt thông tin tự khai',
    desc: 'Xác nhận thông tin do người dân tự khai qua QR trước khi cập nhật chính thức.',
    href: '/dashboard/dan-cu/duyet-cap-nhat',
    steps: [
      { title: 'Xem yêu cầu chờ duyệt', detail: 'Danh sách người dân đã gửi cập nhật qua QR.' },
      { title: 'So sánh cũ → mới', detail: 'Hệ thống hiện giá trị hiện tại và đề xuất mới cạnh nhau.' },
      { title: 'Chỉnh & duyệt', detail: 'Sửa nếu cần rồi nhấn "Duyệt & cập nhật" — áp dụng vào hồ sơ. Hoặc "Từ chối".' },
    ],
  },
  {
    id: 'duyet-ho-moi', nhom: 'Nghiệp vụ', icon: '🏠',
    title: 'Duyệt đăng ký hộ dân mới',
    desc: 'Xác minh hộ mới tự khai → tạo hồ sơ chính thức → cấp mã QR ngay.',
    href: '/dashboard/dan-cu/duyet-ho-moi',
    steps: [
      { title: 'Xem đăng ký chờ duyệt', detail: 'Hộ mới chuyển đến đã khai báo thông tin + thành viên.' },
      { title: 'Xác minh & chỉnh sửa', detail: 'Kiểm tra, sửa thông tin hộ và thành viên nếu cần.' },
      { title: 'Duyệt & tạo hồ sơ', detail: 'Nhấn "Duyệt & tạo hồ sơ" → tự tạo hộ dân + nhân khẩu.' },
      { title: 'Cấp QR ngay', detail: 'Modal QR hiện ngay — tải/in/gửi mã QR cho hộ.' },
    ],
  },
  {
    id: 'phan-anh', nhom: 'Nghiệp vụ', icon: '🔴',
    title: 'Xử lý phản ánh hiện trường',
    desc: 'Tiếp nhận, phân loại và xử lý phản ánh của người dân.',
    href: '/dashboard/phan-anh',
    steps: [
      { title: 'Danh sách phản ánh', detail: 'Lọc theo trạng thái, loại, mức độ. AI tự phân loại & tóm tắt.' },
      { title: 'Xem chi tiết', detail: 'Ảnh/video, vị trí GPS, phân tích AI, thông tin người gửi.' },
      { title: 'Cập nhật trạng thái', detail: 'Chuyển: Mới → Đang xử lý → Đã xử lý. Người dân thấy cập nhật realtime.' },
      { title: 'Phản hồi', detail: 'Ghi kết quả xử lý để người dân theo dõi.' },
    ],
  },
  {
    id: 'workflow', nhom: 'Nghiệp vụ', icon: '🔀',
    title: 'Workflow AI — Giao việc & SLA',
    desc: 'Phân công xử lý phản ánh, theo dõi tiến độ và thời hạn (SLA).',
    href: '/dashboard/workflow',
    steps: [
      { title: 'Bảng công việc', detail: 'Kéo-thả phản ánh giữa các cột trạng thái.' },
      { title: 'AI đề xuất', detail: 'AI gợi ý đơn vị xử lý, mức ưu tiên, hướng giải quyết.' },
      { title: 'Phân công & SLA', detail: 'Giao cho cán bộ phụ trách, đặt thời hạn xử lý.' },
      { title: 'Theo dõi quá hạn', detail: 'Hệ thống cảnh báo việc sắp/đã quá hạn.' },
    ],
  },
  {
    id: 'tam-tru', nhom: 'Nghiệp vụ', icon: '🚪',
    title: 'Tạm trú / Tạm vắng',
    desc: 'Duyệt và quản lý hồ sơ đăng ký tạm trú, khai báo tạm vắng.',
    href: '/dashboard/dan-cu/tam-tru-tam-vang',
    steps: [
      { title: 'Danh sách hồ sơ', detail: 'Xem hồ sơ tạm trú/tạm vắng người dân đã nộp online.' },
      { title: 'Xét duyệt', detail: 'Kiểm tra thông tin, xác nhận hoặc yêu cầu bổ sung.' },
      { title: 'Theo dõi hạn', detail: 'Cảnh báo tạm trú sắp hết hạn, tạm vắng quá hạn.' },
    ],
  },
  // ── AN SINH ──
  {
    id: 'an-sinh', nhom: 'An sinh', icon: '❤️',
    title: 'An sinh xã hội',
    desc: 'Quản lý BHYT, hộ nghèo/cận nghèo, người cao tuổi.',
    href: '/dashboard/an-sinh',
    steps: [
      { title: 'Tổng quan an sinh', detail: 'Thống kê BHYT, hộ nghèo, người cao tuổi đang quản lý.' },
      { title: 'Bảo hiểm Y tế', detail: 'Quản lý thẻ BHYT, theo dõi hạn thẻ, xuất danh sách.' },
      { title: 'Hộ nghèo / cận nghèo', detail: 'Danh sách, công nhận, thoát nghèo, hỗ trợ.' },
      { title: 'Người cao tuổi', detail: 'Hồ sơ NCT, tình trạng sức khỏe, trợ cấp, người chăm sóc.' },
    ],
  },
  // ── TRUYỀN THÔNG ──
  {
    id: 'chien-dich', nhom: 'Truyền thông', icon: '📣',
    title: 'Chiến dịch mời tự khai',
    desc: 'Gửi link tự khai cá nhân hóa qua SMS + thông báo nhóm Zalo.',
    href: '/dashboard/dan-cu/chien-dich-tu-khai',
    steps: [
      { title: 'Gửi SMS hàng loạt', detail: 'Mỗi hộ nhận link QR riêng qua SMS. Gửi theo batch, chống trùng, có thanh tiến trình.' },
      { title: 'Kiểm tra chi phí', detail: 'Xem số SMS sẽ gửi + nhắc kiểm tra số dư ESMS trước khi gửi.' },
      { title: 'Tin nhắn Zalo Group', detail: `Tạo sẵn thông báo phát động → sao chép → dán vào nhóm Zalo Cộng đồng ${KHU_PHO.ma}.` },
      { title: 'Theo dõi phản hồi', detail: 'Banner hiện số yêu cầu chờ duyệt → liên kết sang trang Duyệt tự khai.' },
    ],
  },
  {
    id: 'thong-bao', nhom: 'Truyền thông', icon: '🔔',
    title: 'Thông báo, Push & Zalo',
    desc: 'Gửi thông báo đến người dân qua nhiều kênh.',
    href: '/dashboard/thong-bao',
    steps: [
      { title: 'Thông báo', detail: 'Soạn và đăng thông báo lên cổng người dân.' },
      { title: 'Thông báo đẩy (Push)', detail: 'Gửi push notification đến điện thoại đã đăng ký.' },
      { title: 'Zalo OA & Group', detail: 'Gửi qua Official Account hoặc tạo nội dung dán vào nhóm Zalo.' },
    ],
  },
  {
    id: 'su-kien', nhom: 'Truyền thông', icon: '📅',
    title: 'Sự kiện',
    desc: 'Tạo và quản lý sự kiện, hoạt động khu phố.',
    href: '/dashboard/su-kien',
    steps: [
      { title: 'Tạo sự kiện', detail: 'Họp khu phố, hoạt động cộng đồng — thời gian, địa điểm, mô tả.' },
      { title: 'Quản lý đăng ký', detail: 'Xem danh sách người dân đăng ký tham gia.' },
    ],
  },
  {
    id: 'ban-do', nhom: 'Truyền thông', icon: '🗺️',
    title: 'Bản đồ GIS',
    desc: 'Bản đồ số hiển thị hộ dân, phản ánh, các lớp dữ liệu.',
    href: '/dashboard/ban-do',
    steps: [
      { title: 'Xem bản đồ', detail: 'Hiển thị vị trí hộ dân, phản ánh trên nền OpenStreetMap.' },
      { title: 'Lọc lớp dữ liệu', detail: 'Bật/tắt các lớp: hộ dân, phản ánh theo loại...' },
    ],
  },
  // ── AI & BÁO CÁO ──
  {
    id: 'tro-ly-ai', nhom: 'AI & Báo cáo', icon: '🤖',
    title: 'Trợ lý AI & Phân tích',
    desc: 'AI hỗ trợ cán bộ tra cứu, phân tích và soạn văn bản.',
    href: '/dashboard/ai',
    steps: [
      { title: 'Trợ lý AI', detail: 'Hỏi đáp về tình hình khu phố, thủ tục, soạn thảo — có RAG tra cứu tài liệu nội bộ.' },
      { title: 'AI Phân tích', detail: 'Tự động phân tích dữ liệu cộng đồng và tạo báo cáo tổng hợp.' },
      { title: 'Nhúng văn bản RAG', detail: 'Nạp nghị quyết, văn bản hành chính để AI tra cứu chính xác (chỉ Bí thư/Trưởng KP).' },
    ],
  },
  {
    id: 'bao-cao', nhom: 'AI & Báo cáo', icon: '📈',
    title: 'Báo cáo & KPI',
    desc: 'Xem và xuất báo cáo thống kê khu phố.',
    href: '/dashboard/bao-cao',
    steps: [
      { title: 'Báo cáo tổng hợp', detail: 'Dân cư, phản ánh, an sinh theo kỳ.' },
      { title: 'Xuất file', detail: 'Xuất Word/Excel để báo cáo cấp trên.' },
    ],
  },
  {
    id: 'tai-lieu', nhom: 'AI & Báo cáo', icon: '📄',
    title: 'Tài liệu & Soạn văn bản AI',
    desc: 'Quản lý tài liệu và soạn văn bản hành chính có AI hỗ trợ.',
    href: '/dashboard/tai-lieu',
    steps: [
      { title: 'Kho tài liệu', detail: 'Lưu trữ nghị quyết, thông báo, văn bản.' },
      { title: 'Soạn văn bản AI', detail: 'AI gợi ý soạn thảo công văn, thông báo theo văn phong hành chính.' },
    ],
  },
  // ── HỆ THỐNG ──
  {
    id: 'nhat-ky', nhom: 'Hệ thống', icon: '📜',
    title: 'Nhật ký hoạt động',
    desc: 'Truy vết mọi thao tác trên hệ thống (audit log).',
    href: '/dashboard/audit-logs',
    steps: [
      { title: 'Xem nhật ký', detail: 'Ai làm gì, lúc nào, trên bản ghi nào.' },
      { title: 'Lọc & tìm kiếm', detail: 'Theo hành động, bảng dữ liệu, cán bộ, thời gian.' },
    ],
    tips: ['Đảm bảo minh bạch và truy vết khi cần đối chiếu.'],
  },
  {
    id: 'phan-quyen', nhom: 'Hệ thống', icon: '🛡️',
    title: 'Phân quyền & Cài đặt',
    desc: 'Quản lý tài khoản cán bộ và cấu hình hệ thống (chỉ Bí thư).',
    href: '/dashboard/phan-quyen',
    steps: [
      { title: 'Quản lý cán bộ', detail: 'Thêm/sửa tài khoản, gán vai trò.' },
      { title: 'Phân quyền', detail: 'Mỗi vai trò có quyền truy cập menu khác nhau.' },
      { title: 'Cài đặt', detail: 'Cấu hình thông tin khu phố, thiết lập hệ thống.' },
    ],
  },
]
