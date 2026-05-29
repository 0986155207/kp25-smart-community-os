'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Clock, UserCheck, Loader2, CheckCircle2, AlertTriangle,
  XCircle, Sparkles, User2, MapPin, Calendar, Tag,
  ChevronRight, Zap, Timer, BarChart2,
} from 'lucide-react'
import { format, formatDistanceToNow, isPast } from 'date-fns'
import { vi } from 'date-fns/locale'
import toast from 'react-hot-toast'
import {
  phanCongCanBo, tiepNhanWorkflow, hoanThanhWorkflow, aiPhanTichVaTaoWorkflow,
  type WorkflowAssignment, type TrangThaiWorkflow,
} from './actions'

// ─── Config cột Kanban ────────────────────────────────────────
const COLUMNS: Array<{
  key: TrangThaiWorkflow | 'QUA_HAN'
  label: string
  color: string
  bg: string
  border: string
  icon: typeof Clock
}> = [
  { key: 'CHO_PHAN_CONG', label: 'Chờ phân công', color: 'text-amber-700',   bg: 'bg-amber-50',   border: 'border-amber-200', icon: Clock      },
  { key: 'DA_PHAN_CONG',  label: 'Đã phân công',  color: 'text-blue-700',    bg: 'bg-blue-50',    border: 'border-blue-200',  icon: UserCheck  },
  { key: 'DANG_XU_LY',   label: 'Đang xử lý',    color: 'text-violet-700',  bg: 'bg-violet-50',  border: 'border-violet-200',icon: Loader2    },
  { key: 'HOAN_THANH',   label: 'Hoàn thành',     color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: CheckCircle2 },
]

