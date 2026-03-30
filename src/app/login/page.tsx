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
  const urlError =
    typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('error') || '' : ''
  const shownError = error || urlError

  // Redirect based on role after successful login
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role) {
      if (session.user.role === 'admin') {
        router.push('/admin')
      } else if (session.user.role === 'member') {
        router.push('/dashboard')
      } else {
        router.push('/')
      }
    }
  }, [status, session, router])

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true)
    setError('')
    setMessage('')
    try {
      await signIn('google', { callbackUrl: '/dashboard' })
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
      setMessage('Email hoặc mật khẩu không đúng.')
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
    Callback: 'Lỗi callback từ Google. Hãy kiểm tra NEXTAUTH_URL và Google Redirect URI đã khớp domain hiện tại.',
    OAuthCallback: 'Google OAuth callback failed, vui lòng kiểm tra Client ID/Secret và redirect URI. (OAuthCallback)',
    Configuration: 'Cấu hình NextAuth có lỗi, kiểm tra biến môi trường.',
    AccessDenied: 'Đã hủy quyền đăng nhập.',
    OAuthSignin: 'Không thể kết nối với Google, vui lòng thử lại.',
    OAuthAccountNotLinked: 'Email này đã được liên kết với tài khoản khác.',
    EmailInUse: 'Email này đã được đăng ký. Vui lòng sử dụng email khác hoặc đăng nhập với tài khoản hiện tại.',
    '': ''
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>

        {shownError && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 rounded">
            <p className="text-red-700 text-sm">
              Lỗi: {errorMessages[shownError] || shownError}
            </p>
            <button
              onClick={handleClearError}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Thử lại
            </button>
          </div>
        )}

        {message && (
          <p className="text-left text-red-600 mb-4 text-sm">{message}</p>
        )}

        <button
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
          className={`w-full p-2 rounded mb-4 text-white font-medium transition ${
            googleLoading
              ? 'bg-amber-300 cursor-not-allowed'
              : 'bg-amber-500 hover:bg-amber-600 cursor-pointer'
          }`}
        >
          {googleLoading ? 'Đang kết nối...' : 'Sign in with Google'}
        </button>

        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">hoặc</span>
          </div>
        </div>

        <form onSubmit={handleCredentialsSignIn} className="space-y-3">
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
          Chưa có tài khoản?{' '}
          <Link href="/register" className="font-medium text-amber-700 hover:text-amber-800">
            Đăng ký ở đây
          </Link>
        </p>
      </div>
    </div>
  )
}

