import { KHU_PHO } from '@/lib/khu-pho'
import { Settings } from 'lucide-react'
import SetupClient from './SetupClient'
import SetupRBACSection from './SetupRBACSection'

export const metadata = { title: `Thiết lập hệ thống — ${KHU_PHO.ma} Admin` }

export default function SetupPage() {
  return (
    <div className="p-6 space-y-8">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gray-100 rounded-lg">
          <Settings className="h-5 w-5 text-gray-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Thiết lập hệ thống</h1>
          <p className="text-sm text-gray-500">Database migration & cấu hình</p>
        </div>
      </div>

      {/* RBAC — Migration 011 */}
      <SetupRBACSection />

      {/* An sinh — Migration 007–010 */}
      <SetupClient />
    </div>
  )
}
