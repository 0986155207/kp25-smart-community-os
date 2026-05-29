// Mẫu số 01 NĐ 15/2021 — Đơn đề nghị cấp giấy phép xây dựng

export default function FormXayDung() {
  return (
    <div className="form-a4">
      <div className="flex justify-between items-start mb-3">
        <div className="text-center text-xs w-52">
          <p className="font-bold">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
          <p>Độc lập – Tự do – Hạnh phúc</p>
          <p>───────────────</p>
        </div>
        <div className="text-right text-xs">
          <p className="font-semibold">Mẫu số 01 (Phụ lục II)</p>
          <p className="text-gray-500">Nghị định 15/2021/NĐ-CP</p>
        </div>
      </div>

      <div className="text-center mb-4">
        <h1 className="text-base font-bold uppercase">ĐƠN ĐỀ NGHỊ</h1>
        <h2 className="text-sm font-bold uppercase">CẤP GIẤY PHÉP XÂY DỰNG</h2>
        <p className="text-xs text-gray-500 mt-1">Nhà ở riêng lẻ từ 1–3 tầng tại đô thị</p>
      </div>

      <div className="mb-3 text-sm">
        <p>Kính gửi: <span className="underline-field">UBND Phường Long Trường, TP.HCM</span></p>
      </div>

      <div className="section-box mb-3">
        <p className="font-bold text-sm mb-2">I. THÔNG TIN CHỦ ĐẦU TƯ</p>
        <div className="space-y-2 text-sm">
          <div className="flex gap-4">
            <span className="w-48 shrink-0">Tên chủ đầu tư:</span>
            <span className="underline-field flex-1" />
          </div>
          <div className="flex gap-4">
            <span className="w-48 shrink-0">CCCD/CMND số:</span>
            <span className="underline-field flex-1" />
            <span className="w-24 shrink-0">Ngày cấp:</span>
            <span className="underline-field flex-1" />
          </div>
          <div className="flex gap-4">
            <span className="w-48 shrink-0">Địa chỉ liên hệ:</span>
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
        <p className="font-bold text-sm mb-2">II. THÔNG TIN CÔNG TRÌNH XIN PHÉP</p>
        <div className="space-y-2 text-sm">
          <div className="flex gap-4">
            <span className="w-48 shrink-0">Tên công trình:</span>
            <span className="underline-field flex-1" />
          </div>
          <div className="flex gap-4">
            <span className="w-48 shrink-0">Loại công trình:</span>
            <div className="flex gap-4">
              {['Nhà ở mới', 'Sửa chữa', 'Cải tạo', 'Xây thêm'].map(l => (
                <label key={l} className="flex items-center gap-1">
                  <input type="checkbox" /> <span>{l}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-4">
            <span className="w-48 shrink-0">Địa điểm xây dựng:</span>
            <span className="underline-field flex-1" />
          </div>
          <div className="flex gap-4">
            <span className="w-48 shrink-0">Thửa đất số:</span>
            <span className="underline-field w-24" />
            <span className="w-20 shrink-0">Tờ bản đồ số:</span>
            <span className="underline-field flex-1" />
          </div>
          <div className="flex gap-4">
            <span className="w-48 shrink-0">Số Giấy CN quyền SDĐ:</span>
            <span className="underline-field flex-1" />
          </div>
        </div>
      </div>

      <div className="section-box mb-3">
        <p className="font-bold text-sm mb-2">III. QUY MÔ CÔNG TRÌNH</p>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
          {[
            { label: 'Diện tích khuôn viên đất (m²):', field: true },
            { label: 'Diện tích xây dựng tầng 1 (m²):', field: true },
            { label: 'Số tầng:', field: true },
            { label: 'Chiều cao công trình (m):', field: true },
            { label: 'Tổng diện tích sàn (m²):', field: true },
            { label: 'Chiều sâu tầng hầm (nếu có):', field: true },
          ].map(item => (
            <div key={item.label} className="flex gap-2">
              <span className="shrink-0">{item.label}</span>
              {item.field && <span className="underline-field flex-1" />}
            </div>
          ))}
        </div>
      </div>

      <div className="section-box mb-3">
        <p className="font-bold text-sm mb-2">IV. HỒ SƠ KÈM THEO</p>
        <div className="space-y-1 text-sm">
          {[
            'Bản sao Giấy chứng nhận quyền sử dụng đất',
            'Bản vẽ mặt bằng công trình (tỷ lệ 1:100 hoặc 1:200)',
            'Bản vẽ mặt đứng công trình (ít nhất 2 phía)',
            'Bản vẽ mặt cắt công trình (ít nhất 2 phía)',
            'Bản vẽ thể hiện vị trí, kích thước, ranh giới đất',
            'Bản sao CCCD/CMND của chủ đầu tư',
          ].map((item, i) => (
            <label key={i} className="flex items-center gap-2">
              <input type="checkbox" />
              <span>{item}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="mb-4 text-sm">
        <p>Tôi cam kết xây dựng theo đúng nội dung được cấp phép và chịu trách nhiệm trước pháp luật.</p>
      </div>

      <div className="flex justify-between text-sm mt-6">
        <div className="text-center w-52">
          <p className="font-semibold">XÁC NHẬN CỦA UBND PHƯỜNG</p>
          <p className="text-gray-500 text-xs mb-14">(Ký, đóng dấu)</p>
        </div>
        <div className="text-center w-52">
          <p>Long Trường, ngày <span className="underline-field w-8" /> tháng <span className="underline-field w-8" /> năm <span className="underline-field w-12" /></p>
          <p className="font-semibold mt-1">Chủ đầu tư</p>
          <p className="text-gray-500 text-xs mb-14">(Ký, ghi rõ họ tên)</p>
        </div>
      </div>

      <div className="text-xs text-gray-500 border-t pt-2 mt-4">
        <p>– Công trình nhà ở riêng lẻ ≤ 3 tầng, diện tích sàn ≤ 500m², xây dựng tại đô thị.</p>
        <p>– Lệ phí cấp phép: 75.000đ – 150.000đ (tùy diện tích xây dựng).</p>
        <p>– Xây dựng không phép hoặc sai phép sẽ bị xử phạt và buộc tháo dỡ.</p>
      </div>
    </div>
  )
}
