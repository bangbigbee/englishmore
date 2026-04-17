'use client'

import Image from 'next/image'
import { signIn, signOut, useSession } from 'next-auth/react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

const TOEIC_TABS = [
  { key: "grammar", label: "Luyện ngữ pháp", icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 19.5C4 18.837 4.53726 18.3 5.2 18.3H19C19.5523 18.3 20 18.7477 20 19.3V19.3C20 19.8523 19.5523 20.3 19 20.3H5.2C4.53726 20.3 4 19.763 4 19.1V19.5Z" fill="currentColor" fillOpacity="0.2"/><path d="M4 19.5V5.2C4 4.53726 4.53726 4 5.2 4H19C19.5523 4 20 4.44772 20 5V19.5M4 19.5C4 18.837 4.53726 18.3 5.2 18.3H19M4 19.5C4 20.163 4.53726 20.7 5.2 20.7H19C19.5523 20.7 20 20.2523 20 19.7V18.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M12 4V18.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg> },
  { key: "vocabulary", label: "Học từ vựng", icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 19C4 19.8284 4.67157 20.5 5.5 20.5H18.5C19.3284 20.5 20 19.8284 20 19V17.5H4V19Z" fill="currentColor"/><path d="M4 17.5V4C4 2.89543 4.89543 2 6 2H20V17.5H4Z" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="2"/><path d="M7 6L8.5 10M10 6L8.5 10M7.5 8.5H9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M13 6H17M13 8H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M7 12H11M7 14H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M14 12H18L14 16H18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { key: "listening", label: "Listening", icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19 14V16C19 18.2091 17.2091 20 15 20H14V14H19Z" fill="currentColor" fillOpacity="0.2"/><path d="M5 14V16C5 18.2091 6.79086 20 9 20H10V14H5Z" fill="currentColor" fillOpacity="0.2"/><path d="M10 20H9C6.79086 20 5 18.2091 5 16V12C5 8.13401 8.13401 5 12 5C15.866 5 19 8.13401 19 12V16C19 18.2091 17.2091 20 15 20H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M10 14V20H9C7.89543 20 7 19.1046 7 18V16C7 14.8954 7.89543 14 9 14H10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M14 14V20H15C16.1046 20 17 19.1046 17 18V16C17 14.8954 16.1046 14 15 14H14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg> },
  { key: "reading", label: "Reading", icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 3V7C14 7.55228 14.4477 8 15 8H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M14 3L19 8V19C19 20.1046 18.1046 21 17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H14Z" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M9 13H15M9 17H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg> },
  { key: "actual-test", label: "Actual Test", icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="6" y="4" width="12" height="18" rx="2" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="2"/><path d="M9 4V3C9 2.44772 9.44772 2 10 2H14C14.5523 2 15 2.44772 15 3V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
]

const TAB_COLORS: Record<string, string> = {
  home: "text-[#14532d]",
  grammar: "text-green-600",
  vocabulary: "text-amber-700",
  listening: "text-rose-500",
  reading: "text-purple-600",
  "actual-test": "text-green-600"
}

function MenuNavTabs({ isToeicDomain }: { isToeicDomain: boolean }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const currentTab = searchParams.get('tab') || 'home'
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleToeicTabClick = (key: string) => {
    if (pathname.startsWith('/toeic-practice') || pathname === '/') {
      const params = new URLSearchParams(searchParams.toString())
      params.set('tab', key)
      params.delete('topic')
      router.push(`/toeic-practice?${params.toString()}`, { scroll: false })
    } else {
      router.push(`/toeic-practice?tab=${key}`)
    }
  }

  const ENGLISHMORE_TABS = [
    {
      key: "my-homework",
      label: "Làm Bài Tập",
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>,
      href: "/my-homework",
      color: "text-blue-600"
    },
    {
      key: "dashboard",
      label: "Bài Học Trên Lớp",
      icon: <BookIcon />,
      href: "/dashboard",
      color: "text-emerald-600"
    },
    {
      key: "lecture-notes",
      label: "Slide Bài Giảng",
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
      href: "/lecture-notes",
      color: "text-indigo-600"
    }
  ]

  return (
    <>
      {/* Desktop Main Navigation Tabs */}
      <div className="hidden lg:flex items-center gap-6 xl:gap-8 overflow-x-auto scrollbar-hide pt-1 w-full justify-start mx-6">
        <Link
          href="/toeic-progress?tab=vocabulary-bank"
          className="flex items-center gap-2 group transition-all duration-300 focus:outline-none cursor-pointer whitespace-nowrap"
        >
          <span className={`transition-transform duration-300 scale-100 group-hover:scale-110 text-emerald-500`}>
             <svg className="w-5 h-5 scale-[0.9]" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
          </span>
          <span className={`text-[13px] xl:text-[14px] font-bold tracking-tight transition-all pb-[6px] border-b-[2px] mt-1 text-[#14532d] ${
             pathname === '/toeic-progress' && (searchParams.get('tab')?.endsWith('-bank') || searchParams.get('tab') === 'vocabulary-bank')
               ? "border-[#14532d]"
               : "opacity-80 border-transparent hover:opacity-100 group-hover:border-[#14532d]/30"
          }`}>
             Sổ Tay Của Tôi
          </span>
        </Link>
        <Link
          href="/toeic-progress?tab=reports-vocabulary"
          className="flex items-center gap-2 group transition-all duration-300 focus:outline-none cursor-pointer whitespace-nowrap"
        >
          <span className={`transition-transform duration-300 scale-100 group-hover:scale-110 text-sky-500`}>
             <svg className="w-5 h-5 scale-[0.9]" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 10.5L12 7.5m0 0l3 3m-3-3v8.25M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
          </span>
          <span className={`text-[13px] xl:text-[14px] font-bold tracking-tight transition-all pb-[6px] border-b-[2px] mt-1 text-[#14532d] ${
             pathname === '/toeic-progress' && searchParams.get('tab')?.startsWith('reports')
               ? "border-[#14532d]"
               : "opacity-80 border-transparent hover:opacity-100 group-hover:border-[#14532d]/30"
          }`}>
             Tiến Độ Của Tôi
          </span>
        </Link>
        
        <div className="w-[1px] h-5 bg-[#14532d]/20 mx-1"></div>
        
        {isToeicDomain ? (
          TOEIC_TABS.map((t) => {
            const isActive = currentTab === t.key && (pathname.startsWith('/toeic-practice') || pathname === '/');
            return (
              <button
                key={t.key}
                onClick={() => handleToeicTabClick(t.key)}
                className="flex items-center gap-2 group transition-all duration-300 focus:outline-none cursor-pointer whitespace-nowrap"
              >
                <span className={`transition-transform duration-300 scale-100 group-hover:scale-110 ${TAB_COLORS[t.key]||'text-[#14532d]'}`}>
                  <div className="scale-[0.9]">{t.icon}</div>
                </span>
                <span className={`text-[13px] xl:text-[14px] font-bold tracking-tight transition-all pb-[6px] border-b-[2px] mt-1 text-[#14532d] ${
                  isActive 
                    ? "border-[#14532d]" 
                    : "opacity-80 border-transparent hover:opacity-100 group-hover:border-[#14532d]/30"
                }`}>
                  {t.label}
                </span>
              </button>
            );
          })
        ) : (
          ENGLISHMORE_TABS.map((t) => {
            const isActive = pathname === t.href;
            return (
              <Link
                key={t.key}
                href={t.href}
                className="flex items-center gap-2 group transition-all duration-300 focus:outline-none cursor-pointer whitespace-nowrap"
              >
                <span className={`transition-transform duration-300 scale-100 group-hover:scale-110 ${t.color}`}>
                  <div className="scale-[0.9]">{t.icon}</div>
                </span>
                <span className={`text-[13px] xl:text-[14px] font-bold tracking-tight transition-all pb-[6px] border-b-[2px] mt-1 text-[#14532d] ${
                  isActive 
                    ? "border-[#14532d]" 
                    : "opacity-80 border-transparent hover:opacity-100 group-hover:border-[#14532d]/30"
                }`}>
                  {t.label}
                </span>
              </Link>
            )
          })
        )}
      </div>

      <div className="lg:hidden flex items-center relative order-first">
        <button
          onClick={() => setIsMenuOpen(true)}
          className="flex items-center justify-center w-10 h-10 bg-[#ea980c] hover:bg-[#d48c0b] border border-[#ea980c]/20 rounded-xl shadow-[0_4px_12px_rgba(234,152,12,0.25)] text-white active:scale-[0.98] transition-all cursor-pointer"
        >
          <svg className="w-5 h-5 text-[#14532d]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16"></path></svg>
        </button>

        {/* Mobile Left Drawer Menu */}
        <div className={`fixed inset-0 z-[100] isolate transition lg:hidden ${isMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'}`} aria-hidden={!isMenuOpen}>
            <button type="button" onClick={() => setIsMenuOpen(false)} className={`absolute inset-0 z-0 bg-slate-950/40 transition-opacity duration-300 touch-none overscroll-none ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`} />
            <aside className={`absolute left-0 top-0 z-10 flex h-screen w-[min(20rem,85vw)] flex-col border-r border-slate-200 bg-white shadow-2xl transition-transform duration-300 ease-in-out touch-pan-y overscroll-y-contain overscroll-x-none ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/80 shrink-0">
                    <h2 className="font-black text-slate-800 text-lg flex items-center gap-2 tracking-tight">
                        <span className="w-8 h-8 rounded-[10px] bg-green-100 text-[#14532d] flex items-center justify-center font-bold text-lg">{isToeicDomain ? 'T' : 'E'}</span>
                        {isToeicDomain ? 'ToeicMore' : 'EnglishMore'}
                    </h2>
                    <button onClick={() => setIsMenuOpen(false)} className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto p-4 space-y-1.5 custom-scrollbar">
                    <div className="mb-3 text-[11px] font-bold uppercase tracking-widest text-[#14532d]/40 px-2 mt-2">Dữ liệu cá nhân</div>
                    <Link 
                      href="/toeic-progress?tab=vocabulary-bank" 
                      onClick={() => setIsMenuOpen(false)} 
                      className={`mb-1 w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl font-bold transition-all text-left cursor-pointer ${pathname === '/toeic-progress' && (searchParams.get('tab')?.endsWith('-bank') || searchParams.get('tab') === 'vocabulary-bank') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-[0_4px_12px_rgba(16,185,129,0.05)] relative z-10' : 'text-slate-700 border border-transparent hover:border-slate-100 hover:bg-slate-50 hover:text-slate-900'}`}
                    >
                        <span className={`w-[36px] h-[36px] shrink-0 rounded-[12px] flex items-center justify-center transition-colors ${pathname === '/toeic-progress' && (searchParams.get('tab')?.endsWith('-bank') || searchParams.get('tab') === 'vocabulary-bank') ? 'bg-white shadow-sm text-emerald-500' : 'bg-slate-50 text-emerald-500/60'}`}>
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
                        </span>
                        <span className="flex-1 truncate text-[15px]">Sổ Tay Của Tôi</span>
                    </Link>

                    <Link 
                      href="/toeic-progress?tab=reports-vocabulary" 
                      onClick={() => setIsMenuOpen(false)} 
                      className={`mb-1.5 w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl font-bold transition-all text-left cursor-pointer ${pathname === '/toeic-progress' && searchParams.get('tab')?.startsWith('reports') ? 'bg-sky-50 text-sky-700 border border-sky-200 shadow-[0_4px_12px_rgba(14,165,233,0.05)] relative z-10' : 'text-slate-700 border border-transparent hover:border-slate-100 hover:bg-slate-50 hover:text-slate-900'}`}
                    >
                        <span className={`w-[36px] h-[36px] shrink-0 rounded-[12px] flex items-center justify-center transition-colors ${pathname === '/toeic-progress' && searchParams.get('tab')?.startsWith('reports') ? 'bg-white shadow-sm text-sky-500' : 'bg-slate-50 text-sky-500/60'}`}>
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 10.5L12 7.5m0 0l3 3m-3-3v8.25M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </span>
                        <span className="flex-1 truncate text-[15px]">Tiến Độ Của Tôi</span>
                    </Link>

                    <div className="mb-3 text-[11px] font-bold uppercase tracking-widest text-[#14532d]/40 px-2 mt-4">Các Chuyên Mục Học Tập</div>

                    {isToeicDomain ? (
                      TOEIC_TABS.map(t => {
                          const isActive = currentTab === t.key && (pathname.startsWith('/toeic-practice') || pathname === '/');
                          const tabColorClass = TAB_COLORS[t.key] || 'text-[#14532d]';
                          return (
                              <button
                                  key={t.key}
                                  className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl font-bold transition-all text-left cursor-pointer ${isActive ? 'bg-green-50 text-green-700 border border-green-200 shadow-[0_4px_12px_rgba(20,83,45,0.05)] relative z-10' : 'text-slate-700 border border-transparent hover:bg-slate-50 hover:text-slate-900 border-slate-100'}`}
                                  onClick={() => {
                                      handleToeicTabClick(t.key)
                                      setIsMenuOpen(false)
                                  }}
                              >
                                  <span className={`w-[36px] h-[36px] shrink-0 rounded-[12px] flex items-center justify-center transition-colors ${isActive ? 'bg-white shadow-sm ' + tabColorClass : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100'}`}>
                                      <div className={`scale-[0.8] ${!isActive ? tabColorClass + ' opacity-60' : ''}`}>{t.icon}</div>
                                  </span>
                                  <span className="flex-1 truncate text-[15px]">{t.label}</span>
                                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#ea980c] shrink-0 shadow-[0_0_8px_rgba(234,152,12,0.6)]" />}
                              </button>
                          );
                      })
                    ) : (
                      ENGLISHMORE_TABS.map(t => {
                          const isActive = pathname === t.href;
                          return (
                              <Link
                                  key={t.key}
                                  href={t.href}
                                  className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl font-bold transition-all text-left cursor-pointer ${isActive ? 'bg-green-50 text-green-700 border border-green-200 shadow-[0_4px_12px_rgba(20,83,45,0.05)] relative z-10' : 'text-slate-700 border border-transparent hover:bg-slate-50 hover:text-slate-900 border-slate-100'}`}
                                  onClick={() => setIsMenuOpen(false)}
                              >
                                  <span className={`w-[36px] h-[36px] shrink-0 rounded-[12px] flex items-center justify-center transition-colors ${isActive ? 'bg-white shadow-sm ' + t.color : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100'}`}>
                                      <div className={`scale-[0.8] ${!isActive ? t.color + ' opacity-60' : ''}`}>{t.icon}</div>
                                  </span>
                                  <span className="flex-1 truncate text-[15px]">{t.label}</span>
                                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#ea980c] shrink-0 shadow-[0_0_8px_rgba(234,152,12,0.6)]" />}
                              </Link>
                          );
                      })
                    )}
                </nav>
            </aside>
        </div>
      </div>
    </>
  )
}

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

export default function TopNav({ isToeicDomain = false }: { isToeicDomain?: boolean }) {
  const { data: session, status } = useSession()
  const [enrolledCourseTitle, setEnrolledCourseTitle] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
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

  // Optional: close dropdown on escape key
  useEffect(() => {
    if (!isDropdownOpen) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsDropdownOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isDropdownOpen])

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 border-b border-[#14532d]/10 px-3 py-2.5 text-slate-900 sm:px-6 sm:py-3 transition-all">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 sm:gap-4 relative">
        <div className="flex flex-1 items-center min-w-0 pr-4">
          <Link href="/" className="lg:static absolute left-1/2 -translate-x-1/2 lg:transform-none flex shrink-0 items-center gap-2 leading-none sm:gap-3 z-10">
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
            {!isToeicDomain && (
              <span className="hidden sm:block max-w-20 truncate text-[10px] font-medium leading-tight text-slate-600 sm:max-w-none sm:truncate-none sm:text-sm pt-1">
                Speak your mind and more
              </span>
            )}
          </Link>
          <Suspense fallback={<div className="w-[100px]" />}>
            <MenuNavTabs isToeicDomain={isToeicDomain} />
          </Suspense>
        </div>

        <div className="shrink-0 flex items-center gap-1.5 sm:gap-3">
          {session ? (
            <>
              <div className="flex items-center gap-2">
                {session.user?.tier === 'PRO' && (
                  <span 
                    className="relative hidden sm:flex overflow-hidden items-center justify-center gap-0.5 bg-gradient-to-r from-[#FFD700] to-[#FDB931] text-[#594300] font-black uppercase tracking-widest px-1.5 h-5 rounded-[4px] text-[9px] shadow-sm cursor-default border border-[#FDB931]/50"
                    title={session.user.tierExpiresAt ? `Hết hạn: ${new Date(session.user.tierExpiresAt).toLocaleDateString('vi-VN')}` : 'Gói PRO'}
                  >
                    <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    PRO
                    <span className="absolute top-0 w-[150%] h-full bg-gradient-to-r from-transparent via-white/80 to-transparent -skew-x-12 pointer-events-none" style={{ animation: 'metallic-shine-sweep 4s ease-in-out infinite' }} />
                  </span>
                )}
                {session.user?.tier === 'ULTRA' && (
                  <span 
                    className="relative hidden sm:flex overflow-hidden items-center justify-center gap-0.5 bg-gradient-to-r from-purple-700 to-purple-950 text-white font-black uppercase tracking-widest px-1.5 h-5 rounded-[4px] text-[9px] shadow-sm cursor-default border border-purple-600/30"
                    title={session.user.tierExpiresAt ? `Hết hạn: ${new Date(session.user.tierExpiresAt).toLocaleDateString('vi-VN')}` : 'Gói ULTRA'}
                  >
                    <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                    ULTRA
                    <span className="absolute top-0 w-[150%] h-full bg-gradient-to-r from-transparent via-white/50 to-transparent -skew-x-12 pointer-events-none" style={{ animation: 'metallic-shine-sweep 4s ease-in-out infinite' }} />
                  </span>
                )}
                <div className="relative isolate">
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className={`relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border-2 ${session.user?.tier === 'PRO' ? 'border-[#ea980c]' : session.user?.tier === 'ULTRA' ? 'border-purple-700' : 'border-[#14532d]'} bg-white text-[#14532d] shadow-sm transition hover:shadow-md cursor-pointer hover:border-amber-500`}
                    aria-expanded={isDropdownOpen}
                    aria-label="Toggle profile menu"
                  >
                    {session.user?.image && !avatarLoadFailed ? (
                      <Image src={session.user.image} alt={session.user?.name || 'Profile'} fill className="object-cover" onError={() => setAvatarLoadFailed(true)} />
                    ) : (
                      <span className="text-sm font-bold text-[#14532d]">{userInitial}</span>
                    )}
                  </button>
                  
                  {/* Floating Dropdown Menu */}
                  {isDropdownOpen && (
                    <>
                      {/* Invisible overlay for capturing outside clicks */}
                      <button className="fixed inset-0 z-40 w-full h-full cursor-default" onClick={() => setIsDropdownOpen(false)} aria-hidden="true"></button>
                      
                      <div className="absolute right-0 top-[calc(100%+12px)] z-50 w-[280px] min-w-[280px] max-w-[90vw] origin-top-right rounded-[20px] bg-white shadow-[0_10px_40px_rgba(0,0,0,0.12)] ring-1 ring-black/5 focus:outline-none overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200 ease-out border border-slate-100">
                        {/* User Header */}
                        <div className="bg-[#14532d] px-4 py-5 shrink-0 relative overflow-hidden border-b-4 border-amber-500">
                          {/* Background pattern */}
                          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '16px 16px' }}></div>
                          
                          <div className="flex items-center gap-3 relative z-10">
                            <div className={`relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 ${session.user?.tier === 'PRO' ? 'border-[#ea980c]' : session.user?.tier === 'ULTRA' ? 'border-purple-300' : 'border-white'} bg-white text-[#14532d] shadow-sm`}>
                              {session.user?.image && !avatarLoadFailed ? (
                                <Image src={session.user.image} alt={session.user?.name || 'Profile'} fill className="object-cover" onError={() => setAvatarLoadFailed(true)} />
                              ) : (
                                <span className="text-base font-bold text-[#14532d]">{userInitial}</span>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-base font-bold text-white tracking-tight">{session.user?.name || 'User'}</p>
                              <p className="truncate text-[11px] text-green-100/90 font-medium">{session.user?.email || ''}</p>
                            </div>
                          </div>
                          
                          <div className="mt-3 relative z-10 flex flex-col gap-1.5">
                            {(session.user?.tier === 'PRO' || session.user?.tier === 'ULTRA') && (
                               <div className="flex items-center gap-1.5">
                                 {session.user?.tier === 'PRO' ? (
                                   <span className="inline-flex items-center justify-center gap-1 bg-gradient-to-r from-[#FFD700] to-[#FDB931] text-[#594300] font-black uppercase tracking-widest px-2 h-5 rounded text-[10px] shadow-sm">
                                     <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                                     PRO
                                   </span>
                                 ) : (
                                   <span className="inline-flex items-center justify-center gap-1 bg-gradient-to-r from-purple-700 to-purple-900 text-white font-black uppercase tracking-widest px-2 h-5 rounded text-[10px] shadow-sm border border-purple-500/30">
                                     <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                                     ULTRA
                                   </span>
                                 )}
                                 {session.user.tierExpiresAt && (
                                   <span className="text-[10px] text-white/80 font-medium">Đến: {new Date(session.user.tierExpiresAt).toLocaleDateString('vi-VN')}</span>
                                 )}
                               </div>
                            )}
                            {enrolledCourseTitle && (
                              <p className="truncate text-xs font-semibold text-[#ea980c] bg-[#14532d] shadow-sm border border-black/10 self-start px-2 py-0.5 rounded-md">{enrolledCourseTitle}</p>
                            )}
                          </div>
                        </div>

                        {/* Dropdown Items */}
                        <div className="p-2 space-y-1 bg-slate-50/50">
                          <Link href="/user/profile" onClick={() => setIsDropdownOpen(false)} className="group flex w-full items-center gap-3 rounded-[12px] px-3 py-2.5 text-[14px] font-bold text-slate-700 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 transition-all">
                            <span className="flex items-center justify-center w-8 h-8 rounded-[10px] bg-slate-200/50 text-slate-500 group-hover:bg-slate-100 group-hover:text-[#14532d] group-hover:shadow-[0_2px_8px_rgba(20,83,45,0.15)] group-hover:-translate-y-0.5 transition-all">
                              <UserIcon />
                            </span>
                            Hồ Sơ Cá Nhân
                          </Link>
                          
                          <Link href="/about" onClick={() => setIsDropdownOpen(false)} className="group flex w-full items-center gap-3 rounded-[12px] px-3 py-2.5 text-[14px] font-bold text-slate-700 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 transition-all">
                            <span className="flex items-center justify-center w-8 h-8 rounded-[10px] bg-slate-200/50 text-slate-500 group-hover:bg-slate-100 group-hover:text-slate-700 group-hover:shadow-[0_2px_8px_rgba(0,0,0,0.05)] group-hover:-translate-y-0.5 transition-all">
                              <svg className="w-4 h-4 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </span>
                            Về <span className="text-[#14532d] mx-0.5">Toeic</span><span className="text-[#ea980c]">More</span>
                          </Link>

                          <div className="h-px bg-slate-200/60 my-2 mx-2"></div>

                          {/* Domain Switcher */}
                          {isToeicDomain ? (
                            <Link href={process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://englishmore.bigbee.ltd'} onClick={() => setIsDropdownOpen(false)} className="group flex w-full items-center gap-3 rounded-[12px] px-3 py-2.5 text-[14px] font-bold text-slate-700 hover:bg-blue-50/50 hover:shadow-sm border border-transparent hover:border-blue-100 transition-all">
                              <span className="flex items-center justify-center w-8 h-8 rounded-[10px] bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-[0_4px_12px_rgba(37,99,235,0.2)] group-hover:-translate-y-0.5 transition-all">
                                <svg className="w-4 h-4 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                              </span>
                              Tới <span className="text-[#14532d] mx-0.5">English</span><span className="text-[#ea980c]">More</span>
                            </Link>
                          ) : (
                            <Link href={process.env.NODE_ENV === 'development' ? '/toeic-practice' : 'https://toeicmore.com'} onClick={() => setIsDropdownOpen(false)} className="group flex w-full items-center gap-3 rounded-[12px] px-3 py-2.5 text-[14px] font-bold text-slate-700 hover:bg-green-50/50 hover:shadow-sm border border-transparent hover:border-green-100 transition-all">
                              <span className="flex items-center justify-center w-8 h-8 rounded-[10px] bg-green-50 text-green-600 group-hover:bg-green-600 group-hover:text-white group-hover:shadow-[0_4px_12px_rgba(22,163,74,0.2)] group-hover:-translate-y-0.5 transition-all">
                                <svg className="w-4 h-4 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                              </span>
                              Tới <span className="text-[#14532d] mx-0.5">Toeic</span><span className="text-[#ea980c]">More</span>
                            </Link>
                          )}

                          <button
                            type="button"
                            onClick={() => signOut({ callbackUrl: '/' })}
                            className="group flex w-full items-center gap-3 rounded-[12px] px-3 py-2.5 text-[14px] font-bold text-rose-600 hover:bg-rose-50 transition-all mt-2"
                          >
                            <span className="flex items-center justify-center w-8 h-8 rounded-[10px] bg-rose-100/60 text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-all">
                              <LogoutIcon />
                            </span>
                            Đăng Xuất
                          </button>
                        </div>
                      </div>
                    </>
                  )}
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
    </header>
  )
}
