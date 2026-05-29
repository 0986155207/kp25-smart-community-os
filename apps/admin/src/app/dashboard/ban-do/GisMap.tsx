'use client'

import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  MapContainer, TileLayer, Marker, Popup,
  ZoomControl, Polygon, useMap, useMapEvents,
} from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import { useMemo, useState, useEffect, useRef } from 'react'
import type { GeoMarker, FlyTarget } from './BanDoPage'
import type { PhanAnhBanDo } from './actions'
import type { TileKey } from './config'
import {
  HO_DAN_COLORS, PHAN_ANH_COLORS,
  TRANG_THAI_LABEL, MUC_DO_LABEL, LOAI_LABEL,
  TILE_LAYERS, SATELLITE_LABELS_URL,
} from './config'

// ─── Fix Leaflet default icon (webpack / Next.js) ─────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// ─── Hộ dân icon ─────────────────────────────────────────────
function createHoDanIcon(trangThai: string, approximate = false): L.DivIcon {
  const color   = HO_DAN_COLORS[trangThai] ?? '#6B7280'
  const size    = approximate ? 18 : 20
  const opacity = approximate ? 0.55 : 1
  const border  = approximate
    ? '2px dashed rgba(255,255,255,0.7)'
    : '2px solid rgba(255,255,255,0.95)'

  return L.divIcon({
    html: `<div style="
        width:${size}px;height:${size}px;border-radius:50%;
        background:${color};border:${border};
        box-shadow:0 1px 5px rgba(0,0,0,0.35);
        opacity:${opacity};
        display:flex;align-items:center;justify-content:center;">
      <svg xmlns="http://www.w3.org/2000/svg"
           width="${Math.round(size * 0.55)}" height="${Math.round(size * 0.55)}"
           viewBox="0 0 24 24" fill="white">
        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
      </svg>
    </div>`,
    className:   '',
    iconSize:    [size, size],
    iconAnchor:  [size / 2, size / 2],
    popupAnchor: [0, -size / 2 - 4],
  })
}

