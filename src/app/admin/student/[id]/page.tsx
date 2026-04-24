'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'

interface Assignment {
  id: string
  title: string
  description: string | null
  method: string
  submittedAt: string
  filePath: string | null
}

interface StudentDetail {
  id: string
  name: string | null
  phone: string | null
  email: string
  method: string | null
  createdAt: string
  assignments: Assignment[]
}

export default function StudentDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const studentId = params.id as string
  const [student, setStudent] = useState<StudentDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchStudentDetail = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/students/${studentId}`)
      if (!res.ok) {
        throw new Error('Failed to fetch student details')
      }
      const data = await res.json()
      setStudent(data)
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [studentId])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      if (session?.user?.role !== 'admin') {
        router.push('/dashboard')
      } else {
        fetchStudentDetail()
      }
    }
  }, [status, session, router, fetchStudentDetail])

  if (status === 'loading' || loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!session || session.user?.role !== 'admin') {
    return null
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="mx-auto max-w-4xl">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            Error: {error}
          </div>
          <Link
            href="/admin"
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Back
          </Link>
        </div>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="mx-auto max-w-4xl">
          <p className="text-gray-500">Student not found.</p>
          <Link
            href="/admin"
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 mt-4 inline-block"
          >
            Back
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Student Details</h1>
            <Link
              href="/admin"
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Back
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Student Information */}
        <div className="bg-white rounded shadow p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-gray-500 text-sm">Name</p>
              <p className="text-gray-900 font-medium text-lg">{student.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Email</p>
              <p className="text-gray-900 font-medium text-lg">{student.email}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Phone number</p>
              <p className="text-gray-900 font-medium text-lg">{student.phone || 'Not updated yet'}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Study method</p>
              <p className="text-gray-900 font-medium text-lg">
                <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                  {student.method || 'Not updated yet'}
                </span>
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Registered on</p>
              <p className="text-gray-900 font-medium text-lg">
                {new Date(student.createdAt).toLocaleDateString('en-GB')}
              </p>
            </div>
          </div>
        </div>

        {/* Assignments / Progress */}
        <div className="bg-white rounded shadow p-6">
          <h2 className="text-2xl font-bold mb-6">Assignment Progress</h2>

          {student.assignments.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No assignments have been submitted yet.</p>
          ) : (
            <div className="space-y-4">
              {/* Progress Summary */}
              <div className="mb-6 p-4 bg-[#581c87]/10 rounded">
                <p className="text-gray-500 text-sm mb-2">Total submitted assignments</p>
                <p className="text-3xl font-bold text-[#581c87]">{student.assignments.length}</p>
              </div>

              {/* Assignment List */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assignment</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted on</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attachment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {student.assignments.map(assignment => (
                      <tr key={assignment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">{assignment.title}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                            {assignment.method || 'Not updated yet'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(assignment.submittedAt).toLocaleDateString('en-GB', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {assignment.filePath ? (
                            <a
                              href={`/uploads/${assignment.filePath}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#581c87] hover:text-[#581c87] hover:underline"
                            >
                              View file
                            </a>
                          ) : (
                            <span className="text-gray-400">None</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
