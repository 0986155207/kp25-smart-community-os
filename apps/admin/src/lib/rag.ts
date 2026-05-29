// ─── RAG Core Utilities ─────────────────────────────────────────
// Không có 'use server' — dùng được cả trong Server Components và API routes

import { createServiceClient } from '@/lib/supabase/server'

// gemini-embedding-001 với outputDimensionality=768 → 768 chiều
// pgvector HNSW giới hạn tối đa 2000 dims, 768 nằm trong giới hạn
// text-embedding-004 (768 dim cũ) không còn trên API key này
const EMBEDDING_DIM           = 768
const EMBEDDING_OUTPUT_DIM    = 768   // outputDimensionality — nén từ 3072 → 768
const MAX_CHUNK_CHARS         = 900
const MIN_CHUNK_CHARS         = 50
const CHUNK_OVERLAP           = 100

// ── Danh sách model + endpoint thử theo thứ tự ưu tiên ─────────
const EMBEDDING_CANDIDATES: Array<{ model: string; ver: 'v1beta' | 'v1' }> = [
  { model: 'gemini-embedding-001', ver: 'v1beta' },
  { model: 'gemini-embedding-001', ver: 'v1'     },
  { model: 'gemini-embedding-2',   ver: 'v1beta' },
  { model: 'gemini-embedding-2',   ver: 'v1'     },
]

// Tên model thực sự dùng (auto-detect lần đầu, cache để không detect lại)
let resolvedModel: { model: string; ver: string } | null = null

// ── Gọi Embedding API qua fetch trực tiếp (bypass SDK quirks) ──
async function callEmbedAPI(
  model:      string,
  ver:        string,
  text:       string,
  taskType:   string,
): Promise<number[] | null> {
  const apiKey = process.env.GEMINI_API_KEY ?? ''
  const url    = `https://generativelanguage.googleapis.com/${ver}/models/${model}:embedContent?key=${apiKey}`

  try {
    const res = await fetch(url, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model:    `models/${model}`,
        content:  { parts: [{ text }] },
        taskType,
        outputDimensionality: EMBEDDING_OUTPUT_DIM,
      }),
    })

    if (!res.ok) {
      // Log để debug — xem server terminal (Next.js console)
      const errBody = await res.text().catch(() => '')
      console.error(`[RAG Embed] ${model} (${ver}) → HTTP ${res.status}: ${errBody.slice(0, 300)}`)
      return null
    }

    const data = await res.json() as { embedding?: { values?: number[] } }
    const values = data?.embedding?.values
    if (!Array.isArray(values) || values.length === 0) return null
    // Kiểm tra dimension khớp với schema pgvector
    if (values.length !== EMBEDDING_DIM) {
      console.error(`[RAG Embed] ${model}: dim=${values.length}, expected=${EMBEDDING_DIM}`)
      return null
    }
    return values
  } catch (e) {
    console.error(`[RAG Embed] ${model} (${ver}) → fetch error:`, e)
    return null
  }
}

// ── Tách văn bản thành chunks ──────────────────────────────────
export function tachChunk(text: string): string[] {
  const clean = text.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim()

  // Tách theo đoạn văn (double newline)
  const paragraphs = clean.split(/\n\n+/).map(p => p.trim()).filter(p => p.length >= MIN_CHUNK_CHARS)

  const chunks: string[] = []
  let current = ''

  for (const para of paragraphs) {
    if (!current) {
      current = para
      continue
    }

    // Nếu cộng vào vẫn đủ nhỏ → gộp cùng chunk
    if (current.length + para.length + 2 <= MAX_CHUNK_CHARS) {
      current += '\n\n' + para
    } else {
      // Flush chunk hiện tại
      chunks.push(current.trim())

      // Overlap: lấy ~CHUNK_OVERLAP ký tự cuối để tiếp nối ngữ nghĩa
      const tail = current.slice(-CHUNK_OVERLAP).trim()
      current = tail ? tail + '\n\n' + para : para
    }
  }

  if (current.trim().length >= MIN_CHUNK_CHARS) {
    chunks.push(current.trim())
  }

  // Fallback: nếu văn bản không có đoạn, tách cứng theo số ký tự
  if (chunks.length === 0 && clean.length >= MIN_CHUNK_CHARS) {
    for (let i = 0; i < clean.length; i += MAX_CHUNK_CHARS - CHUNK_OVERLAP) {
      const slice = clean.slice(i, i + MAX_CHUNK_CHARS).trim()
      if (slice.length >= MIN_CHUNK_CHARS) chunks.push(slice)
    }
  }

  return chunks
}

