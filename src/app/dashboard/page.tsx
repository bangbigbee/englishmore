'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import LinkifiedText from '@/components/LinkifiedText'

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
  title: string | null
  description: string | null
  exerciseType: string
  audioFileUrl: string | null
  attachmentFileUrl: string | null
  isLocked?: boolean
  submission: {
    id: string
    score: number
    totalQuestions: number
    durationSeconds: number | null
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
    optionD: string | null
  }>
}

type MemberTab = 'exercises' | 'speak'

const formatDuration = (totalSeconds: number) => {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds))
  const minutes = Math.floor(safeSeconds / 60)
  const seconds = safeSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

const getExerciseTitle = (exercise: Pick<ExerciseItem, 'title' | 'order'>) => {
  const trimmed = String(exercise.title || '').trim()
  return trimmed || `Exercise ${exercise.order}`
}

const getExerciseQuestionOptions = (question: ExerciseItem['questions'][number]) => {
  return [
    { key: 'A', text: question.optionA },
    { key: 'B', text: question.optionB },
    { key: 'C', text: question.optionC },
    ...(question.optionD ? [{ key: 'D', text: question.optionD }] : [])
  ]
}

const isListeningExercise = (exerciseType: string) => {
  const normalized = normalizeExerciseType(exerciseType)
  return normalized === 'question_response' || normalized === 'conversation'
}

const getExerciseTypeHeading = (exerciseType: string) => {
  if (exerciseType === 'listening_audio') return 'Question-Response'
  if (exerciseType === 'question_response') return 'Question-Response'
  if (exerciseType === 'conversation') return 'Conversation'
  if (exerciseType === 'multiple_choice') return 'Multiple-choice'
  return 'Other exercises'
}

