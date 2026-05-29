'use client'

import { useEffect, useRef, useState } from 'react'
import { Download, RefreshCw, X, Smartphone, Wifi } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

// ─── Helpers ──────────────────────────────────────────────────
function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in window.navigator && !!(window.navigator as { standalone?: boolean }).standalone)
  )
}

function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false
  return /iphone|ipad|ipod/i.test(navigator.userAgent) && !('MSStream' in window)
}

// ─── Component ────────────────────────────────────────────────
export default function PWAManager() {
  const [updateAvailable, setUpdateAvailable]     = useState(false)
  const [installPrompt, setInstallPrompt]         = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallBanner, setShowInstallBanner] = useState(false)
  const [showIOSGuide, setShowIOSGuide]           = useState(false)
  const [isOffline, setIsOffline]                 = useState(false)
  const [swVersion, setSwVersion]                 = useState<string | null>(null)
  const swRef = useRef<ServiceWorkerRegistration | null>(null)

  // ── Đăng ký Service Worker ──────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator))  return

    // Chỉ đăng ký SW ở production — trong dev, SW cache JS cũ gây webpack module mismatch
    if (process.env.NODE_ENV !== 'production') return

    navigator.serviceWorker
      .register('/sw.js', { scope: '/', updateViaCache: 'none' })
      .then(registration => {
        console.log('[PWA] SW registered, scope:', registration.scope)
        swRef.current = registration

        // Hỏi phiên bản
        registration.active?.postMessage({ type: 'GET_VERSION' })

        // Kiểm tra cập nhật mỗi 60 phút
        const checkInterval = setInterval(() => registration.update(), 60 * 60 * 1000)

        // SW đang chờ cập nhật (có version mới)
        if (registration.waiting) {
          setUpdateAvailable(true)
        }

        // SW mới install xong nhưng chờ activate
        registration.addEventListener('updatefound', () => {
          const newSW = registration.installing
          if (!newSW) return

          newSW.addEventListener('statechange', () => {
            if (newSW.state === 'installed' && navigator.serviceWorker.controller) {
              setUpdateAvailable(true)
            }
          })
        })

        return () => clearInterval(checkInterval)
      })
      .catch(err => console.error('[PWA] SW registration failed:', err))

    // Lắng nghe message từ SW
    navigator.serviceWorker.addEventListener('message', (event) => {
      const { type, version } = event.data ?? {}
      if (type === 'SW_VERSION') setSwVersion(version)
    })
  }, [])

  // ── Install Prompt (Android/Desktop Chrome) ─────────────────
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e as BeforeInstallPromptEvent)

      // Chỉ hiện banner nếu chưa ở standalone và chưa từ chối
      if (!isStandalone()) {
        const dismissed = sessionStorage.getItem('kp25-install-dismissed')
        if (!dismissed) setShowInstallBanner(true)
      }
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  // ── iOS Install Guide ────────────────────────────────────────
  useEffect(() => {
    if (!isIOS() || isStandalone()) return undefined
    const dismissed = localStorage.getItem('kp25-ios-guide-dismissed')
    const stillValid =
      dismissed && Date.now() - parseInt(dismissed) <= 7 * 24 * 60 * 60 * 1000
    if (stillValid) return undefined
    const timer = setTimeout(() => setShowIOSGuide(true), 3000)
    return () => clearTimeout(timer)
  }, [])

  // ── Online / Offline status ──────────────────────────────────
  useEffect(() => {
    const goOnline  = () => setIsOffline(false)
    const goOffline = () => setIsOffline(true)

    setIsOffline(!navigator.onLine)
    window.addEventListener('online',  goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online',  goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  // ── Handlers ────────────────────────────────────────────────
  function handleUpdate() {
    const sw = swRef.current
    if (!sw?.waiting) return
    sw.waiting.postMessage({ type: 'SKIP_WAITING' })
    sw.waiting.addEventListener('statechange', (e) => {
      if ((e.target as ServiceWorker).state === 'activated') {
        window.location.reload()
      }
    })
    setUpdateAvailable(false)
  }

  async function handleInstall() {
    if (!installPrompt) return
    await installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'dismissed') {
      sessionStorage.setItem('kp25-install-dismissed', '1')
    }
    setInstallPrompt(null)
    setShowInstallBanner(false)
  }

  function dismissInstall() {
    sessionStorage.setItem('kp25-install-dismissed', '1')
    setShowInstallBanner(false)
  }

  function dismissIOSGuide() {
    localStorage.setItem('kp25-ios-guide-dismissed', String(Date.now()))
    setShowIOSGuide(false)
  }

  return (
    <>
      {/* ── Offline banner ──────────────────────────────────── */}
      {isOffline && (
        <div className="fixed top-0 inset-x-0 z-[9999] bg-amber-500 text-white px-4 py-2 flex items-center justify-center gap-2 text-sm font-semibold shadow-lg">
          <Wifi size={15} className="shrink-0" />
          <span>Mất kết nối mạng — Đang hiển thị dữ liệu đã cache</span>
        </div>
      )}

      {/* ── Update available banner ─────────────────────────── */}
      {updateAvailable && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9998] w-full max-w-sm px-4">
          <div className="bg-[#1E3A5F] text-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center shrink-0">
              <RefreshCw size={15} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">Có phiên bản mới</p>
              <p className="text-xs text-white/70">Cập nhật để nhận tính năng mới nhất</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={handleUpdate}
                className="px-3 py-1.5 bg-white text-[#1E3A5F] text-xs font-bold rounded-lg hover:bg-slate-100 transition-colors"
              >
                Cập nhật
              </button>
              <button
                onClick={() => setUpdateAvailable(false)}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Install Banner (Android/Desktop) ────────────────── */}
      {showInstallBanner && installPrompt && (
        <div className="fixed bottom-4 left-4 right-4 z-[9997] max-w-sm mx-auto">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-[#1E3A5F] px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-[#8B1A1A] rounded-lg flex items-center justify-center">
                  <span className="text-white text-[10px] font-black">KP</span>
                </div>
                <span className="text-white text-sm font-bold">KP25 Admin</span>
              </div>
              <button onClick={dismissInstall} className="text-white/60 hover:text-white p-1">
                <X size={14} />
              </button>
            </div>
            {/* Body */}
            <div className="px-4 py-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                  <Smartphone size={18} className="text-[#1E3A5F]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Cài đặt ứng dụng</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Truy cập nhanh hơn, dùng được offline, nhận thông báo đẩy
                  </p>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleInstall}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-[#1E3A5F] hover:bg-[#162d4a] text-white text-sm font-semibold rounded-xl transition-colors"
                >
                  <Download size={13} /> Cài ngay
                </button>
                <button
                  onClick={dismissInstall}
                  className="px-3 py-2 text-sm text-slate-500 hover:bg-slate-50 rounded-xl transition-colors"
                >
                  Để sau
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── iOS Install Guide ────────────────────────────────── */}
      {showIOSGuide && (
        <div className="fixed bottom-0 inset-x-0 z-[9997] p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 max-w-sm mx-auto">
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-slate-800 text-sm">Cài đặt trên iPhone / iPad</span>
              <button onClick={dismissIOSGuide} className="p-1 text-slate-400 hover:text-slate-600">
                <X size={15} />
              </button>
            </div>
            <ol className="space-y-2 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 bg-blue-100 text-blue-700 rounded-full text-xs font-bold flex items-center justify-center shrink-0">1</span>
                Nhấn nút <strong>Chia sẻ</strong>{' '}
                <svg className="inline w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 4.5a2.5 2.5 0 11.702 1.737L6.97 9.604a2.518 2.518 0 010 .792l6.733 3.367a2.5 2.5 0 11-.671 1.341l-6.733-3.367a2.5 2.5 0 110-3.475l6.733-3.366A2.52 2.52 0 0113 4.5z" />
                </svg>{' '}
                ở thanh dưới
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 bg-blue-100 text-blue-700 rounded-full text-xs font-bold flex items-center justify-center shrink-0">2</span>
                Chọn <strong>&quot;Thêm vào màn hình chính&quot;</strong>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 bg-blue-100 text-blue-700 rounded-full text-xs font-bold flex items-center justify-center shrink-0">3</span>
                Nhấn <strong>&quot;Thêm&quot;</strong> để hoàn tất
              </li>
            </ol>
            {/* Arrow indicator */}
            <div className="mt-3 text-center text-xs text-slate-400">↓ Nhấn vào nút Chia sẻ bên dưới</div>
          </div>
        </div>
      )}

      {/* Dev badge: hiển thị version SW khi dev */}
      {process.env.NODE_ENV === 'development' && swVersion && (
        <div className="fixed bottom-2 left-2 z-[9990] text-[9px] text-slate-400 bg-white border border-slate-100 px-2 py-0.5 rounded-full shadow">
          {swVersion}
        </div>
      )}
    </>
  )
}
