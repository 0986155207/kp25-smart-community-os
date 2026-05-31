// Dữ liệu hướng dẫn sử dụng — Portal người dân KP25

export interface GuideStep { title: string; detail: string }
export interface GuideSection {
  id:     string
  icon:   string   // emoji
  title:  string
  desc:   string
  href?:  string   // link tới tính năng
  steps:  GuideStep[]
  tips?:  string[]
}

export const GUIDE_SECTIONS: GuideSection[] = [
  {
    id: 'tong-quan',
    icon: '🏘️',
    title: 'Giới thiệu chung',
    desc: 'KP25 Smart Community là cổng dịch vụ số của Khu phố 25 — phục vụ người dân 24/7, không cần đến trụ sở.',
    steps: [
      { title: 'Truy cập mọi lúc, mọi nơi', detail: 'Mở bằng trình duyệt điện thoại hoặc máy tính tại smart-kp25-web.vercel.app. Không cần cài đặt.' },
      { title: 'Cài như ứng dụng (tùy chọn)', detail: 'Trên điện thoại, chọn "Thêm vào màn hình chính" để mở nhanh như một app riêng, dùng được cả khi mạng yếu.' },
      { title: 'Hoàn toàn miễn phí', detail: 'Tất cả dịch vụ trên cổng đều miễn phí. Thông tin được bảo mật theo Nghị định 13/2023/NĐ-CP.' },
    ],
    tips: ['Nếu cần hỗ trợ, gọi Trưởng khu phố 0773 735 317 hoặc dùng "Hỏi AI" ngay trên cổng.'],
  },
  {
    id: 'phan-anh',
    icon: '📸',
    title: 'Gửi phản ánh hiện trường',
    desc: 'Báo cáo các vấn đề trong khu phố: an ninh, môi trường, hạ tầng, đèn đường, giao thông...',
    href: '/phan-anh/tao',
    steps: [
      { title: 'Vào mục "Phản ánh" → "Gửi phản ánh"', detail: 'Hoặc nhấn nút "Phản ánh" màu đỏ ở góc trên bên phải.' },
      { title: 'Chọn loại & mức độ', detail: 'Chọn loại vấn đề (môi trường, an ninh...) và mức độ khẩn cấp.' },
      { title: 'Mô tả & chụp ảnh/video', detail: 'Viết mô tả ngắn gọn, đính kèm ảnh hoặc video hiện trường để cán bộ nắm rõ.' },
      { title: 'Lấy vị trí GPS', detail: 'Nhấn "Lấy vị trí GPS tự động" để đánh dấu chính xác nơi xảy ra sự việc trên bản đồ.' },
      { title: 'Nhập thông tin liên hệ & gửi', detail: 'Điền họ tên và số điện thoại để cán bộ liên hệ phản hồi, rồi nhấn "Gửi phản ánh".' },
    ],
    tips: [
      'Sau khi gửi, bạn nhận được mã phản ánh để theo dõi.',
      'Theo dõi tiến độ tại "Tra cứu" → "Theo dõi phản ánh" bằng số điện thoại đã gửi.',
    ],
  },
  {
    id: 'theo-doi-phan-anh',
    icon: '🔍',
    title: 'Theo dõi phản ánh đã gửi',
    desc: 'Xem trạng thái xử lý phản ánh của bạn theo thời gian thực.',
    href: '/phan-anh/theo-doi',
    steps: [
      { title: 'Vào "Tra cứu" → "Theo dõi phản ánh"', detail: 'Nhập số điện thoại đã dùng khi gửi phản ánh.' },
      { title: 'Xem danh sách phản ánh', detail: 'Hệ thống hiển thị tất cả phản ánh của bạn cùng trạng thái: Chờ tiếp nhận → Đang xử lý → Đã xử lý xong.' },
      { title: 'Xem chi tiết & cập nhật realtime', detail: 'Nhấn vào từng phản ánh để xem tiến độ chi tiết. Trạng thái tự cập nhật khi cán bộ xử lý.' },
    ],
  },
  {
    id: 'dang-ky-cu-tru',
    icon: '🏠',
    title: 'Đăng ký tạm trú / tạm vắng',
    desc: 'Khai báo cư trú trực tuyến theo Luật Cư trú 2020 — không cần xếp hàng.',
    href: '/dang-ky',
    steps: [
      { title: 'Vào mục "Đăng ký"', detail: 'Chọn "Đăng ký Tạm trú" (từ nơi khác đến) hoặc "Khai báo Tạm vắng" (rời KP25 trên 30 ngày).' },
      { title: 'Điền thông tin cá nhân & CCCD', detail: 'Nhập đầy đủ họ tên, số CCCD, thông tin liên hệ.' },
      { title: 'Nhập địa chỉ & thời gian', detail: 'Địa chỉ tạm trú/nơi đến, lý do, ngày bắt đầu - kết thúc.' },
      { title: 'Gửi & chờ xác nhận', detail: 'Cán bộ xem xét trong 1-3 ngày làm việc và phản hồi qua điện thoại.' },
    ],
    tips: [
      'Tạm trú tối đa 24 tháng, được gia hạn nhiều lần.',
      'Bắt buộc khai báo tạm vắng khi vắng mặt trên 30 ngày liên tục.',
      'Tra cứu hồ sơ tại "Đăng ký" → "Tra cứu hồ sơ" bằng số CCCD.',
    ],
  },
  {
    id: 'dang-ky-ho-moi',
    icon: '🆕',
    title: 'Đăng ký hộ dân mới',
    desc: 'Dành cho hộ mới chuyển đến chưa có hồ sơ trên hệ thống.',
    href: '/dang-ky/ho-moi',
    steps: [
      { title: 'Vào "Đăng ký" → "Đăng ký hộ dân mới"', detail: 'Card màu xanh đậm ở trang Đăng ký.' },
      { title: 'Khai thông tin hộ', detail: 'Chủ hộ, số nhà, đường/hẻm, tổ/khu vực, địa chỉ đầy đủ, số điện thoại, hình thức cư trú.' },
      { title: 'Khai tất cả thành viên', detail: 'Nhấn "Thêm người" cho từng thành viên. Mở "Thông tin chi tiết" để khai đầy đủ (dân tộc, tôn giáo, CCCD...).' },
      { title: 'Gửi đăng ký', detail: 'Cán bộ xác minh và tạo hồ sơ chính thức, cấp mã QR cho hộ của bạn.' },
    ],
    tips: ['Khai càng đầy đủ, cán bộ duyệt càng nhanh. Cung cấp số điện thoại để được liên hệ xác minh.'],
  },
  {
    id: 'qr-ho-dan',
    icon: '📱',
    title: 'Quét QR hộ dân & tự cập nhật thông tin',
    desc: 'Mỗi hộ có một mã QR riêng — quét để xem phiếu hộ dân điện tử và tự cập nhật thông tin.',
    steps: [
      { title: 'Quét mã QR của hộ', detail: 'Dùng camera điện thoại quét mã QR (được cán bộ cấp, dán tại nhà hoặc gửi qua SMS/Zalo).' },
      { title: 'Xem phiếu hộ dân điện tử', detail: 'Hiển thị thông tin hộ: chủ hộ, mã hộ, địa chỉ, số nhân khẩu, trạng thái cư trú.' },
      { title: 'Nhấn "Cập nhật thông tin hộ"', detail: 'Chọn người cần cập nhật, nhập số điện thoại xác minh, điền thông tin mới (nghề nghiệp, hôn nhân...).' },
      { title: 'Gửi yêu cầu', detail: 'Cán bộ xem xét và xác nhận trước khi cập nhật chính thức.' },
    ],
    tips: ['Tự cập nhật giúp hồ sơ luôn chính xác và bạn nhận được thông báo, hỗ trợ đúng đối tượng.'],
  },
  {
    id: 'thu-tuc',
    icon: '📋',
    title: 'Tra cứu & nộp thủ tục hành chính',
    desc: 'Xem hướng dẫn thủ tục, tải mẫu đơn và nộp hồ sơ trực tuyến.',
    href: '/thu-tuc',
    steps: [
      { title: 'Vào mục "Thủ tục"', detail: 'Duyệt danh sách thủ tục theo lĩnh vực (hộ tịch, chứng thực, cư trú...).' },
      { title: 'Xem chi tiết thủ tục', detail: 'Thành phần hồ sơ, trình tự, thời hạn, lệ phí, căn cứ pháp lý.' },
      { title: 'Tải mẫu đơn', detail: 'Tải và in các mẫu đơn cần thiết miễn phí.' },
      { title: 'Nộp hồ sơ trực tuyến', detail: 'Với thủ tục hỗ trợ trực tuyến: điền thông tin, tải ảnh/scan giấy tờ, nhận mã hồ sơ để theo dõi.' },
    ],
    tips: ['Tra cứu trạng thái hồ sơ tại "Thủ tục" → "Tra cứu hồ sơ" bằng mã hồ sơ hoặc CCCD.'],
  },
  {
    id: 'thong-bao-su-kien',
    icon: '🔔',
    title: 'Thông báo & sự kiện',
    desc: 'Cập nhật tin tức, thông báo và sự kiện của khu phố.',
    href: '/thong-bao',
    steps: [
      { title: 'Xem thông báo', detail: 'Mục "Thông báo" — tin tức, thông báo chính thức từ Ban quản lý khu phố.' },
      { title: 'Xem & đăng ký sự kiện', detail: 'Mục "Sự kiện" — họp khu phố, hoạt động cộng đồng. Đăng ký tham gia trực tuyến.' },
      { title: 'Bật thông báo đẩy', detail: 'Cho phép nhận thông báo để không bỏ lỡ tin quan trọng (an ninh, thiên tai, họp...).' },
    ],
  },
  {
    id: 'ban-do-dan-cu',
    icon: '🗺️',
    title: 'Bản đồ & tra cứu dân cư',
    desc: 'Xem bản đồ khu phố và tra cứu thông tin hộ dân.',
    href: '/ban-do',
    steps: [
      { title: 'Bản đồ GIS', detail: 'Mục "Bản đồ" — xem vị trí hộ dân, phản ánh, các điểm quan trọng trong khu phố.' },
      { title: 'Tra cứu dân cư', detail: 'Mục "Dân cư" — tra cứu thông tin hộ khẩu theo quy định.' },
    ],
  },
  {
    id: 'hoi-ai',
    icon: '🤖',
    title: 'Hỏi Trợ lý AI',
    desc: 'AI hỗ trợ giải đáp thủ tục, hướng dẫn và tư vấn 24/7.',
    href: '/chat',
    steps: [
      { title: 'Nhấn nút "Hỏi AI"', detail: 'Nút màu đỏ ở góc trên hoặc mục "Chat".' },
      { title: 'Đặt câu hỏi', detail: 'Hỏi bằng tiếng Việt tự nhiên: "Thủ tục đăng ký khai sinh cần gì?", "Cách báo tạm vắng?"...' },
      { title: 'Nhận hướng dẫn', detail: 'AI trả lời chi tiết, dẫn link tới tính năng liên quan.' },
    ],
    tips: ['AI hoạt động 24/7. Với việc cần xác nhận chính thức, vẫn nên liên hệ cán bộ.'],
  },
]
