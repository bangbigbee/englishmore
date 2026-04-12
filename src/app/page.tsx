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
          'group-focus-visible:ring-2 group-focus-visible:ring-[#14532d]/30 group-focus-visible:ring-offset-2'
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

      <div className="pointer-events-none invisible absolute left-1/2 top-full z-20 mt-2 w-[min(18rem,calc(100vw-2rem))] -translate-x-1/2 rounded-lg border border-[#14532d]/15 bg-white px-4 py-3 text-center text-xs leading-relaxed text-slate-600 opacity-0 shadow-xl transition duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
        <Link
          href="/courses"
          className="pointer-events-auto font-semibold text-[#14532d] underline decoration-[#14532d]/45 underline-offset-2 transition hover:text-[#0f3f22]"
        >
          Đăng ký
        </Link>{' '}
        học viên để mở tính năng này.
      </div>
    </div>
  )
}

function HomeContent() {
  const { data: session } = useSession()
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
  const [activeNews, setActiveNews] = useState<any[]>([])
  const [courseReviews, setCourseReviews] = useState<any[]>([])
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
        color: 'from-emerald-500 to-teal-600',
        textColor: 'text-emerald-700',
        bgColor: 'bg-emerald-50',
        daysLeft: diffDays
      }
    } else if (diffDays >= ebDays) {
      return {
        name: 'Early Bird',
        discount: ebDiscount,
        label: 'Tiết kiệm ngay',
        color: 'from-blue-500 to-indigo-600',
        textColor: 'text-blue-700',
        bgColor: 'bg-blue-50',
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
      return 'border-amber-200 bg-amber-50/95 text-amber-950 shadow-amber-100'
    }

    return 'border-[#14532d]/20 bg-[#14532d]/5 text-[#14532d] shadow-[#14532d]/10'
  }

  const getActivityDotStyle = (item: DailyGreetingConversationItem) => {
    if (item.entryType === 'reflection') {
      return 'bg-amber-500 ring-amber-200'
    }

    return 'bg-[#14532d] ring-[#14532d]/20'
  }

  const availableTopics = useMemo(() => {
    const list = memberVocabularyItems.map((i) => i.topic || 'WarmUp')
    return Array.from(new Set(list))
  }, [memberVocabularyItems])

  useEffect(() => {
    if (availableTopics.length > 0 && (!selectedVocabularyTopic || !availableTopics.includes(selectedVocabularyTopic))) {
      setSelectedVocabularyTopic(availableTopics[0])
      setMemberVocabularyIndex(0)
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
      <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-3 sm:px-6 sm:pt-4 lg:px-8">
        {showRegistrationProcessingTicker && (
          <Link href="/courses" className="block mb-3 overflow-hidden rounded-lg border border-blue-300 bg-blue-50 shadow-sm transition hover:bg-blue-100/70">
            <div className="homework-alert-wrap">
              <div className="homework-alert-track">
                <span className="text-sm font-bold text-blue-700">Please wait a moment while we process your registration.</span>
                <span className="text-sm font-bold text-blue-700">Please wait a moment while we process your registration.</span>
                <span className="text-sm font-bold text-blue-700">Please wait a moment while we process your registration.</span>
              </div>
            </div>
          </Link>
        )}

        {session?.user?.role === 'member' && memberHomework?.hasActiveCourse && (
          <section className="mb-3 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 sm:px-5 sm:py-3.5">
              <h2 className="text-base font-semibold text-slate-800">Course Progress</h2>
              <span className="text-sm font-bold text-[#14532d]">{courseProgressPercent}%</span>
            </div>
            <div className="h-1 w-full overflow-hidden bg-slate-200">
              <div
                className="h-full rounded-full bg-[#14532d] transition-all duration-500"
                style={{
                  width: `${courseProgressPercent}%`
                }}
              />
            </div>
          </section>
        )}

        {canUseDailyActivity && (
          <section className="mb-8 rounded-md border border-[#14532d]/25 bg-linear-to-br from-[#14532d]/8 via-white to-blue-50 px-4 py-4 sm:px-5 sm:py-5">
            {isAdminDailyActivity && (
              <div className="mb-4 rounded-md border border-[#14532d]/20 bg-white/90 px-4 py-3">
                <label className="block text-xs font-semibold uppercase tracking-wide text-[#14532d]">Course for Daily Activity</label>
                <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
                  <select
                    value={selectedAdminDailyActivityCourseId}
                    onChange={(event) => setSelectedAdminDailyActivityCourseId(event.target.value)}
                    className="w-full rounded-lg border border-[#14532d]/25 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-[#14532d] sm:max-w-sm"
                  >
                    <option value="">Choose a course</option>
                    {availableCourses.map((course) => (
                      <option key={course.id} value={course.id}>{course.title}</option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-500">Admin messages will be sent in the selected course context.</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.25fr_1fr] xl:gap-5">
              <div className="space-y-4">
                <article className="checkin-message rounded-lg border border-[#14532d]/25 bg-white px-4 py-4 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-bold text-[#14532d] sm:text-base">How do you feel today?</p>
                  </div>

                  {hasGreetingToday ? (
                    <div className="mt-3 rounded-md border border-[#14532d]/20 bg-[#14532d]/5 px-3 py-2.5">
                      {!isEditingCheckin && (
                        <div className="flex justify-end mb-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditCheckinMessage(greetingMessage)
                              setEditCheckinStatus('')
                              setIsEditingCheckin(true)
                            }}
                            className="text-xs font-medium text-slate-500 hover:text-[#14532d] transition"
                          >
                            ✏️ Edit
                          </button>
                        </div>
                      )}

                      {!isEditingCheckin && greetingMessage && (
                        <p className="rounded-lg bg-white px-3 py-2 text-sm text-slate-700">{greetingMessage}</p>
                      )}

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
                      ) : null}
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
                            className="rounded-full border border-[#14532d]/35 bg-[#14532d]/5 px-2.5 py-1 text-xs font-semibold text-[#14532d] transition hover:bg-[#14532d]/10 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {message}
                          </button>
                        ))}
                      </div>

                      {!showCustomGreetingInput ? (
                        <div className="mt-3">
                          <button
                            type="button"
                            onClick={() => {
                              setShowCustomGreetingInput(true)
                              setGreetingMethod('text')
                              setGreetingStatus('')
                              setGreetingError('')
                            }}
                            className="inline-flex items-center gap-1 text-xs font-normal text-slate-400 transition hover:underline"
                          >
                            ✍️ Type it manually
                          </button>
                        </div>
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
                              onClick={() => void handleSubmitGreeting()}
                              disabled={isSavingGreeting}
                              className="rounded-md bg-[#14532d] px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-[#166534] disabled:cursor-not-allowed disabled:opacity-70"
                            >
                              {isSavingGreeting ? 'Saving...' : 'Check in now'}
                            </button>
                          </div>
                        </>
                      )}
                      {greetingStatus && <p className="mt-2 text-sm font-medium text-[#14532d]">{greetingStatus}</p>}
                      {greetingError && <p className="mt-2 text-sm font-medium text-red-600">{greetingError}</p>}
                    </>
                  )}
                </article>

                <article className={`checkin-message rounded-lg border bg-white px-4 py-4 shadow-sm transition-all ${hasGreetingToday ? 'border-amber-300/60' : 'border-slate-200 opacity-85'}`}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-bold text-amber-800 sm:text-base">How was your day?</p>
                  </div>

                  {!hasGreetingToday ? (
                    <div className="mt-3 rounded-md border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-xs text-slate-500">
                      Complete your check-in first, then reflection opens automatically.
                    </div>
                  ) : hasReflectionToday ? (
                    <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2.5">
                      {!isEditingReflection && (
                        <div className="flex justify-end mb-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditReflectionMessage(reflectionMessage)
                              setEditReflectionStatus('')
                              setIsEditingReflection(true)
                            }}
                            className="text-xs font-medium text-slate-500 hover:text-amber-700 transition"
                          >
                            ✏️ Edit
                          </button>
                        </div>
                      )}

                      {!isEditingReflection && reflectionMessage && (
                        <p className="whitespace-pre-wrap rounded-lg bg-white px-3 py-2 text-sm text-slate-700">{reflectionMessage}</p>
                      )}

                      {isEditingReflection ? (
                        <div className="mt-3">
                          <textarea
                            value={editReflectionMessage}
                            onChange={(event) => setEditReflectionMessage(event.target.value)}
                            placeholder="Update your reflection..."
                            className="min-h-24 w-full rounded-lg border border-amber-300/50 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-amber-500"
                            maxLength={1000}
                          />
                          <p className="mt-1 text-xs text-slate-500">{editReflectionMessage.trim().length}/1000</p>
                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={handleSaveEditReflection}
                              disabled={isSavingReflection}
                              className="rounded-md bg-amber-600 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-70"
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
                          {editReflectionStatus && <p className="mt-2 text-sm font-medium text-amber-700">{editReflectionStatus}</p>}
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {QUICK_REFLECTION_MESSAGES.map((message) => (
                          <button
                            key={message}
                            type="button"
                            onClick={() => void handleQuickReflectionSubmit(message)}
                            disabled={isSavingReflection}
                            className="rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {message}
                          </button>
                        ))}
                      </div>

                      {!showCustomReflectionInput ? (
                        <div className="mt-3">
                          <button
                            type="button"
                            onClick={() => {
                              setShowCustomReflectionInput(true)
                              setReflectionStatus('')
                              setReflectionError('')
                            }}
                            className="inline-flex items-center gap-1 text-xs font-normal text-slate-400 transition hover:underline"
                          >
                            ✍️ Type it manually
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="mt-3">
                            <textarea
                              value={reflectionMessage}
                              onChange={(event) => setReflectionMessage(event.target.value)}
                              placeholder="Write your reflection for today..."
                              className="min-h-24 w-full rounded-lg border border-amber-300/50 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-amber-500"
                              maxLength={1000}
                            />
                            <p className="mt-1 text-xs text-slate-500">{reflectionMessage.trim().length}/1000</p>
                          </div>
                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => void handleSubmitReflection()}
                              disabled={isSavingReflection}
                              className="rounded-md bg-amber-600 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                              {isSavingReflection ? 'Saving...' : 'Reflect now'}
                            </button>
                          </div>
                        </>
                      )}
                      {reflectionStatus && <p className="mt-2 text-sm font-medium text-amber-700">{reflectionStatus}</p>}
                      {reflectionError && (
                        <p className={`mt-2 text-sm font-medium ${reflectionError === REFLECTION_AFTER_5PM_MESSAGE ? 'text-amber-700' : 'text-red-600'}`}>
                          {reflectionError}
                        </p>
                      )}
                    </>
                  )}
                </article>
              </div>

              <div className="rounded-lg border border-[#14532d]/15 bg-linear-to-br from-white via-[#14532d]/3 to-blue-50 p-3 sm:p-4 shadow-[0_10px_30px_rgba(20,83,45,0.08)]">
                <div className="mb-3">
                  <h3 className="text-sm font-bold text-slate-900 sm:text-base">Live Feed</h3>
                </div>
                <div className="mt-3 max-h-72 space-y-2.5 overflow-y-auto pr-1 sm:max-h-80">
                  {greetingConversationLoading ? (
                    <p className="text-xs text-slate-500">Loading class activity...</p>
                  ) : greetingConversation.length === 0 ? (
                    <p className="rounded-lg border border-dashed border-slate-200 bg-white/80 px-4 py-5 text-center text-xs text-slate-500">No check-ins or reflections have been posted by the class yet today.</p>
                  ) : (
                    greetingConversation.map((item) => (
                      <article
                        key={item.id}
                        className={`checkin-message rounded-lg border px-3 py-3 text-xs shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md sm:px-4 sm:text-sm ${getActivityBubbleStyle(item)}`}
                      >
                        <div className="flex items-start gap-3">
                          {item.studentImage ? (
                            <div className={`relative mt-0.5 h-8 w-8 shrink-0 overflow-hidden rounded-full ring-4 ${getActivityDotStyle(item)}`}>
                              <Image src={item.studentImage} alt={item.studentName} fill className="object-cover" />
                            </div>
                          ) : (
                            <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ring-4 ${getActivityDotStyle(item)}`}>
                              {item.studentName.trim().charAt(0).toUpperCase() || '?'}
                            </div>
                          )}
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

            {session?.user?.role === 'member' && (
              <div className="mt-5 border-t border-[#14532d]/20 pt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Link
                  href="/my-homework"
                  className="brand-cta brand-cta-filled w-full justify-center relative"
                >
                  {memberHomework && memberHomework.feedbackNoticeCount > 0 && (
                    <span className="absolute -left-2 -top-2 inline-flex items-center gap-1 rounded-full border border-orange-300 bg-orange-500 px-2 py-1 text-[10px] font-bold text-white shadow-sm">
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
                  <span aria-hidden="true" className="speak-cta-mic-wrap">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="speak-cta-mic">
                      <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.158 3.712 3.712 1.157-1.158a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32l8.4-8.4Z" />
                      <path d="M5.25 5.25a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3V13.5a.75.75 0 0 0-1.5 0v5.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5V8.25a1.5 1.5 0 0 1 1.5-1.5h5.25a.75.75 0 0 0 0-1.5H5.25Z" />
                    </svg>
                  </span>
                  {memberHomework && Array.isArray(memberHomework.pendingHomework) && memberHomework.pendingHomework.length > 0 && (
                    <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                      {memberHomework.pendingHomework.length}
                    </span>
                  )}
                </Link>
                <Link
                  href="/dashboard"
                  className="brand-cta brand-cta-outline w-full justify-center relative"
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
                  href="/toeic-practice"
                  className="brand-cta brand-cta-filled w-full justify-center"
                >
                  <span>Luyện TOEIC</span>
                  <span aria-hidden="true" className="brand-cta-arrow">→</span>
                </Link>
                <Link
                  href="/lecture-notes"
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      localStorage.setItem('lectureNotesLastVisited', Date.now().toString())
                      setHasNewLectureSlide(false)
                    }
                  }}
                  className="brand-cta brand-cta-outline w-full justify-center relative"
                >
                  <span>Lecture Slide</span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 ml-1 inline-block">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                    <line x1="8" y1="21" x2="16" y2="21"></line>
                    <line x1="12" y1="17" x2="12" y2="21"></line>
                  </svg>
                  {hasNewLectureSlide && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-transparent animate-pulse shadow-sm ring-2 ring-white">
                    </span>
                  )}
                </Link>
              </div>
            )}
          </section>
        )}

        {session?.user?.role === 'member' ? (
          <>
            <section>
              <h1 className="sr-only">EnglishMore</h1>
              <div className="rounded-lg border border-[#14532d]/20 bg-white p-6 shadow-lg sm:p-8">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="text-2xl font-bold text-[#14532d]">Vocabulary</h2>
                  {availableTopics.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {availableTopics.map(topic => (
                        <button
                          key={topic}
                          type="button"
                          onClick={() => {
                            setSelectedVocabularyTopic(topic)
                            setMemberVocabularyIndex(0)
                          }}
                          className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                            selectedVocabularyTopic === topic
                              ? 'bg-[#14532d] text-white'
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
                  <div className="overflow-hidden rounded-lg bg-linear-to-r from-[#2f8f2e] via-[#14532d] to-[#052e16] px-3 sm:px-4 py-4 sm:py-5 md:px-6 md:py-6 text-white">
                    <div className="mb-3 sm:mb-4 flex items-center justify-between gap-1">
                      <button
                        type="button"
                        onClick={() => moveVocabulary('prev')}
                        disabled={filteredVocabularyItems.length <= 1}
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
                        disabled={filteredVocabularyItems.length <= 1}
                        className="rounded-full px-2 py-1 text-base sm:text-lg font-bold transition hover:bg-white/20 disabled:opacity-50"
                        aria-label="Next vocabulary"
                      >
                        {'>'}
                      </button>
                    </div>

                    <div className="text-center">
                      <p className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">{currentVocabularyItem.word}</p>
                      <p className="mt-1 sm:mt-2 text-lg sm:text-2xl text-white/90">{formatPhoneticForDisplay(currentVocabularyItem.phonetic)}</p>
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
                        <div className="mt-3 sm:mt-4 rounded-md sm:rounded-lg border border-white/20 bg-white/10 px-3 sm:px-4 py-2 sm:py-3 text-left backdrop-blur-sm text-xs sm:text-sm">
                          {pronunciationTranscript && (
                            <p className="text-white/85">We heard: &quot;{pronunciationTranscript}&quot;</p>
                          )}
                          {pronunciationFeedback && (
                            <p className={`${pronunciationTranscript ? 'mt-1.5 sm:mt-2 ' : ''}font-semibold text-blue-300`}>{pronunciationFeedback}</p>
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
            <section className="mt-6 sm:mt-8 rounded-lg border border-slate-200 bg-white p-4 sm:p-6 lg:p-8 shadow-lg">
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
          <>
            <section className="grid gap-6 md:gap-8 md:grid-cols-2 md:items-center">
              <div>
                <h1 className="sr-only">EnglishMore</h1>
                <p className="max-w-xl text-4xl sm:text-5xl font-extrabold leading-tight tracking-tight" style={{fontFamily: 'var(--font-outfit, sans-serif)'}}>
                  <span className="text-amber-500">Speak</span>{' '}
                  <span className="text-green-900">your mind and more</span>
                </p>
                <p className="mt-3 max-w-xl text-base sm:text-lg font-medium text-[#14532d]">
                  Bạn muốn nói tốt tiếng Anh và học nhiều kĩ năng giao tiếp khác?
                </p>
                {/* Hai button Tư Vấn và Đăng Ký */}
                <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 sm:gap-4">
                  {session?.user?.role !== 'admin' && (
                    <div className="group relative inline-block">
                      <a
                        href="https://www.facebook.com/bangbigbee"
                        target="_blank"
                        rel="noreferrer"
                        className="brand-cta brand-cta-filled"
                      >
                        <span>Tư Vấn Ngay</span>
                        <span aria-hidden="true" className="brand-cta-arrow">→</span>
                      </a>
                      <span className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 w-max -translate-x-1/2 rounded bg-slate-900 px-3 py-2 text-xs text-white opacity-0 shadow transition group-hover:opacity-100">
                        talk directly with the teacher about course content and schedule
                      </span>
                    </div>
                  )}
                  {session?.user?.role === 'admin' ? (
                    <Link
                      href="/admin"
                      className="brand-cta brand-cta-outline"
                    >
                      <span>Admin Panel</span>
                      <span aria-hidden="true" className="brand-cta-arrow">→</span>
                    </Link>
                  ) : session ? (
                    <Link
                      href="/courses"
                      className="brand-cta brand-cta-register"
                    >
                      <span>Đăng Ký</span>
                      <span aria-hidden="true" className="brand-cta-arrow">→</span>
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        openLoginModal('/courses', false, 'Đăng nhập để bắt đầu khóa học của bạn')
                      }}
                      className="brand-cta brand-cta-register"
                    >
                      <span>Đăng Ký</span>
                      <span aria-hidden="true" className="brand-cta-arrow">→</span>
                    </button>
                  )}
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
                {/* Câu hỏi TOEIC và button Luyện TOEIC */}
                <div className="mt-6">
                  <p className="max-w-xl text-base sm:text-lg font-medium text-[#14532d] mb-4">
                    Hoặc luyện thi lấy chứng chỉ TOEIC?
                  </p>
                  <Link
                    href="/toeic-practice"
                    className="brand-cta brand-cta-outline"
                  >
                    <span>Luyện TOEIC</span>
                    <span aria-hidden="true" className="brand-cta-arrow">→</span>
                  </Link>
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-6 sm:p-8 shadow-lg">
                <div className="relative w-full h-80 rounded-lg overflow-hidden group bg-gray-50">
                  <img
                    src="/uploads/hero.png"
                    alt="Study illustration"
                    className="absolute inset-0 h-full w-full object-cover z-0"
                    onError={(e) => { ;(e.target as HTMLImageElement).style.display = 'none' }}
                  />
                  {/* <TeacherVideosOverlay /> Tạm thời tắt để tiết kiệm dung lượng Neon */}
                </div>
                <a
                  href="https://www.facebook.com/bangbigbee"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-block text-sm font-semibold text-[#14532d] hover:underline"
                >
                  Lead Teacher: Nguyen Tri Bang - 10 years of teaching experience.
                </a>
              </div>
            </section>

          </>
        )}

        <section className="mt-12 px-1">
          <div className="mb-6">
            <h3 className="text-xl font-bold tracking-tight text-slate-800">Khóa học đang mở đăng ký</h3>
          </div>
          
          <div className="course-ticker-wrap relative -mx-4 overflow-x-auto snap-x snap-mandatory py-4 scroll-smooth">
            <div className="course-ticker-track flex gap-5 px-4" style={{ width: 'max-content' }}>
              {/* Render Available Courses */}
              {availableCourses.map((course) => {
                const isFull = course.maxStudents > 0 && course.enrolledCount >= course.maxStudents
                const availabilityText = isFull ? 'Đã đầy chỗ' : 'Vẫn còn chỗ'
                const courseDetailEntryUrl = `/courses?openCourseId=${encodeURIComponent(course.id)}`
                const registerHref = session 
                  ? courseDetailEntryUrl 
                  : `/?login=true&subtitle=${encodeURIComponent('Cần đăng nhập để tiếp tục quá trình đăng ký')}&callbackUrl=${encodeURIComponent(courseDetailEntryUrl)}`
                const registrationDeadlineDate = new Date(course.registrationDeadline)
                const registrationDeadlineText = Number.isNaN(registrationDeadlineDate.getTime())
                  ? 'Đang cập nhật'
                  : registrationDeadlineDate.toLocaleDateString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })
                const tier = getPromotionTier(course)
                const discountedPrice = course.price * (1 - tier.discount)

                return (
                  <div 
                    key={`course-${course.id}`} 
                    className="group relative flex h-[260px] w-[270px] shrink-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 pb-3 shadow-sm transition-all duration-300 snap-start hover:-translate-y-1 hover:border-[#14532d]/40 hover:shadow-md"
                  >
                    <div className={`absolute -right-12 top-6 w-48 rotate-45 px-4 py-1 text-center text-[10px] font-bold uppercase tracking-widest text-white shadow-sm bg-linear-to-r ${tier.color}`}>
                      {tier.name}
                    </div>

                    <p className="pr-10 text-lg font-extrabold leading-tight text-[#14532d]">{course.title}</p>
                    
                    <p className="mt-1 text-[12px] leading-snug text-slate-600 line-clamp-2">
                      {course.shortDescription || course.description || 'Khóa học tiếng Anh chuyên sâu cùng EnglishMore.'}
                    </p>
                    
                    <div className="mt-auto space-y-2">
                      <div className="border-t border-[#14532d]/10 pt-2">
                        <div className="flex items-baseline gap-2">
                          <span className="text-[14px] font-normal text-slate-900">{formatVND(discountedPrice)}</span>
                          {tier.discount > 0 && (
                            <span className="text-[10px] text-slate-400 line-through">{formatVND(course.price)}</span>
                          )}
                        </div>
                        <div className="mt-1 space-y-0.5">
                          <p className="text-[11px] text-slate-500">Hạn: <span className="font-semibold text-slate-700">{registrationDeadlineText}</span></p>
                          <p className={`text-[11px] font-bold ${isFull ? 'text-red-600' : 'text-[#14532d]'}`}>
                            ● {availabilityText}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-2">
                      <Link
                        href={registerHref}
                        className={`flex w-full items-center justify-center rounded-lg py-2 text-[13px] font-bold transition-all shadow-sm ${isFull ? 'bg-slate-100 text-slate-400 cursor-not-allowed pointer-events-none' : 'bg-[#14532d] text-white hover:bg-[#166534] hover:shadow-md'}`}
                        aria-disabled={isFull}
                      >
                        Đăng Ký
                      </Link>
                    </div>
                  </div>
                )
              })}

              {/* Placeholders if total items < 3 */}
              {Array.from({ length: Math.max(0, 3 - availableCourses.length) }).map((_, i) => (
                <div 
                  key={`placeholder-${i}`} 
                  className="h-[260px] w-[270px] shrink-0 snap-start rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-5 flex flex-col items-center justify-center text-center opacity-60"
                >
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                    <svg className="w-6 h-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                  </div>
                  <p className="text-sm font-medium text-slate-400">Sắp có thêm khóa học mới</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {false && activeNews.length > 0 && (
          <section className="mt-12 px-1">
            <div className="mb-6">
              <h3 className="text-xl font-bold tracking-tight text-[#14532d]">
                Tin Tức
              </h3>
            </div>
            
            <div className="course-ticker-wrap relative -mx-4 overflow-x-auto snap-x snap-mandatory py-4 scroll-smooth">
              <div className="course-ticker-track flex gap-5 px-4" style={{ width: 'max-content' }}>
                {activeNews.map((news) => (
                  <div 
                    key={`news-${news.id}`} 
                    className="group relative flex h-[260px] w-[270px] shrink-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 pb-3 shadow-sm transition-all duration-300 snap-start hover:-translate-y-1 hover:border-[#14532d]/40 hover:shadow-md"
                  >
                    <p className="pr-10 text-lg font-extrabold leading-tight text-slate-800">{news.title}</p>
                    
                    <div className="mt-1 h-[110px] w-full overflow-hidden rounded-lg bg-gray-100 group-hover:bg-gray-50 transition-colors mx-auto shrink-0">
                      {news.imageUrl ? (
                        <img src={news.imageUrl} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-slate-300">
                          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        </div>
                      )}
                    </div>
                    
                    <p className="mt-1 text-[12px] leading-snug text-slate-600 line-clamp-1">
                      {news.description || 'Theo dõi những thông tin mới nhất từ EnglishMore.'}
                    </p>

                    <div className="mt-auto pt-3 border-t border-slate-100">
                      <a
                        href={news.linkUrl || '#'}
                        target={news.linkUrl ? "_blank" : "_self"}
                        rel="noopener noreferrer"
                        className="flex w-full items-center justify-center rounded-lg bg-[#14532d] py-2 text-[13px] font-bold text-white shadow-sm transition-all hover:bg-orange-500 hover:shadow-md"
                      >
                        Xem Thêm
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {false && (
          <section className="mt-12 px-1 pb-12">
            <div className="mb-6 px-3">
              <h3 className="text-lg font-bold tracking-tight text-slate-800">
                Chia sẻ của học viên về <span className="text-[#14532d]">English</span><span className="text-[#ea980c]">More</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-3">
              {courseReviews.length > 0 ? (
                courseReviews.map((review) => (
                  <div key={review.id} className="relative rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group aspect-video sm:aspect-square bg-slate-100">
                    <img
                      src={`/api/course-reviews/images/${review.id}`}
                      alt="Course Review"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                ))
              ) : (
                // Empty placeholders
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={`placeholder-${i}`} className="relative rounded-2xl overflow-hidden border border-dashed border-slate-200 bg-slate-50/50 aspect-video sm:aspect-square flex items-center justify-center">
                    <div className="text-slate-400 font-medium text-sm">Chưa có đánh giá nào</div>
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {/* Gallery Section */}
        <GallerySection />
      </main>

      <AnimatePresence>
        {congratsEnrollment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (typeof window !== 'undefined') {
                  localStorage.setItem(`congratulated_${congratsEnrollment.id}`, '1')
                }
                setCongratsEnrollment(null)
              }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 300, duration: 0.2 }}
              className="relative rounded-lg border border-[#14532d]/40 bg-white shadow-xl p-8 max-w-sm w-full text-center"
            >
              <div className="text-5xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold text-[#14532d] mb-3">Congratulations!</h3>
              <p className="text-gray-700 mb-2">
                You have successfully enrolled in the course
              </p>
              {congratsEnrollment.title && (
                <p className="text-lg font-semibold text-[#14532d] mb-4">
                  &quot;{congratsEnrollment.title}&quot;
                </p>
              )}
              <p className="text-sm text-gray-500 mb-6">
                Your payment has been confirmed by the admin. Welcome to EnglishMore!
              </p>
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    localStorage.setItem(`congratulated_${congratsEnrollment.id}`, '1')
                  }
                  setCongratsEnrollment(null)
                }}
                className="w-full px-4 py-3 bg-[#14532d] text-white rounded-lg font-semibold hover:bg-[#166534]"
              >
                Start learning now
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Global Login Modal is handled in layout via URL parameters */}
    </div>
  )
}

export default function Home() {
  return (
    <Suspense fallback={null}>
      <HomeContent />
    </Suspense>
  )
}


