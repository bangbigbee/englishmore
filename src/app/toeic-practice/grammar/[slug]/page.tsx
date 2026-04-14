'use client'

import React, { useState, useEffect, use, useCallback, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { toast } from 'sonner'
import UpgradeModal from '@/components/UpgradeModal'

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
  accessTier: 'FREE' | 'PRO' | 'ULTRA'
  theoryAccessTier: 'FREE' | 'PRO' | 'ULTRA'
  explanationAccessTier: 'FREE' | 'PRO' | 'ULTRA'
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
  const [isReviewing, setIsReviewing] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [showPricing, setShowPricing] = useState(false)

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

        const localAps = parseInt(localStorage.getItem('toeic_guest_aps') || '0', 10)

        if (flatAnswers.length > 0 || localAps > 0) {
          const res = await fetch('/api/toeic/progress/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ answers: flatAnswers, localAps })
          })
          
          if (res.ok) {
            localStorage.removeItem('toeic_guest_progress')
            localStorage.removeItem('toeic_guest_aps')
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

  const handleSelectOption = async (questionId: string, option: string) => {
    if (showResults[questionId]) return
    setUserAnswers(prev => ({ ...prev, [questionId]: option }))

    const q = currentLesson?.questions.find(quest => quest.id === questionId)
    if (!q) return

    const selectedOption = option
    const isCorrect = selectedOption === q.correctOption

    setShowResults(prev => ({ ...prev, [questionId]: true }))

    let newStreak = 0;
    if (isCorrect) {
      newStreak = correctStreak + 1;
      setCorrectStreak(newStreak);
      new Audio('/audio/toeic-correct-ting-sound.mp3').play().catch(() => {});
      if (newStreak >= 3) {
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
          setTimeout(() => {
            new Audio('/audio/amazing-reward-sound.mp3').play().catch(() => {});
            if (data.awardReason) {
              toast.success(data.awardReason, { position: 'top-right', duration: 7000, style: { background: '#f0fdf4', color: '#14532d', border: '1px solid #bbf7d0' } });
            } else {
              toast.success(`Chúc mừng! Bạn nhận được ${data.awardedPoints} APs.`, { position: 'top-right', duration: 7000, style: { background: '#f0fdf4', color: '#14532d', border: '1px solid #bbf7d0' } })
            }
          }, 1000);
        }
      } catch (error) {
        console.error('Error saving progress:', error)
      }
    } else {
      // Guest: Save to LocalStorage
      try {
        const stored = localStorage.getItem('toeic_guest_progress') || '{}'
        const allData = JSON.parse(stored)
        if (selectedLessonId) {
            if (!allData[selectedLessonId]) allData[selectedLessonId] = {}
            allData[selectedLessonId][questionId] = { selected: selectedOption, isCorrect }
            localStorage.setItem('toeic_guest_progress', JSON.stringify(allData))
        }
      } catch (error) {
        console.error('Error saving local progress:', error)
      }
    }

    // Trigger local fake AP for guests or authenticated users who are NOT members
    const isMember = status === 'authenticated' && session?.user?.role === 'member';
    if (!isMember) {
        const todayDateStr = new Date().toISOString().split('T')[0];
        const awardedKey = `guest_ap_awarded_${currentLesson?.id}_${todayDateStr}`;
        const hasAwardedToday = localStorage.getItem(awardedKey) === 'true';

        let fakeAp = 0;
        let fakeReason = '';
        
        if (!hasAwardedToday) {
            if (isCorrect) {
                if (newStreak === 3) { fakeAp = 2; fakeReason = "Excellent! You've got 2 APs for 3-point streak."; }
                else if (newStreak === 5) { fakeAp = 3; fakeReason = "Excellent! You've got 3 APs for 5-point streak."; }
                else if (newStreak === 10) { fakeAp = 5; fakeReason = "Excellent! You've got 5 APs for 10-point streak."; }
            }
            
            const newShowResults = { ...showResults, [questionId]: true };
            const answeredCount = Object.keys(newShowResults).filter(k => currentLesson?.questions.some(q => q.id === k)).length;
            if (currentLesson && answeredCount === currentLesson.questions.length && currentLesson.questions.length > 0) {
                fakeAp += 15;
                if (fakeReason) fakeReason += " ";
                fakeReason += "Congratulations! You've got 15 APs for completing the quiz.";
                
                // Mark as completed for today to prevent unlimited farming
                localStorage.setItem(awardedKey, 'true');
            }

            if (fakeAp > 0) {
                try {
                    const currentLocalAps = parseInt(localStorage.getItem('toeic_guest_aps') || '0', 10);
                    localStorage.setItem('toeic_guest_aps', (currentLocalAps + fakeAp).toString());
                } catch (error) {}

                setTimeout(() => {
                   new Audio('/audio/amazing-reward-sound.mp3').play().catch(() => {});
                   toast.success(fakeReason, { position: 'top-right', duration: 7000, style: { background: '#f0fdf4', color: '#14532d', border: '1px solid #bbf7d0' } });
                }, 1000);
            }
        }
    }
  }

  const handleRestartLesson = async () => {
    if (!currentLesson) return;
    const lessonId = currentLesson.id;
    
    // Clear persistent storage properly
    if (status === 'authenticated') {
      try {
        await fetch(`/api/toeic/progress?lessonId=${lessonId}`, { method: 'DELETE' });
      } catch (e) {
        console.error('Error clearing remote progress');
      }
    } else {
      try {
        const stored = localStorage.getItem('toeic_guest_progress');
        if (stored) {
          const allData = JSON.parse(stored);
          if (allData[lessonId]) {
            delete allData[lessonId];
            localStorage.setItem('toeic_guest_progress', JSON.stringify(allData));
          }
        }
      } catch (e) {}
    }

    // Clear client state
    if (retryingLessonsRef.current) {
        retryingLessonsRef.current.add(lessonId);
    }
    
    const newAnswers = { ...userAnswers };
    const newResults = { ...showResults };
    currentLesson.questions.forEach(q => {
      delete newAnswers[q.id];
      delete newResults[q.id];
    });
    setUserAnswers(newAnswers);
    setShowResults(newResults);
    
    setIsTestCompleted(false);
    setIsReviewing(false);
    setTimerStartTime(Date.now());
    setElapsedTime(0);
    setActiveQuestionIndex(0);
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
        <aside className="w-full md:w-80 bg-white border-b md:border-b-0 md:border-r border-slate-200 md:sticky md:top-16 md:h-[calc(100vh-64px)] md:overflow-y-auto">
          <div 
            className="p-4 border-b border-slate-100 flex justify-between items-center cursor-pointer md:cursor-default"
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          >
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Danh sách bài học</h2>
            <svg className={`w-5 h-5 text-slate-400 md:hidden transition-transform ${isMobileSidebarOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          <nav className={`p-2 space-y-1 ${isMobileSidebarOpen ? 'block' : 'hidden md:block'}`}>
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
                  setIsMobileSidebarOpen(false)
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
                <div className="min-w-0 flex-1">
                  <div className={`font-bold text-sm leading-tight flex items-center gap-2 ${selectedLessonId === lesson.id ? 'text-white' : 'text-slate-800'}`}>
                    <span className="truncate">{lesson.title}</span>
                    {lesson.accessTier === 'PRO' && (
                      <span className="shrink-0 px-1.5 py-0.5 bg-gradient-to-r from-[#FFD700] to-[#FDB931] text-[#594300] border border-[#FDB931] text-[9px] font-black uppercase tracking-widest rounded shadow-sm">
                        PRO
                      </span>
                    )}
                    {lesson.accessTier === 'ULTRA' && (
                      <span className="shrink-0 px-1.5 py-0.5 bg-gradient-to-r from-emerald-500 to-[#14532d] border border-[#14532d] text-white text-[9px] font-black uppercase tracking-widest rounded shadow-sm">
                        ULTRA
                      </span>
                    )}
                  </div>
                  <div className={`text-[11px] mt-1 ${selectedLessonId === lesson.id ? 'text-white/60' : 'text-slate-500'}`}>
                    {lesson.questions.length} câu hỏi luyện tập
                  </div>
                </div>
                {(() => {
                  const lessonTierLevel = lesson.accessTier === 'ULTRA' ? 3 : lesson.accessTier === 'PRO' ? 2 : 1;
                  const userTierLevel = session?.user?.role === 'admin' ? 10 : session?.user?.tier === 'ULTRA' ? 3 : (session?.user?.tier === 'PRO' || session?.user?.role === 'member') ? 2 : 1;
                  return lessonTierLevel > userTierLevel && (
                    <div className="shrink-0" onClick={(e) => { e.stopPropagation(); setShowPricing(true); }}>
                      <svg className="w-4 h-4 text-slate-400 opacity-60 cursor-pointer hover:text-amber-500 transition-colors" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                    </div>
                  );
                })()}
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
                      <h2 className="text-xl font-black text-slate-900 leading-tight flex items-center gap-2">
                        <span>{currentLesson.title}</span>
                        {currentLesson.accessTier === 'PRO' && <span className="px-2 py-0.5 bg-gradient-to-r from-[#FFD700] to-[#FDB931] text-[#594300] border border-[#FDB931] text-[10px] font-black uppercase tracking-widest rounded-md shadow-sm">PRO</span>}
                        {currentLesson.accessTier === 'ULTRA' && <span className="px-2 py-0.5 bg-gradient-to-r from-emerald-500 to-[#14532d] border border-[#14532d] text-white text-[10px] font-black uppercase tracking-widest rounded-md shadow-sm">ULTRA</span>}
                      </h2>
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
                        {(() => {
                           const theoryTierLevel = currentLesson.theoryAccessTier === 'ULTRA' ? 3 : currentLesson.theoryAccessTier === 'PRO' ? 2 : 1;
                           const userTierLevel = session?.user?.role === 'admin' ? 10 : session?.user?.tier === 'ULTRA' ? 3 : (session?.user?.tier === 'PRO' || session?.user?.role === 'member') ? 2 : 1;
                           const isLocked = theoryTierLevel > userTierLevel;
                           return (
                             <div className="relative">
                               <div className={`bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100/50 ${isLocked ? 'blur-sm pointer-events-none opacity-40 select-none' : ''}`}>
                                 <div className="prose prose-slate max-w-none prose-headings:font-black prose-p:text-slate-600 prose-p:leading-relaxed prose-li:text-slate-600">
                                   <div className="whitespace-pre-wrap text-slate-700 leading-relaxed text-sm md:text-base">
                                     {currentLesson.content || 'Nội dung đang được cập nhật...'}
                                   </div>
                                 </div>
                               </div>
                               {isLocked && (
                                  <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-4">
                                    <div className="bg-white/95 backdrop-blur-md p-5 rounded-2xl shadow-xl border border-slate-200/60 flex flex-col items-center text-center max-w-xs transform transition-all hover:scale-105">
                                      <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-3">
                                        <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                      </div>
                                      <p className="text-slate-800 mb-4 text-sm font-medium leading-relaxed">Nội dung lý thuyết yêu cầu gói <strong className="text-amber-600 font-extrabold">{currentLesson.theoryAccessTier}</strong></p>
                                      <button onClick={() => setShowPricing(true)} className="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-all active:scale-95 w-full">Nâng Cấp Ngay</button>
                                    </div>
                                  </div>
                               )}
                             </div>
                           )
                        })()}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Focused Paginated Quiz Section */}
                  {currentLesson.questions.length > 0 && (
                    <section className="mt-8">
                      <div className="mb-6 flex flex-row items-center justify-between gap-4 w-full">
                        <div className="flex flex-wrap gap-1.5 justify-start flex-1 min-w-0">
                          {currentLesson.questions.map((_, idx) => {
                          const isActive = idx === activeQuestionIndex
                          const q = currentLesson.questions[idx]
                          const isShowingResult = !!showResults[q.id]
                          const isCorrect = userAnswers[q.id] === q.correctOption

                          let btnStyle = ''
                          if (isActive) {
                             btnStyle = 'bg-[#14532d] border-[#14532d] text-white shadow-md scale-110 z-10'
                          } else if (isShowingResult) {
                             btnStyle = isCorrect ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-red-50 border-red-500 text-red-700'
                          } else if (userAnswers[q.id]) {
                             btnStyle = 'bg-emerald-50 border-emerald-200 text-[#14532d]'
                          } else {
                             btnStyle = 'bg-white border-slate-200 text-slate-400 hover:border-[#14532d]/30 hover:text-[#14532d]'
                          }
                          
                          return (
                            <button 
                              key={idx}
                              onClick={() => setActiveQuestionIndex(idx)}
                              className={`w-8 h-8 flex-shrink-0 rounded-lg flex items-center justify-center font-bold text-xs transition-all duration-200 cursor-pointer border-2 ${btnStyle}`}
                            >
                              {idx + 1}
                            </button>
                          )
                        })}
                        </div>

                        <button
                          onClick={handleRestartLesson}
                          className="group flex flex-none items-center justify-center w-8 h-8 rounded-full border-2 border-slate-200 text-slate-400 hover:text-[#14532d] hover:border-[#14532d] hover:bg-emerald-50 transition-all cursor-pointer relative"
                          title="Làm Lại Bài"
                        >
                          <svg className="w-4 h-4 transition-transform group-hover:-rotate-180 duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                          <span className="absolute right-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-xs font-bold text-[#14532d] pointer-events-none">Làm Lại Bài</span>
                        </button>
                      </div>

                      <AnimatePresence mode="wait">
                        {(() => {
                          const q = currentLesson.questions[activeQuestionIndex]
                          if (!q) return null
                          const isShowingResult = showResults[q.id]
                          const selectedOption = userAnswers[q.id]
                          const isCorrect = selectedOption === q.correctOption
                          const explanationText = status !== 'authenticated' && activeQuestionIndex >= 4 ? 'Đăng nhập để xem phần giải thích.' : q.explanation;

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
                                  
                                  let buttonClass = "flex items-center gap-3 md:gap-4 px-4 py-3 md:py-3.5 rounded-xl border-[1.5px] transition-all duration-200 text-left "
                                  
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
                                      <span className={`w-8 h-8 md:w-10 md:h-10 shrink-0 flex items-center justify-center rounded-lg md:rounded-xl font-black text-base md:text-lg ${
                                        selectedOption === opt.label 
                                          ? (isShowingResult ? (opt.label === q.correctOption ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white') : 'bg-white text-[#14532d]') 
                                          : 'bg-slate-100 text-slate-500 group-hover:bg-[#14532d]/10'
                                      }`}>
                                        {opt.label}
                                      </span>
                                      <span className="font-bold text-[15px] md:text-base leading-tight md:leading-normal">{opt.value}</span>
                                    </button>
                                  )
                                })}
                              </div>

                              <div className="mt-8 flex flex-row items-stretch justify-between gap-2 md:gap-4 w-full">
                                <button
                                  onClick={() => setActiveQuestionIndex(prev => Math.max(0, prev - 1))}
                                  disabled={activeQuestionIndex === 0}
                                  className="h-auto py-3 md:py-0 w-10 md:w-12 md:h-12 rounded-lg border border-slate-200 text-slate-500 hover:border-[#14532d]/40 hover:text-[#14532d] hover:bg-emerald-50 disabled:opacity-30 transition-all flex items-center justify-center cursor-pointer shadow-sm shrink-0 flex-none"
                                  aria-label="Trước đó"
                                >
                                  <svg className="w-5 h-5 md:w-6 md:h-6 stroke-[2px]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                                </button>
                                
                                <div className="flex-1 flex justify-center items-center w-full min-w-0">
                                  {isShowingResult && (
                                    <div className={`h-auto w-full max-w-2xl p-2 md:px-4 md:py-3 rounded-2xl border-2 flex flex-col sm:flex-row items-start sm:items-center gap-2 md:gap-4 text-left ${isCorrect ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'} shadow-sm`}>
                                      <div className="flex items-center gap-2 px-1">
                                        <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0 flex-none">
                                          {isCorrect ? (
                                            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                          ) : (
                                            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                                          )}
                                        </div>
                                        <div className="flex flex-col shrink-0">
                                          <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest leading-none">Kết quả</span>
                                          <span className="font-bold text-xs md:text-sm text-slate-800">{isCorrect ? 'Correct!' : 'Incorrect!'}</span>
                                        </div>
                                      </div>
                                      {explanationText && (
                                        <div className="w-full sm:w-auto flex-1 sm:ml-2 sm:pl-4 sm:border-l-2 border-t-2 sm:border-t-0 p-2 sm:p-0 border-current/20 flex items-center">
                                          {explanationText === 'Đăng nhập để xem phần giải thích.' ? (
                                              <button 
                                                onClick={(e) => {
                                                  e.preventDefault();
                                                  const currentPath = window.location.pathname;
                                                  router.push(`${currentPath}?login=true&allowGuest=true&subtitle=${encodeURIComponent('Đăng nhập để lưu giữ tiến độ và nhận điểm thưởng học tập nhé.')}&callbackUrl=${encodeURIComponent(currentPath)}`, { scroll: false });
                                                }}
                                                className="text-xs md:text-sm font-bold italic text-blue-600 hover:text-blue-800 hover:underline cursor-pointer text-left leading-relaxed outline-none inline w-full"
                                              >
                                                {explanationText}
                                              </button>
                                          ) : (() => {
                                                const explanationTierLevel = currentLesson.explanationAccessTier === 'ULTRA' ? 3 : currentLesson.explanationAccessTier === 'PRO' ? 2 : 1;
                                                const userTierLevel = session?.user?.role === 'admin' ? 10 : session?.user?.tier === 'ULTRA' ? 3 : (session?.user?.tier === 'PRO' || session?.user?.role === 'member') ? 2 : 1;
                                                const isLocked = explanationTierLevel > userTierLevel;
                                                
                                                if (isLocked) {
                                                   return (
                                                      <div className="relative w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50 mt-2">
                                                        <div className="absolute inset-0 blur-md pointer-events-none opacity-40 p-3 select-none text-xs leading-relaxed text-slate-700 whitespace-pre-wrap">
                                                          {explanationText}
                                                        </div>
                                                        <div className="relative z-10 flex py-4 flex-col items-center justify-center min-h-[100px]">
                                                          <button onClick={() => setShowPricing(true)} className="group flex items-center gap-2 bg-white text-slate-800 hover:bg-slate-50 px-4 py-2 rounded-full border border-slate-300 shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer">
                                                             <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                                                               <svg className="w-3.5 h-3.5 text-amber-600 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                                             </div>
                                                             <span className="text-[10px] font-black uppercase tracking-wider text-slate-700">Yêu cầu {currentLesson.explanationAccessTier} để xem giải thích</span>
                                                          </button>
                                                        </div>
                                                      </div>
                                                   )
                                                }
                                                
                                                return (
                                                  <div className="text-xs md:text-[15px] font-medium italic text-slate-700 opacity-90 leading-relaxed max-h-[150px] overflow-y-auto custom-scrollbar">
                                                    {explanationText}
                                                  </div>
                                                )
                                              })()}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>

                                <button
                                  onClick={() => setActiveQuestionIndex(prev => Math.min(currentLesson.questions.length - 1, prev + 1))}
                                  disabled={activeQuestionIndex === currentLesson.questions.length - 1}
                                  className="h-auto py-3 md:py-0 w-10 md:w-12 md:h-12 rounded-lg border border-slate-200 text-slate-500 hover:border-[#14532d]/40 hover:text-[#14532d] hover:bg-emerald-50 disabled:opacity-30 transition-all flex items-center justify-center cursor-pointer shadow-sm shrink-0 flex-none"
                                  aria-label="Tiếp theo"
                                >
                                  <svg className="w-5 h-5 md:w-6 md:h-6 stroke-[2px]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                                </button>
                              </div>
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

      {isTestCompleted && !isReviewing && currentLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center relative"
          >
            <button
               onClick={() => setIsReviewing(true)}
               className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors border-none outline-none cursor-pointer"
               aria-label="Close"
            >
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
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
                    setIsReviewing(false)
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
                  handleRestartLesson();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full py-3 text-[#14532d] hover:bg-emerald-50 font-bold rounded-xl transition-colors cursor-pointer mt-1"
              >
                Làm Lại
              </button>
              
              <button
                onClick={() => {
                  setIsReviewing(true);
                }}
                className="w-full py-2 text-slate-500 hover:bg-slate-50 font-bold rounded-xl transition-colors cursor-pointer mt-1 text-sm"
              >
                Xem lại bài làm
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Pricing Modal for PRO/ULTRA */}
      <UpgradeModal isOpen={showPricing} onClose={() => setShowPricing(false)} />
    </div>
  )
}
