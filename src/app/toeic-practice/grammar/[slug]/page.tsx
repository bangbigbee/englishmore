'use client'

import React, { useState, useEffect, use, useCallback, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
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
  translation: string | null
  audioUrl: string | null
  imageUrl: string | null
  explanation: string | null
}

interface ToeicLesson {
  id: string
  title: string
  order: number
  content: string | null
  directionAudioUrl?: string | null
  accessTier: 'FREE' | 'PRO' | 'ULTRA'
  theoryAccessTier: 'FREE' | 'PRO' | 'ULTRA'
  explanationAccessTier: 'FREE' | 'PRO' | 'ULTRA'
  translationAccessTier: 'FREE' | 'PRO' | 'ULTRA'
  bookmarkAccessTier: 'FREE' | 'PRO' | 'ULTRA'
  questions: ToeicQuestion[]
}

interface ToeicTopic {
  id: string
  type: string
  part: number | null
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
  // Audio playback speed state
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1)
  const [listeningMode, setListeningMode] = useState<'practice' | 'actual' | null>(null)
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({})
  const [showResults, setShowResults] = useState<Record<string, boolean>>({})
  const [showTranslation, setShowTranslation] = useState<Record<string, boolean>>({})
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<Record<string, boolean>>({})
  const [showLessonContent, setShowLessonContent] = useState(false)
  const [correctStreak, setCorrectStreak] = useState(0)
  const [timerStartTime, setTimerStartTime] = useState<number | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [isTestCompleted, setIsTestCompleted] = useState(false)
  const [lessonStarted, setLessonStarted] = useState(false)
  const [isPlayingDirections, setIsPlayingDirections] = useState(false)
  
  // Actual Mode States
  const [actualCheckingMode, setActualCheckingMode] = useState<boolean>(false);
  const [actualCheckTimeLeft, setActualCheckTimeLeft] = useState<number>(30);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState<boolean>(false);
  const [isAudioNodePlaying, setIsAudioNodePlaying] = useState(false)
  const [isZoomedImage, setIsZoomedImage] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const directionAudioRef = useRef<HTMLAudioElement>(null)
  const { data: session, status } = useSession()
  const [isSyncing, setIsSyncing] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialLessonId = searchParams.get('lessonId')
  const retryingLessonsRef = useRef<Set<string>>(new Set())
  const [isReviewing, setIsReviewing] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [showPricing, setShowPricing] = useState(false)
  const [flyingStars, setFlyingStars] = useState<{ id: number, x: number, y: number, startX: number, startY: number, endX: number, endY: number }[]>([])
  const notebookRef = useRef<HTMLAnchorElement>(null)
  const bookmarkBtnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const fetchTopic = async () => {
      try {
        const res = await fetch(`/api/toeic/grammar/${slug}`)
        if (!res.ok) throw new Error('Could not fetch topic')
        const data = await res.json()
        setTopic(data)
        if (data.lessons && data.lessons.length > 0) {
          const targetLesson = data.lessons.find((l: any) => l.id === initialLessonId) || data.lessons[0];
          setSelectedLessonId(targetLesson.id)
          setActiveQuestionIndex(0)
          setShowLessonContent(data.lessons[0].questions.length === 0)
          if (data.type === 'LISTENING') setListeningMode('actual');
          setTimerStartTime(Date.now())
          setElapsedTime(0)
          setIsTestCompleted(false)
          setLessonStarted(false)
          setIsPlayingDirections(false)
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

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/toeic/grammar/bookmark').then(res => res.json()).then(data => {
        if (Array.isArray(data)) {
          const bMap: Record<string, boolean> = {};
          data.forEach((id: string) => bMap[id] = true);
          setBookmarkedQuestions(bMap);
        }
      }).catch(console.error);
    }
  }, [status]);

  const toggleBookmark = async (questionId: string) => {
    if (status !== 'authenticated') {
        const currentPath = window.location.pathname;
        router.push(`${currentPath}?login=true&allowGuest=true&subtitle=${encodeURIComponent('Đăng nhập để lưu trữ câu hỏi khó lại nhé.')}&callbackUrl=${encodeURIComponent(currentPath)}`, { scroll: false });
        return;
    }

    const currentlyBookmarked = !!bookmarkedQuestions[questionId];
    // Optimistic Update
    setBookmarkedQuestions(prev => ({ ...prev, [questionId]: !currentlyBookmarked }));
    
    try {
        const res = await fetch('/api/toeic/grammar/bookmark', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ questionId, isBookmarked: !currentlyBookmarked })
        });
        
        if (res.status === 403) {
            // Revert state
            setBookmarkedQuestions(prev => ({ ...prev, [questionId]: currentlyBookmarked }));
            setShowPricing(true);
        } else if (res.ok && !currentlyBookmarked && bookmarkBtnRef.current && notebookRef.current) {
            // Trigger flying stars
            const btnRect = bookmarkBtnRef.current.getBoundingClientRect();
            const targetRect = notebookRef.current.getBoundingClientRect();
            
            const newStar = {
                id: Date.now(),
                startX: btnRect.left + btnRect.width / 2,
                startY: btnRect.top + btnRect.height / 2,
                endX: targetRect.left + targetRect.width / 2,
                endY: targetRect.top + targetRect.height / 2,
                x: 0,
                y: 0
            };
            
            setFlyingStars(prev => [...prev, newStar]);
            setTimeout(() => {
                setFlyingStars(prev => prev.filter(s => s.id !== newStar.id));
            }, 800);
        }
    } catch {
        // Revert state
        setBookmarkedQuestions(prev => ({ ...prev, [questionId]: currentlyBookmarked }));
    }
  };

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
      if (topic?.type === 'LISTENING' && !lessonStarted) return;
      timer = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - timerStartTime) / 1000))
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [timerStartTime, isTestCompleted, topic?.type, lessonStarted])

  // Sync playback speed
  useEffect(() => {
     if (audioRef.current) audioRef.current.playbackRate = playbackSpeed;
     if (directionAudioRef.current) directionAudioRef.current.playbackRate = playbackSpeed;
  }, [playbackSpeed, activeQuestionIndex, isPlayingDirections]);

  // Auto-play audio when navigating to a new question if in LISTENING mode
  useEffect(() => {
    // DO NOT autoplay if they are in the 30-second checking phase, or the test has completed.
    if (lessonStarted && !isPlayingDirections && topic?.type === 'LISTENING' && currentLesson?.questions[activeQuestionIndex]?.audioUrl && !actualCheckingMode && !isTestCompleted) {
       if (audioRef.current) {
           const timeoutId = setTimeout(() => {
             if (audioRef.current && audioRef.current.paused) {
                 audioRef.current.play().catch(() => {});
             }
           }, 100);
           return () => clearTimeout(timeoutId);
       }
    }
  }, [activeQuestionIndex, lessonStarted, isPlayingDirections, topic?.type, currentLesson, actualCheckingMode, isTestCompleted]);

  // Exam Mode Timer & Submit Logic
  useEffect(() => {
    let checkTimer: NodeJS.Timeout;
    if (actualCheckingMode && !isTestCompleted && actualCheckTimeLeft > 0) {
        checkTimer = setInterval(() => {
            setActualCheckTimeLeft(prev => prev - 1);
        }, 1000);
    } else if (actualCheckingMode && actualCheckTimeLeft <= 0 && !isTestCompleted) {
        submitActualExam();
    }
    return () => clearInterval(checkTimer);
  }, [actualCheckingMode, actualCheckTimeLeft, isTestCompleted]);

  const submitActualExam = () => {
      setActualCheckingMode(false);
      setIsSubmitModalOpen(false);
      
      const newResults: Record<string, boolean> = {};
      if (currentLesson) {
          currentLesson.questions.forEach(q => {
              newResults[q.id] = true;
          });
      }
      setShowResults(prev => ({...prev, ...newResults}));
      setIsTestCompleted(true);
      
      // Calculate score conceptually
      let correctCnt = 0;
      if (currentLesson) {
         currentLesson.questions.forEach(q => {
             if (userAnswers[q.id] === q.correctOption) correctCnt++;
         });
      }
      new Audio('/audio/amazing-reward-sound.mp3').play().catch(() => {});
      toast.success(`Bạn đã đúng ${correctCnt}/${currentLesson?.questions.length || 0} câu!`, { position: 'top-center', duration: 7000 });
  };

  const handleSelectOption = async (questionId: string, option: string) => {
    if (showResults[questionId]) return
    setUserAnswers(prev => ({ ...prev, [questionId]: option }))
    
    // Exam mode interception: DO NOT EVALUATE results!
    if (topic?.type === 'LISTENING' && topic?.part && topic.part <= 2 && listeningMode === 'actual' && !isTestCompleted) {
       if (actualCheckingMode) return; // User is in checking phase, just record answer
       
       // If currently testing
       if (currentLesson && activeQuestionIndex === currentLesson.questions.length - 1) {
           setTimeout(() => setIsSubmitModalOpen(true), 500);
       } else {
           setTimeout(() => setActiveQuestionIndex(prev => prev + 1), 500);
       }
       return;
    }

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

    // Trigger local fake AP for guests or authenticated users who are NOT members and NOT PRO/ULTRA
    const isMember = status === 'authenticated' && (session?.user?.role === 'member' || session?.user?.tier === 'PRO' || session?.user?.tier === 'ULTRA');
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

  const handleRestartLesson = async (targetLesson?: ToeicLesson) => {
    const lessonToRestart = targetLesson || currentLesson;
    if (!lessonToRestart) return;
    const lessonId = lessonToRestart.id;
    
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
    const newTranslations = { ...showTranslation };
    lessonToRestart.questions.forEach(q => {
      delete newAnswers[q.id];
      delete newResults[q.id];
      delete newTranslations[q.id];
    });
    setUserAnswers(newAnswers);
    setShowResults(newResults);
    setShowTranslation(newTranslations);
    
    setIsTestCompleted(false);
    setIsReviewing(false);
    setLessonStarted(false);
    if (targetLesson && selectedLessonId !== lessonToRestart.id) {
        setSelectedLessonId(lessonToRestart.id);
        setShowLessonContent(false);
    }
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
      {/* Flying Stars Animation Overlay */}
      <AnimatePresence>
        {flyingStars.map(star => (
          <motion.div
            key={star.id}
            initial={{ x: star.startX - 10, y: star.startY - 10, opacity: 1, scale: 1.2, rotate: 0 }}
            animate={{ x: star.endX - 10, y: star.endY - 10, opacity: 1, scale: 0.5, rotate: 360 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
            className="fixed z-[9999] pointer-events-none text-xl drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]"
            style={{ left: 0, top: 0 }}
          >
            ⭐
          </motion.div>
        ))}
      </AnimatePresence>
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href={(() => {
                  let url = '/toeic-practice?tab=home';
                  if (topic.type === 'LISTENING') url = '/toeic-practice?tab=listening';
                  else if (topic.type === 'READING') url = '/toeic-practice?tab=reading';
                  else if (topic.type === 'GRAMMAR') url = '/toeic-practice?tab=grammar';
                  else if (topic.type === 'VOCABULARY') url = '/toeic-practice?tab=vocabulary';
                  
                  if (topic.part) url += `&part=${topic.part}`;
                  return url;
              })()}
              onClick={(e) => {
                  const isAudioPlaying = audioRef.current && !audioRef.current.paused && audioRef.current.currentTime > 0;
                  const isDirectionPlaying = directionAudioRef.current && !directionAudioRef.current.paused && directionAudioRef.current.currentTime > 0;
                  
                  if (lessonStarted && (isAudioPlaying || isDirectionPlaying)) {
                      if (!confirm("File nghe vẫn đang phát, bạn vẫn muốn rời đi?")) {
                          e.preventDefault();
                          return;
                      }
                  }
              }}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div className="flex flex-col">
              <h1 className="font-black text-slate-900 text-sm md:text-base leading-tight">{topic.title}</h1>
              <p className="hidden md:block text-[10px] font-bold text-slate-400 uppercase tracking-widest">{topic.subtitle || (topic.type === 'READING' ? 'TOEIC Reading' : topic.type === 'LISTENING' ? 'TOEIC Listening' : 'TOEIC Grammar')}</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-4">
            <Link 
                ref={notebookRef}
                href={topic.type === 'READING' ? '/toeic-progress?tab=reading' : topic.type === 'LISTENING' ? '/toeic-progress?tab=listening' : '/toeic-progress?tab=grammar'}
                onClick={(e) => {
                    const isAudioPlaying = audioRef.current && !audioRef.current.paused && audioRef.current.currentTime > 0;
                    const isDirectionPlaying = directionAudioRef.current && !directionAudioRef.current.paused && directionAudioRef.current.currentTime > 0;
                    
                    if (lessonStarted && (isAudioPlaying || isDirectionPlaying)) {
                        if (!confirm("File nghe vẫn đang phát, bạn vẫn muốn chuyển sang Sổ Tay?")) {
                            e.preventDefault();
                            return;
                        }
                    }
                }}
                className="px-3 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 transition-colors text-xs font-bold rounded-full border border-emerald-100 uppercase tracking-wider cursor-pointer"
                title="Khám phá sổ tay học tập của bạn"
            >
              {topic.type === 'READING' ? 'Sổ Tay Luyện Đọc' : topic.type === 'LISTENING' ? 'Sổ Tay Luyện Nghe' : 'Sổ Tay Ngữ Pháp'}
            </Link>
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
                  const isAudioPlaying = audioRef.current && !audioRef.current.paused && audioRef.current.currentTime > 0;
                  const isDirectionPlaying = directionAudioRef.current && !directionAudioRef.current.paused && directionAudioRef.current.currentTime > 0;
                  
                  if (lessonStarted && (isAudioPlaying || isDirectionPlaying)) {
                      if (!confirm("File nghe vẫn đang phát, bạn vẫn muốn chuyển sang bài khác hoặc làm lại?")) {
                          return;
                      }
                  }
                  
                  if (audioRef.current) {
                      audioRef.current.pause();
                      audioRef.current.currentTime = 0;
                  }
                  if (directionAudioRef.current) {
                      directionAudioRef.current.pause();
                      directionAudioRef.current.currentTime = 0;
                  }

                  setSelectedLessonId(lesson.id)
                  setActiveQuestionIndex(0)
                  setShowLessonContent(lesson.questions.length === 0)
                  if (topic.type === 'LISTENING') setListeningMode('actual');
                  setTimerStartTime(Date.now())
                  setElapsedTime(0)
                  setIsTestCompleted(false)
                  setLessonStarted(false)
                  setIsPlayingDirections(false)
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
                      <svg className="w-[18px] h-[18px] text-amber-400 shrink-0 drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24" aria-label="PRO"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    )}
                    {lesson.accessTier === 'ULTRA' && (
                      <svg className="w-[18px] h-[18px] text-purple-700 shrink-0 drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24" aria-label="ULTRA"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                    )}
                  </div>
                  <div className={`text-[11px] mt-1 ${selectedLessonId === lesson.id ? 'text-white/60' : 'text-slate-500'}`}>
                    {lesson.questions.length} câu hỏi luyện tập
                  </div>
                </div>
                {(() => {
                  const lessonTierLevel = lesson.accessTier === 'ULTRA' ? 3 : lesson.accessTier === 'PRO' ? 2 : 1;
                  const userTierLevel = session?.user?.role === 'admin' ? 10 : session?.user?.tier === 'ULTRA' ? 3 : (session?.user?.tier === 'PRO' || session?.user?.role === 'member') ? 2 : 1;
                  return lessonTierLevel > userTierLevel ? (
                    <div className="shrink-0" onClick={(e) => { e.stopPropagation(); setShowPricing(true); }}>
                      <svg className="w-4 h-4 text-slate-400 opacity-60 cursor-pointer hover:text-amber-500 transition-colors" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                    </div>
                  ) : (
                    <div 
                        onClick={(e) => { e.stopPropagation(); handleRestartLesson(lesson); }}
                        className={`shrink-0 flex items-center gap-1.5 transition-all cursor-pointer relative group/restart ${selectedLessonId === lesson.id ? 'opacity-100' : 'md:opacity-0 md:group-hover:opacity-100'}`}
                        title="Làm Lại Bài"
                    >
                       <span className={`text-xs font-bold px-2 py-1 rounded shadow-sm border ${selectedLessonId === lesson.id ? 'bg-[#14532d] text-white border-white/20' : 'bg-white text-[#14532d] border-emerald-50'} opacity-0 group-hover/restart:opacity-100 transition-opacity hidden sm:block whitespace-nowrap`}>Làm Lại Bài</span>
                       <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all ${selectedLessonId === lesson.id ? 'border-white/40 text-white hover:bg-white/20' : 'border-[#14532d] text-[#14532d] hover:bg-emerald-50 bg-white'}`}>
                           <svg className="w-4 h-4 transition-transform group-hover/restart:-rotate-180 duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                       </div>
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
                    <div className="flex flex-wrap items-center gap-3 w-full">
                      <h2 className="text-xl font-black text-slate-900 leading-tight flex items-center gap-2">
                        <span>{currentLesson.title}</span>
                        {currentLesson.accessTier === 'PRO' && <svg className="w-6 h-6 text-amber-400 drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24" aria-label="PRO"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>}
                        {currentLesson.accessTier === 'ULTRA' && <svg className="w-6 h-6 text-purple-700 drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24" aria-label="ULTRA"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>}
                      </h2>
                      {/* Control Mode Toggle */}
                      {/* Control Speed Toggle */}
                      {topic.type === 'LISTENING' && (
                        <div className="flex items-center p-1 bg-slate-100 rounded-lg">
                          <button 
                            title="Nghe tốc độ chậm (0.85x)"
                            onClick={() => setPlaybackSpeed(0.85)}
                            className={`text-xs font-bold px-3 py-1.5 rounded-md transition-all ${playbackSpeed === 0.85 ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                          >
                            Nghe chậm
                          </button>
                          <button 
                            title="Nghe tốc độ bình thường (1.0x)"
                            onClick={() => setPlaybackSpeed(1)}
                            className={`text-xs font-bold px-3 py-1.5 rounded-md transition-all ${playbackSpeed === 1 ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                          >
                            Thường
                          </button>
                          <button 
                            title="Nghe tốc độ nhanh (1.25x)"
                            onClick={() => setPlaybackSpeed(1.25)}
                            className={`text-xs font-bold px-3 py-1.5 rounded-md transition-all ${playbackSpeed === 1.25 ? 'bg-white text-red-500 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                          >
                            Nghe nhanh
                          </button>
                        </div>
                      )}
                      {!isTestCompleted && timerStartTime !== null && (
                        <div className="flex items-center gap-2 ml-2">
                           {topic.type === 'LISTENING' && lessonStarted && (
                              <button
                                onClick={() => {
                                  if (isPlayingDirections && directionAudioRef.current) {
                                    if (directionAudioRef.current.paused) directionAudioRef.current.play();
                                    else directionAudioRef.current.pause();
                                  } else if (audioRef.current) {
                                    if (audioRef.current.paused) audioRef.current.play();
                                    else audioRef.current.pause();
                                  }
                                }}
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-[#14532d] border border-slate-200 hover:bg-emerald-50 hover:border-emerald-200 transition-colors cursor-pointer shrink-0"
                                title="Play/Pause Audio"
                              >
                                {isAudioNodePlaying ? (
                                   <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                                ) : (
                                   <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                                )}
                              </button>
                           )}
                           <span className="tabular-nums text-emerald-700 font-mono font-bold bg-emerald-50 px-2 py-1 rounded border border-emerald-100 text-sm">
                             {Math.floor(elapsedTime / 60).toString().padStart(2, '0')}:{(elapsedTime % 60).toString().padStart(2, '0')}
                           </span>
                        </div>
                      )}
                    </div>
                    {/* Removed Xem meo lam dropdown button */}
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
                                   <div 
                                     className="whitespace-pre-wrap text-slate-700 leading-relaxed text-sm md:text-base prose prose-sm md:prose-base max-w-none prose-headings:font-bold prose-headings:text-slate-800 prose-p:my-2 prose-a:text-[#14532d] prose-ul:list-disc prose-ol:list-decimal prose-ul:ml-5 prose-ol:ml-5 prose-li:my-1 prose-li:marker:text-gray-800 marker:font-bold"
                                     dangerouslySetInnerHTML={{ __html: currentLesson.content || 'Nội dung đang được cập nhật...' }}
                                   />
                                 </div>
                               </div>
                               {isLocked && (
                                  <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-4">
                                     <button onClick={() => setShowPricing(true)} className="group max-w-[85%] mx-auto bg-white/95 backdrop-blur-sm border border-slate-200/80 shadow-md hover:shadow-lg rounded-2xl md:rounded-full px-4 py-2.5 flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1 cursor-pointer transition-all hover:scale-105 active:scale-95 text-[13px] font-medium text-slate-700">
                                       <div className="flex items-center gap-1.5 whitespace-nowrap">
                                         {currentLesson.theoryAccessTier === 'ULTRA' ? (
                                            <svg className="w-4 h-4 text-purple-700 shrink-0 drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                                         ) : (
                                            <svg className="w-4 h-4 text-amber-500 shrink-0 drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                                         )}
                                         <span>Nâng cấp</span>
                                       </div>
                                       <div className="flex items-center gap-1 whitespace-nowrap">
                                         <span className={`${currentLesson.theoryAccessTier === 'ULTRA' ? 'bg-purple-100 text-purple-900 border border-purple-200' : 'bg-amber-100 text-amber-700 border border-amber-200'} font-bold text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded`}>{currentLesson.theoryAccessTier}</span>
                                         <span>để xem mẹo làm chi tiết.</span>
                                       </div>
                                     </button>
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
                    <section className="mt-8 relative">
                      {/* Global Persistent Audio Player */}
                      {(() => {
                        let activeAudioUrl = currentLesson.questions[activeQuestionIndex]?.audioUrl || null;

                        return activeAudioUrl ? (
                            <audio 
                               ref={audioRef} 
                               src={activeAudioUrl} 
                               className="hidden"
                               onPlay={() => setIsAudioNodePlaying(true)}
                               onPause={() => setIsAudioNodePlaying(false)}
                               onLoadedData={(e) => { (e.target as HTMLAudioElement).playbackRate = playbackSpeed; }}
                               onEnded={() => {
                                  if (listeningMode === 'actual') {
                                    if (activeQuestionIndex < currentLesson.questions.length - 1) {
                                       setActiveQuestionIndex(prev => prev + 1);
                                    } else if (!isTestCompleted && !actualCheckingMode) {
                                       setIsSubmitModalOpen(true);
                                    }
                                  }
                               }}
                            />
                        ) : null;
                      })()}
                      
                      {/* Mount direction audio unconditionally so it's ready for autoplay when Start is clicked */}
                      <audio 
                          ref={directionAudioRef} 
                          src={currentLesson.directionAudioUrl || undefined} 
                          onPlay={() => setIsAudioNodePlaying(true)}
                          onPause={() => setIsAudioNodePlaying(false)}
                          onLoadedData={(e) => { (e.target as HTMLAudioElement).playbackRate = playbackSpeed; }}
                          onEnded={() => {
                             setIsPlayingDirections(false);
                          }} 
                          className="hidden" 
                      />
                      
                      {!lessonStarted && topic.type === 'LISTENING' ? (
                        <div className="flex flex-col items-center justify-center p-16 bg-white rounded-3xl border border-slate-200 shadow-lg shadow-slate-100 text-center min-h-[400px]">
                            <h3 className="text-2xl font-black text-[#14532d] mb-3">Sẵn sàng cho PART {topic.part} của bài thi?</h3>
                            <p className="text-slate-500 mb-8 max-w-md">Bắt đầu để audio tự động phát và hiển thị nội dung câu hỏi đầu tiên. Thời gian làm bài sẽ được tính từ bây giờ.</p>
                            
                            {topic.part && topic.part <= 2 && (
                                <div className="flex flex-col items-center mb-8 w-full">
                                  <p className="text-sm border-b pb-2 px-6 border-slate-200 uppercase tracking-widest text-slate-400 font-bold mb-4">Chọn chế độ làm bài</p>
                                  <div className="flex items-center bg-slate-100 p-1.5 rounded-xl w-full max-w-sm mx-auto shadow-inner">
                                    <button 
                                      onClick={() => setListeningMode('practice')}
                                      className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all duration-300 ${listeningMode === 'practice' ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20 translate-y-[-1px]' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                                    >
                                      Luyện tập
                                    </button>
                                    <button 
                                      onClick={() => setListeningMode('actual')}
                                      className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all duration-300 ${listeningMode === 'actual' ? 'bg-[#14532d] text-white shadow-md shadow-[#14532d]/20 translate-y-[-1px]' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                                    >
                                      Thi thật
                                    </button>
                                  </div>
                                </div>
                            )}
                            
                            <button 
                              disabled={topic.part && topic.part <= 2 ? !listeningMode : false}
                              onClick={() => {
                                setLessonStarted(true);
                                setTimerStartTime(Date.now());
                                
                                if (topic.type === 'LISTENING' && currentLesson.directionAudioUrl && directionAudioRef.current) {
                                    setIsPlayingDirections(true);
                                    directionAudioRef.current.play().catch(e => console.error("Direction Audio autoplay blocked", e));
                                }
                            }} className={`text-white font-bold px-10 py-4 rounded-xl transition-all hover:scale-105 active:scale-95 text-lg flex items-center gap-2 tracking-wide uppercase ${topic.part && topic.part <= 2 ? (listeningMode ? 'bg-[#14532d] hover:bg-[#14532d]/90 shadow-lg shadow-emerald-900/30' : 'bg-slate-300 cursor-not-allowed hover:scale-100') : 'bg-[#14532d] hover:bg-[#14532d]/90 shadow-lg shadow-emerald-900/30'}`}>
                               Bắt Đầu
                            </button>
                        </div>
                      ) : (
                        <>
                          {isPlayingDirections ? (
                              <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 p-6 md:p-10 text-center animate-in fade-in zoom-in duration-300">
                                  <h3 className="text-xl md:text-2xl font-black text-[#14532d] mb-2 mt-2">Bạn đang nghe directions của Phần {topic.part} bài thi</h3>
                                  {topic.part === 2 ? (
                                    <p className="text-sm md:text-base text-red-900 mb-12 mt-4 font-bold max-w-3xl mx-auto px-4 py-3 bg-red-50 rounded-xl border border-red-200">
                                      Nội dung câu hỏi từ Câu 7 đến Câu 31 trong phần này sẽ KHÔNG được in sẵn. 
                                      <br/><span className="text-xs md:text-sm font-medium text-red-700 mt-1 block">Hãy tập trung lắng nghe hoàn toàn!</span>
                                    </p>
                                  ) : (
                                    <p className="text-sm text-slate-500 mb-8 font-medium">Hãy tranh thủ thời gian "vàng" này lướt nhanh qua các hình ảnh hoặc câu hỏi bên dưới.</p>
                                  )}
                                  
                                  {topic.part !== 2 && (
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10 text-left">
                                     {currentLesson.questions.map((q, idx) => (
                                        <div key={q.id} className="relative flex flex-col rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all group">
                                            <div className="absolute top-2 left-2 bg-[#14532d] text-white text-[10px] sm:text-xs font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md shadow-sm z-10 flex items-center gap-1 leading-none">
                                                <span>Câu {(() => {
                                                    if (topic.type === 'LISTENING') {
                                                        if (topic.part === 2) return idx + 7;
                                                        if (topic.part === 3) return idx + 32;
                                                        if (topic.part === 4) return idx + 71;
                                                    } else if (topic.type === 'READING') {
                                                        if (topic.part === 5) return idx + 101;
                                                        if (topic.part === 6) return idx + 131;
                                                        if (topic.part === 7) return idx + 147;
                                                    }
                                                    return idx + 1;
                                                })()}</span>
                                            </div>
                                            {q.imageUrl ? (
                                                <div className="aspect-[4/3] bg-slate-50 relative border-b border-slate-100">
                                                    <img src={q.imageUrl} alt="Preview" className="absolute inset-0 w-full h-full object-contain p-1" />
                                                </div>
                                            ) : (
                                                <div className="p-4 pt-10 text-sm text-slate-700 font-medium line-clamp-4 bg-slate-50/50">
                                                    {topic.part === 2 
                                                      ? <span className="italic text-slate-400 font-normal">Nội dung câu hỏi không được in sẵn để xem.</span> 
                                                      : q.question.replace(/^(?:Câu|Question)\s*\d+[:\-\.]?\s*/i, '')}
                                                </div>
                                            )}
                                        </div>
                                     ))}
                                    </div>
                                  )}

                                  <button 
                                      onClick={() => {
                                         if (directionAudioRef.current) {
                                             directionAudioRef.current.pause();
                                             directionAudioRef.current.currentTime = 0;
                                         }
                                         setIsPlayingDirections(false);
                                      }}
                                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-8 py-3.5 rounded-xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 uppercase tracking-wider text-sm mx-auto shadow-sm"
                                  >
                                     <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
                                     Skip Directions &rarr; Vào bài ngay
                                  </button>
                              </div>
                          ) : (
                            <>
                              <AnimatePresence mode="wait">
                                {(() => {
                              const q = currentLesson.questions[activeQuestionIndex]
                            if (!q) return null
                            const isShowingResult = showResults[q.id]
                            const selectedOption = userAnswers[q.id]
                            const isCorrect = selectedOption === q.correctOption
                            const explanationText = status !== 'authenticated' && activeQuestionIndex >= 4 ? 'Đăng nhập để xem phần giải thích.' : q.explanation;
                            
                            const parsedTranslations = (() => {
                                if (!q.translation) return { question: '', options: {} as Record<string, string> };
                                if (topic.type !== 'LISTENING' || (topic.part !== 1 && topic.part !== 2)) {
                                     return { question: q.translation, options: {} as Record<string, string> };
                                }
                                const parts = q.translation.split('/');
                                const result = { question: '', options: {} as Record<string, string> };
                                parts.forEach(part => {
                                    const text = part.trim();
                                    const match = text.match(/^([A-D])[\.\:\s]+(.*)/i);
                                    if (match) {
                                        result.options[match[1].toUpperCase()] = match[2].trim();
                                    } else if (!result.question) {
                                        result.question = text;
                                    } else {
                                        result.question += ' ' + text;
                                    }
                                });
                                return result;
                            })();

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

                              <div className="mb-8 flex flex-col items-center">
                                <p className="text-xl md:text-2xl font-black text-slate-800 leading-snug text-center mb-6">
                                  {topic.part === 2 && !isShowingResult ? (
                                      <span className="italic text-slate-400 font-normal text-lg">Nội dung câu hỏi không được in sẵn. Mời bạn nghe câu hỏi từ Audio.</span>
                                  ) : q.question}
                                </p>
                                {q.imageUrl && (
                                  <img 
                                    src={q.imageUrl} 
                                    alt="Part" 
                                    onClick={() => setIsZoomedImage(!isZoomedImage)}
                                    className={`object-contain rounded-xl border border-slate-200 shadow-sm transition-all duration-300 ${isZoomedImage ? 'w-full md:max-w-2xl cursor-zoom-out shadow-2xl' : 'max-w-full md:max-w-[400px] max-h-[280px] md:max-h-[320px] w-auto cursor-zoom-in'}`} 
                                  />
                                )}
                                
                                {topic.type === 'LISTENING' && topic.part && topic.part <= 2 && q.translation && isShowingResult && (
                                   <div className="mt-6 flex flex-col items-center">
                                     <button 
                                       onClick={() => {
                                           const translationTierLevel = currentLesson.translationAccessTier === 'ULTRA' ? 3 : currentLesson.translationAccessTier === 'PRO' ? 2 : 1;
                                           const userTierLevel = session?.user?.role === 'admin' ? 10 : session?.user?.tier === 'ULTRA' ? 3 : (session?.user?.tier === 'PRO' || session?.user?.role === 'member') ? 2 : 1;
                                           if (translationTierLevel > userTierLevel) {
                                               setShowPricing(true);
                                               return;
                                           }
                                           setShowTranslation(prev => ({ ...prev, [q.id]: !prev[q.id] }))
                                       }}
                                       className={`flex items-center gap-1.5 text-[11px] md:text-xs font-bold px-3 py-1.5 rounded-lg transition-all tracking-wide shadow-sm border ${showTranslation[q.id] ? 'bg-orange-600 border-orange-600 text-white' : 'bg-orange-50 border-orange-200 text-orange-600 hover:bg-orange-100'}`}
                                     >
                                       Dịch nghĩa
                                       {currentLesson.translationAccessTier === 'PRO' && session?.user?.tier !== 'ULTRA' && session?.user?.tier !== 'PRO' && session?.user?.role !== 'admin' && <svg className="w-3 h-3 text-amber-400 drop-shadow-[0_0_3px_rgba(251,191,36,0.8)]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>}
                                       {currentLesson.translationAccessTier === 'ULTRA' && session?.user?.tier !== 'ULTRA' && session?.user?.role !== 'admin' && <svg className="w-3 h-3 text-purple-600 drop-shadow-[0_0_3px_rgba(147,51,234,0.6)]" fill="currentColor" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>}
                                     </button>
                                     {showTranslation[q.id] && parsedTranslations.question && (
                                         <p className="mt-3 text-sm font-medium text-emerald-800 italic bg-emerald-50 px-4 py-2 rounded border border-emerald-100 animate-in fade-in slide-in-from-top-2">{parsedTranslations.question}</p>
                                     )}
                                   </div>
                                )}
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                                {[
                                  { label: 'A', value: q.optionA },
                                  { label: 'B', value: q.optionB },
                                  { label: 'C', value: q.optionC },
                                  { label: 'D', value: q.optionD },
                                ].map((opt) => {
                                  if (opt.label === 'D' && !opt.value) return null
                                  
                                  const shouldHideValue = topic.type === 'LISTENING' && topic.part && topic.part <= 2 && !isShowingResult;
                                  
                                  let buttonClass = "flex items-center gap-3 md:gap-3.5 px-4 py-2 md:py-2.5 rounded-xl border-[1.5px] transition-all duration-200 text-left "
                                  
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
                                      className={buttonClass + " flex-col items-start cursor-pointer"}
                                    >
                                      <div className="flex items-center w-full gap-2.5 md:gap-3 relative">
                                        <span className={`w-8 h-8 md:w-10 md:h-10 shrink-0 flex items-center justify-center rounded-lg md:rounded-xl font-black text-base md:text-lg ${
                                          selectedOption === opt.label 
                                            ? (isShowingResult ? (opt.label === q.correctOption ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white') : 'bg-white text-[#14532d]') 
                                            : 'bg-slate-100 text-slate-500 group-hover:bg-[#14532d]/10'
                                        }`}>
                                          {opt.label}
                                        </span>
                                        <div className="flex flex-col flex-1 pb-1">
                                            <span className={`font-bold text-[15px] md:text-base leading-tight md:leading-normal transition-opacity duration-300 ${shouldHideValue ? 'opacity-0 select-none' : 'opacity-100'}`}>
                                              {opt.value || 'Option'}
                                            </span>
                                            {topic.type === 'LISTENING' && topic.part && topic.part <= 2 && showTranslation[q.id] && parsedTranslations.options[opt.label] && (
                                                <span className="text-[13px] md:text-sm font-medium text-emerald-700 italic mt-0.5 animate-in fade-in leading-snug">
                                                    {parsedTranslations.options[opt.label]}
                                                </span>
                                            )}
                                        </div>
                                      </div>
                                    </button>
                                  )
                                })}
                              </div>
                              
                              {topic.type !== 'LISTENING' && isShowingResult && q.translation && (
                                <div className="mt-5 flex flex-row items-start gap-3 animate-in slide-in-from-top-1 fade-in duration-300">
                                   <button 
                                     onClick={() => {
                                         const translationTierLevel = currentLesson.translationAccessTier === 'ULTRA' ? 3 : currentLesson.translationAccessTier === 'PRO' ? 2 : 1;
                                         const userTierLevel = session?.user?.role === 'admin' ? 10 : session?.user?.tier === 'ULTRA' ? 3 : (session?.user?.tier === 'PRO' || session?.user?.role === 'member') ? 2 : 1;
                                         if (translationTierLevel > userTierLevel) {
                                             setShowPricing(true);
                                             return;
                                         }
                                         setShowTranslation(prev => ({ ...prev, [q.id]: !prev[q.id] }))
                                     }}
                                     className={`flex items-center shrink-0 flex-none gap-1.5 text-[11px] md:text-xs font-bold px-3 py-1 mt-0.5 rounded-lg transition-all tracking-wide ${showTranslation[q.id] ? 'bg-orange-100 text-orange-700' : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200 hover:text-slate-800'}`}
                                   >
                                     Dịch nghĩa
                                     {currentLesson.translationAccessTier === 'PRO' && session?.user?.tier !== 'ULTRA' && session?.user?.tier !== 'PRO' && session?.user?.role !== 'admin' && <svg className="w-3 h-3 text-amber-500 drop-shadow-sm ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>}
                                     {currentLesson.translationAccessTier === 'ULTRA' && session?.user?.tier !== 'ULTRA' && session?.user?.role !== 'admin' && <svg className="w-3 h-3 text-purple-600 drop-shadow-sm ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>}
                                   </button>
                                   {showTranslation[q.id] && (
                                     <div className="flex-1 min-w-0 text-[13px] md:text-sm font-medium text-slate-600 leading-relaxed italic animate-in fade-in py-0.5">
                                       {q.translation}
                                     </div>
                                   )}
                                </div>
                              )}

                            </motion.div>
                          )
                        })()}
                      </AnimatePresence>

                      {/* Outside AnimatePresence: Result, Navigation, and Explanation */ }
                      {(() => {
                        const q = currentLesson.questions[activeQuestionIndex];
                        if (!q) return null;
                        const isShowingResultLocal = !!showResults[q.id];
                        const isCorrectLocal = userAnswers[q.id] === q.correctOption;
                        const explanationText = status !== 'authenticated' && activeQuestionIndex >= 4 ? 'Đăng nhập để xem phần giải thích.' : q.explanation;
                        
                        return (
                          <div className="mt-6 flex flex-col gap-4 w-full">
                            {/* Prev + Result + Next Row */}
                            <div className={`flex flex-row items-center justify-between gap-3 w-full p-2 md:p-3 rounded-2xl shadow-sm transition-all ${isShowingResultLocal ? (isCorrectLocal ? 'bg-emerald-50 border-2 border-emerald-500/30' : 'bg-rose-50 border-2 border-rose-500/30') : 'bg-slate-50 border border-slate-200'}`}>
                              <button
                                onClick={() => setActiveQuestionIndex(prev => Math.max(0, prev - 1))}
                                disabled={activeQuestionIndex === 0}
                                className="h-10 w-10 md:w-12 md:h-12 rounded-xl bg-white border border-slate-200 text-slate-500 hover:border-[#14532d] hover:text-[#14532d] hover:bg-emerald-50 disabled:opacity-30 disabled:hover:border-slate-200 disabled:hover:bg-white disabled:hover:text-slate-500 transition-all flex items-center justify-center cursor-pointer shadow-sm shrink-0 flex-none"
                                aria-label="Trước đó"
                              >
                                <svg className="w-5 h-5 md:w-6 md:h-6 stroke-[2px]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                              </button>

                              <div className="flex-1 flex justify-center items-center min-w-0">
                                {isShowingResultLocal ? (
                                  <div className={`px-2 flex items-center justify-center gap-1.5 md:gap-2 transition-all ${isCorrectLocal ? 'text-emerald-700' : 'text-rose-700'}`}>
                                    <div className={`w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center bg-white shadow-sm shrink-0 border border-current opacity-90`}>
                                        {isCorrectLocal ? (
                                          <svg className="w-3.5 h-3.5 md:w-4 md:h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M5 13l4 4L19 7" /></svg>
                                        ) : (
                                          <svg className="w-3.5 h-3.5 md:w-4 md:h-4 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M6 18L18 6M6 6l12 12" /></svg>
                                        )}
                                    </div>
                                    <div className="flex items-center leading-none whitespace-nowrap">
                                      <span className="font-bold text-sm md:text-base">{isCorrectLocal ? 'Correct!' : 'Incorrect!'}</span>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-slate-400 font-bold text-xs uppercase tracking-widest">
                                    Câu {topic.type === 'LISTENING' && topic.part === 2 ? activeQuestionIndex + 7 : activeQuestionIndex + 1} / {currentLesson.questions.length}
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                {(() => {
                                  const bookmarkTierLevel = currentLesson.bookmarkAccessTier === 'ULTRA' ? 3 : currentLesson.bookmarkAccessTier === 'PRO' ? 2 : 1;
                                  const userTierLevel = session?.user?.role === 'admin' ? 10 : session?.user?.tier === 'ULTRA' ? 3 : (session?.user?.tier === 'PRO' || session?.user?.role === 'member') ? 2 : 1;
                                  const isLocked = bookmarkTierLevel > userTierLevel;

                                  if (isLocked) {
                                    return (
                                      <div className="relative group">
                                        <button
                                          onClick={() => setShowPricing(true)}
                                          className={`h-10 w-10 md:w-12 md:h-12 rounded-xl border bg-white border-slate-200 text-slate-400 hover:border-amber-400 hover:text-amber-500 transition-all flex items-center justify-center cursor-pointer shadow-sm shrink-0 flex-none`}
                                          aria-label="Lưu tay bị khóa"
                                        >
                                          <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg>
                                          
                                          {/* Lock icon overlay without outer border */}
                                          <div className={`absolute -top-1 -right-1 filter drop-shadow-md ${currentLesson.bookmarkAccessTier === 'ULTRA' ? 'text-purple-600' : 'text-amber-500'}`}>
                                             <svg className="w-4 h-4 md:w-4 md:h-4" fill="currentColor" viewBox="0 0 24 24"><path d={currentLesson.bookmarkAccessTier === 'ULTRA' ? "M13 2L3 14h9l-1 8 10-12h-9l1-8z" : "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"} /></svg>
                                          </div>
                                        </button>
                                        <span className={`absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-[11px] md:text-xs font-semibold bg-white border px-3 py-1.5 rounded shadow-lg pointer-events-none z-50 block ${currentLesson.bookmarkAccessTier === 'ULTRA' ? 'text-purple-700 border-purple-200' : 'text-amber-600 border-amber-200'}`}>
                                            Nâng cấp {currentLesson.bookmarkAccessTier} để lưu và xem lại câu này
                                        </span>
                                      </div>
                                    )
                                  }

                                  return (
                                    <button
                                      ref={bookmarkBtnRef}
                                      onClick={() => toggleBookmark(q.id)}
                                      className={`h-10 w-10 md:w-12 md:h-12 rounded-xl border transition-all flex items-center justify-center cursor-pointer shadow-sm shrink-0 flex-none ${bookmarkedQuestions[q.id] ? 'bg-amber-100 border-amber-300 text-amber-600' : 'bg-white border-slate-200 text-slate-400 hover:border-amber-400 hover:text-amber-500'}`}
                                      aria-label="Lưu tay"
                                      title={bookmarkedQuestions[q.id] ? 'Đã lưu' : 'Lưu vào sổ tay'}
                                    >
                                      <svg className="w-5 h-5 md:w-6 md:h-6" fill={bookmarkedQuestions[q.id] ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg>
                                    </button>
                                  )
                                })()}
                                <button
                                  onClick={() => setActiveQuestionIndex(prev => Math.min(currentLesson.questions.length - 1, prev + 1))}
                                  disabled={activeQuestionIndex === currentLesson.questions.length - 1}
                                  className="h-10 w-10 md:w-12 md:h-12 rounded-xl bg-white border border-slate-200 text-slate-500 hover:border-[#14532d] hover:text-[#14532d] hover:bg-emerald-50 disabled:opacity-30 disabled:hover:border-slate-200 disabled:hover:bg-white disabled:hover:text-slate-500 transition-all flex items-center justify-center cursor-pointer shadow-sm shrink-0 flex-none"
                                  aria-label="Tiếp theo"
                                >
                                  <svg className="w-5 h-5 md:w-6 md:h-6 stroke-[2px]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                                </button>
                              </div>
                            </div>

                            {/* Full Width Explanation Row below the buttons */}
                            {isShowingResultLocal && explanationText && (
                              <div className={`w-full p-4 md:p-6 rounded-2xl border-2 shadow-sm ${isCorrectLocal ? 'bg-emerald-50/40 border-emerald-100' : 'bg-rose-50/40 border-rose-100'}`}>
                                {explanationText === 'Đăng nhập để xem phần giải thích.' ? (
                                    <button 
                                      onClick={(e) => {
                                        e.preventDefault();
                                        const currentPath = window.location.pathname;
                                        router.push(`${currentPath}?login=true&allowGuest=true&subtitle=${encodeURIComponent('Đăng nhập để lưu giữ tiến độ và nhận điểm thưởng học tập nhé.')}&callbackUrl=${encodeURIComponent(currentPath)}`, { scroll: false });
                                      }}
                                      className="text-sm font-bold italic text-blue-600 hover:text-blue-800 hover:underline cursor-pointer text-left leading-relaxed outline-none w-full"
                                    >
                                      {explanationText}
                                    </button>
                                ) : (() => {
                                      const explanationTierLevel = currentLesson.explanationAccessTier === 'ULTRA' ? 3 : currentLesson.explanationAccessTier === 'PRO' ? 2 : 1;
                                      const userTierLevel = session?.user?.role === 'admin' ? 10 : session?.user?.tier === 'ULTRA' ? 3 : (session?.user?.tier === 'PRO' || session?.user?.role === 'member') ? 2 : 1;
                                      const isLocked = explanationTierLevel > userTierLevel;
                                      
                                      if (isLocked) {
                                         return (
                                            <div className="relative w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                                              <div className="absolute inset-0 blur-md pointer-events-none opacity-40 p-4 select-none text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
                                                {explanationText}
                                              </div>
                                              <div className="relative z-10 flex py-5 flex-col items-center justify-center min-h-[100px]">
                                                <button onClick={() => setShowPricing(true)} className="group max-w-[85%] mx-auto bg-white/95 backdrop-blur-sm border border-slate-200/80 shadow-sm hover:shadow-md rounded-2xl md:rounded-full px-4 py-2.5 flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1 cursor-pointer transition-all hover:scale-105 active:scale-95 text-[13px] font-medium text-slate-700">
                                                   <div className="flex items-center gap-1.5 whitespace-nowrap">
                                                     {currentLesson.explanationAccessTier === 'ULTRA' ? (
                                                        <svg className="w-4 h-4 text-purple-700 shrink-0 drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                                                     ) : (
                                                        <svg className="w-4 h-4 text-amber-500 shrink-0 drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                                                     )}
                                                     <span>Nâng cấp</span>
                                                   </div>
                                                   <div className="flex items-center gap-1 whitespace-nowrap">
                                                     <span className={`${currentLesson.explanationAccessTier === 'ULTRA' ? 'bg-purple-100 text-purple-900 border border-purple-200' : 'bg-amber-100 text-amber-700 border border-amber-200'} font-bold text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded`}>{currentLesson.explanationAccessTier}</span>
                                                     <span>để xem giải thích chi tiết.</span>
                                                   </div>
                                                </button>
                                              </div>
                                            </div>
                                         )
                                      }
                                      
                                      return (
                                        <div className="text-sm md:text-[15px] font-medium italic text-slate-700 opacity-90 leading-relaxed max-h-[250px] overflow-y-auto custom-scrollbar">
                                          {explanationText}
                                        </div>
                                      )
                                })()}
                              </div>
                            )}

                            {/* Small Numbers Row at the very bottom without vertical scroll */}
                            <div className="mt-2 flex flex-wrap justify-center items-center gap-1 sm:gap-1.5 w-full">
                              {currentLesson.questions.map((_, idx) => {
                                const isActive = idx === activeQuestionIndex
                                const qt = currentLesson.questions[idx]
                                const isShowingResultQt = !!showResults[qt.id]
                                const isCorrectQt = userAnswers[qt.id] === qt.correctOption

                                let btnStyle = ''
                                if (isActive) {
                                   btnStyle = 'bg-[#14532d] border-[#14532d] text-white shadow-md scale-110 z-10'
                                } else if (isShowingResultQt) {
                                   btnStyle = isCorrectQt ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-red-50 border-red-500 text-red-700'
                                } else if (userAnswers[qt.id]) {
                                   btnStyle = 'bg-emerald-50 border-emerald-200 text-[#14532d]'
                                } else {
                                   btnStyle = 'bg-white border-slate-200 text-slate-400 hover:border-[#14532d]/30 hover:text-[#14532d]'
                                }
                                
                                return (
                                  <button 
                                    key={idx}
                                    onClick={() => {
                                        if (idx === activeQuestionIndex) return;
                                        const isAudioPlaying = audioRef.current && !audioRef.current.paused && audioRef.current.currentTime > 0;
                                        if (isAudioPlaying) {
                                            if (!confirm("Audio vẫn đang phát. Bạn chắc chắn muốn chuyển sang câu khác?")) return;
                                        }
                                        setActiveQuestionIndex(idx);
                                    }}
                                    className={`w-6 h-6 sm:w-7 sm:h-7 shrink-0 rounded-md flex items-center justify-center font-bold text-[10px] sm:text-[11px] transition-all duration-200 cursor-pointer border-[1.5px] ${btnStyle}`}
                                  >
                                    {topic.type === 'LISTENING' && topic.part === 2 ? idx + 7 : idx + 1}
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        )
                      })()}
                          </>
                        )}
                        </>
                      )}
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
              ) : (() => {
                  let returnUrl = '/toeic-practice?tab=home';
                  if (topic) {
                      if (topic.type === 'LISTENING') returnUrl = '/toeic-practice?tab=listening';
                      else if (topic.type === 'READING') returnUrl = '/toeic-practice?tab=reading';
                      else if (topic.type === 'GRAMMAR') returnUrl = '/toeic-practice?tab=grammar';
                      else if (topic.type === 'VOCABULARY') returnUrl = '/toeic-practice?tab=vocabulary';
                      
                      if (topic.part) returnUrl += `&part=${topic.part}`;
                  }
                  
                  return (
                    <Link href={returnUrl} className="w-full py-3.5 bg-[#14532d] hover:bg-[#166534] text-white font-bold rounded-xl transition-all hover:-translate-y-0.5 inline-block cursor-pointer shadow-md shadow-[#14532d]/20">
                      Về danh sách chủ đề
                    </Link>
                  )
              })()}

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

      {/* Actual Mode - Checking Banner */}
      {actualCheckingMode && !isTestCompleted && (
         <div className="fixed top-0 left-0 right-0 max-w-4xl mx-auto z-50 p-2 md:p-4 pointer-events-none">
            <div className="bg-white/90 backdrop-blur-md border border-amber-200 shadow-xl shadow-amber-900/10 rounded-2xl p-4 flex items-center justify-between pointer-events-auto">
               <div className="flex flex-col">
                  <span className="text-amber-800 font-bold">Thời gian kiểm tra bài</span>
                  <span className="text-xs text-amber-600 font-medium">Bạn có 30 giây để hoàn thiện các câu chưa chọn</span>
               </div>
               <div className="flex items-center gap-4">
                  <div className="bg-amber-100 text-amber-700 font-mono font-bold text-2xl px-4 py-1.5 rounded-lg border border-amber-200">
                     00:{actualCheckTimeLeft.toString().padStart(2, '0')}
                  </div>
                  <button 
                     onClick={submitActualExam}
                     className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-6 rounded-xl transition-all shadow-md active:scale-95 whitespace-nowrap"
                  >
                     Nộp Bài
                  </button>
               </div>
            </div>
         </div>
      )}

      {/* Actual Mode - Finish Submit Modal */}
      {isSubmitModalOpen && !isTestCompleted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
           <motion.div 
             initial={{ opacity: 0, scale: 0.9, y: 20 }}
             animate={{ opacity: 1, scale: 1, y: 0 }}
             className="relative bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center"
           >
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 shrink-0">
                  <svg className="w-10 h-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-2">Hoàn thành bài nghe</h3>
              <p className="text-slate-500 mb-8 font-medium">Bạn đã nghe xong tất cả câu hỏi. Vui lòng chọn hành động tiếp theo.</p>
              
              <div className="flex flex-col gap-3">
                 <button 
                    onClick={submitActualExam}
                    className="w-full py-3.5 bg-[#14532d] hover:bg-[#166534] text-white font-bold rounded-xl transition-all shadow-md active:scale-95"
                 >
                    Nộp Bài & Xem Đáp Án
                 </button>
                 <button 
                    onClick={() => {
                        setIsSubmitModalOpen(false);
                        setActualCheckingMode(true);
                        setActualCheckTimeLeft(30);
                    }}
                    className="w-full py-3.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 font-bold rounded-xl transition-all active:scale-95"
                 >
                    Kiểm Tra Lại Lựa Chọn (30s)
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
