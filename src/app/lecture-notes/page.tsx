'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

interface LectureNoteItem {
  id: string
  sessionNumber: number
  driveLink: string | null
  updatedAt: string
}

interface CourseLectureNotes {
  courseId: string
  courseTitle: string
  notes: LectureNoteItem[]
}

export default function LectureNotesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [courses, setCourses] = useState<CourseLectureNotes[]>([])
  const [selectedCourseId, setSelectedCourseId] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'authenticated') {
      if (session?.user?.role === 'admin') {
        router.push('/admin')
        return
      }

      if (session?.user?.role === 'user') {
        router.push('/courses')
        return
      }

      fetchLectureNotes()
    }
  }, [status, session?.user?.role, router])

  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error])

  const fetchLectureNotes = async () => {
    try {
      setLoading(true)
      setError('')
      const res = await fetch('/api/member/lecture-notes')
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Could not load lecture materials.' }))
        throw new Error(data.error || 'Could not load lecture materials.')
      }

      const data = await res.json()
      const nextCourses = Array.isArray(data.courses) ? data.courses : []
      setCourses(nextCourses)
      if (nextCourses.length > 0) {
        setSelectedCourseId(nextCourses[0].courseId)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load lecture materials.')
    } finally {
      setLoading(false)
    }
  }

  const selectedCourse = useMemo(
    () => courses.find((course) => course.courseId === selectedCourseId) || courses[0] || null,
    [courses, selectedCourseId]
  )

  const notesMap = useMemo(() => {
    const map = new Map<number, LectureNoteItem>()
    if (!selectedCourse) return map
    for (const note of selectedCourse.notes) {
      map.set(note.sessionNumber, note)
    }
    return map
  }, [selectedCourse])

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500">Loading lecture notes...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-[#f0fdf4] via-white to-[#ecfeff]">
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">Lecture Notes</h1>
            <p className="mt-2 text-sm sm:text-base text-slate-600">Lecture materials for each class session in your current course.</p>
          </div>
          <Link href="/" className="brand-cta brand-cta-outline">
            <span>Back to home</span>
            <span aria-hidden="true" className="brand-cta-arrow">→</span>
          </Link>
        </div>

        {courses.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-slate-700">You do not have an active course yet, or no lecture notes have been uploaded.</p>
            <Link href="/courses" className="mt-4 inline-flex rounded bg-[#14532d] px-4 py-2 font-semibold text-white hover:bg-[#166534]">
              View courses
            </Link>
          </div>
        ) : (
          <>
            <section className="mb-6 rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm">
              <label htmlFor="courseFilter" className="mb-2 block text-sm font-semibold text-emerald-800">Choose a course</label>
              <select
                id="courseFilter"
                value={selectedCourse?.courseId || ''}
                onChange={(event) => setSelectedCourseId(event.target.value)}
                className="w-full max-w-xl rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-slate-800 outline-none focus:border-emerald-500"
              >
                {courses.map((course) => (
                  <option key={course.courseId} value={course.courseId}>{course.courseTitle}</option>
                ))}
              </select>
            </section>

            {selectedCourse && (
              <section className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-lg">
                <div className="mb-5 rounded-2xl bg-linear-to-r from-amber-500 via-amber-500 to-orange-500 px-4 py-4 text-white shadow-[0_10px_24px_rgba(245,158,11,0.28)]">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#14532d]">Current Course</p>
                  <h2 className="mt-1 text-xl sm:text-2xl font-extrabold">{selectedCourse.courseTitle}</h2>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {Array.from({ length: 30 }, (_, index) => index + 1).map((sessionNumber) => {
                    const note = notesMap.get(sessionNumber)
                    const hasLink = Boolean(note?.driveLink)

                    return (
                      <article
                        key={sessionNumber}
                        className={`rounded-2xl border p-4 transition ${hasLink ? 'border-emerald-200 bg-emerald-50/60 hover:shadow-md' : 'border-slate-200 bg-slate-50'}`}
                      >
                        <div className="mb-3 flex items-center justify-between">
                          <h3 className="text-base font-bold text-slate-900">Session {sessionNumber}</h3>
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${hasLink ? 'bg-emerald-200 text-emerald-900' : 'bg-slate-200 text-slate-600'}`}>
                            {hasLink ? 'Ready' : 'Not uploaded yet'}
                          </span>
                        </div>

                        {hasLink ? (
                          <>
                            <a
                              href={note?.driveLink || '#'}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex w-full items-center justify-center rounded-lg bg-[#14532d] px-3 py-2 text-sm font-bold text-white hover:bg-[#166534]"
                            >
                              Open Google Drive slide
                            </a>
                            <p className="mt-2 text-xs text-slate-500">Updated: {note ? new Date(note.updatedAt).toLocaleString('en-GB') : ''}</p>
                          </>
                        ) : (
                          <p className="text-sm text-slate-600">This material will be uploaded later.</p>
                        )}
                      </article>
                    )
                  })}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  )
}
