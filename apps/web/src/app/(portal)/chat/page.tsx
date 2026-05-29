import type { Metadata } from 'next'
import ChatInterface from '@/components/chat/ChatInterface'
import { Sparkles } from 'lucide-react'

export const metadata: Metadata = {
  title: 'AI Trợ lý',
  description: 'Trò chuyện với AI Trợ lý Khu phố 25 - Hỗ trợ thông tin hành chính 24/7',
}

export default function ChatPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 text-[#8B1A1A] font-semibold text-sm mb-3">
          <Sparkles size={16} />
          Powered by Gemini 2.5 Flash
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">AI Trợ lý Khu phố 25</h1>
        <p className="text-slate-500">
          Hỏi đáp thông tin hành chính, hướng dẫn thủ tục, tiếp nhận phản ánh — 24/7
        </p>
      </div>

      <div className="h-[600px] md:h-[700px]">
        <ChatInterface />
      </div>
    </div>
  )
}
