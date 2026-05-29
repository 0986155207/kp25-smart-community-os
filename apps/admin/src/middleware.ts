import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: CookieOptions }>) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // QUAN TRỌNG: Không viết bất kỳ logic nào giữa createServerClient và getUser()
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const isLoginPage   = pathname === '/login'
  const isPublicRoute =
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname === '/manifest.webmanifest' ||
    pathname === '/firebase-messaging-sw.js' ||
    pathname === '/sw.js' ||
    pathname === '/offline.html'

  // Chưa đăng nhập → chuyển sang /login (trừ các route public)
  if (!user && !isLoginPage && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url)
    // Lưu lại URL để redirect sau khi đăng nhập
    if (pathname !== '/') {
      loginUrl.searchParams.set('redirect', pathname)
    }
    return NextResponse.redirect(loginUrl)
  }

  // Đã đăng nhập mà vào /login → chuyển về dashboard
  if (user && isLoginPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return supabaseResponse
}

export const config = {
  /*
   * Bỏ qua:
   *  - _next/static  (static files)
   *  - _next/image   (image optimization)
   *  - favicon.ico
   *  - file có extension (png, svg, …)
   */
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|firebase-messaging-sw\\.js|sw\\.js|offline\\.html|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
