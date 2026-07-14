'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, AlertCircle, Users, Bell, Map, BarChart3,
  Settings, LogOut, FileText, Shield, ChevronRight,
  Bot, TrendingUp, Heart, ShieldCheck, Home, Database, Sparkles, BellRing,
  UserCog, CalendarDays, Layers, Activity, MessageSquareMore, Zap, ClipboardCheck, ScanLine,
  Inbox as InboxIcon, Megaphone, Building2, BookOpen, X, ClipboardList,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { dangXuat } from '@/lib/auth'
import { useSidebar } from '@/lib/sidebar-store'
import { KHU_PHO } from '@/lib/khu-pho'
import { type CanBo, type VaiTro, VAI_TRO_LABEL, VAI_TRO_COLOR } from '@/lib/auth-config'

// ─── Cấu hình menu ────────────────────────────────────────────

type MenuItem = {
  href:  string
  icon:  React.ElementType
  label: string
  roles?: VaiTro[]  // undefined = tất cả vai trò
}

type MenuGroup = {
  group: string
  roles?: VaiTro[]  // nếu đặt thì lọc cả nhóm
  items: MenuItem[]
}

const ALL_ROLES: VaiTro[] = ['BI_THU', 'TRUONG_KHU_PHO', 'CONG_AN', 'AN_NINH', 'PHU_TRACH_NCT']

