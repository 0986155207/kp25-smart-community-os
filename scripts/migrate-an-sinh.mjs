/**
 * Script migrate An sinh module vào Supabase project của admin
 *
 * Cách 1 — Tự động (cần Supabase Personal Access Token):
 *   SUPABASE_ACCESS_TOKEN=<token> node scripts/migrate-an-sinh.mjs
 *
 * Cách 2 — Thủ công:
 *   node scripts/migrate-an-sinh.mjs --print
 *   Copy SQL in ra và dán vào Supabase Studio:
 *   https://supabase.com/dashboard/project/pnyjrneqxqckclxehaqv/sql/new
 *
 * Lấy Personal Access Token tại:
 *   https://supabase.com/dashboard/account/tokens
 */

const PROJECT_REF   = 'pnyjrneqxqckclxehaqv'
const MGMT_API      = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`

// ── SQL ──────────────────────────────────────────────────────────────────────
const SQL_MIGRATION = `
-- =============================================================
-- KP25 — An sinh Xã hội số — Migration
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
RETURNS TRIGGER LANGUAGE plpgsql AS \$\$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; \$\$;

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
  nk.id,
  nk.ho_id,
  nk.ho_ten,
  nk.ngay_sinh,
  nk.gioi_tinh::TEXT,
  nk.cccd,
  hd.dia_chi_day,
  'ON_DINH'::suc_khoe_nct,
  TRUE,
  FALSE,
  CURRENT_DATE
FROM nhan_khau nk
LEFT JOIN ho_dan hd ON hd.id = nk.ho_id
WHERE nk.deleted_at IS NULL
  AND nk.ngay_sinh IS NOT NULL
  AND nk.ngay_sinh <= (CURRENT_DATE - INTERVAL '60 years')
  AND NOT EXISTS (
    SELECT 1 FROM nguoi_cao_tuoi nct
    WHERE nct.nhan_khau_id = nk.id AND nct.deleted_at IS NULL
  );

SELECT
  'Kết quả' AS thong_ke,
  (SELECT COUNT(*) FROM nguoi_cao_tuoi WHERE deleted_at IS NULL) AS tong_nct,
  (SELECT COUNT(*) FROM bhyt        WHERE deleted_at IS NULL) AS tong_bhyt,
  (SELECT COUNT(*) FROM ho_ngheo    WHERE deleted_at IS NULL) AS tong_ho_ngheo;
`

// ── Runner ───────────────────────────────────────────────────────────────────

const PAT = process.env.SUPABASE_ACCESS_TOKEN

async function runWithManagementAPI(pat) {
  console.log('🚀 Đang chạy migration qua Supabase Management API...\n')
  const res = await fetch(MGMT_API, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${pat}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: SQL_MIGRATION }),
  })
  const body = await res.json()
  if (!res.ok) {
    console.error('❌ Lỗi:', JSON.stringify(body, null, 2))
    process.exit(1)
  }
  console.log('✅ Migration thành công!')
  if (Array.isArray(body) && body.length > 0) {
    console.table(body)
  }
}

function printSQL() {
  const divider = '═'.repeat(70)
  console.log('\n📋 Copy toàn bộ SQL bên dưới và dán vào Supabase Studio:\n')
  console.log('🔗 https://supabase.com/dashboard/project/pnyjrneqxqckclxehaqv/sql/new\n')
  console.log(divider)
  console.log(SQL_MIGRATION)
  console.log(divider)
  console.log('\n✅ Sau khi chạy SQL thành công, 157 người cao tuổi sẽ được import tự động.')
  console.log('   Truy cập: http://localhost:3001/dashboard/an-sinh/nguoi-cao-tuoi để kiểm tra.\n')
}

// ── Main ─────────────────────────────────────────────────────────────────────

if (PAT) {
  runWithManagementAPI(PAT).catch(err => {
    console.error('❌ Lỗi kết nối:', err.message)
    process.exit(1)
  })
} else {
  console.log('ℹ️  Chưa có SUPABASE_ACCESS_TOKEN.\n')
  console.log('   Để chạy tự động, lấy token tại:')
  console.log('   https://supabase.com/dashboard/account/tokens\n')
  console.log('   Rồi chạy: SUPABASE_ACCESS_TOKEN=<token> node scripts/migrate-an-sinh.mjs\n')
  printSQL()
}
