import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Users, FileText, Phone, MessageSquare,
  ChevronRight, ClipboardList, AlertCircle,
  Home, UserPlus, UserMinus,
} from 'lucide-react'
import TraCuuForm from './TraCuuForm'

export const metadata: Metadata = {
  title: 'Dân cư — KP25 Smart Community',
  description: 'Tra cứu hộ khẩu, hướng dẫn thủ tục đăng ký thường trú, tạm trú, tạm vắng tại Khu phố 25 – Phường Long Trường.',
}

// ─── Các thủ tục hành chính thường gặp ───────────────────────
const THU_TUC = [
  {
    icon:  Home,
    title: 'Đăng ký thường trú',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    iconBg: 'bg-emerald-100',
    moTa:  'Dành cho công dân muốn đăng ký hộ khẩu thường trú tại Khu phố 25.',
    giayTo: [
      'Phiếu báo thay đổi hộ khẩu, nhân khẩu (theo mẫu)',
      'CMND/CCCD còn hiệu lực',
      'Giấy tờ chứng minh chỗ ở hợp pháp (sổ đỏ hoặc hợp đồng thuê nhà công chứng)',
      'Giấy khai sinh (nếu đăng ký cho con dưới 14 tuổi)',
    ],
    thoiGian: '3–5 ngày làm việc',
    phiLe: 'Miễn phí',
  },
  {
    icon:  UserPlus,
    title: 'Khai báo tạm trú',
    color: 'bg-blue-50 text-blue-700 border-blue-100',
    iconBg: 'bg-blue-100',
    moTa:  'Dành cho người từ nơi khác đến sinh sống tại Khu phố 25 từ 30 ngày trở lên.',
    giayTo: [
      'Tờ khai đăng ký tạm trú (theo mẫu CT01)',
      'CMND/CCCD hoặc hộ chiếu còn hiệu lực',
      'Hợp đồng thuê/mượn nhà hoặc xác nhận của chủ nhà',
    ],
    thoiGian: '1–3 ngày làm việc',
    phiLe: 'Miễn phí',
  },
  {
    icon:  UserMinus,
    title: 'Khai báo tạm vắng',
    color: 'bg-amber-50 text-amber-700 border-amber-100',
    iconBg: 'bg-amber-100',
    moTa:  'Dành cho hộ dân đi làm ăn, học tập, chữa bệnh xa từ 30 ngày trở lên.',
    giayTo: [
      'Tờ khai tạm vắng (theo mẫu)',
      'CMND/CCCD của người tạm vắng',
      'Xác nhận của chủ hộ',
    ],
    thoiGian: '1 ngày làm việc',
    phiLe: 'Miễn phí',
  },
]

