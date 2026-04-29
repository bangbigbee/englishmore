'use client'

import React, { useState, useEffect, use, useCallback, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { toast } from 'sonner'
import { getShortTheory } from '../short-theory'
import UpgradeModal from '@/components/UpgradeModal'
import ZoomableImage from '@/components/ZoomableImage'

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
  tips: string | null
  vocabulary: any
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
  tipsAccessTier: 'FREE' | 'PRO' | 'ULTRA'
  vocabularyAccessTier: 'FREE' | 'PRO' | 'ULTRA'
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

const TypewriterText = ({ text, speed = 15, className = "" }: { text: string, speed?: number, className?: string }) => {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    let i = 0;
    setDisplayedText("");
    const intervalId = setInterval(() => {
      setDisplayedText(text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(intervalId);
    }, speed);

    return () => clearInterval(intervalId);
  }, [text, speed]);

  return <span className={className}>{displayedText}</span>;
};

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
  const [showExplanation, setShowExplanation] = useState<Record<string, boolean>>({})
  const [showTranslation, setShowTranslation] = useState<Record<string, boolean>>({})
  const [showTips, setShowTips] = useState<Record<string, boolean>>({})
  const [showVocab, setShowVocab] = useState<Record<string, boolean>>({})
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<Record<string, boolean>>({})
  const [showLessonContent, setShowLessonContent] = useState(false)
  const [correctStreak, setCorrectStreak] = useState(0)
  const [timerStartTime, setTimerStartTime] = useState<number | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [isTestCompleted, setIsTestCompleted] = useState(false)
  const [lessonStarted, setLessonStarted] = useState(false)
  const [isPlayingDirections, setIsPlayingDirections] = useState(false)
  const [showGroupTranscriptEng, setShowGroupTranscriptEng] = useState<Record<number, boolean>>({});
  const [showGroupTranscriptViet, setShowGroupTranscriptViet] = useState<Record<number, boolean>>({});
  const [previewPage, setPreviewPage] = useState(0);
  
  // Actual Mode States
  const [actualCheckingMode, setActualCheckingMode] = useState<boolean>(false);
  const [actualCheckTimeLeft, setActualCheckTimeLeft] = useState<number>(30);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState<boolean>(false);
  const [isAudioNodePlaying, setIsAudioNodePlaying] = useState(false)
  const [sidebarState, setSidebarState] = useState(2) // 0: both hidden, 1: progress only, 2: both visible
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
  
  // Close info sidebar automatically when lesson starts
  useEffect(() => {
      if (lessonStarted) {
          setSidebarState(0);
      } else {
          setSidebarState(2);
      }
  }, [lessonStarted]);
  const [flyingStars, setFlyingStars] = useState<{ id: number, x: number, y: number, startX: number, startY: number, endX: number, endY: number }[]>([])
  const notebookRef = useRef<HTMLAnchorElement>(null)
  const bookmarkBtnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    setTimeout(() => window.scrollTo(0, 0), 10);
    const fetchTopic = async () => {
      try {
        const res = await fetch(`/api/toeic/grammar/${slug}`)
        if (!res.ok) throw new Error('Could not fetch topic')
        const data = await res.json()
        setTopic(data)
        if (data.lessons && data.lessons.length > 0) {
          const targetLesson = data.lessons.find((l: any) => l.id === initialLessonId) || data.lessons[0];
          setSelectedLessonId(targetLesson.id)
          
          const initialReviewId = searchParams.get('reviewId')
          if (initialReviewId) {
             const groupIndex = targetLesson.questions.findIndex((q: any) => q.id === initialReviewId);
             setActiveQuestionIndex(groupIndex !== -1 ? groupIndex : 0);
             setShowLessonContent(false);
             setLessonStarted(true);
             setIsTestCompleted(true);
             setIsReviewing(true);
          } else {
             setActiveQuestionIndex(0)
             setShowLessonContent(targetLesson.questions.length === 0)
             setLessonStarted(false)
             setIsTestCompleted(false)
             setIsReviewing(false)
             setPreviewPage(0)
          }

          if (data.type === 'LISTENING') setListeningMode('practice');
          setTimerStartTime(null)
          setElapsedTime(0)
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

  const toggleBookmark = async (questionId: string, event?: React.MouseEvent<HTMLButtonElement>) => {
    if (status !== 'authenticated') {
        const currentPath = window.location.pathname;
        router.push(`${currentPath}?login=true&allowGuest=true&subtitle=${encodeURIComponent('Đăng nhập để lưu trữ câu hỏi khó lại nhé.')}&callbackUrl=${encodeURIComponent(currentPath)}`, { scroll: false });
        return;
    }

    const currentlyBookmarked = !!bookmarkedQuestions[questionId];
    // Optimistic Update
    setBookmarkedQuestions(prev => ({ ...prev, [questionId]: !currentlyBookmarked }));
    
    // Capture position before await since event.currentTarget becomes null after await
    let btnRect: DOMRect | null = null;
    if (event?.currentTarget) {
        btnRect = event.currentTarget.getBoundingClientRect();
    }
    
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
        } else if (res.ok && !currentlyBookmarked && btnRect && notebookRef.current) {
            // Trigger flying stars
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
      } else if (!timerStartTime && lessonStarted) {
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
    if ((actualCheckingMode || isSubmitModalOpen) && !isTestCompleted && actualCheckTimeLeft > 0) {
        checkTimer = setInterval(() => {
            setActualCheckTimeLeft(prev => prev - 1);
        }, 1000);
    } else if ((actualCheckingMode || isSubmitModalOpen) && actualCheckTimeLeft <= 0 && !isTestCompleted) {
        submitActualExam();
    }
    return () => clearInterval(checkTimer);
  }, [actualCheckingMode, isSubmitModalOpen, actualCheckTimeLeft, isTestCompleted]);

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
    
    // Determine if it's a grouped reading question (Part 6 or 7)
    const isGroupedReading = topic?.type === 'READING' && (topic.part === 6 || topic.part === 7);
    let group: any[] = [];
    if (isGroupedReading) {
         const qs = currentLesson!.questions;
         if (topic.part === 6) {
             for(let i=0; i<qs.length; i+=4) {
                 const g = qs.slice(i, i+4);
                 if (g.some((q: any) => q.id === questionId)) { group = g; break; }
             }
         } else if (topic.part === 7) {
             const res = [];
             let g: any[] = [];
             qs.forEach((q: any, idx: number) => {
                 if (idx === 0 || (q.imageUrl && q.imageUrl !== g[0]?.imageUrl)) {
                     if (g.length > 0) res.push(g);
                     g = [q];
                 } else {
                     g.push(q);
                 }
             });
             if (g.length > 0) res.push(g);
             group = res.find(gr => gr.some((q: any) => q.id === questionId)) || [];
         }
    }
    
    // Exam mode interception: DO NOT EVALUATE results!
    if (topic?.type === 'LISTENING' && topic?.part && topic.part <= 4 && listeningMode === 'actual' && !isTestCompleted) {
       if (actualCheckingMode) return; // User is in checking phase, just record answer
       
       if (topic.part >= 3) {
           // For Part 3 and 4, we DO NOT auto-advance because there are 3 questions per group.
           // User manually goes to next group or audio triggers it.
           return;
       }

       // If currently testing (Part 1 and 2 auto-advance)
       if (currentLesson && activeQuestionIndex === currentLesson.questions.length - 1) {
           setTimeout(() => setIsSubmitModalOpen(true), 500);
       } else {
           setTimeout(() => setActiveQuestionIndex(prev => prev + 1), 500);
       }
       return;
    }

    // For Grouped Reading Practice Mode: Only evaluate if ALL questions in the group have an answer
    if (isGroupedReading && listeningMode !== 'actual') {
         const allAnswered = group.every((gq: any) => {
             if (gq.id === questionId) return true; // Just clicked
             return !!userAnswers[gq.id];
         });
         
         if (!allAnswered) {
             // Save silently to localstorage for guest just in case, but no DB points or showResults
             try {
                const stored = localStorage.getItem('toeic_guest_progress') || '{}';
                const allData = JSON.parse(stored);
                if (selectedLessonId) {
                    if (!allData[selectedLessonId]) allData[selectedLessonId] = {};
                    allData[selectedLessonId][questionId] = { selected: option, isCorrect: option === currentLesson?.questions.find(quest => quest.id === questionId)?.correctOption };
                    localStorage.setItem('toeic_guest_progress', JSON.stringify(allData));
                }
             } catch (error) {}
             
             // Auto-advance to the next unanswered question in the group
             const nextQ = group.find((gq: any) => gq.id !== questionId && !userAnswers[gq.id]);
             if (nextQ) {
                 const nextGlobalIdx = currentLesson?.questions.findIndex(q => q.id === nextQ.id);
                 if (nextGlobalIdx !== undefined && nextGlobalIdx !== -1) {
                     setTimeout(() => setActiveQuestionIndex(nextGlobalIdx), 300);
                 }
             }
             return;
         }
         
         // Trigger reveal for all in group
         const updates: Record<string, boolean> = {};
         group.forEach((gq: any) => updates[gq.id] = true);
         setShowResults(prev => ({ ...prev, ...updates }));
         
         // Process scoring for the whole group
         let groupStreak = correctStreak;
         let allCorrect = true;
         for (const gq of group) {
             const ans = gq.id === questionId ? option : userAnswers[gq.id];
             if (ans === gq.correctOption) {
                 groupStreak++;
             } else {
                 groupStreak = 0;
                 allCorrect = false;
             }
             
             // Persist each silently
             if (status === 'authenticated') {
                 fetch('/api/toeic/progress', {
                   method: 'POST',
                   headers: { 'Content-Type': 'application/json' },
                   body: JSON.stringify({ questionId: gq.id, selectedOption: ans, isCorrect: ans === gq.correctOption, currentStreak: groupStreak })
                 }).catch(() => {});
             } else {
                 try {
                    const stored = localStorage.getItem('toeic_guest_progress') || '{}';
                    const allData = JSON.parse(stored);
                    if (selectedLessonId) {
                        if (!allData[selectedLessonId]) allData[selectedLessonId] = {};
                        allData[selectedLessonId][gq.id] = { selected: ans, isCorrect: ans === gq.correctOption };
                        localStorage.setItem('toeic_guest_progress', JSON.stringify(allData));
                    }
                 } catch (error) {}
             }
         }
         
         setCorrectStreak(groupStreak);
         if (allCorrect) {
             new Audio('/audio/toeic-correct-ting-sound.mp3').play().catch(() => {});
         } else {
             new Audio('/audio/toeic-incorrect-sound.mp3').play().catch(() => {});
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
              toast.success(data.awardReason, { position: 'top-right', duration: 7000, style: { background: 'var(--secondary-100)', color: 'var(--secondary-800)', border: '1px solid var(--secondary-300)' } });
            } else {
              toast.success(`Chúc mừng! Bạn nhận được ${data.awardedPoints} ⭐.`, { position: 'top-right', duration: 7000, style: { background: 'var(--secondary-100)', color: 'var(--secondary-800)', border: '1px solid var(--secondary-300)' } })
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
                if (newStreak === 3) { fakeAp = 2; fakeReason = "Tuyệt vời! Bạn nhận 2 ⭐ cho chuỗi 3 câu đúng."; }
                else if (newStreak === 5) { fakeAp = 3; fakeReason = "Xuất sắc! Bạn nhận 3 ⭐ cho chuỗi 5 câu đúng."; }
                else if (newStreak === 10) { fakeAp = 5; fakeReason = "Đỉnh cao! Bạn nhận 5 ⭐ cho chuỗi 10 câu đúng."; }
            }
            
            const newShowResults = { ...showResults, [questionId]: true };
            const answeredCount = Object.keys(newShowResults).filter(k => currentLesson?.questions.some(q => q.id === k)).length;
            if (currentLesson && answeredCount === currentLesson.questions.length && currentLesson.questions.length > 0) {
                fakeAp += 15;
                if (fakeReason) fakeReason += " ";
                fakeReason += "Chúc mừng! Bạn nhận 15 ⭐ vì đã hoàn thành bài tập.";
                
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
                   toast.success(fakeReason, { position: 'top-right', duration: 7000, style: { background: 'var(--secondary-100)', color: 'var(--secondary-800)', border: '1px solid var(--secondary-300)' } });
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
    setTimerStartTime(null);
    setElapsedTime(0);
    setActiveQuestionIndex(0);
    
    if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
    }
    if (directionAudioRef.current) {
        directionAudioRef.current.pause();
        directionAudioRef.current.currentTime = 0;
    }
    setIsAudioNodePlaying(false);
    setIsPlayingDirections(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-900 border-t-transparent rounded-full animate-spin" />
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
          <Link href="/toeic-practice" className="text-primary-900 hover:underline">Quay lại trang chính</Link>
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
        <div className="w-full mx-auto px-4 sm:px-6 xl:px-8 2xl:px-12 h-16 flex items-center justify-between">
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
              <h1 className="font-black text-slate-900 text-sm md:text-base leading-tight">{topic.title.replace(/^\d+\.\s*/, '')}</h1>
              <p className="hidden md:block text-[10px] font-bold text-slate-400 uppercase tracking-widest">{topic.subtitle || (topic.type === 'READING' ? 'TOEIC Reading' : topic.type === 'LISTENING' ? 'TOEIC Listening' : 'TOEIC Grammar')}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="w-full mx-auto px-0 sm:px-6 xl:px-8 2xl:px-12 flex flex-col md:flex-row min-h-[calc(100vh-64px)]">
        {/* Sidebar */}
        <aside className={`w-full bg-white border-b md:border-b-0 md:sticky md:top-16 md:h-[calc(100vh-64px)] overflow-x-hidden transition-all duration-500 ease-in-out ${sidebarState !== 2 ? 'md:w-0 md:opacity-0 md:border-none hidden md:block' : 'md:w-80 md:border-r md:border-l md:border-slate-200 md:overflow-y-auto opacity-100 block'}`}>
          <div 
            className="p-3 border-b border-slate-100 flex justify-end md:hidden cursor-pointer"
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          >
            <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400">MENU</span>
                <svg className={`w-5 h-5 text-slate-400 transition-transform ${isMobileSidebarOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>
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
                  setTimerStartTime(null)
                  setElapsedTime(0)
                  setIsTestCompleted(false)
                  setLessonStarted(false)
                  setIsPlayingDirections(false)
                  setIsMobileSidebarOpen(false)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                className={`w-full text-left p-3 rounded-xl transition-all duration-200 group flex items-center gap-3 cursor-pointer ${
                  selectedLessonId === lesson.id
                    ? 'bg-primary-900/10 text-primary-900 shadow-sm ring-1 ring-primary-900/20'
                    : 'hover:bg-slate-100 text-slate-700 hover:translate-x-1'
                }`}
              >
                <div className="min-w-0 flex-1">
                  {(() => {
                    const match = lesson.title.match(/\s*\(\s*(Dễ|Khó|Trung bình)\s*\)/i);
                    const diff = match ? match[1] : null;
                    const displayTitle = match ? lesson.title.replace(match[0], '') : lesson.title;
                    return (
                      <>
                        <div className={`font-bold text-sm leading-tight flex items-center gap-2 ${selectedLessonId === lesson.id ? 'text-primary-900' : 'text-slate-800'}`}>
                          <span className="truncate" title={displayTitle}>{displayTitle}</span>
                          {lesson.accessTier === 'PRO' && (
                            <svg className="w-[18px] h-[18px] text-secondary-500 shrink-0 drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24" aria-label="PRO"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                          )}
                          {lesson.accessTier === 'ULTRA' && (
                            <svg className="w-[18px] h-[18px] text-primary-700 shrink-0 drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24" aria-label="ULTRA"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                          )}
                        </div>
                        <div className={`text-[11px] mt-0.5 font-medium flex items-center gap-1.5 ${selectedLessonId === lesson.id ? 'text-primary-900/70' : 'text-slate-500'}`}>
                          <span>{lesson.questions.length} câu hỏi</span>
                          {diff && (
                            <>
                              <span className="opacity-50 text-[8px]">•</span>
                              <span>{diff}</span>
                            </>
                          )}
                        </div>
                      </>
                    )
                  })()}
                </div>
                {(() => {
                  const lessonTierLevel = lesson.accessTier === 'ULTRA' ? 3 : lesson.accessTier === 'PRO' ? 2 : 1;
                  const userTierLevel = session?.user?.role === 'admin' ? 10 : session?.user?.tier === 'ULTRA' ? 3 : (session?.user?.tier === 'PRO' || session?.user?.role === 'member') ? 2 : 1;
                  return lessonTierLevel > userTierLevel ? (
                    <div className="shrink-0" onClick={(e) => { e.stopPropagation(); setShowPricing(true); }}>
                      <svg className="w-4 h-4 text-slate-400 opacity-60 cursor-pointer hover:text-secondary-500 transition-colors" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                    </div>
                  ) : (
                    <div 
                        onClick={(e) => { e.stopPropagation(); handleRestartLesson(lesson); }}
                        className={`shrink-0 flex items-center gap-1.5 transition-all cursor-pointer relative group/restart ${selectedLessonId === lesson.id ? 'opacity-100' : 'md:opacity-0 md:group-hover:opacity-100'}`}
                        title="Làm Lại Bài"
                    >
                       <span className="text-xs font-bold px-2 py-1 rounded shadow-sm border bg-white text-primary-900 border-primary-50 opacity-0 group-hover/restart:opacity-100 transition-opacity hidden sm:block whitespace-nowrap">Làm Lại Bài</span>
                       <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all border-primary-900 text-primary-900 hover:bg-primary-900/10 bg-white/80">
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
        <main className="flex-1 p-4 md:p-6 lg:p-8 xl:p-10 overflow-x-hidden">
          <div className={`mx-auto transition-all duration-300 w-full max-w-[1800px] flex flex-col xl:flex-row gap-6 items-start`}>
            <AnimatePresence mode="wait">
              {currentLesson ? (
                <motion.div
                  key={currentLesson.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="w-full flex flex-col gap-6"
                >
                  <div className={`w-full flex flex-col xl:flex-row gap-6 items-stretch relative`}>
                  
                  {lessonStarted && sidebarState === 0 && (
                      <button onClick={() => setSidebarState(2)} className="group hidden xl:flex absolute -left-6 xl:-left-10 top-10 w-8 h-16 bg-primary-50 border border-primary-200 shadow-lg shadow-primary-500/20 rounded-r-2xl items-center justify-center text-primary-600 hover:text-white hover:bg-primary-600 z-10 transition-all duration-300 hover:w-10">
                          <svg className="w-5 h-5 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                          <span className="absolute left-full ml-3 px-3 py-1.5 bg-slate-800 text-white text-[12px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none drop-shadow-md z-50">Mở rộng</span>
                      </button>
                  )}
                  {lessonStarted && sidebarState === 1 && (
                      <button onClick={() => setSidebarState(0)} className="group hidden xl:flex absolute left-[260px] 2xl:left-[300px] top-10 w-8 h-16 bg-primary-50 border border-primary-200 shadow-lg shadow-primary-500/20 rounded-r-2xl items-center justify-center text-primary-600 hover:text-white hover:bg-primary-600 z-20 transition-all duration-300 hover:w-10">
                          <svg className="w-5 h-5 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                          <span className="absolute left-full ml-3 px-3 py-1.5 bg-slate-800 text-white text-[12px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none drop-shadow-md z-50">Ẩn bớt</span>
                      </button>
                  )}
                  {lessonStarted && sidebarState === 2 && (
                      <button onClick={() => setSidebarState(1)} className="group hidden xl:flex absolute left-[260px] 2xl:left-[300px] top-10 w-8 h-16 bg-primary-50 border border-primary-200 shadow-lg shadow-primary-500/20 rounded-r-2xl items-center justify-center text-primary-600 hover:text-white hover:bg-primary-600 z-20 transition-all duration-300 hover:w-10">
                          <svg className="w-5 h-5 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                          <span className="absolute left-full ml-3 px-3 py-1.5 bg-slate-800 text-white text-[12px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none drop-shadow-md z-50">Ẩn bớt</span>
                      </button>
                  )}

                  {/* Left Column: Title + Time */}
                  <div className={`flex flex-col gap-6 w-full shrink-0 transition-all duration-500 overflow-hidden ${sidebarState !== 0 ? 'xl:w-[280px] 2xl:w-[320px] xl:opacity-100' : 'xl:w-0 xl:opacity-0 xl:border-0 xl:px-0 xl:mx-0'}`}>
                  {/* Compact Lesson Header & Toggle */}
                  <div className={`bg-white rounded-[2rem] border border-slate-200 shadow-sm flex h-full w-full`}>
                    <div className={`w-full p-4 lg:p-5 xl:sticky xl:top-24 flex flex-col gap-4`}>
                      <div className="flex flex-col items-center gap-3 w-full">
                      {(() => {
                        const match = currentLesson.title.match(/\s*\(\s*(Dễ|Khó|Trung bình)\s*\)/i);
                        const diff = match ? match[1] : null;
                        const displayTitle = match ? currentLesson.title.replace(match[0], '') : currentLesson.title;
                        return (
                          <div className="flex flex-col items-center gap-2 w-full">
                            <h2 className="text-xl font-black text-slate-900 leading-tight flex items-center justify-center gap-2 w-full text-center">
                              <span>{displayTitle}</span>
                              {currentLesson.accessTier === 'PRO' && <svg className="w-6 h-6 text-secondary-400 drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24" aria-label="PRO"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>}
                              {currentLesson.accessTier === 'ULTRA' && <svg className="w-6 h-6 text-primary-700 drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24" aria-label="ULTRA"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>}
                            </h2>
                            {diff && (
                              <div className="text-slate-500 font-medium text-[13px]">
                                {diff}
                              </div>
                            )}
                          </div>
                        )
                      })()}
                      {/* Control Mode Toggle */}
                      {/* Control Speed Toggle */}
                      {topic.type === 'LISTENING' && (
                        <div className={`flex items-center p-1 bg-slate-100 rounded-lg transition-all ${(listeningMode === 'actual' && !isTestCompleted) ? 'opacity-60' : ''}`}>
                          <button 
                            title="Nghe tốc độ chậm (0.85x)"
                            onClick={() => (listeningMode !== 'actual' || isTestCompleted) && setPlaybackSpeed(0.85)}
                            className={`text-xs font-bold px-3 py-1.5 rounded-md transition-all ${playbackSpeed === 0.85 ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'} ${(listeningMode === 'actual' && !isTestCompleted) ? 'cursor-not-allowed' : ''}`}
                          >
                            Nghe chậm
                          </button>
                          <button 
                            title="Nghe tốc độ bình thường (1.0x)"
                            onClick={() => (listeningMode !== 'actual' || isTestCompleted) && setPlaybackSpeed(1)}
                            className={`text-xs font-bold px-3 py-1.5 rounded-md transition-all ${playbackSpeed === 1 ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'} ${(listeningMode === 'actual' && !isTestCompleted) ? 'cursor-not-allowed' : ''}`}
                          >
                            Thường
                          </button>
                          <button 
                            title="Nghe tốc độ nhanh (1.25x)"
                            onClick={() => (listeningMode !== 'actual' || isTestCompleted) && setPlaybackSpeed(1.25)}
                            className={`text-xs font-bold px-3 py-1.5 rounded-md transition-all ${playbackSpeed === 1.25 ? 'bg-white text-red-500 shadow-sm' : 'text-slate-500 hover:text-slate-700'} ${(listeningMode === 'actual' && !isTestCompleted) ? 'cursor-not-allowed' : ''}`}
                          >
                            Nghe nhanh
                          </button>
                        </div>
                      )}
                      
                      {/* Flex container for play button and timer to keep them together if in sidebar */}
                      {(timerStartTime !== null || isTestCompleted) && (
                        <div className="flex flex-col gap-2 mt-1">
                           {/* Normal state timer & play button */}
                           {!isTestCompleted && timerStartTime !== null && (
                             <div className="flex items-center gap-2">
                               {topic.type === 'LISTENING' && lessonStarted && (
                                  <button
                                    onClick={() => {
                                      if (listeningMode === 'actual' && !isTestCompleted) return;
                                      if (isPlayingDirections && directionAudioRef.current) {
                                        if (directionAudioRef.current.paused) directionAudioRef.current.play();
                                        else directionAudioRef.current.pause();
                                      } else if (audioRef.current) {
                                        if (audioRef.current.paused) audioRef.current.play();
                                        else audioRef.current.pause();
                                      }
                                    }}
                                    className={`w-8 h-8 flex items-center justify-center rounded-full transition-all shrink-0 ${(listeningMode === 'actual' && !isTestCompleted) ? 'bg-slate-100 text-slate-400 border border-slate-200 opacity-60 cursor-not-allowed' : 'bg-slate-100 text-primary-900 border border-slate-200 hover:bg-primary-50 hover:border-primary-200 cursor-pointer'}`}
                                    title={(listeningMode === 'actual' && !isTestCompleted) ? "Không thể điều khiển ở chế độ Thi thử" : "Play/Pause Audio"}
                                  >
                                    {isAudioNodePlaying ? (
                                       <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                                    ) : (
                                       <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                                    )}
                                  </button>
                               )}
                               <span className="tabular-nums text-primary-700 font-mono font-bold bg-primary-50 px-2 py-1 rounded border border-primary-100 text-sm">
                                 {Math.floor(elapsedTime / 60).toString().padStart(2, '0')}:{(elapsedTime % 60).toString().padStart(2, '0')}
                               </span>
                             </div>
                           )}

                           {/* Enhanced Audio Controls for Review Mode */}
                           {topic.type === 'LISTENING' && lessonStarted && isTestCompleted && (
                               <div className="flex items-center gap-2">
                                  {/* Backward 3s */}
                                  <button 
                                      onClick={() => { if (audioRef.current) audioRef.current.currentTime -= 3; }} 
                                      className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:text-primary-900 hover:bg-primary-50 border border-slate-200"
                                      title="Tua lui 3 giây"
                                  >
                                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 19 2 12 11 5 11 19"/><polygon points="22 19 13 12 22 5 22 19"/></svg>
                                  </button>
                                  
                                  {/* Play / Pause */}
                                  <button
                                    onClick={() => {
                                      if (audioRef.current) {
                                        if (audioRef.current.paused) audioRef.current.play();
                                        else audioRef.current.pause();
                                      }
                                    }}
                                    className="w-10 h-10 flex items-center justify-center rounded-full bg-primary-100 text-primary-800 border border-primary-200 hover:bg-primary-200 transition-colors"
                                    title="Play/Pause Audio"
                                  >
                                    {isAudioNodePlaying ? (
                                       <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                                    ) : (
                                       <svg className="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                                    )}
                                  </button>
                                  
                                  {/* Forward 3s */}
                                  <button 
                                      onClick={() => { if (audioRef.current) audioRef.current.currentTime += 3; }} 
                                      className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:text-primary-900 hover:bg-primary-50 border border-slate-200"
                                      title="Tua tới 3 giây"
                                  >
                                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 19 22 12 13 5 13 19"/><polygon points="2 19 11 12 2 5 2 19"/></svg>
                                  </button>
                               </div>
                           )}
                        </div>
                      )}
                    </div>
                    
                    {/* Progress Stats & Start Controls */}
                      <div className="w-full pt-3 mt-1 border-t border-slate-100">
                         {(() => {
                             const answeredCount = currentLesson.questions.filter(q => userAnswers[q.id] !== undefined).length;
                             const totalCount = currentLesson.questions.length;
                             const correctCount = currentLesson.questions.filter(q => userAnswers[q.id] === q.correctOption).length;
                             
                             const handleResetProgress = async () => {
                                 if (status === 'authenticated') {
                                     await fetch(`/api/toeic/progress?lessonId=${selectedLessonId}`, { method: 'DELETE' });
                                 } else {
                                     const stored = localStorage.getItem('toeic_guest_progress');
                                     if (stored) {
                                         const data = JSON.parse(stored);
                                         delete data[selectedLessonId!];
                                         localStorage.setItem('toeic_guest_progress', JSON.stringify(data));
                                     }
                                 }
                                 const newAnswers = { ...userAnswers };
                                 const newResults = { ...showResults };
                                 currentLesson.questions.forEach(q => {
                                     delete newAnswers[q.id];
                                     delete newResults[q.id];
                                 });
                                 setUserAnswers(newAnswers);
                                 setShowResults(newResults);
                                 
                                 setLessonStarted(true);
                                 setTimerStartTime(Date.now());
                                 setIsTestCompleted(false);
                                 setActiveQuestionIndex(0);
                                 
                                 if (topic.type === 'LISTENING' && currentLesson.directionAudioUrl && directionAudioRef.current) {
                                     setIsPlayingDirections(true);
                                     directionAudioRef.current.play().catch(e => console.error("Direction Audio autoplay blocked", e));
                                 }
                             };
                             
                             if (!lessonStarted) {
                                 if (answeredCount > 0) {
                                     return (
                                        <div className="flex flex-col gap-4">
                                           <div className="flex flex-col gap-2.5">
                                                <h4 className="text-[13px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                                                    <svg className="w-4 h-4 text-primary-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth="2.5"/><circle cx="12" cy="12" r="6" strokeWidth="2.5"/><circle cx="12" cy="12" r="2" strokeWidth="2.5"/></svg>
                                                    Tiến độ
                                                </h4>
                                                <div className="flex justify-between items-center text-sm bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                                                   <span className="text-slate-600 font-medium">Đã làm:</span>
                                                   <span className="font-bold text-slate-800">{answeredCount} / {totalCount}</span>
                                                </div>
                                                {(topic.type === 'GRAMMAR' || topic.type === 'READING' || (topic.type === 'LISTENING' && listeningMode === 'practice')) && (
                                                   <div className="flex justify-between items-center text-sm bg-primary-50/50 px-3 py-2 rounded-lg border border-primary-100/50">
                                                      <span className="text-slate-600 font-medium">Số câu đúng:</span>
                                                      <span className="font-bold text-primary-600">{correctCount}</span>
                                                   </div>
                                                )}
                                           </div>
                                           <div className="flex flex-col gap-2 mt-2">
                                              <button onClick={handleResetProgress} className="w-full font-bold px-4 py-3 rounded-xl transition-all shadow-sm text-[13px] uppercase tracking-wider bg-white border-2 border-primary-700 text-primary-700 hover:bg-slate-50 hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2">
                                                  Làm Lại Bài
                                              </button>
                                              <button onClick={() => { setLessonStarted(true); setIsTestCompleted(true); setIsReviewing(true); }} className="w-full font-bold px-4 py-3 rounded-xl transition-all shadow-md text-[13px] uppercase tracking-wider bg-primary-700 text-white hover:bg-primary-800 hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2">
                                                  Xem Lại
                                              </button>
                                           </div>
                                        </div>
                                     );
                                 } else {
                                     return (
                                        <div className="flex flex-col gap-4 mt-2">
                                           <p className="text-[14px] font-medium text-primary-600 w-full text-center mb-1">Bạn chưa làm bài tập này</p>
                                           <button 
                                              onClick={() => {
                                                  setLessonStarted(true);
                                                  setTimerStartTime(Date.now());
                                                  if (topic.type === 'LISTENING' && currentLesson.directionAudioUrl && directionAudioRef.current) {
                                                      setIsPlayingDirections(true);
                                                      directionAudioRef.current.play().catch(e => console.error("Direction Audio autoplay blocked", e));
                                                  }
                                              }} 
                                              className="w-full font-bold px-4 py-3.5 rounded-xl transition-all shadow-md text-[14px] uppercase tracking-wider bg-primary-700 text-white hover:bg-primary-800 hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2"
                                           >
                                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                                              Bắt Đầu Ngay
                                           </button>
                                        </div>
                                     );
                                 }
                             } else {
                                 return (
                                     <div className="flex flex-col gap-2.5">
                                        <h4 className="text-[13px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                                            <svg className="w-4 h-4 text-primary-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth="2.5"/><circle cx="12" cy="12" r="6" strokeWidth="2.5"/><circle cx="12" cy="12" r="2" strokeWidth="2.5"/></svg>
                                            Tiến độ
                                        </h4>
                                        <div className="flex justify-between items-center text-sm bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                                           <span className="text-slate-600 font-medium">Đã làm:</span>
                                           <span className="font-bold text-slate-800">{answeredCount} / {totalCount}</span>
                                        </div>
                                        {(topic.type === 'GRAMMAR' || topic.type === 'READING' || (topic.type === 'LISTENING' && listeningMode === 'practice')) && (
                                           <div className="flex justify-between items-center text-sm bg-primary-50/50 px-3 py-2 rounded-lg border border-primary-100/50">
                                              <span className="text-slate-600 font-medium">Số câu đúng:</span>
                                              <span className="font-bold text-primary-600">{correctCount}</span>
                                           </div>
                                        )}
                                     </div>
                                 );
                             }
                         })()}
                      </div>

                    {/* Sổ Tay Link */}
                    <div className="w-full pt-4 mt-auto">
                      <Link 
                          ref={notebookRef}
                          href={topic.type === 'READING' ? '/toeic-progress?tab=reading-bank' : topic.type === 'LISTENING' ? '/toeic-progress?tab=listening-bank' : '/toeic-progress?tab=grammar-bank'}
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
                          className="w-full flex items-center justify-center gap-1.5 text-slate-500 hover:text-primary-700 transition-colors text-[13px] font-medium cursor-pointer"
                          title="Khám phá sổ tay học tập của bạn"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                        Xem Sổ Tay Của Tôi
                      </Link>
                    </div>
                    </div>
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
                               <div className={`bg-primary-50/50 p-6 rounded-2xl border border-primary-100/50 ${isLocked ? 'blur-sm pointer-events-none opacity-40 select-none' : ''}`}>
                                 <div className="prose prose-slate max-w-none prose-headings:font-black prose-p:text-slate-600 prose-p:leading-relaxed prose-li:text-slate-600">
                                   <div 
                                     className="whitespace-pre-wrap text-slate-700 leading-relaxed text-sm md:text-base prose prose-sm md:prose-base max-w-none prose-headings:font-bold prose-headings:text-slate-800 prose-p:my-2 prose-a:text-primary-900 prose-ul:list-disc prose-ol:list-decimal prose-ul:ml-5 prose-ol:ml-5 prose-li:my-1 prose-li:marker:text-gray-800 marker:font-bold"
                                     dangerouslySetInnerHTML={{ __html: currentLesson.content || 'Nội dung đang được cập nhật...' }}
                                   />
                                 </div>
                               </div>
                               {isLocked && (
                                  <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-4">
                                     <button onClick={() => setShowPricing(true)} className="group max-w-[85%] mx-auto bg-white/95 backdrop-blur-sm border border-slate-200/80 shadow-md hover:shadow-lg rounded-2xl md:rounded-full px-4 py-2.5 flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1 cursor-pointer transition-all hover:scale-105 active:scale-95 text-[13px] font-medium text-slate-700">
                                       <div className="flex items-center gap-1.5 whitespace-nowrap">
                                         {currentLesson.theoryAccessTier === 'ULTRA' ? (
                                            <svg className="w-4 h-4 text-primary-700 shrink-0 drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                                         ) : (
                                            <svg className="w-4 h-4 text-secondary-500 shrink-0 drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                                         )}
                                         <span>Nâng cấp</span>
                                       </div>
                                       <div className="flex items-center gap-1 whitespace-nowrap">
                                         <span className={`${currentLesson.theoryAccessTier === 'ULTRA' ? 'bg-primary-100 text-primary-900 border border-primary-200' : 'bg-secondary-100 text-secondary-700 border border-secondary-200'} font-bold text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded`}>{currentLesson.theoryAccessTier}</span>
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
                  </div> {/* End of Left Column */}

                  {/* Main Area */}
                  <div className={`flex-1 w-full min-w-0 flex flex-col`}>

                  {/* Focused Paginated Quiz Section */}
                  {currentLesson.questions.length > 0 && (
                    <section id="quiz-container" className="relative h-full flex flex-col">
                      {/* Global Persistent Audio Player */}
                      {(() => {
                        const questionGroups = (() => {
                             const qs = currentLesson.questions;
                             if (topic.type === 'LISTENING' && (topic.part === 3 || topic.part === 4)) {
                                 const res = [];
                                 for(let i=0; i<qs.length; i+=3) res.push(qs.slice(i, i+3));
                                 return res;
                             }
                             if (topic.type === 'READING' && topic.part === 6) {
                                 const res = [];
                                 for(let i=0; i<qs.length; i+=4) res.push(qs.slice(i, i+4));
                                 return res;
                             }
                             if (topic.type === 'READING' && topic.part === 7) {
                                 const res = [];
                                 let g: any[] = [];
                                 qs.forEach((q: any, idx: number) => {
                                     if (idx === 0 || (q.imageUrl && q.imageUrl !== g[0]?.imageUrl)) {
                                         if (g.length > 0) res.push(g);
                                         g = [q];
                                     } else {
                                         g.push(q);
                                     }
                                 });
                                 if (g.length > 0) res.push(g);
                                 return res;
                             }
                             return qs.map(q => [q]);
                        })();
                          
                        const activeGroupIndex = questionGroups.findIndex(g => g.some(q => q.id === currentLesson.questions[activeQuestionIndex]?.id));
                        const currentQuestionsGroup = questionGroups[activeGroupIndex] || [];
                        const activeGroupStartIndex = currentLesson.questions.findIndex(q => q.id === currentQuestionsGroup[0]?.id);
                        const questionsPerView = currentQuestionsGroup.length;
                        
                        let activeAudioUrl = currentLesson.questions[activeGroupStartIndex]?.audioUrl || null;

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
                                    if (activeQuestionIndex < currentLesson.questions.length - questionsPerView) {
                                       setActiveQuestionIndex(prev => prev + questionsPerView);
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
                      
                      {isPlayingDirections ? (
                              <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 p-6 md:p-10 text-center animate-in fade-in zoom-in duration-300">
                                  <h3 className="text-xl md:text-2xl font-black text-primary-900 mb-2 mt-2">Bạn đang nghe directions của Phần {topic.part} bài thi</h3>
                                  {topic.part === 2 ? (
                                    <p className="mb-12 mt-4 max-w-3xl mx-auto px-4 py-3 bg-red-50 rounded-xl border border-red-200 text-center">
                                      <span className="text-xs md:text-sm font-medium text-red-700 block">Nội dung câu hỏi từ Câu 7 đến Câu 31 trong phần này sẽ KHÔNG được in sẵn.</span>
                                      <span className="text-xs md:text-sm font-medium text-red-700 mt-1 block">Hãy tập trung lắng nghe hoàn toàn!</span>
                                    </p>
                                  ) : (
                                    <p className="text-sm text-slate-500 mb-8 font-medium">Hãy tranh thủ thời gian "vàng" này lướt nhanh qua các hình ảnh hoặc câu hỏi bên dưới.</p>
                                  )}
                                  
                                  {topic.part !== 2 && (
                                    <>
                                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4 text-left min-h-[200px]">
                                       {currentLesson.questions.slice(previewPage * 9, (previewPage + 1) * 9).map((q, idx) => {
                                          const actualIdx = previewPage * 9 + idx;
                                          return (
                                            <div key={q.id} className="relative flex flex-col rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all group">
                                                <div className="absolute top-2 left-2 bg-primary-900 text-white text-[10px] sm:text-xs font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md shadow-sm z-10 flex items-center gap-1 leading-none">
                                                    <span>Câu {(() => {
                                                        if (topic.type === 'LISTENING') {
                                                            if (topic.part === 2) return actualIdx + 7;
                                                            if (topic.part === 3) return actualIdx + 32;
                                                            if (topic.part === 4) return actualIdx + 71;
                                                        } else if (topic.type === 'READING') {
                                                            if (topic.part === 5) return actualIdx + 101;
                                                            if (topic.part === 6) return actualIdx + 131;
                                                            if (topic.part === 7) return actualIdx + 147;
                                                        }
                                                        return actualIdx + 1;
                                                    })()}</span>
                                                </div>
                                                {q.imageUrl ? (
                                                    <div className="aspect-[4/3] bg-slate-50 relative border-b border-slate-100 overflow-hidden group/img">
                                                        <img 
                                                           src={q.imageUrl} 
                                                           alt="Preview" 
                                                           className="absolute inset-0 w-full h-full object-contain p-1 group-hover/img:scale-105 transition-transform duration-300" 
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="p-4 pt-10 text-sm text-slate-700 font-medium line-clamp-4 bg-slate-50/50">
                                                        {topic.part === 2 
                                                          ? <span className="italic text-slate-400 font-normal">Nội dung câu hỏi không được in sẵn để xem.</span> 
                                                          : q.question.replace(/^(?:Câu|Question)\s*\d+[:\-\.]?\s*/i, '')}
                                                    </div>
                                                )}
                                            </div>
                                          )
                                       })}
                                      </div>
                                      {currentLesson.questions.length > 9 && (
                                        <div className="flex items-center justify-center gap-3 mb-10 mt-2">
                                           <button 
                                              onClick={() => setPreviewPage(p => Math.max(0, p - 1))}
                                              disabled={previewPage === 0}
                                              className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-slate-600"
                                           >
                                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                           </button>
                                           <span className="text-sm font-bold text-slate-500 min-w-[3rem] text-center">
                                              {previewPage + 1} / {Math.ceil(currentLesson.questions.length / 9)}
                                           </span>
                                           <button 
                                              onClick={() => setPreviewPage(p => Math.min(Math.ceil(currentLesson.questions.length / 9) - 1, p + 1))}
                                              disabled={previewPage === Math.ceil(currentLesson.questions.length / 9) - 1}
                                              className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-slate-600"
                                           >
                                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                           </button>
                                        </div>
                                      )}
                                    </>
                                  )}

                                  <button 
                                      onClick={() => {
                                         if (directionAudioRef.current) {
                                             directionAudioRef.current.pause();
                                             directionAudioRef.current.currentTime = 0;
                                         }
                                         setIsPlayingDirections(false);
                                      }}
                                      className="bg-primary-50 border border-primary-100 hover:bg-primary-100 text-primary-700 font-extrabold px-8 py-3.5 rounded-xl transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 uppercase tracking-wider text-[15px] mx-auto shadow-sm"
                                  >
                                     <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
                                     SKIP DIRECTIONS &rarr; VÀO BÀI NGAY
                                  </button>
                              </div>
                          ) : (
                            <>
                              <AnimatePresence mode="wait">
                                {(() => {
                                  const questionGroups = (() => {
                                       const qs = currentLesson.questions;
                                       if (topic.type === 'LISTENING' && (topic.part === 3 || topic.part === 4)) {
                                           const res = [];
                                           for(let i=0; i<qs.length; i+=3) res.push(qs.slice(i, i+3));
                                           return res;
                                       }
                                       if (topic.type === 'READING' && topic.part === 6) {
                                           const res = [];
                                           for(let i=0; i<qs.length; i+=4) res.push(qs.slice(i, i+4));
                                           return res;
                                       }
                                       if (topic.type === 'READING' && topic.part === 7) {
                                           const res = [];
                                           let g: any[] = [];
                                           qs.forEach((q: any, idx: number) => {
                                               if (idx === 0 || (q.imageUrl && q.imageUrl !== g[0]?.imageUrl)) {
                                                   if (g.length > 0) res.push(g);
                                                   g = [q];
                                               } else {
                                                   g.push(q);
                                               }
                                           });
                                           if (g.length > 0) res.push(g);
                                           return res;
                                       }
                                       return qs.map(q => [q]);
                                  })();
                                  
                                  const activeGroupIndex = questionGroups.findIndex(g => g.some(q => q.id === currentLesson.questions[activeQuestionIndex]?.id));
                                  const currentQuestionsGroup = questionGroups[activeGroupIndex] || [];
                                  const activeGroupStartIndex = currentLesson.questions.findIndex(q => q.id === currentQuestionsGroup[0]?.id);
                                  const questionsPerView = currentQuestionsGroup.length;
                                  
                                  if (currentQuestionsGroup.length === 0) return null;

                                  return (
                                    <motion.div
                                      key={`group-${activeGroupStartIndex}`}
                                      initial={{ opacity: 0, x: 20 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      exit={{ opacity: 0, x: -20 }}
                                      transition={{ duration: 0.2 }}
                                      className={`bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 p-5 md:p-8 relative overflow-hidden flex flex-col ${!lessonStarted ? 'h-[65vh] min-h-[450px] max-h-[700px]' : 'h-fit'}`}
                                    >
                                        {!lessonStarted && (
                                            <div className="absolute inset-0 z-50 bg-white/60 backdrop-blur-[6px] flex flex-col items-center justify-center p-4">
                                                 <div className="w-full max-w-lg flex flex-col gap-4">
                                                     {/* Theory Box (Only for Grammar) */}
                                                     {topic.type === 'GRAMMAR' && (
                                                         <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-primary-100 shadow-sm p-5 flex flex-col gap-3 transform transition-all hover:scale-[1.02] duration-300 mt-2 relative overflow-hidden group/theory">
                                                             <div className="flex items-center gap-3">
                                                                 <div className="w-10 h-10 bg-primary-600/10 rounded-xl flex items-center justify-center text-primary-600 shrink-0 border border-primary-100/50">
                                                                     <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                                                                 </div>
                                                                 <h4 className="text-primary-900 font-bold text-[15px]">Kiến thức cần nhớ</h4>
                                                             </div>
                                                             {(() => {
                                                                 const theory = getShortTheory(topic.slug);
                                                                 const isAuthenticated = status === 'authenticated';
                                                                 const theoryTierLevel = currentLesson.theoryAccessTier === 'ULTRA' ? 3 : currentLesson.theoryAccessTier === 'PRO' ? 2 : 1;
                                                                 const userTierLevel = session?.user?.role === 'admin' ? 10 : session?.user?.tier === 'ULTRA' ? 3 : (session?.user?.tier === 'PRO' || session?.user?.role === 'member') ? 2 : 1;
                                                                 const isLocked = theoryTierLevel > userTierLevel;
                                                                 
                                                                 return (
                                                                     <div className={`text-slate-600 text-[14px] leading-relaxed pr-2 font-medium relative ${isAuthenticated && !isLocked ? 'max-h-[160px] overflow-y-auto custom-scrollbar' : 'max-h-[72px] overflow-hidden'}`}>
                                                                         <div className="whitespace-pre-wrap relative pb-6">
                                                                             <TypewriterText text={theory} speed={12} />
                                                                             {(!isAuthenticated || isLocked) && (
                                                                                 <div 
                                                                                     className="absolute inset-0 pointer-events-none z-10"
                                                                                     style={{ 
                                                                                         backdropFilter: 'blur(4px)', 
                                                                                         WebkitBackdropFilter: 'blur(4px)',
                                                                                         maskImage: 'linear-gradient(to bottom, transparent 0%, transparent 30%, black 70%, black 100%)',
                                                                                         WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, transparent 30%, black 70%, black 100%)' 
                                                                                     }}
                                                                                 />
                                                                             )}
                                                                         </div>
                                                                         {!isAuthenticated ? (
                                                                             <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white via-white/80 to-transparent flex items-end justify-center pb-2 z-20">
                                                                                 <button 
                                                                                     onClick={(e) => { 
                                                                                         e.preventDefault(); 
                                                                                         const currentPath = window.location.pathname; 
                                                                                         router.push(`${currentPath}?login=true&allowGuest=true&subtitle=${encodeURIComponent('Đăng nhập để xem trọn vẹn kiến thức tóm tắt nhé.')}&callbackUrl=${encodeURIComponent(currentPath)}`, { scroll: false }); 
                                                                                     }} 
                                                                                     className="text-[13px] font-bold text-primary-600 hover:text-primary-700 hover:underline transition-all flex items-center gap-1.5 cursor-pointer"
                                                                                 >
                                                                                     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                                                                     Đăng nhập để xem thêm kiến thức
                                                                                 </button>
                                                                             </div>
                                                                         ) : isLocked ? (
                                                                             <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white via-white/80 to-transparent flex items-end justify-center pb-2 z-20">
                                                                                 <button 
                                                                                     onClick={(e) => { 
                                                                                         e.preventDefault(); 
                                                                                         setShowPricing(true);
                                                                                     }} 
                                                                                     className={`text-[13px] font-bold hover:underline transition-all flex items-center gap-1.5 cursor-pointer ${currentLesson.theoryAccessTier === 'ULTRA' ? 'text-primary-700 hover:text-primary-800' : 'text-secondary-600 hover:text-secondary-700'}`}
                                                                                 >
                                                                                     {currentLesson.theoryAccessTier === 'ULTRA' ? (
                                                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                                                                                     ) : (
                                                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                                                                                     )}
                                                                                     Nâng cấp gói {currentLesson.theoryAccessTier} để xem thêm
                                                                                 </button>
                                                                             </div>
                                                                         ) : null}
                                                                     </div>
                                                                 );
                                                             })()}
                                                         </div>
                                                     )}
{/* Tip 1 */}
                                                     <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-amber-100 shadow-sm p-4 flex flex-row items-center gap-4 transform transition-all hover:scale-[1.02] duration-300">
                                                         <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500 shrink-0 border border-amber-100/50">
                                                             <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                                                         </div>
                                                         <p className="text-slate-600 font-medium text-[15px] leading-snug text-left">
                                                             Nếu gặp câu khó, bấm <strong className="text-amber-600 font-bold">Giải thích</strong> để hiểu rõ hơn.
                                                         </p>
                                                     </div>

                                                     {/* Tip 2 */}
                                                     <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-primary-100 shadow-sm p-4 flex flex-row items-center gap-4 transform transition-all hover:scale-[1.02] duration-300">
                                                         <div className="w-12 h-12 bg-primary-700/10 rounded-xl flex items-center justify-center text-primary-700 shrink-0 border border-primary-100/50">
                                                             <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                                                         </div>
                                                         <p className="text-slate-600 font-medium text-[15px] leading-snug text-left">
                                                             Nếu thấy câu hay và cần xem sau, bấm <strong className="text-primary-700 font-bold">Lưu lại</strong> để lưu vào Sổ tay học tập.
                                                         </p>
                                                     </div>

                                                                                                      </div>
                                                 

                                            </div>
                                        )}
                                      
                                        {(() => {
                                           const extractExplanationParts = (text: string) => {
                                               if (!text || !text.includes('[Transcript]')) {
                                                   return { eng: '', viet: '', explanation: text };
                                               }
                                               const engMatch = text.match(/\[Transcript\]\n([\s\S]*?)(?=\n\n\[Dịch nghĩa\])/i);
                                               const vietMatch = text.match(/\[Dịch nghĩa\]\n([\s\S]*?)(?=\n\n\[Giải thích\])/i);
                                               const expMatch = text.match(/\[Giải thích\]\n([\s\S]*)$/i);
                                               return {
                                                   eng: engMatch ? engMatch[1].trim() : '',
                                                   viet: vietMatch ? vietMatch[1].trim() : '',
                                                   explanation: expMatch ? expMatch[1].trim() : text,
                                               };
                                           };
                                           const groupParts = extractExplanationParts(currentQuestionsGroup[0]?.explanation || '');
                                           const hasGroupTranscript = (topic.part === 3 || topic.part === 4) && !!groupParts.eng;
                                           const someResultShown = currentQuestionsGroup.some(q => showResults[q.id]);
                                           const isGrammarLayout = topic.type === 'GRAMMAR' || (topic.type === 'READING' && topic.part === 5) || (topic.type === 'LISTENING' && topic.part === 2);
                                           
                                           return (
                                              <div className="flex flex-col xl:flex-row gap-8 xl:gap-12 w-full">
                                                {/* Middle Column: Transcripts & Image */}
                                                {!isGrammarLayout && (
                                                <div className="flex flex-col gap-6 xl:w-[45%] 2xl:w-[50%] shrink-0 min-w-0">
                                                 {hasGroupTranscript && (someResultShown || (topic.type === 'LISTENING' && topic.part && topic.part <= 4 && listeningMode === 'practice')) && (
                                                    <div className="mb-2 flex flex-col items-center">
                                                       <div className="flex flex-wrap gap-3 items-center justify-center bg-slate-50 p-2 rounded-2xl border border-slate-100">
                                                          <button 
                                                             onClick={() => {
                                                                 const tierLevel = currentLesson.theoryAccessTier === 'ULTRA' ? 3 : currentLesson.theoryAccessTier === 'PRO' ? 2 : 1;
                                                                 const userTierLevel = session?.user?.role === 'admin' ? 10 : session?.user?.tier === 'ULTRA' ? 3 : (session?.user?.tier === 'PRO' || session?.user?.role === 'member') ? 2 : 1;
                                                                 if (tierLevel > userTierLevel) {
                                                                     setShowPricing(true);
                                                                     return;
                                                                 }
                                                                 setShowGroupTranscriptEng(prev => ({ ...prev, [activeGroupStartIndex]: !prev[activeGroupStartIndex] }));
                                                             }}
                                                             className={`flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm border ${showGroupTranscriptEng[activeGroupStartIndex] ? 'bg-primary-700 border-primary-700 text-white' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-primary-700'}`}
                                                          >
                                                             Thoại tiếng Anh
                                                             {currentLesson.theoryAccessTier === 'PRO' && session?.user?.tier !== 'ULTRA' && session?.user?.tier !== 'PRO' && session?.user?.role !== 'admin' && <svg className="w-3 h-3 text-secondary-400 drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>}
                                                             {currentLesson.theoryAccessTier === 'ULTRA' && session?.user?.tier !== 'ULTRA' && session?.user?.role !== 'admin' && <svg className="w-3 h-3 text-primary-600 drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>}
                                                          </button>
                                                          
                                                          {groupParts.viet && (
                                                             <button 
                                                                onClick={() => {
                                                                    const tierLevel = currentLesson.translationAccessTier === 'ULTRA' ? 3 : currentLesson.translationAccessTier === 'PRO' ? 2 : 1;
                                                                    const userTierLevel = session?.user?.role === 'admin' ? 10 : session?.user?.tier === 'ULTRA' ? 3 : (session?.user?.tier === 'PRO' || session?.user?.role === 'member') ? 2 : 1;
                                                                    if (tierLevel > userTierLevel) {
                                                                        setShowPricing(true);
                                                                        return;
                                                                    }
                                                                    setShowGroupTranscriptViet(prev => ({ ...prev, [activeGroupStartIndex]: !prev[activeGroupStartIndex] }));
                                                                }}
                                                                className={`flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm border ${showGroupTranscriptViet[activeGroupStartIndex] ? 'bg-primary-700 border-primary-700 text-white' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-primary-700'}`}
                                                             >
                                                                Thoại tiếng Việt
                                                                {currentLesson.translationAccessTier === 'PRO' && session?.user?.tier !== 'ULTRA' && session?.user?.tier !== 'PRO' && session?.user?.role !== 'admin' && <svg className="w-3 h-3 text-secondary-400 drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>}
                                                                {currentLesson.translationAccessTier === 'ULTRA' && session?.user?.tier !== 'ULTRA' && session?.user?.role !== 'admin' && <svg className="w-3 h-3 text-primary-600 drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>}
                                                             </button>
                                                          )}
                                                       </div>
                                                       
                                                       <AnimatePresence>
                                                          {(showGroupTranscriptEng[activeGroupStartIndex] || showGroupTranscriptViet[activeGroupStartIndex]) && (
                                                              <motion.div 
                                                                 initial={{ opacity: 0, height: 0 }}
                                                                 animate={{ opacity: 1, height: 'auto' }}
                                                                 exit={{ opacity: 0, height: 0 }}
                                                                 className="w-full overflow-hidden mt-4"
                                                              >
                                                                 <div className="bg-slate-50/80 p-5 md:p-6 rounded-2xl border border-slate-200 shadow-inner grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                                                                    {showGroupTranscriptEng[activeGroupStartIndex] && (
                                                                        <div className="flex flex-col">
                                                                           <div className="text-xs font-black uppercase text-primary-700 mb-2 border-b border-primary-200 pb-2">Tiếng Anh</div>
                                                                           <div className="text-sm text-slate-700 leading-relaxed font-medium" dangerouslySetInnerHTML={{ __html: groupParts.eng.replace(/\n/g, '<br/>') }} />
                                                                        </div>
                                                                    )}
                                                                    {showGroupTranscriptViet[activeGroupStartIndex] && (
                                                                        <div className="flex flex-col">
                                                                           <div className="text-xs font-black uppercase text-primary-700 mb-2 border-b border-primary-200 pb-2">Tiếng Việt</div>
                                                                           <div className="text-sm text-slate-700 leading-relaxed italic" dangerouslySetInnerHTML={{ __html: groupParts.viet.replace(/\n/g, '<br/>') }} />
                                                                        </div>
                                                                    )}
                                                                 </div>
                                                              </motion.div>
                                                          )}
                                                       </AnimatePresence>
                                                    </div>
                                                 )}


                                         {(() => {
                                             const groupImage = currentQuestionsGroup.find(q => q.imageUrl)?.imageUrl;
                                             return groupImage ? (
                                             <div className="w-full flex justify-center z-10 relative mb-2 border-b border-slate-100 pb-2">
                                               <ZoomableImage 
                                                 src={groupImage} 
                                                 alt="Part" 
                                                 className={`${topic.part === 1 ? 'w-full lg:w-[80%] max-w-[800px]' : 'w-full'} object-contain border border-slate-200 mx-auto`}
                                               />
                                             </div>
                                             ) : null;
                                         })()}

                                         {topic.type === 'READING' && (topic.part === 6 || topic.part === 7) && currentQuestionsGroup.length > 1 && (
                                             <div className="flex flex-wrap justify-center gap-1.5 mb-1 w-full px-2 mt-1">
                                                 {currentQuestionsGroup.map((gq, idx) => {
                                                     const globalIndex = activeGroupStartIndex + idx;
                                                     const isAnswered = !!userAnswers[gq.id];
                                                     const isActive = activeQuestionIndex === globalIndex;
                                                     return (
                                                         <button 
                                                           key={idx}
                                                           onClick={() => setActiveQuestionIndex(globalIndex)}
                                                           className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-bold border-2 transition-all shrink-0 ${isActive ? 'bg-slate-200 border-slate-700 text-slate-900' : isAnswered ? 'bg-slate-50 border-slate-300 text-slate-700' : 'bg-transparent border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                                                         >
                                                           Câu {globalIndex + (topic.part === 1 ? 1 : topic.part === 2 ? 7 : topic.part === 3 ? 32 : topic.part === 4 ? 71 : topic.part === 5 ? 101 : topic.part === 6 ? 131 : 147)}
                                                         </button>
                                                     )
                                                 })}
                                             </div>
                                         )}
                                        </div>
                                        )}

                                        {/* Right Column: Questions & Explanations */}
                                        <div className="flex flex-col gap-8 flex-1 min-w-0">

                                         {currentQuestionsGroup.map((q, localIdx) => {
                                            const isVisible = (topic.type !== 'READING' || (topic.part !== 6 && topic.part !== 7)) || localIdx === (activeQuestionIndex - activeGroupStartIndex);
                                            if (!isVisible) return null;
                                            const isShowingResult = showResults[q.id];
                                           const selectedOption = userAnswers[q.id];
                                           const isCorrect = selectedOption === q.correctOption;
                                           const globalIdx = activeGroupStartIndex + localIdx;
                                           
                                           let cleanExplanation = q.explanation || '';
                                           if (cleanExplanation.includes('[Transcript]')) {
                                               const expMatch = cleanExplanation.match(/\[Giải thích\]\n([\s\S]*)$/i);
                                               cleanExplanation = expMatch ? expMatch[1].trim() : '';
                                           }

                                           // Extract specific question explanation if it's grouped like "32: xxx 33: yyy"
                                           if (topic.part === 3 || topic.part === 4) {
                                               const qNumStr = topic.part === 3 ? (activeGroupStartIndex + 32 + localIdx) : (activeGroupStartIndex + 71 + localIdx);
                                               const regex = new RegExp(`(?:^|[^\\d])(?:Câu\\s*)?(?:${qNumStr})[\\:\\.\\)]\\s*([\\s\\S]*?)(?=(?:Câu\\s*)?\\d{2,}[\\:\\.\\)]|$)`, 'i');
                                               const m = cleanExplanation.match(regex);
                                               if (m && m[1]) {
                                                   cleanExplanation = m[1].trim();
                                               }
                                           }

                                           const explanationText = status !== 'authenticated' && globalIdx >= 4 ? 'Đăng nhập để xem phần giải thích.' : cleanExplanation;
                                          
                                          const parsedTranslations = (() => {
                                              if (!q.translation) return { question: '', options: {} as Record<string, string> };
                                              
                                              let result = { question: '', options: {} as Record<string, string> };
                                              let transText = q.translation;

                                              // Try parsing inline (A) ... (B) ... (C) ... (D) ...
                                              const pattern = /([\s\S]*?)\s*\(\s*A\s*\)\s*([\s\S]*?)\s*\(\s*B\s*\)\s*([\s\S]*?)(?:\s*\(\s*C\s*\)\s*([\s\S]*?))?(?:\s*\(\s*D\s*\)\s*([\s\S]*?))?$/i;
                                              const matchInline = transText.match(pattern);
                                              
                                              if (matchInline && matchInline[2] && matchInline[3]) {
                                                  result.question = matchInline[1].trim();
                                                  result.options['A'] = matchInline[2].trim().replace(/^[.\:\-\s]+/, '');
                                                  result.options['B'] = matchInline[3].trim().replace(/^[.\:\-\s]+/, '');
                                                  if (matchInline[4]) result.options['C'] = matchInline[4].trim().replace(/^[.\:\-\s]+/, '');
                                                  if (matchInline[5]) result.options['D'] = matchInline[5].trim().replace(/^[.\:\-\s]+/, '');
                                                  return result;
                                              }

                                              // Fallback to line by line parsing
                                              const parts = transText.split(/[\/\n]+/);
                                              parts.forEach((part: string) => {
                                                  const text = part.trim();
                                                  if (!text) return;
                                                  const match = text.match(/^\s*\(?([A-D])\)?[.\:\-\s]+(.*)/i);
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
                                            <div key={q.id} className={`flex flex-col ${isGrammarLayout ? 'md:flex-row gap-8' : ''} ${localIdx > 0 && (!topic.part || (topic.part !== 6 && topic.part !== 7)) ? 'pt-6 border-t border-dashed border-slate-200 mt-2' : ''}`}>
                                              <div className={`flex flex-col ${isGrammarLayout ? 'flex-1 min-w-0' : 'w-full'}`}>
                                              <div className="mb-4 flex flex-col items-start relative">


                                                <div className="text-left mb-4 relative z-10 font-medium w-full mt-2">
                                                  <p className={`text-base md:text-[17px] font-semibold text-slate-800 leading-snug text-left pl-1`}>
                                                    {topic.part === 2 && !isShowingResult ? (
                                                        <span className="italic text-slate-400 font-normal text-lg">Nội dung câu hỏi không được in sẵn. Mời bạn nghe câu hỏi từ Audio.</span>
                                                    ) : (
                                                        <>
                                                           {topic.part && topic.part >= 1 && topic.part <= 7 && (
                                                              <span className="mr-2 whitespace-nowrap">
                                                                  Câu {topic.part === 1 ? globalIdx + 1 :
                                                                       topic.part === 2 ? globalIdx + 7 :
                                                                       topic.part === 3 ? globalIdx + 32 :
                                                                       topic.part === 4 ? globalIdx + 71 :
                                                                       topic.part === 5 ? globalIdx + 101 :
                                                                       topic.part === 6 ? globalIdx + 131 :
                                                                       globalIdx + 147}.
                                                              </span>
                                                           )}
                                                           <span>{q.question}</span>
                                                        </>
                                                    )}
                                                  </p>
                                                  {showTranslation[q.id] && parsedTranslations.question && (
                                                    <p className={`mt-2 text-[14px] md:text-base font-medium text-slate-500 animate-in fade-in slide-in-from-top-1 ${(topic.part === 3 || topic.part === 4 || topic.type !== 'LISTENING') ? 'text-left pl-2' : ''}`}>
                                                      {parsedTranslations.question.replace(/^(?:Câu\s*hỏi|Question)[\s]*[:\-]?\s*/i, '').trim()}
                                                    </p>
                                                  )}
                                                </div>
                                                
                                              </div>

                                              <div className={`flex flex-col gap-2 md:gap-3`}>
                                                {[
                                                  { label: 'A', value: q.optionA },
                                                  { label: 'B', value: q.optionB },
                                                  { label: 'C', value: q.optionC },
                                                  { label: 'D', value: q.optionD },
                                                ].map((opt) => {
                                                  if (opt.label === 'D' && !opt.value) return null
                                                  
                                                  const shouldHideValue = topic.type === 'LISTENING' && topic.part && topic.part <= 2 && !isShowingResult;
                                                  
                                                  let buttonClass = "flex items-center gap-2 px-3 py-1.5 md:py-2 rounded-lg border transition-all duration-200 text-left "
                                                  
                                                  if (isShowingResult) {
                                                    if (opt.label === q.correctOption) {
                                                      buttonClass += "border-slate-100 bg-white text-primary-600"
                                                    } else if (opt.label === selectedOption) {
                                                      buttonClass += "border-slate-100 bg-white text-rose-600"
                                                    } else {
                                                      buttonClass += "border-slate-100 bg-white text-slate-400 opacity-60"
                                                    }
                                                  } else {
                                                    if (selectedOption === opt.label) {
                                                      buttonClass += "border-slate-400 bg-slate-50 text-primary-900"
                                                    } else {
                                                      buttonClass += "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                                                    }
                                                  }

                                                  return (
                                                    <button
                                                      key={opt.label}
                                                      onClick={() => handleSelectOption(q.id, opt.label)}
                                                      disabled={isShowingResult}
                                                      className={buttonClass + " flex-col items-start cursor-pointer"}
                                                    >
                                                      <div className="flex items-start w-full gap-2 relative">
                                                        <div className="flex items-center gap-2 mt-0.5 relative shrink-0">
                                                            <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                                               isShowingResult 
                                                                ? (opt.label === q.correctOption ? 'border-primary-600' : opt.label === selectedOption ? 'border-rose-600' : 'border-slate-300')
                                                                : (selectedOption === opt.label ? 'border-primary-900' : 'border-slate-300')
                                                             }`}>
                                                                {(selectedOption === opt.label || (isShowingResult && opt.label === q.correctOption)) && (
                                                                    <div className={`w-1.5 h-1.5 rounded-full ${isShowingResult ? (opt.label === q.correctOption ? 'bg-primary-600' : 'bg-rose-600') : 'bg-primary-900'}`} />
                                                                )}
                                                            </div>
                                                            <span className={`shrink-0 font-medium text-[15px] md:text-base ${isShowingResult ? (opt.label === q.correctOption ? 'text-primary-700' : opt.label === selectedOption ? 'text-rose-700' : 'text-slate-400') : (selectedOption === opt.label ? 'text-primary-900 font-bold' : 'text-slate-500')}`}>
                                                              {opt.label}.
                                                            </span>
                                                        </div>
                                                          <div className="flex flex-col flex-1 pt-[2px]">
                                                            <div className={`text-[15px] md:text-base leading-snug transition-opacity duration-300 ${shouldHideValue ? 'opacity-0 select-none' : 'opacity-100'}`}>
                                                              {opt.value || 'Option'}
                                                            </div>
                                                            {showTranslation[q.id] && parsedTranslations.options[opt.label] && (
                                                                <div className="text-[13px] md:text-[14px] font-medium text-slate-500 mt-1 animate-in fade-in leading-snug">
                                                                    {parsedTranslations.options[opt.label]}
                                                                </div>
                                                            )}
                                                        </div>
                                                      </div>
                                                    </button>
                                                  )
                                                })}
                                              </div>
                                              
                                              {/* Action Tags directly under ABCD */}
                                              {isShowingResult && (
                                                <div className="flex flex-wrap items-center gap-2 mt-5 mb-2">
                                                    {explanationText && (
                                                        <button 
                                                            onClick={() => setShowExplanation(prev => ({ ...prev, [q.id]: !prev[q.id] }))}
                                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[13px] font-bold transition-all ${showExplanation[q.id] ? 'bg-slate-100 text-primary-900' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-primary-900'}`}
                                                        >
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                            Giải thích
                                                        </button>
                                                    )}

                                                    {q.translation && (() => {
                                                        const translationTierLevel = currentLesson.translationAccessTier === 'ULTRA' ? 3 : currentLesson.translationAccessTier === 'PRO' ? 2 : 1;
                                                        const userTierLevel = session?.user?.role === 'admin' ? 10 : session?.user?.tier === 'ULTRA' ? 3 : (session?.user?.tier === 'PRO' || session?.user?.role === 'member') ? 2 : 1;
                                                        const isLocked = translationTierLevel > userTierLevel;
                                                        return (
                                                            <button 
                                                                onClick={() => isLocked ? setShowPricing(true) : setShowTranslation(prev => ({ ...prev, [q.id]: !prev[q.id] }))}
                                                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[13px] font-bold transition-all relative ${showTranslation[q.id] ? 'bg-slate-100 text-primary-900' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-primary-900'}`}
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 17.438l4.498 0" /></svg>
                                                                Dịch nghĩa
                                                                {isLocked && (
                                                                    <div className={`absolute -top-1 -right-1 filter drop-shadow-md ${currentLesson.translationAccessTier === 'ULTRA' ? 'text-primary-600' : 'text-secondary-500'}`}>
                                                                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d={currentLesson.translationAccessTier === 'ULTRA' ? "M13 2L3 14h9l-1 8 10-12h-9l1-8z" : "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"} /></svg>
                                                                    </div>
                                                                )}
                                                            </button>
                                                        );
                                                    })()}
                                                    
                                                    {(() => {
                                                        const bookmarkTierLevel = currentLesson.bookmarkAccessTier === 'ULTRA' ? 3 : currentLesson.bookmarkAccessTier === 'PRO' ? 2 : 1;
                                                        const userTierLevel = session?.user?.role === 'admin' ? 10 : session?.user?.tier === 'ULTRA' ? 3 : (session?.user?.tier === 'PRO' || session?.user?.role === 'member') ? 2 : 1;
                                                        const isLocked = bookmarkTierLevel > userTierLevel;
                                                        return (
                                                            <button 
                                                                onClick={(e) => isLocked ? setShowPricing(true) : toggleBookmark(q.id, e)}
                                                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[13px] font-bold transition-all relative ${bookmarkedQuestions[q.id] ? 'bg-slate-100 text-primary-900' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-primary-900'}`}
                                                            >
                                                                <svg className="w-4 h-4" fill={bookmarkedQuestions[q.id] ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                                                                Lưu
                                                                {isLocked && (
                                                                    <div className={`absolute -top-1 -right-1 filter drop-shadow-md ${currentLesson.bookmarkAccessTier === 'ULTRA' ? 'text-primary-600' : 'text-secondary-500'}`}>
                                                                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d={currentLesson.bookmarkAccessTier === 'ULTRA' ? "M13 2L3 14h9l-1 8 10-12h-9l1-8z" : "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"} /></svg>
                                                                    </div>
                                                                )}
                                                            </button>
                                                        );
                                                    })()}
                                                    
                                                    {activeGroupStartIndex + questionsPerView < currentLesson.questions.length && (
                                                        <button 
                                                            onClick={() => {
                                                                if (topic.type === 'LISTENING' && topic.part && topic.part <= 4 && listeningMode === 'actual' && !isTestCompleted) {
                                                                    toast('Đang ở chế độ thi thử. Câu hỏi sẽ tự chuyển khi hết đoạn Audio. Nếu muốn chủ động, hãy chọn chế độ Luyện tập', { icon: '⚠️', duration: 4000, style: { border: '1px solid #ef4444', color: '#7f1d1d', background: '#fef2f2', fontWeight: 600 } });
                                                                    return;
                                                                }
                                                                setActiveQuestionIndex(prev => Math.min(currentLesson.questions.length - 1, prev + questionsPerView));
                                                                const container = document.getElementById('quiz-container');
                                                                if (container) {
                                                                    const y = container.getBoundingClientRect().top + window.scrollY - 100;
                                                                    window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
                                                                } else {
                                                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                                                }
                                                            }}
                                                            className="ml-auto flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-[13px] font-bold transition-all bg-slate-100 text-primary-900 hover:bg-slate-200 hover:-translate-y-0.5 active:translate-y-0"
                                                        >
                                                            Next
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                                                        </button>
                                                    )}
                                                </div>
                                              )}
                                              </div>
                                              

                                              
                                              <div className={`flex flex-col ${isGrammarLayout ? 'flex-1 min-w-0' : 'w-full'}`}>
                                              {/* Post-Question Explanation & Tools */}
                                              <div className={`${isGrammarLayout ? '' : 'mt-4'} flex flex-col gap-3 w-full`}>
                                                {isShowingResult && (
                                                    <div className={`flex flex-col gap-3 w-full p-2.5 px-3 md:px-4 rounded-2xl shadow-sm transition-all border ${isCorrect ? 'bg-primary-50/70 border-primary-200' : 'bg-rose-50/70 border-rose-200'}`}>
                                                      <div className="flex flex-row items-center justify-between gap-3 w-full">
                                                          <div className={`flex items-center gap-1.5 md:gap-2 transition-all ${isCorrect ? 'text-primary-700' : 'text-rose-700'}`}>
                                                            <div className={`w-5 h-5 rounded-full flex items-center justify-center bg-white shadow-sm shrink-0 border border-current opacity-90`}>
                                                                {isCorrect ? (
                                                                  <svg className="w-3.5 h-3.5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M5 13l4 4L19 7" /></svg>
                                                                ) : (
                                                                  <div className="w-[7px] h-[7px] rounded-full bg-rose-500" />
                                                                )}
                                                            </div>
                                                            <span className="font-bold text-sm">{isCorrect ? 'Chính xác' : 'Chưa chính xác'}</span>
                                                          </div>
                                                      </div>
                                                      
                                                      <AnimatePresence>
                                                          {showExplanation[q.id] && explanationText && (
                                                              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                                                  <div className="pt-3 pb-1 border-t border-slate-200/50 mt-1">
                                                                    {explanationText === 'Đăng nhập để xem phần giải thích.' ? (
                                                                        <button onClick={(e) => { e.preventDefault(); const currentPath = window.location.pathname; router.push(`${currentPath}?login=true&allowGuest=true&subtitle=${encodeURIComponent('Đăng nhập để lưu giữ tiến độ và nhận điểm thưởng học tập nhé.')}&callbackUrl=${encodeURIComponent(currentPath)}`, { scroll: false }); }} className="text-sm font-bold italic text-primary-600 hover:text-primary-800 hover:underline cursor-pointer text-left leading-relaxed outline-none w-full">
                                                                          {explanationText}
                                                                        </button>
                                                                    ) : (() => {
                                                                          const explanationTierLevel = currentLesson.explanationAccessTier === 'ULTRA' ? 3 : currentLesson.explanationAccessTier === 'PRO' ? 2 : 1;
                                                                          const userTierLevel = session?.user?.role === 'admin' ? 10 : session?.user?.tier === 'ULTRA' ? 3 : (session?.user?.tier === 'PRO' || session?.user?.role === 'member') ? 2 : 1;
                                                                          const isLocked = explanationTierLevel > userTierLevel;
                                                                          if (isLocked) {
                                                                             return (
                                                                                <div className="relative w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                                                                                  <div className="absolute inset-0 blur-md pointer-events-none opacity-40 p-4 select-none text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">{explanationText}</div>
                                                                                  <div className="relative z-10 flex py-5 flex-col items-center justify-center min-h-[100px]">
                                                                                    <button onClick={() => setShowPricing(true)} className="group max-w-[85%] mx-auto bg-white/95 backdrop-blur-sm border border-slate-200/80 shadow-sm hover:shadow-md rounded-2xl md:rounded-full px-4 py-2.5 flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1 cursor-pointer transition-all hover:scale-105 active:scale-95 text-[13px] font-medium text-slate-700">
                                                                                       <div className="flex items-center gap-1.5 whitespace-nowrap">
                                                                                         {currentLesson.explanationAccessTier === 'ULTRA' ? <svg className="w-4 h-4 text-primary-700 shrink-0 drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg> : <svg className="w-4 h-4 text-secondary-500 shrink-0 drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>}
                                                                                         <span>Nâng cấp</span>
                                                                                       </div>
                                                                                       <div className="flex items-center gap-1 whitespace-nowrap"><span className={`${currentLesson.explanationAccessTier === 'ULTRA' ? 'bg-primary-100 text-primary-900 border border-primary-200' : 'bg-secondary-100 text-secondary-700 border border-secondary-200'} font-bold text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded`}>{currentLesson.explanationAccessTier}</span><span>để xem giải thích chi tiết.</span></div>
                                                                                    </button>
                                                                                  </div>
                                                                                </div>
                                                                             )
                                                                          }
                                                                          return <div className="text-[13px] md:text-sm font-medium italic text-slate-700 opacity-90 leading-relaxed max-h-[300px] overflow-y-auto custom-scrollbar whitespace-pre-wrap">{explanationText}</div>
                                                                    })()}
                                                                  </div>
                                                              </motion.div>
                                                          )}
                                                      </AnimatePresence>
                                                    </div>
                                                )}
                                              </div>

                                                {/* Ungrouped Question Footer Buttons */}
                                                {isShowingResult && questionsPerView === 1 && ((q.vocabulary && q.vocabulary.length > 0) || q.tips) && (
                                                  <div className="w-full pt-4 md:pt-6 mt-4 md:mt-6 border-t border-slate-200 flex flex-wrap items-center gap-4">
                                                    {q.vocabulary && Array.isArray(q.vocabulary) && q.vocabulary.length > 0 && (() => {
                                                        const vocabTierLevel = currentLesson.vocabularyAccessTier === 'ULTRA' ? 3 : currentLesson.vocabularyAccessTier === 'PRO' ? 2 : 1;
                                                        const userTierLevel = session?.user?.role === 'admin' ? 10 : session?.user?.tier === 'ULTRA' ? 3 : (session?.user?.tier === 'PRO' || session?.user?.role === 'member') ? 2 : 1;
                                                        const isLocked = vocabTierLevel > userTierLevel;

                                                        if (isLocked) {
                                                          return (
                                                            <button
                                                              onClick={() => setShowPricing(true)}
                                                              className="flex-1 min-w-[140px] max-w-[200px] h-11 px-4 rounded-xl border bg-white border-slate-200 text-slate-500 hover:border-slate-400 hover:text-slate-700 transition-all flex items-center gap-2 justify-center cursor-pointer shadow-sm relative group"
                                                            >
                                                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                                                              <span className="font-semibold text-sm">Từ vựng quan trọng</span>
                                                              <div className={`absolute -top-1.5 -right-1.5 filter drop-shadow-md ${currentLesson.vocabularyAccessTier === 'ULTRA' ? 'text-primary-600' : 'text-secondary-500'}`}>
                                                                 <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d={currentLesson.vocabularyAccessTier === 'ULTRA' ? "M13 2L3 14h9l-1 8 10-12h-9l1-8z" : "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"} /></svg>
                                                              </div>
                                                            </button>
                                                          )
                                                        }

                                                        return (
                                                          <button
                                                            onClick={() => setShowVocab(prev => ({ ...prev, [q.id]: !prev[q.id] }))}
                                                            className={`flex-1 min-w-[140px] max-w-[200px] h-11 px-4 text-sm font-semibold rounded-xl border transition-all flex items-center justify-center cursor-pointer shadow-sm shrink-0 gap-2 ${showVocab[q.id] ? 'bg-slate-100 border-slate-300 text-slate-800' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400 hover:text-slate-800'}`}
                                                          >
                                                            <svg className="w-5 h-5" fill={showVocab[q.id] ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                                                            {q.vocabulary.length} Từ vựng
                                                          </button>
                                                        )
                                                    })()}

                                                  </div>
                                                )}

                                                {/* Combined Tip Section */}
                                                {isShowingResult && questionsPerView === 1 && q.tips && (() => {
                                                    const tipsTierLevel = currentLesson.tipsAccessTier === 'ULTRA' ? 3 : currentLesson.tipsAccessTier === 'PRO' ? 2 : 1;
                                                    const tipsLocked = tipsTierLevel > (session?.user?.role === 'admin' ? 10 : session?.user?.tier === 'ULTRA' ? 3 : (session?.user?.tier === 'PRO' || session?.user?.role === 'member') ? 2 : 1);
                                                    
                                                    return (
                                                      <div className={`w-full mt-3 flex flex-col items-start ${showTips[q.id] && !tipsLocked ? 'bg-primary-50/60 border border-primary-200 rounded-2xl shadow-sm overflow-hidden' : ''}`}>
                                                         {tipsLocked ? (
                                                            <button onClick={() => setShowPricing(true)} className="h-9 px-3 rounded-xl border bg-white border-slate-200 text-slate-500 hover:border-slate-400 hover:text-slate-700 transition-all flex items-center gap-1.5 justify-center cursor-pointer shadow-sm relative group">
                                                               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
                                                               <span className="font-bold text-[13px]">Tip</span>
                                                               <div className={`absolute -top-1.5 -right-1.5 filter drop-shadow-md ${currentLesson.tipsAccessTier === 'ULTRA' ? 'text-primary-600' : 'text-secondary-500'}`}>
                                                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d={currentLesson.tipsAccessTier === 'ULTRA' ? "M13 2L3 14h9l-1 8 10-12h-9l1-8z" : "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"} /></svg>
                                                               </div>
                                                            </button>
                                                         ) : showTips[q.id] ? (
                                                            <div 
                                                              onClick={() => setShowTips(prev => ({ ...prev, [q.id]: false }))}
                                                              className="w-full p-3.5 md:p-4 text-[14px] md:text-[15px] leading-relaxed break-words whitespace-pre-wrap cursor-pointer"
                                                            >
                                                              <span className="font-bold text-primary-700 mr-1.5">
                                                                <svg className="w-4 h-4 md:w-4 md:h-4 text-primary-600 inline-block align-text-bottom mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
                                                                Tip:
                                                              </span>
                                                              <span className="text-slate-700">
                                                                {q.tips.replace(/^(Tip|Mẹo|Mẹo TOEIC|Tip TOEIC)\s*:\s*/i, '')}
                                                              </span>
                                                            </div>
                                                         ) : (
                                                            <button onClick={() => setShowTips(prev => ({ ...prev, [q.id]: true }))} className="h-9 px-3 text-[13px] font-bold rounded-xl border border-slate-200 bg-white text-slate-600 hover:border-primary-400 hover:text-primary-700 transition-all flex items-center justify-center cursor-pointer shadow-sm gap-1.5">
                                                               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
                                                               Tip
                                                            </button>
                                                         )}
                                                      </div>
                                                    )
                                                })()}

                                                {/* Vocabulary Section (Only for non-grouped) */}
                                                {isShowingResult && showVocab[q.id] && q.vocabulary && Array.isArray(q.vocabulary) && q.vocabulary.length > 0 && questionsPerView === 1 && (
                                                  <div className="w-full mt-2">
                                                    <ul className="space-y-1 md:space-y-1.5 pl-1 md:pl-2">
                                                      {q.vocabulary.map((vocabItem: any, vIdx: number) => (
                                                        <li key={vIdx} className="flex flex-col md:flex-row md:items-center gap-0.5 md:gap-2">
                                                          <span className="font-bold text-slate-800 text-[15px]">{vocabItem.word}</span>
                                                          <span className="hidden md:inline text-slate-300 font-bold px-1">&bull;</span>
                                                          <span className="text-slate-600 text-sm md:text-[15px] leading-snug">{vocabItem.meaning}</span>
                                                        </li>
                                                      ))}
                                                    </ul>
                                                  </div>
                                                )}
                                              </div>
                                             </div>
                                            );
                                        })}
                                        </div>
                                      </div>
                                    );
                                  })()}
                                      
                                      {/* Group Level Vocabulary Section */}
                                      {currentQuestionsGroup.length > 0 && showResults[currentQuestionsGroup[0].id] && questionsPerView > 1 && currentQuestionsGroup[0].vocabulary && Array.isArray(currentQuestionsGroup[0].vocabulary) && currentQuestionsGroup[0].vocabulary.length > 0 && (
                                        <div className="w-full border-t border-slate-200 pt-6 mt-6 flex flex-col gap-4">
                                          {(() => {
                                            const groupQ = currentQuestionsGroup[0];
                                            const vocabTierLevel = currentLesson.vocabularyAccessTier === 'ULTRA' ? 3 : currentLesson.vocabularyAccessTier === 'PRO' ? 2 : 1;
                                            const userTierLevel = session?.user?.role === 'admin' ? 10 : session?.user?.tier === 'ULTRA' ? 3 : (session?.user?.tier === 'PRO' || session?.user?.role === 'member') ? 2 : 1;
                                            const isLocked = vocabTierLevel > userTierLevel;

                                            return (
                                              <>
                                                <div className="flex flex-wrap items-center gap-4">
                                                  {isLocked ? (
                                                    <button
                                                      onClick={() => setShowPricing(true)}
                                                      className="flex-1 min-w-[140px] max-w-[200px] h-11 px-4 rounded-xl border bg-white border-slate-200 text-slate-500 hover:border-slate-400 hover:text-slate-700 transition-all flex items-center gap-2 justify-center cursor-pointer shadow-sm relative group"
                                                    >
                                                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                                                      <span className="font-semibold text-sm">Từ vựng quan trọng</span>
                                                      <div className={`absolute -top-1.5 -right-1.5 filter drop-shadow-md ${currentLesson.vocabularyAccessTier === 'ULTRA' ? 'text-primary-600' : 'text-secondary-500'}`}>
                                                         <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d={currentLesson.vocabularyAccessTier === 'ULTRA' ? "M13 2L3 14h9l-1 8 10-12h-9l1-8z" : "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"} /></svg>
                                                      </div>
                                                    </button>
                                                  ) : (
                                                    <button
                                                      onClick={() => setShowVocab(prev => ({ ...prev, [groupQ.id]: !prev[groupQ.id] }))}
                                                      className={`flex-1 min-w-[140px] max-w-[200px] h-11 px-4 text-sm font-semibold rounded-xl border transition-all flex items-center justify-center cursor-pointer shadow-sm shrink-0 gap-2 ${showVocab[groupQ.id] ? 'bg-slate-100 border-slate-300 text-slate-800' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400 hover:text-slate-800'}`}
                                                    >
                                                      <svg className="w-5 h-5" fill={showVocab[groupQ.id] ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                                                      {groupQ.vocabulary.length} Từ vựng
                                                    </button>
                                                  )}

                                                </div>
                                                
                                                {showVocab[groupQ.id] && !isLocked && (
                                                  <div className="w-full mt-0">
                                                    <ul className="space-y-1 md:space-y-1.5 pl-1 md:pl-2">
                                                      {groupQ.vocabulary.map((vocabItem: any, vIdx: number) => (
                                                        <li key={vIdx} className="flex flex-col md:flex-row md:items-center gap-0.5 md:gap-2">
                                                          <span className="font-bold text-slate-800 text-[15px]">{vocabItem.word}</span>
                                                          <span className="hidden md:inline text-slate-300 font-bold px-1">&bull;</span>
                                                          <span className="text-slate-600 text-sm md:text-[15px] leading-snug">{vocabItem.meaning}</span>
                                                        </li>
                                                      ))}
                                                    </ul>
                                                  </div>
                                                )}

                                                {/* Combined Tip Section */}
                                                {groupQ.tips && (() => {
                                                    const tipsTierLevel = currentLesson.tipsAccessTier === 'ULTRA' ? 3 : currentLesson.tipsAccessTier === 'PRO' ? 2 : 1;
                                                    const tipsLocked = tipsTierLevel > userTierLevel;
                                                    
                                                    return (
                                                      <div className={`w-full mt-3 flex flex-col items-start ${showTips[groupQ.id] && !tipsLocked ? 'bg-primary-50/60 border border-primary-200 rounded-2xl shadow-sm overflow-hidden' : ''}`}>
                                                         {tipsLocked ? (
                                                            <button onClick={() => setShowPricing(true)} className="h-9 px-3 rounded-xl border bg-white border-slate-200 text-slate-500 hover:border-slate-400 hover:text-slate-700 transition-all flex items-center gap-1.5 justify-center cursor-pointer shadow-sm relative group">
                                                               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
                                                               <span className="font-bold text-[13px]">Tip</span>
                                                               <div className={`absolute -top-1.5 -right-1.5 filter drop-shadow-md ${currentLesson.tipsAccessTier === 'ULTRA' ? 'text-primary-600' : 'text-secondary-500'}`}>
                                                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d={currentLesson.tipsAccessTier === 'ULTRA' ? "M13 2L3 14h9l-1 8 10-12h-9l1-8z" : "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"} /></svg>
                                                               </div>
                                                            </button>
                                                         ) : showTips[groupQ.id] ? (
                                                            <div 
                                                              onClick={() => setShowTips(prev => ({ ...prev, [groupQ.id]: false }))}
                                                              className="w-full p-3.5 md:p-4 text-[14px] md:text-[15px] leading-relaxed break-words whitespace-pre-wrap cursor-pointer"
                                                            >
                                                              <span className="font-bold text-primary-700 mr-1.5">
                                                                <svg className="w-4 h-4 md:w-4 md:h-4 text-primary-600 inline-block align-text-bottom mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
                                                                Tip:
                                                              </span>
                                                              <span className="text-slate-700">
                                                                {groupQ.tips.replace(/^(Tip|Mẹo|Mẹo TOEIC|Tip TOEIC)\s*:\s*/i, '')}
                                                              </span>
                                                            </div>
                                                         ) : (
                                                            <button onClick={() => setShowTips(prev => ({ ...prev, [groupQ.id]: true }))} className="h-9 px-3 text-[13px] font-bold rounded-xl border border-slate-200 bg-white text-slate-600 hover:border-primary-400 hover:text-primary-700 transition-all flex items-center justify-center cursor-pointer shadow-sm gap-1.5">
                                                               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
                                                               Tip
                                                            </button>
                                                         )}
                                                      </div>
                                                    )
                                                })()}
                                              </>
                                            );
                                          })()}
                                        </div>
                                      )}

                                      {/* Unified Navigation at Bottom of Group */}
                                      <div className="mt-10 flex flex-row items-center justify-between gap-3 w-full border-t border-slate-200 pt-6">
                                        <button
                                          onClick={() => {
                                              setActiveQuestionIndex(prev => Math.max(0, prev - questionsPerView));
                                              const container = document.getElementById('quiz-container');
                                              if (container) {
                                                  const y = container.getBoundingClientRect().top + window.scrollY - 100;
                                                  window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
                                              } else {
                                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                              }
                                          }}
                                          disabled={activeGroupStartIndex === 0}
                                          className="h-10 w-10 md:w-12 md:h-12 rounded-xl bg-white border border-slate-200 text-slate-500 hover:border-primary-900 hover:text-primary-900 hover:bg-primary-50 disabled:opacity-30 disabled:hover:border-slate-200 disabled:hover:bg-white disabled:hover:text-slate-500 transition-all flex items-center justify-center cursor-pointer shadow-sm shrink-0 flex-none"
                                          aria-label="Trước đó"
                                        >
                                          <svg className="w-5 h-5 md:w-6 md:h-6 stroke-[2px]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                                        </button>
                                        
                                        <div className="flex-1 text-center font-bold text-slate-300 text-sm md:text-base uppercase tracking-widest">
                                           {topic.part === 3 ? `Câu ${activeGroupStartIndex + 32} - ${activeGroupStartIndex + 32 + currentQuestionsGroup.length - 1}` : 
                                            topic.part === 4 ? `Câu ${activeGroupStartIndex + 71} - ${activeGroupStartIndex + 71 + currentQuestionsGroup.length - 1}` : 
                                            `Câu ${topic.part === 1 ? activeGroupStartIndex + 1 :
                                                   topic.part === 2 ? activeGroupStartIndex + 7 :
                                                   topic.part === 5 ? activeGroupStartIndex + 101 :
                                                   topic.part === 6 ? activeGroupStartIndex + 131 :
                                                   topic.part === 7 ? activeGroupStartIndex + 147 :
                                                   activeGroupStartIndex + 1}`}
                                        </div>

                                        <button
                                          onClick={() => {
                                              if (topic.type === 'LISTENING' && topic.part && topic.part <= 4 && listeningMode === 'actual' && !isTestCompleted) {
                                                  toast('Đang ở chế độ thi thử. Câu hỏi sẽ tự chuyển khi hết đoạn Audio. Nếu muốn chủ động, hãy chọn chế độ Luyện tập', { icon: '⚠️', duration: 4000, style: { border: '1px solid #ef4444', color: '#7f1d1d', background: '#fef2f2', fontWeight: 600 } });
                                                  return;
                                              }
                                              setActiveQuestionIndex(prev => Math.min(currentLesson.questions.length - 1, prev + questionsPerView));
                                              const container = document.getElementById('quiz-container');
                                              if (container) {
                                                  const y = container.getBoundingClientRect().top + window.scrollY - 100;
                                                  window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
                                              } else {
                                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                              }
                                          }}
                                          disabled={activeGroupStartIndex + questionsPerView >= currentLesson.questions.length}
                                          className="h-10 w-10 md:w-12 md:h-12 rounded-xl bg-white border border-slate-200 text-slate-500 hover:border-primary-900 hover:text-primary-900 hover:bg-primary-50 disabled:opacity-30 disabled:hover:border-slate-200 disabled:hover:bg-white disabled:hover:text-slate-500 transition-all flex items-center justify-center cursor-pointer shadow-sm shrink-0 flex-none"
                                          aria-label="Tiếp theo"
                                        >
                                          <svg className="w-5 h-5 md:w-6 md:h-6 stroke-[2px]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                                        </button>
                                      </div>
                                    </motion.div>
                                  )
                                })()}
                              </AnimatePresence>

                              {/* Small Numbers Row at the bottom of the quiz section */}
                              {currentLesson.questions.length > 0 && lessonStarted && !isPlayingDirections && (
                                <div className="w-full mt-6 mb-8 flex flex-wrap justify-center items-center gap-1 sm:gap-1.5 min-w-0">
                                  {currentLesson.questions.map((_, idx) => {
                                    const questionsPerView = (topic.type === 'LISTENING' && (topic.part === 3 || topic.part === 4)) ? 3 : 1;
                                    const activeGroupStartIndex = Math.floor(activeQuestionIndex / questionsPerView) * questionsPerView;
                                    
                                    const isActive = idx >= activeGroupStartIndex && idx < activeGroupStartIndex + questionsPerView;
                                    const qt = currentLesson.questions[idx]
                                    const isShowingResultQt = !!showResults[qt.id]
                                    const isCorrectQt = userAnswers[qt.id] === qt.correctOption

                                    let btnStyle = ''
                                    if (isActive) {
                                       btnStyle = 'bg-primary-900 border-primary-900 text-white shadow-md scale-110 z-10'
                                    } else if (isShowingResultQt) {
                                       btnStyle = isCorrectQt ? 'bg-primary-50 border-primary-500 text-primary-700' : 'bg-red-50 border-red-500 text-red-700'
                                    } else if (userAnswers[qt.id]) {
                                       btnStyle = 'bg-primary-50 border-primary-200 text-primary-900'
                                    } else {
                                       btnStyle = 'bg-white border-slate-200 text-slate-400 hover:border-primary-900/30 hover:text-primary-900'
                                    }
                                    
                                    return (
                                      <button 
                                        key={idx}
                                        onClick={() => {
                                            if (topic.type === 'LISTENING' && topic.part && topic.part <= 4 && listeningMode === 'actual' && !isTestCompleted) {
                                                toast('Đang ở chế độ thi thử. Nếu muốn thực hành, bạn hãy làm lại bài và chọn chế độ luyện tập', { icon: '⚠️', duration: 4000, style: { border: '1px solid #ef4444', color: '#7f1d1d', background: '#fef2f2', fontWeight: 600 } });
                                                return;
                                            }
                                            if (isActive) return;
                                            const isAudioPlaying = audioRef.current && !audioRef.current.paused && audioRef.current.currentTime > 0;
                                            if (isAudioPlaying) {
                                                if (!confirm("Audio vẫn đang phát. Bạn chắc chắn muốn chuyển sang câu khác?")) return;
                                            }
                                            setActiveQuestionIndex(idx);
                                        }}
                                        className={`h-6 sm:h-7 min-w-[24px] sm:min-w-[28px] px-1 shrink-0 rounded-md flex items-center justify-center font-bold text-[10px] sm:text-[11px] transition-all duration-200 cursor-pointer border-[1.5px] ${btnStyle}`}
                                      >
                                        {topic.part === 1 ? idx + 1 :
                                         topic.part === 2 ? idx + 7 :
                                         topic.part === 3 ? idx + 32 :
                                         topic.part === 4 ? idx + 71 :
                                         topic.part === 5 ? idx + 101 :
                                         topic.part === 6 ? idx + 131 :
                                         topic.part === 7 ? idx + 147 : idx + 1}
                                      </button>
                                    )
                                  })}
                                </div>
                              )}
                            </>
                       )}
                     </section>
                  )}
                  </div> {/* End of Main Area */}
                  </div> {/* End of Flex Row */}


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

      {isTestCompleted && !isReviewing && lessonStarted && currentLesson && (
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
            <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-primary-50">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2">Hoàn thành bài thi!</h3>
            <p className="text-slate-600 mb-6 leading-relaxed">
              {elapsedTime > 0 ? (
                <>Chúc mừng bạn đã hoàn thành bài thi trong <strong className="text-primary-700">{Math.floor(elapsedTime / 60)} phút {elapsedTime % 60} giây</strong>.<br/></>
              ) : (
                <>Bạn đã gửi toàn bộ bài thi.<br/></>
              )}
              Bạn đã đúng <strong className="text-primary-700 text-xl">{currentLesson.questions.filter(q => userAnswers[q.id] === q.correctOption).length}</strong> / <strong>{currentLesson.questions.length}</strong> câu.
            </p>
            <div className="flex flex-col gap-3">
              {topic && topic.lessons.findIndex(l => l.id === selectedLessonId) < topic.lessons.length - 1 ? (
                <button
                  onClick={() => {
                    const nextLesson = topic.lessons[topic.lessons.findIndex(l => l.id === selectedLessonId) + 1]
                    setSelectedLessonId(nextLesson.id)
                    setActiveQuestionIndex(0)
                    setShowLessonContent(nextLesson.questions.length === 0)
                    setTimerStartTime(null)
                    setElapsedTime(0)
                    setIsTestCompleted(false)
                    setIsReviewing(false)
                    setLessonStarted(false)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  className="w-full py-3.5 bg-primary-900 hover:bg-primary-800 text-white font-bold rounded-xl transition-all hover:-translate-y-0.5 cursor-pointer shadow-md shadow-primary-900/20"
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
                    <Link href={returnUrl} className="w-full py-3.5 bg-primary-900 hover:bg-primary-800 text-white font-bold rounded-xl transition-all hover:-translate-y-0.5 inline-block cursor-pointer shadow-md shadow-primary-900/20">
                      Về danh sách chủ đề
                    </Link>
                  )
              })()}

              <button
                onClick={() => {
                  handleRestartLesson();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full py-3 text-primary-900 hover:bg-primary-50 font-bold rounded-xl transition-colors cursor-pointer mt-1"
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
            <div className="bg-white/90 backdrop-blur-md border border-secondary-200 shadow-xl shadow-secondary-900/10 rounded-2xl p-4 flex items-center justify-between pointer-events-auto">
               <div className="flex flex-col">
                  <span className="text-secondary-800 font-bold">Thời gian kiểm tra bài</span>
                  <span className="text-xs text-secondary-600 font-medium">Bạn có 30 giây để hoàn thiện các câu chưa chọn</span>
               </div>
               <div className="flex items-center gap-4">
                  <div className="bg-secondary-100 text-secondary-700 font-mono font-bold text-2xl px-4 py-1.5 rounded-lg border border-secondary-200">
                     00:{actualCheckTimeLeft.toString().padStart(2, '0')}
                  </div>
                  <button 
                     onClick={submitActualExam}
                     className="bg-secondary-600 hover:bg-secondary-700 text-white font-bold py-2 px-6 rounded-xl transition-all shadow-md active:scale-95 whitespace-nowrap"
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
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6 shrink-0">
                  <svg className="w-10 h-10 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-2">Hoàn thành bài nghe</h3>
              <p className="text-slate-500 mb-8 font-medium">Bạn đã nghe xong tất cả câu hỏi. Vui lòng chọn hành động tiếp theo.</p>
              
              <div className="flex flex-col gap-3">
                 <button 
                    onClick={submitActualExam}
                    className="w-full py-3.5 bg-primary-900 hover:bg-primary-800 text-white font-bold rounded-xl transition-all shadow-md active:scale-95"
                 >
                    Nộp Bài & Xem Đáp Án
                 </button>
                 <button 
                    onClick={() => {
                        setIsSubmitModalOpen(false);
                        setActualCheckingMode(true);
                        // Do not reset the timer here, let it continue counting down.
                    }}
                    className="w-full py-3.5 bg-secondary-50 hover:bg-secondary-100 text-secondary-700 border border-secondary-200 font-bold rounded-xl transition-all active:scale-95"
                 >
                    Kiểm Tra Lại Lựa Chọn ({actualCheckTimeLeft}s)
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
