import { KHU_PHO } from '@/lib/khu-pho'
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Home, Users, AlertCircle, Clock, CheckCircle2,
  UserCog, CalendarDays, TrendingUp,
  ArrowUpRight, ArrowDownRight, Minus,
  Bell, Users2, Map, Plus,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { layCanBoHienTai } from '@/lib/auth'
import {
  layDashboardStats,
  layXuHuong6Thang,
  layPhanAnhTheoTrangThai,
  laySuKienSapToi,
  layPhanAnhGanDay,
  layThongKeHomNay,
  layThongKeAnSinh,
  layPhanAnhTheoLoai,
  layHoatDong30Ngay,
} from './actions'
import DashboardRefresh       from './_components/DashboardRefresh'
import ChartXuHuong           from './_components/ChartXuHuong'
import ChartPhanAnh           from './_components/ChartPhanAnh'
import SuKienSapToi           from './_components/SuKienSapToi'
import PhanAnhGanDay          from './_components/PhanAnhGanDay'
import DaiHomNay              from './_components/DaiHomNay'
import ThongKeAnSinh          from './_components/ThongKeAnSinh'
import ChartPhanAnhLoai       from './_components/ChartPhanAnhLoai'
import ChartHoatDong30Ngay    from './_components/ChartHoatDong30Ngay'

export const metadata: Metadata = { title: 'Dashboard' }
export const revalidate = 0   // luôn fetch mới (kết hợp với DashboardRefresh)

// ─── KPI Card ─────────────────────────────────────────────────

function KPICard({
  label, value, unit, icon: Icon, color, bg, href, delta, hint,
}: {
  label:  string
  value:  number | string
  unit?:  string
  icon:   React.ElementType
  color:  string
  bg:     string
  href:   string
  delta?: number    // % thay đổi so tháng trước
  hint?:  string
}) {
  const DeltaIcon = delta === undefined ? null
    : delta > 0 ? ArrowUpRight
    : delta < 0 ? ArrowDownRight
    : Minus

  const deltaColor = delta === undefined ? ''
    : delta > 0 ? 'text-red-500'
    : delta < 0 ? 'text-emerald-500'
    : 'text-slate-400'

  return (
    <Link
      href={href}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 hover:shadow-md transition-all group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', bg)}>
          <Icon size={18} className={color} />
        </div>
        {DeltaIcon && delta !== undefined && (
          <div className={cn('flex items-center gap-0.5 text-[11px] font-semibold', deltaColor)}>
            <DeltaIcon size={12} />
            {Math.abs(delta)}%
          </div>
        )}
      </div>

      <div className="flex items-end gap-1">
        <span className={cn('text-2xl font-bold tabular-nums', color)}>
          {typeof value === 'number' ? value.toLocaleString('vi-VN') : value}
        </span>
        {unit && <span className="text-xs text-slate-400 mb-0.5">{unit}</span>}
      </div>
      <p className="text-sm font-medium text-slate-700 mt-0.5">{label}</p>
      {hint && <p className="text-[10px] text-slate-400 mt-0.5">{hint}</p>}
    </Link>
  )
}

// ─── Quick action button ──────────────────────────────────────

function QuickBtn({
  href, icon: Icon, label, cls,
}: {
  href: string; icon: React.ElementType; label: string; cls: string
}) {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors',
        cls
      )}
    >
      <Icon size={15} />
      {label}
    </Link>
  )
}

// ─── Page ─────────────────────────────────────────────────────

