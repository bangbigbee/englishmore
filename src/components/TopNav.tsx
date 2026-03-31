'use client'

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

export default function TopNav() {
  const { data: session, status } = useSession()
  const [enrolledCourseTitle, setEnrolledCourseTitle] = useState('')

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

  return (
    <header className="bg-transparent text-slate-900 px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <Link href="/" className="flex items-end gap-2 leading-none sm:gap-3">
          <span className="text-4xl font-extrabold tracking-tight">
            <span className="text-[#14532d]">English</span>
            <span className="text-amber-500">More</span>
          </span>
          <span className="text-xl font-extrabold uppercase tracking-tight text-slate-700 sm:text-2xl md:text-3xl">
            LEARN SMARTER &amp; FASTER
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {session ? (
            <>
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#166534] sm:gap-2 sm:text-xs">
                <span className="max-w-28 truncate rounded-md bg-[#14532d]/10 px-2 py-1 sm:max-w-35">
                  {session.user?.name || 'User'}
                </span>
                <span className="max-w-32 truncate rounded-md bg-[#14532d]/10 px-2 py-1 sm:max-w-55">
                  {enrolledCourseTitle || 'Chua tham gia khoa hoc'}
                </span>
              </div>
              <Link
                href="/user/profile"
                className="group relative p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                title="Profile"
              >
                <UserIcon />
                <span className="pointer-events-none absolute right-0 top-full mt-2 w-max rounded bg-slate-800 px-2 py-1 text-xs text-slate-100 opacity-0 transition group-hover:opacity-100">
                  Profile
                </span>
              </Link>
              <div className="group relative">
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                  title="Sign out"
                >
                  <LogoutIcon />
                </button>
                <span className="pointer-events-none absolute right-0 top-full mt-2 w-max rounded bg-slate-800 px-2 py-1 text-xs text-slate-100 opacity-0 transition group-hover:opacity-100">
                  Sign out
                </span>
              </div>
            </>
          ) : (
            <button
              onClick={() => signIn('google', { callbackUrl: '/' })}
              disabled={status === 'loading'}
              className="inline-flex items-center gap-2 rounded-md bg-[#184d0d] px-5 py-2 text-base font-semibold text-white transition hover:bg-[#1f6111] disabled:opacity-70"
            >
              Get Started
              <BookIcon />
            </button>
          )}
        </div>
      </div>
    </header>
  )
}

