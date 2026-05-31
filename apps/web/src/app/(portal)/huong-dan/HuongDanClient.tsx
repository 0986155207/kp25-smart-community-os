'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, Search, ArrowRight, Lightbulb, X } from 'lucide-react'
import { GUIDE_SECTIONS, type GuideSection } from './guide-data'

export default function HuongDanClient() {
  const [q, setQ]           = useState('')
  const [openId, setOpenId] = useState<string | null>(GUIDE_SECTIONS[0]?.id ?? null)

  const filtered = q.trim()
    ? GUIDE_SECTIONS.filter(s =>
        (s.title + s.desc + s.steps.map(st => st.title + st.detail).join(' '))
          .toLowerCase().includes(q.trim().toLowerCase()))
    : GUIDE_SECTIONS

  return (
    <div>
      {/* Tìm kiếm */}
      <div className="relative mb-6">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Tìm trong hướng dẫn... (vd: phản ánh, tạm trú, QR)"
          className="w-full pl-12 pr-10 py-3.5 rounded-2xl border-2 border-slate-200 focus:border-[#8B1A1A] focus:outline-none focus:ring-4 focus:ring-[#8B1A1A]/10 text-sm transition-all"
        />
        {q && (
          <button onClick={() => setQ('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Mục lục nhanh */}
      {!q && (
        <div className="flex flex-wrap gap-2 mb-6">
          {GUIDE_SECTIONS.map(s => (
            <button
              key={s.id}
              onClick={() => { setOpenId(s.id); document.getElementById(`gd-${s.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium hover:bg-slate-200 transition-colors"
            >
              <span>{s.icon}</span> {s.title}
            </button>
          ))}
        </div>
      )}

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
          <p className="text-center text-slate-400 py-10 text-sm">Không tìm thấy hướng dẫn phù hợp với &quot;{q}&quot;</p>
        )}
      </div>
    </div>
  )
}

function SectionCard({ section, open, onToggle }: { section: GuideSection; open: boolean; onToggle: () => void }) {
  return (
    <div id={`gd-${section.id}`} className={`rounded-2xl border bg-white transition-all scroll-mt-24 ${open ? 'border-[#8B1A1A]/30 shadow-sm' : 'border-slate-200'}`}>
      <button onClick={onToggle} className="w-full flex items-center gap-3 p-4 text-left">
        <div className="w-11 h-11 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 text-xl">
          {section.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-slate-800 text-sm">{section.title}</h3>
          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{section.desc}</p>
        </div>
        <ChevronDown size={18} className={`text-slate-400 transition-transform shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="px-4 pb-5 border-t border-slate-100 pt-4">
          <p className="text-sm text-slate-600 leading-relaxed mb-4">{section.desc}</p>

          {/* Các bước */}
          <ol className="space-y-3 mb-4">
            {section.steps.map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-[#8B1A1A] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{step.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{step.detail}</p>
                </div>
              </li>
            ))}
          </ol>

          {/* Mẹo */}
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

          {/* Link tới tính năng */}
          {section.href && (
            <Link
              href={section.href}
              className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 bg-[#8B1A1A] text-white text-xs font-semibold rounded-xl hover:bg-[#6d1414] transition-colors"
            >
              Dùng tính năng này <ArrowRight size={13} />
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
