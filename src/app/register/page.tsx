'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn } from 'next-auth/react'

export default function Register() {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // OTP step
  const [step, setStep] = useState<1 | 2>(1)
  const [otp, setOtp] = useState('')
  const [resendCountdown, setResendCountdown] = useState(0)
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const router = useRouter()

  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current)
    }
  }, [])

  function startResendCountdown() {
    setResendCountdown(60)
    countdownRef.current = setInterval(() => {
      setResendCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current!)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleSendOtp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      if (password !== confirmPassword) {
        setError('Xác nhận mật khẩu không khớp')
        setSubmitting(false)
        return
      }

      const res = await fetch('/api/auth/register/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email, password, confirmPassword }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Gửi OTP thất bại')
      } else {
        setStep(2)
        setOtp('')
        startResendCountdown()
      }
    } catch {
      setError('Lỗi máy chủ, thử lại sau.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleResendOtp = async () => {
    if (resendCountdown > 0) return
    setError('')
    setSubmitting(true)
    try {
      const res = await fetch('/api/auth/register/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email, password, confirmPassword }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Gửi lại OTP thất bại')
      } else {
        setOtp('')
        startResendCountdown()
      }
    } catch {
      setError('Lỗi máy chủ, thử lại sau.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleVerifyOtp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email, password, confirmPassword, otp }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Đăng ký thất bại')
      } else {
        setSuccess('Đăng ký thành công! Đang chuyển đến trang chủ...')
        setTimeout(() => router.push('/'), 1200)
      }
    } catch {
      setError('Lỗi máy chủ, thử lại sau.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>

        {step === 1 && (
          <>
            <button
              type="button"
              onClick={() => signIn('google', { callbackUrl: '/' })}
              className="w-full flex items-center justify-center gap-3 border border-slate-300 rounded p-2 hover:bg-slate-50 transition-colors mb-4"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
                <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.6 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z"/>
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16 18.9 13 24 13c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 16.2 4 9.4 8.3 6.3 14.7z"/>
                <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 35.3 26.8 36 24 36c-5.3 0-9.6-3.1-11.3-7.5l-6.6 4.9C9.5 39.8 16.2 44 24 44z"/>
                <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.9 2.4-2.5 4.4-4.6 5.8l6.2 5.2C36.9 37.3 44 32 44 24c0-1.2-.1-2.4-.4-3.5z"/>
              </svg>
              <span className="text-sm font-medium text-slate-700">Continue with Google</span>
            </button>

            <div className="flex items-center gap-3 mb-4">
              <hr className="flex-1 border-slate-200" />
              <span className="text-xs text-slate-400">hoặc</span>
              <hr className="flex-1 border-slate-200" />
            </div>

            {error && <p className="text-left text-red-600 mb-3 text-sm">{error}</p>}

            <form onSubmit={handleSendOtp} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700">Họ tên</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded border border-slate-300 p-2"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Số điện thoại</label>
                <input
                  type="tel"
                  className="mt-1 block w-full rounded border border-slate-300 p-2"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ví dụ: 0934567890"
                  required
                />
              </div>
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
                  minLength={6}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Xác nhận Password</label>
                <input
                  type="password"
                  className="mt-1 block w-full rounded border border-slate-300 p-2"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={6}
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#14532d] text-white p-2 rounded hover:bg-[#166534]"
                disabled={submitting}
              >
                {submitting ? 'Đang gửi...' : 'Bắt đầu'}
              </button>
            </form>
          </>
        )}

        {step === 2 && (
          <>
            {error && <p className="text-left text-red-600 mb-3 text-sm">{error}</p>}
            {success && <p className="text-left text-[#14532d] mb-3 text-sm">{success}</p>}

            <p className="text-sm text-slate-600 mb-4 text-center">
              Chúng tôi đã gửi mã OTP (6 chữ số) đến<br />
              <span className="font-semibold text-slate-800">{email}</span>
            </p>

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Mã OTP</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  className="block w-full rounded border border-slate-300 p-2 text-center text-2xl tracking-widest font-bold"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="______"
                  required
                  autoFocus
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#14532d] text-white p-2 rounded hover:bg-[#166534] disabled:opacity-60"
                disabled={submitting || otp.length < 6}
              >
                {submitting ? 'Đang xác nhận...' : 'Xác nhận & Tạo tài khoản'}
              </button>
            </form>

            <div className="mt-3 text-center">
              {resendCountdown > 0 ? (
                <p className="text-sm text-slate-400">Gửi lại sau {resendCountdown}s</p>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={submitting}
                  className="text-sm text-[#14532d] hover:underline disabled:opacity-50"
                >
                  Gửi lại OTP
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => { setStep(1); setError('') }}
              className="mt-2 w-full text-sm text-slate-500 hover:underline"
            >
              ← Quay lại chỉnh sửa thông tin
            </button>
          </>
        )}

        <p className="mt-4 text-center text-sm text-slate-500">
          Đã có tài khoản?{' '}
          <Link href="/login" className="font-medium text-[#14532d] hover:text-[#166534]">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  )
}