// ─── Phản ánh icon ────────────────────────────────────────────
function createPhanAnhIcon(mucDo: string): L.DivIcon {
  const color = PHAN_ANH_COLORS[mucDo] ?? '#DC2626'
  return L.divIcon({
    html: `<div style="position:relative;width:28px;height:34px;">
      <div style="position:absolute;top:0;left:3px;width:22px;height:22px;
        border-radius:50% 50% 50% 0;background:${color};
        border:2.5px solid white;transform:rotate(-45deg);
        box-shadow:0 2px 6px rgba(0,0,0,0.4);"></div>
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

// ─── Locate me icon ───────────────────────────────────────────
function createLocateMeIcon(): L.DivIcon {
  return L.divIcon({
    html: `<div style="
      width:18px;height:18px;border-radius:50%;
      background:#3B82F6;border:3px solid white;
      box-shadow:0 0 0 8px rgba(59,130,246,0.22),0 2px 8px rgba(0,0,0,0.3);">
    </div>`,
    className:   '',
    iconSize:    [18, 18],
    iconAnchor:  [9, 9],
    popupAnchor: [0, -12],
  })
}

// ─── Icon cache ───────────────────────────────────────────────
const _hoIcons: Record<string, L.DivIcon> = {}
function getHoDanIcon(trangThai: string, approximate = false) {
  const key = `${trangThai}_${approximate ? 'a' : 'r'}`
  if (!_hoIcons[key]) _hoIcons[key] = createHoDanIcon(trangThai, approximate)
  return _hoIcons[key]!
}

const _paIcons: Record<string, L.DivIcon> = {}
function getPhanAnhIcon(mucDo: string) {
  if (!_paIcons[mucDo]) _paIcons[mucDo] = createPhanAnhIcon(mucDo)
  return _paIcons[mucDo]!
}

// Singleton cho locate me (không đổi)
let _locateIcon: L.DivIcon | null = null
function getLocateMeIcon() {
  if (!_locateIcon) _locateIcon = createLocateMeIcon()
  return _locateIcon
}

// ─── Cluster icon factories ───────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createHoDanClusterIcon(cluster: any): L.DivIcon {
  const count = cluster.getChildCount() as number
  const size  = count > 50 ? 46 : count > 20 ? 40 : 34
  const bg    = count > 50 ? '#0f2d4a' : count > 20 ? '#1E3A5F' : '#2d5a9e'
  const label = count > 99 ? '99+' : String(count)
  const fs    = count > 99 ? 11 : count > 9 ? 13 : 14

  return L.divIcon({
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:50%;
      background:${bg};border:3px solid rgba(255,255,255,0.92);
      box-shadow:0 2px 10px rgba(30,58,95,0.45);
      display:flex;align-items:center;justify-content:center;">
      <span style="color:white;font-size:${fs}px;font-weight:700;line-height:1;">${label}</span>
    </div>`,
    className:  '',
    iconSize:   [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createPhanAnhClusterIcon(cluster: any): L.DivIcon {
  const count = cluster.getChildCount() as number
  const size  = count > 20 ? 46 : count > 10 ? 40 : 34
  const bg    = count > 20 ? '#6B0F0F' : count > 10 ? '#8B1A1A' : '#DC2626'
  const label = count > 99 ? '99+' : String(count)
  const fs    = count > 99 ? 11 : count > 9 ? 13 : 14

  return L.divIcon({
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:50%;
      background:${bg};border:3px solid rgba(255,255,255,0.92);
      box-shadow:0 2px 10px rgba(139,26,26,0.45);
      display:flex;align-items:center;justify-content:center;">
      <span style="color:white;font-size:${fs}px;font-weight:700;line-height:1;">${label}</span>
    </div>`,
    className:  '',
    iconSize:   [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

// ═══════════════════════════════════════════════════════════════
//  SUB-COMPONENTS (phải nằm bên trong MapContainer)
// ═══════════════════════════════════════════════════════════════

// ─── FlyToHandler: animate đến marker được chọn ───────────────
function FlyToHandler({ target }: { target: FlyTarget | null }) {
  const map    = useMap()
  const prevTs = useRef(0)

  useEffect(() => {
    if (!target || target.ts === prevTs.current) return
    prevTs.current = target.ts
    map.flyTo([target.lat, target.lng], target.zoom, {
      duration:     1.2,
      easeLinearity: 0.5,
    })
  }, [map, target])

  return null
}

// ─── HeatmapLayer: density viz dùng Canvas circles ───────────
function HeatmapLayer({
  markers, enabled,
}: { markers: GeoMarker[]; enabled: boolean }) {
  const map = useMap()

  useEffect(() => {
    if (!enabled || markers.length === 0) return

    // Canvas renderer tối ưu hơn SVG với nhiều circles
    const renderer = L.canvas({ padding: 0.5 })

    const circles = markers.map(m => {
      const fill = HO_DAN_COLORS[m.trangThai] ?? '#1E3A5F'
      return L.circle([m.lat, m.lng], {
        radius:      38,
        color:       'transparent',
        fillColor:   fill,
        fillOpacity: 0.22,
        interactive: false,
        renderer,
      }).addTo(map)
    })

    return () => { circles.forEach(c => map.removeLayer(c)) }
  }, [map, markers, enabled])

  return null
}

// ─── LocateMeMarker: "bạn đang ở đây" ────────────────────────
function LocateMeMarker({ position }: { position: [number, number] | null }) {
  if (!position) return null
  return (
    <Marker position={position} icon={getLocateMeIcon()} zIndexOffset={2000}>
      <Popup minWidth={140} closeButton={false}>
        <div style={{ fontSize: 12, fontWeight: 700, padding: '2px 0', color: '#1d4ed8' }}>
          📍 Vị trí của bạn
        </div>
      </Popup>
    </Marker>
  )
}

// ─── MapClickHandler: lắng nghe click khi ở chế độ pin-drop ──
function MapClickHandler({
  active,
  onMapClick,
}: {
  active:      boolean
  onMapClick:  (lat: number, lng: number) => void
}) {
  const map = useMapEvents({
    click(e) {
      if (!active) return
      onMapClick(e.latlng.lat, e.latlng.lng)
    },
  })

  // Đổi con trỏ chuột khi ở chế độ pin-drop
  useEffect(() => {
    const container = map.getContainer()
    container.style.cursor = active ? 'crosshair' : ''
    return () => { container.style.cursor = '' }
  }, [map, active])

  return null
}

// ─── SearchHighlight: vòng tròn nổi bật marker tìm kiếm ──────
// Giữ nguyên cho đến khi user clear search hoặc chọn kết quả mới.
// Dùng ref để tránh lỗi double-invoke của React Strict Mode.
function SearchHighlight({ target }: { target: GeoMarker | null }) {
  const map      = useMap()
  const ringsRef = useRef<L.Circle[]>([])

  useEffect(() => {
    // Xóa rings cũ (idempotent — safe nếu gọi nhiều lần)
    ringsRef.current.forEach(r => { try { map.removeLayer(r) } catch { /* đã bị remove */ } })
    ringsRef.current = []

    if (!target) return

    // Vòng ngoài lớn — halo mờ
    const outer = L.circle([target.lat, target.lng], {
      radius:      40,
      color:       '#F59E0B',
      weight:      2.5,
      opacity:     0.6,
      fillColor:   '#F59E0B',
      fillOpacity: 0.08,
      interactive: false,
    }).addTo(map)

    // Vòng trong nhỏ — xác định chính xác
    const inner = L.circle([target.lat, target.lng], {
      radius:      16,
      color:       '#F59E0B',
      weight:      3,
      opacity:     1,
      fillColor:   '#FBBF24',
      fillOpacity: 0.22,
      interactive: false,
    }).addTo(map)

    ringsRef.current = [outer, inner]

    return () => {
      ringsRef.current.forEach(r => { try { map.removeLayer(r) } catch { /* ok */ } })
      ringsRef.current = []
    }
  }, [map, target])

  return null
}

// ═══════════════════════════════════════════════════════════════
//  PROPS
// ═══════════════════════════════════════════════════════════════
interface Props {
  markers:      GeoMarker[]
  phanAnh:      PhanAnhBanDo[]
  showHoDan:    boolean
  showPhanAnh:  boolean
  showHeatmap:  boolean
  boundary:     [number, number][]
  mapCenter:    [number, number]
  tileKey:      TileKey
  flyTarget:    FlyTarget | null
  searchHighlight: GeoMarker | null
  locatePos:    [number, number] | null
  // Pin-drop: đặt GPS thủ công
  droppingPinFor: GeoMarker | null
  onMapClick:   (lat: number, lng: number) => void
  onStartPinDrop: (m: GeoMarker) => void
}

// ═══════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function GisMap({
  markers, phanAnh,
  showHoDan, showPhanAnh, showHeatmap,
  boundary, mapCenter,
  tileKey, flyTarget, searchHighlight, locatePos,
  droppingPinFor, onMapClick, onStartPinDrop,
}: Props) {
  const [ready, setReady] = useState(false)
  useEffect(() => { setReady(true) }, [])

  const tile = TILE_LAYERS[tileKey]
  const isDark = tile.darkBg

  const phanAnhCoords = useMemo(
    () => phanAnh.filter(p => typeof p.toaDoLat === 'number' && typeof p.toaDoLng === 'number'),
    [phanAnh],
  )

  // Màu ranh giới thay đổi theo nền bản đồ
  const boundaryColor = isDark ? '#93C5FD' : '#1E3A5F'

  if (!ready) return null

  return (
    <MapContainer
      center={mapCenter}
      zoom={16}
      style={{ height: '100%', width: '100%' }}
      zoomControl={false}
      preferCanvas={false}
    >
      {/* ── Tile layer chính ────────────────────────────────── */}
      <TileLayer
        key={tileKey}
        attribution={tile.attribution}
        url={tile.url}
        maxZoom={tile.maxZoom}
        subdomains={tile.subdomains ?? 'abc'}
      />

      {/* ── Nhãn đường đè lên vệ tinh ───────────────────────── */}
      {tileKey === 'satellite' && (
        <TileLayer
          url={SATELLITE_LABELS_URL}
          subdomains="abcd"
          maxZoom={20}
          opacity={0.85}
        />
      )}

      {/* ── Điều khiển ─────────────────────────────────────── */}
      <ZoomControl position="bottomright" />

      {/* ── Sub-components ─────────────────────────────────── */}
      <FlyToHandler    target={flyTarget} />
      <SearchHighlight target={searchHighlight} />
      <HeatmapLayer    markers={markers} enabled={showHeatmap} />
      <LocateMeMarker  position={locatePos} />
      <MapClickHandler active={!!droppingPinFor} onMapClick={onMapClick} />

      {/* ── Ranh giới KP25 ─────────────────────────────────── */}
      <Polygon
        positions={boundary}
        pathOptions={{
          color:       boundaryColor,
          weight:      2.5,
          opacity:     0.85,
          fillColor:   boundaryColor,
          fillOpacity: 0.05,
          dashArray:   '8 5',
        }}
      />

      {/* ── Hộ dân — clustered ─────────────────────────────── */}
      {showHoDan && (
        <MarkerClusterGroup
          chunkedLoading
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          iconCreateFunction={createHoDanClusterIcon as any}
          maxClusterRadius={55}
          spiderfyOnMaxZoom
          showCoverageOnHover={false}
          zoomToBoundsOnClick
          animate
          disableClusteringAtZoom={19}
        >
          {markers.map(m => (
            <Marker
              key={m.id}
              position={[m.lat, m.lng]}
              icon={getHoDanIcon(m.trangThai, m.approximate)}
              opacity={m.approximate ? 0.65 : 1}
            >
              <Popup minWidth={220} maxWidth={280} className="kp25-popup">
                <div style={{ padding: '4px 2px' }}>

                  {/* Badge trạng thái */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <div style={{
                      width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                      background: HO_DAN_COLORS[m.trangThai] ?? '#6B7280',
                    }} />
                    <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>
                      {TRANG_THAI_LABEL[m.trangThai] ?? m.trangThai}
                    </span>
                    {m.approximate && (
                      <span style={{
                        fontSize: 9, color: '#92400e', fontWeight: 700,
                        background: '#fef3c7', padding: '1px 5px', borderRadius: 4, marginLeft: 'auto',
                      }}>~ VỊ TRÍ ƯỚC TÍNH</span>
                    )}
                  </div>

                  {/* Tên chủ hộ */}
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#0f172a', marginBottom: 4 }}>
                    {m.chuHo || '(Chưa có tên)'}
                  </div>

                  {/* Địa chỉ */}
                  {m.diaChiDay && (
                    <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6, display: 'flex', gap: 4 }}>
                      <span>📍</span>
                      <span>{m.diaChiDay}</span>
                    </div>
                  )}

                  {/* Thông tin nhanh */}
                  <div style={{
                    display: 'flex', gap: 14, fontSize: 12, color: '#475569',
                    marginBottom: 8, paddingBottom: 8, borderBottom: '1px solid #f1f5f9',
                  }}>
                    <span>👥 {m.soNhanKhau} nhân khẩu</span>
                    {m.soDienThoai && <span>📞 {m.soDienThoai}</span>}
                  </div>

                  {/* Nguồn tọa độ */}
                  <div style={{ fontSize: 10, color: m.approximate ? '#b45309' : '#059669', marginBottom: 8 }}>
                    {m.approximate
                      ? '⚠️ Tọa độ ước tính — chưa có GPS thực'
                      : `📡 ${m.toaDoNguon === 'GPS' ? 'GPS thực tế'
                             : m.toaDoNguon === 'GEOCODE' ? 'Geocode OSM'
                             : 'Tọa độ xác thực'}`
                    }
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <a
                      href={`/dashboard/dan-cu/${m.id}`}
                      style={{
                        display: 'inline-block', fontSize: 12, fontWeight: 600,
                        color: '#1E3A5F', textDecoration: 'none',
                        background: '#f0f4ff', padding: '4px 10px', borderRadius: 6,
                      }}
                    >
                      Xem hồ sơ →
                    </a>

                    {/* Nút đặt GPS thủ công — chỉ hiện khi vị trí ước tính */}
                    {m.approximate && (
                      <button
                        onClick={e => {
                          e.stopPropagation()
                          onStartPinDrop(m)
                        }}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          fontSize: 12, fontWeight: 600,
                          color: '#92400e', background: '#fef3c7',
                          border: 'none', cursor: 'pointer',
                          padding: '4px 10px', borderRadius: 6,
                        }}
                      >
                        📍 Đặt GPS
                      </button>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      )}

      {/* ── Phản ánh GPS — clustered ────────────────────────── */}
      {showPhanAnh && phanAnhCoords.length > 0 && (
        <MarkerClusterGroup
          chunkedLoading
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          iconCreateFunction={createPhanAnhClusterIcon as any}
          maxClusterRadius={65}
          spiderfyOnMaxZoom
          showCoverageOnHover={false}
          zoomToBoundsOnClick
          animate
          disableClusteringAtZoom={18}
        >
          {phanAnhCoords.map(p => (
            <Marker
              key={p.id}
              position={[p.toaDoLat as number, p.toaDoLng as number]}
              icon={getPhanAnhIcon(p.mucDo)}
            >
              <Popup minWidth={210} maxWidth={270} className="kp25-popup">
                <div style={{ padding: '4px 2px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <div style={{
                      width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                      background: PHAN_ANH_COLORS[p.mucDo] ?? '#DC2626',
                    }} />
                    <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>
                      {MUC_DO_LABEL[p.mucDo] ?? p.mucDo} · {LOAI_LABEL[p.loai] ?? p.loai}
                    </span>
                  </div>

                  <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', marginBottom: 6 }}>
                    {p.tieuDe}
                  </div>

                  {p.diaChiPhanAnh && (
                    <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>
                      📍 {p.diaChiPhanAnh}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 6, marginBottom: 10, alignItems: 'center' }}>
                    <span style={{
                      padding: '2px 8px', borderRadius: 9999, fontWeight: 600, fontSize: 11,
                      background: p.trangThai === 'MOI' ? '#FEF3C7' : '#DBEAFE',
                      color:      p.trangThai === 'MOI' ? '#92400E' : '#1E40AF',
                    }}>
                      {p.trangThai === 'MOI' ? 'Mới tiếp nhận' : 'Đang xử lý'}
                    </span>
                    <span style={{ fontSize: 10, color: '#059669' }}>📡 GPS xác thực</span>
                  </div>

                  <a
                    href={`/dashboard/phan-anh/${p.id}`}
                    style={{
                      display: 'inline-block', fontSize: 12, fontWeight: 600,
                      color: '#8B1A1A', textDecoration: 'none',
                      background: '#fff1f1', padding: '4px 10px', borderRadius: 6,
                    }}
                  >
                    Xem chi tiết phản ánh →
                  </a>
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      )}
    </MapContainer>
  )
}
