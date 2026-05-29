// Mẫu TP/HT-2015-NCMC.1 — Tờ khai đăng ký nhận cha, mẹ, con

export default function FormNhanChaMe() {
  return (
    <div className="form-a4">
      <div className="text-center mb-2">
        <p className="font-bold text-sm">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
        <p className="text-sm">Độc lập – Tự do – Hạnh phúc</p>
        <p className="text-sm">───────────────</p>
      </div>
      <div className="text-center mb-4">
        <p className="text-[10px] text-gray-500">Mẫu TP/HT-2015-NCMC.1 (Ban hành kèm Thông tư số 04/2020/TT-BTP)</p>
        <h1 className="text-base font-bold uppercase mt-1">TỜ KHAI ĐĂNG KÝ NHẬN CHA, MẸ, CON</h1>
        <p className="text-xs text-gray-500 mt-1">(Mỗi bên phải tự điền một tờ khai riêng)</p>
      </div>

      <div className="mb-3 text-sm">
        <p>Kính gửi: <span className="underline-field w-64">UBND Phường Long Trường</span></p>
      </div>

      <div className="section-box mb-3">
        <p className="font-bold text-sm mb-2">I. THÔNG TIN CỦA BẢN THÂN (Người nhận / Người được nhận)</p>
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
            <span className="w-48 shrink-0">Nơi đăng ký thường trú:</span>
            <span className="underline-field flex-1" />
          </div>
          <div className="flex gap-4">
            <span className="w-48 shrink-0">Số điện thoại:</span>
            <span className="underline-field flex-1" />
          </div>
        </div>
      </div>

      <div className="section-box mb-3">
        <p className="font-bold text-sm mb-2">II. QUAN HỆ ĐỀ NGHỊ CÔNG NHẬN</p>
        <div className="grid grid-cols-2 gap-3 text-sm mb-3">
          {[
            'Nhận con ngoài giá thú',
            'Nhận cha cho con',
            'Nhận mẹ cho con',
            'Xác nhận quan hệ cha – con',
          ].map(item => (
            <label key={item} className="flex items-center gap-2">
              <input type="checkbox" />
              <span>{item}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="section-box mb-3">
        <p className="font-bold text-sm mb-2">III. THÔNG TIN NGƯỜI KIA (Người nhận / Người được nhận còn lại)</p>
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
            <span className="underline-field flex-1" />
          </div>
          <div className="flex gap-4">
            <span className="w-48 shrink-0">Nơi đăng ký thường trú:</span>
            <span className="underline-field flex-1" />
          </div>
        </div>
      </div>

      <div className="section-box mb-3">
        <p className="font-bold text-sm mb-2">IV. CĂN CỨ XÁC NHẬN QUAN HỆ</p>
        <div className="space-y-1 text-sm">
          {[
            'Giấy tờ y tế (xét nghiệm ADN, giấy xuất viện…)',
            'Giấy tờ khai sinh trước đây có ghi nhận quan hệ',
            'Văn bản thừa nhận tự nguyện của các bên',
            'Văn bản khác (ghi rõ):',
          ].map((item, i) => (
            <label key={i} className="flex items-start gap-2">
              <input type="checkbox" className="mt-0.5 shrink-0" />
              <span>{item}</span>
            </label>
          ))}
          <div className="flex gap-4 mt-2">
            <span className="w-48 shrink-0">Chi tiết văn bản khác:</span>
            <span className="underline-field flex-1" />
          </div>
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
        <p>– Cả hai bên (người nhận và người được nhận) phải có mặt trực tiếp khi đăng ký.</p>
        <p>– Nếu một bên đã mất, cần có giấy tờ chứng minh và di chúc/xác nhận của người có thẩm quyền.</p>
        <p>– Trẻ chưa đủ 14 tuổi do cha/mẹ đại diện ký thay.</p>
      </div>
    </div>
  )
}
