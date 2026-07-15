'use client'

import { KHU_PHO } from '@/lib/khu-pho'
import { useState, useTransition, useRef } from 'react'
import {
  User, Lock, Building2, Info,
  CheckCircle2, AlertCircle, Eye, EyeOff, Loader2,
  Phone, StickyNote, MapPin, Globe, Server, ShieldCheck,
  Bell, BellOff, BellRing, Smartphone, Wifi, WifiOff,
} from 'lucide-react'
import type { CanBo } from '@/lib/auth-config'
import { VAI_TRO_LABEL, VAI_TRO_COLOR } from '@/lib/auth-config'
import { capNhatHoSo, doiMatKhau } from './actions'
import { usePushNotification } from '@/hooks/usePushNotification'

// ── Thông tin hệ thống ────────────────────────────────────────
const THONG_TIN_HE_THONG = {
  tenHeThong:   `${KHU_PHO.ma} Smart Community OS`,
  phienBan:     'v1.0.0 — Production',
  khuPho:       `${KHU_PHO.ten}`,
  phuong:       'Phường Long Trường',
  thanhPho:     'TP. Hồ Chí Minh',
  adminUrl:     'http://localhost:3001',
  publicUrl:    'http://localhost:3000',
  supabaseUrl:  'pnyjrneqxqckclxehaqv.supabase.co',
  namTrienKhai: '2026',
}

// ── Toast thông báo ───────────────────────────────────────────
function Toast({ type, message }: { type: 'success' | 'error'; message: string }) {
  if (!message) return null
  const isSuccess = type === 'success'
  return (
    <div className={`flex items-start gap-3 rounded-xl px-4 py-3 text-sm font-medium
      ${isSuccess ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-800 border border-red-200'}`}>
      {isSuccess
        ? <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-600" />
        : <AlertCircle  size={16} className="shrink-0 mt-0.5 text-red-600" />
      }
      <span>{message}</span>
    </div>
  )
}

// ── Input field ───────────────────────────────────────────────
function Field({
  label, name, defaultValue = '', type = 'text',
  placeholder = '', disabled = false, required = false,
}: {
  label: string; name: string; defaultValue?: string; type?: string;
  placeholder?: string; disabled?: boolean; required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-slate-700">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5
          text-sm text-slate-800 placeholder-slate-400
          focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]/30 focus:border-[#8B1A1A]
          disabled:bg-slate-50 disabled:text-slate-500 transition-all"
      />
    </div>
  )
}

// ── Password field ────────────────────────────────────────────
function PasswordField({ label, name, required = true }: {
  label: string; name: string; required?: boolean;
}) {
  const [show, setShow] = useState(false)
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-slate-700">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div className="relative">
        <input
          name={name}
          type={show ? 'text' : 'password'}
          required={required}
          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 pr-10
            text-sm text-slate-800
            focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]/30 focus:border-[#8B1A1A]
            transition-all"
        />
        <button
          type="button"
          onClick={() => setShow(v => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  )
}

// ── Info row (read-only) ──────────────────────────────────────
function InfoRow({ label, value, icon: Icon }: {
  label: string; value: string; icon: React.ElementType;
}) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-slate-100 last:border-0">
      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
        <Icon size={15} className="text-slate-500" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm font-medium text-slate-800 truncate">{value}</p>
      </div>
    </div>
  )
}

