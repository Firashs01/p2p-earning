import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get('app_auth')
  const isLoginPage = request.nextUrl.pathname === '/login'
  const password = process.env.APP_ACCESS_PASSWORD
  
  if (!authCookie || authCookie.value !== password) {
    if (!isLoginPage) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  } else {
    if (isLoginPage) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
