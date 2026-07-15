import { KHU_PHO } from '@/lib/khu-pho'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Layers, Sparkles, User2, MapPin, Clock,
  Calendar, Tag, Timer, CheckCircle2, AlertTriangle,
  Building2, Phone, ExternalLink, Shield,
} from 'lucide-react'
import { format, formatDistanceToNow, isPast } from 'date-fns'
import { vi } from 'date-fns/locale'
import { createClient } from '@/lib/supabase/server'
import { layChiTietWorkflow } from '../actions'

export const metadata: Metadata = { title: `Chi tiết Workflow — ${KHU_PHO.ma} Admin` }

const TRANG_THAI_CFG: Record<string, { label: string; badge: string; dot: string }> = {
  CHO_PHAN_CONG: { label: 'Chờ phân công', badge: 'bg-amber-100 text-amber-700 border border-amber-200',  dot: 'bg-amber-400' },
  DA_PHAN_CONG:  { label: 'Đã phân công',  badge: 'bg-blue-100 text-blue-700 border border-blue-200',     dot: 'bg-blue-500'  },
  DANG_XU_LY:   { label: 'Đang xử lý',    badge: 'bg-violet-100 text-violet-700 border border-violet-200', dot: 'bg-violet-500' },
  HOAN_THANH:   { label: 'Hoàn thành',    badge: 'bg-emerald-100 text-emerald-700 border border-emerald-200', dot: 'bg-emerald-500' },
  QUA_HAN:      { label: 'Quá hạn',       badge: 'bg-red-100 text-red-700 border border-red-200',         dot: 'bg-red-500'   },
  HUY:          { label: 'Đã huỷ',        badge: 'bg-slate-100 text-slate-500 border border-slate-200',   dot: 'bg-slate-400' },
}

const MUC_DO_CFG: Record<string, { label: string; cls: string }> = {
  KHAN_CAP:   { label: 'Khẩn cấp',   cls: 'bg-red-100 text-red-700'    },
  CAO:        { label: 'Cao',         cls: 'bg-orange-100 text-orange-700' },
  TRUNG_BINH: { label: 'Trung bình', cls: 'bg-amber-100 text-amber-700' },
  THAP:       { label: 'Thấp',        cls: 'bg-slate-100 text-slate-600' },
}

const LOAI_LABEL: Record<string, string> = {
  AN_NINH: 'An ninh', MOI_TRUONG: 'Môi trường',
  HA_TANG: 'Hạ tầng', AN_SINH: 'An sinh',
  GIAO_THONG: 'Giao thông', KHAC: 'Khác',
}

const HANH_DONG_LABEL: Record<string, string> = {
  PHAN_CONG:   'Phân công cán bộ',
  TIEP_NHAN:   'Cán bộ tiếp nhận',
  CAP_NHAT:    'Cập nhật thông tin',
  HOAN_THANH:  'Hoàn thành xử lý',
  QUA_HAN:     'Ghi nhận quá hạn',
  HUY:         'Huỷ workflow',
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide block mb-0.5">{label}</span>
      <div className="text-sm text-slate-700">{value}</div>
    </div>
  )
}

interface Props {
  params: Promise<{ id: string }>
}

