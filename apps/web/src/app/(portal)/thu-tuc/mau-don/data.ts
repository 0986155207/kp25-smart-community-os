/**
 * Danh mục mẫu đơn hành chính — Phường Long Trường, TP.HCM
 * Theo các biểu mẫu chính thức của Bộ Tư pháp, Bộ Công an và các Bộ liên quan
 */

export interface MauDon {
  id: string            // URL slug
  maSo: string          // Số hiệu biểu mẫu chính thức
  ten: string           // Tên mẫu đơn
  thuTucIds: string[]   // Các thủ tục sử dụng mẫu này
  banHanh: string       // Cơ quan ban hành
  canCu: string         // Căn cứ pháp lý
  huongDan: string      // Hướng dẫn điền
  trangIn: number       // Số trang (A4)
}

export const DS_MAU_DON: MauDon[] = [
  {
    id: 'to-khai-khai-sinh',
    maSo: 'TP/HT-2015-KS.1',
    ten: 'Tờ khai đăng ký khai sinh',
    thuTucIds: ['ht-001', 'ht-005'],
    banHanh: 'Bộ Tư pháp',
    canCu: 'Thông tư 04/2020/TT-BTP ngày 28/5/2020',
    huongDan: 'Điền đầy đủ thông tin về trẻ và cha mẹ. In 01 bản, không tẩy xóa.',
    trangIn: 1,
  },
  {
    id: 'to-khai-khai-tu',
    maSo: 'TP/HT-2015-KT.1',
    ten: 'Tờ khai đăng ký khai tử',
    thuTucIds: ['ht-002'],
    banHanh: 'Bộ Tư pháp',
    canCu: 'Thông tư 04/2020/TT-BTP ngày 28/5/2020',
    huongDan: 'Điền thông tin người đã mất và người khai báo. Mang kèm giấy báo tử.',
    trangIn: 1,
  },
  {
    id: 'to-khai-ket-hon',
    maSo: 'TP/HT-2015-KH.1',
    ten: 'Tờ khai đăng ký kết hôn',
    thuTucIds: ['ht-003'],
    banHanh: 'Bộ Tư pháp',
    canCu: 'Thông tư 04/2020/TT-BTP ngày 28/5/2020',
    huongDan: 'Mỗi người tự điền một tờ khai riêng. Không điền trước phần ký tên.',
    trangIn: 1,
  },
  {
    id: 'to-khai-nhan-cha-me-con',
    maSo: 'TP/HT-2015-NCMC.1',
    ten: 'Tờ khai đăng ký nhận cha, mẹ, con',
    thuTucIds: ['ht-004'],
    banHanh: 'Bộ Tư pháp',
    canCu: 'Thông tư 04/2020/TT-BTP ngày 28/5/2020',
    huongDan: 'Điền đầy đủ thông tin cả hai bên. Phải có mặt trực tiếp khi nộp hồ sơ.',
    trangIn: 1,
  },
  {
    id: 'phieu-bao-thay-doi-ho-khau',
    maSo: 'Mẫu HK02',
    ten: 'Phiếu báo thay đổi hộ khẩu, nhân khẩu',
    thuTucIds: ['ct-001', 'ct-002', 'ct-003'],
    banHanh: 'Bộ Công an',
    canCu: 'Thông tư 56/2021/TT-BCA ngày 15/5/2021',
    huongDan: 'Điền thông tin thay đổi cư trú. Có thể nộp trực tuyến qua VNeID.',
    trangIn: 1,
  },
  {
    id: 'to-khai-tro-cap-xa-hoi',
    maSo: 'Mẫu số 01/TGXH',
    ten: 'Tờ khai đề nghị trợ cấp xã hội hàng tháng',
    thuTucIds: ['as-001'],
    banHanh: 'Bộ Lao động – Thương binh & Xã hội',
    canCu: 'Thông tư 02/2021/TT-BLĐTBXH ngày 24/6/2021',
    huongDan: 'Điền đầy đủ thông tin cá nhân, tình trạng sức khỏe và hoàn cảnh gia đình.',
    trangIn: 2,
  },
  {
    id: 'don-xet-ho-ngheo',
    maSo: 'Mẫu số 01/HN',
    ten: 'Đơn đề nghị xét, công nhận hộ nghèo / cận nghèo',
    thuTucIds: ['as-002'],
    banHanh: 'UBND TP.HCM',
    canCu: 'Quyết định 3310/QĐ-UBND TP.HCM về chuẩn nghèo đa chiều 2026',
    huongDan: 'Điền thông tin thu nhập thực tế của hộ gia đình.',
    trangIn: 1,
  },
  {
    id: 'don-de-nghi-phep-xay-dung',
    maSo: 'Mẫu số 01 — NĐ 15/2021',
    ten: 'Đơn đề nghị cấp giấy phép xây dựng',
    thuTucIds: ['xd-002'],
    banHanh: 'Bộ Xây dựng',
    canCu: 'Nghị định 15/2021/NĐ-CP ngày 3/3/2021',
    huongDan: 'Điền thông tin chủ đầu tư, địa điểm và quy mô công trình. Kèm bản vẽ thiết kế.',
    trangIn: 1,
  },
  {
    id: 'giay-de-nghi-dang-ky-ho-kd',
    maSo: 'Phụ lục III-1 — NĐ 01/2021',
    ten: 'Giấy đề nghị đăng ký hộ kinh doanh',
    thuTucIds: ['kd-001'],
    banHanh: 'Bộ Kế hoạch & Đầu tư',
    canCu: 'Nghị định 01/2021/NĐ-CP ngày 4/1/2021',
    huongDan: 'Điền đầy đủ thông tin hộ kinh doanh, ngành nghề và địa điểm kinh doanh.',
    trangIn: 1,
  },
  {
    id: 'don-xac-nhan-ly-lich-tu-phap',
    maSo: 'Mẫu số 03/2013/TT-BTP',
    ten: 'Tờ khai yêu cầu cấp Phiếu lý lịch tư pháp',
    thuTucIds: ['tp-001'],
    banHanh: 'Bộ Tư pháp',
    canCu: 'Thông tư 13/2011/TT-BTP ngày 27/6/2011',
    huongDan: 'Điền đầy đủ thông tin cá nhân. Ghi rõ mục đích sử dụng phiếu.',
    trangIn: 1,
  },
]

export function getMauDonById(id: string): MauDon | undefined {
  return DS_MAU_DON.find(m => m.id === id)
}

export function getMauDonByThuTuc(thuTucId: string): MauDon[] {
  return DS_MAU_DON.filter(m => m.thuTucIds.includes(thuTucId))
}
