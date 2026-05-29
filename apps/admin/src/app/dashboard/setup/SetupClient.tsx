'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  CheckCircle2, XCircle, RefreshCw, Copy, Check,
  ExternalLink, AlertTriangle, Database, Shield, Users
} from 'lucide-react'

const SQL_MIGRATION = `-- =============================================================
-- KP25 — An sinh Xã hội số — Migration v1
-- Dán toàn bộ đoạn SQL này vào Supabase Studio rồi bấm RUN
-- =============================================================

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'doi_tuong_bhyt') THEN
    CREATE TYPE doi_tuong_bhyt AS ENUM (
      'NGUOI_LAO_DONG_DOANH_NGHIEP','CAN_BO_CONG_CHUC','HOC_SINH_SINH_VIEN',
      'HO_GIA_DINH','HO_NGHEO','CAN_NGHEO','NGUOI_CAO_TUOI_80','BHTN',
      'TRE_EM_DUOI_6','NGUOI_CO_CONG','DTTS_VUNG_KHO','TU_NGUYEN'
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'trang_thai_bhyt') THEN
    CREATE TYPE trang_thai_bhyt AS ENUM ('CON_HAN','SAP_HET_HAN','HET_HAN','CHUA_CO');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'loai_ho_ngheo') THEN
    CREATE TYPE loai_ho_ngheo AS ENUM ('NGHEO','CAN_NGHEO');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'trang_thai_ho_ngheo') THEN
    CREATE TYPE trang_thai_ho_ngheo AS ENUM ('DANG_HUONG','THOAT_NGHEO','HET_HAN_XET');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'suc_khoe_nct') THEN
    CREATE TYPE suc_khoe_nct AS ENUM ('TOT','ON_DINH','YEU','CAN_CHAM_SOC');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS bhyt (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ho_dan_id        UUID REFERENCES ho_dan(id) ON DELETE SET NULL,
  ho_ten           TEXT        NOT NULL,
  ngay_sinh        DATE,
  gioi_tinh        TEXT,
  so_cccd          TEXT,
  ma_the_bhyt      TEXT,
  doi_tuong        doi_tuong_bhyt NOT NULL DEFAULT 'HO_GIA_DINH',
  noi_dang_ky_kcb  TEXT,
  phan_tram_huong  SMALLINT    DEFAULT 80 CHECK (phan_tram_huong BETWEEN 0 AND 100),
  han_the_tu       DATE,
  han_the_den      DATE,
  trang_thai       trang_thai_bhyt NOT NULL DEFAULT 'CON_HAN',
  co_quan_dong     TEXT,
  muc_dong_thang   DECIMAL(12,0),
  ghi_chu          TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at       TIMESTAMPTZ,
  created_by       UUID,
  updated_by       UUID
);

CREATE INDEX IF NOT EXISTS idx_bhyt_ho_dan ON bhyt(ho_dan_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_bhyt_tt     ON bhyt(trang_thai) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_bhyt_han    ON bhyt(han_the_den) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_bhyt_ma ON bhyt(ma_the_bhyt) WHERE deleted_at IS NULL AND ma_the_bhyt IS NOT NULL;

CREATE TABLE IF NOT EXISTS ho_ngheo (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ho_dan_id          UUID REFERENCES ho_dan(id) ON DELETE CASCADE,
  loai               loai_ho_ngheo NOT NULL,
  trang_thai         trang_thai_ho_ngheo NOT NULL DEFAULT 'DANG_HUONG',
  nam_xet_duyet      SMALLINT    NOT NULL,
  quyet_dinh_so      TEXT,
  ngay_quyet_dinh    DATE,
  ngay_het_han       DATE,
  thu_nhap_bq        DECIMAL(12,0),
  so_thanh_vien      SMALLINT,
  ly_do_ngheo        TEXT,
  thieu_y_te         BOOLEAN DEFAULT FALSE,
  thieu_gd           BOOLEAN DEFAULT FALSE,
  thieu_nha_o        BOOLEAN DEFAULT FALSE,
  thieu_nc_vs        BOOLEAN DEFAULT FALSE,
  thieu_thong_tin    BOOLEAN DEFAULT FALSE,
  ho_tro_bhyt        BOOLEAN DEFAULT TRUE,
  ho_tro_giao_duc    BOOLEAN DEFAULT FALSE,
  ho_tro_nha_o       BOOLEAN DEFAULT FALSE,
  so_tien_ho_tro     DECIMAL(12,0),
  ngay_thoat_ngheo   DATE,
  ly_do_thoat_ngheo  TEXT,
  ghi_chu            TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at         TIMESTAMPTZ,
  created_by         UUID,
  updated_by         UUID
);

CREATE INDEX IF NOT EXISTS idx_hn_ho_dan ON ho_ngheo(ho_dan_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_hn_tt     ON ho_ngheo(trang_thai) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_hn_nam    ON ho_ngheo(nam_xet_duyet) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS nguoi_cao_tuoi (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ho_dan_id          UUID REFERENCES ho_dan(id) ON DELETE SET NULL,
  nhan_khau_id       UUID REFERENCES nhan_khau(id) ON DELETE SET NULL,
  ho_ten             TEXT        NOT NULL,
  ngay_sinh          DATE        NOT NULL,
  gioi_tinh          TEXT,
  so_cccd            TEXT,
  dia_chi_day        TEXT,
  tinh_trang_sk      suc_khoe_nct NOT NULL DEFAULT 'ON_DINH',
  benh_man_tinh      TEXT,
  song_co_don        BOOLEAN     DEFAULT FALSE,
  co_nguoi_cham_soc  BOOLEAN     DEFAULT TRUE,
  ten_nguoi_cham_soc TEXT,
  sdt_nguoi_cham_soc TEXT,
  co_luong_huu       BOOLEAN     DEFAULT FALSE,
  muc_luong_huu      DECIMAL(12,0),
  co_bhyt            BOOLEAN     DEFAULT FALSE,
  ma_the_bhyt        TEXT,
  nhan_tro_cap_xh    BOOLEAN     DEFAULT FALSE,
  muc_tro_cap_xh     DECIMAL(12,0),
  quyet_dinh_tro_cap TEXT,
  la_liet_si         BOOLEAN     DEFAULT FALSE,
  la_nguoi_co_cong   BOOLEAN     DEFAULT FALSE,
  la_dtts            BOOLEAN     DEFAULT FALSE,
  ghi_chu            TEXT,
  ngay_cap_nhat_sk   DATE,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at         TIMESTAMPTZ,
  created_by         UUID,
  updated_by         UUID
);

CREATE INDEX IF NOT EXISTS idx_nct_nk     ON nguoi_cao_tuoi(nhan_khau_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_nct_ns     ON nguoi_cao_tuoi(ngay_sinh)    WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_nct_co_don ON nguoi_cao_tuoi(song_co_don)  WHERE deleted_at IS NULL;

ALTER TABLE bhyt           ENABLE ROW LEVEL SECURITY;
ALTER TABLE ho_ngheo       ENABLE ROW LEVEL SECURITY;
ALTER TABLE nguoi_cao_tuoi ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='bhyt' AND policyname='bhyt_all') THEN
    CREATE POLICY "bhyt_all" ON bhyt FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='ho_ngheo' AND policyname='ho_ngheo_all') THEN
    CREATE POLICY "ho_ngheo_all" ON ho_ngheo FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='nguoi_cao_tuoi' AND policyname='nct_all') THEN
    CREATE POLICY "nct_all" ON nguoi_cao_tuoi FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'bhyt_updated_at') THEN
    CREATE TRIGGER bhyt_updated_at BEFORE UPDATE ON bhyt FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'ho_ngheo_updated_at') THEN
    CREATE TRIGGER ho_ngheo_updated_at BEFORE UPDATE ON ho_ngheo FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'nguoi_cao_tuoi_updated_at') THEN
    CREATE TRIGGER nguoi_cao_tuoi_updated_at BEFORE UPDATE ON nguoi_cao_tuoi FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
END $$;

-- Auto-import NCT từ nhan_khau (tuổi >= 60)
INSERT INTO nguoi_cao_tuoi (
  nhan_khau_id, ho_dan_id, ho_ten, ngay_sinh, gioi_tinh, so_cccd,
  dia_chi_day, tinh_trang_sk, co_nguoi_cham_soc, co_bhyt, ngay_cap_nhat_sk
)
SELECT
  nk.id, nk.ho_id, nk.ho_ten, nk.ngay_sinh,
  nk.gioi_tinh::TEXT, nk.cccd, hd.dia_chi_day,
  'ON_DINH'::suc_khoe_nct, TRUE, FALSE, CURRENT_DATE
FROM nhan_khau nk
LEFT JOIN ho_dan hd ON hd.id = nk.ho_id
WHERE nk.deleted_at IS NULL
  AND nk.ngay_sinh IS NOT NULL
  AND nk.ngay_sinh <= (CURRENT_DATE - INTERVAL '60 years')
  AND NOT EXISTS (
    SELECT 1 FROM nguoi_cao_tuoi nct
    WHERE nct.nhan_khau_id = nk.id AND nct.deleted_at IS NULL
  );

-- Migration 009: Tình trạng sống NCT + Nhân khẩu
ALTER TABLE nguoi_cao_tuoi
  ADD COLUMN IF NOT EXISTS da_mat           BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS ngay_mat         DATE,
  ADD COLUMN IF NOT EXISTS nguyen_nhan_mat  TEXT;

CREATE INDEX IF NOT EXISTS idx_nct_da_mat ON nguoi_cao_tuoi(da_mat) WHERE deleted_at IS NULL;

ALTER TABLE nhan_khau
  ADD COLUMN IF NOT EXISTS da_mat   BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS ngay_mat DATE;

CREATE INDEX IF NOT EXISTS idx_nk_da_mat ON nhan_khau(da_mat) WHERE deleted_at IS NULL;

-- Migration 010: Khởi tạo QR token cho hộ dân hiện có
UPDATE ho_dan
SET qr_token = gen_random_uuid()::text
WHERE qr_token IS NULL
  AND deleted_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_ho_dan_qr_token ON ho_dan(qr_token)
  WHERE qr_token IS NOT NULL AND deleted_at IS NULL;

-- Kết quả
SELECT
  (SELECT COUNT(*) FROM nguoi_cao_tuoi WHERE deleted_at IS NULL) AS tong_nct_da_import,
  (SELECT COUNT(*) FROM bhyt        WHERE deleted_at IS NULL) AS tong_bhyt,
  (SELECT COUNT(*) FROM ho_ngheo    WHERE deleted_at IS NULL) AS tong_ho_ngheo,
  (SELECT COUNT(*) FROM ho_dan WHERE qr_token IS NOT NULL AND deleted_at IS NULL) AS ho_co_qr;`

