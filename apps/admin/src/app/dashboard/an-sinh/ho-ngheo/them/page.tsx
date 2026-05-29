'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Home, Save, Users } from 'lucide-react'
import { themHoNgheo } from '../actions'
import HoDanCombobox from '@/components/shared/HoDanCombobox'

const NAM_HIEN_TAI = new Date().getFullYear()

export default function ThemHoNgheoPage() {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await themHoNgheo(formData)
      if (result.success) {
        router.push('/dashboard/an-sinh/ho-ngheo')
      } else {
        setError(result.error ?? 'Có lỗi xảy ra')
      }
    })
  }

  return (
    <div className="max-w-2xl space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/an-sinh/ho-ngheo" className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex items-center gap-2">
          <Home size={20} className="text-amber-600" />
          <h1 className="text-xl font-bold text-slate-900">Thêm hộ nghèo / cận nghèo</h1>
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
            Hộ dân <span className="text-red-500">*</span>
          </h2>
          <HoDanCombobox
            name="ho_dan_id"
            required
            accentColor="focus:ring-amber-500"
          />
          <p className="mt-1.5 text-xs text-slate-400">
            Tìm kiếm theo tên chủ hộ hoặc địa chỉ trong danh sách dân cư
          </p>
        </div>

        <hr className="border-slate-100" />

        {/* ── Phân loại & xét duyệt ─────────────────────────── */}
        <div>
          <h2 className="font-bold text-slate-700 mb-3 text-sm uppercase tracking-wider">Phân loại & xét duyệt</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Loại hộ <span className="text-red-500">*</span>
              </label>
              <select
                name="loai"
                required
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">— Chọn —</option>
                <option value="NGHEO">Hộ nghèo</option>
                <option value="CAN_NGHEO">Hộ cận nghèo</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Năm xét duyệt <span className="text-red-500">*</span>
              </label>
              <select
                name="nam_xet_duyet"
                required
                defaultValue={NAM_HIEN_TAI}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {[NAM_HIEN_TAI, NAM_HIEN_TAI - 1, NAM_HIEN_TAI - 2].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Số quyết định</label>
              <input
                name="quyet_dinh_so"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="QĐ 123/2026/UBND"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Ngày quyết định</label>
              <input
                name="ngay_quyet_dinh"
                type="date"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Ngày hết hạn</label>
              <input
                name="ngay_het_han"
                type="date"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Số thành viên</label>
              <input
                name="so_thanh_vien"
                type="number"
                min="1"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="4"
              />
            </div>
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* ── Tình trạng kinh tế ─────────────────────────────── */}
        <div>
          <h2 className="font-bold text-slate-700 mb-3 text-sm uppercase tracking-wider">Tình trạng kinh tế</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Thu nhập bình quân (đ/người/tháng)</label>
              <input
                name="thu_nhap_bq"
                type="number"
                min="0"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="1.500.000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tiền hỗ trợ (đ/tháng)</label>
              <input
                name="so_tien_ho_tro"
                type="number"
                min="0"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="0"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Lý do nghèo</label>
              <textarea
                name="ly_do_ngheo"
                rows={2}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                placeholder="Mất việc làm, bệnh tật, đông con, ..."
              />
            </div>
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* ── Thiếu hụt tiếp cận dịch vụ xã hội ─────────────── */}
        <div>
          <h2 className="font-bold text-slate-700 mb-1 text-sm uppercase tracking-wider">Thiếu hụt dịch vụ xã hội</h2>
          <p className="text-xs text-slate-400 mb-3">Đánh dấu các chiều nghèo đa chiều theo Quyết định 09/2021</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { name: 'thieu_y_te',       label: 'Y tế'         },
              { name: 'thieu_gd',         label: 'Giáo dục'     },
              { name: 'thieu_nha_o',      label: 'Nhà ở'        },
              { name: 'thieu_nc_vs',      label: 'Nước sạch'    },
              { name: 'thieu_thong_tin',  label: 'Thông tin'    },
            ].map(item => (
              <label
                key={item.name}
                className="flex items-center gap-2 cursor-pointer p-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <input type="checkbox" name={item.name} value="true" className="rounded accent-amber-500" />
                <span className="text-sm text-slate-700">{item.label}</span>
              </label>
            ))}
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* ── Các chính sách hỗ trợ ─────────────────────────── */}
        <div>
          <h2 className="font-bold text-slate-700 mb-1 text-sm uppercase tracking-wider">Chính sách hỗ trợ được duyệt</h2>
          <p className="text-xs text-slate-400 mb-3">Chọn các chính sách hỗ trợ hộ đang được hưởng</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { name: 'ho_tro_bhyt',      label: 'BHYT'      },
              { name: 'ho_tro_giao_duc',  label: 'Giáo dục'  },
              { name: 'ho_tro_nha_o',     label: 'Nhà ở'     },
            ].map(item => (
              <label
                key={item.name}
                className="flex items-center gap-2 cursor-pointer p-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <input type="checkbox" name={item.name} value="true" className="rounded accent-amber-500" />
                <span className="text-sm text-slate-700">{item.label}</span>
              </label>
            ))}
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* ── Ghi chú ─────────────────────────────────────────── */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Ghi chú</label>
          <textarea
            name="ghi_chu"
            rows={3}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
            placeholder="Ghi chú thêm về tình trạng gia đình..."
          />
        </div>

        {/* ── Actions ─────────────────────────────────────────── */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={pending}
            className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            <Save size={15} />
            {pending ? 'Đang lưu...' : 'Lưu hồ sơ'}
          </button>
          <Link href="/dashboard/an-sinh/ho-ngheo" className="px-4 py-2.5 text-sm text-slate-500 hover:text-slate-700 transition-colors">
            Hủy
          </Link>
        </div>
      </form>
    </div>
  )
}
