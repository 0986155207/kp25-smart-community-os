'use client'

import { useState, useTransition, useRef } from 'react'
import { QrCode, Download, Printer, RefreshCw, ExternalLink, X } from 'lucide-react'
import { taoQRToken } from '../actions'

interface Props {
  hoId: string
  chuHo: string
  maHo: string
  qrToken: string | null
  appUrl: string
}

export default function QRCodeButton({ hoId, chuHo, maHo, qrToken: initialToken, appUrl }: Props) {
  const [open, setOpen] = useState(false)
  const [token, setToken] = useState(initialToken)
  const [isPending, startTransition] = useTransition()
  const [regenConfirm, setRegenConfirm] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  const qrUrl = token ? `${appUrl}/qr/${token}` : null
  const qrImgSrc = qrUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=12&data=${encodeURIComponent(qrUrl)}`
    : null

  function handleOpen() {
    setOpen(true)
    setRegenConfirm(false)
  }

  function handleClose() {
    setOpen(false)
    setRegenConfirm(false)
  }

  function handleRegen() {
    if (!regenConfirm) {
      setRegenConfirm(true)
      return
    }
    startTransition(async () => {
      const res = await taoQRToken(hoId)
      if (res.success && res.token) {
        setToken(res.token)
      }
      setRegenConfirm(false)
    })
  }

  async function handleDownload() {
    if (!qrImgSrc || !token) return
    const res = await fetch(qrImgSrc)
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `QR-${maHo}-${chuHo.replace(/\s+/g, '_')}.png`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handlePrint() {
    if (!qrImgSrc || !qrUrl) return
    const w = window.open('', '_blank', 'width=500,height=650')
    if (!w) return
    w.document.write(`
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="utf-8" />
        <title>QR Hộ dân — ${maHo}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', sans-serif; background: #fff; }
          .card {
            width: 360px; margin: 30px auto;
            border: 2px solid #1E3A5F; border-radius: 16px;
            overflow: hidden;
            print-color-adjust: exact; -webkit-print-color-adjust: exact;
          }
          .header {
            background: #1E3A5F; color: #fff;
            padding: 14px 20px; text-align: center;
          }
          .header h1 { font-size: 15px; font-weight: 700; letter-spacing: .5px; }
          .header p  { font-size: 11px; opacity: .75; margin-top: 2px; }
          .body { padding: 20px; text-align: center; }
          .body img { width: 220px; height: 220px; border: 1px solid #e5e7eb; border-radius: 8px; }
          .info { margin-top: 14px; }
          .info .name { font-size: 17px; font-weight: 700; color: #1E3A5F; }
          .info .ma-ho { font-size: 11px; color: #64748b; font-family: monospace; margin-top: 4px; }
          .note { margin-top: 14px; font-size: 10px; color: #9ca3af; line-height: 1.6; }
          .url { font-size: 9px; color: #94a3b8; word-break: break-all; margin-top: 8px; }
          @media print {
            body { margin: 0; }
            .card { margin: 10px auto; border: 2px solid #1E3A5F !important; }
          }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <h1>KHU PHỐ 25 — PHƯỜNG LONG TRƯỜNG</h1>
            <p>Phiếu hộ dân điện tử · QR Tra cứu nhanh</p>
          </div>
          <div class="body">
            <img src="${qrImgSrc}" alt="QR Code" />
            <div class="info">
              <div class="name">${chuHo}</div>
              <div class="ma-ho">Mã hộ: ${maHo}</div>
            </div>
            <div class="note">
              Quét mã QR để xem thông tin hộ dân điện tử.<br/>
              Dùng để khai báo, liên hệ cán bộ và tra cứu thủ tục.
            </div>
            <div class="url">${qrUrl}</div>
          </div>
        </div>
        <script>window.onload = () => { window.print(); window.close(); }<\/script>
      </body>
      </html>
    `)
    w.document.close()
  }

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={handleOpen}
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-50 text-indigo-700 text-sm font-medium hover:bg-indigo-100 transition-colors"
        title="QR hộ dân"
      >
        <QrCode size={14} />
        QR
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <QrCode size={18} className="text-indigo-600" />
                <div>
                  <p className="font-bold text-slate-900 text-sm">QR Hộ dân điện tử</p>
                  <p className="text-xs text-slate-400 font-mono">{maHo}</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 flex flex-col items-center gap-4">
              {qrImgSrc ? (
                <>
                  {/* QR Image */}
                  <div className="bg-white border-2 border-indigo-100 rounded-2xl p-3 shadow-inner">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      ref={imgRef}
                      src={qrImgSrc}
                      alt={`QR hộ dân ${chuHo}`}
                      width={220}
                      height={220}
                      className="rounded-lg"
                    />
                  </div>

                  {/* Household info */}
                  <div className="text-center">
                    <p className="font-bold text-slate-900">{chuHo}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Chủ hộ · {maHo}</p>
                    {qrUrl && (
                      <a
                        href={qrUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-2 text-xs text-indigo-600 hover:underline"
                      >
                        <ExternalLink size={11} />
                        Xem trang tra cứu
                      </a>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 w-full">
                    <button
                      onClick={handleDownload}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors"
                    >
                      <Download size={14} />
                      Tải QR
                    </button>
                    <button
                      onClick={handlePrint}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition-colors"
                    >
                      <Printer size={14} />
                      In phiếu
                    </button>
                  </div>

                  {/* Regenerate */}
                  <div className="w-full pt-1 border-t border-slate-100">
                    {regenConfirm ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-amber-700 flex-1">Tạo mã mới sẽ vô hiệu mã cũ. Xác nhận?</span>
                        <button
                          onClick={handleRegen}
                          disabled={isPending}
                          className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold disabled:opacity-60"
                        >
                          {isPending ? 'Đang tạo...' : 'Xác nhận'}
                        </button>
                        <button
                          onClick={() => setRegenConfirm(false)}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold"
                        >
                          Huỷ
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={handleRegen}
                        disabled={isPending}
                        className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-slate-500 hover:bg-slate-50 text-xs font-medium transition-colors disabled:opacity-60"
                      >
                        <RefreshCw size={12} className={isPending ? 'animate-spin' : ''} />
                        Tạo lại mã QR
                      </button>
                    )}
                  </div>
                </>
              ) : (
                /* No token yet */
                <div className="flex flex-col items-center gap-4 py-4">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center">
                    <QrCode size={28} className="text-indigo-400" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-slate-700">Chưa có mã QR</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Nhấn để tạo mã QR tra cứu nhanh cho hộ dân này
                    </p>
                  </div>
                  <button
                    onClick={() => startTransition(async () => {
                      const res = await taoQRToken(hoId)
                      if (res.success && res.token) setToken(res.token)
                    })}
                    disabled={isPending}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors disabled:opacity-60"
                  >
                    {isPending ? 'Đang tạo...' : 'Tạo mã QR'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
