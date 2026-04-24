'use client'

import Link from 'next/link'
import { signIn } from 'next-auth/react'

export default function Register() {
  const isZaloInAppBrowser = typeof navigator !== 'undefined' && /zalo/i.test(navigator.userAgent || '')

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-8 sm:px-0">
      <div className="bg-white p-8 sm:p-10 rounded-xl shadow-lg w-full max-w-md md:w-120">
        <h2 className="text-2xl sm:text-3xl font-bold mb-7 text-center">MEMBER REGISTRATION</h2>

        <button
          type="button"
          onClick={() => {
            if (isZaloInAppBrowser) return
            signIn('google', { callbackUrl: '/' })
          }}
          disabled={isZaloInAppBrowser}
          className="w-full flex items-center justify-center gap-3 border-2 border-[#581c87] rounded-md p-3 hover:bg-slate-50 transition-colors mb-5 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.6 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16 18.9 13 24 13c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 16.2 4 9.4 8.3 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 35.3 26.8 36 24 36c-5.3 0-9.6-3.1-11.3-7.5l-6.6 4.9C9.5 39.8 16.2 44 24 44z"/>
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.9 2.4-2.5 4.4-4.6 5.8l6.2 5.2C36.9 37.3 44 32 44 24c0-1.2-.1-2.4-.4-3.5z"/>
          </svg>
          <span className="text-base font-semibold text-slate-700">Continue with Google</span>
        </button>

        {isZaloInAppBrowser && (
          <div className="mb-4 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-base text-amber-800">
            Google sign-in is blocked inside the Zalo browser (403 disallowed_useragent). Please open this link in Safari or Chrome and try again.
          </div>
        )}

        <p className="text-center text-base text-slate-500 mb-4">
          Registration currently supports Google sign-in only.
        </p>

        <p className="mt-4 text-center text-sm sm:text-base text-slate-500">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-[#581c87] hover:text-[#6b21a8]">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}


