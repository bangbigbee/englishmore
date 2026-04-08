'use client'

import { signIn, useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'

const ERROR_MESSAGES: Record<string, string> = {
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
      const callbackUrl = typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search).get('callbackUrl') || '/'
        : '/'
      await signIn('google', { callbackUrl })
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

  useEffect(() => {
    if (shownError) {
      toast.error(ERROR_MESSAGES[shownError] || shownError)
    }
  }, [shownError])

  useEffect(() => {
    if (message) {
      toast.error(message)
    }
  }, [message])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-8 sm:px-0">
      <div className="bg-white p-6 sm:p-8 rounded shadow-md w-full max-w-sm md:w-96">
        <h2 className="text-xl sm:text-2xl font-bold mb-6 text-center">Login</h2>
        <button
          onClick={handleGoogleSignIn}
          disabled={googleLoading || isZaloInAppBrowser}
          className={`w-full p-2 rounded mb-4 text-white font-medium transition ${
            googleLoading || isZaloInAppBrowser
              ? 'bg-amber-300 cursor-not-allowed'
              : 'bg-amber-500 hover:bg-amber-600 cursor-pointer'
          }`}
        >
          {googleLoading ? 'Đang kết nối...' : 'Đăng nhập bằng Google'}
        </button>
        {isZaloInAppBrowser && (
          <p className="text-left text-xs text-amber-700 mb-4">
            Bạn đang mở trang này trong trình duyệt Zalo. Vui lòng mở bằng Chrome hoặc Safari để đăng nhập bằng Google.
          </p>
        )}
      </div>
    </div>
  )
}

