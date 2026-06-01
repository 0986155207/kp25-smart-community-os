'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Home, User, Plus, Trash2, Loader2, Check, Phone, MapPin, Users, CheckCircle2, ChevronDown,
} from 'lucide-react'

interface ThanhVien {
  ho_ten: string
  ngay_sinh: string
  gioi_tinh: string
  cccd: string
  quan_he: string
  nghe_nghiep: string
  // Trường mở rộng (khớp form nhân khẩu chuẩn — migration 041)
  noi_sinh: string
  nguyen_quan: string
  dan_toc: string
  ton_giao: string
  quoc_tich: string
  cccd_ngay_cap: string
  cccd_noi_cap: string
  tinh_trang_hon_nhan: string
  noi_lam_viec: string
  dia_chi_thuong_tru: string
}

const TV_RONG: ThanhVien = {
  ho_ten: '', ngay_sinh: '', gioi_tinh: 'NAM', cccd: '', quan_he: 'Chủ hộ', nghe_nghiep: '',
  noi_sinh: '', nguyen_quan: '', dan_toc: '', ton_giao: '', quoc_tich: '',
  cccd_ngay_cap: '', cccd_noi_cap: '', tinh_trang_hon_nhan: '', noi_lam_viec: '', dia_chi_thuong_tru: '',
}
const QUAN_HE = ['Chủ hộ', 'Vợ / Chồng', 'Con', 'Cha / Mẹ', 'Anh / Chị / Em', 'Ông / Bà', 'Cháu', 'Thành viên khác']

const inp = 'w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/10 transition-all'

