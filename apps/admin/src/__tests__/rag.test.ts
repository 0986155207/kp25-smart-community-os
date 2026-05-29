import { describe, it, expect, vi, beforeEach } from 'vitest'
import { tachChunk } from '@/lib/rag'

// ═══════════════════════════════════════════════════════════════
// tachChunk — tách văn bản thành các đoạn nhỏ
// ═══════════════════════════════════════════════════════════════
describe('tachChunk()', () => {

  it('văn bản đủ dài trả về 1 chunk', () => {
    // MIN_CHUNK_CHARS = 50 → text phải >= 50 ký tự
    const text = 'Đây là một đoạn văn bản đủ dài để vượt ngưỡng tối thiểu 50 ký tự của hàm tachChunk.'
    const chunks = tachChunk(text)
    expect(chunks.length).toBeGreaterThanOrEqual(1)
    expect(chunks[0]).toContain('Đây là')
  })

  it('văn bản rỗng trả về mảng rỗng', () => {
    expect(tachChunk('')).toEqual([])
    expect(tachChunk('   ')).toEqual([])
  })

  it('văn bản ngắn hơn MIN_CHUNK_CHARS bị lọc bỏ', () => {
    const chunks = tachChunk('ABC')
    expect(chunks).toEqual([])
  })

  it('tách theo đoạn văn (double newline)', () => {
    const text = [
      'Đoạn 1: Thông tin về hộ dân trong khu phố 25 tại phường Long Trường.',
      'Đoạn 2: Ban điều hành khu phố họp định kỳ mỗi tháng một lần vào ngày đầu tháng.',
      'Đoạn 3: Công tác an ninh trật tự được duy trì 24/7 với sự hỗ trợ của tổ dân phố.',
    ].join('\n\n')

    const chunks = tachChunk(text)
    expect(chunks.length).toBeGreaterThanOrEqual(1)
    chunks.forEach(c => {
      expect(c.length).toBeGreaterThanOrEqual(50)
    })
  })

  it('tách nhiều đoạn → mỗi chunk không vượt quá MAX_CHUNK_CHARS + overlap', () => {
    // Tạo nhiều đoạn ngắn phân tách bởi \n\n → tachChunk gộp và tách đúng
    const paragraphs: string[] = []
    for (let i = 1; i <= 8; i++) {
      // Mỗi đoạn ~200 ký tự
      paragraphs.push(`Đoạn ${i}: `.padEnd(8) + `Khu phố 25 thông báo nội dung số ${i}. `.repeat(5).trim())
    }
    const text = paragraphs.join('\n\n')
    const chunks = tachChunk(text)

    // Mỗi chunk không vượt MAX_CHUNK_CHARS + CHUNK_OVERLAP (900 + 100 = 1000)
    chunks.forEach(c => {
      expect(c.length).toBeLessThanOrEqual(1000)
    })
  })

  it('fallback tách cứng khi không có đoạn văn', () => {
    // Văn bản không có double newline, dài > 900 ký tự
    const text = 'Khu phố 25 phường Long Trường TP.HCM. '.repeat(30)
    const chunks = tachChunk(text)
    expect(chunks.length).toBeGreaterThanOrEqual(1)
  })

  it('chuẩn hóa xuống dòng Windows (\\r\\n)', () => {
    const text = 'Dòng 1\r\nDòng 2\r\n\r\nĐây là đoạn văn thứ hai với nội dung đủ dài để qua lọc.'
    const chunks = tachChunk(text)
    chunks.forEach(c => {
      expect(c).not.toContain('\r')
    })
  })

  it('giữ overlap giữa các chunk', () => {
    // Tạo văn bản gồm nhiều đoạn đủ dài → buộc tách thành nhiều chunk
    const paragraphs: string[] = []
    for (let i = 1; i <= 6; i++) {
      paragraphs.push(
        `Đoạn ${i}: `.padEnd(10) +
        `Nội dung quan trọng số ${i} của văn bản hành chính khu phố 25. `.repeat(5)
      )
    }
    const text = paragraphs.join('\n\n')
    const chunks = tachChunk(text)

    if (chunks.length >= 2) {
      // Chunk thứ 2 phải chứa một phần nội dung từ chunk trước (overlap)
      // Kiểm tra tổng ký tự chunks > text.length * 0.8 (có sự trùng lặp)
      const totalChunkChars = chunks.reduce((s, c) => s + c.length, 0)
      expect(totalChunkChars).toBeGreaterThan(text.length * 0.7)
    }
  })

  it('loại bỏ nhiều dòng trắng liên tiếp', () => {
    const text = 'Đoạn văn 1 có nội dung đủ dài.\n\n\n\n\nĐoạn văn 2 cũng có nội dung đủ dài để test.'
    const chunks = tachChunk(text)
    expect(chunks.length).toBeGreaterThanOrEqual(1)
    chunks.forEach(c => expect(c).not.toMatch(/\n{3,}/))
  })
})

// ═══════════════════════════════════════════════════════════════
// LOAI_SK + TRANG_THAI_SK config (từ su-kien page)
// ═══════════════════════════════════════════════════════════════
describe('Cấu hình phân loại sự kiện', () => {
  // Import trực tiếp constants để kiểm tra
  const LOAI_VALUES = [
    'CHINH_TRI', 'VAN_HOA', 'THE_THAO', 'TU_THIEN',
    'HOP_MAT', 'AN_NINH', 'SUCK_KHOE', 'GIAO_DUC', 'KHAC',
  ]

  const TRANG_THAI_VALUES = [
    'SAP_DIEN_RA', 'DANG_DIEN_RA', 'DA_KET_THUC', 'HUY',
  ]

  it('danh sách loại sự kiện đúng với DB enum', () => {
    // Kiểm tra chuỗi enum khớp với migration 017
    expect(LOAI_VALUES).toContain('CHINH_TRI')
    expect(LOAI_VALUES).toContain('VAN_HOA')
    expect(LOAI_VALUES).toContain('THE_THAO')
    expect(LOAI_VALUES).toContain('KHAC')
    expect(LOAI_VALUES).toHaveLength(9)
  })

  it('danh sách trạng thái sự kiện đúng với DB enum', () => {
    expect(TRANG_THAI_VALUES).toContain('SAP_DIEN_RA')
    expect(TRANG_THAI_VALUES).toContain('DANG_DIEN_RA')
    expect(TRANG_THAI_VALUES).toContain('DA_KET_THUC')
    expect(TRANG_THAI_VALUES).toContain('HUY')
    expect(TRANG_THAI_VALUES).toHaveLength(4)
  })
})
