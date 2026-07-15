'use client'

import { KHU_PHO } from '@/lib/khu-pho'
import { useState } from 'react'
import { Save, Star, Loader2 } from 'lucide-react'
import { LOAI_SK_CFG, TRANG_THAI_SK_CFG, type SuKien } from './constants'

interface Props {
  defaultValues?: Partial<SuKien>
  submitLabel?: string
  onSubmit: (formData: FormData) => Promise<void>
}

export default function SuKienForm({ defaultValues: dv, submitLabel = 'Lưu sự kiện', onSubmit }: Props) {
  const [loading, setLoading] = useState(false)
  const [noiBat, setNoiBat] = useState(dv?.noi_bat ?? false)
  const [canDangKy, setCanDangKy] = useState(dv?.can_dang_ky ?? false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    try {
      const fd = new FormData(e.currentTarget)
      fd.set('noi_bat', noiBat ? 'true' : 'false')
      fd.set('can_dang_ky', canDangKy ? 'true' : 'false')
      await onSubmit(fd)
    } finally {
      setLoading(false)
    }
  }

  const toDatetimeLocal = (iso?: string | null) => {
    if (!iso) return ''
    return iso.replace('Z', '').slice(0, 16)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* ── 1. Thông tin chính ─────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
        <h2 className="font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
          <span className="w-6 h-6 rounded-full bg-[#8B1A1A] text-white text-xs flex items-center justify-center font-bold">1</span>
          Thông tin sự kiện
        </h2>

        {/* Tiêu đề */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">
            Tên sự kiện <span className="text-red-500">*</span>
          </label>
          <input
            name="tieu_de"
            required
            defaultValue={dv?.tieu_de}
            placeholder={`Ví dụ: Hội thi thể thao ${KHU_PHO.ten} mừng Tết Nguyên Đán 2026`}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]"
          />
        </div>

        {/* Mô tả ngắn */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Mô tả ngắn</label>
          <textarea
            name="mo_ta"
            rows={2}
            defaultValue={dv?.mo_ta ?? ''}
            placeholder="Tóm tắt nội dung sự kiện (hiển thị trong danh sách)"
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1A1A] resize-none"
          />
        </div>

        {/* Loại + trạng thái */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Loại sự kiện <span className="text-red-500">*</span>
            </label>
            <select
              name="loai"
              required
              defaultValue={dv?.loai ?? 'KHAC'}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1A1A] bg-white"
            >
              {(Object.entries(LOAI_SK_CFG) as [string, { label: string }][]).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Trạng thái</label>
            <select
              name="trang_thai"
              defaultValue={dv?.trang_thai ?? 'SAP_DIEN_RA'}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1A1A] bg-white"
            >
              {(Object.entries(TRANG_THAI_SK_CFG) as [string, { label: string }][]).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Nổi bật */}
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <div
            onClick={() => setNoiBat(v => !v)}
            className={`w-10 h-5.5 rounded-full relative transition-colors cursor-pointer ${noiBat ? 'bg-amber-500' : 'bg-slate-200'}`}
            style={{ height: '22px', width: '40px' }}
          >
            <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${noiBat ? 'left-5' : 'left-0.5'}`} />
          </div>
          <div>
            <span className="text-sm font-medium text-slate-700 flex items-center gap-1">
              <Star size={13} className={noiBat ? 'text-amber-500' : 'text-slate-400'} fill={noiBat ? 'currentColor' : 'none'} />
              Sự kiện nổi bật
            </span>
            <p className="text-[10px] text-slate-400">Hiển thị ở vị trí đầu danh sách và portal dân cư</p>
          </div>
        </label>
      </section>

      {/* ── 2. Thời gian & địa điểm ─────────────────────────── */}
      <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
        <h2 className="font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
          <span className="w-6 h-6 rounded-full bg-[#8B1A1A] text-white text-xs flex items-center justify-center font-bold">2</span>
          Thời gian & Địa điểm
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Thời gian bắt đầu <span className="text-red-500">*</span>
            </label>
            <input
              name="ngay_bat_dau"
              type="datetime-local"
              required
              defaultValue={toDatetimeLocal(dv?.ngay_bat_dau)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Thời gian kết thúc</label>
            <input
              name="ngay_ket_thuc"
              type="datetime-local"
              defaultValue={toDatetimeLocal(dv?.ngay_ket_thuc)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Tên địa điểm <span className="text-red-500">*</span>
            </label>
            <input
              name="dia_diem"
              required
              defaultValue={dv?.dia_diem}
              placeholder={`Nhà văn hoá ${KHU_PHO.ma}, Sân vận động...`}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Địa chỉ cụ thể</label>
            <input
              name="dia_chi_cu_the"
              defaultValue={dv?.dia_chi_cu_the ?? ''}
              placeholder="Số nhà, đường, phường..."
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]"
            />
          </div>
        </div>
      </section>

      {/* ── 3. Tham dự ─────────────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
        <h2 className="font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
          <span className="w-6 h-6 rounded-full bg-[#8B1A1A] text-white text-xs flex items-center justify-center font-bold">3</span>
          Tham dự & Đăng ký
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Số người dự kiến</label>
            <input
              name="so_luong_du_kien"
              type="number"
              min="0"
              defaultValue={dv?.so_luong_du_kien ?? ''}
              placeholder="0"
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]"
            />
          </div>
          {dv && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Số người thực tế</label>
              <input
                name="so_luong_thuc_te"
                type="number"
                min="0"
                defaultValue={dv?.so_luong_thuc_te ?? ''}
                placeholder="Cập nhật sau sự kiện"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]"
              />
            </div>
          )}
        </div>

        {/* Toggle đăng ký */}
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <div
            onClick={() => setCanDangKy(v => !v)}
            className={`relative transition-colors cursor-pointer rounded-full`}
            style={{ height: '22px', width: '40px', background: canDangKy ? '#1E3A5F' : '#cbd5e1' }}
          >
            <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${canDangKy ? 'left-5' : 'left-0.5'}`} />
          </div>
          <div>
            <span className="text-sm font-medium text-slate-700">Yêu cầu đăng ký tham dự</span>
            <p className="text-[10px] text-slate-400">Người dân phải đăng ký trước để tham dự</p>
          </div>
        </label>

        {canDangKy && (
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Hạn đăng ký</label>
            <input
              name="han_dang_ky"
              type="datetime-local"
              defaultValue={toDatetimeLocal(dv?.han_dang_ky)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]"
            />
          </div>
        )}
      </section>

      {/* ── 4. Ban tổ chức ─────────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
        <h2 className="font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
          <span className="w-6 h-6 rounded-full bg-[#8B1A1A] text-white text-xs flex items-center justify-center font-bold">4</span>
          Ban tổ chức & Liên hệ
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Đơn vị tổ chức</label>
            <input
              name="don_vi_to_chuc"
              defaultValue={dv?.don_vi_to_chuc ?? `Ban điều hành ${KHU_PHO.ma}`}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Người phụ trách</label>
            <input
              name="nguoi_phu_trach"
              defaultValue={dv?.nguoi_phu_trach ?? ''}
              placeholder="Họ tên người phụ trách"
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">SĐT liên hệ</label>
            <input
              name="sdt_lien_he"
              type="tel"
              defaultValue={dv?.sdt_lien_he ?? ''}
              placeholder="0909123456"
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Ảnh bìa (URL)</label>
            <input
              name="anh_bia_url"
              type="url"
              defaultValue={dv?.anh_bia_url ?? ''}
              placeholder="https://..."
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]"
            />
          </div>
        </div>
      </section>

      {/* ── 5. Nội dung chi tiết ────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
        <h2 className="font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
          <span className="w-6 h-6 rounded-full bg-[#8B1A1A] text-white text-xs flex items-center justify-center font-bold">5</span>
          Nội dung chi tiết & Ghi chú
        </h2>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nội dung đầy đủ</label>
          <textarea
            name="noi_dung_day_du"
            rows={6}
            defaultValue={dv?.noi_dung_day_du ?? ''}
            placeholder="Chương trình, kế hoạch chi tiết, lịch trình..."
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1A1A] resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Ghi chú nội bộ</label>
          <textarea
            name="ghi_chu"
            rows={2}
            defaultValue={dv?.ghi_chu ?? ''}
            placeholder="Ghi chú chỉ cán bộ thấy..."
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1A1A] resize-none"
          />
        </div>
      </section>

      {/* Submit */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#8B1A1A] hover:bg-[#6d1414] text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          {loading ? 'Đang lưu...' : submitLabel}
        </button>
      </div>
    </form>
  )
}
