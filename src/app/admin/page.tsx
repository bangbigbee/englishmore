'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'

interface StudentInfo {
  id: string
  name: string | null
  phone: string | null
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
  completedSessions: number
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
    id: string
    name: string | null
    phone: string | null
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

interface UserOverviewItem {
  id: string
  name: string | null
  phone: string | null
  email: string
  createdAt: string
}

interface MemberOverviewItem {
  id: string
  name: string | null
  phone: string | null
  email: string
  registeredAt: string
  courseTitle: string
  isPaid: boolean
  submittedHomework: number
  totalHomework: number
}

interface HomeworkItem {
  id: string
  courseId: string
  title: string
  description: string | null
  dueDate: string
  course: { title: string }
  _count: { submissions: number }
}

interface HomeworkSubmissionItem {
  id: string
  note: string | null
  teacherComment: string | null
  submittedAt: string
  user: {
    id: string
    name: string | null
    phone: string | null
    email: string
  }
  homework: {
    id: string
    title: string
    courseId: string
    course: {
      title: string
    }
  }
}

interface ExerciseQuestionItem {
  id: string
  order: number
  question: string
  optionA: string
  optionB: string
  optionC: string
  correctOption: string
}

interface ExerciseSubmissionAnswerItem {
  id: string
  selectedOption: string
  isCorrect: boolean
  question: {
    id: string
    order: number
    question: string
    correctOption: string
  }
}

interface ExerciseSubmissionItem {
  id: string
  score: number
  totalQuestions: number
  durationSeconds: number | null
  submittedAt: string
  user: {
    id: string
    name: string | null
    email: string
  }
  answers: ExerciseSubmissionAnswerItem[]
}

interface ExerciseItem {
  id: string
  courseId: string
  order: number
  description: string | null
  isDraft: boolean
  sourceFormUrl: string | null
  course: { title: string }
  questions: ExerciseQuestionItem[]
  submissions: ExerciseSubmissionItem[]
}

interface ExerciseQuestionForm {
  question: string
  optionA: string
  optionB: string
  optionC: string
  correctOption: string
}

interface LectureNote {
  id: string
  courseId: string
  sessionNumber: number
  driveLink: string | null
  createdAt: string
  updatedAt: string
}

const buildEmptyExerciseQuestions = (): ExerciseQuestionForm[] =>
  Array.from({ length: 10 }, () => ({
    question: '',
    optionA: '',
    optionB: '',
    optionC: '',
    correctOption: 'A'
  }))

const buildExerciseResults = (items: ExerciseItem[]) =>
  items
    .flatMap((exercise) =>
      exercise.submissions.map((submission) => ({
        ...submission,
        exerciseOrder: exercise.order,
        courseTitle: exercise.course.title
      }))
    )
    .sort((left, right) => new Date(right.submittedAt).getTime() - new Date(left.submittedAt).getTime())

const formatDuration = (totalSeconds: number | null) => {
  if (totalSeconds === null) {
    return 'N/A'
  }

  const safeSeconds = Math.max(0, Math.floor(totalSeconds))
  const minutes = Math.floor(safeSeconds / 60)
  const seconds = safeSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

const formatDateToDdMmYyyy = (value: string | Date) => {
  const date = new Date(value)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = String(date.getFullYear())
  return `${day}/${month}/${year}`
}

const parseDdMmYyyyToIsoDate = (value: string) => {
  const trimmed = String(value || '').trim()
  const match = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!match) {
    return null
  }

  const day = Number(match[1])
  const month = Number(match[2])
  const year = Number(match[3])
  const date = new Date(Date.UTC(year, month - 1, day))

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() + 1 !== month ||
    date.getUTCDate() !== day
  ) {
    return null
  }

  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
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
  const [editCourseCompletedSessions, setEditCourseCompletedSessions] = useState(0)
  const [savingCourseId, setSavingCourseId] = useState<string | null>(null)
  const [confirmUnpublish, setConfirmUnpublish] = useState<{ id: string; title: string } | null>(null)
  const [summary, setSummary] = useState<DashboardSummary>({ totalUsers: 0, totalStudents: 0 })
  const [usersOverview, setUsersOverview] = useState<UserOverviewItem[]>([])
  const [membersOverview, setMembersOverview] = useState<MemberOverviewItem[]>([])
  const [homeworks, setHomeworks] = useState<HomeworkItem[]>([])
  const [newHomeworkCourseId, setNewHomeworkCourseId] = useState('')
  const [newHomeworkTitle, setNewHomeworkTitle] = useState('')
  const [newHomeworkDescription, setNewHomeworkDescription] = useState('')
  const [newHomeworkDueDate, setNewHomeworkDueDate] = useState('')
  const [homeworkError, setHomeworkError] = useState('')
  const [homeworkSuccess, setHomeworkSuccess] = useState('')
  const [editingHomework, setEditingHomework] = useState<HomeworkItem | null>(null)
  const [editHomeworkCourseId, setEditHomeworkCourseId] = useState('')
  const [editHomeworkTitle, setEditHomeworkTitle] = useState('')
  const [editHomeworkDescription, setEditHomeworkDescription] = useState('')
  const [editHomeworkDueDate, setEditHomeworkDueDate] = useState('')
  const [savingHomeworkId, setSavingHomeworkId] = useState<string | null>(null)
  const [deletingHomeworkId, setDeletingHomeworkId] = useState<string | null>(null)
  const [homeworkSubmissions, setHomeworkSubmissions] = useState<HomeworkSubmissionItem[]>([])
  const [homeworkSubmissionCourseFilter, setHomeworkSubmissionCourseFilter] = useState('')
  const [homeworkSubmissionHomeworkFilter, setHomeworkSubmissionHomeworkFilter] = useState('')
  const [homeworkTeacherComments, setHomeworkTeacherComments] = useState<Record<string, string>>({})
  const [savingHomeworkCommentId, setSavingHomeworkCommentId] = useState<string | null>(null)
  const [rejectingUserId, setRejectingUserId] = useState<string | null>(null)
  const [exercises, setExercises] = useState<ExerciseItem[]>([])
  const [newExerciseCourseId, setNewExerciseCourseId] = useState('')
  const [newExerciseQuestions, setNewExerciseQuestions] = useState<ExerciseQuestionForm[]>(buildEmptyExerciseQuestions())
  const [exerciseError, setExerciseError] = useState('')
  const [exerciseSuccess, setExerciseSuccess] = useState('')
  const [editingExercise, setEditingExercise] = useState<ExerciseItem | null>(null)
  const [editExerciseQuestions, setEditExerciseQuestions] = useState<ExerciseQuestionForm[]>(buildEmptyExerciseQuestions())
  const [savingExerciseId, setSavingExerciseId] = useState<string | null>(null)
  const [selectedExerciseResult, setSelectedExerciseResult] = useState<(ExerciseSubmissionItem & { exerciseOrder: number; courseTitle: string }) | null>(null)
  const [showExerciseBuilder, setShowExerciseBuilder] = useState(false)
  const [newExerciseDescription, setNewExerciseDescription] = useState('')
  const [editExerciseDescription, setEditExerciseDescription] = useState('')
  const [activeSection, setActiveSection] = useState<'course' | 'homework' | 'exercise' | 'lectureNote'>('course')
  const [newExerciseSourceFormUrl, setNewExerciseSourceFormUrl] = useState('')
  const [importingForm, setImportingForm] = useState(false)
  const [savingExerciseDraft, setSavingExerciseDraft] = useState(false)
  const [publishingExercise, setPublishingExercise] = useState(false)
  const [deletingExerciseId, setDeletingExerciseId] = useState<string | null>(null)

