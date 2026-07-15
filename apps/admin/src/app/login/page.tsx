import type { Metadata } from 'next'
import LoginForm from './LoginForm'
import { Shield } from 'lucide-react'
import { KHU_PHO } from '@/lib/khu-pho'
import LogoKhuPho from '@/components/layout/LogoKhuPho'

export const metadata: Metadata = { title: `Đăng nhập — ${KHU_PHO.ma} Admin` }

interface Props {
  searchParams: Promise<{ redirect?: string }>
}

export default async function LoginPage({ searchParams }: Props) {
  const { redirect } = await searchParams

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1E3A5F] via-[#1a3254] to-[#0f1f38] flex items-center justify-center p-4">

      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5" aria-hidden>
        <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-white blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-white blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">

        {/* Logo + Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-5">
            <LogoKhuPho
              boxClass="w-14 h-14 rounded-2xl shadow-lg shadow-red-900/30 flex items-center justify-center"
              bgClass="bg-[#8B1A1A]"
              textClass="text-xl"
              weightClass="font-black"
            />
          </div>
          <h1 className="text-2xl font-bold text-white leading-tight">
            {KHU_PHO.ma} Smart Community OS
          </h1>
          <p className="text-white/50 text-sm mt-1.5">
            Hệ thống điều hành {KHU_PHO.ten} · {KHU_PHO.phuong.replace(/^Phường\s+/, '')} · TP.HCM
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl shadow-black/20 p-8">

          {/* Card header */}
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-9 h-9 rounded-xl bg-[#1E3A5F]/10 flex items-center justify-center">
              <Shield size={18} className="text-[#1E3A5F]" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-base">Đăng nhập cán bộ</h2>
              <p className="text-xs text-slate-400">Dành riêng cho cán bộ khu phố</p>
            </div>
          </div>

          {/* Form */}
          <LoginForm redirect={redirect} />

          {/* Footer note */}
          <p className="text-center text-xs text-slate-400 mt-5">
            Quên mật khẩu? Liên hệ{' '}
            <span className="font-semibold text-slate-600">Bí thư chi bộ</span>
          </p>
        </div>

        {/* Bottom note */}
        <p className="text-center text-white/30 text-xs mt-6">
          © 2026 {KHU_PHO.ten} · {KHU_PHO.phuong} · TP.HCM
        </p>
      </div>
    </div>
  )
}
