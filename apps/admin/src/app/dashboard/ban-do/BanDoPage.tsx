'use client'

import { KHU_PHO } from '@/lib/khu-pho'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import {
  useState, useMemo, useTransition, useEffect, useRef,
} from 'react'
import {
  Users, AlertCircle, Layers, Home, MapPin, Navigation,
  Loader2, RefreshCw, CheckCircle2, Search, X,
  Maximize2, Minimize2, Thermometer, Crosshair,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { HoDanBanDo, PhanAnhBanDo } from './actions'
import { geocodeBatch, saveGPS } from './actions'
import { HO_DAN_COLORS, TILE_LAYERS, type TileKey, type TileLayerConfig } from './config'

// ─── Dynamic import: Leaflet chỉ chạy phía browser ───────────
const GisMap = dynamic(() => import('./GisMap'), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center bg-slate-100">
      <div className="flex items-center gap-3 text-slate-500">
        <Loader2 className="animate-spin" size={22} />
        <span className="font-medium">Đang khởi tạo bản đồ...</span>
      </div>
    </div>
  ),
})

// ─── Ranh giới khu phố ────────────────────────────────────────
// Lấy từ CSDL (bảng don_vi) theo khu phố của bản triển khai này —
// KHÔNG hardcode nữa, để mỗi khu phố tự vẽ ranh giới riêng.
const TAM_MAC_DINH: [number, number] = [10.8005, 106.8118]   // Long Trường

/** Tâm hình học (centroid) của một tập điểm */
function tinhTam(diem: [number, number][]): [number, number] | null {
  if (!diem.length) return null
  return [
    diem.reduce((s, p) => s + p[0], 0) / diem.length,
    diem.reduce((s, p) => s + p[1], 0) / diem.length,
  ]
}

/** Khung bao (bounding box) của đa giác */
function khungBao(diem: [number, number][]) {
  const lats = diem.map(d => d[0])
  const lngs = diem.map(d => d[1])
  return {
    minLat: Math.min(...lats), maxLat: Math.max(...lats),
    minLng: Math.min(...lngs), maxLng: Math.max(...lngs),
  }
}

/** Điểm có nằm trong đa giác không (thuật toán ray casting) */
function trongDaGiac(lat: number, lng: number, dg: [number, number][]): boolean {
  let inside = false
  for (let i = 0, j = dg.length - 1; i < dg.length; j = i++) {
    const [yi, xi] = dg[i]!
    const [yj, xj] = dg[j]!
    if ((yi > lat) !== (yj > lat) && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) {
      inside = !inside
    }
  }
  return inside
}

// ─── Types ────────────────────────────────────────────────────
export interface GeoMarker extends HoDanBanDo {
  lat:         number
  lng:         number
  approximate: boolean
}

export interface FlyTarget {
  lat:  number
  lng:  number
  zoom: number
  ts:   number   // timestamp để phân biệt cùng tọa độ
}

// ─── Vị trí ước tính trong ranh giới ─────────────────────────
// Rải theo lưới trong khung bao của ranh giới; điểm nào rơi ra ngoài
// đa giác thì kéo dần về tâm cho tới khi nằm trong.
// Hoạt động với ranh giới BẤT KỲ hình dạng nào (không chỉ tứ giác).
function viTriTrongVung(
  u: number, v: number,
  dg: [number, number][],
  tam: [number, number],
): [number, number] {
  const bb = khungBao(dg)
  let lat = bb.minLat + v * (bb.maxLat - bb.minLat)
  let lng = bb.minLng + u * (bb.maxLng - bb.minLng)

  for (let i = 0; i < 6 && !trongDaGiac(lat, lng, dg); i++) {
    lat = lat + (tam[0] - lat) * 0.35
    lng = lng + (tam[1] - lng) * 0.35
  }
  return [lat, lng]
}

function hashId(id: string): number {
  let h = 0
  for (const c of id) h = (Math.imul(31, h) + c.charCodeAt(0)) | 0
  return Math.abs(h)
}

function buildApproxMarkers(hoDan: HoDanBanDo[], ranhGioi: [number, number][]): GeoMarker[] {
  const n = hoDan.length
  // Chưa vẽ ranh giới → KHÔNG rải vị trí ước tính (tránh chấm sai vị trí)
  if (n === 0 || ranhGioi.length < 3) return []
  const tam = tinhTam(ranhGioi)!
  const cols   = Math.ceil(Math.sqrt(n * 1.25))
  const rows   = Math.ceil(n / cols)
  const margin = 0.10
  const inner  = 1 - 2 * margin
  const cellU  = cols > 1 ? inner / (cols - 1) : inner
  const cellV  = rows > 1 ? inner / (rows - 1) : inner

  return hoDan.map((h, i) => {
    const col = i % cols
    const row = Math.floor(i / cols)
    const u0  = cols > 1 ? margin + (col / (cols - 1)) * inner : 0.5
    const v0  = rows > 1 ? margin + (row / (rows - 1)) * inner : 0.5
    const hsh = hashId(h.id)
    const ju  = ((hsh         % 1000) / 1000 - 0.5) * cellU * 0.5
    const jv  = (((hsh >> 12) % 1000) / 1000 - 0.5) * cellV * 0.5
    const u   = Math.max(margin * 0.5, Math.min(1 - margin * 0.5, u0 + ju))
    const v   = Math.max(margin * 0.5, Math.min(1 - margin * 0.5, v0 + jv))
    const [lat, lng] = viTriTrongVung(u, v, ranhGioi, tam)
    return { ...h, lat, lng, approximate: true }
  })
}

