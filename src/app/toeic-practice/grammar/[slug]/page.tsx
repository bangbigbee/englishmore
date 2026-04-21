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
  const [zoomedImageUrl, setZoomedImageUrl] = useState<string | null>(null)
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
          setActiveQuestionIndex(0)
          setShowLessonContent(data.lessons[0].questions.length === 0)
          if (data.type === 'LISTENING') setListeningMode('actual');
          setTimerStartTime(Date.now())
          setElapsedTime(0)
          setIsTestCompleted(false)
          setLessonStarted(false)
          setIsPlayingDirections(false)
          setPreviewPage(0)
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
                        <div className={`flex items-center p-1 bg-slate-100 rounded-lg transition-all ${listeningMode === 'actual' ? 'opacity-60' : ''}`}>
                          <button 
                            title="Nghe tốc độ chậm (0.85x)"
                            onClick={() => listeningMode !== 'actual' && setPlaybackSpeed(0.85)}
                            className={`text-xs font-bold px-3 py-1.5 rounded-md transition-all ${playbackSpeed === 0.85 ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'} ${listeningMode === 'actual' ? 'cursor-not-allowed' : ''}`}
                          >
                            Nghe chậm
                          </button>
                          <button 
                            title="Nghe tốc độ bình thường (1.0x)"
                            onClick={() => listeningMode !== 'actual' && setPlaybackSpeed(1)}
                            className={`text-xs font-bold px-3 py-1.5 rounded-md transition-all ${playbackSpeed === 1 ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'} ${listeningMode === 'actual' ? 'cursor-not-allowed' : ''}`}
                          >
                            Thường
                          </button>
                          <button 
                            title="Nghe tốc độ nhanh (1.25x)"
                            onClick={() => listeningMode !== 'actual' && setPlaybackSpeed(1.25)}
                            className={`text-xs font-bold px-3 py-1.5 rounded-md transition-all ${playbackSpeed === 1.25 ? 'bg-white text-red-500 shadow-sm' : 'text-slate-500 hover:text-slate-700'} ${listeningMode === 'actual' ? 'cursor-not-allowed' : ''}`}
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
                                  if (listeningMode === 'actual') return;
                                  if (isPlayingDirections && directionAudioRef.current) {
                                    if (directionAudioRef.current.paused) directionAudioRef.current.play();
                                    else directionAudioRef.current.pause();
                                  } else if (audioRef.current) {
                                    if (audioRef.current.paused) audioRef.current.play();
                                    else audioRef.current.pause();
                                  }
                                }}
                                className={`w-8 h-8 flex items-center justify-center rounded-full transition-all shrink-0 ${listeningMode === 'actual' ? 'bg-slate-100 text-slate-400 border border-slate-200 opacity-60 cursor-not-allowed' : 'bg-slate-100 text-[#14532d] border border-slate-200 hover:bg-emerald-50 hover:border-emerald-200 cursor-pointer'}`}
                                title={listeningMode === 'actual' ? "Không thể điều khiển ở chế độ Thi thật" : "Play/Pause Audio"}
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
                      
                      {!lessonStarted && topic.type === 'LISTENING' ? (
                        <div className="flex flex-col items-center justify-center p-8 md:p-12 bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-center min-h-[320px] max-w-2xl mx-auto">
                            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-5 text-[#14532d]">
                                <svg className="w-6 h-6 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <h3 className="text-xl md:text-2xl font-black text-[#14532d] mb-2 leading-tight">Sẵn sàng cho PART {topic.part}?</h3>
                            <p className="text-sm text-slate-500 mb-8 max-w-sm mx-auto">Audio sẽ tự động phát sau khi bạn bắt đầu. Thời gian làm bài sẽ được tính ngay lập tức.</p>
                            
                            {topic.part && topic.part <= 4 && (
                                  <div className="flex flex-col items-center mb-8 w-full gap-2">
                                    <span className="text-[10px] font-black uppercase tracking-[0.15em] text-[#14532d] opacity-80">Chọn chế độ làm bài</span>
                                    <div className="flex items-center bg-slate-200/50 p-1 rounded-lg w-full max-w-[160px] mx-auto border border-slate-300/30 shadow-inner">
                                      <button 
                                        onClick={() => setListeningMode('practice')}
                                        className={`flex-1 py-1 rounded-md text-[11px] font-black transition-all duration-300 ${listeningMode === 'practice' ? 'bg-orange-400 text-[#14532d] shadow-[0_2px_4px_rgba(251,146,60,0.4)] border border-orange-300' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/5'}`}
                                      >
                                        Luyện tập
                                      </button>
                                      <button 
                                        onClick={() => setListeningMode('actual')}
                                        className={`flex-1 py-1 rounded-md text-[11px] font-black transition-all duration-300 ${listeningMode === 'actual' ? 'bg-[#1e1b4b] text-amber-400 shadow-[0_2px_4px_rgba(30,27,75,0.4)] border border-indigo-900' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/5'}`}
                                      >
                                        Thi thật
                                      </button>
                                    </div>
                                  </div>
                            )}
                            
                            <button 
                              disabled={topic.part && topic.part <= 4 ? !listeningMode : false}
                              onClick={() => {
                                setLessonStarted(true);
                                setTimerStartTime(Date.now());
                                
                                if (topic.type === 'LISTENING' && currentLesson.directionAudioUrl && directionAudioRef.current) {
                                    setIsPlayingDirections(true);
                                    directionAudioRef.current.play().catch(e => console.error("Direction Audio autoplay blocked", e));
                                }
                            }} className={`font-bold px-8 py-3.5 rounded-xl transition-all shadow-sm text-[14px] uppercase tracking-wider active:scale-95 flex items-center justify-center gap-2 ${topic.part && topic.part <= 4 ? (listeningMode ? 'bg-[#14532d] text-white hover:bg-[#166534] hover:-translate-y-0.5' : 'bg-slate-100 text-slate-400 cursor-not-allowed') : 'bg-[#14532d] text-white hover:bg-[#166534] hover:-translate-y-0.5'}`}>
                               <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                               Bắt Đầu Ngay
                            </button>
                        </div>
                      ) : (
                        <>
                          {isPlayingDirections ? (
                              <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 p-6 md:p-10 text-center animate-in fade-in zoom-in duration-300">
                                  <h3 className="text-xl md:text-2xl font-black text-[#14532d] mb-2 mt-2">Bạn đang nghe directions của Phần {topic.part} bài thi</h3>
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
                                                <div className="absolute top-2 left-2 bg-[#14532d] text-white text-[10px] sm:text-xs font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md shadow-sm z-10 flex items-center gap-1 leading-none">
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
                                                           className="absolute inset-0 w-full h-full object-contain p-1 cursor-zoom-in group-hover/img:scale-105 transition-transform duration-300" 
                                                           onClick={(e) => { e.stopPropagation(); setZoomedImageUrl(q.imageUrl); }}
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
                                      className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 p-6 md:p-10 relative overflow-hidden"
                                    >
                                      <div className="absolute top-0 left-0 w-full h-1 bg-slate-100">
                                        <motion.div 
                                          className="h-full bg-[#14532d]"
                                          initial={{ width: 0 }}
                                          animate={{ width: `${((Math.min(activeGroupStartIndex + questionsPerView, currentLesson.questions.length)) / currentLesson.questions.length) * 100}%` }}
                                        />
                                      </div>
                                      
                                      <div className="flex flex-col gap-10">
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
                                           
                                           return (
                                              <>
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
                                                             className={`flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm border ${showGroupTranscriptEng[activeGroupStartIndex] ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600'}`}
                                                          >
                                                             Thoại tiếng Anh
                                                             {currentLesson.theoryAccessTier === 'PRO' && session?.user?.tier !== 'ULTRA' && session?.user?.tier !== 'PRO' && session?.user?.role !== 'admin' && <svg className="w-3 h-3 text-amber-400 drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>}
                                                             {currentLesson.theoryAccessTier === 'ULTRA' && session?.user?.tier !== 'ULTRA' && session?.user?.role !== 'admin' && <svg className="w-3 h-3 text-purple-600 drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>}
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
                                                                className={`flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm border ${showGroupTranscriptViet[activeGroupStartIndex] ? 'bg-orange-600 border-orange-600 text-white' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-orange-600'}`}
                                                             >
                                                                Thoại tiếng Việt
                                                                {currentLesson.translationAccessTier === 'PRO' && session?.user?.tier !== 'ULTRA' && session?.user?.tier !== 'PRO' && session?.user?.role !== 'admin' && <svg className="w-3 h-3 text-amber-400 drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>}
                                                                {currentLesson.translationAccessTier === 'ULTRA' && session?.user?.tier !== 'ULTRA' && session?.user?.role !== 'admin' && <svg className="w-3 h-3 text-purple-600 drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>}
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
                                                                           <div className="text-xs font-black uppercase text-blue-600 mb-2 border-b border-blue-100 pb-2">Tiếng Anh</div>
                                                                           <div className="text-sm text-slate-700 leading-relaxed font-medium" dangerouslySetInnerHTML={{ __html: groupParts.eng.replace(/\n/g, '<br/>') }} />
                                                                        </div>
                                                                    )}
                                                                    {showGroupTranscriptViet[activeGroupStartIndex] && (
                                                                        <div className="flex flex-col">
                                                                           <div className="text-xs font-black uppercase text-orange-600 mb-2 border-b border-orange-100 pb-2">Tiếng Việt</div>
                                                                           <div className="text-sm text-slate-700 leading-relaxed italic" dangerouslySetInnerHTML={{ __html: groupParts.viet.replace(/\n/g, '<br/>') }} />
                                                                        </div>
                                                                    )}
                                                                 </div>
                                                              </motion.div>
                                                          )}
                                                       </AnimatePresence>
                                                    </div>
                                                 )}


                                         {currentQuestionsGroup[0]?.imageUrl && (
                                             <div className="w-full flex justify-center z-10 relative mb-2 border-b border-slate-100 pb-2">
                                               <img 
                                                 src={currentQuestionsGroup[0].imageUrl} 
                                                 alt="Part" 
                                                 onClick={() => setZoomedImageUrl(currentQuestionsGroup[0].imageUrl)}
                                                 className="max-w-full md:max-w-2xl max-h-[350px] md:max-h-[450px] w-auto cursor-zoom-in object-contain rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300"
                                               />
                                             </div>
                                         )}

                                         {topic.type === 'READING' && (topic.part === 6 || topic.part === 7) && currentQuestionsGroup.length > 1 && (
                                             <div className="flex flex-wrap justify-center gap-2 mb-2 w-full px-2 mt-2">
                                                 {currentQuestionsGroup.map((gq, idx) => {
                                                     const globalIndex = activeGroupStartIndex + idx;
                                                     const isAnswered = !!userAnswers[gq.id];
                                                     const isActive = activeQuestionIndex === globalIndex;
                                                     return (
                                                         <button 
                                                           key={idx}
                                                           onClick={() => setActiveQuestionIndex(globalIndex)}
                                                           className={`px-3 py-1.5 rounded-xl text-xs md:text-sm font-bold border-2 transition-all shrink-0 ${isActive ? 'bg-[#14532d] text-white border-[#14532d]' : isAnswered ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'}`}
                                                         >
                                                           Câu {globalIndex + (topic.part === 1 ? 1 : topic.part === 2 ? 7 : topic.part === 3 ? 32 : topic.part === 4 ? 71 : topic.part === 5 ? 101 : topic.part === 6 ? 131 : 147)}
                                                         </button>
                                                     )
                                                 })}
                                             </div>
                                         )}

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
                                            <div key={q.id} className={`flex flex-col ${localIdx > 0 && (!topic.part || (topic.part !== 6 && topic.part !== 7)) ? 'pt-6 border-t border-dashed border-slate-200 mt-2' : ''}`}>
                                              <div className="mb-4 flex flex-col items-center relative">
                                                {/* Question Number Badge for all parts context */}
                                                {(topic.part && topic.part >= 1 && topic.part <= 7) && (
                                                    <div className="absolute top-0 left-0 text-4xl md:text-5xl font-black text-slate-100/80 -mt-2 -ml-1 sm:-ml-2 pointer-events-none z-0 select-none">
                                                        Q{topic.part === 1 ? globalIdx + 1 :
                                                           topic.part === 2 ? globalIdx + 7 :
                                                           topic.part === 3 ? globalIdx + 32 :
                                                           topic.part === 4 ? globalIdx + 71 :
                                                           topic.part === 5 ? globalIdx + 101 :
                                                           topic.part === 6 ? globalIdx + 131 :
                                                           globalIdx + 147}
                                                    </div>
                                                )}

                                                <div className="text-center mb-4 relative z-10 font-medium w-full mt-2">
                                                  <p className={`text-base md:text-[17px] font-semibold text-slate-800 leading-snug ${(topic.part === 3 || topic.part === 4 || topic.part === 6 || topic.part === 7) ? 'text-left pl-2' : ''}`}>
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
                                                    <p className={`mt-2 text-[14px] md:text-base font-medium text-slate-500 italic animate-in fade-in slide-in-from-top-1 ${(topic.part === 3 || topic.part === 4 || topic.type !== 'LISTENING') ? 'text-left pl-2' : ''}`}>
                                                      {parsedTranslations.question.replace(/^(?:Câu\s*hỏi|Question)[\s]*[:\-]?\s*/i, '').trim()}
                                                    </p>
                                                  )}
                                                </div>
                                                
                                                {q.translation && isShowingResult && (
                                                   <div className={`mt-6 flex flex-col ${topic.part === 3 || topic.part === 4 || topic.type !== 'LISTENING' ? 'items-start w-full' : 'items-center'} `}>
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
                                                   </div>
                                                )}
                                              </div>

                                              <div className={`grid grid-cols-1 ${topic.part === 3 || topic.part === 4 ? '' : 'md:grid-cols-2'} gap-2 md:gap-3`}>
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
                                                      buttonClass += "border-slate-100 bg-white text-emerald-600"
                                                    } else if (opt.label === selectedOption) {
                                                      buttonClass += "border-slate-100 bg-white text-rose-600"
                                                    } else {
                                                      buttonClass += "border-slate-100 bg-white text-slate-400 opacity-60"
                                                    }
                                                  } else {
                                                    if (selectedOption === opt.label) {
                                                      buttonClass += "border-slate-400 bg-slate-50 text-[#14532d]"
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
                                                                ? (opt.label === q.correctOption ? 'border-emerald-600' : opt.label === selectedOption ? 'border-rose-600' : 'border-slate-300')
                                                                : (selectedOption === opt.label ? 'border-[#14532d]' : 'border-slate-300')
                                                             }`}>
                                                                {(selectedOption === opt.label || (isShowingResult && opt.label === q.correctOption)) && (
                                                                    <div className={`w-1.5 h-1.5 rounded-full ${isShowingResult ? (opt.label === q.correctOption ? 'bg-emerald-600' : 'bg-rose-600') : 'bg-[#14532d]'}`} />
                                                                )}
                                                            </div>
                                                            <span className={`shrink-0 font-medium text-[15px] md:text-base ${isShowingResult ? (opt.label === q.correctOption ? 'text-emerald-700' : opt.label === selectedOption ? 'text-rose-700' : 'text-slate-400') : (selectedOption === opt.label ? 'text-[#14532d] font-bold' : 'text-slate-500')}`}>
                                                              {opt.label}.
                                                            </span>
                                                        </div>
                                                        <div className="flex flex-col flex-1">
                                                            <span className={`text-[15px] md:text-base leading-snug transition-opacity duration-300 ${shouldHideValue ? 'opacity-0 select-none' : 'opacity-100'}`}>
                                                              {opt.value || 'Option'}
                                                            </span>
                                                            {showTranslation[q.id] && parsedTranslations.options[opt.label] && (
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
                                              

                                              
                                              {/* Post-Question Explanation & Tools */}
                                              <div className="mt-4 flex flex-col gap-3 w-full">
                                                {isShowingResult && (
                                                    <div className={`flex flex-col gap-3 w-full p-2.5 px-3 md:px-4 rounded-2xl shadow-sm transition-all border ${isCorrect ? 'bg-emerald-50/70 border-emerald-200' : 'bg-rose-50/70 border-rose-200'}`}>
                                                      <div className="flex flex-row items-center justify-between gap-3 w-full">
                                                          <div className={`flex items-center gap-1.5 md:gap-2 transition-all ${isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
                                                            <div className={`w-5 h-5 rounded-full flex items-center justify-center bg-white shadow-sm shrink-0 border border-current opacity-90`}>
                                                                {isCorrect ? (
                                                                  <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M5 13l4 4L19 7" /></svg>
                                                                ) : (
                                                                  <svg className="w-3.5 h-3.5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M6 18L18 6M6 6l12 12" /></svg>
                                                                )}
                                                            </div>
                                                            <span className="font-bold text-sm">{isCorrect ? 'Chính xác' : 'Sai'}</span>
                                                          </div>
                                                          
                                                          <div className="flex items-center gap-2 shrink-0">
                                                            {explanationText && (
                                                                <button
                                                                    onClick={() => setShowExplanation(prev => ({ ...prev, [q.id]: !prev[q.id] }))}
                                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border shadow-sm ${showExplanation[q.id] ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                                                                >
                                                                    Giải thích
                                                                </button>
                                                            )}
                                                            {(() => {
                                                              const bookmarkTierLevel = currentLesson.bookmarkAccessTier === 'ULTRA' ? 3 : currentLesson.bookmarkAccessTier === 'PRO' ? 2 : 1;
                                                              const userTierLevel = session?.user?.role === 'admin' ? 10 : session?.user?.tier === 'ULTRA' ? 3 : (session?.user?.tier === 'PRO' || session?.user?.role === 'member') ? 2 : 1;
                                                              const isLocked = bookmarkTierLevel > userTierLevel;

                                                              if (isLocked) {
                                                                return (
                                                                  <div className="relative group">
                                                                    <button onClick={() => setShowPricing(true)} className={`h-8 w-8 rounded-lg border bg-white border-slate-200 text-slate-400 hover:border-amber-400 hover:text-amber-500 transition-all flex items-center justify-center cursor-pointer shadow-sm shrink-0 flex-none`} aria-label="Lưu tay">
                                                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg>
                                                                      <div className={`absolute -top-1 -right-1 filter drop-shadow-md ${currentLesson.bookmarkAccessTier === 'ULTRA' ? 'text-purple-600' : 'text-amber-500'}`}><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d={currentLesson.bookmarkAccessTier === 'ULTRA' ? "M13 2L3 14h9l-1 8 10-12h-9l1-8z" : "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"} /></svg></div>
                                                                    </button>
                                                                  </div>
                                                                )
                                                              }
                                                              return (
                                                                <button onClick={() => toggleBookmark(q.id)} className={`h-8 w-8 rounded-lg border transition-all flex items-center justify-center cursor-pointer shadow-sm shrink-0 flex-none ${bookmarkedQuestions[q.id] ? 'bg-amber-100 border-amber-300 text-amber-600' : 'bg-white border-slate-200 text-slate-400 hover:border-amber-400 hover:text-amber-500'}`} title={bookmarkedQuestions[q.id] ? 'Đã lưu' : 'Lưu vào sổ tay'}>
                                                                  <svg className="w-4 h-4" fill={bookmarkedQuestions[q.id] ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg>
                                                                </button>
                                                              )
                                                            })()}
                                                          </div>
                                                      </div>
                                                      
                                                      <AnimatePresence>
                                                          {showExplanation[q.id] && explanationText && (
                                                              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                                                  <div className="pt-3 pb-1 border-t border-slate-200/50 mt-1">
                                                                    {explanationText === 'Đăng nhập để xem phần giải thích.' ? (
                                                                        <button onClick={(e) => { e.preventDefault(); const currentPath = window.location.pathname; router.push(`${currentPath}?login=true&allowGuest=true&subtitle=${encodeURIComponent('Đăng nhập để lưu giữ tiến độ và nhận điểm thưởng học tập nhé.')}&callbackUrl=${encodeURIComponent(currentPath)}`, { scroll: false }); }} className="text-sm font-bold italic text-blue-600 hover:text-blue-800 hover:underline cursor-pointer text-left leading-relaxed outline-none w-full">
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
                                                                                         {currentLesson.explanationAccessTier === 'ULTRA' ? <svg className="w-4 h-4 text-purple-700 shrink-0 drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg> : <svg className="w-4 h-4 text-amber-500 shrink-0 drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>}
                                                                                         <span>Nâng cấp</span>
                                                                                       </div>
                                                                                       <div className="flex items-center gap-1 whitespace-nowrap"><span className={`${currentLesson.explanationAccessTier === 'ULTRA' ? 'bg-purple-100 text-purple-900 border border-purple-200' : 'bg-amber-100 text-amber-700 border border-amber-200'} font-bold text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded`}>{currentLesson.explanationAccessTier}</span><span>để xem giải thích chi tiết.</span></div>
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
                                                              <div className={`absolute -top-1.5 -right-1.5 filter drop-shadow-md ${currentLesson.vocabularyAccessTier === 'ULTRA' ? 'text-purple-600' : 'text-amber-500'}`}>
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

                                                    {q.tips && (() => {
                                                        const tipsTierLevel = currentLesson.tipsAccessTier === 'ULTRA' ? 3 : currentLesson.tipsAccessTier === 'PRO' ? 2 : 1;
                                                        const tipsLocked = tipsTierLevel > (session?.user?.role === 'admin' ? 10 : session?.user?.tier === 'ULTRA' ? 3 : (session?.user?.tier === 'PRO' || session?.user?.role === 'member') ? 2 : 1);
                                                        if (tipsLocked) {
                                                          return (
                                                            <button onClick={() => setShowPricing(true)} className="flex-1 min-w-[100px] max-w-[150px] h-11 px-4 rounded-xl border bg-white border-slate-200 text-slate-500 hover:border-slate-400 hover:text-slate-700 transition-all flex items-center gap-2 justify-center cursor-pointer shadow-sm relative group">
                                                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
                                                              <span className="font-semibold text-sm">Tip</span>
                                                              <div className={`absolute -top-1.5 -right-1.5 filter drop-shadow-md ${currentLesson.tipsAccessTier === 'ULTRA' ? 'text-purple-600' : 'text-amber-500'}`}>
                                                                 <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d={currentLesson.tipsAccessTier === 'ULTRA' ? "M13 2L3 14h9l-1 8 10-12h-9l1-8z" : "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"} /></svg>
                                                              </div>
                                                            </button>
                                                          )
                                                        }
                                                        return (
                                                          <button onClick={() => setShowTips(prev => ({ ...prev, [q.id]: !prev[q.id] }))} className={`flex-1 min-w-[100px] max-w-[150px] h-11 px-4 text-sm font-semibold rounded-xl border transition-all flex items-center justify-center cursor-pointer shadow-sm shrink-0 gap-2 ${showTips[q.id] ? 'bg-slate-100 border-slate-300 text-slate-800' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400 hover:text-slate-800'}`}>
                                                            <svg className="w-5 h-5" fill={showTips[q.id] ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
                                                            Tip
                                                          </button>
                                                        )
                                                    })()}
                                                  </div>
                                                )}

                                                {/* Tips Section */}
                                                {isShowingResult && showTips[q.id] && q.tips && questionsPerView === 1 && (
                                                  <div className="w-full mt-4 p-4 md:p-5 rounded-2xl border bg-slate-50 border-slate-200">
                                                    <div className="flex items-center gap-2 mb-2 text-slate-800 font-bold">
                                                      <span className="text-base md:text-lg">💡</span>
                                                      <span>Tip</span>
                                                    </div>
                                                    <div className="text-slate-700 text-sm md:text-base leading-relaxed break-words whitespace-pre-wrap">{q.tips.replace(/^Tip:\s*/i, '').replace(/^Mẹo TOEIC:\s*/i, '')}</div>
                                                  </div>
                                                )}

                                                {/* Vocabulary Section (Only for non-grouped) */}
                                                {isShowingResult && showVocab[q.id] && q.vocabulary && Array.isArray(q.vocabulary) && q.vocabulary.length > 0 && questionsPerView === 1 && (
                                                  <div className="w-full mt-4 p-4 md:p-5 rounded-2xl border bg-slate-50 border-slate-200">
                                                    <ul className="space-y-2">
                                                      {q.vocabulary.map((vocabItem: any, vIdx: number) => (
                                                        <li key={vIdx} className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center gap-1 md:gap-3">
                                                          <span className="font-semibold text-slate-900">{vocabItem.word}</span>
                                                          <span className="hidden md:inline text-slate-300">-</span>
                                                          <span className="text-slate-700 text-sm md:text-base">{vocabItem.meaning}</span>
                                                        </li>
                                                      ))}
                                                    </ul>
                                                  </div>
                                                )}
                                              </div>
                                            );
                                        })}
                                        </>
                                        );
                                      })()}
                                      </div>
                                      
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
                                                      <div className={`absolute -top-1.5 -right-1.5 filter drop-shadow-md ${currentLesson.vocabularyAccessTier === 'ULTRA' ? 'text-purple-600' : 'text-amber-500'}`}>
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

                                                  {groupQ.tips && (() => {
                                                    const tipsTierLevel = currentLesson.tipsAccessTier === 'ULTRA' ? 3 : currentLesson.tipsAccessTier === 'PRO' ? 2 : 1;
                                                    const tipsLocked = tipsTierLevel > userTierLevel;
                                                    if (tipsLocked) {
                                                      return (
                                                        <button onClick={() => setShowPricing(true)} className="flex-1 min-w-[100px] max-w-[150px] h-11 px-4 rounded-xl border bg-white border-slate-200 text-slate-500 hover:border-slate-400 hover:text-slate-700 transition-all flex items-center gap-2 justify-center cursor-pointer shadow-sm relative group">
                                                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
                                                          <span className="font-semibold text-sm">Tip</span>
                                                          <div className={`absolute -top-1.5 -right-1.5 filter drop-shadow-md ${currentLesson.tipsAccessTier === 'ULTRA' ? 'text-purple-600' : 'text-amber-500'}`}>
                                                             <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d={currentLesson.tipsAccessTier === 'ULTRA' ? "M13 2L3 14h9l-1 8 10-12h-9l1-8z" : "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"} /></svg>
                                                          </div>
                                                        </button>
                                                      )
                                                    }
                                                    return (
                                                      <button onClick={() => setShowTips(prev => ({ ...prev, [groupQ.id]: !prev[groupQ.id] }))} className={`flex-1 min-w-[100px] max-w-[150px] h-11 px-4 text-sm font-semibold rounded-xl border transition-all flex items-center justify-center cursor-pointer shadow-sm shrink-0 gap-2 ${showTips[groupQ.id] ? 'bg-slate-100 border-slate-300 text-slate-800' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400 hover:text-slate-800'}`}>
                                                        <svg className="w-5 h-5" fill={showTips[groupQ.id] ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
                                                        Tip
                                                      </button>
                                                    )
                                                  })()}
                                                </div>
                                                
                                                {showVocab[groupQ.id] && !isLocked && (
                                                  <div className="w-full p-4 md:p-5 rounded-2xl border border-slate-200 bg-slate-50">
                                                    <ul className="space-y-2">
                                                      {groupQ.vocabulary.map((vocabItem: any, vIdx: number) => (
                                                        <li key={vIdx} className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center gap-1 md:gap-3">
                                                          <span className="font-semibold text-slate-900">{vocabItem.word}</span>
                                                          <span className="hidden md:inline text-slate-300">-</span>
                                                          <span className="text-slate-700 text-sm md:text-base">{vocabItem.meaning}</span>
                                                        </li>
                                                      ))}
                                                    </ul>
                                                  </div>
                                                )}

                                                {groupQ.tips && showTips[groupQ.id] && (() => {
                                                    const tipsTierLevel = currentLesson.tipsAccessTier === 'ULTRA' ? 3 : currentLesson.tipsAccessTier === 'PRO' ? 2 : 1;
                                                    if (tipsTierLevel > userTierLevel) return null;
                                                    
                                                    return (
                                                      <div className="w-full p-4 md:p-5 rounded-2xl border border-slate-200 bg-slate-50">
                                                        <div className="flex items-center gap-2 mb-2 text-slate-800 font-bold">
                                                          <span className="text-base md:text-lg">💡</span>
                                                          <span>Tip</span>
                                                        </div>
                                                        <div className="text-slate-700 text-sm md:text-base leading-relaxed break-words whitespace-pre-wrap">
                                                          {groupQ.tips.replace(/^Tip:\s*/i, '').replace(/^Mẹo TOEIC:\s*/i, '')}
                                                        </div>
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
                                              window.scrollTo({ top: 300, behavior: 'smooth' });
                                          }}
                                          disabled={activeGroupStartIndex === 0}
                                          className="h-10 w-10 md:w-12 md:h-12 rounded-xl bg-white border border-slate-200 text-slate-500 hover:border-[#14532d] hover:text-[#14532d] hover:bg-emerald-50 disabled:opacity-30 disabled:hover:border-slate-200 disabled:hover:bg-white disabled:hover:text-slate-500 transition-all flex items-center justify-center cursor-pointer shadow-sm shrink-0 flex-none"
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
                                              if (topic.type === 'LISTENING' && topic.part && topic.part <= 4 && listeningMode === 'actual') {
                                                  toast('Đang ở chế độ thi thật. Câu hỏi sẽ tự chuyển khi hết đoạn Audio. Nếu muốn chủ động, hãy chọn chế độ Luyện tập', { icon: '⚠️', duration: 4000, style: { border: '1px solid #ef4444', color: '#7f1d1d', background: '#fef2f2', fontWeight: 600 } });
                                                  return;
                                              }
                                              setActiveQuestionIndex(prev => Math.min(currentLesson.questions.length - 1, prev + questionsPerView));
                                              window.scrollTo({ top: 300, behavior: 'smooth' });
                                          }}
                                          disabled={activeGroupStartIndex + questionsPerView >= currentLesson.questions.length}
                                          className="h-10 w-10 md:w-12 md:h-12 rounded-xl bg-white border border-slate-200 text-slate-500 hover:border-[#14532d] hover:text-[#14532d] hover:bg-emerald-50 disabled:opacity-30 disabled:hover:border-slate-200 disabled:hover:bg-white disabled:hover:text-slate-500 transition-all flex items-center justify-center cursor-pointer shadow-sm shrink-0 flex-none"
                                          aria-label="Tiếp theo"
                                        >
                                          <svg className="w-5 h-5 md:w-6 md:h-6 stroke-[2px]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                                        </button>
                                      </div>
                                    </motion.div>
                                  )
                                })()}
                              </AnimatePresence>

                              {/* Small Numbers Row at the very bottom without vertical scroll */}
                              <div className="mt-6 flex flex-wrap justify-center items-center gap-1 sm:gap-1.5 w-full">
                                {currentLesson.questions.map((_, idx) => {
                                  const questionsPerView = (topic.type === 'LISTENING' && (topic.part === 3 || topic.part === 4)) ? 3 : 1;
                                  const activeGroupStartIndex = Math.floor(activeQuestionIndex / questionsPerView) * questionsPerView;
                                  
                                  const isActive = idx >= activeGroupStartIndex && idx < activeGroupStartIndex + questionsPerView;
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
                                          if (topic.type === 'LISTENING' && topic.part && topic.part <= 4 && listeningMode === 'actual') {
                                              toast('Đang ở chế độ thi thật. Nếu muốn thực hành, bạn hãy làm lại bài và chọn chế độ luyện tập', { icon: '⚠️', duration: 4000, style: { border: '1px solid #ef4444', color: '#7f1d1d', background: '#fef2f2', fontWeight: 600 } });
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

      {/* Zoom Image Modal Overlay */}
      <AnimatePresence>
         {zoomedImageUrl && (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setZoomedImageUrl(null)}
               className="fixed inset-0 z-[100] flex items-center justify-center p-2 md:p-6 bg-slate-900/90 backdrop-blur-sm cursor-zoom-out overflow-y-auto"
            >
               <motion.img 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  src={zoomedImageUrl} 
                  alt="Zoomed" 
                  className="max-w-full max-h-none md:max-h-[95vh] object-contain rounded-xl shadow-2xl pointer-events-auto"
                  onClick={(e) => e.stopPropagation()}
               />
               <button 
                  onClick={() => setZoomedImageUrl(null)}
                  className="fixed top-4 right-4 md:top-8 md:right-8 bg-black/50 hover:bg-black/80 text-white rounded-full p-2 backdrop-blur-md transition-colors shadow-lg"
               >
                  <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
            </motion.div>
         )}
      </AnimatePresence>

      {/* Pricing Modal for PRO/ULTRA */}
      <UpgradeModal isOpen={showPricing} onClose={() => setShowPricing(false)} />
    </div>
  )
}
