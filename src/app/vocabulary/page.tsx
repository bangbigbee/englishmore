'use client'

import { signIn, useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { showApToast } from '@/lib/showApToast'
import GallerySection from '@/components/GallerySection'
import TeacherVideosOverlay from '@/components/TeacherVideosOverlay'


interface AvailableCourse {
  id: string
  title: string
  registrationDeadline: string
  enrolledCount: number
  maxStudents: number
  price: number
  sebDiscountPercent: number | null
  ebDiscountPercent: number | null
  sebThresholdDays: number | null
  ebThresholdDays: number | null
  description?: string | null
  shortDescription?: string | null
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
  studentImage?: string | null
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
  topic?: string
  displayOrder: number
  synonyms: string | null
  antonyms: string | null
  collocations: string | null
  toeicTrap: string | null
  mnemonicUrl: string | null
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
const QUICK_REFLECTION_MESSAGES = [
  'Today was productive and meaningful.',
  'I learned something useful and feel more confident.',
  'It was a good day, and I am grateful for the progress.'
] as const
const REFLECTION_AFTER_5PM_MESSAGE = 'You should reflect your day after 5 PM.'

const formatPhoneticForDisplay = (value: string | null | undefined) => {
  const cleaned = String(value || '').trim()
  if (!cleaned) return ''
  if (cleaned.startsWith('/') && cleaned.endsWith('/')) {
    return cleaned
  }
  return `/${cleaned}/`
}

function LockedFeatureButton({
  label,
  variant,
  icon = 'arrow'
}: {
  label: string
  variant: 'filled' | 'outline'
  icon?: 'arrow' | 'mic'
}) {
  return (
    <div className="group relative" tabIndex={0} aria-label={`${label}. Đăng ký học viên để mở tính năng này.`}>
      <div
        className={[
          'brand-cta w-full justify-center cursor-not-allowed opacity-55 grayscale-[0.15]',
          variant === 'outline' ? 'brand-cta-outline' : 'brand-cta-filled',
          'group-focus-visible:ring-2 group-focus-visible:ring-primary-900/30 group-focus-visible:ring-offset-2'
        ].join(' ')}
        aria-hidden="true"
      >
        <span>{label}</span>
        {icon === 'mic' ? (
          <span aria-hidden="true" className="speak-cta-mic-wrap">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="speak-cta-mic"
            >
              <path d="M7 4a3 3 0 0 1 6 0v6a3 3 0 1 1-6 0V4Z" />
              <path d="M5.5 9.643a.75.75 0 0 0-1.5 0V10c0 3.06 2.29 5.585 5.25 5.954V17.5h-1.5a.75.75 0 0 0 0 1.5h4.5a.75.75 0 0 0 0-1.5h-1.5v-1.546A6.001 6.001 0 0 0 16 10v-.357a.75.75 0 0 0-1.5 0V10a4.5 4.5 0 0 1-9 0v-.357Z" />
            </svg>
          </span>
        ) : (
          <span aria-hidden="true" className="brand-cta-arrow">→</span>
        )}
      </div>

      <div className="pointer-events-none invisible absolute left-1/2 top-full z-20 mt-2 w-[min(18rem,calc(100vw-2rem))] -translate-x-1/2 rounded-lg border border-primary-900/15 bg-white px-4 py-3 text-center text-xs leading-relaxed text-slate-600 opacity-0 shadow-xl transition duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
        <Link
          href="/courses"
          className="pointer-events-auto font-semibold text-primary-900 underline decoration-primary-900/45 underline-offset-2 transition hover:text-primary-800"
        >
          Đăng ký
        </Link>{' '}
        học viên để mở tính năng này.
      </div>
    </div>
  )
}

function VocabularyContent() {
  const { data: session, update: updateSession } = useSession()
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  
  const isLoginModalOpen = searchParams.get('login') === 'true'
  const callbackUrl = searchParams.get('callbackUrl') || '/'

  const openLoginModal = (customCallbackUrl?: string, isPractice = false, subtitle?: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('login', 'true')
    if (isPractice) {
      params.set('allowGuest', 'true')
    }
    if (subtitle) {
      params.set('subtitle', subtitle)
    }
    if (customCallbackUrl) {
      params.set('callbackUrl', customCallbackUrl)
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const triggerGoogleSignIn = () => {
    void signIn('google', { callbackUrl: '/' })
  }
  const canUseDailyActivity = session?.user?.role === 'member' || session?.user?.role === 'admin'
  const isPendingMemberRegistration = session?.user?.role === 'user'
  const [availableCourses, setAvailableCourses] = useState<AvailableCourse[]>([])
  const [activeNews, setActiveNews] = useState<Record<string, unknown>[]>([])
  const [courseReviews, setCourseReviews] = useState<Record<string, unknown>[]>([])
  const [hasNewLectureSlide, setHasNewLectureSlide] = useState(false)
  const [memberHomework, setMemberHomework] = useState<MemberHomeworkSummary | null>(null)
  const [adminHomeworkReview, setAdminHomeworkReview] = useState<AdminHomeworkReviewSummary | null>(null)
  const [greetingMethod, setGreetingMethod] = useState<GreetingInputMethod>('text')
  const [greetingMessage, setGreetingMessage] = useState('')
  const [showCustomGreetingInput, setShowCustomGreetingInput] = useState(false)
  const [greetingError, setGreetingError] = useState('')
  const [greetingStatus, setGreetingStatus] = useState('')
  const [hasGreetingToday, setHasGreetingToday] = useState(false)
  const [isSavingGreeting, setIsSavingGreeting] = useState(false)

  const getPromotionTier = (course: AvailableCourse) => {
    const deadline = new Date(course.registrationDeadline)
    const now = new Date()
    const diffTime = deadline.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    const sebDays = course.sebThresholdDays ?? 45
    const ebDays = course.ebThresholdDays ?? 15
    const sebDiscount = (course.sebDiscountPercent ?? 30) / 100
    const ebDiscount = (course.ebDiscountPercent ?? 15) / 100

    if (diffDays > sebDays) {
      return {
        name: 'Super Early Bird',
        discount: sebDiscount,
        label: 'Ưu đãi lớn nhất',
        color: 'from-primary-500 to-primary-600',
        textColor: 'text-primary-700',
        bgColor: 'bg-primary-50',
        daysLeft: diffDays
      }
    } else if (diffDays >= ebDays) {
      return {
        name: 'Early Bird',
        discount: ebDiscount,
        label: 'Tiết kiệm ngay',
        color: 'from-primary-500 to-primary-600',
        textColor: 'text-primary-700',
        bgColor: 'bg-primary-50',
        daysLeft: diffDays
      }
    } else {
      return {
        name: 'Regular',
        discount: 0,
        label: 'Sắp hết hạn',
        color: 'from-slate-400 to-slate-500',
        textColor: 'text-slate-600',
        bgColor: 'bg-slate-50',
        daysLeft: diffDays
      }
    }
  }

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const [isEditingCheckin, setIsEditingCheckin] = useState(false)
  const [editCheckinMessage, setEditCheckinMessage] = useState('')
  const [editCheckinStatus, setEditCheckinStatus] = useState('')
  const [greetingConversationLoading, setGreetingConversationLoading] = useState(false)
  const [, setClassActivityUnread] = useState<ClassActivityUnreadSummary>({ checkins: 0, reflections: 0, total: 0 })
  // Reflection state
  const [reflectionMessage, setReflectionMessage] = useState('')
  const [showCustomReflectionInput, setShowCustomReflectionInput] = useState(false)
  const [reflectionStatus, setReflectionStatus] = useState('')
  const [reflectionError, setReflectionError] = useState('')
  const [hasReflectionToday, setHasReflectionToday] = useState(false)
  const [isSavingReflection, setIsSavingReflection] = useState(false)
  const [isEditingReflection, setIsEditingReflection] = useState(false)
  const [editReflectionMessage, setEditReflectionMessage] = useState('')
  const [editReflectionStatus, setEditReflectionStatus] = useState('')
  const [greetingConversation, setGreetingConversation] = useState<DailyGreetingConversationItem[]>([])
  const [memberVocabularyItems, setMemberVocabularyItems] = useState<MemberVocabularyItem[]>([])
  const [selectedVocabularyTopic, setSelectedVocabularyTopic] = useState<string | null>(null)
  const [memberVocabularyIndex, setMemberVocabularyIndex] = useState(0)
  const [isVocabularyFlipped, setIsVocabularyFlipped] = useState(false)
  const [memberVocabularyLoading, setMemberVocabularyLoading] = useState(false)
  const [memberVocabularyError, setMemberVocabularyError] = useState('')
  const [speechSupported, setSpeechSupported] = useState(false)
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
  const pronunciationRewardAudioRef = useRef<HTMLAudioElement | null>(null)
  const pronunciationRewardAudioPrimedRef = useRef(false)
  const [congratsEnrollment, setCongratsEnrollment] = useState<{ id: string; title: string } | null>(null)
  const [selectedAdminDailyActivityCourseId, setSelectedAdminDailyActivityCourseId] = useState('')

  const isAdminDailyActivity = session?.user?.role === 'admin'

  const showActivityPointToast = (points: number, reason?: string) => {
    showApToast(points, reason)
  }

  const canReflectNow = () => {
    try {
      const parts = new Intl.DateTimeFormat('en-GB', {
        hour: '2-digit',
        hour12: false,
        timeZone: 'Asia/Ho_Chi_Minh'
      }).formatToParts(new Date())
      const hour = Number(parts.find((part) => part.type === 'hour')?.value || '0')
      return hour >= 17
    } catch {
      return new Date().getHours() >= 17
    }
  }

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch('/api/news')
        if (!res.ok) return
        const data = await res.json()
        setActiveNews(data)
      } catch (err) {
        console.error('Error fetching news:', err)
      }
    }

    const fetchAvailableCourses = async () => {
      try {
        const endpoint = session?.user?.role === 'admin' ? '/api/admin/courses' : '/api/courses'
        const res = await fetch(endpoint)
        if (!res.ok) return
        const data = await res.json()
        if (session?.user?.role === 'admin') {
          const adminCourses = Array.isArray(data)
            ? data.map((item) => ({
                id: String(item?.id || ''),
                title: String(item?.title || ''),
                registrationDeadline: String(item?.registrationDeadline || new Date().toISOString()),
                enrolledCount: Number(item?._count?.enrollments || 0),
                maxStudents: Number(item?.maxStudents || 0),
                price: Number(item?.price || 0),
                sebDiscountPercent: item?.sebDiscountPercent ?? null,
                ebDiscountPercent: item?.ebDiscountPercent ?? null,
                sebThresholdDays: item?.sebThresholdDays ?? null,
                ebThresholdDays: item?.ebThresholdDays ?? null,
                description: item?.description ?? null,
                shortDescription: item?.shortDescription ?? null
              }))
            : []
          setAvailableCourses(adminCourses.filter((course) => course.id && course.title))
        } else {
          setAvailableCourses(Array.isArray(data) ? data : [])
        }
      } catch {
        setAvailableCourses([])
      }
    }

    const fetchCourseReviews = async () => {
      try {
        const res = await fetch('/api/course-reviews')
        if (!res.ok) return
        const data = await res.json()
        setCourseReviews(data)
      } catch (err) {
        console.error('Error fetching course reviews:', err)
      }
    }

    void fetchNews()
    void fetchAvailableCourses()
    void fetchCourseReviews()

    const fetchPublicVocabulary = async () => {
      try {
        setMemberVocabularyLoading(true)
        setMemberVocabularyError('')
        const res = await fetch('/api/vocabulary')
        if (!res.ok) {
          setMemberVocabularyItems([])
          setMemberVocabularyError('Could not load the vocabulary data.')
          return
        }

        const data = await res.json()
        const items = Array.isArray(data?.items) ? data.items : []
        setMemberVocabularyItems(items)
        setMemberVocabularyIndex(0)
      } catch {
        setMemberVocabularyItems([])
        setMemberVocabularyError('Could not load the vocabulary data.')
      } finally {
        setMemberVocabularyLoading(false)
      }
    }

    const fetchMemberVocabulary = async () => {
      if (session?.user?.role !== 'member') {
        await fetchPublicVocabulary()
        return
      }

      try {
        setMemberVocabularyLoading(true)
        setMemberVocabularyError('')
        const res = await fetch('/api/member/vocabulary')
        if (!res.ok) {
          setMemberVocabularyItems([])
          setMemberVocabularyError('Could not load the vocabulary data.')
          return
        }

        const data = await res.json()
        const items = Array.isArray(data?.items) ? data.items : []
        setMemberVocabularyItems(items)
        setMemberVocabularyIndex(0)
      } catch {
        setMemberVocabularyItems([])
        setMemberVocabularyError('Could not load the vocabulary data.')
      } finally {
        setMemberVocabularyLoading(false)
      }
    }

    if (!session) {
      void fetchAvailableCourses()
      void fetchPublicVocabulary()
      setAdminHomeworkReview(null)
      setGreetingMessage('')
      setShowCustomGreetingInput(false)
      setHasGreetingToday(false)
      setEditCheckinMessage('')
      setReflectionMessage('')
      setShowCustomReflectionInput(false)
      setHasReflectionToday(false)
      setEditReflectionMessage('')
      setIsEditingReflection(false)
      setEditReflectionStatus('')
      setGreetingConversation([])
      setClassActivityUnread({ checkins: 0, reflections: 0, total: 0 })
      return
    }

    const fetchGreetingResponse = async (showLoading = true) => {
      const hasDailyActivityAccess = session.user?.role === 'member' || session.user?.role === 'admin'
      if (!hasDailyActivityAccess) {
        setGreetingMessage('')
        setHasGreetingToday(false)
        setGreetingConversation([])
        setClassActivityUnread({ checkins: 0, reflections: 0, total: 0 })
        return
      }

      if (session.user?.role === 'admin' && !selectedAdminDailyActivityCourseId) {
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
        const params = new URLSearchParams()
        if (session.user?.role === 'admin' && selectedAdminDailyActivityCourseId) {
          params.set('courseId', selectedAdminDailyActivityCourseId)
        }
        const query = params.toString()
        const res = await fetch(`/api/member/daily-greeting${query ? `?${query}` : ''}`)
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

    const fetchReflection = async () => {
      const hasDailyActivityAccess = session.user?.role === 'member' || session.user?.role === 'admin'
      if (!hasDailyActivityAccess) {
        setHasReflectionToday(false)
        setReflectionMessage('')
        setShowCustomReflectionInput(false)
        setEditReflectionMessage('')
        setIsEditingReflection(false)
        setEditReflectionStatus('')
        return
      }

      if (session.user?.role === 'admin' && !selectedAdminDailyActivityCourseId) {
        setHasReflectionToday(false)
        setReflectionMessage('')
        setShowCustomReflectionInput(false)
        setEditReflectionMessage('')
        setIsEditingReflection(false)
        setEditReflectionStatus('')
        return
      }
      try {
        const params = new URLSearchParams()
        if (session.user?.role === 'admin' && selectedAdminDailyActivityCourseId) {
          params.set('courseId', selectedAdminDailyActivityCourseId)
        }
        const query = params.toString()
        const res = await fetch(`/api/member/daily-reflection${query ? `?${query}` : ''}`)
        if (!res.ok) {
          setHasReflectionToday(false)
          setReflectionMessage('')
          return
        }
        const data = await res.json() as { hasReflection?: boolean; reflection?: { message: string } | null }
        setHasReflectionToday(Boolean(data?.hasReflection))
        setReflectionMessage(data?.reflection?.message || '')
        setShowCustomReflectionInput(false)
        setEditReflectionMessage(data?.reflection?.message || '')
      } catch {
        setHasReflectionToday(false)
        setReflectionMessage('')
        setShowCustomReflectionInput(false)
        setEditReflectionMessage('')
        setIsEditingReflection(false)
        setEditReflectionStatus('')
      }
    }

    const fetchCongratsEnrollment = async () => {
      if (session.user?.role !== 'member') return
      try {
        const res = await fetch('/api/user/enrollments')
        if (!res.ok) return
        const data = await res.json()
        const activeEnrollment = data.find((e: { id: string; status: string; course?: { title: string } }) => e.status === 'active')
        if (activeEnrollment) {
          const key = `congratulated_${activeEnrollment.id}`
          if (typeof window !== 'undefined' && !localStorage.getItem(key)) {
            setCongratsEnrollment({ id: activeEnrollment.id, title: activeEnrollment.course?.title || '' })
          }
        }
      } catch {
        // Ignore errors - congratulations modal is non-critical.
      }
    }

    const fetchLectureNotesStatus = async () => {
      if (session.user?.role !== 'member') return
      try {
        const res = await fetch('/api/member/lecture-notes')
        if (!res.ok) return
        const data = await res.json()
        if (data.hasActiveCourse && data.courses && data.courses.length > 0) {
          const threeDaysAgo = new Date()
          threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
          
          let hasRecent = false
          for (const course of data.courses) {
            for (const note of course.notes) {
              if (new Date(note.updatedAt) > threeDaysAgo) {
                const lastVisited = localStorage.getItem('lectureNotesLastVisited')
                if (!lastVisited || new Date(note.updatedAt).getTime() > parseInt(lastVisited)) {
                  hasRecent = true
                  break
                }
              }
            }
            if (hasRecent) break
          }
          setHasNewLectureSlide(hasRecent)
        }
      } catch {
        setHasNewLectureSlide(false)
      }
    }

    fetchAvailableCourses()
    fetchGreetingResponse()
    fetchMemberHomework()
    fetchAdminHomeworkReview()
    fetchMemberVocabulary()
    fetchReflection()
    fetchCongratsEnrollment()
    fetchLectureNotesStatus()

    const conversationRefreshInterval = window.setInterval(() => {
      fetchGreetingResponse(false)
    }, 25000)

    return () => {
      window.clearInterval(conversationRefreshInterval)
    }
  }, [session, selectedAdminDailyActivityCourseId])

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

  useEffect(() => {
    if (!isAdminDailyActivity) {
      if (selectedAdminDailyActivityCourseId) {
        setSelectedAdminDailyActivityCourseId('')
      }
      return
    }

    if (!selectedAdminDailyActivityCourseId && availableCourses.length > 0) {
      setSelectedAdminDailyActivityCourseId(availableCourses[0].id)
      return
    }

    if (selectedAdminDailyActivityCourseId && !availableCourses.some((course) => course.id === selectedAdminDailyActivityCourseId)) {
      setSelectedAdminDailyActivityCourseId(availableCourses[0]?.id || '')
    }
  }, [availableCourses, isAdminDailyActivity, selectedAdminDailyActivityCourseId])

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
          ? 'bg-secondary-500'
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

  const showRegistrationProcessingTicker = session?.user?.role === 'member' && Boolean(memberHomework) && !memberHomework?.hasActiveCourse

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
      return 'border-secondary-200 bg-secondary-50/95 text-secondary-950 shadow-secondary-100'
    }

    return 'border-primary-900/20 bg-primary-900/5 text-primary-900 shadow-primary-900/10'
  }

  const getActivityDotStyle = (item: DailyGreetingConversationItem) => {
    if (item.entryType === 'reflection') {
      return 'bg-secondary-500 ring-secondary-200'
    }

    return 'bg-primary-900 ring-primary-900/20'
  }

  const availableTopics = useMemo(() => {
    const list = memberVocabularyItems.map((i) => i.topic || 'WarmUp')
    return Array.from(new Set(list))
  }, [memberVocabularyItems])

  useEffect(() => {
    if (availableTopics.length > 0 && (!selectedVocabularyTopic || !availableTopics.includes(selectedVocabularyTopic))) {
      setSelectedVocabularyTopic(availableTopics[0])
      setMemberVocabularyIndex(0)
      setIsVocabularyFlipped(false)
    }
  }, [availableTopics, selectedVocabularyTopic])

  const filteredVocabularyItems = useMemo(() => {
    if (!selectedVocabularyTopic) return memberVocabularyItems
    return memberVocabularyItems.filter((i) => (i.topic || 'WarmUp') === selectedVocabularyTopic)
  }, [memberVocabularyItems, selectedVocabularyTopic])

  const currentVocabularyItem = filteredVocabularyItems.length > 0
    ? filteredVocabularyItems[((memberVocabularyIndex % filteredVocabularyItems.length) + filteredVocabularyItems.length) % filteredVocabularyItems.length]
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

    pronunciationRewardAudioRef.current = new Audio('/audio/amazing-reward-sound.mp3')
    pronunciationRewardAudioRef.current.preload = 'auto'
    pronunciationRewardAudioRef.current.setAttribute('playsinline', 'true')
    pronunciationRewardAudioRef.current.load()

    return () => {
      if (pronunciationDoneAudioRef.current) {
        pronunciationDoneAudioRef.current.pause()
        pronunciationDoneAudioRef.current = null
      }
      if (pronunciationRewardAudioRef.current) {
        pronunciationRewardAudioRef.current.pause()
        pronunciationRewardAudioRef.current = null
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
    if (filteredVocabularyItems.length <= 1) return
    setIsVocabularyFlipped(false)
    setMemberVocabularyIndex((current) => {
      const delta = direction === 'next' ? 1 : -1
      return (current + delta + filteredVocabularyItems.length) % filteredVocabularyItems.length
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

  const playPronunciationRewardChime = () => {
    if (typeof window === 'undefined' || !pronunciationRewardAudioRef.current) {
      return
    }

    try {
      pronunciationRewardAudioRef.current.pause()
      pronunciationRewardAudioRef.current.currentTime = 0
      void pronunciationRewardAudioRef.current.play().catch(() => undefined)
    } catch {
      return
    }
  }

  const primePronunciationDoneChime = async () => {
    if (typeof window === 'undefined' || !pronunciationDoneAudioRef.current || pronunciationDoneAudioPrimedRef.current) {
      return
    }

    try {
      if (pronunciationDoneAudioRef.current && !pronunciationDoneAudioPrimedRef.current) {
        const audio = pronunciationDoneAudioRef.current
        audio.muted = true
        audio.currentTime = 0
        await audio.play()
        audio.pause()
        audio.currentTime = 0
        audio.muted = false
        pronunciationDoneAudioPrimedRef.current = true
      }

      if (pronunciationRewardAudioRef.current && !pronunciationRewardAudioPrimedRef.current) {
        const rewardAudio = pronunciationRewardAudioRef.current
        rewardAudio.muted = true
        rewardAudio.currentTime = 0
        await rewardAudio.play()
        rewardAudio.pause()
        rewardAudio.currentTime = 0
        rewardAudio.muted = false
        pronunciationRewardAudioPrimedRef.current = true
      }
    } catch {
      if (pronunciationDoneAudioRef.current) {
        pronunciationDoneAudioRef.current.muted = false
      }
      if (pronunciationRewardAudioRef.current) {
        pronunciationRewardAudioRef.current.muted = false
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
        
        if (score === 100 && currentVocabularyItem) {
          fetch('/api/vocabulary/pronunciation-reward', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ wordId: currentVocabularyItem.id })
          }).then(res => res.json()).then(data => {
            if (data.awardedAp > 0) {
              playPronunciationRewardChime()
              showActivityPointToast(data.awardedAp, 'for Vocabulary Pronunciation Mastery')
              updateSession?.()
            }
          }).catch(() => undefined)
        }

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

    if (isAdminDailyActivity && !selectedAdminDailyActivityCourseId) {
      setGreetingError('Please choose a course before sending a check-in.')
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
          message: normalizedMessage,
          ...(isAdminDailyActivity && selectedAdminDailyActivityCourseId ? { courseId: selectedAdminDailyActivityCourseId } : {})
        })
      })

      const data = await res.json().catch(() => ({})) as {
        error?: string
        awardedAp?: number
        apRewards?: Array<{ points?: number; reason?: string }>
      }

      if (!res.ok) {
        setGreetingError(data?.error || 'Could not save your check-in. Please try again.')
        setGreetingStatus('')
        return
      }

      const apRewards = Array.isArray(data?.apRewards) ? data.apRewards : []
      if (apRewards.length > 0) {
        for (const reward of apRewards) {
          const points = Number(reward?.points || 0)
          if (points > 0) {
            showActivityPointToast(points, String(reward?.reason || '').trim())
          }
        }
      } else {
        const awardedAp = Number(data?.awardedAp || 0)
        if (awardedAp > 0) {
          showActivityPointToast(awardedAp)
        }
      }

      setHasGreetingToday(true)
      setGreetingMethod(method)
      setGreetingMessage(normalizedMessage)
      setEditCheckinMessage(normalizedMessage)
      setGreetingStatus('Nice. Your check-in for today has been saved.')

      const params = new URLSearchParams()
      if (isAdminDailyActivity && selectedAdminDailyActivityCourseId) {
        params.set('courseId', selectedAdminDailyActivityCourseId)
      }
      const query = params.toString()
      const refreshRes = await fetch(`/api/member/daily-greeting${query ? `?${query}` : ''}`)
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
    await submitGreeting(greetingMessage, 'text')
  }

  const handleQuickGreetingSubmit = async (message: string) => {
    setGreetingMessage(message)
    setGreetingMethod('text')
    await submitGreeting(message, 'text')
  }

  const handleSaveEditCheckin = async () => {
    const msg = editCheckinMessage.trim()
    if (!msg) return
    if (isAdminDailyActivity && !selectedAdminDailyActivityCourseId) {
      setEditCheckinStatus('Please choose a course first.')
      return
    }
    setEditCheckinStatus('Saving...')
    try {
      const res = await fetch('/api/member/daily-greeting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inputMethod: 'text',
          message: msg,
          ...(isAdminDailyActivity && selectedAdminDailyActivityCourseId ? { courseId: selectedAdminDailyActivityCourseId } : {})
        })
      })
      if (!res.ok) { setEditCheckinStatus('Save failed.'); return }
      setGreetingMessage(msg)
      setEditCheckinMessage(msg)
      setEditCheckinStatus('Your check-in has been updated.')
      setIsEditingCheckin(false)
      const params = new URLSearchParams()
      if (isAdminDailyActivity && selectedAdminDailyActivityCourseId) {
        params.set('courseId', selectedAdminDailyActivityCourseId)
      }
      const query = params.toString()
      const refreshRes = await fetch(`/api/member/daily-greeting${query ? `?${query}` : ''}`)
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

  const submitReflection = async (message: string) => {
    const msg = message.trim()
    if (!msg) { setReflectionError('Please enter your reflection.'); return }
    if (!canReflectNow()) {
      setReflectionError(REFLECTION_AFTER_5PM_MESSAGE)
      return
    }
    if (isAdminDailyActivity && !selectedAdminDailyActivityCourseId) {
      setReflectionError('Please choose a course before sending a reflection.')
      return
    }
    setReflectionError('')
    setReflectionStatus('Saving...')
    setIsSavingReflection(true)
    try {
      const res = await fetch('/api/member/daily-reflection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msg,
          ...(isAdminDailyActivity && selectedAdminDailyActivityCourseId ? { courseId: selectedAdminDailyActivityCourseId } : {})
        })
      })
      const data = await res.json().catch(() => ({})) as {
        error?: string
        awardedAp?: number
        apRewards?: Array<{ points?: number; reason?: string }>
      }
      if (!res.ok) { setReflectionError(data?.error || 'Could not save your reflection.'); setReflectionStatus(''); return }

      const apRewards = Array.isArray(data?.apRewards) ? data.apRewards : []
      if (apRewards.length > 0) {
        for (const reward of apRewards) {
          const points = Number(reward?.points || 0)
          if (points > 0) {
            showActivityPointToast(points, String(reward?.reason || '').trim())
          }
        }
      } else {
        const awardedAp = Number(data?.awardedAp || 0)
        if (awardedAp > 0) {
          showActivityPointToast(awardedAp)
        }
      }

      setHasReflectionToday(true)
      setReflectionMessage(msg)
      setEditReflectionMessage(msg)
      setReflectionStatus('Your reflection for today has been saved.')
      const params = new URLSearchParams()
      if (isAdminDailyActivity && selectedAdminDailyActivityCourseId) {
        params.set('courseId', selectedAdminDailyActivityCourseId)
      }
      const query = params.toString()
      const refreshRes = await fetch(`/api/member/daily-greeting${query ? `?${query}` : ''}`)
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

  const handleSubmitReflection = async () => {
    await submitReflection(reflectionMessage)
  }

  const handleQuickReflectionSubmit = async (message: string) => {
    setReflectionMessage(message)
    await submitReflection(message)
  }

  const handleSaveEditReflection = async () => {
    const msg = editReflectionMessage.trim()
    if (!msg) {
      setEditReflectionStatus('Please enter your reflection.')
      return
    }
    if (!canReflectNow()) {
      setEditReflectionStatus(REFLECTION_AFTER_5PM_MESSAGE)
      return
    }
    if (isAdminDailyActivity && !selectedAdminDailyActivityCourseId) {
      setEditReflectionStatus('Please choose a course first.')
      return
    }

    setEditReflectionStatus('Saving...')
    setIsSavingReflection(true)
    try {
      const res = await fetch('/api/member/daily-reflection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msg,
          ...(isAdminDailyActivity && selectedAdminDailyActivityCourseId ? { courseId: selectedAdminDailyActivityCourseId } : {})
        })
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

      const params = new URLSearchParams()
      if (isAdminDailyActivity && selectedAdminDailyActivityCourseId) {
        params.set('courseId', selectedAdminDailyActivityCourseId)
      }
      const query = params.toString()
      const refreshRes = await fetch(`/api/member/daily-greeting${query ? `?${query}` : ''}`)
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main className="mx-auto w-full max-w-4xl px-4 pb-16 pt-8 sm:px-6 sm:pt-12 lg:px-8">
            <section>
              <div className="mb-6 flex items-center justify-between">
                 <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-primary-900 hover:underline">
                    &larr; Về trang chủ
                 </Link>
                 <h1 className="text-xl font-bold text-slate-800">Phòng Từ Vựng</h1>
              </div>
              <div className="rounded-lg border border-primary-900/20 bg-white p-6 shadow-lg sm:p-8">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="text-2xl font-bold text-primary-900">Vocabulary</h2>
                  {availableTopics.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {availableTopics.map(topic => (
                        <button
                          key={topic}
                          type="button"
                          onClick={() => {
                            setSelectedVocabularyTopic(topic)
                            setMemberVocabularyIndex(0)
                            setIsVocabularyFlipped(false)
                          }}
                          className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                            selectedVocabularyTopic === topic
                              ? 'bg-primary-900 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {topic}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {memberVocabularyLoading ? (
                  <p className="text-sm text-slate-500">Loading vocabulary...</p>
                ) : memberVocabularyError ? (
                  <p className="text-sm text-red-600">{memberVocabularyError}</p>
                ) : !currentVocabularyItem ? (
                  <p className="text-sm text-slate-500">No vocabulary has been added for your current course yet.</p>
                ) : (
                  <div className="space-y-4">
                    {/* Controls Row */}
                    <div className="flex items-center justify-between gap-1 rounded-xl bg-slate-100 p-2 border border-slate-200 shadow-sm">
                      <button
                        type="button"
                        onClick={() => moveVocabulary('prev')}
                        disabled={filteredVocabularyItems.length <= 1}
                        className="rounded-lg bg-white shadow-xs px-3 sm:px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 disabled:shadow-none"
                        aria-label="Previous vocabulary"
                      >
                        Prev
                      </button>
                      
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => speakVocabularyWord()}
                          className="inline-flex items-center justify-center rounded-full bg-white shadow-xs p-2.5 text-primary-900 transition hover:bg-primary-50"
                          aria-label="Speak vocabulary"
                          title="Listen to pronunciation"
                        >
                          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                            <path d="M3 10v4h4l5 4V6L7 10H3zm12.5 2a4.5 4.5 0 0 0-2.18-3.85v7.7A4.5 4.5 0 0 0 15.5 12zm0-8.5v2.06A8.5 8.5 0 0 1 20 12a8.5 8.5 0 0 1-4.5 7.44v2.06A10.49 10.49 0 0 0 22 12 10.49 10.49 0 0 0 15.5 3.5z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={handleTryVocabulary}
                          disabled={!speechSupported || isPronunciationListening}
                          className="inline-flex items-center gap-1.5 rounded-full bg-primary-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-current shrink-0">
                            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.5 14.53 16 12 16s-4.52-1.5-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.063.54-.92 1.14.72 3.44 3.82 5.96 7.81 5.96s7.09-2.52 7.81-5.96c.14-.6-.31-1.14-.92-1.14z" />
                          </svg>
                          <span>{isPronunciationListening ? 'Listening...' : 'Practice Voice'}</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => moveVocabulary('next')}
                        disabled={filteredVocabularyItems.length <= 1}
                        className="rounded-lg bg-white shadow-xs px-3 sm:px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 disabled:shadow-none"
                        aria-label="Next vocabulary"
                      >
                        Next
                      </button>
                    </div>

                    {/* Fliping Flashcard */}
                    <div className="relative w-full h-[320px] sm:h-[380px] [perspective:1200px] group">
                      <div 
                        className={`relative h-full w-full rounded-2xl shadow-lg transition-transform duration-500 ease-out [transform-style:preserve-3d] cursor-pointer ${
                          isVocabularyFlipped ? '[transform:rotateY(180deg)]' : ''
                        }`}
                        onClick={() => setIsVocabularyFlipped(!isVocabularyFlipped)}
                      >
                        {/* Front Face */}
                        <div className="absolute inset-0 h-full w-full rounded-2xl [backface-visibility:hidden] bg-linear-to-br from-primary-800 via-primary-900 to-primary-950 p-6 text-white flex flex-col items-center justify-center">
                          <span className="absolute top-4 right-5 text-xs font-semibold uppercase tracking-wider text-white/50 bg-white/10 px-3 py-1 rounded-full pointer-events-none">
                            Tap to flip
                          </span>
                          
                          <p className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight drop-shadow-sm">
                            {currentVocabularyItem.word}
                          </p>
                          
                          <p className="mt-8 text-sm sm:text-base text-white/60 font-medium tracking-wide">
                            Chủ đề: {selectedVocabularyTopic || 'WarmUp'}
                          </p>
                        </div>

                        {/* Back Face */}
                        <div className="absolute inset-0 h-full w-full rounded-2xl [backface-visibility:hidden] [transform:rotateY(180deg)] bg-white border-2 border-primary-900/20 p-5 sm:p-8 text-slate-800 flex flex-col shadow-[inset_0_0_20px_rgba(88, 28, 135,0.02)] overflow-y-auto overflow-x-hidden">
                          <span className="absolute top-4 right-5 text-xs font-semibold uppercase tracking-wider text-primary-900/50 bg-primary-900/5 px-3 py-1 rounded-full pointer-events-none">
                            Tap to flip
                          </span>

                          <div className="flex-1 flex flex-col items-center justify-center text-center w-full">
                            <p className="text-2xl sm:text-3xl font-bold text-primary-900">{currentVocabularyItem.word}</p>
                            <p className="mt-1 text-lg sm:text-xl font-medium text-slate-500">{formatPhoneticForDisplay(currentVocabularyItem.phonetic)}</p>
                            
                            <div className="mt-4 sm:mt-5 mb-4 sm:mb-5 w-12 h-1 bg-primary-900/20 rounded-full mx-auto shrink-0" />
                            
                            <p className="text-xl sm:text-2xl font-bold text-slate-800">{currentVocabularyItem.meaning}</p>
                            {currentVocabularyItem.englishDefinition && (
                              <p className="mt-2 text-sm sm:text-base text-slate-600 font-medium px-2">{currentVocabularyItem.englishDefinition}</p>
                            )}
                            
                            {currentVocabularyItem.example && (
                              <div className="mt-5 sm:mt-6 w-full rounded-xl bg-slate-50 p-4 border border-slate-200 flex-shrink-0 relative overflow-hidden">
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-900/40"></div>
                                <p className="text-sm sm:text-base italic text-slate-700 font-medium text-left px-2">
                                  <span className="font-bold text-primary-900 not-italic mr-2">EX:</span>
                                  {currentVocabularyItem.example}
                                </p>
                              </div>
                            )}

                            {/* PREMIUM FIELDS */}
                            {(currentVocabularyItem.synonyms || currentVocabularyItem.antonyms || currentVocabularyItem.collocations || currentVocabularyItem.toeicTrap) && (
                              <div className="mt-5 w-full flex-shrink-0 text-left space-y-3 border-t border-slate-100 pt-5">
                                {(currentVocabularyItem.synonyms || currentVocabularyItem.antonyms) && (
                                  <div className="text-sm space-y-1.5 px-2">
                                    {currentVocabularyItem.synonyms && <p><span className="font-semibold text-primary-900 inline-flex items-center gap-1"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg> Synonyms:</span> <span className="text-slate-600 font-medium ml-1">{currentVocabularyItem.synonyms}</span></p>}
                                    {currentVocabularyItem.antonyms && <p><span className="font-semibold text-rose-600 inline-flex items-center gap-1"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path></svg> Antonyms:</span> <span className="text-slate-600 font-medium ml-1">{currentVocabularyItem.antonyms}</span></p>}
                                  </div>
                                )}
                                
                                {(currentVocabularyItem.collocations || currentVocabularyItem.toeicTrap) && (() => {
                                  const isUltra = session?.user?.tier === 'ULTRA';
                                  return (
                                    <div className="mt-4 relative rounded-xl border border-secondary-200/60 bg-gradient-to-br from-secondary-50/80 to-orange-50/30 p-4 overflow-hidden shadow-[inset_0_1px_4px_rgba(0,0,0,0.02)]">
                                      {!isUltra && (
                                        <div className="absolute inset-0 z-10 backdrop-blur-[3px] bg-white/40 flex flex-col items-center justify-center p-4 text-center cursor-help transition hover:bg-white/30" title="Cần gói ULTRA để mở khóa">
                                          <div className="bg-gradient-to-b from-white to-secondary-50 shadow-sm border border-secondary-200 rounded-full p-2 mb-2">
                                            <svg className="w-6 h-6 text-secondary-500 drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" /></svg>
                                          </div>
                                          <p className="text-[10px] font-extrabold text-secondary-800 uppercase tracking-widest bg-secondary-100/80 px-2.5 py-1 rounded-sm shadow-xs border border-secondary-200/50">ULTRA REQUIRED</p>
                                          <p className="text-xs font-semibold text-slate-700 mt-2 max-w-[200px]">Unlock TOEIC Traps & premium collocations to secure high score.</p>
                                        </div>
                                      )}
                                      
                                      <div className={`space-y-4 text-sm ${!isUltra ? 'opacity-30 pointer-events-none select-none blur-[2px]' : ''}`}>
                                        {currentVocabularyItem.collocations && (
                                          <div>
                                            <p className="font-bold text-primary-900 flex items-center gap-1.5 mb-1 text-xs uppercase tracking-wider">
                                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                                              Collocations
                                            </p>
                                            <p className="text-slate-700 font-medium pl-5.5">{currentVocabularyItem.collocations}</p>
                                          </div>
                                        )}
                                        {currentVocabularyItem.toeicTrap && (
                                          <div>
                                            <p className="font-bold text-rose-600 flex items-center gap-1.5 mb-1 text-xs uppercase tracking-wider">
                                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                                              TOEIC Trap Alert
                                            </p>
                                            <p className="text-slate-700 font-medium pl-5.5 leading-relaxed bg-white/50 p-2 rounded-lg border border-rose-100">{currentVocabularyItem.toeicTrap}</p>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })()}
                              </div>
                            )}

                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Practice Status */}
                    {(pronunciationStatus || pronunciationScore !== null) && (
                      <div className="rounded-xl bg-primary-50/50 border border-primary-900/20 p-4 transition-all animate-in fade-in slide-in-from-top-2">
                        {pronunciationStatus && (
                          <p className="text-sm font-semibold text-primary-900 mb-1">{pronunciationStatus}</p>
                        )}
                        {pronunciationScore !== null && (
                          <div className="mt-2 space-y-1.5 bg-white/60 rounded-lg p-3 border border-primary-900/10">
                            {pronunciationTranscript && (
                              <p className="text-sm text-slate-700">
                                <span className="text-slate-500 font-medium text-xs uppercase mr-2">We heard:</span>
                                &quot;{pronunciationTranscript}&quot;
                              </p>
                            )}
                            {pronunciationFeedback && (
                              <p className="text-sm font-bold text-primary-900 pt-1">{pronunciationFeedback}</p>
                            )}
                            <div className="flex items-center gap-3 pt-2 border-t border-primary-900/10 mt-2">
                              <span className="text-xs font-semibold text-slate-500">Score:</span>
                              <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full transition-all duration-1000 ${pronunciationScore >= 80 ? 'bg-primary-500' : pronunciationScore >= 50 ? 'bg-secondary-400' : 'bg-red-400'}`}
                                  style={{ width: `${pronunciationScore}%` }} 
                                />
                              </div>
                              <span className="text-xs font-bold text-slate-700 min-w-8 text-right">{pronunciationScore}%</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {!speechSupported && (
                      <p className="mt-2 text-xs text-slate-500 text-center flex items-center justify-center gap-1.5">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-secondary-500"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                        Voice practice is not supported in your browser.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </section>
          </main>
    </div>
  )
}

export default function VocabularyPage() {
  return (
    <Suspense fallback={null}>
      <VocabularyContent />
    </Suspense>
  )
}
