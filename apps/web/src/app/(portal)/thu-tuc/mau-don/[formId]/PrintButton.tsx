'use client'

import { Printer } from 'lucide-react'

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="flex items-center gap-2 px-5 py-2.5 bg-[#8B1A1A] text-white
                 font-semibold text-sm rounded-xl hover:bg-[#6d1414] transition-colors
                 shadow-sm print:hidden"
    >
      <Printer size={16} />
      In / Lưu PDF
    </button>
  )
}
