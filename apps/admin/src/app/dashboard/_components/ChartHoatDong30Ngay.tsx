'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import { Activity } from 'lucide-react'
import type { DiemHoatDong } from '../actions'

function CustomTooltip({
  active, payload, label,
}: {
  active?: boolean
  payload?: Array<{ value: number }>
  label?:   string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-3 py-2 text-xs">
      <p className="font-bold text-slate-700 mb-1">{label}</p>
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#1E3A5F] inline-block" />
        <span className="text-slate-500">Phản ánh:</span>
        <span className="font-bold text-slate-900">{payload[0]!.value}</span>
      </div>
    </div>
  )
}

// Chỉ hiện label mỗi 5 ngày cho gọn
function TickFormatter(value: string, index: number) {
  return index % 5 === 0 ? value : ''
}

export default function ChartHoatDong30Ngay({ data }: { data: DiemHoatDong[] }) {
  const isEmpty = data.every(d => d.soLuong === 0)
  const max     = Math.max(...data.map(d => d.soLuong), 1)

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 h-full">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Activity size={16} className="text-[#1E3A5F]" />
          <h3 className="font-bold text-slate-900 text-sm">Hoạt động phản ánh</h3>
        </div>
        <span className="text-xs text-slate-400">30 ngày qua</span>
      </div>
      <p className="text-xs text-slate-400 mb-4">Số lượng phản ánh theo ngày</p>

      {isEmpty ? (
        <div className="h-48 flex items-center justify-center text-slate-300 text-sm">
          Chưa có dữ liệu
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="gradBar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#1E3A5F" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#2d5986" stopOpacity={0.6} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
            <XAxis
              dataKey="ngay"
              tick={{ fontSize: 10, fill: '#94A3B8' }}
              axisLine={false} tickLine={false}
              tickFormatter={TickFormatter}
              interval={0}
            />
            <YAxis
              allowDecimals={false}
              domain={[0, max + 1]}
              tick={{ fontSize: 11, fill: '#94A3B8' }}
              axisLine={false} tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F8FAFC' }} />
            <Bar
              dataKey="soLuong"
              fill="url(#gradBar)"
              radius={[4, 4, 0, 0]}
              maxBarSize={16}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
