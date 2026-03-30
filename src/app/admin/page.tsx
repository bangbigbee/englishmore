'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface StudentInfo {
  id: string
  name: string | null
  email: string
  assignmentCount: number
  createdAt: string
}

interface CourseItem {
  id: string
  title: string
  description: string | null
  registrationDeadline: string
  maxStudents: number
  isPublished: boolean
  enrollments?: Array<{ status: string }>
}

interface EnrollmentItem {
  id: string
  status: string
  referenceCode: string | null
  isPaid: boolean
  createdAt: string
  payments?: Array<{
    id: string
    bankReference: string | null
    status: string
    verifiedAt: string | null
  }>
  user: {
    name: string | null
    email: string
  }
  course: {
    title: string
  }
}

interface DashboardSummary {
  totalUsers: number
  totalStudents: number
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [students, setStudents] = useState<StudentInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [courses, setCourses] = useState<CourseItem[]>([])
  const [newCourseTitle, setNewCourseTitle] = useState('')
  const [newCourseDescription, setNewCourseDescription] = useState('')
  const [newDeadline, setNewDeadline] = useState('')
  const [newCourseMaxStudents, setNewCourseMaxStudents] = useState(10)
  const [courseError, setCourseError] = useState('')
  const [courseSuccess, setCourseSuccess] = useState('')
  const [enrollments, setEnrollments] = useState<EnrollmentItem[]>([])
  const [confirmPayment, setConfirmPayment] = useState<{ id: string; studentName: string; courseTitle: string } | null>(null)
  const [updatingEnrollmentId, setUpdatingEnrollmentId] = useState<string | null>(null)
  const [editingCourse, setEditingCourse] = useState<CourseItem | null>(null)
  const [editCourseTitle, setEditCourseTitle] = useState('')
  const [editCourseDescription, setEditCourseDescription] = useState('')
  const [editCourseDeadline, setEditCourseDeadline] = useState('')
  const [editCourseMaxStudents, setEditCourseMaxStudents] = useState(10)
  const [savingCourseId, setSavingCourseId] = useState<string | null>(null)
  const [confirmUnpublish, setConfirmUnpublish] = useState<{ id: string; title: string } | null>(null)
  const [summary, setSummary] = useState<DashboardSummary>({ totalUsers: 0, totalStudents: 0 })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      if (session?.user?.role !== 'admin') {
        router.push('/dashboard')
      } else {
        fetchStudents()
        fetchCourses()
        fetchEnrollments()
        fetchSummary()
      }
    }
  }, [status, session, router])

  const fetchStudents = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/students')
      if (!res.ok) {
        throw new Error('Failed to fetch students')
      }
      const data = await res.json()
      setStudents(data)
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const deleteStudent = async (studentId: string) => {
    try {
      setDeleting(true)
      const res = await fetch(`/api/admin/users/${studentId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to delete student')
      }
      // Remove student from list
      setStudents(students.filter(s => s.id !== studentId))
      setDeleteConfirm(null)
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setDeleteConfirm(null)
    } finally {
      setDeleting(false)
    }
  }

  const filteredStudents = students.filter(
    student =>
      student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/admin/courses')
      if (!res.ok) throw new Error('Failed to fetch courses')
      const data = await res.json()
      setCourses(data)
      setCourseError('')
    } catch (err) {
      setCourseError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const fetchEnrollments = async () => {
    try {
      const res = await fetch('/api/admin/enrollments')
      if (!res.ok) throw new Error('Failed to fetch enrollments')
      const data = await res.json()
      setEnrollments(data)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchSummary = async () => {
    try {
      const res = await fetch('/api/admin/dashboard-summary')
      if (!res.ok) throw new Error('Failed to fetch dashboard summary')
      const data = await res.json()
      setSummary({
        totalUsers: data.totalUsers || 0,
        totalStudents: data.totalStudents || 0
      })
    } catch (err) {
      console.error(err)
    }
  }

  const publishCourse = async () => {
    if (!newCourseTitle || !newDeadline) {
      setCourseError('Vui lòng nhập tên khóa học và hạn đăng ký')
      return
    }

    if (!Number.isInteger(newCourseMaxStudents) || newCourseMaxStudents < 1 || newCourseMaxStudents > 10) {
      setCourseError('Số lượng chỗ phải từ 1 đến 10')
      return
    }

    try {
      const res = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newCourseTitle,
          description: newCourseDescription,
          registrationDeadline: newDeadline,
          maxStudents: newCourseMaxStudents
        })
      })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData?.error || 'Failed to publish course')
      }
      const data = await res.json()
      setCourseSuccess(`Khóa học "${data.title}" đã được xuất bản`)
      setNewCourseTitle('')
      setNewCourseDescription('')
      setNewDeadline('')
      setNewCourseMaxStudents(10)
      fetchCourses()
    } catch (err) {
      setCourseError(err instanceof Error ? err.message : 'An error occurred')
      setCourseSuccess('')
    }
  }

  const openEditCourse = (course: CourseItem) => {
    setEditingCourse(course)
    setEditCourseTitle(course.title)
    setEditCourseDescription(course.description || '')
    setEditCourseDeadline(new Date(course.registrationDeadline).toISOString().slice(0, 10))
    setEditCourseMaxStudents(course.maxStudents || 10)
    setCourseError('')
  }

  const saveEditedCourse = async () => {
    if (!editingCourse) return
    if (!editCourseTitle || !editCourseDeadline) {
      setCourseError('Vui lòng nhập tên khóa học và hạn đăng ký')
      return
    }

    if (!Number.isInteger(editCourseMaxStudents) || editCourseMaxStudents < 1 || editCourseMaxStudents > 10) {
      setCourseError('Số lượng chỗ phải từ 1 đến 10')
      return
    }

    try {
      setSavingCourseId(editingCourse.id)
      const res = await fetch(`/api/admin/courses/${editingCourse.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editCourseTitle,
          description: editCourseDescription,
          registrationDeadline: editCourseDeadline,
          maxStudents: editCourseMaxStudents
        })
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error || 'Không thể cập nhật khóa học')
      }

      setCourseSuccess(`Đã cập nhật khóa học "${data.title}"`)
      setCourseError('')
      setEditingCourse(null)
      fetchCourses()
    } catch (err) {
      setCourseError(err instanceof Error ? err.message : 'Không thể cập nhật khóa học')
      setCourseSuccess('')
    } finally {
      setSavingCourseId(null)
    }
  }

  const unpublishCourse = async (courseId: string, courseTitle: string) => {
    try {
      setSavingCourseId(courseId)
      const res = await fetch(`/api/admin/courses/${courseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: false })
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error || 'Không thể hủy khai giảng khóa học')
      }

      setCourseSuccess(`Đã hủy khai giảng khóa học "${courseTitle}"`) 
      setCourseError('')
      setConfirmUnpublish(null)
      fetchCourses()
    } catch (err) {
      setCourseError(err instanceof Error ? err.message : 'Không thể hủy khai giảng khóa học')
      setCourseSuccess('')
    } finally {
      setSavingCourseId(null)
    }
  }

  const confirmBankTransfer = async (enrollmentId: string) => {
    try {
      setUpdatingEnrollmentId(enrollmentId)
      const res = await fetch(`/api/admin/enrollments/${enrollmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'active' })
      })
      if (!res.ok) throw new Error('Failed to update enrollment')
      setCourseError('')
      fetchEnrollments()
      fetchCourses()
      fetchSummary()
    } catch (err) {
      setCourseError(err instanceof Error ? err.message : 'Không thể cập nhật trạng thái thanh toán')
    } finally {
      setUpdatingEnrollmentId(null)
      setConfirmPayment(null)
    }
  }

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!session || session.user?.role !== 'admin') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Quay lại
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded shadow p-6">
            <h3 className="text-gray-500 text-sm font-medium">Tổng người dùng</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{summary.totalUsers}</p>
          </div>
          <div className="bg-white rounded shadow p-6">
            <h3 className="text-gray-500 text-sm font-medium">Tổng học viên (toàn bộ khóa)</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{summary.totalStudents}</p>
          </div>
          <div className="bg-white rounded shadow p-6">
            <h3 className="text-gray-500 text-sm font-medium">Chờ xác nhận chuyển khoản</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{enrollments.filter((e) => e.status === 'pending').length}</p>
          </div>
          <div className="bg-white rounded shadow p-6 flex flex-col justify-between">
            <h3 className="text-gray-500 text-sm font-medium">Chi tiết học viên theo khóa</h3>
            <Link
              href="/admin/course-students"
              className="mt-4 inline-flex items-center justify-center px-4 py-2 bg-[#14532d] text-white rounded hover:bg-[#166534]"
            >
              Xem chi tiết
            </Link>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded shadow p-6 mb-8">
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Tìm kiếm học viên (tên hoặc email)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#14532d]"
            />
            <button
              onClick={fetchStudents}
              className="px-4 py-2 bg-[#14532d] text-white rounded hover:bg-[#166534]"
            >
              Làm mới
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-8">
            Lỗi: {error}
          </div>
        )}

        {/* Students Table */}
        <div className="bg-white rounded shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bài tập</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày đăng ký</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      Đang tải...
                    </td>
                  </tr>
                ) : filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      Không tìm thấy học viên
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map(student => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{student.name || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{student.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{student.assignmentCount}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(student.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          <Link
                            href={`/admin/student/${student.id}`}
                            className="text-[#14532d] hover:text-[#14532d] hover:underline"
                          >
                            Chi tiết
                          </Link>
                          <button
                            onClick={() => setDeleteConfirm({ id: student.id, name: student.name || student.email })}
                            className="text-red-600 hover:text-red-800 hover:underline"
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded shadow-lg p-6 max-w-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Xác nhận xóa học viên</h3>
              <p className="text-gray-700 mb-6">
                Bạn có chắc chắn muốn xóa <strong>{deleteConfirm.name}</strong>? Thao tác này không thể hoàn tác.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  disabled={deleting}
                  className="px-4 py-2 bg-gray-300 text-gray-900 rounded hover:bg-gray-400 disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  onClick={() => deleteStudent(deleteConfirm.id)}
                  disabled={deleting}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                >
                  {deleting ? 'Đang xóa...' : 'Xóa'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Course Management Section */}
        <div className="mt-12 bg-white rounded shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Quản lý <span className="text-amber-600">Khóa học</span>
          </h2>
          
          {courseSuccess && (
            <div className="mb-4 p-3 bg-[#14532d]/10 border border-[#14532d]/40 rounded text-[#14532d]">
              {courseSuccess}
            </div>
          )}
          
          {courseError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 rounded text-red-700">
              Lỗi: {courseError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-gray-700">Tên khóa học</span>
              <input
                type="text"
                placeholder="Tên khóa học"
                value={newCourseTitle}
                onChange={(e) => setNewCourseTitle(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#14532d]"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-gray-700">Mô tả khóa học</span>
              <textarea
                placeholder="Mô tả khóa học"
                value={newCourseDescription}
                onChange={(e) => setNewCourseDescription(e.target.value)}
                rows={2}
                className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#14532d]"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-gray-700">Hạn đăng ký</span>
              <input
                type="date"
                value={newDeadline}
                onChange={(e) => setNewDeadline(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#14532d]"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-gray-700">Số lượng học viên tối đa</span>
              <input
                type="number"
                min={1}
                max={10}
                placeholder="Từ 1 đến 10"
                value={newCourseMaxStudents}
                onChange={(e) => setNewCourseMaxStudents(Math.min(10, Math.max(1, Number(e.target.value) || 1)))}
                className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#14532d]"
              />
              <span className="text-xs text-gray-500">Mỗi khóa học tối đa 10 học viên.</span>
            </label>
            <div className="flex items-end">
              <button
                onClick={publishCourse}
                className="w-full px-6 py-2 bg-[#14532d] text-white rounded hover:bg-[#166534] font-medium"
              >
                Xuất bản Khóa học
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Khóa học</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mô tả</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hạn đăng ký</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số chỗ</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái công khai</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thành công</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chờ chuyển khoản</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tổng</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{course.title}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{course.description || 'Chưa có mô tả'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(course.registrationDeadline).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{course.maxStudents}/10</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        course.isPublished ? 'bg-[#14532d]/10 text-[#14532d]' : 'bg-gray-200 text-gray-700'
                      }`}>
                        {course.isPublished ? 'Đang công khai' : 'Đã hủy khai giảng'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {course.enrollments?.filter((e) => e.status === 'active').length || 0}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {course.enrollments?.filter((e) => e.status === 'pending').length || 0}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{course.enrollments?.length || 0}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => openEditCourse(course)}
                          className="text-[#14532d] hover:text-[#14532d] hover:underline"
                        >
                          Sửa
                        </button>
                        {course.isPublished && (
                          <button
                            onClick={() => setConfirmUnpublish({ id: course.id, title: course.title })}
                            disabled={savingCourseId === course.id}
                            className="text-red-600 hover:text-red-800 hover:underline disabled:opacity-50"
                          >
                            {savingCourseId === course.id ? 'Đang xử lý...' : 'Hủy khai giảng'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {courses.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-4 py-3 text-center text-gray-500">
                      Chưa có khóa học nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {editingCourse && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded shadow-lg p-6 max-w-lg w-full">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Sửa thông tin khóa học</h3>

              <div className="space-y-4">
                <input
                  type="text"
                  value={editCourseTitle}
                  onChange={(e) => setEditCourseTitle(e.target.value)}
                  placeholder="Tên khóa học"
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#14532d]"
                />
                <textarea
                  value={editCourseDescription}
                  onChange={(e) => setEditCourseDescription(e.target.value)}
                  rows={4}
                  placeholder="Mô tả khóa học"
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#14532d]"
                />
                <input
                  type="date"
                  value={editCourseDeadline}
                  onChange={(e) => setEditCourseDeadline(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#14532d]"
                />
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-gray-700">Số lượng học viên tối đa</span>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={editCourseMaxStudents}
                    onChange={(e) => setEditCourseMaxStudents(Math.min(10, Math.max(1, Number(e.target.value) || 1)))}
                    placeholder="Từ 1 đến 10"
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#14532d]"
                  />
                </label>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setEditingCourse(null)}
                  disabled={savingCourseId === editingCourse.id}
                  className="px-4 py-2 bg-gray-300 text-gray-900 rounded hover:bg-gray-400 disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  onClick={saveEditedCourse}
                  disabled={savingCourseId === editingCourse.id}
                  className="px-4 py-2 bg-[#14532d] text-white rounded hover:bg-[#166534] disabled:opacity-50"
                >
                  {savingCourseId === editingCourse.id ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </div>
          </div>
        )}

        {confirmUnpublish && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded shadow-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Hủy khai giảng khóa học</h3>
              <p className="text-gray-700 mb-6">
                Bạn có chắc chắn muốn hủy khai giảng khóa học <strong>{confirmUnpublish.title}</strong>? Khóa học sẽ không còn hiển thị công khai cho học viên.
              </p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setConfirmUnpublish(null)}
                  disabled={savingCourseId === confirmUnpublish.id}
                  className="px-4 py-2 bg-gray-300 text-gray-900 rounded hover:bg-gray-400 disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  onClick={() => unpublishCourse(confirmUnpublish.id, confirmUnpublish.title)}
                  disabled={savingCourseId === confirmUnpublish.id}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                >
                  {savingCourseId === confirmUnpublish.id ? 'Đang xử lý...' : 'Xác nhận'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Enrollments Management Section */}
        <div className="mt-12 bg-white rounded shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Đăng ký <span className="text-amber-600">Khóa học</span>
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Học viên</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Khóa học</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nội dung CK</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày đăng ký</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {enrollments.map((enrollment) => (
                  <tr key={enrollment.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{enrollment.user.name || enrollment.user.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{enrollment.course.title}</td>
                    <td className="px-4 py-3 text-sm font-mono text-gray-700">{enrollment.referenceCode || 'Chưa có mã'}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        enrollment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-[#14532d]/10 text-[#14532d]'
                      }`}>
                        {enrollment.status === 'pending' ? 'Chờ thanh toán' : 'Đã nhận thanh toán'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(enrollment.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {enrollment.status === 'pending' && (
                        <button
                          onClick={() => setConfirmPayment({
                            id: enrollment.id,
                            studentName: enrollment.user.name || enrollment.user.email,
                            courseTitle: enrollment.course.title
                          })}
                          disabled={updatingEnrollmentId === enrollment.id}
                          className="text-amber-700 hover:text-amber-900 hover:underline"
                        >
                          {updatingEnrollmentId === enrollment.id ? 'Đang cập nhật...' : 'Xác nhận đã nhận CK'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {enrollments.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-3 text-center text-gray-500">
                      Chưa có đăng ký nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {confirmPayment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded shadow-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Xác nhận thanh toán</h3>
              <p className="text-gray-700 mb-2">
                Học viên: <strong>{confirmPayment.studentName}</strong>
              </p>
              <p className="text-gray-700 mb-4">
                Khóa học: <strong>{confirmPayment.courseTitle}</strong>
              </p>
              <p className="text-gray-800 mb-6">Bạn đã nhận được thanh toán chưa?</p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setConfirmPayment(null)}
                  disabled={updatingEnrollmentId === confirmPayment.id}
                  className="px-4 py-2 bg-gray-300 text-gray-900 rounded hover:bg-gray-400 disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  onClick={() => confirmBankTransfer(confirmPayment.id)}
                  disabled={updatingEnrollmentId === confirmPayment.id}
                  className="px-4 py-2 bg-amber-500 text-white rounded hover:bg-amber-600 disabled:opacity-50"
                >
                  {updatingEnrollmentId === confirmPayment.id ? 'Đang xử lý...' : 'OK'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

