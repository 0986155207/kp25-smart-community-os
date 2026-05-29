'use client'

import { Users, Home, CheckCircle, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface Stat {
  label: string
  value: number
  unit: string
  icon: typeof Users
  color: string
  bgColor: string
}

const stats: Stat[] = [
  {
    label: 'Hộ dân',
    value: 0,
    unit: 'hộ',
    icon: Home,
    color: 'text-[#8B1A1A]',
    bgColor: 'bg-red-50',
  },
  {
    label: 'Nhân khẩu',
    value: 0,
    unit: 'người',
    icon: Users,
    color: 'text-[#1E3A5F]',
    bgColor: 'bg-blue-50',
  },
  {
    label: 'Phản ánh đã xử lý',
    value: 0,
    unit: 'vụ',
    icon: CheckCircle,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
  },
  {
    label: 'Đang xử lý',
    value: 0,
    unit: 'vụ',
    icon: AlertCircle,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
  },
]

function AnimatedNumber({ target, duration = 1500 }: { target: number; duration?: number }) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (target === 0) return
    const step = target / (duration / 16)
    let val = 0
    const timer = setInterval(() => {
      val += step
      if (val >= target) {
        setCurrent(target)
        clearInterval(timer)
      } else {
        setCurrent(Math.floor(val))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration])

  return <span>{current.toLocaleString('vi-VN')}</span>
}

export default function StatsSection({ data }: { data?: Record<string, number> }) {
  const filledStats = stats.map((s, i) => {
    const values = [
      data?.tongHoDan ?? 750,
      data?.tongNhanKhau ?? 2840,
      data?.phanAnhDaXuLy ?? 128,
      data?.phanAnhDangXuLy ?? 12,
    ]
    return { ...s, value: values[i] ?? 0 }
  })

  return (
    <section className="py-8 bg-slate-50 border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {filledStats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="card text-center"
            >
              <div
                className={`w-12 h-12 ${stat.bgColor} rounded-xl mx-auto mb-3 flex items-center justify-center`}
              >
                <stat.icon size={22} className={stat.color} />
              </div>
              <div className={`text-3xl font-bold ${stat.color} mb-1`}>
                <AnimatedNumber target={stat.value} />
              </div>
              <div className="text-xs text-slate-500 font-medium">{stat.unit}</div>
              <div className="text-sm text-slate-700 mt-1 font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
