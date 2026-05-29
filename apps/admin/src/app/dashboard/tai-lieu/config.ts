import {
  ScrollText, FileCheck2, BookOpen, ClipboardList,
  BookMarked, FileText, Lightbulb, FolderOpen,
} from 'lucide-react'
import type { ElementType } from 'react'

export const LOAI_CFG: Record<string, {
  label:     string
  badge:     string
  bg:        string
  iconColor: string
  Icon:      ElementType
}> = {
  NGHI_QUYET: { label: 'Nghị quyết',  badge: 'badge-red',    bg: 'bg-red-50',     iconColor: 'text-red-600',     Icon: ScrollText },
  QUYET_DINH: { label: 'Quyết định',  badge: 'badge-orange', bg: 'bg-orange-50',  iconColor: 'text-orange-600',  Icon: FileCheck2 },
  THONG_BAO:  { label: 'Thông báo',   badge: 'badge-blue',   bg: 'bg-blue-50',    iconColor: 'text-blue-600',    Icon: BookOpen },
  BAO_CAO:    { label: 'Báo cáo',     badge: 'badge-purple', bg: 'bg-violet-50',  iconColor: 'text-violet-600',  Icon: ClipboardList },
  BIEN_BAN:   { label: 'Biên bản',    badge: 'badge-yellow', bg: 'bg-amber-50',   iconColor: 'text-amber-600',   Icon: BookMarked },
  QUY_CHE:    { label: 'Quy chế',     badge: 'badge-green',  bg: 'bg-emerald-50', iconColor: 'text-emerald-600', Icon: FileText },
  HUONG_DAN:  { label: 'Hướng dẫn',  badge: 'badge-teal',   bg: 'bg-teal-50',    iconColor: 'text-teal-600',    Icon: Lightbulb },
  KHAC:       { label: 'Khác',        badge: 'badge-gray',   bg: 'bg-slate-100',  iconColor: 'text-slate-500',   Icon: FolderOpen },
}
