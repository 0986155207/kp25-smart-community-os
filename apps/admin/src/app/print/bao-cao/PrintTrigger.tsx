'use client'

import { useEffect } from 'react'

export default function PrintTrigger() {
  useEffect(() => {
    const btn = document.getElementById('print-btn')
    if (btn) {
      btn.style.display = 'flex'
      btn.onclick = () => window.print()
    }
    const params = new URLSearchParams(window.location.search)
    if (params.get('print') === '1') {
      const t = setTimeout(() => window.print(), 900)
      return () => clearTimeout(t)
    }
    return undefined
  }, [])

  return null
}
