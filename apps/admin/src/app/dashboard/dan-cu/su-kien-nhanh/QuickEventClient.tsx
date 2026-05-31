'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import toast from 'react-hot-toast'
import {
  Baby, Skull, LogIn, LogOut, Home, MapPinned, RotateCcw,
  HandCoins, TrendingUp, Pencil, Search, ChevronLeft,
  Loader2, Check, User,
} from 'lucide-react'
import {
  suKienSinh, suKienMat, suKienChuyenTrangThai, suKienChuyenDi,
  suKienHoNgheo, suKienThoatNgheo, suKienCapNhatKhac, layNhanKhauTheoHo,
  type LoaiSuKien,
} from './actions'

// ─── Cấu hình loại sự kiện ───────────────────────────────────
type EventCfg = {
  loai:    LoaiSuKien
  label:   string
  desc:    string
  icon:    React.ElementType
  color:   string   // text color
  bg:      string   // background
  border:  string
  // Loại form: 'newPerson' | 'pickPerson' | 'household' | 'freeText'
  formType: 'newPerson' | 'pickPerson' | 'household' | 'freeText'
}

const EVENTS: EventCfg[] = [
  { loai: 'SINH',          label: 'Khai sinh',      desc: 'Thêm nhân khẩu mới',       icon: Baby,      color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', formType: 'newPerson' },
  { loai: 'MAT',           label: 'Khai tử',        desc: 'Ghi nhận người đã mất',    icon: Skull,     color: 'text-slate-700',   bg: 'bg-slate-50',   border: 'border-slate-200',   formType: 'pickPerson' },
  { loai: 'CHUYEN_DEN',    label: 'Chuyển đến',     desc: 'Nhập hộ khẩu mới',         icon: LogIn,     color: 'text-blue-700',    bg: 'bg-blue-50',    border: 'border-blue-200',    formType: 'newPerson' },
  { loai: 'CHUYEN_DI',     label: 'Chuyển đi',      desc: 'Rời khỏi hộ',              icon: LogOut,    color: 'text-orange-700',  bg: 'bg-orange-50',  border: 'border-orange-200',  formType: 'pickPerson' },
  { loai: 'TAM_TRU',       label: 'Tạm trú',        desc: 'Đăng ký tạm trú',          icon: MapPinned, color: 'text-cyan-700',    bg: 'bg-cyan-50',    border: 'border-cyan-200',    formType: 'pickPerson' },
  { loai: 'TAM_VANG',      label: 'Tạm vắng',       desc: 'Khai báo tạm vắng',        icon: MapPinned, color: 'text-amber-700',   bg: 'bg-amber-50',   border: 'border-amber-200',   formType: 'pickPerson' },
  { loai: 'VE_THUONG_TRU', label: 'Về thường trú',  desc: 'Hết tạm trú/vắng',         icon: RotateCcw, color: 'text-teal-700',    bg: 'bg-teal-50',    border: 'border-teal-200',    formType: 'pickPerson' },
  { loai: 'HO_NGHEO',      label: 'Hộ nghèo',       desc: 'Công nhận nghèo/cận nghèo',icon: HandCoins, color: 'text-red-700',     bg: 'bg-red-50',     border: 'border-red-200',     formType: 'household' },
  { loai: 'THOAT_NGHEO',   label: 'Thoát nghèo',    desc: 'Ra khỏi danh sách nghèo',  icon: TrendingUp,color: 'text-green-700',   bg: 'bg-green-50',   border: 'border-green-200',   formType: 'household' },
  { loai: 'CAP_NHAT',      label: 'Sự kiện khác',   desc: 'Ghi nhận tự do',           icon: Pencil,    color: 'text-violet-700',  bg: 'bg-violet-50',  border: 'border-violet-200',  formType: 'freeText' },
]

// ─── Types ───────────────────────────────────────────────────
interface HoDan { id: string; ma_ho: string; chu_ho: string; dia_chi_day: string | null }
interface NhanKhau { id: string; ho_ten: string; quan_he: string; ngay_sinh: string | null; gioi_tinh: string; trang_thai: string; da_mat: boolean }

const today = () => new Date().toISOString().split('T')[0]!

// Class chung cho input/select/textarea
const INP = 'w-full px-3.5 py-2.5 rounded-xl border-[1.5px] border-slate-200 text-sm text-slate-800 ' +
  'bg-white transition-all focus:outline-none focus:border-[#1E3A5F] focus:ring-4 focus:ring-[#1E3A5F]/10'

// ════════════════════════════════════════════════════════════
export default function QuickEventClient() {
  const [step, setStep]       = useState<1 | 2 | 3>(1)
  const [event, setEvent]     = useState<EventCfg | null>(null)
  const [hoDan, setHoDan]     = useState<HoDan | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function reset() {
    setStep(1); setEvent(null); setHoDan(null); setSubmitting(false)
  }

  function chonEvent(e: EventCfg) {
    setEvent(e)
    if (e.formType === 'freeText') {
      setStep(3)  // không cần chọn hộ
    } else {
      setStep(2)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress indicator */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {[1, 2, 3].map(s => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
              ${step >= s ? 'bg-[#1E3A5F] text-white' : 'bg-slate-100 text-slate-400'}`}>
              {step > s ? <Check size={13} /> : s}
            </div>
            {s < 3 && <div className={`w-8 h-0.5 ${step > s ? 'bg-[#1E3A5F]' : 'bg-slate-200'}`} />}
          </div>
        ))}
      </div>

      {/* STEP 1: Chọn loại sự kiện */}
      {step === 1 && (
        <div>
          <h2 className="text-center font-bold text-slate-800 mb-1">Chọn loại sự kiện</h2>
          <p className="text-center text-sm text-slate-400 mb-5">Nhấn vào loại biến động cần ghi nhận</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {EVENTS.map(e => {
              const Icon = e.icon
              return (
                <button
                  key={e.loai}
                  onClick={() => chonEvent(e)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 ${e.bg} ${e.border}
                             hover:shadow-md hover:scale-[1.02] active:scale-95 transition-all`}
                >
                  <div className={`w-11 h-11 rounded-xl bg-white flex items-center justify-center ${e.border} border`}>
                    <Icon size={22} className={e.color} />
                  </div>
                  <div className="text-center">
                    <p className={`font-bold text-sm ${e.color}`}>{e.label}</p>
                    <p className="text-[10px] text-slate-400 leading-tight mt-0.5">{e.desc}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* STEP 2: Chọn hộ dân */}
      {step === 2 && event && (
        <Step2ChonHo
          event={event}
          onBack={() => { setStep(1); setEvent(null) }}
          onNext={(ho) => { setHoDan(ho); setStep(3) }}
        />
      )}

      {/* STEP 3: Form chi tiết */}
      {step === 3 && event && (
        <Step3Form
          event={event}
          hoDan={hoDan}
          submitting={submitting}
          setSubmitting={setSubmitting}
          onBack={() => setStep(event.formType === 'freeText' ? 1 : 2)}
          onDone={reset}
        />
      )}
    </div>
  )
}

// ════════════════════════════════════════════════════════════
//  STEP 2: Tìm và chọn hộ dân
// ════════════════════════════════════════════════════════════
function Step2ChonHo({ event, onBack, onNext }: {
  event: EventCfg
  onBack: () => void
  onNext: (ho: HoDan) => void
}) {
  const [query, setQuery]     = useState('')
  const [results, setResults] = useState<HoDan[]>([])
  const [loading, setLoading] = useState(false)
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null)

  const search = useCallback(async (q: string) => {
    if (q.trim().length < 1) { setResults([]); return }
    setLoading(true)
    try {
      const res = await fetch(`/api/ho-dan?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setResults(Array.isArray(data) ? data : (data.data ?? []))
    } catch { setResults([]) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current)
    debounce.current = setTimeout(() => search(query), 300)
    return () => { if (debounce.current) clearTimeout(debounce.current) }
  }, [query, search])

  const Icon = event.icon

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4">
        <ChevronLeft size={15} /> Chọn lại loại sự kiện
      </button>

      <div className={`flex items-center gap-3 p-3 rounded-xl ${event.bg} ${event.border} border mb-4`}>
        <Icon size={18} className={event.color} />
        <span className={`font-bold text-sm ${event.color}`}>{event.label}</span>
      </div>

      <h2 className="font-bold text-slate-800 mb-1">Chọn hộ dân</h2>
      <p className="text-sm text-slate-400 mb-3">Tìm theo tên chủ hộ, mã hộ hoặc địa chỉ</p>

      <div className="relative mb-3">
        <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          autoFocus
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Nhập tên chủ hộ, mã hộ..."
          className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-[#1E3A5F]
                     focus:outline-none focus:ring-4 focus:ring-[#1E3A5F]/10 text-sm transition-all"
        />
        {loading && <Loader2 size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 animate-spin" />}
      </div>

      <div className="space-y-2 max-h-[50vh] overflow-y-auto">
        {results.map(ho => (
          <button
            key={ho.id}
            onClick={() => onNext(ho)}
            className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 bg-white
                       hover:border-[#1E3A5F] hover:shadow-sm transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 group-hover:bg-[#1E3A5F]/10">
              <Home size={17} className="text-slate-500 group-hover:text-[#1E3A5F]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-800 text-sm">{ho.chu_ho}</p>
              <p className="text-xs text-slate-400 truncate">{ho.ma_ho} · {ho.dia_chi_day}</p>
            </div>
          </button>
        ))}
        {query.length >= 1 && !loading && results.length === 0 && (
          <div className="text-center py-8 text-sm text-slate-400">
            Không tìm thấy hộ dân nào khớp &quot;{query}&quot;
          </div>
        )}
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════
//  STEP 3: Form chi tiết theo loại sự kiện
// ════════════════════════════════════════════════════════════
function Step3Form({ event, hoDan, submitting, setSubmitting, onBack, onDone }: {
  event: EventCfg
  hoDan: HoDan | null
  submitting: boolean
  setSubmitting: (v: boolean) => void
  onBack: () => void
  onDone: () => void
}) {
  // form state
  const [hoTen, setHoTen]       = useState('')
  const [ngaySinh, setNgaySinh] = useState('')
  const [gioiTinh, setGioiTinh] = useState<'NAM' | 'NU' | 'KHAC'>('NAM')
  const [quanHe, setQuanHe]     = useState('Con')
  const [trangThaiMoi, setTrangThaiMoi] = useState<'THUONG_TRU' | 'TAM_TRU'>('THUONG_TRU')
  const [ngay, setNgay]         = useState(today())
  const [diaChi, setDiaChi]     = useState('')
  const [lyDo, setLyDo]         = useState('')
  const [noiDen, setNoiDen]     = useState('')
  const [nguyenNhan, setNguyenNhan] = useState('')
  const [loaiNgheo, setLoaiNgheo]   = useState<'NGHEO' | 'CAN_NGHEO'>('NGHEO')
  const [quyetDinh, setQuyetDinh]   = useState('')
  const [moTaTuDo, setMoTaTuDo]     = useState('')
  const [loaiTuDo, setLoaiTuDo]     = useState<'CAP_NHAT' | 'KET_HON' | 'KHAC'>('CAP_NHAT')

  // pickPerson state
  const [nhanKhau, setNhanKhau] = useState<NhanKhau[]>([])
  const [pickedNK, setPickedNK] = useState<NhanKhau | null>(null)
  const [loadingNK, setLoadingNK] = useState(false)

  // Load nhân khẩu nếu cần
  useEffect(() => {
    if (event.formType === 'pickPerson' && hoDan) {
      setLoadingNK(true)
      layNhanKhauTheoHo(hoDan.id)
        .then(setNhanKhau)
        .finally(() => setLoadingNK(false))
    }
  }, [event.formType, hoDan])

  async function submit() {
    setSubmitting(true)
    try {
      let res: { success: boolean; message: string }

      switch (event.loai) {
        case 'SINH':
        case 'CHUYEN_DEN':
          if (!hoTen.trim()) { toast.error('Vui lòng nhập họ tên'); setSubmitting(false); return }
          if (event.loai === 'CHUYEN_DEN' && trangThaiMoi === 'TAM_TRU') {
            // Chuyển đến dạng tạm trú → thêm rồi đổi trạng thái
            res = await suKienSinh({ hoId: hoDan!.id, hoTen, ngaySinh, gioiTinh, quanHe, ghiChu: 'Chuyển đến (tạm trú)' })
          } else {
            res = await suKienSinh({ hoId: hoDan!.id, hoTen, ngaySinh, gioiTinh, quanHe })
          }
          break

        case 'MAT':
          if (!pickedNK) { toast.error('Vui lòng chọn người'); setSubmitting(false); return }
          res = await suKienMat({ nhanKhauId: pickedNK.id, hoId: hoDan!.id, hoTen: pickedNK.ho_ten, ngayMat: ngay, nguyenNhan })
          break

        case 'CHUYEN_DI':
          if (!pickedNK) { toast.error('Vui lòng chọn người'); setSubmitting(false); return }
          res = await suKienChuyenDi({ nhanKhauId: pickedNK.id, hoId: hoDan!.id, hoTen: pickedNK.ho_ten, ngayDi: ngay, noiDen, lyDo })
          break

        case 'TAM_TRU':
        case 'TAM_VANG':
        case 'VE_THUONG_TRU':
          if (!pickedNK) { toast.error('Vui lòng chọn người'); setSubmitting(false); return }
          res = await suKienChuyenTrangThai({
            nhanKhauId: pickedNK.id, hoId: hoDan!.id, hoTen: pickedNK.ho_ten,
            trangThaiMoi: event.loai === 'VE_THUONG_TRU' ? 'THUONG_TRU' : event.loai,
            diaChiMoi: diaChi, lyDo, ngayBatDau: ngay,
          })
          break

        case 'HO_NGHEO':
          res = await suKienHoNgheo({ hoId: hoDan!.id, loai: loaiNgheo, quyetDinhSo: quyetDinh, ngayQuyetDinh: ngay, lyDo })
          break

        case 'THOAT_NGHEO':
          res = await suKienThoatNgheo({ hoId: hoDan!.id, ngayThoat: ngay, lyDo })
          break

        default:
          if (!moTaTuDo.trim()) { toast.error('Vui lòng nhập mô tả'); setSubmitting(false); return }
          res = await suKienCapNhatKhac({ hoId: hoDan?.id, loai: loaiTuDo, moTa: moTaTuDo, ngaySuKien: ngay })
      }

      if (res.success) {
        toast.success(res.message)
        onDone()
      } else {
        toast.error(res.message)
      }
    } catch {
      toast.error('Lỗi hệ thống. Vui lòng thử lại.')
    } finally {
      setSubmitting(false)
    }
  }

  const Icon = event.icon

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4">
        <ChevronLeft size={15} /> Quay lại
      </button>

      {/* Header sự kiện + hộ */}
      <div className={`flex items-center gap-3 p-3 rounded-xl ${event.bg} ${event.border} border mb-4`}>
        <Icon size={18} className={event.color} />
        <div className="min-w-0">
          <p className={`font-bold text-sm ${event.color}`}>{event.label}</p>
          {hoDan && <p className="text-xs text-slate-500 truncate">{hoDan.chu_ho} · {hoDan.dia_chi_day}</p>}
        </div>
      </div>

      <div className="space-y-4">

        {/* ── Form: Thêm người mới (SINH / CHUYEN_DEN) ── */}
        {event.formType === 'newPerson' && (
          <>
            <Field label="Họ và tên" required>
              <input value={hoTen} onChange={e => setHoTen(e.target.value)} placeholder="Nguyễn Văn A"
                className={INP} autoFocus />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Ngày sinh">
                <input type="date" value={ngaySinh} onChange={e => setNgaySinh(e.target.value)} max={today()} className={INP} />
              </Field>
              <Field label="Giới tính">
                <select value={gioiTinh} onChange={e => setGioiTinh(e.target.value as 'NAM' | 'NU' | 'KHAC')} className={INP}>
                  <option value="NAM">Nam</option>
                  <option value="NU">Nữ</option>
                  <option value="KHAC">Khác</option>
                </select>
              </Field>
            </div>
            <Field label="Quan hệ với chủ hộ">
              <select value={quanHe} onChange={e => setQuanHe(e.target.value)} className={INP}>
                {['Con', 'Vợ / Chồng', 'Cha / Mẹ', 'Anh / Chị / Em', 'Ông / Bà', 'Cháu', 'Thành viên khác'].map(q => (
                  <option key={q} value={q}>{q}</option>
                ))}
              </select>
            </Field>
            {event.loai === 'CHUYEN_DEN' && (
              <Field label="Hình thức">
                <div className="flex gap-2">
                  {([['THUONG_TRU', 'Thường trú'], ['TAM_TRU', 'Tạm trú']] as const).map(([v, l]) => (
                    <button key={v} type="button" onClick={() => setTrangThaiMoi(v)}
                      className={`flex-1 py-2 rounded-xl text-sm font-semibold border-2 transition-all
                        ${trangThaiMoi === v ? 'border-[#1E3A5F] bg-[#1E3A5F]/5 text-[#1E3A5F]' : 'border-slate-200 text-slate-500'}`}>
                      {l}
                    </button>
                  ))}
                </div>
              </Field>
            )}
          </>
        )}

        {/* ── Form: Chọn người có sẵn (MAT, CHUYEN_DI, TAM_TRU...) ── */}
        {event.formType === 'pickPerson' && (
          <>
            <Field label="Chọn người" required>
              {loadingNK ? (
                <div className="flex items-center gap-2 text-sm text-slate-400 py-3">
                  <Loader2 size={15} className="animate-spin" /> Đang tải danh sách...
                </div>
              ) : nhanKhau.length === 0 ? (
                <p className="text-sm text-slate-400 py-2">Hộ này chưa có nhân khẩu nào.</p>
              ) : (
                <div className="space-y-2 max-h-52 overflow-y-auto">
                  {nhanKhau.filter(nk => event.loai === 'MAT' ? !nk.da_mat : !nk.da_mat).map(nk => (
                    <button key={nk.id} type="button" onClick={() => setPickedNK(nk)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left
                        ${pickedNK?.id === nk.id ? 'border-[#1E3A5F] bg-[#1E3A5F]/5' : 'border-slate-200 hover:border-slate-300'}`}>
                      <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                        <User size={15} className="text-slate-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-slate-800">{nk.ho_ten}</p>
                        <p className="text-xs text-slate-400">{nk.quan_he} · {nk.gioi_tinh === 'NAM' ? 'Nam' : nk.gioi_tinh === 'NU' ? 'Nữ' : 'Khác'}</p>
                      </div>
                      {pickedNK?.id === nk.id && <Check size={16} className="text-[#1E3A5F]" />}
                    </button>
                  ))}
                </div>
              )}
            </Field>

            {/* Ngày + chi tiết theo loại */}
            <Field label={event.loai === 'MAT' ? 'Ngày mất' : event.loai === 'CHUYEN_DI' ? 'Ngày chuyển đi' : 'Ngày bắt đầu'} required>
              <input type="date" value={ngay} onChange={e => setNgay(e.target.value)} className={INP} />
            </Field>

            {event.loai === 'MAT' && (
              <Field label="Nguyên nhân (nếu có)">
                <input value={nguyenNhan} onChange={e => setNguyenNhan(e.target.value)} placeholder="Bệnh, tuổi già..." className={INP} />
              </Field>
            )}
            {event.loai === 'CHUYEN_DI' && (
              <>
                <Field label="Nơi đến">
                  <input value={noiDen} onChange={e => setNoiDen(e.target.value)} placeholder="Tỉnh/thành, địa chỉ mới" className={INP} />
                </Field>
                <Field label="Lý do">
                  <input value={lyDo} onChange={e => setLyDo(e.target.value)} placeholder="Làm việc, học tập..." className={INP} />
                </Field>
              </>
            )}
            {(event.loai === 'TAM_TRU' || event.loai === 'TAM_VANG') && (
              <>
                <Field label={event.loai === 'TAM_TRU' ? 'Địa chỉ tạm trú' : 'Nơi tạm vắng'}>
                  <input value={diaChi} onChange={e => setDiaChi(e.target.value)} placeholder="Địa chỉ" className={INP} />
                </Field>
                <Field label="Lý do">
                  <input value={lyDo} onChange={e => setLyDo(e.target.value)} placeholder="Làm việc, học tập..." className={INP} />
                </Field>
              </>
            )}
          </>
        )}

        {/* ── Form: Hộ nghèo / Thoát nghèo ── */}
        {event.formType === 'household' && (
          <>
            {event.loai === 'HO_NGHEO' && (
              <Field label="Loại">
                <div className="flex gap-2">
                  {([['NGHEO', 'Hộ nghèo'], ['CAN_NGHEO', 'Hộ cận nghèo']] as const).map(([v, l]) => (
                    <button key={v} type="button" onClick={() => setLoaiNgheo(v)}
                      className={`flex-1 py-2 rounded-xl text-sm font-semibold border-2 transition-all
                        ${loaiNgheo === v ? 'border-red-500 bg-red-50 text-red-700' : 'border-slate-200 text-slate-500'}`}>
                      {l}
                    </button>
                  ))}
                </div>
              </Field>
            )}
            <Field label={event.loai === 'HO_NGHEO' ? 'Ngày quyết định' : 'Ngày thoát nghèo'} required>
              <input type="date" value={ngay} onChange={e => setNgay(e.target.value)} className={INP} />
            </Field>
            {event.loai === 'HO_NGHEO' && (
              <Field label="Số quyết định (nếu có)">
                <input value={quyetDinh} onChange={e => setQuyetDinh(e.target.value)} placeholder="VD: 123/QĐ-UBND" className={INP} />
              </Field>
            )}
            <Field label="Lý do / Ghi chú">
              <input value={lyDo} onChange={e => setLyDo(e.target.value)} placeholder="Hoàn cảnh, ghi chú thêm" className={INP} />
            </Field>
          </>
        )}

        {/* ── Form: Tự do ── */}
        {event.formType === 'freeText' && (
          <>
            <Field label="Loại sự kiện">
              <select value={loaiTuDo} onChange={e => setLoaiTuDo(e.target.value as 'CAP_NHAT' | 'KET_HON' | 'KHAC')} className={INP}>
                <option value="CAP_NHAT">Cập nhật thông tin</option>
                <option value="KET_HON">Kết hôn</option>
                <option value="KHAC">Khác</option>
              </select>
            </Field>
            <Field label="Ngày sự kiện">
              <input type="date" value={ngay} onChange={e => setNgay(e.target.value)} className={INP} />
            </Field>
            <Field label="Mô tả sự kiện" required>
              <textarea value={moTaTuDo} onChange={e => setMoTaTuDo(e.target.value)} rows={3}
                placeholder="Mô tả chi tiết sự kiện cần ghi nhận..." className={`${INP} resize-none`} autoFocus />
            </Field>
          </>
        )}

        {/* Submit */}
        <button onClick={submit} disabled={submitting}
          className="w-full py-3.5 bg-[#1E3A5F] text-white font-bold text-sm rounded-xl
                     hover:bg-[#162d4a] disabled:opacity-60 flex items-center justify-center gap-2 transition-all mt-2">
          {submitting ? <><Loader2 size={16} className="animate-spin" /> Đang ghi nhận...</> : <><Check size={16} /> Ghi nhận sự kiện</>}
        </button>
      </div>
    </div>
  )
}

// ─── Field wrapper ───────────────────────────────────────────
function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  )
}