  // Lecture Notes states
  const [lectureNotes, setLectureNotes] = useState<LectureNote[]>([])
  const [selectedLectureNoteCourseId, setSelectedLectureNoteCourseId] = useState('')
  const [newLectureSession, setNewLectureSession] = useState('')
  const [newLectureDriveLink, setNewLectureDriveLink] = useState('')
  const [lectureError, setLectureError] = useState('')
  const [lectureSuccess, setLectureSuccess] = useState('')
  const [editingLectureNote, setEditingLectureNote] = useState<LectureNote | null>(null)
  const [editLectureSession, setEditLectureSession] = useState('')
  const [editLectureDriveLink, setEditLectureDriveLink] = useState('')
  const [savingLectureId, setSavingLectureId] = useState<string | null>(null)
  const [deletingLectureId, setDeletingLectureId] = useState<string | null>(null)

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
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(student.phone || '').toLowerCase().includes(searchTerm.toLowerCase())
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

  const fetchMemberOverview = async () => {
    try {
      const res = await fetch('/api/admin/member-overview')
      if (!res.ok) throw new Error('Failed to fetch member overview')
      const data = await res.json()
      setUsersOverview(data.users || [])
      setMembersOverview(data.members || [])
    } catch (err) {
      console.error(err)
    }
  }

