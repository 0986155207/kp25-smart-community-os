// Mẫu TP/HT-2015-KT.1 — Tờ khai đăng ký khai tử

export default function FormKhaiTu() {
  return (
    <div className="form-a4">
      <div className="text-center mb-2">
        <p className="font-bold text-sm">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
        <p className="text-sm">Độc lập – Tự do – Hạnh phúc</p>
        <p className="text-sm">───────────────</p>
      </div>
      <div className="text-center mb-4">
        <p className="text-[10px] text-gray-500">Mẫu TP/HT-2015-KT.1 (Ban hành kèm theo Thông tư số 04/2020/TT-BTP)</p>
        <h1 className="text-base font-bold uppercase mt-1">TỜ KHAI ĐĂNG KÝ KHAI TỬ</h1>
      </div>

      <div className="mb-3 text-sm">
        <p>Kính gửi: <span className="underline-field w-64">UBND Phường Long Trường</span></p>
      </div>

      <div className="section-box mb-3">
        <p className="font-bold text-sm mb-2">I. THÔNG TIN NGƯỜI ĐI KHAI</p>
        <div className="space-y-2 text-sm">
          <div className="flex gap-4">
            <span className="w-40 shrink-0">Họ và tên:</span>
            <span className="underline-field flex-1" />
          </div>
          <div className="flex gap-4">
            <span className="w-40 shrink-0">Quan hệ với người mất:</span>
            <span className="underline-field flex-1" />
          </div>
          <div className="flex gap-4">
            <span className="w-40 shrink-0">CCCD số:</span>
            <span className="underline-field w-44" />
            <span className="w-24 shrink-0">Điện thoại:</span>
            <span className="underline-field flex-1" />
          </div>
          <div className="flex gap-4">
            <span className="w-40 shrink-0">Nơi cư trú:</span>
            <span className="underline-field flex-1" />
          </div>
        </div>
      </div>

      <div className="section-box mb-3">
        <p className="font-bold text-sm mb-2">II. THÔNG TIN CỦA NGƯỜI ĐÃ MẤT</p>
        <div className="space-y-2 text-sm">
          <div className="flex gap-4">
            <span className="w-40 shrink-0">Họ và tên:</span>
            <span className="underline-field flex-1" />
          </div>
          <div className="flex gap-4">
            <span className="w-40 shrink-0">Giới tính:</span>
            <span className="underline-field w-28" />
            <span className="w-28 shrink-0">Ngày, tháng, năm sinh:</span>
            <span className="underline-field flex-1" />
          </div>
          <div className="flex gap-4">
            <span className="w-40 shrink-0">Dân tộc:</span>
            <span className="underline-field w-28" />
            <span className="w-24 shrink-0">Quốc tịch:</span>
            <span className="underline-field flex-1" />
          </div>
          <div className="flex gap-4">
            <span className="w-40 shrink-0">CCCD/CMND số:</span>
            <span className="underline-field flex-1" />
          </div>
          <div className="flex gap-4">
            <span className="w-40 shrink-0">Nơi thường trú (hoặc tạm trú):</span>
            <span className="underline-field flex-1" />
          </div>
          <div className="flex gap-4">
            <span className="w-40 shrink-0">Đã chết vào lúc:</span>
            <span className="underline-field w-16" />
            <span className="shrink-0">giờ,</span>
            <span className="shrink-0">ngày</span>
            <span className="underline-field w-10" />
            <span className="shrink-0">tháng</span>
            <span className="underline-field w-10" />
            <span className="shrink-0">năm</span>
            <span className="underline-field w-14" />
          </div>
          <div className="flex gap-4">
            <span className="w-40 shrink-0">Nơi chết:</span>
            <span className="underline-field flex-1" />
          </div>
          <div className="flex gap-4">
            <span className="w-40 shrink-0">Nguyên nhân chết:</span>
            <span className="underline-field flex-1" />
          </div>
        </div>
      </div>

      <div className="mb-4 text-sm">
        <p className="font-semibold mb-1">Giấy tờ kèm theo:</p>
        <div className="space-y-1 ml-3">
          <label className="flex items-center gap-2">
            <input type="checkbox" />
            <span>Giấy báo tử của bệnh viện / cơ quan có thẩm quyền</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" />
            <span>CCCD/CMND của người đi khai</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" />
            <span>CCCD/CMND của người đã mất (nếu có)</span>
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
        <p>– Phải khai tử trong vòng <strong>15 ngày</strong> kể từ ngày người đó chết.</p>
        <p>– Không được tẩy xóa, sửa chữa nội dung tờ khai.</p>
      </div>
    </div>
  )
}
