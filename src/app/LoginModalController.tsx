'use client'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { Suspense, useCallback, useMemo } from 'react'
import LoginModal from '@/components/LoginModal'

function LoginModalControllerInner() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()

  const isOpen = searchParams.get('login') === 'true'
  const allowGuest = searchParams.get('allowGuest') === 'true'
  const callbackUrl = searchParams.get('callbackUrl') || pathname

  const handleClose = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('login')
    params.delete('allowGuest')
    params.delete('callbackUrl')
    
    const query = params.toString()
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }, [router, pathname, searchParams])

  const handleGuest = useCallback(() => {
    handleClose()
  }, [handleClose])

  return (
    <LoginModal
      isOpen={isOpen}
      onClose={handleClose}
      callbackUrl={callbackUrl}
      allowGuest={allowGuest}
      onGuest={handleGuest}
    />
  )
}

export default function LoginModalController() {
  return (
    <Suspense fallback={null}>
      <LoginModalControllerInner />
    </Suspense>
  )
}
