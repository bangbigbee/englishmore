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

export default function CoursesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [registering, setRegistering] = useState<string | null>(null)
  const [paymentInstruction, setPaymentInstruction] = useState<PaymentInstruction | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchCourses()
      fetchEnrollments()
    }
  }, [status, router])

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

  const registerCourse = async (courseId: string) => {
    try {
      setRegistering(courseId)
      const res = await fetch(`/api/courses/${courseId}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to register')
      } else {
        setError('')
        setPaymentInstruction(data.paymentInstruction || null)
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

  const hasPendingEnrollment = enrollments.some(e => e.status === 'pending')

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
      transferContent: '[Full Name] [Phone Number]'
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
          <h1 className="text-3xl font-bold text-gray-900">Các Khóa Học Có Sẵn</h1>
          <p className="text-gray-600 mt-2">Chọn khóa học mà bạn muốn tham gia</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 rounded text-red-700">
            {error}
          </div>
        )}

        {hasPendingEnrollment && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-300 rounded text-yellow-800">
            <strong>Lưu ý:</strong> Bạn đang có một đăng ký chờ admin xác nhận. Vui lòng đợi xác nhận trước khi đăng ký thêm khóa học.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loading ? (
            <div className="col-span-full text-center text-gray-500">Đang tải...</div>
          ) : courses.length === 0 ? (
            <div className="col-span-full text-center text-gray-500">Chưa có khóa học nào</div>
          ) : (
            courses.map((course) => {
              const enrollment = getEnrollmentStatus(course.id)
              const isFull = course.enrolledCount >= course.maxStudents
              const blockedByPending = !enrollment && hasPendingEnrollment
              return (
                <div key={course.id} className="bg-white rounded shadow-md p-6 hover:shadow-lg transition">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{course.title}</h3>
                  <p className="text-gray-700 text-sm mb-2">{course.description || 'Chưa có mô tả'}</p>
                  <p className="text-gray-600 text-sm mb-2">
                    Hạn đăng ký: {new Date(course.registrationDeadline).toLocaleDateString('vi-VN')}
                  </p>
                  <p className="text-gray-600 text-sm mb-2">
                    Số học viên: {course.enrolledCount}/{course.maxStudents}
                  </p>
                  <p className="text-gray-600 text-sm mb-4">
                    Đăng ký thành công: {course.successfulCount} • Chờ xác nhận: {course.pendingCount}
                  </p>

                  {isFull ? (
                    <div className="p-3 bg-red-50 rounded border border-red-200">
                      <p className="text-sm text-red-800 font-semibold">Khóa học đã đủ số lượng</p>
                    </div>
                  ) : enrollment ? (
                    <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
                      <p className="text-sm text-yellow-800">
                        <strong>Trạng thái:</strong>{' '}
                        {enrollment.status === 'pending' ? 'Chờ xác nhận' : 'Đăng ký thành công'}
                      </p>
                      {enrollment.status === 'pending' && (
                        <p className="text-xs text-yellow-700 mt-2">
                          Chúng tôi đã nhận yêu cầu của bạn và đang chờ admin xác nhận thanh toán
                        </p>
                      )}
                      <button
                        onClick={openPaymentInfo}
                        className="mt-3 inline-block text-xs px-3 py-1.5 rounded bg-white border border-[#14532d]/30 text-[#14532d] hover:bg-[#14532d]/10"
                      >
                        Xem lại thông tin chuyển khoản
                      </button>
                    </div>
                  ) : blockedByPending ? (
                    <div className="p-3 bg-gray-50 rounded border border-gray-200">
                      <p className="text-sm text-gray-500">Vui lòng đợi xác nhận đăng ký hiện tại trước khi đăng ký thêm</p>
                    </div>
                  ) : (
                    <button
                      onClick={() => registerCourse(course.id)}
                      disabled={registering === course.id}
                      className="w-full px-4 py-2 bg-[#14532d] text-white rounded hover:bg-[#166534] disabled:opacity-50"
                    >
                      {registering === course.id ? 'Đang đăng ký...' : 'Đăng ký'}
                    </button>
                  )}
                </div>
              )
            })
          )}
        </div>

        {paymentInstruction && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-[#14532d]">Thông tin chuyển khoản</h3>
                <button
                  onClick={() => setPaymentInstruction(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none"
                >
                  ×
                </button>
              </div>

              <p className="text-green-700 bg-green-50 border border-green-200 rounded p-3 text-sm mb-4">
                Vui lòng chuyển khoản đúng nội dung bên dưới để quản trị viên xác nhận đóng học phí.
              </p>

              <div className="flex justify-center mb-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getQrUrl(paymentInstruction)}
                  alt="QR chuyển khoản"
                  className="w-56 h-56 rounded border border-gray-200"
                />
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-600">Ngân hàng:</span>
                  <span className="font-semibold">{paymentInstruction.bankName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-600">Số tài khoản:</span>
                  <span className="font-mono font-semibold">{paymentInstruction.accountNumber}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-600">Chủ tài khoản:</span>
                  <span className="font-semibold">{paymentInstruction.accountName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-600">Số tiền:</span>
                  <span className="font-semibold text-red-600">{paymentInstruction.amount.toLocaleString('vi-VN')} VND</span>
                </div>
                <div className="py-2">
                  <p className="text-gray-600 mb-1">Nội dung chuyển khoản:</p>
                  <div className="bg-yellow-50 border-2 border-yellow-400 rounded p-3 text-center">
                    <span className="font-mono font-bold text-lg text-yellow-900 tracking-wider">
                      {paymentInstruction.transferContent}
                    </span>
                  </div>
                  <p className="text-xs text-red-600 mt-1">Nguyen Van A 0934567890</p>
                </div>
              </div>

              <button
                onClick={() => setPaymentInstruction(null)}
                className="mt-4 w-full px-4 py-2 bg-[#14532d] text-white rounded hover:bg-[#166534]"
              >
                Đã hiểu, đóng
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