// ── Section wrapper ───────────────────────────────────────────
function Section({
  icon: Icon, title, subtitle, children,
}: {
  icon: React.ElementType; title: string; subtitle?: string; children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#8B1A1A]/10 flex items-center justify-center">
          <Icon size={18} className="text-[#8B1A1A]" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-slate-800">{title}</h2>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}

// ── Section 1: Hồ sơ cá nhân ─────────────────────────────────
function HoSoCaNhan({ canBo }: { canBo: CanBo }) {
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    setResult(null)
    startTransition(async () => {
      const res = await capNhatHoSo(fd)
      setResult(res)
    })
  }

  return (
    <Section icon={User} title="Hồ sơ cá nhân" subtitle="Cập nhật thông tin cá nhân của bạn">
      {/* Avatar + thông tin cơ bản */}
      <div className="flex items-center gap-4 mb-6 pb-5 border-b border-slate-100">
        <div className="w-16 h-16 rounded-2xl bg-[#8B1A1A] flex items-center justify-center text-white text-xl font-bold shrink-0">
          {canBo.ho_ten.split(' ').slice(-2).map(w => w[0]).join('').toUpperCase()}
        </div>
        <div>
          <p className="text-base font-bold text-slate-800">{canBo.ho_ten}</p>
          <p className="text-sm text-slate-500">{canBo.email}</p>
          <span className={`mt-1 inline-block text-xs font-medium px-2.5 py-0.5 rounded-full ${VAI_TRO_COLOR[canBo.vai_tro]}`}>
            {VAI_TRO_LABEL[canBo.vai_tro]}
          </span>
        </div>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
        <Field
          label="Họ và tên"
          name="ho_ten"
          defaultValue={canBo.ho_ten}
          placeholder="Nhập họ và tên đầy đủ"
          required
        />
        <Field
          label="Email"
          name="email"
          defaultValue={canBo.email}
          type="email"
          disabled
        />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">Chức vụ</label>
          <input
            value={canBo.chuc_vu ?? VAI_TRO_LABEL[canBo.vai_tro]}
            disabled
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5
              text-sm text-slate-500 cursor-not-allowed"
            readOnly
          />
          <p className="text-xs text-slate-400">Chức vụ do quản trị viên cấp, không thể tự thay đổi</p>
        </div>
        <div className="flex items-center gap-2">
          <Phone size={14} className="text-slate-400 shrink-0" />
          <div className="flex-1">
            <Field
              label="Số điện thoại"
              name="so_dien_thoai"
              defaultValue={canBo.so_dien_thoai ?? ''}
              type="tel"
              placeholder="0909 xxx xxx"
            />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
            <StickyNote size={14} className="text-slate-400" /> Ghi chú
          </label>
          <textarea
            name="ghi_chu"
            defaultValue={canBo.ghi_chu ?? ''}
            placeholder="Ghi chú thêm..."
            rows={3}
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5
              text-sm text-slate-800 placeholder-slate-400 resize-none
              focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]/30 focus:border-[#8B1A1A]
              transition-all"
          />
        </div>

        {result && <Toast type={result.success ? 'success' : 'error'} message={result.message} />}

        <div className="pt-1 flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#8B1A1A] text-white
              text-sm font-semibold hover:bg-[#6B1414] disabled:opacity-60 transition-colors"
          >
            {isPending && <Loader2 size={15} className="animate-spin" />}
            {isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </form>
    </Section>
  )
}

// ── Section 2: Đổi mật khẩu ──────────────────────────────────
function DoiMatKhau() {
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    setResult(null)
    startTransition(async () => {
      const res = await doiMatKhau(fd)
      setResult(res)
      if (res.success) formRef.current?.reset()
    })
  }

  return (
    <Section icon={Lock} title="Đổi mật khẩu" subtitle="Thay đổi mật khẩu đăng nhập của bạn">
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
        <PasswordField label="Mật khẩu hiện tại" name="mat_khau_cu" />
        <div className="h-px bg-slate-100" />
        <PasswordField label="Mật khẩu mới" name="mat_khau_moi" />
        <PasswordField label="Xác nhận mật khẩu mới" name="xac_nhan" />

        <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
          <p className="text-xs text-amber-700 font-medium mb-1">Yêu cầu mật khẩu:</p>
          <ul className="text-xs text-amber-600 space-y-0.5 list-disc list-inside">
            <li>Tối thiểu 8 ký tự</li>
            <li>Nên kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt</li>
          </ul>
        </div>

        {result && <Toast type={result.success ? 'success' : 'error'} message={result.message} />}

        <div className="pt-1 flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#8B1A1A] text-white
              text-sm font-semibold hover:bg-[#6B1414] disabled:opacity-60 transition-colors"
          >
            {isPending && <Loader2 size={15} className="animate-spin" />}
            {isPending ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
          </button>
        </div>
      </form>
    </Section>
  )
}

// ── Section 3: Thông tin khu phố ─────────────────────────────
function ThongTinKhuPho() {
  return (
    <Section icon={Building2} title="Thông tin khu phố" subtitle="Thông tin chung về đơn vị hành chính">
      <div className="divide-y divide-slate-100">
        <InfoRow icon={MapPin}  label="Khu phố"    value={THONG_TIN_HE_THONG.khuPho} />
        <InfoRow icon={Building2} label="Phường"   value={THONG_TIN_HE_THONG.phuong} />
        <InfoRow icon={MapPin}  label="Thành phố"  value={THONG_TIN_HE_THONG.thanhPho} />
        <InfoRow icon={Globe}   label="Cổng thông tin" value={THONG_TIN_HE_THONG.publicUrl} />
      </div>
    </Section>
  )
}

// ── Section 4: Thông tin hệ thống ─────────────────────────────
function ThongTinHeThong() {
  return (
    <Section icon={Info} title="Thông tin hệ thống" subtitle="Phiên bản và cấu hình kỹ thuật">
      <div className="divide-y divide-slate-100">
        <InfoRow icon={ShieldCheck} label="Tên hệ thống" value={THONG_TIN_HE_THONG.tenHeThong} />
        <InfoRow icon={Info}        label="Phiên bản"    value={THONG_TIN_HE_THONG.phienBan} />
        <InfoRow icon={Globe}       label="Admin URL"    value={THONG_TIN_HE_THONG.adminUrl} />
        <InfoRow icon={Server}      label="Database"     value={THONG_TIN_HE_THONG.supabaseUrl} />
        <InfoRow icon={Info}        label="Năm triển khai" value={THONG_TIN_HE_THONG.namTrienKhai} />
      </div>
      <div className="mt-4 rounded-xl bg-slate-50 border border-slate-200 px-4 py-3">
        <p className="text-xs text-slate-500 text-center">
          Hệ điều hành số cộng đồng — {KHU_PHO.ten} · Long Trường · TP.HCM
        </p>
      </div>
    </Section>
  )
}

// ── Section 5: Thông báo đẩy ─────────────────────────────────
function ThongBaoDaySection() {
  const {
    trangThai, loiMsg, thongBaoMoi,
    dangKy, huyDangKy,
    daDangKy, coCauHinh,
  } = usePushNotification()

  const [isPending, startTransition] = useTransition()

  function handleDangKy() {
    startTransition(async () => { await dangKy() })
  }
  function handleHuy() {
    startTransition(async () => { await huyDangKy() })
  }

  // Trạng thái hiển thị
  const STATUS: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
    chua_kiem_tra: { label: 'Đang kiểm tra...', color: 'text-slate-500', bg: 'bg-slate-100', icon: Loader2 },
    chua_ho_tro:   { label: 'Trình duyệt không hỗ trợ', color: 'text-orange-600', bg: 'bg-orange-50', icon: WifiOff },
    chua_cau_hinh: { label: 'Chưa cấu hình Firebase', color: 'text-orange-600', bg: 'bg-orange-50', icon: AlertCircle },
    cho_phep:      { label: 'Chưa đăng ký', color: 'text-slate-500', bg: 'bg-slate-100', icon: BellOff },
    tu_choi:       { label: 'Đã từ chối quyền thông báo', color: 'text-red-600', bg: 'bg-red-50', icon: BellOff },
    da_dang_ky:    { label: 'Đang nhận thông báo', color: 'text-emerald-700', bg: 'bg-emerald-50', icon: BellRing },
    dang_xu_ly:    { label: 'Đang xử lý...', color: 'text-blue-600', bg: 'bg-blue-50', icon: Loader2 },
    loi:           { label: 'Lỗi đăng ký', color: 'text-red-600', bg: 'bg-red-50', icon: AlertCircle },
  }

  const s = STATUS[trangThai] ?? STATUS['cho_phep']!
  const StatusIcon = s.icon

  return (
    <Section icon={Bell} title="Thông báo đẩy" subtitle="Nhận thông báo trực tiếp trên trình duyệt">

      {/* Trạng thái hiện tại */}
      <div className={`flex items-center gap-3 rounded-xl px-4 py-3 mb-5 ${s.bg}`}>
        <div className="w-8 h-8 rounded-lg bg-white/60 flex items-center justify-center shrink-0">
          <StatusIcon
            size={16}
            className={`${s.color} ${trangThai === 'dang_xu_ly' || trangThai === 'chua_kiem_tra' ? 'animate-spin' : ''}`}
          />
        </div>
        <div>
          <p className={`text-sm font-semibold ${s.color}`}>{s.label}</p>
          {loiMsg && <p className="text-xs text-red-500 mt-0.5">{loiMsg}</p>}
        </div>
        {daDangKy && (
          <span className="ml-auto flex items-center gap-1 text-xs text-emerald-600 font-medium">
            <Wifi size={12} />
            Đang kết nối
          </span>
        )}
      </div>

      {/* Thông tin về push notification */}
      {!coCauHinh ? (
        <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 mb-5">
          <p className="text-xs text-amber-700 font-semibold mb-1">Chưa cấu hình Firebase</p>
          <p className="text-xs text-amber-600">
            Để bật tính năng thông báo đẩy, cần cấu hình Firebase trong file{' '}
            <code className="font-mono bg-amber-100 px-1 rounded">.env.local</code>.
            Liên hệ quản trị viên để được hỗ trợ.
          </p>
        </div>
      ) : trangThai === 'tu_choi' ? (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 mb-5">
          <p className="text-xs text-red-700 font-semibold mb-1">Đã từ chối quyền thông báo</p>
          <p className="text-xs text-red-600">
            Để bật lại, vào cài đặt trình duyệt → Trang web → Thông báo → Cho phép{' '}
            trang web này gửi thông báo.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 mb-5">
          <div className="flex items-center gap-3 py-3">
            <Smartphone size={15} className="text-slate-400 shrink-0" />
            <div>
              <p className="text-sm font-medium text-slate-700">Thông báo trên trình duyệt</p>
              <p className="text-xs text-slate-500">
                Nhận tin tức khu phố, cảnh báo an ninh, sự kiện ngay cả khi không mở trang web
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 py-3">
            <BellRing size={15} className="text-slate-400 shrink-0" />
            <div>
              <p className="text-sm font-medium text-slate-700">Thông báo ưu tiên</p>
              <p className="text-xs text-slate-500">
                Thông báo khẩn cấp, họp khu phố, phản ánh được xử lý sẽ hiển thị ngay lập tức
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Thông báo foreground mới nhất */}
      {thongBaoMoi && (
        <div className="mb-5 rounded-xl bg-blue-50 border border-blue-200 px-4 py-3">
          <p className="text-xs font-semibold text-blue-700 mb-0.5 flex items-center gap-1.5">
            <Bell size={12} />
            Thông báo vừa nhận
          </p>
          <p className="text-sm font-medium text-slate-800">{thongBaoMoi.title}</p>
          <p className="text-xs text-slate-600 mt-0.5">{thongBaoMoi.body}</p>
        </div>
      )}

      {/* Nút hành động */}
      {coCauHinh && trangThai !== 'tu_choi' && trangThai !== 'chua_ho_tro' && (
        <div className="flex justify-end gap-2">
          {daDangKy ? (
            <button
              onClick={handleHuy}
              disabled={isPending}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200
                text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-60 transition-colors"
            >
              {isPending && <Loader2 size={14} className="animate-spin" />}
              <BellOff size={14} />
              Tắt thông báo
            </button>
          ) : (
            <button
              onClick={handleDangKy}
              disabled={isPending || trangThai === 'dang_xu_ly' || trangThai === 'chua_kiem_tra'}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#8B1A1A] text-white
                text-sm font-semibold hover:bg-[#6B1414] disabled:opacity-60 transition-colors"
            >
              {(isPending || trangThai === 'dang_xu_ly') && <Loader2 size={14} className="animate-spin" />}
              <Bell size={14} />
              Bật thông báo
            </button>
          )}
        </div>
      )}
    </Section>
  )
}

// ── Main export ───────────────────────────────────────────────
export default function CaiDatClient({ canBo }: { canBo: CanBo }) {
  const [activeTab, setActiveTab] = useState<'ho-so' | 'mat-khau' | 'khu-pho' | 'he-thong' | 'thong-bao-day'>('ho-so')

  const tabs = [
    { id: 'ho-so'         as const, label: 'Hồ sơ cá nhân',    icon: User },
    { id: 'mat-khau'      as const, label: 'Đổi mật khẩu',     icon: Lock },
    { id: 'khu-pho'       as const, label: 'Khu phố',          icon: Building2 },
    { id: 'thong-bao-day' as const, label: 'Thông báo đẩy',    icon: Bell },
    { id: 'he-thong'      as const, label: 'Hệ thống',         icon: Info },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Cài đặt</h1>
        <p className="text-sm text-slate-500 mt-1">Quản lý tài khoản và cấu hình hệ thống</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-2xl w-fit flex-wrap">
        {tabs.map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all
                ${isActive
                  ? 'bg-white text-[#8B1A1A] shadow-sm'
                  : 'text-slate-600 hover:text-slate-800'
                }`}
            >
              <Icon size={15} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Content */}
      <div className="max-w-2xl">
        {activeTab === 'ho-so'         && <HoSoCaNhan canBo={canBo} />}
        {activeTab === 'mat-khau'      && <DoiMatKhau />}
        {activeTab === 'khu-pho'       && <ThongTinKhuPho />}
        {activeTab === 'thong-bao-day' && <ThongBaoDaySection />}
        {activeTab === 'he-thong'      && <ThongTinHeThong />}
      </div>
    </div>
  )
}
