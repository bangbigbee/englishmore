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
  description: string | null
  submission: {
    id: string
    score: number
    totalQuestions: number
    submittedAt: string
    answers: Array<{
      questionId: string
      selectedOption: string
      isCorrect: boolean
    }>
  } | null
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
  const [exerciseAnswers, setExerciseAnswers] = useState<Record<string, Record<string, string>>>({})
  const [exerciseFeedback, setExerciseFeedback] = useState<Record<string, { type: 'success' | 'error'; message: string }>>({})
  const [submittingExerciseId, setSubmittingExerciseId] = useState<string | null>(null)

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
      const nextExercises = data.exercises || []
      setExercises(nextExercises)
      setExerciseAnswers((current) => {
        const mapped = Object.fromEntries(
          nextExercises.map((exercise: ExerciseItem) => [
            exercise.id,
            exercise.submission
              ? Object.fromEntries(exercise.submission.answers.map((answer) => [answer.questionId, answer.selectedOption]))
              : current[exercise.id] || {}
          ])
        )

        return mapped
      })
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

  const updateExerciseAnswer = (exerciseId: string, questionId: string, selectedOption: string) => {
    setExerciseAnswers((current) => ({
      ...current,
      [exerciseId]: {
        ...(current[exerciseId] || {}),
        [questionId]: selectedOption
      }
    }))
    setExerciseFeedback((current) => {
      const next = { ...current }
      delete next[exerciseId]
      return next
    })
  }

  const submitExercise = async (exercise: ExerciseItem) => {
    const selectedAnswers = exerciseAnswers[exercise.id] || {}
    const missingQuestion = exercise.questions.find((question) => !selectedAnswers[question.id])

    if (missingQuestion) {
      setExerciseFeedback((current) => ({
        ...current,
        [exercise.id]: {
          type: 'error',
          message: `Bạn cần chọn đáp án cho câu ${missingQuestion.order} trước khi nộp bài.`
        }
      }))
      return
    }

    try {
      setSubmittingExerciseId(exercise.id)
      const res = await fetch(`/api/member/exercises/${exercise.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: exercise.questions.map((question) => ({
            questionId: question.id,
            selectedOption: selectedAnswers[question.id]
          }))
        })
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error || 'Không thể nộp exercise')
      }

      setExerciseFeedback((current) => ({
        ...current,
        [exercise.id]: {
          type: 'success',
          message: `Đã nộp bài. Kết quả hiện tại: ${data.submission.score}/${data.submission.totalQuestions}.`
        }
      }))
      await fetchExercises()
    } catch (err) {
      setExerciseFeedback((current) => ({
        ...current,
        [exercise.id]: {
          type: 'error',
          message: err instanceof Error ? err.message : 'Không thể nộp exercise'
        }
      }))
    } finally {
      setSubmittingExerciseId(null)
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
            <h1 className="text-3xl font-bold mb-2">Practice Zone</h1>
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
                      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-[#14532d]">Exercise {exercise.order}</h3>
                          {exercise.description && (
                            <p className="mt-1 text-sm text-gray-600">{exercise.description}</p>
                          )}
                          <p className="text-sm text-gray-500">
                            {Object.keys(exerciseAnswers[exercise.id] || {}).length}/{exercise.questions.length} câu đã chọn đáp án
                          </p>
                        </div>
                        {exercise.submission ? (
                          <div className="rounded-lg bg-[#14532d]/10 px-4 py-3 text-sm text-[#14532d]">
                            <p className="font-semibold">Điểm gần nhất: {exercise.submission.score}/{exercise.submission.totalQuestions}</p>
                            <p>Nộp lúc: {new Date(exercise.submission.submittedAt).toLocaleString('vi-VN')}</p>
                          </div>
                        ) : (
                          <span className="inline-flex w-fit rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800">Chưa nộp bài</span>
                        )}
                      </div>

                      {exerciseFeedback[exercise.id] && (
                        <div className={`mb-4 rounded-lg border px-4 py-3 text-sm ${
                          exerciseFeedback[exercise.id]?.type === 'success'
                            ? 'border-[#14532d]/30 bg-[#14532d]/10 text-[#14532d]'
                            : 'border-red-300 bg-red-50 text-red-700'
                        }`}>
                          {exerciseFeedback[exercise.id]?.message}
                        </div>
                      )}

                      <div className="space-y-4">
                        {exercise.questions.map((question) => (
                          <div key={question.id} className="rounded-lg bg-gray-50 p-4 border border-gray-100">
                            <p className="font-semibold text-gray-900">{question.order}. {question.question}</p>
                            <div className="mt-3 grid gap-2 md:grid-cols-3">
                              {[
                                { key: 'A', text: question.optionA },
                                { key: 'B', text: question.optionB },
                                { key: 'C', text: question.optionC }
                              ].map((option) => {
                                const selectedOption = exerciseAnswers[exercise.id]?.[question.id]
                                const isSelected = selectedOption === option.key

                                return (
                                  <button
                                    key={`${question.id}-${option.key}`}
                                    type="button"
                                    onClick={() => updateExerciseAnswer(exercise.id, question.id, option.key)}
                                    className={`rounded-lg border px-4 py-3 text-left text-sm transition ${
                                      isSelected
                                        ? 'border-[#14532d] bg-[#14532d]/10 text-[#14532d]'
                                        : 'border-gray-200 bg-white text-gray-700 hover:border-[#14532d]/40'
                                    }`}
                                  >
                                    <span className="mb-1 block font-semibold">{option.key}.</span>
                                    <span>{option.text}</span>
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-gray-500">Bạn có thể cập nhật đáp án rồi nộp lại nếu muốn cải thiện kết quả.</p>
                        <button
                          type="button"
                          onClick={() => submitExercise(exercise)}
                          disabled={submittingExerciseId === exercise.id}
                          className="rounded-lg bg-[#14532d] px-5 py-3 font-medium text-white hover:bg-[#166534] disabled:opacity-50"
                        >
                          {submittingExerciseId === exercise.id ? 'Đang nộp bài...' : exercise.submission ? 'Nộp lại Exercise' : 'Submit Exercise'}
                        </button>
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
