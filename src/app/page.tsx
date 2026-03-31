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
  const [isListening, setIsListening] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(false)

  useEffect(() => {
    if (!session) {
      setAvailableCourses([])
      setGreetingMessage('')
      setHasGreetingToday(false)
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
        return
      }

      try {
        const res = await fetch('/api/member/daily-greeting')
        if (!res.ok) {
          setGreetingMessage('')
          setHasGreetingToday(false)
          return
        }

        const data = await res.json() as { hasResponse?: boolean; response?: DailyGreetingResponse | null }
        setHasGreetingToday(Boolean(data?.hasResponse))
        setGreetingMessage(data?.response?.message || '')
        if (data?.response?.inputMethod === 'voice' || data?.response?.inputMethod === 'text') {
          setGreetingMethod(data.response.inputMethod)
        }
      } catch {
        setGreetingMessage('')
        setHasGreetingToday(false)
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

    fetchAvailableCourses()
    fetchGreetingResponse()
    fetchMemberHomework()
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
        {session?.user?.role === 'member' && (
          <section className="mb-4 rounded-xl border border-[#14532d]/25 bg-[#14532d]/10 px-4 py-4 sm:px-5">
            <h2 className="text-lg font-extrabold text-[#14532d] sm:text-xl">
              Hello {session.user?.name || 'there'}! How are you today?
            </h2>
            <p className="mt-1 text-sm text-[#14532d]/85">
              Quick check-in helps us track your learning activity and unlock medals later.
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2">
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
                {isSavingGreeting ? 'Saving...' : hasGreetingToday ? 'Update Today Check-in' : 'Submit Check-in'}
              </button>
            </div>

            {!speechSupported && greetingMethod === 'voice' && (
              <p className="mt-2 text-xs font-medium text-amber-700">Voice input is not supported in this browser. Please use text mode.</p>
            )}

            {greetingStatus && <p className="mt-2 text-sm font-medium text-[#14532d]">{greetingStatus}</p>}
            {greetingError && <p className="mt-2 text-sm font-medium text-red-600">{greetingError}</p>}
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
                        Còn {Math.max(course.maxStudents - course.enrolledCount, 0)} chỗ • Hạn đăng ký {new Date(course.registrationDeadline).toLocaleDateString('vi-VN')}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        <section className="grid gap-6 md:gap-8 md:grid-cols-2 md:items-center">
          <div>
            <h1 className="sr-only">EnglishMore</h1>
            <p className="max-w-xl text-base sm:text-lg text-slate-600">
              Practice makes perfect!
            </p>
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 sm:gap-4">
              {session?.user?.role === 'member' ? null : (
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
              )}
              {session?.user?.role === 'member' && (
                <Link
                  href="/my-homework"
                  className="brand-cta brand-cta-outline"
                >
                  <span>My Homework</span>
                  <span aria-hidden="true" className="brand-cta-arrow">→</span>
                </Link>
              )}
              {session?.user?.role === 'member' && (
                <Link
                  href="/lecture-notes"
                  className="brand-cta brand-cta-outline"
                >
                  <span>Lecture Notes</span>
                  <span aria-hidden="true" className="brand-cta-arrow">→</span>
                </Link>
              )}
              <Link
                href={session?.user?.role === 'member' ? '/dashboard' : session?.user?.role === 'admin' ? '/admin' : session ? '/courses' : '/register'}
                className={session?.user?.role === 'member' ? 'brand-cta brand-cta-filled' : 'brand-cta brand-cta-outline'}
              >
                <span>{session?.user?.role === 'member' ? 'Exercise More' : session?.user?.role === 'admin' ? 'Admin Panel' : 'Đăng Ký Học'}</span>
                <span aria-hidden="true" className="brand-cta-arrow">→</span>
              </Link>
            </div>
          </div>
          {session?.user?.role === 'member' ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-lg">
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
            </div>
          ) : (
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
          )}
        </section>

        {session?.user?.role === 'member' && memberHomework?.hasActiveCourse && (
          <section className="mt-8 rounded-2xl border border-amber-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-bold text-slate-900">Tiến độ khóa học</h2>
              <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-800">
                {memberHomework.completedSessions}/{memberHomework.totalSessions} buổi
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-600">{memberHomework.courseTitle}</p>
            <div className="mt-4 h-4 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-linear-to-r from-amber-400 to-amber-500 transition-all duration-500"
                style={{
                  width: `${(Math.min(memberHomework.totalSessions || 30, Math.max(0, memberHomework.completedSessions)) / Math.max(1, memberHomework.totalSessions || 30)) * 100}%`
                }}
              />
            </div>
            <p className="mt-3 text-sm font-medium text-slate-700">
              {Math.round((Math.min(memberHomework.totalSessions || 30, Math.max(0, memberHomework.completedSessions)) / Math.max(1, memberHomework.totalSessions || 30)) * 100)}% lộ trình đã hoàn thành.
            </p>
          </section>
        )}

        {session?.user?.role === 'member' && memberHomework?.hasActiveCourse && (
          <section className="mt-8 rounded-2xl border border-[#14532d]/25 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-[#14532d]">My Homework</h2>
            <p className="mt-2 text-sm text-slate-600">Khóa học: {memberHomework.courseTitle}</p>

            {memberHomework.pendingHomework.length > 0 && (
              <div className="mt-4 homework-alert-wrap rounded border border-amber-300 bg-amber-50">
                <div className="homework-alert-track">
                  <span className="homework-alert-text">
                    You still have {memberHomework.pendingHomework.length} pending homework item(s). Open Dashboard to submit today.
                  </span>
                  <span className="homework-alert-text" aria-hidden="true">
                    You still have {memberHomework.pendingHomework.length} pending homework item(s). Open Dashboard to submit today.
                  </span>
                </div>
              </div>
            )}

            {memberHomework.totalHomework > 0 && memberHomework.submittedHomework === memberHomework.totalHomework ? (
              <p className="mt-4 rounded-lg bg-[#14532d]/10 border border-[#14532d]/30 px-4 py-3 text-[#14532d] font-semibold">
                Tốt lắm, bạn đã hoàn thành tất cả bài tập của mình rồi.
              </p>
            ) : (
              <>
                <p className="mt-4 text-slate-700">
                  Bạn đã nộp <strong>{memberHomework.submittedHomework}</strong> / <strong>{memberHomework.totalHomework}</strong> bài tập.
                </p>
                {memberHomework.pendingHomework.length > 0 && (
                  <ul className="mt-3 space-y-2 text-sm text-slate-700">
                    {memberHomework.pendingHomework.slice(0, 5).map((homework) => (
                      <li key={homework.id} className="rounded border border-amber-200 bg-amber-50 px-3 py-2">
                        {homework.title} - Hạn nộp {new Date(homework.dueDate).toLocaleDateString('vi-VN')}
                      </li>
                    ))}
                  </ul>
                )}
                <Link href="/my-homework" className="mt-4 inline-block rounded bg-[#14532d] px-4 py-2 text-white hover:bg-[#166534]">
                  Go to Homework
                </Link>
              </>
            )}
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

