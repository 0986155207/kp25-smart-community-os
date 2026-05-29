'use client'

import { Sparkles, CheckCircle2, ChevronDown, ChevronUp, Shield, Zap, TreePine, Car, Lightbulb, Heart, HelpCircle, RefreshCw } from 'lucide-react'
import type { AIPhanTichResult } from '@/app/api/phan-anh/phan-tich-ai/route'

// ─── Config loại phản ánh ────────────────────────────────────
const LOAI_CONFIG: Record<string, {
  label: string; icon: React.ReactNode; color: string; bg: string
}> = {
  MOI_TRUONG: { label: 'Môi trường',   icon: <TreePine size={14} />,   color: 'text-green-700',  bg: 'bg-green-50'  },
  HA_TANG:    { label: 'Hạ tầng',      icon: <Zap size={14} />,        color: 'text-orange-700', bg: 'bg-orange-50' },
  AN_NINH:    { label: 'An ninh',      icon: <Shield size={14} />,      color: 'text-red-700',    bg: 'bg-red-50'    },
  GIAO_THONG: { label: 'Giao thông',   icon: <Car size={14} />,         color: 'text-blue-700',   bg: 'bg-blue-50'   },
  CHIEU_SANG: { label: 'Chiếu sáng',   icon: <Lightbulb size={14} />,   color: 'text-amber-700',  bg: 'bg-amber-50'  },
  AN_SINH:    { label: 'An sinh',      icon: <Heart size={14} />,       color: 'text-pink-700',   bg: 'bg-pink-50'   },
  KHAC:       { label: 'Khác',         icon: <HelpCircle size={14} />,  color: 'text-slate-700',  bg: 'bg-slate-100' },
}

const MUC_DO_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  KHAN_CAP:   { label: 'Khẩn cấp',   color: 'text-red-700',    bg: 'bg-red-50',    dot: 'bg-red-500'    },
  CAO:        { label: 'Cao',         color: 'text-orange-700', bg: 'bg-orange-50', dot: 'bg-orange-500' },
  TRUNG_BINH: { label: 'Trung bình',  color: 'text-amber-700',  bg: 'bg-amber-50',  dot: 'bg-amber-500'  },
  THAP:       { label: 'Thấp',        color: 'text-slate-600',  bg: 'bg-slate-100', dot: 'bg-slate-400'  },
}

interface Props {
  result:    AIPhanTichResult
  applied:   boolean
  onApply:   () => void
  onReset:   () => void
  onReanalyze?: () => void
}

export default function AIPhanTichCard({
  result, applied, onApply, onReset, onReanalyze,
}: Props) {
  const loaiCfg = LOAI_CONFIG[result.loai]  ?? LOAI_CONFIG['KHAC']!
  const mdCfg   = MUC_DO_CONFIG[result.mucDo] ?? MUC_DO_CONFIG['TRUNG_BINH']!

  // Màu thanh confidence
  const confColor =
    result.doTinCay >= 80 ? 'bg-green-500' :
    result.doTinCay >= 60 ? 'bg-amber-500' :
    'bg-red-400'

  return (
    <div className={`rounded-2xl border-2 overflow-hidden transition-all ${
      applied
        ? 'border-violet-300 bg-violet-50/50'
        : 'border-violet-200 bg-white'
    }`}>
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-violet-600 to-purple-600">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-white" />
          <span className="text-sm font-bold text-white">Phân tích AI</span>
          <span className="text-[10px] text-violet-200 bg-white/20 px-2 py-0.5 rounded-full font-medium">
            Gemini 2.5 Flash
          </span>
        </div>
        {/* Confidence */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-violet-100">Độ tin cậy</span>
          <div className="flex items-center gap-1.5">
            <div className="w-16 h-1.5 bg-white/30 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${confColor}`}
                style={{ width: `${result.doTinCay}%` }}
              />
            </div>
            <span className="text-xs font-bold text-white">{result.doTinCay}%</span>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="p-4 space-y-3">

        {/* Loại + Mức độ */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-xl ${loaiCfg.bg} ${loaiCfg.color}`}>
            {loaiCfg.icon}
            {loaiCfg.label}
          </span>
          <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-xl ${mdCfg.bg} ${mdCfg.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${mdCfg.dot}`} />
            {mdCfg.label}
          </span>
        </div>

        {/* Tóm tắt */}
        <div className="bg-slate-50 rounded-xl p-3">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">AI phát hiện</p>
          <p className="text-sm font-semibold text-slate-800 leading-snug">{result.tieuDe}</p>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">{result.tomTat}</p>
        </div>

        {/* Các vấn đề cụ thể */}
        {result.tinhNang.length > 0 && (
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Vấn đề phát hiện</p>
            <div className="flex flex-wrap gap-1.5">
              {result.tinhNang.map((t, i) => (
                <span key={i} className="inline-flex text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-lg font-medium">
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Đề xuất xử lý */}
        {result.deXuat && (
          <div className="flex items-start gap-2 p-2.5 bg-blue-50 border border-blue-100 rounded-xl">
            <ChevronDown size={14} className="text-blue-500 mt-0.5 shrink-0" />
            <p className="text-xs text-blue-700 leading-relaxed">
              <span className="font-bold">Đề xuất: </span>{result.deXuat}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          {!applied ? (
            <button
              type="button"
              onClick={onApply}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4
                         bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold
                         rounded-xl transition-colors"
            >
              <CheckCircle2 size={15} />
              Áp dụng gợi ý AI vào form
            </button>
          ) : (
            <div className="flex-1 flex items-center gap-2 py-2.5 px-4 bg-violet-100 rounded-xl">
              <CheckCircle2 size={15} className="text-violet-600" />
              <span className="text-sm font-semibold text-violet-700">Đã áp dụng — form được điền tự động</span>
            </div>
          )}

          <div className="flex items-center gap-1.5">
            {applied && (
              <button
                type="button"
                onClick={onReset}
                className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500
                           hover:text-slate-700 transition-colors"
                title="Xóa gợi ý AI, tự nhập"
              >
                <ChevronUp size={15} />
              </button>
            )}
            {onReanalyze && (
              <button
                type="button"
                onClick={onReanalyze}
                className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500
                           hover:text-slate-700 transition-colors"
                title="Phân tích lại"
              >
                <RefreshCw size={15} />
              </button>
            )}
          </div>
        </div>

        {applied && (
          <p className="text-[11px] text-slate-400 text-center">
            Bạn có thể chỉnh sửa nội dung đã được điền tự động bên dưới
          </p>
        )}
      </div>
    </div>
  )
}
