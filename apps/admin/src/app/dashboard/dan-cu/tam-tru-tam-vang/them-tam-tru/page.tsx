import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft, UserCheck, Save } from 'lucide-react'
import { taoMoiTamTru } from '../actions'
import { LY_DO_TAM_TRU_LABEL } from '../constants'

export const metadata: Metadata = { title: 'Đăng ký tạm trú — KP25' }

// ─── Server action wrapper ────────────────────────────────────
async function handleSubmit(formData: FormData) {
  'use server'
  const result = await taoMoiTamTru(formData)
  if (result.success) {
    redirect('/dashboard/dan-cu/tam-tru-tam-vang?tab=tam-tru&success=1')
  }
  // Nếu lỗi, redirect về với error param
  redirect(`/dashboard/dan-cu/tam-tru-tam-vang/them-tam-tru?error=${encodeURIComponent(result.error ?? 'Lỗi không xác định')}`)
}

interface Props {
  searchParams: Promise<{ error?: string }>
}

export default async function ThemTamTruPage({ searchParams }: Props) {
  const { error } = await searchParams
  const today = new Date().toISOString().split('T')[0]!

  return (
    <div className="max-w-3xl mx-auto space-y-5">

      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/dan-cu/tam-tru-tam-vang"
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <UserCheck size={20} className="text-blue-600" />
            <h1 className="text-xl font-bold text-slate-900">Đăng ký tạm trú mới</h1>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Theo Nghị định 31/2014/NĐ-CP · Điều 24 Luật Cư trú 2020
          </p>
        </div>
      </div>

      {/* Lỗi */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {decodeURIComponent(error)}
        </div>
      )}

      <form action={handleSubmit} className="space-y-5">

        {/* ── 1. Thông tin người tạm trú ─────────────────────── */}
        <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
          <h2 className="font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">1</span>
            Thông tin người đăng ký tạm trú
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Họ tên */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <input
                name="ho_ten"
                required
                placeholder="Nguyễn Văn A"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Ngày sinh */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Ngày sinh</label>
              <input
                name="ngay_sinh"
                type="date"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Giới tính */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Giới tính</label>
              <select
                name="gioi_tinh"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">— Chọn giới tính —</option>
                <option value="NAM">Nam</option>
                <option value="NU">Nữ</option>
                <option value="KHAC">Khác</option>
              </select>
            </div>

            {/* Số CCCD */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Số CCCD / CMND</label>
              <input
                name="so_cccd"
                placeholder="012345678901"
                maxLength={12}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Nơi sinh */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nơi sinh</label>
              <input
                name="noi_sinh"
                placeholder="TP. Hồ Chí Minh"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Quốc tịch */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Quốc tịch</label>
              <input
                name="quoc_tich"
                defaultValue="VN"
                placeholder="VN"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Dân tộc */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Dân tộc</label>
              <input
                name="dan_toc"
                defaultValue="Kinh"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </section>

        {/* ── 2. Địa chỉ ─────────────────────────────────────── */}
        <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
          <h2 className="font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">2</span>
            Địa chỉ thường trú và tạm trú
          </h2>

          {/* Địa chỉ thường trú */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Địa chỉ thường trú (nơi đăng ký hộ khẩu gốc) <span className="text-red-500">*</span>
            </label>
            <input
              name="dia_chi_thuong_tru"
              required
              placeholder="123 Đường ABC, Phường XYZ, Quận 1, TP.HCM"
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Tỉnh/thành gốc */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Tỉnh / Thành phố gốc</label>
            <input
              name="tinh_thanh_goc"
              placeholder="TP. Hồ Chí Minh, Bình Dương, Đồng Nai..."
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Địa chỉ tạm trú tại KP25 */}
          <div className="border-t border-slate-100 pt-4">
            <div className="bg-blue-50 rounded-xl px-3 py-2 mb-3 text-xs text-blue-700 font-medium">
              📍 Địa chỉ tạm trú tại Khu phố 25 — Long Trường
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Số nhà</label>
                <input
                  name="so_nha_tam_tru"
                  placeholder="1106/23"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Đường</label>
                <input
                  name="duong_tam_tru"
                  placeholder="Nguyễn Duy Trinh"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Địa chỉ tạm trú đầy đủ <span className="text-red-500">*</span>
                </label>
                <input
                  name="dia_chi_tam_tru"
                  required
                  placeholder="1106/23 Nguyễn Duy Trinh, KP25, Long Trường"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── 3. Chủ nhà ─────────────────────────────────────── */}
        <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
          <h2 className="font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">3</span>
            Thông tin chủ nhà / chủ cơ sở lưu trú
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Họ tên chủ nhà</label>
              <input
                name="chu_nha_ho_ten"
                placeholder="Nguyễn Thị B"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Số điện thoại chủ nhà</label>
              <input
                name="chu_nha_sdt"
                type="tel"
                placeholder="0909123456"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">CCCD chủ nhà</label>
              <input
                name="chu_nha_cccd"
                placeholder="012345678901"
                maxLength={12}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </section>

        {/* ── 4. Lý do & thời hạn ────────────────────────────── */}
        <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
          <h2 className="font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">4</span>
            Lý do và thời hạn tạm trú
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Lý do */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Lý do tạm trú <span className="text-red-500">*</span>
              </label>
              <select
                name="ly_do_tam_tru"
                required
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {Object.entries(LY_DO_TAM_TRU_LABEL).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>

            {/* Ngày bắt đầu */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Ngày bắt đầu <span className="text-red-500">*</span>
              </label>
              <input
                name="ngay_bat_dau"
                type="date"
                required
                defaultValue={today}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Ngày kết thúc */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Ngày kết thúc dự kiến
              </label>
              <input
                name="ngay_ket_thuc"
                type="date"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-[10px] text-slate-400 mt-1">Tối đa 12 tháng · Có thể gia hạn</p>
            </div>

            {/* Số tờ khai */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Số tờ khai / Số hồ sơ</label>
              <input
                name="so_to_khai"
                placeholder="TT2026/001"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </section>

        {/* ── 5. Thông tin hành chính ─────────────────────────── */}
        <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
          <h2 className="font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">5</span>
            Thông tin tiếp nhận & ghi chú
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Cán bộ tiếp nhận</label>
              <input
                name="can_bo_tiep_nhan"
                placeholder="Họ tên cán bộ"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Ghi chú thêm</label>
              <textarea
                name="ghi_chu"
                rows={3}
                placeholder="Thông tin bổ sung nếu cần..."
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>
        </section>

        {/* Nút submit */}
        <div className="flex items-center gap-3 justify-end">
          <Link
            href="/dashboard/dan-cu/tam-tru-tam-vang"
            className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            Huỷ
          </Link>
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            <Save size={15} />
            Lưu hồ sơ tạm trú
          </button>
        </div>
      </form>
    </div>
  )
}
