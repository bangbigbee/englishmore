'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

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
  userId: string
  studentName: string
  message: string
  inputMethod: GreetingInputMethod
  updatedAt: string
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
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null
  onerror: ((event: { error: string }) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}

type SpeechRecognitionFactory = new () => BrowserSpeechRecognition

interface MemberHomeworkSummary {
  hasActiveCourse: boolean
  courseTitle: string
  completedSessions: number
  totalSessions: number
  totalHomework: number
  submittedHomework: number
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

const WEEK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const

export default function Home() {
  const { data: session } = useSession()
  const [availableCourses, setAvailableCourses] = useState<AvailableCourse[]>([])
  const [memberHomework, setMemberHomework] = useState<MemberHomeworkSummary | null>(null)
  const [loadingCourses, setLoadingCourses] = useState(false)
  const [showAllCourseDetails, setShowAllCourseDetails] = useState(false)
  const [greetingMethod, setGreetingMethod] = useState<GreetingInputMethod>('text')
  const [greetingMessage, setGreetingMessage] = useState('')
  const [greetingError, setGreetingError] = useState('')
  const [greetingStatus, setGreetingStatus] = useState('')
  const [hasGreetingToday, setHasGreetingToday] = useState(false)
  const [isSavingGreeting, setIsSavingGreeting] = useState(false)
  const [greetingConversationLoading, setGreetingConversationLoading] = useState(false)
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

  useEffect(() => {
    if (!session) {
      setAvailableCourses([])
      setGreetingMessage('')
      setHasGreetingToday(false)
      setGreetingConversation([])
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

    const fetchGreetingResponse = async () => {
      if (session.user?.role !== 'member') {
        setGreetingMessage('')
        setHasGreetingToday(false)
        setGreetingConversation([])
        return
      }

      try {
        setGreetingConversationLoading(true)
        const res = await fetch('/api/member/daily-greeting')
        if (!res.ok) {
          setGreetingMessage('')
          setHasGreetingToday(false)
          setGreetingConversation([])
          return
        }

        const data = await res.json() as {
          hasResponse?: boolean
          response?: DailyGreetingResponse | null
          conversation?: DailyGreetingConversationItem[]
        }
        setHasGreetingToday(Boolean(data?.hasResponse))
        setGreetingMessage(data?.response?.message || '')
        setGreetingConversation(Array.isArray(data?.conversation) ? data.conversation : [])
        if (data?.response?.inputMethod === 'voice' || data?.response?.inputMethod === 'text') {
          setGreetingMethod(data.response.inputMethod)
        }
      } catch {
        setGreetingMessage('')
        setHasGreetingToday(false)
        setGreetingConversation([])
      } finally {
        setGreetingConversationLoading(false)
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
          setMemberVocabularyError('Không thể tải dữ liệu vocabulary')
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
        setMemberVocabularyError('Không thể tải dữ liệu vocabulary')
      } finally {
        setMemberVocabularyLoading(false)
      }
    }

    fetchAvailableCourses()
    fetchGreetingResponse()
    fetchMemberHomework()
    fetchMemberVocabulary()
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
    const maxMinutes = Math.max(1, ...data.map((item) => item.minutes))

    return data.map((item) => {
      const ratio = item.minutes / maxMinutes
      const barClass = item.minutes === 0
        ? 'bg-slate-300'
        : item.minutes <= 15
          ? 'bg-amber-500'
          : 'bg-[#4db463]'

      return {
        ...item,
        widthPercent: Math.max(item.minutes > 0 ? 16 : 0, Math.round(ratio * 100)),
        barClass
      }
    })
  }, [memberHomework])

  const checkinBubbleStyles = [
    'bg-blue-50 text-blue-900 border-blue-200',
    'bg-emerald-50 text-emerald-900 border-emerald-200',
    'bg-amber-50 text-amber-900 border-amber-200',
    'bg-violet-50 text-violet-900 border-violet-200',
    'bg-rose-50 text-rose-900 border-rose-200',
    'bg-cyan-50 text-cyan-900 border-cyan-200'
  ]

  const getCheckinBubbleStyle = (userId: string) => {
    const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return checkinBubbleStyles[hash % checkinBubbleStyles.length]
  }

  const startVoiceCapture = () => {
    if (typeof window === 'undefined') {
      setGreetingError('Trinh duyet khong ho tro voice input.')
      return
    }

    const win = window as Window & {
      SpeechRecognition?: SpeechRecognitionFactory
      webkitSpeechRecognition?: SpeechRecognitionFactory
    }

    const RecognitionCtor = win.SpeechRecognition || win.webkitSpeechRecognition
    if (!RecognitionCtor) {
      setGreetingError('Trinh duyet khong ho tro voice input.')
      return
    }

    setGreetingError('')
    setGreetingStatus('Dang nghe... Hay noi cau tra loi cua ban.')
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
        setGreetingStatus('Da ghi nhan voice input. Ban co the sua lai text truoc khi gui.')
      }
    }

    recognition.onerror = () => {
      setGreetingError('Khong the nhan voice luc nay. Vui long thu lai hoac chuyen sang text.')
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
  }, [currentVocabularyItem?.id])

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
      setPronunciationFeedback('Trình duyệt này chưa hỗ trợ voice practice.')
      setPronunciationScore(null)
      return
    }

    setPronunciationStatus('Listening... Say the word clearly now.')
    setPronunciationFeedback('')
    setPronunciationTranscript('')
    setPronunciationScore(null)
    setIsPronunciationListening(true)

    const recognition = new RecognitionCtor()
    recognition.lang = 'en-US'
    recognition.interimResults = false
    recognition.continuous = false

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result?.[0]?.transcript || '')
        .join(' ')
        .trim()

      const { candidate, score } = getBestPronunciationCandidate(currentVocabularyItem.word, transcript)
      setPronunciationTranscript(transcript)
      setPronunciationScore(score)
      setPronunciationFeedback(buildPronunciationFeedback(score, candidate, currentVocabularyItem.word))
      setPronunciationStatus(score >= 80 ? 'Nice work. Keep practicing to make it even cleaner.' : 'Try again and compare your sound with the sample.')
    }

    recognition.onerror = () => {
      setPronunciationStatus('')
      setPronunciationFeedback('Không nhận diện được giọng nói lần này. Hãy thử lại ở nơi yên tĩnh hơn.')
      setPronunciationScore(null)
    }

    recognition.onend = () => {
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

  const handleTryVocabulary = () => {
    if (!currentVocabularyItem) {
      return
    }

    speakVocabularyWord({ startPracticeAfterSpeak: true })
  }

  const handleSubmitGreeting = async () => {
    const normalizedMessage = greetingMessage.trim()
    if (!normalizedMessage) {
      setGreetingError('Vui long nhap noi dung check-in truoc khi gui.')
      return
    }

    setGreetingError('')
    setGreetingStatus('Dang luu check-in...')
    setIsSavingGreeting(true)

    try {
      const res = await fetch('/api/member/daily-greeting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputMethod: greetingMethod,
          message: normalizedMessage
        })
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setGreetingError(data?.error || 'Khong the luu check-in. Vui long thu lai.')
        setGreetingStatus('')
        return
      }

      setHasGreetingToday(true)
      setGreetingStatus('Tuyet voi! Check-in hom nay da duoc luu.')

      const refreshRes = await fetch('/api/member/daily-greeting')
      if (refreshRes.ok) {
        const refreshData = await refreshRes.json() as {
          hasResponse?: boolean
          response?: DailyGreetingResponse | null
          conversation?: DailyGreetingConversationItem[]
        }
        setGreetingConversation(Array.isArray(refreshData?.conversation) ? refreshData.conversation : [])
      }
    } catch {
      setGreetingError('Khong the luu check-in. Vui long thu lai.')
      setGreetingStatus('')
    } finally {
      setIsSavingGreeting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        {session?.user?.role === 'member' && memberHomework?.hasActiveCourse && (
          <section className="mb-3 rounded-xl bg-white shadow-sm overflow-hidden">
            <div className="px-4 py-3 sm:px-5 sm:py-3.5">
              <h2 className="text-base font-semibold text-slate-800">Tiến độ khóa học</h2>
            </div>
            <div className="h-2.5 w-full overflow-hidden bg-slate-200">
              <div
                className="h-full rounded-full bg-linear-to-r from-amber-400 to-amber-500 transition-all duration-500"
                style={{
                  width: `${(Math.min(memberHomework.totalSessions || 30, Math.max(0, memberHomework.completedSessions)) / Math.max(1, memberHomework.totalSessions || 30)) * 100}%`
                }}
              />
            </div>
          </section>
        )}

        {session?.user?.role === 'member' && (
          <section className="mb-4 rounded-xl border border-[#14532d]/25 bg-[#14532d]/10 px-4 py-4 sm:px-5">
            <h2 className="text-lg font-extrabold text-[#14532d] sm:text-xl">
              Hello {session.user?.name || 'there'}! How are you today?
            </h2>
            <p className="mt-1 text-sm text-[#14532d]/85">
              Quick check-in helps us track your learning activity and unlock medals later.
            </p>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-[2fr_1fr]">
              <div>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setGreetingMethod('text')}
                    className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${greetingMethod === 'text' ? 'bg-[#14532d] text-white' : 'border border-[#14532d]/35 bg-white text-[#14532d] hover:bg-[#14532d]/10'}`}
                  >
                    Text
                  </button>
                  <button
                    type="button"
                    onClick={() => setGreetingMethod('voice')}
                    className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${greetingMethod === 'voice' ? 'bg-[#14532d] text-white' : 'border border-[#14532d]/35 bg-white text-[#14532d] hover:bg-[#14532d]/10'}`}
                  >
                    Voice
                  </button>
                  {hasGreetingToday && (
                    <span className="rounded-full border border-emerald-300 bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                      Already checked in today
                    </span>
                  )}
                </div>

                <div className="mt-3">
                  <textarea
                    value={greetingMessage}
                    onChange={(event) => setGreetingMessage(event.target.value)}
                    placeholder="Share your energy level, wins, or challenge for today..."
                    className="min-h-24 w-full rounded-lg border border-[#14532d]/25 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-[#14532d]"
                    maxLength={500}
                  />
                  <p className="mt-1 text-xs text-slate-500">{greetingMessage.trim().length}/500</p>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {greetingMethod === 'voice' && (
                    <button
                      type="button"
                      onClick={startVoiceCapture}
                      disabled={!speechSupported || isListening}
                      className="rounded-md border border-amber-300 bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-800 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isListening ? 'Listening...' : 'Tap to speak'}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleSubmitGreeting}
                    disabled={isSavingGreeting}
                    className="rounded-md bg-[#14532d] px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-[#166534] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isSavingGreeting ? 'Saving...' : 'Check in'}
                  </button>
                </div>

                {!speechSupported && greetingMethod === 'voice' && (
                  <p className="mt-2 text-xs font-medium text-amber-700">Voice input is not supported in this browser. Please use text mode.</p>
                )}

                {greetingStatus && <p className="mt-2 text-sm font-medium text-[#14532d]">{greetingStatus}</p>}
                {greetingError && <p className="mt-2 text-sm font-medium text-red-600">{greetingError}</p>}
              </div>

              <div className="rounded-lg border border-[#14532d]/30 bg-linear-to-br from-white via-white to-[#14532d]/5 p-4 shadow-sm">
                <h3 className="text-sm font-bold text-[#14532d]">💬 Check-in của lớp hôm nay</h3>
                <div className="mt-3 max-h-56 space-y-2 overflow-y-auto pr-1">
                  {greetingConversationLoading ? (
                    <p className="text-xs text-slate-500">Đang tải hội thoại check-in...</p>
                  ) : greetingConversation.length === 0 ? (
                    <p className="text-xs text-slate-500">Chưa có check-in nào trong lớp hôm nay.</p>
                  ) : (
                    greetingConversation.map((item) => (
                      <article
                        key={item.id}
                        className={`rounded-lg border px-3 py-2.5 text-sm checkin-message shadow-sm transition-all hover:shadow-md ${getCheckinBubbleStyle(item.userId)}`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold">{item.studentName}</span>
                          <span className="text-[11px] opacity-65">{new Date(item.updatedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="mt-1 whitespace-pre-wrap">{item.message}</p>
                      </article>
                    ))
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {session?.user?.role === 'member' && (
          <section className="mb-8 rounded-xl border border-[#14532d]/20 bg-white p-4 shadow-sm sm:p-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Link
                href="/my-homework"
                className="brand-cta brand-cta-outline w-full justify-center relative"
              >
                <span>My Homework</span>
                <span aria-hidden="true" className="brand-cta-arrow">→</span>
                {memberHomework?.pendingHomework && memberHomework.pendingHomework.length > 0 && (
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
                {memberHomework?.pendingExercisesCount && memberHomework.pendingExercisesCount > 0 && (
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
              <h2 className="text-sm font-bold uppercase tracking-wide text-[#14532d]">Khóa học đang mở đăng ký</h2>
              {availableCourses.length > 0 && (
                <Link href="/courses" className="text-sm font-semibold text-amber-700 hover:underline">
                  Xem tất cả
                </Link>
              )}
            </div>

            {loadingCourses ? (
              <p className="px-4 py-4 text-sm text-slate-500">Đang tải khóa học...</p>
            ) : availableCourses.length === 0 ? (
              <p className="px-4 py-4 text-sm text-slate-500">Hiện chưa có khóa học mới.</p>
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
                        {Math.max(course.maxStudents - course.enrolledCount, 0) === 0
                          ? 'Khóa học đã đủ số lượng'
                          : `Còn ${Math.max(course.maxStudents - course.enrolledCount, 0)} chỗ`} • Hạn đăng ký {new Date(course.registrationDeadline).toLocaleDateString('vi-VN')}
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
                  <p className="text-sm text-slate-500">Đang tải vocabulary...</p>
                ) : memberVocabularyError ? (
                  <p className="text-sm text-red-600">{memberVocabularyError}</p>
                ) : !currentVocabularyItem ? (
                  <p className="text-sm text-slate-500">Chưa có từ vựng cho khóa học hiện tại.</p>
                ) : (
                  <div className="overflow-hidden rounded-2xl bg-linear-to-r from-[#2f8f2e] via-[#14532d] to-[#052e16] px-4 py-5 text-white sm:px-6 sm:py-6">
                    <div className="mb-4 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => moveVocabulary('prev')}
                        disabled={memberVocabularyItems.length <= 1}
                        className="rounded-full px-3 py-1 text-lg font-bold transition hover:bg-white/20 disabled:opacity-50"
                        aria-label="Previous vocabulary"
                      >
                        {'<'}
                      </button>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => speakVocabularyWord()}
                          className="inline-flex items-center justify-center rounded-full bg-white/15 p-3 transition hover:bg-white/25"
                          aria-label="Speak vocabulary"
                        >
                          <svg
                            aria-hidden="true"
                            viewBox="0 0 24 24"
                            className="h-6 w-6 fill-current"
                          >
                            <path d="M3 10v4h4l5 4V6L7 10H3zm12.5 2a4.5 4.5 0 0 0-2.18-3.85v7.7A4.5 4.5 0 0 0 15.5 12zm0-8.5v2.06A8.5 8.5 0 0 1 20 12a8.5 8.5 0 0 1-4.5 7.44v2.06A10.49 10.49 0 0 0 22 12 10.49 10.49 0 0 0 15.5 3.5z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={handleTryVocabulary}
                          disabled={!speechSupported || isPronunciationListening}
                          className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/25 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <svg
                            aria-hidden="true"
                            viewBox="0 0 24 24"
                            className="h-5 w-5 fill-current"
                          >
                            <path d="M3 10v4h4l5 4V6L7 10H3zm12.5 2a4.5 4.5 0 0 0-2.18-3.85v7.7A4.5 4.5 0 0 0 15.5 12zm0-8.5v2.06A8.5 8.5 0 0 1 20 12a8.5 8.5 0 0 1-4.5 7.44v2.06A10.49 10.49 0 0 0 22 12 10.49 10.49 0 0 0 15.5 3.5z" />
                          </svg>
                          <span>{isPronunciationListening ? 'Listening...' : 'Try it'}</span>
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => moveVocabulary('next')}
                        disabled={memberVocabularyItems.length <= 1}
                        className="rounded-full px-3 py-1 text-lg font-bold transition hover:bg-white/20 disabled:opacity-50"
                        aria-label="Next vocabulary"
                      >
                        {'>'}
                      </button>
                    </div>

                    <div className="text-center">
                      <p className="text-4xl font-extrabold tracking-tight">{currentVocabularyItem.word}</p>
                      <p className="mt-2 text-2xl">{currentVocabularyItem.phonetic ? `/${currentVocabularyItem.phonetic}/` : ''}</p>
                      {currentVocabularyItem.englishDefinition && (
                        <p className="mt-3 text-base font-medium text-white/90 sm:text-lg">{currentVocabularyItem.englishDefinition}</p>
                      )}
                      <p className="mt-5 text-2xl font-semibold">{currentVocabularyItem.meaning}</p>
                      {currentVocabularyItem.example && (
                        <p className="mt-4 text-base italic text-white/90">&quot;{currentVocabularyItem.example}&quot;</p>
                      )}

                      {pronunciationStatus && (
                        <p className="mt-5 text-sm font-medium text-white/85">{pronunciationStatus}</p>
                      )}

                      {pronunciationScore !== null && (
                        <div className="mt-4 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-left backdrop-blur-sm">
                          {pronunciationTranscript && (
                            <p className="text-sm text-white/85">We heard: &quot;{pronunciationTranscript}&quot;</p>
                          )}
                          {pronunciationFeedback && (
                            <p className={`${pronunciationTranscript ? 'mt-2 ' : ''}text-sm font-semibold text-amber-300`}>{pronunciationFeedback}</p>
                          )}
                          <p className="mt-2 text-xs text-white/70">Score: {pronunciationScore}% (estimated from browser speech recognition)</p>
                        </div>
                      )}

                      {!speechSupported && (
                        <p className="mt-4 text-xs text-white/70">Voice practice is not supported in this browser.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </section>

            <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-lg sm:p-8">
              <h2 className="text-3xl font-bold text-slate-800">Weekly Activity</h2>
              <div className="mt-6 space-y-4">
                {weeklyActivityRows.map((item) => (
                  <div key={item.day} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 sm:gap-4">
                    <span className="text-lg text-slate-600">{item.day}</span>
                    <div className="h-4 w-28 overflow-hidden rounded-full bg-slate-200 sm:w-32">
                      <div
                        className={`h-full rounded-full ${item.barClass} transition-all duration-500`}
                        style={{ width: `${item.widthPercent}%` }}
                      />
                    </div>
                    <span className="w-16 text-right text-2xl font-medium text-slate-700">{item.minutes} min</span>
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
                <div className="group relative inline-block">
                  <a
                    href="https://www.facebook.com/bangbigbee"
                    target="_blank"
                    rel="noreferrer"
                    className="brand-cta brand-cta-filled"
                  >
                    <span>Tư vấn</span>
                    <span aria-hidden="true" className="brand-cta-arrow">→</span>
                  </a>
                  <span className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 w-max -translate-x-1/2 rounded bg-slate-900 px-3 py-2 text-xs text-white opacity-0 shadow transition group-hover:opacity-100">
                    trao đổi trực tiếp với giáo viên về nội dung học, lịch học
                  </span>
                </div>
                <Link
                  href={session?.user?.role === 'admin' ? '/admin' : session ? '/courses' : '/register'}
                  className="brand-cta brand-cta-outline"
                >
                  <span>{session?.user?.role === 'admin' ? 'Admin Panel' : 'Đăng Ký Học'}</span>
                  <span aria-hidden="true" className="brand-cta-arrow">→</span>
                </Link>
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
                Giáo viên trực tiếp giảng dạy: Nguyễn Trí Bằng
              </a>
            </div>
          </section>
        )}

        {session?.user?.role === 'member' && (
          <section className="mt-8 overflow-hidden rounded-2xl border border-[#14532d]/25 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-[#14532d]/20 bg-[#14532d]/10 px-4 py-3">
              <h2 className="text-sm font-bold uppercase tracking-wide text-[#14532d]">Khóa học đang mở đăng ký</h2>
              {availableCourses.length > 0 && (
                <Link href="/courses" className="text-sm font-semibold text-amber-700 hover:underline">
                  Xem tất cả
                </Link>
              )}
            </div>

            {loadingCourses ? (
              <p className="px-4 py-4 text-sm text-slate-500">Đang tải khóa học...</p>
            ) : availableCourses.length === 0 ? (
              <p className="px-4 py-4 text-sm text-slate-500">Hiện chưa có khóa học mới.</p>
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
                        Còn {Math.max(course.maxStudents - course.enrolledCount, 0)} chỗ • Hạn đăng ký {new Date(course.registrationDeadline).toLocaleDateString('vi-VN')}
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

