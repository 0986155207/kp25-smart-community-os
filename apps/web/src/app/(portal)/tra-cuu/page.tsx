'use client'

import { KHU_PHO } from '@/lib/khu-pho'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Search, FileText, UserCheck, UserMinus, ChevronRight,
  ClipboardList, MessageSquare, ArrowRight, MapPin,
} from 'lucide-react'

// ─── Danh sách loại tra cứu ──────────────────────────────────
const DANH_MUC = [
  {
    id:     'ho-so-hanh-chinh',
    icon:   FileText,
    color:  'bg-[#8B1A1A]',
    light:  'bg-red-50 border-red-100',
    title:  'Hồ sơ hành chính',
    desc:   'Kiểm tra trạng thái hồ sơ thủ tục hành chính đã nộp',
    href:   '/thu-tuc/tra-cuu',
    tags:   ['Mã hồ sơ', 'Số CCCD', 'Chứng minh thư'],
  },
  {
    id:     'tam-tru-tam-vang',
    icon:   UserCheck,
    color:  'bg-blue-600',
    light:  'bg-blue-50 border-blue-100',
    title:  'Tạm trú · Tạm vắng',
    desc:   'Tra cứu tình trạng hồ sơ đăng ký tạm trú, khai báo tạm vắng',
    href:   '/dang-ky/tra-cuu',
    tags:   ['Số CCCD', 'Hồ sơ tạm trú', 'Khai báo tạm vắng'],
  },
  {
    id:     'phan-anh',
    icon:   MapPin,
    color:  'bg-amber-600',
    light:  'bg-amber-50 border-amber-100',
    title:  'Theo dõi phản ánh',
    desc:   'Tra cứu trạng thái xử lý phản ánh hiện trường đã gửi bằng số điện thoại',
    href:   '/phan-anh/theo-doi',
    tags:   ['Số điện thoại', 'Trạng thái realtime', 'Tiến độ xử lý'],
  },
]

// ─── Component ───────────────────────────────────────────────
export default function TraCuuPage() {
  const router  = useRouter()
  const [query, setQuery] = useState('')

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const q = query.trim()
    if (!q) return
    // Nếu dạng CCCD (9-12 số) → tra cứu tổng hợp tạm trú
    if (/^\d{9,12}$/.test(q)) {
      router.push(`/dang-ky/tra-cuu?cccd=${q}`)
    } else {
      // Dạng mã hồ sơ → tra cứu thủ tục
      router.push(`/thu-tuc/tra-cuu?ma=${q.toUpperCase()}`)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-2xl bg-[#8B1A1A]/10 flex items-center justify-center mx-auto">
          <Search size={28} className="text-[#8B1A1A]" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Tra cứu thông tin</h1>
        <p className="text-slate-500 text-sm leading-relaxed">
          Tra cứu hồ sơ hành chính, tạm trú, tạm vắng và phản ánh<br />
          tại {KHU_PHO.ten} · Phường Long Trường · TP.HCM
        </p>
      </div>

      {/* ── Tìm kiếm nhanh ──────────────────────────────────── */}
      <form onSubmit={handleSearch} className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={`Nhập mã hồ sơ (${KHU_PHO.ma}-2026-...) hoặc số CCCD...`}
          className="w-full pl-12 pr-32 py-4 rounded-2xl border-2 border-slate-200
                     focus:border-[#8B1A1A] focus:outline-none focus:ring-4 focus:ring-[#8B1A1A]/10
                     text-slate-800 placeholder:text-slate-400 text-sm bg-white shadow-sm
                     transition-all font-mono"
        />
        <button
          type="submit"
          disabled={!query.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2.5 bg-[#8B1A1A]
                     text-white font-bold text-sm rounded-xl hover:bg-[#6d1414]
                     disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          Tra cứu
        </button>
      </form>

      {/* ── Danh mục tra cứu ────────────────────────────────── */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Chọn loại tra cứu</h2>

        {DANH_MUC.map(dm => {
          const Icon = dm.icon
          return (
            <Link
              key={dm.id}
              href={dm.href}
              className={`flex items-center gap-4 p-4 rounded-2xl border ${dm.light}
                         hover:shadow-md transition-all group`}
            >
              <div className={`w-12 h-12 rounded-xl ${dm.color} flex items-center justify-center shrink-0`}>
                <Icon size={22} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-800 text-sm group-hover:text-[#8B1A1A] transition-colors">
                  {dm.title}
                </p>
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{dm.desc}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {dm.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 bg-white/80 text-slate-600 text-[10px] font-medium rounded-full border border-slate-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <ChevronRight size={18} className="text-slate-400 group-hover:text-[#8B1A1A] shrink-0 transition-colors" />
            </Link>
          )
        })}
      </div>

      {/* ── Trợ giúp thêm ──────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Đăng ký mới */}
        <Link
          href="/dang-ky"
          className="flex items-start gap-3 p-4 bg-white border border-slate-200 rounded-2xl
                     hover:border-slate-300 hover:shadow-sm transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
            <UserMinus size={18} className="text-slate-600" />
          </div>
          <div>
            <p className="font-semibold text-slate-800 text-sm group-hover:text-[#8B1A1A] transition-colors">
              Đăng ký / Khai báo
            </p>
            <p className="text-xs text-slate-500 mt-0.5">Tạm trú, tạm vắng mới</p>
          </div>
        </Link>

        {/* Hỏi AI */}
        <Link
          href="/chat?q=Tôi muốn tra cứu thông tin hồ sơ"
          className="flex items-start gap-3 p-4 bg-gradient-to-br from-[#8B1A1A] to-[#1E3A5F]
                     rounded-2xl hover:opacity-95 transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
            <MessageSquare size={18} className="text-white" />
          </div>
          <div>
            <p className="font-semibold text-white text-sm">Hỏi AI Trợ lý</p>
            <p className="text-xs text-white/70 mt-0.5">Hỗ trợ tra cứu 24/7</p>
          </div>
        </Link>
      </div>

      {/* ── Liên hệ trực tiếp ──────────────────────────────── */}
      <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
        <ArrowRight size={16} className="text-slate-400 shrink-0" />
        <p className="text-sm text-slate-600">
          Cần hỗ trợ? Gọi{' '}
          <a href="tel:02837461111" className="font-bold text-[#8B1A1A] hover:underline">
            028 3746 1111
          </a>
          {' '}(giờ hành chính) hoặc đến{' '}
          <Link href="/lien-he" className="font-medium text-slate-700 hover:text-[#8B1A1A] hover:underline transition-colors">
            trụ sở {KHU_PHO.ten}
          </Link>
        </p>
      </div>

    </div>
  )
}
