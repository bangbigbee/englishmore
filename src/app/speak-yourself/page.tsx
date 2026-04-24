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
    profilePayload?: Partial<SpeakYourselfForm> | null
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

interface SpeechResultItem {
  transcript?: string
}

interface SpeechResult extends ArrayLike<SpeechResultItem> {
  isFinal: boolean
}

interface SpeechResultEvent {
  results: ArrayLike<SpeechResult>
  resultIndex: number
}

interface BrowserSpeechRecognition {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  onresult: ((event: SpeechResultEvent) => void) | null
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
  const [isRecordingSpeak, setIsRecordingSpeak] = useState(false)
  const [isSubmittingSpeak, setIsSubmittingSpeak] = useState(false)
  const [interimText, setInterimText] = useState('')
  const [generatingScript, setGeneratingScript] = useState(false)
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

      if (nextSpeakStatus.latestAttempt) {
        setGeneratedSpeakScript(nextSpeakStatus.latestAttempt.generatedScript)
        setSpokenText(nextSpeakStatus.latestAttempt.recognizedText)
        setSpeakAccuracy(nextSpeakStatus.latestAttempt.accuracy)
        setSpeakResult(nextSpeakStatus.latestAttempt.passed ? 'pass' : 'retry')
        // Restore form so user can re-record without re-filling all fields
        const saved = nextSpeakStatus.latestAttempt.profilePayload
        if (saved) {
          setSpeakForm((current) => ({
            fullName: String(saved.fullName || current.fullName),
            age: String(saved.age || current.age),
            hometown: String(saved.hometown || current.hometown),
            major: String(saved.major || current.major),
            currentJob: String(saved.currentJob || current.currentJob),
            yearsOfExperience: String(saved.yearsOfExperience || current.yearsOfExperience),
            hobbies: String(saved.hobbies || current.hobbies),
            traitOne: String(saved.traitOne || current.traitOne),
            traitTwo: String(saved.traitTwo || current.traitTwo),
            traitThree: String(saved.traitThree || current.traitThree),
            reasonToJoin: String(saved.reasonToJoin || current.reasonToJoin)
          }))
        }
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

  const generateSpeakScript = async () => {
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

    try {
      setGeneratingScript(true)
      const res = await fetch('/api/member/exercises/speak-yourself/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: speakForm })
      })
      const data = await res.json().catch(() => ({})) as {
        script?: string
        error?: string
        source?: 'ai' | 'template'
        warning?: string
      }
      if (!res.ok) throw new Error(data?.error || 'Could not generate script.')
      setGeneratedSpeakScript(data.script ?? '')
      setSpokenText('')
      setInterimText('')
      spokenTextRef.current = ''
      setSpeakAccuracy(null)
      setSpeakResult(null)
      if (data.source === 'template') {
        toast.warning(data.warning || 'Using template mode. Add or verify OPENAI_API_KEY to get AI-polished grammar.')
      }
      toast.success('Your introduction script is ready. Press Record to start speaking practice.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not generate script.')
    } finally {
      setGeneratingScript(false)
    }
  }

