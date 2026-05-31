import Link from 'next/link'
import { ArrowLeft, ClipboardList, TrendingUp, AlertTriangle, Search } from 'lucide-react'
import { layThongKeHoanThien, layDanhSachHoSoThieu } from './actions'
import HoSoThieuClient from './HoSoThieuClient'
import LocBar from './LocBar'

export const dynamic = 'force-dynamic'

export default async function HoSoThieuPage({
  searchParams,
}: {
  searchParams: Promise<{ truong?: string; q?: string }>
}) {
  const sp = await searchParams
  const locTruong = sp.truong || undefined
  const timKiem   = sp.q || undefined

  const [thongKe, danhSach] = await Promise.all([
    layThongKeHoanThien(),
    layDanhSachHoSoThieu({ locTruong, timKiem, soLuong: 50 }),
  ])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link href="/dashboard/dan-cu" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-2 transition-colors">
          <ArrowLeft size={14} /> Quản lý dân cư
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <ClipboardList size={24} className="text-[#1E3A5F]" />
          Hồ sơ thiếu thông tin
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Rà soát và bổ sung các trường còn thiếu để hoàn thiện hồ sơ dân cư
        </p>
      </div>

      {/* Thống kê */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <TrendingUp size={15} />
            <span className="text-xs font-medium">Độ hoàn thiện trung bình</span>
          </div>
          <p className="text-3xl font-bold text-[#1E3A5F]">{thongKe.trungBinh}%</p>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden mt-2">
            <div className="h-full bg-[#1E3A5F] rounded-full transition-all" style={{ width: `${thongKe.trungBinh}%` }} />
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <p className="text-xs font-medium text-slate-400 mb-1">Hồ sơ đầy đủ 100%</p>
          <p className="text-3xl font-bold text-emerald-600">{thongKe.hoanThienToanBo}</p>
          <p className="text-xs text-slate-400 mt-1">/ {thongKe.tongNhanKhau} nhân khẩu</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <p className="text-xs font-medium text-slate-400 mb-1">Cần bổ sung</p>
          <p className="text-3xl font-bold text-amber-600">{thongKe.tongNhanKhau - thongKe.hoanThienToanBo}</p>
          <p className="text-xs text-slate-400 mt-1">hồ sơ chưa đầy đủ</p>
        </div>
      </div>

      {/* Bộ lọc theo trường thiếu */}
      {thongKe.thieuTheoTruong.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 mb-3 flex items-center gap-1.5">
            <AlertTriangle size={13} className="text-amber-500" />
            Lọc nhanh theo trường còn thiếu nhiều nhất
          </p>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/dashboard/dan-cu/ho-so-thieu"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                !locTruong ? 'bg-[#1E3A5F] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Tất cả
            </Link>
            {thongKe.thieuTheoTruong.slice(0, 10).map(t => (
              <Link
                key={t.key}
                href={`/dashboard/dan-cu/ho-so-thieu?truong=${t.key}`}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  locTruong === t.key ? 'bg-[#1E3A5F] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t.label}
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${locTruong === t.key ? 'bg-white/20' : 'bg-red-100 text-red-600'}`}>
                  {t.soLuong}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Tìm kiếm + Danh sách */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
        <LocBar defaultQ={timKiem ?? ''} truong={locTruong} />
        <div className="mt-4">
          <HoSoThieuClient initialItems={danhSach.items} tong={danhSach.tong} />
        </div>
      </div>
    </div>
  )
}
