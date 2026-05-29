import Sidebar from '@/components/layout/Sidebar'
import TopBar from '@/components/layout/TopBar'
import PushPermissionBanner from '@/components/push/PushPermissionBanner'
import DashboardClientShell from '@/components/layout/DashboardClientShell'
import { layCanBoHienTai } from '@/lib/auth'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const canBo = await layCanBoHienTai()

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar canBo={canBo} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar canBo={canBo} />

        {/* Push permission banner (client, tự ẩn nếu đã đăng ký) */}
        <PushPermissionBanner />

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>

      {/* ForegroundToast + RealtimeNotifier — browser-only, lazy-loaded ở client */}
      <DashboardClientShell />
    </div>
  )
}