export default async function DashboardPage() {
  const [canBo, stats, trend, phanAnhTT, suKien, phanAnhGD, homNay, anSinh, phanAnhLoai, hoatDong] = await Promise.all([
    layCanBoHienTai(),
    layDashboardStats(),
    layXuHuong6Thang(),
    layPhanAnhTheoTrangThai(),
    laySuKienSapToi(),
    layPhanAnhGanDay(),
    layThongKeHomNay(),
    layThongKeAnSinh(),
    layPhanAnhTheoLoai(),
    layHoatDong30Ngay(),
  ])

  const now = new Date()
  const ngayHienTai = now.toLocaleDateString('vi-VN', {
    weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric',
    timeZone: 'Asia/Ho_Chi_Minh',
  })

  return (
    <div className="space-y-6">

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Tổng quan điều hành
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {KHU_PHO.ten} · Phường Long Trường · TP.HCM
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 hidden sm:block">{ngayHienTai}</span>
          {canBo && (
            <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full font-medium hidden sm:block">
              {canBo.ho_ten}
            </span>
          )}
          <DashboardRefresh />
        </div>
      </div>

      {/* ── Dải thống kê hôm nay ────────────────────────────────── */}
      <DaiHomNay data={homNay} />

      {/* ── 8 KPI Cards ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3">
        <KPICard
          label="Hộ dân"
          value={stats.tongHoDan} unit="hộ"
          icon={Home} color="text-[#8B1A1A]" bg="bg-red-50"
          href="/dashboard/dan-cu"
          hint="Thường trú + tạm trú"
        />
        <KPICard
          label="Nhân khẩu"
          value={stats.tongNhanKhau} unit="người"
          icon={Users} color="text-[#1E3A5F]" bg="bg-blue-50"
          href="/dashboard/dan-cu"
        />
        <KPICard
          label="Phản ánh mới"
          value={stats.phanAnhMoi} unit="vụ"
          icon={AlertCircle} color="text-amber-600" bg="bg-amber-50"
          href="/dashboard/phan-anh?trang_thai=MOI"
          delta={stats.phanAnhMoiDelta}
          hint="So tháng trước"
        />
        <KPICard
          label="Đang xử lý"
          value={stats.phanAnhDangXuLy} unit="vụ"
          icon={Clock} color="text-blue-600" bg="bg-blue-50"
          href="/dashboard/phan-anh?trang_thai=DANG_XU_LY"
        />
        <KPICard
          label="Đã xử lý"
          value={stats.phanAnhDaXuLy} unit="vụ"
          icon={CheckCircle2} color="text-emerald-600" bg="bg-emerald-50"
          href="/dashboard/phan-anh?trang_thai=DA_XU_LY"
        />
        <KPICard
          label="Tỷ lệ xử lý"
          value={`${stats.tyLeXuLy}%`}
          icon={TrendingUp}
          color={stats.tyLeXuLy >= 80 ? 'text-emerald-600' : stats.tyLeXuLy >= 50 ? 'text-amber-600' : 'text-red-600'}
          bg={stats.tyLeXuLy >= 80 ? 'bg-emerald-50' : stats.tyLeXuLy >= 50 ? 'bg-amber-50' : 'bg-red-50'}
          href="/dashboard/bao-cao"
          hint={stats.tyLeXuLy >= 80 ? 'Tốt' : stats.tyLeXuLy >= 50 ? 'Trung bình' : 'Cần cải thiện'}
        />
        <KPICard
          label="Đang tạm trú"
          value={stats.dangTamTru} unit="người"
          icon={UserCog} color="text-indigo-600" bg="bg-indigo-50"
          href="/dashboard/dan-cu/tam-tru-tam-vang"
        />
        <KPICard
          label="Sự kiện tháng"
          value={stats.suKienThangNay} unit="sự kiện"
          icon={CalendarDays} color="text-violet-600" bg="bg-violet-50"
          href="/dashboard/su-kien"
          hint={`Tháng ${now.getMonth() + 1}/${now.getFullYear()}`}
        />
      </div>

      {/* ── An sinh xã hội ──────────────────────────────────────── */}
      <ThongKeAnSinh data={anSinh} />

      {/* ── Charts row 1 ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <ChartXuHuong data={trend} />
        </div>
        <div className="lg:col-span-1">
          <ChartPhanAnh data={phanAnhTT} />
        </div>
      </div>

      {/* ── Charts row 2 ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartPhanAnhLoai    data={phanAnhLoai} />
        <ChartHoatDong30Ngay data={hoatDong} />
      </div>

      {/* ── Nội dung phụ ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Sự kiện sắp tới */}
        <div className="lg:col-span-1">
          <SuKienSapToi items={suKien} />
        </div>

        {/* Phản ánh gần đây */}
        <div className="lg:col-span-1">
          <PhanAnhGanDay items={phanAnhGD} />
        </div>

        {/* Quick actions */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="font-bold text-slate-900 text-sm mb-4">Thao tác nhanh</h3>
            <div className="grid grid-cols-1 gap-2">
              <QuickBtn
                href="/dashboard/phan-anh/tao"
                icon={Plus}
                label="Tạo phản ánh mới"
                cls="bg-amber-50 text-amber-700 hover:bg-amber-100"
              />
              <QuickBtn
                href="/dashboard/su-kien/tao"
                icon={CalendarDays}
                label="Tạo sự kiện"
                cls="bg-violet-50 text-violet-700 hover:bg-violet-100"
              />
              <QuickBtn
                href="/dashboard/thong-bao/tao"
                icon={Bell}
                label="Gửi thông báo"
                cls="bg-blue-50 text-[#1E3A5F] hover:bg-blue-100"
              />
              <QuickBtn
                href="/dashboard/dan-cu/them"
                icon={Users2}
                label="Thêm hộ dân"
                cls="bg-red-50 text-[#8B1A1A] hover:bg-red-100"
              />
              <QuickBtn
                href="/dashboard/dan-cu/tam-tru-tam-vang/them-tam-tru"
                icon={UserCog}
                label="Đăng ký tạm trú"
                cls="bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
              />
              <QuickBtn
                href="/dashboard/ban-do"
                icon={Map}
                label="Mở bản đồ GIS"
                cls="bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              />
            </div>

            {/* Footer link báo cáo */}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <Link
                href="/dashboard/bao-cao"
                className="flex items-center gap-2 text-sm text-slate-500 hover:text-[#1E3A5F] font-medium transition-colors"
              >
                <TrendingUp size={14} />
                Xem báo cáo & KPI đầy đủ
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer timestamp ─────────────────────────────────────── */}
      <div className="text-center py-2">
        <p className="text-[11px] text-slate-300">
          {KHU_PHO.ma} Smart Community OS · Dữ liệu cập nhật realtime · Tự làm mới mỗi 60 giây
        </p>
      </div>

    </div>
  )
}
