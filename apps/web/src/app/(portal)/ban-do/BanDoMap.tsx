'use client'

import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, Polygon } from 'react-leaflet'
import { useState, useEffect, useMemo } from 'react'
import type { PhanAnhMap } from './actions'
import { KHU_PHO } from '@/lib/khu-pho'

// ─── Fix Leaflet default icon ─────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// ─── Màu sắc theo mức độ phản ánh ────────────────────────────
const MUC_DO_COLOR: Record<string, string> = {
  KHAN_CAP:   '#DC2626',
  CAO:        '#EA580C',
  TRUNG_BINH: '#CA8A04',
  THAP:       '#6B7280',
}

const MUC_DO_LABEL: Record<string, string> = {
  KHAN_CAP:   'Khẩn cấp',
  CAO:        'Cao',
  TRUNG_BINH: 'Trung bình',
  THAP:       'Thấp',
}

const LOAI_LABEL: Record<string, string> = {
  AN_NINH:       'An ninh',
  MOI_TRUONG:    'Môi trường',
  CO_SO_HA_TANG: 'Cơ sở hạ tầng',
  GIAO_THONG:    'Giao thông',
  AN_SINH:       'An sinh',
  KHAC:          'Khác',
}

// ─── Icon factory phản ánh ────────────────────────────────────
function createIcon(mucDo: string): L.DivIcon {
  const color = MUC_DO_COLOR[mucDo] ?? '#DC2626'
  return L.divIcon({
    html: `<div style="position:relative;width:28px;height:34px;">
      <div style="position:absolute;top:0;left:3px;width:22px;height:22px;
        border-radius:50% 50% 50% 0;background:${color};
        border:2.5px solid white;transform:rotate(-45deg);
        box-shadow:0 2px 8px rgba(0,0,0,0.35);"></div>
      <svg xmlns="http://www.w3.org/2000/svg"
           style="position:absolute;top:3px;left:9px;"
           width="10" height="10" viewBox="0 0 24 24" fill="white">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10
                 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
      </svg>
    </div>`,
    className:   '',
    iconSize:    [28, 34],
    iconAnchor:  [14, 34],
    popupAnchor: [0, -36],
  })
}

// Cache icon
const _icons: Record<string, L.DivIcon> = {}
function getIcon(mucDo: string) {
  if (!_icons[mucDo]) _icons[mucDo] = createIcon(mucDo)
  return _icons[mucDo]!
}

// Tâm dự phòng khi khu phố chưa vẽ ranh giới và chưa có phản ánh nào có GPS
const TAM_MAC_DINH: [number, number] = [10.8005, 106.8118]   // Long Trường

// ─── Props ────────────────────────────────────────────────────
interface Props {
  phanAnh: PhanAnhMap[]
  /** Ranh giới khu phố lấy từ CSDL — rỗng nếu chưa vẽ */
  ranhGioi: [number, number][]
  tam:      [number, number] | null
  zoom:     number
}

// ─── Component ────────────────────────────────────────────────
export default function BanDoMap({ phanAnh, ranhGioi, tam, zoom }: Props) {
  const [ready, setReady] = useState(false)
  useEffect(() => { setReady(true) }, [])

  const markers = useMemo(
    () => phanAnh.filter(p => p.toaDoLat && p.toaDoLng),
    [phanAnh],
  )

  // Tâm: khu phố đặt tay → tâm ranh giới → trung bình phản ánh có GPS → mặc định
  const mapCenter = useMemo<[number, number]>(() => {
    if (tam) return tam
    if (ranhGioi.length) {
      return [
        ranhGioi.reduce((s, p) => s + p[0], 0) / ranhGioi.length,
        ranhGioi.reduce((s, p) => s + p[1], 0) / ranhGioi.length,
      ]
    }
    if (markers.length) {
      return [
        markers.reduce((s, p) => s + p.toaDoLat, 0) / markers.length,
        markers.reduce((s, p) => s + p.toaDoLng, 0) / markers.length,
      ]
    }
    return TAM_MAC_DINH
  }, [tam, ranhGioi, markers])

  if (!ready) return (
    <div className="h-full flex items-center justify-center bg-slate-50 rounded-2xl">
      <div className="text-slate-400 text-sm">Đang tải bản đồ...</div>
    </div>
  )

  return (
    <MapContainer
      center={mapCenter}
      zoom={zoom}
      style={{ height: '100%', width: '100%' }}
      zoomControl={false}
      preferCanvas={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        maxZoom={20}
      />
      <ZoomControl position="bottomright" />

      {/* Ranh giới KP25 */}
      {/* Ranh giới khu phố — chỉ vẽ khi khu phố đã có ranh giới */}
      {ranhGioi.length >= 3 && (
        <Polygon
          positions={ranhGioi}
          pathOptions={{
            color:       KHU_PHO.mau,
            weight:      2.5,
            opacity:     0.9,
            fillColor:   KHU_PHO.mau,
            fillOpacity: 0.05,
            dashArray:   '8 5',
          }}
        />
      )}

      {/* Phản ánh có GPS */}
      {markers.map(p => (
        <Marker key={p.id} position={[p.toaDoLat, p.toaDoLng]} icon={getIcon(p.mucDo)}>
          <Popup minWidth={200} maxWidth={260}>
            <div style={{ padding: '4px 2px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: MUC_DO_COLOR[p.mucDo] ?? '#DC2626', flexShrink: 0,
                }} />
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>
                  {MUC_DO_LABEL[p.mucDo] ?? p.mucDo}
                  {p.loai ? ` · ${LOAI_LABEL[p.loai] ?? p.loai}` : ''}
                </span>
              </div>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#0f172a', marginBottom: 4 }}>
                {p.tieuDe}
              </div>
              {p.diaChiPhanAnh && (
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>
                  📍 {p.diaChiPhanAnh}
                </div>
              )}
              <div style={{ marginBottom: 6 }}>
                <span style={{
                  fontSize: 11, padding: '2px 8px', borderRadius: 9999,
                  background: p.trangThai === 'MOI' ? '#FEF3C7' : '#DBEAFE',
                  color:      p.trangThai === 'MOI' ? '#92400E' : '#1E40AF',
                  fontWeight: 600,
                }}>
                  {p.trangThai === 'MOI' ? 'Mới tiếp nhận' : 'Đang xử lý'}
                </span>
              </div>
              <a
                href={`/phan-anh/${p.id}`}
                style={{ fontSize: 12, fontWeight: 600, color: '#8B1A1A', textDecoration: 'none' }}
              >
                Xem chi tiết →
              </a>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
