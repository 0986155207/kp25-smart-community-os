import { KHU_PHO } from '@/lib/khu-pho'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import {
  Layers, Sparkles, Clock, UserCheck,
  CheckCircle2, AlertTriangle, Loader2, TrendingUp,
} from 'lucide-react'
import {
  layDanhSachWorkflow, layDanhSachCanBo, layThongKeWorkflow,
} from './actions'
import WorkflowBoard from './WorkflowBoard'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: `Workflow AI — ${KHU_PHO.ma} Admin` }

// ─── Stats card ───────────────────────────────────────────────
function StatCard({
  label, value, icon: Icon, color, bg,
}: {
  label: string; value: number; icon: typeof Clock; color: string; bg: string
}) {
  return (
    <div className={`rounded-2xl border p-4 flex items-center gap-4 ${bg}`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color} bg-white/60`}>
        <Icon size={20} />
      </div>
      <div>
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
        <p className="text-xs text-slate-500 font-medium">{label}</p>
      </div>
    </div>
  )
}

export default async function WorkflowPage() {
  const supabase = await createClient()

  const [assignments, canBos, thongKe] = await Promise.all([
    layDanhSachWorkflow(),
    layDanhSachCanBo(),
    layThongKeWorkflow(),
  ])

  // Lấy phản ánh MOI chưa có workflow
  const existingPhanAnhIds = new Set(assignments.map(a => a.phan_anh_id))

  const { data: phanAnhMoi } = await supabase
    .from('phan_anh')
    .select('id, tieu_de, loai, muc_do, created_at')
    .eq('trang_thai', 'MOI')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(30)

  const phanAnhChuaCoWorkflow = (phanAnhMoi ?? [])
    .filter(pa => !existingPhanAnhIds.has(pa.id))

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-[#1E3A5F] flex items-center justify-center">
              <Layers size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Workflow AI</h1>
              <p className="text-sm text-slate-500">Tự động phân loại · Phân công · Theo dõi SLA</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400 bg-violet-50 border border-violet-200 px-3 py-2 rounded-xl">
          <Sparkles size={13} className="text-violet-500" />
          <span>AI tự động phân tích khi có phản ánh mới</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label="Chờ phân công" value={thongKe.choPhanCong} icon={Clock}        color="text-amber-700"   bg="bg-amber-50 border-amber-200"      />
        <StatCard label="Đã phân công"  value={thongKe.daPhanCong}  icon={UserCheck}    color="text-blue-700"    bg="bg-blue-50 border-blue-200"        />
        <StatCard label="Đang xử lý"    value={thongKe.dangXuLy}    icon={Loader2}      color="text-violet-700"  bg="bg-violet-50 border-violet-200"    />
        <StatCard label="Hoàn thành"    value={thongKe.hoanThanh}   icon={CheckCircle2} color="text-emerald-700" bg="bg-emerald-50 border-emerald-200"  />
        <StatCard label="Quá hạn"       value={thongKe.quaHan}      icon={AlertTriangle} color="text-red-700"    bg="bg-red-50 border-red-200"          />
        <StatCard label="Hôm nay"       value={thongKe.tongHom_nay} icon={TrendingUp}   color="text-slate-700"   bg="bg-slate-50 border-slate-200"      />
      </div>

      {/* Kanban Board */}
      <WorkflowBoard
        assignments={assignments}
        canBos={canBos}
        phanAnhChuaCoWorkflow={phanAnhChuaCoWorkflow}
      />

    </div>
  )
}
