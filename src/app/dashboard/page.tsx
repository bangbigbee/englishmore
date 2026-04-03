'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
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
  }>
}

interface SpeakYourselfStatus {
  hasPassed: boolean
  latestAttempt: {
    id: string
    accuracy: number
    passed: boolean
    createdAt: string
    generatedScript: string
    recognizedText: string
  } | null
}

interface SpeakYourselfForm {
  fullName: string
  age: string
  hometown: string
  major: string
  currentJob: string
  yearsOfExperience: string
  hobbies: string
  traitOne: string
  traitTwo: string
  traitThree: string
  reasonToJoin: string
}

interface BrowserSpeechRecognition {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  onresult: ((event: unknown) => void) | null
  onerror: ((event: unknown) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}

const SPEAK_YOURSELF_INITIAL_FORM: SpeakYourselfForm = {
  fullName: '',
  age: '',
  hometown: '',
  major: '',
  currentJob: '',
  yearsOfExperience: '',
  hobbies: '',
  traitOne: '',
  traitTwo: '',
  traitThree: '',
  reasonToJoin: ''
}

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
  const [timerTick, setTimerTick] = useState(() => Date.now())
  const [submitConfirm, setSubmitConfirm] = useState<{ exercise: ExerciseItem; durationSeconds: number } | null>(null)
  const [speakForm, setSpeakForm] = useState<SpeakYourselfForm>(SPEAK_YOURSELF_INITIAL_FORM)
  const [generatedSpeakScript, setGeneratedSpeakScript] = useState('')
  const [spokenText, setSpokenText] = useState('')
  const [speakAccuracy, setSpeakAccuracy] = useState<number | null>(null)
  const [speakResult, setSpeakResult] = useState<'pass' | 'retry' | null>(null)
  const [speakStatus, setSpeakStatus] = useState<SpeakYourselfStatus>({ hasPassed: false, latestAttempt: null })
  const [isRecordingSpeak, setIsRecordingSpeak] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(false)
  const speechRecognitionRef = useRef<BrowserSpeechRecognition | null>(null)
  const spokenTextRef = useRef('')

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

