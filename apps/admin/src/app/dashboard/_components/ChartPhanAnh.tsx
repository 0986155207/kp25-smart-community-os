'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { AlertCircle } from 'lucide-react'
import type { PhanAnhTrangThai } from '../actions'

function CustomTooltip({
  active, payload,
}: {
  active?: boolean
  payload?: Array<{ name: string; value: number; payload: { color: string } }>
}) {
  if (!active || !payload?.length) return null
  const p = payload[0]!
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-3 py-2 text-xs">
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: p.payload.color }} />
        <span className="font-semibold text-slate-800">{p.name}</span>
      </div>
      <p className="text-slate-600 mt-0.5 pl-4">{p.value} phản ánh</p>
    </div>
  )
}

function PieLabel({
  cx, cy, midAngle, outerRadius, percent,
}: {
  cx: number; cy: number; midAngle: number; outerRadius: number; percent: number
}) {
  if (percent < 0.06) return null
  const RAD = Math.PI / 180
  const r = outerRadius + 18
  const x = cx + r * Math.cos(-midAngle * RAD)
  const y = cy + r * Math.sin(-midAngle * RAD)
  return (
    <text
      x={x} y={y}
      fill="#475569"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      fontSize={11} fontWeight={600}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

export default function ChartPhanAnh({ data }: { data: PhanAnhTrangThai[] }) {
  const total   = data.reduce((s, d) => s + d.value, 0)
  const isEmpty = total === 0

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-1">
        <AlertCircle size={16} className="text-amber-500" />
        <h3 className="font-bold text-slate-900 text-sm">Trạng thái phản ánh</h3>
      </div>
      <p className="text-xs text-slate-400 mb-4">Tổng cộng {total.toLocaleString('vi-VN')} phản ánh</p>

      {isEmpty ? (
        <div className="h-48 flex items-center justify-center text-slate-300 text-sm">
          Chưa có phản ánh nào
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={data}
              cx="50%" cy="48%"
              innerRadius={52} outerRadius={80}
              paddingAngle={3}
              dataKey="value"
              labelLine={false}
              label={PieLabel}
            >
              {data.map((d, i) => <Cell key={i} fill={d.color} />)}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
              iconType="circle"
              iconSize={8}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
