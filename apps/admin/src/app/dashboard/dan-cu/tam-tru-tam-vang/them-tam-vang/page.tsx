import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft, UserMinus, Save } from 'lucide-react'
import { taoMoiTamVang } from '../actions'
import { LY_DO_TAM_VANG_LABEL } from '../constants'

export const metadata: Metadata = { title: 'Khai báo tạm vắng — KP25' }

// ─── Server action wrapper ────────────────────────────────────
async function handleSubmit(formData: FormData) {
  'use server'
  const result = await taoMoiTamVang(formData)
  if (result.success) {
    redirect('/dashboard/dan-cu/tam-tru-tam-vang?tab=tam-vang&success=1')
  }
  redirect(`/dashboard/dan-cu/tam-tru-tam-vang/them-tam-vang?error=${encodeURIComponent(result.error ?? 'Lỗi không xác định')}`)
}

interface Props {
  searchParams: Promise<{ error?: string }>
}

export default async function ThemTamVangPage({ searchParams }: Props) {
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
            <UserMinus size={20} className="text-orange-600" />
            <h1 className="text-xl font-bold text-slate-900">Khai báo tạm vắng</h1>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Điều 31 Luật Cư trú 2020 · Thông báo trước khi rời khỏi địa bàn
          </p>
        </div>
      </div>

      {/* Lỗi */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {decodeURIComponent(error)}
        </div>
      )}

      {/* Hướng dẫn */}
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-sm text-orange-800">
        <p className="font-semibold mb-1">Quy định khai báo tạm vắng</p>
        <ul className="space-y-1 text-xs text-orange-700 list-disc list-inside">
          <li>Người cư trú vắng mặt tại nơi thường trú từ 30 ngày trở lên phải khai báo</li>
          <li>Khai báo trong vòng 12 giờ kể từ khi rời địa bàn (trường hợp khẩn cấp)</li>
          <li>Cán bộ khu phố có trách nhiệm tiếp nhận và lưu trữ thông tin</li>
        </ul>
      </div>

      <form action={handleSubmit} className="space-y-5">

        {/* ── 1. Thông tin người khai báo ────────────────────── */}
        <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
          <h2 className="font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
            <span className="w-6 h-6 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center font-bold">1</span>
            Thông tin người tạm vắng
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
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Ngày sinh */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Ngày sinh</label>
              <input
                name="ngay_sinh"
                type="date"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Giới tính */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Giới tính</label>
              <select
                name="gioi_tinh"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
              >
                <option value="">— Chọn —</option>
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
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* SĐT liên lạc */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Số điện thoại liên lạc</label>
              <input
                name="sdt_lien_lac"
                type="tel"
                placeholder="0909123456"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        </section>

        {/* ── 2. Địa chỉ ─────────────────────────────────────── */}
        <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
          <h2 className="font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
            <span className="w-6 h-6 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center font-bold">2</span>
            Địa chỉ
          </h2>

          {/* Địa chỉ tại KP25 */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Địa chỉ hiện tại tại KP25 <span className="text-red-500">*</span>
            </label>
            <input
              name="dia_chi_hien_tai"
              required
              placeholder="123/45 Nguyễn Duy Trinh, KP25, Long Trường"
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Nơi đến */}
          <div className="border-t border-slate-100 pt-4">
            <div className="bg-orange-50 rounded-xl px-3 py-2 mb-3 text-xs text-orange-700 font-medium">
              🚗 Nơi đến tạm vắng
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Địa chỉ nơi đến <span className="text-red-500">*</span>
                </label>
                <input
                  name="dia_chi_tam_vang"
                  required
                  placeholder="123 Đường ABC, Phường XYZ, Quận 1"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Tỉnh / Thành phố đến</label>
                <input
                  name="tinh_thanh_den"
                  placeholder="TP. Hồ Chí Minh, Bình Dương..."
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── 3. Lý do & thời gian ────────────────────────────── */}
        <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
          <h2 className="font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
            <span className="w-6 h-6 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center font-bold">3</span>
            Lý do và thời gian vắng mặt
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Lý do */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Lý do tạm vắng <span className="text-red-500">*</span>
              </label>
              <select
                name="ly_do_tam_vang"
                required
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
              >
                {Object.entries(LY_DO_TAM_VANG_LABEL).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>

            {/* Ngày đi */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Ngày rời đi <span className="text-red-500">*</span>
              </label>
              <input
                name="ngay_di"
                type="date"
                required
                defaultValue={today}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Ngày dự kiến về */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Ngày dự kiến trở về</label>
              <input
                name="ngay_du_kien_ve"
                type="date"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        </section>

        {/* ── 4. Người thân liên hệ ───────────────────────────── */}
        <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
          <h2 className="font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
            <span className="w-6 h-6 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center font-bold">4</span>
            Người thân liên hệ (trong trường hợp khẩn cấp)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Họ tên người thân</label>
              <input
                name="ho_ten_nguoi_than"
                placeholder="Nguyễn Thị B"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">SĐT người thân</label>
              <input
                name="sdt_nguoi_than"
                type="tel"
                placeholder="0909123456"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        </section>

        {/* ── 5. Hành chính ───────────────────────────────────── */}
        <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
          <h2 className="font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
            <span className="w-6 h-6 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center font-bold">5</span>
            Thông tin tiếp nhận & ghi chú
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Cán bộ tiếp nhận</label>
              <input
                name="can_bo_tiep_nhan"
                placeholder="Họ tên cán bộ"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Ghi chú thêm</label>
              <textarea
                name="ghi_chu"
                rows={3}
                placeholder="Thông tin bổ sung nếu cần..."
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
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
            className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            <Save size={15} />
            Lưu khai báo tạm vắng
          </button>
        </div>
      </form>
    </div>
  )
}
