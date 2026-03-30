'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'

interface HomeworkItem {
  id: string
  title: string
  description: string | null
  dueDate: string
  submitted: boolean
}

interface ExerciseItem {
  id: string
  order: number
  questions: Array<{
    id: string
    order: number
    question: string
    optionA: string
    optionB: string
    optionC: string
  }>
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [congratsEnrollment, setCongratsEnrollment] = useState<{ id: string; title: string } | null>(null)
  const [showHomeworkModal, setShowHomeworkModal] = useState(false)
  const [homeworks, setHomeworks] = useState<HomeworkItem[]>([])
  const [exercises, setExercises] = useState<ExerciseItem[]>([])
  const [selectedHomeworkId, setSelectedHomeworkId] = useState('')
  const [homeworkNote, setHomeworkNote] = useState('')
  const [homeworkLoading, setHomeworkLoading] = useState(false)
  const [homeworkSuccess, setHomeworkSuccess] = useState('')
  const [homeworkError, setHomeworkError] = useState('')

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

      fetchEnrollments()
      fetchHomework()
      fetchExercises()

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
      setHomeworkError('')
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

  const fetchExercises = async () => {
    try {
      setError('')
      const res = await fetch('/api/member/exercises')
      if (!res.ok) throw new Error('Failed to fetch exercises')
      const data = await res.json()
      setExercises(data.exercises || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải exercises')
    } finally {
      setLoading(false)
    }
  }

  const fetchEnrollments = async () => {
    try {
      setError('')
      const res = await fetch('/api/user/enrollments')
      if (!res.ok) return
      const data = await res.json()
      // Show congratulations for newly active enrollments not yet acknowledged
      const activeEnrollment = data.find((e: { id: string; status: string; course?: { title: string } }) => e.status === 'active')
      if (activeEnrollment) {
        const key = `congratulated_${activeEnrollment.id}`
        if (typeof window !== 'undefined' && !localStorage.getItem(key)) {
          setCongratsEnrollment({ id: activeEnrollment.id, title: activeEnrollment.course?.title || '' })
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải thông tin khóa học')
    }
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
        <div className="mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Practice Arena</h1>
            <p className="text-lg">Xin chào, <span className="font-semibold">{session.user.name || session.user.email}</span></p>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded border border-red-300 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6">
          {session.user?.role === 'member' && (
            <div className="bg-white p-6 rounded shadow-md">
              <h2 className="text-xl font-semibold mb-4">Exercises</h2>
              {loading ? (
                <p className="text-gray-500">Đang tải exercises...</p>
              ) : exercises.length === 0 ? (
                <p className="text-gray-500">Chưa có exercise nào được tạo cho khóa học của bạn.</p>
              ) : (
                <div className="space-y-6">
                  {exercises.map((exercise) => (
                    <div key={exercise.id} className="rounded-xl border border-gray-200 p-5">
                      <h3 className="text-lg font-bold text-[#14532d] mb-4">Exercise {exercise.order}</h3>
                      <div className="space-y-4">
                        {exercise.questions.map((question) => (
                          <div key={question.id} className="rounded-lg bg-gray-50 p-4 border border-gray-100">
                            <p className="font-semibold text-gray-900">{question.order}. {question.question}</p>
                            <div className="mt-3 space-y-2 text-sm text-gray-700">
                              <p>A. {question.optionA}</p>
                              <p>B. {question.optionB}</p>
                              <p>C. {question.optionC}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