export default async function ChiTietWorkflowPage({ params }: Props) {
  const { id } = await params
  const record = await layChiTietWorkflow(id)
  if (!record) notFound()

  // Lịch sử thay đổi
  const supabase = await createClient()
  const { data: lichSu } = await supabase
    .from('workflow_lich_su')
    .select('*, nguoi:nguoi_thuc_hien_id(ho_ten)')
    .eq('assignment_id', id)
    .order('created_at', { ascending: false })

  const ttCfg  = TRANG_THAI_CFG[record.trang_thai] ?? TRANG_THAI_CFG['CHO_PHAN_CONG']!
  const loai   = record.phan_anh?.loai ?? record.ai_loai ?? 'KHAC'
  const mucDo  = record.phan_anh?.muc_do ?? record.ai_muc_do ?? 'TRUNG_BINH'
  const mdCfg  = MUC_DO_CFG[mucDo] ?? MUC_DO_CFG['TRUNG_BINH']!
  const isQuaHan = record.han_xu_ly ? isPast(new Date(record.han_xu_ly)) && record.trang_thai !== 'HOAN_THANH' : false

  const fmt = (d: string | null) =>
    d ? format(new Date(d), 'dd/MM/yyyy HH:mm') : '—'

  return (
    <div className="max-w-4xl mx-auto space-y-5">

      {/* Breadcrumb */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/workflow"
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
        >
          <ArrowLeft size={18} />
        </Link>
        <div className="flex items-center gap-2">
          <Layers size={18} className="text-violet-600" />
          <h1 className="text-lg font-bold text-slate-900">Chi tiết Workflow</h1>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ttCfg.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${ttCfg.dot} inline-block mr-1.5 ${record.trang_thai === 'DANG_XU_LY' ? 'animate-pulse' : ''}`} />
            {ttCfg.label}
          </span>
          {isQuaHan && (
            <span className="text-xs font-bold px-2 py-1 rounded-full bg-red-100 text-red-700 border border-red-200">
              <AlertTriangle size={10} className="inline mr-1" /> Quá hạn
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* ── Cột chính ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Phản ánh gốc */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
              <MapPin size={15} className="text-blue-600" />
              <h2 className="font-bold text-slate-700 text-sm">Phản ánh gốc</h2>
              <Link
                href={`/dashboard/phan-anh/${record.phan_anh_id}`}
                className="ml-auto flex items-center gap-1 text-xs text-blue-600 hover:underline"
              >
                <ExternalLink size={11} /> Xem đầy đủ
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3">
              <div className="col-span-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide block mb-0.5">Tiêu đề</span>
                <p className="text-sm font-semibold text-slate-800">{record.phan_anh?.tieu_de ?? '—'}</p>
              </div>
              <div className="col-span-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide block mb-0.5">Mô tả</span>
                <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">
                  {record.phan_anh?.mo_ta ?? '—'}
                </p>
              </div>
              <Row label="Loại"      value={<span className="text-slate-700">{LOAI_LABEL[loai] ?? loai}</span>} />
              <Row label="Mức độ"    value={<span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${mdCfg.cls}`}>{mdCfg.label}</span>} />
              <Row label="Địa chỉ"   value={record.phan_anh?.dia_chi_phan_anh ?? '—'} />
              <Row label="Ngày gửi"  value={fmt(record.phan_anh?.created_at ?? null)} />
              {record.phan_anh?.nguoi_gui_ten && (
                <Row label="Người gửi" value={
                  <div className="flex items-center gap-2">
                    <span>{record.phan_anh.nguoi_gui_ten}</span>
                    {record.phan_anh.nguoi_gui_sdt && (
                      <a href={`tel:${record.phan_anh.nguoi_gui_sdt}`} className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
                        <Phone size={11} /> {record.phan_anh.nguoi_gui_sdt}
                      </a>
                    )}
                  </div>
                } />
              )}
            </div>
          </div>

          {/* AI Phân tích */}
          {record.ai_analyzed_at && (
            <div className="bg-gradient-to-br from-violet-50 to-slate-50 rounded-2xl border border-violet-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-violet-100">
                <Sparkles size={15} className="text-violet-600" />
                <h2 className="font-bold text-violet-700 text-sm">Kết quả AI phân tích</h2>
                <span className="ml-auto text-[10px] text-violet-400">
                  {fmt(record.ai_analyzed_at)}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                {record.ai_tom_tat && (
                  <div className="col-span-2">
                    <span className="text-xs font-semibold text-violet-400 uppercase tracking-wide block mb-1">Tóm tắt AI</span>
                    <p className="text-sm text-slate-700 bg-white/70 rounded-lg px-3 py-2 border border-violet-100 leading-relaxed">
                      {record.ai_tom_tat}
                    </p>
                  </div>
                )}
                {record.ai_huong_xu_ly && (
                  <div className="col-span-2">
                    <span className="text-xs font-semibold text-violet-400 uppercase tracking-wide block mb-1">Hướng xử lý đề xuất</span>
                    <p className="text-sm text-slate-700 bg-white/70 rounded-lg px-3 py-2 border border-violet-100 whitespace-pre-wrap leading-relaxed">
                      {record.ai_huong_xu_ly}
                    </p>
                  </div>
                )}
                <Row label="Loại (AI)" value={LOAI_LABEL[record.ai_loai ?? ''] ?? record.ai_loai ?? '—'} />
                <Row label="Mức độ (AI)" value={MUC_DO_CFG[record.ai_muc_do ?? '']?.label ?? record.ai_muc_do ?? '—'} />
                <Row label="Đơn vị đề xuất" value={record.ai_don_vi_de_xuat ?? '—'} />
                <Row label="Điểm ưu tiên" value={
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${record.ai_diem_uu_tien >= 80 ? 'bg-red-500' : record.ai_diem_uu_tien >= 60 ? 'bg-orange-400' : 'bg-amber-400'}`}
                        style={{ width: `${record.ai_diem_uu_tien}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono text-slate-500">{record.ai_diem_uu_tien}/100</span>
                  </div>
                } />
                {record.ai_tags && record.ai_tags.length > 0 && (
                  <div className="col-span-2">
                    <span className="text-xs font-semibold text-violet-400 uppercase tracking-wide block mb-1">Nhãn AI</span>
                    <div className="flex flex-wrap gap-1.5">
                      {record.ai_tags.map(t => (
                        <span key={t} className="inline-flex items-center gap-1 text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">
                          <Tag size={9} />{t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Kết quả xử lý */}
          {record.ket_qua_xu_ly && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 size={15} className="text-emerald-600" />
                <h2 className="font-bold text-emerald-700 text-sm">Kết quả xử lý</h2>
                {record.hoan_thanh_luc && (
                  <span className="ml-auto text-xs text-emerald-500">{fmt(record.hoan_thanh_luc)}</span>
                )}
              </div>
              <p className="text-sm text-emerald-800 whitespace-pre-wrap leading-relaxed">
                {record.ket_qua_xu_ly}
              </p>
            </div>
          )}

          {/* Lịch sử */}
          {(lichSu?.length ?? 0) > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h2 className="font-bold text-slate-700 text-sm mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                <Clock size={15} className="text-blue-600" />
                Lịch sử thay đổi
              </h2>
              <div className="space-y-3">
                {lichSu?.map((ls) => {
                  const ttNew = TRANG_THAI_CFG[ls.trang_thai_moi]
                  return (
                    <div key={ls.id} className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${ttNew?.dot ?? 'bg-slate-400'}`} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-semibold text-slate-700">
                            {HANH_DONG_LABEL[ls.hanh_dong] ?? ls.hanh_dong}
                          </span>
                          <span className="text-xs text-slate-400">
                            {format(new Date(ls.created_at), 'dd/MM HH:mm')}
                          </span>
                        </div>
                        {(ls as { nguoi?: { ho_ten: string } | null }).nguoi?.ho_ten && (
                          <p className="text-xs text-slate-400">
                            Bởi: {(ls as { nguoi?: { ho_ten: string } | null }).nguoi?.ho_ten}
                          </p>
                        )}
                        {ls.ghi_chu && (
                          <p className="text-xs text-slate-500 mt-0.5">{ls.ghi_chu}</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-5">

          {/* Thông tin phân công */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="font-bold text-slate-700 text-sm mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Building2 size={14} className="text-blue-600" />
              Thông tin phân công
            </h3>
            <div className="space-y-3">
              <Row label="Trạng thái" value={
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${ttCfg.badge}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${ttCfg.dot}`} />
                  {ttCfg.label}
                </span>
              } />
              <Row label="Đơn vị phụ trách" value={record.don_vi_xu_ly ?? record.ai_don_vi_de_xuat ?? '—'} />
              {record.can_bo && (
                <Row label="Cán bộ xử lý" value={
                  <div className="flex items-center gap-1.5">
                    <User2 size={13} className="text-blue-500" />
                    <span className="font-semibold">{record.can_bo.ho_ten}</span>
                  </div>
                } />
              )}
              <Row label="Phân công lúc" value={fmt(record.phan_cong_luc)} />
              {record.ghi_chu_phan_cong && (
                <Row label="Ghi chú" value={<span className="text-slate-600 italic">{record.ghi_chu_phan_cong}</span>} />
              )}
            </div>
          </div>

          {/* SLA */}
          <div className={`rounded-2xl border shadow-sm p-5 ${isQuaHan ? 'bg-red-50 border-red-200' : 'bg-white border-slate-100'}`}>
            <h3 className={`font-bold text-sm mb-4 pb-2 border-b flex items-center gap-2 ${isQuaHan ? 'text-red-700 border-red-200' : 'text-slate-700 border-slate-100'}`}>
              <Timer size={14} className={isQuaHan ? 'text-red-500' : 'text-amber-500'} />
              Thời hạn SLA
            </h3>
            <div className="space-y-3">
              <Row label="SLA cho phép" value={`${record.sla_gio} giờ`} />
              <Row label="Hạn xử lý" value={
                <div>
                  <p className={`font-semibold ${isQuaHan ? 'text-red-600' : 'text-slate-700'}`}>
                    {record.han_xu_ly ? format(new Date(record.han_xu_ly), 'dd/MM/yyyy HH:mm') : '—'}
                  </p>
                  {record.han_xu_ly && (
                    <p className={`text-xs mt-0.5 ${isQuaHan ? 'text-red-500 font-semibold' : 'text-slate-400'}`}>
                      {isQuaHan
                        ? `Quá hạn ${formatDistanceToNow(new Date(record.han_xu_ly), { locale: vi })}`
                        : `Còn ${formatDistanceToNow(new Date(record.han_xu_ly), { locale: vi })}`
                      }
                    </p>
                  )}
                </div>
              } />
              {record.hoan_thanh_luc && (
                <Row label="Hoàn thành lúc" value={fmt(record.hoan_thanh_luc)} />
              )}
            </div>
          </div>

          {/* Metadata */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="font-bold text-slate-700 text-sm mb-3 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Calendar size={14} className="text-slate-400" />
              Thông tin hệ thống
            </h3>
            <div className="space-y-2 text-xs text-slate-500">
              <div className="flex justify-between">
                <span>Mã workflow</span>
                <span className="font-mono text-slate-400">{record.id.slice(0, 8).toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span>Tạo lúc</span>
                <span>{fmt(record.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span>Phân tích AI</span>
                <span>{record.ai_analyzed_at ? fmt(record.ai_analyzed_at) : 'Chưa phân tích'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