function buildMarkers(hoDan: HoDanBanDo[], ranhGioi: [number, number][]): GeoMarker[] {
  const withGPS    = hoDan.filter(h => h.toaDoLat !== null && h.toaDoLng !== null)
  const withoutGPS = hoDan.filter(h => h.toaDoLat === null || h.toaDoLng === null)
  const realMarkers: GeoMarker[] = withGPS.map(h => ({
    ...h,
    lat:         h.toaDoLat as number,
    lng:         h.toaDoLng as number,
    approximate: false,
  }))
  return [...realMarkers, ...buildApproxMarkers(withoutGPS, ranhGioi)]
}

// ─── Vietnamese diacritic normalization (search) ──────────────
// QUAN TRỌNG: dùng \u escape thay vì literal combining chars
// để tránh RangeError: Invalid regular expression khi JS parse
function boVietDau(s: string): string {
  // eslint-disable-next-line no-misleading-character-class
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')  // xóa combining diacritical marks (U+0300–U+036F)
    .replace(/đ/g, 'd')          // đ (U+0111) → d
    .replace(/Đ/g, 'D')          // Đ (U+0110) → D
    .toLowerCase()
}

// ─── Props ────────────────────────────────────────────────────
interface Props {
  hoDan:    HoDanBanDo[]
  phanAnh:  PhanAnhBanDo[]
  /** Ranh giới khu phố lấy từ CSDL — rỗng nếu khu phố chưa vẽ */
  ranhGioi: [number, number][]
  /** Tâm bản đồ tuỳ chỉnh (nếu khu phố có đặt) */
  tam:      [number, number] | null
  zoom:     number
}

// ─── GeocodeResult ────────────────────────────────────────────
interface GeocodeResult {
  processed: number
  found:     number
  remaining: number
}

