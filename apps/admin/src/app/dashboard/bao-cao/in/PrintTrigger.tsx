'use client'

import { useEffect } from 'react'

// Kích hoạt nút in + auto-print khi mở trang trực tiếp với ?print=1
export default function PrintTrigger() {
  useEffect(() => {
    // Hiện nút in
    const btn = document.getElementById('print-btn')
    if (btn) {
      btn.style.display = 'block'
      btn.onclick = () => window.print()
    }

    // Auto-print nếu có ?print=1 trong URL
    const params = new URLSearchParams(window.location.search)
    if (params.get('print') === '1') {
      const t = setTimeout(() => window.print(), 800)
      return () => clearTimeout(t)
    }
    return undefined
  }, [])

  return null
}
