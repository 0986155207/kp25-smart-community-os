import { KHU_PHO } from '@/lib/khu-pho'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { layTrangThaiNhung } from '@/lib/rag'
import RagClient from './RagClient'
import type { TaiLieu } from '../../tai-lieu/actions'

export const metadata: Metadata = { title: `Nhúng văn bản RAG — ${KHU_PHO.ma} AI` }
export const revalidate = 0

async function getData() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('tai_lieu')
    .select('id, tieu_de, mo_ta, loai, so_hieu, nam_ban_hanh, created_at')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(100)

  const docs = (data ?? []) as TaiLieu[]
  const ids  = docs.map(d => d.id)
  const trangThai = ids.length > 0 ? await layTrangThaiNhung(ids) : {}

  return { docs, trangThai }
}

export default async function RagPage() {
  const { docs, trangThai } = await getData()
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Nhúng văn bản AI (RAG)</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Nhúng tài liệu hành chính vào vector database để AI tìm kiếm ngữ nghĩa
        </p>
      </div>
      <RagClient docs={docs} trangThai={trangThai} />
    </div>
  )
}
