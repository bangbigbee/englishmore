'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'

interface AvailableCourse {
  id: string
  title: string
  registrationDeadline: string
  enrolledCount: number
  maxStudents: number
}

type GreetingInputMethod = 'text' | 'voice'

interface DailyGreetingResponse {
  id: string
  message: string
  inputMethod: GreetingInputMethod
  responseDate: string
  updatedAt: string
}

interface DailyGreetingConversationItem {
  id: string
  sourceId?: string
  userId: string
  studentName: string
  message: string
  inputMethod: GreetingInputMethod | null
  updatedAt: string
  entryType: 'checkin' | 'reflection'
}

interface ClassActivityUnreadSummary {
  checkins: number
  reflections: number
  total: number
}

interface MemberVocabularyItem {
  id: string
  word: string
  phonetic: string | null
  englishDefinition: string | null
  meaning: string
  example: string | null
  displayOrder: number
}

type BrowserSpeechRecognition = {
  lang: string
  interimResults: boolean
  continuous: boolean
  onresult: ((event: { results: ArrayLike<(ArrayLike<{ transcript: string }> & { isFinal?: boolean })> }) => void) | null
  onerror: ((event: { error: string }) => void) | null
  onend: (() => void) | null
  onspeechend?: (() => void) | null
  onsoundend?: (() => void) | null
  onaudioend?: (() => void) | null
  onnomatch?: (() => void) | null
  start: () => void
  stop: () => void
  abort?: () => void
}

type SpeechRecognitionFactory = new () => BrowserSpeechRecognition

interface MemberHomeworkSummary {
  hasActiveCourse: boolean
  courseTitle: string
  completedSessions: number
  totalSessions: number
  totalHomework: number
  submittedHomework: number
  feedbackNoticeCount: number
  pendingHomework: Array<{
    id: string
    title: string
    dueDate: string
  }>
  totalExercises: number
  pendingExercisesCount: number
  weeklyActivity?: Array<{
    day: string
    minutes: number
  }>
}

interface AdminHomeworkReviewSummary {
  unreadStudentMessageCount: number
  pendingTeacherReplyCount: number
}

const WEEK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const
const QUICK_CHECKIN_MESSAGES = [
  "I'm good!",
  "I'm so energetic to start a new day.",
  "I'm wonderful"
] as const

