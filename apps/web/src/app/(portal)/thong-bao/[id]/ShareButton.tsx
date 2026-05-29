'use client'

import { useState } from 'react'
import { Share2, Check, Copy } from 'lucide-react'

export default function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    const url = window.location.href

    // Dùng Web Share API nếu có (mobile)
    if (navigator.share) {
      try {
        await navigator.share({ title, url })
        return
      } catch {
        // Fallback sang copy
      }
    }

    // Copy URL
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore
    }
  }

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-all"
    >
      {copied ? (
        <>
          <Check size={14} className="text-green-500" />
          <span className="text-green-600">Đã sao chép</span>
        </>
      ) : (
        <>
          <Share2 size={14} />
          Chia sẻ
        </>
      )}
    </button>
  )
}
