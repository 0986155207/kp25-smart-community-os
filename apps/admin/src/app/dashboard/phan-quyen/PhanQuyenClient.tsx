'use client'

import { useState, useTransition, useEffect } from 'react'
import {
  Shield, User, Phone, Mail, Edit3, Key, CheckCircle2,
  XCircle, Plus, Save, X, RefreshCw, Eye, EyeOff,
  AlertTriangle, Trash2, UserPlus, Lock, Unlock,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  capNhatCanBo, taoTaiKhoanCanBo, datLaiMatKhau,
  themMoiCanBo, xoaCanBo, kiemTraTaiKhoan,
} from './actions'
import type { CanBo, VaiTro } from '@/lib/auth-config'
import { VAI_TRO_LABEL, VAI_TRO_COLOR } from '@/lib/auth-config'

// ─── Hằng số ──────────────────────────────────────────────────

const VAI_TRO_OPTIONS: { value: VaiTro; label: string; mo_ta: string }[] = [
  { value: 'BI_THU',         label: 'Bí thư chi bộ',   mo_ta: 'Toàn quyền quản trị, giám sát cán bộ'        },
  { value: 'TRUONG_KHU_PHO', label: 'Trưởng khu phố',  mo_ta: 'Hành chính, môi trường, chính sách'           },
  { value: 'CONG_AN',        label: 'Công an khu vực',  mo_ta: 'An ninh, thường trú, tạm trú, tạm vắng'      },
  { value: 'AN_NINH',        label: 'An ninh khu phố',  mo_ta: 'Trật tự, tiếng ồn, lấn chiếm vỉa hè'         },
  { value: 'PHU_TRACH_NCT',  label: 'Phụ trách NCT',    mo_ta: 'Quản lý người cao tuổi, an sinh xã hội'       },
]

const QUYEN_THEO_VAI_TRO: Record<VaiTro, string[]> = {
  BI_THU:         ['Dashboard', 'Báo cáo', 'AI', 'Workflow', 'Phản ánh', 'Dân cư', 'Thông báo', 'Bản đồ GIS', 'An sinh', 'Phân quyền', 'Cài đặt'],
  TRUONG_KHU_PHO: ['Dashboard', 'Báo cáo', 'AI', 'Workflow', 'Phản ánh', 'Dân cư', 'Thông báo', 'Bản đồ GIS', 'An sinh'],
  CONG_AN:        ['Dashboard', 'Báo cáo', 'AI', 'Workflow', 'Phản ánh', 'Dân cư', 'Bản đồ GIS'],
  AN_NINH:        ['Dashboard', 'Báo cáo', 'AI', 'Workflow', 'Phản ánh', 'Bản đồ GIS'],
  PHU_TRACH_NCT:  ['Dashboard', 'Báo cáo', 'AI', 'An sinh'],
}

// ─── Thông báo inline ─────────────────────────────────────────

function InlineAlert({ msg, ok }: { msg: string; ok: boolean }) {
  return (
    <div className={cn(
      'flex items-start gap-2 p-3 rounded-xl text-sm',
      ok ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
         : 'bg-red-50 text-red-800 border border-red-200'
    )}>
      {ok
        ? <CheckCircle2 size={15} className="shrink-0 mt-0.5" />
        : <XCircle     size={15} className="shrink-0 mt-0.5" />
      }
      <span className="whitespace-pre-line leading-relaxed">{msg}</span>
    </div>
  )
}

// ─── Modal tạo tài khoản ───────────────────────────────────────

