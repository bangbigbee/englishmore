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

function LogoutIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
      <polyline points="16 17 21 12 16 7"></polyline>
      <line x1="21" y1="12" x2="9" y2="12"></line>
    </svg>
  )
}

function UserIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
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
          {session ? (
            <>
              <Link
                href="/user/profile"
                className="group relative p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
                title="Profile"
              >
                <UserIcon />
                <span className="pointer-events-none absolute right-0 top-full mt-2 w-max rounded bg-slate-800 px-2 py-1 text-xs text-slate-300 opacity-0 transition group-hover:opacity-100">
                  Profile
                </span>
              </Link>
              <div className="group relative">
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
                  title="Sign out"
                >
                  <LogoutIcon />
                </button>
                <span className="pointer-events-none absolute right-0 top-full mt-2 w-max rounded bg-slate-800 px-2 py-1 text-xs text-slate-300 opacity-0 transition group-hover:opacity-100">
                  Sign out
                </span>
              </div>
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

