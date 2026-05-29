'use client'

import { useState } from 'react'
import { Trash2, AlertTriangle, Loader2, CheckCircle, X, RefreshCw } from 'lucide-react'
import { xoaDuLieuTrung, xoaToanBoHoDan } from './actions'

type KetQua = { soHoXoa: number; soNkXoa: number; message: string }
type ModalMode = null | 'tong' | 'trung'

export default function DonTrungBtn() {
  const [mode, setMode]       = useState<ModalMode>(null)
  const [loading, setLoading] = useState(false)
  const [ketQua, setKetQua]   = useState<KetQua | null>(null)

  async function handleAction() {
    setLoading(true)
    const res = mode === 'tong'
      ? await xoaToanBoHoDan()
      : await xoaDuLieuTrung()
    setLoading(false)
    setMode(null)

    if (res.success) {
      setKetQua({ soHoXoa: res.soHoXoa, soNkXoa: res.soNkXoa, message: res.message })
    } else {
      alert(`Lỗi: ${res.message}`)
    }
  }

  const cfg = {
    tong: {
      title: 'Xoá toàn bộ dữ liệu',
      sub: 'Hộ dân và nhân khẩu sẽ bị xoá sạch',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-700',
      body: (
        <div className="space-y-4">
          <p className="text-slate-700 text-sm leading-relaxed">
            Toàn bộ <strong>hộ dân</strong> và <strong>nhân khẩu</strong> trong hệ thống sẽ bị xoá (xoá mềm).
            Sau đó bạn có thể nhập lại từ Google Sheets.
          </p>
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-800 space-y-1">
            <p className="font-semibold flex items-center gap-1.5"><AlertTriangle size={14} /> Lưu ý:</p>
            <ul className="list-disc list-inside space-y-1 text-red-700">
              <li>Dữ liệu xoá mềm — có thể khôi phục trong Supabase nếu cần</li>
              <li>Sau khi xoá, vào <strong>Nhập từ Excel</strong> để import lại</li>
              <li>Thao tác này <strong>không thể hoàn tác</strong> qua giao diện</li>
            </ul>
          </div>
        </div>
      ),
      btnLabel: 'Xoá toàn bộ',
      btnClass: 'bg-red-700 hover:bg-red-800',
    },
    trung: {
      title: 'Dọn dữ liệu trùng lặp',
      sub: 'Giữ bản cũ nhất, xoá bản nhập sau',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      body: (
        <div className="space-y-4">
          <p className="text-slate-700 text-sm leading-relaxed">
            Hệ thống tìm các hộ dân trùng <strong>(cùng chủ hộ + địa chỉ)</strong>, giữ bản cũ nhất và xoá bản nhập sau.
          </p>
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-800 space-y-1">
            <p className="font-semibold flex items-center gap-1.5"><AlertTriangle size={14} /> Quy tắc:</p>
            <ul className="list-disc list-inside space-y-1 text-amber-700">
              <li>Giữ bản <strong>nhập trước</strong> (created_at nhỏ hơn)</li>
              <li>Xoá bản nhập sau cùng nhân khẩu thuộc bản đó</li>
            </ul>
          </div>
        </div>
      ),
      btnLabel: 'Xác nhận dọn trùng',
      btnClass: 'bg-amber-600 hover:bg-amber-700',
    },
  }

  const c = mode ? cfg[mode] : null

  return (
    <>
      {/* Nút kích hoạt — "Xoá sạch" là ưu tiên hiện tại */}
      <button
        onClick={() => setMode('tong')}
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 transition-colors border border-red-100"
      >
        <Trash2 size={14} />
        Xoá sạch dữ liệu
      </button>

      {/* Modal xác nhận */}
      {mode && c && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            {/* Header */}
            <div className="flex items-start gap-3 p-6 border-b border-slate-100">
              <div className={`w-10 h-10 ${c.iconBg} rounded-xl flex items-center justify-center shrink-0 mt-0.5`}>
                <AlertTriangle size={20} className={c.iconColor} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-900">{c.title}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{c.sub}</p>
              </div>
              <button onClick={() => setMode(null)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            {/* Nội dung */}
            <div className="p-6">{c.body}</div>

            {/* Footer */}
            <div className="flex gap-3 p-6 pt-0">
              <button
                onClick={() => setMode(null)}
                disabled={loading}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Huỷ
              </button>
              <button
                onClick={handleAction}
                disabled={loading}
                className={`flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2 ${c.btnClass}`}
              >
                {loading ? (
                  <><Loader2 size={15} className="animate-spin" /> Đang xử lý...</>
                ) : (
                  <><Trash2 size={15} /> {c.btnLabel}</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast kết quả */}
      {ketQua && (
        <div className="fixed bottom-6 right-6 z-50 bg-white rounded-2xl shadow-2xl border border-green-100 p-5 max-w-sm">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
              <CheckCircle size={18} className="text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-900 text-sm">Hoàn tất!</p>
              <p className="text-xs text-slate-500 mt-1">{ketQua.message}</p>
              {ketQua.soHoXoa > 0 && (
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <div className="bg-red-50 rounded-lg p-2 text-center">
                    <div className="text-lg font-bold text-red-600">{ketQua.soHoXoa}</div>
                    <div className="text-[10px] text-slate-400">hộ đã xoá</div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-2 text-center">
                    <div className="text-lg font-bold text-orange-500">{ketQua.soNkXoa}</div>
                    <div className="text-[10px] text-slate-400">nhân khẩu đã xoá</div>
                  </div>
                </div>
              )}
              {ketQua.soHoXoa === 0 && ketQua.soNkXoa === 0 && (
                <p className="text-xs text-slate-400 mt-1">Không có bản ghi nào để xoá.</p>
              )}
              {/* Shortcut tới trang import */}
              <a
                href="/dashboard/dan-cu/nhap-excel"
                className="inline-flex items-center gap-1 mt-3 text-xs text-[#1E3A5F] font-semibold hover:underline"
              >
                <RefreshCw size={11} />
                Nhập dữ liệu lại ngay →
              </a>
            </div>
            <button onClick={() => setKetQua(null)} className="text-slate-300 hover:text-slate-500 shrink-0">
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
