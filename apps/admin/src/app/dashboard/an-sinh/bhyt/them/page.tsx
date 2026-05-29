'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ShieldCheck, Save, Users } from 'lucide-react'
import { themBHYT } from '../actions'
import { DOI_TUONG_LABEL } from '../constants'
import HoDanCombobox from '@/components/shared/HoDanCombobox'

const DOI_TUONG_OPTIONS = Object.entries(DOI_TUONG_LABEL)

export default function ThemBHYTPage() {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await themBHYT(formData)
      if (result.success) {
        router.push('/dashboard/an-sinh/bhyt')
      } else {
        setError(result.error ?? 'Có lỗi xảy ra')
      }
    })
  }

  return (
    <div className="max-w-2xl space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/an-sinh/bhyt" className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex items-center gap-2">
          <ShieldCheck size={20} className="text-emerald-600" />
          <h1 className="text-xl font-bold text-slate-900">Thêm thẻ BHYT</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>
        )}

        {/* ── Chọn hộ dân ───────────────────────────────────── */}
        <div>
          <h2 className="font-bold text-slate-700 mb-3 text-sm uppercase tracking-wider flex items-center gap-2">
            <Users size={14} />
            Thuộc hộ dân
          </h2>
          <HoDanCombobox
            name="ho_dan_id"
            accentColor="focus:ring-emerald-500"
          />
          <p className="mt-1.5 text-xs text-slate-400">
            Không bắt buộc — tìm và chọn hộ dân để liên kết thẻ BHYT với hồ sơ hộ dân
          </p>
        </div>

        <hr className="border-slate-100" />

        {/* ── Thông tin người tham gia ───────────────────────── */}
        <div>
          <h2 className="font-bold text-slate-700 mb-3 text-sm uppercase tracking-wider">Thông tin người tham gia BHYT</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <input
                name="ho_ten"
                required
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Nguyễn Văn A"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Ngày sinh</label>
              <input
                name="ngay_sinh"
                type="date"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Giới tính</label>
              <select
                name="gioi_tinh"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">— Chọn —</option>
                <option value="NAM">Nam</option>
                <option value="NU">Nữ</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Số CCCD / CMND</label>
              <input
                name="so_cccd"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="012345678901"
              />
            </div>
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* ── Thông tin thẻ BHYT ─────────────────────────────── */}
        <div>
          <h2 className="font-bold text-slate-700 mb-3 text-sm uppercase tracking-wider">Thông tin thẻ BHYT</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Mã thẻ BHYT</label>
              <input
                name="ma_the_bhyt"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="HS4012345678"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Đối tượng <span className="text-red-500">*</span>
              </label>
              <select
                name="doi_tuong"
                required
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">— Chọn đối tượng —</option>
                {DOI_TUONG_OPTIONS.map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Nơi đăng ký KCB ban đầu</label>
              <input
                name="noi_dang_ky_kcb"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Trạm Y tế Phường Long Trường"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Hạn thẻ từ</label>
              <input
                name="han_the_tu"
                type="date"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Hạn thẻ đến</label>
              <input
                name="han_the_den"
                type="date"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">% chi trả BHYT</label>
              <select
                name="phan_tram_huong"
                defaultValue="80"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="100">100% — Nhà nước đóng toàn bộ</option>
                <option value="95">95% — CBCC, người về hưu</option>
                <option value="80">80% — Hộ gia đình, tự nguyện</option>
                <option value="70">70% — Cận nghèo</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Trạng thái</label>
              <select
                name="trang_thai"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="CON_HAN">Còn hiệu lực</option>
                <option value="SAP_HET_HAN">Sắp hết hạn</option>
                <option value="HET_HAN">Hết hạn</option>
                <option value="CHUA_CO">Chưa có thẻ</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Cơ quan / đơn vị đóng BHYT</label>
              <input
                name="co_quan_dong"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Công ty TNHH ABC / BHXH TP.HCM"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Ghi chú</label>
              <textarea
                name="ghi_chu"
                rows={3}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                placeholder="Ghi chú thêm..."
              />
            </div>
          </div>
        </div>

        {/* ── Actions ─────────────────────────────────────────── */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={pending}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            <Save size={15} />
            {pending ? 'Đang lưu...' : 'Lưu thẻ BHYT'}
          </button>
          <Link href="/dashboard/an-sinh/bhyt" className="px-4 py-2.5 text-sm text-slate-500 hover:text-slate-700 transition-colors">
            Hủy
          </Link>
        </div>
      </form>
    </div>
  )
}
