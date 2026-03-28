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
  createdAt: string
}

export default function CoursesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [registering, setRegistering] = useState<string | null>(null)
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [lastRegisteredCourseId, setLastRegisteredCourseId] = useState<string | null>(null)
  const [bankInfo] = useState({
    account: '19033113602011',
    bank: 'Techcombank',
    owner: 'Nguyễn Trí Bằng',
    amount: '4,000,000 VND'
  })

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
        setLastRegisteredCourseId(courseId)
        setSelectedCourseId(null)
        setShowConfirm(false)
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loading ? (
            <div className="col-span-full text-center text-gray-500">Đang tải...</div>
          ) : courses.length === 0 ? (
            <div className="col-span-full text-center text-gray-500">Chưa có khóa học nào</div>
          ) : (
            courses.map((course) => {
              const enrollment = getEnrollmentStatus(course.id)
              const isFull = course.enrolledCount >= course.maxStudents
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
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedCourseId(course.id)
                        setShowConfirm(true)
                      }}
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

        {showConfirm && selectedCourseId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded shadow-lg p-6 max-w-md">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Xác nhận Đăng ký Khóa học</h3>

              <div className="mb-6 space-y-4">
                <p className="text-gray-700">
                  Bạn cần chuyển khoản <strong>chính xác</strong> số tiền dưới đây:
                </p>

                <div className="bg-[#14532d]/10 border border-[#14532d]/25 rounded p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Số tiền:</span>
                    <span className="font-semibold text-gray-900">{bankInfo.amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ngân hàng:</span>
                    <span className="font-semibold text-gray-900">{bankInfo.bank}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Số TK:</span>
                    <span className="font-mono font-semibold text-gray-900">{bankInfo.account}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Chủ TK:</span>
                    <span className="font-semibold text-gray-900">{bankInfo.owner}</span>
                  </div>
                </div>

                <p className="text-sm text-gray-600 bg-yellow-50 p-3 rounded">
                  Sau khi chuyển khoản, admin sẽ xác nhận và kích hoạt khóa học cho bạn.
                </p>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowConfirm(false)
                    setSelectedCourseId(null)
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-900 rounded hover:bg-gray-400"
                >
                  Hủy
                </button>
                <a
                  href="https://www.facebook.com/bangbigbee"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-amber-100 text-amber-700 rounded hover:bg-amber-200"
                >
                  Tư vấn
                </a>
                <button
                  onClick={() => {
                    if (!selectedCourseId) {
                      setError('Course ID is required')
                      setShowConfirm(false)
                      return
                    }
                    registerCourse(selectedCourseId)
                  }}
                  disabled={registering === selectedCourseId}
                  className="px-4 py-2 bg-[#14532d] text-white rounded hover:bg-[#166534] disabled:opacity-50"
                >
                  {registering === selectedCourseId ? 'Đang xử lý...' : 'Đã chuyển khoản'}
                </button>
              </div>
            </div>
          </div>
        )}

        {lastRegisteredCourseId && enrollments.some(e => e.courseId === lastRegisteredCourseId && e.status === 'pending') && !loading && (
          <div className="mt-6 p-4 bg-[#14532d]/10 border border-[#14532d]/40 rounded text-[#14532d]">
            Đã ghi nhận đăng ký. Trạng thái hiện tại: Chờ xác nhận.
          </div>
        )}
      </div>
    </div>
  )
}
