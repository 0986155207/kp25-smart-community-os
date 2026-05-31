'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, Search, ArrowRight, Lightbulb, X } from 'lucide-react'
import { GUIDE_SECTIONS, NHOM_LIST, type GuideSection } from './guide-data'

export default function HuongDanClient() {
  const [q, setQ]       = useState('')
  const [nhom, setNhom] = useState<string>('Tất cả')
  const [openId, setOpenId] = useState<string | null>(null)

  const filtered = GUIDE_SECTIONS.filter(s => {
    const matchNhom = nhom === 'Tất cả' || s.nhom === nhom
    const matchQ = !q.trim() || (s.title + s.desc + s.steps.map(st => st.title + st.detail).join(' '))
      .toLowerCase().includes(q.trim().toLowerCase())
    return matchNhom && matchQ
  })

  return (
    <div>
      {/* Tìm kiếm */}
      <div className="relative mb-4">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Tìm trong hướng dẫn... (vd: quét CCCD, duyệt, SMS, phân quyền)"
          className="w-full pl-12 pr-10 py-3 rounded-xl border-2 border-slate-200 focus:border-[#1E3A5F] focus:outline-none focus:ring-4 focus:ring-[#1E3A5F]/10 text-sm transition-all"
        />
        {q && (
          <button onClick={() => setQ('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Lọc theo nhóm */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(['Tất cả', ...NHOM_LIST] as string[]).map(n => (
          <button
            key={n}
            onClick={() => setNhom(n)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              nhom === n ? 'bg-[#1E3A5F] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {n}
          </button>
        ))}
      </div>

      {/* Các phần */}
      <div className="space-y-3">
        {filtered.map(section => (
          <SectionCard
            key={section.id}
            section={section}
            open={openId === section.id}
            onToggle={() => setOpenId(openId === section.id ? null : section.id)}
          />
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-slate-400 py-10 text-sm">Không tìm thấy hướng dẫn phù hợp.</p>
        )}
      </div>
    </div>
  )
}

function SectionCard({ section, open, onToggle }: { section: GuideSection; open: boolean; onToggle: () => void }) {
  return (
    <div className={`rounded-2xl border bg-white transition-all ${open ? 'border-[#1E3A5F]/30 shadow-sm' : 'border-slate-200'}`}>
      <button onClick={onToggle} className="w-full flex items-center gap-3 p-4 text-left">
        <div className="w-11 h-11 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 text-xl">
          {section.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-slate-800 text-sm">{section.title}</h3>
            <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded-full font-medium">{section.nhom}</span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{section.desc}</p>
        </div>
        <ChevronDown size={18} className={`text-slate-400 transition-transform shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="px-4 pb-5 border-t border-slate-100 pt-4">
          <p className="text-sm text-slate-600 leading-relaxed mb-4">{section.desc}</p>

          <ol className="space-y-3 mb-4">
            {section.steps.map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-[#1E3A5F] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{step.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{step.detail}</p>
                </div>
              </li>
            ))}
          </ol>

          {section.tips && section.tips.length > 0 && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 space-y-1.5">
              {section.tips.map((tip, i) => (
                <div key={i} className="flex items-start gap-2">
                  <Lightbulb size={13} className="text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700 leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          )}

          {section.href && (
            <Link
              href={section.href}
              className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 bg-[#1E3A5F] text-white text-xs font-semibold rounded-xl hover:bg-[#162d4a] transition-colors"
            >
              Mở tính năng <ArrowRight size={13} />
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
