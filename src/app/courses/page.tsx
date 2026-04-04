'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
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

const DEFAULT_COURSE_DESCRIPTION = 'Khóa học giao tiếp thực hành, tối ưu cho người cần dùng tiếng Anh trong học tập và công việc.'

const getCourseDescriptionPreview = (description?: string) => {
  const normalized = String(description || '').replace(/\s+/g, ' ').trim()
  const fallback = DEFAULT_COURSE_DESCRIPTION

  if (!normalized) {
    return fallback
  }

  if (normalized.length <= 180) {
    return normalized
  }

  return `${normalized.slice(0, 177)}...`
}

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
  const [referrerInput, setReferrerInput] = useState('')
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      if (session?.user?.role === 'admin') {
        router.push('/admin')
        return
      }
      fetchCourses()
      fetchEnrollments()
    }
  }, [status, router, session?.user?.role])

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
        setPendingReferralCourse(null)
      } else {
        setError('')
        setErrorModal(null)
        toast.success('Đăng ký thành công. Vui lòng chuyển khoản theo hướng dẫn để được xác nhận.')
        setPaymentInstruction(data.paymentInstruction || null)
        setPendingReferralCourse(null)
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

  const getCourseTuition = (course?: Course) => {
    if (typeof course?.price === 'number' && course.price > 0) {
      return course.price
    }

    const matchedEnrollment = course ? enrollments.find((item) => item.courseId === course.id) : undefined
    if (typeof matchedEnrollment?.course?.price === 'number' && matchedEnrollment.course.price > 0) {
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
    setPaymentInstruction(buildInstructionFromEnrollment(course))
  }

  const handleOpenReferral = (course: Course) => {
    setPendingReferralCourse({ id: course.id, title: course.title })
    setReferrerInput('')
    setErrorModal(null)
  }

  const getAvailabilityText = (course: Course) => (course.enrolledCount >= course.maxStudents ? 'Đã đầy chỗ' : 'Vẫn còn chỗ')

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Available Courses</h1>
          <p className="mt-2 text-xs sm:text-sm text-gray-600">Choose the course you want to join.</p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500">Đang tải danh sách khóa học...</div>
        ) : courses.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500">Chưa có khóa học đang mở.</div>
        ) : (
          <div className="space-y-6">
            {courses.map((course) => {
              const enrollment = getEnrollmentStatus(course.id)
              const isFull = course.enrolledCount >= course.maxStudents
              const blockedByExistingEnrollment = !enrollment && hasExistingEnrollment
              const isPendingPayment = enrollment?.status === 'pending'
              const tuition = getCourseTuition(course)
              const courseCurrency = course.currency || 'VND'
              const isExpanded = expandedCourseId === course.id

              return (
                <div key={course.id} className="course-select-card">
                  <div className="rounded-[calc(1rem-1.5px)] overflow-hidden bg-white">
                    <div className="px-5 py-5 sm:px-7 sm:py-6">
                      <h2 className="text-2xl font-bold text-[#14532d]">{course.title}</h2>
                      <p className="mt-2 text-sm text-slate-600">
                        <LinkifiedText text={getCourseDescriptionPreview(course.description)} />
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-3">
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
                            course.enrolledCount >= course.maxStudents ||
                            (!getEnrollmentStatus(course.id) && hasExistingEnrollment)
                          }
                          className="rounded bg-[#14532d] px-4 py-2 text-sm font-semibold text-white hover:bg-[#166534] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {registering === course.id ? 'Đang đăng ký...' : 'Đăng Ký Ngay'}
                        </button>
                        {isPendingPayment ? (
                          <p className="text-sm font-medium text-amber-700">
                            You&apos;ve already registered. Please wait while your payment is being confirmed.
                          </p>
                        ) : (
                          <>
                            <p className="text-sm text-slate-700">
                              <strong>Hạn đăng ký:</strong> {new Date(course.registrationDeadline).toLocaleDateString('vi-VN')}
                            </p>
                            <p className={`text-sm font-semibold ${course.enrolledCount >= course.maxStudents ? 'text-red-700' : 'text-emerald-700'}`}>
                              {getAvailabilityText(course)}
                            </p>
                          </>
                        )}
                      </div>

                      {isFull ? (
                        <div className="mt-4 rounded border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">Khóa học này đã đủ số lượng học viên.</div>
                      ) : enrollment ? (
                        <div className="mt-4 rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                          {enrollment.status === 'pending' ? (
                            <p>Đang chờ xác nhận vào lớp <strong>&quot;{enrollment.course?.title}&quot;</strong>.</p>
                          ) : (
                            <p><strong>Trạng thái:</strong> Đăng ký thành công.</p>
                          )}
                          <button
                            onClick={() => openPaymentInfo(course)}
                            className="mt-3 inline-block rounded border border-[#14532d]/30 bg-white px-3 py-1.5 text-xs text-[#14532d] hover:bg-[#14532d]/10"
                          >
                            Xem thông tin chuyển khoản
                          </button>
                        </div>
                      ) : blockedByExistingEnrollment ? (
                        <div className="mt-4 rounded border border-gray-200 bg-gray-50 p-3 text-sm text-gray-600">
                          Bạn đã có khóa học đang xử lý. Vui lòng chờ xác nhận trước khi đăng ký thêm.
                        </div>
                      ) : null}
                    </div>

                    <div className="border-t border-slate-200">
                      <button
                        type="button"
                        onClick={() => setExpandedCourseId(isExpanded ? null : course.id)}
                        className="flex w-full items-center justify-between px-5 py-3 text-sm font-semibold text-[#14532d] hover:bg-slate-50 sm:px-7"
                      >
                        <span>{isExpanded ? 'Thu gọn' : 'Xem thêm chi tiết'}</span>
                        <span className="text-xs">{isExpanded ? '▲' : '▼'}</span>
                      </button>

                      {isExpanded && (
                        <div className="space-y-5 px-5 pb-6 pt-1 text-slate-700 sm:px-7">
                          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                            <LinkifiedText text={String(course.description || '').trim() || DEFAULT_COURSE_DESCRIPTION} preserveLineBreaks />
                          </div>

                          <div>
                            <h3 className="text-lg font-semibold text-[#14532d]">Học phí</h3>
                            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm">
                              <li>Toàn bộ khóa học: {courseCurrency === 'VND' ? formatVnd(tuition) : `${tuition.toLocaleString('vi-VN')} ${courseCurrency}`}</li>
                            </ul>
                          </div>

                          <p className="text-sm text-slate-600">
                            Mọi thông tin thêm, vui lòng liên hệ Mr. Nguyễn Trí Bằng qua số điện thoại 0915091093. Hoặc nhắn tin về Facebook:
                            <a href="https://www.facebook.com/bangbigbee" target="_blank" rel="noreferrer" className="ml-1 text-amber-700 hover:underline">https://www.facebook.com/bangbigbee</a>
                          </p>

                          <div className="border-t border-slate-200 pt-4">
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
                                course.enrolledCount >= course.maxStudents ||
                                (!getEnrollmentStatus(course.id) && hasExistingEnrollment)
                              }
                              className="w-full rounded-lg bg-[#14532d] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#166534] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {registering === course.id ? 'Đang đăng ký...' : 'Đăng Ký Ngay'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {paymentInstruction && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="rounded-lg border border-[#14532d]/40 bg-white shadow-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-[#14532d]">Payment Details</h3>
                <button
                  onClick={() => setPaymentInstruction(null)}
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
                onClick={() => setPaymentInstruction(null)}
                className="mt-4 w-full px-4 py-2 bg-[#14532d] text-white rounded hover:bg-[#166534]"
              >
                Got it, close
              </button>
            </div>
          </div>
        )}

        {pendingReferralCourse && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-lg border-2 border-[#14532d] bg-white p-6 shadow-[0_18px_48px_rgba(20,83,45,0.22)]">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-orange-700">Ai đã giới thiệu khóa học này cho bạn?</h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPendingReferralCourse(null)
                    setReferrerInput('')
                  }}
                  className="text-2xl leading-none text-orange-300 hover:text-orange-600"
                >
                  ×
                </button>
              </div>

              <label className="block text-sm font-medium text-orange-700">Mã học viên hoặc email người giới thiệu</label>
              <input
                type="text"
                value={referrerInput}
                onChange={(event) => setReferrerInput(event.target.value)}
                placeholder="Không bắt buộc"
                className="mt-2 block w-full rounded-lg border border-orange-200 px-4 py-2 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
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
                  onClick={() => registerCourse(pendingReferralCourse.id, referrerInput)}
                  disabled={registering === pendingReferralCourse.id}
                  className="rounded bg-[#14532d] px-4 py-2 text-sm font-medium text-white hover:bg-[#166534] disabled:opacity-50"
                >
                  {registering === pendingReferralCourse.id ? 'Đang đăng ký...' : 'Tiếp tục'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
