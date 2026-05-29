import type { Metadata } from 'next'
import HoDanForm from '../HoDanForm'

export const metadata: Metadata = { title: 'Thêm hộ dân mới' }

export default function ThemHoDanPage() {
  return <HoDanForm mode="create" />
}
