'use client'

import { KHU_PHO } from '@/lib/khu-pho'
import { useRef } from 'react'
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from 'recharts'
import { BarChart3, Users, AlertCircle, ShieldCheck, Home, Heart, Bell, TrendingUp, ExternalLink } from 'lucide-react'
import type { BaoCaoData } from './actions'
import ExportModal from '@/components/bao-cao/ExportModal'

// ─── Tooltip tùy chỉnh ─────────────────────────────────────────
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-4 py-3 text-sm">
      {label && <p className="font-bold text-slate-700 mb-1.5">{label}</p>}
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: p.color }} />
          <span className="text-slate-600">{p.name}:</span>
          <span className="font-bold text-slate-900">{p.value.toLocaleString('vi-VN')}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Label Pie ─────────────────────────────────────────────────
function PieLabel({ cx, cy, midAngle, outerRadius, percent }: {
  cx: number; cy: number; midAngle: number; outerRadius: number; percent: number
}) {
  if (percent < 0.05) return null
  const RADIAN = Math.PI / 180
  const r = outerRadius + 20
  const x = cx + r * Math.cos(-midAngle * RADIAN)
  const y = cy + r * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="#475569" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

// ─── Card wrapper ──────────────────────────────────────────────
function ChartCard({ title, subtitle, children, className = '' }: {
  title: string; subtitle?: string; children: React.ReactNode; className?: string
}) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm p-5 ${className}`}>
      <div className="mb-4">
        <h3 className="font-bold text-slate-900 text-sm">{title}</h3>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}

// ─── Stat Card ─────────────────────────────────────────────────
function StatCard({ label, value, unit, icon: Icon, color, bg, trend }: {
  label: string; value: string | number; unit?: string
  icon: React.ElementType; color: string; bg: string; trend?: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
      <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
        <Icon size={18} className={color} />
      </div>
      <div className="flex items-end gap-1">
        <span className={`text-2xl font-bold ${color}`}>
          {typeof value === 'number' ? value.toLocaleString('vi-VN') : value}
        </span>
        {unit && <span className="text-xs text-slate-400 mb-1">{unit}</span>}
      </div>
      <p className="text-sm font-medium text-slate-700 mt-0.5">{label}</p>
      {trend && <p className="text-xs text-slate-400 mt-1">{trend}</p>}
    </div>
  )
}

// ─── Empty state ───────────────────────────────────────────────
function EmptyChart({ text = 'Chưa có dữ liệu' }: { text?: string }) {
  return (
    <div className="flex items-center justify-center h-40 text-slate-300">
      <div className="text-center">
        <BarChart3 size={28} className="mx-auto mb-2 opacity-30" />
        <p className="text-xs">{text}</p>
      </div>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────
export default function BaoCaoCharts({ data }: { data: BaoCaoData }) {
  const printRef = useRef<HTMLDivElement>(null)
  const { kpi, phanBoTo, phanBoGioiTinh, phanBoDoTuoi, phanBoCuTru,
    phanAnhTheoThang, phanAnhTheoLoai, phanAnhTheoTT,
    bhytTheoTT, hoNgheoTheoLoai, nctTheoSK, ngayTao } = data

  return (
    <div ref={printRef} className="space-y-6">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 size={22} className="text-[#1E3A5F]" />
            <h1 className="text-2xl font-bold text-slate-900">Báo cáo & KPI</h1>
          </div>
          <p className="text-slate-500 text-sm">
            {KHU_PHO.ten} · Phường Long Trường · TP.HCM — Cập nhật: {ngayTao}
          </p>
        </div>

        <div className="flex items-center gap-2 print:hidden">
          {/* Xem trang in */}
          <a
            href="/print/bao-cao"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl
                       bg-slate-100 text-slate-600 text-sm font-medium
                       hover:bg-slate-200 transition-colors"
          >
            <ExternalLink size={14} />
            Xem bản in
          </a>
          {/* Export modal */}
          <ExportModal />
        </div>
      </div>

      {/* ── KPI tổng quan ──────────────────────────────────────── */}
      <div>
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Chỉ số tổng quan</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3">
          <StatCard label="Hộ dân"        value={kpi.tongHoDan}    unit="hộ"    icon={Home}        color="text-[#8B1A1A]"   bg="bg-red-50"     />
          <StatCard label="Nhân khẩu"     value={kpi.tongNhanKhau} unit="người" icon={Users}       color="text-[#1E3A5F]"   bg="bg-blue-50"    />
          <StatCard label="Phản ánh"      value={kpi.tongPhanAnh}  unit="vụ"    icon={AlertCircle} color="text-amber-600"   bg="bg-amber-50"   />
          <StatCard label="Tỷ lệ xử lý"  value={`${kpi.tyLeXuLyPA}%`} icon={TrendingUp} color={kpi.tyLeXuLyPA >= 80 ? 'text-emerald-600' : 'text-amber-600'} bg={kpi.tyLeXuLyPA >= 80 ? 'bg-emerald-50' : 'bg-amber-50'} trend="Phản ánh hoàn thành" />
          <StatCard label="Thẻ BHYT"     value={kpi.tongBHYT}     unit="thẻ"   icon={ShieldCheck} color="text-emerald-600" bg="bg-emerald-50" />
          <StatCard label="Hộ nghèo/CNG" value={kpi.tongHoNgheo}  unit="hộ"    icon={Home}        color="text-orange-600"  bg="bg-orange-50"  />
          <StatCard label="Người cao tuổi" value={kpi.tongNCT}    unit="người" icon={Heart}       color="text-blue-600"    bg="bg-blue-50"    />
          <StatCard label="Thông báo"    value={kpi.tongThongBao} unit="bản"   icon={Bell}        color="text-violet-600"  bg="bg-violet-50"  />
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          SECTION 1: DÂN CƯ
      ══════════════════════════════════════════════════════════ */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-5 rounded bg-[#1E3A5F]" />
          <h2 className="font-bold text-slate-800">Dân cư</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Phân bố theo tổ — chiếm 2/3 */}
          <ChartCard
            title="Phân bố hộ dân theo Tổ / Khu vực"
            subtitle={`${kpi.tongHoDan} hộ — ${phanBoTo.length} tổ/khu vực`}
            className="lg:col-span-2"
          >
            {phanBoTo.length === 0 ? <EmptyChart /> : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart
                  data={phanBoTo}
                  layout="vertical"
                  margin={{ top: 0, right: 30, left: 10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="ten" type="category" tick={{ fontSize: 11, fill: '#475569' }} width={80} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="soHo"    name="Số hộ"    fill="#1E3A5F" radius={[0,4,4,0]} barSize={10} />
                  <Bar dataKey="soNguoi" name="Nhân khẩu" fill="#3B82F6" radius={[0,4,4,0]} barSize={10} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          {/* Giới tính — chiếm 1/3 */}
          <ChartCard title="Giới tính nhân khẩu" subtitle={`${kpi.tongNhanKhau} người`}>
            {phanBoGioiTinh.length === 0 ? <EmptyChart /> : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={phanBoGioiTinh}
                    cx="50%" cy="50%"
                    innerRadius={55} outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                    labelLine={false}
                    label={PieLabel}
                  >
                    {phanBoGioiTinh.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          {/* Nhóm tuổi — chiếm 2/3 */}
          <ChartCard
            title="Phân bố độ tuổi nhân khẩu"
            subtitle="Theo nhóm tuổi"
            className="lg:col-span-2"
          >
            {phanBoDoTuoi.length === 0 ? <EmptyChart /> : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={phanBoDoTuoi} margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="nhom" tick={{ fontSize: 11, fill: '#475569' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="soNguoi" name="Số người" fill="#1E3A5F" radius={[4,4,0,0]}>
                    {phanBoDoTuoi.map((_, i) => {
                      const colors = ['#93C5FD','#60A5FA','#3B82F6','#2563EB','#1D4ED8','#6B7280']
                      return <Cell key={i} fill={colors[i % colors.length]!} />
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          {/* Tình trạng cư trú — 1/3 */}
          <ChartCard title="Tình trạng cư trú" subtitle={`${kpi.tongHoDan} hộ`}>
            {phanBoCuTru.length === 0 ? <EmptyChart /> : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={phanBoCuTru}
                    cx="50%" cy="50%"
                    innerRadius={50} outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                    labelLine={false}
                    label={PieLabel}
                  >
                    {phanBoCuTru.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          SECTION 2: PHẢN ÁNH
      ══════════════════════════════════════════════════════════ */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-5 rounded bg-amber-500" />
          <h2 className="font-bold text-slate-800">Phản ánh hiện trường</h2>
        </div>

        <div className="grid grid-cols-1 gap-4">

          {/* Phản ánh theo tháng — full width */}
          <ChartCard
            title="Xu hướng phản ánh 12 tháng gần nhất"
            subtitle={`Tổng cộng ${kpi.tongPhanAnh} phản ánh · Tỷ lệ xử lý: ${kpi.tyLeXuLyPA}%`}
          >
            {phanAnhTheoThang.every(t => t.moi + t.dangXuLy + t.daXuLy === 0)
              ? <EmptyChart text="Chưa có phản ánh" />
              : (
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={phanAnhTheoThang} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="thang" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="moi"      name="Mới"          stroke="#F59E0B" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                  <Line type="monotone" dataKey="dangXuLy" name="Đang xử lý"   stroke="#3B82F6" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                  <Line type="monotone" dataKey="daXuLy"   name="Đã hoàn thành" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Phân loại */}
            <ChartCard title="Phân loại phản ánh" subtitle="Theo nội dung">
              {phanAnhTheoLoai.length === 0 ? <EmptyChart /> : (
                <ResponsiveContainer width="100%" height={230}>
                  <PieChart>
                    <Pie
                      data={phanAnhTheoLoai}
                      cx="50%" cy="50%"
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                      labelLine={false}
                      label={PieLabel}
                    >
                      {phanAnhTheoLoai.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            {/* Trạng thái */}
            <ChartCard title="Trạng thái xử lý" subtitle="Toàn bộ phản ánh">
              {phanAnhTheoTT.length === 0 ? <EmptyChart /> : (
                <ResponsiveContainer width="100%" height={230}>
                  <BarChart
                    data={phanAnhTheoTT}
                    margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#475569' }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" name="Số phản ánh" radius={[4,4,0,0]} maxBarSize={60}>
                      {phanAnhTheoTT.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          SECTION 3: AN SINH
      ══════════════════════════════════════════════════════════ */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-5 rounded bg-emerald-500" />
          <h2 className="font-bold text-slate-800">An sinh Xã hội</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* BHYT */}
          <ChartCard title="Bảo hiểm Y tế" subtitle={`${kpi.tongBHYT} hồ sơ`}>
            {bhytTheoTT.length === 0 ? <EmptyChart /> : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={bhytTheoTT}
                    cx="50%" cy="50%"
                    innerRadius={50} outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                    labelLine={false}
                    label={PieLabel}
                  >
                    {bhytTheoTT.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          {/* Hộ nghèo */}
          <ChartCard title="Hộ nghèo & Cận nghèo" subtitle={`${kpi.tongHoNgheo} hộ đang hưởng`}>
            {hoNgheoTheoLoai.length === 0
              ? <EmptyChart text="Chưa có dữ liệu hộ nghèo" />
              : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={hoNgheoTheoLoai}
                    cx="50%" cy="50%"
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                    labelLine={false}
                    label={PieLabel}
                  >
                    {hoNgheoTheoLoai.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          {/* Người cao tuổi */}
          <ChartCard title="Sức khỏe Người cao tuổi" subtitle={`${kpi.tongNCT} người`}>
            {nctTheoSK.length === 0
              ? <EmptyChart text="Chưa có dữ liệu NCT" />
              : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={nctTheoSK}
                    cx="50%" cy="50%"
                    innerRadius={45} outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                    labelLine={false}
                    label={PieLabel}
                  >
                    {nctTheoSK.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>
      </div>

      {/* ── Footer stamp ──────────────────────────────────────── */}
      <div className="text-center py-3 border-t border-slate-100">
        <p className="text-xs text-slate-400">
          {KHU_PHO.ma} Smart Community OS · Báo cáo tự động · {ngayTao}
        </p>
        <p className="text-[10px] text-slate-300 mt-0.5">
          {KHU_PHO.ten} · Phường Long Trường · TP.HCM
        </p>
      </div>

    </div>
  )
}
