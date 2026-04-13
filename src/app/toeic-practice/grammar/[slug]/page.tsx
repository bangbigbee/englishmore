'use client'

import React, { useState, useEffect, use, useCallback, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { toast } from 'sonner'

interface ToeicQuestion {
  id: string
  question: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string | null
  correctOption: string
  explanation: string | null
}

interface ToeicLesson {
  id: string
  title: string
  order: number
  content: string | null
  questions: ToeicQuestion[]
}

interface ToeicTopic {
  id: string
  title: string
  subtitle: string | null
  slug: string
  lessons: ToeicLesson[]
}

export default function ToeicGrammarPracticePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [topic, setTopic] = useState<ToeicTopic | null>(null)
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Quiz states
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({})
  const [showResults, setShowResults] = useState<Record<string, boolean>>({})
  const [showLessonContent, setShowLessonContent] = useState(false)
  const [correctStreak, setCorrectStreak] = useState(0)
  const [timerStartTime, setTimerStartTime] = useState<number | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [isTestCompleted, setIsTestCompleted] = useState(false)
  const { data: session, status } = useSession()
  const [isSyncing, setIsSyncing] = useState(false)
  const router = useRouter()
  const retryingLessonsRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    const fetchTopic = async () => {
      try {
        const res = await fetch(`/api/toeic/grammar/${slug}`)
        if (!res.ok) throw new Error('Could not fetch topic')
        const data = await res.json()
        setTopic(data)
        if (data.lessons && data.lessons.length > 0) {
          setSelectedLessonId(data.lessons[0].id)
          setActiveQuestionIndex(0)
          setShowLessonContent(data.lessons[0].questions.length === 0)
          setTimerStartTime(Date.now())
          setElapsedTime(0)
          setIsTestCompleted(false)
        }
      } catch (error) {
        console.error(error)
        toast.error('Không thể tải nội dung bài học.')
      } finally {
        setLoading(false)
      }
    }
    fetchTopic()
  }, [slug])

  // Persistence Logic: Load
  const loadProgress = useCallback(async (lessonId: string) => {
    if (status === 'loading') return
    if (retryingLessonsRef.current.has(lessonId)) return

    if (status === 'authenticated') {
      try {
        const res = await fetch(`/api/toeic/progress?lessonId=${lessonId}`)
        if (res.ok) {
          const data = await res.json()
          const answers: Record<string, string> = {}
          const results: Record<string, boolean> = {}
          
          Object.keys(data).forEach(qId => {
            answers[qId] = data[qId].selected
            results[qId] = true // Since it's in DB, we've already "checked" it
          })
          
          setUserAnswers(prev => ({ ...prev, ...answers }))
          setShowResults(prev => ({ ...prev, ...results }))
        }
      } catch (error) {
        console.error('Error loading DB progress:', error)
      }
    } else {
      // Guest: Load from LocalStorage
      try {
        const stored = localStorage.getItem('toeic_guest_progress')
        if (stored) {
          const allData = JSON.parse(stored)
          const lessonData = allData[lessonId] || {}
          
          const answers: Record<string, string> = {}
          const results: Record<string, boolean> = {}
          
          Object.keys(lessonData).forEach(qId => {
            answers[qId] = lessonData[qId].selected
            results[qId] = true
          })
          
          setUserAnswers(prev => ({ ...prev, ...answers }))
          setShowResults(prev => ({ ...prev, ...results }))
        }
      } catch (error) {
        console.error('Error loading local progress:', error)
      }
    }
  }, [status, session])

  // Persistence Logic: Sync guest data to account
  useEffect(() => {
    const syncData = async () => {
      if (status !== 'authenticated' || isSyncing) return
      
      const stored = localStorage.getItem('toeic_guest_progress')
      if (!stored) return

      try {
        setIsSyncing(true)
        const allData = JSON.parse(stored)
        const flatAnswers: any[] = []
        
        Object.keys(allData).forEach(lId => {
          Object.keys(allData[lId]).forEach(qId => {
            flatAnswers.push({
              questionId: qId,
              selectedOption: allData[lId][qId].selected,
              isCorrect: allData[lId][qId].isCorrect
            })
          })
        })

        if (flatAnswers.length > 0) {
          const res = await fetch('/api/toeic/progress/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ answers: flatAnswers })
          })
          
          if (res.ok) {
            localStorage.removeItem('toeic_guest_progress')
            toast.success('Đã đồng bộ tiến độ luyện tập vào tài khoản của bạn!')
            // Trigger a reload of current lesson progress
            if (selectedLessonId) loadProgress(selectedLessonId)
          }
        }
      } catch (error) {
        console.error('Error syncing progress:', error)
      } finally {
        setIsSyncing(false)
      }
    }
    
    syncData()
  }, [status, selectedLessonId, loadProgress, isSyncing])

  // Load progress when lesson changes
  useEffect(() => {
    if (selectedLessonId) {
      loadProgress(selectedLessonId)
    }
  }, [selectedLessonId, loadProgress])

  const currentLesson = topic?.lessons.find(l => l.id === selectedLessonId)

  // Monitor progress for Test Completion and Timer Start
  useEffect(() => {
    if (currentLesson && currentLesson.questions.length > 0) {
      const answeredCount = Object.keys(showResults).filter(k => currentLesson.questions.some(q => q.id === k)).length
      if (answeredCount === currentLesson.questions.length) {
        setIsTestCompleted(true)
      } else if (!timerStartTime) {
        setTimerStartTime(Date.now())
      }
    }
  }, [showResults, currentLesson, timerStartTime])

  // Timer interval
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (timerStartTime && !isTestCompleted) {
      timer = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - timerStartTime) / 1000))
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [timerStartTime, isTestCompleted])

  const handleSelectOption = (questionId: string, option: string) => {
    if (showResults[questionId]) return
    setUserAnswers(prev => ({ ...prev, [questionId]: option }))
  }

  const handleCheckAnswer = async (questionId: string) => {
    if (!userAnswers[questionId]) {
      toast.warning('Vui lòng chọn một đáp án!')
      return
    }
    
    const q = currentLesson?.questions.find(quest => quest.id === questionId)
    if (!q) return

    const selectedOption = userAnswers[questionId]
    const isCorrect = selectedOption === q.correctOption

    setShowResults(prev => ({ ...prev, [questionId]: true }))

    let newStreak = 0;
    if (isCorrect) {
      newStreak = correctStreak + 1;
      setCorrectStreak(newStreak);
      if (newStreak === 1) {
        toast('Tốt lắm, tiếp tục nào!', { duration: 7000, icon: '✨', style: { background: '#14532d', color: '#fff', border: 'none', fontWeight: 'bold' }});
        new Audio('/audio/toeic-correct-ting-sound.mp3').play().catch(() => {});
      } else if (newStreak === 2) {
        toast('Tiếp tục nào, bạn đã đúng 2 câu liên tiếp rồi!', { duration: 7000, icon: '🔥', style: { background: '#ea980c', color: '#fff', border: 'none', fontWeight: 'bold' }});
        new Audio('/audio/toeic-correct-ting-sound.mp3').play().catch(() => {});
      } else if (newStreak >= 3) {
        toast('Bạn thật tuyệt vời. Cố gắng phát huy nhé.', { duration: 7000, icon: '🌟', style: { background: '#f59e0b', color: '#fff', border: 'none', fontWeight: 'bold' }});
        new Audio('/audio/toeic-correct-ting-sound.mp3').play().catch(() => {});
        if (status !== 'authenticated' && (newStreak === 3 || newStreak === 10)) {
           setTimeout(() => {
             const currentPath = window.location.pathname;
             router.push(`${currentPath}?login=true&allowGuest=true&subtitle=${encodeURIComponent('Đăng nhập để lưu giữ tiến độ và nhận điểm thưởng học tập nhé.')}&callbackUrl=${encodeURIComponent(currentPath)}`, { scroll: false });
           }, 1500)
        }
      }
    } else {
      setCorrectStreak(0);
      new Audio('/audio/toeic-incorrect-sound.mp3').play().catch(() => {});
    }

    // Persist
    if (status === 'authenticated') {
      try {
        const res = await fetch('/api/toeic/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ questionId, selectedOption, isCorrect, currentStreak: newStreak })
        })
        const data = await res.json()
        if (res.ok && data.awardedPoints) {
          if (data.awardReason) {
            toast.success(data.awardReason, { duration: 5000, style: { background: '#f0fdf4', color: '#14532d', border: '1px solid #bbf7d0' } });
          } else {
            toast.success(`Chúc mừng! Bạn nhận được ${data.awardedPoints} APs.`, { duration: 5000, style: { background: '#f0fdf4', color: '#14532d', border: '1px solid #bbf7d0' } })
          }
        }
      } catch (error) {
        console.error('Error saving progress:', error)
      }
    } else {
      // Guest: Save to LocalStorage
      try {
        const stored = localStorage.getItem('toeic_guest_progress') || '{}'
        const allData = JSON.parse(stored)
        if (!selectedLessonId) return
        
        if (!allData[selectedLessonId]) allData[selectedLessonId] = {}
        allData[selectedLessonId][questionId] = { selected: selectedOption, isCorrect }
        
        localStorage.setItem('toeic_guest_progress', JSON.stringify(allData))
      } catch (error) {
        console.error('Error saving local progress:', error)
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#14532d] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600 font-medium">Đang tải bài học...</p>
        </div>
      </div>
    )
  }

  if (!topic) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Oops! Không tìm thấy bài học này.</h1>
          <Link href="/toeic-practice" className="text-[#14532d] hover:underline">Quay lại trang chính</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/toeic-practice"
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div className="flex flex-col">
              <h1 className="font-black text-slate-900 text-sm md:text-base leading-tight">{topic.title}</h1>
              <p className="hidden md:block text-[10px] font-bold text-slate-400 uppercase tracking-widest">{topic.subtitle || 'TOEIC Grammar'}</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-4">
            <div className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-100 uppercase tracking-wider">
              Grammar Practice
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row min-h-[calc(100vh-64px)]">
        {/* Sidebar */}
        <aside className="w-full md:w-80 bg-white border-r border-slate-200 sticky top-16 h-fit md:h-[calc(100vh-64px)] overflow-y-auto">
          <div className="p-4 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Danh sách bài học</h2>
          </div>
          <nav className="p-2 space-y-1">
            {topic.lessons.map((lesson) => (
              <button
                key={lesson.id}
                onClick={() => {
                  setSelectedLessonId(lesson.id)
                  setActiveQuestionIndex(0)
                  setShowLessonContent(lesson.questions.length === 0)
                  setTimerStartTime(Date.now())
                  setElapsedTime(0)
                  setIsTestCompleted(false)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                className={`w-full text-left p-4 rounded-xl transition-all duration-200 group flex items-start gap-4 cursor-pointer ${
                  selectedLessonId === lesson.id
                    ? 'bg-[#14532d] text-white shadow-lg shadow-[#14532d]/20 ring-1 ring-[#14532d]'
                    : 'hover:bg-slate-100 text-slate-700 hover:translate-x-1'
                }`}
              >
                <div className={`w-8 h-8 shrink-0 flex items-center justify-center rounded-lg font-bold text-sm ${
                  selectedLessonId === lesson.id ? 'bg-white/20' : 'bg-slate-100 text-slate-500 group-hover:bg-[#14532d]/10'
                }`}>
                  {lesson.order}
                </div>
                <div className="min-w-0">
                  <div className={`font-bold text-sm leading-tight ${selectedLessonId === lesson.id ? 'text-white' : 'text-slate-800'}`}>
                    {lesson.title}
                  </div>
                  <div className={`text-[11px] mt-1 ${selectedLessonId === lesson.id ? 'text-white/60' : 'text-slate-500'}`}>
                    {lesson.questions.length} câu hỏi luyện tập
                  </div>
                </div>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 lg:p-12">
          <div className="max-w-3xl mx-auto">
            <AnimatePresence mode="wait">
              {currentLesson ? (
                <motion.div
                  key={currentLesson.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Compact Lesson Header & Toggle */}
                  <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-black text-[#14532d]/20 select-none">#{currentLesson.order}</span>
                      <h2 className="text-xl font-black text-slate-900 leading-tight">{currentLesson.title}</h2>
                      {!isTestCompleted && timerStartTime !== null && (
                        <span className="ml-2 tabular-nums text-emerald-700 font-mono font-bold bg-emerald-50 px-2 py-1 rounded border border-emerald-100 text-sm">
                          {Math.floor(elapsedTime / 60).toString().padStart(2, '0')}:{(elapsedTime % 60).toString().padStart(2, '0')}
                        </span>
                      )}
                    </div>
                    {currentLesson.questions.length > 0 && (
                      <button 
                        onClick={() => setShowLessonContent(!showLessonContent)}
                        className="text-xs font-bold text-[#14532d] hover:bg-[#14532d]/5 px-3 py-1.5 rounded-lg border border-[#14532d]/20 transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <svg className={`w-4 h-4 transition-transform ${showLessonContent ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                        {showLessonContent ? 'Ẩn lý thuyết' : 'Xem lý thuyết'}
                      </button>
                    )}
                  </div>

                  <AnimatePresence>
                    {showLessonContent && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden mb-8"
                      >
                        <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100/50">
                          <div className="prose prose-slate max-w-none prose-headings:font-black prose-p:text-slate-600 prose-p:leading-relaxed prose-li:text-slate-600">
                            <div className="whitespace-pre-wrap text-slate-700 leading-relaxed text-sm md:text-base">
                              {currentLesson.content || 'Nội dung đang được cập nhật...'}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Focused Paginated Quiz Section */}
                  {currentLesson.questions.length > 0 && (
                    <section className="mt-8">
                      <div className="mb-6 flex flex-wrap gap-1.5 justify-center md:justify-start">
                        {currentLesson.questions.map((_, idx) => {
                          const isActive = idx === activeQuestionIndex
                          const isAnswered = !!userAnswers[currentLesson.questions[idx].id]
                          
                          return (
                            <button 
                              key={idx}
                              onClick={() => setActiveQuestionIndex(idx)}
                              className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs transition-all duration-200 cursor-pointer border ${
                                isActive 
                                  ? 'bg-[#14532d] border-[#14532d] text-white shadow-md scale-110 z-10' 
                                  : isAnswered
                                    ? 'bg-emerald-50 border-emerald-200 text-[#14532d]'
                                    : 'bg-white border-slate-200 text-slate-400 hover:border-[#14532d]/30 hover:text-[#14532d]'
                              }`}
                            >
                              {idx + 1}
                            </button>
                          )
                        })}
                      </div>

                      <AnimatePresence mode="wait">
                        {(() => {
                          const q = currentLesson.questions[activeQuestionIndex]
                          if (!q) return null
                          const isShowingResult = showResults[q.id]
                          const selectedOption = userAnswers[q.id]
                          const isCorrect = selectedOption === q.correctOption

                          return (
                            <motion.div
                              key={q.id}
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -20 }}
                              transition={{ duration: 0.2 }}
                              className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 p-6 md:p-10 relative overflow-hidden"
                            >
                              <div className="absolute top-0 left-0 w-full h-1 bg-slate-100">
                                <motion.div 
                                  className="h-full bg-[#14532d]"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${((activeQuestionIndex + 1) / currentLesson.questions.length) * 100}%` }}
                                />
                              </div>

                              <div className="mb-8">
                                <p className="text-xl md:text-2xl font-black text-slate-800 leading-snug text-center">
                                  {q.question}
                                </p>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                  { label: 'A', value: q.optionA },
                                  { label: 'B', value: q.optionB },
                                  { label: 'C', value: q.optionC },
                                  { label: 'D', value: q.optionD },
                                ].map((opt) => {
                                  if (opt.label === 'D' && !opt.value) return null
                                  
                                  let buttonClass = "flex items-center gap-4 p-5 rounded-2xl border-2 transition-all duration-200 text-left "
                                  
                                  if (isShowingResult) {
                                    if (opt.label === q.correctOption) {
                                      buttonClass += "bg-emerald-50 border-emerald-500 text-emerald-900 ring-4 ring-emerald-500/10"
                                    } else if (opt.label === selectedOption) {
                                      buttonClass += "bg-rose-50 border-rose-500 text-rose-900"
                                    } else {
                                      buttonClass += "bg-white border-slate-50 opacity-40 shadow-none scale-95"
                                    }
                                  } else {
                                    if (selectedOption === opt.label) {
                                      buttonClass += "bg-[#14532d] border-[#14532d] text-white shadow-lg shadow-[#14532d]/30 scale-[1.02]"
                                    } else {
                                      buttonClass += "bg-white border-slate-100 hover:border-[#14532d]/30 hover:bg-slate-50 hover:shadow-md"
                                    }
                                  }

                                  return (
                                    <button
                                      key={opt.label}
                                      onClick={() => handleSelectOption(q.id, opt.label)}
                                      disabled={isShowingResult}
                                      className={buttonClass + " cursor-pointer"}
                                    >
                                      <span className={`w-10 h-10 shrink-0 flex items-center justify-center rounded-xl font-black text-lg ${
                                        selectedOption === opt.label 
                                          ? (isShowingResult ? (opt.label === q.correctOption ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white') : 'bg-white text-[#14532d]') 
                                          : 'bg-slate-100 text-slate-500 group-hover:bg-[#14532d]/10'
                                      }`}>
                                        {opt.label}
                                      </span>
                                      <span className="font-bold text-base">{opt.value}</span>
                                    </button>
                                  )
                                })}
                              </div>

                              <div className="mt-10 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => setActiveQuestionIndex(prev => Math.max(0, prev - 1))}
                                    disabled={activeQuestionIndex === 0}
                                    className="px-5 py-3 rounded-2xl border-2 border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700 hover:bg-slate-50 disabled:opacity-30 transition-all font-bold text-sm flex items-center gap-2 cursor-pointer shadow-sm"
                                  >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                                    Trước đó
                                  </button>
                                  <button
                                    onClick={() => setActiveQuestionIndex(prev => Math.min(currentLesson.questions.length - 1, prev + 1))}
                                    disabled={activeQuestionIndex === currentLesson.questions.length - 1}
                                    className="px-5 py-3 rounded-2xl border-2 border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700 hover:bg-slate-50 disabled:opacity-30 transition-all font-bold text-sm flex items-center gap-2 cursor-pointer shadow-sm"
                                  >
                                    Tiếp theo
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                                  </button>
                                </div>

                                {!isShowingResult ? (
                                  <button
                                    onClick={() => handleCheckAnswer(q.id)}
                                    className="w-full md:w-auto px-10 py-4 bg-[#14532d] text-white font-black rounded-2xl hover:bg-[#166534] shadow-xl shadow-[#14532d]/30 transition-all hover:-translate-y-1 active:scale-95 cursor-pointer"
                                  >
                                    Kiểm tra đáp án
                                  </button>
                                ) : (
                                  <div className={`p-4 rounded-2xl border-2 flex items-center gap-3 ${isCorrect ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'}`}>
                                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                                      {isCorrect ? (
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                      ) : (
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                                      )}
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-[10px] font-black  uppercase tracking-widest leading-none">Kết quả</span>
                                      <span className="font-bold text-sm text-slate-800">{isCorrect ? 'Correct!' : 'Incorrect!'}</span>
                                    </div>
                                    {q.explanation && (
                                      <div className="ml-4 pl-4 border-l-2 border-current/30 hidden lg:block max-w-lg">
                                        <p className="text-sm font-medium italic text-slate-700 opacity-90 leading-relaxed">{q.explanation}</p>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                              
                              {isShowingResult && q.explanation && (
                                <motion.div 
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="mt-6 p-5 sm:p-6 bg-slate-50 rounded-2xl border border-slate-200 lg:hidden"
                                >
                                  <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3">Giải thích chi tiết</p>
                                  <p className="text-[15px] font-medium text-slate-700 leading-relaxed italic">{q.explanation}</p>
                                </motion.div>
                              )}
                            </motion.div>
                          )
                        })()}
                      </AnimatePresence>
                    </section>
                  )}
                </motion.div>
              ) : (
                <div className="h-64 flex items-center justify-center text-slate-400 italic">
                  Chọn bài học để bắt đầu luyện tập.
                </div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>

      {isTestCompleted && currentLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center"
          >
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-emerald-50">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2">Hoàn thành bài thi!</h3>
            <p className="text-slate-600 mb-6 leading-relaxed">
              {elapsedTime > 0 ? (
                <>Chúc mừng bạn đã hoàn thành bài thi trong <strong className="text-emerald-700">{Math.floor(elapsedTime / 60)} phút {elapsedTime % 60} giây</strong>.<br/></>
              ) : (
                <>Bạn đã gửi toàn bộ bài thi.<br/></>
              )}
              Bạn đã đúng <strong className="text-emerald-700 text-xl">{currentLesson.questions.filter(q => userAnswers[q.id] === q.correctOption).length}</strong> / <strong>{currentLesson.questions.length}</strong> câu.
            </p>
            <div className="flex flex-col gap-3">
              {topic && topic.lessons.findIndex(l => l.id === selectedLessonId) < topic.lessons.length - 1 ? (
                <button
                  onClick={() => {
                    const nextLesson = topic.lessons[topic.lessons.findIndex(l => l.id === selectedLessonId) + 1]
                    setSelectedLessonId(nextLesson.id)
                    setActiveQuestionIndex(0)
                    setShowLessonContent(nextLesson.questions.length === 0)
                    setTimerStartTime(Date.now())
                    setElapsedTime(0)
                    setIsTestCompleted(false)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  className="w-full py-3.5 bg-[#14532d] hover:bg-[#166534] text-white font-bold rounded-xl transition-all hover:-translate-y-0.5 cursor-pointer shadow-md shadow-[#14532d]/20"
                >
                  Bài Tiếp Theo &rarr;
                </button>
              ) : (
                <Link href="/toeic-practice" className="w-full py-3.5 bg-[#14532d] hover:bg-[#166534] text-white font-bold rounded-xl transition-all hover:-translate-y-0.5 inline-block cursor-pointer shadow-md shadow-[#14532d]/20">
                  Về danh sách chủ đề
                </Link>
              )}

              <button
                onClick={() => {
                  retryingLessonsRef.current.add(currentLesson.id);
                  const newAnswers = { ...userAnswers };
                  const newResults = { ...showResults };
                  currentLesson.questions.forEach(q => {
                    delete newAnswers[q.id];
                    delete newResults[q.id];
                  });
                  setUserAnswers(newAnswers);
                  setShowResults(newResults);
                  setIsTestCompleted(false);
                  setTimerStartTime(Date.now());
                  setElapsedTime(0);
                  setActiveQuestionIndex(0);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full py-3 text-[#14532d] hover:bg-emerald-50 font-bold rounded-xl transition-colors cursor-pointer mt-1"
              >
                Làm Lại
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
