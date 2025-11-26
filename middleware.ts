// middleware.ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "@/lib/auth"

// Public paths that don't require authentication
const publicPaths = [
  '/auth/signin',
  '/auth/signup', 
  '/auth/forgot-password',
  '/api/auth/',
  '/_next/',
  '/favicon.ico',
  '/public/'
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get("token")?.value

  // console.log(`🔐 Middleware: ${pathname}, Token: ${token ? 'EXISTS' : 'MISSING'}`)

  // Skip middleware for public paths
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Protect admin routes
  if (pathname.startsWith("/admin")) {
    if (!token) {
      // console.log('🚫 No token, redirecting to signin from admin')
      return NextResponse.redirect(new URL("/auth/signin", request.url))
    }

    try {
      const session = await verifyToken(token)
      if (!session || session.role !== "ADMIN") {
        // console.log('🚫 Invalid admin session, redirecting to home')
        return NextResponse.redirect(new URL("/", request.url))
      }
    } catch (error) {
      // console.log('🚫 Token verification failed, redirecting to signin')
      return NextResponse.redirect(new URL("/auth/signin", request.url))
    }
  }

  // Protect dashboard routes
  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      // console.log('🚫 No token, redirecting to signin from dashboard')
      return NextResponse.redirect(new URL("/auth/signin", request.url))
    }

    try {
      const session = await verifyToken(token)
      if (!session) {
        // console.log('🚫 Invalid session, redirecting to signin')
        return NextResponse.redirect(new URL("/auth/signin", request.url))
      }
    } catch (error) {
      // console.log('🚫 Token verification failed, redirecting to signin')
      return NextResponse.redirect(new URL("/auth/signin", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/admin/:path*", 
    "/dashboard/:path*",
  ],
}