  useEffect(() => {
    if (typeof window === 'undefined') return

    const speechWindow = window as Window & {
      SpeechRecognition?: new () => BrowserSpeechRecognition
      webkitSpeechRecognition?: new () => BrowserSpeechRecognition
    }

    setSpeechSupported(Boolean(speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition))

    return () => {
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop()
      }
    }
  }, [])

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
      const nextSpeakStatus = (data.speakYourself || { hasPassed: false, latestAttempt: null }) as SpeakYourselfStatus
      setSpeakStatus(nextSpeakStatus)

      if (nextSpeakStatus.latestAttempt) {
        setGeneratedSpeakScript(nextSpeakStatus.latestAttempt.generatedScript)
        setSpokenText(nextSpeakStatus.latestAttempt.recognizedText)
        setSpeakAccuracy(nextSpeakStatus.latestAttempt.accuracy)
        setSpeakResult(nextSpeakStatus.latestAttempt.passed ? 'pass' : 'retry')
      }

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
    const targetExercise = exercises.find((item) => item.id === exerciseId)
    if (targetExercise?.isLocked) {
      toast.error('Please pass Speak Yourself with at least 80% before moving to the next exercise.')
      return
    }

    setStartedExerciseAt((current) => ({
      ...current,
      [exerciseId]: Date.now()
    }))
  }

  const openSubmitConfirmation = (exercise: ExerciseItem) => {
    if (exercise.isLocked) {
      toast.error('Exercise is locked. Please pass Speak Yourself first.')
      return
    }

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

    setSubmitConfirm({ exercise, durationSeconds })
  }

  const submitExercise = async (exercise: ExerciseItem, durationSeconds: number) => {
    const selectedAnswers = exerciseAnswers[exercise.id] || {}

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

  const updateSpeakFormField = (field: keyof SpeakYourselfForm, value: string) => {
    setSpeakForm((current) => ({ ...current, [field]: value }))
  }

  const generateSpeakScript = () => {
    const requiredFields: Array<{ field: keyof SpeakYourselfForm; label: string }> = [
      { field: 'fullName', label: 'Tên' },
      { field: 'age', label: 'Tuổi' },
      { field: 'hometown', label: 'Quê quán' },
      { field: 'major', label: 'Background/Major' },
      { field: 'currentJob', label: 'Công việc hiện tại' },
      { field: 'yearsOfExperience', label: 'Số năm kinh nghiệm' },
      { field: 'hobbies', label: 'Sở thích' },
      { field: 'traitOne', label: 'Từ mô tả 1' },
      { field: 'traitTwo', label: 'Từ mô tả 2' },
      { field: 'traitThree', label: 'Từ mô tả 3' },
      { field: 'reasonToJoin', label: 'Lý do tham gia khóa học' }
    ]

    const missingFields = requiredFields
      .filter(({ field }) => !String(speakForm[field] || '').trim())
      .map(({ label }) => label)

    if (missingFields.length > 0) {
      toast.error(`Vui lòng nhập đầy đủ: ${missingFields.join(', ')}`)
      return
    }

    const script = [
      `Hello everyone. My name is ${speakForm.fullName.trim()}.`,
      `I am ${speakForm.age.trim()} years old, and I come from ${speakForm.hometown.trim()}.`,
      `My background is ${speakForm.major.trim()}.`,
      `I currently work as ${speakForm.currentJob.trim()}, and I have ${speakForm.yearsOfExperience.trim()} years of experience.`,
      `In my free time, I enjoy ${speakForm.hobbies.trim()}.`,
      `Three words that describe me are ${speakForm.traitOne.trim()}, ${speakForm.traitTwo.trim()}, and ${speakForm.traitThree.trim()}.`,
      `I joined this course because ${speakForm.reasonToJoin.trim()}.`,
      'Thank you for listening.'
    ].join(' ')

    setGeneratedSpeakScript(script)
    setSpokenText('')
    spokenTextRef.current = ''
    setSpeakAccuracy(null)
    setSpeakResult(null)
    toast.success('Đã tạo script giới thiệu. Bấm Ghi âm để bắt đầu luyện nói.')
  }

  const submitSpeakAttempt = async (recognizedScript: string) => {
    try {
      const res = await fetch('/api/member/exercises/speak-yourself', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: speakForm,
          spokenText: recognizedScript
        })
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data?.error || 'Could not evaluate Speak Yourself.')
      }

      const attempt = data.attempt as SpeakYourselfStatus['latestAttempt']
      const passed = Boolean(data.hasPassed)
      setSpeakStatus({
        hasPassed: passed,
        latestAttempt: attempt || null
      })

      if (attempt) {
        setGeneratedSpeakScript(attempt.generatedScript)
        setSpokenText(attempt.recognizedText)
        setSpeakAccuracy(attempt.accuracy)
        setSpeakResult(passed ? 'pass' : 'retry')
      }

      if (passed) {
        toast.success(`Pass! Do chinh xac phat am: ${attempt?.accuracy ?? 0}%`)
      } else {
        toast.error(`Do chinh xac hien tai ${attempt?.accuracy ?? 0}%. Ban can dat tu 80% tro len, hay thu lai.`)
      }

      await fetchExercises()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not evaluate Speak Yourself.')
    }
  }

  const startSpeakRecording = () => {
    if (!generatedSpeakScript) {
      toast.error('Vui lòng tạo script trước khi ghi âm.')
      return
    }

    if (!speechSupported || typeof window === 'undefined') {
      toast.error('Trình duyệt này chưa hỗ trợ SpeechRecognition. Hãy dùng Chrome hoặc Edge bản mới nhất.')
      return
    }

    const speechWindow = window as Window & {
      SpeechRecognition?: new () => BrowserSpeechRecognition
      webkitSpeechRecognition?: new () => BrowserSpeechRecognition
    }
    const RecognitionConstructor = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition

    if (!RecognitionConstructor) {
      toast.error('Không tìm thấy công cụ ghi âm trong trình duyệt.')
      return
    }

    const recognition = new RecognitionConstructor()
    recognition.lang = 'en-US'
    recognition.continuous = false
    recognition.interimResults = true
    recognition.maxAlternatives = 1

    spokenTextRef.current = ''
    setSpokenText('')
    setSpeakAccuracy(null)
    setSpeakResult(null)

    recognition.onresult = (event: unknown) => {
      const resultEvent = event as { results?: ArrayLike<ArrayLike<{ transcript?: string }>> }
      const results = resultEvent.results
      if (!results) return

      const transcript = Array.from(results)
        .map((result) => result?.[0]?.transcript || '')
        .join(' ')
        .trim()

      spokenTextRef.current = transcript
      setSpokenText(transcript)
    }

    recognition.onerror = () => {
      setIsRecordingSpeak(false)
      toast.error('Không thể ghi âm. Vui lòng kiểm tra quyền micro rồi thử lại.')
    }

    recognition.onend = () => {
      setIsRecordingSpeak(false)
      const finalTranscript = spokenTextRef.current.trim()
      if (!finalTranscript) {
        toast.error('Không nhận diện được giọng nói. Vui lòng nói rõ hơn và thử lại.')
        return
      }

      void submitSpeakAttempt(finalTranscript)
    }

    speechRecognitionRef.current = recognition

    try {
      setIsRecordingSpeak(true)
      recognition.start()
      toast.success('Đang ghi âm... Hãy đọc script Speak Yourself của bạn.')
    } catch {
      setIsRecordingSpeak(false)
      toast.error('Không thể bắt đầu ghi âm. Vui lòng thử lại.')
    }
  }

  const stopSpeakRecording = () => {
    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.stop()
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
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold mb-2">Practice Zone</h1>
            <p className="text-lg">Hello, <span className="font-semibold">{session.user.name || session.user.email}</span></p>
          </div>
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
              <h2 className="text-xl font-semibold mb-4">Exercises</h2>

              <div className="mb-6 rounded-xl border border-[#14532d]/25 bg-[#14532d]/5 p-5">
                <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-[#14532d]">Bai 1</p>
                    <h3 className="text-lg font-bold text-[#14532d]">Speak Yourself</h3>
                    <p className="mt-1 text-sm text-slate-600">Nhap thong tin ca nhan, he thong se tao script tu gioi thieu. Ban ghi am va can dat tu 80% de pass.</p>
                  </div>
                  {!speechSupported && (
                    <span className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                      Browser chua ho tro ghi am
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <input value={speakForm.fullName} onChange={(event) => updateSpeakFormField('fullName', event.target.value)} placeholder="Ten" className="rounded border border-gray-300 px-3 py-2 text-sm" />
                  <input value={speakForm.age} onChange={(event) => updateSpeakFormField('age', event.target.value)} placeholder="Tuoi" className="rounded border border-gray-300 px-3 py-2 text-sm" />
                  <input value={speakForm.hometown} onChange={(event) => updateSpeakFormField('hometown', event.target.value)} placeholder="Que quan" className="rounded border border-gray-300 px-3 py-2 text-sm" />
                  <input value={speakForm.major} onChange={(event) => updateSpeakFormField('major', event.target.value)} placeholder="Background / Major" className="rounded border border-gray-300 px-3 py-2 text-sm" />
                  <input value={speakForm.currentJob} onChange={(event) => updateSpeakFormField('currentJob', event.target.value)} placeholder="Cong viec hien tai" className="rounded border border-gray-300 px-3 py-2 text-sm" />
                  <input value={speakForm.yearsOfExperience} onChange={(event) => updateSpeakFormField('yearsOfExperience', event.target.value)} placeholder="So nam kinh nghiem" className="rounded border border-gray-300 px-3 py-2 text-sm" />
                  <input value={speakForm.hobbies} onChange={(event) => updateSpeakFormField('hobbies', event.target.value)} placeholder="So thich" className="rounded border border-gray-300 px-3 py-2 text-sm md:col-span-2" />
                  <input value={speakForm.traitOne} onChange={(event) => updateSpeakFormField('traitOne', event.target.value)} placeholder="Tu mo ta 1" className="rounded border border-gray-300 px-3 py-2 text-sm" />
                  <input value={speakForm.traitTwo} onChange={(event) => updateSpeakFormField('traitTwo', event.target.value)} placeholder="Tu mo ta 2" className="rounded border border-gray-300 px-3 py-2 text-sm" />
                  <input value={speakForm.traitThree} onChange={(event) => updateSpeakFormField('traitThree', event.target.value)} placeholder="Tu mo ta 3" className="rounded border border-gray-300 px-3 py-2 text-sm md:col-span-2" />
                  <textarea
                    value={speakForm.reasonToJoin}
                    onChange={(event) => updateSpeakFormField('reasonToJoin', event.target.value)}
                    placeholder="Ly do tham gia khoa hoc"
                    rows={3}
                    className="rounded border border-gray-300 px-3 py-2 text-sm md:col-span-2"
                  />
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={generateSpeakScript}
                    className="rounded bg-[#14532d] px-4 py-2 text-sm font-semibold text-white hover:bg-[#166534]"
                  >
                    Tao script
                  </button>
                  <button
                    type="button"
                    onClick={isRecordingSpeak ? stopSpeakRecording : startSpeakRecording}
                    disabled={!speechSupported || !generatedSpeakScript}
                    className="rounded bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isRecordingSpeak ? 'Dung ghi am' : 'Ghi am'}
                  </button>
                </div>

                {generatedSpeakScript && (
                  <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Script</p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-800">{generatedSpeakScript}</p>
                  </div>
                )}

                {spokenText && (
                  <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Noi dung he thong nghe duoc</p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-700">{spokenText}</p>
                  </div>
                )}

                {speakAccuracy !== null && (
                  <div className={`mt-4 rounded-lg border p-4 ${speakResult === 'pass' ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-amber-300 bg-amber-50 text-amber-800'}`}>
                    <p className="text-sm font-semibold">Do chinh xac hien tai: {speakAccuracy}%</p>
                    <p className="mt-1 text-sm">{speakResult === 'pass' ? 'Pass. Ban da dat yeu cau tu 80% tro len.' : 'Chua dat. Ban can dat tu 80% tro len, vui long thu lai.'}</p>
                  </div>
                )}

                {!speakStatus.hasPassed && (
                  <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
                    Ban chua pass Speak Yourself. Cac bai trac nghiem ben duoi dang bi khoa cho den khi ban dat toi thieu 80%.
                  </div>
                )}
              </div>

              <div className="mb-4 border-t border-gray-200 pt-4">
                <h3 className="text-base font-semibold text-gray-900">Bai trac nghiem</h3>
              </div>

              {loading ? (
                <p className="text-gray-500">Loading exercises...</p>
              ) : exercises.length === 0 ? (
                <p className="text-gray-500">No exercises have been created for your course yet.</p>
              ) : (
                <div className="space-y-6">
                  {exercises.map((exercise) => (
                    <div key={exercise.id} className="rounded-xl border border-gray-200 p-5">
                      {exercise.isLocked && (
                        <div className="mb-3 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800">
                          This exercise is locked until you pass Speak Yourself with at least 80 percent.
                        </div>
                      )}

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

                      {!startedExerciseAt[exercise.id] ? (
                        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                        <p className="rounded-lg border border-blue-200 bg-blue-50 p-3 sm:p-4 text-xs sm:text-sm text-blue-800">Press the button below to begin the exercise and start the timer.</p>
                          <button
                            type="button"
                            onClick={() => startExercise(exercise.id)}
                            disabled={Boolean(exercise.isLocked)}
                            className="w-full rounded-lg bg-blue-700 px-4 py-2 sm:px-5 sm:py-3 text-sm sm:text-base font-medium text-white hover:bg-blue-800 cursor-pointer disabled:opacity-50"
                          >
                            {exercise.submission ? 'Retry' : 'Start'}
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {exercise.questions.map((question) => (
                            <div key={question.id} className="rounded-lg bg-gray-50 p-4 border border-gray-100">
                              <p className="font-semibold text-gray-900">{question.order}. {question.question}</p>
                              <div className="mt-2 sm:mt-3 grid gap-2 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
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
                                      disabled={Boolean(exercise.isLocked)}
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
                          ))}
                        </div>
                      )}

                      <div className="mt-4 sm:mt-5 flex flex-col gap-2 sm:gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs sm:text-sm text-gray-500">Update your answers and resubmit if you improve your result.</p>
                        <button
                          type="button"
                          onClick={() => openSubmitConfirmation(exercise)}
                          disabled={Boolean(exercise.isLocked) || submittingExerciseId === exercise.id || !startedExerciseAt[exercise.id]}
                          className="w-full sm:w-auto rounded-lg bg-[#14532d] px-4 py-2 sm:px-5 sm:py-3 text-sm sm:text-base font-medium text-white hover:bg-[#166534] disabled:opacity-50 cursor-pointer"
                        >
                          {submittingExerciseId === exercise.id ? 'Submitting...' : exercise.submission ? 'Resubmit Exercise' : 'Submit Exercise'}
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
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