export default function DanCuPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">

      {/* ── Header ────────────────────────────────────────── */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1E3A5F] to-[#2563EB] flex items-center justify-center shadow-lg shrink-0">
          <Users className="text-white" size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Thông tin Dân cư</h1>
          <p className="text-slate-500 text-sm mt-1">
            Tra cứu hộ khẩu · Thủ tục đăng ký · Hướng dẫn khai báo — Khu phố 25, Phường Long Trường
          </p>
        </div>
      </div>

      {/* ── Grid chính: Tra cứu + Thủ tục nhanh ─────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Tra cứu hộ khẩu (chiếm 3/5) */}
        <div className="lg:col-span-3">
          <TraCuuForm />
        </div>

        {/* Quick actions (chiếm 2/5) */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider px-1">
            Thao tác nhanh
          </h3>

          {[
            {
              href:    '/phan-anh/tao',
              icon:    AlertCircle,
              label:   'Gửi phản ánh',
              desc:    'Báo cáo vấn đề trong khu phố',
              color:   'text-[#8B1A1A]',
              bg:      'bg-red-50 hover:bg-red-100',
            },
            {
              href:    '/chat',
              icon:    MessageSquare,
              label:   'Hỏi AI trợ lý',
              desc:    'Được hướng dẫn thủ tục tức thì',
              color:   'text-emerald-700',
              bg:      'bg-emerald-50 hover:bg-emerald-100',
            },
            {
              href:    '/lien-he',
              icon:    Phone,
              label:   'Liên hệ cán bộ',
              desc:    'Trưởng KP: 0773 735 317',
              color:   'text-[#1E3A5F]',
              bg:      'bg-blue-50 hover:bg-blue-100',
            },
          ].map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 p-4 rounded-xl border border-transparent transition-all ${item.bg}`}
            >
              <div className={`w-9 h-9 rounded-lg bg-white flex items-center justify-center shrink-0 shadow-sm`}>
                <item.icon size={17} className={item.color} />
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-semibold ${item.color}`}>{item.label}</p>
                <p className="text-xs text-slate-500 truncate">{item.desc}</p>
              </div>
              <ChevronRight size={15} className="text-slate-300 shrink-0" />
            </Link>
          ))}

          {/* Lưu ý */}
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 mt-2">
            <p className="text-xs text-amber-700 leading-relaxed">
              <span className="font-semibold">Lưu ý:</span> Mọi thủ tục hành chính cần đến trực tiếp UBND Phường Long Trường – 1341 Nguyễn Duy Trinh.
            </p>
          </div>
        </div>
      </div>

      {/* ── Thủ tục hành chính ────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <ClipboardList size={18} className="text-[#1E3A5F]" />
          <h2 className="text-lg font-bold text-slate-900">Hướng dẫn thủ tục</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {THU_TUC.map(tt => (
            <div
              key={tt.title}
              className={`rounded-2xl border p-5 ${tt.color}`}
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${tt.iconBg}`}>
                  <tt.icon size={17} />
                </div>
                <h3 className="font-bold text-sm leading-tight">{tt.title}</h3>
              </div>

              {/* Mô tả */}
              <p className="text-xs leading-relaxed opacity-80 mb-4">{tt.moTa}</p>

              {/* Giấy tờ */}
              <div className="mb-3">
                <p className="text-xs font-bold uppercase tracking-wide opacity-60 mb-2 flex items-center gap-1">
                  <FileText size={11} /> Giấy tờ cần có
                </p>
                <ul className="space-y-1">
                  {tt.giayTo.map((gt, i) => (
                    <li key={i} className="text-xs flex items-start gap-1.5">
                      <span className="mt-1 w-1 h-1 rounded-full bg-current opacity-50 shrink-0" />
                      <span className="opacity-75 leading-relaxed">{gt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Thời gian & Phí */}
              <div className="flex items-center justify-between border-t border-current/10 pt-3 text-xs">
                <span className="opacity-60">⏱ {tt.thoiGian}</span>
                <span className="font-semibold opacity-80">{tt.phiLe}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Nơi thực hiện thủ tục ─────────────────────────── */}
      <div className="bg-[#1E3A5F] text-white rounded-2xl p-6">
        <h3 className="font-bold text-lg mb-4">Nơi thực hiện thủ tục hành chính</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-blue-200 text-xs uppercase font-semibold tracking-wide mb-2">Địa điểm nộp hồ sơ</p>
            <p className="font-semibold">UBND Phường Long Trường</p>
            <p className="text-blue-200 mt-1">1341 Nguyễn Duy Trinh, Phường Long Trường, TP.HCM</p>
            <a href="tel:02837461111" className="inline-block mt-2 text-[#FCD34D] font-bold hover:underline">
              028 3746 1111
            </a>
          </div>
          <div>
            <p className="text-blue-200 text-xs uppercase font-semibold tracking-wide mb-2">Giờ tiếp nhận</p>
            <div className="space-y-1 text-blue-100">
              <p>Thứ Hai – Thứ Sáu: <span className="text-white font-medium">7:30 – 11:30</span></p>
              <p>Chiều: <span className="text-white font-medium">13:30 – 17:00</span></p>
              <p>Thứ Bảy: <span className="text-white font-medium">7:30 – 11:30</span></p>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
