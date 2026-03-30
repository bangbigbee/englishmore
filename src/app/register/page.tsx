'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Register() {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setSuccess('')
    setSubmitting(true)

    try {
      if (password !== confirmPassword) {
        setError('Xác nhận mật khẩu không khớp')
        setSubmitting(false)
        return
      }

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, phone, email, password, confirmPassword })
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
        <h2 className="text-2xl font-bold mb-4 text-center">Register</h2>

        {error && <p className="text-left text-red-600 mb-3 text-sm">{error}</p>}
        {success && <p className="text-left text-[#14532d] mb-3 text-sm">{success}</p>}

        <form onSubmit={handleRegister} className="space-y-3">
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
            {submitting ? 'Creating...' : 'Create account'}
          </button>
        </form>

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