const MENU: MenuGroup[] = [
  {
    group: 'Tổng quan',
    items: [
      { href: '/dashboard',         icon: LayoutDashboard, label: 'Dashboard' },
      { href: '/dashboard/bao-cao', icon: BarChart3,       label: 'Báo cáo & KPI' },
    ],
  },
  {
    group: 'Trí tuệ nhân tạo',
    items: [
      { href: '/dashboard/ai',            icon: Bot,        label: 'Trợ lý AI' },
      { href: '/dashboard/ai/phan-tich',  icon: TrendingUp, label: 'AI Phân tích' },
      { href: '/dashboard/ai/rag',        icon: Database,   label: 'Nhúng văn bản RAG', roles: ['BI_THU', 'TRUONG_KHU_PHO'] },
    ],
  },
  {
    group: 'Nghiệp vụ',
    items: [
      {
        href: '/dashboard/workflow',
        icon: Layers, label: 'Workflow AI',
        roles: ['BI_THU', 'TRUONG_KHU_PHO', 'CONG_AN', 'AN_NINH', 'PHU_TRACH_NCT'],
      },
      {
        href: '/dashboard/phan-anh',
        icon: AlertCircle, label: 'Phản ánh',
        roles: ['BI_THU', 'TRUONG_KHU_PHO', 'CONG_AN', 'AN_NINH'],
      },
      {
        href: '/dashboard/dan-cu',
        icon: Users, label: 'Dân cư',
        roles: ['BI_THU', 'TRUONG_KHU_PHO', 'CONG_AN'],
      },
      {
        href: '/dashboard/dan-cu/su-kien-nhanh',
        icon: Zap, label: 'Cập nhật nhanh',
        roles: ['BI_THU', 'TRUONG_KHU_PHO', 'CONG_AN'],
      },
      {
        href: '/dashboard/dan-cu/ho-so-thieu',
        icon: ClipboardCheck, label: 'Hồ sơ thiếu TT',
        roles: ['BI_THU', 'TRUONG_KHU_PHO', 'CONG_AN'],
      },
      {
        href: '/dashboard/dan-cu/quet-cccd',
        icon: ScanLine, label: 'Quét CCCD (AI)',
        roles: ['BI_THU', 'TRUONG_KHU_PHO', 'CONG_AN'],
      },
      {
        href: '/dashboard/dan-cu/phieu-ke-khai',
        icon: ClipboardList, label: 'Phiếu kê khai',
        roles: ['BI_THU', 'TRUONG_KHU_PHO', 'CONG_AN'],
      },
      {
        href: '/dashboard/dan-cu/duyet-cap-nhat',
        icon: InboxIcon, label: 'Duyệt tự khai',
        roles: ['BI_THU', 'TRUONG_KHU_PHO', 'CONG_AN'],
      },
      {
        href: '/dashboard/dan-cu/duyet-ho-moi',
        icon: Building2, label: 'Duyệt hộ mới',
        roles: ['BI_THU', 'TRUONG_KHU_PHO', 'CONG_AN'],
      },
      {
        href: '/dashboard/dan-cu/chien-dich-tu-khai',
        icon: Megaphone, label: 'Chiến dịch tự khai',
        roles: ['BI_THU', 'TRUONG_KHU_PHO'],
      },
      {
        href: '/dashboard/dan-cu/tam-tru-tam-vang',
        icon: UserCog, label: 'Tạm trú / Tạm vắng',
        roles: ['BI_THU', 'TRUONG_KHU_PHO', 'CONG_AN'],
      },
      {
        href: '/dashboard/su-kien',
        icon: CalendarDays, label: 'Sự kiện',
        roles: ['BI_THU', 'TRUONG_KHU_PHO'],
      },
      {
        href: '/dashboard/thong-bao',
        icon: Bell, label: 'Thông báo',
        roles: ['BI_THU', 'TRUONG_KHU_PHO'],
      },
      {
        href: '/dashboard/push',
        icon: BellRing, label: 'Gửi thông báo đẩy',
        roles: ['BI_THU', 'TRUONG_KHU_PHO'],
      },
      {
        href: '/dashboard/zalo',
        icon: MessageSquareMore, label: 'Zalo',
        roles: ['BI_THU', 'TRUONG_KHU_PHO'],
      },
      {
        href: '/dashboard/ban-do',
        icon: Map, label: 'Bản đồ GIS',
        roles: ['BI_THU', 'TRUONG_KHU_PHO', 'CONG_AN', 'AN_NINH'],
      },
    ],
  },
  {
    group: 'An sinh',
    roles: ['BI_THU', 'TRUONG_KHU_PHO', 'PHU_TRACH_NCT'],
    items: [
      { href: '/dashboard/an-sinh',                    icon: Heart,       label: 'Tổng quan'      },
      { href: '/dashboard/an-sinh/bhyt',               icon: ShieldCheck, label: 'Bảo hiểm Y tế'  },
      { href: '/dashboard/an-sinh/ho-ngheo',           icon: Home,        label: 'Hộ nghèo'        },
      { href: '/dashboard/an-sinh/nguoi-cao-tuoi',     icon: Users,       label: 'Người cao tuổi'  },
    ],
  },
  {
    group: 'Hệ thống',
    items: [
      {
        href: '/dashboard/khu-pho',
        icon: Building2, label: 'Quản lý Khu phố',
        roles: ['BI_THU', 'TRUONG_KHU_PHO'],
      },
      {
        href: '/dashboard/huong-dan',
        icon: BookOpen, label: 'Hướng dẫn sử dụng',
      },
      {
        href: '/dashboard/tai-lieu',
        icon: FileText, label: 'Tài liệu',
      },
      {
        href: '/dashboard/tai-lieu/soan-ai',
        icon: Sparkles, label: 'Soạn văn bản AI',
      },
      {
        href: '/dashboard/audit-logs',
        icon: Activity, label: 'Nhật ký hoạt động',
        roles: ['BI_THU', 'TRUONG_KHU_PHO'],
      },
      {
        href: '/dashboard/phan-quyen',
        icon: Shield, label: 'Phân quyền',
        roles: ['BI_THU'],
      },
      {
        href: '/dashboard/setup',
        icon: Settings, label: 'Thiết lập DB',
        roles: ['BI_THU'],
      },
      {
        href: '/dashboard/cai-dat',
        icon: Settings, label: 'Cài đặt',
        roles: ['BI_THU', 'TRUONG_KHU_PHO'],
      },
    ],
  },
]

// ─── Helper: lọc menu theo vai trò ────────────────────────────

