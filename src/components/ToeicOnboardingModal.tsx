'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface ToeicOnboardingModalProps {
  onComplete: (level: string) => void
}

export default function ToeicOnboardingModal({ onComplete }: ToeicOnboardingModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState(1)
  const [selectedLevel, setSelectedLevel] = useState('')
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

    // Custom event to force open the modal from other components
    const handleForceOpen = () => {
      setIsOpen(true)
      setStep(1)
    }
    window.addEventListener('openToeicOnboarding', handleForceOpen)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('openToeicOnboarding', handleForceOpen)
    }
  }, [session])

  const finalizeOnboarding = async (level: string) => {
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

  const handleSelectLevel = (level: string) => {
    if (level === 'MOCK_TEST_ONLY') {
      finalizeOnboarding(level)
      return
    }
    setSelectedLevel(level)
    setStep(2)
  }

  const handleTakeTest = () => {
    setIsOpen(false)
    localStorage.setItem('assessedLevel', selectedLevel)
    window.location.href = '/toeic-practice/placement-test'
  }

  const handleSkipTest = () => {
    if (session) {
      finalizeOnboarding(selectedLevel)
    } else {
      setStep(3)
    }
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
              className="relative w-full max-w-2xl transform rounded-3xl shadow-2xl pointer-events-auto overflow-hidden flex flex-col md:flex-row bg-white"
              style={{ transform: 'translateZ(0)' }}
            >
              {/* Left Side: Graphic / Welcome */}
              <div className="md:w-2/5 bg-gradient-to-br from-[#7e22ce] to-[#3b0764] p-8 text-white flex flex-col justify-center items-center text-center relative overflow-hidden hidden md:flex">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-bl-full"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-5 rounded-tr-full"></div>
                
                <div className="flex items-center justify-center mb-6">
                  <img src="/toeicmorelogo.svg?v=2" alt="ToeicMore" className="w-auto h-12 object-contain drop-shadow-lg" style={{ filter: 'brightness(0) invert(1)' }} />
                </div>
                <h2 className="text-2xl font-black mb-3 text-white">Để tôi thiết kế Lộ trình học tập cho bạn</h2>
                <p className="text-white/80 text-sm font-medium leading-relaxed">
                  Để ToeicMore thiết kế lộ trình học hiệu quả nhất giúp bạn đạt mục tiêu, hãy cho chúng tôi biết trình độ hiện tại của bạn nhé!
                </p>
              </div>

              {/* Right Side: Options & Steps */}
              <div className="md:w-3/5 p-6 sm:p-8 bg-white flex flex-col relative min-h-[400px]">
                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <motion.div 
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className="flex flex-col h-full"
                    >
                      <div className="md:hidden text-center mb-6">
                        <h2 className="text-xl font-black text-slate-800 mb-2">Để tôi thiết kế Lộ trình học tập cho bạn 🎯</h2>
                        <p className="text-slate-500 text-sm font-medium">Hãy chọn trình độ hiện tại để nhận lộ trình phù hợp nhất.</p>
                      </div>
                      
                      <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wider">Trình độ hiện tại của bạn</h3>
                      
                      <div className="space-y-3 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                        <button 
                          onClick={() => handleSelectLevel('BEGINNER')}
                          className="w-full group bg-slate-50 border border-slate-200 hover:border-[#581c87]/40 hover:bg-[#581c87]/5 rounded-2xl p-4 flex items-center gap-4 transition-all duration-200 text-left cursor-pointer"
                        >
                          <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0 border border-slate-100 group-hover:border-amber-200 group-hover:bg-amber-50 transition-colors text-amber-500">
                            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M7 20h10" />
                                <path d="M10 20c5.5-2.5.8-6.4 3-10" />
                                <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z" />
                                <path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800 group-hover:text-[#581c87] transition-colors">Học lại từ đầu (Con số 0)</h4>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">Mất gốc hoàn toàn, muốn học bài bản từ A-Z</p>
                          </div>
                        </button>

                        <button 
                          onClick={() => handleSelectLevel('INTERMEDIATE')}
                          className="w-full group bg-slate-50 border border-slate-200 hover:border-[#581c87]/40 hover:bg-[#581c87]/5 rounded-2xl p-4 flex items-center gap-4 transition-all duration-200 text-left cursor-pointer"
                        >
                          <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0 border border-slate-100 group-hover:border-amber-200 group-hover:bg-amber-50 transition-colors text-amber-500">
                            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800 group-hover:text-[#581c87] transition-colors">Đã có nền tảng cơ bản</h4>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">Nghe hiểu sương sương, mục tiêu 600+</p>
                          </div>
                        </button>

                        <button 
                          onClick={() => handleSelectLevel('ADVANCED')}
                          className="w-full group bg-slate-50 border border-slate-200 hover:border-[#581c87]/40 hover:bg-[#581c87]/5 rounded-2xl p-4 flex items-center gap-4 transition-all duration-200 text-left cursor-pointer"
                        >
                          <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0 border border-slate-100 group-hover:border-amber-200 group-hover:bg-amber-50 transition-colors text-amber-500">
                            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800 group-hover:text-[#581c87] transition-colors">Khá vững kiến thức</h4>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">Cần học sâu mẹo & luyện tập cường độ cao (800+)</p>
                          </div>
                        </button>

                        <button 
                          onClick={() => handleSelectLevel('MOCK_TEST_ONLY')}
                          className="w-full group bg-slate-50 border border-slate-200 hover:border-[#581c87]/40 hover:bg-[#581c87]/5 rounded-2xl p-4 flex items-center gap-4 transition-all duration-200 text-left cursor-pointer"
                        >
                          <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0 border border-slate-100 group-hover:border-amber-200 group-hover:bg-amber-50 transition-colors text-amber-500">
                            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800 group-hover:text-[#581c87] transition-colors">Tôi chỉ đến đây Luyện Đề</h4>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">Bỏ qua lộ trình, vào thẳng danh sách đề thi</p>
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
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div 
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className="flex flex-col h-full justify-center text-center py-4"
                    >
                      <div className="w-16 h-16 bg-purple-50 text-[#581c87] rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-black text-slate-800 mb-3">Kiểm tra năng lực đầu vào?</h3>
                      <p className="text-slate-500 text-[14px] leading-relaxed mb-8 px-4">
                        Lộ trình dự kiến của bạn đã sẵn sàng! Tuy nhiên, để ToeicMore thiết kế lộ trình CHÍNH XÁC NHẤT sát với năng lực thực tế, bạn có muốn làm một bài test ngắn không?
                      </p>
                      
                      <div className="space-y-3 mt-auto">
                        <button 
                          onClick={handleTakeTest}
                          className="w-full bg-[#581c87] hover:bg-[#6b21a8] text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.98] cursor-pointer"
                        >
                          Làm bài Test năng lực (3 phút)
                        </button>
                        <button 
                          onClick={handleSkipTest}
                          className="w-full bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold py-3.5 px-6 rounded-xl transition-all border border-slate-200 active:scale-[0.98] cursor-pointer"
                        >
                          Bỏ qua, tạo lộ trình tạm thời
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {step === 3 && (
                    <motion.div 
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className="flex flex-col h-full justify-center text-center py-4"
                    >
                      <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-black text-slate-800 mb-3">Lưu lộ trình của bạn</h3>
                      <p className="text-slate-500 text-[14px] leading-relaxed mb-8 px-4">
                        Lộ trình của bạn đã được khởi tạo! Hãy đăng nhập để chúng tôi lưu lại tiến độ học tập hàng ngày cho bạn nhé.
                      </p>
                      
                      <div className="space-y-3 mt-auto">
                        <button 
                          onClick={() => { window.location.href = `/login?callbackUrl=/toeic-practice` }}
                          className="w-full bg-[#581c87] hover:bg-[#6b21a8] text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.98] cursor-pointer"
                        >
                          Đăng nhập / Đăng ký
                        </button>
                        <button 
                          onClick={() => finalizeOnboarding(selectedLevel)}
                          className="w-full bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold py-3.5 px-6 rounded-xl transition-all border border-slate-200 active:scale-[0.98] cursor-pointer"
                        >
                          Học thử ẩn danh
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}
