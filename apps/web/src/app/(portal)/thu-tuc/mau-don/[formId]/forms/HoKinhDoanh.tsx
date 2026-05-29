// Mẫu Phụ lục III-1 NĐ 01/2021 — Giấy đề nghị đăng ký hộ kinh doanh

export default function FormHoKinhDoanh() {
  return (
    <div className="form-a4">
      <div className="flex justify-between items-start mb-3">
        <div className="text-center text-xs w-52">
          <p className="font-bold">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
          <p>Độc lập – Tự do – Hạnh phúc</p>
          <p>───────────────</p>
        </div>
        <div className="text-right text-xs">
          <p className="font-semibold">Phụ lục III-1</p>
          <p className="text-gray-500">Nghị định 01/2021/NĐ-CP</p>
        </div>
      </div>

      <div className="text-center mb-4">
        <h1 className="text-base font-bold uppercase">GIẤY ĐỀ NGHỊ</h1>
        <h2 className="text-sm font-bold uppercase">ĐĂNG KÝ HỘ KINH DOANH</h2>
      </div>

      <div className="mb-3 text-sm">
        <p>Kính gửi: <span className="underline-field w-64">UBND Phường Long Trường, TP.HCM</span></p>
      </div>

      <div className="section-box mb-3">
        <p className="font-bold text-sm mb-2">I. THÔNG TIN HỘ KINH DOANH</p>
        <div className="space-y-2 text-sm">
          <div className="flex gap-4">
            <span className="w-52 shrink-0">Tên hộ kinh doanh:</span>
            <span className="underline-field flex-1" />
          </div>
          <div className="flex gap-4">
            <span className="w-52 shrink-0">Ngành, nghề kinh doanh:</span>
            <span className="underline-field flex-1" />
          </div>
          <div className="flex gap-4">
            <span className="w-52 shrink-0">Mã ngành kinh tế (VSIC):</span>
            <span className="underline-field flex-1" />
          </div>
          <div className="flex gap-4">
            <span className="w-52 shrink-0">Địa điểm kinh doanh:</span>
            <span className="underline-field flex-1" />
          </div>
          <div className="flex gap-4">
            <span className="w-52 shrink-0">Điện thoại liên hệ:</span>
            <span className="underline-field flex-1" />
            <span className="w-20 shrink-0">Email:</span>
            <span className="underline-field flex-1" />
          </div>
          <div className="flex gap-4">
            <span className="w-52 shrink-0">Vốn kinh doanh (đồng):</span>
            <span className="underline-field flex-1" />
          </div>
          <div className="flex gap-4">
            <span className="w-52 shrink-0">Số lao động dự kiến:</span>
            <span className="underline-field w-20" />
            <span className="w-36 shrink-0">người (trong đó nữ:</span>
            <span className="underline-field w-16" />
            <span>người)</span>
          </div>
        </div>
      </div>

      <div className="section-box mb-3">
        <p className="font-bold text-sm mb-2">II. THÔNG TIN CHỦ HỘ KINH DOANH</p>
        <div className="space-y-2 text-sm">
          <div className="flex gap-4">
            <span className="w-52 shrink-0">Họ và tên:</span>
            <span className="underline-field flex-1" />
          </div>
          <div className="flex gap-4">
            <span className="w-52 shrink-0">Giới tính:</span>
            <span className="underline-field w-20" />
            <span className="w-36 shrink-0">Ngày, tháng, năm sinh:</span>
            <span className="underline-field flex-1" />
          </div>
          <div className="flex gap-4">
            <span className="w-52 shrink-0">Dân tộc:</span>
            <span className="underline-field w-24" />
            <span className="w-24 shrink-0">Quốc tịch:</span>
            <span className="underline-field flex-1" />
          </div>
          <div className="flex gap-4">
            <span className="w-52 shrink-0">CCCD số:</span>
            <span className="underline-field w-44" />
            <span className="w-20 shrink-0">Cấp ngày:</span>
            <span className="underline-field flex-1" />
          </div>
          <div className="flex gap-4">
            <span className="w-52 shrink-0">Nơi cấp:</span>
            <span className="underline-field flex-1" />
          </div>
          <div className="flex gap-4">
            <span className="w-52 shrink-0">Nơi đăng ký thường trú:</span>
            <span className="underline-field flex-1" />
          </div>
          <div className="flex gap-4">
            <span className="w-52 shrink-0">Nơi ở hiện tại:</span>
            <span className="underline-field flex-1" />
          </div>
        </div>
      </div>

      <div className="section-box mb-3">
        <p className="font-bold text-sm mb-2">III. CÁC THÀNH VIÊN GÓP VỐN (nếu có)</p>
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr>
              <th className="border border-gray-300 p-1 text-center w-6">STT</th>
              <th className="border border-gray-300 p-1">Họ và tên</th>
              <th className="border border-gray-300 p-1 w-24">Số CCCD</th>
              <th className="border border-gray-300 p-1 w-32">Địa chỉ thường trú</th>
              <th className="border border-gray-300 p-1 w-24">Giá trị góp vốn (đ)</th>
              <th className="border border-gray-300 p-1 w-20">Tỷ lệ (%)</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3].map(i => (
              <tr key={i}>
                <td className="border border-gray-300 p-1 text-center">{i}</td>
                <td className="border border-gray-300 p-1 h-6" />
                <td className="border border-gray-300 p-1" />
                <td className="border border-gray-300 p-1" />
                <td className="border border-gray-300 p-1" />
                <td className="border border-gray-300 p-1" />
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mb-3 text-sm">
        <p className="font-semibold mb-1">Hồ sơ kèm theo:</p>
        <div className="space-y-1 ml-3">
          {[
            'Bản sao CCCD/CMND của chủ hộ kinh doanh',
            'Bản sao CCCD của các thành viên góp vốn (nếu có)',
            'Giấy tờ chứng minh địa điểm kinh doanh (hợp đồng thuê / sổ đỏ)',
            'Giấy phép con theo ngành nghề kinh doanh có điều kiện (nếu có)',
          ].map((item, i) => (
            <label key={i} className="flex items-center gap-2">
              <input type="checkbox" />
              <span>{item}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="mb-4 text-sm">
        <p>
          Tôi cam kết thông tin kê khai là đúng sự thật, tuân thủ quy định pháp luật về đăng ký hộ kinh doanh và chịu
          trách nhiệm về tính trung thực của hồ sơ đề nghị.
        </p>
      </div>

      <div className="flex justify-between text-sm mt-6">
        <div className="text-center w-52">
          <p className="font-semibold">XÁC NHẬN CỦA UBND PHƯỜNG</p>
          <p className="text-gray-500 text-xs mb-14">(Ký, đóng dấu)</p>
        </div>
        <div className="text-center w-52">
          <p>Long Trường, ngày <span className="underline-field w-8" /> tháng <span className="underline-field w-8" /> năm <span className="underline-field w-12" /></p>
          <p className="font-semibold mt-1">Chủ hộ kinh doanh</p>
          <p className="text-gray-500 text-xs mb-14">(Ký, ghi rõ họ tên)</p>
        </div>
      </div>

      <div className="text-xs text-gray-500 border-t pt-2 mt-4">
        <p>– Hộ kinh doanh chỉ được đăng ký kinh doanh tại một địa điểm, sử dụng không quá 10 lao động.</p>
        <p>– Lệ phí đăng ký: 100.000đ (theo Thông tư 47/2019/TT-BTC).</p>
        <p>– Sau khi được cấp Giấy chứng nhận, phải treo biển tại địa điểm kinh doanh trong vòng 30 ngày.</p>
      </div>
    </div>
  )
}