// ── Tạo embedding cho 1 đoạn text ─────────────────────────────
export async function taoEmbedding(
  text: string,
  taskType: 'document' | 'query' = 'document'
): Promise<number[]> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY chưa được cấu hình trong .env.local')
  }

  const taskTypeValue = taskType === 'document'
    ? 'RETRIEVAL_DOCUMENT'
    : 'RETRIEVAL_QUERY'

  // Nếu đã biết model nào hoạt động → dùng luôn (không thử lại)
  if (resolvedModel) {
    const values = await callEmbedAPI(
      resolvedModel.model, resolvedModel.ver, text, taskTypeValue,
    )
    if (values) return values
    // Model đã biết bị lỗi → reset, thử lại cascade bên dưới
    resolvedModel = null
  }

  // Cascade: thử từng (model, version) cho đến khi có kết quả
  for (const candidate of EMBEDDING_CANDIDATES) {
    const values = await callEmbedAPI(candidate.model, candidate.ver, text, taskTypeValue)
    if (values) {
      // Cache model đầu tiên hoạt động
      resolvedModel = candidate
      console.info(`[RAG] Embedding model đang dùng: ${candidate.model} (${candidate.ver})`)
      return values
    }
  }

  throw new Error(
    'Không thể tạo embedding. Kiểm tra GEMINI_API_KEY và đảm bảo đã bật ' +
    'Generative Language API tại https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com',
  )
}

// ── Nhúng toàn bộ tài liệu vào vector DB ──────────────────────
export async function nhungTaiLieu(
  taiLieuId: string,
  noiDung: string,
  tieuDe: string
): Promise<{ success: boolean; soChunk: number; message?: string }> {
  try {
    const svc = createServiceClient()

    // 1. Xoá chunks cũ
    await svc.from('tai_lieu_chunks').delete().eq('tai_lieu_id', taiLieuId)

    // 2. Tách chunks
    const fullText = `${tieuDe}\n\n${noiDung}`.trim()
    const chunks   = tachChunk(fullText)

    if (chunks.length === 0) {
      return { success: false, soChunk: 0, message: 'Không có nội dung để nhúng' }
    }

    // 3. Nhúng từng chunk (tuần tự để tránh rate limit)
    const rows: Array<{
      tai_lieu_id: string; noi_dung: string; vi_tri: number;
      embedding: string; da_nhung: boolean;
    }> = []

    for (let i = 0; i < chunks.length; i++) {
      const vector = await taoEmbedding(chunks[i]!, 'document')
      rows.push({
        tai_lieu_id: taiLieuId,
        noi_dung:    chunks[i]!,
        vi_tri:      i,
        embedding:   `[${vector.join(',')}]`,
        da_nhung:    true,
      })
      // Thêm delay nhỏ để tránh rate-limit API
      if (i < chunks.length - 1) {
        await new Promise(r => setTimeout(r, 200))
      }
    }

    // 4. Lưu vào DB
    const { error } = await svc.from('tai_lieu_chunks').insert(rows)
    if (error) throw new Error(error.message)

    // 5. Ghi log
    await svc.from('rag_lich_su').insert({
      tai_lieu_id: taiLieuId,
      so_chunk:    chunks.length,
      trang_thai:  'THANH_CONG',
    })

    return { success: true, soChunk: chunks.length }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Lỗi không xác định'

    // Ghi log lỗi
    try {
      const svc = createServiceClient()
      await svc.from('rag_lich_su').insert({
        tai_lieu_id: taiLieuId, so_chunk: 0, trang_thai: 'LOI', loi: msg,
      })
    } catch { /* ignore */ }

    return { success: false, soChunk: 0, message: msg }
  }
}

// ── Semantic search ─────────────────────────────────────────────
export interface KetQuaTimKiem {
  chunkId:      string
  taiLieuId:    string
  tieuDe:       string
  loai:         string
  soHieu:       string | null
  noiDung:      string
  viTri:        number
  doTuongDong:  number
}

