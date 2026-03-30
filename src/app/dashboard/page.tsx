'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'

interface Course {
  id: string
  title: string
  registrationDeadline: string
  enrolledCount: number
  maxStudents: number
}

interface Enrollment {
  id: string
  courseId: string
  status: string
  course: { title: string }
}

interface HomeworkItem {
  id: string
  title: string
  description: string | null
  dueDate: string
  submitted: boolean
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [registering, setRegistering] = useState<string | null>(null)
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [congratsEnrollment, setCongratsEnrollment] = useState<{ id: string; title: string } | null>(null)
  const [showHomeworkModal, setShowHomeworkModal] = useState(false)
  const [homeworks, setHomeworks] = useState<HomeworkItem[]>([])
  const [selectedHomeworkId, setSelectedHomeworkId] = useState('')
  const [homeworkNote, setHomeworkNote] = useState('')
  const [homeworkLoading, setHomeworkLoading] = useState(false)
  const [homeworkSuccess, setHomeworkSuccess] = useState('')
  const [homeworkError, setHomeworkError] = useState('')
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
      if (session?.user?.role === 'admin') {
        router.push('/admin')
        return
      }

      if (session?.user?.role === 'user') {
        router.push('/')
        return
      }

      fetchCourses()
      fetchEnrollments()
      fetchHomework()

      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search)
        if (params.get('homework') === '1') {
          setShowHomeworkModal(true)
        }
      }
    }
  }, [status, router, session?.user?.role])

  const fetchHomework = async () => {
    try {
      setHomeworkLoading(true)
      const res = await fetch('/api/member/homework-summary')
      if (!res.ok) {
        setHomeworkError('Không thể tải danh sách bài tập')
        return
      }
      const data = await res.json()
      const pending = (data.allHomework || []).filter((item: HomeworkItem) => !item.submitted)
      setHomeworks(pending)
      setSelectedHomeworkId(pending[0]?.id || '')
    } catch {
      setHomeworkError('Không thể tải danh sách bài tập')
    } finally {
      setHomeworkLoading(false)
    }
  }

  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/courses')
      if (!res.ok) throw new Error('Failed to fetch courses')
      const data = await res.json()
      setCourses(data)
    } catch (err) {
      console.error(err)
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
      // Show congratulations for newly active enrollments not yet acknowledged
      const activeEnrollment = data.find((e: Enrollment) => e.status === 'active')
      if (activeEnrollment) {
        const key = `congratulated_${activeEnrollment.id}`
        if (typeof window !== 'undefined' && !localStorage.getItem(key)) {
          setCongratsEnrollment({ id: activeEnrollment.id, title: activeEnrollment.course?.title || '' })
        }
      }
    } catch (err) {
      console.error(err)
    }
  }

  const registerCourse = async (courseId: string) => {
    if (!courseId) {
      setError('Course ID is required')
      return
    }

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
    return enrollments.find(e => e.courseId === courseId)
  }

  const submitHomework = async () => {
    if (!selectedHomeworkId) {
      setHomeworkError('Vui lòng chọn bài tập')
      return
    }

    try {
      const res = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ homeworkId: selectedHomeworkId, description: homeworkNote })
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error || 'Không thể nộp bài')
      }

      setHomeworkSuccess('Nộp bài thành công!')
      setHomeworkError('')
      setHomeworkNote('')
      const remaining = homeworks.filter((item) => item.id !== selectedHomeworkId)
      setHomeworks(remaining)
      setSelectedHomeworkId(remaining[0]?.id || '')
    } catch (err) {
      setHomeworkSuccess('')
      setHomeworkError(err instanceof Error ? err.message : 'Không thể nộp bài')
    }
  }

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-lg">Xin chào, <span className="font-semibold">{session.user.name || session.user.email}</span></p>
          </div>
          <button
            onClick={() => signOut()}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Đăng xuất
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded border border-red-300 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        <div className="bg-white p-6 rounded shadow-md mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Các Khóa Học Có Sẵn</h2>

          {loading ? (
            <p className="text-gray-500">Đang tải...</p>
          ) : courses.length === 0 ? (
            <p className="text-gray-500">Chưa có khóa học nào</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courses.map((course) => {
                const enrollment = getEnrollmentStatus(course.id)
                const isFull = course.enrolledCount >= course.maxStudents
                return (
                  <div key={course.id} className="border border-gray-200 rounded p-4 hover:shadow-md transition">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.title}</h3>
                    <p className="text-gray-600 text-sm mb-2">
                      Hạn đăng ký: {new Date(course.registrationDeadline).toLocaleDateString('vi-VN')}
                    </p>
                    <p className="text-gray-600 text-sm mb-4">
                      Số học viên: {course.enrolledCount}/{course.maxStudents}
                    </p>

                    {isFull ? (
                      <div className="p-2 bg-red-50 rounded border border-red-200">
                        <p className="text-xs text-red-800 font-semibold">Khóa học đã đủ số lượng</p>
                      </div>
                    ) : enrollment ? (
                      <div className="p-2 bg-yellow-50 rounded border border-yellow-200">
                        <p className="text-xs text-yellow-800">
                          {enrollment.status === 'pending' ? 'Chờ xác nhận' : 'Đăng ký thành công'}
                        </p>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedCourseId(course.id)
                          setShowConfirm(true)
                        }}
                        disabled={registering === course.id}
                        className="w-full px-3 py-2 bg-[#14532d] text-white text-sm rounded hover:bg-[#166534] disabled:opacity-50"
                      >
                        {registering === course.id ? 'Đang đăng ký...' : 'Đăng ký'}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {session.user?.role === 'member' && (
            <div className="bg-white p-6 rounded shadow-md">
              <h2 className="text-xl font-semibold mb-2">Bài Tập</h2>
              <p className="text-gray-600 mb-4">Nộp bài tập và xem tiến độ của bạn</p>
              <button
                onClick={() => {
                  setHomeworkSuccess('')
                  setHomeworkError('')
                  setShowHomeworkModal(true)
                }}
                className="px-4 py-2 bg-[#14532d] text-white rounded hover:bg-[#166534]"
              >
                Nộp Bài Tập
              </button>
            </div>
          )}

          {session.user?.role === 'admin' && (
            <div className="bg-[#14532d]/10 border border-[#14532d]/25 p-6 rounded shadow-md">
              <h2 className="text-xl font-semibold mb-2 text-[#14532d]">Quản lý</h2>
              <p className="text-gray-700 mb-4">Bạn có quyền quản trị viên. Truy cập bảng điều khiển quản lý.</p>
              <Link
                href="/admin"
                className="px-4 py-2 bg-[#14532d] text-white rounded hover:bg-[#166534] inline-block"
              >
                Đi đến Admin Dashboard
              </Link>
            </div>
          )}
        </div>

        {congratsEnrollment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-sm w-full text-center">
              <div className="text-5xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold text-[#14532d] mb-3">Chúc mừng!</h3>
              <p className="text-gray-700 mb-2">
                Bạn đã ghi danh thành công vào khóa học
              </p>
              {congratsEnrollment.title && (
                <p className="text-lg font-semibold text-[#14532d] mb-4">
                  &quot;{congratsEnrollment.title}&quot;
                </p>
              )}
              <p className="text-sm text-gray-500 mb-6">
                Thanh toán đã được admin xác nhận. Chào mừng bạn đến với EnglishMore!
              </p>
              <button
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    localStorage.setItem(`congratulated_${congratsEnrollment.id}`, '1')
                  }
                  setCongratsEnrollment(null)
                }}
                className="w-full px-4 py-3 bg-[#14532d] text-white rounded-lg font-semibold hover:bg-[#166534]"
              >
                Vào học ngay!
              </button>
            </div>
          </div>
        )}

        {showConfirm && selectedCourseId && (          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
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

        {showHomeworkModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded shadow-lg p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-900">Submit Assignment</h3>
                <button
                  onClick={() => setShowHomeworkModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                >
                  ×
                </button>
              </div>

              {homeworkLoading ? (
                <p className="text-gray-500 mb-4">Đang tải danh sách bài tập...</p>
              ) : (
                <>
                  {homeworkError && <p className="text-red-500 mb-4">{homeworkError}</p>}
                  {homeworkSuccess && <p className="text-[#14532d] mb-4">{homeworkSuccess}</p>}

                  {homeworks.length === 0 ? (
                    <p className="text-[#14532d] mb-4">Tốt lắm, bạn đã hoàn thành tất cả bài tập của mình rồi.</p>
                  ) : (
                    <select
                      value={selectedHomeworkId}
                      onChange={(e) => setSelectedHomeworkId(e.target.value)}
                      className="w-full p-2 mb-4 border rounded"
                    >
                      {homeworks.map((homework) => (
                        <option key={homework.id} value={homework.id}>
                          {homework.title} - Hạn nộp {new Date(homework.dueDate).toLocaleDateString('vi-VN')}
                        </option>
                      ))}
                    </select>
                  )}

                  <textarea
                    placeholder="Ghi chú bài nộp"
                    value={homeworkNote}
                    onChange={(e) => setHomeworkNote(e.target.value)}
                    className="w-full p-2 mb-4 border rounded"
                    rows={4}
                  />

                  <button
                    type="button"
                    onClick={submitHomework}
                    disabled={homeworks.length === 0}
                    className="w-full bg-[#14532d] text-white p-2 rounded disabled:opacity-50"
                  >
                    Submit
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
