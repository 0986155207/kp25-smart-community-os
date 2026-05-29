'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  layFCMToken,
  langNghePushForeground,
  daCoFirebaseConfig,
  FIREBASE_CONFIG,
} from '@/lib/firebase-client'

export type PushTrangThai =
  | 'chua_kiem_tra'
  | 'chua_ho_tro'
  | 'chua_cau_hinh'
  | 'cho_phep'
  | 'tu_choi'
  | 'da_dang_ky'
  | 'dang_xu_ly'
  | 'loi'

export interface ThongBaoPush {
  title: string
  body:  string
  url?:  string
}

export function usePushNotification() {
  const [trangThai, setTrangThai]     = useState<PushTrangThai>('chua_kiem_tra')
  const [fcmToken, setFcmToken]       = useState<string | null>(null)
  const [loiMsg, setLoiMsg]           = useState<string | null>(null)
  const [thongBaoMoi, setThongBaoMoi] = useState<ThongBaoPush | null>(null)

  // ── Kiểm tra trạng thái ban đầu ───────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return

    if (!daCoFirebaseConfig()) {
      setTrangThai('chua_cau_hinh')
      return
    }

    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      setTrangThai('chua_ho_tro')
      return
    }

    if (Notification.permission === 'denied') {
      setTrangThai('tu_choi')
      return
    }

    if (Notification.permission === 'granted') {
      // Đã được cấp quyền → thử lấy token từ storage
      const savedToken = localStorage.getItem('kp25_fcm_token')
      if (savedToken) {
        setFcmToken(savedToken)
        setTrangThai('da_dang_ky')
      } else {
        setTrangThai('cho_phep')
      }
    } else {
      setTrangThai('cho_phep')
    }
  }, [])

  // ── Lắng nghe push foreground ─────────────────────────────
  useEffect(() => {
    if (trangThai !== 'da_dang_ky') return
    const unsub = langNghePushForeground((payload) => {
      setThongBaoMoi(payload)
      // Tự xoá sau 8s
      setTimeout(() => setThongBaoMoi(null), 8000)
    })
    return unsub
  }, [trangThai])

  // ── Đăng ký nhận push ────────────────────────────────────
  const dangKy = useCallback(async (): Promise<boolean> => {
    setTrangThai('dang_xu_ly')
    setLoiMsg(null)

    const { token, error, denied } = await layFCMToken()

    if (denied) { setTrangThai('tu_choi'); return false }
    if (!token || error) {
      setLoiMsg(error ?? 'Lỗi không xác định')
      setTrangThai('loi')
      return false
    }

    // Gửi token lên server
    try {
      const deviceName = `${navigator.userAgent.includes('Chrome') ? 'Chrome' : 'Browser'} — ${navigator.platform}`
      const res = await fetch('/api/push/subscribe', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ fcm_token: token, device_name: deviceName }),
      })

      if (!res.ok) {
        const d = await res.json() as { error?: string }
        throw new Error(d.error ?? 'Lỗi đăng ký')
      }

      localStorage.setItem('kp25_fcm_token', token)
      setFcmToken(token)
      setTrangThai('da_dang_ky')
      return true
    } catch (err) {
      setLoiMsg(err instanceof Error ? err.message : 'Lỗi đăng ký')
      setTrangThai('loi')
      return false
    }
  }, [])

  // ── Huỷ đăng ký ──────────────────────────────────────────
  const huyDangKy = useCallback(async (): Promise<boolean> => {
    const token = fcmToken ?? localStorage.getItem('kp25_fcm_token')
    if (!token) { setTrangThai('cho_phep'); return true }

    try {
      await fetch('/api/push/subscribe', {
        method:  'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ fcm_token: token }),
      })
    } catch { /* ignore */ }

    localStorage.removeItem('kp25_fcm_token')
    setFcmToken(null)
    setTrangThai('cho_phep')
    return true
  }, [fcmToken])

  return {
    trangThai,
    fcmToken,
    loiMsg,
    thongBaoMoi,
    dangKy,
    huyDangKy,
    daDangKy:  trangThai === 'da_dang_ky',
    coCauHinh: daCoFirebaseConfig(),
  }
}