function ModalTaoTK({ canBo, onClose }: { canBo: CanBo; onClose: () => void }) {
  const [pending, start] = useTransition()
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const [showPass, setShowPass] = useState(false)
  const [matKhau, setMatKhau]   = useState('KP25@2026!')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <UserPlus size={18} className="text-blue-600" /> Tạo tài khoản đăng nhập
          </h3>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg"><X size={16} /></button>
        </div>

        <div className="bg-slate-50 rounded-xl p-3 space-y-1 mb-4">
          <p className="text-sm font-semibold text-slate-800">{canBo.ho_ten}</p>
          <p className="text-xs text-slate-500 flex items-center gap-1">
            <Mail size={11} /> {canBo.email}
          </p>
          <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full inline-block', VAI_TRO_COLOR[canBo.vai_tro])}>
            {VAI_TRO_LABEL[canBo.vai_tro]}
          </span>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mật khẩu tạm thời</label>
          <div className="relative">
            <input
              type={showPass ? 'text' : 'password'}
              value={matKhau}
              onChange={e => setMatKhau(e.target.value)}
              className="input pr-10"
            />
            <button type="button" onClick={() => setShowPass(p => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-1">Cán bộ dùng mật khẩu này để đăng nhập lần đầu</p>
        </div>

        {result && <div className="mb-4"><InlineAlert msg={result.message} ok={result.success} /></div>}

        {!result?.success ? (
          <div className="flex gap-2">
            <button onClick={onClose} className="flex-1 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">Huỷ</button>
            <button onClick={() => start(async () => setResult(await taoTaiKhoanCanBo(canBo.id, canBo.email, matKhau)))}
              disabled={pending || !matKhau}
              className="flex-1 py-2 rounded-xl bg-[#1E3A5F] text-white text-sm font-semibold hover:bg-[#162d4a] disabled:opacity-60 flex items-center justify-center gap-1.5">
              {pending ? <RefreshCw size={14} className="animate-spin" /> : <UserPlus size={14} />}
              Tạo tài khoản
            </button>
          </div>
        ) : (
          <button onClick={onClose} className="w-full py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700">Đóng</button>
        )}
      </div>
    </div>
  )
}

// ─── Modal đặt lại mật khẩu ───────────────────────────────────

function ModalMatKhau({ canBo, onClose }: { canBo: CanBo; onClose: () => void }) {
  const [pending, start] = useTransition()
  const [result, setResult]   = useState<{ success: boolean; message: string } | null>(null)
  const [showPass, setShowPass] = useState(false)
  const [matKhauMoi, setMkMoi]  = useState('')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <Key size={18} className="text-amber-600" /> Đặt lại mật khẩu
          </h3>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg"><X size={16} /></button>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2 mb-4">
          <AlertTriangle size={15} className="text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700">
            Mật khẩu mới có hiệu lực ngay. Thông báo cho <strong>{canBo.ho_ten}</strong> sau khi đặt lại.
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mật khẩu mới</label>
          <div className="relative">
            <input
              type={showPass ? 'text' : 'password'}
              value={matKhauMoi}
              onChange={e => setMkMoi(e.target.value)}
              placeholder="Tối thiểu 8 ký tự"
              className="input pr-10"
            />
            <button type="button" onClick={() => setShowPass(p => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        {result && <div className="mb-4"><InlineAlert msg={result.message} ok={result.success} /></div>}

        {!result?.success ? (
          <div className="flex gap-2">
            <button onClick={onClose} className="flex-1 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">Huỷ</button>
            <button onClick={() => start(async () => setResult(await datLaiMatKhau(canBo.email, matKhauMoi)))}
              disabled={pending || matKhauMoi.length < 8}
              className="flex-1 py-2 rounded-xl bg-[#8B1A1A] text-white text-sm font-semibold hover:bg-[#7a1616] disabled:opacity-60 flex items-center justify-center gap-1.5">
              {pending ? <RefreshCw size={14} className="animate-spin" /> : <Key size={14} />}
              Đặt lại
            </button>
          </div>
        ) : (
          <button onClick={onClose} className="w-full py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700">Đóng</button>
        )}
      </div>
    </div>
  )
}

// ─── Modal xoá cán bộ ─────────────────────────────────────────

function ModalXoa({ canBo, onClose, onDone }: { canBo: CanBo; onClose: () => void; onDone: () => void }) {
  const [pending, start] = useTransition()
  const [result, setResult]   = useState<{ success: boolean; message: string } | null>(null)
  const [xoaHoanToan, setXoa] = useState(false)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-red-800 flex items-center gap-2">
            <Trash2 size={18} className="text-red-600" /> Xoá cán bộ
          </h3>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg"><X size={16} /></button>
        </div>

        <div className="bg-slate-50 rounded-xl p-3 mb-4 space-y-1">
          <p className="text-sm font-semibold text-slate-800">{canBo.ho_ten}</p>
          <p className="text-xs text-slate-500">{canBo.email}</p>
        </div>

        <label className="flex items-start gap-3 cursor-pointer mb-4 bg-red-50 border border-red-200 rounded-xl p-3">
          <input type="checkbox" checked={xoaHoanToan} onChange={e => setXoa(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-red-600 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-700">Xoá hoàn toàn (không thể khôi phục)</p>
            <p className="text-xs text-red-500 mt-0.5">Bỏ chọn để chỉ tạm ngưng tài khoản (có thể kích hoạt lại)</p>
          </div>
        </label>

        {result && <div className="mb-4"><InlineAlert msg={result.message} ok={result.success} /></div>}

        {!result?.success ? (
          <div className="flex gap-2">
            <button onClick={onClose} className="flex-1 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">Huỷ</button>
            <button
              onClick={() => start(async () => {
                const r = await xoaCanBo(canBo.id, canBo.email, xoaHoanToan)
                setResult(r)
                if (r.success) setTimeout(onDone, 1200)
              })}
              disabled={pending}
              className="flex-1 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-60 flex items-center justify-center gap-1.5">
              {pending ? <RefreshCw size={14} className="animate-spin" /> : <Trash2 size={14} />}
              {xoaHoanToan ? 'Xoá hoàn toàn' : 'Tạm ngưng'}
            </button>
          </div>
        ) : (
          <button onClick={onDone} className="w-full py-2 rounded-xl bg-slate-700 text-white text-sm font-semibold">Đóng</button>
        )}
      </div>
    </div>
  )
}

// ─── Modal thêm mới cán bộ ────────────────────────────────────

function ModalThemMoi({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [pending, start] = useTransition()
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const [showPass, setShowPass] = useState(false)
  const [form, setForm] = useState({
    ho_ten: '', email: '', vai_tro: 'TRUONG_KHU_PHO' as VaiTro,
    chuc_vu: '', so_dien_thoai: '', mat_khau: 'KP25@2026!',
  })

  function handleSubmit() {
    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => fd.append(k, v))
    start(async () => {
      const r = await themMoiCanBo(fd)
      setResult(r)
      if (r.success) setTimeout(onDone, 2000)
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 my-4">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <UserPlus size={18} className="text-emerald-600" /> Thêm cán bộ mới
          </h3>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg"><X size={16} /></button>
        </div>

        <div className="space-y-4">
          {/* Họ tên */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Họ và tên <span className="text-red-500">*</span>
            </label>
            <input value={form.ho_ten} onChange={e => setForm(p => ({ ...p, ho_ten: e.target.value }))}
              placeholder="VD: Nguyễn Văn A" className="input" />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Email đăng nhập <span className="text-red-500">*</span>
            </label>
            <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              placeholder="canbo@gmail.com" className="input" />
          </div>

          {/* Vai trò + Chức vụ */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Vai trò <span className="text-red-500">*</span>
              </label>
              <select value={form.vai_tro} onChange={e => setForm(p => ({ ...p, vai_tro: e.target.value as VaiTro }))}
                className="input text-sm">
                {VAI_TRO_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Chức vụ</label>
              <input value={form.chuc_vu} onChange={e => setForm(p => ({ ...p, chuc_vu: e.target.value }))}
                placeholder="VD: Phó bí thư" className="input text-sm" />
            </div>
          </div>

          {/* Số điện thoại */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Số điện thoại</label>
            <input value={form.so_dien_thoai} onChange={e => setForm(p => ({ ...p, so_dien_thoai: e.target.value }))}
              placeholder="09x xxx xxxx" className="input" />
          </div>

          {/* Mật khẩu */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Mật khẩu ban đầu <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input type={showPass ? 'text' : 'password'} value={form.mat_khau}
                onChange={e => setForm(p => ({ ...p, mat_khau: e.target.value }))}
                placeholder="Tối thiểu 8 ký tự" className="input pr-10" />
              <button type="button" onClick={() => setShowPass(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-1">Cán bộ đăng nhập lần đầu bằng mật khẩu này</p>
          </div>
        </div>

        {result && <div className="mt-4"><InlineAlert msg={result.message} ok={result.success} /></div>}

        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="flex-1 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">Huỷ</button>
          <button
            onClick={handleSubmit}
            disabled={pending || !form.ho_ten || !form.email || !form.mat_khau || form.mat_khau.length < 8}
            className="flex-1 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60 flex items-center justify-center gap-1.5">
            {pending ? <RefreshCw size={14} className="animate-spin" /> : <UserPlus size={14} />}
            Thêm cán bộ
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Card cán bộ ──────────────────────────────────────────────

function CanBoCard({
  cb, isAdmin, currentEmail, onRefresh,
}: { cb: CanBo; isAdmin: boolean; currentEmail: string; onRefresh: () => void }) {
  const [editing, setEditing] = useState(false)
  const [showTK, setShowTK]   = useState(false)
  const [showMK, setShowMK]   = useState(false)
  const [showXoa, setShowXoa] = useState(false)
  const [hasTK, setHasTK]     = useState<boolean | null>(null)
  const [pending, startTrans] = useTransition()
  const [toast, setToast]     = useState<{ success: boolean; message: string } | null>(null)

  const [form, setForm] = useState({
    ho_ten:        cb.ho_ten,
    email:         cb.email,
    vai_tro:       cb.vai_tro as VaiTro,
    chuc_vu:       cb.chuc_vu ?? '',
    so_dien_thoai: cb.so_dien_thoai ?? '',
    ghi_chu:       cb.ghi_chu ?? '',
    hoat_dong:     cb.hoat_dong,
  })

  // Kiểm tra xem đã có tài khoản auth chưa
  useEffect(() => {
    kiemTraTaiKhoan(cb.email).then(setHasTK)
  }, [cb.email])

  function handleSave() {
    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)))
    startTrans(async () => {
      const r = await capNhatCanBo(cb.id, fd)
      setToast(r)
      if (r.success) {
        // Nếu admin vừa đổi email của chính mình → session hết hiệu lực → redirect login
        const emailDaThayDoi = form.email.toLowerCase() !== cb.email.toLowerCase()
        if (isAdminAccount && emailDaThayDoi) {
          setTimeout(() => { window.location.href = '/login' }, 1800)
        } else {
          setTimeout(() => { setEditing(false); setToast(null); onRefresh() }, 1500)
        }
      }
    })
  }

  function resetForm() {
    setForm({
      ho_ten: cb.ho_ten, email: cb.email, vai_tro: cb.vai_tro,
      chuc_vu: cb.chuc_vu ?? '', so_dien_thoai: cb.so_dien_thoai ?? '',
      ghi_chu: cb.ghi_chu ?? '', hoat_dong: cb.hoat_dong,
    })
    setEditing(false)
    setToast(null)
  }

  const quyen = QUYEN_THEO_VAI_TRO[form.vai_tro] ?? []
  const isAdminAccount = cb.email.toLowerCase() === currentEmail.toLowerCase()

  return (
    <>
      {showTK  && <ModalTaoTK    canBo={{ ...cb, email: form.email }} onClose={() => { setShowTK(false); kiemTraTaiKhoan(form.email).then(setHasTK) }} />}
      {showMK  && <ModalMatKhau  canBo={{ ...cb, email: form.email }} onClose={() => setShowMK(false)} />}
      {showXoa && <ModalXoa      canBo={cb} onClose={() => setShowXoa(false)} onDone={() => { setShowXoa(false); onRefresh() }} />}

      <div className={cn(
        'bg-white rounded-2xl border shadow-sm transition-all',
        form.hoat_dong ? 'border-slate-100' : 'border-slate-200 opacity-60',
        isAdminAccount && 'ring-1 ring-[#1E3A5F]/20'
      )}>
        {/* Header */}
        <div className="p-5 flex items-start gap-4">
          {/* Avatar */}
          <div className={cn(
            'w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-sm shrink-0',
            isAdminAccount ? 'bg-[#8B1A1A]' : 'bg-[#1E3A5F]'
          )}>
            {cb.ho_ten.split(' ').slice(-2).map(w => w[0]).join('').toUpperCase()}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            {editing ? (
              <input value={form.ho_ten}
                onChange={e => setForm(p => ({ ...p, ho_ten: e.target.value }))}
                className="input text-sm font-bold mb-1" />
            ) : (
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900">{form.ho_ten}</h3>
                {isAdminAccount && (
                  <span className="text-[10px] bg-[#8B1A1A] text-white px-1.5 py-0.5 rounded font-bold">Admin</span>
                )}
              </div>
            )}

            <div className="flex items-center gap-2 flex-wrap mt-1">
              <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full', VAI_TRO_COLOR[form.vai_tro])}>
                {VAI_TRO_LABEL[form.vai_tro]}
              </span>
              {!form.hoat_dong && (
                <span className="text-[10px] bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full font-bold">Tạm ngưng</span>
              )}
              {hasTK !== null && (
                <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1',
                  hasTK ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700')}>
                  {hasTK ? <><Lock size={9} /> Đã có TK</> : <><Unlock size={9} /> Chưa có TK</>}
                </span>
              )}
            </div>

            {editing ? (
              <div className="flex items-center gap-1.5 mt-2">
                <Mail size={11} className="text-slate-400 shrink-0" />
                <input type="email" value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  className="input text-xs py-1" />
              </div>
            ) : (
              <div className="flex items-center gap-1 mt-1.5">
                <Mail size={11} className="text-slate-400 shrink-0" />
                <span className={cn('text-xs',
                  form.email.includes('@kp25') || form.email.includes('placeholder')
                    ? 'text-amber-600 font-medium' : 'text-slate-500')}>
                  {form.email}
                  {(form.email.includes('kp25@') || !form.email.includes('@gmail')) && (
                    <span className="ml-1 text-[10px] text-amber-500">(email tạm)</span>
                  )}
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0">
            {!editing ? (
              <>
                {hasTK === true && (
                  <button onClick={() => setShowMK(true)} title="Đặt lại mật khẩu"
                    className="p-2 rounded-lg hover:bg-amber-50 text-amber-600 transition-colors">
                    <Key size={15} />
                  </button>
                )}
                {hasTK === false && (
                  <button onClick={() => setShowTK(true)} title="Tạo tài khoản đăng nhập"
                    className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors">
                    <Plus size={15} />
                  </button>
                )}
                <button onClick={() => setEditing(true)} title="Chỉnh sửa"
                  className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors">
                  <Edit3 size={15} />
                </button>
                {isAdmin && !isAdminAccount && (
                  <button onClick={() => setShowXoa(true)} title="Xoá cán bộ"
                    className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors">
                    <Trash2 size={15} />
                  </button>
                )}
              </>
            ) : (
              <>
                <button onClick={resetForm}
                  className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
                  <X size={15} />
                </button>
                <button onClick={handleSave} disabled={pending}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1E3A5F] text-white text-xs font-semibold hover:bg-[#162d4a] disabled:opacity-60">
                  {pending ? <RefreshCw size={13} className="animate-spin" /> : <Save size={13} />}
                  Lưu
                </button>
              </>
            )}
          </div>
        </div>

        {/* Edit form mở rộng */}
        {editing && (
          <div className="px-5 pb-5 space-y-3 border-t border-slate-50 pt-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">Vai trò</label>
                <select value={form.vai_tro}
                  onChange={e => setForm(p => ({ ...p, vai_tro: e.target.value as VaiTro }))}
                  disabled={isAdminAccount}
                  className={cn('input text-sm', isAdminAccount && 'opacity-50 cursor-not-allowed')}>
                  {VAI_TRO_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">Chức vụ</label>
                <input value={form.chuc_vu}
                  onChange={e => setForm(p => ({ ...p, chuc_vu: e.target.value }))}
                  className="input text-sm" placeholder="VD: Phó bí thư" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Số điện thoại</label>
              <input value={form.so_dien_thoai}
                onChange={e => setForm(p => ({ ...p, so_dien_thoai: e.target.value }))}
                className="input text-sm" placeholder="09x xxx xxxx" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Ghi chú</label>
              <input value={form.ghi_chu}
                onChange={e => setForm(p => ({ ...p, ghi_chu: e.target.value }))}
                className="input text-sm" placeholder="Nhiệm vụ bổ sung..." />
            </div>
            {!isAdminAccount && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.hoat_dong}
                  onChange={e => setForm(p => ({ ...p, hoat_dong: e.target.checked }))}
                  className="w-4 h-4 rounded accent-[#1E3A5F]" />
                <span className="text-sm text-slate-700">Tài khoản đang hoạt động</span>
              </label>
            )}
          </div>
        )}

        {toast && (
          <div className="px-5 pb-4"><InlineAlert msg={toast.message} ok={toast.success} /></div>
        )}

        {/* Quyền truy cập */}
        <div className="px-5 pb-5 pt-1 border-t border-slate-50">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Quyền truy cập</p>
          <div className="flex flex-wrap gap-1.5">
            {quyen.map(q => (
              <span key={q} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">{q}</span>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

// ─── Main Component ────────────────────────────────────────────

export default function PhanQuyenClient({
  canBoList: initialList,
  currentEmail,
}: {
  canBoList: CanBo[]
  currentEmail: string
}) {
  const [canBoList, setCanBoList] = useState(initialList)
  const [showThemMoi, setShowThemMoi] = useState(false)

  // Refresh danh sách (chỉ cần router.refresh() nếu SSR, ở đây dùng window.location)
  function handleRefresh() {
    window.location.reload()
  }

  return (
    <div className="space-y-6">
      {showThemMoi && (
        <ModalThemMoi onClose={() => setShowThemMoi(false)} onDone={() => { setShowThemMoi(false); handleRefresh() }} />
      )}

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-10 h-10 rounded-xl bg-[#1E3A5F] flex items-center justify-center">
              <Shield size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Phân quyền</h1>
              <p className="text-sm text-slate-500">Quản lý cán bộ và tài khoản đăng nhập</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowThemMoi(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-colors shadow-sm"
        >
          <UserPlus size={16} />
          Thêm cán bộ mới
        </button>
      </div>

      {/* Bảng vai trò */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-50 flex items-center gap-2">
          <Shield size={14} className="text-slate-400" />
          <h2 className="font-bold text-slate-700 text-sm">Phân quyền theo vai trò</h2>
        </div>
        <div className="divide-y divide-slate-50">
          {VAI_TRO_OPTIONS.map(o => (
            <div key={o.value} className="flex items-center gap-3 px-5 py-3">
              <span className={cn('text-xs font-bold px-2.5 py-1 rounded-full w-36 text-center shrink-0', VAI_TRO_COLOR[o.value])}>
                {o.label}
              </span>
              <p className="text-sm text-slate-600">{o.mo_ta}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Danh sách cán bộ */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-slate-800">
            Danh sách cán bộ
            <span className="ml-2 text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-normal">
              {canBoList.filter(cb => cb.hoat_dong).length} đang hoạt động / {canBoList.length} tổng
            </span>
          </h2>
        </div>

        {canBoList.length === 0 ? (
          <div className="text-center py-12 text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
            <User size={32} className="mx-auto mb-3 opacity-30" />
            <p className="font-semibold">Chưa có cán bộ nào</p>
            <p className="text-sm mt-1">Chạy migration 033 trong Supabase SQL Editor trước</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {canBoList.map(cb => (
              <CanBoCard
                key={cb.id}
                cb={cb}
                isAdmin={true}
                currentEmail={currentEmail}
                onRefresh={handleRefresh}
              />
            ))}
          </div>
        )}
      </div>

      {/* Hướng dẫn */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <Shield size={18} className="text-[#1E3A5F] shrink-0 mt-0.5" />
          <div className="space-y-2 text-sm text-slate-700">
            <p className="font-semibold text-[#1E3A5F]">Hướng dẫn quản lý tài khoản cán bộ</p>
            <ul className="space-y-1 text-xs text-slate-600 list-disc list-inside">
              <li>Nhấn <strong>✏️ Chỉnh sửa</strong> để đổi email hoặc thông tin cán bộ</li>
              <li>Nhấn <strong>+ Tạo tài khoản</strong> nếu cán bộ chưa có tài khoản đăng nhập (<Lock size={10} className="inline" /> hiển thị)</li>
              <li>Nhấn <strong>🔑 Đặt lại mật khẩu</strong> khi cán bộ quên mật khẩu</li>
              <li>Nhấn <strong>+ Thêm cán bộ mới</strong> để thêm người mới (sẽ tạo cả tài khoản đăng nhập)</li>
              <li>Mật khẩu mặc định: <code className="bg-blue-100 px-1.5 py-0.5 rounded font-mono">KP25@2026!</code></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
