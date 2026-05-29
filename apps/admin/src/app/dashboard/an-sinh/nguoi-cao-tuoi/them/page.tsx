'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Users, Save } from 'lucide-react'
import { themNCT } from '../actions'

export default function ThemNCTPage() {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await themNCT(formData)
      if (result.success) {
        router.push('/dashboard/an-sinh/nguoi-cao-tuoi')
      } else {
        setError(result.error ?? 'Có lỗi xảy ra')
      }
    })
  }

  return (
    <div className="max-w-2xl space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/an-sinh/nguoi-cao-tuoi" className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex items-center gap-2">
          <Users size={20} className="text-blue-600" />
          <h1 className="text-xl font-bold text-slate-900">Thêm người cao tuổi</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>
        )}

        {/* Thông tin cá nhân */}
        <div>
          <h2 className="font-bold text-slate-700 mb-3 text-sm uppercase tracking-wider">Thông tin cá nhân</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Họ và tên <span className="text-red-500">*</span></label>
              <input name="ho_ten" required className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Nguyễn Văn A" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Ngày sinh <span className="text-red-500">*</span></label>
              <input name="ngay_sinh" type="date" required className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Giới tính</label>
              <select name="gioi_tinh" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">— Chọn —</option>
                <option value="NAM">Nam</option>
                <option value="NU">Nữ</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Số CCCD / CMND</label>
              <input name="so_cccd" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="012345678901" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tình trạng sức khỏe</label>
              <select name="tinh_trang_sk" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="ON_DINH">Ổn định</option>
                <option value="TOT">Tốt</option>
                <option value="YEU">Yếu</option>
                <option value="CAN_CHAM_SOC">Cần chăm sóc</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Địa chỉ thường trú</label>
              <input name="dia_chi_day" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="63/22 Đường số 1, Khu phố 25" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Bệnh mãn tính</label>
              <input name="benh_man_tinh" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Tiểu đường, huyết áp, ..." />
            </div>
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* Hoàn cảnh */}
        <div>
          <h2 className="font-bold text-slate-700 mb-3 text-sm uppercase tracking-wider">Hoàn cảnh & hỗ trợ</h2>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              { name: 'song_co_don',     label: 'Sống cô đơn'        },
              { name: 'co_luong_huu',    label: 'Có lương hưu'       },
              { name: 'co_bhyt',         label: 'Có thẻ BHYT'        },
              { name: 'nhan_tro_cap_xh', label: 'Nhận trợ cấp XH'    },
              { name: 'la_liet_si',      label: 'Liệt sĩ'            },
              { name: 'la_nguoi_co_cong',label: 'Người có công'      },
            ].map(item => (
              <label key={item.name} className="flex items-center gap-2 cursor-pointer p-2.5 border border-slate-200 rounded-lg hover:bg-slate-50">
                <input type="checkbox" name={item.name} value="true" className="rounded" />
                <span className="text-sm font-medium text-slate-700">{item.label}</span>
              </label>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Mức lương hưu (đ/tháng)</label>
              <input name="muc_luong_huu" type="number" min="0" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="3000000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Mức trợ cấp XH (đ/tháng)</label>
              <input name="muc_tro_cap_xh" type="number" min="0" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="360000" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Số quyết định trợ cấp</label>
              <input name="quyet_dinh_tro_cap" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="QĐ 456/2026/UBND" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Mã thẻ BHYT</label>
              <input name="ma_the_bhyt" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="HS4012345678" />
            </div>
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* Người chăm sóc */}
        <div>
          <h2 className="font-bold text-slate-700 mb-3 text-sm uppercase tracking-wider">Người chăm sóc</h2>
          <div className="grid grid-cols-2 gap-4">
            <label className="col-span-2 flex items-center gap-2 cursor-pointer p-2.5 border border-slate-200 rounded-lg hover:bg-slate-50">
              <input type="checkbox" name="co_nguoi_cham_soc" value="true" className="rounded" />
              <span className="text-sm font-medium text-slate-700">Có người chăm sóc</span>
            </label>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tên người chăm sóc</label>
              <input name="ten_nguoi_cham_soc" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Nguyễn Thị B" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">SĐT người chăm sóc</label>
              <input name="sdt_nguoi_cham_soc" type="tel" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="0901234567" />
            </div>
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* Ghi chú */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Ghi chú</label>
          <textarea name="ghi_chu" rows={3} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Ghi chú thêm về hoàn cảnh, nhu cầu đặc biệt..." />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={pending}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            <Save size={15} />
            {pending ? 'Đang lưu...' : 'Lưu thông tin'}
          </button>
          <Link href="/dashboard/an-sinh/nguoi-cao-tuoi" className="px-4 py-2.5 text-sm text-slate-500 hover:text-slate-700 transition-colors">
            Hủy
          </Link>
        </div>
      </form>
    </div>
  )
}
