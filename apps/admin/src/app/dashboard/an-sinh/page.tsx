import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Heart, ShieldCheck, Home, Users, TrendingUp, AlertTriangle,
  ChevronRight, CheckCircle2, Clock, Info, Settings,
} from 'lucide-react'
import { layThongKeAnSinh, kiemTraBangAnSinh } from './actions'

export const metadata: Metadata = { title: 'An sinh Xã hội số — KP25' }
export const revalidate = 0

// ── Chính sách hiện hành (tháng 05/2026) ─────────────────────
const CHINH_SACH = [
  {
    title:   'BHYT 2026 — Bắt buộc toàn dân',
    color:   'border-l-emerald-500 bg-emerald-50',
    label:   'Hiệu lực',
    labelCl: 'bg-emerald-100 text-emerald-700',
    items: [
      'Mức đóng: 4,5% lương cơ sở (lương CS 2026: 2.340.000 đ)',
      'Hộ nghèo: Nhà nước đóng 100% — Cận nghèo: hỗ trợ 70%',
      'Từ 80 tuổi không lương hưu: BHYT miễn phí 100%',
      'Trẻ em dưới 6 tuổi: BHYT miễn phí 100%',
      'Tham gia theo hộ gia đình: giảm 10-40% mức đóng',
    ],
  },
  {
    title:   'Chuẩn nghèo đô thị TP.HCM 2026',
    color:   'border-l-amber-500 bg-amber-50',
    label:   'Áp dụng',
    labelCl: 'bg-amber-100 text-amber-700',
    items: [
      'Hộ nghèo:     ≤ 2.000.000 đ/người/tháng',
      'Hộ cận nghèo: 2.000.001 – 3.000.000 đ/người/tháng',
      'Xét duyệt hàng năm (01/01 – 31/12)',
      'Hỗ trợ: BHYT, giáo dục, nhà ở, nước sạch, thông tin',
      'Căn cứ: QĐ 09/2021/QĐ-TTg + cập nhật TP.HCM 2026',
    ],
  },
  {
    title:   'Chế độ Người cao tuổi 2026',
    color:   'border-l-blue-500 bg-blue-50',
    label:   'Áp dụng',
    labelCl: 'bg-blue-100 text-blue-700',
    items: [
      'Từ 60 tuổi: ưu tiên KCB, miễn phí dịch vụ văn hóa công',
      'Từ 80 tuổi: trợ cấp XH ≥ 360.000 đ/tháng (nếu không có lương hưu)',
      'NCT cô đơn, không nơi nương tựa: xem xét vào TTBTXH',
      'BHYT: ≥ 80 tuổi được Nhà nước đóng 100%',
      'Căn cứ: Luật NCT 2009, NĐ 20/2021/NĐ-CP + HCMC 2026',
    ],
  },
]