  const fetchHomeworkData = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/homework')
      if (!res.ok) throw new Error('Failed to fetch homework')
      const data = await res.json()
      setHomeworks(data.homeworks || [])
      if (!newHomeworkCourseId && Array.isArray(data.courses) && data.courses.length > 0) {
        setNewHomeworkCourseId(data.courses[0].id)
      }
      if (!homeworkSubmissionCourseFilter && Array.isArray(data.courses) && data.courses.length > 0) {
        setHomeworkSubmissionCourseFilter(data.courses[0].id)
      }
    } catch (err) {
      console.error(err)
    }
  }, [newHomeworkCourseId, homeworkSubmissionCourseFilter])

  const fetchHomeworkSubmissions = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (homeworkSubmissionCourseFilter) params.set('courseId', homeworkSubmissionCourseFilter)
      if (homeworkSubmissionHomeworkFilter) params.set('homeworkId', homeworkSubmissionHomeworkFilter)

      const query = params.toString()
      const res = await fetch(`/api/admin/homework/submissions${query ? `?${query}` : ''}`)
      if (!res.ok) throw new Error('Failed to fetch homework submissions')
      const data = await res.json()
      const submissions = data.submissions || []
      setHomeworkSubmissions(submissions)
      setHomeworkTeacherComments(
        Object.fromEntries(
          submissions.map((submission: HomeworkSubmissionItem) => [submission.id, submission.teacherComment || ''])
        )
      )
      setHomeworkError('')
    } catch (err) {
      setHomeworkError(err instanceof Error ? err.message : 'Không thể tải bài nộp của học viên')
    }
  }, [homeworkSubmissionCourseFilter, homeworkSubmissionHomeworkFilter])

  const fetchExerciseData = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/exercises')
      if (!res.ok) throw new Error('Failed to fetch exercises')
      const data = await res.json()
      setExercises(data.exercises || [])
      if (!newExerciseCourseId && Array.isArray(data.courses) && data.courses.length > 0) {
        setNewExerciseCourseId(data.courses[0].id)
      }
    } catch (err) {
      console.error(err)
    }
  }, [newExerciseCourseId])

  const fetchLectureNotes = useCallback(async (courseId: string) => {
    if (!courseId) return
    try {
      const res = await fetch(`/api/admin/lectures?courseId=${courseId}`)
      if (!res.ok) throw new Error('Failed to fetch lecture notes')
      const data = await res.json()
      setLectureNotes(data)
      setLectureError('')
    } catch (err) {
      setLectureError(err instanceof Error ? err.message : 'Failed to fetch lecture notes')
    }
  }, [])

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
        fetchMemberOverview()
        fetchHomeworkData()
        fetchExerciseData()
      }
    }
  }, [status, session, router, fetchHomeworkData, fetchExerciseData])

  useEffect(() => {
    if (!selectedLectureNoteCourseId && courses.length > 0) {
      setSelectedLectureNoteCourseId(courses[0].id)
    }
  }, [courses, selectedLectureNoteCourseId])

  useEffect(() => {
    if (activeSection === 'lectureNote' && selectedLectureNoteCourseId) {
      fetchLectureNotes(selectedLectureNoteCourseId)
    }
  }, [activeSection, selectedLectureNoteCourseId, fetchLectureNotes])

  useEffect(() => {
    if (activeSection === 'homework') {
      fetchHomeworkSubmissions()
    }
  }, [activeSection, fetchHomeworkSubmissions])

  const updateNewExerciseQuestion = (index: number, field: keyof ExerciseQuestionForm, value: string) => {
    setNewExerciseQuestions((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item))
  }

  const updateEditExerciseQuestion = (index: number, field: keyof ExerciseQuestionForm, value: string) => {
    setEditExerciseQuestions((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item))
  }

  const createExercise = async (saveAsDraft: boolean) => {
    if (!newExerciseCourseId) {
      setExerciseError('Vui lòng chọn khóa học cho exercise')
      return
    }

    try {
      if (saveAsDraft) {
        setSavingExerciseDraft(true)
      } else {
        setPublishingExercise(true)
      }

      const res = await fetch('/api/admin/exercises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: newExerciseCourseId,
          description: newExerciseDescription,
          sourceFormUrl: newExerciseSourceFormUrl,
          isDraft: saveAsDraft,
          questions: newExerciseQuestions
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Không thể tạo exercise')

      setExerciseSuccess(saveAsDraft ? 'Đã lưu bản nháp exercise' : 'Đã tạo exercise mới')
      setExerciseError('')
      if (saveAsDraft) {
        setShowExerciseBuilder(true)
      } else {
        setNewExerciseQuestions(buildEmptyExerciseQuestions())
        setNewExerciseDescription('')
        setNewExerciseSourceFormUrl('')
        setShowExerciseBuilder(false)
      }
      fetchExerciseData()
    } catch (err) {
      setExerciseError(err instanceof Error ? err.message : 'Không thể tạo exercise')
      setExerciseSuccess('')
    } finally {
      setSavingExerciseDraft(false)
      setPublishingExercise(false)
    }
  }

  const importFromGoogleForm = async () => {
    if (!newExerciseSourceFormUrl.trim()) {
      setExerciseError('Vui lòng nhập link Google Form trước khi import')
      return
    }

    try {
      setImportingForm(true)
      const res = await fetch('/api/admin/exercises/import-google-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formUrl: newExerciseSourceFormUrl })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Không thể import từ Google Form')

      setNewExerciseQuestions(data.questions || buildEmptyExerciseQuestions())
      setNewExerciseDescription(String(data.description || '').trim())
      setNewExerciseSourceFormUrl(String(data.sourceFormUrl || newExerciseSourceFormUrl).trim())
      setExerciseError('')
      setExerciseSuccess('Đã import dữ liệu từ Google Form, bạn có thể chỉnh sửa trước khi lưu.')
      setShowExerciseBuilder(true)
    } catch (err) {
      setExerciseError(err instanceof Error ? err.message : 'Không thể import từ Google Form')
      setExerciseSuccess('')
    } finally {
      setImportingForm(false)
    }
  }

  const openEditExercise = (exercise: ExerciseItem) => {
    setEditingExercise(exercise)
    setEditExerciseDescription(exercise.description || '')
    setEditExerciseQuestions(exercise.questions.map((question) => ({
      question: question.question,
      optionA: question.optionA,
      optionB: question.optionB,
      optionC: question.optionC,
      correctOption: question.correctOption
    })))
    setExerciseError('')
  }

  const saveEditedExercise = async () => {
    if (!editingExercise) return

    try {
      setSavingExerciseId(editingExercise.id)
      const res = await fetch(`/api/admin/exercises/${editingExercise.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: editExerciseDescription, questions: editExerciseQuestions })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Không thể cập nhật exercise')

      setExerciseSuccess('Đã cập nhật exercise')
      setExerciseError('')
      setEditingExercise(null)
      fetchExerciseData()
    } catch (err) {
      setExerciseError(err instanceof Error ? err.message : 'Không thể cập nhật exercise')
      setExerciseSuccess('')
    } finally {
      setSavingExerciseId(null)
    }
  }

  const deleteExercise = async (exercise: ExerciseItem) => {
    const confirmed = window.confirm(`Bạn có chắc chắn muốn xóa Exercise ${exercise.order} của khóa "${exercise.course.title}"?`)
    if (!confirmed) return

    try {
      setDeletingExerciseId(exercise.id)
      const res = await fetch(`/api/admin/exercises/${exercise.id}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Không thể xóa exercise')

      setExerciseSuccess(`Đã xóa Exercise ${exercise.order}`)
      setExerciseError('')
      if (editingExercise?.id === exercise.id) {
        setEditingExercise(null)
      }
      fetchExerciseData()
    } catch (err) {
      setExerciseError(err instanceof Error ? err.message : 'Không thể xóa exercise')
      setExerciseSuccess('')
    } finally {
      setDeletingExerciseId(null)
    }
  }

  const createHomework = async () => {
    if (!newHomeworkCourseId || !newHomeworkTitle || !newHomeworkDueDate) {
      setHomeworkError('Vui lòng nhập đủ khóa học, tên bài tập và hạn nộp')
      return
    }

    const parsedNewHomeworkDueDate = parseDdMmYyyyToIsoDate(newHomeworkDueDate)
    if (!parsedNewHomeworkDueDate) {
      setHomeworkError('Hạn nộp phải theo định dạng dd/mm/yyyy')
      return
    }

    try {
      const res = await fetch('/api/admin/homework', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: newHomeworkCourseId,
          title: newHomeworkTitle,
          description: newHomeworkDescription,
          dueDate: parsedNewHomeworkDueDate
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Không thể tạo bài tập')

      setHomeworkSuccess('Đã tạo bài tập mới')
      setHomeworkError('')
      setNewHomeworkTitle('')
      setNewHomeworkDescription('')
      setNewHomeworkDueDate('')
      fetchHomeworkData()
      fetchMemberOverview()
    } catch (err) {
      setHomeworkError(err instanceof Error ? err.message : 'Không thể tạo bài tập')
      setHomeworkSuccess('')
    }
  }

  const openEditHomework = (homework: HomeworkItem) => {
    setEditingHomework(homework)
    setEditHomeworkCourseId(homework.courseId)
    setEditHomeworkTitle(homework.title)
    setEditHomeworkDescription(homework.description || '')
    setEditHomeworkDueDate(formatDateToDdMmYyyy(homework.dueDate))
    setHomeworkError('')
  }

  const saveEditedHomework = async () => {
    if (!editingHomework) return
    if (!editHomeworkCourseId || !editHomeworkTitle || !editHomeworkDueDate) {
      setHomeworkError('Vui lòng nhập đủ thông tin bài tập')
      return
    }

    const parsedEditHomeworkDueDate = parseDdMmYyyyToIsoDate(editHomeworkDueDate)
    if (!parsedEditHomeworkDueDate) {
      setHomeworkError('Hạn nộp phải theo định dạng dd/mm/yyyy')
      return
    }

    try {
      setSavingHomeworkId(editingHomework.id)
      const res = await fetch(`/api/admin/homework/${editingHomework.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: editHomeworkCourseId,
          title: editHomeworkTitle,
          description: editHomeworkDescription,
          dueDate: parsedEditHomeworkDueDate
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Không thể cập nhật bài tập')

      setHomeworkSuccess('Đã cập nhật bài tập')
      setHomeworkError('')
      setEditingHomework(null)
      fetchHomeworkData()
      fetchMemberOverview()
    } catch (err) {
      setHomeworkError(err instanceof Error ? err.message : 'Không thể cập nhật bài tập')
      setHomeworkSuccess('')
    } finally {
      setSavingHomeworkId(null)
    }
  }

  const deleteHomework = async (homework: HomeworkItem) => {
    const confirmed = window.confirm(`Bạn có chắc chắn muốn xóa bài tập "${homework.title}"?`)
    if (!confirmed) return

    try {
      setDeletingHomeworkId(homework.id)
      const res = await fetch(`/api/admin/homework/${homework.id}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Không thể xóa bài tập')

      setHomeworkSuccess('Đã xóa bài tập')
      setHomeworkError('')
      if (editingHomework?.id === homework.id) {
        setEditingHomework(null)
      }
      fetchHomeworkData()
      fetchHomeworkSubmissions()
      fetchMemberOverview()
    } catch (err) {
      setHomeworkError(err instanceof Error ? err.message : 'Không thể xóa bài tập')
      setHomeworkSuccess('')
    } finally {
      setDeletingHomeworkId(null)
    }
  }

  const saveHomeworkTeacherComment = async (submissionId: string) => {
    try {
      setSavingHomeworkCommentId(submissionId)
      const res = await fetch(`/api/admin/homework/submissions/${submissionId}/comment`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacherComment: homeworkTeacherComments[submissionId] || '' })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Không thể lưu nhận xét')

      setHomeworkSuccess('Đã lưu nhận xét cho bài tập học viên')
      setHomeworkError('')
      fetchHomeworkSubmissions()
    } catch (err) {
      setHomeworkError(err instanceof Error ? err.message : 'Không thể lưu nhận xét')
      setHomeworkSuccess('')
    } finally {
      setSavingHomeworkCommentId(null)
    }
  }

  const publishCourse = async () => {
    if (!newCourseTitle || !newDeadline) {
      setCourseError('Vui lòng nhập tên khóa học và hạn đăng ký')
      return
    }

    const parsedNewDeadline = parseDdMmYyyyToIsoDate(newDeadline)
    if (!parsedNewDeadline) {
      setCourseError('Hạn đăng ký phải theo định dạng dd/mm/yyyy')
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
          registrationDeadline: parsedNewDeadline,
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
    setEditCourseDeadline(formatDateToDdMmYyyy(course.registrationDeadline))
    setEditCourseMaxStudents(course.maxStudents || 10)
    setEditCourseCompletedSessions(course.completedSessions || 0)
    setCourseError('')
  }

  const saveEditedCourse = async () => {
    if (!editingCourse) return
    if (!editCourseTitle || !editCourseDeadline) {
      setCourseError('Vui lòng nhập tên khóa học và hạn đăng ký')
      return
    }

    const parsedEditDeadline = parseDdMmYyyyToIsoDate(editCourseDeadline)
    if (!parsedEditDeadline) {
      setCourseError('Hạn đăng ký phải theo định dạng dd/mm/yyyy')
      return
    }

    if (!Number.isInteger(editCourseMaxStudents) || editCourseMaxStudents < 1 || editCourseMaxStudents > 10) {
      setCourseError('Số lượng chỗ phải từ 1 đến 10')
      return
    }

    if (!Number.isInteger(editCourseCompletedSessions) || editCourseCompletedSessions < 0 || editCourseCompletedSessions > 30) {
      setCourseError('Tiến độ khóa học phải từ 0 đến 30 buổi')
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
          registrationDeadline: parsedEditDeadline,
          maxStudents: editCourseMaxStudents,
          completedSessions: editCourseCompletedSessions
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
      fetchMemberOverview()
    } catch (err) {
      setCourseError(err instanceof Error ? err.message : 'Không thể cập nhật trạng thái thanh toán')
    } finally {
      setUpdatingEnrollmentId(null)
      setConfirmPayment(null)
    }
  }

  const createLectureNote = async () => {
    setLectureError('')
    setLectureSuccess('')

    if (!selectedLectureNoteCourseId || !newLectureSession) {
      setLectureError('Vui lòng chọn khóa học và buổi học')
      return
    }

    const sessionNum = parseInt(newLectureSession, 10)
    if (isNaN(sessionNum) || sessionNum < 1 || sessionNum > 30) {
      setLectureError('Buổi học phải từ 1 đến 30')
      return
    }

    try {
      const res = await fetch('/api/admin/lectures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: selectedLectureNoteCourseId,
          sessionNumber: sessionNum,
          driveLink: newLectureDriveLink || null
        })
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to create lecture note')
      }

      setNewLectureSession('')
      setNewLectureDriveLink('')
      setLectureSuccess('Tài liệu bài giảng được tạo thành công!')
      fetchLectureNotes(selectedLectureNoteCourseId)
    } catch (err) {
      setLectureError(err instanceof Error ? err.message : 'Failed to create lecture note')
    }
  }

  const updateLectureNote = async () => {
    if (!editingLectureNote) return

    const sessionNum = parseInt(editLectureSession, 10)
    if (isNaN(sessionNum) || sessionNum < 1 || sessionNum > 30) {
      setLectureError('Buổi học phải từ 1 đến 30')
      return
    }

    try {
      setSavingLectureId(editingLectureNote.id)
      setLectureError('')
      setLectureSuccess('')

      const res = await fetch(`/api/admin/lectures/${editingLectureNote.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionNumber: sessionNum,
          driveLink: editLectureDriveLink || null
        })
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to update lecture note')
      }

      setEditingLectureNote(null)
  setEditLectureSession('')
      setEditLectureDriveLink('')
      setLectureSuccess('Cập nhật tài liệu thành công!')
      fetchLectureNotes(selectedLectureNoteCourseId)
    } catch (err) {
      setLectureError(err instanceof Error ? err.message : 'Failed to update lecture note')
    } finally {
      setSavingLectureId(null)
    }
  }

  const deleteLectureNote = async (lectureId: string) => {
    const confirmed = window.confirm('Bạn chắc chắn muốn xóa tài liệu này?')
    if (!confirmed) return

    try {
      setLectureError('')
      setLectureSuccess('')
      setDeletingLectureId(lectureId)
      const res = await fetch(`/api/admin/lectures/${lectureId}`, {
        method: 'DELETE'
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to delete lecture note')
      }

      setLectureSuccess('Xóa tài liệu thành công!')
      fetchLectureNotes(selectedLectureNoteCourseId)
    } catch (err) {
      setLectureError(err instanceof Error ? err.message : 'Failed to delete lecture note')
    } finally {
      setDeletingLectureId(null)
    }
  }

  const rejectUser = async (userId: string, label: string) => {
    const confirmed = window.confirm(`Bạn có chắc chắn muốn từ chối ${label}? Người dùng sẽ bị reset và phải bắt đầu lại từ đầu.`)
    if (!confirmed) return

    try {
      setRejectingUserId(userId)
      const res = await fetch(`/api/admin/members/${userId}/reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error || 'Không thể từ chối người dùng')
      }

      setCourseSuccess('Đã từ chối và reset người dùng về trạng thái ban đầu')
      setCourseError('')
      fetchMemberOverview()
      fetchEnrollments()
      fetchCourses()
      fetchSummary()
    } catch (err) {
      setCourseError(err instanceof Error ? err.message : 'Không thể từ chối người dùng')
    } finally {
      setRejectingUserId(null)
    }
  }

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!session || session.user?.role !== 'admin') {
    return null
  }

  const exerciseResults = buildExerciseResults(exercises)

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
        <div className="mb-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setActiveSection('course')}
            className={`rounded px-5 py-2 text-sm font-semibold ${activeSection === 'course' ? 'bg-[#14532d] text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
          >
            1. QUAN LY KHOA HOC
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('homework')}
            className={`rounded px-5 py-2 text-sm font-semibold ${activeSection === 'homework' ? 'bg-[#14532d] text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
          >
            2. HOMEWORK
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('exercise')}
            className={`rounded px-5 py-2 text-sm font-semibold ${activeSection === 'exercise' ? 'bg-[#14532d] text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
          >
            3. EXERCISE
          </button>
           <button
             type="button"
             onClick={() => setActiveSection('lectureNote')}
             className={`rounded px-5 py-2 text-sm font-semibold ${activeSection === 'lectureNote' ? 'bg-[#14532d] text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
           >
             4. LECTURE NOTES
           </button>
        </div>

        {/* Statistics */}
        <div className={`grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 ${activeSection === 'course' ? '' : 'hidden'}`}>
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

        <div className={`grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8 ${activeSection === 'course' ? '' : 'hidden'}`}>
          <div className="bg-white rounded shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Bảng 1. Người dùng user</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Họ tên</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SĐT</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày mở tài khoản</th>
                  </tr>
                </thead>
                <tbody>
                  {usersOverview.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{item.name || item.email}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{item.phone || 'Chưa cập nhật'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{new Date(item.createdAt).toLocaleDateString('vi-VN')}</td>
                    </tr>
                  ))}
                  {usersOverview.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-4 py-3 text-center text-gray-500">Không có user nào</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Bảng 2. Thành viên member</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Họ tên</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SĐT</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày đăng ký</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Khóa học</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Học phí</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bài tập</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {membersOverview.map((member) => (
                    <tr key={`${member.id}-${member.courseTitle}`} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{member.name || member.email}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{member.phone || 'Chưa cập nhật'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{new Date(member.registeredAt).toLocaleDateString('vi-VN')}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{member.courseTitle}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{member.isPaid ? 'Đã đóng' : 'Chưa đóng'}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{member.submittedHomework}/{member.totalHomework}</td>
                      <td className="px-4 py-3 text-sm">
                        <button
                          onClick={() => rejectUser(member.id, member.name || member.email)}
                          disabled={rejectingUserId === member.id}
                          className="text-red-600 hover:text-red-800 hover:underline disabled:opacity-50"
                        >
                          {rejectingUserId === member.id ? 'Đang xử lý...' : 'Từ chối thành viên'}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {membersOverview.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-3 text-center text-gray-500">Chưa có member đang học</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className={`bg-white rounded shadow p-6 mb-8 ${activeSection === 'homework' ? '' : 'hidden'}`}>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quản lý bài tập theo khóa</h2>

          {homeworkSuccess && (
            <div className="mb-4 p-3 bg-[#14532d]/10 border border-[#14532d]/40 rounded text-[#14532d]">{homeworkSuccess}</div>
          )}
          {homeworkError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 rounded text-red-700">Lỗi: {homeworkError}</div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <select
              value={newHomeworkCourseId}
              onChange={(e) => setNewHomeworkCourseId(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#14532d]"
            >
              <option value="">Chọn khóa học</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>{course.title}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Tên bài tập"
              value={newHomeworkTitle}
              onChange={(e) => setNewHomeworkTitle(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#14532d]"
            />
            <input
              type="text"
              value={newHomeworkDueDate}
              onChange={(e) => setNewHomeworkDueDate(e.target.value)}
              placeholder="dd/mm/yyyy"
              inputMode="numeric"
              className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#14532d]"
            />
            <button
              onClick={createHomework}
              className="px-6 py-2 bg-[#14532d] text-white rounded hover:bg-[#166534] font-medium"
            >
              Tạo bài tập
            </button>
          </div>

          <textarea
            placeholder="Mô tả bài tập"
            value={newHomeworkDescription}
            onChange={(e) => setNewHomeworkDescription(e.target.value)}
            rows={3}
            className="w-full mb-6 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#14532d]"
          />

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Khóa học</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên bài tập</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mô tả</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hạn nộp</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Đã nộp</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {homeworks.map((homework) => (
                  <tr key={homework.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{homework.course.title}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{homework.title}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{homework.description || 'Không có mô tả'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{new Date(homework.dueDate).toLocaleDateString('vi-VN')}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{homework._count.submissions}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-3">
                        <button onClick={() => openEditHomework(homework)} className="text-[#14532d] hover:underline">Sửa</button>
                        <button
                          onClick={() => deleteHomework(homework)}
                          disabled={deletingHomeworkId === homework.id}
                          className="text-red-600 hover:underline disabled:opacity-50"
                        >
                          {deletingHomeworkId === homework.id ? 'Đang xóa...' : 'Xóa'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {homeworks.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-3 text-center text-gray-500">Chưa có bài tập nào</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className={`bg-white rounded shadow p-6 mb-8 ${activeSection === 'homework' ? '' : 'hidden'}`}>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Bài nộp của học viên và nhận xét giáo viên</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <select
              value={homeworkSubmissionCourseFilter}
              onChange={(e) => {
                setHomeworkSubmissionCourseFilter(e.target.value)
                setHomeworkSubmissionHomeworkFilter('')
              }}
              className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#14532d]"
            >
              <option value="">Tất cả khóa học</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>{course.title}</option>
              ))}
            </select>

            <select
              value={homeworkSubmissionHomeworkFilter}
              onChange={(e) => setHomeworkSubmissionHomeworkFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#14532d]"
            >
              <option value="">Tất cả bài tập</option>
              {homeworks
                .filter((homework) => !homeworkSubmissionCourseFilter || homework.courseId === homeworkSubmissionCourseFilter)
                .map((homework) => (
                  <option key={homework.id} value={homework.id}>{homework.title}</option>
                ))}
            </select>

            <button
              onClick={fetchHomeworkSubmissions}
              className="px-4 py-2 bg-[#14532d] text-white rounded hover:bg-[#166534]"
            >
              Làm mới danh sách nộp bài
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Học viên</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SĐT</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Khóa học</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bài tập</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bài làm học viên</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày nộp</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nhận xét giáo viên</th>
                </tr>
              </thead>
              <tbody>
                {homeworkSubmissions.map((submission) => (
                  <tr key={submission.id} className="border-b align-top">
                    <td className="px-4 py-3 text-sm text-gray-900">{submission.user.name || submission.user.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{submission.user.phone || 'Chưa cập nhật'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{submission.homework.course.title}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{submission.homework.title}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 whitespace-pre-wrap">{submission.note || 'Không có nội dung'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{new Date(submission.submittedAt).toLocaleString('vi-VN')}</td>
                    <td className="px-4 py-3 text-sm">
                      <textarea
                        value={homeworkTeacherComments[submission.id] || ''}
                        onChange={(e) => setHomeworkTeacherComments((current) => ({ ...current, [submission.id]: e.target.value }))}
                        rows={3}
                        placeholder="Nhập nhận xét cho học viên"
                        className="w-72 max-w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#14532d]"
                      />
                      <button
                        onClick={() => saveHomeworkTeacherComment(submission.id)}
                        disabled={savingHomeworkCommentId === submission.id}
                        className="mt-2 block px-3 py-1.5 bg-[#14532d] text-white rounded hover:bg-[#166534] disabled:opacity-50"
                      >
                        {savingHomeworkCommentId === submission.id ? 'Đang lưu...' : 'Lưu nhận xét'}
                      </button>
                    </td>
                  </tr>
                ))}
                {homeworkSubmissions.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-3 text-center text-gray-500">Chưa có bài nộp nào theo bộ lọc hiện tại</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className={`bg-white rounded shadow p-6 mb-8 ${activeSection === 'exercise' ? '' : 'hidden'}`}>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Tạo Exercise trắc nghiệm</h2>

          {exerciseSuccess && (
            <div className="mb-4 p-3 bg-[#14532d]/10 border border-[#14532d]/40 rounded text-[#14532d]">{exerciseSuccess}</div>
          )}
          {exerciseError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 rounded text-red-700">Lỗi: {exerciseError}</div>
          )}

          <div className="mb-6 rounded border border-[#14532d]/20 bg-[#14532d]/5 px-4 py-3 text-sm text-[#14532d]">
            Tổng số Exercise đã tạo: <span className="font-semibold">{exercises.length}</span>
          </div>

          <div className="mb-8 overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Khóa học</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exercise</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mô tả</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số câu</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {exercises.map((exercise) => (
                  <tr key={exercise.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{exercise.course.title}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">Exercise {exercise.order}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`rounded px-2 py-1 text-xs font-semibold ${exercise.isDraft ? 'bg-amber-100 text-amber-800' : 'bg-[#14532d]/10 text-[#14532d]'}`}>
                        {exercise.isDraft ? 'Nháp' : 'Đã xuất bản'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{exercise.description || 'Chưa có mô tả'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{exercise.questions.length}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-3">
                        <button onClick={() => openEditExercise(exercise)} className="text-[#14532d] hover:underline">Sửa</button>
                        <button
                          onClick={() => deleteExercise(exercise)}
                          disabled={deletingExerciseId === exercise.id}
                          className="text-red-600 hover:underline disabled:opacity-50"
                        >
                          {deletingExerciseId === exercise.id ? 'Đang xóa...' : 'Xóa'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {exercises.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-3 text-center text-gray-500">Chưa có exercise nào</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mb-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setShowExerciseBuilder((current) => !current)
                setExerciseError('')
                setExerciseSuccess('')
              }}
              className="px-6 py-2 bg-[#14532d] text-white rounded hover:bg-[#166534] font-medium"
            >
              {showExerciseBuilder ? 'Thu gọn form Exercise' : 'Tạo Exercise'}
            </button>

              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="url"
                  value={newExerciseSourceFormUrl}
                  onChange={(e) => setNewExerciseSourceFormUrl(e.target.value)}
                  placeholder="Dán link Google Form (viewform)"
                  className="w-80 max-w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#14532d]"
                />
                <button
                  type="button"
                  onClick={importFromGoogleForm}
                  disabled={importingForm}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {importingForm ? 'Đang import...' : 'Import từ Google Form'}
                </button>
              </div>

            {showExerciseBuilder && (
              <button
                type="button"
                onClick={() => {
                  setNewExerciseQuestions(buildEmptyExerciseQuestions())
                  setExerciseError('')
                }}
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 font-medium"
              >
                Làm mới form
              </button>
            )}
          </div>

          {showExerciseBuilder && (
            <>
              <div className="mb-6 flex flex-col gap-2 max-w-sm">
                <label className="text-sm font-medium text-gray-700">Khóa học</label>
                <select
                  value={newExerciseCourseId}
                  onChange={(e) => setNewExerciseCourseId(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#14532d]"
                >
                  <option value="">Chọn khóa học</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>{course.title}</option>
                  ))}
                </select>
              </div>

              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-gray-700">Mô tả Exercise</label>
                <textarea
                  value={newExerciseDescription}
                  onChange={(e) => setNewExerciseDescription(e.target.value)}
                  rows={3}
                  placeholder="Ví dụ: Luyện tập phụ âm /th/ và phân biệt âm gần giống"
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#14532d]"
                />
              </div>

              <div className="space-y-4">
                {newExerciseQuestions.map((question, index) => (
                  <div key={`new-exercise-${index}`} className="rounded-xl border border-gray-200 p-4">
                    <h3 className="font-bold text-[#14532d] mb-3">Câu {index + 1}</h3>
                    <div className="space-y-3">
                      <textarea
                        value={question.question}
                        onChange={(e) => updateNewExerciseQuestion(index, 'question', e.target.value)}
                        rows={2}
                        placeholder="Nhập câu hỏi"
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#14532d]"
                      />
                      <input
                        type="text"
                        value={question.optionA}
                        onChange={(e) => updateNewExerciseQuestion(index, 'optionA', e.target.value)}
                        placeholder="Đáp án A"
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#14532d]"
                      />
                      <input
                        type="text"
                        value={question.optionB}
                        onChange={(e) => updateNewExerciseQuestion(index, 'optionB', e.target.value)}
                        placeholder="Đáp án B"
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#14532d]"
                      />
                      <input
                        type="text"
                        value={question.optionC}
                        onChange={(e) => updateNewExerciseQuestion(index, 'optionC', e.target.value)}
                        placeholder="Đáp án C"
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#14532d]"
                      />
                      <select
                        value={question.correctOption}
                        onChange={(e) => updateNewExerciseQuestion(index, 'correctOption', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#14532d]"
                      >
                        <option value="A">Đáp án đúng: A</option>
                        <option value="B">Đáp án đúng: B</option>
                        <option value="C">Đáp án đúng: C</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => createExercise(true)}
                disabled={savingExerciseDraft || publishingExercise}
                className="mt-6 mr-3 px-6 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 font-medium disabled:opacity-50"
              >
                {savingExerciseDraft ? 'Đang lưu nháp...' : 'Save bản nháp'}
              </button>

              <button
                onClick={() => createExercise(false)}
                disabled={savingExerciseDraft || publishingExercise}
                className="mt-6 px-6 py-2 bg-[#14532d] text-white rounded hover:bg-[#166534] font-medium disabled:opacity-50"
              >
                {publishingExercise ? 'Đang xuất bản...' : 'Xuất bản Exercise'}
              </button>
            </>
          )}
        </div>

        <div className={`bg-white rounded shadow p-6 mb-8 ${activeSection === 'exercise' ? '' : 'hidden'}`}>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Kết quả Exercise của học viên</h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Học viên</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Khóa học</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exercise</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Điểm</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thời gian làm</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thời gian nộp</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chi tiết</th>
                </tr>
              </thead>
              <tbody>
                {exerciseResults.map((result) => (
                  <tr key={result.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{result.user.name || result.user.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{result.courseTitle}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">Exercise {result.exerciseOrder}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-[#14532d]">{result.score}/{result.totalQuestions}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{formatDuration(result.durationSeconds)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{new Date(result.submittedAt).toLocaleString('vi-VN')}</td>
                    <td className="px-4 py-3 text-sm">
                      <button onClick={() => setSelectedExerciseResult(result)} className="text-[#14532d] hover:underline">Xem bài làm</button>
                    </td>
                  </tr>
                ))}
                {exerciseResults.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-3 text-center text-gray-500">Chưa có học viên nào nộp exercise</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className={`bg-white rounded shadow p-6 mb-8 ${activeSection === 'lectureNote' ? '' : 'hidden'}`}>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Lecture Notes theo từng khóa học</h2>

          {lectureSuccess && (
            <div className="mb-4 p-3 bg-[#14532d]/10 border border-[#14532d]/40 rounded text-[#14532d]">{lectureSuccess}</div>
          )}
          {lectureError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 rounded text-red-700">Lỗi: {lectureError}</div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <select
              value={selectedLectureNoteCourseId}
              onChange={(e) => {
                setSelectedLectureNoteCourseId(e.target.value)
                setLectureSuccess('')
                setLectureError('')
              }}
              className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#14532d]"
            >
              <option value="">Chọn khóa học</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>{course.title}</option>
              ))}
            </select>

            <input
              type="number"
              min={1}
              max={30}
              value={newLectureSession}
              onChange={(e) => setNewLectureSession(e.target.value)}
              placeholder="Buổi học (1-30)"
              className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#14532d]"
            />

            <input
              type="url"
              value={newLectureDriveLink}
              onChange={(e) => setNewLectureDriveLink(e.target.value)}
              placeholder="Link Google Drive"
              className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#14532d]"
            />

            <button
              onClick={createLectureNote}
              className="px-4 py-2 bg-[#14532d] text-white rounded hover:bg-[#166534]"
            >
              Thêm tài liệu
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Buổi học</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Google Drive link</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cập nhật</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {lectureNotes.map((note) => (
                  <tr key={note.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                      {editingLectureNote?.id === note.id ? (
                        <input
                          type="number"
                          min={1}
                          max={30}
                          value={editLectureSession}
                          onChange={(e) => setEditLectureSession(e.target.value)}
                          className="w-24 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#14532d]"
                          placeholder="1-30"
                        />
                      ) : (
                        <>Buổi {note.sessionNumber}</>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {editingLectureNote?.id === note.id ? (
                        <input
                          type="url"
                          value={editLectureDriveLink}
                          onChange={(e) => setEditLectureDriveLink(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#14532d]"
                          placeholder="Dán link Google Drive"
                        />
                      ) : note.driveLink ? (
                        <a href={note.driveLink} target="_blank" rel="noreferrer" className="text-[#14532d] hover:underline break-all">
                          {note.driveLink}
                        </a>
                      ) : (
                        <span className="text-gray-400">Chưa có link</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{new Date(note.updatedAt).toLocaleString('vi-VN')}</td>
                    <td className="px-4 py-3 text-sm">
                      {editingLectureNote?.id === note.id ? (
                        <div className="flex gap-2">
                          <button
                            onClick={updateLectureNote}
                            disabled={savingLectureId === note.id}
                            className="px-3 py-1.5 bg-[#14532d] text-white rounded hover:bg-[#166534] disabled:opacity-50"
                          >
                            Lưu
                          </button>
                          <button
                            onClick={() => {
                              setEditingLectureNote(null)
                              setEditLectureSession('')
                              setEditLectureDriveLink('')
                            }}
                            className="px-3 py-1.5 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                          >
                            Hủy
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingLectureNote(note)
                              setEditLectureSession(String(note.sessionNumber))
                              setEditLectureDriveLink(note.driveLink || '')
                            }}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => deleteLectureNote(note.id)}
                            disabled={deletingLectureId === note.id}
                            className="px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                          >
                            {deletingLectureId === note.id ? 'Đang xóa...' : 'Xóa'}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {lectureNotes.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-3 text-center text-gray-500">Chưa có lecture notes cho khóa học này</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Search and Filter */}
        <div className={`bg-white rounded shadow p-6 mb-8 ${activeSection === 'course' ? '' : 'hidden'}`}>
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Tìm kiếm học viên (tên, email hoặc SĐT)..."
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
        {activeSection === 'course' && error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-8">
            Lỗi: {error}
          </div>
        )}

        {/* Students Table */}
        <div className={`bg-white rounded shadow overflow-hidden ${activeSection === 'course' ? '' : 'hidden'}`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SĐT</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bài tập</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày đăng ký</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      Đang tải...
                    </td>
                  </tr>
                ) : filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      Không tìm thấy học viên
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map(student => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{student.name || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{student.phone || 'Chưa cập nhật'}</td>
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
        <div className={`mt-12 bg-white rounded shadow p-6 ${activeSection === 'course' ? '' : 'hidden'}`}>
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
                type="text"
                value={newDeadline}
                onChange={(e) => setNewDeadline(e.target.value)}
                placeholder="dd/mm/yyyy"
                inputMode="numeric"
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tiến độ khóa học</th>
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
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <div className="w-40">
                        <div className="mb-1 flex items-center justify-between text-xs text-gray-600">
                          <span>{course.completedSessions}/30 buổi</span>
                          <span>{Math.round((Math.min(30, Math.max(0, course.completedSessions)) / 30) * 100)}%</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded bg-gray-200">
                          <div
                            className="h-full bg-amber-500 transition-all"
                            style={{ width: `${(Math.min(30, Math.max(0, course.completedSessions)) / 30) * 100}%` }}
                          />
                        </div>
                      </div>
                    </td>
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
                    <td colSpan={10} className="px-4 py-3 text-center text-gray-500">
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
                  type="text"
                  value={editCourseDeadline}
                  onChange={(e) => setEditCourseDeadline(e.target.value)}
                  placeholder="dd/mm/yyyy"
                  inputMode="numeric"
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
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-gray-700">Số buổi đã hoàn thành (0-30)</span>
                  <input
                    type="number"
                    min={0}
                    max={30}
                    value={editCourseCompletedSessions}
                    onChange={(e) => setEditCourseCompletedSessions(Math.min(30, Math.max(0, Number(e.target.value) || 0)))}
                    placeholder="Từ 0 đến 30"
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

        {editingHomework && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded shadow-lg p-6 max-w-lg w-full">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Sửa bài tập</h3>

              <div className="space-y-4">
                <select
                  value={editHomeworkCourseId}
                  onChange={(e) => setEditHomeworkCourseId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#14532d]"
                >
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>{course.title}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={editHomeworkTitle}
                  onChange={(e) => setEditHomeworkTitle(e.target.value)}
                  placeholder="Tên bài tập"
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#14532d]"
                />
                <textarea
                  value={editHomeworkDescription}
                  onChange={(e) => setEditHomeworkDescription(e.target.value)}
                  rows={3}
                  placeholder="Mô tả bài tập"
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#14532d]"
                />
                <input
                  type="text"
                  value={editHomeworkDueDate}
                  onChange={(e) => setEditHomeworkDueDate(e.target.value)}
                  placeholder="dd/mm/yyyy"
                  inputMode="numeric"
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#14532d]"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setEditingHomework(null)}
                  disabled={savingHomeworkId === editingHomework.id}
                  className="px-4 py-2 bg-gray-300 text-gray-900 rounded hover:bg-gray-400 disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  onClick={saveEditedHomework}
                  disabled={savingHomeworkId === editingHomework.id}
                  className="px-4 py-2 bg-[#14532d] text-white rounded hover:bg-[#166534] disabled:opacity-50"
                >
                  {savingHomeworkId === editingHomework.id ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </div>
          </div>
        )}

        {editingExercise && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded shadow-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Sửa Exercise {editingExercise.order}</h3>

              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-gray-700">Mô tả Exercise</label>
                <textarea
                  value={editExerciseDescription}
                  onChange={(e) => setEditExerciseDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#14532d]"
                />
              </div>

              <div className="space-y-4">
                {editExerciseQuestions.map((question, index) => (
                  <div key={`edit-exercise-${index}`} className="rounded-xl border border-gray-200 p-4">
                    <h4 className="font-bold text-[#14532d] mb-3">Câu {index + 1}</h4>
                    <div className="space-y-3">
                      <textarea
                        value={question.question}
                        onChange={(e) => updateEditExerciseQuestion(index, 'question', e.target.value)}
                        rows={2}
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#14532d]"
                      />
                      <input
                        type="text"
                        value={question.optionA}
                        onChange={(e) => updateEditExerciseQuestion(index, 'optionA', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#14532d]"
                      />
                      <input
                        type="text"
                        value={question.optionB}
                        onChange={(e) => updateEditExerciseQuestion(index, 'optionB', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#14532d]"
                      />
                      <input
                        type="text"
                        value={question.optionC}
                        onChange={(e) => updateEditExerciseQuestion(index, 'optionC', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#14532d]"
                      />
                      <select
                        value={question.correctOption}
                        onChange={(e) => updateEditExerciseQuestion(index, 'correctOption', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#14532d]"
                      >
                        <option value="A">Đáp án đúng: A</option>
                        <option value="B">Đáp án đúng: B</option>
                        <option value="C">Đáp án đúng: C</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setEditingExercise(null)}
                  disabled={savingExerciseId === editingExercise.id}
                  className="px-4 py-2 bg-gray-300 text-gray-900 rounded hover:bg-gray-400 disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  onClick={saveEditedExercise}
                  disabled={savingExerciseId === editingExercise.id}
                  className="px-4 py-2 bg-[#14532d] text-white rounded hover:bg-[#166534] disabled:opacity-50"
                >
                  {savingExerciseId === editingExercise.id ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </div>
          </div>
        )}

        {selectedExerciseResult && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded shadow-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Bài làm Exercise {selectedExerciseResult.exerciseOrder}</h3>
                  <p className="text-sm text-gray-600">{selectedExerciseResult.user.name || selectedExerciseResult.user.email} - {selectedExerciseResult.courseTitle}</p>
                  <p className="mt-1 text-sm font-semibold text-[#14532d]">Điểm: {selectedExerciseResult.score}/{selectedExerciseResult.totalQuestions}</p>
                  <p className="mt-1 text-sm text-gray-600">Thời gian làm bài: {formatDuration(selectedExerciseResult.durationSeconds)}</p>
                </div>
                <button
                  onClick={() => setSelectedExerciseResult(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                {selectedExerciseResult.answers.map((answer) => (
                  <div key={answer.id} className="rounded-xl border border-gray-200 p-4">
                    <p className="font-semibold text-gray-900">{answer.question.order}. {answer.question.question}</p>
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      <div className={`rounded-lg px-4 py-3 text-sm ${answer.isCorrect ? 'bg-[#14532d]/10 text-[#14532d]' : 'bg-red-50 text-red-700'}`}>
                        Học viên chọn: {answer.selectedOption}
                      </div>
                      <div className="rounded-lg bg-gray-100 px-4 py-3 text-sm text-gray-700">
                        Đáp án đúng: {answer.question.correctOption}
                      </div>
                    </div>
                  </div>
                ))}
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
        <div className={`mt-12 bg-white rounded shadow p-6 ${activeSection === 'course' ? '' : 'hidden'}`}>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Đăng ký <span className="text-amber-600">Khóa học</span>
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Học viên</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SĐT</th>
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
                    <td className="px-4 py-3 text-sm text-gray-700">{enrollment.user.phone || 'Chưa cập nhật'}</td>
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
                      <div className="flex flex-wrap gap-2">
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
                        <button
                          onClick={() => rejectUser(enrollment.user.id, enrollment.user.name || enrollment.user.email)}
                          disabled={rejectingUserId === enrollment.user.id}
                          className="text-red-600 hover:text-red-800 hover:underline disabled:opacity-50"
                        >
                          {rejectingUserId === enrollment.user.id ? 'Đang xử lý...' : 'Từ chối học viên'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {enrollments.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-3 text-center text-gray-500">
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

