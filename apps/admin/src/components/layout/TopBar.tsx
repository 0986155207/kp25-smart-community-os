'use client'

import { Bell, Menu } from 'lucide-react'
import type { CanBo } from '@/lib/auth-config'
import GlobalSearch from '@/components/search/GlobalSearch'
import { useSidebar } from '@/lib/sidebar-store'

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(-2)
    .map(w => w[0])
    .join('')
    .toUpperCase()
}

export default function TopBar({ canBo }: { canBo: CanBo | null }) {
  const initials = canBo ? getInitials(canBo.ho_ten) : 'CB'
  const { toggle } = useSidebar()

  return (
    <header className="h-14 bg-white border-b border-slate-100 flex items-center justify-between px-4 sm:px-6 shrink-0">
      {/* Hamburger (mobile) + Search */}
      <div className="flex items-center gap-2 flex-1 max-w-lg">
        <button
          onClick={toggle}
          className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors shrink-0"
          aria-label="Mở menu"
        >
          <Menu size={20} />
        </button>
        <GlobalSearch />
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        <button className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors">
          <Bell size={18} className="text-slate-600" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#8B1A1A]" />
        </button>
        <div
          className="w-8 h-8 rounded-full bg-[#8B1A1A] flex items-center justify-center text-xs font-bold text-white cursor-default"
          title={canBo?.ho_ten}
        >
          {initials}
        </div>
      </div>
    </header>
  )
}