export default function HoMoiForm() {
  // Hộ — khớp chính xác với form hộ dân chuẩn
  const [chuHo, setChuHo]           = useState('')
  const [soNha, setSoNha]           = useState('')
  const [duong, setDuong]           = useState('')
  const [toKhuVuc, setToKhuVuc]     = useState('')
  const [diaChi, setDiaChi]         = useState('')
  const [soDienThoai, setSoDienThoai] = useState('')
  const [loaiCuTru, setLoaiCuTru]   = useState<'THUONG_TRU' | 'TAM_TRU'>('THUONG_TRU')
  const [ghiChu, setGhiChu]         = useState('')
  // Thành viên
  const [thanhVien, setThanhVien]   = useState<ThanhVien[]>([{ ...TV_RONG }])
  const [moRong, setMoRong]         = useState<Set<number>>(new Set())

  const [loading, setLoading] = useState(false)
  const [err, setErr]         = useState('')
  const [done, setDone]       = useState(false)

  function toggleChiTiet(i: number) {
    setMoRong(prev => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i); else next.add(i)
      return next
    })
  }

  function setTV(i: number, k: keyof ThanhVien, v: string) {
    setThanhVien(prev => prev.map((tv, idx) => idx === i ? { ...tv, [k]: v } : tv))
  }
  function themTV() {
    setThanhVien(prev => [...prev, { ...TV_RONG, quan_he: 'Con', gioi_tinh: 'NAM' }])
  }
  function xoaTV(i: number) {
    setThanhVien(prev => prev.filter((_, idx) => idx !== i))
  }

  async function submit() {
    setErr('')
    if (!chuHo.trim())  { setErr('Vui lòng nhập tên chủ hộ'); return }
    if (!diaChi.trim()) { setErr('Vui lòng nhập địa chỉ'); return }
    if (!/^0\d{9}$/.test(soDienThoai)) { setErr('Số điện thoại không hợp lệ (10 chữ số)'); return }
    if (thanhVien.length === 0 || !thanhVien.every(tv => tv.ho_ten.trim())) {
      setErr('Mỗi thành viên cần có họ tên'); return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/dan-cu/dang-ky-ho-moi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chuHo, diaChi, soDienThoai, soNha, duong, toKhuVuc, loaiCuTru, ghiChu,
          thanhVien,  // gửi đủ tất cả trường thành viên
        }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) { setErr(json.message ?? 'Lỗi gửi đăng ký'); return }
      setDone(true)
    } catch {
      setErr('Lỗi kết nối. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  // ── Done ──
  if (done) {
    return (
      <div className="bg-white rounded-2xl border border-emerald-200 shadow-sm p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={32} className="text-emerald-600" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-1">Đã gửi kê khai!</h3>
        <p className="text-slate-500 text-sm leading-relaxed mb-5">
          Cán bộ khu phố sẽ xác minh và cập nhật thông tin vào hệ thống trong thời gian sớm nhất.
          Nếu hộ đã có hồ sơ, thông tin sẽ được bổ sung (không tạo trùng). Bạn sẽ được liên hệ
          qua số điện thoại đã cung cấp.
        </p>
        <Link href="/" className="inline-block py-3 px-6 bg-[#1E3A5F] text-white text-sm font-semibold rounded-xl hover:bg-[#162d4a] transition-colors">
          Về trang chủ
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* ── Thông tin hộ ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
        <h2 className="font-bold text-slate-800 flex items-center gap-2">
          <Home size={17} className="text-[#1E3A5F]" /> Thông tin hộ
        </h2>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Họ tên chủ hộ <span className="text-red-500">*</span></label>
          <input value={chuHo} onChange={e => setChuHo(e.target.value)} className={inp} placeholder="Nguyễn Văn A" />
        </div>

        {/* Số nhà · Đường/Hẻm · Tổ/Khu vực — khớp form hộ dân chuẩn */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Số nhà</label>
            <input value={soNha} onChange={e => setSoNha(e.target.value)} className={inp} placeholder="63/15" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Đường / Hẻm</label>
            <input value={duong} onChange={e => setDuong(e.target.value)} className={inp} placeholder="Đường số 1" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Tổ / Khu vực</label>
            <input value={toKhuVuc} onChange={e => setToKhuVuc(e.target.value)} className={inp} placeholder="Tổ 1, Hẻm 63..." />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Địa chỉ đầy đủ <span className="text-red-500">*</span></label>
          <input value={diaChi} onChange={e => setDiaChi(e.target.value)} className={inp} placeholder="63/15 Đường số 1, Khu phố 25, Phường Long Trường" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Số điện thoại <span className="text-red-500">*</span></label>
          <div className="relative">
            <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="tel" value={soDienThoai} onChange={e => setSoDienThoai(e.target.value.replace(/\D/g, '').slice(0, 10))}
              className={`${inp} pl-9`} placeholder="Nhập số điện thoại" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Hình thức cư trú</label>
          <div className="flex gap-2">
            {([['THUONG_TRU', 'Thường trú'], ['TAM_TRU', 'Tạm trú']] as const).map(([v, l]) => (
              <button key={v} type="button" onClick={() => setLoaiCuTru(v)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all
                  ${loaiCuTru === v ? 'border-[#1E3A5F] bg-[#1E3A5F]/5 text-[#1E3A5F]' : 'border-slate-200 text-slate-500'}`}>
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Thành viên ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-slate-800 flex items-center gap-2">
            <Users size={17} className="text-[#1E3A5F]" /> Thành viên trong hộ
            <span className="text-xs font-normal text-slate-400">({thanhVien.length})</span>
          </h2>
          <button type="button" onClick={themTV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1E3A5F] text-white text-xs font-semibold hover:bg-[#162d4a] transition-colors">
            <Plus size={13} /> Thêm người
          </button>
        </div>

        {thanhVien.map((tv, i) => (
          <div key={i} className="border border-slate-200 rounded-xl p-4 space-y-3 relative">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                <User size={12} /> Thành viên {i + 1}
              </span>
              {thanhVien.length > 1 && (
                <button type="button" onClick={() => xoaTV(i)} className="text-slate-400 hover:text-red-500 transition-colors">
                  <Trash2 size={14} />
                </button>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Họ tên <span className="text-red-500">*</span></label>
              <input value={tv.ho_ten} onChange={e => setTV(i, 'ho_ten', e.target.value)} className={inp} placeholder="Nguyễn Văn B" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Ngày sinh</label>
                <input type="date" value={tv.ngay_sinh} onChange={e => setTV(i, 'ngay_sinh', e.target.value)} className={inp} />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Giới tính</label>
                <select value={tv.gioi_tinh} onChange={e => setTV(i, 'gioi_tinh', e.target.value)} className={inp}>
                  <option value="NAM">Nam</option><option value="NU">Nữ</option><option value="KHAC">Khác</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Số CCCD</label>
                <input value={tv.cccd} onChange={e => setTV(i, 'cccd', e.target.value.replace(/\D/g, '').slice(0, 12))} className={inp} placeholder="079..." />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Quan hệ chủ hộ</label>
                <select value={tv.quan_he} onChange={e => setTV(i, 'quan_he', e.target.value)} className={inp}>
                  {QUAN_HE.map(q => <option key={q} value={q}>{q}</option>)}
                </select>
              </div>
            </div>

            {/* ── Thông tin chi tiết (mở rộng) — khớp form nhân khẩu chuẩn ── */}
            <button type="button" onClick={() => toggleChiTiet(i)}
              className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors">
              <span className="text-xs font-semibold text-slate-600">
                Thông tin chi tiết <span className="font-normal text-slate-400">(nơi sinh, dân tộc, hôn nhân, CCCD...)</span>
              </span>
              <ChevronDown size={15} className={`text-slate-400 transition-transform ${moRong.has(i) ? 'rotate-180' : ''}`} />
            </button>

            {moRong.has(i) && (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Nghề nghiệp</label>
                  <input value={tv.nghe_nghiep} onChange={e => setTV(i, 'nghe_nghiep', e.target.value)} className={inp} placeholder="Học sinh, công nhân..." />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Nơi làm việc / học tập</label>
                  <input value={tv.noi_lam_viec} onChange={e => setTV(i, 'noi_lam_viec', e.target.value)} className={inp} placeholder="Cơ quan, trường..." />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Nơi sinh</label>
                  <input value={tv.noi_sinh} onChange={e => setTV(i, 'noi_sinh', e.target.value)} className={inp} placeholder="Tỉnh/thành" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Nguyên quán</label>
                  <input value={tv.nguyen_quan} onChange={e => setTV(i, 'nguyen_quan', e.target.value)} className={inp} placeholder="Quê quán" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Dân tộc</label>
                  <input value={tv.dan_toc} onChange={e => setTV(i, 'dan_toc', e.target.value)} className={inp} placeholder="Kinh" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Tôn giáo</label>
                  <input value={tv.ton_giao} onChange={e => setTV(i, 'ton_giao', e.target.value)} className={inp} placeholder="Không" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Quốc tịch</label>
                  <input value={tv.quoc_tich} onChange={e => setTV(i, 'quoc_tich', e.target.value)} className={inp} placeholder="Việt Nam" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Tình trạng hôn nhân</label>
                  <select value={tv.tinh_trang_hon_nhan} onChange={e => setTV(i, 'tinh_trang_hon_nhan', e.target.value)} className={inp}>
                    <option value="">— Chọn —</option>
                    <option value="DOC_THAN">Độc thân</option>
                    <option value="DA_KET_HON">Đã kết hôn</option>
                    <option value="LY_HON">Ly hôn</option>
                    <option value="GOA">Góa</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Ngày cấp CCCD</label>
                  <input type="date" value={tv.cccd_ngay_cap} onChange={e => setTV(i, 'cccd_ngay_cap', e.target.value)} className={inp} />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Nơi cấp CCCD</label>
                  <input value={tv.cccd_noi_cap} onChange={e => setTV(i, 'cccd_noi_cap', e.target.value)} className={inp} placeholder="Cục CSQLHC..." />
                </div>
                <div className="col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Địa chỉ thường trú</label>
                  <input value={tv.dia_chi_thuong_tru} onChange={e => setTV(i, 'dia_chi_thuong_tru', e.target.value)} className={inp} placeholder="Địa chỉ thường trú đầy đủ" />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Ghi chú */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Ghi chú thêm (nếu có)</label>
        <textarea value={ghiChu} onChange={e => setGhiChu(e.target.value)} rows={2} className={`${inp} resize-none`}
          placeholder="Thông tin bổ sung cho cán bộ..." />
      </div>

      {err && <p className="text-sm text-red-500 text-center">{err}</p>}

      <button onClick={submit} disabled={loading}
        className="w-full py-4 bg-[#1E3A5F] text-white font-bold text-sm rounded-2xl hover:bg-[#162d4a] disabled:opacity-60 flex items-center justify-center gap-2 transition-all shadow-sm">
        {loading ? <><Loader2 size={17} className="animate-spin" /> Đang gửi...</> : <><Check size={17} /> Gửi kê khai thông tin hộ</>}
      </button>

      <p className="text-[11px] text-slate-400 text-center leading-relaxed">
        Thông tin được bảo mật theo Nghị định 13/2023/NĐ-CP. Cán bộ sẽ xác minh trước khi tạo hồ sơ chính thức.
      </p>
    </div>
  )
}
