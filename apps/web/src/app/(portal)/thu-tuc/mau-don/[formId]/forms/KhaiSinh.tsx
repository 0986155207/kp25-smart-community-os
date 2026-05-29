// Mẫu TP/HT-2015-KS.1 — Tờ khai đăng ký khai sinh

export default function FormKhaiSinh() {
  return (
    <div className="form-a4">
      {/* ── Header quốc gia ─────────────────────────────── */}
      <div className="text-center mb-2">
        <p className="font-bold text-sm">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
        <p className="text-sm">Độc lập – Tự do – Hạnh phúc</p>
        <p className="text-sm">───────────────</p>
      </div>

      {/* ── Tiêu đề ─────────────────────────────────────── */}
      <div className="text-center mb-4">
        <p className="text-[10px] text-gray-500">Mẫu TP/HT-2015-KS.1 (Ban hành kèm theo Thông tư số 04/2020/TT-BTP)</p>
        <h1 className="text-base font-bold uppercase mt-1">TỜ KHAI ĐĂNG KÝ KHAI SINH</h1>
      </div>

      {/* ── Kính gửi ──────────────────────────────────── */}
      <div className="mb-3 text-sm">
        <p>Kính gửi: <span className="underline-field w-64">UBND Phường Long Trường</span></p>
      </div>

      {/* ── Thông tin người khai ──────────────────────── */}
      <div className="section-box mb-3">
        <p className="font-bold text-sm mb-2">I. THÔNG TIN NGƯỜI ĐI KHAI</p>
        <div className="space-y-2 text-sm">
          <div className="flex gap-4">
            <span className="w-40 shrink-0">Họ và tên:</span>
            <span className="underline-field flex-1" />
          </div>
          <div className="flex gap-4">
            <span className="w-40 shrink-0">Quan hệ với trẻ:</span>
            <span className="underline-field flex-1" />
            <span className="w-20 shrink-0">CCCD số:</span>
            <span className="underline-field flex-1" />
          </div>
          <div className="flex gap-4">
            <span className="w-40 shrink-0">Nơi cư trú:</span>
            <span className="underline-field flex-1" />
          </div>
          <div className="flex gap-4">
            <span className="w-40 shrink-0">Điện thoại:</span>
            <span className="underline-field w-40" />
          </div>
        </div>
      </div>

      {/* ── Thông tin trẻ ─────────────────────────────── */}
      <div className="section-box mb-3">
        <p className="font-bold text-sm mb-2">II. THÔNG TIN CỦA NGƯỜI ĐƯỢC ĐĂNG KÝ KHAI SINH</p>
        <div className="space-y-2 text-sm">
          <div className="flex gap-4">
            <span className="w-40 shrink-0">Họ và tên:</span>
            <span className="underline-field flex-1" />
          </div>
          <div className="flex gap-4">
            <span className="w-40 shrink-0">Giới tính:</span>
            <span className="underline-field w-28" />
            <span className="w-24 shrink-0">Ngày sinh:</span>
            <span className="underline-field flex-1" />
          </div>
          <div className="flex gap-4">
            <span className="w-40 shrink-0">Nơi sinh:</span>
            <span className="underline-field flex-1" />
          </div>
          <div className="flex gap-4">
            <span className="w-40 shrink-0">Quê quán:</span>
            <span className="underline-field flex-1" />
          </div>
          <div className="flex gap-4">
            <span className="w-40 shrink-0">Dân tộc:</span>
            <span className="underline-field w-28" />
            <span className="w-24 shrink-0">Quốc tịch:</span>
            <span className="underline-field flex-1" />
          </div>
          <div className="flex gap-4">
            <span className="w-40 shrink-0">Nơi đăng ký thường trú:</span>
            <span className="underline-field flex-1" />
          </div>
        </div>
      </div>

      {/* ── Thông tin cha ─────────────────────────────── */}
      <div className="section-box mb-3">
        <p className="font-bold text-sm mb-2">III. THÔNG TIN CỦA NGƯỜI CHA</p>
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
            <span className="w-40 shrink-0">Dân tộc:</span>
            <span className="underline-field w-28" />
            <span className="w-24 shrink-0">Quốc tịch:</span>
            <span className="underline-field flex-1" />
          </div>
          <div className="flex gap-4">
            <span className="w-40 shrink-0">Nơi đăng ký thường trú:</span>
            <span className="underline-field flex-1" />
          </div>
          <div className="flex gap-4">
            <span className="w-40 shrink-0">CCCD/CMND số:</span>
            <span className="underline-field flex-1" />
          </div>
        </div>
      </div>

      {/* ── Thông tin mẹ ──────────────────────────────── */}
      <div className="section-box mb-3">
        <p className="font-bold text-sm mb-2">IV. THÔNG TIN CỦA NGƯỜI MẸ</p>
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
            <span className="w-40 shrink-0">Dân tộc:</span>
            <span className="underline-field w-28" />
            <span className="w-24 shrink-0">Quốc tịch:</span>
            <span className="underline-field flex-1" />
          </div>
          <div className="flex gap-4">
            <span className="w-40 shrink-0">Nơi đăng ký thường trú:</span>
            <span className="underline-field flex-1" />
          </div>
          <div className="flex gap-4">
            <span className="w-40 shrink-0">CCCD/CMND số:</span>
            <span className="underline-field flex-1" />
          </div>
        </div>
      </div>

      {/* ── Giấy tờ kèm theo ──────────────────────────── */}
      <div className="mb-4 text-sm">
        <p className="font-semibold mb-1">Giấy tờ kèm theo:</p>
        <div className="space-y-1 ml-3">
          <label className="flex items-center gap-2">
            <input type="checkbox" className="print:border print:border-gray-400" />
            <span>Giấy chứng sinh / Văn bản xác nhận của người làm chứng</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="print:border print:border-gray-400" />
            <span>CCCD/CMND của cha và mẹ</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="print:border print:border-gray-400" />
            <span>Giấy đăng ký kết hôn của cha mẹ (nếu có)</span>
          </label>
        </div>
      </div>

      {/* ── Cam kết ────────────────────────────────────── */}
      <div className="mb-4 text-sm">
        <p>Tôi cam kết những nội dung khai trên đây là đúng sự thật và chịu trách nhiệm trước pháp luật về những nội dung đã khai.</p>
      </div>

      {/* ── Ký tên ─────────────────────────────────────── */}
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

      {/* ── Ghi chú ────────────────────────────────────── */}
      <div className="text-xs text-gray-500 border-t pt-2 mt-4">
        <p className="font-semibold mb-1">Ghi chú:</p>
        <p>– Trẻ em sinh tại Việt Nam phải được đăng ký khai sinh trong vòng <strong>60 ngày</strong> kể từ ngày sinh.</p>
        <p>– Ô trống dành cho cán bộ tư pháp ghi số, quyển số và ngày đăng ký.</p>
        <p>– Không được tẩy xóa, sửa chữa nội dung tờ khai.</p>
      </div>
    </div>
  )
}
