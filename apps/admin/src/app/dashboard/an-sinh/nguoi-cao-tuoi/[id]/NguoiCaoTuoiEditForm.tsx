'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Save, Users, Heart, AlertTriangle,
  Phone, User, Shield, Banknote, HeartPulse,
  Skull, CheckCircle2,
} from 'lucide-react'
import { capNhatNCT, type NguoiCaoTuoiRecord } from '../actions'
import { SK_LABEL } from '../constants'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

interface Props { nct: NguoiCaoTuoiRecord }

// ── Helpers ────────────────────────────────────────────────────
function Field({ label, children, col2 = false }: { label: string; children: React.ReactNode; col2?: boolean }) {
  return (
    <div className={col2 ? 'col-span-2' : ''}>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      {children}
    </div>
  )
}

function Input({ name, type = 'text', defaultValue = '', placeholder = '', className = '', mono = false }: {
  name: string; type?: string; defaultValue?: string | number; placeholder?: string; className?: string; mono?: boolean
}) {
  return (
    <input
      name={name}
      type={type}
      defaultValue={defaultValue as string}
      placeholder={placeholder}
      className={`w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${mono ? 'font-mono' : ''} ${className}`}
    />
  )
}

const INPUT_CLS = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'

// ── Component ──────────────────────────────────────────────────
export default function NguoiCaoTuoiEditForm({ nct }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError]     = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [daMat, setDaMat]     = useState(nct.da_mat ?? false)
  const [coLuongHuu, setCoLuongHuu]   = useState(nct.co_luong_huu)
  const [coBHYT, setCoBHYT]           = useState(nct.co_bhyt)
  const [nhanTroCap, setNhanTroCap]   = useState(nct.nhan_tro_cap_xh)
  const [coNguoiCS, setCoNguoiCS]     = useState(nct.co_nguoi_cham_soc)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await capNhatNCT(nct.id, formData)
      if (result.success) {
        setSuccess(true)
        setTimeout(() => router.push('/dashboard/an-sinh/nguoi-cao-tuoi'), 1200)
      } else {
        setError(result.error ?? 'Có lỗi xảy ra')
      }
    })
  }

  const tuoi = nct.ngay_sinh
    ? Math.floor((Date.now() - new Date(nct.ngay_sinh).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null

  return (
    <div className="max-w-3xl space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/an-sinh/nguoi-cao-tuoi" className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Users size={20} className="text-blue-600" />
            <h1 className="text-xl font-bold text-slate-900">Cập nhật hồ sơ NCT</h1>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Cập nhật ngày: {format(new Date(), 'dd/MM/yyyy', { locale: vi })}
          </p>
        </div>
      </div>

      {/* Info card — read only */}
      <div className={`rounded-2xl border-2 p-4 flex items-center gap-4 ${
        daMat ? 'border-slate-300 bg-slate-50' : 'border-blue-100 bg-blue-50'
      }`}>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white shrink-0 ${
          daMat ? 'bg-slate-400' : 'bg-blue-600'
        }`}>
          {nct.ho_ten.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-slate-900 text-lg">{nct.ho_ten}</span>
            {daMat && (
              <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-medium">Đã mất</span>
            )}
            {nct.la_liet_si && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">Liệt sĩ</span>}
            {nct.la_nguoi_co_cong && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">Người có công</span>}
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            {nct.gioi_tinh === 'NAM' ? 'Nam' : nct.gioi_tinh === 'NU' ? 'Nữ' : ''}
            {nct.ngay_sinh && ` · Sinh ${format(new Date(nct.ngay_sinh), 'dd/MM/yyyy')} · `}
            {tuoi && <strong className="text-blue-700">{tuoi} tuổi</strong>}
          </p>
          {nct.so_cccd && <p className="text-xs text-slate-400 font-mono mt-0.5">CCCD: {nct.so_cccd}</p>}
        </div>
        <div className="shrink-0 text-right">
          {!daMat && (
            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
              SK_LABEL[nct.tinh_trang_sk]?.color === 'emerald' ? 'bg-emerald-100 text-emerald-700' :
              SK_LABEL[nct.tinh_trang_sk]?.color === 'blue'    ? 'bg-blue-100 text-blue-700'    :
              SK_LABEL[nct.tinh_trang_sk]?.color === 'amber'   ? 'bg-amber-100 text-amber-700'  :
              SK_LABEL[nct.tinh_trang_sk]?.color === 'red'     ? 'bg-red-100 text-red-700'      :
              'bg-slate-100 text-slate-600'
            }`}>
              <Heart size={11} />
              {SK_LABEL[nct.tinh_trang_sk]?.label ?? nct.tinh_trang_sk}
            </span>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Liên kết nhân khẩu — để sync khi cập nhật */}
        <input type="hidden" name="nhan_khau_id" value={nct.nhan_khau_id ?? ''} />

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
            <AlertTriangle size={15} />
            {error}
          </div>
        )}
        {success && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
            <CheckCircle2 size={15} />
            Đã lưu thành công! Đang chuyển về danh sách...
          </div>
        )}

        {/* ── 1. TÌNH TRẠNG SỐNG ──────────────────────────────── */}
        <Section icon={Skull} title="Tình trạng sống" color="text-slate-600" bg="bg-slate-100">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Tình trạng hiện tại</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setDaMat(false)}
                  className={`flex-1 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                    !daMat ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  ✅ Còn sống
                </button>
                <button
                  type="button"
                  onClick={() => setDaMat(true)}
                  className={`flex-1 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                    daMat ? 'border-slate-400 bg-slate-100 text-slate-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  🕯️ Đã mất
                </button>
              </div>
              {/* Hidden input */}
              <input type="hidden" name="da_mat" value={daMat ? 'true' : 'false'} />
            </div>

            {daMat && (
              <>
                <Field label="Ngày mất">
                  <Input name="ngay_mat" type="date" defaultValue={nct.ngay_mat ?? ''} />
                </Field>
                <Field label="Nguyên nhân mất">
                  <Input name="nguyen_nhan_mat" defaultValue={nct.nguyen_nhan_mat ?? ''} placeholder="Bệnh tuổi già, tai nạn, ..." />
                </Field>
                {/* Ghi chú khi NCT được liên kết với hộ dân */}
                {nct.nhan_khau_id && (
                  <div className="col-span-2 flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl p-3">
                    <AlertTriangle size={15} className="text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700 leading-relaxed">
                      <strong>Hộ dân vẫn tồn tại.</strong> Trạng thái &quot;Đã mất&quot; sẽ được đồng bộ
                      vào danh sách nhân khẩu. Hộ dân không bị xóa — các thành viên khác
                      có thể vẫn đang sinh sống tại địa chỉ này. Nếu đây là Chủ hộ,
                      hãy vào <strong>Quản lý dân cư</strong> để cập nhật chủ hộ mới.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </Section>

        {/* ── 2. THÔNG TIN CƠ BẢN ─────────────────────────────── */}
        <Section icon={User} title="Thông tin cơ bản" color="text-blue-600" bg="bg-blue-100">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Địa chỉ thường trú" col2>
              <Input name="dia_chi_day" defaultValue={nct.dia_chi_day ?? ''} placeholder="Số nhà, đường, ..." />
            </Field>
            <Field label="Số CCCD / CMND">
              <Input name="so_cccd" defaultValue={nct.so_cccd ?? ''} placeholder="012345678901" mono />
            </Field>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="song_co_don"
                  value="true"
                  defaultChecked={nct.song_co_don}
                  className="rounded accent-amber-500 w-4 h-4"
                />
                <span className="text-sm font-medium text-slate-700">Sống cô đơn, không nơi nương tựa</span>
              </label>
            </div>
          </div>
        </Section>

        {/* ── 3. SỨC KHỎE ─────────────────────────────────────── */}
        {!daMat && (
          <Section icon={HeartPulse} title="Tình trạng sức khỏe" color="text-rose-600" bg="bg-rose-100">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Đánh giá sức khỏe</label>
                <div className="grid grid-cols-4 gap-2">
                  {Object.entries(SK_LABEL).map(([key, { label, color }]) => (
                    <label key={key} className="cursor-pointer">
                      <input type="radio" name="tinh_trang_sk" value={key} defaultChecked={nct.tinh_trang_sk === key} className="sr-only peer" />
                      <div className={`peer-checked:ring-2 peer-checked:ring-offset-1 text-center p-2.5 rounded-xl border-2 text-xs font-semibold transition-all cursor-pointer ${
                        color === 'emerald' ? 'peer-checked:border-emerald-500 peer-checked:bg-emerald-50 peer-checked:text-emerald-700 border-slate-200 text-slate-500 hover:bg-slate-50' :
                        color === 'blue'    ? 'peer-checked:border-blue-500 peer-checked:bg-blue-50 peer-checked:text-blue-700 border-slate-200 text-slate-500 hover:bg-slate-50' :
                        color === 'amber'   ? 'peer-checked:border-amber-500 peer-checked:bg-amber-50 peer-checked:text-amber-700 border-slate-200 text-slate-500 hover:bg-slate-50' :
                        'peer-checked:border-red-500 peer-checked:bg-red-50 peer-checked:text-red-700 border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}>
                        {key === 'TOT' ? '💚' : key === 'ON_DINH' ? '💙' : key === 'YEU' ? '🟡' : '🔴'} {label}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <Field label="Bệnh mãn tính / bệnh nền" col2>
                <Input
                  name="benh_man_tinh"
                  defaultValue={nct.benh_man_tinh ?? ''}
                  placeholder="Huyết áp, tiểu đường, tim mạch, ..."
                />
              </Field>
            </div>
          </Section>
        )}

        {/* ── 4. LƯƠNG HƯU ─────────────────────────────────────── */}
        <Section icon={Banknote} title="Lương hưu & Thu nhập" color="text-emerald-600" bg="bg-emerald-100">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setCoLuongHuu(true)}
                  className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                    coLuongHuu ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  Có lương hưu
                </button>
                <button
                  type="button"
                  onClick={() => setCoLuongHuu(false)}
                  className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                    !coLuongHuu ? 'border-slate-400 bg-slate-100 text-slate-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  Không có lương hưu
                </button>
              </div>
              <input type="hidden" name="co_luong_huu" value={coLuongHuu ? 'true' : 'false'} />
            </div>
            {coLuongHuu && (
              <Field label="Mức lương hưu (đ/tháng)">
                <Input
                  name="muc_luong_huu"
                  type="number"
                  defaultValue={nct.muc_luong_huu ?? ''}
                  placeholder="3.600.000"
                />
              </Field>
            )}
          </div>
        </Section>

        {/* ── 5. BHYT ─────────────────────────────────────────── */}
        <Section icon={Shield} title="Bảo hiểm Y tế" color="text-teal-600" bg="bg-teal-100">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <div className="flex gap-3">
                <button type="button" onClick={() => setCoBHYT(true)}
                  className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${coBHYT ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-slate-200 text-slate-500'}`}>
                  Có BHYT
                </button>
                <button type="button" onClick={() => setCoBHYT(false)}
                  className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${!coBHYT ? 'border-slate-400 bg-slate-100 text-slate-700' : 'border-slate-200 text-slate-500'}`}>
                  Chưa có BHYT
                </button>
              </div>
              <input type="hidden" name="co_bhyt" value={coBHYT ? 'true' : 'false'} />
            </div>
            {coBHYT && (
              <Field label="Mã thẻ BHYT" col2>
                <Input name="ma_the_bhyt" defaultValue={nct.ma_the_bhyt ?? ''} placeholder="HS4012345678" mono />
              </Field>
            )}
          </div>
        </Section>

        {/* ── 6. TRỢ CẤP XÃ HỘI ──────────────────────────────── */}
        <Section icon={Heart} title="Trợ cấp xã hội" color="text-purple-600" bg="bg-purple-100">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <div className="flex gap-3">
                <button type="button" onClick={() => setNhanTroCap(true)}
                  className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${nhanTroCap ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-slate-200 text-slate-500'}`}>
                  Đang nhận trợ cấp
                </button>
                <button type="button" onClick={() => setNhanTroCap(false)}
                  className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${!nhanTroCap ? 'border-slate-400 bg-slate-100 text-slate-700' : 'border-slate-200 text-slate-500'}`}>
                  Không nhận trợ cấp
                </button>
              </div>
              <input type="hidden" name="nhan_tro_cap_xh" value={nhanTroCap ? 'true' : 'false'} />
            </div>
            {nhanTroCap && (
              <>
                <Field label="Mức trợ cấp (đ/tháng)">
                  <Input name="muc_tro_cap_xh" type="number" defaultValue={nct.muc_tro_cap_xh ?? ''} placeholder="360.000" />
                </Field>
                <Field label="Số quyết định">
                  <Input name="quyet_dinh_tro_cap" defaultValue={nct.quyet_dinh_tro_cap ?? ''} placeholder="QĐ 123/2026" />
                </Field>
              </>
            )}
          </div>
        </Section>

        {/* ── 7. NGƯỜI CHĂM SÓC ───────────────────────────────── */}
        <Section icon={Phone} title="Người chăm sóc / liên hệ khẩn cấp" color="text-orange-600" bg="bg-orange-100">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <div className="flex gap-3">
                <button type="button" onClick={() => setCoNguoiCS(true)}
                  className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${coNguoiCS ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-slate-200 text-slate-500'}`}>
                  Có người chăm sóc
                </button>
                <button type="button" onClick={() => setCoNguoiCS(false)}
                  className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${!coNguoiCS ? 'border-slate-400 bg-slate-100 text-slate-700' : 'border-slate-200 text-slate-500'}`}>
                  Không có người chăm sóc
                </button>
              </div>
              <input type="hidden" name="co_nguoi_cham_soc" value={coNguoiCS ? 'true' : 'false'} />
            </div>
            {coNguoiCS && (
              <>
                <Field label="Họ tên người chăm sóc">
                  <Input name="ten_nguoi_cham_soc" defaultValue={nct.ten_nguoi_cham_soc ?? ''} placeholder="Nguyễn Văn B" />
                </Field>
                <Field label="Số điện thoại">
                  <Input name="sdt_nguoi_cham_soc" type="tel" defaultValue={nct.sdt_nguoi_cham_soc ?? ''} placeholder="0901234567" />
                </Field>
              </>
            )}
          </div>
        </Section>

        {/* ── 8. ĐẶC ĐIỂM ĐỐI TƯỢNG ──────────────────────────── */}
        <Section icon={CheckCircle2} title="Đặc điểm đối tượng" color="text-indigo-600" bg="bg-indigo-100">
          <div className="grid grid-cols-3 gap-2">
            {[
              { name: 'la_liet_si',      label: '⚔️ Liệt sĩ',         checked: nct.la_liet_si      },
              { name: 'la_nguoi_co_cong', label: '🏅 Người có công',   checked: nct.la_nguoi_co_cong },
              { name: 'la_dtts',         label: '🏔️ DTTS vùng khó',   checked: nct.la_dtts          },
            ].map(item => (
              <label
                key={item.name}
                className="flex items-center gap-2 cursor-pointer p-3 border-2 border-slate-200 rounded-xl hover:bg-slate-50 has-[:checked]:border-indigo-400 has-[:checked]:bg-indigo-50 transition-all"
              >
                <input
                  type="checkbox"
                  name={item.name}
                  value="true"
                  defaultChecked={item.checked}
                  className="rounded accent-indigo-500 w-4 h-4"
                />
                <span className="text-sm font-medium text-slate-700">{item.label}</span>
              </label>
            ))}
          </div>
        </Section>

        {/* ── 9. GHI CHÚ ──────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <label className="block text-sm font-semibold text-slate-700 mb-2">Ghi chú</label>
          <textarea
            name="ghi_chu"
            rows={3}
            defaultValue={nct.ghi_chu ?? ''}
            className={INPUT_CLS + ' resize-none'}
            placeholder="Ghi chú thêm về tình trạng, hoàn cảnh đặc biệt..."
          />
        </div>

        {/* ── Actions ─────────────────────────────────────────── */}
        <div className="flex items-center gap-3 pb-8">
          <button
            type="submit"
            disabled={pending || success}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
          >
            <Save size={16} />
            {pending ? 'Đang lưu...' : success ? 'Đã lưu!' : 'Lưu cập nhật'}
          </button>
          <Link
            href="/dashboard/an-sinh/nguoi-cao-tuoi"
            className="px-4 py-3 text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            Hủy
          </Link>
          <span className="ml-auto text-xs text-slate-400">
            Cập nhật lần cuối: {nct.ngay_cap_nhat_sk
              ? format(new Date(nct.ngay_cap_nhat_sk), 'dd/MM/yyyy', { locale: vi })
              : 'Chưa cập nhật'}
          </span>
        </div>
      </form>
    </div>
  )
}

// ── Section wrapper ────────────────────────────────────────────
function Section({
  icon: Icon, title, color, bg, children,
}: {
  icon: React.ElementType
  title: string
  color: string
  bg: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-100 bg-slate-50">
        <div className={`p-1.5 rounded-lg ${bg}`}>
          <Icon size={15} className={color} />
        </div>
        <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}
