'use client'

import { useState, useTransition } from 'react'
import {
  Building2, Plus, Pencil, Trash2, X, Users, Home as HomeIcon,
  UserCog, Phone, Check, Loader2, MapPin, Palette, Award, Image as ImageIcon,
} from 'lucide-react'
import {
  type DonViItem, type DuLieuDonVi,
  taoDonVi, capNhatDonVi, xoaDonVi,
} from './actions'

const KP25_ID = '00000000-0000-4000-8000-000000000025'

const LOAI_OPTIONS = [
  { value: 'KHU_PHO', label: 'Khu phố' },
  { value: 'TO_DAN_PHO', label: 'Tổ dân phố' },
  { value: 'PHUONG', label: 'Phường' },
]

// Bảng màu gợi ý — tông hành chính, dễ đọc trên nền trắng
const MAU_GOI_Y = [
  { hex: '#8B1A1A', ten: 'Đỏ đô (mặc định)' },
  { hex: '#C41E3A', ten: 'Đỏ cờ' },
  { hex: '#1E3A5F', ten: 'Xanh navy' },
  { hex: '#1D4ED8', ten: 'Xanh dương' },
  { hex: '#0F766E', ten: 'Xanh ngọc' },
  { hex: '#15803D', ten: 'Xanh lá' },
  { hex: '#6D28D9', ten: 'Tím' },
  { hex: '#C2410C', ten: 'Cam' },
  { hex: '#78350F', ten: 'Nâu' },
  { hex: '#334155', ten: 'Xám đen' },
]

const laMauHopLe = (v?: string) => /^#[0-9A-Fa-f]{6}$/.test((v ?? '').trim())

function formMacDinh(): DuLieuDonVi {
  return {
    ma: '', ten: '', loai: 'KHU_PHO', phuong: 'Phường Long Trường',
    slug: '', dia_chi: '', truong_kp_ten: '', truong_kp_sdt: '',
    bi_thu_ten: '', bi_thu_sdt: '', mau_chu_dao: '#8B1A1A', logo_url: '',
    thu_tu: 0, is_active: true, ghi_chu: '',
  }
}

