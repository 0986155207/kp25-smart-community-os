// Mẫu TP/HT-2015-KH.1 — Tờ khai đăng ký kết hôn

export default function FormKetHon() {
  return (
    <div className="form-a4">
      <div className="text-center mb-2">
        <p className="font-bold text-sm">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
        <p className="text-sm">Độc lập – Tự do – Hạnh phúc</p>
        <p className="text-sm">───────────────</p>
      </div>
      <div className="text-center mb-4">
        <p className="text-[10px] text-gray-500">Mẫu TP/HT-2015-KH.1 (Ban hành kèm theo Thông tư số 04/2020/TT-BTP)</p>
        <h1 className="text-base font-bold uppercase mt-1">TỜ KHAI ĐĂNG KÝ KẾT HÔN</h1>
        <p className="text-xs text-gray-500 mt-1">(Mỗi bên phải tự điền một tờ khai riêng)</p>
      </div>

      <div className="mb-3 text-sm">
        <p>Kính gửi: <span className="underline-field w-64">UBND Phường Long Trường</span></p>
      </div>

      <div className="section-box mb-3">
        <p className="font-bold text-sm mb-2">THÔNG TIN CỦA BẢN THÂN</p>
        <div className="space-y-2 text-sm">
          <div className="flex gap-4">
            <span className="w-48 shrink-0">Họ và tên:</span>
            <span className="underline-field flex-1" />
          </div>
          <div className="flex gap-4">
            <span className="w-48 shrink-0">Ngày, tháng, năm sinh:</span>
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
            <span className="w-48 shrink-0">Nơi đăng ký thường trú:</span>
            <span className="underline-field flex-1" />
          </div>
          <div className="flex gap-4">
            <span className="w-48 shrink-0">Điện thoại:</span>
            <span className="underline-field flex-1" />
          </div>
        </div>
      </div>

      <div className="section-box mb-3">
        <p className="font-bold text-sm mb-2">THÔNG TIN VỀ NGƯỜI KẾT HÔN CÙNG</p>
        <div className="space-y-2 text-sm">
          <div className="flex gap-4">
            <span className="w-48 shrink-0">Họ và tên:</span>
            <span className="underline-field flex-1" />
          </div>
          <div className="flex gap-4">
            <span className="w-48 shrink-0">Ngày, tháng, năm sinh:</span>
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
            <span className="underline-field flex-1" />
          </div>
          <div className="flex gap-4">
            <span className="w-48 shrink-0">Nơi đăng ký thường trú:</span>
            <span className="underline-field flex-1" />
          </div>
        </div>
      </div>

      <div className="section-box mb-3">
        <p className="font-bold text-sm mb-2">CAM KẾT VÀ XÁC NHẬN</p>
        <div className="space-y-2 text-sm">
          <label className="flex items-start gap-2">
            <input type="checkbox" className="mt-0.5 shrink-0" />
            <span>Đến thời điểm đăng ký kết hôn, tôi đang không có vợ/chồng hợp pháp.</span>
          </label>
          <label className="flex items-start gap-2">
            <input type="checkbox" className="mt-0.5 shrink-0" />
            <span>Tôi và người kết hôn cùng tôi không thuộc các trường hợp cấm kết hôn theo Luật Hôn nhân và gia đình.</span>
          </label>
          <label className="flex items-start gap-2">
            <input type="checkbox" className="mt-0.5 shrink-0" />
            <span>Việc kết hôn hoàn toàn tự nguyện, không bị ép buộc, không bị lừa dối.</span>
          </label>
        </div>
      </div>

      <div className="mb-4 text-sm">
        <p>Tôi cam kết những nội dung khai trên đây là đúng sự thật và chịu trách nhiệm trước pháp luật.</p>
      </div>

      <div className="flex justify-between text-sm mt-6">
        <div className="text-center w-52">
          <p className="font-semibold">Xác nhận của cán bộ tư pháp</p>
          <p className="text-gray-500 text-xs mb-12">(Ký, ghi rõ họ tên)</p>
        </div>
        <div className="text-center w-52">
          <p>Long Trường, ngày <span className="underline-field w-8" /> tháng <span className="underline-field w-8" /> năm <span className="underline-field w-12" /></p>
          <p className="font-semibold mt-1">Người khai</p>
          <p className="text-gray-500 text-xs mb-12">(Ký, ghi rõ họ tên)</p>
        </div>
      </div>

      <div className="text-xs text-gray-500 border-t pt-2 mt-4">
        <p>– Nam từ đủ 20 tuổi, nữ từ đủ 18 tuổi mới được kết hôn (Điều 8 Luật HN&GĐ 2014).</p>
        <p>– Cả hai người phải có mặt trực tiếp khi đăng ký kết hôn.</p>
        <p>– Không ký trước vào tờ khai, chỉ ký trước mặt cán bộ tư pháp.</p>
      </div>
    </div>
  )
}
