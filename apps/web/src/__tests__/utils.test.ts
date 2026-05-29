import { describe, it, expect } from 'vitest'
import {
  cn,
  formatDate,
  formatDateTime,
  formatRelativeTime,
  formatCurrency,
  truncate,
  slugify,
  getInitials,
  mapThongBao,
  mapPhanAnh,
  buildApiResponse,
  buildApiError,
} from '@/lib/utils'

// ═══════════════════════════════════════════════════════════════
// cn — merge Tailwind classes
// ═══════════════════════════════════════════════════════════════
describe('cn()', () => {
  it('gộp nhiều class thành một chuỗi', () => {
    expect(cn('px-4', 'py-2')).toBe('px-4 py-2')
  })

  it('loại bỏ class trùng theo Tailwind (twMerge)', () => {
    expect(cn('px-4', 'px-6')).toBe('px-6')
  })

  it('bỏ qua giá trị falsy', () => {
    expect(cn('base', false && 'hidden', undefined, null, 'extra')).toBe('base extra')
  })

  it('hỗ trợ object conditional', () => {
    expect(cn({ 'text-red-500': true, 'text-blue-500': false })).toBe('text-red-500')
  })
})

// ═══════════════════════════════════════════════════════════════
// formatDate / formatDateTime
// ═══════════════════════════════════════════════════════════════
describe('formatDate()', () => {
  const isoDate = '2026-05-29T10:00:00.000Z'

  it('định dạng mặc định dd/MM/yyyy', () => {
    const result = formatDate(isoDate)
    expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4}$/)
  })

  it('hỗ trợ custom pattern', () => {
    const result = formatDate(isoDate, 'yyyy-MM-dd')
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('chấp nhận Date object', () => {
    const d = new Date('2026-01-01T00:00:00.000Z')
    expect(formatDate(d)).toMatch(/^\d{2}\/\d{2}\/2026$/)
  })
})

describe('formatDateTime()', () => {
  it('định dạng HH:mm dd/MM/yyyy', () => {
    const result = formatDateTime('2026-05-29T08:30:00.000Z')
    expect(result).toMatch(/^\d{2}:\d{2} \d{2}\/\d{2}\/\d{4}$/)
  })
})

// ═══════════════════════════════════════════════════════════════
// formatCurrency
// ═══════════════════════════════════════════════════════════════
describe('formatCurrency()', () => {
  it('định dạng tiền Việt Nam chứa số và ký hiệu tiền', () => {
    const result = formatCurrency(100000)
    expect(result).toContain('100')
    // VND symbol có thể là ₫ hoặc VND tuỳ Node Intl data
    expect(result).toMatch(/₫|VND|đ/i)
  })

  it('số 0 trả về chuỗi chứa 0', () => {
    const result = formatCurrency(0)
    expect(result).toContain('0')
  })
})

// ═══════════════════════════════════════════════════════════════
// truncate
// ═══════════════════════════════════════════════════════════════
describe('truncate()', () => {
  it('không cắt nếu text ngắn hơn maxLength', () => {
    expect(truncate('Hello', 10)).toBe('Hello')
  })

  it('cắt và thêm ... nếu vượt maxLength', () => {
    const result = truncate('Đây là đoạn văn bản dài', 10)
    expect(result).toHaveLength(13) // 10 + '...'
    expect(result.endsWith('...')).toBe(true)
  })

  it('trả về chuỗi rỗng với null/undefined', () => {
    expect(truncate(null, 10)).toBe('')
    expect(truncate(undefined, 10)).toBe('')
  })

  it('cắt đúng ở ranh giới maxLength', () => {
    expect(truncate('abc', 3)).toBe('abc')
    expect(truncate('abcd', 3)).toBe('abc...')
  })
})

// ═══════════════════════════════════════════════════════════════
// slugify
// ═══════════════════════════════════════════════════════════════
describe('slugify()', () => {
  it('chuyển chữ hoa thành thường', () => {
    expect(slugify('Hello World')).toBe('hello-world')
  })

  it('bỏ dấu tiếng Việt', () => {
    const result = slugify('Thông báo khu phố')
    expect(result).not.toMatch(/[àáãạảăắặẳẵâấậẩẫđèéẹẻẽêềếệểễìíịỉĩòóõọỏôốộổỗơớợởỡùúụủũưứựửữỳýỵỷỹ]/i)
  })

  it('thay khoảng trắng bằng dấu gạch ngang', () => {
    expect(slugify('An Ninh')).toBe('an-ninh')
  })

  it('xử lý chữ đ đặc biệt', () => {
    expect(slugify('đường số 1')).toBe('duong-so-1')
  })
})

// ═══════════════════════════════════════════════════════════════
// getInitials
// ═══════════════════════════════════════════════════════════════
describe('getInitials()', () => {
  it('lấy 2 chữ đầu của họ tên', () => {
    expect(getInitials('Phan Tấn Tài')).toBe('PT')
  })

  it('chỉ 1 từ thì lấy 1 ký tự đầu', () => {
    // split(' ') → ['Admin'] → map → ['A'] → join → 'A'
    expect(getInitials('Admin')).toBe('A')
  })

  it('2 từ lấy 2 chữ đầu', () => {
    expect(getInitials('Nguyễn An')).toBe('NA')
  })
})

