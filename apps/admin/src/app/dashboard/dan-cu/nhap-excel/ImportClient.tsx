'use client'

import { useState, useRef, useTransition } from 'react'
import * as XLSX from 'xlsx'
import {
  Upload, Download, FileSpreadsheet, CheckCircle2,
  AlertCircle, Loader2, X, ChevronDown, ChevronUp,
  Users, Home, Info, Link2, RefreshCw,
} from 'lucide-react'
import toast from 'react-hot-toast'
import {
  layDuLieuGoogleSheet,
  nhapDuLieuHangLoat,
  type NhapHoDanRow,
  type NhapNhanKhauRow,
} from '../actions'

// ─── Chuẩn hoá chuỗi tiếng Việt (xử lý NFD ↔ NFC từ Excel) ──
// Excel/CSV thường lưu dấu tiếng Việt ở dạng NFD (decomposed).
// JavaScript string literals dùng NFC. Cần normalize trước khi so sánh.
function norm(s: string | undefined | null): string {
  return (s ?? '').toLowerCase().trim().normalize('NFC')
}

// ─── Ánh xạ giá trị ─────────────────────────────────────────
// Tất cả keys ở dạng NFC lowercase — vì norm() đã chuẩn hoá input trước khi tra
const MAP_TINH_TRANG: Record<string, string> = {
  'thường trú': 'THUONG_TRU', 'thuong tru': 'THUONG_TRU',
  'thuongtru':  'THUONG_TRU', 'thuong_tru': 'THUONG_TRU', 'thuong-tru': 'THUONG_TRU',
  'tạm trú':   'TAM_TRU',    'tam tru':    'TAM_TRU',
  'tamtru':    'TAM_TRU',    'tam_tru':    'TAM_TRU',    'tam-tru':    'TAM_TRU',
  'tạm vắng':  'TAM_VANG',   'tam vang':   'TAM_VANG',
  'tamvang':   'TAM_VANG',   'tam_vang':   'TAM_VANG',   'tam-vang':   'TAM_VANG',
}
const MAP_GIOI_TINH: Record<string, 'NAM' | 'NU' | 'KHAC'> = {
  'nam': 'NAM', 'male': 'NAM', 'm': 'NAM', '1': 'NAM',
  'nữ': 'NU',  'nu':   'NU',  'female': 'NU', 'f': 'NU', '2': 'NU',
  'khác': 'KHAC', 'khac': 'KHAC', 'other': 'KHAC',
}

