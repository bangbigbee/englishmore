import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  // Get hostname of request (e.g. localhost:3000, toeicmore.com)
  const hostname = req.headers.get('host') || ''
  const { pathname, search } = req.nextUrl
  
  // If the user visits toeicmore.com or www.toeicmore.com
  if (hostname.includes('toeicmore.com')) {
    
    // 1. Rewrite root domain to /toeic-practice
    // This makes toeicmore.com load the Toeic Practice page directly 
    // while keeping the URL clean as toeicmore.com/
    if (pathname === '/') {
      return NextResponse.rewrite(new URL(`/toeic-practice${search}`, req.url))
    }

    // 2. You can add more rewrites here. 
    // E.g., block access to englishmore specific pages if you want strict separation:
    // if (pathname.startsWith('/lecture-notes') || pathname.startsWith('/courses')) {
    //   return NextResponse.redirect(new URL('/', req.url))
    // }
  }

  // Pass through all other requests
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all paths except structural static files
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
