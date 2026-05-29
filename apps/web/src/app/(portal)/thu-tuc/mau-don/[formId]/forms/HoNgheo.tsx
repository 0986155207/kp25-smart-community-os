// Mẫu số 01/HN — Đơn đề nghị xét, công nhận hộ nghèo / cận nghèo

export default function FormHoNgheo() {
  return (
    <div className="form-a4">
      <div className="flex justify-between items-start mb-3">
        <div className="text-center text-xs w-52">
          <p className="font-bold">UBND PHƯỜNG LONG TRƯỜNG</p>
          <p>──────────────</p>
          <p className="font-bold text-[10px]">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
          <p className="text-[10px]">Độc lập – Tự do – Hạnh phúc</p>
        </div>
        <div className="text-right text-xs">
          <p>Mẫu số 01/HN</p>
          <p className="text-gray-500">(Theo QĐ chuẩn nghèo đa chiều TP.HCM 2026)</p>
        </div>
      </div>

      <div className="text-center mb-4">
        <h1 className="text-base font-bold uppercase">ĐƠN ĐỀ NGHỊ</h1>
        <h2 className="text-sm font-bold uppercase">XÉT, CÔNG NHẬN HỘ NGHÈO / CẬN NGHÈO</h2>
        <p className="text-xs text-gray-500 mt-1">Năm <span className="underline-field w-12" /></p>
      </div>

      <div className="mb-3 text-sm">
        <p>Kính gửi: <span className="underline-field flex-1">UBND Phường Long Trường</span></p>
      </div>

      <div className="section-box mb-3">
        <p className="font-bold text-sm mb-2">I. THÔNG TIN CHỦ HỘ</p>
        <div className="space-y-2 text-sm">
          <div className="flex gap-4">
            <span className="w-48 shrink-0">Họ và tên chủ hộ:</span>
            <span className="underline-field flex-1" />
          </div>
          <div className="flex gap-4">
            <span className="w-48 shrink-0">Ngày, tháng, năm sinh:</span>
            <span className="underline-field flex-1" />
            <span className="w-20 shrink-0">Giới tính:</span>
            <span className="underline-field flex-1" />
          </div>
          <div className="flex gap-4">
            <span className="w-48 shrink-0">CCCD/CMND số:</span>
            <span className="underline-field flex-1" />
          </div>
          <div className="flex gap-4">
            <span className="w-48 shrink-0">Địa chỉ thường trú:</span>
            <span className="underline-field flex-1" />
          </div>
          <div className="flex gap-4">
            <span className="w-48 shrink-0">Số điện thoại:</span>
            <span className="underline-field flex-1" />
          </div>
        </div>
      </div>

      <div className="section-box mb-3">
        <p className="font-bold text-sm mb-2">II. THÀNH VIÊN HỘ GIA ĐÌNH</p>
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr>
              <th className="border border-gray-300 p-1 text-center w-6">STT</th>
              <th className="border border-gray-300 p-1">Họ và tên</th>
              <th className="border border-gray-300 p-1 w-20">Năm sinh</th>
              <th className="border border-gray-300 p-1 w-28">Quan hệ với chủ hộ</th>
              <th className="border border-gray-300 p-1 w-24">Nghề nghiệp</th>
              <th className="border border-gray-300 p-1 w-28">Thu nhập (đ/tháng)</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5].map(i => (
              <tr key={i}>
                <td className="border border-gray-300 p-1 text-center">{i}</td>
                <td className="border border-gray-300 p-1 h-6" />
                <td className="border border-gray-300 p-1" />
                <td className="border border-gray-300 p-1" />
                <td className="border border-gray-300 p-1" />
                <td className="border border-gray-300 p-1" />
              </tr>
            ))}
            <tr>
              <td colSpan={5} className="border border-gray-300 p-1 text-right font-semibold text-xs">
                Tổng thu nhập cả hộ (đ/tháng):
              </td>
              <td className="border border-gray-300 p-1" />
            </tr>
          </tbody>
        </table>
      </div>

      <div className="section-box mb-3">
        <p className="font-bold text-sm mb-2">III. THỰC TRẠNG THIẾU HỤT CÁC CHIỀU (đánh dấu ☑ nếu có)</p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {[
            'Chiều 1 — Việc làm (thất nghiệp, thiếu việc làm)',
            'Chiều 2 — Y tế (không BHYT, bệnh hiểm nghèo)',
            'Chiều 3 — Giáo dục (trẻ em không đến trường)',
            'Chiều 4 — Nhà ở (nhà tạm, dột nát, thiếu diện tích)',
            'Chiều 5 — Nước sạch và vệ sinh (thiếu nước sinh hoạt)',
            'Chiều 6 — Thông tin (không có thiết bị tiếp cận)',
          ].map(item => (
            <label key={item} className="flex items-start gap-2">
              <input type="checkbox" className="mt-0.5 shrink-0" />
              <span>{item}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="section-box mb-3">
        <p className="font-bold text-sm mb-2">IV. LÝ DO ĐỀ NGHỊ</p>
        <div className="space-y-2 text-sm">
          <p className="text-gray-500 text-xs mb-1">Trình bày hoàn cảnh khó khăn, lý do cần hỗ trợ:</p>
          <div className="border-b border-gray-300 h-6" />
          <div className="border-b border-gray-300 h-6" />
          <div className="border-b border-gray-300 h-6" />
        </div>
      </div>

      <div className="mb-4 text-sm">
        <p>Tôi cam kết các thông tin kê khai trên đây là trung thực, đúng sự thật. Nếu sai sẽ chịu hoàn toàn trách nhiệm trước pháp luật.</p>
      </div>

      <div className="flex justify-between text-sm mt-4">
        <div className="text-center w-64">
          <p className="font-semibold">Xác nhận của Tổ trưởng khu phố</p>
          <p className="text-gray-500 text-xs mb-12">(Ký, ghi rõ họ tên)</p>
        </div>
        <div className="text-center w-52">
          <p>Long Trường, ngày <span className="underline-field w-8" /> tháng <span className="underline-field w-8" /> năm <span className="underline-field w-12" /></p>
          <p className="font-semibold mt-1">Chủ hộ ký</p>
          <p className="text-gray-500 text-xs mb-12">(Ký, ghi rõ họ tên)</p>
        </div>
      </div>

      <div className="text-xs text-gray-500 border-t pt-2 mt-4">
        <p>– Chuẩn nghèo TP.HCM 2026: thu nhập bình quân ≤ 36 triệu đồng/người/năm (hộ nghèo) hoặc ≤ 54 triệu (cận nghèo).</p>
        <p>– Rà soát hàng năm vào tháng 10–11. Hộ nghèo được miễn/giảm học phí, BHYT, tiền điện nước.</p>
        <p>– Nộp kèm: bản sao CCCD, sổ hộ khẩu/xác nhận cư trú, giấy tờ chứng minh thu nhập (nếu có).</p>
      </div>
    </div>
  )
}
