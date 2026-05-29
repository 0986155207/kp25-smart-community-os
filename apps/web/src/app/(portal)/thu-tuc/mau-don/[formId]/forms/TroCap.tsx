// Mẫu số 01/TGXH — Tờ khai đề nghị trợ cấp xã hội (NĐ 20/2021)

export default function FormTroCap() {
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
          <p>Mẫu số 01/TGXH</p>
          <p className="text-gray-500">(TT 02/2021/TT-BLĐTBXH)</p>
        </div>
      </div>

      <div className="text-center mb-4">
        <h1 className="text-base font-bold uppercase">TỜ KHAI ĐỀ NGHỊ</h1>
        <h2 className="text-sm font-bold uppercase">HƯỞNG TRỢ CẤP XÃ HỘI HÀNG THÁNG</h2>
        <p className="text-xs text-gray-500 mt-1">(Theo Nghị định số 20/2021/NĐ-CP)</p>
      </div>

      <div className="section-box mb-3">
        <p className="font-bold text-sm mb-2">I. THÔNG TIN CÁ NHÂN</p>
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
            <span className="w-48 shrink-0">CCCD/CMND số:</span>
            <span className="underline-field flex-1" />
          </div>
          <div className="flex gap-4">
            <span className="w-48 shrink-0">Nơi đăng ký thường trú:</span>
            <span className="underline-field flex-1" />
          </div>
          <div className="flex gap-4">
            <span className="w-48 shrink-0">Số điện thoại liên hệ:</span>
            <span className="underline-field flex-1" />
          </div>
          <div className="flex gap-4">
            <span className="w-48 shrink-0">Tài khoản ngân hàng:</span>
            <span className="underline-field flex-1" />
            <span className="w-24 shrink-0">Ngân hàng:</span>
            <span className="underline-field flex-1" />
          </div>
        </div>
      </div>

      <div className="section-box mb-3">
        <p className="font-bold text-sm mb-2">II. ĐỐI TƯỢNG ĐỀ NGHỊ TRỢ CẤP (đánh dấu ☑)</p>
        <div className="grid grid-cols-1 gap-2 text-sm">
          {[
            'Người cao tuổi (từ 60 tuổi trở lên) thuộc hộ nghèo, không có người nuôi dưỡng',
            'Người cao tuổi từ 80 tuổi trở lên không có lương hưu/trợ cấp BHXH',
            'Trẻ em dưới 16 tuổi không nơi nương tựa',
            'Người khuyết tật nặng hoặc đặc biệt nặng',
            'Người đơn thân thuộc hộ nghèo đang nuôi con dưới 16 tuổi',
            'Người nhiễm HIV/AIDS thuộc hộ nghèo',
            'Hộ gia đình có từ 02 thành viên trở lên không còn khả năng lao động',
          ].map(item => (
            <label key={item} className="flex items-start gap-2">
              <input type="checkbox" className="mt-0.5 shrink-0" />
              <span>{item}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="section-box mb-3">
        <p className="font-bold text-sm mb-2">III. TÌNH TRẠNG SỨC KHỎE (nếu là người khuyết tật)</p>
        <div className="space-y-2 text-sm">
          <div className="flex gap-4">
            <span className="w-48 shrink-0">Mức độ khuyết tật:</span>
            <span className="underline-field flex-1" />
          </div>
          <div className="flex gap-4">
            <span className="w-48 shrink-0">Loại khuyết tật:</span>
            <span className="underline-field flex-1" />
          </div>
          <div className="flex gap-4">
            <span className="w-48 shrink-0">Số Giấy xác nhận khuyết tật:</span>
            <span className="underline-field flex-1" />
          </div>
        </div>
      </div>

      <div className="section-box mb-3">
        <p className="font-bold text-sm mb-2">IV. HOÀN CẢNH GIA ĐÌNH</p>
        <div className="space-y-2 text-sm">
          <div className="flex gap-4">
            <span className="w-48 shrink-0">Số thành viên trong hộ:</span>
            <span className="underline-field w-16" />
            <span className="w-36 shrink-0">Thu nhập bình quân:</span>
            <span className="underline-field flex-1" />
            <span className="shrink-0">đ/người/tháng</span>
          </div>
          <div className="flex gap-4">
            <span className="w-48 shrink-0">Hộ nghèo/cận nghèo:</span>
            <label className="flex items-center gap-1"><input type="checkbox" /> Có</label>
            <label className="flex items-center gap-1 ml-4"><input type="checkbox" /> Không</label>
          </div>
          <div className="flex gap-4">
            <span className="w-48 shrink-0">Số Sổ hộ nghèo:</span>
            <span className="underline-field flex-1" />
          </div>
        </div>
      </div>

      <div className="mb-4 text-sm">
        <p>Tôi cam kết nội dung khai trên đây là đúng sự thật. Nếu khai sai, tôi xin chịu hoàn toàn trách nhiệm trước pháp luật.</p>
      </div>

      <div className="flex justify-between text-sm mt-4">
        <div className="text-center w-52">
          <p className="font-semibold">Xác nhận của UBND Phường</p>
          <p className="text-gray-500 text-xs mb-14">(Ký, đóng dấu)</p>
        </div>
        <div className="text-center w-52">
          <p>Long Trường, ngày <span className="underline-field w-8" /> tháng <span className="underline-field w-8" /> năm <span className="underline-field w-12" /></p>
          <p className="font-semibold mt-1">Người đề nghị</p>
          <p className="text-gray-500 text-xs mb-14">(Ký, ghi rõ họ tên)</p>
        </div>
      </div>

      <div className="text-xs text-gray-500 border-t pt-2 mt-4">
        <p>– Mức trợ cấp chuẩn 2026: từ 360.000đ – 1.800.000đ/tháng (theo lương cơ sở 2.340.000đ).</p>
        <p>– Nộp kèm: Giấy tờ chứng minh đối tượng, giấy tờ nhân thân, sổ hộ nghèo (nếu có).</p>
      </div>
    </div>
  )
}
