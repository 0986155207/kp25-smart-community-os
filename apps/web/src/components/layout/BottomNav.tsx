'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Bell, AlertCircle, MessageSquare, Grid3X3 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { KHU_PHO } from '@/lib/khu-pho'

// ─── Menu đầy đủ (khi nhấn "Thêm") ──────────────────────────
import { Map, Users, FileText, Phone, QrCode, X, CalendarDays, ClipboardList, MessageSquareMore, Search, BookOpen } from 'lucide-react'

const EXTRA_MENU = [
  { href: '/su-kien',   icon: CalendarDays,       label: 'Sự kiện'   },
  { href: '/thu-tuc',   icon: ClipboardList,      label: 'Thủ tục'   },
  { href: '/tra-cuu',   icon: Search,             label: 'Tra cứu'   },
  { href: '/ban-do',    icon: Map,                label: 'Bản đồ'    },
  { href: '/dan-cu',    icon: Users,              label: 'Dân cư'    },
  { href: '/dang-ky',   icon: FileText,           label: 'Đăng ký'   },
  { href: '/zalo',      icon: MessageSquareMore,  label: `Zalo ${KHU_PHO.ma}` },
  { href: '/huong-dan', icon: BookOpen,           label: 'Hướng dẫn' },
  { href: '/lien-he',   icon: Phone,              label: 'Liên hệ'   },
  { href: '/qr',        icon: QrCode,             label: 'QR Hộ dân' },
]

export default function BottomNav() {
  const pathname  = usePathname()
  const [open, setOpen] = useState(false)

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <>
      {/* ── Overlay extra menu ────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black/40 z-40 md:hidden"
            />

            {/* Sheet từ dưới lên */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed bottom-[64px] left-0 right-0 z-50 md:hidden
                         bg-white rounded-t-3xl shadow-2xl border-t border-slate-100 px-6 py-5"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-slate-900">Tính năng khác</h3>
                <button
                  onClick={() => setOpen(false)}
                  className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center"
                >
                  <X size={18} className="text-slate-600" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-4 pb-2">
                {EXTRA_MENU.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex flex-col items-center gap-2.5 py-4 rounded-2xl
                               bg-slate-50 active:bg-slate-100 transition-colors"
                  >
                    <item.icon size={26} className="text-[#1E3A5F]" />
                    <span className="text-sm font-semibold text-slate-700">{item.label}</span>
                  </Link>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Bottom Navigation Bar ────────────────────────── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-30
                   bg-white border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="grid grid-cols-5 h-16">

          {/* Trang chủ */}
          <Link href="/" className={cn(
            'flex flex-col items-center justify-center gap-1 transition-colors active:bg-slate-50',
            isActive('/') ? 'text-[#8B1A1A]' : 'text-slate-500'
          )}>
            <Home size={22} strokeWidth={isActive('/') ? 2.5 : 1.8} />
            <span className="text-[11px] font-semibold">Trang chủ</span>
          </Link>

          {/* Thông báo */}
          <Link href="/thong-bao" className={cn(
            'flex flex-col items-center justify-center gap-1 transition-colors active:bg-slate-50',
            isActive('/thong-bao') ? 'text-[#8B1A1A]' : 'text-slate-500'
          )}>
            <Bell size={22} strokeWidth={isActive('/thong-bao') ? 2.5 : 1.8} />
            <span className="text-[11px] font-semibold">Thông báo</span>
          </Link>

          {/* Phản ánh — nút trung tâm nổi bật */}
          <Link
            href="/phan-anh/tao"
            className="flex flex-col items-center justify-center -mt-5 relative"
          >
            <div className="w-14 h-14 rounded-full bg-[#8B1A1A] flex items-center justify-center
                            shadow-lg shadow-red-900/30 active:scale-95 transition-transform">
              <AlertCircle size={26} className="text-white" strokeWidth={2} />
            </div>
            <span className="text-[11px] font-semibold text-[#8B1A1A] mt-1">Phản ánh</span>
          </Link>

          {/* Hỏi AI */}
          <Link href="/chat" className={cn(
            'flex flex-col items-center justify-center gap-1 transition-colors active:bg-slate-50',
            isActive('/chat') ? 'text-[#8B1A1A]' : 'text-slate-500'
          )}>
            <MessageSquare size={22} strokeWidth={isActive('/chat') ? 2.5 : 1.8} />
            <span className="text-[11px] font-semibold">Hỏi AI</span>
          </Link>

          {/* Thêm */}
          <button
            onClick={() => setOpen(v => !v)}
            className={cn(
              'flex flex-col items-center justify-center gap-1 transition-colors active:bg-slate-50 w-full',
              open ? 'text-[#8B1A1A]' : 'text-slate-500'
            )}
          >
            <Grid3X3 size={22} strokeWidth={open ? 2.5 : 1.8} />
            <span className="text-[11px] font-semibold">Thêm</span>
          </button>

        </div>
      </nav>
    </>
  )
}
