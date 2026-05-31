'use client'

import { useState, useTransition, useEffect } from 'react'
import {
  UserPlus, Trash2, Loader2, X, User, Calendar,
  CreditCard, Briefcase, Users, Crown, Pencil, Skull, AlertTriangle, Star, ChevronDown,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { themNhanKhau, capNhatNhanKhau, xoaNhanKhau, doiChuHo } from '../actions'
import { formatDate, tinhTuoi } from '@/lib/utils'

// ─── Types ───────────────────────────────────────────────────
interface NhanKhauItem {
  id: string
  hoId: string
  hoTen: string
  ngaySinh?: string
  gioiTinh: string
  cccd: string
  quanHe: string
  ngheNghiep: string
  soDienThoai: string
  trangThai: string
  ghiChu: string
  createdAt: string
  daMat: boolean
  ngayMat: string | null
  // Trường mở rộng (migration 041)
  noiSinh?: string
  nguyenQuan?: string
  danToc?: string
  tonGiao?: string
  quocTich?: string
  cccdNgayCap?: string
  cccdNoiCap?: string
  tinhTrangHonNhan?: string
  noiLamViec?: string
  diaChiThuongTru?: string
}

interface Props {
  hoId: string
  initialData: NhanKhauItem[]
}

// ─── Config ──────────────────────────────────────────────────
const GIOI_TINH_LABEL: Record<string, string> = { NAM: 'Nam', NU: 'Nữ', KHAC: 'Khác' }

const TRANG_THAI_NK: Record<string, { label: string; badge: string }> = {
  THUONG_TRU: { label: 'Thường trú', badge: 'badge-green' },
  TAM_TRU:    { label: 'Tạm trú',   badge: 'badge-blue' },
  TAM_VANG:   { label: 'Tạm vắng',  badge: 'badge-gray' },
}

const QUAN_HE_OPTIONS = [
  'Chủ hộ', 'Vợ / Chồng', 'Con', 'Cha / Mẹ',
  'Anh / Chị / Em', 'Ông / Bà', 'Cháu', 'Thành viên khác',
]

interface FormState {
  hoTen: string; ngaySinh: string; gioiTinh: string; cccd: string
  quanHe: string; ngheNghiep: string; soDienThoai: string; trangThai: string; ghiChu: string
  daMat: string   // 'true' | 'false'
  ngayMat: string
  // Trường mở rộng (migration 041)
  noiSinh: string; nguyenQuan: string; danToc: string; tonGiao: string; quocTich: string
  cccdNgayCap: string; cccdNoiCap: string; tinhTrangHonNhan: string; noiLamViec: string; diaChiThuongTru: string
}

const DEFAULT_FORM: FormState = {
  hoTen: '', ngaySinh: '', gioiTinh: 'NAM', cccd: '',
  quanHe: 'Thành viên khác', ngheNghiep: '', soDienThoai: '', trangThai: 'THUONG_TRU', ghiChu: '',
  daMat: 'false', ngayMat: '',
  noiSinh: '', nguyenQuan: '', danToc: '', tonGiao: '', quocTich: '',
  cccdNgayCap: '', cccdNoiCap: '', tinhTrangHonNhan: '', noiLamViec: '', diaChiThuongTru: '',
}

// ─── Component ───────────────────────────────────────────────
export default function NhanKhauSection({ hoId, initialData }: Props) {
  const [items, setItems] = useState<NhanKhauItem[]>(initialData)

  // Modal state: null = đóng, 'add' = thêm mới, string = id đang sửa
  const [modalMode, setModalMode] = useState<null | 'add' | string>(null)
  const [form, setForm] = useState<FormState>(DEFAULT_FORM)
  const [formError, setFormError] = useState('')

  const [showChiTiet, setShowChiTiet] = useState(false)
  const [isSubmitting, startSubmitting] = useTransition()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [, startDeleting] = useTransition()
  const [settingChuHoId, setSettingChuHoId] = useState<string | null>(null)
  const [confirmChuHoId, setConfirmChuHoId] = useState<string | null>(null)
  const [, startChuHo] = useTransition()

  // Đóng confirm khi click ngoài
  useEffect(() => {
    if (!confirmChuHoId) return
    const dismiss = () => setConfirmChuHoId(null)
    const timer = setTimeout(dismiss, 4000) // tự đóng sau 4 giây
    return () => clearTimeout(timer)
  }, [confirmChuHoId])

  // Derived
  const isDead = form.daMat === 'true'

  // ── Mở modal thêm ──
  function openAdd() {
    setForm(DEFAULT_FORM)
    setFormError('')
    setShowChiTiet(false)
    setModalMode('add')
  }

  // ── Mở modal sửa ──
  function openEdit(nk: NhanKhauItem) {
    setForm({
      hoTen: nk.hoTen,
      ngaySinh: nk.ngaySinh ?? '',
      gioiTinh: nk.gioiTinh,
      cccd: nk.cccd ?? '',
      quanHe: nk.quanHe ?? 'Thành viên khác',
      ngheNghiep: nk.ngheNghiep ?? '',
      soDienThoai: nk.soDienThoai ?? '',
      trangThai: nk.trangThai ?? 'THUONG_TRU',
      ghiChu: nk.ghiChu ?? '',
      daMat: nk.daMat ? 'true' : 'false',
      ngayMat: nk.ngayMat ?? '',
      noiSinh: nk.noiSinh ?? '',
      nguyenQuan: nk.nguyenQuan ?? '',
      danToc: nk.danToc ?? '',
      tonGiao: nk.tonGiao ?? '',
      quocTich: nk.quocTich ?? '',
      cccdNgayCap: nk.cccdNgayCap ?? '',
      cccdNoiCap: nk.cccdNoiCap ?? '',
      tinhTrangHonNhan: nk.tinhTrangHonNhan ?? '',
      noiLamViec: nk.noiLamViec ?? '',
      diaChiThuongTru: nk.diaChiThuongTru ?? '',
    })
    setFormError('')
    setModalMode(nk.id)
  }

  function closeModal() { setModalMode(null); setFormError('') }

  // ── Submit (thêm hoặc sửa) ──
  function handleSubmit() {
    if (!form.hoTen.trim()) { setFormError('Vui lòng nhập họ tên'); return }
    setFormError('')

    const fd = new FormData()
    // Không gửi daMat/ngayMat khi thêm mới — cột chỉ có sau migration 009
    // Chỉ gửi khi đang sửa (isEditing) để tránh lỗi nếu migration chưa chạy
    const { daMat: deadVal, ngayMat: deathDate, ...baseForm } = form
    Object.entries(baseForm).forEach(([k, v]) => fd.append(k, v))
    if (modalMode !== 'add') {
      fd.append('daMat', deadVal)
      fd.append('ngayMat', deathDate)
    }

    startSubmitting(async () => {
      if (modalMode === 'add') {
        const result = await themNhanKhau(hoId, fd)
        if (result.success) {
          toast.success(result.message)
          setItems(prev => [...prev, {
            id: `temp-${Date.now()}`, hoId,
            hoTen: form.hoTen, ngaySinh: form.ngaySinh || undefined,
            gioiTinh: form.gioiTinh, cccd: form.cccd, quanHe: form.quanHe,
            ngheNghiep: form.ngheNghiep, soDienThoai: form.soDienThoai,
            trangThai: form.trangThai, ghiChu: form.ghiChu,
            createdAt: new Date().toISOString(),
            daMat: false, ngayMat: null,
          }])
          closeModal()
        } else {
          toast.error(result.message, { duration: 6000 })
        }
      } else {
        // edit mode — modalMode = id
        const result = await capNhatNhanKhau(modalMode as string, hoId, fd)
        if (result.success) {
          toast.success(result.message)
          setItems(prev => prev.map(nk =>
            nk.id === modalMode
              ? { ...nk,
                  hoTen: form.hoTen, ngaySinh: form.ngaySinh || undefined,
                  gioiTinh: form.gioiTinh, cccd: form.cccd, quanHe: form.quanHe,
                  ngheNghiep: form.ngheNghiep, soDienThoai: form.soDienThoai,
                  trangThai: form.trangThai, ghiChu: form.ghiChu,
                  daMat: form.daMat === 'true',
                  ngayMat: form.daMat === 'true' ? (form.ngayMat || null) : null,
                }
              : nk
          ))
          closeModal()
        } else {
          toast.error(result.message, { duration: 6000 })
        }
      }
    })
  }

  // ── Đặt làm Chủ hộ ──
  function handleSetChuHo(nk: NhanKhauItem) {
    // Bước 1: click lần đầu → hiện confirm inline
    if (confirmChuHoId !== nk.id) {
      setConfirmChuHoId(nk.id)
      return
    }
    // Bước 2: click lần 2 → thực hiện
    setConfirmChuHoId(null)
    setSettingChuHoId(nk.id)
    startChuHo(async () => {
      const result = await doiChuHo(hoId, nk.id, nk.hoTen)
      if (result.success) {
        toast.success(result.message)
        setItems(prev => prev.map(item => ({
          ...item,
          quanHe: item.id === nk.id
            ? 'Chủ hộ'
            : item.quanHe === 'Chủ hộ'
              ? 'Thành viên khác'
              : item.quanHe,
        })))
      } else {
        toast.error(result.message)
      }
      setSettingChuHoId(null)
    })
  }

  // ── Xoá ──
  function handleDelete(id: string) {
    setDeletingId(id)
    startDeleting(async () => {
      const result = await xoaNhanKhau(id, hoId)
      if (result.success) {
        toast.success(result.message)
        setItems(prev => prev.filter(i => i.id !== id))
      } else {
        toast.error(result.message)
      }
      setDeletingId(null)
    })
  }

  const isEditing = modalMode !== null && modalMode !== 'add'

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-slate-800 flex items-center gap-2">
          <Users size={16} className="text-[#1E3A5F]" />
          Danh sách nhân khẩu
          <span className="text-slate-400 font-normal text-sm">({items.length} người)</span>
          {items.some(i => i.daMat) && (
            <span className="text-xs text-slate-400 font-normal">
              · {items.filter(i => i.daMat).length} đã mất
            </span>
          )}
        </h2>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1E3A5F] text-white text-xs font-semibold hover:bg-[#162d4a] transition-colors"
        >
          <UserPlus size={13} />
          Thêm nhân khẩu
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-10 text-slate-400">
          <User size={40} className="mx-auto mb-2 opacity-20" />
          <p className="text-sm">Chưa có nhân khẩu nào trong hộ</p>
          <button onClick={openAdd} className="mt-3 text-xs text-[#8B1A1A] hover:underline">
            Thêm nhân khẩu đầu tiên
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70">
                <th className="text-left px-5 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Họ tên</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">Ngày sinh</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Quan hệ</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">CCCD</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Cư trú</th>
                <th className="px-4 py-2.5 w-20" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {items.map((nk) => {
                const tuoi = tinhTuoi(nk.ngaySinh)
                const ttCfg = TRANG_THAI_NK[nk.trangThai] ?? TRANG_THAI_NK['THUONG_TRU']!
                const isDeleting = deletingId === nk.id
                const isChuHo = nk.quanHe === 'Chủ hộ'

                return (
                  <tr
                    key={nk.id}
                    className={`transition-colors group ${
                      nk.daMat
                        ? 'bg-slate-50/80 opacity-70'
                        : isChuHo
                          ? 'bg-amber-50/60 hover:bg-amber-50 border-l-4 border-l-amber-400'
                          : 'hover:bg-slate-50'
                    }`}
                  >
                    {/* Họ tên */}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          nk.daMat ? 'bg-slate-200' : isChuHo ? 'bg-amber-100' : 'bg-blue-50'
                        }`}>
                          {nk.daMat
                            ? <Skull size={14} className="text-slate-400" />
                            : isChuHo
                              ? <Crown size={14} className="text-amber-600" />
                              : <User size={14} className="text-[#1E3A5F]" />
                          }
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className={`font-semibold ${
                              nk.daMat ? 'text-slate-400 line-through' : isChuHo ? 'text-amber-800' : 'text-slate-900'
                            }`}>
                              {nk.hoTen}
                            </p>
                            {nk.daMat && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-500 text-[10px] font-bold">
                                <Skull size={9} /> Đã mất
                              </span>
                            )}
                            {!nk.daMat && isChuHo && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-amber-200 text-amber-800 text-[10px] font-bold">
                                <Crown size={9} /> Chủ hộ
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400">
                            {GIOI_TINH_LABEL[nk.gioiTinh] ?? nk.gioiTinh}
                            {nk.ngheNghiep ? ` · ${nk.ngheNghiep}` : ''}
                          </p>
                          {nk.daMat && nk.ngayMat && (
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              Mất ngày: {formatDate(nk.ngayMat)}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Ngày sinh */}
                    <td className="px-4 py-3 hidden sm:table-cell">
                      {nk.ngaySinh ? (
                        <div>
                          <p className="text-slate-700">{formatDate(nk.ngaySinh)}</p>
                          {tuoi !== null && <p className="text-xs text-slate-400">{tuoi} tuổi</p>}
                        </div>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>

                    {/* Quan hệ */}
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-slate-700">{nk.quanHe || '—'}</span>
                    </td>

                    {/* CCCD */}
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-slate-500 font-mono text-xs">{nk.cccd || '—'}</span>
                    </td>

                    {/* Cư trú */}
                    <td className="px-4 py-3">
                      {nk.daMat ? (
                        <span className="badge badge-gray">Đã mất</span>
                      ) : (
                        <span className={`badge ${ttCfg.badge}`}>{ttCfg.label}</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      {/* Inline confirm "Đặt làm Chủ hộ" */}
                      {confirmChuHoId === nk.id ? (
                        <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1">
                          <span className="text-[10px] text-amber-700 font-medium whitespace-nowrap">Xác nhận?</span>
                          <button
                            onClick={() => handleSetChuHo(nk)}
                            className="text-[10px] px-1.5 py-0.5 bg-amber-500 text-white rounded font-bold hover:bg-amber-600"
                          >
                            Đặt
                          </button>
                          <button
                            onClick={() => setConfirmChuHoId(null)}
                            className="text-[10px] px-1 py-0.5 text-slate-500 hover:text-slate-700"
                          >
                            Huỷ
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {/* Đặt làm Chủ hộ — chỉ hiện với thành viên còn sống, không phải chủ hộ */}
                          {!isChuHo && !nk.daMat && (
                            <button
                              onClick={() => handleSetChuHo(nk)}
                              disabled={settingChuHoId === nk.id}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors disabled:opacity-40"
                              title="Đặt làm Chủ hộ"
                            >
                              {settingChuHoId === nk.id
                                ? <Loader2 size={14} className="animate-spin" />
                                : <Star size={14} />
                              }
                            </button>
                          )}
                          <button
                            onClick={() => openEdit(nk)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-[#1E3A5F] hover:bg-blue-50 transition-colors"
                            title="Chỉnh sửa"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(nk.id)}
                            disabled={isDeleting}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
                            title="Xoá nhân khẩu"
                          >
                            {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ─── Modal thêm / sửa ────────────────────────────────── */}
      {modalMode !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
            >
              <X size={18} />
            </button>

            {/* Header modal */}
            <div className="flex items-center gap-3 mb-5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isEditing ? 'bg-amber-50' : 'bg-blue-50'
              }`}>
                {isEditing
                  ? <Pencil size={18} className="text-amber-600" />
                  : <UserPlus size={20} className="text-[#1E3A5F]" />
                }
              </div>
              <div>
                <h3 className="font-bold text-slate-900">
                  {isEditing ? 'Chỉnh sửa nhân khẩu' : 'Thêm nhân khẩu'}
                </h3>
                <p className="text-slate-400 text-sm">
                  {isEditing ? 'Cập nhật thông tin thành viên' : 'Đăng ký thành viên trong hộ'}
                </p>
              </div>
            </div>

            <div className="space-y-4">

              {/* ── Tình trạng sống (chỉ hiện khi đang sửa) ── */}
              {isEditing && (
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                    <Skull size={13} className="text-slate-400" />
                    Tình trạng sống
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setForm(p => ({ ...p, daMat: 'false', ngayMat: '' }))}
                      className={`flex-1 py-2 rounded-lg border-2 text-sm font-semibold transition-all ${
                        !isDead
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : 'border-slate-200 text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      ✅ Còn sống
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm(p => ({ ...p, daMat: 'true' }))}
                      className={`flex-1 py-2 rounded-lg border-2 text-sm font-semibold transition-all ${
                        isDead
                          ? 'border-slate-500 bg-slate-100 text-slate-700'
                          : 'border-slate-200 text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      🕯️ Đã mất
                    </button>
                  </div>
                  {isDead && (
                    <div className="mt-3 space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Ngày mất</label>
                        <input
                          type="date"
                          value={form.ngayMat}
                          onChange={(e) => setForm(p => ({ ...p, ngayMat: e.target.value }))}
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      {/* Cảnh báo riêng khi chủ hộ đã mất */}
                      {form.quanHe === 'Chủ hộ' && (
                        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
                          <AlertTriangle size={14} className="text-amber-600 shrink-0 mt-0.5" />
                          <p className="text-xs text-amber-700 leading-relaxed">
                            <strong>Lưu ý:</strong> Đây là Chủ hộ. Hộ dân vẫn được{' '}
                            <strong>giữ nguyên</strong> vì các thành viên khác còn sinh sống
                            tại địa chỉ này. Sau khi lưu, hãy vào <em>Chỉnh sửa hộ dân</em>{' '}
                            để cập nhật chủ hộ mới.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Họ tên */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  <User size={13} className="inline mr-1" />
                  Họ tên <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.hoTen}
                  onChange={(e) => { setForm(p => ({ ...p, hoTen: e.target.value })); setFormError('') }}
                  className={`input ${formError ? 'border-red-400' : ''}`}
                  placeholder="Nguyễn Thị B"
                />
                {formError && <p className="text-red-500 text-xs mt-1">{formError}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Ngày sinh */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    <Calendar size={13} className="inline mr-1" />
                    Ngày sinh
                  </label>
                  <input
                    type="date"
                    value={form.ngaySinh}
                    onChange={(e) => setForm(p => ({ ...p, ngaySinh: e.target.value }))}
                    className="input"
                  />
                </div>
                {/* Giới tính */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Giới tính</label>
                  <select
                    value={form.gioiTinh}
                    onChange={(e) => setForm(p => ({ ...p, gioiTinh: e.target.value }))}
                    className="input"
                  >
                    <option value="NAM">Nam</option>
                    <option value="NU">Nữ</option>
                    <option value="KHAC">Khác</option>
                  </select>
                </div>
              </div>

              {/* CCCD */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  <CreditCard size={13} className="inline mr-1" />
                  Số CCCD / CMND
                </label>
                <input
                  value={form.cccd}
                  onChange={(e) => setForm(p => ({ ...p, cccd: e.target.value }))}
                  className="input"
                  placeholder="079 xxx xxx xxx"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Quan hệ */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Quan hệ chủ hộ</label>
                  <select
                    value={form.quanHe}
                    onChange={(e) => setForm(p => ({ ...p, quanHe: e.target.value }))}
                    className="input"
                  >
                    {QUAN_HE_OPTIONS.map(q => <option key={q} value={q}>{q}</option>)}
                  </select>
                </div>
                {/* Cư trú — ẩn khi đã mất */}
                {!isDead && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Tình trạng cư trú</label>
                    <select
                      value={form.trangThai}
                      onChange={(e) => setForm(p => ({ ...p, trangThai: e.target.value }))}
                      className="input"
                    >
                      <option value="THUONG_TRU">Thường trú</option>
                      <option value="TAM_TRU">Tạm trú</option>
                      <option value="TAM_VANG">Tạm vắng</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Nghề nghiệp + SĐT */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    <Briefcase size={13} className="inline mr-1" />
                    Nghề nghiệp
                  </label>
                  <input
                    value={form.ngheNghiep}
                    onChange={(e) => setForm(p => ({ ...p, ngheNghiep: e.target.value }))}
                    className="input"
                    placeholder="Học sinh, Công nhân..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Số điện thoại</label>
                  <input
                    value={form.soDienThoai}
                    onChange={(e) => setForm(p => ({ ...p, soDienThoai: e.target.value }))}
                    className="input"
                    placeholder="09xx xxx xxx"
                    type="tel"
                  />
                </div>
              </div>

              {/* ── Thông tin chi tiết (mở rộng) ── */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowChiTiet(s => !s)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <span className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <CreditCard size={14} className="text-slate-400" />
                    Thông tin chi tiết
                    <span className="text-xs font-normal text-slate-400">(nơi sinh, dân tộc, hôn nhân, CCCD...)</span>
                  </span>
                  <ChevronDown size={16} className={`text-slate-400 transition-transform ${showChiTiet ? 'rotate-180' : ''}`} />
                </button>

                {showChiTiet && (
                  <div className="p-4 space-y-3 border-t border-slate-100">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Nơi sinh</label>
                        <input value={form.noiSinh} onChange={e => setForm(p => ({ ...p, noiSinh: e.target.value }))} className="input" placeholder="Tỉnh/thành" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Nguyên quán</label>
                        <input value={form.nguyenQuan} onChange={e => setForm(p => ({ ...p, nguyenQuan: e.target.value }))} className="input" placeholder="Quê quán" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Dân tộc</label>
                        <input value={form.danToc} onChange={e => setForm(p => ({ ...p, danToc: e.target.value }))} className="input" placeholder="Kinh" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Tôn giáo</label>
                        <input value={form.tonGiao} onChange={e => setForm(p => ({ ...p, tonGiao: e.target.value }))} className="input" placeholder="Không" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Quốc tịch</label>
                        <input value={form.quocTich} onChange={e => setForm(p => ({ ...p, quocTich: e.target.value }))} className="input" placeholder="Việt Nam" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Tình trạng hôn nhân</label>
                        <select value={form.tinhTrangHonNhan} onChange={e => setForm(p => ({ ...p, tinhTrangHonNhan: e.target.value }))} className="input">
                          <option value="">— Chọn —</option>
                          <option value="DOC_THAN">Độc thân</option>
                          <option value="DA_KET_HON">Đã kết hôn</option>
                          <option value="LY_HON">Ly hôn</option>
                          <option value="GOA">Góa</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Ngày cấp CCCD</label>
                        <input type="date" value={form.cccdNgayCap} onChange={e => setForm(p => ({ ...p, cccdNgayCap: e.target.value }))} className="input" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Nơi cấp CCCD</label>
                        <input value={form.cccdNoiCap} onChange={e => setForm(p => ({ ...p, cccdNoiCap: e.target.value }))} className="input" placeholder="Cục CSQLHC..." />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Nơi làm việc / học tập</label>
                      <input value={form.noiLamViec} onChange={e => setForm(p => ({ ...p, noiLamViec: e.target.value }))} className="input" placeholder="Cơ quan, trường học..." />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Địa chỉ thường trú</label>
                      <input value={form.diaChiThuongTru} onChange={e => setForm(p => ({ ...p, diaChiThuongTru: e.target.value }))} className="input" placeholder="Địa chỉ thường trú đầy đủ" />
                    </div>
                  </div>
                )}
              </div>

              {/* Ghi chú */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Ghi chú</label>
                <textarea
                  value={form.ghiChu}
                  onChange={(e) => setForm(p => ({ ...p, ghiChu: e.target.value }))}
                  className="input resize-none"
                  rows={2}
                  placeholder="Ghi chú thêm..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={closeModal}
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Huỷ
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`flex-1 py-2.5 rounded-xl text-white text-sm font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${
                  isEditing
                    ? 'bg-amber-500 hover:bg-amber-600'
                    : 'bg-[#1E3A5F] hover:bg-[#162d4a]'
                }`}
              >
                {isSubmitting
                  ? <Loader2 size={15} className="animate-spin" />
                  : isEditing ? <Pencil size={15} /> : <UserPlus size={15} />
                }
                {isEditing ? 'Lưu thay đổi' : 'Thêm nhân khẩu'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