interface TableStatus {
  allReady: boolean
  tables: { bhyt: boolean; ho_ngheo: boolean; nguoi_cao_tuoi: boolean }
  counts: { bhyt: number; ho_ngheo: number; nguoi_cao_tuoi: number }
}

const TABLE_INFO = [
  {
    key: 'bhyt' as const,
    label: 'Bảo hiểm Y tế',
    desc: 'Quản lý thẻ BHYT của người dân',
    icon: Shield,
    color: 'blue',
  },
  {
    key: 'ho_ngheo' as const,
    label: 'Hộ nghèo / Cận nghèo',
    desc: 'Danh sách hộ nghèo, cận nghèo đang hưởng hỗ trợ',
    icon: AlertTriangle,
    color: 'amber',
  },
  {
    key: 'nguoi_cao_tuoi' as const,
    label: 'Người cao tuổi',
    desc: 'Quản lý NCT ≥ 60 tuổi trong khu phố (157 người)',
    icon: Users,
    color: 'emerald',
  },
]

export default function SetupClient() {
  const [status, setStatus] = useState<TableStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  const checkTables = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/setup/check-tables')
      const data = await res.json()
      setStatus(data)
    } catch {
      setStatus(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { checkTables() }, [checkTables])

  const copySQL = async () => {
    await navigator.clipboard.writeText(SQL_MIGRATION)
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Thiết lập hệ thống</h1>
        <p className="mt-1 text-sm text-gray-500">
          Kiểm tra và áp dụng các migration cần thiết cho cơ sở dữ liệu
        </p>
      </div>

      {/* Status Card */}
      <div className={`rounded-xl border-2 p-5 ${
        status?.allReady
          ? 'border-emerald-200 bg-emerald-50'
          : 'border-amber-200 bg-amber-50'
      }`}>
        <div className="flex items-center gap-3">
          {loading ? (
            <RefreshCw className="h-6 w-6 text-gray-400 animate-spin" />
          ) : status?.allReady ? (
            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
          ) : (
            <AlertTriangle className="h-6 w-6 text-amber-600" />
          )}
          <div>
            <p className={`font-semibold ${status?.allReady ? 'text-emerald-800' : 'text-amber-800'}`}>
              {loading
                ? 'Đang kiểm tra database...'
                : status?.allReady
                  ? 'Tất cả bảng đã sẵn sàng!'
                  : 'Cần chạy migration An sinh'}
            </p>
            <p className={`text-sm mt-0.5 ${status?.allReady ? 'text-emerald-600' : 'text-amber-600'}`}>
              {status?.allReady
                ? 'Module An sinh đang hoạt động bình thường.'
                : 'Một số bảng cơ sở dữ liệu chưa được tạo. Thực hiện các bước bên dưới.'}
            </p>
          </div>
          <button
            onClick={checkTables}
            className="ml-auto p-2 rounded-lg hover:bg-white/60 transition-colors"
            title="Kiểm tra lại"
          >
            <RefreshCw className={`h-4 w-4 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Table Status */}
      <div>
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
          <Database className="h-4 w-4" />
          Trạng thái bảng dữ liệu
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {TABLE_INFO.map(({ key, label, desc, icon: Icon, color }) => {
            const exists = status?.tables[key]
            const count  = status?.counts[key] ?? 0
            return (
              <div
                key={key}
                className={`rounded-xl border p-4 ${
                  exists === undefined
                    ? 'border-gray-200 bg-white'
                    : exists
                      ? 'border-emerald-200 bg-emerald-50'
                      : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className={`p-2 rounded-lg ${
                    color === 'blue'    ? 'bg-blue-100'   :
                    color === 'amber'   ? 'bg-amber-100'  :
                    'bg-emerald-100'
                  }`}>
                    <Icon className={`h-4 w-4 ${
                      color === 'blue'    ? 'text-blue-600'   :
                      color === 'amber'   ? 'text-amber-600'  :
                      'text-emerald-600'
                    }`} />
                  </div>
                  {exists === undefined ? (
                    <span className="text-xs text-gray-400">Đang kiểm tra...</span>
                  ) : exists ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
                <p className="text-sm font-semibold text-gray-800">{label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                {exists && (
                  <p className="text-xs font-medium text-emerald-700 mt-2">
                    {count.toLocaleString()} bản ghi
                  </p>
                )}
                {exists === false && (
                  <p className="text-xs font-medium text-red-600 mt-2">
                    Chưa tạo bảng
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Migration Steps — chỉ hiện khi chưa sẵn sàng */}
      {!loading && !status?.allReady && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
            <h2 className="font-semibold text-gray-800">Hướng dẫn chạy migration</h2>
            <p className="text-sm text-gray-500 mt-0.5">Làm theo 3 bước đơn giản dưới đây</p>
          </div>
          <div className="p-5 space-y-5">

            {/* Bước 1 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-800 text-white text-sm font-bold flex items-center justify-center">
                1
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-800">Mở Supabase Studio — SQL Editor</p>
                <p className="text-sm text-gray-500 mt-1">
                  Nhấn nút bên dưới để mở trang chạy SQL của dự án KP25
                </p>
                <a
                  href="https://supabase.com/dashboard/project/pnyjrneqxqckclxehaqv/sql/new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  Mở Supabase Studio
                </a>
              </div>
            </div>

            {/* Bước 2 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-800 text-white text-sm font-bold flex items-center justify-center">
                2
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-800">Copy SQL migration</p>
                <p className="text-sm text-gray-500 mt-1">
                  Nhấn nút bên dưới để copy toàn bộ SQL, sau đó dán vào cửa sổ SQL Editor
                </p>
                <button
                  onClick={copySQL}
                  className={`mt-2 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    copied
                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300'
                  }`}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? 'Đã copy!' : 'Copy SQL Migration'}
                </button>

                {/* SQL Preview */}
                <div className="mt-3 relative">
                  <pre className="text-xs bg-gray-900 text-gray-300 rounded-lg p-4 overflow-auto max-h-48 leading-relaxed font-mono">
                    {SQL_MIGRATION.slice(0, 400)}
                    <span className="text-gray-500">
                      {'\n'}...{'\n'}(còn {SQL_MIGRATION.length - 400} ký tự nữa — nhấn Copy để lấy toàn bộ)
                    </span>
                  </pre>
                </div>
              </div>
            </div>

            {/* Bước 3 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-800 text-white text-sm font-bold flex items-center justify-center">
                3
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-800">Chạy SQL và kiểm tra kết quả</p>
                <p className="text-sm text-gray-500 mt-1">
                  Bấm <strong>RUN</strong> trong Supabase Studio. SQL sẽ tạo 3 bảng và tự động import
                  157 người cao tuổi từ dữ liệu dân cư. Sau đó quay lại đây và bấm kiểm tra.
                </p>
                <button
                  onClick={checkTables}
                  className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-red-800 hover:bg-red-900 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  Kiểm tra lại
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success state */}
      {!loading && status?.allReady && (
        <div className="bg-white rounded-xl border border-emerald-200 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-100 rounded-full">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">Migration hoàn tất!</h3>
              <p className="text-gray-500 text-sm mt-1">
                Tất cả bảng dữ liệu An sinh đã sẵn sàng.
                Module có thể sử dụng ngay.
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href="/dashboard/an-sinh/nguoi-cao-tuoi"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Xem danh sách NCT ({status.counts.nguoi_cao_tuoi})
            </a>
            <a
              href="/dashboard/an-sinh"
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
            >
              Tổng quan An sinh
            </a>
          </div>
        </div>
      )}

    </div>
  )
}