function filterMenu(vaiTro: VaiTro | undefined): MenuGroup[] {
  if (!vaiTro) return []

  return MENU
    .filter(group => !group.roles || group.roles.includes(vaiTro))
    .map(group => ({
      ...group,
      items: group.items.filter(item => !item.roles || item.roles.includes(vaiTro)),
    }))
    .filter(group => group.items.length > 0)
}

// ─── Helper: lấy 2 chữ cái đầu ────────────────────────────────

function getInitials(name: string): string {
  return name.split(' ').slice(-2).map(w => w[0]).join('').toUpperCase()
}

// ─── Sidebar Component ────────────────────────────────────────

export default function Sidebar({ canBo }: { canBo: CanBo | null }) {
  const pathname = usePathname()
  const { open, setOpen } = useSidebar()
  const vaiTro = canBo?.vai_tro
  const filteredMenu = filterMenu(vaiTro)

  const initials  = canBo ? getInitials(canBo.ho_ten) : 'CB'
  const tenHienThi = canBo?.ho_ten ?? 'Cán bộ'
  const chucVu     = canBo ? (VAI_TRO_LABEL[canBo.vai_tro] ?? canBo.vai_tro) : KHU_PHO.ten

  // Tự đóng drawer khi chuyển trang (mobile)
  useEffect(() => { setOpen(false) }, [pathname, setOpen])

  return (
    <>
      {/* Backdrop mobile */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          aria-hidden
        />
      )}

      <aside className={cn(
        'w-60 bg-[#1E3A5F] text-white flex flex-col h-screen shrink-0 z-50',
        'fixed inset-y-0 left-0 transition-transform duration-300 lg:sticky lg:top-0 lg:translate-x-0',
        open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>

      {/* ── Logo ─────────────────────────────────────────────── */}
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#8B1A1A] flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-xs">{KHU_PHO.logoChu}</span>
            <span className="text-[#FCD34D] font-bold text-xs">{KHU_PHO.logoSo}</span>
          </div>
          <div className="flex-1">
            <div className="font-bold text-sm text-white leading-tight">{KHU_PHO.ma} Admin</div>
            <div className="text-[10px] text-white/50">Hệ thống điều hành</div>
          </div>
          {/* Nút đóng (mobile) */}
          <button onClick={() => setOpen(false)} className="lg:hidden p-1 text-white/60 hover:text-white">
            <X size={18} />
          </button>
        </div>
      </div>

      {/* ── Nav ──────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
        {filteredMenu.map((group) => (
          <div key={group.group}>
            <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest px-3 mb-1.5">
              {group.group}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                      isActive
                        ? 'bg-white/15 text-white'
                        : 'text-white/60 hover:bg-white/10 hover:text-white'
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <item.icon size={16} />
                      {item.label}
                    </div>
                    {isActive && <ChevronRight size={14} className="text-white/50" />}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ── User + logout ─────────────────────────────────────── */}
      <div className="p-4 border-t border-white/10">

        {/* Thông tin cán bộ */}
        <div className="flex items-center gap-3 mb-3 px-1">
          <div className="w-8 h-8 rounded-full bg-[#8B1A1A] flex items-center justify-center text-xs font-bold shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-white truncate">{tenHienThi}</div>
            <div className="text-[10px] text-white/50 truncate">{chucVu}</div>
          </div>
        </div>

        {/* Badge vai trò */}
        {canBo && (
          <div className="mb-3 px-1">
            <span className={cn(
              'inline-block px-2 py-0.5 rounded-full text-[10px] font-bold',
              VAI_TRO_COLOR[canBo.vai_tro]
            )}>
              {VAI_TRO_LABEL[canBo.vai_tro]}
            </span>
          </div>
        )}

        {/* Đăng xuất */}
        <form action={dangXuat}>
          <button
            type="submit"
            className="flex items-center gap-2 text-white/50 hover:text-white text-sm px-3 py-2 rounded-lg hover:bg-white/10 transition-colors w-full"
          >
            <LogOut size={15} />
            Đăng xuất
          </button>
        </form>
      </div>
      </aside>
    </>
  )
}
