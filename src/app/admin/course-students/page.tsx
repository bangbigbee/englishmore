'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface CourseStat {
  courseNumber: number
  title: string
  studentCount: number
  status: 'closed' | 'recruiting'
}

export default function CourseStudentsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [courseStats, setCourseStats] = useState<CourseStat[]>([])
  const [totalStudents, setTotalStudents] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'authenticated') {
      if (session?.user?.role !== 'admin') {
        router.push('/dashboard')
        return
      }
      void fetchStats()
    }
  }, [status, session?.user?.role, router])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/dashboard-summary')
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error || 'Could not load course statistics.')
      }

      setCourseStats(data.courseBreakdown || [])
      setTotalStudents(data.totalStudents || 0)
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Students by Course</h1>
            <p className="text-gray-600 mt-1">From the first course to the current one</p>
          </div>
          <Link href="/admin" className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800">
            Back to dashboard
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 rounded border border-red-300 bg-red-50 px-4 py-3 text-red-700">{error}</div>
        )}

        <div className="mb-6 bg-white rounded shadow p-6">
          <h2 className="text-gray-500 text-sm font-medium">Total students across all courses</h2>
          <p className="text-4xl font-bold text-gray-900 mt-2">{totalStudents}</p>
        </div>

        <div className="bg-white rounded shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Students</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {courseStats.map((course) => (
                <tr key={course.courseNumber} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">{course.title}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{course.studentCount}</td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        course.status === 'recruiting' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {course.status === 'recruiting' ? 'Open for enrollment' : 'Started'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