// ═══════════════════════════════════════════════════════════════
// mapThongBao — snake_case → camelCase
// ═══════════════════════════════════════════════════════════════
describe('mapThongBao()', () => {
  const mockRow = {
    id:                'uuid-001',
    tieu_de:           'Thông báo họp khu phố',
    noi_dung:          'Nội dung thông báo',
    loai:              'HOP_KHU_PHO',
    anh_url:           null,
    file_dinh_kem_urls: [],
    nguoi_tao_id:      'user-001',
    da_gui_push:       false,
    da_gui_zalo:       false,
    da_gui_sms:        false,
    luot_xem:          42,
    ghim_len:          true,
    ngay_het_han:      null,
    created_at:        '2026-05-29T08:00:00.000Z',
    updated_at:        '2026-05-29T08:00:00.000Z',
  }

  it('map đúng các trường camelCase', () => {
    const result = mapThongBao(mockRow)
    expect(result.id).toBe('uuid-001')
    expect(result.tieuDe).toBe('Thông báo họp khu phố')
    expect(result.loai).toBe('HOP_KHU_PHO')
    expect(result.luotXem).toBe(42)
    expect(result.ghimLen).toBe(true)
  })

  it('dùng giá trị mặc định khi thiếu trường', () => {
    const result = mapThongBao({ id: 'x' })
    expect(result.noiDung).toBe('')
    expect(result.loai).toBe('THONG_BAO_CHUNG')
    expect(result.luotXem).toBe(0)
    expect(result.ghimLen).toBe(false)
    expect(Array.isArray(result.fileDinhKemUrls)).toBe(true)
  })
})

// ═══════════════════════════════════════════════════════════════
// mapPhanAnh
// ═══════════════════════════════════════════════════════════════
describe('mapPhanAnh()', () => {
  const mockRow = {
    id:              'pa-001',
    tieu_de:         'Đèn đường hỏng',
    mo_ta:           'Đèn số 5 tắt từ 3 ngày',
    loai:            'HA_TANG',
    muc_do:          'CAO',
    trang_thai:      'MOI',
    dia_chi_phan_anh:'Đường số 1, KP25',
    toa_do_lat:      10.8,
    toa_do_lng:      106.81,
    anh_urls:        ['https://example.com/img.jpg'],
    video_urls:      [],
    nguoi_gui_id:    null,
    nguoi_gui_ten:   'Nguyễn Văn A',
    nguoi_gui_sdt:   '0901234567',
    can_bo_xu_ly_id: null,
    thoi_gian_xu_ly: null,
    ket_qua_xu_ly:   null,
    ai_danh_gia:     null,
    created_at:      '2026-05-29T08:00:00.000Z',
    updated_at:      '2026-05-29T08:00:00.000Z',
  }

  it('map đúng loại, mức độ, trạng thái', () => {
    const result = mapPhanAnh(mockRow)
    expect(result.loai).toBe('HA_TANG')
    expect(result.mucDo).toBe('CAO')
    expect(result.trangThai).toBe('MOI')
  })

  it('map mảng ảnh đúng', () => {
    const result = mapPhanAnh(mockRow)
    expect(result.anhUrls).toHaveLength(1)
    expect(result.anhUrls[0]).toContain('example.com')
  })

  it('dùng giá trị mặc định khi thiếu', () => {
    const result = mapPhanAnh({ id: 'x' })
    expect(result.loai).toBe('KHAC')
    expect(result.mucDo).toBe('TRUNG_BINH')
    expect(result.trangThai).toBe('MOI')
    expect(Array.isArray(result.anhUrls)).toBe(true)
  })
})

// ═══════════════════════════════════════════════════════════════
// buildApiResponse / buildApiError
// ═══════════════════════════════════════════════════════════════
describe('buildApiResponse()', () => {
  it('trả về success=true với data và timestamp', () => {
    const result = buildApiResponse({ name: 'KP25' })
    expect(result.success).toBe(true)
    expect(result.data).toEqual({ name: 'KP25' })
    expect(result.message).toBe('Thành công')
    expect(result.timestamp).toBeTruthy()
  })

  it('hỗ trợ custom message', () => {
    const result = buildApiResponse(null, 'Cập nhật thành công')
    expect(result.message).toBe('Cập nhật thành công')
  })
})

describe('buildApiError()', () => {
  it('trả về success=false với message', () => {
    const result = buildApiError('Lỗi xác thực')
    expect(result.success).toBe(false)
    expect(result.message).toBe('Lỗi xác thực')
  })

  it('hỗ trợ trường errors chi tiết', () => {
    const result = buildApiError('Dữ liệu không hợp lệ', {
      hoTen: ['Họ tên không được để trống'],
    })
    expect(result.errors?.hoTen).toHaveLength(1)
  })
})
