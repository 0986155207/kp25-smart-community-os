'use client'

import { useState } from 'react'
import { MapPin, Loader2, CheckCircle2, AlertCircle, Navigation } from 'lucide-react'

export interface GPSData {
  lat:     number
  lng:     number
  address: string
}

interface Props {
  onLocation: (data: GPSData | null) => void
  value:      GPSData | null
}

type Status = 'idle' | 'requesting' | 'geocoding' | 'done' | 'error'

export default function GPSLocator({ onLocation, value }: Props) {
  const [status,  setStatus]  = useState<Status>('idle')
  const [errMsg,  setErrMsg]  = useState('')

  async function handleGetLocation() {
    if (!('geolocation' in navigator)) {
      setErrMsg('Trình duyệt không hỗ trợ định vị GPS')
      setStatus('error')
      return
    }

    setStatus('requesting')
    setErrMsg('')

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords
        setStatus('geocoding')

        // Reverse geocode bằng Nominatim (miễn phí, không cần API key)
        let address = `${lat.toFixed(6)}, ${lng.toFixed(6)}`
        try {
          const res  = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=vi`,
            { headers: { 'Accept-Language': 'vi' } }
          )
          if (res.ok) {
            const geo = await res.json() as { display_name?: string; address?: Record<string, string> }
            if (geo.display_name) {
              // Rút gọn địa chỉ: bỏ quốc gia
              address = geo.display_name
                .split(',')
                .slice(0, -1)   // bỏ "Vietnam" ở cuối
                .join(',')
                .trim()
            }
          }
        } catch {
          // Giữ tọa độ thô nếu reverse geocode thất bại
        }

        const data: GPSData = { lat, lng, address }
        onLocation(data)
        setStatus('done')
      },
      (err) => {
        const msgs: Record<number, string> = {
          1: 'Bạn đã từ chối quyền truy cập vị trí. Vui lòng cho phép trong cài đặt trình duyệt.',
          2: 'Không xác định được vị trí. Vui lòng kiểm tra GPS/WiFi.',
          3: 'Quá thời gian. Vui lòng thử lại.',
        }
        setErrMsg(msgs[err.code] ?? 'Không lấy được vị trí.')
        setStatus('error')
      },
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 60_000 }
    )
  }

  function handleClear() {
    onLocation(null)
    setStatus('idle')
    setErrMsg('')
  }

  // ── Done state ────────────────────────────────────────────
  if (status === 'done' && value) {
    return (
      <div className="flex items-start gap-3 p-3.5 bg-green-50 border border-green-200 rounded-xl">
        <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
          <CheckCircle2 size={16} className="text-green-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-green-700 mb-0.5">Đã lấy vị trí GPS</p>
          <p className="text-xs text-green-600 leading-relaxed line-clamp-2">{value.address}</p>
          <p className="text-[10px] text-green-400 mt-1 font-mono">
            {value.lat.toFixed(6)}, {value.lng.toFixed(6)}
          </p>
        </div>
        <button
          type="button"
          onClick={handleClear}
          className="text-xs text-green-500 hover:text-red-500 transition-colors shrink-0 font-medium"
        >
          Xóa
        </button>
      </div>
    )
  }

  // ── Error state ───────────────────────────────────────────
  if (status === 'error') {
    return (
      <div className="space-y-2">
        <div className="flex items-start gap-2.5 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
          <AlertCircle size={14} className="shrink-0 mt-0.5" />
          <p>{errMsg}</p>
        </div>
        <button
          type="button"
          onClick={handleGetLocation}
          className="text-xs text-[#8B1A1A] hover:underline font-medium"
        >
          Thử lại
        </button>
      </div>
    )
  }

  // ── Loading states ────────────────────────────────────────
  if (status === 'requesting' || status === 'geocoding') {
    return (
      <div className="flex items-center gap-3 p-3.5 bg-blue-50 border border-blue-200 rounded-xl">
        <Loader2 size={18} className="text-blue-500 animate-spin shrink-0" />
        <div>
          <p className="text-sm font-medium text-blue-700">
            {status === 'requesting' ? 'Đang yêu cầu vị trí GPS...' : 'Đang xác định địa chỉ...'}
          </p>
          <p className="text-xs text-blue-400">Vui lòng cho phép truy cập vị trí trên trình duyệt</p>
        </div>
      </div>
    )
  }

  // ── Idle ─────────────────────────────────────────────────
  return (
    <button
      type="button"
      onClick={handleGetLocation}
      className="w-full flex items-center gap-3 p-3.5 bg-slate-50 border border-dashed border-slate-300
                 hover:border-blue-400 hover:bg-blue-50 rounded-xl transition-all group text-left"
    >
      <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center
                      shrink-0 group-hover:border-blue-300 group-hover:bg-blue-50 transition-all">
        <Navigation size={16} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-700 group-hover:text-blue-700 transition-colors">
          Lấy vị trí GPS tự động
        </p>
        <p className="text-xs text-slate-400">
          Nhấn để định vị chính xác · Hoặc nhập địa chỉ thủ công bên trên
        </p>
      </div>
      <MapPin size={16} className="text-slate-300 group-hover:text-blue-400 ml-auto shrink-0" />
    </button>
  )
}
