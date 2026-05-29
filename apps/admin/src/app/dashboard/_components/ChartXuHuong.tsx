'use client'

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { TrendingUp } from 'lucide-react'
import type { DiemTrendThang } from '../actions'

function CustomTooltip({
  active, payload, label,
}: {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-3 py-2.5 text-sm">
      <p className="font-bold text-slate-700 mb-1.5">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
          <span className="text-slate-500">{p.name}:</span>
          <span className="font-bold text-slate-900">{p.value}</span>
        </div>
      ))}
    </div>
  )
}

export default function ChartXuHuong({ data }: { data: DiemTrendThang[] }) {
  const isEmpty = data.every(d => d.tong === 0)

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-[#1E3A5F]" />
            <h3 className="font-bold text-slate-900 text-sm">Xu hướng phản ánh</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">6 tháng gần nhất</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
            Mới
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            Đã xử lý
          </span>
        </div>
      </div>

      {isEmpty ? (
        <div className="h-48 flex items-center justify-center text-slate-300 text-sm">
          Chưa có dữ liệu phản ánh
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gradMoi" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#F59E0B" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="gradXuLy" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#10B981" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
            <XAxis
              dataKey="thang"
              tick={{ fontSize: 11, fill: '#94A3B8' }}
              axisLine={false} tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 11, fill: '#94A3B8' }}
              axisLine={false} tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone" dataKey="moi" name="Phản ánh mới"
              stroke="#F59E0B" strokeWidth={2}
              fill="url(#gradMoi)"
              dot={{ r: 3, fill: '#F59E0B', strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
            <Area
              type="monotone" dataKey="daXuLy" name="Đã xử lý"
              stroke="#10B981" strokeWidth={2}
              fill="url(#gradXuLy)"
              dot={{ r: 3, fill: '#10B981', strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