const normalizeExerciseType = (exerciseType: string) => {
  return exerciseType === 'listening_audio' ? 'question_response' : exerciseType
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showHomeworkModal, setShowHomeworkModal] = useState(false)
  const [homeworks, setHomeworks] = useState<HomeworkItem[]>([])
  const [exercises, setExercises] = useState<ExerciseItem[]>([])
  const [selectedHomeworkId, setSelectedHomeworkId] = useState('')
  const [homeworkNote, setHomeworkNote] = useState('')
  const [homeworkLoading, setHomeworkLoading] = useState(false)
  const [homeworkSuccess, setHomeworkSuccess] = useState('')
  const [homeworkError, setHomeworkError] = useState('')
  const [exerciseAnswers, setExerciseAnswers] = useState<Record<string, Record<string, string>>>({})
  const [submittingExerciseId, setSubmittingExerciseId] = useState<string | null>(null)
  const [startedExerciseAt, setStartedExerciseAt] = useState<Record<string, number>>({})
  const [revealedExercises, setRevealedExercises] = useState<Record<string, boolean>>({})
  const [timerTick, setTimerTick] = useState(() => Date.now())
  const [submitConfirm, setSubmitConfirm] = useState<{ exercise: ExerciseItem; durationSeconds: number } | null>(null)
  const [listenReminderExerciseTitle, setListenReminderExerciseTitle] = useState<string | null>(null)
  const [activeMemberTab, setActiveMemberTab] = useState<MemberTab>('exercises')
  const [audioCompletedByExercise, setAudioCompletedByExercise] = useState<Record<string, boolean>>({})

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

  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error])

  useEffect(() => {
    if (homeworkError) {
      toast.error(homeworkError)
    }
  }, [homeworkError])

  useEffect(() => {
    if (homeworkSuccess) {
      toast.success(homeworkSuccess)
    }
  }, [homeworkSuccess])

  const fetchHomework = async () => {
    try {
      setHomeworkLoading(true)
      setHomeworkError('')
      const res = await fetch('/api/member/homework-summary')
      if (!res.ok) {
        setHomeworkError('Could not load the homework list.')
        return
      }
      const data = await res.json()
      const pending = (data.allHomework || []).filter((item: HomeworkItem) => !item.submitted)
      setHomeworks(pending)
      setSelectedHomeworkId(pending[0]?.id || '')
    } catch {
      setHomeworkError('Could not load the homework list.')
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
      setError(err instanceof Error ? err.message : 'Could not load the exercises.')
    } finally {
      setLoading(false)
    }
  }

  const submitHomework = async () => {
    if (!selectedHomeworkId) {
      setHomeworkError('Please choose a homework item.')
      return
    }

    const trimmedNote = homeworkNote.trim()
    if (!trimmedNote) {
      setHomeworkError('Please enter your note before submitting.')
      return
    }

    try {
      setHomeworkError('')
      setHomeworkSuccess('')
      const res = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ homeworkId: selectedHomeworkId, description: trimmedNote })
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error || 'Could not submit the assignment.')
      }

      setHomeworkSuccess('Assignment submitted successfully.')
      setHomeworkError('')
      setHomeworkNote('')
      const remaining = homeworks.filter((item) => item.id !== selectedHomeworkId)
      setHomeworks(remaining)
      setSelectedHomeworkId(remaining[0]?.id || '')
    } catch (err) {
      setHomeworkSuccess('')
      setHomeworkError(err instanceof Error ? err.message : 'Could not submit the assignment.')
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
  }

  useEffect(() => {
    if (Object.keys(startedExerciseAt).length === 0) {
      return
    }

    const intervalId = window.setInterval(() => {
      setTimerTick(Date.now())
    }, 1000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [startedExerciseAt])

  const getExerciseDurationSeconds = (exerciseId: string) => {
    const startedAt = startedExerciseAt[exerciseId]
    if (!startedAt) {
      return 0
    }

    return Math.max(1, Math.floor((timerTick - startedAt) / 1000))
  }

  const startExercise = (exerciseId: string) => {
    setRevealedExercises((current) => ({ ...current, [exerciseId]: true }))
    setStartedExerciseAt((current) => ({
      ...current,
      [exerciseId]: Date.now()
    }))
  }

  const revealExercise = (exerciseId: string) => {
    setRevealedExercises((current) => ({ ...current, [exerciseId]: true }))
  }

  const openSubmitConfirmation = (exercise: ExerciseItem) => {
    const selectedAnswers = exerciseAnswers[exercise.id] || {}
    const missingQuestion = exercise.questions.find((question) => !selectedAnswers[question.id])

    if (missingQuestion) {
      toast.error(`Please choose an answer for question ${missingQuestion.order} before submitting.`)
      return
    }

    const durationSeconds = getExerciseDurationSeconds(exercise.id)
    if (durationSeconds <= 0) {
      toast.error('Please press Start before submitting.')
      return
    }

    if (isListeningExercise(exercise.exerciseType) && !audioCompletedByExercise[exercise.id]) {
      setListenReminderExerciseTitle(getExerciseTitle(exercise))
      return
    }

    setSubmitConfirm({ exercise, durationSeconds })
  }

  const submitExercise = async (exercise: ExerciseItem, durationSeconds: number) => {
    const selectedAnswers = exerciseAnswers[exercise.id] || {}

    if (isListeningExercise(exercise.exerciseType) && !audioCompletedByExercise[exercise.id]) {
      setListenReminderExerciseTitle(getExerciseTitle(exercise))
      return
    }

    try {
      setSubmittingExerciseId(exercise.id)
      const res = await fetch(`/api/member/exercises/${exercise.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          durationSeconds,
          answers: exercise.questions.map((question) => ({
            questionId: question.id,
            selectedOption: selectedAnswers[question.id]
          }))
        })
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error || 'Could not submit the exercise.')
      }

      toast.success(`Submitted. Current result: ${data.submission.score}/${data.submission.totalQuestions}. Time: ${formatDuration(durationSeconds)}.`)
      setSubmitConfirm(null)
      setStartedExerciseAt((current) => {
        const next = { ...current }
        delete next[exercise.id]
        return next
      })
      await fetchExercises()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not submit the exercise.')
    } finally {
      setSubmittingExerciseId(null)
    }
  }

  const primaryExerciseTypes = ['multiple_choice', 'question_response', 'conversation'] as const
  type ExerciseSection = {
    key: (typeof primaryExerciseTypes)[number] | 'other'
    title: string
    items: ExerciseItem[]
  }

  const exerciseSections: ExerciseSection[] = primaryExerciseTypes
    .map((type) => ({
      key: type,
      title: getExerciseTypeHeading(type),
      items: exercises.filter((exercise) => normalizeExerciseType(exercise.exerciseType) === type)
    }))

  const unknownTypeExercises = exercises.filter((exercise) => !primaryExerciseTypes.includes(normalizeExerciseType(exercise.exerciseType) as (typeof primaryExerciseTypes)[number]))
  if (unknownTypeExercises.length > 0) {
    exerciseSections.push({
      key: 'other',
      title: 'Other exercises',
      items: unknownTypeExercises
    })
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
        <div className="mb-6 flex flex-wrap items-center justify-end gap-3">
          <Link
            href="/"
            className="inline-flex items-center rounded-md border border-[#14532d]/35 bg-white px-4 py-2 text-sm font-semibold text-[#14532d] transition hover:bg-[#14532d]/10"
          >
            Back to home
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {session.user?.role === 'member' && (
            <div className="bg-white p-6 rounded shadow-md">
              <h2 className="text-xl font-semibold mb-4">Exercise More</h2>

              <div className="mb-6 flex flex-wrap gap-2 rounded-lg border border-gray-200 bg-gray-50 p-2">
                <button
                  type="button"
                  onClick={() => setActiveMemberTab('exercises')}
                  className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
                    activeMemberTab === 'exercises'
                      ? '-translate-y-0.5 border border-[#14532d] bg-[#14532d] text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Exercises
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMemberTab('speak')}
                  className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
                    activeMemberTab === 'speak'
                      ? '-translate-y-0.5 border border-[#14532d] bg-[#14532d] text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Speak Yourself
                </button>
              </div>

              {activeMemberTab === 'speak' ? (
                <div className="rounded-xl border border-[#14532d]/25 bg-[#14532d]/5 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="inline-flex items-center gap-2 text-lg font-bold text-[#14532d]">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
                          <path d="M7 4a3 3 0 0 1 6 0v6a3 3 0 1 1-6 0V4Z" />
                          <path d="M5.5 9.643a.75.75 0 0 0-1.5 0V10c0 3.06 2.29 5.585 5.25 5.954V17.5h-1.5a.75.75 0 0 0 0 1.5h4.5a.75.75 0 0 0 0-1.5h-1.5v-1.546A6.001 6.001 0 0 0 16 10v-.357a.75.75 0 0 0-1.5 0V10a4.5 4.5 0 0 1-9 0v-.357Z" />
                        </svg>
                        Speak Yourself
                      </h3>
                      <p className="mt-1 text-sm text-slate-600">This speaking assessment is now in its own tab for pronunciation practice.</p>
                    </div>
                    <Link
                      href="/speak-yourself"
                      className="inline-flex items-center rounded-md bg-[#14532d] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#166534]"
                    >
                      Open Speak Yourself
                    </Link>
                  </div>
                </div>
              ) : (
                <>

              {loading ? (
                <p className="text-gray-500">Loading exercises...</p>
              ) : exercises.length === 0 ? (
                <p className="text-gray-500">No exercises have been created for your course yet.</p>
              ) : (
                <div className="space-y-8">
                  {exerciseSections.map((section) => (
                    <section key={section.key} className="space-y-4">
                      <div className="border-t border-gray-200 pt-4">
                        <h3 className="text-base font-semibold text-gray-900">{section.title}</h3>
                      </div>

                      {section.items.length === 0 ? (
                        <p className="text-sm text-gray-500">No exercises in this type yet.</p>
                      ) : (
                        <div className="space-y-6">
                          {section.items.map((exercise) => (
                          <div key={exercise.id} className="rounded-xl border border-gray-200 p-5">
                      {Boolean(startedExerciseAt[exercise.id]) && (
                        <div className="mb-3 inline-flex rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                          ⏱ Time spent: {formatDuration(getExerciseDurationSeconds(exercise.id))}
                        </div>
                      )}

                      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-[#14532d]">{getExerciseTitle(exercise)}</h3>
                          {exercise.description && (
                            <p className="mt-1 text-sm text-gray-600">
                              <LinkifiedText text={exercise.description} />
                            </p>
                          )}
                          <p className="text-sm text-gray-500">
                            {Object.keys(exerciseAnswers[exercise.id] || {}).length}/{exercise.questions.length} questions answered
                          </p>
                        </div>
                        {exercise.submission ? (
                          <div className="rounded-lg bg-[#14532d]/10 px-4 py-3 text-sm text-[#14532d]">
                            <p className="font-semibold">Latest score: {exercise.submission.score}/{exercise.submission.totalQuestions}</p>
                            {exercise.submission.durationSeconds !== null && (
                              <p>Time taken: {formatDuration(exercise.submission.durationSeconds)}</p>
                            )}
                            <p>Submitted at: {new Date(exercise.submission.submittedAt).toLocaleString('en-GB')}</p>
                          </div>
                        ) : (
                          <span className="inline-flex w-fit rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800">Not submitted yet</span>
                        )}
                      </div>

                      {!revealedExercises[exercise.id] ? (
                        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                          <p className="p-3 sm:p-4 text-xs sm:text-sm text-blue-800">
                            {normalizeExerciseType(exercise.exerciseType) === 'multiple_choice'
                              ? 'Nhấn bắt đầu để mở bài tập và bắt đầu tính giờ.'
                              : 'Nhấn bắt đầu để mở bài nghe. Bộ đếm thời gian sẽ bắt đầu khi bạn nhấn ▶ phát audio.'}
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              if (normalizeExerciseType(exercise.exerciseType) === 'multiple_choice') {
                                startExercise(exercise.id)
                              } else {
                                revealExercise(exercise.id)
                              }
                            }}
                            className="mt-2 w-full rounded-lg bg-blue-700 px-4 py-2 sm:px-5 sm:py-3 text-sm sm:text-base font-medium text-white hover:bg-blue-800 cursor-pointer disabled:opacity-50"
                          >
                            {exercise.submission ? 'Retry' : 'Bắt đầu'}
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {(normalizeExerciseType(exercise.exerciseType) === 'question_response' || normalizeExerciseType(exercise.exerciseType) === 'conversation') && exercise.audioFileUrl && (
                            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                              <p className="mb-3 text-sm font-medium text-emerald-900">
                                {startedExerciseAt[exercise.id]
                                  ? 'Đang nghe — không thể tua hoặc dừng audio.'
                                  : 'Nhấn ▶ để nghe và bắt đầu tính giờ. Sau khi phát, không thể dừng hoặc tua lại.'}
                              </p>
                              <div className="relative">
                                <audio
                                  controls
                                  preload="metadata"
                                  className="w-full"
                                  onPlay={() => {
                                    if (!startedExerciseAt[exercise.id]) {
                                      startExercise(exercise.id)
                                    }
                                    setAudioCompletedByExercise((current) => ({
                                      ...current,
                                      [exercise.id]: false
                                    }))
                                  }}
                                  onEnded={() => {
                                    setAudioCompletedByExercise((current) => ({
                                      ...current,
                                      [exercise.id]: true
                                    }))
                                  }}
                                  onPause={(e) => {
                                    const audio = e.currentTarget
                                    if (startedExerciseAt[exercise.id] && !audio.ended) {
                                      void audio.play()
                                    }
                                  }}
                                >
                                  <source src={exercise.audioFileUrl} />
                                </audio>
                                {startedExerciseAt[exercise.id] && (
                                  <div
                                    className="absolute inset-0 z-10 cursor-not-allowed"
                                    title="Audio controls are locked after the first play."
                                    aria-hidden="true"
                                  />
                                )}
                              </div>
                            </div>
                          )}

                          {exercise.attachmentFileUrl && (
                            <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 flex items-center justify-between gap-3">
                              <p className="text-sm text-blue-800">Tài liệu từ vựng đính kèm</p>
                              <a
                                href={exercise.attachmentFileUrl}
                                download
                                className="inline-flex items-center gap-1 rounded bg-blue-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-800"
                              >
                                Tải về
                              </a>
                            </div>
                          )}

                          {exercise.questions.map((question) => {
                            const isQuestionResponse = normalizeExerciseType(exercise.exerciseType) === 'question_response'
                            const options = isQuestionResponse
                              ? [{ key: 'A', text: question.optionA }, { key: 'B', text: question.optionB }, { key: 'C', text: question.optionC }]
                              : getExerciseQuestionOptions(question)

                            return (
                              <div key={question.id} className="rounded-lg bg-gray-50 p-4 border border-gray-100">
                                {isQuestionResponse ? (
                                  <p className="font-semibold text-gray-900 mb-1">Câu {question.order}</p>
                                ) : (
                                  <p className="font-semibold text-gray-900">{question.order}. {question.question}</p>
                                )}
                                <div className={`mt-2 sm:mt-3 grid gap-2 ${isQuestionResponse ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-4'}`}>
                                  {options.map((option) => {
                                    const selectedOption = exerciseAnswers[exercise.id]?.[question.id]
                                    const isSelected = selectedOption === option.key

                                    return (
                                      <button
                                        key={`${question.id}-${option.key}`}
                                        type="button"
                                        onClick={() => updateExerciseAnswer(exercise.id, question.id, option.key)}
                                        className={`rounded-lg border px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm transition cursor-pointer ${
                                          isSelected
                                            ? 'border-[#14532d] bg-[#14532d]/10 text-[#14532d]'
                                            : 'border-gray-200 bg-white text-gray-700 hover:border-[#14532d]/40'
                                        } disabled:opacity-50`}
                                      >
                                        <span className="mb-1 block font-semibold">{option.key}.</span>
                                        <span>{option.text}</span>
                                      </button>
                                    )
                                  })}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}

                      <div className="mt-4 sm:mt-5 flex flex-col gap-2 sm:gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs sm:text-sm text-gray-500">Update your answers and resubmit if you improve your result.</p>
                        <button
                          type="button"
                          onClick={() => openSubmitConfirmation(exercise)}
                          disabled={submittingExerciseId === exercise.id || !startedExerciseAt[exercise.id]}
                          className="w-full sm:w-auto rounded-lg bg-[#14532d] px-4 py-2 sm:px-5 sm:py-3 text-sm sm:text-base font-medium text-white hover:bg-[#166534] disabled:opacity-50 cursor-pointer"
                        >
                          {submittingExerciseId === exercise.id ? 'Submitting...' : exercise.submission ? 'Resubmit Exercise' : 'Submit Exercise'}
                        </button>
                      </div>
                          </div>
                          ))}
                        </div>
                      )}
                    </section>
                  ))}
                </div>
              )}
                </>
              )}
            </div>
          )}

          {session.user?.role === 'admin' && (
            <div className="bg-[#14532d]/10 border border-[#14532d]/25 p-6 rounded shadow-md">
              <h2 className="text-xl font-semibold mb-2 text-[#14532d]">Admin Access</h2>
              <p className="text-gray-700 mb-4">You have administrator access. Open the management dashboard.</p>
              <Link
                href="/admin"
                className="px-4 py-2 bg-[#14532d] text-white rounded hover:bg-[#166534] inline-block"
              >
                Open Admin Dashboard
              </Link>
            </div>
          )}
        </div>

        {submitConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent p-4">
            <div className="w-full max-w-md rounded-lg border border-[#14532d]/40 bg-white p-6 shadow-lg">
              <h3 className="text-lg font-bold text-gray-900">Confirm Exercise Submission</h3>
              <p className="mt-3 text-sm text-gray-700">
                You worked on {getExerciseTitle(submitConfirm.exercise)} for <span className="font-semibold text-[#14532d]">{formatDuration(submitConfirm.durationSeconds)}</span>.
                Do you want to submit this result?
              </p>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSubmitConfirm(null)}
                  disabled={submittingExerciseId === submitConfirm.exercise.id}
                  className="rounded bg-gray-200 px-4 py-2 text-gray-800 hover:bg-gray-300 disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => submitExercise(submitConfirm.exercise, submitConfirm.durationSeconds)}
                  disabled={submittingExerciseId === submitConfirm.exercise.id}
                  className="rounded bg-[#14532d] px-4 py-2 text-white hover:bg-[#166534] disabled:opacity-50"
                >
                  {submittingExerciseId === submitConfirm.exercise.id ? 'Sending...' : 'Send result'}
                </button>
              </div>
            </div>
          </div>
        )}

        {listenReminderExerciseTitle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 p-4">
            <div className="w-full max-w-md rounded-lg border border-amber-300 bg-white p-6 shadow-lg">
              <h3 className="text-lg font-bold text-amber-800">Chưa nghe hết audio</h3>
              <p className="mt-3 text-sm text-gray-700">
                Bạn cần nghe hết file audio của <span className="font-semibold">{listenReminderExerciseTitle}</span> trước khi nhấn submit.
              </p>
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setListenReminderExerciseTitle(null)}
                  className="rounded bg-[#14532d] px-4 py-2 text-white hover:bg-[#166534]"
                >
                  Tiếp tục nghe
                </button>
              </div>
            </div>
          </div>
        )}



        {showHomeworkModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="rounded border border-[#14532d]/40 bg-white shadow-lg p-6 max-w-md w-full">
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
                <p className="text-gray-500 mb-4">Loading homework list...</p>
              ) : (
                <>
                  {homeworks.length === 0 ? (
                    <p className="text-[#14532d] mb-4">Nice work. You have completed all of your homework.</p>
                  ) : (
                    <select
                      value={selectedHomeworkId}
                      onChange={(e) => setSelectedHomeworkId(e.target.value)}
                      className="w-full p-2 mb-4 border rounded"
                    >
                      {homeworks.map((homework) => (
                        <option key={homework.id} value={homework.id}>
                          {homework.title} - Due {new Date(homework.dueDate).toLocaleDateString('en-GB')}
                        </option>
                      ))}
                    </select>
                  )}

                  <textarea
                    placeholder="Submission note"
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
