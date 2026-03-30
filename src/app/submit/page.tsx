'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function Submit() {
  const { data: session } = useSession()
  const [redirecting, setRedirecting] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (!session) {
      router.push('/login')
      return
    }

    router.replace('/dashboard?homework=1')
    setRedirecting(false)
  }, [session, router])

  if (!session) return null

  if (redirecting) {
    return <div className="min-h-screen flex items-center justify-center">Đang tải...</div>
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <p className="text-gray-600">Đang chuyển đến Dashboard...</p>
    </div>
  )
}