function chuanHoaTinhTrang(val: string | undefined | null): string {
  const key = norm(val)
  return MAP_TINH_TRANG[key] ?? 'THUONG_TRU'
}
function chuanHoaGioiTinh(val: string | undefined | null): 'NAM' | 'NU' | 'KHAC' {
  const key = norm(val)
  return MAP_GIOI_TINH[key] ?? 'NAM'
}
function chuanHoaNgaySinh(val: string | number | undefined): string | undefined {
  if (!val) return undefined
  if (typeof val === 'number') {
    const date = XLSX.SSF.parse_date_code(val)
    if (date) return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`
    return undefined
  }
  const s = String(val).trim()
  if (!s) return undefined
  const ddmmyyyy = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (ddmmyyyy?.[1] && ddmmyyyy?.[2] && ddmmyyyy?.[3]) {
    return `${ddmmyyyy[3]}-${ddmmyyyy[2].padStart(2, '0')}-${ddmmyyyy[1].padStart(2, '0')}`
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s
  return undefined
}

// ─── Header mapping ──────────────────────────────────────────
const COL_MAP: Record<string, string> = {
  // Household
  'họ tên chủ hộ': 'chuHo', 'chủ hộ': 'chuHo', 'chu ho': 'chuHo', 'chu_ho': 'chuHo', 'tên chủ hộ': 'chuHo',
  'số nhà': 'soNha', 'so nha': 'soNha', 'so_nha': 'soNha', 'nhà số': 'soNha',
  'đường/hẻm': 'duong', 'đường': 'duong', 'duong': 'duong', 'hem': 'duong', 'hẻm': 'duong', 'đường - hẻm': 'duong',
  'tổ/khu vực': 'toTruong', 'tổ': 'toTruong', 'khu vực': 'toTruong', 'to_truong': 'toTruong', 'to truong': 'toTruong', 'tổ dân phố': 'toTruong',
  'địa chỉ đầy đủ': 'diaChiDay', 'địa chỉ': 'diaChiDay', 'dia chi': 'diaChiDay', 'dia_chi_day': 'diaChiDay', 'địa chỉ thường trú': 'diaChiDay', 'nơi ở hiện tại': 'diaChiDay',
  'sđt chủ hộ': 'soDienThoaiHo', 'điện thoại chủ hộ': 'soDienThoaiHo', 'sdt chu ho': 'soDienThoaiHo', 'số điện thoại hộ': 'soDienThoaiHo',
  'tình trạng hộ': 'trangThaiHo', 'tinh trang ho': 'trangThaiHo', 'trang_thai_ho': 'trangThaiHo',
  'hộ khẩu': 'trangThaiHo', 'loại hộ khẩu': 'trangThaiHo', 'loai ho khau': 'trangThaiHo',
  'tình trạng đăng ký': 'trangThaiHo', 'tinh trang dang ky': 'trangThaiHo',
  'đăng ký thường trú': 'trangThaiHo', 'dang ky thuong tru': 'trangThaiHo',
  // Person
  'họ tên nhân khẩu': 'hoTen', 'họ và tên': 'hoTen', 'ho ten': 'hoTen', 'ho_ten': 'hoTen',
  'họ tên': 'hoTen', 'tên': 'hoTen', 'ten': 'hoTen', 'full name': 'hoTen', 'họ tên đầy đủ': 'hoTen',
  'ngày sinh': 'ngaySinh', 'ngay sinh': 'ngaySinh', 'ngay_sinh': 'ngaySinh', 'dob': 'ngaySinh', 'năm sinh': 'ngaySinh',
  'giới tính': 'gioiTinh', 'gioi tinh': 'gioiTinh', 'gioi_tinh': 'gioiTinh', 'gender': 'gioiTinh', 'phái': 'gioiTinh',
  'cccd': 'cccd', 'cmnd': 'cccd', 'cccd/cmnd': 'cccd', 'số cccd': 'cccd', 'so cccd': 'cccd', 'số cmnd': 'cccd', 'căn cước': 'cccd',
  'quan hệ': 'quanHe', 'quan hệ với chủ hộ': 'quanHe', 'quan he': 'quanHe', 'quan_he': 'quanHe', 'mối quan hệ': 'quanHe',
  'nghề nghiệp': 'ngheNghiep', 'nghe nghiep': 'ngheNghiep', 'nghe_nghiep': 'ngheNghiep', 'nghề': 'ngheNghiep', 'công việc': 'ngheNghiep',
  'sđt': 'soDienThoaiNk', 'số điện thoại': 'soDienThoaiNk', 'sdt': 'soDienThoaiNk', 'điện thoại': 'soDienThoaiNk', 'phone': 'soDienThoaiNk',
  'tình trạng cư trú': 'trangThaiNk', 'tình trạng': 'trangThaiNk', 'tinh trang cu tru': 'trangThaiNk', 'cư trú': 'trangThaiNk',
  'ghi chú nhân khẩu': 'ghiChu', 'ghi chú': 'ghiChu', 'ghi chu': 'ghiChu', 'note': 'ghiChu',
}

// ─── Parse ───────────────────────────────────────────────────
interface ParsedRow {
  chuHo: string; soNha: string; duong: string; toTruong: string
  diaChiDay: string; soDienThoaiHo: string; trangThaiHo: string
  hoTen: string; ngaySinh: string; gioiTinh: string; cccd: string
  quanHe: string; ngheNghiep: string; soDienThoaiNk: string
  trangThaiNk: string; ghiChu: string
}

function parseSheet(sheet: XLSX.WorkSheet): { rows: ParsedRow[]; mappedHeaders: string[]; unmappedHeaders: string[] } {
  const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' })
  if (!raw.length) return { rows: [], mappedHeaders: [], unmappedHeaders: [] }

  const firstRow = raw[0] ?? {}
  const headerMap: Record<string, string> = {}
  const mappedHeaders: string[] = []
  const unmappedHeaders: string[] = []

  Object.keys(firstRow).forEach((h) => {
    // normalize NFC để xử lý header tiếng Việt từ Excel (NFD)
    const clean = norm(h).replace(/\*/g, '')
    const mapped = COL_MAP[clean]
    if (mapped) {
      headerMap[h] = mapped
      mappedHeaders.push(h)
    } else if (h && h !== '__EMPTY') {
      unmappedHeaders.push(h)
    }
  })

  const rows = raw.map((row) => {
    const r: Record<string, string> = {}
    Object.entries(row).forEach(([k, v]) => {
      const field = headerMap[k]
      // normalize NFC để xử lý giá trị tiếng Việt từ Excel (NFD)
      if (field) r[field] = String(v ?? '').trim().normalize('NFC')
    })
    // Handle ngaySinh (may be number from Excel)
    const ngayKey = Object.keys(row).find(k => headerMap[k] === 'ngaySinh')
    if (ngayKey) {
      const parsed = chuanHoaNgaySinh(row[ngayKey] as string | number | undefined)
      if (parsed) r['ngaySinh'] = parsed
    }
    return {
      chuHo: r['chuHo'] ?? '', soNha: r['soNha'] ?? '', duong: r['duong'] ?? '',
      toTruong: r['toTruong'] ?? '', diaChiDay: r['diaChiDay'] ?? '',
      soDienThoaiHo: r['soDienThoaiHo'] ?? '', trangThaiHo: r['trangThaiHo'] ?? '',
      hoTen: r['hoTen'] ?? '', ngaySinh: r['ngaySinh'] ?? '', gioiTinh: r['gioiTinh'] ?? '',
      cccd: r['cccd'] ?? '', quanHe: r['quanHe'] ?? '', ngheNghiep: r['ngheNghiep'] ?? '',
      soDienThoaiNk: r['soDienThoaiNk'] ?? '', trangThaiNk: r['trangThaiNk'] ?? '',
      ghiChu: r['ghiChu'] ?? '',
    } as ParsedRow
  }).filter(r => r.chuHo || r.hoTen)

  // Debug: log để kiểm tra encoding và mapping
  if (process.env.NODE_ENV === 'development') {
    const sample = rows.slice(0, 5).map(r => ({
      chuHo: r.chuHo,
      trangThaiHo: `"${r.trangThaiHo}"`,
      trangThaiNk: `"${r.trangThaiNk}"`,
      mapped: chuanHoaTinhTrang(r.trangThaiHo || r.trangThaiNk),
    }))
    console.table(sample)
    // Liệt kê tất cả headers không nhận ra
    if (rows[0]) {
      const allHeaders = Object.keys(rows[0] as object)
      console.log('[ImportClient] Tất cả headers:', allHeaders)
    }
  }

  return { rows, mappedHeaders, unmappedHeaders }
}

function groupHoDan(rows: ParsedRow[]): NhapHoDanRow[] {
  const map = new Map<string, NhapHoDanRow>()
  let lastKey = ''

  for (const row of rows) {
    const key = `${row.chuHo}||${row.diaChiDay || (row.soNha + row.duong)}`
    const isNewHo = row.chuHo && key !== '||'

    if (isNewHo && !map.has(key)) {
      // Ưu tiên: trangThaiHo → trangThaiNk → THUONG_TRU
      // Nhiều file chỉ có 1 cột "Tình trạng" map sang trangThaiNk,
      // nên phải fallback sang đó để lấy tình trạng hộ.
      const trangThaiHo = row.trangThaiHo || row.trangThaiNk
      map.set(key, {
        chuHo: row.chuHo,
        soNha: row.soNha,
        duong: row.duong,
        toTruong: row.toTruong,
        diaChiDay: row.diaChiDay || [row.soNha, row.duong, row.toTruong].filter(Boolean).join(', '),
        soDienThoai: row.soDienThoaiHo,
        trangThai: chuanHoaTinhTrang(trangThaiHo),
        nhanKhau: [],
      })
      lastKey = key
    }

    const hoKey = isNewHo ? key : lastKey
    const ho = map.get(hoKey)
    if (row.hoTen && ho) {
      // Ưu tiên: trangThaiNk → trangThaiHo → trangThai của hộ
      const trangThaiNk = row.trangThaiNk || row.trangThaiHo

      // Tự động nhận diện Chủ hộ: nếu tên trùng tên chủ hộ → gán 'Chủ hộ'
      const tenTrungChuHo = row.hoTen.trim().toUpperCase() === ho.chuHo.trim().toUpperCase()
      const quanHe = row.quanHe?.trim() || (tenTrungChuHo ? 'Chủ hộ' : 'Thành viên')

      ho.nhanKhau.push({
        hoTen: row.hoTen,
        ngaySinh: row.ngaySinh || undefined,
        gioiTinh: chuanHoaGioiTinh(row.gioiTinh),
        cccd: row.cccd || undefined,
        quanHe,
        ngheNghiep: row.ngheNghiep || undefined,
        soDienThoai: row.soDienThoaiNk || undefined,
        trangThai: chuanHoaTinhTrang(trangThaiNk),
      } as NhapNhanKhauRow)
    }
  }

  return Array.from(map.values()).filter(h => h.chuHo && h.diaChiDay)
}

// ─── Tạo file mẫu ────────────────────────────────────────────
function taiFileMau() {
  const wb = XLSX.utils.book_new()
  const headers = [
    'Họ tên chủ hộ*', 'Số nhà', 'Đường/Hẻm', 'Tổ/Khu vực',
    'Địa chỉ đầy đủ*', 'SĐT chủ hộ', 'Tình trạng hộ',
    'Họ tên nhân khẩu*', 'Ngày sinh (DD/MM/YYYY)', 'Giới tính',
    'CCCD/CMND', 'Quan hệ với chủ hộ', 'Nghề nghiệp',
    'Tình trạng cư trú', 'Ghi chú',
  ]
  const examples = [
    ['Nguyễn Văn An', '12', 'Đường số 5', 'Tổ 1', '12 Đường số 5, KP25, Long Trường', '0901234567', 'Thường trú', 'Nguyễn Văn An', '15/03/1980', 'Nam', '012345678901', 'Chủ hộ', 'Kinh doanh', 'Thường trú', ''],
    ['Nguyễn Văn An', '', '', '', '12 Đường số 5, KP25, Long Trường', '', '', 'Trần Thị Bình', '20/07/1985', 'Nữ', '012345678902', 'Vợ', 'Giáo viên', 'Thường trú', ''],
    ['Nguyễn Văn An', '', '', '', '12 Đường số 5, KP25, Long Trường', '', '', 'Nguyễn Thị Cẩm', '10/01/2010', 'Nữ', '', 'Con', 'Học sinh', 'Thường trú', ''],
    ['Lê Văn Dũng', '8', 'Hẻm 10', 'Tổ 2', '8 Hẻm 10, KP25, Long Trường', '0912345678', 'Tạm trú', 'Lê Văn Dũng', '05/06/1975', 'Nam', '098765432101', 'Chủ hộ', 'Thợ hồ', 'Tạm trú', ''],
    ['Lê Văn Dũng', '', '', '', '8 Hẻm 10, KP25, Long Trường', '', '', 'Phạm Thị Em', '12/12/1980', 'Nữ', '098765432102', 'Vợ', 'Nội trợ', 'Tạm trú', ''],
  ]
  const ws = XLSX.utils.aoa_to_sheet([headers, ...examples])
  ws['!cols'] = [
    {wch:22},{wch:8},{wch:14},{wch:12},{wch:36},{wch:14},{wch:14},
    {wch:22},{wch:22},{wch:10},{wch:16},{wch:20},{wch:14},{wch:14},{wch:16},
  ]
  const noteHeaders = ['Cột', 'Bắt buộc', 'Ghi chú']
  const notes = [
    ['Họ tên chủ hộ', 'Có', 'Dùng để nhận biết hộ. Các dòng cùng chủ hộ + địa chỉ sẽ ghép vào 1 hộ.'],
    ['Địa chỉ đầy đủ', 'Có', 'VD: 12 Đường số 5, Khu phố 25, Long Trường, TP.HCM'],
    ['Tình trạng hộ', 'Không', 'Thường trú / Tạm trú / Tạm vắng — mặc định: Thường trú'],
    ['Họ tên nhân khẩu', 'Có', 'Tên thành viên trong hộ'],
    ['Ngày sinh', 'Không', 'DD/MM/YYYY hoặc YYYY-MM-DD'],
    ['Giới tính', 'Không', 'Nam / Nữ / Khác — mặc định: Nam'],
    ['CCCD/CMND', 'Không', 'Phải duy nhất trong hệ thống'],
    ['Quan hệ với chủ hộ', 'Không', 'Chủ hộ / Vợ / Chồng / Con / Bố / Mẹ / Khác'],
    ['Tình trạng cư trú', 'Không', 'Thường trú / Tạm trú / Tạm vắng — mặc định: theo hộ'],
  ]
  const wsNote = XLSX.utils.aoa_to_sheet([noteHeaders, ...notes])
  wsNote['!cols'] = [{wch:22},{wch:10},{wch:70}]
  XLSX.utils.book_append_sheet(wb, ws, 'Dữ liệu dân cư')
  XLSX.utils.book_append_sheet(wb, wsNote, 'Hướng dẫn')
  XLSX.writeFile(wb, 'mau-nhap-dan-cu-KP25.xlsx')
}

// ─── Types ───────────────────────────────────────────────────
type KetQua = {
  success: boolean
  tongHo: number; tongNguoi: number; loiHo: number; loiNguoi: number
  chiTietLoi: string[]; message: string
}

type Tab = 'google' | 'file'

// ─── Component ───────────────────────────────────────────────
export default function ImportClient() {
  const [tab, setTab] = useState<Tab>('google')

  // Google Sheets state
  const [gsUrl, setGsUrl] = useState('')
  const [gsFetching, setGsFetching] = useState(false)
  const [gsError, setGsError] = useState('')

  // File upload state
  const fileRef = useRef<HTMLInputElement>(null)
  const [fileName, setFileName] = useState('')
  const [parseError, setParseError] = useState('')

  // Shared state
  const [parsed, setParsed] = useState<NhapHoDanRow[] | null>(null)
  const [mappedHeaders, setMappedHeaders] = useState<string[]>([])
  const [unmappedHeaders, setUnmappedHeaders] = useState<string[]>([])
  const [source, setSource] = useState<'google' | 'file' | null>(null)
  const [showLoi, setShowLoi] = useState(false)
  const [ketQua, setKetQua] = useState<KetQua | null>(null)
  const [isPending, startTransition] = useTransition()

  function applyParsed(sheet: XLSX.WorkSheet, sourceName: string, src: 'google' | 'file') {
    const { rows, mappedHeaders: mh, unmappedHeaders: uh } = parseSheet(sheet)
    if (!rows.length) {
      const err = 'Không tìm thấy dữ liệu. Kiểm tra lại cấu trúc bảng.'
      src === 'google' ? setGsError(err) : setParseError(err)
      return
    }
    const grouped = groupHoDan(rows)
    if (!grouped.length) {
      const err = 'Không nhóm được hộ dân. Cần có cột "Họ tên chủ hộ" và "Địa chỉ đầy đủ".'
      src === 'google' ? setGsError(err) : setParseError(err)
      return
    }
    setParsed(grouped)
    setMappedHeaders(mh)
    setUnmappedHeaders(uh)
    setSource(src)
    setKetQua(null)
    if (src === 'google') {
      toast.success(`Đọc thành công từ Google Sheets!`)
    }
  }

  // Google Sheets
  async function handleGoogleFetch() {
    if (!gsUrl.trim()) { setGsError('Vui lòng nhập link Google Sheets'); return }
    setGsError(''); setGsFetching(true)
    try {
      const result = await layDuLieuGoogleSheet(gsUrl.trim())
      if (!result.success || !result.csvData) {
        setGsError(result.message); return
      }
      const wb = XLSX.read(result.csvData, { type: 'string' })
      const sheetName = wb.SheetNames[0]
      if (!sheetName) { setGsError('Không có sheet nào trong file.'); return }
      applyParsed(wb.Sheets[sheetName]!, gsUrl, 'google')
    } catch (err) {
      setGsError(err instanceof Error ? err.message : 'Lỗi không xác định')
    } finally {
      setGsFetching(false)
    }
  }

  // File upload
  function handleFile(file: File) {
    setParseError(''); setKetQua(null); setParsed(null); setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target?.result, { type: 'array', cellDates: false })
        const sheetName = wb.SheetNames.find(n =>
          !n.toLowerCase().includes('hướng dẫn') && !n.toLowerCase().includes('note')
        ) ?? wb.SheetNames[0] ?? ''
        const ws = wb.Sheets[sheetName]
        if (!ws) { setParseError('Không đọc được sheet.'); return }
        applyParsed(ws, file.name, 'file')
      } catch { setParseError('Không thể đọc file. Hãy dùng định dạng .xlsx hoặc .csv.') }
    }
    reader.readAsArrayBuffer(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  function resetParsed() {
    setParsed(null); setFileName('')
    if (fileRef.current) fileRef.current.value = ''
  }

  // Import
  function handleImport() {
    if (!parsed) return
    startTransition(async () => {
      try {
        const result = await nhapDuLieuHangLoat(parsed)
        setKetQua(result)
        if (result.success) {
          toast.success(`Nhập thành công ${result.tongHo} hộ dân, ${result.tongNguoi} nhân khẩu!`)
          resetParsed()
        } else {
          toast.error(result.message, { duration: 6000 })
        }
      } catch {
        toast.error('Có lỗi xảy ra. Vui lòng thử lại.')
      }
    })
  }

  const tongNguoi = parsed?.reduce((s, h) => s + h.nhanKhau.length, 0) ?? 0

  return (
    <div className="space-y-6">

      {/* Tabs */}
      <div className="flex rounded-xl bg-slate-100 p-1 gap-1">
        {([
          { key: 'google', icon: Link2, label: 'Nhập từ Google Sheets' },
          { key: 'file', icon: FileSpreadsheet, label: 'Tải file lên (Excel/CSV)' },
        ] as const).map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            onClick={() => { setTab(key); resetParsed(); setGsError(''); setParseError(''); setKetQua(null) }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
              tab === key
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* ── Tab: Google Sheets ── */}
      {tab === 'google' && (
        <div className="card">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2 mb-4">
            <Link2 size={16} className="text-[#8B1A1A]" />
            Dán link Google Sheets
          </h2>

          {/* Hướng dẫn mở quyền */}
          <div className="flex gap-3 bg-amber-50 border border-amber-100 rounded-xl p-3 mb-4">
            <Info size={15} className="text-amber-500 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <strong>Yêu cầu:</strong> Sheet phải ở chế độ công khai. Trong Google Sheets: nhấn nút{' '}
              <strong>Chia sẻ</strong> → <em>Thay đổi thành bất kỳ ai có đường liên kết</em> → chọn{' '}
              <strong>Người xem</strong> → Xong.
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="url"
              value={gsUrl}
              onChange={(e) => { setGsUrl(e.target.value); setGsError('') }}
              onKeyDown={(e) => { if (e.key === 'Enter') handleGoogleFetch() }}
              placeholder="https://docs.google.com/spreadsheets/d/..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]/30 focus:border-[#8B1A1A]/40 font-mono"
            />
            <button
              onClick={handleGoogleFetch}
              disabled={gsFetching || !gsUrl.trim()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#8B1A1A] text-white text-sm font-semibold hover:bg-[#7a1616] disabled:opacity-50 transition-colors shrink-0"
            >
              {gsFetching
                ? <><Loader2 size={14} className="animate-spin" /> Đang tải...</>
                : <><RefreshCw size={14} /> Kết nối & Xem trước</>
              }
            </button>
          </div>

          {gsError && (
            <div className="mt-3 flex items-start gap-2 bg-red-50 text-red-700 rounded-xl p-3 border border-red-100 text-sm">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              {gsError}
            </div>
          )}

          <p className="text-xs text-slate-400 mt-3">
            Hệ thống sẽ đọc dữ liệu từ sheet đầu tiên có thể tìm thấy. Nếu Sheet có nhiều tab, hãy đảm bảo dữ liệu ở tab đầu tiên.
          </p>
        </div>
      )}

      {/* ── Tab: Upload file ── */}
      {tab === 'file' && (
        <div className="card">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between mb-5">
            <div>
              <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                <Download size={16} className="text-[#8B1A1A]" />
                Tải file mẫu
              </h2>
              <p className="text-sm text-slate-400 mt-0.5">File mẫu gồm dữ liệu ví dụ + hướng dẫn chi tiết</p>
            </div>
            <button
              onClick={taiFileMau}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1E3A5F] text-white text-sm font-medium hover:bg-[#162d4a] transition-colors shrink-0"
            >
              <Download size={15} />
              Tải mẫu Excel (.xlsx)
            </button>
          </div>

          <div
            className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-[#8B1A1A]/40 hover:bg-red-50/30 transition-colors cursor-pointer"
            onClick={() => fileRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            <FileSpreadsheet size={40} className="mx-auto mb-3 text-slate-300" />
            <p className="font-medium text-slate-600">
              {fileName
                ? <span className="text-[#8B1A1A]">{fileName}</span>
                : 'Kéo thả file hoặc nhấn để chọn'
              }
            </p>
            <p className="text-sm text-slate-400 mt-1">Hỗ trợ: .xlsx, .xls, .csv</p>
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
            />
          </div>

          {parseError && (
            <div className="mt-4 flex items-start gap-2 bg-red-50 text-red-700 rounded-xl p-3 border border-red-100 text-sm">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              {parseError}
            </div>
          )}
        </div>
      )}

      {/* ── Preview (shared) ── */}
      {parsed && parsed.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-500" />
              Xem trước dữ liệu
              {source === 'google' && (
                <span className="text-xs font-normal text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                  Google Sheets
                </span>
              )}
            </h2>
            <button onClick={resetParsed} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
              <X size={16} />
            </button>
          </div>

          {/* Header mapping info */}
          {(mappedHeaders.length > 0 || unmappedHeaders.length > 0) && (
            <div className="flex flex-wrap gap-2 mb-4">
              {mappedHeaders.map(h => (
                <span key={h} className="inline-flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-1 rounded-full">
                  <CheckCircle2 size={10} />
                  {h}
                </span>
              ))}
              {unmappedHeaders.map(h => (
                <span key={h} className="inline-flex items-center gap-1 text-xs bg-slate-50 text-slate-400 border border-slate-200 px-2 py-1 rounded-full">
                  {h}
                </span>
              ))}
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-[#1E3A5F]/5 rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-[#1E3A5F]/10 rounded-lg flex items-center justify-center">
                <Home size={18} className="text-[#1E3A5F]" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#1E3A5F]">{parsed.length}</div>
                <div className="text-xs text-slate-500">Hộ dân</div>
              </div>
            </div>
            <div className="bg-[#8B1A1A]/5 rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-[#8B1A1A]/10 rounded-lg flex items-center justify-center">
                <Users size={18} className="text-[#8B1A1A]" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#8B1A1A]">{tongNguoi}</div>
                <div className="text-xs text-slate-500">Nhân khẩu</div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs">
                  <th className="text-left px-3 py-2.5 font-medium">#</th>
                  <th className="text-left px-3 py-2.5 font-medium">Chủ hộ</th>
                  <th className="text-left px-3 py-2.5 font-medium">Địa chỉ</th>
                  <th className="text-left px-3 py-2.5 font-medium">Tình trạng</th>
                  <th className="text-left px-3 py-2.5 font-medium">Nhân khẩu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {parsed.slice(0, 20).map((h, i) => (
                  <tr key={i} className="hover:bg-slate-50/60">
                    <td className="px-3 py-2.5 text-slate-400 text-xs">{i + 1}</td>
                    <td className="px-3 py-2.5 font-medium text-slate-900">{h.chuHo}</td>
                    <td className="px-3 py-2.5 text-slate-500 max-w-[200px] truncate">{h.diaChiDay}</td>
                    <td className="px-3 py-2.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        h.trangThai === 'THUONG_TRU' ? 'bg-emerald-50 text-emerald-700' :
                        h.trangThai === 'TAM_TRU' ? 'bg-blue-50 text-blue-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {h.trangThai === 'THUONG_TRU' ? 'Thường trú' : h.trangThai === 'TAM_TRU' ? 'Tạm trú' : 'Tạm vắng'}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="space-y-0.5">
                        {h.nhanKhau.slice(0, 3).map((nk, j) => (
                          <div key={j} className="text-xs text-slate-600 flex items-center gap-1">
                            <span className="text-slate-400 min-w-[60px]">{nk.quanHe}</span>
                            <span>·</span>
                            <span>{nk.hoTen}</span>
                          </div>
                        ))}
                        {h.nhanKhau.length > 3 && (
                          <div className="text-xs text-slate-400">+{h.nhanKhau.length - 3} người nữa</div>
                        )}
                        {h.nhanKhau.length === 0 && (
                          <span className="text-xs text-amber-500">Chưa có nhân khẩu</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {parsed.length > 20 && (
              <div className="px-4 py-3 text-xs text-slate-400 border-t border-slate-50 bg-slate-50/50">
                Hiển thị 20/{parsed.length} hộ đầu tiên
              </div>
            )}
          </div>

          {/* Import button */}
          <div className="flex items-center justify-between mt-5 pt-5 border-t border-slate-100">
            <p className="text-sm text-slate-500">
              Sẽ tạo <strong className="text-[#1E3A5F]">{parsed.length} hộ dân</strong> và{' '}
              <strong className="text-[#8B1A1A]">{tongNguoi} nhân khẩu</strong>
            </p>
            <button
              onClick={handleImport}
              disabled={isPending}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#8B1A1A] text-white text-sm font-bold hover:bg-[#7a1616] transition-colors disabled:opacity-60"
            >
              {isPending
                ? <><Loader2 size={15} className="animate-spin" /> Đang nhập...</>
                : <><Upload size={15} /> Bắt đầu nhập</>
              }
            </button>
          </div>
        </div>
      )}

      {/* ── Kết quả ── */}
      {ketQua && (
        <div className={`card border ${ketQua.success ? 'border-emerald-200 bg-emerald-50/40' : 'border-red-200 bg-red-50/40'}`}>
          <div className="flex items-start gap-3 mb-4">
            {ketQua.success
              ? <CheckCircle2 size={22} className="text-emerald-500 shrink-0 mt-0.5" />
              : <AlertCircle size={22} className="text-red-500 shrink-0 mt-0.5" />
            }
            <div>
              <p className={`font-semibold ${ketQua.success ? 'text-emerald-800' : 'text-red-800'}`}>
                {ketQua.success ? 'Nhập dữ liệu thành công' : 'Nhập thất bại'}
              </p>
              <p className="text-sm text-slate-600 mt-0.5">{ketQua.message}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {[
              { label: 'Hộ thành công', val: ketQua.tongHo, color: 'text-emerald-700' },
              { label: 'Nhân khẩu thành công', val: ketQua.tongNguoi, color: 'text-emerald-700' },
              { label: 'Hộ lỗi', val: ketQua.loiHo, color: ketQua.loiHo > 0 ? 'text-red-600' : 'text-slate-400' },
              { label: 'Nhân khẩu lỗi', val: ketQua.loiNguoi, color: ketQua.loiNguoi > 0 ? 'text-red-600' : 'text-slate-400' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl p-3 border border-slate-100 text-center">
                <div className={`text-xl font-bold ${s.color}`}>{s.val}</div>
                <div className="text-xs text-slate-400 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {ketQua.chiTietLoi.length > 0 && (
            <div>
              <button
                onClick={() => setShowLoi(!showLoi)}
                className="flex items-center gap-1.5 text-sm text-red-700 font-medium"
              >
                {showLoi ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                {showLoi ? 'Ẩn' : 'Xem'} chi tiết lỗi ({ketQua.chiTietLoi.length})
              </button>
              {showLoi && (
                <ul className="mt-3 space-y-1 max-h-60 overflow-y-auto">
                  {ketQua.chiTietLoi.map((e, i) => (
                    <li key={i} className="text-xs text-red-700 bg-red-50 px-3 py-1.5 rounded-lg border border-red-100">
                      {e}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