const MUC_DO_CFG: Record<string, { label: string; cls: string; dot: string }> = {
  KHAN_CAP:   { label: 'Khẩn cấp',   cls: 'bg-red-100 text-red-700',    dot: 'bg-red-500'    },
  CAO:        { label: 'Cao',         cls: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' },
  TRUNG_BINH: { label: 'Trung bình', cls: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500'  },
  THAP:       { label: 'Thấp',        cls: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400'  },
}

const LOAI_LABEL: Record<string, string> = {
  AN_NINH: 'An ninh', MOI_TRUONG: 'Môi trường',
  HA_TANG: 'Hạ tầng', AN_SINH: 'An sinh',
  GIAO_THONG: 'Giao thông', KHAC: 'Khác',
}

type CanBo = { id: string; ho_ten: string; vai_tro: string; so_luong_xu_ly: number }

interface Props {
  assignments: WorkflowAssignment[]
  canBos:      CanBo[]
  phanAnhChuaCoWorkflow: Array<{
    id: string; tieu_de: string; loai: string; muc_do: string; created_at: string
  }>
}

// ─── Card phân công ──────────────────────────────────────────
function AssignmentCard({
  item, canBos,
}: {
  item: WorkflowAssignment
  canBos: CanBo[]
}) {
  const [showPhanCong, setShowPhanCong] = useState(false)
  const [showHoanThanh, setShowHoanThanh] = useState(false)
  const [selectedCanBo, setSelectedCanBo] = useState('')
  const [donVi, setDonVi] = useState(item.don_vi_xu_ly ?? item.ai_don_vi_de_xuat ?? '')
  const [ghiChu, setGhiChu] = useState('')
  const [ketQua, setKetQua] = useState('')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const mucDo  = item.phan_anh?.muc_do ?? item.ai_muc_do ?? 'TRUNG_BINH'
  const mdCfg  = MUC_DO_CFG[mucDo] ?? MUC_DO_CFG['TRUNG_BINH']!
  const loai   = item.phan_anh?.loai ?? item.ai_loai ?? 'KHAC'
  const isQuaHan = item.han_xu_ly ? isPast(new Date(item.han_xu_ly)) && item.trang_thai !== 'HOAN_THANH' : false

  function handlePhanCong() {
    if (!selectedCanBo) { toast.error('Chọn cán bộ phụ trách'); return }
    startTransition(async () => {
      const res = await phanCongCanBo(item.id, selectedCanBo, donVi, ghiChu)
      if (res.success) {
        toast.success(res.message)
        setShowPhanCong(false)
        router.refresh()
      } else {
        toast.error(res.message)
      }
    })
  }

  function handleTiepNhan() {
    startTransition(async () => {
      const res = await tiepNhanWorkflow(item.id)
      if (res.success) { toast.success(res.message); router.refresh() }
      else              toast.error(res.message)
    })
  }

  function handleHoanThanh() {
    if (!ketQua.trim()) { toast.error('Nhập kết quả xử lý'); return }
    startTransition(async () => {
      const res = await hoanThanhWorkflow(item.id, ketQua)
      if (res.success) {
        toast.success(res.message)
        setShowHoanThanh(false)
        router.refresh()
      } else {
        toast.error(res.message)
      }
    })
  }

  return (
    <div className={`bg-white rounded-xl border shadow-sm hover:shadow-md transition-shadow ${isQuaHan ? 'border-red-300 ring-1 ring-red-200' : 'border-slate-200'}`}>
      {/* Header card */}
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${mdCfg.cls}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${mdCfg.dot}`} />
              {mdCfg.label}
            </span>
            <span className="text-[10px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
              {LOAI_LABEL[loai] ?? loai}
            </span>
            {isQuaHan && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                <AlertTriangle size={9} /> Quá hạn
              </span>
            )}
          </div>
          <span className="text-[10px] text-slate-300 font-mono shrink-0">
            #{item.id.slice(0, 6).toUpperCase()}
          </span>
        </div>

        <Link
          href={`/dashboard/workflow/${item.id}`}
          className="text-sm font-semibold text-slate-800 hover:text-[#1E3A5F] line-clamp-2 leading-snug transition-colors"
        >
          {item.phan_anh?.tieu_de ?? '—'}
        </Link>

        {item.ai_tom_tat && (
          <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
            <Sparkles size={10} className="inline text-violet-400 mr-1" />
            {item.ai_tom_tat}
          </p>
        )}
      </div>

      {/* Meta */}
      <div className="px-4 pb-3 space-y-1.5">
        {item.phan_anh?.dia_chi_phan_anh && (
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <MapPin size={11} className="shrink-0" />
            <span className="line-clamp-1">{item.phan_anh.dia_chi_phan_anh}</span>
          </div>
        )}
        {item.can_bo && (
          <div className="flex items-center gap-1.5 text-xs text-blue-600">
            <User2 size={11} className="shrink-0" />
            <span className="font-medium">{item.can_bo.ho_ten}</span>
          </div>
        )}
        {item.han_xu_ly && (
          <div className={`flex items-center gap-1.5 text-xs ${isQuaHan ? 'text-red-500 font-semibold' : 'text-slate-400'}`}>
            <Timer size={11} className="shrink-0" />
            {isQuaHan
              ? `Quá hạn ${formatDistanceToNow(new Date(item.han_xu_ly), { locale: vi, addSuffix: false })}`
              : `Hạn: ${format(new Date(item.han_xu_ly), 'dd/MM HH:mm')}`
            }
          </div>
        )}
        {item.ai_tags && item.ai_tags.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap">
            <Tag size={10} className="text-slate-300 shrink-0" />
            {item.ai_tags.slice(0, 3).map(t => (
              <span key={t} className="text-[10px] bg-slate-50 text-slate-500 px-1.5 py-0.5 rounded border border-slate-100">
                {t}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Điểm ưu tiên AI */}
      <div className="px-4 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                item.ai_diem_uu_tien >= 80 ? 'bg-red-500' :
                item.ai_diem_uu_tien >= 60 ? 'bg-orange-400' :
                item.ai_diem_uu_tien >= 40 ? 'bg-amber-400' : 'bg-slate-300'
              }`}
              style={{ width: `${item.ai_diem_uu_tien}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-400 font-mono shrink-0">
            AI {item.ai_diem_uu_tien}/100
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="border-t border-slate-50 px-4 py-3 flex flex-wrap gap-2">
        {item.trang_thai === 'CHO_PHAN_CONG' && (
          <button
            onClick={() => setShowPhanCong(s => !s)}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            <UserCheck size={12} /> Phân công
          </button>
        )}
        {item.trang_thai === 'DA_PHAN_CONG' && (
          <button
            onClick={handleTiepNhan}
            disabled={isPending}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-violet-600 text-white font-semibold rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-50"
          >
            {isPending ? <Loader2 size={12} className="animate-spin" /> : <Zap size={12} />}
            Tiếp nhận
          </button>
        )}
        {item.trang_thai === 'DANG_XU_LY' && (
          <button
            onClick={() => setShowHoanThanh(s => !s)}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <CheckCircle2 size={12} /> Hoàn thành
          </button>
        )}
        <Link
          href={`/dashboard/workflow/${item.id}`}
          className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 transition-colors ml-auto"
        >
          Chi tiết <ChevronRight size={11} />
        </Link>
      </div>

      {/* Panel phân công */}
      {showPhanCong && (
        <div className="border-t border-blue-100 bg-blue-50/50 px-4 py-4 space-y-3">
          <p className="text-xs font-semibold text-blue-800">Phân công xử lý</p>
          <select
            value={selectedCanBo}
            onChange={e => setSelectedCanBo(e.target.value)}
            className="w-full text-xs border border-blue-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
          >
            <option value="">— Chọn cán bộ —</option>
            {canBos.map(cb => (
              <option key={cb.id} value={cb.id}>
                {cb.ho_ten} ({cb.so_luong_xu_ly} việc đang xử lý)
              </option>
            ))}
          </select>
          <input
            value={donVi}
            onChange={e => setDonVi(e.target.value)}
            placeholder="Đơn vị phụ trách"
            className="w-full text-xs border border-blue-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
          <textarea
            value={ghiChu}
            onChange={e => setGhiChu(e.target.value)}
            placeholder="Ghi chú phân công (tuỳ chọn)"
            rows={2}
            className="w-full text-xs border border-blue-200 rounded-lg px-3 py-2 bg-white focus:outline-none resize-none focus:ring-1 focus:ring-blue-400"
          />
          <div className="flex gap-2">
            <button
              onClick={handlePhanCong}
              disabled={isPending || !selectedCanBo}
              className="flex items-center gap-1.5 text-xs px-3 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 flex-1 justify-center"
            >
              {isPending ? <Loader2 size={11} className="animate-spin" /> : <UserCheck size={11} />}
              Xác nhận phân công
            </button>
            <button
              onClick={() => setShowPhanCong(false)}
              className="text-xs px-3 py-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-100"
            >
              Huỷ
            </button>
          </div>
        </div>
      )}

      {/* Panel hoàn thành */}
      {showHoanThanh && (
        <div className="border-t border-emerald-100 bg-emerald-50/50 px-4 py-4 space-y-3">
          <p className="text-xs font-semibold text-emerald-800">Ghi nhận kết quả</p>
          <textarea
            value={ketQua}
            onChange={e => setKetQua(e.target.value)}
            placeholder="Mô tả kết quả, biện pháp đã thực hiện..."
            rows={3}
            className="w-full text-xs border border-emerald-200 rounded-lg px-3 py-2 bg-white focus:outline-none resize-none focus:ring-1 focus:ring-emerald-400"
          />
          <div className="flex gap-2">
            <button
              onClick={handleHoanThanh}
              disabled={isPending || !ketQua.trim()}
              className="flex items-center gap-1.5 text-xs px-3 py-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex-1 justify-center"
            >
              {isPending ? <Loader2 size={11} className="animate-spin" /> : <CheckCircle2 size={11} />}
              Xác nhận hoàn thành
            </button>
            <button
              onClick={() => setShowHoanThanh(false)}
              className="text-xs px-3 py-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-100"
            >
              Huỷ
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Phản ánh chưa có workflow ───────────────────────────────
function PhanAnhPendingCard({
  pa,
}: {
  pa: Props['phanAnhChuaCoWorkflow'][0]
}) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleTaoWorkflow() {
    startTransition(async () => {
      toast.loading('AI đang phân tích...', { id: 'ai-' + pa.id })
      const res = await aiPhanTichVaTaoWorkflow(pa.id)
      toast.dismiss('ai-' + pa.id)
      if (res.success) {
        toast.success('AI đã phân tích và tạo workflow')
        router.refresh()
      } else {
        toast.error(res.message ?? 'Lỗi tạo workflow')
      }
    })
  }

  const mdCfg = MUC_DO_CFG[pa.muc_do] ?? MUC_DO_CFG['TRUNG_BINH']!

  return (
    <div className="bg-white border border-dashed border-slate-200 rounded-xl p-4 hover:border-violet-300 transition-colors">
      <div className="flex items-center gap-1.5 mb-2">
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${mdCfg.cls}`}>
          {mdCfg.label}
        </span>
        <span className="text-[10px] text-slate-400">
          {LOAI_LABEL[pa.loai] ?? pa.loai}
        </span>
      </div>
      <p className="text-sm font-medium text-slate-700 line-clamp-2 mb-3">{pa.tieu_de}</p>
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-slate-400">
          <Calendar size={10} className="inline mr-1" />
          {format(new Date(pa.created_at), 'dd/MM HH:mm')}
        </span>
        <button
          onClick={handleTaoWorkflow}
          disabled={isPending}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-violet-600 text-white font-semibold rounded-lg hover:bg-violet-700 disabled:opacity-50 transition-colors"
        >
          {isPending ? <Loader2 size={11} className="animate-spin" /> : <Sparkles size={11} />}
          AI phân tích
        </button>
      </div>
    </div>
  )
}

// ─── Main Board ───────────────────────────────────────────────
export default function WorkflowBoard({ assignments, canBos, phanAnhChuaCoWorkflow }: Props) {
  const [filter, setFilter] = useState<'ALL' | TrangThaiWorkflow>('ALL')

  const filtered = filter === 'ALL'
    ? assignments
    : assignments.filter(a => a.trang_thai === filter)

  const grouped: Record<string, WorkflowAssignment[]> = {}
  COLUMNS.forEach(c => {
    grouped[c.key] = filtered.filter(a => {
      if (c.key === 'QUA_HAN') return false
      return a.trang_thai === c.key
    })
  })

  // Thêm quá hạn vào cột tương ứng với badge đặc biệt
  const quaHanIds = new Set(
    assignments
      .filter(a => a.han_xu_ly && isPast(new Date(a.han_xu_ly)) && a.trang_thai !== 'HOAN_THANH')
      .map(a => a.id)
  )

  return (
    <div className="space-y-5">
      {/* Filter bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setFilter('ALL')}
          className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors border ${filter === 'ALL' ? 'bg-[#1E3A5F] text-white border-[#1E3A5F]' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
        >
          Tất cả ({assignments.length})
        </button>
        {COLUMNS.map(col => {
          const count = grouped[col.key]?.length ?? 0
          const isActive = filter === col.key
          return (
            <button
              key={col.key}
              onClick={() => setFilter(filter === col.key ? 'ALL' : col.key as TrangThaiWorkflow)}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors border ${
                isActive
                  ? `${col.bg} ${col.color} ${col.border}`
                  : 'border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              <col.icon size={11} />
              {col.label} ({count})
            </button>
          )
        })}
        {quaHanIds.size > 0 && (
          <span className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg font-semibold bg-red-50 text-red-700 border border-red-200">
            <AlertTriangle size={11} /> Quá hạn ({quaHanIds.size})
          </span>
        )}
      </div>

      {/* Phản ánh chờ AI phân tích */}
      {phanAnhChuaCoWorkflow.length > 0 && (
        <div className="bg-violet-50 border border-violet-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={15} className="text-violet-600" />
            <h3 className="text-sm font-bold text-violet-800">
              Phản ánh chờ AI phân tích ({phanAnhChuaCoWorkflow.length})
            </h3>
            <span className="text-xs text-violet-500">— Chưa có workflow, click để AI phân tích tự động</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {phanAnhChuaCoWorkflow.map(pa => (
              <PhanAnhPendingCard key={pa.id} pa={pa} />
            ))}
          </div>
        </div>
      )}

      {/* Kanban board */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {COLUMNS.map(col => {
          const cards = grouped[col.key] ?? []
          return (
            <div key={col.key} className={`rounded-2xl ${col.bg} border ${col.border} p-4`}>
              {/* Column header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <col.icon size={14} className={col.color} />
                  <span className={`text-sm font-bold ${col.color}`}>{col.label}</span>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${col.bg} ${col.color} border ${col.border}`}>
                  {cards.length}
                </span>
              </div>

              {/* Cards */}
              <div className="space-y-3">
                {cards.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-400">
                    <BarChart2 size={24} className="mx-auto mb-2 opacity-30" />
                    Không có
                  </div>
                ) : (
                  cards.map(item => (
                    <AssignmentCard
                      key={item.id}
                      item={item}
                      canBos={canBos}
                    />
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>

      {assignments.length === 0 && phanAnhChuaCoWorkflow.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <CheckCircle2 size={40} className="mx-auto mb-3 opacity-20" />
          <p className="font-semibold">Không có workflow nào</p>
          <p className="text-sm mt-1">Khi có phản ánh mới, AI sẽ tự động phân tích và tạo workflow</p>
        </div>
      )}
    </div>
  )
}
