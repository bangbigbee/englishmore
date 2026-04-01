'use client'

import Image from 'next/image'
import { signIn, signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

interface HeaderEnrollment {
  id: string
  status: string
  course?: {
    title?: string
  }
}

function LogoutIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
      <polyline points="16 17 21 12 16 7"></polyline>
      <line x1="21" y1="12" x2="9" y2="12"></line>
    </svg>
  )
}

function UserIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  )
}

function BookIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
      <path d="M4 5.25A2.25 2.25 0 0 1 6.25 3h11.5A2.25 2.25 0 0 1 20 5.25v11.5A2.25 2.25 0 0 1 17.75 19H6.25A2.25 2.25 0 0 1 4 16.75V5.25Zm2 .25a.75.75 0 0 0-.75.75v10.5c0 .414.336.75.75.75H11V5.5H6Zm12 .75a.75.75 0 0 0-.75-.75H13v12h4.25a.75.75 0 0 0 .75-.75V6.25Z" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="M18 6 6 18"></path>
      <path d="m6 6 12 12"></path>
    </svg>
  )
}

export default function TopNav() {
  const { data: session, status } = useSession()
  const [enrolledCourseTitle, setEnrolledCourseTitle] = useState('')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false)

  const userInitial = (session?.user?.name || session?.user?.email || 'U').trim().charAt(0).toUpperCase()

  useEffect(() => {
    let active = true

    const fetchEnrollment = async () => {
      if (!session) {
        setEnrolledCourseTitle('')
        return
      }

      try {
        const res = await fetch('/api/user/enrollments')
        if (!res.ok) {
          if (active) setEnrolledCourseTitle('')
          return
        }

        const data = (await res.json()) as HeaderEnrollment[]
        const currentEnrollment = Array.isArray(data)
          ? data.find((item) => item.status === 'active') ?? data.find((item) => item.status === 'pending')
          : null

        if (active) {
          setEnrolledCourseTitle(currentEnrollment?.course?.title?.trim() || '')
        }
      } catch {
        if (active) setEnrolledCourseTitle('')
      }
    }

    fetchEnrollment()

    return () => {
      active = false
    }
  }, [session])

  useEffect(() => {
    setAvatarLoadFailed(false)
  }, [session?.user?.image])

  useEffect(() => {
    if (!isMenuOpen) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false)
      }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isMenuOpen])

  return (
    <header className="bg-transparent px-3 py-2.5 text-slate-900 sm:px-6 sm:py-3">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 sm:gap-4">
        <Link href="/" className="flex min-w-0 flex-1 items-center gap-2 leading-none sm:gap-3">
          <span className="shrink-0 text-[1.45rem] font-extrabold tracking-tight sm:text-[2.4rem]">
            <span className="text-[#14532d]">English</span>
            <span className="text-amber-500">More</span>
          </span>
          <span className="block max-w-20 truncate text-[10px] font-medium leading-tight text-slate-600 sm:max-w-none sm:truncate-none sm:text-sm">
            Speak your mind and more
          </span>
        </Link>

        <div className="shrink-0 flex items-center gap-1.5 sm:gap-3">
          {session ? (
            <>
              <button
                type="button"
                onClick={() => setIsMenuOpen(true)}
                className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-[#14532d]/20 bg-white text-[#14532d] shadow-sm transition hover:border-[#14532d]/35 hover:shadow-md"
                aria-label="Open profile menu"
              >
                {session.user?.image && !avatarLoadFailed ? (
                  <Image src={session.user.image} alt={session.user?.name || 'Profile'} fill className="object-cover" onError={() => setAvatarLoadFailed(true)} />
                ) : (
                  <span className="text-sm font-bold text-[#14532d]">{userInitial}</span>
                )}
              </button>
            </>
          ) : (
            <button
              onClick={() => signIn('google', { callbackUrl: '/' })}
              disabled={status === 'loading'}
              className="inline-flex items-center gap-2 rounded-md bg-[#184d0d] px-5 py-2 text-base font-semibold text-white transition hover:bg-[#1f6111] disabled:opacity-70"
            >
              Log in
              <BookIcon />
            </button>
          )}
        </div>
      </div>

      {session && (
        <div className={`fixed inset-0 z-50 transition ${isMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'}`} aria-hidden={!isMenuOpen}>
          <button
            type="button"
            onClick={() => setIsMenuOpen(false)}
            className={`absolute inset-0 bg-slate-950/30 transition-opacity ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`}
            aria-label="Close menu overlay"
          />

          <aside className={`absolute right-0 top-0 flex h-full w-[min(22rem,88vw)] flex-col border-l border-[#14532d]/15 bg-white shadow-2xl transition-transform duration-300 ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="border-b border-[#14532d]/10 bg-linear-to-b from-[#14532d]/8 to-white px-5 py-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#14532d]/15 bg-white text-[#14532d] shadow-sm">
                    {session.user?.image && !avatarLoadFailed ? (
                      <Image src={session.user.image} alt={session.user?.name || 'Profile'} fill className="object-cover" onError={() => setAvatarLoadFailed(true)} />
                    ) : (
                      <span className="text-base font-bold text-[#14532d]">{userInitial}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900">{session.user?.name || 'User'}</p>
                    <p className="truncate text-xs text-slate-500">{session.user?.email || ''}</p>
                    <p className="mt-1 truncate text-xs font-semibold text-[#14532d]">{enrolledCourseTitle || 'No active course yet'}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMenuOpen(false)}
                  className="shrink-0 rounded-full border border-slate-200 p-2 text-slate-500 transition hover:border-[#14532d]/20 hover:text-[#14532d]"
                  aria-label="Close profile menu"
                >
                  <CloseIcon />
                </button>
              </div>
            </div>

            <nav className="flex-1 px-3 py-4">
              <div className="space-y-1">
                <Link href="/user/profile" onClick={() => setIsMenuOpen(false)} className="flex items-center rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-[#14532d]/8 hover:text-[#14532d]">
                  Profile
                </Link>
                <Link href="/my-homework" onClick={() => setIsMenuOpen(false)} className="flex items-center rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-[#14532d]/8 hover:text-[#14532d]">
                  Homework
                </Link>
                <Link href="/dashboard" onClick={() => setIsMenuOpen(false)} className="flex items-center rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-[#14532d]/8 hover:text-[#14532d]">
                  Exercise
                </Link>
                <Link href="/lecture-notes" onClick={() => setIsMenuOpen(false)} className="flex items-center rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-[#14532d]/8 hover:text-[#14532d]">
                  Slides
                </Link>
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="flex w-full items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-amber-700 transition hover:bg-amber-50 hover:text-amber-800"
                >
                  <LogoutIcon />
                  Log out
                </button>
              </div>
            </nav>
          </aside>
        </div>
      )}
    </header>
  )
}

