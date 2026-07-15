'use client'

import { useState, useTransition, useCallback } from 'react'
import dynamic from 'next/dynamic'
import {
  Undo2, Trash2, Save, Check, X, MapPin, Loader2,
  Download, Upload, Crosshair, Info,
} from 'lucide-react'
import { luuRanhGioi, type Diem, type RanhGioiDonVi } from '../../actions'

const VeRanhGioiMap = dynamic(() => import('./VeRanhGioiMap'), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center bg-slate-100 text-slate-500 text-sm">
      <Loader2 size={18} className="animate-spin mr-2" /> Đang tải bản đồ…
    </div>
  ),
})

const TAM_MAC_DINH: Diem = [10.8005, 106.8118]   // Long Trường

export default function RanhGioiClient({ dv }: { dv: RanhGioiDonVi }) {
  const [diem, setDiem]       = useState<Diem[]>(dv.ranh_gioi)
  const [vuaKhung, setVuaKhung] = useState(dv.ranh_gioi.length >= 2 ? 1 : 0)
  const [moNhap, setMoNhap]   = useState(false)
  const [geoText, setGeoText] = useState('')
  const [thongBao, setThongBao] = useState<{ loai: 'ok' | 'loi'; text: string } | null>(null)
  const [dangLuu, startLuu]   = useTransition()

  const mau = dv.mau_chu_dao ?? '#8B1A1A'
  const tam: Diem = dv.tam ?? (dv.ranh_gioi.length
    ? [
        dv.ranh_gioi.reduce((s, p) => s + p[0], 0) / dv.ranh_gioi.length,
        dv.ranh_gioi.reduce((s, p) => s + p[1], 0) / dv.ranh_gioi.length,
      ]
    : TAM_MAC_DINH)

  const themDiem = useCallback((d: Diem) => setDiem(v => [...v, d]), [])
  const keoDiem  = useCallback((i: number, d: Diem) =>
    setDiem(v => v.map((x, j) => (j === i ? d : x))), [])
  const xoaDiem  = useCallback((i: number) =>
    setDiem(v => v.filter((_, j) => j !== i)), [])

  function luu() {
    startLuu(async () => {
      const kq = await luuRanhGioi(dv.id, diem)
      setThongBao({ loai: kq.thanhCong ? 'ok' : 'loi', text: kq.thongBao })
    })
  }

  // ── Nhập GeoJSON / danh sách toạ độ ───────────────────────
  function nhapGeo() {
    try {
      const raw = JSON.parse(geoText)
      let toado: unknown[] = []

      if (Array.isArray(raw)) {
        toado = raw                                              // [[lat,lng], ...]
      } else if (raw?.type === 'FeatureCollection') {
        toado = raw.features?.[0]?.geometry?.coordinates?.[0] ?? []
      } else if (raw?.type === 'Feature') {
        toado = raw.geometry?.coordinates?.[0] ?? []
      } else if (raw?.type === 'Polygon') {
        toado = raw.coordinates?.[0] ?? []
      }

      const laGeoJson = raw?.type != null   // GeoJSON dùng [lng, lat] — phải đảo
      const ket: Diem[] = []
      for (const t of toado) {
        if (!Array.isArray(t) || t.length < 2) continue
        const a = Number(t[0]), b = Number(t[1])
        if (Number.isNaN(a) || Number.isNaN(b)) continue
        ket.push(laGeoJson ? [b, a] : [a, b])
      }

      if (ket.length < 3) {
        setThongBao({ loai: 'loi', text: 'Không đọc được ranh giới (cần ít nhất 3 đỉnh).' })
        return
      }
      setDiem(ket)
      setVuaKhung(v => v + 1)
      setMoNhap(false)
      setGeoText('')
      setThongBao({ loai: 'ok', text: `Đã nhập ${ket.length} đỉnh. Kiểm tra rồi nhấn Lưu.` })
    } catch {
      setThongBao({ loai: 'loi', text: 'Nội dung không phải JSON hợp lệ.' })
    }
  }

  // ── Xuất GeoJSON (chuẩn: [lng, lat], khép vòng) ───────────
  function xuatGeo() {
    if (diem.length < 3) return
    const vong = [...diem, diem[0]!].map(d => [d[1], d[0]])
    const geo = {
      type: 'Feature',
      properties: { ma: dv.ma, ten: dv.ten },
      geometry: { type: 'Polygon', coordinates: [vong] },
    }
    const blob = new Blob([JSON.stringify(geo, null, 2)], { type: 'application/geo+json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `ranh-gioi-${dv.ma.toLowerCase()}.geojson`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <div className="space-y-4">
      {thongBao && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${
          thongBao.loai === 'ok'
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {thongBao.loai === 'ok' ? <Check size={16} /> : <X size={16} />}
          {thongBao.text}
          <button onClick={() => setThongBao(null)} className="ml-auto opacity-60 hover:opacity-100">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Hướng dẫn */}
      <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-800 leading-relaxed">
        <Info size={14} className="shrink-0 mt-0.5 text-blue-500" />
        <div>
          <strong>Cách vẽ:</strong> bấm lên bản đồ để thêm đỉnh · kéo đỉnh để chỉnh vị trí ·
          bấm vào đỉnh để xoá đỉnh đó. Cần <strong>ít nhất 3 đỉnh</strong>. Vẽ xong nhấn <strong>Lưu ranh giới</strong>.
          Nếu đã có file ranh giới hành chính, dùng <strong>Nhập GeoJSON</strong>.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Bản đồ */}
        <div className="lg:col-span-3 h-[520px] rounded-2xl overflow-hidden border border-slate-200 relative">
          <VeRanhGioiMap
            diem={diem}
            mau={mau}
            tam={tam}
            zoom={dv.zoom}
            vuaKhung={vuaKhung}
            onThemDiem={themDiem}
            onKeoDiem={keoDiem}
            onXoaDiem={xoaDiem}
          />
        </div>

        {/* Bảng điều khiển */}
        <div className="space-y-3">
          {/* Trạng thái */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-sm" style={{ background: mau }} />
              <span className="font-bold text-slate-800 text-sm">{dv.ten}</span>
            </div>
            <p className="text-xs text-slate-500">
              {diem.length === 0
                ? 'Chưa vẽ ranh giới'
                : diem.length < 3
                  ? `${diem.length} đỉnh — cần thêm ${3 - diem.length} đỉnh nữa`
                  : `${diem.length} đỉnh — hợp lệ`}
            </p>
          </div>

          {/* Danh sách đỉnh */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3 max-h-52 overflow-y-auto">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-2 px-1">
              Danh sách đỉnh
            </p>
            {diem.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">Bấm lên bản đồ để bắt đầu</p>
            ) : (
              <div className="space-y-1">
                {diem.map((d, i) => (
                  <div key={i} className="flex items-center gap-2 text-[11px] group">
                    <span
                      className="w-5 h-5 rounded-full text-white flex items-center justify-center font-bold shrink-0"
                      style={{ background: mau, fontSize: 9 }}
                    >{i + 1}</span>
                    <span className="font-mono text-slate-600 flex-1 truncate">
                      {d[0].toFixed(5)}, {d[1].toFixed(5)}
                    </span>
                    <button
                      onClick={() => xoaDiem(i)}
                      className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Xoá đỉnh"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Thao tác */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setDiem(v => v.slice(0, -1))}
              disabled={!diem.length}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40"
            >
              <Undo2 size={13} /> Hoàn tác
            </button>
            <button
              onClick={() => setDiem([])}
              disabled={!diem.length}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-600 bg-white border border-slate-200 rounded-xl hover:bg-red-50 disabled:opacity-40"
            >
              <Trash2 size={13} /> Xoá hết
            </button>
            <button
              onClick={() => setVuaKhung(v => v + 1)}
              disabled={diem.length < 2}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40"
            >
              <Crosshair size={13} /> Vừa khung
            </button>
            <button
              onClick={xuatGeo}
              disabled={diem.length < 3}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40"
            >
              <Download size={13} /> Xuất
            </button>
          </div>

          <button
            onClick={() => setMoNhap(v => !v)}
            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50"
          >
            <Upload size={13} /> Nhập GeoJSON / toạ độ
          </button>

          {moNhap && (
            <div className="bg-white rounded-2xl border border-slate-200 p-3 space-y-2">
              <textarea
                value={geoText}
                onChange={(e) => setGeoText(e.target.value)}
                rows={5}
                placeholder={'Dán GeoJSON (Polygon/Feature) hoặc mảng toạ độ:\n[[10.798,106.811],[10.799,106.813], ...]'}
                className="w-full text-[10px] font-mono border border-slate-200 rounded-lg p-2 resize-none outline-none focus:border-[#1E3A5F]"
              />
              <p className="text-[10px] text-slate-400 leading-relaxed">
                GeoJSON dùng thứ tự [kinh độ, vĩ độ] — hệ thống tự đảo về [vĩ độ, kinh độ].
              </p>
              <button
                onClick={nhapGeo}
                disabled={!geoText.trim()}
                className="w-full px-3 py-2 text-xs font-semibold text-white bg-[#1E3A5F] rounded-lg hover:bg-[#162c47] disabled:opacity-40"
              >
                Nhập
              </button>
            </div>
          )}

          {/* Lưu */}
          <button
            onClick={luu}
            disabled={dangLuu || (diem.length > 0 && diem.length < 3)}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-[#1E3A5F] text-white text-sm font-semibold rounded-xl hover:bg-[#162c47] transition-colors disabled:opacity-50"
          >
            {dangLuu ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Lưu ranh giới
          </button>

          <p className="text-[10px] text-slate-400 text-center leading-relaxed">
            <MapPin size={9} className="inline" /> Ranh giới lưu vào hệ thống — bản đồ
            admin và portal của khu phố sẽ dùng ngay, không cần sửa mã nguồn.
          </p>
        </div>
      </div>
    </div>
  )
}
