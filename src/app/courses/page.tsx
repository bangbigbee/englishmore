'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import LinkifiedText from '@/components/LinkifiedText'

interface Course {
  id: string
  title: string
  description?: string
  price?: number
  currency?: string
  isActive?: boolean
  registrationDeadline: string
  enrolledCount: number
  maxStudents: number
  successfulCount: number
  pendingCount: number
  sebDiscountPercent: number | null
  ebDiscountPercent: number | null
  sebThresholdDays: number | null
  ebThresholdDays: number | null
}

interface Enrollment {
  id: string
  courseId: string
  status: string
  referenceCode?: string | null
  userId?: string
  course?: {
    title?: string
    price?: number
  }
  createdAt: string
}

interface PaymentInstruction {
  bankName: string
  accountNumber: string
  accountName: string
  amount: number
  transferContent: string
}

interface PendingReferralCourse {
  id: string
  title: string
}

interface PendingRegistrationDraft {
  courseId: string
  referrer: string
}

const DEFAULT_COURSE_DESCRIPTION = 'Khóa học giao tiếp thực hành, tối ưu cho người cần dùng tiếng Anh trong học tập và công việc.'

export default function CoursesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [errorModal, setErrorModal] = useState<string | null>(null)
  const [registering, setRegistering] = useState<string | null>(null)
  const [paymentInstruction, setPaymentInstruction] = useState<PaymentInstruction | null>(null)
  const [pendingReferralCourse, setPendingReferralCourse] = useState<PendingReferralCourse | null>(null)
  const [pendingRegistrationDraft, setPendingRegistrationDraft] = useState<PendingRegistrationDraft | null>(null)
  const [referrerInput, setReferrerInput] = useState('')
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      // Force Google sign-in directly
      if (typeof window !== 'undefined') {
        const callbackUrl = `/courses${window.location.search}`
        const googleUrl = `/api/auth/signin/google?callbackUrl=${encodeURIComponent(callbackUrl)}`
        window.location.href = googleUrl
      }
      return
    } else if (status === 'authenticated') {
      if (session?.user?.role === 'admin') {
        router.push('/admin')
        return
      }
      fetchCourses()
      fetchEnrollments()
    }
  }, [status, router, session?.user?.role])

  // Keep enrollment status fresh so the page can react when admin confirms payment.
  useEffect(() => {
    if (status !== 'authenticated' || session?.user?.role === 'admin') {
      return
    }

    const intervalId = window.setInterval(() => {
      void fetchEnrollments()
    }, 10000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [status, session?.user?.role])

  // When admin confirms transfer and enrollment becomes active, return learner to homepage.
  useEffect(() => {
    if (status !== 'authenticated' || session?.user?.role === 'admin') {
      return
    }

    const hasConfirmedEnrollment = enrollments.some((item) => item.status === 'active')
    if (hasConfirmedEnrollment) {
      toast.success('Đăng ký đã được xác nhận. Đang chuyển về trang chủ...')
      router.push('/')
    }
  }, [enrollments, status, session?.user?.role, router])

  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error])

  useEffect(() => {
    if (errorModal) {
      toast.error(errorModal)
      setErrorModal(null)
    }
  }, [errorModal])

  useEffect(() => {
    if (status !== 'authenticated' || loading || session?.user?.role === 'admin') {
      return
    }

    const targetCourseId = typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('openCourseId')
      : null
    
    if (targetCourseId) {
      const targetCourse = courses.find((course) => course.id === targetCourseId)
      if (targetCourse) {
        setExpandedCourseId(targetCourse.id)
        router.replace('/courses')
        return
      }
    }

    // Default to the first available course if nothing is selected yet
    if (!expandedCourseId && courses.length > 0) {
      setExpandedCourseId(courses[0].id)
    }
  }, [status, loading, session?.user?.role, courses, router, expandedCourseId])

  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/courses')
      if (!res.ok) throw new Error('Failed to fetch courses')
      const data = await res.json()
      setCourses(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const fetchEnrollments = async () => {
    try {
      const res = await fetch('/api/user/enrollments')
      if (!res.ok) return
      const data = await res.json()
      setEnrollments(data)
    } catch (err) {
      console.error(err)
    }
  }

  const registerCourse = async (courseId: string, referrer?: string) => {
    try {
      setRegistering(courseId)
      const res = await fetch(`/api/courses/${courseId}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ referrer: referrer || '' })
      })
      const data = await res.json()
      if (!res.ok) {
        setErrorModal(data.error || 'Failed to register')
      } else {
        setError('')
        setErrorModal(null)
        toast.success('Đăng ký thành công. Vui lòng chuyển khoản theo hướng dẫn để được xác nhận.')
        setPaymentInstruction(null)
        setPendingReferralCourse(null)
        setPendingRegistrationDraft(null)
        setReferrerInput('')
        fetchEnrollments()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setRegistering(null)
    }
  }

  const getEnrollmentStatus = (courseId: string) => {
    const enrollment = enrollments.find(e => e.courseId === courseId)
    return enrollment
  }

  // Check if user has any active enrollment (not counting dropped)
  const hasExistingEnrollment = enrollments.some(e => {
    return ['pending', 'active', 'completed', 'suspended'].includes(e.status)
  })

  const getQrUrl = (instruction: PaymentInstruction) =>
    `https://img.vietqr.io/image/TCB-${instruction.accountNumber}-compact2.png` +
    `?amount=${instruction.amount}&addInfo=${encodeURIComponent(instruction.transferContent)}` +
    `&accountName=${encodeURIComponent(instruction.accountName)}`

  const getPromotionTier = (course: Course) => {
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
        bgColor: 'bg-emerald-50'
      }
    } else if (diffDays >= ebDays) {
      return {
        name: 'Early Bird',
        discount: ebDiscount,
        label: 'Tiết kiệm ngay',
        color: 'from-blue-500 to-indigo-600',
        textColor: 'text-blue-700',
        bgColor: 'bg-blue-50'
      }
    } else {
      return {
        name: 'Regular',
        discount: 0,
        label: 'Sắp hết hạn',
        color: 'from-slate-400 to-slate-500',
        textColor: 'text-slate-600',
        bgColor: 'bg-slate-50'
      }
    }
  }

  const getCourseTuition = (course?: Course) => {
    if (typeof course?.price === 'number' && course.price > 0) {
      const tier = getPromotionTier(course)
      return Math.round(course.price * (1 - tier.discount))
    }

    const matchedEnrollment = course ? enrollments.find((item) => item.courseId === course.id) : undefined
    if (typeof matchedEnrollment?.course?.price === 'number' && matchedEnrollment.course.price > 0) {
      // Fallback logic for existing enrollments if needed, but usually we want to preserve the price at time of registration
      // For simplicity, we just return the stored price if available
      return matchedEnrollment.course.price
    }

    return 4200000
  }

  const formatVnd = (amount: number) => `${amount.toLocaleString('vi-VN')} VND`

  const buildInstructionFromEnrollment = (course?: Course): PaymentInstruction => {
    return {
      bankName: 'Techcombank',
      accountNumber: '19033113602011',
      accountName: 'Nguyen Tri Bang',
      amount: getCourseTuition(course),
      transferContent: 'Your Full Name - Phone Number'
    }
  }

  const openPaymentInfo = (course?: Course) => {
    setPendingRegistrationDraft(null)
    setPaymentInstruction(buildInstructionFromEnrollment(course))
  }

  const handleOpenReferral = (course: Course) => {
    setPendingReferralCourse({ id: course.id, title: course.title })
    setPendingRegistrationDraft(null)
    setReferrerInput('')
    setErrorModal(null)
  }

  const openPaymentPreviewForRegistration = (course: Course, referrer: string) => {
    setPendingRegistrationDraft({ courseId: course.id, referrer })
    setPaymentInstruction(buildInstructionFromEnrollment(course))
    setPendingReferralCourse(null)
    setReferrerInput('')
  }

  const confirmRegistrationAfterPaymentReview = async () => {
    if (!pendingRegistrationDraft) {
      setPaymentInstruction(null)
      return
    }

    await registerCourse(pendingRegistrationDraft.courseId, pendingRegistrationDraft.referrer)
  }

  const getAvailabilityText = (course: Course) => (course.enrolledCount >= course.maxStudents ? 'Đã đầy chỗ' : 'Vẫn còn chỗ')

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!session) {
    return null
  }

  return (
    <div className="flex flex-col min-h-screen lg:h-[calc(100vh-84px)] lg:min-h-0 bg-gray-50 lg:overflow-hidden">
      <div className="bg-white shadow-xs border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#14532d]">Available Courses</h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-500">Chọn khóa học bạn muốn tham gia để xem chi tiết và đăng ký.</p>
        </div>
      </div>

      <div className="flex-1 lg:min-h-0 mx-auto max-w-7xl w-full px-4 py-8 sm:px-6 lg:px-8">
        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500">Đang tải danh sách khóa học...</div>
        ) : courses.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500">Chưa có khóa học đang mở.</div>
        ) : (
          <div className="lg:h-full lg:grid lg:grid-cols-[320px_1fr] lg:gap-8 lg:overflow-hidden">
            {/* Sidebar - Course List */}
            <aside className="mb-8 lg:mb-0 lg:h-full lg:overflow-y-auto custom-scrollbar lg:px-2">
              <div className="space-y-3 pb-8">
                <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 px-1">Danh sách khóa học</h2>
                {courses.map((course) => {
                  const isActive = expandedCourseId === course.id
                  const tuition = getCourseTuition(course)
                  const isFull = course.enrolledCount >= course.maxStudents
                  
                  return (
                    <button
                      key={course.id}
                      onClick={() => setExpandedCourseId(course.id)}
                      className={`w-full text-left transition-all duration-300 rounded-xl border p-4 shadow-sm hover:shadow-md ${
                        isActive 
                          ? 'border-[#14532d] bg-linear-to-br from-[#14532d]/10 to-white' 
                          : 'border-slate-200 bg-white hover:border-[#14532d]/30'
                      }`}
                    >
                      <p className={`font-bold leading-tight ${isActive ? 'text-[#14532d]' : 'text-slate-800'}`}>
                        {course.title}
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        {(() => {
                          const tier = getPromotionTier(course)
                          return (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tier.bgColor} ${tier.textColor} border border-current/20`}>
                              {tier.name}
                            </span>
                          )
                        })()}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isFull ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
                        }`}>
                          {isFull ? 'Đã đầy' : 'Còn chỗ'}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </aside>

            {/* Main Content - Course Details */}
            <main className="lg:h-full lg:overflow-y-auto custom-scrollbar pb-12 lg:pr-1">
              {(() => {
                const course = courses.find(c => c.id === expandedCourseId)
                if (!course) return <div className="rounded-xl border-2 border-dashed border-slate-200 p-12 text-center text-slate-400">Chọn một khóa học để xem chi tiết.</div>
                
                const enrollment = getEnrollmentStatus(course.id)
                const isFull = course.enrolledCount >= course.maxStudents
                const blockedByExistingEnrollment = !enrollment && hasExistingEnrollment
                const isPendingPayment = enrollment?.status === 'pending'
                const tuition = getCourseTuition(course)
                const courseCurrency = course.currency || 'VND'
                const registrationDeadlineDate = new Date(course.registrationDeadline)
                const registrationDeadlineText = registrationDeadlineDate.toLocaleDateString('vi-VN', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                })

                return (
                  <div className="course-select-card animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="rounded-[calc(1rem-1.5px)] overflow-hidden bg-white">
                      <div className="px-5 py-6 sm:px-8 sm:py-8 border-b border-slate-100">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                          <div>
                            <h2 className="text-3xl font-extrabold text-[#14532d] leading-tight">{course.title}</h2>
                            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm">
                              <p className="text-slate-600">
                                <strong>Hạn đăng ký:</strong> {registrationDeadlineText}
                              </p>
                              <p className={`font-bold ${isFull ? 'text-red-700' : 'text-emerald-700'}`}>
                                ● {getAvailabilityText(course)}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-xl font-medium text-slate-500">
                              {courseCurrency === 'VND' ? formatVnd(tuition) : `${tuition.toLocaleString('vi-VN')} ${courseCurrency}`}
                            </span>
                            {(() => {
                              const tier = getPromotionTier(course)
                              if (tier.discount > 0 && course.price) {
                                return (
                                  <span className="text-xs text-slate-400 line-through">
                                    {formatVnd(course.price)}
                                  </span>
                                )
                              }
                              return null
                            })()}
                          </div>
                        </div>

                        <div className="mt-8">
                          <button
                            type="button"
                            onClick={() => {
                              if (!isPendingPayment) {
                                handleOpenReferral(course)
                              }
                            }}
                            disabled={
                              isPendingPayment ||
                              registering === course.id ||
                              isFull ||
                              (!getEnrollmentStatus(course.id) && hasExistingEnrollment)
                            }
                            className="w-full sm:w-auto rounded-xl bg-[#14532d] px-10 py-4 text-base font-bold text-white shadow-lg transition hover:bg-[#166534] hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {registering === course.id ? 'Đang đăng ký...' : 'Đăng Ký Ngay'}
                          </button>
                          
                          {isPendingPayment && (
                            <p className="mt-4 text-sm font-semibold text-blue-700 bg-blue-50 border border-blue-200 p-4 rounded-lg">
                              Bạn đã đăng ký khóa học này. Vui lòng chờ admin xác nhận chuyển khoản.
                            </p>
                          )}
                        </div>

                        {enrollment && enrollment.status !== 'pending' && (
                          <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                            <p className="font-bold flex items-center gap-2">
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                              Trạng thái: Đã vào lớp
                            </p>
                            <button
                              onClick={() => openPaymentInfo(course)}
                              className="mt-3 inline-block rounded-lg border border-[#14532d]/30 bg-white px-4 py-2 text-xs font-bold text-[#14532d] hover:bg-[#14532d]/10"
                            >
                              Xem thông tin chuyển khoản
                            </button>
                          </div>
                        )}

                        {blockedByExistingEnrollment && (
                          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                            Bạn đã có khóa học đang xử lý. Vui lòng chờ xác nhận trước khi đăng ký thêm.
                          </div>
                        )}
                        
                        {isFull && !enrollment && (
                            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
                              Khóa học này đã hết chỗ. Hẹn gặp bạn ở khóa sau!
                            </div>
                        )}
                      </div>

                      <div className="px-5 pb-8 pt-4 sm:px-8 sm:pb-10 sm:pt-5 space-y-8">
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-[#14532d] rounded-full"></span>
                            Thông tin chi tiết
                          </h3>
                          <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6">
                            <LinkifiedText text={String(course.description || '').trim() || DEFAULT_COURSE_DESCRIPTION} preserveLineBreaks />
                          </div>
                        </div>

                        {/* Current Offers Section */}
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-emerald-700 rounded-full"></span>
                            Ưu đãi hiện có
                          </h3>
                          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm overflow-hidden relative">
                            {(() => {
                              const tier = getPromotionTier(course)
                              const originalPrice = course.price || 4200000
                              const sebDiscount = (course.sebDiscountPercent ?? 30) / 100
                              const ebDiscount = (course.ebDiscountPercent ?? 15) / 100

                                  const phases = [
                                {
                                  name: 'Super Early Bird',
                                  label: 'Ưu đãi lớn nhất',
                                  price: Math.round(originalPrice * (1 - sebDiscount)),
                                  color: 'emerald',
                                  isActive: tier.name === 'Super Early Bird'
                                },
                                {
                                  name: 'Early Bird',
                                  label: 'Tiết kiệm ngay',
                                  price: Math.round(originalPrice * (1 - ebDiscount)),
                                  color: 'blue',
                                  isActive: tier.name === 'Early Bird'
                                },
                                {
                                  name: 'Regular',
                                  label: 'Giá gốc',
                                  price: originalPrice,
                                  color: 'slate',
                                  isActive: tier.name === 'Regular'
                                }
                              ]

                              return (
                                <div className="space-y-6">
                                  <div className="flex flex-col sm:flex-row gap-4">
                                    {phases.map((phase) => (
                                      <div 
                                        key={phase.name} 
                                        className={`flex-1 rounded-2xl border-2 p-4 transition-all duration-300 ${
                                          phase.isActive 
                                            ? phase.color === 'emerald' ? 'border-emerald-500 bg-emerald-50 ring-4 ring-emerald-500/10 scale-[1.02]' :
                                              phase.color === 'blue' ? 'border-blue-500 bg-blue-50 ring-4 ring-blue-500/10 scale-[1.02]' :
                                              'border-slate-500 bg-slate-50 ring-4 ring-slate-500/10 scale-[1.02]'
                                            : 'border-slate-300 bg-white opacity-60 grayscale-[0.5]'
                                        }`}
                                      >
                                        <div className="flex flex-col h-full justify-between">
                                          <div>
                                            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2 ${
                                              phase.isActive 
                                                ? phase.color === 'emerald' ? 'bg-emerald-500 text-white' :
                                                  phase.color === 'blue' ? 'bg-blue-500 text-white' :
                                                  'bg-slate-500 text-white'
                                                : 'bg-slate-200 text-slate-500'
                                            }`}>
                                              {phase.name}
                                            </span>
                                            <p className={`text-[10px] font-bold ${phase.isActive ? 'text-slate-600' : 'text-slate-400'}`}>
                                              {phase.label}
                                            </p>
                                          </div>
                                          <p className={`mt-3 text-lg font-black ${
                                            phase.isActive 
                                              ? phase.color === 'emerald' ? 'text-emerald-700' :
                                                phase.color === 'blue' ? 'text-blue-700' :
                                                'text-slate-700'
                                              : 'text-slate-400'
                                          }`}>
                                            {formatVnd(phase.price)}
                                          </p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>

                                  {tier.name !== 'Regular' && (
                                    <div className="rounded-xl bg-blue-50 border border-blue-100 p-3 flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                                        <p className="text-sm font-bold text-blue-800">Giai đoạn hiện tại: {tier.name}</p>
                                      </div>
                                      <p className="text-sm font-black text-[#14532d]">
                                        TIẾT KIỆM: {formatVnd(originalPrice - Math.round(originalPrice * (1 - tier.discount)))}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              )
                            })()}
                          </div>
                        </div>

                        <div className="pt-6 border-t border-slate-100">
                          <p className="text-sm text-slate-600 leading-relaxed">
                            Mọi thông tin thêm, vui lòng liên hệ <strong>Mr. Nguyễn Trí Bằng</strong> qua số điện thoại <a href="tel:0915091093" className="text-[#14532d] hover:underline font-semibold">0915091093</a>. 
                            Hoặc nhắn tin về Facebook:
                            <a href="https://www.facebook.com/bangbigbee" target="_blank" rel="noreferrer" className="block mt-2 font-medium text-[#14532d] hover:underline">facebook.com/bangbigbee</a>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })()}
            </main>
          </div>
        )}

        <AnimatePresence>
          {paymentInstruction && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ type: "spring", damping: 25, stiffness: 300, duration: 0.2 }}
                className="rounded-lg border border-[#14532d]/40 bg-white shadow-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-[#14532d]">Payment Details</h3>
                  <button
                    onClick={() => {
                      setPaymentInstruction(null)
                      setPendingRegistrationDraft(null)
                    }}
                    className="text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none"
                  >
                    ×
                  </button>
                </div>

                <p className="text-green-700 bg-green-50 border border-green-200 rounded p-3 text-sm mb-4">
                  Please use the exact transfer message below so the admin can confirm your payment.
                </p>

                <div className="flex justify-center mb-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getQrUrl(paymentInstruction)}
                    alt="Bank transfer QR code"
                    className="w-56 h-56 rounded border border-gray-200"
                  />
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-600">Bank:</span>
                    <span className="font-semibold">{paymentInstruction.bankName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-600">Account number:</span>
                    <span className="font-mono font-semibold">{paymentInstruction.accountNumber}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-600">Account name:</span>
                    <span className="font-semibold">{paymentInstruction.accountName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-semibold text-red-600">{paymentInstruction.amount.toLocaleString('vi-VN')} VND</span>
                  </div>
                  <div className="py-2">
                    <p className="text-gray-600 mb-1">Transfer message:</p>
                    <div className="rounded border-2 border-[#14532d] bg-green-50 p-3 text-center">
                      <span className="font-mono text-sm font-normal tracking-wider text-[#14532d]">
                        <LinkifiedText text={paymentInstruction.transferContent} preserveLineBreaks={false} linkClassName="break-all font-medium text-[#14532d] underline underline-offset-2 hover:text-[#166534]" />
                      </span>
                    </div>
                    <p className="text-sm text-[#14532d] font-semibold mt-1">Example: Nguyen Van A - 0934567890</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (pendingRegistrationDraft) {
                      void confirmRegistrationAfterPaymentReview()
                      return
                    }
                    setPaymentInstruction(null)
                  }}
                  disabled={Boolean(pendingRegistrationDraft && registering === pendingRegistrationDraft.courseId)}
                  className="mt-4 w-full px-4 py-2 bg-[#14532d] text-white rounded hover:bg-[#166534]"
                >
                  {pendingRegistrationDraft
                    ? registering === pendingRegistrationDraft.courseId
                      ? 'Đang đăng ký...'
                      : 'Đăng Ký'
                    : 'Đóng'}
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {pendingReferralCourse && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* Backdrop */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => {
                  setPendingReferralCourse(null)
                  setReferrerInput('')
                }}
                className="absolute inset-0 bg-black/40 backdrop-blur-xs"
              />
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ type: "spring", damping: 25, stiffness: 300, duration: 0.2 }}
                className="relative w-full max-w-md rounded-lg border-2 border-[#14532d] bg-white p-6 shadow-[0_18px_48px_rgba(20,83,45,0.22)]"
              >
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-[#14532d]">Ai đã giới thiệu khóa học {pendingReferralCourse.title} này cho bạn?</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPendingReferralCourse(null)
                      setReferrerInput('')
                    }}
                    className="text-2xl leading-none text-[#14532d]/30 hover:text-[#14532d]"
                  >
                    ×
                  </button>
                </div>

                <label className="block text-sm font-medium text-slate-700">Mã học viên hoặc email người giới thiệu</label>
                <input
                  type="text"
                  value={referrerInput}
                  onChange={(event) => setReferrerInput(event.target.value)}
                  placeholder="Không bắt buộc"
                  className="mt-2 block w-full rounded-lg border border-slate-200 px-4 py-2 outline-none focus:border-[#14532d] focus:ring-1 focus:ring-[#14532d]"
                />
                <p className="mt-2 text-xs text-gray-500">Để trống nếu bạn không được ai giới thiệu.</p>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setPendingReferralCourse(null)
                      setReferrerInput('')
                    }}
                    className="rounded bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-300"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const course = courses.find((item) => item.id === pendingReferralCourse.id)
                      if (!course) {
                        setErrorModal('Không tìm thấy khóa học để tiếp tục đăng ký.')
                        return
                      }
                      openPaymentPreviewForRegistration(course, referrerInput)
                    }}
                    disabled={registering === pendingReferralCourse.id}
                    className="rounded bg-[#14532d] px-4 py-2 text-sm font-medium text-white hover:bg-[#166534] disabled:opacity-50"
                  >
                    {registering === pendingReferralCourse.id ? 'Đang đăng ký...' : 'Tiếp tục'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
