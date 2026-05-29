// Shared constants — no browser dependencies, safe for SSR

export const HO_DAN_COLORS: Record<string, string> = {
  THUONG_TRU: '#16A34A',
  TAM_TRU:    '#2563EB',
  TAM_VANG:   '#D97706',
}

export const PHAN_ANH_COLORS: Record<string, string> = {
  KHAN_CAP:   '#DC2626',
  CAO:        '#EA580C',
  TRUNG_BINH: '#CA8A04',
  THAP:       '#6B7280',
}

export const TRANG_THAI_LABEL: Record<string, string> = {
  THUONG_TRU: 'Thường trú',
  TAM_TRU:    'Tạm trú',
  TAM_VANG:   'Tạm vắng',
}

export const MUC_DO_LABEL: Record<string, string> = {
  KHAN_CAP:   'Khẩn cấp',
  CAO:        'Cao',
  TRUNG_BINH: 'Trung bình',
  THAP:       'Thấp',
}

export const LOAI_LABEL: Record<string, string> = {
  AN_NINH:       'An ninh',
  MOI_TRUONG:    'Môi trường',
  CO_SO_HA_TANG: 'Cơ sở hạ tầng',
  GIAO_THONG:    'Giao thông',
  AN_SINH:       'An sinh',
  KHAC:          'Khác',
}

// ─── Tile layers ─────────────────────────────────────────────
export type TileKey = 'voyager' | 'osm' | 'dark' | 'satellite'

export interface TileLayerConfig {
  name:        string
  emoji:       string
  url:         string
  attribution: string
  maxZoom:     number
  subdomains?: string
  darkBg:      boolean   // true = nền tối → đổi màu text/icon overlay
}

export const TILE_LAYERS: Record<TileKey, TileLayerConfig> = {
  voyager: {
    name:        'Bản đồ',
    emoji:       '🗺️',
    url:         'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom:     20,
    subdomains:  'abcd',
    darkBg:      false,
  },
  osm: {
    name:        'OSM',
    emoji:       '🛣️',
    url:         'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom:     19,
    subdomains:  'abc',
    darkBg:      false,
  },
  dark: {
    name:        'Tối',
    emoji:       '🌙',
    url:         'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom:     20,
    subdomains:  'abcd',
    darkBg:      true,
  },
  satellite: {
    name:        'Vệ tinh',
    emoji:       '🛰️',
    // Esri World Imagery — không cần subdomains
    url:         'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Esri, Maxar, Earthstar Geographics',
    maxZoom:     19,
    darkBg:      true,
  },
}

// Lớp nhãn đường đè lên vệ tinh (CartoDB labels only)
export const SATELLITE_LABELS_URL =
  'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png'
