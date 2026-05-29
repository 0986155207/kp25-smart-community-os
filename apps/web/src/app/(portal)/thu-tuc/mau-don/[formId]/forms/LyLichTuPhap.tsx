// Mẫu số 03/2013/TT-BTP — Tờ khai yêu cầu cấp Phiếu lý lịch tư pháp

export default function FormLyLichTuPhap() {
  return (
    <div className="form-a4">
      <div className="flex justify-between items-start mb-3">
        <div className="text-center text-xs w-56">
          <p className="font-bold">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
          <p>Độc lập – Tự do – Hạnh phúc</p>
          <p>───────────────</p>
        </div>
        <div className="text-right text-xs">
          <p>Mẫu số 03/2013/TT-BTP</p>
          <p className="text-gray-500">Thông tư 13/2011/TT-BTP</p>
        </div>
      </div>

      <div className="text-center mb-4">
        <h1 className="text-base font-bold uppercase">TỜ KHAI YÊU CẦU CẤP</h1>
        <h2 className="text-sm font-bold uppercase">PHIẾU LÝ LỊCH TƯ PHÁP</h2>
        <p className="text-xs text-gray-500 mt-1">(Cấp cho công dân Việt Nam)</p>
      </div>

      <div className="mb-3 text-sm">
        <p>Kính gửi: <span className="underline-field w-64">Sở Tư pháp TP.HCM</span></p>
        <p className="text-gray-500 text-xs mt-1">(Nộp qua UBND Phường Long Trường hoặc trực tuyến tại lyjlichtupháp.gov.vn)</p>
      </div>

      <div className="section-box mb-3">
        <p className="font-bold text-sm mb-2">I. LOẠI PHIẾU YÊU CẦU</p>
        <div className="flex gap-8 text-sm">
          <label className="flex items-start gap-2">
            <input type="radio" name="loai_phieu" className="mt-0.5" />
            <div>
              <p className="font-semibold">Phiếu số 1</p>
              <p className="text-gray-500 text-xs">Ghi đầy đủ các án tích (dùng cho cá nhân)</p>
            </div>
          </label>
          <label className="flex items-start gap-2">
            <input type="radio" name="loai_phieu" className="mt-0.5" />
            <div>
              <p className="font-semibold">Phiếu số 2</p>
              <p className="text-gray-500 text-xs">Ghi các án tích chưa được xóa (dùng cho cơ quan, tổ chức)</p>
            </div>
          </label>
        </div>
      </div>

      <div className="section-box mb-3">
        <p className="font-bold text-sm mb-2">II. THÔNG TIN NGƯỜI YÊU CẦU CẤP PHIẾU</p>
        <div className="space-y-2 text-sm">
          <div className="flex gap-4">
            <span className="w-48 shrink-0">Họ và tên:</span>
            <span className="underline-field flex-1" />
          </div>
          <div className="flex gap-4">
            <span className="w-48 shrink-0">Ngày, tháng, năm sinh:</span>
            <span className="underline-field flex-1" />
            <span className="w-20 shrink-0">Giới tính:</span>
            <span className="underline-field flex-1" />
          </div>
          <div className="flex gap-4">
            <span className="w-48 shrink-0">Dân tộc:</span>
            <span className="underline-field w-28" />
            <span className="w-24 shrink-0">Quốc tịch:</span>
            <span className="underline-field flex-1" />
          </div>
          <div className="flex gap-4">
            <span className="w-48 shrink-0">CCCD/CMND số:</span>
            <span className="underline-field w-44" />
            <span className="w-20 shrink-0">Cấp ngày:</span>
            <span className="underline-field flex-1" />
          </div>
          <div className="flex gap-4">
            <span className="w-48 shrink-0">Nơi cấp:</span>
            <span className="underline-field flex-1" />
          </div>
          <div className="flex gap-4">
            <span className="w-48 shrink-0">Nơi sinh:</span>
            <span className="underline-field flex-1" />
          </div>
          <div className="flex gap-4">
            <span className="w-48 shrink-0">Nơi đăng ký thường trú:</span>
            <span className="underline-field flex-1" />
          </div>
          <div className="flex gap-4">
            <span className="w-48 shrink-0">Nơi ở hiện tại:</span>
            <span className="underline-field flex-1" />
          </div>
          <div className="flex gap-4">
            <span className="w-48 shrink-0">Số điện thoại:</span>
            <span className="underline-field flex-1" />
            <span className="w-20 shrink-0">Email:</span>
            <span className="underline-field flex-1" />
          </div>
        </div>
      </div>

      <div className="section-box mb-3">
        <p className="font-bold text-sm mb-2">III. MỤC ĐÍCH SỬ DỤNG PHIẾU</p>
        <div className="grid grid-cols-2 gap-2 text-sm mb-3">
          {[
            'Xin việc làm trong nước',
            'Xin việc làm ở nước ngoài / xuất khẩu lao động',
            'Đăng ký kết hôn với người nước ngoài',
            'Nhận con nuôi / nhận nuôi con nuôi nước ngoài',
            'Thủ tục hành chính khác (ghi rõ)',
            'Mục đích khác (ghi rõ)',
          ].map((item, i) => (
            <label key={i} className="flex items-start gap-2">
              <input type="checkbox" className="mt-0.5 shrink-0" />
              <span>{item}</span>
            </label>
          ))}
        </div>
        <div className="flex gap-4 text-sm mt-2">
          <span className="w-48 shrink-0">Ghi rõ mục đích khác:</span>
          <span className="underline-field flex-1" />
        </div>
      </div>

      <div className="section-box mb-3">
        <p className="font-bold text-sm mb-2">IV. HÌNH THỨC NHẬN KẾT QUẢ</p>
        <div className="flex gap-8 text-sm">
          <label className="flex items-center gap-2">
            <input type="radio" name="nhan_ket_qua" />
            <span>Nhận trực tiếp tại nơi nộp</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="nhan_ket_qua" />
            <span>Nhận qua bưu điện (ghi địa chỉ):</span>
          </label>
        </div>
        <div className="flex gap-4 text-sm mt-2">
          <span className="w-48 shrink-0">Địa chỉ nhận bưu điện:</span>
          <span className="underline-field flex-1" />
        </div>
      </div>

      <div className="mb-4 text-sm">
        <p>Tôi cam kết những nội dung kê khai trên đây là đúng sự thật và chịu trách nhiệm trước pháp luật.</p>
      </div>

      <div className="flex justify-between text-sm mt-6">
        <div className="text-center w-52">
          <p className="font-semibold">Xác nhận của UBND Phường</p>
          <p className="text-xs text-gray-500 mb-1">(Ký, đóng dấu)</p>
          <p className="text-xs text-gray-500 mb-10">Ngày ……… tháng ……… năm ………</p>
        </div>
        <div className="text-center w-52">
          <p>Long Trường, ngày <span className="underline-field w-8" /> tháng <span className="underline-field w-8" /> năm <span className="underline-field w-12" /></p>
          <p className="font-semibold mt-1">Người yêu cầu</p>
          <p className="text-gray-500 text-xs mb-10">(Ký, ghi rõ họ tên)</p>
        </div>
      </div>

      <div className="text-xs text-gray-500 border-t pt-2 mt-4">
        <p>– Lệ phí: 200.000đ/phiếu (Thông tư 174/2012/TT-BTC). Miễn lệ phí đối tượng hưởng trợ cấp xã hội.</p>
        <p>– Thời hạn: 10 ngày làm việc kể từ ngày nhận đủ hồ sơ hợp lệ.</p>
        <p>– Có thể nộp trực tuyến tại: <strong>lyjlichtupháp.moj.gov.vn</strong> (Phiếu số 1) hoặc Cổng DVCQG.</p>
      </div>
    </div>
  )
}
