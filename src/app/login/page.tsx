'use client'

import { signIn, useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Login() {
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const router = useRouter()
  const { data: session, status } = useSession()
  const isZaloInAppBrowser = typeof navigator !== 'undefined' && /zalo/i.test(navigator.userAgent || '')
  const urlError =
    typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('error') || '' : ''
  const shownError = error || urlError

  // Redirect based on role after successful login
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role) {
      if (session.user.role === 'admin') {
        router.push('/admin')
      } else {
        router.push('/')
      }
    }
  }, [status, session, router])

  const handleGoogleSignIn = async () => {
    if (isZaloInAppBrowser) {
      setError('DisallowedUserAgentZalo')
      setMessage('')
      return
    }

    setGoogleLoading(true)
    setError('')
    setMessage('')
    try {
      await signIn('google', { callbackUrl: '/' })
    } catch {
      setError('Google sign in failed')
      setGoogleLoading(false)
    }
  }

  const handleCredentialsSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')

    const result = await signIn('credentials', {
      redirect: false,
      email,
      password
    })

    setLoading(false)

    if (!result?.ok) {
      setMessage('Incorrect email or password.')
      return
    }
  }

  const handleClearError = () => {
    setError('')
    // Clear error from URL
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }

  const errorMessages: Record<string, string> = {
    Callback: 'Google callback error. Check NEXTAUTH_URL and make sure the Google redirect URI matches the current domain.',
    OAuthCallback: 'Google OAuth callback failed. Please verify the client ID, client secret, and redirect URI. (OAuthCallback)',
    Configuration: 'There is a NextAuth configuration error. Please check the environment variables.',
    AccessDenied: 'Sign-in permission was denied.',
    OAuthSignin: 'Could not connect to Google. Please try again.',
    OAuthAccountNotLinked: 'This email is already linked to another account.',
    EmailInUse: 'This email is already registered. Please use another email or sign in with your existing account.',
    DisallowedUserAgentZalo: 'Google sign-in is blocked inside the Zalo in-app browser. Please open this website in Safari or Chrome to continue.',
    '': ''
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-8 sm:px-0">
      <div className="bg-white p-6 sm:p-8 rounded shadow-md w-full max-w-sm md:w-96">
        <h2 className="text-xl sm:text-2xl font-bold mb-6 text-center">Login</h2>

        {shownError && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 rounded">
            <p className="text-red-700 text-sm">
              Error: {errorMessages[shownError] || shownError}
            </p>
            <button
              onClick={handleClearError}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Try again
            </button>
          </div>
        )}

        {message && (
          <p className="text-left text-red-600 mb-4 text-sm">{message}</p>
        )}

        <button
          onClick={handleGoogleSignIn}
          disabled={googleLoading || isZaloInAppBrowser}
          className={`w-full p-2 rounded mb-4 text-white font-medium transition ${
            googleLoading || isZaloInAppBrowser
              ? 'bg-amber-300 cursor-not-allowed'
              : 'bg-amber-500 hover:bg-amber-600 cursor-pointer'
          }`}
        >
          {googleLoading ? 'Connecting...' : 'Sign in with Google'}
        </button>

        {isZaloInAppBrowser && (
          <p className="text-left text-xs text-amber-700 mb-4">
            You are opening this page inside the Zalo browser. Please open it in an external browser to sign in with Google.
          </p>
        )}

        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">or</span>
          </div>
        </div>

        <form onSubmit={handleCredentialsSignIn} className="space-y-2 sm:space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              className="mt-1 block w-full rounded border border-slate-300 p-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Password</label>
            <input
              type="password"
              className="mt-1 block w-full rounded border border-slate-300 p-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-slate-800 text-white p-2 rounded hover:bg-slate-900 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign in with Email'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-500">
          Don&apos;t have an account yet?{' '}
          <Link href="/register" className="font-medium text-amber-700 hover:text-amber-800">
            Register here
          </Link>
        </p>
      </div>
    </div>
  )
}

