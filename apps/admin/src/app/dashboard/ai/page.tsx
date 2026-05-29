import type { Metadata } from 'next'
import AIChatClient from './AIChatClient'

export const metadata: Metadata = { title: 'Trợ lý AI — KP25' }

export default function AIPage() {
  return (
    // Chiếm toàn bộ chiều cao còn lại của layout
    <div className="h-full -m-6 flex flex-col bg-slate-50/50">
      <AIChatClient />
    </div>
  )
}
