import { Building2 } from 'lucide-react'
import { layDanhSachDonVi } from './actions'
import KhuPhoClient from './KhuPhoClient'

export const dynamic = 'force-dynamic'

export default async function KhuPhoPage() {
  const danhSach = await layDanhSachDonVi()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Building2 size={24} className="text-[#1E3A5F]" />
          Quản lý Khu phố
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Khai báo và quản lý các khu phố thuộc Phường Long Trường trên cùng một hệ thống.
          Mỗi khu phố có dữ liệu dân cư, phản ánh, thông báo riêng — Phường quản lý tập trung.
        </p>
      </div>

      {/* Hướng dẫn ngắn */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-sm text-blue-800 leading-relaxed">
        <p className="font-semibold mb-1">Nhân rộng mô hình KP25 ra toàn phường</p>
        <p className="text-blue-700/90">
          Thêm từng khu phố tại đây, sau đó gán cán bộ phụ trách cho mỗi khu phố ở mục
          {' '}<strong>Phân quyền</strong>. Cán bộ chỉ thấy dữ liệu khu phố mình phụ trách;
          lãnh đạo phường xem được toàn bộ.
        </p>
      </div>

      <KhuPhoClient danhSach={danhSach} />
    </div>
  )
}
