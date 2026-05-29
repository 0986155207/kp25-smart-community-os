'use client'

import { useActionState, useEffect, useRef } from 'react'
import { dangNhap } from '@/lib/auth'
import { Eye, EyeOff, LogIn, AlertCircle, Loader2 } from 'lucide-react'
import { useState } from 'react'

const initialState = { error: undefined as string | undefined }

export default function LoginForm({ redirect }: { redirect?: string }) {
  const [state, action, pending] = useActionState(dangNhap, null)
  const [showPass, setShowPass] = useState(false)
  const emailRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    emailRef.current?.focus()
  }, [])

  return (
    <form action={action} className="space-y-4">
      {/* redirect hidden field */}
      {redirect && <input type="hidden" name="redirect" value={redirect} />}

      {/* Error banner */}
      {state?.error && (
        <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertCircle size={16} className="shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      {/* Email */}
      <div className="space-y-1.5">
        <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
          Email công vụ
        </label>
        <input
          ref={emailRef}
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="canbo@kp25.vn"
          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm
                     focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]/20 focus:border-[#8B1A1A]
                     placeholder:text-slate-400 transition-colors"
          disabled={pending}
        />
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
          Mật khẩu
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPass ? 'text' : 'password'}
            autoComplete="current-password"
            required
            placeholder="••••••••"
            className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm
                       focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]/20 focus:border-[#8B1A1A]
                       placeholder:text-slate-400 transition-colors"
            disabled={pending}
          />
          <button
            type="button"
            onClick={() => setShowPass(p => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
            tabIndex={-1}
          >
            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={pending}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl
                   bg-[#8B1A1A] hover:bg-[#7a1616] active:scale-[0.99]
                   text-white font-semibold text-sm transition-all
                   disabled:opacity-60 disabled:cursor-not-allowed mt-2"
      >
        {pending ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Đang đăng nhập...
          </>
        ) : (
          <>
            <LogIn size={16} />
            Đăng nhập
          </>
        )}
      </button>
    </form>
  )
}
