'use client'

import { useState, useTransition } from 'react'
import {
  Shield, CheckCircle2, XCircle, RefreshCw, Plus,
  User, AlertTriangle, Copy, Check,
} from 'lucide-react'
import { taoTaiKhoanCanBo } from '../phan-quyen/actions'
import { cn } from '@/lib/utils'

const SQL_011 = `-- Migration 011: RBAC Cán bộ Khu phố
-- Dán vào Supabase Studio > SQL Editor rồi bấm RUN

CREATE TABLE IF NOT EXISTS can_bo (
  id            UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT    NOT NULL UNIQUE,
  ho_ten        TEXT    NOT NULL,
  vai_tro       TEXT    NOT NULL,
  chuc_vu       TEXT,
  so_dien_thoai TEXT,
  ghi_chu       TEXT,
  hoat_dong     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE can_bo ENABLE ROW LEVEL SECURITY;

CREATE POLICY "can_bo_select" ON can_bo FOR SELECT TO authenticated USING (true);
CREATE POLICY "can_bo_service_all" ON can_bo FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_can_bo_email     ON can_bo(email);
CREATE INDEX IF NOT EXISTS idx_can_bo_vai_tro   ON can_bo(vai_tro);
CREATE INDEX IF NOT EXISTS idx_can_bo_hoat_dong ON can_bo(hoat_dong);

INSERT INTO can_bo (email, ho_ten, vai_tro, chuc_vu) VALUES
  ('phantantai.kp25@gmail.com',   'Phan Tấn Tài',         'BI_THU',         'Bí thư chi bộ'),
  ('hongthuykp25@gmail.com',      'Nguyễn Thị Hồng Thủy', 'TRUONG_KHU_PHO', 'Trưởng khu phố'),
  ('tranhuhung.kp25@gmail.com',   'Trần Hữu Hùng',         'CONG_AN',        'Công an khu vực'),
  ('maingocrhan.kp25@gmail.com',  'Mai Ngọc Nhân',         'AN_NINH',        'An ninh khu phố'),
  ('maithanxuan.kp25@gmail.com',  'Mai Thị Thanh Xuân',    'PHU_TRACH_NCT',  'Phụ trách NCT')
ON CONFLICT (email) DO UPDATE SET
  ho_ten  = EXCLUDED.ho_ten,
  vai_tro = EXCLUDED.vai_tro,
  chuc_vu = EXCLUDED.chuc_vu;`

const CAN_BO_SEED = [
  { id: 'ptt', email: 'phantantai.kp25@gmail.com',   ho_ten: 'Phan Tấn Tài',          vai_tro: 'Bí thư chi bộ'   },
  { id: 'ntt', email: 'hongthuykp25@gmail.com',      ho_ten: 'Nguyễn Thị Hồng Thủy',  vai_tro: 'Trưởng khu phố' },
  { id: 'thh', email: 'tranhuhung.kp25@gmail.com',   ho_ten: 'Trần Hữu Hùng',          vai_tro: 'Công an khu vực'},
  { id: 'mnn', email: 'maingocrhan.kp25@gmail.com',  ho_ten: 'Mai Ngọc Nhân',           vai_tro: 'An ninh khu phố'},
  { id: 'mtx', email: 'maithanxuan.kp25@gmail.com',  ho_ten: 'Mai Thị Thanh Xuân',      vai_tro: 'Phụ trách NCT'  },
]

type TKStatus = 'idle' | 'loading' | 'done' | 'error'

export default function SetupRBACSection() {
  const [copied, setCopied] = useState(false)
  const [status, setStatus] = useState<Record<string, { st: TKStatus; msg?: string }>>({})
  const [, startTrans] = useTransition()

  async function copySQL() {
    await navigator.clipboard.writeText(SQL_011)
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
  }

  function createAccount(cb: typeof CAN_BO_SEED[0]) {
    setStatus(p => ({ ...p, [cb.id]: { st: 'loading' } }))
    startTrans(async () => {
      const r = await taoTaiKhoanCanBo(cb.id, cb.email)
      setStatus(p => ({
        ...p,
        [cb.id]: { st: r.success ? 'done' : 'error', msg: r.message },
      }))
    })
  }

  function createAll() {
    CAN_BO_SEED.forEach(cb => {
      if (status[cb.id]?.st !== 'done') createAccount(cb)
    })
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-[#1E3A5F]" />
          <h2 className="font-bold text-slate-800">Migration 011 — RBAC Cán bộ</h2>
        </div>
        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
          Bước 1 trong 2
        </span>
      </div>

      <div className="p-5 space-y-5">

        {/* Step 1: SQL */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-slate-700">
              Bước 1 — Chạy SQL trong Supabase Studio
            </p>
            <button
              onClick={copySQL}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
            >
              {copied ? <><Check size={12} className="text-emerald-600" /> Đã sao chép!</> : <><Copy size={12} /> Sao chép SQL</>}
            </button>
          </div>
          <div className="bg-slate-900 rounded-xl p-4 overflow-auto max-h-48">
            <pre className="text-xs text-slate-300 font-mono leading-relaxed">{SQL_011}</pre>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <a
              href={`${process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('.supabase.co', '.supabase.com') ?? '#'}/project/default/editor`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline flex items-center gap-1"
            >
              Mở Supabase Studio →
            </a>
          </div>
        </div>

        {/* Step 2: Tạo tài khoản */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-slate-700">
              Bước 2 — Tạo tài khoản đăng nhập cho cán bộ
            </p>
            <button
              onClick={createAll}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-[#1E3A5F] text-white font-medium hover:bg-[#162d4a] transition-colors"
            >
              <Plus size={12} />
              Tạo tất cả
            </button>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2 mb-3">
            <AlertTriangle size={14} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700">
              Mật khẩu mặc định: <code className="font-mono font-bold">KP25@2026!</code> — Thông báo cho cán bộ đổi mật khẩu sau lần đăng nhập đầu.
            </p>
          </div>

          <div className="space-y-2">
            {CAN_BO_SEED.map(cb => {
              const st = status[cb.id]
              return (
                <div
                  key={cb.id}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-xl border text-sm',
                    st?.st === 'done'    ? 'border-emerald-200 bg-emerald-50' :
                    st?.st === 'error'   ? 'border-red-200 bg-red-50' :
                    'border-slate-100 bg-white'
                  )}
                >
                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full bg-[#1E3A5F] text-white flex items-center justify-center text-xs font-bold shrink-0">
                    {cb.ho_ten.split(' ').slice(-2).map(w => w[0]).join('')}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 truncate">{cb.ho_ten}</p>
                    <p className="text-xs text-slate-500">{cb.vai_tro} · {cb.email}</p>
                    {st?.msg && (
                      <p className={cn('text-xs mt-0.5', st.st === 'done' ? 'text-emerald-700' : 'text-red-600')}>
                        {st.msg.split('\n')[0]}
                      </p>
                    )}
                  </div>

                  {/* Status icon / button */}
                  {st?.st === 'loading' ? (
                    <RefreshCw size={16} className="animate-spin text-slate-400 shrink-0" />
                  ) : st?.st === 'done' ? (
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  ) : st?.st === 'error' ? (
                    <div className="flex items-center gap-1.5">
                      <XCircle size={16} className="text-red-500 shrink-0" />
                      <button
                        onClick={() => createAccount(cb)}
                        className="text-xs text-red-600 hover:underline"
                      >
                        Thử lại
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => createAccount(cb)}
                      className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-[#1E3A5F] text-white hover:bg-[#162d4a] font-medium shrink-0"
                    >
                      <User size={11} />
                      Tạo TK
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