  const submitSpeakAttempt = async (recognizedScript: string) => {
    setIsSubmittingSpeak(true)
    try {
      const res = await fetch('/api/member/exercises/speak-yourself', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: speakForm,
          generatedScript: generatedSpeakScript,
          spokenText: recognizedScript
        })
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data?.error || 'Could not evaluate Speak Yourself.')
      }

      const attempt = data.attempt as SpeakYourselfStatus['latestAttempt']
      const passed = Boolean(data.hasPassed)
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
    } finally {
      setIsSubmittingSpeak(false)
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
    recognition.continuous = true
    recognition.interimResults = true
    recognition.maxAlternatives = 1

    spokenTextRef.current = ''
    setSpokenText('')
    setInterimText('')
    setSpeakAccuracy(null)
    setSpeakResult(null)

    recognition.onresult = (event: SpeechResultEvent) => {
      const results = event.results
      if (!results) return

      let interimTranscript = ''
      for (let i = event.resultIndex; i < results.length; i++) {
        const result = results[i]
        const transcript = result?.[0]?.transcript || ''
        if (result.isFinal) {
          spokenTextRef.current = (spokenTextRef.current + ' ' + transcript).trim()
          setSpokenText(spokenTextRef.current)
        } else {
          interimTranscript += transcript
        }
      }
      setInterimText(interimTranscript)
    }

    recognition.onerror = () => {
      setIsRecordingSpeak(false)
      setInterimText('')
      toast.error('Recording failed. Please check microphone permissions and try again.')
    }

    recognition.onend = () => {
      setIsRecordingSpeak(false)
      setInterimText('')
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
            <h1 className="text-3xl font-bold text-[#581c87]">Speak Yourself</h1>
            <p className="mt-1 text-sm text-slate-600">Build your personal introduction script and pass with pronunciation accuracy of at least 80%.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard" className="inline-flex items-center rounded-md border border-purple-700 bg-white px-4 py-2 text-sm font-semibold text-purple-700 transition hover:bg-purple-50">
              Go to exercises
            </Link>
            <Link href="/" className="inline-flex items-center rounded-md border border-[#581c87]/35 bg-white px-4 py-2 text-sm font-semibold text-[#581c87] transition hover:bg-[#581c87]/10">
              Back to home
            </Link>
          </div>
        </div>

        <div className="rounded-xl border border-[#581c87]/25 bg-white p-6 shadow-sm">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-[#581c87]">Speaking Assessment</h2>
              <p className="mt-1 text-sm text-slate-600">Enter your profile, generate your script, then record and submit your speech.</p>
            </div>
            {!speechSupported && (
              <span className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                This browser does not support speech recording
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <input value={speakForm.fullName} onChange={(event) => updateSpeakFormField('fullName', event.target.value)} placeholder="What is your full name?" className="rounded border border-gray-300 px-3 py-2 text-sm" />
            <input value={speakForm.age} onChange={(event) => updateSpeakFormField('age', event.target.value)} placeholder="How old are you?" className="rounded border border-gray-300 px-3 py-2 text-sm" />
            <input value={speakForm.hometown} onChange={(event) => updateSpeakFormField('hometown', event.target.value)} placeholder="Where are you from?" className="rounded border border-gray-300 px-3 py-2 text-sm" />
            <input value={speakForm.major} onChange={(event) => updateSpeakFormField('major', event.target.value)} placeholder="What is your educational background or major?" className="rounded border border-gray-300 px-3 py-2 text-sm" />
            <input value={speakForm.currentJob} onChange={(event) => updateSpeakFormField('currentJob', event.target.value)} placeholder="What is your current job or role?" className="rounded border border-gray-300 px-3 py-2 text-sm" />
            <input value={speakForm.yearsOfExperience} onChange={(event) => updateSpeakFormField('yearsOfExperience', event.target.value)} placeholder="How many years of experience do you have?" className="rounded border border-gray-300 px-3 py-2 text-sm" />
            <input value={speakForm.hobbies} onChange={(event) => updateSpeakFormField('hobbies', event.target.value)} placeholder="What are your hobbies or interests?" className="rounded border border-gray-300 px-3 py-2 text-sm md:col-span-2" />
            <input value={speakForm.traitOne} onChange={(event) => updateSpeakFormField('traitOne', event.target.value)} placeholder="Describe yourself in one word (e.g. passionate)" className="rounded border border-gray-300 px-3 py-2 text-sm" />
            <input value={speakForm.traitTwo} onChange={(event) => updateSpeakFormField('traitTwo', event.target.value)} placeholder="Another word that describes you (e.g. creative)" className="rounded border border-gray-300 px-3 py-2 text-sm" />
            <input value={speakForm.traitThree} onChange={(event) => updateSpeakFormField('traitThree', event.target.value)} placeholder="A third word that describes you (e.g. determined)" className="rounded border border-gray-300 px-3 py-2 text-sm md:col-span-2" />
            <textarea
              value={speakForm.reasonToJoin}
              onChange={(event) => updateSpeakFormField('reasonToJoin', event.target.value)}
              placeholder="Why did you join this English course? (e.g. I want to improve my speaking skills for work)"
              rows={3}
              className="rounded border border-gray-300 px-3 py-2 text-sm md:col-span-2"
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => { void generateSpeakScript() }}
              disabled={generatingScript}
              className="rounded bg-[#581c87] px-4 py-2 text-sm font-semibold text-white hover:bg-[#6b21a8] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {generatingScript ? 'Generating…' : 'Generate script'}
            </button>
            <button
              type="button"
              onClick={isRecordingSpeak ? stopSpeakRecording : startSpeakRecording}
              disabled={!speechSupported || !generatedSpeakScript}
              className={`inline-flex items-center gap-2 rounded px-4 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${isRecordingSpeak ? 'bg-red-600 hover:bg-red-700' : 'bg-purple-700 hover:bg-purple-800'}`}
            >
              {isRecordingSpeak ? (
                <>
                  <span className="relative flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-white"></span>
                  </span>
                  Stop recording
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                    <path d="M7 4a3 3 0 0 1 6 0v6a3 3 0 1 1-6 0V4Z" />
                    <path d="M5.5 9.643a.75.75 0 0 0-1.5 0V10c0 3.06 2.29 5.585 5.25 5.954V17.5h-1.5a.75.75 0 0 0 0 1.5h4.5a.75.75 0 0 0 0-1.5h-1.5v-1.546A6.001 6.001 0 0 0 16 10v-.357a.75.75 0 0 0-1.5 0V10a4.5 4.5 0 0 1-9 0v-.357Z" />
                  </svg>
                  Record
                </>
              )}
            </button>
          </div>

          {generatedSpeakScript && (
            <div className="mt-4 rounded-lg border border-purple-200 bg-purple-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-purple-700">Your script — read this aloud</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-800">{generatedSpeakScript}</p>
            </div>
          )}

          {isRecordingSpeak && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75"></span>
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-red-600"></span>
                </span>
                <p className="text-xs font-semibold uppercase tracking-wide text-red-600">Recording in progress — speak now</p>
              </div>
              {(spokenText || interimText) && (
                <p className="mt-2 text-sm leading-relaxed text-slate-700">
                  {spokenText}{' '}
                  <span className="text-slate-400 italic">{interimText}</span>
                </p>
              )}
            </div>
          )}

          {!isRecordingSpeak && isSubmittingSpeak && (
            <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-2 text-slate-500">
                <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                <p className="text-xs font-semibold uppercase tracking-wide">Analysing your speech…</p>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 italic">{spokenText}</p>
            </div>
          )}

          {speakAccuracy !== null && spokenText && generatedSpeakScript && (() => {
            const normalize = (t: string) => t.toLowerCase().replace(/[^a-z0-9\s']/g, ' ').replace(/\s+/g, ' ').trim()
            const expected = normalize(generatedSpeakScript).split(' ').filter(Boolean)
            const spokenTokens = normalize(spokenText).split(' ').filter(Boolean)
            const m = expected.length
            const n = spokenTokens.length
            const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0) as number[])
            for (let i = 1; i <= m; i++) {
              for (let j = 1; j <= n; j++) {
                dp[i][j] = expected[i - 1] === spokenTokens[j - 1]
                  ? dp[i - 1][j - 1] + 1
                  : Math.max(dp[i - 1][j], dp[i][j - 1])
              }
            }
            const matched = new Set<number>()
            let ai = m, bi = n
            while (ai > 0 && bi > 0) {
              if (expected[ai - 1] === spokenTokens[bi - 1]) { matched.add(ai - 1); ai--; bi-- }
              else if (dp[ai - 1][bi] >= dp[ai][bi - 1]) { ai-- } else { bi-- }
            }
            return (
              <div className={`mt-4 rounded-lg border p-4 ${speakResult === 'pass' ? 'border-purple-300 bg-purple-50' : 'border-amber-300 bg-amber-50'}`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className={`text-sm font-bold ${speakResult === 'pass' ? 'text-purple-800' : 'text-amber-800'}`}>
                    {speakResult === 'pass' ? `Pass — ${speakAccuracy}% accuracy` : `${speakAccuracy}% accuracy — needs 80% to pass`}
                  </p>
                  <div className="flex h-3 w-40 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className={`h-full rounded-full transition-all ${speakResult === 'pass' ? 'bg-purple-500' : speakAccuracy >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                      style={{ width: `${speakAccuracy}%` }}
                    />
                  </div>
                </div>
                <p className={`mt-1 text-xs ${speakResult === 'pass' ? 'text-purple-700' : 'text-amber-700'}`}>
                  {speakResult === 'pass' ? 'Great job! You can now continue to all exercises.' : 'Keep practising — try reading more slowly and clearly.'}
                </p>
                <div className="mt-3 overflow-hidden border-t border-current/10 pt-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Word analysis — <span className="text-purple-600">green = spoken correctly</span>, <span className="text-red-500">red = missed</span></p>
                  <div className="flex flex-wrap gap-x-1 gap-y-1 text-sm leading-6">
                    {expected.map((word, idx) => (
                      <span key={idx} className={`max-w-full wrap-break-word rounded px-0.5 ${matched.has(idx) ? 'text-purple-700' : 'bg-red-100 text-red-600 line-through'}`}>
                        {word}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mt-3 border-t border-current/10 pt-3">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">What the system heard</p>
                  <p className="wrap-break-word text-sm leading-relaxed text-slate-600 italic">{spokenText}</p>
                </div>
              </div>
            )
          })()}

        </div>
      </div>
    </div>
  )
}