export async function timKiemSemantic(
  query: string,
  limit: number  = 5,
  nguong: number = 0.4
): Promise<KetQuaTimKiem[]> {
  try {
    const queryVector = await taoEmbedding(query, 'query')
    const svc = createServiceClient()

    const { data, error } = await svc.rpc('tim_kiem_semantic', {
      query_embedding: `[${queryVector.join(',')}]`,
      gioi_han:        limit,
      nguong,
    })

    if (error) throw new Error(error.message)

    return ((data ?? []) as Array<Record<string, unknown>>).map(row => ({
      chunkId:     row['chunk_id']      as string,
      taiLieuId:   row['tai_lieu_id']   as string,
      tieuDe:      row['tieu_de']       as string,
      loai:        row['loai']          as string,
      soHieu:      row['so_hieu']       as string | null,
      noiDung:     row['noi_dung']      as string,
      viTri:       row['vi_tri']        as number,
      doTuongDong: row['do_tuong_dong'] as number,
    }))
  } catch { return [] }
}

// ── Xây dựng ngữ cảnh RAG cho AI ──────────────────────────────
export async function xayDungNguCanhRAG(
  query: string
): Promise<{ nguCanh: string; nguon: KetQuaTimKiem[] }> {
  const ketQua = await timKiemSemantic(query, 5, 0.4)

  if (ketQua.length === 0) {
    return { nguCanh: '', nguon: [] }
  }

  // Nhóm chunks theo tài liệu
  const tuLieu: Record<string, { tieuDe: string; soHieu: string | null; chunks: string[] }> = {}
  for (const kq of ketQua) {
    if (!tuLieu[kq.taiLieuId]) {
      tuLieu[kq.taiLieuId] = { tieuDe: kq.tieuDe, soHieu: kq.soHieu, chunks: [] }
    }
    tuLieu[kq.taiLieuId]!.chunks.push(kq.noiDung)
  }

  // Xây dựng context string
  const parts: string[] = ['TAI_LIEU_LIEN_QUAN:']
  for (const [, doc] of Object.entries(tuLieu)) {
    const ref = doc.soHieu ? `${doc.tieuDe} (${doc.soHieu})` : doc.tieuDe
    parts.push(`\n--- ${ref} ---`)
    parts.push(doc.chunks.join('\n...\n'))
  }

  return {
    nguCanh: parts.join('\n'),
    nguon:   ketQua,
  }
}

// ── Kiểm tra trạng thái nhúng của tài liệu ────────────────────
export interface TrangThaiNhung {
  taiLieuId:   string
  daNhung:     boolean
  soChunk:     number
  lanCuoi:     string | null
}

export async function layTrangThaiNhung(
  taiLieuIds: string[]
): Promise<Record<string, TrangThaiNhung>> {
  try {
    const svc = createServiceClient()
    const { data } = await svc
      .from('tai_lieu_chunks')
      .select('tai_lieu_id, da_nhung')
      .in('tai_lieu_id', taiLieuIds)
      .eq('da_nhung', true)

    const { data: logs } = await svc
      .from('rag_lich_su')
      .select('tai_lieu_id, so_chunk, thoi_gian, trang_thai')
      .in('tai_lieu_id', taiLieuIds)
      .eq('trang_thai', 'THANH_CONG')
      .order('thoi_gian', { ascending: false })

    const result: Record<string, TrangThaiNhung> = {}
    const chunkCounts: Record<string, number> = {}

    for (const row of (data ?? []) as Array<{ tai_lieu_id: string; da_nhung: boolean }>) {
      chunkCounts[row.tai_lieu_id] = (chunkCounts[row.tai_lieu_id] ?? 0) + 1
    }

    const logMap: Record<string, { so_chunk: number; thoi_gian: string }> = {}
    for (const log of (logs ?? []) as Array<{ tai_lieu_id: string; so_chunk: number; thoi_gian: string }>) {
      if (!logMap[log.tai_lieu_id]) logMap[log.tai_lieu_id] = log
    }

    for (const id of taiLieuIds) {
      const so = chunkCounts[id] ?? 0
      result[id] = {
        taiLieuId: id,
        daNhung:   so > 0,
        soChunk:   so,
        lanCuoi:   logMap[id]?.thoi_gian ?? null,
      }
    }

    return result
  } catch { return {} }
}
