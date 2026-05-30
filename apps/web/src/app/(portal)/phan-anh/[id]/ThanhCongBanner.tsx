'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { CheckCircle2, X, Share2, Bell } from 'lucide-react'

interface Props {
  phanAnhId:  string
  shortCode:  string
}

export default function ThanhCongBanner({ phanAnhId, shortCode }: Props) {
  const [visible, setVisible] = useState(true)
  const [copied,  setCopied]  = useState(false)

  // Tự động ẩn sau 15 giây
  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 15_000)
    return () => clearTimeout(t)
  }, [])

  async function copyLink() {
    await navigator.clipboard.writeText(window.location.href.split('?')[0]!)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!visible) return null

  return (
    <div className="mb-6 bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-2xl p-5 relative">
      {/* Nút đóng */}
      <button
        onClick={() => setVisible(false)}
        className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/80 flex items-center justify-center
                   text-slate-400 hover:text-slate-600 hover:bg-white transition-all"
      >
        <X size={14} />
      </button>

      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center shrink-0">
          <CheckCircle2 size={24} className="text-emerald-600" />
        </div>
        <div className="flex-1 min-w-0 pr-6">
          <h3 className="font-bold text-emerald-800 text-base">
            Gửi phản ánh thành công!
          </h3>
          <p className="text-sm text-emerald-700 mt-0.5 leading-relaxed">
            Phản ánh của bạn đã được ghi nhận. Cán bộ sẽ xem xét và phản hồi sớm nhất.
          </p>

          {/* Mã phản ánh */}
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2 bg-white border border-emerald-200 rounded-xl px-3 py-2">
              <span className="text-xs text-slate-500">Mã phản ánh:</span>
              <span className="font-mono font-bold text-slate-800 text-sm tracking-wider">{shortCode}</span>
            </div>
            <button
              onClick={copyLink}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700
                         text-white text-xs font-semibold rounded-xl transition-colors"
            >
              <Share2 size={12} />
              {copied ? 'Đã sao chép!' : 'Sao chép link'}
            </button>
          </div>

          {/* Hướng dẫn theo dõi */}
          <div className="mt-3 flex items-start gap-2 p-3 bg-white/70 rounded-xl border border-emerald-100">
            <Bell size={13} className="text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-600 leading-relaxed">
              <strong>Lưu trang này</strong> để theo dõi tiến độ xử lý, hoặc{' '}
              <Link href="/phan-anh/theo-doi" className="text-emerald-700 font-semibold hover:underline">
                tra cứu bằng số điện thoại
              </Link>{' '}
              của bạn bất kỳ lúc nào.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
