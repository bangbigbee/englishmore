'use client'

import { usePathname } from 'next/navigation'
import React from 'react'

export default function MainWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isFullWidth = pathname?.startsWith('/admin') || pathname?.startsWith('/toeic-progress') || pathname?.includes('/take') || pathname?.includes('/toeic-practice/grammar/') || pathname === '/toeic-practice' || pathname === '/'

  return (
    <main className={`flex-1 w-full ${isFullWidth ? '' : 'max-w-7xl mx-auto px-4 py-6'}`}>
      {children}
    </main>
  )
}
