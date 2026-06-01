import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Search, FileText, ChevronRight, Clock, Banknote,
  Wifi, CheckCircle2, Star, ArrowRight, Info,
} from 'lucide-react'
import {
  DS_THU_TUC, LINH_VUC_CONFIG, MUC_DO_CONFIG,
  type LinhVuc, type ThuTuc,
} from './data'

export const metadata: Metadata = {
  title: 'Thủ tục hành chính',
  description:
    'Tra cứu và nộp hồ sơ thủ tục hành chính trực tuyến tại Phường Long Trường – TP.HCM. Cập nhật theo quy định mới nhất 2026.',
}

// ─── Tabs lĩnh vực ──────────────────────────────────────────
const TABS: { value: LinhVuc | 'TAT_CA'; label: string; icon: string }[] = [
  { value: 'TAT_CA',    label: 'Tất cả',             icon: '📂' },
  { value: 'HO_TICH',   label: 'Hộ tịch',            icon: '📋' },
  { value: 'CU_TRU',    label: 'Cư trú',              icon: '🏠' },
  { value: 'CHUNG_THUC',label: 'Chứng thực',          icon: '✅' },
  { value: 'AN_SINH',   label: 'An sinh XH',          icon: '🤝' },
  { value: 'Y_TE',      label: 'Y tế – BHYT',         icon: '🏥' },
  { value: 'GIAO_DUC',  label: 'Giáo dục',            icon: '🎓' },
  { value: 'TU_PHAP',   label: 'Tư pháp',             icon: '⚖️'  },
  { value: 'XAY_DUNG',  label: 'Đất đai',             icon: '🏗️'  },
  { value: 'KINH_DOANH',label: 'Kinh doanh',          icon: '🏪' },
]

