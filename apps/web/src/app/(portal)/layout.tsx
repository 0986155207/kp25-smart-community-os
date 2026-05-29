// Tất cả portal pages cần auth context → không cho phép SSG
export const dynamic = 'force-dynamic'

import Navbar from '@/components/layout/Navbar'
import BottomNav from '@/components/layout/BottomNav'
import Footer from '@/components/layout/Footer'
import PushPermissionBanner from '@/components/push/PushPermissionBanner'
import ForegroundToast from '@/components/push/ForegroundToast'

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />

      {/* Banner xin quyền push (client, tự ẩn sau khi đăng ký) */}
      <PushPermissionBanner />

      {/* padding-bottom trên mobile để tránh bị bottom nav che */}
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      <Footer />

      {/* Bottom navigation — chỉ hiện trên mobile */}
      <BottomNav />

      {/* Toast foreground notification */}
      <ForegroundToast />
    </div>
  )
}