export default function Home() {
  const { data: session } = useSession()
  const [availableCourses, setAvailableCourses] = useState<AvailableCourse[]>([])
  const [memberHomework, setMemberHomework] = useState<MemberHomeworkSummary | null>(null)
  const [adminHomeworkReview, setAdminHomeworkReview] = useState<AdminHomeworkReviewSummary | null>(null)
  const [loadingCourses, setLoadingCourses] = useState(false)
  const [showAllCourseDetails, setShowAllCourseDetails] = useState(false)
  const [greetingMethod, setGreetingMethod] = useState<GreetingInputMethod>('text')
  const [greetingMessage, setGreetingMessage] = useState('')
  const [showCustomGreetingInput, setShowCustomGreetingInput] = useState(false)
  const [greetingError, setGreetingError] = useState('')
  const [greetingStatus, setGreetingStatus] = useState('')
  const [hasGreetingToday, setHasGreetingToday] = useState(false)
  const [isSavingGreeting, setIsSavingGreeting] = useState(false)
  const [isEditingCheckin, setIsEditingCheckin] = useState(false)
  const [editCheckinMessage, setEditCheckinMessage] = useState('')
  const [editCheckinStatus, setEditCheckinStatus] = useState('')
  const [greetingConversationLoading, setGreetingConversationLoading] = useState(false)
  const [classActivityUnread, setClassActivityUnread] = useState<ClassActivityUnreadSummary>({ checkins: 0, reflections: 0, total: 0 })
  // Reflection state
  const [reflectionMessage, setReflectionMessage] = useState('')
  const [reflectionStatus, setReflectionStatus] = useState('')
  const [reflectionError, setReflectionError] = useState('')
  const [hasReflectionToday, setHasReflectionToday] = useState(false)
  const [isSavingReflection, setIsSavingReflection] = useState(false)
  const [isEditingReflection, setIsEditingReflection] = useState(false)
  const [editReflectionMessage, setEditReflectionMessage] = useState('')
  const [editReflectionStatus, setEditReflectionStatus] = useState('')
  const [greetingConversation, setGreetingConversation] = useState<DailyGreetingConversationItem[]>([])
  const [isListening, setIsListening] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(false)
  const [memberVocabularyItems, setMemberVocabularyItems] = useState<MemberVocabularyItem[]>([])
  const [memberVocabularyCourseTitle, setMemberVocabularyCourseTitle] = useState('')
  const [memberVocabularyIndex, setMemberVocabularyIndex] = useState(0)
  const [memberVocabularyLoading, setMemberVocabularyLoading] = useState(false)
  const [memberVocabularyError, setMemberVocabularyError] = useState('')
  const [isPronunciationListening, setIsPronunciationListening] = useState(false)
  const [pronunciationStatus, setPronunciationStatus] = useState('')
  const [pronunciationFeedback, setPronunciationFeedback] = useState('')
  const [pronunciationTranscript, setPronunciationTranscript] = useState('')
  const [pronunciationScore, setPronunciationScore] = useState<number | null>(null)
  const pronunciationScoringTimeoutRef = useRef<number | null>(null)
  const pronunciationListeningTimeoutRef = useRef<number | null>(null)
  const pronunciationFinalizeTimeoutRef = useRef<number | null>(null)
  const pronunciationRecognitionRef = useRef<BrowserSpeechRecognition | null>(null)
  const pronunciationDoneAudioRef = useRef<HTMLAudioElement | null>(null)
  const pronunciationDoneAudioPrimedRef = useRef(false)

  useEffect(() => {
    if (!session) {
      setAvailableCourses([])
      setAdminHomeworkReview(null)
      setGreetingMessage('')
      setShowCustomGreetingInput(false)
      setHasGreetingToday(false)
      setEditCheckinMessage('')
      setReflectionMessage('')
      setHasReflectionToday(false)
      setEditReflectionMessage('')
      setIsEditingReflection(false)
      setEditReflectionStatus('')
      setGreetingConversation([])
      setClassActivityUnread({ checkins: 0, reflections: 0, total: 0 })
      return
    }

    const fetchAvailableCourses = async () => {
      try {
        setLoadingCourses(true)
        const res = await fetch('/api/courses')
        if (!res.ok) return
        const data = await res.json()
        setAvailableCourses(Array.isArray(data) ? data : [])
      } catch {
        setAvailableCourses([])
      } finally {
        setLoadingCourses(false)
      }
    }

    const fetchGreetingResponse = async (showLoading = true) => {
      if (session.user?.role !== 'member') {
        setGreetingMessage('')
        setHasGreetingToday(false)
        setGreetingConversation([])
        setClassActivityUnread({ checkins: 0, reflections: 0, total: 0 })
        return
      }

      try {
        if (showLoading) {
          setGreetingConversationLoading(true)
        }
        const res = await fetch('/api/member/daily-greeting')
        if (!res.ok) {
          setGreetingMessage('')
          setHasGreetingToday(false)
          setGreetingConversation([])
          setClassActivityUnread({ checkins: 0, reflections: 0, total: 0 })
          return
        }

        const data = await res.json() as {
          hasResponse?: boolean
          response?: DailyGreetingResponse | null
          conversation?: DailyGreetingConversationItem[]
          unreadSummary?: ClassActivityUnreadSummary
        }
        setHasGreetingToday(Boolean(data?.hasResponse))
        setGreetingMessage(data?.response?.message || '')
        setShowCustomGreetingInput(false)
        setEditCheckinMessage(data?.response?.message || '')
        setGreetingConversation(Array.isArray(data?.conversation) ? data.conversation : [])
        setClassActivityUnread({
          checkins: Number(data?.unreadSummary?.checkins || 0),
          reflections: Number(data?.unreadSummary?.reflections || 0),
          total: Number(data?.unreadSummary?.total || 0)
        })
        if (data?.response?.inputMethod === 'voice' || data?.response?.inputMethod === 'text') {
          setGreetingMethod(data.response.inputMethod)
        }
      } catch {
        setGreetingMessage('')
        setShowCustomGreetingInput(false)
        setHasGreetingToday(false)
        setEditCheckinMessage('')
        setGreetingConversation([])
        setClassActivityUnread({ checkins: 0, reflections: 0, total: 0 })
      } finally {
        if (showLoading) {
          setGreetingConversationLoading(false)
        }
      }
    }

    const fetchMemberHomework = async () => {
      if (session.user?.role !== 'member') {
        setMemberHomework(null)
        return
      }

      try {
        const res = await fetch('/api/member/homework-summary')
        if (!res.ok) {
          setMemberHomework(null)
          return
        }
        const data = await res.json()
        setMemberHomework(data)
      } catch {
        setMemberHomework(null)
      }
    }

    const fetchAdminHomeworkReview = async () => {
      if (session.user?.role !== 'admin') {
        setAdminHomeworkReview(null)
        return
      }

      try {
        const res = await fetch('/api/admin/dashboard-summary')
        if (!res.ok) {
          setAdminHomeworkReview(null)
          return
        }

        const data = await res.json()
        setAdminHomeworkReview({
          unreadStudentMessageCount: Number(data?.unreadStudentMessageCount || 0),
          pendingTeacherReplyCount: Number(data?.pendingTeacherReplyCount || 0)
        })
      } catch {
        setAdminHomeworkReview(null)
      }
    }

    const fetchMemberVocabulary = async () => {
      if (session.user?.role !== 'member') {
        setMemberVocabularyItems([])
        setMemberVocabularyCourseTitle('')
        return
      }

      try {
        setMemberVocabularyLoading(true)
        setMemberVocabularyError('')
        const res = await fetch('/api/member/vocabulary')
        if (!res.ok) {
          setMemberVocabularyItems([])
          setMemberVocabularyCourseTitle('')
          setMemberVocabularyError('Could not load the vocabulary data.')
          return
        }

        const data = await res.json()
        const items = Array.isArray(data?.items) ? data.items : []
        setMemberVocabularyItems(items)
        setMemberVocabularyCourseTitle(String(data?.courseTitle || ''))
        setMemberVocabularyIndex(0)
      } catch {
        setMemberVocabularyItems([])
        setMemberVocabularyCourseTitle('')
        setMemberVocabularyError('Could not load the vocabulary data.')
      } finally {
        setMemberVocabularyLoading(false)
      }
    }

    const fetchReflection = async () => {
      if (session.user?.role !== 'member') {
        setHasReflectionToday(false)
        setReflectionMessage('')
        setEditReflectionMessage('')
        setIsEditingReflection(false)
        setEditReflectionStatus('')
        return
      }
      try {
        const res = await fetch('/api/member/daily-reflection')
        if (!res.ok) {
          setHasReflectionToday(false)
          setReflectionMessage('')
          return
        }
        const data = await res.json() as { hasReflection?: boolean; reflection?: { message: string } | null }
        setHasReflectionToday(Boolean(data?.hasReflection))
        setReflectionMessage(data?.reflection?.message || '')
        setEditReflectionMessage(data?.reflection?.message || '')
      } catch {
        setHasReflectionToday(false)
        setReflectionMessage('')
        setEditReflectionMessage('')
        setIsEditingReflection(false)
        setEditReflectionStatus('')
      }
    }

    fetchAvailableCourses()
    fetchGreetingResponse()
    fetchMemberHomework()
    fetchAdminHomeworkReview()
    fetchMemberVocabulary()
    fetchReflection()

    const conversationRefreshInterval = window.setInterval(() => {
      fetchGreetingResponse(false)
    }, 25000)

    return () => {
      window.clearInterval(conversationRefreshInterval)
    }
  }, [session])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const win = window as Window & {
      SpeechRecognition?: SpeechRecognitionFactory
      webkitSpeechRecognition?: SpeechRecognitionFactory
    }

    setSpeechSupported(Boolean(win.SpeechRecognition || win.webkitSpeechRecognition))
  }, [])

  const tickerCourses = useMemo(() => {
    if (availableCourses.length === 0) return []
    return [...availableCourses, ...availableCourses]
  }, [availableCourses])

  const normalizePronunciationText = (value: string) =>
    value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()

  const calculateLevenshteinDistance = (left: string, right: string) => {
    const rows = left.length + 1
    const cols = right.length + 1
    const matrix = Array.from({ length: rows }, () => Array.from({ length: cols }, () => 0))

    for (let row = 0; row < rows; row += 1) {
      matrix[row][0] = row
    }

    for (let col = 0; col < cols; col += 1) {
      matrix[0][col] = col
    }

    for (let row = 1; row < rows; row += 1) {
      for (let col = 1; col < cols; col += 1) {
        const substitutionCost = left[row - 1] === right[col - 1] ? 0 : 1
        matrix[row][col] = Math.min(
          matrix[row - 1][col] + 1,
          matrix[row][col - 1] + 1,
          matrix[row - 1][col - 1] + substitutionCost
        )
      }
    }

    return matrix[left.length][right.length]
  }

  const calculateSimilarityScore = (target: string, candidate: string) => {
    if (!target && !candidate) {
      return 100
    }

    const maxLength = Math.max(target.length, candidate.length)
    if (maxLength === 0) {
      return 0
    }

    const distance = calculateLevenshteinDistance(target, candidate)
    return Math.max(0, Math.round((1 - distance / maxLength) * 100))
  }

  const getBestPronunciationCandidate = (target: string, transcript: string) => {
    const normalizedTarget = normalizePronunciationText(target)
    const normalizedTranscript = normalizePronunciationText(transcript)

    if (!normalizedTarget || !normalizedTranscript) {
      return { candidate: normalizedTranscript, score: 0 }
    }

    const targetTokenCount = normalizedTarget.split(' ').length
    const transcriptTokens = normalizedTranscript.split(' ')
    const candidates = new Set<string>([normalizedTranscript])

    transcriptTokens.forEach((token) => {
      if (token) {
        candidates.add(token)
      }
    })

    for (let windowSize = Math.max(1, targetTokenCount - 1); windowSize <= Math.min(transcriptTokens.length, targetTokenCount + 1); windowSize += 1) {
      for (let index = 0; index <= transcriptTokens.length - windowSize; index += 1) {
        candidates.add(transcriptTokens.slice(index, index + windowSize).join(' '))
      }
    }

    let bestCandidate = normalizedTranscript
    let bestScore = 0

    candidates.forEach((candidate) => {
      const score = calculateSimilarityScore(normalizedTarget, candidate)
      if (score > bestScore) {
        bestScore = score
        bestCandidate = candidate
      }
    })

    return { candidate: bestCandidate, score: bestScore }
  }

  const buildPronunciationFeedback = (score: number, candidate: string, target: string) => {
    if (score >= 95) {
      return `Excellent. Your pronunciation matched \"${target}\" very closely.`
    }

    if (score >= 80) {
      return `Good job. We heard \"${candidate}\", which is close to \"${target}\".`
    }

    if (score >= 60) {
      return `Pretty close. We heard \"${candidate}\". Try slowing down and stressing each syllable more clearly.`
    }

    return `We heard \"${candidate || 'something different'}\". Listen again and repeat the word \"${target}\" more clearly.`
  }

  const weeklyActivityRows = useMemo(() => {
    const data = memberHomework?.weeklyActivity ?? WEEK_DAYS.map((day) => ({ day, minutes: 0 }))

    return data.map((item) => {
      const barClass = item.minutes === 0
        ? 'bg-slate-300'
        : item.minutes <= 15
          ? 'bg-amber-500'
          : 'bg-[#4db463]'

      // 60 minutes = 100%, cap at 100%
      const widthPercent = Math.min(Math.max(item.minutes > 0 ? 16 : 0, Math.round((item.minutes / 60) * 100)), 100)

      return {
        ...item,
        widthPercent,
        barClass
      }
    })
  }, [memberHomework])

  const courseProgressPercent = useMemo(() => {
    if (!memberHomework) {
      return 0
    }

    return Math.round(
      (Math.min(memberHomework.totalSessions || 30, Math.max(0, memberHomework.completedSessions))
        / Math.max(1, memberHomework.totalSessions || 30))
      * 100
    )
  }, [memberHomework])

  const classActivitySummary = useMemo(() => {
    return greetingConversation.reduce(
      (summary, item) => {
        if (item.entryType === 'checkin') {
          summary.checkins += 1
        }

        if (item.entryType === 'reflection') {
          summary.reflections += 1
        }

        return summary
      },
      { checkins: 0, reflections: 0 }
    )
  }, [greetingConversation])

  const getActivityBubbleStyle = (item: DailyGreetingConversationItem) => {
    if (item.entryType === 'reflection') {
      return 'border-violet-200 bg-violet-50/95 text-violet-950 shadow-violet-100'
    }

    return 'border-blue-200 bg-blue-50/95 text-blue-950 shadow-blue-100'
  }

  const getActivityDotStyle = (item: DailyGreetingConversationItem) => {
    if (item.entryType === 'reflection') {
      return 'bg-violet-500 ring-violet-200'
    }

    return 'bg-blue-500 ring-blue-200'
  }

  const startVoiceCapture = () => {
    if (typeof window === 'undefined') {
      setGreetingError('This browser does not support voice input.')
      return
    }

    const win = window as Window & {
      SpeechRecognition?: SpeechRecognitionFactory
      webkitSpeechRecognition?: SpeechRecognitionFactory
    }

    const RecognitionCtor = win.SpeechRecognition || win.webkitSpeechRecognition
    if (!RecognitionCtor) {
      setGreetingError('This browser does not support voice input.')
      return
    }

    setGreetingError('')
    setGreetingStatus('Listening... Please say your check-in now.')
    setIsListening(true)

    const recognition = new RecognitionCtor()
    recognition.lang = 'en-US'
    recognition.interimResults = false
    recognition.continuous = false

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result?.[0]?.transcript || '')
        .join(' ')
        .trim()

      if (transcript) {
        setGreetingMessage((prev) => `${prev}${prev ? ' ' : ''}${transcript}`.trim())
        setGreetingStatus('Voice input captured. You can still edit the text before submitting.')
      }
    }

    recognition.onerror = () => {
      setGreetingError('Voice input is unavailable right now. Please try again or switch to text mode.')
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.start()
  }

  const currentVocabularyItem = memberVocabularyItems.length > 0
    ? memberVocabularyItems[((memberVocabularyIndex % memberVocabularyItems.length) + memberVocabularyItems.length) % memberVocabularyItems.length]
    : null

  useEffect(() => {
    setIsPronunciationListening(false)
    setPronunciationStatus('')
    setPronunciationFeedback('')
    setPronunciationTranscript('')
    setPronunciationScore(null)
    if (pronunciationScoringTimeoutRef.current !== null && typeof window !== 'undefined') {
      window.clearTimeout(pronunciationScoringTimeoutRef.current)
      pronunciationScoringTimeoutRef.current = null
    }
    if (pronunciationListeningTimeoutRef.current !== null && typeof window !== 'undefined') {
      window.clearTimeout(pronunciationListeningTimeoutRef.current)
      pronunciationListeningTimeoutRef.current = null
    }
    if (pronunciationRecognitionRef.current) {
      try {
        pronunciationRecognitionRef.current.stop()
      } catch {
        // Ignore stop errors from already-ended recognition instances.
      }
      pronunciationRecognitionRef.current = null
    }
  }, [currentVocabularyItem?.id])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    pronunciationDoneAudioRef.current = new Audio('/audio/tingsound.mp3')
    pronunciationDoneAudioRef.current.preload = 'auto'
    pronunciationDoneAudioRef.current.setAttribute('playsinline', 'true')
    pronunciationDoneAudioRef.current.load()

    return () => {
      if (pronunciationDoneAudioRef.current) {
        pronunciationDoneAudioRef.current.pause()
        pronunciationDoneAudioRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    return () => {
      if (pronunciationScoringTimeoutRef.current !== null && typeof window !== 'undefined') {
        window.clearTimeout(pronunciationScoringTimeoutRef.current)
      }
      if (pronunciationListeningTimeoutRef.current !== null && typeof window !== 'undefined') {
        window.clearTimeout(pronunciationListeningTimeoutRef.current)
      }
      if (pronunciationRecognitionRef.current) {
        try {
          pronunciationRecognitionRef.current.stop()
        } catch {
          // Ignore stop errors from already-ended recognition instances.
        }
      }
    }
  }, [])

  const moveVocabulary = (direction: 'prev' | 'next') => {
    if (memberVocabularyItems.length <= 1) return
    setMemberVocabularyIndex((current) => {
      const delta = direction === 'next' ? 1 : -1
      return (current + delta + memberVocabularyItems.length) % memberVocabularyItems.length
    })
  }

  const pickAmericanVoice = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      return null
    }

    const voices = window.speechSynthesis.getVoices()
    if (voices.length === 0) {
      return null
    }

    const exactGoogleUsVoice = voices.find((voice) => voice.name === 'Google US English' && voice.lang.toLowerCase() === 'en-us')
    if (exactGoogleUsVoice) {
      return exactGoogleUsVoice
    }

    const googleUsVoice = voices.find((voice) => voice.name.toLowerCase().includes('google') && voice.lang.toLowerCase() === 'en-us')
    if (googleUsVoice) {
      return googleUsVoice
    }

    const preferredVoiceNames = ['Samantha', 'Daniel', 'Alex', 'Google', 'Jenny', 'Guy', 'Christopher', 'Eric', 'Aria', 'Davis', 'Roger', 'Joey', 'Matthew', 'Salli', 'Ivy', 'Kevin']

    return voices.find((voice) =>
      voice.lang.toLowerCase() === 'en-us' && preferredVoiceNames.some((name) => voice.name.includes(name))
    ) || voices.find((voice) => voice.lang.toLowerCase() === 'en-us') || null
  }

  const clearPronunciationScoringTimeout = () => {
    if (pronunciationScoringTimeoutRef.current !== null && typeof window !== 'undefined') {
      window.clearTimeout(pronunciationScoringTimeoutRef.current)
      pronunciationScoringTimeoutRef.current = null
    }
  }

  const clearPronunciationListeningTimeout = () => {
    if (pronunciationListeningTimeoutRef.current !== null && typeof window !== 'undefined') {
      window.clearTimeout(pronunciationListeningTimeoutRef.current)
      pronunciationListeningTimeoutRef.current = null
    }
  }

  const clearPronunciationFinalizeTimeout = () => {
    if (pronunciationFinalizeTimeoutRef.current !== null && typeof window !== 'undefined') {
      window.clearTimeout(pronunciationFinalizeTimeoutRef.current)
      pronunciationFinalizeTimeoutRef.current = null
    }
  }

  const playPronunciationDoneChime = () => {
    if (typeof window === 'undefined' || !pronunciationDoneAudioRef.current) {
      return
    }

    try {
      pronunciationDoneAudioRef.current.pause()
      pronunciationDoneAudioRef.current.currentTime = 0
      void pronunciationDoneAudioRef.current.play().catch(() => undefined)
    } catch {
      return
    }
  }

  const primePronunciationDoneChime = async () => {
    if (typeof window === 'undefined' || !pronunciationDoneAudioRef.current || pronunciationDoneAudioPrimedRef.current) {
      return
    }

    try {
      const audio = pronunciationDoneAudioRef.current
      audio.muted = true
      audio.currentTime = 0
      await audio.play()
      audio.pause()
      audio.currentTime = 0
      audio.muted = false
      pronunciationDoneAudioPrimedRef.current = true
    } catch {
      if (pronunciationDoneAudioRef.current) {
        pronunciationDoneAudioRef.current.muted = false
      }
    }
  }

  const startPronunciationRecognition = () => {
    if (!currentVocabularyItem || typeof window === 'undefined') {
      return
    }

    const win = window as Window & {
      SpeechRecognition?: SpeechRecognitionFactory
      webkitSpeechRecognition?: SpeechRecognitionFactory
    }

    const RecognitionCtor = win.SpeechRecognition || win.webkitSpeechRecognition
    if (!RecognitionCtor) {
      setPronunciationStatus('')
      setPronunciationFeedback('This browser does not support voice practice yet.')
      setPronunciationScore(null)
      return
    }

    setPronunciationStatus('Listening... Say the word clearly now.')
    setPronunciationFeedback('')
    setPronunciationTranscript('')
    setPronunciationScore(null)
    setIsPronunciationListening(true)
    clearPronunciationScoringTimeout()
    clearPronunciationListeningTimeout()
    clearPronunciationFinalizeTimeout()
    if (pronunciationRecognitionRef.current) {
      try {
        pronunciationRecognitionRef.current.stop()
      } catch {
        // Ignore stop errors from already-ended recognition instances.
      }
    }

    const recognition = new RecognitionCtor()
    pronunciationRecognitionRef.current = recognition
    recognition.lang = 'en-US'
    recognition.interimResults = true
    recognition.continuous = false
    let hasHandledResult = false
    let hasSpeechFinished = false
    let latestTranscript = ''

    const stopRecognitionSafely = () => {
      try {
        recognition.stop()
      } catch {
        try {
          recognition.abort?.()
        } catch {
          // Ignore stop errors from already-ended recognition instances.
        }
      }
    }

    const markListeningAsFinished = () => {
      if (!hasSpeechFinished) {
        hasSpeechFinished = true
        setIsPronunciationListening(false)
        setPronunciationStatus((current) =>
          current.startsWith('Listening') ? 'Got it. Finishing recognition...' : current
        )
      }
    }

    const finalizeRecognition = (transcript: string) => {
      const normalizedTranscript = transcript.trim()
      if (!normalizedTranscript || hasHandledResult) {
        return
      }

      hasHandledResult = true
      clearPronunciationListeningTimeout()
      clearPronunciationFinalizeTimeout()
      pronunciationRecognitionRef.current = null
      markListeningAsFinished()

      const { candidate, score } = getBestPronunciationCandidate(currentVocabularyItem.word, normalizedTranscript)
      setPronunciationTranscript(normalizedTranscript)
      setPronunciationStatus('Got it. Checking your pronunciation...')
      playPronunciationDoneChime()
      clearPronunciationScoringTimeout()
      stopRecognitionSafely()
      pronunciationScoringTimeoutRef.current = window.setTimeout(() => {
        setPronunciationScore(score)
        setPronunciationFeedback(buildPronunciationFeedback(score, candidate, currentVocabularyItem.word))
        setPronunciationStatus(score >= 80 ? 'Nice work. Keep practicing to make it even cleaner.' : 'Try again and compare your sound with the sample.')
        pronunciationScoringTimeoutRef.current = null
      }, 420)
    }

    pronunciationListeningTimeoutRef.current = window.setTimeout(() => {
      if (pronunciationRecognitionRef.current !== recognition || hasHandledResult) {
        return
      }

      clearPronunciationFinalizeTimeout()
      stopRecognitionSafely()

      pronunciationRecognitionRef.current = null
      pronunciationListeningTimeoutRef.current = null
      setIsPronunciationListening(false)
      setPronunciationStatus('Listening timed out. Please try again and say the word once, clearly.')
      setPronunciationFeedback('')
      setPronunciationScore(null)
    }, 7000)

    recognition.onresult = (event) => {
      const latestResult = event.results[event.results.length - 1]
      const transcript = Array.from(event.results)
        .map((result) => Array.from(result || []).map((option) => option?.transcript || '').join(' '))
        .join(' ')
        .trim()

      if (!transcript) {
        return
      }

      latestTranscript = transcript
      setPronunciationTranscript(transcript)
      clearPronunciationListeningTimeout()
      clearPronunciationFinalizeTimeout()

      if (latestResult?.isFinal) {
        finalizeRecognition(transcript)
        return
      }

      setPronunciationStatus('Listening... finish the whole word.')
      pronunciationFinalizeTimeoutRef.current = window.setTimeout(() => {
        finalizeRecognition(latestTranscript)
      }, 900)
    }

    recognition.onaudioend = () => {
      if (!hasHandledResult) {
        markListeningAsFinished()
      }
    }
    recognition.onnomatch = () => {
      clearPronunciationListeningTimeout()
      clearPronunciationFinalizeTimeout()
      pronunciationRecognitionRef.current = null
      setIsPronunciationListening(false)
      setPronunciationStatus('')
      setPronunciationFeedback('We could not hear the word clearly. Please try again and say it more clearly.')
      setPronunciationScore(null)
    }

    recognition.onerror = () => {
      clearPronunciationScoringTimeout()
      clearPronunciationListeningTimeout()
      clearPronunciationFinalizeTimeout()
      pronunciationRecognitionRef.current = null
      setIsPronunciationListening(false)
      setPronunciationStatus('')
      setPronunciationFeedback('Speech recognition failed this time. Please try again in a quieter place.')
      setPronunciationScore(null)
    }

    recognition.onend = () => {
      clearPronunciationListeningTimeout()
      clearPronunciationFinalizeTimeout()
      if (pronunciationRecognitionRef.current === recognition) {
        pronunciationRecognitionRef.current = null
      }
      setIsPronunciationListening(false)
    }

    recognition.start()
  }

  const speakVocabularyWord = (options?: { startPracticeAfterSpeak?: boolean }) => {
    if (!currentVocabularyItem || typeof window === 'undefined') {
      if (options?.startPracticeAfterSpeak) {
        startPronunciationRecognition()
      }
      return
    }

    if (options?.startPracticeAfterSpeak) {
      setPronunciationStatus('Listen to the sample first, then repeat it.')
      setPronunciationFeedback('')
      setPronunciationTranscript('')
      setPronunciationScore(null)
    }

    if (!window.speechSynthesis) {
      if (options?.startPracticeAfterSpeak) {
        startPronunciationRecognition()
      }
      return
    }

    const utterance = new SpeechSynthesisUtterance(currentVocabularyItem.word)
    utterance.lang = 'en-US'
    utterance.rate = 0.9
    const americanVoice = pickAmericanVoice()
    if (americanVoice) {
      utterance.voice = americanVoice
    }
    if (options?.startPracticeAfterSpeak) {
      utterance.onend = () => {
        startPronunciationRecognition()
      }
    }
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
  }

  const handleTryVocabulary = async () => {
    if (!currentVocabularyItem) {
      return
    }

    await primePronunciationDoneChime()
    speakVocabularyWord({ startPracticeAfterSpeak: true })
  }

  const submitGreeting = async (message: string, method: GreetingInputMethod) => {
    const normalizedMessage = message.trim()
    if (!normalizedMessage) {
      setGreetingError('Please enter your check-in before submitting.')
      return
    }

    setGreetingError('')
    setGreetingStatus('Saving your check-in...')
    setIsSavingGreeting(true)

    try {
      const res = await fetch('/api/member/daily-greeting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputMethod: method,
          message: normalizedMessage
        })
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setGreetingError(data?.error || 'Could not save your check-in. Please try again.')
        setGreetingStatus('')
        return
      }

      setHasGreetingToday(true)
      setGreetingMethod(method)
      setGreetingMessage(normalizedMessage)
      setEditCheckinMessage(normalizedMessage)
      setGreetingStatus('Nice. Your check-in for today has been saved.')

      const refreshRes = await fetch('/api/member/daily-greeting')
      if (refreshRes.ok) {
        const refreshData = await refreshRes.json() as {
          hasResponse?: boolean
          response?: DailyGreetingResponse | null
          conversation?: DailyGreetingConversationItem[]
          unreadSummary?: ClassActivityUnreadSummary
        }
        setGreetingConversation(Array.isArray(refreshData?.conversation) ? refreshData.conversation : [])
        setClassActivityUnread({
          checkins: Number(refreshData?.unreadSummary?.checkins || 0),
          reflections: Number(refreshData?.unreadSummary?.reflections || 0),
          total: Number(refreshData?.unreadSummary?.total || 0)
        })
      }
    } catch {
      setGreetingError('Could not save your check-in. Please try again.')
      setGreetingStatus('')
    } finally {
      setIsSavingGreeting(false)
    }
  }

  const handleSubmitGreeting = async () => {
    await submitGreeting(greetingMessage, greetingMethod)
  }

  const handleQuickGreetingSubmit = async (message: string) => {
    setGreetingMessage(message)
    setGreetingMethod('text')
    await submitGreeting(message, 'text')
  }

  const handleSaveEditCheckin = async () => {
    const msg = editCheckinMessage.trim()
    if (!msg) return
    setEditCheckinStatus('Saving...')
    try {
      const res = await fetch('/api/member/daily-greeting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputMethod: greetingMethod, message: msg })
      })
      if (!res.ok) { setEditCheckinStatus('Save failed.'); return }
      setGreetingMessage(msg)
      setEditCheckinMessage(msg)
      setEditCheckinStatus('Your check-in has been updated.')
      setIsEditingCheckin(false)
      const refreshRes = await fetch('/api/member/daily-greeting')
      if (refreshRes.ok) {
        const refreshData = await refreshRes.json() as {
          conversation?: DailyGreetingConversationItem[]
          unreadSummary?: ClassActivityUnreadSummary
        }
        setGreetingConversation(Array.isArray(refreshData?.conversation) ? refreshData.conversation : [])
        setClassActivityUnread({
          checkins: Number(refreshData?.unreadSummary?.checkins || 0),
          reflections: Number(refreshData?.unreadSummary?.reflections || 0),
          total: Number(refreshData?.unreadSummary?.total || 0)
        })
      }
    } catch {
      setEditCheckinStatus('Save failed.')
    }
  }

  const handleSubmitReflection = async () => {
    const msg = reflectionMessage.trim()
    if (!msg) { setReflectionError('Please enter your reflection.'); return }
    setReflectionError('')
    setReflectionStatus('Saving...')
    setIsSavingReflection(true)
    try {
      const res = await fetch('/api/member/daily-reflection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg })
      })
      const data = await res.json().catch(() => ({})) as { error?: string }
      if (!res.ok) { setReflectionError(data?.error || 'Could not save your reflection.'); setReflectionStatus(''); return }
      setHasReflectionToday(true)
      setReflectionMessage(msg)
      setEditReflectionMessage(msg)
      setReflectionStatus('Your reflection for today has been saved.')
      const refreshRes = await fetch('/api/member/daily-greeting')
      if (refreshRes.ok) {
        const refreshData = await refreshRes.json() as {
          conversation?: DailyGreetingConversationItem[]
          unreadSummary?: ClassActivityUnreadSummary
        }
        setGreetingConversation(Array.isArray(refreshData?.conversation) ? refreshData.conversation : [])
        setClassActivityUnread({
          checkins: Number(refreshData?.unreadSummary?.checkins || 0),
          reflections: Number(refreshData?.unreadSummary?.reflections || 0),
          total: Number(refreshData?.unreadSummary?.total || 0)
        })
      }
    } catch {
      setReflectionError('Could not save your reflection.')
      setReflectionStatus('')
    } finally {
      setIsSavingReflection(false)
    }
  }

  const handleSaveEditReflection = async () => {
    const msg = editReflectionMessage.trim()
    if (!msg) {
      setEditReflectionStatus('Please enter your reflection.')
      return
    }

    setEditReflectionStatus('Saving...')
    setIsSavingReflection(true)
    try {
      const res = await fetch('/api/member/daily-reflection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg })
      })
      const data = await res.json().catch(() => ({})) as { error?: string }
      if (!res.ok) {
        setEditReflectionStatus(data?.error || 'Save failed.')
        return
      }

      setReflectionMessage(msg)
      setEditReflectionMessage(msg)
      setHasReflectionToday(true)
      setIsEditingReflection(false)
      setEditReflectionStatus('Your reflection has been updated.')

      const refreshRes = await fetch('/api/member/daily-greeting')
      if (refreshRes.ok) {
        const refreshData = await refreshRes.json() as {
          conversation?: DailyGreetingConversationItem[]
          unreadSummary?: ClassActivityUnreadSummary
        }
        setGreetingConversation(Array.isArray(refreshData?.conversation) ? refreshData.conversation : [])
        setClassActivityUnread({
          checkins: Number(refreshData?.unreadSummary?.checkins || 0),
          reflections: Number(refreshData?.unreadSummary?.reflections || 0),
          total: Number(refreshData?.unreadSummary?.total || 0)
        })
      }
    } catch {
      setEditReflectionStatus('Save failed.')
    } finally {
      setIsSavingReflection(false)
    }
  }

  const handleMarkClassActivityRead = async () => {
    if (session?.user?.role !== 'member') {
      return
    }

    try {
      const res = await fetch('/api/member/daily-greeting?markAsRead=1')
      if (!res.ok) {
        return
      }

      const data = await res.json() as {
        conversation?: DailyGreetingConversationItem[]
        unreadSummary?: ClassActivityUnreadSummary
      }

      setGreetingConversation(Array.isArray(data?.conversation) ? data.conversation : [])
      setClassActivityUnread({
        checkins: Number(data?.unreadSummary?.checkins || 0),
        reflections: Number(data?.unreadSummary?.reflections || 0),
        total: Number(data?.unreadSummary?.total || 0)
      })
    } catch {
      // Ignore silent mark-as-read failures.
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        {session?.user?.role === 'member' && memberHomework?.hasActiveCourse && (
          <section className="mb-3 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 sm:px-5 sm:py-3.5">
              <h2 className="text-base font-semibold text-slate-800">Course Progress</h2>
              <span className="text-sm font-bold text-amber-600">{courseProgressPercent}%</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden bg-slate-200">
              <div
                className="h-full rounded-full bg-linear-to-r from-amber-400 to-amber-500 transition-all duration-500"
                style={{
                  width: `${courseProgressPercent}%`
                }}
              />
            </div>
          </section>
        )}

        {session?.user?.role === 'member' && (
          <section className="mb-8 rounded-xl border border-[#14532d]/25 bg-[#14532d]/10 px-4 py-4 sm:px-5 sm:py-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-[2fr_1fr] md:gap-4">
              <div>
                <h2 className="text-base font-bold text-[#14532d] sm:text-lg md:text-xl">
                  Hello {session.user?.name || 'there'}! How are you today?
                </h2>

                {hasGreetingToday ? (
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => {
                        setEditCheckinMessage(greetingMessage)
                        setEditCheckinStatus('')
                        setIsEditingCheckin(true)
                      }}
                      className="rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
                    >
                      Already checked in today. Click here to edit.
                    </button>

                    {isEditingCheckin ? (
                      <div className="mt-3">
                        <textarea
                          value={editCheckinMessage}
                          onChange={(event) => setEditCheckinMessage(event.target.value)}
                          placeholder="Update your check-in..."
                          className="min-h-24 w-full rounded-lg border border-[#14532d]/25 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-[#14532d]"
                          maxLength={500}
                        />
                        <p className="mt-1 text-xs text-slate-500">{editCheckinMessage.trim().length}/500</p>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={handleSaveEditCheckin}
                            className="rounded-md bg-[#14532d] px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-[#166534]"
                          >
                            Save check-in
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setIsEditingCheckin(false)
                              setEditCheckinMessage(greetingMessage)
                              setEditCheckinStatus('')
                            }}
                            className="rounded-md border border-slate-300 bg-white px-4 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                          >
                            Cancel
                          </button>
                        </div>
                        {editCheckinStatus && <p className="mt-2 text-sm font-medium text-[#14532d]">{editCheckinStatus}</p>}
                      </div>
                    ) : (
                      <div className="mt-3 rounded-lg border border-[#14532d]/20 bg-white px-3 py-3 text-sm text-slate-700">
                        <p className="whitespace-pre-wrap">{greetingMessage}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {QUICK_CHECKIN_MESSAGES.map((message) => (
                        <button
                          key={message}
                          type="button"
                          onClick={() => void handleQuickGreetingSubmit(message)}
                          disabled={isSavingGreeting}
                          className="rounded-full border border-[#14532d]/35 bg-white px-3 py-1.5 text-sm font-semibold text-[#14532d] transition hover:bg-[#14532d]/10 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {message}
                        </button>
                      ))}
                    </div>

                    {!showCustomGreetingInput ? (
                      <button
                        type="button"
                        onClick={() => {
                          setShowCustomGreetingInput(true)
                          setGreetingMethod('text')
                          setGreetingStatus('')
                          setGreetingError('')
                        }}
                        className="mt-3 text-xs font-semibold text-[#14532d] hover:underline"
                      >
                        I want to text myself
                      </button>
                    ) : (
                      <>
                        <div className="mt-3">
                          <textarea
                            value={greetingMessage}
                            onChange={(event) => {
                              setGreetingMethod('text')
                              setGreetingMessage(event.target.value)
                            }}
                            placeholder="Share your energy level, wins, or challenge for today..."
                            className="min-h-24 w-full rounded-lg border border-[#14532d]/25 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-[#14532d]"
                            maxLength={500}
                          />
                          <p className="mt-1 text-xs text-slate-500">{greetingMessage.trim().length}/500</p>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setGreetingMethod('voice')
                              startVoiceCapture()
                            }}
                            disabled={!speechSupported || isListening}
                            className="rounded-md border border-amber-300 bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-800 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isListening ? 'Listening...' : 'Voice'}
                          </button>

                          <button
                            type="button"
                            onClick={() => void handleSubmitGreeting()}
                            disabled={isSavingGreeting}
                            className="rounded-md bg-[#14532d] px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-[#166534] disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            {isSavingGreeting ? 'Saving...' : 'Check in'}
                          </button>
                        </div>
                      </>
                    )}

                    {!speechSupported && showCustomGreetingInput && (
                      <p className="mt-2 text-xs font-medium text-amber-700">Voice input is not supported in this browser. Please use text mode.</p>
                    )}
                    {greetingStatus && <p className="mt-2 text-sm font-medium text-[#14532d]">{greetingStatus}</p>}
                    {greetingError && <p className="mt-2 text-sm font-medium text-red-600">{greetingError}</p>}
                  </>
                )}

                {hasGreetingToday && (
                  <div className="mt-5 border-t border-[#14532d]/20 pt-4">
                    <h3 className="text-sm font-bold text-[#14532d] sm:text-base">
                      Hello {session.user?.name || 'there'}! How was your day?
                    </h3>
                    {hasReflectionToday ? (
                      <div className="mt-3">
                        <button
                          type="button"
                          onClick={() => {
                            setEditReflectionMessage(reflectionMessage)
                            setEditReflectionStatus('')
                            setIsEditingReflection(true)
                          }}
                          className="rounded-full border border-violet-300 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700 transition hover:bg-violet-100"
                        >
                          Already reflected today. Click here to edit.
                        </button>

                        {isEditingReflection ? (
                          <div className="mt-3">
                            <textarea
                              value={editReflectionMessage}
                              onChange={(event) => setEditReflectionMessage(event.target.value)}
                              placeholder="Update your reflection..."
                              className="min-h-24 w-full rounded-lg border border-[#14532d]/25 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-[#14532d]"
                              maxLength={1000}
                            />
                            <p className="mt-1 text-xs text-slate-500">{editReflectionMessage.trim().length}/1000</p>
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              <button
                                type="button"
                                onClick={handleSaveEditReflection}
                                disabled={isSavingReflection}
                                className="rounded-md bg-violet-700 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-70"
                              >
                                {isSavingReflection ? 'Saving...' : 'Save reflection'}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setIsEditingReflection(false)
                                  setEditReflectionMessage(reflectionMessage)
                                  setEditReflectionStatus('')
                                }}
                                className="rounded-md border border-slate-300 bg-white px-4 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                              >
                                Cancel
                              </button>
                            </div>
                            {editReflectionStatus && <p className="mt-2 text-sm font-medium text-violet-700">{editReflectionStatus}</p>}
                          </div>
                        ) : (
                          <div className="mt-3 rounded-lg border border-violet-200 bg-white px-3 py-3 text-sm text-slate-700">
                            <p className="whitespace-pre-wrap">{reflectionMessage}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <>
                        <div className="mt-3">
                          <textarea
                            value={reflectionMessage}
                            onChange={(event) => setReflectionMessage(event.target.value)}
                            placeholder="Write your reflection for today..."
                            className="min-h-24 w-full rounded-lg border border-[#14532d]/25 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-[#14532d]"
                            maxLength={1000}
                          />
                          <p className="mt-1 text-xs text-slate-500">{reflectionMessage.trim().length}/1000</p>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={handleSubmitReflection}
                            disabled={isSavingReflection}
                            className="rounded-md bg-violet-700 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            {isSavingReflection ? 'Saving...' : 'Reflect'}
                          </button>
                        </div>
                      </>
                    )}
                    {reflectionStatus && <p className="mt-2 text-sm font-medium text-violet-700">{reflectionStatus}</p>}
                    {reflectionError && <p className="mt-2 text-sm font-medium text-red-600">{reflectionError}</p>}
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-[radial-gradient(circle_at_top,#eff6ff_0%,#ffffff_38%,#faf5ff_100%)] p-3 sm:p-4 shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 sm:text-base">💬 Today&apos;s Class Check-ins & Reflections</h3>
                    {classActivityUnread.total > 0 && (
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                          {classActivityUnread.total} unread
                        </span>
                        <button
                          type="button"
                          onClick={handleMarkClassActivityRead}
                          className="inline-flex items-center rounded-full border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600 transition hover:border-[#14532d]/40 hover:text-[#14532d]"
                        >
                          Mark as read
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
                      <span className="h-2 w-2 rounded-full bg-blue-500" />
                      {classActivitySummary.checkins} check-in
                      {classActivityUnread.checkins > 0 ? ` • ${classActivityUnread.checkins} unread` : ''}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-[11px] font-semibold text-violet-700">
                      <span className="h-2 w-2 rounded-full bg-violet-500" />
                      {classActivitySummary.reflections} reflection
                      {classActivityUnread.reflections > 0 ? ` • ${classActivityUnread.reflections} unread` : ''}
                    </span>
                  </div>
                </div>
                <div className="mt-3 max-h-72 space-y-2.5 overflow-y-auto pr-1 sm:max-h-80">
                  {greetingConversationLoading ? (
                    <p className="text-xs text-slate-500">Loading class activity...</p>
                  ) : greetingConversation.length === 0 ? (
                    <p className="rounded-2xl border border-dashed border-slate-200 bg-white/80 px-4 py-5 text-center text-xs text-slate-500">No check-ins or reflections have been posted by the class yet today.</p>
                  ) : (
                    greetingConversation.map((item) => (
                      <article
                        key={item.id}
                        className={`rounded-2xl border px-3 py-3 text-xs shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md sm:px-4 sm:text-sm ${getActivityBubbleStyle(item)}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ring-4 ${getActivityDotStyle(item)}`}>
                            {item.studentName.trim().charAt(0).toUpperCase() || '?'}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex min-w-0 flex-wrap items-center gap-2">
                                <span className="truncate font-semibold">{item.studentName}</span>
                                {item.inputMethod === 'voice' && item.entryType === 'checkin' && (
                                  <span className="inline-flex items-center rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-medium text-slate-500 ring-1 ring-slate-200 sm:text-[11px]">
                                    Voice
                                  </span>
                                )}
                              </div>
                              <span className="whitespace-nowrap text-[10px] font-medium opacity-70 sm:text-[11px]">
                                {new Date(item.updatedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="mt-1.5 whitespace-pre-wrap text-wrap leading-relaxed">{item.message}</p>
                          </div>
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="mt-5 border-t border-[#14532d]/20 pt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Link
                href="/my-homework"
                className="brand-cta brand-cta-filled w-full justify-center relative"
              >
                {memberHomework && memberHomework.feedbackNoticeCount > 0 && (
                  <span className="absolute -left-2 -top-2 inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-500 px-2 py-1 text-[10px] font-bold text-white shadow-sm">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-3.5 w-3.5"
                      aria-hidden="true"
                    >
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      <path d="M8 9h8" />
                      <path d="M8 13h5" />
                    </svg>
                    <span>{memberHomework.feedbackNoticeCount}</span>
                  </span>
                )}
                <span>My Homework</span>
                <span aria-hidden="true" className="brand-cta-arrow">→</span>
                {memberHomework && Array.isArray(memberHomework.pendingHomework) && memberHomework.pendingHomework.length > 0 && (
                  <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                    {memberHomework.pendingHomework.length}
                  </span>
                )}
              </Link>
              <Link
                href="/dashboard"
                className="brand-cta brand-cta-filled w-full justify-center relative"
              >
                <span>Exercise More</span>
                <span aria-hidden="true" className="brand-cta-arrow">→</span>
                {memberHomework && typeof memberHomework.pendingExercisesCount === 'number' && memberHomework.pendingExercisesCount > 0 && (
                  <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                    {memberHomework.pendingExercisesCount}
                  </span>
                )}
              </Link>
              <Link
                href="/lecture-notes"
                className="brand-cta brand-cta-outline w-full justify-center"
              >
                <span>Lecture Slide</span>
                <span aria-hidden="true" className="brand-cta-arrow">→</span>
              </Link>
            </div>
          </section>
        )}

        {session && session.user?.role !== 'member' && (
          <section className="mb-8 overflow-hidden rounded-2xl border border-[#14532d]/25 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-[#14532d]/20 bg-[#14532d]/10 px-4 py-3">
              <h2 className="text-sm font-bold uppercase tracking-wide text-[#14532d]">Open Courses</h2>
              {availableCourses.length > 0 && (
                <Link href="/courses" className="text-sm font-semibold text-amber-700 hover:underline">
                  View all
                </Link>
              )}
            </div>

            {loadingCourses ? (
              <p className="px-4 py-4 text-sm text-slate-500">Loading courses...</p>
            ) : availableCourses.length === 0 ? (
              <p className="px-4 py-4 text-sm text-slate-500">There are no new courses right now.</p>
            ) : (
              <div className="course-ticker-wrap">
                <div className="course-ticker-track">
                  {tickerCourses.map((course, index) => (
                    <Link
                      key={`${course.id}-${index}`}
                      href="/courses"
                      className="course-ticker-item"
                    >
                      <span className="course-ticker-title">{course.title}</span>
                      <span className="course-ticker-meta">
                        {Math.max(course.maxStudents - course.enrolledCount, 0)} seats left • Register by {new Date(course.registrationDeadline).toLocaleDateString('en-GB')}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {session?.user?.role === 'member' ? (
          <>
            <section>
              <h1 className="sr-only">EnglishMore</h1>
              <div className="rounded-3xl border border-[#14532d]/20 bg-white p-6 shadow-lg sm:p-8">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-[#14532d]">Vocabulary</h2>
                  {memberVocabularyCourseTitle && (
                    <span className="rounded-full bg-[#14532d]/10 px-3 py-1 text-xs font-semibold text-[#14532d]">
                      {memberVocabularyCourseTitle}
                    </span>
                  )}
                </div>

                {memberVocabularyLoading ? (
                  <p className="text-sm text-slate-500">Loading vocabulary...</p>
                ) : memberVocabularyError ? (
                  <p className="text-sm text-red-600">{memberVocabularyError}</p>
                ) : !currentVocabularyItem ? (
                  <p className="text-sm text-slate-500">No vocabulary has been added for your current course yet.</p>
                ) : (
                  <div className="overflow-hidden rounded-2xl bg-linear-to-r from-[#2f8f2e] via-[#14532d] to-[#052e16] px-3 sm:px-4 py-4 sm:py-5 md:px-6 md:py-6 text-white">
                    <div className="mb-3 sm:mb-4 flex items-center justify-between gap-1">
                      <button
                        type="button"
                        onClick={() => moveVocabulary('prev')}
                        disabled={memberVocabularyItems.length <= 1}
                        className="rounded-full px-2 py-1 text-base sm:text-lg font-bold transition hover:bg-white/20 disabled:opacity-50"
                        aria-label="Previous vocabulary"
                      >
                        {'<'}
                      </button>
                      <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2">
                        <button
                          type="button"
                          onClick={() => speakVocabularyWord()}
                          className="inline-flex items-center justify-center rounded-full bg-white/15 p-2 sm:p-3 transition hover:bg-white/25"
                          aria-label="Speak vocabulary"
                        >
                          <svg
                            aria-hidden="true"
                            viewBox="0 0 24 24"
                            className="h-5 w-5 sm:h-6 sm:w-6 fill-current"
                          >
                            <path d="M3 10v4h4l5 4V6L7 10H3zm12.5 2a4.5 4.5 0 0 0-2.18-3.85v7.7A4.5 4.5 0 0 0 15.5 12zm0-8.5v2.06A8.5 8.5 0 0 1 20 12a8.5 8.5 0 0 1-4.5 7.44v2.06A10.49 10.49 0 0 0 22 12 10.49 10.49 0 0 0 15.5 3.5z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={handleTryVocabulary}
                          disabled={!speechSupported || isPronunciationListening}
                          className="inline-flex items-center gap-1 sm:gap-2 rounded-full bg-white/15 px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-white transition hover:bg-white/25 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <svg
                            aria-hidden="true"
                            viewBox="0 0 24 24"
                            className="h-4 w-4 sm:h-5 sm:w-5 fill-current shrink-0"
                          >
                            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.5 14.53 16 12 16s-4.52-1.5-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.063.54-.92 1.14.72 3.44 3.82 5.96 7.81 5.96s7.09-2.52 7.81-5.96c.14-.6-.31-1.14-.92-1.14z" />
                          </svg>
                          <span>{isPronunciationListening ? 'Listening...' : 'Try it'}</span>
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => moveVocabulary('next')}
                        disabled={memberVocabularyItems.length <= 1}
                        className="rounded-full px-2 py-1 text-base sm:text-lg font-bold transition hover:bg-white/20 disabled:opacity-50"
                        aria-label="Next vocabulary"
                      >
                        {'>'}
                      </button>
                    </div>

                    <div className="text-center">
                      <p className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">{currentVocabularyItem.word}</p>
                      <p className="mt-1 sm:mt-2 text-lg sm:text-2xl text-white/90">{currentVocabularyItem.phonetic ? `/${currentVocabularyItem.phonetic}/` : ''}</p>
                      {currentVocabularyItem.englishDefinition && (
                        <p className="mt-2 sm:mt-3 text-xs sm:text-base font-medium text-white/90">{currentVocabularyItem.englishDefinition}</p>
                      )}
                      <p className="mt-3 sm:mt-5 text-base sm:text-2xl font-semibold">{currentVocabularyItem.meaning}</p>
                      {currentVocabularyItem.example && (
                        <p className="mt-2 sm:mt-4 text-xs sm:text-base italic text-white/90">&quot;{currentVocabularyItem.example}&quot;</p>
                      )}

                      {pronunciationStatus && (
                        <p className="mt-3 sm:mt-5 text-xs sm:text-sm font-medium text-white/85">{pronunciationStatus}</p>
                      )}

                      {pronunciationScore !== null && (
                        <div className="mt-3 sm:mt-4 rounded-xl sm:rounded-2xl border border-white/20 bg-white/10 px-3 sm:px-4 py-2 sm:py-3 text-left backdrop-blur-sm text-xs sm:text-sm">
                          {pronunciationTranscript && (
                            <p className="text-white/85">We heard: &quot;{pronunciationTranscript}&quot;</p>
                          )}
                          {pronunciationFeedback && (
                            <p className={`${pronunciationTranscript ? 'mt-1.5 sm:mt-2 ' : ''}font-semibold text-amber-300`}>{pronunciationFeedback}</p>
                          )}
                          <p className="mt-1.5 sm:mt-2 text-[11px] sm:text-xs text-white/70">Score: {pronunciationScore}% (estimated from browser speech recognition)</p>
                        </div>
                      )}

                      {!speechSupported && (
                        <p className="mt-3 sm:mt-4 text-xs text-white/70">Voice practice is not supported in this browser.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </section>
            <section className="mt-6 sm:mt-8 rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 lg:p-8 shadow-lg">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">Weekly Activity</h2>
              <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
                {weeklyActivityRows.map((item) => (
                  <div key={item.day} className="grid grid-cols-[auto_1fr_auto] items-center gap-2 sm:gap-3 md:gap-4">
                    <span className="text-xs sm:text-sm lg:text-base text-slate-600 w-16 sm:w-20">{item.day}</span>
                    <div className="h-3 sm:h-4 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className={`h-full rounded-full ${item.barClass} transition-all duration-500`}
                        style={{ width: `${item.widthPercent}%` }}
                      />
                    </div>
                    <span className="w-12 sm:w-14 text-right text-lg sm:text-xl font-medium text-slate-700">{item.minutes}m</span>
                  </div>
                ))}
              </div>
            </section>
          </>
        ) : (
          <section className="grid gap-6 md:gap-8 md:grid-cols-2 md:items-center">
            <div>
              <h1 className="sr-only">EnglishMore</h1>
              <p className="max-w-xl text-base sm:text-lg text-slate-600">
                Practice makes perfect!
              </p>
              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 sm:gap-4">
                {session?.user?.role !== 'admin' && (
                  <div className="group relative inline-block">
                    <a
                      href="https://www.facebook.com/bangbigbee"
                      target="_blank"
                      rel="noreferrer"
                      className="brand-cta brand-cta-filled"
                    >
                      <span>Get Advice</span>
                      <span aria-hidden="true" className="brand-cta-arrow">→</span>
                    </a>
                    <span className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 w-max -translate-x-1/2 rounded bg-slate-900 px-3 py-2 text-xs text-white opacity-0 shadow transition group-hover:opacity-100">
                      talk directly with the teacher about course content and schedule
                    </span>
                  </div>
                )}
                <Link
                  href={session?.user?.role === 'admin' ? '/admin' : session ? '/courses' : '/login'}
                  className="brand-cta brand-cta-outline"
                >
                  <span>{session?.user?.role === 'admin' ? 'Admin Panel' : session ? 'Enroll Now' : 'Log in'}</span>
                  <span aria-hidden="true" className="brand-cta-arrow">→</span>
                </Link>
                {session?.user?.role === 'admin' && (
                  <Link
                    href="/admin?section=homework"
                    className="brand-cta brand-cta-filled relative"
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
                        <path d="M20 4H4a2 2 0 0 0-2 2v15l4-4h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
                      </svg>
                      <span>{adminHomeworkReview?.unreadStudentMessageCount || 0}</span>
                    </span>
                    <span>Homework Review</span>
                    <span aria-hidden="true" className="brand-cta-arrow">→</span>
                    <span className="absolute -top-2 -right-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
                      {adminHomeworkReview?.pendingTeacherReplyCount || 0}
                    </span>
                  </Link>
                )}
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-lg">
              <img
                src="/uploads/hero.png"
                alt="Study illustration"
                className="h-80 w-full object-cover rounded-2xl"
                onError={(e) => { ;(e.target as HTMLImageElement).style.display = 'none' }}
              />
              <a
                href="https://www.facebook.com/bangbigbee"
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-block text-sm font-semibold text-amber-500 hover:underline"
              >
                Lead teacher: Nguyen Tri Bang
              </a>
            </div>
          </section>
        )}

        {session?.user?.role === 'member' && (
          <section className="mt-8 overflow-hidden rounded-2xl border border-[#14532d]/25 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-[#14532d]/20 bg-[#14532d]/10 px-4 py-3">
              <h2 className="text-sm font-bold uppercase tracking-wide text-[#14532d]">Open Courses</h2>
              {availableCourses.length > 0 && (
                <Link href="/courses" className="text-sm font-semibold text-amber-700 hover:underline">
                  View all
                </Link>
              )}
            </div>

            {loadingCourses ? (
              <p className="px-4 py-4 text-sm text-slate-500">Loading courses...</p>
            ) : availableCourses.length === 0 ? (
              <p className="px-4 py-4 text-sm text-slate-500">There are no new courses right now.</p>
            ) : (
              <div className="course-ticker-wrap">
                <div className="course-ticker-track">
                  {tickerCourses.map((course, index) => (
                    <Link
                      key={`${course.id}-${index}`}
                      href="/courses"
                      className="course-ticker-item"
                    >
                      <span className="course-ticker-title">{course.title}</span>
                      <span className="course-ticker-meta">
                        {Math.max(course.maxStudents - course.enrolledCount, 0)} seats left • Register by {new Date(course.registrationDeadline).toLocaleDateString('en-GB')}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {session?.user?.role !== 'member' && (
          <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900">KHÓA HỌC TIẾNG ANH GIAO TIẾP ENGLISH AND MORE</h2>
            <div className="mt-6 space-y-6 text-slate-700">
              <div>
                <h3 className="text-xl font-semibold text-[#14532d]"><span className="text-[#14532d]">1.</span> Khóa học này dành cho ai?</h3>
                <ul className="mt-3 list-disc space-y-2 pl-5">
                  <li>Sinh viên, người đi làm đã học tiếng Anh nhiều lần nhưng chưa tự tin khi giao tiếp.</li>
                  <li>Những bạn muốn nâng cao khả năng phát âm, thực hành các tình huống thực tế để sử dụng trong giao tiếp, công việc.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-[#14532d]"><span className="text-[#14532d]">2.</span> Khóa học có gì đặc biệt?</h3>
                <ul className="mt-3 list-disc space-y-2 pl-5">
                  <li>Học viên sẽ được rèn luyện phát âm đúng ngay từ đầu để tự tin nghe và nói về sau.</li>
                  <li>Chương trình học không nặng ngữ pháp, tập trung vào giao tiếp nghe - nói hiệu quả, giúp bạn áp dụng ngay vào công việc và cuộc sống. Ngữ pháp sẽ được bổ túc và hoàn thiện song song trong và sau quá trình học.</li>
                  <li>Môi trường rèn luyện liên tục: bên cạnh giờ học trên lớp, bạn sẽ được luyện tập thêm 1-1 với giáo viên để duy trì động lực và đảm bảo đầu ra khóa học.</li>
                  <li>Bên cạnh ngôn ngữ, bạn còn học được kỹ năng giao tiếp, tư duy phát triển bản thân và những kinh nghiệm, trải nghiệm trong nhiều lĩnh vực khác.</li>
                </ul>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => setShowAllCourseDetails((prev) => !prev)}
                  className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-100"
                >
                  {showAllCourseDetails ? 'Thu gọn' : 'Xem thêm'}
                </button>
              </div>

              {showAllCourseDetails && (
                <>
                  <div>
                    <h3 className="text-xl font-semibold text-[#14532d]"><span className="text-[#14532d]">3.</span> Ai là người giảng dạy?</h3>
                    <ul className="mt-3 list-disc space-y-2 pl-5">
                      <li>Thầy Nguyễn Trí Bằng, 7 năm công tác tại Đại học Bách Khoa - ĐH Đà Nẵng trong lĩnh vực khoa học kỹ thuật, làm việc với 03 chương trình đào tạo quốc tế (02 chương trình tiên tiến Việt - Mỹ, chương trình đào tạo Kỹ sư Chất lượng Cao Việt Pháp).</li>
                      <li>5 năm kinh nghiệm dạy tiếng Anh.</li>
                      <li>2 năm kinh nghiệm trong lĩnh vực công nghệ Blockchain.</li>
                      <li>Nhiều năm kinh nghiệm làm việc trong môi trường quốc tế, tham gia các hội nghị và sự kiện tại Singapore, Hàn Quốc, giúp mang đến góc nhìn và trải nghiệm thực tế cho học viên.</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-[#14532d]"><span className="text-[#14532d]">4.</span> Lịch học và thời lượng như thế nào?</h3>
                    <ul className="mt-3 list-disc space-y-2 pl-5">
                      <li>Học trực tuyến qua Zoom, linh hoạt thời gian mà vẫn đảm bảo tương tác như lớp học trực tiếp.</li>
                      <li>02 phiên/tuần, 02 giờ/phiên.</li>
                      <li>Thời lượng: 25-30 phiên.</li>
                      <li>Lịch học dự kiến: Thứ Hai + Thứ Năm, 19:30 - 21:30 (sẽ thống nhất lại vào buổi học đầu tiên).</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-[#14532d]"><span className="text-[#14532d]">5.</span> Học phí</h3>
                    <ul className="mt-3 list-disc space-y-2 pl-5">
                      <li>Toàn bộ khóa học: 4.200.000 VND.</li>
                      <li>Có ưu đãi học phí 10% nếu đăng ký nhóm từ 2 bạn trở lên.</li>
                      <li>Sau phiên học thứ 3, nếu cảm thấy phù hợp với khóa học: chuyển học phí về số tài khoản 19033113602011 - Techcombank - Nguyen Tri Bang.</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-[#14532d]"><span className="text-[#14532d]">6.</span> Tôi chưa từng học tiếng Anh bài bản, có theo kịp không?</h3>
                    <ul className="mt-3 list-disc space-y-2 pl-5">
                      <li>Hoàn toàn có thể. Khóa học được thiết kế cho cả người mới bắt đầu nên bạn sẽ được hướng dẫn từng bước một.</li>
                      <li>Mỗi học viên đều được hỗ trợ thực hành, sửa lỗi 1-1 để tiến bộ nhanh nhất.</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-[#14532d]"><span className="text-[#14532d]">7.</span> Sau khi hoàn thành khóa học này, tôi có thể đạt được những kỹ năng gì?</h3>
                    <ul className="mt-3 list-disc space-y-2 pl-5">
                      <li>Phát âm chuẩn.</li>
                      <li>Tự tin sử dụng tiếng Anh để đọc hiểu tài liệu và giao tiếp cơ bản khi làm việc, phỏng vấn, du lịch nước ngoài, gặp gỡ đối tác quốc tế.</li>
                      <li>Biết giới thiệu bản thân, thuyết trình các bài phát biểu ngắn, giao tiếp các tình huống thường ngày khi đi công tác, trên máy bay, nghỉ dưỡng...</li>
                      <li>Biết được phương pháp học tiếng Anh phù hợp với bản thân để tiếp tục rèn luyện trong tương lai.</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-[#14532d]"><span className="text-[#14532d]">8.</span> Tôi có thể đăng ký và bắt đầu học như thế nào?</h3>
                    <ul className="mt-3 list-disc space-y-2 pl-5">
                      <li>Tham gia khóa học bằng cách điền thông tin vào mẫu bên dưới.</li>
                      <li>Sau khi đăng ký, bạn sẽ được hướng dẫn tham gia lớp và các thông tin liên quan.</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-[#14532d]"><span className="text-[#14532d]">9.</span> Tôi cần chuẩn bị gì khi tham gia khóa học?</h3>
                    <ul className="mt-3 list-disc space-y-2 pl-5">
                      <li>Laptop, máy tính cá nhân có microphone, camera.</li>
                      <li>Internet ổn định.</li>
                      <li>Bút, sổ tay ghi chép.</li>
                      <li>Kênh Youtube để đăng bài tập.</li>
                    </ul>
                  </div>

                  <p className="mt-4 text-sm text-slate-500">
                    Mọi thông tin thêm, vui lòng liên hệ Mr. Nguyễn Trí Bằng qua số điện thoại 0915091093.
                    Hoặc nhắn tin về Facebook:
                    <a href="https://www.facebook.com/bangbigbee" target="_blank" rel="noreferrer" className="ml-1 text-amber-700 hover:underline">https://www.facebook.com/bangbigbee</a>
                  </p>
                </>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

