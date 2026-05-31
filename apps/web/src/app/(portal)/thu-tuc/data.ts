/**
 * Dữ liệu thủ tục hành chính — Phường Long Trường, TP.HCM
 * Cập nhật theo quy định mới nhất 05/2026
 *
 * Căn cứ:
 * - Quyết định 1303/QĐ-UBND TP.HCM về TTHC cấp phường 2025
 * - Đề án 06/CP về chuyển đổi số và VNeID
 * - Luật Cư trú 2020 (68/2020/QH14)
 * - Luật Hộ tịch 2014 + Nghị định 123/2015/NĐ-CP
 * - Nghị định 23/2015/NĐ-CP về chứng thực
 * - Nghị định 20/2021/NĐ-CP về an sinh xã hội
 */

// ─── Enum lĩnh vực ────────────────────────────────────────────
export type LinhVuc =
  | 'HO_TICH'
  | 'CU_TRU'
  | 'CHUNG_THUC'
  | 'AN_SINH'
  | 'TU_PHAP'
  | 'XAY_DUNG'
  | 'KINH_DOANH'

export const LINH_VUC_CONFIG: Record<LinhVuc, { label: string; color: string; bg: string; icon: string }> = {
  HO_TICH:    { label: 'Hộ tịch',          color: '#8B1A1A', bg: '#FEF2F2', icon: '📋' },
  CU_TRU:     { label: 'Cư trú',            color: '#1D4ED8', bg: '#EFF6FF', icon: '🏠' },
  CHUNG_THUC: { label: 'Chứng thực',        color: '#065F46', bg: '#ECFDF5', icon: '✅' },
  AN_SINH:    { label: 'An sinh xã hội',    color: '#B45309', bg: '#FFFBEB', icon: '🤝' },
  TU_PHAP:    { label: 'Tư pháp',           color: '#5B21B6', bg: '#F5F3FF', icon: '⚖️'  },
  XAY_DUNG:   { label: 'Đất đai – Xây dựng', color: '#0F766E', bg: '#F0FDFA', icon: '🏗️'  },
  KINH_DOANH: { label: 'Kinh doanh',        color: '#9D174D', bg: '#FDF2F8', icon: '🏪' },
}

// ─── Mức độ dịch vụ công trực tuyến ──────────────────────────
export type MucDo = 1 | 2 | 3 | 4

export const MUC_DO_CONFIG: Record<MucDo, { label: string; color: string; bg: string; moTa: string }> = {
  1: { label: 'Mức 1', color: '#6B7280', bg: '#F3F4F6', moTa: 'Thông tin về thủ tục' },
  2: { label: 'Mức 2', color: '#B45309', bg: '#FFFBEB', moTa: 'Tải mẫu đơn trực tuyến' },
  3: { label: 'Mức 3', color: '#1D4ED8', bg: '#EFF6FF', moTa: 'Nộp hồ sơ trực tuyến' },
  4: { label: 'Mức 4', color: '#065F46', bg: '#ECFDF5', moTa: 'Xử lý & trả kết quả trực tuyến' },
}

// ─── Trạng thái hồ sơ ─────────────────────────────────────────
export type TrangThaiHoSo =
  | 'TIEP_NHAN'
  | 'DANG_XU_LY'
  | 'CHO_BO_SUNG'
  | 'DA_DUYET'
  | 'TU_CHOI'
  | 'DA_TRA'

export const TRANG_THAI_HO_SO: Record<TrangThaiHoSo, { label: string; color: string; bg: string; dot: string }> = {
  TIEP_NHAN:   { label: 'Đã tiếp nhận',  color: '#1D4ED8', bg: '#EFF6FF', dot: '#3B82F6' },
  DANG_XU_LY:  { label: 'Đang xử lý',   color: '#B45309', bg: '#FFFBEB', dot: '#F59E0B' },
  CHO_BO_SUNG: { label: 'Chờ bổ sung',  color: '#9D174D', bg: '#FDF2F8', dot: '#EC4899' },
  DA_DUYET:    { label: 'Đã duyệt',     color: '#065F46', bg: '#ECFDF5', dot: '#10B981' },
  TU_CHOI:     { label: 'Từ chối',      color: '#991B1B', bg: '#FEF2F2', dot: '#EF4444' },
  DA_TRA:      { label: 'Đã trả kết quả', color: '#374151', bg: '#F9FAFB', dot: '#9CA3AF' },
}

// ─── Type thủ tục ─────────────────────────────────────────────
export interface ThuTuc {
  id: string
  maSo: string             // Mã số TTHC quốc gia
  ten: string
  linhVuc: LinhVuc
  mucDoTrucTuyen: MucDo
  coQuanGiaiQuyet: string
  doiTuong: string
  moTa: string
  thoiHanGiaiQuyet: string // e.g. "5 ngày làm việc"
  lePhi: string            // e.g. "Không" hoặc "2.000đ/trang"
  phiDichVu: string        // e.g. "Không"
  ketQua: string           // Output: "Giấy khai sinh"
  thanhPhanHoSo: { ten: string; soLuong: string; ghiChu?: string }[]
  trinhTu: string[]        // Step-by-step
  canCuPhapLy: string[]
  diaDiemNop: string
  thoiGianLamViec: string
  liuY?: string
  hotline?: string
  noiBat: boolean
  tags?: string[]          // Search tags
}

