// Mẫu HK02 — Phiếu báo thay đổi hộ khẩu, nhân khẩu (Bộ Công an)

export default function FormHoKhau() {
  return (
    <div className="form-a4">
      <div className="flex justify-between items-start mb-3">
        <div className="text-center text-xs w-48">
          <p className="font-bold">BỘ CÔNG AN</p>
          <p>──────────────</p>
          <p className="font-bold text-[10px]">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
          <p className="text-[10px]">Độc lập – Tự do – Hạnh phúc</p>
        </div>
        <div className="text-right text-xs">
          <p>Mẫu: HK02</p>
          <p className="text-gray-500">(Ban hành kèm TT 56/2021/TT-BCA)</p>
        </div>
      </div>

      <div className="text-center mb-4">
        <h1 className="text-base font-bold uppercase">PHIẾU BÁO THAY ĐỔI HỘ KHẨU, NHÂN KHẨU</h1>
        <p className="text-xs text-gray-500 mt-1">
          Áp dụng cho: Đăng ký thường trú / Xóa thường trú / Tách hộ / Thay đổi thông tin cư trú
        </p>
      </div>

      <div className="section-box mb-3">
        <p className="font-bold text-sm mb-2">I. NỘI DUNG ĐỀ NGHỊ</p>
        <div className="grid grid-cols-2 gap-2 text-sm mb-2">
          {['Đăng ký thường trú', 'Xóa đăng ký thường trú', 'Tách hộ', 'Điều chỉnh thông tin cư trú'].map(item => (
            <label key={item} className="flex items-center gap-2">
              <input type="checkbox" />
              <span>{item}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="section-box mb-3">
        <p className="font-bold text-sm mb-2">II. THÔNG TIN CHỦ HỘ / NGƯỜI ĐỀ NGHỊ</p>
        <div className="space-y-2 text-sm">
          <div className="flex gap-4">
            <span className="w-40 shrink-0">Họ và tên:</span>
            <span className="underline-field flex-1" />
          </div>
          <div className="flex gap-4">
            <span className="w-40 shrink-0">Ngày, tháng, năm sinh:</span>
            <span className="underline-field flex-1" />
          </div>
          <div className="flex gap-4">
            <span className="w-40 shrink-0">CCCD gắn chip số:</span>
            <span className="underline-field flex-1" />
          </div>
          <div className="flex gap-4">
            <span className="w-40 shrink-0">Số điện thoại:</span>
            <span className="underline-field flex-1" />
          </div>
        </div>
      </div>

      <div className="section-box mb-3">
        <p className="font-bold text-sm mb-2">III. ĐỊA CHỈ HIỆN TẠI (NƠI ĐANG Ở / NƠI ĐĂNG KÝ)</p>
        <div className="space-y-2 text-sm">
          <div className="flex gap-4">
            <span className="w-40 shrink-0">Số nhà, đường:</span>
            <span className="underline-field flex-1" />
          </div>
          <div className="flex gap-4">
            <span className="w-40 shrink-0">Phường/xã:</span>
            <span className="underline-field flex-1" />
            <span className="w-24 shrink-0">Thành phố:</span>
            <span className="underline-field flex-1" />
          </div>
        </div>
      </div>

      <div className="section-box mb-3">
        <p className="font-bold text-sm mb-2">IV. ĐỊA CHỈ MỚI (NƠI CHUYỂN ĐẾN / NƠI TÁCH HỘ)</p>
        <div className="space-y-2 text-sm">
          <div className="flex gap-4">
            <span className="w-40 shrink-0">Số nhà, đường:</span>
            <span className="underline-field flex-1" />
          </div>
          <div className="flex gap-4">
            <span className="w-40 shrink-0">Phường/xã:</span>
            <span className="underline-field flex-1" />
            <span className="w-24 shrink-0">Thành phố:</span>
            <span className="underline-field flex-1" />
          </div>
          <div className="flex gap-4">
            <span className="w-40 shrink-0">Hình thức sở hữu:</span>
            <span className="underline-field flex-1" />
          </div>
        </div>
      </div>

      <div className="section-box mb-3">
        <p className="font-bold text-sm mb-2">V. DANH SÁCH NGƯỜI CHUYỂN THEO (nếu có)</p>
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border border-gray-300">
              <th className="border border-gray-300 p-1 text-center w-6">STT</th>
              <th className="border border-gray-300 p-1">Họ và tên</th>
              <th className="border border-gray-300 p-1 w-24">Ngày sinh</th>
              <th className="border border-gray-300 p-1 w-28">Quan hệ với chủ hộ</th>
              <th className="border border-gray-300 p-1 w-32">Số CCCD</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3].map(i => (
              <tr key={i} className="border border-gray-300">
                <td className="border border-gray-300 p-1 text-center">{i}</td>
                <td className="border border-gray-300 p-1 h-6" />
                <td className="border border-gray-300 p-1" />
                <td className="border border-gray-300 p-1" />
                <td className="border border-gray-300 p-1" />
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mb-3 text-sm">
        <p className="font-semibold mb-1">Giấy tờ kèm theo:</p>
        <div className="space-y-1 ml-3 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" />
            <span>CCCD gắn chip còn hiệu lực</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" />
            <span>Giấy tờ về chỗ ở hợp pháp (Sổ đỏ / Hợp đồng thuê / Văn bản đồng ý chủ hộ)</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" />
            <span>Văn bản đồng ý của chủ hộ (nếu nhập vào hộ khác)</span>
          </label>
        </div>
      </div>

      <div className="flex justify-between text-sm mt-6">
        <div>
          <p className="font-semibold text-center">Ý kiến của Cảnh sát khu vực</p>
          <p className="text-gray-500 text-xs text-center mb-14">(Ký, ghi rõ họ tên)</p>
        </div>
        <div className="text-center">
          <p>Long Trường, ngày <span className="underline-field w-8" /> tháng <span className="underline-field w-8" /> năm <span className="underline-field w-12" /></p>
          <p className="font-semibold mt-1">Người đề nghị</p>
          <p className="text-gray-500 text-xs mb-14">(Ký, ghi rõ họ tên)</p>
        </div>
        <div>
          <p className="font-semibold text-center">TRƯỞNG CÔNG AN PHƯỜNG</p>
          <p className="text-gray-500 text-xs text-center mb-14">(Ký, đóng dấu)</p>
        </div>
      </div>

      <div className="text-xs text-gray-500 border-t pt-2 mt-4">
        <p>– Từ 01/01/2023: sổ hộ khẩu giấy không còn giá trị. Thông tin cư trú lưu trên CSDL điện tử quốc gia.</p>
        <p>– Có thể nộp trực tuyến qua ứng dụng <strong>VNeID</strong> trên điện thoại.</p>
      </div>
    </div>
  )
}