export default async function AnSinhPage() {
  const [stats, tablesReady] = await Promise.all([
    layThongKeAnSinh(),
    kiemTraBangAnSinh(),
  ])

  return (
    <div className="space-y-6">

      {/* Migration Banner */}
      {!tablesReady && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 rounded-lg shrink-0">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-amber-900">Cần chạy Migration Database</p>
              <p className="text-sm text-amber-700 mt-1">
                Các bảng dữ liệu An sinh chưa được tạo trong Supabase. Module BHYT,
                Hộ nghèo và Người cao tuổi chưa hoạt động. Cần chạy SQL migration một lần.
              </p>
              <Link
                href="/dashboard/setup"
                className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                <Settings size={14} />
                Hướng dẫn chạy Migration
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-[#1E3A5F] flex items-center justify-center shadow-lg">
            <Heart className="text-white" size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">An sinh Xã hội số</h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Quản lý BHYT · Hộ nghèo / cận nghèo · Người cao tuổi — KP25, Phường Long Trường
            </p>
          </div>
        </div>
        <span className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-semibold">
          Quy định 05/2026
        </span>
      </div>

      {/* ── Stat cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            icon:  ShieldCheck,
            label: 'Thẻ BHYT còn hiệu lực',
            value: stats.bhytConHan,
            sub:   `Sắp hết: ${stats.bhytSapHetHan} · Hết hạn: ${stats.bhytHetHan}`,
            color: 'text-emerald-600', bg: 'bg-emerald-50',
            warn:  stats.bhytSapHetHan > 0,
          },
          {
            icon:  TrendingUp,
            label: 'Tỷ lệ bao phủ BHYT',
            value: `${stats.tyLeBHYT}%`,
            sub:   `Tổng hồ sơ: ${stats.tongBHYT} thẻ`,
            color: stats.tyLeBHYT >= 95 ? 'text-emerald-600' : 'text-amber-600',
            bg:    stats.tyLeBHYT >= 95 ? 'bg-emerald-50' : 'bg-amber-50',
            warn:  stats.tyLeBHYT < 95,
          },
          {
            icon:  Home,
            label: 'Hộ nghèo / cận nghèo',
            value: stats.tongHoNgheo,
            sub:   `Nghèo: ${stats.hoNgheo} · Cận nghèo: ${stats.hoCaNgheo}`,
            color: 'text-amber-600', bg: 'bg-amber-50',
            warn:  false,
          },
          {
            icon:  Users,
            label: 'Người cao tuổi',
            value: stats.tongNCT,
            sub:   `Cô đơn: ${stats.nctSongCoDon} · Trợ cấp: ${stats.nctNhanTroCap}`,
            color: 'text-blue-600', bg: 'bg-blue-50',
            warn:  stats.nctCanChamSoc > 0,
          },
        ].map(card => (
          <div key={card.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.bg}`}>
                <card.icon size={18} className={card.color} />
              </div>
              {card.warn && <AlertTriangle size={15} className="text-amber-500" />}
            </div>
            <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
            <div className="text-sm font-medium text-slate-700 mt-0.5">{card.label}</div>
            <div className="text-xs text-slate-400 mt-1">{card.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Sub-module cards ────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            href:  '/dashboard/an-sinh/bhyt',
            icon:  ShieldCheck,
            title: 'Bảo hiểm Y tế',
            desc:  'Tra cứu, cập nhật thẻ BHYT theo đối tượng. Cảnh báo thẻ sắp hết hạn.',
            color: 'bg-emerald-600',
            stats: [
              { label: 'Còn hiệu lực', value: stats.bhytConHan,    color: 'text-emerald-600' },
              { label: 'Sắp hết hạn',  value: stats.bhytSapHetHan, color: 'text-amber-600'   },
              { label: 'Đã hết hạn',   value: stats.bhytHetHan,    color: 'text-red-600'     },
            ],
          },
          {
            href:  '/dashboard/an-sinh/ho-ngheo',
            icon:  Home,
            title: 'Hộ nghèo & Cận nghèo',
            desc:  'Quản lý danh sách hộ nghèo, cận nghèo. Theo dõi xét duyệt và thoát nghèo.',
            color: 'bg-amber-500',
            stats: [
              { label: 'Hộ nghèo',     value: stats.hoNgheo,       color: 'text-red-600'     },
              { label: 'Cận nghèo',    value: stats.hoCaNgheo,     color: 'text-amber-600'   },
              { label: 'Thoát nghèo',  value: stats.hoThoatNgheo,  color: 'text-emerald-600' },
            ],
          },
          {
            href:  '/dashboard/an-sinh/nguoi-cao-tuoi',
            icon:  Users,
            title: 'Người cao tuổi',
            desc:  'Theo dõi sức khỏe, trợ cấp xã hội, người cao tuổi cô đơn cần hỗ trợ.',
            color: 'bg-blue-600',
            stats: [
              { label: 'Tổng NCT',     value: stats.tongNCT,        color: 'text-blue-600'   },
              { label: 'Sống cô đơn',  value: stats.nctSongCoDon,   color: 'text-amber-600'  },
              { label: 'Cần chăm sóc', value: stats.nctCanChamSoc,  color: 'text-red-600'    },
            ],
          },
        ].map(mod => (
          <Link
            key={mod.href}
            href={mod.href}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md hover:border-slate-200 transition-all group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${mod.color}`}>
                <mod.icon size={20} className="text-white" />
              </div>
              <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500 transition-colors mt-1" />
            </div>
            <h3 className="font-bold text-slate-900 mb-1">{mod.title}</h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">{mod.desc}</p>
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-50">
              {mod.stats.map(s => (
                <div key={s.label} className="text-center">
                  <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
                  <div className="text-[10px] text-slate-400 leading-tight">{s.label}</div>
                </div>
              ))}
            </div>
          </Link>
        ))}
      </div>

      {/* ── Chính sách hiện hành ────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Info size={16} className="text-[#1E3A5F]" />
          <h2 className="font-bold text-slate-800">Chính sách hiện hành — Tháng 05/2026</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {CHINH_SACH.map(cs => (
            <div key={cs.title} className={`rounded-2xl border-l-4 p-5 ${cs.color}`}>
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-bold text-slate-800 text-sm leading-tight pr-2">{cs.title}</h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${cs.labelCl}`}>
                  {cs.label}
                </span>
              </div>
              <ul className="space-y-1.5">
                {cs.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                    <CheckCircle2 size={11} className="shrink-0 mt-0.5 text-slate-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ── Cảnh báo ─────────────────────────────────────────── */}
      {(stats.bhytSapHetHan > 0 || stats.nctCanChamSoc > 0 || stats.bhytHetHan > 0) && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={16} className="text-amber-600" />
            <span className="font-semibold text-amber-800 text-sm">Cần xử lý</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {stats.bhytSapHetHan > 0 && (
              <Link href="/dashboard/an-sinh/bhyt?filter=sap_het_han"
                className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-100 px-3 py-1.5 rounded-lg hover:bg-amber-200 transition-colors">
                <Clock size={11} />
                {stats.bhytSapHetHan} thẻ BHYT sắp hết hạn
              </Link>
            )}
            {stats.bhytHetHan > 0 && (
              <Link href="/dashboard/an-sinh/bhyt?filter=het_han"
                className="flex items-center gap-1.5 text-xs text-red-700 bg-red-100 px-3 py-1.5 rounded-lg hover:bg-red-200 transition-colors">
                <AlertTriangle size={11} />
                {stats.bhytHetHan} thẻ BHYT đã hết hạn
              </Link>
            )}
            {stats.nctCanChamSoc > 0 && (
              <Link href="/dashboard/an-sinh/nguoi-cao-tuoi?filter=can_cham_soc"
                className="flex items-center gap-1.5 text-xs text-blue-700 bg-blue-100 px-3 py-1.5 rounded-lg hover:bg-blue-200 transition-colors">
                <Users size={11} />
                {stats.nctCanChamSoc} NCT cần chăm sóc đặc biệt
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