// ─── Danh sách thủ tục ────────────────────────────────────────
export const DS_THU_TUC: ThuTuc[] = [

  // ══════════════════════════════════════════════
  //  LĨNH VỰC HỘ TỊCH
  // ══════════════════════════════════════════════

  {
    id: 'ht-001',
    maSo: '1.004.2',
    ten: 'Đăng ký khai sinh',
    linhVuc: 'HO_TICH',
    mucDoTrucTuyen: 4,
    coQuanGiaiQuyet: 'UBND Phường Long Trường',
    doiTuong: 'Cha, mẹ hoặc người thân thích của trẻ em mới sinh',
    moTa: 'Đăng ký khai sinh cho trẻ em sinh ra trên lãnh thổ Việt Nam. Kể từ 01/01/2023 được thực hiện trực tuyến qua VNeID hoặc cổng dịch vụ công.',
    thoiHanGiaiQuyet: '3 ngày làm việc (trực tuyến); 1 ngày làm việc (trực tiếp)',
    lePhi: 'Không thu',
    phiDichVu: 'Không',
    ketQua: 'Giấy khai sinh bản chính; Trích lục khai sinh',
    thanhPhanHoSo: [
      { ten: 'Tờ khai đăng ký khai sinh (Mẫu TP/HT-2015-KS.1)', soLuong: '01 bản gốc', ghiChu: 'Tải mẫu tại cổng này' },
      { ten: 'Giấy chứng sinh do cơ sở y tế cấp', soLuong: '01 bản gốc', ghiChu: 'Nếu sinh tại nhà: văn bản xác nhận của người làm chứng' },
      { ten: 'CCCD/CMND của cha và mẹ', soLuong: '01 bản photo công chứng' },
      { ten: 'Giấy đăng ký kết hôn của cha mẹ (nếu có)', soLuong: '01 bản photo' },
    ],
    trinhTu: [
      'Nộp hồ sơ trực tuyến qua cổng này hoặc đến trực tiếp bộ phận Một cửa UBND Phường',
      'Cán bộ kiểm tra tính đầy đủ, hợp lệ của hồ sơ trong 01 ngày làm việc',
      'Lãnh đạo UBND ký duyệt Giấy khai sinh',
      'Nhận kết quả trực tiếp tại UBND hoặc qua bưu điện (nếu đăng ký dịch vụ)',
    ],
    canCuPhapLy: [
      'Luật Hộ tịch 2014 (số 60/2014/QH13)',
      'Nghị định 123/2015/NĐ-CP hướng dẫn thi hành Luật Hộ tịch',
      'Thông tư 04/2020/TT-BTP sửa đổi Thông tư 04/2015/TT-BTP',
      'Nghị định 87/2020/NĐ-CP về cổng dịch vụ công',
    ],
    diaDiemNop: 'Bộ phận Một cửa UBND Phường Long Trường (Tầng 1)',
    thoiGianLamViec: 'Thứ 2 – Thứ 6: 7h30 – 11h30 & 13h00 – 17h00',
    liuY: 'Đăng ký khai sinh phải thực hiện trong vòng 60 ngày kể từ ngày sinh. Quá hạn sẽ bị xử phạt hành chính theo Nghị định 82/2020/NĐ-CP.',
    hotline: '028 3746 1111',
    noiBat: true,
    tags: ['khai sinh', 'trẻ em', 'giấy khai sinh', 'sinh con'],
  },

  {
    id: 'ht-002',
    maSo: '1.004.3',
    ten: 'Đăng ký khai tử',
    linhVuc: 'HO_TICH',
    mucDoTrucTuyen: 3,
    coQuanGiaiQuyet: 'UBND Phường Long Trường',
    doiTuong: 'Người thân, đại diện gia đình người đã mất',
    moTa: 'Đăng ký khai tử cho người qua đời cư trú tại Phường Long Trường hoặc mất tại địa phương.',
    thoiHanGiaiQuyet: '2 ngày làm việc',
    lePhi: 'Không thu',
    phiDichVu: 'Không',
    ketQua: 'Giấy chứng tử bản chính; Trích lục khai tử',
    thanhPhanHoSo: [
      { ten: 'Tờ khai đăng ký khai tử (Mẫu TP/HT-2015-KT.1)', soLuong: '01 bản gốc' },
      { ten: 'Giấy báo tử của bệnh viện hoặc cơ quan có thẩm quyền', soLuong: '01 bản gốc' },
      { ten: 'CCCD của người khai báo', soLuong: '01 bản photo' },
      { ten: 'CCCD của người đã mất (nếu có)', soLuong: '01 bản photo' },
    ],
    trinhTu: [
      'Nộp hồ sơ tại bộ phận Một cửa UBND Phường trong vòng 15 ngày kể từ ngày mất',
      'Cán bộ hộ tịch kiểm tra, xác nhận thông tin',
      'Cấp Giấy chứng tử và cập nhật vào hệ thống hộ tịch điện tử',
      'Nhận kết quả ngay trong ngày hoặc ngày hôm sau',
    ],
    canCuPhapLy: [
      'Luật Hộ tịch 2014 (số 60/2014/QH13)',
      'Nghị định 123/2015/NĐ-CP',
      'Thông tư 04/2020/TT-BTP',
    ],
    diaDiemNop: 'Bộ phận Một cửa UBND Phường Long Trường',
    thoiGianLamViec: 'Thứ 2 – Thứ 6: 7h30 – 11h30 & 13h00 – 17h00',
    liuY: 'Phải khai báo trong 15 ngày kể từ ngày mất. Khai báo trễ cần có đơn giải trình.',
    hotline: '028 3746 1111',
    noiBat: false,
    tags: ['khai tử', 'giấy chứng tử', 'người mất', 'khai báo tử'],
  },

  {
    id: 'ht-003',
    maSo: '1.004.1',
    ten: 'Đăng ký kết hôn',
    linhVuc: 'HO_TICH',
    mucDoTrucTuyen: 4,
    coQuanGiaiQuyet: 'UBND Phường Long Trường',
    doiTuong: 'Nam, nữ đủ tuổi kết hôn theo quy định (nam ≥ 20 tuổi, nữ ≥ 18 tuổi)',
    moTa: 'Đăng ký kết hôn tại UBND Phường nơi cư trú của một trong hai bên. Từ 2026, hỗ trợ đặt lịch trực tuyến qua cổng dịch vụ công.',
    thoiHanGiaiQuyet: '5 ngày làm việc',
    lePhi: 'Không thu (Miễn phí theo Nghị định 87/2020)',
    phiDichVu: 'Không',
    ketQua: 'Giấy chứng nhận đăng ký kết hôn (02 bản)',
    thanhPhanHoSo: [
      { ten: 'Tờ khai đăng ký kết hôn (Mẫu TP/HT-2015-KH.1)', soLuong: '01 bản gốc (mỗi người điền 01 tờ)' },
      { ten: 'CCCD gắn chip của cả hai người', soLuong: '01 bản gốc (xuất trình) + photo' },
      { ten: 'Giấy xác nhận tình trạng hôn nhân (nếu từng kết hôn)', soLuong: '01 bản gốc (cấp bởi UBND nơi cư trú trước)' },
      { ten: 'Giấy khám sức khỏe (khuyến nghị)', soLuong: '01 bản gốc', ghiChu: 'Không bắt buộc từ 2021' },
    ],
    trinhTu: [
      'Đặt lịch hẹn trực tuyến hoặc đến trực tiếp nộp hồ sơ',
      'Cán bộ phỏng vấn về ý chí tự nguyện, kiểm tra điều kiện kết hôn',
      'Niêm yết thông báo 3 ngày tại trụ sở UBND',
      'Tổ chức lễ đăng ký kết hôn; trao Giấy chứng nhận',
    ],
    canCuPhapLy: [
      'Luật Hôn nhân và gia đình 2014 (số 52/2014/QH13)',
      'Luật Hộ tịch 2014 (số 60/2014/QH13)',
      'Nghị định 123/2015/NĐ-CP',
    ],
    diaDiemNop: 'Bộ phận Một cửa UBND Phường Long Trường',
    thoiGianLamViec: 'Thứ 2 – Thứ 6: 7h30 – 11h30 & 13h00 – 17h00',
    liuY: 'Cả hai bên phải có mặt khi làm thủ tục. Đăng ký cho người nước ngoài thực hiện tại cấp Quận/TP.',
    hotline: '028 3746 1111',
    noiBat: true,
    tags: ['kết hôn', 'đăng ký kết hôn', 'giấy đăng ký kết hôn', 'hôn nhân'],
  },

  {
    id: 'ht-004',
    maSo: '2.000.4',
    ten: 'Đăng ký nhận cha, mẹ, con',
    linhVuc: 'HO_TICH',
    mucDoTrucTuyen: 3,
    coQuanGiaiQuyet: 'UBND Phường Long Trường',
    doiTuong: 'Người yêu cầu nhận cha, mẹ hoặc con',
    moTa: 'Đăng ký xác nhận quan hệ cha – con, mẹ – con trong trường hợp chưa được ghi nhận khi khai sinh.',
    thoiHanGiaiQuyet: '3 ngày làm việc',
    lePhi: 'Không thu',
    phiDichVu: 'Không',
    ketQua: 'Trích lục đăng ký nhận cha, mẹ, con',
    thanhPhanHoSo: [
      { ten: 'Tờ khai đăng ký nhận cha, mẹ, con', soLuong: '01 bản gốc' },
      { ten: 'CCCD của người nhận và người được nhận', soLuong: '01 bản photo mỗi người' },
      { ten: 'Giấy khai sinh của con (nếu nhận con)', soLuong: '01 bản photo' },
      { ten: 'Văn bản xác nhận ADN (nếu có tranh chấp)', soLuong: '01 bản gốc', ghiChu: 'Tùy trường hợp' },
    ],
    trinhTu: [
      'Nộp hồ sơ tại UBND Phường',
      'Cán bộ xác minh thông tin, phỏng vấn các bên',
      'Niêm yết thông báo 3 ngày',
      'Cấp Trích lục và cập nhật Giấy khai sinh của con',
    ],
    canCuPhapLy: [
      'Luật Hôn nhân và gia đình 2014',
      'Luật Hộ tịch 2014',
      'Nghị định 123/2015/NĐ-CP',
    ],
    diaDiemNop: 'Bộ phận Một cửa UBND Phường Long Trường',
    thoiGianLamViec: 'Thứ 2 – Thứ 6: 7h30 – 11h30 & 13h00 – 17h00',
    noiBat: false,
    tags: ['nhận con', 'nhận cha mẹ', 'quan hệ huyết thống', 'hộ tịch'],
  },

  {
    id: 'ht-005',
    maSo: '1.004.11',
    ten: 'Đăng ký lại khai sinh',
    linhVuc: 'HO_TICH',
    mucDoTrucTuyen: 3,
    coQuanGiaiQuyet: 'UBND Phường Long Trường',
    doiTuong: 'Người đã đăng ký khai sinh nhưng bản chính bị mất, hỏng hoặc sai thông tin',
    moTa: 'Đăng ký lại khai sinh cho người đã có giấy khai sinh bị mất, hỏng hoặc đã bị hủy do sai sót.',
    thoiHanGiaiQuyet: '5 ngày làm việc',
    lePhi: 'Không thu',
    phiDichVu: 'Không',
    ketQua: 'Giấy khai sinh mới (ghi lại đầy đủ thông tin)',
    thanhPhanHoSo: [
      { ten: 'Tờ khai đăng ký lại khai sinh', soLuong: '01 bản gốc' },
      { ten: 'CCCD của đương sự hoặc người đại diện', soLuong: '01 bản photo' },
      { ten: 'Các giấy tờ chứng minh thông tin (bằng tốt nghiệp, hộ chiếu, học bạ…)', soLuong: '01 bản photo' },
      { ten: 'Giấy tờ chứng minh thông tin cha mẹ (nếu có)', soLuong: '01 bản photo' },
    ],
    trinhTu: [
      'Nộp hồ sơ tại UBND Phường nơi đã đăng ký khai sinh trước đây',
      'Cán bộ tra cứu hệ thống hộ tịch điện tử quốc gia',
      'Xác minh thông tin qua các tài liệu kèm theo',
      'Cấp Giấy khai sinh mới',
    ],
    canCuPhapLy: [
      'Luật Hộ tịch 2014',
      'Nghị định 123/2015/NĐ-CP Điều 28',
    ],
    diaDiemNop: 'Bộ phận Một cửa UBND Phường Long Trường',
    thoiGianLamViec: 'Thứ 2 – Thứ 6: 7h30 – 11h30 & 13h00 – 17h00',
    noiBat: false,
    tags: ['đăng ký lại', 'mất giấy khai sinh', 'sửa giấy khai sinh'],
  },

  // ══════════════════════════════════════════════
  //  LĨNH VỰC CƯ TRÚ
  // ══════════════════════════════════════════════

  {
    id: 'ct-001',
    maSo: '2.000.1',
    ten: 'Đăng ký thường trú',
    linhVuc: 'CU_TRU',
    mucDoTrucTuyen: 4,
    coQuanGiaiQuyet: 'Công an Phường Long Trường',
    doiTuong: 'Công dân Việt Nam có nhu cầu đăng ký thường trú tại Phường Long Trường',
    moTa: 'Đăng ký thường trú vào địa chỉ nhà ở tại Phường Long Trường thông qua ứng dụng VNeID hoặc cổng dịch vụ công. Từ 01/01/2023 không còn sổ hộ khẩu giấy, quản lý bằng cơ sở dữ liệu điện tử.',
    thoiHanGiaiQuyet: '7 ngày làm việc (trực tuyến qua VNeID: 3 ngày)',
    lePhi: 'Không thu',
    phiDichVu: 'Không',
    ketQua: 'Cập nhật thông tin thường trú trên CCCD/VNeID; Xác nhận đăng ký thường trú',
    thanhPhanHoSo: [
      { ten: 'Phiếu báo thay đổi hộ khẩu, nhân khẩu (Mẫu HK02)', soLuong: '01 bản gốc', ghiChu: 'Tải mẫu qua ứng dụng VNeID' },
      { ten: 'CCCD gắn chip còn hiệu lực', soLuong: '01 bản gốc (xuất trình)' },
      { ten: 'Giấy tờ về chỗ ở hợp pháp', soLuong: '01 bản photo', ghiChu: 'Sổ đỏ/hợp đồng thuê nhà/văn bản đồng ý của chủ hộ' },
      { ten: 'Văn bản đồng ý của chủ hộ (nếu nhập vào hộ khác)', soLuong: '01 bản gốc', ghiChu: 'Chủ hộ phải ký trực tiếp' },
    ],
    trinhTu: [
      'Nộp hồ sơ qua ứng dụng VNeID (khuyến nghị) hoặc tại Công an Phường',
      'Cảnh sát khu vực xác minh thực tế địa chỉ nơi ở',
      'Dữ liệu được cập nhật trên hệ thống quản lý cư trú quốc gia',
      'Nhận thông báo xác nhận qua VNeID hoặc SMS',
    ],
    canCuPhapLy: [
      'Luật Cư trú 2020 (số 68/2020/QH14) — Hiệu lực từ 01/07/2021',
      'Thông tư 56/2021/TT-BCA quy định chi tiết đăng ký, quản lý cư trú',
      'Nghị định 62/2021/NĐ-CP hướng dẫn thi hành Luật Cư trú 2020',
    ],
    diaDiemNop: 'Công an Phường Long Trường hoặc qua VNeID',
    thoiGianLamViec: 'Thứ 2 – Thứ 7: 7h30 – 11h30 & 14h00 – 17h00',
    liuY: 'Từ 01/01/2023: sổ hộ khẩu giấy không còn giá trị sử dụng. Mọi thông tin cư trú được quản lý trên CSDL điện tử. Dùng CCCD/VNeID thay thế.',
    hotline: '069 254 5678',
    noiBat: true,
    tags: ['thường trú', 'hộ khẩu', 'đăng ký hộ khẩu', 'VNeID', 'cư trú'],
  },

  {
    id: 'ct-002',
    maSo: '2.000.3',
    ten: 'Xóa đăng ký thường trú',
    linhVuc: 'CU_TRU',
    mucDoTrucTuyen: 3,
    coQuanGiaiQuyet: 'Công an Phường Long Trường',
    doiTuong: 'Chủ hộ hoặc người có đăng ký thường trú tại địa chỉ cần xóa',
    moTa: 'Xóa đăng ký thường trú khi chuyển đi nơi khác, nhà bị phá dỡ hoặc theo yêu cầu hợp lệ.',
    thoiHanGiaiQuyet: '3 ngày làm việc',
    lePhi: 'Không thu',
    phiDichVu: 'Không',
    ketQua: 'Cập nhật xóa đăng ký thường trú trên hệ thống',
    thanhPhanHoSo: [
      { ten: 'Đơn đề nghị xóa đăng ký thường trú', soLuong: '01 bản gốc' },
      { ten: 'CCCD của người đề nghị', soLuong: '01 bản photo' },
    ],
    trinhTu: [
      'Nộp đơn tại Công an Phường',
      'Xác minh lý do và thông tin',
      'Cập nhật hệ thống và thông báo kết quả',
    ],
    canCuPhapLy: [
      'Luật Cư trú 2020 (số 68/2020/QH14)',
      'Thông tư 56/2021/TT-BCA',
    ],
    diaDiemNop: 'Công an Phường Long Trường',
    thoiGianLamViec: 'Thứ 2 – Thứ 7: 7h30 – 11h30 & 14h00 – 17h00',
    noiBat: false,
    tags: ['xóa hộ khẩu', 'chuyển hộ khẩu', 'xóa thường trú'],
  },

  {
    id: 'ct-003',
    maSo: '2.000.5',
    ten: 'Tách hộ',
    linhVuc: 'CU_TRU',
    mucDoTrucTuyen: 3,
    coQuanGiaiQuyet: 'Công an Phường Long Trường',
    doiTuong: 'Người có đăng ký thường trú muốn tách ra thành một hộ riêng',
    moTa: 'Tách thành hộ gia đình độc lập khi có địa chỉ chỗ ở hợp pháp riêng. Áp dụng khi con đã trưởng thành ra ở riêng, vợ chồng mới ra ở riêng, v.v.',
    thoiHanGiaiQuyet: '5 ngày làm việc',
    lePhi: 'Không thu',
    phiDichVu: 'Không',
    ketQua: 'Cập nhật tách hộ trên hệ thống cư trú',
    thanhPhanHoSo: [
      { ten: 'Đơn đề nghị tách hộ', soLuong: '01 bản gốc' },
      { ten: 'CCCD của người đề nghị và chủ hộ cũ', soLuong: '01 bản photo mỗi người' },
      { ten: 'Giấy tờ chứng minh quyền sở hữu/sử dụng chỗ ở mới', soLuong: '01 bản photo' },
    ],
    trinhTu: [
      'Nộp hồ sơ tại Công an Phường',
      'Cảnh sát khu vực xác minh địa chỉ tách hộ',
      'Cập nhật hệ thống, thông báo kết quả',
    ],
    canCuPhapLy: [
      'Luật Cư trú 2020 (số 68/2020/QH14)',
      'Thông tư 56/2021/TT-BCA',
    ],
    diaDiemNop: 'Công an Phường Long Trường',
    thoiGianLamViec: 'Thứ 2 – Thứ 7: 7h30 – 11h30 & 14h00 – 17h00',
    noiBat: false,
    tags: ['tách hộ', 'tách khẩu', 'ở riêng'],
  },

  // ══════════════════════════════════════════════
  //  LĨNH VỰC CHỨNG THỰC
  // ══════════════════════════════════════════════

  {
    id: 'ctt-001',
    maSo: '1.003.1',
    ten: 'Chứng thực bản sao từ bản chính',
    linhVuc: 'CHUNG_THUC',
    mucDoTrucTuyen: 2,
    coQuanGiaiQuyet: 'UBND Phường Long Trường',
    doiTuong: 'Cá nhân, tổ chức có nhu cầu chứng thực bản sao',
    moTa: 'Chứng thực bản sao các loại giấy tờ: CCCD, bằng cấp, giấy tờ nhà đất, v.v. từ bản chính.',
    thoiHanGiaiQuyet: 'Ngay trong ngày (không quá 02 giờ làm việc)',
    lePhi: '2.000đ/trang; Tối đa 200.000đ/bộ hồ sơ',
    phiDichVu: 'Không',
    ketQua: 'Bản sao có chứng thực của UBND Phường',
    thanhPhanHoSo: [
      { ten: 'Bản chính cần chứng thực (phải xuất trình)', soLuong: 'Theo nhu cầu' },
      { ten: 'CCCD của người yêu cầu', soLuong: '01 bản (xuất trình)' },
      { ten: 'Bản photo của giấy tờ cần chứng thực', soLuong: 'Theo số lượng yêu cầu' },
    ],
    trinhTu: [
      'Mang bản chính và bản photo đến bộ phận Một cửa UBND',
      'Cán bộ đối chiếu bản chính với bản photo',
      'Đóng dấu chứng thực và ký xác nhận',
      'Nộp lệ phí và nhận kết quả',
    ],
    canCuPhapLy: [
      'Nghị định 23/2015/NĐ-CP về cấp bản sao từ sổ gốc, chứng thực bản sao',
      'Thông tư 01/2020/TT-BTP sửa đổi Thông tư 20/2015/TT-BTP',
      'Nghị định 45/2020/NĐ-CP về thực hiện TTHC trên môi trường điện tử',
    ],
    diaDiemNop: 'Bộ phận Một cửa UBND Phường Long Trường',
    thoiGianLamViec: 'Thứ 2 – Thứ 6: 7h30 – 11h30 & 13h00 – 17h00',
    liuY: 'Không chứng thực bản sao giấy tờ đã hết hiệu lực, giấy tờ bị tẩy xóa, sửa chữa. CCCD gắn chip hiện nay có thể thay thế bản sao công chứng trong nhiều giao dịch.',
    hotline: '028 3746 1111',
    noiBat: true,
    tags: ['chứng thực', 'công chứng', 'bản sao', 'sao y', 'xác nhận giấy tờ'],
  },

  {
    id: 'ctt-002',
    maSo: '1.003.2',
    ten: 'Chứng thực chữ ký',
    linhVuc: 'CHUNG_THUC',
    mucDoTrucTuyen: 2,
    coQuanGiaiQuyet: 'UBND Phường Long Trường',
    doiTuong: 'Cá nhân cần chứng thực chữ ký trên văn bản, giấy tờ',
    moTa: 'Chứng thực chữ ký cá nhân trên các loại giấy tờ, văn bản dùng trong giao dịch dân sự, hành chính.',
    thoiHanGiaiQuyet: 'Ngay trong ngày',
    lePhi: '10.000đ/trường hợp',
    phiDichVu: 'Không',
    ketQua: 'Văn bản có chứng thực chữ ký của UBND Phường',
    thanhPhanHoSo: [
      { ten: 'Giấy tờ cần chứng thực chữ ký', soLuong: 'Theo nhu cầu (không được ký trước)' },
      { ten: 'CCCD của người ký', soLuong: '01 bản (xuất trình)' },
    ],
    trinhTu: [
      'Đến bộ phận Một cửa UBND, KHÔNG ký trước vào giấy tờ',
      'Cán bộ kiểm tra danh tính qua CCCD',
      'Ký trực tiếp trước mặt cán bộ chứng thực',
      'Đóng dấu chứng thực, nộp lệ phí và nhận kết quả',
    ],
    canCuPhapLy: [
      'Nghị định 23/2015/NĐ-CP',
      'Thông tư 01/2020/TT-BTP',
    ],
    diaDiemNop: 'Bộ phận Một cửa UBND Phường Long Trường',
    thoiGianLamViec: 'Thứ 2 – Thứ 6: 7h30 – 11h30 & 13h00 – 17h00',
    liuY: 'Phải đến trực tiếp để ký trước mặt cán bộ, không thể thực hiện trực tuyến.',
    hotline: '028 3746 1111',
    noiBat: false,
    tags: ['chứng thực chữ ký', 'ký tên', 'xác nhận chữ ký'],
  },

  {
    id: 'ctt-003',
    maSo: '1.003.3',
    ten: 'Chứng thực hợp đồng, giao dịch',
    linhVuc: 'CHUNG_THUC',
    mucDoTrucTuyen: 2,
    coQuanGiaiQuyet: 'UBND Phường Long Trường',
    doiTuong: 'Các bên tham gia hợp đồng, giao dịch liên quan đến bất động sản và tài sản',
    moTa: 'Chứng thực hợp đồng mua bán, tặng cho, thế chấp, cho thuê nhà ở và các giao dịch bất động sản.',
    thoiHanGiaiQuyet: '2 ngày làm việc',
    lePhi: '50.000đ/hợp đồng; 100.000đ nếu có bất động sản trên 1 tỷ',
    phiDichVu: 'Không',
    ketQua: 'Hợp đồng/giao dịch được chứng thực',
    thanhPhanHoSo: [
      { ten: 'Hợp đồng/giao dịch (do các bên soạn thảo)', soLuong: '03 bản gốc' },
      { ten: 'CCCD của tất cả các bên', soLuong: '01 bản photo mỗi người' },
      { ten: 'Giấy tờ chứng minh quyền sở hữu tài sản', soLuong: '01 bản photo', ghiChu: 'Sổ đỏ, sổ hồng...' },
      { ten: 'Giấy xác nhận tình trạng hôn nhân (nếu tài sản chung)', soLuong: '01 bản gốc' },
    ],
    trinhTu: [
      'Nộp hồ sơ tại UBND Phường',
      'Cán bộ kiểm tra hợp đồng, xác minh danh tính các bên',
      'Các bên ký hợp đồng trước mặt cán bộ chứng thực',
      'Đóng dấu chứng thực, thu lệ phí và trao kết quả',
    ],
    canCuPhapLy: [
      'Nghị định 23/2015/NĐ-CP',
      'Bộ luật Dân sự 2015',
      'Luật Nhà ở 2023 (số 27/2023/QH15)',
    ],
    diaDiemNop: 'Bộ phận Một cửa UBND Phường Long Trường',
    thoiGianLamViec: 'Thứ 2 – Thứ 6: 7h30 – 11h30 & 13h00 – 17h00',
    liuY: 'Hợp đồng mua bán nhà đất phải công chứng tại Văn phòng công chứng (không phải chứng thực tại UBND).',
    noiBat: false,
    tags: ['chứng thực hợp đồng', 'hợp đồng thuê nhà', 'giao dịch bất động sản'],
  },

  // ══════════════════════════════════════════════
  //  LĨNH VỰC AN SINH XÃ HỘI
  // ══════════════════════════════════════════════

  {
    id: 'as-001',
    maSo: '1.001.1',
    ten: 'Đề nghị trợ cấp xã hội hàng tháng',
    linhVuc: 'AN_SINH',
    mucDoTrucTuyen: 3,
    coQuanGiaiQuyet: 'UBND Phường Long Trường → Phòng LĐ-TB&XH TP.HCM',
    doiTuong: 'Người cao tuổi cô đơn; Người khuyết tật nặng/đặc biệt nặng; Trẻ em dưới 16 tuổi không nơi nương tựa; Hộ nghèo không có khả năng lao động',
    moTa: 'Hỗ trợ trợ cấp xã hội hàng tháng từ ngân sách nhà nước theo Nghị định 20/2021/NĐ-CP. Mức trợ cấp chuẩn: 360.000đ – 1.800.000đ/tháng tùy đối tượng (năm 2026 điều chỉnh theo lương cơ sở mới).',
    thoiHanGiaiQuyet: '15 ngày làm việc (kể từ khi hồ sơ đầy đủ)',
    lePhi: 'Không thu',
    phiDichVu: 'Không',
    ketQua: 'Quyết định hưởng trợ cấp xã hội hàng tháng; Thẻ BHYT (nếu đủ điều kiện)',
    thanhPhanHoSo: [
      { ten: 'Tờ khai đề nghị trợ cấp xã hội (Mẫu số 1A)', soLuong: '01 bản gốc' },
      { ten: 'CCCD/Giấy khai sinh của đối tượng', soLuong: '01 bản photo' },
      { ten: 'Giấy xác nhận của Bác sĩ về tình trạng sức khỏe (nếu là người khuyết tật)', soLuong: '01 bản gốc' },
      { ten: 'Sổ hộ nghèo/cận nghèo (nếu có)', soLuong: '01 bản photo' },
      { ten: 'Giấy xác nhận hộ khẩu/cư trú', soLuong: '01 bản gốc', ghiChu: 'Do Công an Phường cấp' },
    ],
    trinhTu: [
      'Nộp hồ sơ tại bộ phận Một cửa UBND Phường',
      'Cán bộ LĐ-TB&XH thẩm định, xác minh tại gia đình (nếu cần)',
      'UBND Phường xét duyệt và chuyển lên Phòng LĐ-TB&XH',
      'Phòng LĐ-TB&XH phê duyệt và ban hành Quyết định',
      'Nhận tiền trợ cấp tại bưu điện hoặc tài khoản ngân hàng',
    ],
    canCuPhapLy: [
      'Nghị định 20/2021/NĐ-CP quy định chính sách trợ giúp xã hội',
      'Thông tư 02/2021/TT-BLĐTBXH hướng dẫn Nghị định 20/2021',
      'Nghị quyết 68/NQ-CP năm 2021 về hỗ trợ người lao động',
    ],
    diaDiemNop: 'Bộ phận Một cửa UBND Phường Long Trường',
    thoiGianLamViec: 'Thứ 2 – Thứ 6: 7h30 – 11h30 & 13h00 – 17h00',
    liuY: 'Mức trợ cấp năm 2026 được tính theo lương cơ sở 2.340.000đ/tháng (điều chỉnh từ 01/7/2024). Liên hệ cán bộ phụ trách để được tư vấn cụ thể.',
    hotline: '028 3746 1111',
    noiBat: true,
    tags: ['trợ cấp xã hội', 'hộ nghèo', 'người khuyết tật', 'người cao tuổi', 'an sinh'],
  },

  {
    id: 'as-002',
    maSo: '1.001.5',
    ten: 'Xác nhận hộ nghèo, hộ cận nghèo',
    linhVuc: 'AN_SINH',
    mucDoTrucTuyen: 3,
    coQuanGiaiQuyet: 'UBND Phường Long Trường',
    doiTuong: 'Hộ gia đình có mức thu nhập dưới chuẩn nghèo/cận nghèo của TP.HCM',
    moTa: 'Xác nhận hộ nghèo/cận nghèo theo chuẩn đa chiều của TP.HCM năm 2026. Chuẩn nghèo TP.HCM 2026: thu nhập dưới 4.000.000đ/người/tháng (khu vực thành thị).',
    thoiHanGiaiQuyet: '10 ngày làm việc',
    lePhi: 'Không thu',
    phiDichVu: 'Không',
    ketQua: 'Sổ hộ nghèo/cận nghèo; Giấy xác nhận hộ nghèo/cận nghèo',
    thanhPhanHoSo: [
      { ten: 'Đơn đề nghị xét hộ nghèo/cận nghèo', soLuong: '01 bản gốc' },
      { ten: 'CCCD của chủ hộ', soLuong: '01 bản photo' },
      { ten: 'Giấy tờ chứng minh thu nhập (nếu có)', soLuong: '01 bản photo' },
    ],
    trinhTu: [
      'Nộp đơn tại UBND Phường',
      'Tổ điều tra khảo sát thực tế hộ gia đình',
      'Họp xét duyệt tại khu phố, niêm yết danh sách 5 ngày',
      'UBND Phường ký duyệt và cấp sổ hộ nghèo/cận nghèo',
    ],
    canCuPhapLy: [
      'Quyết định 3310/QĐ-UBND TP.HCM về chuẩn nghèo đa chiều 2026',
      'Nghị định 07/2021/NĐ-CP về chuẩn nghèo đa chiều quốc gia',
    ],
    diaDiemNop: 'Bộ phận Một cửa UBND Phường Long Trường',
    thoiGianLamViec: 'Thứ 2 – Thứ 6: 7h30 – 11h30 & 13h00 – 17h00',
    noiBat: false,
    tags: ['hộ nghèo', 'cận nghèo', 'sổ hộ nghèo', 'xác nhận thu nhập'],
  },

  {
    id: 'as-003',
    maSo: '1.001.8',
    ten: 'Hỗ trợ đột xuất — Thiên tai, hỏa hoạn',
    linhVuc: 'AN_SINH',
    mucDoTrucTuyen: 2,
    coQuanGiaiQuyet: 'UBND Phường Long Trường',
    doiTuong: 'Hộ gia đình gặp khó khăn đột xuất do thiên tai, hỏa hoạn, tai nạn lao động',
    moTa: 'Hỗ trợ khẩn cấp bằng tiền mặt hoặc hiện vật cho hộ gia đình gặp khó khăn đột xuất. Mức hỗ trợ: 1.000.000đ – 10.000.000đ tùy mức độ thiệt hại.',
    thoiHanGiaiQuyet: '3 ngày làm việc (khẩn cấp)',
    lePhi: 'Không thu',
    phiDichVu: 'Không',
    ketQua: 'Quyết định hỗ trợ đột xuất; Tiền mặt/hiện vật hỗ trợ',
    thanhPhanHoSo: [
      { ten: 'Đơn đề nghị hỗ trợ đột xuất', soLuong: '01 bản gốc' },
      { ten: 'CCCD của người đề nghị', soLuong: '01 bản photo' },
      { ten: 'Biên bản xác nhận thiệt hại của cơ quan có thẩm quyền', soLuong: '01 bản gốc', ghiChu: 'Công an, phòng cháy chữa cháy...' },
      { ten: 'Ảnh chụp hiện trường (nếu có)', soLuong: 'Theo thực tế' },
    ],
    trinhTu: [
      'Báo cáo ngay cho Ban quản lý Khu phố 25 hoặc UBND Phường',
      'Cán bộ xuống kiểm tra, lập biên bản xác nhận thiệt hại',
      'UBND Phường xem xét và quyết định mức hỗ trợ',
      'Trao hỗ trợ trực tiếp cho hộ gia đình',
    ],
    canCuPhapLy: [
      'Nghị định 20/2021/NĐ-CP',
      'Quyết định 33/2021/QĐ-TTg về hỗ trợ nhà ở cho hộ nghèo',
    ],
    diaDiemNop: 'UBND Phường Long Trường hoặc liên hệ trực tiếp Ban quản lý KP25',
    thoiGianLamViec: 'Thứ 2 – Thứ 7: 7h30 – 17h00 (Khẩn cấp: liên hệ hotline 24/7)',
    hotline: '0773 735 317',
    noiBat: false,
    tags: ['hỗ trợ khẩn cấp', 'thiên tai', 'hỏa hoạn', 'tai nạn', 'cứu trợ'],
  },

  // ══════════════════════════════════════════════
  //  LĨNH VỰC TƯ PHÁP
  // ══════════════════════════════════════════════

  {
    id: 'tp-001',
    maSo: '1.002.1',
    ten: 'Xác nhận lý lịch tư pháp (hỗ trợ làm thủ tục)',
    linhVuc: 'TU_PHAP',
    mucDoTrucTuyen: 4,
    coQuanGiaiQuyet: 'Sở Tư pháp TP.HCM (UBND Phường Long Trường hỗ trợ tiếp nhận)',
    doiTuong: 'Công dân Việt Nam cần Phiếu lý lịch tư pháp (để xin việc, du học, định cư)',
    moTa: 'Phiếu lý lịch tư pháp xác nhận có/không có tiền án tiền sự. UBND Phường hỗ trợ tiếp nhận hồ sơ và chuyển Sở Tư pháp TP.HCM. Từ 2024, có thể nộp trực tuyến qua Cổng DVC Quốc gia.',
    thoiHanGiaiQuyet: '10 ngày làm việc (Phiếu số 1); 15 ngày (Phiếu số 2)',
    lePhi: '200.000đ/phiếu; Miễn phí nếu xin việc làm sau khi mãn hạn tù',
    phiDichVu: 'Không',
    ketQua: 'Phiếu lý lịch tư pháp số 1 hoặc số 2',
    thanhPhanHoSo: [
      { ten: 'Tờ khai yêu cầu cấp Phiếu lý lịch tư pháp (Mẫu số 03/2013/TT-BTP)', soLuong: '01 bản gốc', ghiChu: 'Tải mẫu tại cổng DVC TP.HCM' },
      { ten: 'CCCD còn hiệu lực', soLuong: '01 bản photo' },
      { ten: 'Ảnh 4x6 (nền trắng)', soLuong: '02 ảnh' },
      { ten: 'Giấy tờ chứng minh quốc tịch (nếu yêu cầu)', soLuong: '01 bản photo', ghiChu: 'Hộ chiếu hoặc CCCD' },
    ],
    trinhTu: [
      'Nộp hồ sơ tại UBND Phường (hỗ trợ) hoặc trực tiếp Sở Tư pháp TP.HCM',
      'Hoặc nộp trực tuyến tại dichvucong.hochiminhcity.gov.vn',
      'Sở Tư pháp xác minh thông tin qua hệ thống quốc gia',
      'Nhận kết quả qua bưu điện hoặc tại Sở Tư pháp',
    ],
    canCuPhapLy: [
      'Luật Lý lịch tư pháp 2009 (số 28/2009/QH12)',
      'Nghị định 111/2010/NĐ-CP hướng dẫn Luật Lý lịch tư pháp',
      'Thông tư 13/2011/TT-BTP',
    ],
    diaDiemNop: 'UBND Phường Long Trường (tiếp nhận, chuyển Sở); hoặc Sở Tư pháp TP.HCM tầng 2 – 86 Lê Thánh Tôn, Q1',
    thoiGianLamViec: 'Thứ 2 – Thứ 6: 7h30 – 11h30 & 13h00 – 17h00',
    liuY: 'Khuyến nghị nộp trực tuyến qua Cổng DVC Quốc gia (dichvucong.gov.vn) để tiết kiệm thời gian.',
    hotline: '028 3824 6700 (Sở Tư pháp)',
    noiBat: false,
    tags: ['lý lịch tư pháp', 'phiếu lý lịch', 'tiền án tiền sự', 'xin việc', 'du học'],
  },

  {
    id: 'tp-002',
    maSo: '1.002.9',
    ten: 'Hòa giải tranh chấp tại cơ sở',
    linhVuc: 'TU_PHAP',
    mucDoTrucTuyen: 2,
    coQuanGiaiQuyet: 'Tổ hòa giải Khu phố 25 – Phường Long Trường',
    doiTuong: 'Các bên có tranh chấp dân sự nhỏ tại cộng đồng: tranh chấp đất đai ranh giới, tài sản, mâu thuẫn hàng xóm',
    moTa: 'Hòa giải viên cơ sở hỗ trợ các bên tự nguyện giải quyết mâu thuẫn mà không cần khởi kiện ra tòa. Hoàn toàn miễn phí, bảo mật.',
    thoiHanGiaiQuyet: 'Tùy vụ việc (thường 1–3 buổi, mỗi buổi 2 giờ)',
    lePhi: 'Hoàn toàn miễn phí',
    phiDichVu: 'Không',
    ketQua: 'Biên bản hòa giải thành (có giá trị pháp lý) hoặc Biên bản hòa giải không thành',
    thanhPhanHoSo: [
      { ten: 'Đơn yêu cầu hòa giải', soLuong: '01 bản' },
      { ten: 'CCCD của các bên liên quan', soLuong: '01 bản photo mỗi người' },
      { ten: 'Giấy tờ liên quan đến tranh chấp', soLuong: 'Theo vụ việc' },
    ],
    trinhTu: [
      'Gửi đơn yêu cầu hòa giải đến Ban quản lý KP25 hoặc UBND Phường',
      'Tổ hòa giải liên hệ các bên sắp xếp thời gian',
      'Tiến hành hòa giải tại Nhà văn hóa KP25 hoặc địa điểm phù hợp',
      'Lập Biên bản hòa giải thành/không thành',
    ],
    canCuPhapLy: [
      'Luật Hòa giải ở cơ sở 2013 (số 35/2013/QH13)',
      'Nghị định 15/2014/NĐ-CP hướng dẫn Luật Hòa giải ở cơ sở',
    ],
    diaDiemNop: 'Ban quản lý Khu phố 25 hoặc UBND Phường Long Trường',
    thoiGianLamViec: 'Theo thỏa thuận với Tổ hòa giải',
    liuY: 'Hòa giải thành có thể yêu cầu Tòa án công nhận để có hiệu lực thi hành bắt buộc theo khoản 2 Điều 417 BLTTDS 2015.',
    hotline: '0773 735 317',
    noiBat: false,
    tags: ['hòa giải', 'tranh chấp', 'mâu thuẫn', 'ranh giới', 'đất đai'],
  },

  // ══════════════════════════════════════════════
  //  LĨNH VỰC ĐẤT ĐAI – XÂY DỰNG
  // ══════════════════════════════════════════════

  {
    id: 'xd-001',
    maSo: '1.005.1',
    ten: 'Xác nhận thông tin nhà ở, đất đai',
    linhVuc: 'XAY_DUNG',
    mucDoTrucTuyen: 3,
    coQuanGiaiQuyet: 'UBND Phường Long Trường',
    doiTuong: 'Cá nhân, hộ gia đình có nhà/đất tại Phường Long Trường',
    moTa: 'Xác nhận thực trạng, tình trạng sử dụng nhà ở/đất đai tại địa phương theo nhu cầu của công dân (dùng để vay ngân hàng, giải quyết tranh chấp, thừa kế, v.v.).',
    thoiHanGiaiQuyet: '3 ngày làm việc',
    lePhi: 'Không thu',
    phiDichVu: 'Không',
    ketQua: 'Văn bản xác nhận của UBND Phường Long Trường',
    thanhPhanHoSo: [
      { ten: 'Đơn đề nghị xác nhận (tự soạn theo mẫu)', soLuong: '01 bản gốc' },
      { ten: 'CCCD của người đề nghị', soLuong: '01 bản photo' },
      { ten: 'Giấy tờ về nhà/đất (sổ đỏ, giấy tờ mua bán…)', soLuong: '01 bản photo' },
    ],
    trinhTu: [
      'Nộp đơn tại bộ phận Một cửa UBND Phường',
      'Cán bộ địa chính xác minh thực địa (nếu cần)',
      'Lãnh đạo UBND ký xác nhận',
      'Nhận kết quả',
    ],
    canCuPhapLy: [
      'Luật Đất đai 2024 (số 31/2024/QH15) — Hiệu lực 01/01/2025',
      'Luật Nhà ở 2023 (số 27/2023/QH15)',
      'Nghị định 101/2024/NĐ-CP hướng dẫn Luật Đất đai 2024',
    ],
    diaDiemNop: 'Bộ phận Một cửa UBND Phường Long Trường',
    thoiGianLamViec: 'Thứ 2 – Thứ 6: 7h30 – 11h30 & 13h00 – 17h00',
    liuY: 'Thủ tục cấp, chuyển nhượng sổ đỏ/sổ hồng thực hiện tại Chi nhánh Văn phòng Đăng ký Đất đai TP.HCM tại TP.HCM (không thực hiện tại phường).',
    noiBat: false,
    tags: ['xác nhận nhà đất', 'đất đai', 'sổ đỏ', 'nhà ở', 'vay ngân hàng'],
  },

  {
    id: 'xd-002',
    maSo: '1.005.4',
    ten: 'Cấp giấy phép xây dựng nhà ở riêng lẻ (≤ 3 tầng)',
    linhVuc: 'XAY_DUNG',
    mucDoTrucTuyen: 3,
    coQuanGiaiQuyet: 'UBND Phường Long Trường (ủy quyền theo Quyết định TP.HCM)',
    doiTuong: 'Chủ nhà đất muốn xây dựng hoặc sửa chữa nhà ở riêng lẻ ≤ 3 tầng, diện tích xây dựng ≤ 500m²',
    moTa: 'Cấp giấy phép xây dựng nhà ở riêng lẻ tại đô thị có diện tích sàn ≤ 500m², từ 1–3 tầng. Từ 2025, nộp hồ sơ trực tuyến được ưu tiên.',
    thoiHanGiaiQuyet: '15 ngày làm việc',
    lePhi: '75.000đ – 150.000đ (tùy diện tích)',
    phiDichVu: 'Không',
    ketQua: 'Giấy phép xây dựng',
    thanhPhanHoSo: [
      { ten: 'Đơn đề nghị cấp giấy phép xây dựng (Mẫu 01 NĐ 15/2021)', soLuong: '01 bản gốc' },
      { ten: 'Giấy tờ chứng minh quyền sử dụng đất', soLuong: '01 bản photo công chứng' },
      { ten: 'Bản vẽ thiết kế xây dựng (mặt bằng, mặt đứng, mặt cắt)', soLuong: '02 bộ', ghiChu: 'Thể hiện rõ kích thước, cao độ' },
      { ten: 'CCCD của chủ đầu tư', soLuong: '01 bản photo' },
      { ten: 'Giấy phép xây dựng cũ (nếu là sửa chữa)', soLuong: '01 bản photo' },
    ],
    trinhTu: [
      'Nộp hồ sơ trực tuyến hoặc tại bộ phận Một cửa UBND',
      'Cán bộ kiểm tra tính đầy đủ trong 3 ngày',
      'Phòng Quản lý đô thị thẩm định hồ sơ kỹ thuật',
      'UBND Phường ký duyệt và cấp giấy phép',
      'Thu lệ phí và trao kết quả',
    ],
    canCuPhapLy: [
      'Luật Xây dựng 2014 sửa đổi 2020',
      'Nghị định 15/2021/NĐ-CP về quản lý dự án xây dựng',
      'Thông tư 09/2021/TT-BXD',
    ],
    diaDiemNop: 'Bộ phận Một cửa UBND Phường Long Trường',
    thoiGianLamViec: 'Thứ 2 – Thứ 6: 7h30 – 11h30 & 13h00 – 17h00',
    liuY: 'Xây dựng không phép hoặc sai phép sẽ bị xử phạt và buộc tháo dỡ phần vi phạm. Công trình ≥ 4 tầng hoặc có kinh doanh thực hiện tại Phòng Quản lý đô thị cấp trên.',
    hotline: '028 3746 1111',
    noiBat: true,
    tags: ['giấy phép xây dựng', 'xây nhà', 'sửa nhà', 'cải tạo', 'xây dựng'],
  },

  // ══════════════════════════════════════════════
  //  LĨNH VỰC KINH DOANH
  // ══════════════════════════════════════════════

  {
    id: 'kd-001',
    maSo: '1.006.1',
    ten: 'Đăng ký hộ kinh doanh cá thể',
    linhVuc: 'KINH_DOANH',
    mucDoTrucTuyen: 4,
    coQuanGiaiQuyet: 'Phòng Tài chính – Kế hoạch TP.HCM (UBND Phường hỗ trợ)',
    doiTuong: 'Cá nhân, hộ gia đình muốn kinh doanh nhỏ lẻ (không phải doanh nghiệp)',
    moTa: 'Đăng ký thành lập hộ kinh doanh cá thể theo Nghị định 01/2021/NĐ-CP. Từ 2025, nộp trực tuyến qua dichvucong.hochiminhcity.gov.vn. Vốn tối thiểu không yêu cầu.',
    thoiHanGiaiQuyet: '3 ngày làm việc',
    lePhi: '100.000đ/giấy phép',
    phiDichVu: 'Không',
    ketQua: 'Giấy chứng nhận đăng ký hộ kinh doanh',
    thanhPhanHoSo: [
      { ten: 'Giấy đề nghị đăng ký hộ kinh doanh (Phụ lục III-1 NĐ 01/2021)', soLuong: '01 bản gốc' },
      { ten: 'CCCD của chủ hộ kinh doanh', soLuong: '01 bản photo công chứng' },
      { ten: 'Hợp đồng thuê địa điểm kinh doanh (nếu thuê)', soLuong: '01 bản photo' },
      { ten: 'Giấy tờ chứng minh quyền sử dụng mặt bằng', soLuong: '01 bản photo' },
    ],
    trinhTu: [
      'Nộp hồ sơ trực tuyến tại dichvucong.hochiminhcity.gov.vn hoặc tại UBND Phường (chuyển Phòng TC-KH)',
      'Phòng TC-KH kiểm tra tên, ngành nghề, địa điểm kinh doanh',
      'Thu lệ phí đăng ký',
      'Nhận Giấy chứng nhận đăng ký hộ kinh doanh',
    ],
    canCuPhapLy: [
      'Nghị định 01/2021/NĐ-CP về đăng ký doanh nghiệp',
      'Luật Doanh nghiệp 2020 (số 59/2020/QH14)',
      'Thông tư 01/2021/TT-BKHĐT hướng dẫn Nghị định 01/2021',
    ],
    diaDiemNop: 'Bộ phận Một cửa UBND Phường Long Trường (nhận và chuyển) hoặc trực tuyến',
    thoiGianLamViec: 'Thứ 2 – Thứ 6: 7h30 – 11h30 & 13h00 – 17h00',
    liuY: 'Hộ kinh doanh chỉ được hoạt động tại 01 địa điểm. Nếu kinh doanh nhiều địa điểm phải thành lập công ty hoặc doanh nghiệp tư nhân.',
    hotline: '028 3734 1234 (Phòng TC-KH)',
    noiBat: false,
    tags: ['đăng ký kinh doanh', 'hộ kinh doanh', 'buôn bán', 'mở tiệm', 'giấy phép kinh doanh'],
  },

  {
    id: 'kd-002',
    maSo: '1.006.5',
    ten: 'Xác nhận đủ điều kiện an toàn thực phẩm (hộ kinh doanh)',
    linhVuc: 'KINH_DOANH',
    mucDoTrucTuyen: 3,
    coQuanGiaiQuyet: 'UBND Phường Long Trường',
    doiTuong: 'Hộ kinh doanh thực phẩm, nhà hàng, quán ăn, căn tin trường học',
    moTa: 'Xác nhận đủ điều kiện vệ sinh an toàn thực phẩm cho cơ sở kinh doanh dịch vụ ăn uống nhỏ lẻ.',
    thoiHanGiaiQuyet: '7 ngày làm việc',
    lePhi: '150.000đ – 500.000đ tùy quy mô',
    phiDichVu: 'Không',
    ketQua: 'Giấy chứng nhận đủ điều kiện an toàn thực phẩm (hiệu lực 3 năm)',
    thanhPhanHoSo: [
      { ten: 'Đơn đề nghị cấp Giấy chứng nhận', soLuong: '01 bản gốc' },
      { ten: 'Giấy chứng nhận đăng ký kinh doanh', soLuong: '01 bản photo' },
      { ten: 'Giấy khám sức khỏe của chủ cơ sở và nhân viên', soLuong: '01 bản/người (còn hiệu lực trong 12 tháng)' },
      { ten: 'Giấy xác nhận tập huấn kiến thức ATTP', soLuong: '01 bản/người' },
      { ten: 'Bản mô tả cơ sở vật chất, trang thiết bị', soLuong: '01 bản' },
    ],
    trinhTu: [
      'Nộp hồ sơ tại UBND Phường',
      'Đoàn kiểm tra thực tế cơ sở kinh doanh',
      'Khắc phục (nếu cần) và kiểm tra lại',
      'Cấp Giấy chứng nhận',
    ],
    canCuPhapLy: [
      'Luật An toàn thực phẩm 2010 (số 55/2010/QH12)',
      'Nghị định 15/2018/NĐ-CP hướng dẫn Luật An toàn thực phẩm',
    ],
    diaDiemNop: 'Bộ phận Một cửa UBND Phường Long Trường',
    thoiGianLamViec: 'Thứ 2 – Thứ 6: 7h30 – 11h30 & 13h00 – 17h00',
    noiBat: false,
    tags: ['an toàn thực phẩm', 'quán ăn', 'nhà hàng', 'vệ sinh thực phẩm', 'kinh doanh ăn uống'],
  },
]

// ─── Helper functions ─────────────────────────────────────────

export function getThuTucById(id: string): ThuTuc | undefined {
  return DS_THU_TUC.find(t => t.id === id)
}

export function getThuTucByLinhVuc(linhVuc: LinhVuc): ThuTuc[] {
  return DS_THU_TUC.filter(t => t.linhVuc === linhVuc)
}

export function getThuTucNoiBat(): ThuTuc[] {
  return DS_THU_TUC.filter(t => t.noiBat)
}

export function searchThuTuc(query: string): ThuTuc[] {
  const q = query.toLowerCase().trim()
  if (!q) return DS_THU_TUC
  return DS_THU_TUC.filter(t =>
    t.ten.toLowerCase().includes(q) ||
    t.moTa.toLowerCase().includes(q) ||
    (t.tags ?? []).some(tag => tag.includes(q)) ||
    t.maSo.includes(q)
  )
}