// ═══════════════════════════════════════════════════════════════
//  COMPONENT CHÍNH
// ═══════════════════════════════════════════════════════════════
export default function BanDoPage({ hoDan, phanAnh, ranhGioi, tam, zoom }: Props) {
  const router = useRouter()

  // Tâm bản đồ: ưu tiên tâm khu phố đặt tay → tâm ranh giới
  // → trung bình toạ độ GPS thật → mặc định Long Trường.
  const mapCenter = useMemo<[number, number]>(() => {
    if (tam) return tam
    const tamRG = tinhTam(ranhGioi)
    if (tamRG) return tamRG
    const coGps = hoDan.filter(h => h.toaDoLat !== null && h.toaDoLng !== null)
    const tamGps = tinhTam(coGps.map(h => [h.toaDoLat as number, h.toaDoLng as number]))
    return tamGps ?? TAM_MAC_DINH
  }, [tam, ranhGioi, hoDan])

  // ── Layer toggles ────────────────────────────────────────────
  const [showHoDan,   setShowHoDan]   = useState(true)
  const [showPhanAnh, setShowPhanAnh] = useState(true)
  const [showApprox,  setShowApprox]  = useState(true)
  const [showHeatmap, setShowHeatmap] = useState(false)
  const [legendOpen,  setLegendOpen]  = useState(true)

  // ── Tile layer ───────────────────────────────────────────────
  const [tileKey, setTileKey] = useState<TileKey>('voyager')

  // ── Map navigation ───────────────────────────────────────────
  const [flyTarget,       setFlyTarget]       = useState<FlyTarget | null>(null)
  const [searchHighlight, setSearchHighlight] = useState<GeoMarker | null>(null)
  const [locatePos,       setLocatePos]       = useState<[number, number] | null>(null)

  // ── Search ───────────────────────────────────────────────────
  const [mapSearch,     setMapSearch]     = useState('')
  // matchedName: tên nhân khẩu khớp với query (nếu không phải chủ hộ)
  const [searchResults, setSearchResults] = useState<(GeoMarker & { matchedName?: string })[]>([])
  const [searchOpen,    setSearchOpen]    = useState(false)
  // justSelected: true khi user vừa click chọn kết quả → tắt "Không tìm thấy"
  const [justSelected,  setJustSelected]  = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  // ── Geocode batch ────────────────────────────────────────────
  const [isPending, startTransition] = useTransition()
  const [geocodeResult, setGeocodeResult] = useState<GeocodeResult | null>(null)

  // ── Pin Drop — đặt GPS thủ công ─────────────────────────────
  // null = chế độ bình thường; GeoMarker = đang chờ user click bản đồ
  const [droppingPinFor, setDroppingPinFor] = useState<GeoMarker | null>(null)
  const [savingGPS,      setSavingGPS]      = useState(false)
  const [saveGPSMsg,     setSaveGPSMsg]     = useState('')

  // ── Fullscreen ───────────────────────────────────────────────
  const [isFullscreen, setIsFullscreen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // ── Locate ───────────────────────────────────────────────────
  const [isLocating, setIsLocating] = useState(false)
  const [locateError, setLocateError] = useState('')

  // ── Markers ─────────────────────────────────────────────────
  const geoMarkers = useMemo(() => buildMarkers(hoDan, ranhGioi), [hoDan, ranhGioi])

  const visibleMarkers = useMemo(
    () => showApprox ? geoMarkers : geoMarkers.filter(m => !m.approximate),
    [geoMarkers, showApprox],
  )

  // ── Stats ────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    thuongTru:     hoDan.filter(h => h.trangThai === 'THUONG_TRU').length,
    tamTru:        hoDan.filter(h => h.trangThai === 'TAM_TRU').length,
    tamVang:       hoDan.filter(h => h.trangThai === 'TAM_VANG').length,
    totalNK:       hoDan.reduce((s, h) => s + h.soNhanKhau, 0),
    coGPS:         hoDan.filter(h => h.toaDoLat !== null).length,
    chuaGPS:       hoDan.filter(h => h.toaDoLat === null).length,
    phanAnhActive: phanAnh.filter(p => p.trangThai === 'MOI' || p.trangThai === 'DANG_XU_LY').length,
    phanAnhGPS:    phanAnh.filter(p => p.toaDoLat && p.toaDoLng).length,
  }), [hoDan, phanAnh])

  // ── Fullscreen listener ──────────────────────────────────────
  useEffect(() => {
    function onFsChange() { setIsFullscreen(!!document.fullscreenElement) }
    document.addEventListener('fullscreenchange', onFsChange)
    return () => document.removeEventListener('fullscreenchange', onFsChange)
  }, [])

  // ── Search dropdown: click-outside để đóng ──────────────────
  useEffect(() => {
    function onClickOut(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOut)
    return () => document.removeEventListener('mousedown', onClickOut)
  }, [])

  // Khi người dùng chọn kết quả → bỏ qua lần chạy effect tiếp theo
  const skipSearchRef = useRef(false)

  // ── Search effect: chạy khi mapSearch thay đổi ───────────────
  useEffect(() => {
    // Bỏ qua nếu vừa chọn kết quả (flyToMarker)
    if (skipSearchRef.current) {
      skipSearchRef.current = false
      return
    }

    const qTrim = mapSearch.trim()
    if (!qTrim) { setSearchResults([]); setSearchOpen(false); return }

    // Normalize NFC để khớp bất kể bàn phím gõ NFD hay NFC
    const qLow  = qTrim.normalize('NFC').toLowerCase()
    const qNorm = boVietDau(qTrim)

    // Debug: mở browser DevTools → Console để xem
    if (process.env.NODE_ENV === 'development') {
      console.log('[GIS Search] query =', JSON.stringify(qTrim),
        '| qLow =', JSON.stringify(qLow),
        '| qNorm =', JSON.stringify(qNorm))
    }

    // Strategy 1: khớp trực tiếp (có dấu, lowercase) — dùng từ ký tự đầu
    // Strategy 2: bỏ dấu — chỉ dùng khi query >= 3 ký tự để tránh false positive
    //   (vd: "D" → boVietDau → "d" khớp hầu hết tên tiếng Việt)
    const useNormalized = qNorm.length >= 3

    type ResultItem = GeoMarker & { matchedName?: string }

    const results: ResultItem[] = []
    const seen = new Set<string>()  // tránh trùng hộ

    for (const m of geoMarkers) {
      if (seen.has(m.id)) continue

      // Normalize NFC đồng nhất encoding giữa DB và keyboard input
      const chuHo  = (m.chuHo  ?? '').normalize('NFC').toLowerCase()
      const diaChi = (m.diaChiDay ?? '').normalize('NFC').toLowerCase()

      // Strategy 1: khớp trực tiếp (có dấu, NFC) ─ chủ hộ & địa chỉ
      if (chuHo.includes(qLow) || diaChi.includes(qLow)) {
        seen.add(m.id)
        results.push(m)
        continue
      }

      // Strategy 2: bỏ dấu ─ chủ hộ & địa chỉ (chỉ khi >= 3 ký tự)
      if (useNormalized && (
        boVietDau(m.chuHo ?? '').includes(qNorm) ||
        boVietDau(m.diaChiDay ?? '').includes(qNorm)
      )) {
        seen.add(m.id)
        results.push(m)
        continue
      }

      // Strategy 3: tìm trong danh sách nhân khẩu ─ trả về tên người khớp
      const nkList = m.nhanKhauTen ?? []
      let matchedName: string | undefined

      for (const ten of nkList) {
        const tenLow = ten.normalize('NFC').toLowerCase()
        if (tenLow.includes(qLow)) { matchedName = ten; break }
        if (useNormalized && boVietDau(ten).includes(qNorm)) { matchedName = ten; break }
      }

      if (matchedName) {
        seen.add(m.id)
        results.push({ ...m, matchedName })
      }
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('[GIS Search] found =', results.length,
        results.length > 0
          ? '| names: ' + results.slice(0,3).map(r => r.matchedName ?? r.chuHo).join(', ')
          : '| KHÔNG TÌM THẤY')
    }

    setSearchResults(results.slice(0, 10))
    setSearchOpen(results.length > 0)
  }, [mapSearch, geoMarkers])

  function flyToMarker(m: GeoMarker & { matchedName?: string }) {
    skipSearchRef.current = true   // effect tiếp theo sẽ bị skip
    setFlyTarget({ lat: m.lat, lng: m.lng, zoom: 19, ts: Date.now() })
    setSearchHighlight(m)
    // Hiển thị tên người được tìm thấy (nhân khẩu hoặc chủ hộ)
    setMapSearch(m.matchedName ?? m.chuHo)
    setSearchResults([])
    setSearchOpen(false)
    setJustSelected(true)  // tắt thông báo "Không tìm thấy"
  }

  function handleLocate() {
    if (!navigator.geolocation) {
      setLocateError('Trình duyệt không hỗ trợ định vị GPS')
      return
    }
    setIsLocating(true)
    setLocateError('')
    navigator.geolocation.getCurrentPosition(
      pos => {
        const lp: [number, number] = [pos.coords.latitude, pos.coords.longitude]
        setLocatePos(lp)
        setFlyTarget({ lat: lp[0], lng: lp[1], zoom: 17, ts: Date.now() })
        setIsLocating(false)
      },
      err => {
        setIsLocating(false)
        setLocateError(err.code === 1 ? 'Cần cho phép quyền định vị' : 'Không lấy được vị trí')
        setTimeout(() => setLocateError(''), 4000)
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  function toggleFullscreen() {
    if (!containerRef.current) return
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {})
    } else {
      document.exitFullscreen().catch(() => {})
    }
  }

  function handleGeocode() {
    setGeocodeResult(null)
    startTransition(async () => {
      const res = await geocodeBatch(20)
      setGeocodeResult(res)
    })
  }

  // ── Pin Drop: user click bản đồ → lưu GPS ───────────────────
  async function handleMapClick(lat: number, lng: number) {
    if (!droppingPinFor || savingGPS) return
    setSavingGPS(true)
    setSaveGPSMsg('')
    try {
      const res = await saveGPS(droppingPinFor.id, lat, lng)
      if (res.success) {
        setSaveGPSMsg(`✅ Đã lưu GPS cho ${droppingPinFor.chuHo}`)
        setDroppingPinFor(null)
        // Refresh để load tọa độ thực từ DB
        router.refresh()
      } else {
        setSaveGPSMsg(`❌ ${res.message}`)
      }
    } finally {
      setSavingGPS(false)
      setTimeout(() => setSaveGPSMsg(''), 5000)
    }
  }

  // ── isDark: điều chỉnh panel theo nền bản đồ ─────────────────
  const isDarkMap = TILE_LAYERS[tileKey].darkBg

  return (
    <div
      ref={containerRef}
      className="-m-6 flex flex-col"
      style={{ height: 'calc(100vh - 56px)' }}
    >

      {/* ════════════════════════════════════════════════════════
          STATS BAR
      ════════════════════════════════════════════════════════ */}
      <div className="bg-white border-b border-slate-100 px-4 py-2 flex items-center gap-3 shrink-0 overflow-x-auto">

        <div className="flex items-center gap-1.5 text-sm shrink-0">
          <Home size={13} className="text-slate-400" />
          <span className="text-slate-500">Tổng hộ</span>
          <span className="font-bold text-slate-800">{hoDan.length}</span>
        </div>

        <div className="w-px h-4 bg-slate-200 shrink-0" />

        {([
          { key: 'THUONG_TRU', label: 'Thường trú', count: stats.thuongTru },
          { key: 'TAM_TRU',    label: 'Tạm trú',    count: stats.tamTru   },
          { key: 'TAM_VANG',   label: 'Tạm vắng',   count: stats.tamVang  },
        ] as const).map(item => (
          <div key={item.key} className="flex items-center gap-1.5 text-sm shrink-0">
            <div className="w-2.5 h-2.5 rounded-full shrink-0"
                 style={{ background: HO_DAN_COLORS[item.key] ?? '#6B7280' }} />
            <span className="text-slate-500">{item.label}</span>
            <span className="font-bold text-slate-800">{item.count}</span>
          </div>
        ))}

        <div className="w-px h-4 bg-slate-200 shrink-0" />

        <div className="flex items-center gap-1.5 text-sm shrink-0">
          <Users size={13} className="text-slate-400" />
          <span className="text-slate-500">Nhân khẩu</span>
          <span className="font-bold text-slate-800">{stats.totalNK}</span>
        </div>

        <div className="w-px h-4 bg-slate-200 shrink-0" />

        <div className="flex items-center gap-1.5 text-sm shrink-0">
          <Navigation size={13} className="text-emerald-500" />
          <span className="text-slate-500">GPS thật</span>
          <span className="font-bold text-emerald-700">{stats.coGPS}</span>
        </div>

        {stats.chuaGPS > 0 && (
          <div className="flex items-center gap-1.5 text-sm shrink-0">
            <MapPin size={13} className="text-amber-400" />
            <span className="text-slate-500">Ước tính</span>
            <span className="font-bold text-amber-600">{stats.chuaGPS}</span>
          </div>
        )}

        {stats.phanAnhActive > 0 && (
          <>
            <div className="w-px h-4 bg-slate-200 shrink-0" />
            <div className="flex items-center gap-1.5 text-sm shrink-0">
              <AlertCircle size={13} className="text-amber-500" />
              <span className="text-slate-500">Phản ánh xử lý</span>
              <span className="font-bold text-amber-600">{stats.phanAnhActive}</span>
            </div>
          </>
        )}

        {stats.chuaGPS > 0 && (
          <>
            <div className="w-px h-4 bg-slate-200 shrink-0" />
            <button
              onClick={handleGeocode}
              disabled={isPending}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg
                         bg-emerald-50 border border-emerald-200 text-emerald-700
                         text-xs font-semibold hover:bg-emerald-100 transition-colors
                         disabled:opacity-50 shrink-0"
              title={`Geocode 20 hộ chưa có GPS (còn ${stats.chuaGPS} hộ)`}
            >
              {isPending
                ? <><Loader2 size={11} className="animate-spin" />Đang geocode...</>
                : <><RefreshCw size={11} />Geocode {Math.min(20, stats.chuaGPS)} hộ</>
              }
            </button>
          </>
        )}

        {geocodeResult && (
          <div className="flex items-center gap-1.5 text-xs shrink-0 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg text-blue-700">
            <CheckCircle2 size={11} />
            {geocodeResult.found}/{geocodeResult.processed} tọa độ
            {geocodeResult.remaining > 0 && ` · còn ${geocodeResult.remaining}`}
          </div>
        )}

        {/* Spacer + action buttons */}
        <div className="ml-auto flex items-center gap-1.5 shrink-0">

          {/* Locate me */}
          <button
            onClick={handleLocate}
            disabled={isLocating}
            title={locateError || 'Định vị vị trí của tôi'}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all',
              locateError
                ? 'bg-red-50 border border-red-200 text-red-700'
                : locatePos
                  ? 'bg-blue-50 border border-blue-200 text-blue-700'
                  : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100',
            )}
          >
            {isLocating
              ? <Loader2 size={12} className="animate-spin" />
              : <Crosshair size={12} />
            }
            <span className="hidden sm:inline">
              {isLocating ? 'Đang định vị...' : locateError || (locatePos ? 'Đã định vị' : 'Định vị tôi')}
            </span>
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình (F11)'}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold
                       bg-slate-50 border border-slate-200 text-slate-600
                       hover:bg-slate-100 transition-colors"
          >
            {isFullscreen ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
            <span className="hidden sm:inline">
              {isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}
            </span>
          </button>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════
          MAP AREA
      ════════════════════════════════════════════════════════ */}
      <div className="flex-1 relative min-h-0 overflow-hidden">
        <GisMap
          markers={visibleMarkers}
          phanAnh={phanAnh}
          showHoDan={showHoDan}
          showPhanAnh={showPhanAnh}
          showHeatmap={showHeatmap}
          boundary={ranhGioi}
          mapCenter={mapCenter}
          mapZoom={zoom}
          tileKey={tileKey}
          flyTarget={flyTarget}
          searchHighlight={searchHighlight}
          locatePos={locatePos}
          droppingPinFor={droppingPinFor}
          onMapClick={handleMapClick}
          onStartPinDrop={setDroppingPinFor}
        />

        {/* ════════════════════════════════════════════════════
            BANNER: Chế độ đặt GPS thủ công
        ════════════════════════════════════════════════════ */}
        {droppingPinFor && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000]
                          flex items-center gap-3 px-4 py-2.5
                          bg-amber-500 text-white rounded-2xl shadow-2xl
                          border border-amber-400 text-sm font-semibold
                          animate-bounce-once pointer-events-auto">
            <MapPin size={16} className="shrink-0" />
            <span>
              Click vị trí chính xác của{' '}
              <span className="underline underline-offset-2">{droppingPinFor.chuHo}</span>
            </span>
            {savingGPS && <Loader2 size={14} className="animate-spin shrink-0" />}
            {!savingGPS && (
              <button
                onClick={() => setDroppingPinFor(null)}
                className="ml-1 opacity-80 hover:opacity-100"
                title="Hủy"
              >
                <X size={14} />
              </button>
            )}
          </div>
        )}

        {/* Thông báo lưu GPS */}
        {saveGPSMsg && !droppingPinFor && (
          <div className={cn(
            'absolute top-3 left-1/2 -translate-x-1/2 z-[1000]',
            'flex items-center gap-2 px-4 py-2.5 rounded-2xl shadow-2xl text-sm font-semibold',
            saveGPSMsg.startsWith('✅')
              ? 'bg-emerald-600 text-white'
              : 'bg-red-600 text-white',
          )}>
            {saveGPSMsg}
          </div>
        )}

        {/* ════════════════════════════════════════════════════
            FLOATING CONTROL PANEL (top-right)
        ════════════════════════════════════════════════════ */}
        <div className={cn(
          'absolute top-3 right-3 z-[900] rounded-2xl shadow-2xl overflow-hidden w-[230px]',
          isDarkMap
            ? 'bg-slate-800/95 backdrop-blur border border-slate-600/50 text-white'
            : 'bg-white border border-slate-100',
        )}>

          {/* Header */}
          <button
            onClick={() => setLegendOpen(o => !o)}
            className={cn(
              'w-full flex items-center justify-between px-4 py-3 transition-colors',
              isDarkMap ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50',
            )}
          >
            <div className="flex items-center gap-2">
              <Layers size={14} className={isDarkMap ? 'text-blue-400' : 'text-[#1E3A5F]'} />
              <span className={cn(
                'text-xs font-bold uppercase tracking-wider',
                isDarkMap ? 'text-slate-200' : 'text-slate-700',
              )}>
                Lớp bản đồ
              </span>
            </div>
            <span className={cn('text-xs', isDarkMap ? 'text-slate-400' : 'text-slate-300')}>
              {legendOpen ? '▲' : '▼'}
            </span>
          </button>

          {legendOpen && (
            <div className={cn('border-t', isDarkMap ? 'border-slate-600/50' : 'border-slate-50')}>

              {/* ── Tìm kiếm trên bản đồ ────────────────────── */}
              <div ref={searchRef} className="px-3 pt-3 pb-2 relative">
                <div className="relative">
                  <Search size={12} className={cn(
                    'absolute left-2.5 top-1/2 -translate-y-1/2',
                    isDarkMap ? 'text-slate-400' : 'text-slate-400',
                  )} />
                  <input
                    value={mapSearch}
                    onChange={e => { setMapSearch(e.target.value); setJustSelected(false) }}
                    onFocus={() => searchResults.length > 0 && setSearchOpen(true)}
                    placeholder="Tìm hộ dân, nhân khẩu, địa chỉ..."
                    className={cn(
                      'w-full pl-7 pr-7 py-2 text-xs rounded-lg border focus:outline-none transition-colors',
                      isDarkMap
                        ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-blue-400'
                        : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-[#1E3A5F] focus:ring-1 focus:ring-[#1E3A5F]',
                    )}
                  />
                  {mapSearch && (
                    <button
                      onClick={() => { setMapSearch(''); setSearchResults([]); setSearchOpen(false); setSearchHighlight(null); setJustSelected(false) }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"
                    >
                      <X size={11} />
                    </button>
                  )}
                </div>

                {/* Search dropdown */}
                {searchOpen && searchResults.length > 0 && (
                  <div className={cn(
                    'absolute left-3 right-3 top-full mt-1 rounded-xl shadow-2xl border max-h-52 overflow-y-auto z-10',
                    isDarkMap
                      ? 'bg-slate-700 border-slate-600'
                      : 'bg-white border-slate-200',
                  )}>
                    {searchResults.map(m => (
                      <button
                        key={m.id + (m.matchedName ?? '')}
                        onClick={() => flyToMarker(m)}
                        className={cn(
                          'w-full flex items-center gap-2.5 px-3 py-2.5 text-left border-b last:border-0 transition-colors',
                          isDarkMap
                            ? 'border-slate-600/50 hover:bg-slate-600'
                            : 'border-slate-50 hover:bg-slate-50',
                        )}
                      >
                        <div className="w-2 h-2 rounded-full shrink-0"
                             style={{ background: HO_DAN_COLORS[m.trangThai] ?? '#6B7280' }} />
                        <div className="flex-1 min-w-0">
                          {/* Tên được tìm thấy */}
                          <div className={cn('text-xs font-semibold truncate', isDarkMap ? 'text-slate-100' : 'text-slate-800')}>
                            {m.matchedName ?? m.chuHo}
                          </div>
                          {/* Phụ đề: chủ hộ (nếu match là nhân khẩu) hoặc địa chỉ */}
                          <div className={cn('text-[10px] truncate', isDarkMap ? 'text-slate-400' : 'text-slate-400')}>
                            {m.matchedName
                              ? <span>Chủ hộ: <span className="font-medium">{m.chuHo}</span> · {m.diaChiDay}</span>
                              : m.diaChiDay
                            }
                          </div>
                        </div>
                        {m.approximate && (
                          <span className="text-[9px] text-amber-600 bg-amber-100 px-1 py-0.5 rounded font-bold shrink-0">
                            ~GPS
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {mapSearch.trim() && searchResults.length === 0 && !justSelected && (
                  <p className={cn('text-[11px] mt-1 px-1', isDarkMap ? 'text-slate-400' : 'text-slate-400')}>
                    Không tìm thấy hộ dân hay nhân khẩu nào
                  </p>
                )}
              </div>

              {/* ── Nền bản đồ ──────────────────────────────── */}
              <div className={cn('px-3 pt-1 pb-3 border-t', isDarkMap ? 'border-slate-600/50' : 'border-slate-100')}>
                <p className={cn('text-[10px] font-bold uppercase tracking-wider mb-2 mt-1', isDarkMap ? 'text-slate-400' : 'text-slate-400')}>
                  Nền bản đồ
                </p>
                <div className="grid grid-cols-4 gap-1">
                  {(Object.entries(TILE_LAYERS) as [TileKey, TileLayerConfig][]).map(([key, cfg]) => (
                    <button
                      key={key}
                      onClick={() => setTileKey(key)}
                      title={cfg.name}
                      className={cn(
                        'flex flex-col items-center gap-1 py-2 px-1 rounded-lg text-[10px] font-semibold transition-all',
                        tileKey === key
                          ? isDarkMap
                            ? 'bg-blue-500 text-white'
                            : 'bg-[#1E3A5F] text-white'
                          : isDarkMap
                            ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100',
                      )}
                    >
                      <span className="text-base leading-none">{cfg.emoji}</span>
                      <span>{cfg.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Lớp Hộ dân ──────────────────────────────── */}
              <div className={cn('px-3 pt-2 pb-2 border-t', isDarkMap ? 'border-slate-600/50' : 'border-slate-100')}>

                <button
                  onClick={() => setShowHoDan(v => !v)}
                  className="flex items-center gap-2.5 w-full"
                >
                  <div className={cn(
                    'w-9 h-5 rounded-full transition-colors relative',
                    showHoDan ? (isDarkMap ? 'bg-blue-500' : 'bg-[#1E3A5F]') : 'bg-slate-300',
                  )}>
                    <div className={cn(
                      'absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all',
                      showHoDan ? 'left-4' : 'left-0.5',
                    )} />
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="flex gap-0.5">
                      {['THUONG_TRU', 'TAM_TRU', 'TAM_VANG'].map(k => (
                        <div key={k} className="w-2.5 h-2.5 rounded-full" style={{ background: HO_DAN_COLORS[k] }} />
                      ))}
                    </div>
                    <span className={cn('text-sm font-semibold ml-1', isDarkMap ? 'text-slate-200' : 'text-slate-700')}>
                      Hộ dân
                    </span>
                  </div>
                  <span className={cn('ml-auto text-xs', isDarkMap ? 'text-slate-400' : 'text-slate-400')}>
                    {hoDan.length}
                  </span>
                </button>

                {showHoDan && (
                  <div className="ml-11 mt-2 space-y-1.5">
                    {([
                      { key: 'THUONG_TRU', label: 'Thường trú', count: stats.thuongTru },
                      { key: 'TAM_TRU',    label: 'Tạm trú',    count: stats.tamTru   },
                      { key: 'TAM_VANG',   label: 'Tạm vắng',   count: stats.tamVang  },
                    ] as const).map(item => (
                      <div key={item.key} className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full shrink-0"
                             style={{ background: HO_DAN_COLORS[item.key] ?? '#6B7280' }} />
                        <span className={cn('text-xs flex-1', isDarkMap ? 'text-slate-400' : 'text-slate-500')}>
                          {item.label}
                        </span>
                        <span className={cn('text-xs font-semibold', isDarkMap ? 'text-slate-200' : 'text-slate-700')}>
                          {item.count}
                        </span>
                      </div>
                    ))}

                    {/* Toggle ước tính */}
                    <div className={cn('pt-1.5 border-t', isDarkMap ? 'border-slate-600/50' : 'border-slate-100')}>
                      <button
                        onClick={() => setShowApprox(v => !v)}
                        className="flex items-center gap-1.5 w-full"
                      >
                        <div className={cn(
                          'w-7 h-4 rounded-full transition-colors relative shrink-0',
                          showApprox ? 'bg-amber-400' : 'bg-slate-300',
                        )}>
                          <div className={cn(
                            'absolute top-0.5 w-3 h-3 bg-white rounded-full shadow-sm transition-all',
                            showApprox ? 'left-3.5' : 'left-0.5',
                          )} />
                        </div>
                        <span className={cn('text-xs', isDarkMap ? 'text-slate-400' : 'text-slate-500')}>
                          Vị trí ước tính
                          <span className="ml-1 text-amber-500 font-semibold">({stats.chuaGPS})</span>
                        </span>
                      </button>
                    </div>

                    {/* GPS xác thực */}
                    <div className="flex items-center gap-1.5">
                      <Navigation size={11} className="text-emerald-500 shrink-0" />
                      <span className={cn('text-xs flex-1', isDarkMap ? 'text-slate-400' : 'text-slate-500')}>
                        GPS xác thực
                      </span>
                      <span className={cn('text-xs font-semibold', isDarkMap ? 'text-emerald-400' : 'text-emerald-700')}>
                        {stats.coGPS}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* ── Ranh giới KP25 ──────────────────────────── */}
              <div className={cn('px-3 pt-2 pb-2 border-t flex items-center gap-2.5', isDarkMap ? 'border-slate-600/50' : 'border-slate-100')}>
                <div className="w-9 h-5 flex items-center justify-center">
                  <div className={cn(
                    'w-7 h-4 rounded border-2 border-dashed',
                    isDarkMap ? 'border-blue-400 bg-blue-400/10' : 'border-[#1E3A5F] bg-[#1E3A5F]/5',
                  )} />
                </div>
                <span className={cn('text-sm font-semibold', isDarkMap ? 'text-slate-200' : 'text-slate-700')}>
                  Ranh giới {KHU_PHO.ma}
                </span>
              </div>

              {/* ── Mật độ dân cư (heatmap) ─────────────────── */}
              <div className={cn('px-3 pt-2 pb-2 border-t', isDarkMap ? 'border-slate-600/50' : 'border-slate-100')}>
                <button
                  onClick={() => setShowHeatmap(v => !v)}
                  className="flex items-center gap-2.5 w-full"
                >
                  <div className={cn(
                    'w-9 h-5 rounded-full transition-colors relative',
                    showHeatmap ? 'bg-orange-400' : 'bg-slate-300',
                  )}>
                    <div className={cn(
                      'absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all',
                      showHeatmap ? 'left-4' : 'left-0.5',
                    )} />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Thermometer size={13} className={showHeatmap ? 'text-orange-500' : 'text-slate-400'} />
                    <span className={cn('text-sm font-semibold', isDarkMap ? 'text-slate-200' : 'text-slate-700')}>
                      Mật độ dân cư
                    </span>
                  </div>
                </button>

                {showHeatmap && (
                  <p className={cn('ml-11 mt-1 text-[10px]', isDarkMap ? 'text-slate-400' : 'text-slate-400')}>
                    Vòng tròn màu = độ tập trung hộ dân
                  </p>
                )}
              </div>

              {/* ── Lớp Phản ánh ────────────────────────────── */}
              <div className={cn('px-3 pt-2 pb-3 border-t', isDarkMap ? 'border-slate-600/50' : 'border-slate-100')}>
                <button
                  onClick={() => setShowPhanAnh(v => !v)}
                  className="flex items-center gap-2.5 w-full"
                >
                  <div className={cn(
                    'w-9 h-5 rounded-full transition-colors relative',
                    showPhanAnh ? 'bg-[#8B1A1A]' : 'bg-slate-300',
                  )}>
                    <div className={cn(
                      'absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all',
                      showPhanAnh ? 'left-4' : 'left-0.5',
                    )} />
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="flex gap-0.5">
                      {['#DC2626', '#EA580C', '#CA8A04'].map(c => (
                        <div key={c} className="w-2.5 h-2.5 rounded-sm rotate-45" style={{ background: c }} />
                      ))}
                    </div>
                    <span className={cn('text-sm font-semibold ml-1', isDarkMap ? 'text-slate-200' : 'text-slate-700')}>
                      Phản ánh
                    </span>
                  </div>
                  <span className={cn('ml-auto text-xs', isDarkMap ? 'text-slate-400' : 'text-slate-400')}>
                    {stats.phanAnhGPS > 0 ? stats.phanAnhGPS : '—'}
                  </span>
                </button>

                {showPhanAnh && stats.phanAnhGPS === 0 && (
                  <p className={cn('ml-11 mt-1.5 text-xs italic', isDarkMap ? 'text-slate-500' : 'text-slate-400')}>
                    Chưa có phản ánh có tọa độ GPS
                  </p>
                )}

                {showPhanAnh && stats.phanAnhGPS > 0 && (
                  <div className="ml-11 mt-2 space-y-1.5">
                    {[
                      { color: '#DC2626', label: 'Khẩn cấp'   },
                      { color: '#EA580C', label: 'Cao'         },
                      { color: '#CA8A04', label: 'Trung bình'  },
                      { color: '#6B7280', label: 'Thấp'        },
                    ].map(item => (
                      <div key={item.color} className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-sm rotate-45 shrink-0" style={{ background: item.color }} />
                        <span className={cn('text-xs', isDarkMap ? 'text-slate-400' : 'text-slate-500')}>
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}
        </div>

        {/* Attribution */}
        <div className="absolute bottom-1 left-3 z-[900] text-[10px] text-slate-400 bg-white/75 backdrop-blur-sm px-2 py-0.5 rounded-full pointer-events-none">
          © OpenStreetMap · © CARTO · Esri · Geocoding: Nominatim
        </div>
      </div>
    </div>
  )
}
