'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Course {
  id: string
  title: string
  description?: string
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

  const buildInstructionFromEnrollment = (): PaymentInstruction => {
    return {
      bankName: 'Techcombank',
      accountNumber: '19033113602011',
      accountName: 'Nguyen Tri Bang',
      amount: 3800000,
      transferContent: 'Your Full Name - Phone Number'
    }
  }

  const openPaymentInfo = () => {
    setPaymentInstruction(buildInstructionFromEnrollment())
  }

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Available Courses</h1>
          <p className="mt-2 text-xs sm:text-sm text-gray-600">Choose the course you want to join.</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 rounded text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loading ? (
            <div className="col-span-full text-center text-gray-500">Loading...</div>
          ) : courses.length === 0 ? (
            <div className="col-span-full text-center text-gray-500">No courses available yet.</div>
          ) : (
            courses.map((course) => {
              const enrollment = getEnrollmentStatus(course.id)
              const isFull = course.enrolledCount >= course.maxStudents
              const blockedByExistingEnrollment = !enrollment && hasExistingEnrollment
              return (
                <div key={course.id} className="bg-white rounded shadow-md p-4 sm:p-6 hover:shadow-lg transition">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">{course.title}</h3>
                  <p className="text-gray-700 text-xs sm:text-sm mb-2">{course.description || 'No description available.'}</p>
                  <p className="text-gray-600 text-xs sm:text-sm mb-2">
                    Registration deadline: {new Date(course.registrationDeadline).toLocaleDateString('en-GB')}
                  </p>
                  <p className="text-gray-600 text-xs sm:text-sm mb-2">
                    Students: {course.enrolledCount}/{course.maxStudents}
                  </p>
                  <p className="text-gray-600 text-xs sm:text-sm mb-4">
                    Confirmed: {course.successfulCount} • Pending: {course.pendingCount}
                  </p>

                  {isFull ? (
                    <div className="p-3 bg-red-50 rounded border border-red-200">
                      <p className="text-sm text-red-800 font-semibold">This course is full.</p>
                    </div>
                  ) : enrollment ? (
                    <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
                      {enrollment.status === 'pending' ? (
                        <p className="text-sm text-yellow-800">
                          Waiting for confirmation to join <strong>&quot;{enrollment.course?.title}&quot;</strong>
                        </p>
                      ) : (
                        <p className="text-sm text-yellow-800">
                          <strong>Status:</strong> Registered successfully
                        </p>
                      )}
                      <button
                        onClick={openPaymentInfo}
                        className="mt-3 inline-block text-xs px-3 py-1.5 rounded bg-white border border-[#14532d]/30 text-[#14532d] hover:bg-[#14532d]/10"
                      >
                        Review payment details
                      </button>
                    </div>
                  ) : blockedByExistingEnrollment ? (
                    <div className="p-3 bg-gray-50 rounded border border-gray-200">
                      <p className="text-sm text-gray-500">Please wait for your current enrollment to be approved before registering again.</p>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setPendingReferralCourse({ id: course.id, title: course.title })
                        setReferrerInput('')
                        setErrorModal(null)
                      }}
                      disabled={registering === course.id}
                      className="w-full px-4 py-2 bg-[#14532d] text-white rounded hover:bg-[#166534] disabled:opacity-50"
                    >
                      {registering === course.id ? 'Registering...' : 'Register'}
                    </button>
                  )}
                </div>
              )
            })
          )}
        </div>

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
                      {paymentInstruction.transferContent}
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

        {errorModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="rounded-lg border border-[#14532d]/40 bg-white shadow-xl p-6 max-w-md w-full">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-red-600">Registration Error</h3>
                <button
                  onClick={() => setErrorModal(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none"
                >
                  ×
                </button>
              </div>
              <p className="text-gray-700 mb-4">{errorModal}</p>
              <button
                onClick={() => setErrorModal(null)}
                className="w-full px-4 py-2 bg-[#14532d] text-white rounded hover:bg-[#166534]"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {pendingReferralCourse && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-lg border border-[#14532d]/40 bg-white p-6 shadow-xl">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Ai đã giới thiệu khóa học này cho bạn?</h3>
                  <p className="mt-1 text-sm text-gray-600">Không bắt buộc: nhập mã học viên hoặc email của người giới thiệu trước khi đăng ký <strong>{pendingReferralCourse.title}</strong>.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPendingReferralCourse(null)
                    setReferrerInput('')
                  }}
                  className="text-2xl leading-none text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <label className="block text-sm font-medium text-gray-700">Mã học viên hoặc email người giới thiệu</label>
              <input
                type="text"
                value={referrerInput}
                onChange={(event) => setReferrerInput(event.target.value)}
                placeholder="Không bắt buộc"
                className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-[#14532d] focus:ring-1 focus:ring-[#14532d]"
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
