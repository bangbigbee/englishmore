'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function LoginRedirect() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const callbackUrl = searchParams.get('callbackUrl') || '/'
    const params = new URLSearchParams()
    params.set('login', 'true')
    params.set('callbackUrl', callbackUrl)
    
    // Redirect to home with login modal open
    router.replace(`/?${params.toString()}`)
  }, [router, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <div className="h-12 w-12 rounded-full border-4 border-[#581c87] border-t-transparent animate-spin" />
        <p className="text-slate-500 font-medium">Redirecting to login...</p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginRedirect />
    </Suspense>
  )
}

