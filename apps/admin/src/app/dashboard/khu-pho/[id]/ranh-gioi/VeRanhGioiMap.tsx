'use client'

import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, Marker, Polygon, Polyline, ZoomControl, useMapEvents, useMap } from 'react-leaflet'
import { useEffect } from 'react'
import type { Diem } from '../../actions'

// ─── Đỉnh: chấm tròn đánh số, kéo được ───────────────────────
function iconDinh(stt: number, mau: string): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `<div style="
        width:22px;height:22px;border-radius:50%;
        background:${mau};border:2px solid #fff;
        box-shadow:0 1px 5px rgba(0,0,0,.4);
        color:#fff;font-size:11px;font-weight:700;
        display:flex;align-items:center;justify-content:center;">${stt}</div>`,
    iconSize:   [22, 22],
    iconAnchor: [11, 11],
  })
}

// ─── Bắt sự kiện click trên bản đồ để thêm đỉnh ──────────────
function BatClick({ onThemDiem }: { onThemDiem: (d: Diem) => void }) {
  useMapEvents({
    click(e) {
      onThemDiem([
        Number(e.latlng.lat.toFixed(6)),
        Number(e.latlng.lng.toFixed(6)),
      ])
    },
  })
  return null
}

// ─── Bay tới vùng ranh giới khi mở / khi nhập GeoJSON ────────
function TuDongVua({ diem }: { diem: Diem[] }) {
  const map = useMap()
  useEffect(() => {
    if (diem.length >= 2) {
      map.fitBounds(L.latLngBounds(diem.map(d => L.latLng(d[0], d[1]))), { padding: [60, 60] })
    }
  }, [diem, map])
  return null
}

interface Props {
  diem: Diem[]
  mau: string
  tam: Diem
  zoom: number
  vuaKhung: number          // đổi giá trị này để ép bản đồ fit lại vùng
  onThemDiem: (d: Diem) => void
  onKeoDiem: (i: number, d: Diem) => void
  onXoaDiem: (i: number) => void
}

export default function VeRanhGioiMap({
  diem, mau, tam, zoom, vuaKhung,
  onThemDiem, onKeoDiem, onXoaDiem,
}: Props) {
  return (
    <MapContainer
      center={tam}
      zoom={zoom}
      style={{ height: '100%', width: '100%' }}
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap &copy; CARTO'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        maxZoom={20}
      />
      <ZoomControl position="bottomright" />
      <BatClick onThemDiem={onThemDiem} />
      {vuaKhung > 0 && <TuDongVua diem={diem} />}

      {/* Vùng đã khép kín (từ 3 đỉnh) */}
      {diem.length >= 3 && (
        <Polygon
          positions={diem}
          pathOptions={{ color: mau, weight: 2.5, opacity: 0.9, fillColor: mau, fillOpacity: 0.12, dashArray: '8 5' }}
        />
      )}

      {/* Mới 2 đỉnh → vẽ đường thẳng cho dễ hình dung */}
      {diem.length === 2 && (
        <Polyline positions={diem} pathOptions={{ color: mau, weight: 2.5, dashArray: '8 5' }} />
      )}

      {/* Các đỉnh — kéo để chỉnh, bấm để xoá */}
      {diem.map((d, i) => (
        <Marker
          key={`${i}-${d[0]}-${d[1]}`}
          position={d}
          draggable
          icon={iconDinh(i + 1, mau)}
          eventHandlers={{
            dragend: (e) => {
              const p = (e.target as L.Marker).getLatLng()
              onKeoDiem(i, [Number(p.lat.toFixed(6)), Number(p.lng.toFixed(6))])
            },
            click: () => onXoaDiem(i),
          }}
        />
      ))}
    </MapContainer>
  )
}
