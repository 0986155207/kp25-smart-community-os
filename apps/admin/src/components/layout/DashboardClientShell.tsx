'use client'

/**
 * DashboardClientShell — wrapper 'use client' chứa các component
 * browser-only (ForegroundToast, RealtimeNotifier).
 *
 * Dùng dynamic() với ssr: false bên trong 'use client' là hợp lệ.
 * KHÔNG đặt dynamic(ssr:false) trực tiếp trong Server Component.
 */

import dynamic from 'next/dynamic'

const ForegroundToast = dynamic(
  () => import('@/components/push/ForegroundToast'),
  { ssr: false }
)

const RealtimeNotifier = dynamic(
  () => import('@/components/realtime/RealtimeNotifier'),
  { ssr: false }
)

export default function DashboardClientShell() {
  return (
    <>
      {/* Toast thông báo foreground FCM */}
      <ForegroundToast />

      {/* Realtime: lắng nghe INSERT/UPDATE từ Supabase, hiện toast + router.refresh() */}
      <RealtimeNotifier />
    </>
  )
}
