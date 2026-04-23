'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface ToeicOnboardingModalProps {
  onComplete: (level: string) => void
}

export default function ToeicOnboardingModal({ onComplete }: ToeicOnboardingModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { data: session } = useSession()

  useEffect(() => {
    // Check if onboarding is needed after a short delay
    const timer = setTimeout(() => {
      const localLevel = localStorage.getItem('toeicLevel')
      if (!localLevel) {
        if (session) {
          fetch('/api/user/profile')
            .then(res => res.json())
            .then(data => {
              if (data.user && !data.user.toeicLevel) {
                setIsOpen(true)
              } else if (data.user && data.user.toeicLevel) {
                localStorage.setItem('toeicLevel', data.user.toeicLevel)
              }
            })
            .catch(() => setIsOpen(true))
        } else {
          setIsOpen(true)
        }
      }
    }, 1500)

    return () => clearTimeout(timer)
  }, [session])

  const handleSelectLevel = async (level: string) => {
    localStorage.setItem('toeicLevel', level)
    setIsOpen(false)
    
    if (session) {
      // Save to db
      try {
        await fetch('/api/user/toeic-onboarding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ toeicLevel: level })
        })
      } catch (error) {
        console.error(error)
      }
    }
    
    onComplete(level)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] overflow-y-auto isolate">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm"
          />
          
          <div className="flex min-h-full items-center justify-center p-4 sm:p-6 pointer-events-none">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-2xl transform rounded-3xl bg-white shadow-2xl pointer-events-auto overflow-hidden flex flex-col md:flex-row"
            >
              {/* Left Side: Graphic / Welcome */}
              <div className="md:w-2/5 bg-gradient-to-br from-[#14532d] to-[#1e7a42] p-8 text-white flex flex-col justify-center items-center text-center relative overflow-hidden hidden md:flex">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-bl-full"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-5 rounded-tr-full"></div>
                
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md border border-white/20">
                  <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="6" />
                    <circle cx="12" cy="12" r="2" />
                  </svg>
                </div>
                <h2 className="text-2xl font-black mb-3">Chào mừng bạn!</h2>
                <p className="text-white/80 text-sm font-medium leading-relaxed">
                  Để ToeicMore thiết kế lộ trình học hiệu quả nhất giúp bạn đạt mục tiêu, hãy cho chúng tôi biết trình độ hiện tại của bạn nhé!
                </p>
              </div>

              {/* Right Side: Options */}
              <div className="md:w-3/5 p-6 sm:p-8 bg-white flex flex-col">
                <div className="md:hidden text-center mb-6">
                  <h2 className="text-xl font-black text-slate-800 mb-2">Chào mừng bạn đến với ToeicMore! 🎯</h2>
                  <p className="text-slate-500 text-sm font-medium">Hãy chọn trình độ hiện tại để nhận lộ trình phù hợp nhất.</p>
                </div>
                
                <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wider">Trình độ hiện tại của bạn</h3>
                
                <div className="space-y-3">
                  <button 
                    onClick={() => handleSelectLevel('BEGINNER')}
                    className="w-full group bg-slate-50 border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 rounded-2xl p-4 flex items-center gap-4 transition-all duration-200 text-left cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0 border border-slate-100 group-hover:border-emerald-200 group-hover:bg-emerald-100 transition-colors text-emerald-600">
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M7 20h10" />
                          <path d="M10 20c5.5-2.5.8-6.4 3-10" />
                          <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z" />
                          <path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">Mất gốc hoàn toàn</h4>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">Chưa biết bắt đầu từ đâu, mục tiêu 450+</p>
                    </div>
                  </button>

                  <button 
                    onClick={() => handleSelectLevel('INTERMEDIATE')}
                    className="w-full group bg-slate-50 border border-slate-200 hover:border-blue-400 hover:bg-blue-50 rounded-2xl p-4 flex items-center gap-4 transition-all duration-200 text-left cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0 border border-slate-100 group-hover:border-blue-200 group-hover:bg-blue-100 transition-colors text-blue-600">
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 group-hover:text-blue-700 transition-colors">Đã có nền tảng cơ bản</h4>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">Nghe hiểu sương sương, mục tiêu 600+</p>
                    </div>
                  </button>

                  <button 
                    onClick={() => handleSelectLevel('ADVANCED')}
                    className="w-full group bg-slate-50 border border-slate-200 hover:border-amber-400 hover:bg-amber-50 rounded-2xl p-4 flex items-center gap-4 transition-all duration-200 text-left cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0 border border-slate-100 group-hover:border-amber-200 group-hover:bg-amber-100 transition-colors text-amber-600">
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 group-hover:text-amber-700 transition-colors">Khá vững & Muốn Luyện Đề</h4>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">Cần luyện đề cường độ cao, mục tiêu 800+</p>
                    </div>
                  </button>
                </div>

                <div className="mt-6 text-center">
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="text-xs text-slate-400 font-medium hover:text-slate-600 underline underline-offset-2 transition-colors cursor-pointer"
                  >
                    Bỏ qua bước này
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}