export default function KhuPhoClient({ danhSach }: { danhSach: DonViItem[] }) {
  const [moForm, setMoForm] = useState(false)
  const [dangSua, setDangSua] = useState<DonViItem | null>(null)
  const [form, setForm] = useState<DuLieuDonVi>(formMacDinh())
  const [thongBao, setThongBao] = useState<{ loai: 'ok' | 'loi'; text: string } | null>(null)
  const [dangLuu, startLuu] = useTransition()
  const [dangXoa, startXoa] = useTransition()
  const [xoaId, setXoaId] = useState<string | null>(null)

  function moThem() {
    setDangSua(null)
    setForm(formMacDinh())
    setMoForm(true)
  }

  function moSua(dv: DonViItem) {
    setDangSua(dv)
    setForm({
      ma: dv.ma, ten: dv.ten, ten_day_du: dv.ten_day_du ?? '', loai: dv.loai,
      phuong: dv.phuong, slug: dv.slug ?? '', dia_chi: dv.dia_chi ?? '',
      truong_kp_ten: dv.truong_kp_ten ?? '', truong_kp_sdt: dv.truong_kp_sdt ?? '',
      bi_thu_ten: dv.bi_thu_ten ?? '', bi_thu_sdt: dv.bi_thu_sdt ?? '',
      mau_chu_dao: dv.mau_chu_dao ?? '#8B1A1A', logo_url: dv.logo_url ?? '',
      thu_tu: dv.thu_tu, is_active: dv.is_active, ghi_chu: dv.ghi_chu ?? '',
    })
    setMoForm(true)
  }

  function luu() {
    startLuu(async () => {
      const kq = dangSua
        ? await capNhatDonVi(dangSua.id, form)
        : await taoDonVi(form)
      setThongBao({ loai: kq.thanhCong ? 'ok' : 'loi', text: kq.thongBao })
      if (kq.thanhCong) {
        setMoForm(false)
      }
    })
  }

  function xoa(id: string) {
    setXoaId(id)
    startXoa(async () => {
      const kq = await xoaDonVi(id)
      setThongBao({ loai: kq.thanhCong ? 'ok' : 'loi', text: kq.thongBao })
      setXoaId(null)
    })
  }

  const set = <K extends keyof DuLieuDonVi>(k: K, v: DuLieuDonVi[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  return (
    <div className="space-y-5">
      {/* Toast */}
      {thongBao && (
        <div
          className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${
            thongBao.loai === 'ok'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {thongBao.loai === 'ok' ? <Check size={16} /> : <X size={16} />}
          {thongBao.text}
          <button onClick={() => setThongBao(null)} className="ml-auto opacity-60 hover:opacity-100">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Thanh hành động */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-sm text-slate-500">
          Tổng <strong className="text-slate-800">{danhSach.length}</strong> khu phố/đơn vị
        </p>
        <button
          onClick={moThem}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1E3A5F] text-white text-sm font-semibold rounded-xl hover:bg-[#162c47] transition-colors"
        >
          <Plus size={16} /> Thêm khu phố
        </button>
      </div>

      {/* Danh sách thẻ */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {danhSach.map((dv) => (
          <div
            key={dv.id}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-3"
          >
            <div className="flex items-start gap-3">
              {dv.logo_url ? (
                <div className="w-11 h-11 rounded-xl shrink-0 bg-white border border-slate-200 overflow-hidden flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={dv.logo_url} alt={`Logo ${dv.ten}`} className="w-full h-full object-contain" />
                </div>
              ) : (
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-xs"
                  style={{ background: dv.mau_chu_dao ?? '#8B1A1A' }}
                >
                  {dv.ma}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 truncate">{dv.ten}</h3>
                  {dv.id === KP25_ID && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 shrink-0">
                      Mặc định
                    </span>
                  )}
                  {!dv.is_active && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 shrink-0">
                      Ngừng
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 truncate">{dv.phuong}</p>
              </div>
            </div>

            {(dv.bi_thu_ten || dv.truong_kp_ten) && (
              <div className="space-y-1">
                {dv.bi_thu_ten && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-600">
                    <Award size={13} className="text-amber-500 shrink-0" />
                    <span className="text-slate-400">Bí thư:</span>
                    <span className="truncate font-medium text-slate-700">{dv.bi_thu_ten}</span>
                    {dv.bi_thu_sdt && (
                      <span className="inline-flex items-center gap-0.5 text-slate-400">
                        <Phone size={11} /> {dv.bi_thu_sdt}
                      </span>
                    )}
                  </div>
                )}
                {dv.truong_kp_ten && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-600">
                    <UserCog size={13} className="text-slate-400 shrink-0" />
                    <span className="text-slate-400">Trưởng KP:</span>
                    <span className="truncate font-medium text-slate-700">{dv.truong_kp_ten}</span>
                    {dv.truong_kp_sdt && (
                      <span className="inline-flex items-center gap-0.5 text-slate-400">
                        <Phone size={11} /> {dv.truong_kp_sdt}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Thống kê */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              <Stat icon={HomeIcon} label="Hộ" value={dv.so_ho} />
              <Stat icon={Users} label="Nhân khẩu" value={dv.so_nhan_khau} />
              <Stat icon={UserCog} label="Cán bộ" value={dv.so_can_bo} />
            </div>

            {/* Hành động */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => moSua(dv)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
              >
                <Pencil size={13} /> Sửa
              </button>
              {dv.id !== KP25_ID && (
                <button
                  onClick={() => xoa(dv.id)}
                  disabled={dangXoa && xoaId === dv.id}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                >
                  {dangXoa && xoaId === dv.id
                    ? <Loader2 size={13} className="animate-spin" />
                    : <Trash2 size={13} />}
                  Xóa
                </button>
              )}
            </div>
          </div>
        ))}

        {danhSach.length === 0 && (
          <div className="col-span-full text-center py-16 text-slate-400">
            <Building2 size={40} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">Chưa có khu phố nào. Nhấn “Thêm khu phố” để bắt đầu.</p>
          </div>
        )}
      </div>

      {/* Modal form */}
      {moForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-slate-100 px-5 py-4 flex items-center justify-between">
              <h2 className="font-bold text-slate-900 flex items-center gap-2">
                <Building2 size={18} className="text-[#1E3A5F]" />
                {dangSua ? `Sửa: ${dangSua.ten}` : 'Thêm khu phố mới'}
              </h2>
              <button onClick={() => setMoForm(false)} className="text-slate-400 hover:text-slate-700">
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Mã khu phố *" hint="VD: KP01, KP12">
                  <input
                    value={form.ma}
                    onChange={(e) => set('ma', e.target.value)}
                    disabled={!!dangSua}
                    placeholder="KP01"
                    className="input disabled:bg-slate-100 disabled:text-slate-400 uppercase"
                  />
                </Field>
                <Field label="Loại đơn vị">
                  <select
                    value={form.loai}
                    onChange={(e) => set('loai', e.target.value)}
                    className="input"
                  >
                    {LOAI_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </Field>
              </div>

              <Field label="Tên khu phố *" hint="VD: Khu phố 1">
                <input
                  value={form.ten}
                  onChange={(e) => set('ten', e.target.value)}
                  placeholder="Khu phố 1"
                  className="input"
                />
              </Field>

              <Field label="Tên đầy đủ" hint="Để trống sẽ tự ghép theo phường">
                <input
                  value={form.ten_day_du ?? ''}
                  onChange={(e) => set('ten_day_du', e.target.value)}
                  placeholder="Khu phố 1, Phường Long Trường, TP. Hồ Chí Minh"
                  className="input"
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Phường">
                  <input
                    value={form.phuong ?? ''}
                    onChange={(e) => set('phuong', e.target.value)}
                    className="input"
                  />
                </Field>
                <Field label="Slug (đường dẫn)" hint="VD: kp01">
                  <input
                    value={form.slug ?? ''}
                    onChange={(e) => set('slug', e.target.value)}
                    placeholder="kp01"
                    className="input lowercase"
                  />
                </Field>
              </div>

              <Field label="Địa chỉ trụ sở / nhà văn hóa">
                <div className="relative">
                  <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={form.dia_chi ?? ''}
                    onChange={(e) => set('dia_chi', e.target.value)}
                    className="input pl-9"
                  />
                </div>
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Trưởng khu phố">
                  <input
                    value={form.truong_kp_ten ?? ''}
                    onChange={(e) => set('truong_kp_ten', e.target.value)}
                    className="input"
                  />
                </Field>
                <Field label="SĐT trưởng KP">
                  <input
                    value={form.truong_kp_sdt ?? ''}
                    onChange={(e) => set('truong_kp_sdt', e.target.value)}
                    className="input"
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Bí thư chi bộ">
                  <input
                    value={form.bi_thu_ten ?? ''}
                    onChange={(e) => set('bi_thu_ten', e.target.value)}
                    className="input"
                  />
                </Field>
                <Field label="SĐT bí thư">
                  <input
                    value={form.bi_thu_sdt ?? ''}
                    onChange={(e) => set('bi_thu_sdt', e.target.value)}
                    className="input"
                  />
                </Field>
              </div>

              <Field label="Màu chủ đạo" hint="Dùng cho logo, favicon và giao diện khu phố">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Palette size={14} className="text-slate-400 shrink-0" />
                    {/* Ô chọn màu hệ thống (nếu môi trường hỗ trợ) */}
                    <input
                      type="color"
                      value={laMauHopLe(form.mau_chu_dao) ? form.mau_chu_dao! : '#8B1A1A'}
                      onChange={(e) => set('mau_chu_dao', e.target.value.toUpperCase())}
                      className="h-9 w-11 rounded border border-slate-200 cursor-pointer shrink-0"
                      title="Chọn màu"
                    />
                    {/* Nhập mã hex trực tiếp — luôn dùng được */}
                    <input
                      value={form.mau_chu_dao ?? ''}
                      onChange={(e) => set('mau_chu_dao', e.target.value.toUpperCase())}
                      placeholder="#8B1A1A"
                      maxLength={7}
                      className="input font-mono uppercase w-28 shrink-0"
                    />
                    {/* Xem trước */}
                    <div
                      className="h-9 flex-1 rounded-lg flex items-center justify-center text-[11px] font-bold text-white"
                      style={{ background: laMauHopLe(form.mau_chu_dao) ? form.mau_chu_dao : '#CBD5E1' }}
                    >
                      {laMauHopLe(form.mau_chu_dao) ? 'Xem trước màu' : 'Mã màu chưa hợp lệ'}
                    </div>
                  </div>

                  {/* Bảng màu gợi ý */}
                  <div className="flex flex-wrap gap-1.5">
                    {MAU_GOI_Y.map((m) => {
                      const dangChon = (form.mau_chu_dao ?? '').toUpperCase() === m.hex
                      return (
                        <button
                          key={m.hex}
                          type="button"
                          title={`${m.ten} — ${m.hex}`}
                          onClick={() => set('mau_chu_dao', m.hex)}
                          className={`w-7 h-7 rounded-md transition-transform hover:scale-110 ${
                            dangChon ? 'ring-2 ring-offset-2 ring-slate-800' : 'ring-1 ring-slate-200'
                          }`}
                          style={{ background: m.hex }}
                        />
                      )
                    })}
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Khi triển khai khu phố này, đặt biến{' '}
                    <span className="font-mono text-slate-500">NEXT_PUBLIC_KP_MAU</span> ={' '}
                    <span className="font-mono text-slate-600">{form.mau_chu_dao || '#8B1A1A'}</span>{' '}
                    để portal/admin và favicon của khu phố dùng đúng màu này.
                  </p>
                </div>
              </Field>

              <Field label="Thứ tự hiển thị">
                <input
                  type="number"
                  value={form.thu_tu ?? 0}
                  onChange={(e) => set('thu_tu', Number(e.target.value))}
                  className="input w-32"
                />
              </Field>

              <Field label="Logo khu phố (URL ảnh)" hint="Bỏ trống sẽ dùng logo chữ">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <ImageIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      value={form.logo_url ?? ''}
                      onChange={(e) => set('logo_url', e.target.value)}
                      placeholder="https://.../logo-kp01.png"
                      className="input pl-9"
                    />
                  </div>
                  {/* Xem trước */}
                  <div className="w-10 h-10 rounded-lg border border-slate-200 bg-white flex items-center justify-center overflow-hidden shrink-0">
                    {form.logo_url?.trim() ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={form.logo_url} alt="Xem trước logo" className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-[9px] text-slate-300">Chữ</span>
                    )}
                  </div>
                </div>
              </Field>

              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_active ?? true}
                  onChange={(e) => set('is_active', e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300"
                />
                Đang hoạt động
              </label>

              <Field label="Ghi chú">
                <textarea
                  value={form.ghi_chu ?? ''}
                  onChange={(e) => set('ghi_chu', e.target.value)}
                  rows={2}
                  className="input resize-none"
                />
              </Field>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white border-t border-slate-100 px-5 py-4 flex items-center gap-3">
              <button
                onClick={() => setMoForm(false)}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={luu}
                disabled={dangLuu}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1E3A5F] text-white text-sm font-semibold rounded-xl hover:bg-[#162c47] transition-colors disabled:opacity-60"
              >
                {dangLuu ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                {dangSua ? 'Lưu thay đổi' : 'Tạo khu phố'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        :global(.input) {
          width: 100%;
          border: 1px solid #e2e8f0;
          border-radius: 0.625rem;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          color: #0f172a;
          outline: none;
          transition: border-color 0.15s;
        }
        :global(.input:focus) {
          border-color: #1e3a5f;
        }
      `}</style>
    </div>
  )
}

// ─── Sub components ───────────────────────────────────────────

function Stat({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: number }) {
  return (
    <div className="bg-slate-50 rounded-lg px-2 py-2 text-center">
      <Icon size={14} className="mx-auto text-slate-400 mb-0.5" />
      <p className="text-sm font-bold text-slate-800 leading-none">{value}</p>
      <p className="text-[10px] text-slate-400 mt-0.5">{label}</p>
    </div>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1">
        {label}
        {hint && <span className="ml-1 font-normal text-slate-400">— {hint}</span>}
      </label>
      {children}
    </div>
  )
}
