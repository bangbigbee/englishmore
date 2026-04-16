import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  // Get hostname of request (e.g. localhost:3000, toeicmore.com)
  const hostname = req.headers.get('host') || ''
  const { pathname, search } = req.nextUrl
  
  // If the user visits toeicmore.com or www.toeicmore.com
  const isToeicDomain = hostname.includes('toeicmore.com')

  // Paths that exclusively belong to EnglishMore
  const englishMoreOnlyPaths = ['/dashboard', '/courses', '/my-homework', '/lecture-notes']
  
  // Paths that exclusively belong to ToeicMore
  const toeicMoreOnlyPaths = ['/toeic-practice', '/toeic-progress']

  if (isToeicDomain) {
    if (pathname === '/') {
      return NextResponse.rewrite(new URL(`/toeic-practice${search}`, req.url))
    }

    // 1. Redirect if they try to access EnglishMore pages on toeicmore.com
    if (englishMoreOnlyPaths.some(p => pathname.startsWith(p))) {
      const url = req.nextUrl.clone()
      url.hostname = 'englishmore.bigbee.ltd'
      url.protocol = 'https:'
      url.port = ''
      return NextResponse.redirect(url)
    }

    // Optional: Keep URL clean. If they hit /toeic-practice directly, redirect to /
    if (pathname === '/toeic-practice') {
      const url = req.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
    
  } else {
    // We are on EnglishMore domain or Localhost
    // 2. Redirect if they try to access ToeicMore pages on EnglishMore (prod only to allow local testing)
    if (process.env.NODE_ENV === 'production') {
      if (toeicMoreOnlyPaths.some(p => pathname.startsWith(p))) {
        const url = req.nextUrl.clone()
        url.hostname = 'toeicmore.com'
        url.protocol = 'https:'
        url.port = ''
        // Map /toeic-practice to root for clean URL
        if (pathname === '/toeic-practice') {
          url.pathname = '/'
        }
        return NextResponse.redirect(url)
      }
    }
  }

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
