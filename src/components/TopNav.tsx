'use client'

import Image from 'next/image'
import { signIn, signOut, useSession } from 'next-auth/react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState, Suspense, useRef } from 'react'
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
  const { data: session } = useSession()
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

  const handleLoginClick = () => {
    setIsMenuOpen(false)
    const params = new URLSearchParams(window.location.search)
    params.set('login', 'true')
    params.set('subtitle', 'Đăng nhập để lưu và theo dõi tiến độ học tập')
    params.set('callbackUrl', pathname)
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const ENGLISHMORE_TABS = [
    {
      key: "my-homework",
      label: "Homework",
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>,
      href: "/my-homework",
      color: "text-blue-600"
    },
    {
      key: "dashboard",
      label: "Exercise",
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
      <div className="hidden lg:flex items-center gap-3 xl:gap-5 overflow-x-auto pt-1 w-full justify-start ml-2 mr-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {session ? (
          <div className="flex items-center gap-2 xl:gap-3 shrink-0">
            <Link
              href="/user/profile"
              className={`flex items-center gap-1.5 group transition-all duration-300 focus:outline-none cursor-pointer whitespace-nowrap pb-[6px] mt-1 border-b-[2px] ${pathname === '/user/profile' ? "border-[#14532d]" : "border-transparent hover:border-[#14532d]/20"}`}
            >
              <span className={`transition-transform duration-300 scale-100 group-hover:scale-110 mb-[-2px]`}>
                 <ModernUserIcon className="w-[18px] h-[18px]" />
              </span>
              <span className={`text-[13px] xl:text-[14px] font-bold tracking-tight transition-all text-[#4c1d95] ${pathname === '/user/profile' ? "opacity-100" : "opacity-80 group-hover:opacity-100"} max-w-[120px] truncate`} title={session.user?.name || "Cá Nhân"}>
                 {session.user?.name?.split(' ').pop() || "Cá Nhân"}
              </span>
            </Link>
            <Link
              href="/toeic-progress?tab=vocabulary-bank"
              className={`relative overflow-hidden flex items-center gap-1.5 group transition-all duration-300 focus:outline-none cursor-pointer whitespace-nowrap pb-[6px] mt-1 border-b-[2px] ${pathname === '/toeic-progress' && (searchParams.get('tab')?.endsWith('-bank') || searchParams.get('tab') === 'vocabulary-bank') ? "border-[#14532d]" : "border-transparent hover:border-[#14532d]/20"}`}
            >
              <span className={`transition-transform duration-300 scale-100 group-hover:scale-110 text-emerald-500`}>
                 <BookIcon className="w-[18px] h-[18px] mt-[-2px]" />
              </span>
              <span className={`text-[13px] xl:text-[14px] font-bold tracking-tight transition-all text-[#4c1d95] relative z-10 ${pathname === '/toeic-progress' && (searchParams.get('tab')?.endsWith('-bank') || searchParams.get('tab') === 'vocabulary-bank') ? "opacity-100" : "opacity-80 group-hover:opacity-100"}`}>
                 Sổ tay của tôi
              </span>
              <span className="absolute top-0 w-[150%] h-full bg-gradient-to-r from-transparent via-[#4c1d95]/10 to-transparent -skew-x-12 pointer-events-none" style={{ animation: 'metallic-shine-sweep 4s ease-in-out infinite' }} />
            </Link>
            <Link
              href="/toeic-progress?tab=reports-vocabulary"
              className={`flex items-center gap-1.5 group transition-all duration-300 focus:outline-none cursor-pointer whitespace-nowrap pb-[6px] mt-1 border-b-[2px] ${pathname === '/toeic-progress' && searchParams.get('tab')?.startsWith('reports') ? "border-[#14532d]" : "border-transparent hover:border-[#14532d]/20"}`}
            >
              <span className={`transition-transform duration-300 scale-100 group-hover:scale-110 text-sky-500`}>
                 <svg className="w-[18px] h-[18px] mt-[-2px]" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 10.5L12 7.5m0 0l3 3m-3-3v8.25M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                 </svg>
              </span>
              <span className={`text-[13px] xl:text-[14px] font-bold tracking-tight transition-all text-[#4c1d95] ${pathname === '/toeic-progress' && searchParams.get('tab')?.startsWith('reports') ? "opacity-100" : "opacity-80 group-hover:opacity-100"}`}>
                 Tiến độ học
              </span>
            </Link>
          </div>
        ) : (
          <button
            onClick={handleLoginClick}
            className="flex items-center gap-1.5 group transition-all duration-300 focus:outline-none cursor-pointer whitespace-nowrap pb-[6px] mt-1 border-b-[2px] border-transparent hover:border-[#ea980c]/20"
          >
            <span className="transition-transform duration-300 scale-100 group-hover:scale-110 mb-[-2px]">
               <ModernUserIcon className="w-[18px] h-[18px]" />
            </span>
            <span className="text-[13px] xl:text-[14px] font-bold tracking-tight transition-all text-[#ea980c] opacity-90 group-hover:opacity-100">
               Đăng Nhập
            </span>
          </button>
        )}
        
        <div className="w-[1px] h-5 bg-[#14532d]/20 mx-1 shrink-0"></div>
        
        {isToeicDomain ? (
          <>
          {TOEIC_TABS.map((t) => {
            const isActive = currentTab === t.key && (pathname.startsWith('/toeic-practice') || pathname === '/');
            return (
              <button
                key={t.key}
                onClick={() => handleToeicTabClick(t.key)}
                className={`flex items-center gap-1.5 group transition-all duration-300 focus:outline-none cursor-pointer whitespace-nowrap pb-[6px] mt-1 border-b-[2px] ${isActive ? "border-[#14532d]" : "border-transparent hover:border-[#14532d]/20"}`}
              >
                <span className={`transition-transform duration-300 scale-100 group-hover:scale-110 ${TAB_COLORS[t.key]||'text-[#14532d]'}`}>
                  <div className="scale-[0.85] mt-[-2px]">{t.icon}</div>
                </span>
                <span className={`text-[13px] xl:text-[14px] font-bold tracking-tight transition-all text-[#14532d] ${isActive ? "opacity-100" : "opacity-80 group-hover:opacity-100"}`}>
                  {t.label}
                </span>
              </button>
            );
          })}
          </>
        ) : (
          ENGLISHMORE_TABS.map((t) => {
            const isActive = pathname === t.href;
            return (
              <Link
                key={t.key}
                href={t.href}
                className={`flex items-center gap-1.5 group transition-all duration-300 focus:outline-none cursor-pointer whitespace-nowrap pb-[6px] mt-1 border-b-[2px] ${isActive ? "border-[#14532d]" : "border-transparent hover:border-[#14532d]/20"}`}
              >
                <span className={`transition-transform duration-300 scale-100 group-hover:scale-110 ${t.color}`}>
                  <div className="scale-[0.85] mt-[-2px]">{t.icon}</div>
                </span>
                <span className={`text-[13px] xl:text-[14px] font-bold tracking-tight transition-all text-[#14532d] ${isActive ? "opacity-100" : "opacity-80 group-hover:opacity-100"}`}>
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
            <div onClick={() => setIsMenuOpen(false)} className={`absolute inset-0 z-0 bg-slate-950/40 transition-opacity duration-300 cursor-pointer ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`} aria-hidden="true" />
            <aside className={`absolute left-0 top-0 z-10 flex h-screen w-[min(20rem,85vw)] flex-col border-r border-slate-200 bg-white shadow-2xl transition-transform duration-300 ease-in-out touch-pan-y overscroll-y-contain overscroll-x-none ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/80 shrink-0">
                    <Link href="/" onClick={() => setIsMenuOpen(false)} className="font-black text-slate-800 text-lg flex items-center gap-2 tracking-tight hover:opacity-80 transition-opacity">
                        <span className="w-8 h-8 rounded-[10px] bg-green-100 text-[#14532d] flex items-center justify-center font-bold text-lg">{isToeicDomain ? 'T' : 'E'}</span>
                        {isToeicDomain ? 'ToeicMore' : 'EnglishMore'}
                    </Link>
                    <button onClick={() => setIsMenuOpen(false)} className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto p-4 space-y-0.5 custom-scrollbar">
                    {session ? (
                      <>
                        <Link 
                          href="/user/profile" 
                          onClick={() => setIsMenuOpen(false)} 
                          className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-[14px] font-bold transition-all text-left cursor-pointer ${pathname === '/user/profile' ? 'bg-slate-50 text-slate-900 border border-slate-200 shadow-[0_4px_12px_rgba(0,0,0,0.05)] relative z-10' : 'text-slate-700 border border-transparent hover:border-slate-100 hover:bg-slate-50 hover:text-slate-900'}`}
                        >
                            <span className={`w-[32px] h-[32px] shrink-0 rounded-[10px] flex items-center justify-center transition-colors ${pathname === '/user/profile' ? 'bg-white shadow-sm' : 'bg-slate-50'}`}>
                                <ModernUserIcon />
                            </span>
                            <span className="flex-1 truncate text-[14px]">{session.user?.name || "Cá Nhân"}</span>
                        </Link>
                        <Link
                          href="/toeic-progress?tab=vocabulary-bank" 
                          onClick={() => setIsMenuOpen(false)} 
                          className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-[14px] font-bold transition-all text-left cursor-pointer ${pathname === '/toeic-progress' && (searchParams.get('tab')?.endsWith('-bank') || searchParams.get('tab') === 'vocabulary-bank') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-[0_4px_12px_rgba(16,185,129,0.05)] relative z-10' : 'text-slate-700 border border-transparent hover:border-slate-100 hover:bg-slate-50 hover:text-slate-900'}`}
                        >
                            <span className={`w-[32px] h-[32px] shrink-0 rounded-[10px] flex items-center justify-center transition-colors ${pathname === '/toeic-progress' && (searchParams.get('tab')?.endsWith('-bank') || searchParams.get('tab') === 'vocabulary-bank') ? 'bg-white shadow-sm text-emerald-500' : 'bg-slate-50 text-emerald-500/60'}`}>
                                <BookIcon className="w-5 h-5 scale-[0.9]" />
                            </span>
                            <span className="flex-1 truncate text-[14px]">Sổ tay của tôi</span>
                        </Link>
    
                        <Link 
                          href="/toeic-progress?tab=reports-vocabulary" 
                          onClick={() => setIsMenuOpen(false)} 
                          className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-[14px] font-bold transition-all text-left cursor-pointer ${pathname === '/toeic-progress' && searchParams.get('tab')?.startsWith('reports') ? 'bg-sky-50 text-sky-700 border border-sky-200 shadow-[0_4px_12px_rgba(14,165,233,0.05)] relative z-10' : 'text-slate-700 border border-transparent hover:border-slate-100 hover:bg-slate-50 hover:text-slate-900'}`}
                        >
                            <span className={`w-[32px] h-[32px] shrink-0 rounded-[10px] flex items-center justify-center transition-colors ${pathname === '/toeic-progress' && searchParams.get('tab')?.startsWith('reports') ? 'bg-white shadow-sm text-sky-500' : 'bg-slate-50 text-sky-500/60'}`}>
                                <svg className="w-5 h-5 scale-[0.8]" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 10.5L12 7.5m0 0l3 3m-3-3v8.25M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </span>
                            <span className="flex-1 truncate text-[14px]">Tiến độ học</span>
                        </Link>
                        
                        <div className="w-[calc(100%-2rem)] mx-auto h-[1px] bg-green-600/10 my-3" />
                      </>
                    ) : (
                      <button 
                        onClick={handleLoginClick} 
                        className="mb-1 w-full flex items-center gap-3.5 px-4 py-2.5 rounded-[14px] font-bold transition-all text-left cursor-pointer text-slate-700 border border-transparent hover:border-slate-100 hover:bg-slate-50 hover:text-[#ea980c]"
                      >
                          <span className="w-[32px] h-[32px] shrink-0 rounded-[10px] flex items-center justify-center transition-colors bg-amber-50 shadow-sm text-[#ea980c]">
                              <UserIcon />
                          </span>
                          <span className="flex-1 truncate text-[14px]">Đăng Nhập</span>
                      </button>
                    )}

                    {isToeicDomain ? (
                      <>
                      {TOEIC_TABS.map(t => {
                          const isActive = currentTab === t.key && (pathname.startsWith('/toeic-practice') || pathname === '/');
                          const tabColorClass = TAB_COLORS[t.key] || 'text-[#14532d]';
                          return (
                              <button
                                  key={t.key}
                                  className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-[14px] font-bold transition-all text-left cursor-pointer ${isActive ? 'bg-green-50 text-green-700 border border-green-200 shadow-[0_4px_12px_rgba(20,83,45,0.05)] relative z-10' : 'text-slate-700 border border-transparent hover:bg-slate-50 hover:text-slate-900 border-slate-100'}`}
                                  onClick={() => {
                                      handleToeicTabClick(t.key)
                                      setIsMenuOpen(false)
                                  }}
                              >
                                  <span className={`w-[32px] h-[32px] shrink-0 rounded-[10px] flex items-center justify-center transition-colors ${isActive ? 'bg-white shadow-sm ' + tabColorClass : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100'}`}>
                                      <div className={`scale-[0.8] ${!isActive ? tabColorClass + ' opacity-60' : ''}`}>{t.icon}</div>
                                  </span>
                                  <span className="flex-1 truncate text-[14px]">{t.label}</span>
                                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#ea980c] shrink-0 shadow-[0_0_8px_rgba(234,152,12,0.6)]" />}
                              </button>
                          );
                      })}
                      <a
                          href="https://englishmore.bigbee.ltd"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-[14px] font-bold transition-all text-left cursor-pointer text-slate-700 border border-transparent hover:bg-slate-50 hover:text-slate-900 border-slate-100"
                          onClick={() => setIsMenuOpen(false)}
                      >
                          <span className="w-[32px] h-[32px] shrink-0 rounded-[10px] flex items-center justify-center transition-colors bg-fuchsia-50 text-fuchsia-500 group-hover:bg-fuchsia-100">
                              <div className="scale-[0.8] opacity-90">
                                 <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"/></svg>
                              </div>
                          </span>
                          <span className="flex-1 truncate text-[14px]">Luyện Speaking</span>
                      </a>
                      <Link
                          href="/about"
                          className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-[14px] font-bold transition-all text-left cursor-pointer text-slate-700 border border-transparent hover:bg-slate-50 hover:text-slate-900 border-slate-100"
                          onClick={() => setIsMenuOpen(false)}
                      >
                          <span className="w-[32px] h-[32px] shrink-0 rounded-[10px] flex items-center justify-center transition-colors bg-blue-50 text-blue-500 group-hover:bg-blue-100">
                              <div className="scale-[0.8]">
                                 <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                              </div>
                          </span>
                          <span className="flex-1 truncate text-[14px]">
                              About <span className="text-[#14532d]">Toeic</span><span className="text-amber-500">More</span>
                          </span>
                      </Link>
                      </>
                    ) : (
                      ENGLISHMORE_TABS.map(t => {
                          const isActive = pathname === t.href;
                          return (
                              <Link
                                  key={t.key}
                                  href={t.href}
                                  className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-[14px] font-bold transition-all text-left cursor-pointer ${isActive ? 'bg-green-50 text-green-700 border border-green-200 shadow-[0_4px_12px_rgba(20,83,45,0.05)] relative z-10' : 'text-slate-700 border border-transparent hover:bg-slate-50 hover:text-slate-900 border-slate-100'}`}
                                  onClick={() => setIsMenuOpen(false)}
                              >
                                  <span className={`w-[32px] h-[32px] shrink-0 rounded-[10px] flex items-center justify-center transition-colors ${isActive ? 'bg-white shadow-sm ' + t.color : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100'}`}>
                                      <div className={`scale-[0.8] ${!isActive ? t.color + ' opacity-60' : ''}`}>{t.icon}</div>
                                  </span>
                                  <span className="flex-1 truncate text-[14px]">{t.label}</span>
                                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#ea980c] shrink-0 shadow-[0_0_8px_rgba(234,152,12,0.6)]" />}
                              </Link>
                          );
                      })
                    )}
                    
                    {session && (
                      <div className="mt-8 pt-4 border-t border-slate-100 pb-4">
                        <button
                            type="button"
                            onClick={() => signOut({ callbackUrl: '/' })}
                            className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-[14px] font-bold transition-all text-left cursor-pointer text-rose-600 border border-transparent hover:border-rose-100 hover:bg-rose-50"
                        >
                            <span className="w-[32px] h-[32px] shrink-0 rounded-[10px] flex items-center justify-center transition-colors bg-rose-50 text-rose-500">
                                <LogoutIcon />
                            </span>
                            <span className="flex-1 truncate text-[14px]">Đăng Xuất</span>
                        </button>
                      </div>
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

function BookIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
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

  // Optional: close dropdown on escape key and click outside
  const dropdownRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!isDropdownOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsDropdownOpen(false)
    }
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDropdownOpen])

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 border-b border-[#14532d]/10 px-3 py-2.5 text-slate-900 sm:px-6 sm:py-3 transition-all">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 sm:gap-4 relative">
        <div className="flex flex-1 items-center min-w-0 pr-4">
          <Link href="/" className="lg:static absolute left-1/2 -translate-x-1/2 lg:transform-none flex shrink-0 items-center gap-2 leading-none sm:gap-3 z-10">
            <span className="shrink-0 text-[1.45rem] font-extrabold tracking-tight sm:text-[1.8rem]">
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
          </Link>
          <Suspense fallback={<div className="w-[100px]" />}>
            <MenuNavTabs isToeicDomain={isToeicDomain} />
          </Suspense>
        </div>

        <div className="shrink-0 flex items-center gap-2 sm:gap-3">
          {/* Desktop More Menu */}
          {(isToeicDomain || session) && (
              <div ref={dropdownRef} className="relative isolate hidden lg:flex items-center">
                   <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-slate-100 transition-colors focus:outline-none"
                   >
                       <svg className="w-5 h-5 text-slate-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4z"/></svg>
                   </button>
                   {isDropdownOpen && (
                       <>
                           <div className="absolute right-0 top-[calc(100%+8px)] z-50 min-w-[200px] rounded-2xl bg-white shadow-[0_10px_40px_rgba(0,0,0,0.12)] ring-1 ring-black/5 focus:outline-none overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 ease-out border border-slate-100 p-1.5 flex flex-col gap-1">
                               {isToeicDomain && (
                                   <>
                                       <a
                                           href="https://englishmore.bigbee.ltd"
                                           target="_blank"
                                           rel="noopener noreferrer"
                                           onClick={() => setIsDropdownOpen(false)}
                                           className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer"
                                       >
                                           <span className="flex items-center justify-center w-8 h-8 rounded-[10px] bg-fuchsia-50 text-fuchsia-500">
                                               <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"/></svg>
                                           </span>
                                           Luyện Speaking
                                       </a>
                                       <Link
                                           href="/about"
                                           onClick={() => setIsDropdownOpen(false)}
                                           className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer"
                                       >
                                           <span className="flex items-center justify-center w-8 h-8 rounded-[10px] bg-blue-50 text-blue-500">
                                               <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                                           </span>
                                           <span>About <span className="text-[#14532d]">Toeic</span><span className="text-amber-500">More</span></span>
                                       </Link>
                                   </>
                               )}
                               {session && (
                                   <button
                                       type="button"
                                       onClick={() => { setIsDropdownOpen(false); signOut({ callbackUrl: '/' }) }}
                                       className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-bold text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                                   >
                                       <span className="flex items-center justify-center w-8 h-8 rounded-[10px] bg-rose-50 text-rose-500">
                                           <LogoutIcon />
                                       </span>
                                       Đăng Xuất
                                   </button>
                               )}
                           </div>
                       </>
                   )}
               </div>
          )}

          {session && (
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
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

function ModernUserIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="modernUserGrad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f97316"/>
          <stop offset="100%" stopColor="#c2410c"/>
        </linearGradient>
      </defs>
      <path opacity="0.35" d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" fill="url(#modernUserGrad)"/>
      <path d="M12 14.5C6.99 14.5 2.5 17.5 2 22C2 22 4 22 12 22C20 22 22 22 22 22C21.5 17.5 17.01 14.5 12 14.5Z" fill="url(#modernUserGrad)"/>
    </svg>
  );
}
