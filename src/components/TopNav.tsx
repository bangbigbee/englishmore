'use client'

import Image from 'next/image'
import { signIn, signOut, useSession } from 'next-auth/react'
import { usePathname, useRouter } from 'next/navigation'
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

export default function TopNav({ isToeicDomain = false }: { isToeicDomain?: boolean }) {
  const { data: session, status } = useSession()
  const [enrolledCourseTitle, setEnrolledCourseTitle] = useState('')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

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
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 border-b border-[#14532d]/10 px-3 py-2.5 text-slate-900 sm:px-6 sm:py-3 transition-all">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 sm:gap-4 relative">
        <Link href="/" className="flex min-w-0 flex-1 items-center gap-2 leading-none sm:gap-3">
          <span className="shrink-0 text-[1.45rem] font-extrabold tracking-tight sm:text-[2.4rem]">
            {isToeicDomain ? (
                <>
                <span className="text-[#14532d]">Toeic</span>
                <span className="text-amber-500">More</span>
                </>
            ) : (
                <>
                <span className="text-[#14532d]">English</span>
                <span className="text-amber-500">More</span>
                </>
            )}
          </span>
          <span className="hidden sm:block max-w-20 truncate text-[10px] font-medium leading-tight text-slate-600 sm:max-w-none sm:truncate-none sm:text-sm">
            {isToeicDomain ? "Boost Your TOEIC Score & More" : "Speak your mind and more"}
          </span>
        </Link>

        <div className="shrink-0 flex items-center gap-1.5 sm:gap-3">
          {session ? (
            <>
              <div className="flex items-center gap-2">
                {session.user?.tier === 'PRO' && (
                  <span 
                    className="relative overflow-hidden flex items-center justify-center gap-0.5 bg-gradient-to-r from-[#FFD700] to-[#FDB931] text-[#594300] font-black uppercase tracking-widest px-1 h-4 rounded-[3px] text-[8px] shadow-sm cursor-default border border-[#FDB931]/50"
                    title={session.user.tierExpiresAt ? `Hết hạn: ${new Date(session.user.tierExpiresAt).toLocaleDateString('vi-VN')}` : 'Gói PRO'}
                  >
                    <svg className="w-2 h-2" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    PRO
                    <span className="absolute top-0 w-[150%] h-full bg-gradient-to-r from-transparent via-white/80 to-transparent -skew-x-12 pointer-events-none" style={{ animation: 'metallic-shine-sweep 4s ease-in-out infinite' }} />
                  </span>
                )}
                {session.user?.tier === 'ULTRA' && (
                  <span 
                    className="relative overflow-hidden flex items-center justify-center gap-0.5 bg-gradient-to-r from-purple-700 to-purple-950 text-white font-black uppercase tracking-widest px-1 h-4 rounded-[3px] text-[8px] shadow-sm cursor-default border border-purple-600/30"
                    title={session.user.tierExpiresAt ? `Hết hạn: ${new Date(session.user.tierExpiresAt).toLocaleDateString('vi-VN')}` : 'Gói ULTRA'}
                  >
                    <svg className="w-2 h-2" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                    ULTRA
                    <span className="absolute top-0 w-[150%] h-full bg-gradient-to-r from-transparent via-white/50 to-transparent -skew-x-12 pointer-events-none" style={{ animation: 'metallic-shine-sweep 4s ease-in-out infinite' }} />
                  </span>
                )}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsMenuOpen(true)}
                    className={`relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border-2 ${session.user?.tier === 'PRO' ? 'border-[#ea980c]' : session.user?.tier === 'ULTRA' ? 'border-purple-700' : 'border-[#14532d]'} bg-white text-[#14532d] shadow-sm transition hover:shadow-md cursor-pointer`}
                    aria-label="Open profile menu"
                  >
                    {session.user?.image && !avatarLoadFailed ? (
                      <Image src={session.user.image} alt={session.user?.name || 'Profile'} fill className="object-cover" onError={() => setAvatarLoadFailed(true)} />
                    ) : (
                      <span className="text-sm font-bold text-[#14532d]">{userInitial}</span>
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <button
              onClick={() => {
                const params = new URLSearchParams(window.location.search)
                params.set('login', 'true')
                params.set('subtitle', 'Đăng nhập để lưu và theo dõi tiến độ học tập')
                params.set('callbackUrl', pathname)
                router.push(`${pathname}?${params.toString()}`, { scroll: false })
              }}
              disabled={status === 'loading'}
              className="inline-flex items-center gap-2 rounded-md bg-[#14532d] px-5 py-2 text-base font-semibold text-white transition hover:bg-[#166534] shadow-sm hover:shadow-md disabled:opacity-70 cursor-pointer"
            >
              Log in
              <BookIcon />
            </button>
          )}
        </div>
      </div>

      {session && (
        <div className={`fixed inset-0 z-50 isolate transition ${isMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'}`} aria-hidden={!isMenuOpen}>
          <button
            type="button"
            onClick={() => setIsMenuOpen(false)}
            className={`absolute inset-0 z-0 bg-slate-950/35 transition-opacity ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`}
            aria-label="Close menu overlay"
          />

          <aside className={`absolute right-0 top-0 z-10 flex h-screen w-[min(22rem,88vw)] flex-col border-l border-amber-200 bg-[#fff9f2] shadow-2xl transition-transform duration-300 ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="border-b-[4px] border-amber-500 bg-[#14532d] px-5 py-6 shrink-0">
              <div className="flex items-start justify-between gap-3 relative">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex items-center gap-2">
                    {session.user?.tier === 'PRO' && (
                      <span 
                        className="relative overflow-hidden flex items-center justify-center gap-0.5 bg-gradient-to-r from-[#FFD700] to-[#FDB931] text-[#594300] font-black uppercase tracking-widest px-1 h-4 rounded-[3px] text-[8px] shadow-sm cursor-default border border-[#FDB931]/50"
                        title={session.user.tierExpiresAt ? `Hết hạn: ${new Date(session.user.tierExpiresAt).toLocaleDateString('vi-VN')}` : 'Gói PRO'}
                      >
                        <svg className="w-2 h-2" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                        PRO
                        <span className="absolute top-0 w-[150%] h-full bg-gradient-to-r from-transparent via-white/80 to-transparent -skew-x-12 pointer-events-none" style={{ animation: 'metallic-shine-sweep 4s ease-in-out infinite' }} />
                      </span>
                    )}
                    {session.user?.tier === 'ULTRA' && (
                      <span 
                        className="relative overflow-hidden flex items-center justify-center gap-0.5 bg-gradient-to-r from-purple-700 to-purple-950 text-white font-black uppercase tracking-widest px-1 h-4 rounded-[3px] text-[8px] shadow-sm cursor-default border border-purple-600/30"
                        title={session.user.tierExpiresAt ? `Hết hạn: ${new Date(session.user.tierExpiresAt).toLocaleDateString('vi-VN')}` : 'Gói ULTRA'}
                      >
                        <svg className="w-2 h-2" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                        ULTRA
                        <span className="absolute top-0 w-[150%] h-full bg-gradient-to-r from-transparent via-white/50 to-transparent -skew-x-12 pointer-events-none" style={{ animation: 'metallic-shine-sweep 4s ease-in-out infinite' }} />
                      </span>
                    )}
                    <div className="relative">
                      <div className={`relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 ${session.user?.tier === 'PRO' ? 'border-[#ea980c]' : session.user?.tier === 'ULTRA' ? 'border-purple-700' : 'border-white'} bg-white text-[#14532d] shadow-sm`}>
                        {session.user?.image && !avatarLoadFailed ? (
                          <Image src={session.user.image} alt={session.user?.name || 'Profile'} fill className="object-cover" onError={() => setAvatarLoadFailed(true)} />
                        ) : (
                          <span className="text-base font-bold text-[#14532d]">{userInitial}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-base font-bold text-white">{session.user?.name || 'User'}</p>
                    <p className="truncate text-xs text-green-100">{session.user?.email || ''}</p>
                    <p className="mt-1 truncate text-xs font-semibold text-[#ea980c]">{enrolledCourseTitle || 'Chưa vào khóa học'}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMenuOpen(false)}
                  className="shrink-0 rounded-full border border-white/20 p-2 text-white/70 transition hover:bg-[#ea980c] hover:border-[#ea980c] hover:text-white"
                  aria-label="Close profile menu"
                >
                  <CloseIcon />
                </button>
              </div>
            </div>

            <nav className="flex-1 overflow-y-auto p-4 space-y-1.5 custom-scrollbar">
              <div className="mb-3 text-[11px] font-bold uppercase tracking-widest text-[#14532d]/40 px-2">Menu Cá Nhân</div>
              
              <Link href="/user/profile" onClick={() => setIsMenuOpen(false)} className="group w-full flex items-center gap-3.5 px-3 py-3.5 rounded-2xl font-bold transition-all text-left text-slate-600 border border-transparent hover:bg-slate-50 hover:text-slate-900 cursor-pointer">
                <span className="w-[36px] h-[36px] shrink-0 rounded-[12px] flex items-center justify-center bg-slate-100/80 text-slate-500 transition-colors group-hover:bg-slate-200/80">
                  <UserIcon />
                </span>
                <span className="flex-1 truncate text-[15px]">Hồ Sơ Cá Nhân</span>
              </Link>
              
              <Link href="/toeic-progress" onClick={() => setIsMenuOpen(false)} className="group w-full flex items-center gap-3.5 px-3 py-3.5 rounded-2xl font-bold transition-all text-left text-slate-600 border border-transparent hover:bg-slate-50 hover:text-slate-900 cursor-pointer">
                <span className="w-[36px] h-[36px] shrink-0 rounded-[12px] flex items-center justify-center bg-slate-100/80 text-slate-500 transition-colors group-hover:bg-slate-200/80">
                  <svg className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                </span>
                <span className="flex-1 truncate text-[15px]">Tiến Độ Của Tôi</span>
              </Link>
              
              {!isToeicDomain && (
                <>
                  <Link href="/my-homework" onClick={() => setIsMenuOpen(false)} className="group w-full flex items-center gap-3.5 px-3 py-3.5 rounded-2xl font-bold transition-all text-left text-slate-600 border border-transparent hover:bg-slate-50 hover:text-slate-900 cursor-pointer">
                    <span className="w-[36px] h-[36px] shrink-0 rounded-[12px] flex items-center justify-center bg-slate-100/80 text-slate-500 transition-colors group-hover:bg-slate-200/80">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </span>
                    <span className="flex-1 truncate text-[15px]">Làm Bài Tập</span>
                  </Link>

                  <Link href="/dashboard" onClick={() => setIsMenuOpen(false)} className="group w-full flex items-center gap-3.5 px-3 py-3.5 rounded-2xl font-bold transition-all text-left text-slate-600 border border-transparent hover:bg-slate-50 hover:text-slate-900 cursor-pointer">
                    <span className="w-[36px] h-[36px] shrink-0 rounded-[12px] flex items-center justify-center bg-slate-100/80 text-slate-500 transition-colors group-hover:bg-slate-200/80">
                      <BookIcon />
                    </span>
                    <span className="flex-1 truncate text-[15px]">Bài Học Trên Lớp</span>
                  </Link>

                  <Link href="/lecture-notes" onClick={() => setIsMenuOpen(false)} className="group w-full flex items-center gap-3.5 px-3 py-3.5 rounded-2xl font-bold transition-all text-left text-slate-600 border border-transparent hover:bg-slate-50 hover:text-slate-900 cursor-pointer">
                    <span className="w-[36px] h-[36px] shrink-0 rounded-[12px] flex items-center justify-center bg-slate-100/80 text-slate-500 transition-colors group-hover:bg-slate-200/80">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                    </span>
                    <span className="flex-1 truncate text-[15px]">Slide Bài Giảng</span>
                  </Link>
                </>
              )}

              <div className="py-2"><div className="h-px bg-slate-100 w-full" /></div>

              {isToeicDomain ? (
                <Link href={process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://englishmore.vn'} onClick={() => setIsMenuOpen(false)} className="group w-full flex items-center gap-3.5 px-3 py-3.5 rounded-2xl font-bold transition-all text-left text-slate-600 border border-transparent hover:bg-slate-50 hover:text-slate-900 cursor-pointer mt-2">
                  <span className="w-[36px] h-[36px] shrink-0 rounded-[12px] flex items-center justify-center bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-100 shadow-sm">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                  </span>
                  <span className="flex-1 truncate text-[15px]">Sang <span className="text-[#14532d] font-black">English</span><span className="text-[#ea980c] font-black">More</span></span>
                </Link>
              ) : (
                <Link href="/toeic-practice" onClick={() => setIsMenuOpen(false)} className="group w-full flex items-center gap-3.5 px-3 py-3.5 rounded-2xl font-bold transition-all text-left text-slate-600 border border-transparent hover:bg-slate-50 hover:text-slate-900 cursor-pointer mt-2">
                  <span className="w-[36px] h-[36px] shrink-0 rounded-[12px] flex items-center justify-center bg-green-50 text-green-600 transition-colors group-hover:bg-green-100 shadow-sm">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                  </span>
                  <span className="flex-1 truncate text-[15px]">Thử sức <span className="text-[#14532d] font-black">Toeic</span><span className="text-[#ea980c] font-black">More</span></span>
                </Link>
              )}

              <button
                type="button"
                onClick={() => signOut({ callbackUrl: '/' })}
                className="group mt-4 w-full flex items-center gap-3.5 px-3 py-3.5 rounded-2xl font-bold transition-all text-left text-rose-600 border border-transparent hover:bg-rose-50 cursor-pointer"
              >
                <span className="w-[36px] h-[36px] shrink-0 rounded-[12px] flex items-center justify-center bg-rose-100/50 text-rose-500 transition-colors group-hover:bg-rose-100">
                  <LogoutIcon />
                </span>
                <span className="flex-1 truncate text-[15px]">Đăng Xuất</span>
              </button>
            </nav>
          </aside>
        </div>
      )}
    </header>
  )
}

