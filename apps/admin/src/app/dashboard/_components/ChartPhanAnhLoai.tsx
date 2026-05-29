'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { LayoutGrid } from 'lucide-react'
import type { PhanAnhTheoLoai } from '../actions'

function CustomTooltip({
  active, payload, label,
}: {
  active?: boolean
  payload?: Array<{ value: number; payload: PhanAnhTheoLoai }>
  label?:   string
}) {
  if (!active || !payload?.length) return null
  const p = payload[0]!
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-3 py-2.5 text-sm">
      <p className="font-bold text-slate-700 mb-1">{label}</p>
      <div className="flex items-center gap-2 text-xs">
        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.payload.color }} />
        <span className="text-slate-500">Số phản ánh:</span>
        <span className="font-bold text-slate-900">{p.value}</span>
      </div>
    </div>
  )
}

export default function ChartPhanAnhLoai({ data }: { data: PhanAnhTheoLoai[] }) {
  const isEmpty = data.length === 0 || data.every(d => d.soLuong === 0)
  const total   = data.reduce((s, d) => s + d.soLuong, 0)

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 h-full">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <LayoutGrid size={16} className="text-[#1E3A5F]" />
          <h3 className="font-bold text-slate-900 text-sm">Phân loại phản ánh</h3>
        </div>
        <span className="text-xs text-slate-400">{total} tổng cộng</span>
      </div>
      <p className="text-xs text-slate-400 mb-4">Theo chủ đề (tất cả thời gian)</p>

      {isEmpty ? (
        <div className="h-48 flex items-center justify-center text-slate-300 text-sm">
          Chưa có dữ liệu
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
            <XAxis
              type="number"
              allowDecimals={false}
              tick={{ fontSize: 11, fill: '#94A3B8' }}
              axisLine={false} tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="ten"
              width={110}
              tick={{ fontSize: 11, fill: '#475569' }}
              axisLine={false} tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F8FAFC' }} />
            <Bar dataKey="soLuong" radius={[0, 6, 6, 0]} maxBarSize={24}>
              {data.map((d, i) => (
                <Cell key={i} fill={d.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
