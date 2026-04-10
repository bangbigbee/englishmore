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
  const subtitle = searchParams.get('subtitle') || ''

  const handleClose = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('login')
    params.delete('allowGuest')
    params.delete('callbackUrl')
    params.delete('subtitle')
    
    const query = params.toString()
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }, [router, pathname, searchParams])

  const handleGuest = useCallback(() => {
    // If we have a different target, navigate there directly.
    // Navigating to a new path will naturally clear the search params from the old path.
    if (callbackUrl && callbackUrl !== pathname) {
      router.push(callbackUrl)
    } else {
      // If no target or same target, just close the modal.
      handleClose()
    }
  }, [handleClose, callbackUrl, pathname, router])

  return (
    <LoginModal
      isOpen={isOpen}
      onClose={handleClose}
      callbackUrl={callbackUrl}
      allowGuest={allowGuest}
      onGuest={handleGuest}
      subtitle={subtitle}
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
