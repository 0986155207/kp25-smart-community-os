'use client'

import { KHU_PHO } from '@/lib/khu-pho'
import { useState } from 'react'
import toast from 'react-hot-toast'
import {
  MessageSquare, Send, Loader2, Check, Copy, CheckCheck,
  Users, Phone, AlertCircle, Smartphone, MessagesSquare, Sparkles,
} from 'lucide-react'
import { guiSmsTuKhaiBatch, taoTinNhanGroupTuKhai, type ThongKeChienDich } from './actions'

type Tab = 'sms' | 'zalo'

export default function ChienDichClient({ thongKe }: { thongKe: ThongKeChienDich }) {
  const [tab, setTab] = useState<Tab>('sms')

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-slate-100 rounded-xl mb-5 max-w-md">
        <button onClick={() => setTab('sms')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all
            ${tab === 'sms' ? 'bg-white text-[#1E3A5F] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
          <Smartphone size={15} /> Gửi SMS hàng loạt
        </button>
        <button onClick={() => setTab('zalo')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all
            ${tab === 'zalo' ? 'bg-white text-[#1E3A5F] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
          <MessagesSquare size={15} /> Tin nhắn Zalo Group
        </button>
      </div>

      {tab === 'sms' ? <SmsTab thongKe={thongKe} /> : <ZaloTab />}
    </div>
  )
}

// ════════════════════════════════════════════════════════════
//  TAB 1: SMS hàng loạt
// ════════════════════════════════════════════════════════════
function SmsTab({ thongKe }: { thongKe: ThongKeChienDich }) {
  const [chiHoChuaGui, setChiHoChuaGui] = useState(true)
  const [running, setRunning] = useState(false)
  const [progress, setProgress] = useState({ daGui: 0, thatBai: 0 })
  const [done, setDone] = useState(false)

  async function batDau() {
    setRunning(true)
    setDone(false)
    setProgress({ daGui: 0, thatBai: 0 })

    let tongGui = 0, tongLoi = 0
    let conLai = true
    let safety = 0  // tránh vòng lặp vô hạn

    while (conLai && safety < 100) {
      safety++
      const res = await guiSmsTuKhaiBatch({ chiHoChuaGui, soLuong: 25 })
      tongGui += res.daGui
      tongLoi += res.thatBai
      setProgress({ daGui: tongGui, thatBai: tongLoi })
      conLai = res.conLai
      if (res.tongDaXuLy === 0) break
    }

    setRunning(false)
    setDone(true)
    toast.success(`Hoàn tất: đã gửi ${tongGui} SMS${tongLoi > 0 ? `, ${tongLoi} thất bại` : ''}`)
  }

  const soSeGui = chiHoChuaGui ? thongKe.hoChuaGui : thongKe.hoCoSdt

  return (
    <div className="space-y-5">
      {/* Thống kê */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatBox icon={Users}  label="Tổng hộ"        value={thongKe.tongHo}     color="text-slate-700" bg="bg-slate-50" />
        <StatBox icon={Phone}  label="Có số ĐT"       value={thongKe.hoCoSdt}    color="text-blue-600"  bg="bg-blue-50" />
        <StatBox icon={Check}  label="Đã gửi SMS"     value={thongKe.hoDaGui}    color="text-emerald-600" bg="bg-emerald-50" />
        <StatBox icon={Send}   label="Chưa gửi"       value={thongKe.hoChuaGui}  color="text-amber-600" bg="bg-amber-50" />
      </div>

      {/* Cấu hình gửi */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
        <div>
          <p className="font-bold text-slate-800 text-sm mb-1">Nội dung SMS gửi đến từng hộ</p>
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs text-slate-600 font-mono leading-relaxed">
            {KHU_PHO.ma} Long Truong: Cap nhat thong tin ho dan tai <span className="text-[#1E3A5F]">[link riêng từng hộ]</span> - chi 2 phut, mien phi.
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5">
            Mỗi hộ nhận đường link cá nhân hóa (mã QR riêng) → bấm vào điền thông tin của hộ mình.
          </p>
        </div>

        {/* Tùy chọn phạm vi */}
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input type="checkbox" checked={chiHoChuaGui} onChange={e => setChiHoChuaGui(e.target.checked)}
            className="w-4 h-4 accent-[#1E3A5F]" />
          <span className="text-sm text-slate-700">
            Chỉ gửi hộ <strong>chưa từng nhận SMS</strong> (tránh gửi trùng)
          </span>
        </label>

        {/* Cảnh báo chi phí */}
        <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl">
          <AlertCircle size={14} className="text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 leading-relaxed">
            Sẽ gửi <strong>{soSeGui} tin nhắn SMS</strong> qua ESMS. Mỗi SMS tốn phí theo bảng giá ESMS
            (~300-800đ/tin). Kiểm tra số dư tài khoản ESMS trước khi gửi số lượng lớn.
          </p>
        </div>

        {/* Tiến trình */}
        {(running || done) && (
          <div className="bg-slate-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                {running ? <Loader2 size={14} className="animate-spin text-blue-500" /> : <Check size={14} className="text-emerald-500" />}
                {running ? 'Đang gửi...' : 'Hoàn tất'}
              </span>
              <span className="text-sm text-slate-500">
                Đã gửi <strong className="text-emerald-600">{progress.daGui}</strong>
                {progress.thatBai > 0 && <> · Lỗi <strong className="text-red-500">{progress.thatBai}</strong></>}
              </span>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: soSeGui > 0 ? `${Math.min(100, (progress.daGui / soSeGui) * 100)}%` : '100%' }} />
            </div>
          </div>
        )}

        <button onClick={batDau} disabled={running || soSeGui === 0}
          className="w-full py-3.5 bg-[#1E3A5F] text-white font-bold text-sm rounded-xl hover:bg-[#162d4a]
                     disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all">
          {running
            ? <><Loader2 size={16} className="animate-spin" /> Đang gửi {progress.daGui}/{soSeGui}...</>
            : <><Send size={16} /> Gửi SMS cho {soSeGui} hộ</>}
        </button>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════
//  TAB 2: Zalo Group
// ════════════════════════════════════════════════════════════
function ZaloTab() {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  async function taoTin() {
    setLoading(true)
    try {
      const t = await taoTinNhanGroupTuKhai()
      setText(t)
    } finally {
      setLoading(false)
    }
  }

  async function copy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success(`Đã sao chép — dán vào nhóm Zalo Cộng đồng ${KHU_PHO.ma}`)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-100 rounded-xl">
        <Sparkles size={14} className="text-blue-500 shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700 leading-relaxed">
          Tạo thông báo phát động chiến dịch → sao chép → dán vào nhóm <strong>Zalo Cộng đồng {KHU_PHO.ten}</strong>.
          Thông báo này nâng cao nhận thức; link cá nhân hóa sẽ gửi riêng qua SMS (tab bên cạnh).
        </p>
      </div>

      {!text ? (
        <button onClick={taoTin} disabled={loading}
          className="w-full py-3.5 bg-[#1E3A5F] text-white font-bold text-sm rounded-xl hover:bg-[#162d4a] disabled:opacity-60 flex items-center justify-center gap-2 transition-all">
          {loading ? <><Loader2 size={16} className="animate-spin" /> Đang tạo...</> : <><MessagesSquare size={16} /> Tạo thông báo Zalo Group</>}
        </button>
      ) : (
        <>
          <textarea value={text} onChange={e => setText(e.target.value)} rows={18}
            className="w-full p-4 rounded-xl border border-slate-200 text-sm text-slate-700 leading-relaxed font-mono focus:outline-none focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/10 resize-none" />
          <div className="flex gap-2">
            <button onClick={copy}
              className="flex-1 py-3 bg-[#1E3A5F] text-white font-bold text-sm rounded-xl hover:bg-[#162d4a] flex items-center justify-center gap-2 transition-all">
              {copied ? <><CheckCheck size={16} /> Đã sao chép!</> : <><Copy size={16} /> Sao chép nội dung</>}
            </button>
            <button onClick={taoTin}
              className="px-4 py-3 border border-slate-200 text-slate-600 text-sm font-medium rounded-xl hover:bg-slate-50 transition-all">
              Tạo lại
            </button>
          </div>
        </>
      )}
    </div>
  )
}

// ─── Stat box ────────────────────────────────────────────────
function StatBox({ icon: Icon, label, value, color, bg }: {
  icon: React.ElementType; label: string; value: number; color: string; bg: string
}) {
  return (
    <div className={`${bg} rounded-2xl p-4`}>
      <Icon size={16} className={color} />
      <p className={`text-2xl font-bold ${color} mt-1`}>{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  )
}
