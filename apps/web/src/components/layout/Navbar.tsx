'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell, MessageSquare, Home, AlertCircle, Map, Phone, Users, FileText, CalendarDays, ClipboardList, MessageSquareMore, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

const menu = [
  { href: '/',          label: 'Trang chủ', icon: Home              },
  { href: '/thong-bao', label: 'Thông báo', icon: Bell              },
  { href: '/su-kien',   label: 'Sự kiện',   icon: CalendarDays      },
  { href: '/phan-anh',  label: 'Phản ánh',  icon: AlertCircle       },
  { href: '/thu-tuc',   label: 'Thủ tục',   icon: ClipboardList     },
  { href: '/tra-cuu',   label: 'Tra cứu',   icon: Search            },
  { href: '/zalo',      label: 'Zalo KP25', icon: MessageSquareMore },
  { href: '/dang-ky',   label: 'Đăng ký',   icon: FileText          },
  { href: '/dan-cu',    label: 'Dân cư',    icon: Users             },
  { href: '/ban-do',    label: 'Bản đồ',    icon: Map               },
  { href: '/lien-he',   label: 'Liên hệ',   icon: Phone             },
]

export default function Navbar() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-primary-gradient flex items-center justify-center shadow-primary">
              <span className="text-white font-bold text-sm">KP</span>
              <span className="text-[#FCD34D] font-bold text-sm">25</span>
            </div>
            <div className="hidden sm:block">
              <div className="font-bold text-[#8B1A1A] leading-tight text-sm">KP25 Smart Community</div>
              <div className="text-xs text-slate-500">Khu phố 25 · Long Trường · TP.HCM</div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {menu.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-[#8B1A1A]/10 text-[#8B1A1A]'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  )}
                >
                  <item.icon size={15} />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Right actions — desktop only */}
          <div className="flex items-center gap-2">
            <Link
              href="/chat"
              className="hidden md:flex btn-primary py-2 px-4 text-sm min-h-0"
            >
              <MessageSquare size={15} />
              Hỏi AI
            </Link>
            <Link
              href="/phan-anh/tao"
              className="hidden md:flex btn-outline py-2 px-4 text-sm min-h-0"
            >
              <AlertCircle size={15} />
              Phản ánh
            </Link>

            {/* Mobile: chỉ hiện nút AI nhỏ gọn — BottomNav đảm nhận phần còn lại */}
            <Link
              href="/chat"
              className="md:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl
                         bg-[#8B1A1A] text-white text-sm font-semibold min-h-0"
              aria-label="Hỏi AI"
            >
              <MessageSquare size={16} />
              <span>Hỏi AI</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
