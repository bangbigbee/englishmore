'use client'

import { signIn, signOut, useSession } from 'next-auth/react'
import Link from 'next/link'

function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" role="img">
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.2 1.2-.9 2.2-1.9 2.9l3.1 2.4c1.8-1.7 2.8-4.1 2.8-6.9 0-.7-.1-1.5-.2-2.2H12z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.5 0 4.6-.8 6.2-2.2l-3.1-2.4c-.9.6-2 .9-3.1.9-2.4 0-4.4-1.6-5.2-3.8l-3.2 2.5C5.1 20 8.3 22 12 22z"
      />
      <path
        fill="#FBBC05"
        d="M6.8 14.5c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2L3.6 8C2.9 9.4 2.5 10.9 2.5 12.5s.4 3.1 1.1 4.5l3.2-2.5z"
      />
      <path
        fill="#4285F4"
        d="M12 6.7c1.4 0 2.7.5 3.7 1.4l2.8-2.8C16.6 3.6 14.5 3 12 3 8.3 3 5.1 5 3.6 8l3.2 2.5c.8-2.2 2.8-3.8 5.2-3.8z"
      />
    </svg>
  )
}

export default function TopNav() {
  const { data: session, status } = useSession()

  return (
    <header className="bg-slate-900 text-white px-6 py-3 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-4xl font-extrabold tracking-tight">
            <span className="text-[#14532d]">English</span>
            <span className="text-amber-500">More</span>
          </span>
          <span className="text-sm text-slate-300">Learn smarter, faster</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="px-4 py-2 bg-[#14532d] hover:bg-[#166534] text-white rounded transition"
          >
            Home
          </Link>

          {session ? (
            <>
              <Link
                href="/dashboard"
                className="px-4 py-2 border border-amber-300 bg-amber-50 text-amber-700 rounded transition hover:bg-amber-100"
              >
                Dashboard
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="px-4 py-2 border border-slate-300 bg-white text-slate-700 rounded transition hover:bg-slate-100"
              >
                Sign out
              </button>
            </>
          ) : (
            <button
              onClick={() => signIn('google', { callbackUrl: '/' })}
              disabled={status === 'loading'}
              className="inline-flex items-center gap-2 px-4 py-2 border border-amber-300 bg-amber-50 text-amber-700 rounded transition hover:bg-amber-100 disabled:opacity-70"
            >
              <GoogleIcon />
              Sign in
            </button>
          )}
        </div>
      </div>
    </header>
  )
}