// ─── Card từng thủ tục ───────────────────────────────────────
function ThuTucCard({ tt }: { tt: ThuTuc }) {
  const lv  = LINH_VUC_CONFIG[tt.linhVuc]
  const md  = MUC_DO_CONFIG[tt.mucDoTrucTuyen]

  return (
    <Link
      href={`/thu-tuc/${tt.id}`}
      className="group relative flex flex-col bg-white rounded-2xl border border-slate-100
                 hover:border-slate-300 shadow-sm hover:shadow-md transition-all duration-200 p-5"
    >
      {/* Góc nổi bật */}
      {tt.noiBat && (
        <span className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-bold
                         bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full border border-amber-200">
          <Star size={9} fill="currentColor" /> Phổ biến
        </span>
      )}

      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        {/* Icon lĩnh vực */}
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center text-lg shrink-0"
          style={{ backgroundColor: lv.bg }}
        >
          {lv.icon}
        </div>

        <div className="flex-1 min-w-0">
          {/* Mã số + Lĩnh vực */}
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-[10px] font-mono text-slate-400">{tt.maSo}</span>
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{ color: lv.color, backgroundColor: lv.bg }}
            >
              {lv.label}
            </span>
          </div>

          {/* Tên thủ tục */}
          <h3 className="font-bold text-slate-900 text-sm leading-snug group-hover:text-[#8B1A1A] transition-colors line-clamp-2">
            {tt.ten}
          </h3>
        </div>
      </div>

      {/* Mô tả */}
      <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-4 flex-1">
        {tt.moTa}
      </p>

      {/* Thông tin nhanh */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="flex items-center gap-1.5 text-xs text-slate-600">
          <Clock size={12} className="text-slate-400 shrink-0" />
          <span className="truncate">{(tt.thoiHanGiaiQuyet.split('(')[0] ?? tt.thoiHanGiaiQuyet).trim()}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-600">
          <Banknote size={12} className="text-slate-400 shrink-0" />
          <span className="truncate">{tt.lePhi === 'Không thu' ? 'Miễn phí' : tt.lePhi.split(';')[0]}</span>
        </div>
      </div>

      {/* Footer: Mức độ DVC + CTA */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-50">
        <span
          className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-lg"
          style={{ color: md.color, backgroundColor: md.bg }}
        >
          <Wifi size={10} />
          {md.label} — {md.moTa}
        </span>
        <span className="text-[#8B1A1A] group-hover:translate-x-0.5 transition-transform">
          <ChevronRight size={16} />
        </span>
      </div>
    </Link>
  )
}

// ─── Thống kê nhanh ──────────────────────────────────────────
function StatsBar() {
  const tongSo    = DS_THU_TUC.length
  const trucTuyen = DS_THU_TUC.filter(t => t.mucDoTrucTuyen >= 3).length
  const mienPhi   = DS_THU_TUC.filter(t => t.lePhi === 'Không thu').length

  return (
    <div className="grid grid-cols-3 gap-3 mb-8">
      {[
        { value: tongSo,    label: 'Thủ tục',           icon: FileText,     color: 'text-[#8B1A1A]', bg: 'bg-red-50'  },
        { value: trucTuyen, label: 'Nộp trực tuyến',    icon: Wifi,         color: 'text-blue-700',  bg: 'bg-blue-50' },
        { value: mienPhi,   label: 'Miễn phí',          icon: CheckCircle2, color: 'text-green-700', bg: 'bg-green-50'},
      ].map((s) => (
        <div key={s.label} className={`${s.bg} rounded-2xl p-4 flex items-center gap-3`}>
          <s.icon size={22} className={s.color} />
          <div>
            <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-600">{s.label}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────
interface Props {
  searchParams: Promise<{ linh_vuc?: string; q?: string }>
}

export default async function ThuTucPage({ searchParams }: Props) {
  const params   = await searchParams
  const linhVucParam = (params.linh_vuc ?? 'TAT_CA') as LinhVuc | 'TAT_CA'
  const queryParam   = params.q ?? ''

  // Lọc thủ tục
  let filtered = linhVucParam === 'TAT_CA'
    ? DS_THU_TUC
    : DS_THU_TUC.filter(t => t.linhVuc === linhVucParam)

  if (queryParam) {
    const q = queryParam.toLowerCase()
    filtered = filtered.filter(t =>
      t.ten.toLowerCase().includes(q) ||
      t.moTa.toLowerCase().includes(q) ||
      (t.tags ?? []).some(tag => tag.includes(q))
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">

      {/* ── Hero ──────────────────────────────────────────── */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-cyan-50 text-cyan-700
                        rounded-full text-xs font-semibold">
          <FileText size={13} />
          Cập nhật theo quy định 05/2026
        </div>
        <h1 className="text-3xl font-bold text-slate-900">
          Thủ tục hành chính
        </h1>
        <p className="text-slate-500 max-w-2xl mx-auto text-base leading-relaxed">
          Phường Long Trường, TP.HCM — Tra cứu, tải mẫu đơn và nộp hồ sơ trực tuyến 24/7.
          Không xếp hàng, không phiền hà.
        </p>
      </div>

      {/* ── Thanh tìm kiếm ────────────────────────────────── */}
      <form method="GET" className="relative max-w-2xl mx-auto">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          type="text"
          name="q"
          defaultValue={queryParam}
          placeholder="Tìm kiếm: khai sinh, kết hôn, xây nhà, hộ nghèo..."
          className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 border-slate-200 focus:border-[#8B1A1A]
                     focus:outline-none text-slate-800 placeholder:text-slate-400 text-sm bg-white shadow-sm"
        />
        {params.linh_vuc && (
          <input type="hidden" name="linh_vuc" value={params.linh_vuc} />
        )}
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-[#8B1A1A] text-white
                     text-sm font-semibold rounded-xl hover:bg-[#6d1414] transition-colors"
        >
          Tìm
        </button>
      </form>

      {/* ── Thống kê ──────────────────────────────────────── */}
      <StatsBar />

      {/* ── Tabs lĩnh vực ─────────────────────────────────── */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
        {TABS.map((tab) => {
          const isActive = linhVucParam === tab.value
          const count    = tab.value === 'TAT_CA'
            ? DS_THU_TUC.length
            : DS_THU_TUC.filter(t => t.linhVuc === tab.value).length

          return (
            <Link
              key={tab.value}
              href={`/thu-tuc?linh_vuc=${tab.value}${queryParam ? `&q=${queryParam}` : ''}`}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold
                          whitespace-nowrap shrink-0 border-2 transition-all duration-200
                          ${isActive
                            ? 'bg-[#8B1A1A] text-white border-[#8B1A1A] shadow-sm'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                          }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold
                               ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                {count}
              </span>
            </Link>
          )
        })}
      </div>

      {/* ── Kết quả ───────────────────────────────────────── */}
      <div>
        {/* Header kết quả */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {queryParam
                ? `Kết quả tìm kiếm "${queryParam}"`
                : linhVucParam === 'TAT_CA'
                  ? 'Tất cả thủ tục'
                  : LINH_VUC_CONFIG[linhVucParam as LinhVuc].label}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {filtered.length} thủ tục
              {filtered.length > 0 && ` · ${filtered.filter(t => t.mucDoTrucTuyen >= 3).length} nộp được trực tuyến`}
            </p>
          </div>

          {/* Tra cứu hồ sơ */}
          <Link
            href="/thu-tuc/tra-cuu"
            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200
                       hover:border-slate-300 text-slate-700 font-semibold text-sm rounded-xl transition-all"
          >
            <Search size={14} />
            Tra cứu hồ sơ đã nộp
          </Link>
        </div>

        {/* Grid thủ tục */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(tt => (
              <ThuTucCard key={tt.id} tt={tt} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">
              Không tìm thấy thủ tục
            </h3>
            <p className="text-slate-500 mb-6">
              Thử tìm kiếm với từ khóa khác hoặc chọn lĩnh vực khác
            </p>
            <Link
              href="/thu-tuc"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#8B1A1A] text-white
                         font-semibold text-sm rounded-xl hover:bg-[#6d1414] transition-colors"
            >
              Xem tất cả thủ tục
            </Link>
          </div>
        )}
      </div>

      {/* ── Tra cứu hồ sơ (mobile) ────────────────────────── */}
      <div className="sm:hidden">
        <Link
          href="/thu-tuc/tra-cuu"
          className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200
                     rounded-2xl hover:border-slate-300 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center">
              <Search size={18} className="text-slate-600" />
            </div>
            <div>
              <p className="font-semibold text-slate-800 text-sm">Tra cứu hồ sơ đã nộp</p>
              <p className="text-xs text-slate-500">Kiểm tra trạng thái xử lý</p>
            </div>
          </div>
          <ArrowRight size={16} className="text-slate-400" />
        </Link>
      </div>

      {/* ── Chú ý / Quy định mới ─────────────────────────── */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <Info size={18} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-amber-900 mb-2">Quy định quan trọng — Cập nhật 2026</h3>
            <ul className="space-y-1.5 text-sm text-amber-800">
              <li>
                🔵 <strong>Từ 01/01/2023:</strong> Sổ hộ khẩu giấy hết hiệu lực. Dùng CCCD gắn chip hoặc VNeID thay thế trong mọi giao dịch hành chính.
              </li>
              <li>
                🟢 <strong>Đề án 06/CP:</strong> Nhiều thủ tục đã đạt mức độ 3–4, có thể nộp hồ sơ và nhận kết quả hoàn toàn trực tuyến.
              </li>
              <li>
                🔴 <strong>Luật Đất đai 2024 (Hiệu lực 01/01/2025):</strong> Nhiều thay đổi về trình tự, thủ tục chuyển nhượng, cấp GCNQSDĐ. Liên hệ UBND Phường để được tư vấn.
              </li>
              <li>
                🟡 <strong>Mức lương cơ sở 2024–2026:</strong> 2.340.000đ/tháng. Các mức phí, lệ phí và trợ cấp xã hội được điều chỉnh theo.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ── Liên hệ hỗ trợ ───────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            icon: '🏛️',
            title: 'UBND Phường Long Trường',
            detail: 'Bộ phận Một cửa — Tầng 1',
            sub: 'Thứ 2–6 · 7h30–11h30 & 13h00–17h00',
            color: 'bg-[#FEF2F2] border-red-100',
          },
          {
            icon: '👮',
            title: 'Công an Phường',
            detail: 'Thủ tục cư trú, hộ khẩu',
            sub: 'Thứ 2–7 · 7h30–17h00',
            color: 'bg-blue-50 border-blue-100',
          },
          {
            icon: '🤖',
            title: 'Hỏi AI Trợ lý',
            detail: 'Giải đáp thủ tục 24/7',
            sub: 'Không cần xếp hàng',
            href: '/chat',
            color: 'bg-slate-50 border-slate-200',
          },
        ].map((item) => (
          item.href ? (
            <Link key={item.title} href={item.href}
              className={`${item.color} border rounded-2xl p-4 flex items-center gap-4 hover:shadow-sm transition-all`}>
              <div className="text-3xl">{item.icon}</div>
              <div>
                <p className="font-bold text-slate-800 text-sm">{item.title}</p>
                <p className="text-xs text-slate-600">{item.detail}</p>
                <p className="text-xs text-slate-400 mt-0.5">{item.sub}</p>
              </div>
            </Link>
          ) : (
            <div key={item.title} className={`${item.color} border rounded-2xl p-4 flex items-center gap-4`}>
              <div className="text-3xl">{item.icon}</div>
              <div>
                <p className="font-bold text-slate-800 text-sm">{item.title}</p>
                <p className="text-xs text-slate-600">{item.detail}</p>
                <p className="text-xs text-slate-400 mt-0.5">{item.sub}</p>
              </div>
            </div>
          )
        ))}
      </div>

    </div>
  )
}
