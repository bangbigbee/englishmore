'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

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

const INITIAL_FORM: SpeakYourselfForm = {
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

export default function SpeakYourselfPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [speakForm, setSpeakForm] = useState<SpeakYourselfForm>(INITIAL_FORM)
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
      return
    }

    if (status !== 'authenticated') {
      return
    }

    if (session?.user?.role === 'admin') {
      router.push('/admin')
      return
    }

    if (session?.user?.role !== 'member') {
      router.push('/')
      return
    }

    void fetchSpeakStatus()
  }, [status, session?.user?.role, router])

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

  const fetchSpeakStatus = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/member/exercises')
      if (!res.ok) {
        throw new Error('Could not load Speak Yourself status.')
      }

      const data = await res.json()
      const nextSpeakStatus = (data.speakYourself || { hasPassed: false, latestAttempt: null }) as SpeakYourselfStatus
      setSpeakStatus(nextSpeakStatus)

      if (nextSpeakStatus.latestAttempt) {
        setGeneratedSpeakScript(nextSpeakStatus.latestAttempt.generatedScript)
        setSpokenText(nextSpeakStatus.latestAttempt.recognizedText)
        setSpeakAccuracy(nextSpeakStatus.latestAttempt.accuracy)
        setSpeakResult(nextSpeakStatus.latestAttempt.passed ? 'pass' : 'retry')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not load Speak Yourself status.')
    } finally {
      setLoading(false)
    }
  }

  const updateSpeakFormField = (field: keyof SpeakYourselfForm, value: string) => {
    setSpeakForm((current) => ({ ...current, [field]: value }))
  }

  const generateSpeakScript = () => {
    const requiredFields: Array<{ field: keyof SpeakYourselfForm; label: string }> = [
      { field: 'fullName', label: 'Full name' },
      { field: 'age', label: 'Age' },
      { field: 'hometown', label: 'Hometown' },
      { field: 'major', label: 'Background / Major' },
      { field: 'currentJob', label: 'Current job' },
      { field: 'yearsOfExperience', label: 'Years of experience' },
      { field: 'hobbies', label: 'Hobbies' },
      { field: 'traitOne', label: 'Trait word 1' },
      { field: 'traitTwo', label: 'Trait word 2' },
      { field: 'traitThree', label: 'Trait word 3' },
      { field: 'reasonToJoin', label: 'Reason to join' }
    ]

    const missingFields = requiredFields
      .filter(({ field }) => !String(speakForm[field] || '').trim())
      .map(({ label }) => label)

    if (missingFields.length > 0) {
      toast.error(`Please complete all required fields: ${missingFields.join(', ')}`)
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
    toast.success('Your introduction script is ready. Press Record to start speaking practice.')
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
        toast.success(`Pass! Pronunciation accuracy: ${attempt?.accuracy ?? 0}%`)
      } else {
        toast.error(`Current accuracy is ${attempt?.accuracy ?? 0}%. You need at least 80%, please try again.`)
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not evaluate Speak Yourself.')
    }
  }

  const startSpeakRecording = () => {
    if (!generatedSpeakScript) {
      toast.error('Please generate the script before recording.')
      return
    }

    if (!speechSupported || typeof window === 'undefined') {
      toast.error('This browser does not support speech recognition. Please use the latest Chrome or Edge.')
      return
    }

    const speechWindow = window as Window & {
      SpeechRecognition?: new () => BrowserSpeechRecognition
      webkitSpeechRecognition?: new () => BrowserSpeechRecognition
    }
    const RecognitionConstructor = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition

    if (!RecognitionConstructor) {
      toast.error('Speech recognition is not available in this browser.')
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
      toast.error('Recording failed. Please check microphone permissions and try again.')
    }

    recognition.onend = () => {
      setIsRecordingSpeak(false)
      const finalTranscript = spokenTextRef.current.trim()
      if (!finalTranscript) {
        toast.error('No speech was recognized. Please speak clearly and try again.')
        return
      }

      void submitSpeakAttempt(finalTranscript)
    }

    speechRecognitionRef.current = recognition

    try {
      setIsRecordingSpeak(true)
      recognition.start()
      toast.success('Recording... Please read your Speak Yourself script.')
    } catch {
      setIsRecordingSpeak(false)
      toast.error('Could not start recording. Please try again.')
    }
  }

  const stopSpeakRecording = () => {
    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.stop()
    }
  }

  if (status === 'loading' || loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!session || session.user?.role !== 'member') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-[#14532d]">Speak Yourself</h1>
            <p className="mt-1 text-sm text-slate-600">Build your personal introduction script and pass with pronunciation accuracy of at least 80%.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard" className="inline-flex items-center rounded-md border border-blue-700 bg-white px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50">
              Go to exercises
            </Link>
            <Link href="/" className="inline-flex items-center rounded-md border border-[#14532d]/35 bg-white px-4 py-2 text-sm font-semibold text-[#14532d] transition hover:bg-[#14532d]/10">
              Back to home
            </Link>
          </div>
        </div>

        <div className="rounded-xl border border-[#14532d]/25 bg-white p-6 shadow-sm">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-[#14532d]">Speaking Assessment</h2>
              <p className="mt-1 text-sm text-slate-600">Enter your profile, generate your script, then record and submit your speech.</p>
            </div>
            {!speechSupported && (
              <span className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                This browser does not support speech recording
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <input value={speakForm.fullName} onChange={(event) => updateSpeakFormField('fullName', event.target.value)} placeholder="Full name" className="rounded border border-gray-300 px-3 py-2 text-sm" />
            <input value={speakForm.age} onChange={(event) => updateSpeakFormField('age', event.target.value)} placeholder="Age" className="rounded border border-gray-300 px-3 py-2 text-sm" />
            <input value={speakForm.hometown} onChange={(event) => updateSpeakFormField('hometown', event.target.value)} placeholder="Hometown" className="rounded border border-gray-300 px-3 py-2 text-sm" />
            <input value={speakForm.major} onChange={(event) => updateSpeakFormField('major', event.target.value)} placeholder="Background / Major" className="rounded border border-gray-300 px-3 py-2 text-sm" />
            <input value={speakForm.currentJob} onChange={(event) => updateSpeakFormField('currentJob', event.target.value)} placeholder="Current job" className="rounded border border-gray-300 px-3 py-2 text-sm" />
            <input value={speakForm.yearsOfExperience} onChange={(event) => updateSpeakFormField('yearsOfExperience', event.target.value)} placeholder="Years of experience" className="rounded border border-gray-300 px-3 py-2 text-sm" />
            <input value={speakForm.hobbies} onChange={(event) => updateSpeakFormField('hobbies', event.target.value)} placeholder="Hobbies" className="rounded border border-gray-300 px-3 py-2 text-sm md:col-span-2" />
            <input value={speakForm.traitOne} onChange={(event) => updateSpeakFormField('traitOne', event.target.value)} placeholder="Trait word 1" className="rounded border border-gray-300 px-3 py-2 text-sm" />
            <input value={speakForm.traitTwo} onChange={(event) => updateSpeakFormField('traitTwo', event.target.value)} placeholder="Trait word 2" className="rounded border border-gray-300 px-3 py-2 text-sm" />
            <input value={speakForm.traitThree} onChange={(event) => updateSpeakFormField('traitThree', event.target.value)} placeholder="Trait word 3" className="rounded border border-gray-300 px-3 py-2 text-sm md:col-span-2" />
            <textarea
              value={speakForm.reasonToJoin}
              onChange={(event) => updateSpeakFormField('reasonToJoin', event.target.value)}
              placeholder="Reason for joining the course"
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
              Generate script
            </button>
            <button
              type="button"
              onClick={isRecordingSpeak ? stopSpeakRecording : startSpeakRecording}
              disabled={!speechSupported || !generatedSpeakScript}
              className="rounded bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isRecordingSpeak ? 'Stop recording' : 'Record'}
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
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Recognized speech</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">{spokenText}</p>
            </div>
          )}

          {speakAccuracy !== null && (
            <div className={`mt-4 rounded-lg border p-4 ${speakResult === 'pass' ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-amber-300 bg-amber-50 text-amber-800'}`}>
              <p className="text-sm font-semibold">Current accuracy: {speakAccuracy}%</p>
              <p className="mt-1 text-sm">{speakResult === 'pass' ? 'Pass. You reached the required score of at least 80%.' : 'Not passed yet. You need at least 80%, please try again.'}</p>
            </div>
          )}

          {!speakStatus.hasPassed && (
            <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
              You have not passed Speak Yourself yet. Multiple-choice exercises remain locked until you pass.
            </div>
          )}

          {speakStatus.hasPassed && (
            <div className="mt-4 rounded-lg border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-800">
              You passed Speak Yourself. You can now continue to all multiple-choice exercises.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
