'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import LinkifiedText from '@/components/LinkifiedText'

interface CourseItem {
  id: string
  title: string
  description: string | null
  price: number
  currency: string
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
  unreadStudentMessageCount: number
  pendingTeacherReplyCount: number
}

interface UserOverviewItem {
  id: string
  name: string | null
  phone: string | null
  email: string
  createdAt: string
}

interface ReferralRowItem {
  referredUserId: string
  referredUserName: string | null
  referredUserEmail: string
  referredUserPhone: string | null
  referredStudentId: string | null
  referredCourseTitle: string | null
  referredStatus: string | null
  registeredAt: string
  referrerUserId: string | null
  referrerName: string | null
  referrerEmail: string | null
  referrerPhone: string | null
  referrerStudentId: string | null
  referrerCourseTitle: string | null
}

interface HomeworkItem {
  id: string
  courseId: string
  title: string
  description: string | null
  attachmentUrl: string | null
  dueDate: string
  course: { title: string }
  _count: { submissions: number }
}

interface HomeworkSubmissionItem {
  id: string
  note: string | null
  teacherComment: string | null
  submittedAt: string
  messages: HomeworkMessageItem[]
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

interface HomeworkMessageItem {
  id: string
  senderRole: 'student' | 'teacher'
  content: string
  createdAt: string
}

interface ExerciseQuestionItem {
  id: string
  order: number
  question: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string | null
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

interface SpeakYourselfAttemptItem {
  id: string
  accuracy: number
  passed: boolean
  generatedScript: string
  recognizedText: string
  createdAt: string
  user: {
    id: string
    name: string | null
    email: string
  }
  course: {
    id: string
    title: string
  }
}

interface ExerciseItem {
  id: string
  courseId: string
  order: number
  title: string | null
  description: string | null
  exerciseType: string
  audioFileUrl: string | null
  attachmentFileUrl: string | null
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
  optionD: string
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

interface AdminCheckinRow {
  enrollmentId: string
  userId: string
  studentName: string
  phone: string
  email: string
  courseId: string
  courseTitle: string
  checkedInToday: boolean
  checkinCount7d: number
  latestMessage: string
  latestInputMethod: 'text' | 'voice' | null
  latestUpdatedAt: string | null
}

interface AdminVocabularyItem {
  id: string
  courseId: string
  word: string
  phonetic: string | null
  englishDefinition: string | null
  meaning: string
  example: string | null
  displayOrder: number
  isActive: boolean
  course: {
    id: string
    title: string
  }
}

interface VocabularyImportDraftItem {
  word: string
  phonetic: string
  englishDefinition: string
  meaning: string
  example: string
}

interface ActivityPointRuleItem {
  id: string
  activityKey: string
  label: string
  points: number
  isActive: boolean
  updatedAt: string
}

interface ActivityPointMemberRow {
  id: string
  name: string | null
  email: string
  activityPoints: number
}

interface ActivityPointResponse {
  rules?: ActivityPointRuleItem[]
  members?: ActivityPointMemberRow[]
  warning?: string
}

const ACTIVITY_POINT_DESCRIPTION_MAP: Record<string, string> = {
  daily_checkin: 'Complete a daily check-in message.',
  daily_reflection: 'Write your daily reflection.',
  exercise_completion: 'Submit an exercise for the first time.',
  homework_on_time: 'Submit homework on or before the due date.',
  badge_first_checkin: 'Complete your very first daily check-in.',
  badge_checkin_streak_3: 'Check in for 3 consecutive days.',
  badge_checkin_streak_7: 'Keep your check-in streak going for 7 days straight.',
  badge_checkin_30: 'Check in 30 times in total.',
  badge_first_reflection: 'Write your very first daily reflection.',
  badge_reflection_streak_3: 'Reflect for 3 consecutive days without a break.',
  badge_reflection_10: 'Complete 10 daily reflections total.',
  badge_first_submit: 'Submit your very first homework assignment.',
  badge_on_time_3: 'Submit homework on time at least 3 times.',
  badge_submit_5: 'Submit 5 or more homework assignments.',
  badge_all_rounder: 'Check in, reflect, and submit homework in the same day.',
  vocab_pronunciation: 'Học viên được tặng AP khi phát âm chính xác 100% từ vựng tại trang Luyện TOEIC.'
}

const getActivityPointDescription = (activityKey: string) =>
  ACTIVITY_POINT_DESCRIPTION_MAP[activityKey] || 'Custom AP rule configured by admin.'

type AdminSection = 'course' | 'homework' | 'exercise' | 'lectureNote' | 'dailyActivity' | 'activityPoints' | 'vocabulary' | 'speakYourself' | 'referral'

const buildVocabularyFormState = (item?: AdminVocabularyItem | null) => ({
  courseId: item?.courseId || '',
  word: item?.word || '',
  phonetic: item?.phonetic || '',
  englishDefinition: item?.englishDefinition || '',
  meaning: item?.meaning || '',
  example: item?.example || ''
})

const buildEmptyExerciseQuestions = (): ExerciseQuestionForm[] =>
  Array.from({ length: 10 }, () => ({
    question: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctOption: 'A'
  }))

const buildExerciseResults = (items: ExerciseItem[]) =>
  items
    .flatMap((exercise) =>
      exercise.submissions.map((submission) => ({
        ...submission,
        exerciseTitle: String(exercise.title || '').trim() || `Exercise ${exercise.order}`,
        courseTitle: exercise.course.title
      }))
    )
    .sort((left, right) => new Date(right.submittedAt).getTime() - new Date(left.submittedAt).getTime())

const extractHomeworkOrder = (title: string) => {
  const match = String(title || '').match(/homework\s*(\d+)/i)
  return match ? Number(match[1]) : Number.POSITIVE_INFINITY
}

const HOMEWORK_SUBMISSION_GROUP_STYLES = [
  {
    wrap: 'border-[#14532d]/25',
    header: 'border-[#14532d]/20 bg-[#14532d]/5',
    title: 'text-[#14532d]'
  },
  {
    wrap: 'border-amber-300/70',
    header: 'border-amber-200 bg-amber-50',
    title: 'text-amber-800'
  },
  {
    wrap: 'border-blue-300/70',
    header: 'border-blue-200 bg-blue-50',
    title: 'text-blue-800'
  },
  {
    wrap: 'border-emerald-300/70',
    header: 'border-emerald-200 bg-emerald-50',
    title: 'text-emerald-800'
  }
] as const

const getExerciseTitle = (exercise: Pick<ExerciseItem, 'title' | 'order'>) => {
  const trimmed = String(exercise.title || '').trim()
  return trimmed || `Exercise ${exercise.order}`
}

const getExerciseTypeLabel = (exerciseType: string) => {
  if (exerciseType === 'question_response' || exerciseType === 'listening_audio') return 'Question-Response'
  if (exerciseType === 'conversation') return 'Conversation'
  return 'Pronunciation'
}

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

const isValidYoutubeVideoId = (value: string) => /^[A-Za-z0-9_-]{11}$/.test(value)

const extractYoutubeVideoIdFromUrl = (urlValue: string) => {
  try {
    const parsed = new URL(urlValue)
    const host = parsed.hostname.toLowerCase().replace(/^www\./, '')
    const pathSegments = parsed.pathname.split('/').filter(Boolean)

    if (host === 'youtu.be') {
      const shortId = pathSegments[0] || ''
      return isValidYoutubeVideoId(shortId) ? shortId : null
    }

    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com' || host === 'youtube-nocookie.com') {
      if (parsed.pathname === '/watch') {
        const watchId = parsed.searchParams.get('v') || ''
        return isValidYoutubeVideoId(watchId) ? watchId : null
      }

      if (pathSegments[0] === 'shorts' || pathSegments[0] === 'embed' || pathSegments[0] === 'live') {
        const pathId = pathSegments[1] || ''
        return isValidYoutubeVideoId(pathId) ? pathId : null
      }
    }

    return null
  } catch {
    return null
  }
}

const extractYoutubeVideoIdFromText = (content: string) => {
  const urlMatches = content.match(/https?:\/\/[^\s]+/gi) || []

  for (const match of urlMatches) {
    const cleanUrl = match.replace(/[),.;!?]+$/g, '')
    const videoId = extractYoutubeVideoIdFromUrl(cleanUrl)
    if (videoId) {
      return videoId
    }
  }

  return null
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

const parseApiResponse = async (response: Response) => {
  const raw = await response.text()
  if (!raw) {
    return {}
  }

  try {
    return JSON.parse(raw)
  } catch {
    return { error: raw }
  }
}

const COURSE_DESCRIPTION_TEMPLATE = [
  '1. Khóa học này dành cho ai?',
  '* Sinh viên, người đi làm đã học tiếng Anh nhiều lần nhưng chưa tự tin khi giao tiếp.',
  '* Những bạn muốn nâng cao khả năng phát âm, thực hành các tình huống thực tế để sử dụng trong giao tiếp, công việc như khi đi du lịch nước ngoài, hỏi đường, check in / check out khách sạn, giới thiệu bản thân, phỏng vấn xin việc, chia sẻ quan điểm cá nhân về một số vấn đề phổ biến.',
  '',
  '2. Bạn nhận được quyền lợi gì khi tham gia khóa học?',
  '* Được học trong nhóm nhỏ tối đa 8 người, được giáo viên theo sát tiến độ, sửa lỗi khi phát âm và luyện nói.',
  '* Có thể học duy trì qua nhiều khóa để hoàn thiện kĩ năng chỉ với 01 lần nộp học phí. (Các lần học tiếp theo có đóng một khoản phí nhỏ để duy trì và để thể hiện sự cam kết theo học).',
  '* Được học trải nghiệm 03 buổi trước khi đóng học phí tiếp tục khóa học.',
  '* Quyền truy cập sử dụng nền tảng học tập tiếng Anh trực tuyến ENGLISHMORE giúp làm bài và luyện tập hiệu quả',
  '',
  '3. Khóa học có gì đặc biệt?',
  '* Học viên sẽ được rèn luyện phát âm đúng ngay từ đầu để tự tin nghe và nói về sau.',
  '* Chương trình học không nặng ngữ pháp, tập trung vào giao tiếp nghe - nói hiệu quả, giúp bạn áp dụng ngay vào công việc và cuộc sống. Ngữ pháp sẽ được bổ túc và hoàn thiện song song trong và sau quá trình học.',
  '* Môi trường rèn luyện liên tục: bên cạnh giờ học trên lớp, bạn sẽ được luyện tập thêm 1-1 với giáo viên để duy trì động lực và đảm bảo đầu ra khóa học.',
  '* Bên cạnh ngôn ngữ, bạn còn học được kỹ năng giao tiếp, tư duy phát triển bản thân và những kinh nghiệm, trải nghiệm trong nhiều lĩnh vực khác.',
  '',
  '4. Ai là người giảng dạy?',
  '* Thầy Nguyễn Trí Bằng, 7 năm công tác tại Đại học Bách Khoa - ĐH Đà Nẵng trong lĩnh vực khoa học kỹ thuật, làm việc với 03 chương trình đào tạo quốc tế (02 chương trình tiên tiến Việt - Mỹ, chương trình đào tạo Kỹ sư Chất lượng Cao Việt Pháp).',
  '* 6 năm kinh nghiệm giảng dạy tiếng Anh.',
  '* 2 năm kinh nghiệm trong lĩnh vực công nghệ Blockchain.',
  '* Nhiều năm kinh nghiệm làm việc trong môi trường quốc tế, tham gia các hội nghị và sự kiện tại Singapore, Hàn Quốc, giúp mang đến góc nhìn và trải nghiệm thực tế cho học viên.',
  '',
  '5. Lịch học và thời lượng như thế nào?',
  '* Học trực tuyến qua Zoom, linh hoạt thời gian mà vẫn đảm bảo tương tác như lớp học trực tiếp.',
  '* 02 phiên/tuần, 02 giờ/phiên',
  '* Thời lượng: 30 phiên',
  '* Lịch học dự kiến: Thứ Ba + Thứ Sáu, 19:30 - 21:30 (sẽ thống nhất lại vào buổi học đầu tiên).',
  '',
  '6. Tôi chưa từng học tiếng Anh bài bản, có theo kịp không?',
  '* Hoàn toàn có thể. Khóa học được thiết kế cho cả người mới bắt đầu nên bạn sẽ được hướng dẫn từng bước một.',
  '* Mỗi học viên đều được hỗ trợ thực hành, sửa lỗi 1-1 để tiến bộ nhanh nhất.',
  '',
  '7. Sau khi hoàn thành khóa học này, tôi có thể đạt được những kỹ năng gì?',
  '* Phát âm chuẩn quốc tế theo IPA.',
  '* Tự tin sử dụng tiếng Anh để đọc hiểu tài liệu và giao tiếp cơ bản khi làm việc, phỏng vấn, du lịch nước ngoài, gặp gỡ đối tác quốc tế.',
  '* Biết giới thiệu bản thân, thuyết trình các bài phát biểu ngắn, giao tiếp các tình huống thường ngày khi đi công tác, trên máy bay, nghỉ dưỡng...',
  '* Biết được phương pháp học tiếng Anh phù hợp với bản thân để tiếp tục rèn luyện trong tương lai.',
  '',
  '8. Tôi có thể đăng ký và bắt đầu học như thế nào?',
  '* Tham gia khóa học bằng cách nhấn vào nút Đăng Ký và đợi giáo viên xác nhận.',
  '* Sau khi đăng ký, bạn sẽ được hướng dẫn tham gia lớp và các thông tin liên quan.',
  '',
  '9. Tôi cần chuẩn bị gì khi tham gia khóa học?',
  '- Laptop, máy tính cá nhân có microphone, camera.',
  '- Internet ổn định.',
  '- Bút, sổ tay ghi chép.',
  '- Kênh Youtube để nộp bài tập.'
].join('\n')

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null)
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null)

  const [courses, setCourses] = useState<CourseItem[]>([])
  const [newCourseTitle, setNewCourseTitle] = useState('')
  const [newCourseDescription, setNewCourseDescription] = useState('')
  const [newDeadline, setNewDeadline] = useState('')
  const [newCourseMaxStudents, setNewCourseMaxStudents] = useState(10)
  const [newCoursePrice, setNewCoursePrice] = useState(4200000)
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
  const [editCoursePrice, setEditCoursePrice] = useState(0)
  const [editCourseCompletedSessions, setEditCourseCompletedSessions] = useState(0)
  const [savingCourseId, setSavingCourseId] = useState<string | null>(null)
  const [confirmUnpublish, setConfirmUnpublish] = useState<{ id: string; title: string } | null>(null)
  const [courseDetailPreview, setCourseDetailPreview] = useState<{ title: string; description: string | null } | null>(null)
  const [summary, setSummary] = useState<DashboardSummary>({
    totalUsers: 0,
    totalStudents: 0,
    unreadStudentMessageCount: 0,
    pendingTeacherReplyCount: 0
  })
  const [usersOverview, setUsersOverview] = useState<UserOverviewItem[]>([])
  const [referralRows, setReferralRows] = useState<ReferralRowItem[]>([])
  const [referralLoading, setReferralLoading] = useState(false)
  const [referralError, setReferralError] = useState('')
  const [referralSummary, setReferralSummary] = useState<{ totalReferrals: number; uniqueReferrers: number; referredMembers: number }>({
    totalReferrals: 0,
    uniqueReferrers: 0,
    referredMembers: 0
  })
  const [homeworks, setHomeworks] = useState<HomeworkItem[]>([])
  const [newHomeworkCourseId, setNewHomeworkCourseId] = useState('')
  const [newHomeworkTitle, setNewHomeworkTitle] = useState('')
  const [newHomeworkDescription, setNewHomeworkDescription] = useState('')
  const [newHomeworkDueDate, setNewHomeworkDueDate] = useState('')
  const [newHomeworkAttachment, setNewHomeworkAttachment] = useState<File | null>(null)
  const [newHomeworkAttachmentUploading, setNewHomeworkAttachmentUploading] = useState(false)
  const [homeworkError, setHomeworkError] = useState('')
  const [homeworkSuccess, setHomeworkSuccess] = useState('')
  const [editingHomework, setEditingHomework] = useState<HomeworkItem | null>(null)
  const [editHomeworkCourseId, setEditHomeworkCourseId] = useState('')
  const [editHomeworkTitle, setEditHomeworkTitle] = useState('')
  const [editHomeworkDescription, setEditHomeworkDescription] = useState('')
  const [editHomeworkDueDate, setEditHomeworkDueDate] = useState('')
  const [editHomeworkAttachment, setEditHomeworkAttachment] = useState<File | null>(null)
  const [editHomeworkAttachmentUrl, setEditHomeworkAttachmentUrl] = useState<string | null>(null)
  const [editHomeworkAttachmentUploading, setEditHomeworkAttachmentUploading] = useState(false)
  const [savingHomeworkId, setSavingHomeworkId] = useState<string | null>(null)
  const [deletingHomeworkId, setDeletingHomeworkId] = useState<string | null>(null)
  const [homeworkSubmissions, setHomeworkSubmissions] = useState<HomeworkSubmissionItem[]>([])
  const [homeworkSubmissionCourseFilter, setHomeworkSubmissionCourseFilter] = useState('')
  const [homeworkSubmissionHomeworkFilter, setHomeworkSubmissionHomeworkFilter] = useState('')
  const [homeworkTeacherComments, setHomeworkTeacherComments] = useState<Record<string, string>>({})
  const [homeworkDetailSubmissionId, setHomeworkDetailSubmissionId] = useState<string | null>(null)
  const [savingHomeworkCommentId, setSavingHomeworkCommentId] = useState<string | null>(null)
  const [rejectingUserId, setRejectingUserId] = useState<string | null>(null)
  const [table1Expanded, setTable1Expanded] = useState(false)
  const [exercises, setExercises] = useState<ExerciseItem[]>([])
  const [newExerciseCourseId, setNewExerciseCourseId] = useState('')
  const [newExerciseTitle, setNewExerciseTitle] = useState('')
  const [newExerciseType, setNewExerciseType] = useState('multiple_choice')
  const [newExerciseQuestions, setNewExerciseQuestions] = useState<ExerciseQuestionForm[]>(buildEmptyExerciseQuestions())
  const [newExerciseAudioFileUrl, setNewExerciseAudioFileUrl] = useState<string | null>(null)
  const [newExerciseAudioFileName, setNewExerciseAudioFileName] = useState('')
  const [newExerciseAudioUploading, setNewExerciseAudioUploading] = useState(false)
  const [newExerciseAttachFileUrl, setNewExerciseAttachFileUrl] = useState<string | null>(null)
  const [newExerciseAttachFileName, setNewExerciseAttachFileName] = useState('')
  const [newExerciseAttachUploading, setNewExerciseAttachUploading] = useState(false)
  const [exerciseError, setExerciseError] = useState('')
  const [exerciseSuccess, setExerciseSuccess] = useState('')
  const [editingExercise, setEditingExercise] = useState<ExerciseItem | null>(null)
  const [editExerciseType, setEditExerciseType] = useState('multiple_choice')
  const [editExerciseQuestions, setEditExerciseQuestions] = useState<ExerciseQuestionForm[]>(buildEmptyExerciseQuestions())
  const [editExerciseAudioFileUrl, setEditExerciseAudioFileUrl] = useState<string | null>(null)
  const [editExerciseAudioFileName, setEditExerciseAudioFileName] = useState('')
  const [editExerciseAudioUploading, setEditExerciseAudioUploading] = useState(false)
  const [editExerciseAttachFileUrl, setEditExerciseAttachFileUrl] = useState<string | null>(null)
  const [editExerciseAttachFileName, setEditExerciseAttachFileName] = useState('')
  const [editExerciseAttachUploading, setEditExerciseAttachUploading] = useState(false)
  const [savingExerciseId, setSavingExerciseId] = useState<string | null>(null)
  const [selectedExerciseResult, setSelectedExerciseResult] = useState<(ExerciseSubmissionItem & { exerciseTitle: string; courseTitle: string }) | null>(null)
  const [showExerciseBuilder, setShowExerciseBuilder] = useState(false)
  const [newExerciseDescription, setNewExerciseDescription] = useState('')
  const [editExerciseTitle, setEditExerciseTitle] = useState('')
  const [editExerciseDescription, setEditExerciseDescription] = useState('')
  const [activeSection, setActiveSection] = useState<AdminSection>('course')
  const [newExerciseSourceFormUrl, setNewExerciseSourceFormUrl] = useState('')
  const [importingForm, setImportingForm] = useState(false)
  const [importingDocx, setImportingDocx] = useState(false)
  const [importingPptx, setImportingPptx] = useState(false)
  const [showImportExerciseModal, setShowImportExerciseModal] = useState(false)
  const [importSourceCourseId, setImportSourceCourseId] = useState('')
  const [importTargetCourseId, setImportTargetCourseId] = useState('')
  const [importSelectedExerciseIds, setImportSelectedExerciseIds] = useState<Set<string>>(new Set())
  const [importingFromCourse, setImportingFromCourse] = useState(false)
  const [importFromCourseError, setImportFromCourseError] = useState('')
  const [quickCopyExercise, setQuickCopyExercise] = useState<ExerciseItem | null>(null)
  const [quickCopyTargetCourseId, setQuickCopyTargetCourseId] = useState('')
  const [quickCopyLoading, setQuickCopyLoading] = useState(false)
  const [quickCopyError, setQuickCopyError] = useState('')
  const [savingExerciseDraft, setSavingExerciseDraft] = useState(false)
  const [publishingExercise, setPublishingExercise] = useState(false)
  const [deletingExerciseId, setDeletingExerciseId] = useState<string | null>(null)
  const [speakYourselfAttempts, setSpeakYourselfAttempts] = useState<SpeakYourselfAttemptItem[]>([])

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
  const [checkinRows, setCheckinRows] = useState<AdminCheckinRow[]>([])
  const [checkinCourseFilter, setCheckinCourseFilter] = useState('')
  const [checkinLoading, setCheckinLoading] = useState(false)
  const [checkinError, setCheckinError] = useState('')
  const [checkinSummary, setCheckinSummary] = useState<{ totalStudents: number; checkedInToday: number }>({
    totalStudents: 0,
    checkedInToday: 0
  })
  const [reflectRows, setReflectRows] = useState<Array<{
    enrollmentId: string; userId: string; studentName: string; phone: string; email: string
    courseId: string; courseTitle: string; reflectedToday: boolean; message: string; updatedAt: string | null
  }>>([])
  const [reflectCourseFilter, setReflectCourseFilter] = useState('')
  const [reflectLoading, setReflectLoading] = useState(false)
  const [reflectError, setReflectError] = useState('')
  const [reflectSummary, setReflectSummary] = useState<{ totalStudents: number; reflectedToday: number }>({ totalStudents: 0, reflectedToday: 0 })
  const [activityPointRules, setActivityPointRules] = useState<ActivityPointRuleItem[]>([])
  const [activityPointMembers, setActivityPointMembers] = useState<ActivityPointMemberRow[]>([])
  const [activityPointLoading, setActivityPointLoading] = useState(false)
  const [activityPointError, setActivityPointError] = useState('')
  const [activityPointWarning, setActivityPointWarning] = useState('')
  const [isActivityPointDbReady, setIsActivityPointDbReady] = useState(true)
  const [savingActivityPointKey, setSavingActivityPointKey] = useState('')
  const [apCourseFilter, setApCourseFilter] = useState('')
  const [vocabularyItems, setVocabularyItems] = useState<AdminVocabularyItem[]>([])
  const [vocabularyCourseFilter, setVocabularyCourseFilter] = useState('')
  const [newVocabularyCourseId, setNewVocabularyCourseId] = useState('')
  const [newVocabularyWord, setNewVocabularyWord] = useState('')
  const [newVocabularyPhonetic, setNewVocabularyPhonetic] = useState('')
  const [newVocabularyEnglishDefinition, setNewVocabularyEnglishDefinition] = useState('')
  const [newVocabularyMeaning, setNewVocabularyMeaning] = useState('')
  const [newVocabularyExample, setNewVocabularyExample] = useState('')
  const [vocabularyImportDocsUrl, setVocabularyImportDocsUrl] = useState('')
  const [vocabularyImportDocxFile, setVocabularyImportDocxFile] = useState<File | null>(null)
  const [vocabularyImportSourceCourseId, setVocabularyImportSourceCourseId] = useState('')
  const [vocabularyImportTargetCourseId, setVocabularyImportTargetCourseId] = useState('')
  const [importingVocabulary, setImportingVocabulary] = useState(false)
  const [importingVocabularyFromFileOrDocs, setImportingVocabularyFromFileOrDocs] = useState(false)
  const [confirmingVocabularyImport, setConfirmingVocabularyImport] = useState(false)
  const [vocabularyImportPreviewItems, setVocabularyImportPreviewItems] = useState<VocabularyImportDraftItem[]>([])
  const [vocabularyError, setVocabularyError] = useState('')
  const [vocabularySuccess, setVocabularySuccess] = useState('')
  const [savingVocabulary, setSavingVocabulary] = useState(false)
  const [editingVocabulary, setEditingVocabulary] = useState<AdminVocabularyItem | null>(null)
  const [updatingVocabularyId, setUpdatingVocabularyId] = useState<string | null>(null)
  const [deletingVocabularyId, setDeletingVocabularyId] = useState<string | null>(null)

  const deleteUserAccount = async (userId: string) => {
    try {
      setDeletingUserId(userId)
      const res = await fetch(`/api/admin/users/${userId}`, {
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

      setCourseSuccess('User account deleted successfully.')
      setCourseError('')
      setDeleteConfirm(null)
      fetchEnrollments()
      fetchMemberOverview()
      fetchCourses()
      fetchSummary()
    } catch (err) {
      setCourseError(err instanceof Error ? err.message : 'An error occurred')
      setDeleteConfirm(null)
    } finally {
      setDeletingUserId(null)
    }
  }

  const filteredEnrollments = enrollments.filter((enrollment) => {
    const keyword = searchTerm.trim().toLowerCase()
    if (!keyword) return true

    return [
      enrollment.user.name || '',
      enrollment.user.email,
      enrollment.user.phone || '',
      enrollment.course.title,
      enrollment.status
    ].some((field) => field.toLowerCase().includes(keyword))
  })

  const groupedFilteredEnrollments = useMemo(() => {
    const groups = filteredEnrollments.reduce((accumulator, enrollment) => {
      const courseTitle = enrollment.course.title || 'Uncategorized'
      const group = accumulator.get(courseTitle) || []
      group.push(enrollment)
      accumulator.set(courseTitle, group)
      return accumulator
    }, new Map<string, EnrollmentItem[]>())

    return Array.from(groups.entries())
      .sort(([left], [right]) => left.localeCompare(right, 'vi'))
      .map(([courseTitle, items]) => {
        const sortedItems = [...items].sort((left, right) => {
          if (left.status !== right.status) {
            return left.status === 'pending' ? -1 : 1
          }

          return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
        })

        return {
          courseTitle,
          items: sortedItems,
          pendingCount: sortedItems.filter((item) => item.status === 'pending').length
        }
      })
  }, [filteredEnrollments])

  const groupedHomeworks = useMemo(() => {
    const groups = homeworks.reduce((accumulator, homework) => {
      const courseTitle = homework.course.title || 'Uncategorized'
      const group = accumulator.get(courseTitle) || []
      group.push(homework)
      accumulator.set(courseTitle, group)
      return accumulator
    }, new Map<string, HomeworkItem[]>())

    return Array.from(groups.entries())
      .sort(([left], [right]) => left.localeCompare(right, 'vi'))
      .map(([courseTitle, items]) => {
        const sortedItems = [...items].sort(
          (left, right) => new Date(left.dueDate).getTime() - new Date(right.dueDate).getTime()
        )

        return {
          courseTitle,
          items: sortedItems,
          totalSubmissions: sortedItems.reduce((total, item) => total + Number(item._count.submissions || 0), 0)
        }
      })
  }, [homeworks])

  const groupedHomeworkSubmissions = useMemo(() => {
    const groups = homeworkSubmissions.reduce((accumulator, submission) => {
      const key = submission.homework.id
      const existing = accumulator.get(key)
      if (existing) {
        existing.items.push(submission)
        return accumulator
      }

      accumulator.set(key, {
        homeworkId: submission.homework.id,
        homeworkTitle: submission.homework.title,
        courseTitle: submission.homework.course.title,
        dueDate: submission.homework?.id ? (homeworks.find((item) => item.id === submission.homework.id)?.dueDate || '') : '',
        items: [submission]
      })

      return accumulator
    }, new Map<string, { homeworkId: string; homeworkTitle: string; courseTitle: string; dueDate: string; items: HomeworkSubmissionItem[] }>())

    return Array.from(groups.values())
      .sort((left, right) => {
        const leftOrder = extractHomeworkOrder(left.homeworkTitle)
        const rightOrder = extractHomeworkOrder(right.homeworkTitle)

        if (leftOrder !== rightOrder) {
          return leftOrder - rightOrder
        }

        const leftDue = left.dueDate ? new Date(left.dueDate).getTime() : Number.POSITIVE_INFINITY
        const rightDue = right.dueDate ? new Date(right.dueDate).getTime() : Number.POSITIVE_INFINITY
        if (leftDue !== rightDue) {
          return leftDue - rightDue
        }

        return left.homeworkTitle.localeCompare(right.homeworkTitle, 'vi')
      })
      .map((group) => ({
        ...group,
        items: [...group.items].sort((left, right) => new Date(right.submittedAt).getTime() - new Date(left.submittedAt).getTime())
      }))
  }, [homeworkSubmissions, homeworks])

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
        totalStudents: data.totalStudents || 0,
        unreadStudentMessageCount: data.unreadStudentMessageCount || 0,
        pendingTeacherReplyCount: data.pendingTeacherReplyCount || 0
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

      params.set('markAsRead', '1')
      const queryWithRead = params.toString()
      const res = await fetch(`/api/admin/homework/submissions${queryWithRead ? `?${queryWithRead}` : ''}`)
      if (!res.ok) throw new Error('Failed to fetch homework submissions')
      const data = await res.json()
      const submissions = data.submissions || []
      setHomeworkSubmissions(submissions)
      setHomeworkTeacherComments(
        Object.fromEntries(
          submissions.map((submission: HomeworkSubmissionItem) => [submission.id, ''])
        )
      )
      setHomeworkError('')
      fetchSummary()
    } catch (err) {
      setHomeworkError(err instanceof Error ? err.message : 'Could not load student submissions.')
    }
  }, [homeworkSubmissionCourseFilter, homeworkSubmissionHomeworkFilter])

  const fetchExerciseData = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/exercises')
      if (!res.ok) throw new Error('Failed to fetch exercises')
      const data = await res.json()
      setExercises(data.exercises || [])
      setSpeakYourselfAttempts(data.speakYourselfAttempts || [])
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

  const fetchCheckinData = useCallback(async () => {
    try {
      setCheckinLoading(true)
      setCheckinError('')

      const params = new URLSearchParams()
      if (checkinCourseFilter) params.set('courseId', checkinCourseFilter)
      const query = params.toString()

      const res = await fetch(`/api/admin/daily-greeting${query ? `?${query}` : ''}`)
      if (!res.ok) throw new Error('Failed to fetch check-in data')

      const data = await res.json()
      setCheckinRows(data.rows || [])
      setCheckinSummary({
        totalStudents: data.summary?.totalStudents || 0,
        checkedInToday: data.summary?.checkedInToday || 0
      })
    } catch (err) {
      setCheckinError(err instanceof Error ? err.message : 'Could not load check-in data.')
      setCheckinRows([])
      setCheckinSummary({ totalStudents: 0, checkedInToday: 0 })
    } finally {
      setCheckinLoading(false)
    }
  }, [checkinCourseFilter])

  const fetchReflectData = useCallback(async () => {
    try {
      setReflectLoading(true)
      setReflectError('')
      const params = new URLSearchParams()
      if (reflectCourseFilter) params.set('courseId', reflectCourseFilter)
      const query = params.toString()
      const res = await fetch(`/api/admin/reflections${query ? `?${query}` : ''}`)
      if (!res.ok) throw new Error('Failed to fetch reflection data')
      const data = await res.json()
      setReflectRows(data.rows || [])
      setReflectSummary({ totalStudents: data.summary?.totalStudents || 0, reflectedToday: data.summary?.reflectedToday || 0 })
    } catch (err) {
      setReflectError(err instanceof Error ? err.message : 'Could not load reflection data.')
      setReflectRows([])
      setReflectSummary({ totalStudents: 0, reflectedToday: 0 })
    } finally {
      setReflectLoading(false)
    }
  }, [reflectCourseFilter])

  const fetchActivityPointData = useCallback(async () => {
    try {
      setActivityPointLoading(true)
      setActivityPointError('')
      setActivityPointWarning('')
      setIsActivityPointDbReady(true)

      const url = apCourseFilter ? `/api/admin/activity-points?courseId=${encodeURIComponent(apCourseFilter)}` : '/api/admin/activity-points'
      const res = await fetch(url)
      if (!res.ok) throw new Error('Failed to fetch activity points settings')

      const data = await res.json() as ActivityPointResponse
      setActivityPointRules(Array.isArray(data.rules) ? data.rules : [])
      setActivityPointMembers(Array.isArray(data.members) ? data.members : [])
      const warning = String(data.warning || '').trim()
      setActivityPointWarning(warning)
      setIsActivityPointDbReady(!warning)
    } catch (err) {
      setActivityPointError(err instanceof Error ? err.message : 'Could not load activity points data.')
      setActivityPointRules([])
      setActivityPointMembers([])
      setActivityPointWarning('')
      setIsActivityPointDbReady(true)
    } finally {
      setActivityPointLoading(false)
    }
  }, [apCourseFilter])

  const updateActivityPointRule = async (rule: ActivityPointRuleItem, nextPoints: number, nextIsActive: boolean) => {
    if (!isActivityPointDbReady) {
      setActivityPointWarning('Activity points database is not ready yet. Please run migration.')
      return
    }

    try {
      setSavingActivityPointKey(rule.activityKey)
      setActivityPointError('')

      const res = await fetch('/api/admin/activity-points', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          activityKey: rule.activityKey,
          points: nextPoints,
          isActive: nextIsActive
        })
      })

      const data = await res.json().catch(() => ({})) as { error?: string }
      if (!res.ok) {
        if (res.status === 409) {
          const warningMessage = data?.error || 'Activity points database is not ready yet. Please run migration.'
          setActivityPointWarning(warningMessage)
          setIsActivityPointDbReady(false)
          return
        }
        throw new Error(data?.error || 'Could not update activity point rule.')
      }

      setActivityPointRules((current) =>
        current.map((item) =>
          item.activityKey === rule.activityKey
            ? {
                ...item,
                points: nextPoints,
                isActive: nextIsActive,
                updatedAt: new Date().toISOString()
              }
            : item
        )
      )
      toast.success('Activity points rule updated.')
    } catch (err) {
      setActivityPointError(err instanceof Error ? err.message : 'Could not update activity point rule.')
    } finally {
      setSavingActivityPointKey('')
    }
  }

  const fetchVocabularyData = useCallback(async () => {
    try {
      setVocabularyError('')
      const params = new URLSearchParams()
      if (vocabularyCourseFilter) params.set('courseId', vocabularyCourseFilter)
      const query = params.toString()

      const res = await fetch(`/api/admin/vocabulary${query ? `?${query}` : ''}`)
      if (!res.ok) throw new Error('Failed to fetch vocabulary')

      const data = await res.json()
      setVocabularyItems(data.items || [])
    } catch (err) {
      setVocabularyItems([])
      setVocabularyError(err instanceof Error ? err.message : 'Could not load vocabulary data.')
    }
  }, [vocabularyCourseFilter])

  const fetchReferralData = useCallback(async () => {
    try {
      setReferralLoading(true)
      setReferralError('')
      const res = await fetch('/api/admin/referrals')
      if (!res.ok) throw new Error('Failed to fetch referral data')
      const data = await res.json()
      setReferralRows(data.rows || [])
      setReferralSummary({
        totalReferrals: data.summary?.totalReferrals || 0,
        uniqueReferrers: data.summary?.uniqueReferrers || 0,
        referredMembers: data.summary?.referredMembers || 0
      })
    } catch (err) {
      setReferralError(err instanceof Error ? err.message : 'Could not load referral data.')
      setReferralRows([])
      setReferralSummary({ totalReferrals: 0, uniqueReferrers: 0, referredMembers: 0 })
    } finally {
      setReferralLoading(false)
    }
  }, [])

  const createVocabulary = async () => {
    if (!newVocabularyCourseId || !newVocabularyWord.trim() || !newVocabularyMeaning.trim()) {
      setVocabularyError('Please enter the course, word, and meaning.')
      return
    }

    try {
      setSavingVocabulary(true)
      setVocabularyError('')
      setVocabularySuccess('')

      const res = await fetch('/api/admin/vocabulary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: newVocabularyCourseId,
          word: newVocabularyWord,
          phonetic: newVocabularyPhonetic,
          englishDefinition: newVocabularyEnglishDefinition,
          meaning: newVocabularyMeaning,
          example: newVocabularyExample
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Could not add the vocabulary item.')

      setVocabularySuccess('New vocabulary item added.')
      setNewVocabularyWord('')
      setNewVocabularyPhonetic('')
      setNewVocabularyEnglishDefinition('')
      setNewVocabularyMeaning('')
      setNewVocabularyExample('')
      fetchVocabularyData()
    } catch (err) {
      setVocabularyError(err instanceof Error ? err.message : 'Could not add the vocabulary item.')
    } finally {
      setSavingVocabulary(false)
    }
  }

  const startEditVocabulary = (item: AdminVocabularyItem) => {
    const formState = buildVocabularyFormState(item)
    setEditingVocabulary(item)
    setNewVocabularyCourseId(formState.courseId)
    setNewVocabularyWord(formState.word)
    setNewVocabularyPhonetic(formState.phonetic)
    setNewVocabularyEnglishDefinition(formState.englishDefinition)
    setNewVocabularyMeaning(formState.meaning)
    setNewVocabularyExample(formState.example)
    setVocabularyError('')
    setVocabularySuccess('')
  }

  const resetVocabularyForm = () => {
    setEditingVocabulary(null)
    setNewVocabularyCourseId(courses[0]?.id || '')
    setNewVocabularyWord('')
    setNewVocabularyPhonetic('')
    setNewVocabularyEnglishDefinition('')
    setNewVocabularyMeaning('')
    setNewVocabularyExample('')
  }

  const updateVocabulary = async () => {
    if (!editingVocabulary) {
      return
    }

    if (!newVocabularyCourseId || !newVocabularyWord.trim() || !newVocabularyMeaning.trim()) {
      setVocabularyError('Please enter the course, word, and meaning.')
      return
    }

    try {
      setUpdatingVocabularyId(editingVocabulary.id)
      setVocabularyError('')
      setVocabularySuccess('')

      const res = await fetch(`/api/admin/vocabulary/${editingVocabulary.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: newVocabularyCourseId,
          word: newVocabularyWord,
          phonetic: newVocabularyPhonetic,
          englishDefinition: newVocabularyEnglishDefinition,
          meaning: newVocabularyMeaning,
          example: newVocabularyExample
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Could not update the vocabulary item.')

      setVocabularySuccess('Vocabulary item updated.')
      resetVocabularyForm()
      fetchVocabularyData()
    } catch (err) {
      setVocabularyError(err instanceof Error ? err.message : 'Could not update the vocabulary item.')
    } finally {
      setUpdatingVocabularyId(null)
    }
  }

  const deleteVocabulary = async (id: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this vocabulary item?')
    if (!confirmed) return

    try {
      setDeletingVocabularyId(id)
      setVocabularyError('')
      setVocabularySuccess('')

      const res = await fetch(`/api/admin/vocabulary/${id}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Could not delete the vocabulary item.')

      setVocabularySuccess('Vocabulary item deleted.')
      fetchVocabularyData()
    } catch (err) {
      setVocabularyError(err instanceof Error ? err.message : 'Could not delete the vocabulary item.')
    } finally {
      setDeletingVocabularyId(null)
    }
  }

  const importVocabularyBetweenCourses = async () => {
    if (!vocabularyImportSourceCourseId || !vocabularyImportTargetCourseId) {
      setVocabularyError('Please choose both source and target courses for import.')
      return
    }

    if (vocabularyImportSourceCourseId === vocabularyImportTargetCourseId) {
      setVocabularyError('Source and target courses must be different.')
      return
    }

    try {
      setImportingVocabulary(true)
      setVocabularyError('')
      setVocabularySuccess('')

      const res = await fetch('/api/admin/vocabulary/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceCourseId: vocabularyImportSourceCourseId,
          targetCourseId: vocabularyImportTargetCourseId
        })
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error || 'Could not import vocabulary.')
      }

      const createdCount = Number(data?.createdCount || 0)
      const skippedCount = Number(data?.skippedCount || 0)
      setVocabularySuccess(`Imported ${createdCount} words. Skipped ${skippedCount} duplicate words.`)
      setVocabularyCourseFilter(vocabularyImportTargetCourseId)
      fetchVocabularyData()
    } catch (err) {
      setVocabularyError(err instanceof Error ? err.message : 'Could not import vocabulary.')
    } finally {
      setImportingVocabulary(false)
    }
  }

  const importVocabularyFromDocsOrFile = async () => {
    if (!newVocabularyCourseId) {
      setVocabularyError('Please choose the course to import vocabulary into.')
      return
    }

    const docsUrl = vocabularyImportDocsUrl.trim()
    if (!docsUrl && !vocabularyImportDocxFile) {
      setVocabularyError('Please provide a Google Docs link or attach a .docx file.')
      return
    }

    if (vocabularyImportDocxFile && !String(vocabularyImportDocxFile.name || '').toLowerCase().endsWith('.docx')) {
      setVocabularyError('Only .docx files are supported for local upload.')
      return
    }

    try {
      setImportingVocabularyFromFileOrDocs(true)
      setVocabularyError('')
      setVocabularySuccess('')

      const formData = new FormData()
      formData.append('action', 'preview')
      formData.append('courseId', newVocabularyCourseId)
      if (docsUrl) {
        formData.append('docsUrl', docsUrl)
      }
      if (vocabularyImportDocxFile) {
        formData.append('file', vocabularyImportDocxFile)
      }

      const res = await fetch('/api/admin/vocabulary/import-docs', {
        method: 'POST',
        body: formData
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error || 'Could not import vocabulary from source.')
      }

      const previewItems = Array.isArray(data?.previewItems)
        ? data.previewItems.map((item: { word?: string; phonetic?: string | null; englishDefinition?: string | null; meaning?: string; example?: string | null }) => ({
            word: String(item?.word || ''),
            phonetic: String(item?.phonetic || ''),
            englishDefinition: String(item?.englishDefinition || ''),
            meaning: String(item?.meaning || ''),
            example: String(item?.example || '')
          }))
        : []

      const invalidCount = Number(data?.invalidCount || 0)
      if (previewItems.length === 0) {
        throw new Error('No valid vocabulary rows found to preview.')
      }

      setVocabularyImportPreviewItems(previewItems)
      setVocabularySuccess(`Preview loaded with ${previewItems.length} rows.${invalidCount > 0 ? ` ${invalidCount} invalid rows were ignored.` : ''}`)
    } catch (err) {
      setVocabularyError(err instanceof Error ? err.message : 'Could not import vocabulary from source.')
    } finally {
      setImportingVocabularyFromFileOrDocs(false)
    }
  }

  const updateVocabularyImportPreviewItem = (index: number, field: keyof VocabularyImportDraftItem, value: string) => {
    setVocabularyImportPreviewItems((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? { ...item, [field]: value } : item))
    )
  }

  const removeVocabularyImportPreviewItem = (index: number) => {
    setVocabularyImportPreviewItems((current) => current.filter((_, itemIndex) => itemIndex !== index))
  }

  const confirmVocabularyImportPreview = async () => {
    if (!newVocabularyCourseId) {
      setVocabularyError('Please choose the course to import vocabulary into.')
      return
    }

    if (vocabularyImportPreviewItems.length === 0) {
      setVocabularyError('There are no preview rows to import.')
      return
    }

    try {
      setConfirmingVocabularyImport(true)
      setVocabularyError('')
      setVocabularySuccess('')

      const formData = new FormData()
      formData.append('action', 'commit')
      formData.append('courseId', newVocabularyCourseId)
      formData.append('itemsJson', JSON.stringify(vocabularyImportPreviewItems))

      const res = await fetch('/api/admin/vocabulary/import-docs', {
        method: 'POST',
        body: formData
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error || 'Could not save imported vocabulary.')
      }

      const createdCount = Number(data?.createdCount || 0)
      const skippedCount = Number(data?.skippedCount || 0)
      const invalidCount = Number(data?.invalidCount || 0)

      setVocabularySuccess(`Imported ${createdCount} words. Skipped ${skippedCount} duplicates and ${invalidCount} invalid rows.`)
      setVocabularyCourseFilter(newVocabularyCourseId)
      setVocabularyImportPreviewItems([])
      setVocabularyImportDocsUrl('')
      setVocabularyImportDocxFile(null)
      fetchVocabularyData()
    } catch (err) {
      setVocabularyError(err instanceof Error ? err.message : 'Could not save imported vocabulary.')
    } finally {
      setConfirmingVocabularyImport(false)
    }
  }

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      if (session?.user?.role !== 'admin') {
        router.push('/dashboard')
      } else {
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
    if (!checkinCourseFilter && courses.length > 0) {
      setCheckinCourseFilter(courses[0].id)
    }
  }, [courses, checkinCourseFilter])

  useEffect(() => {
    if (!vocabularyCourseFilter && courses.length > 0) {
      setVocabularyCourseFilter(courses[0].id)
    }
    if (!newVocabularyCourseId && courses.length > 0) {
      setNewVocabularyCourseId(courses[0].id)
    }
    if (!vocabularyImportSourceCourseId && courses.length > 0) {
      setVocabularyImportSourceCourseId(courses[0].id)
    }
    if (!vocabularyImportTargetCourseId && courses.length > 1) {
      setVocabularyImportTargetCourseId(courses[1].id)
    }
    if (!vocabularyImportTargetCourseId && courses.length === 1) {
      setVocabularyImportTargetCourseId(courses[0].id)
    }
  }, [courses, vocabularyCourseFilter, newVocabularyCourseId, vocabularyImportSourceCourseId, vocabularyImportTargetCourseId])

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

  useEffect(() => {
    if (activeSection === 'dailyActivity') {
      fetchCheckinData()
      fetchReflectData()
    }
  }, [activeSection, fetchCheckinData, fetchReflectData])

  useEffect(() => {
    if (activeSection === 'activityPoints') {
      fetchActivityPointData()
    }
  }, [activeSection, fetchActivityPointData, apCourseFilter])

  useEffect(() => {
    if (activeSection === 'vocabulary') {
      fetchVocabularyData()
    }
  }, [activeSection, fetchVocabularyData])

  useEffect(() => {
    if (activeSection === 'referral') {
      fetchReferralData()
    }
  }, [activeSection, fetchReferralData])

  useEffect(() => {
    if (courseSuccess) {
      toast.success(courseSuccess)
    }
  }, [courseSuccess])

  useEffect(() => {
    if (courseError) {
      toast.error(courseError)
    }
  }, [courseError])

  useEffect(() => {
    if (homeworkSuccess) {
      toast.success(homeworkSuccess)
    }
  }, [homeworkSuccess])

  useEffect(() => {
    if (homeworkError) {
      toast.error(homeworkError)
    }
  }, [homeworkError])

  useEffect(() => {
    if (exerciseSuccess) {
      toast.success(exerciseSuccess)
    }
  }, [exerciseSuccess])

  useEffect(() => {
    if (exerciseError) {
      toast.error(exerciseError)
    }
  }, [exerciseError])

  useEffect(() => {
    if (lectureSuccess) {
      toast.success(lectureSuccess)
    }
  }, [lectureSuccess])

  useEffect(() => {
    if (lectureError) {
      toast.error(lectureError)
    }
  }, [lectureError])

  useEffect(() => {
    if (vocabularySuccess) {
      toast.success(vocabularySuccess)
    }
  }, [vocabularySuccess])

  useEffect(() => {
    if (vocabularyError) {
      toast.error(vocabularyError)
    }
  }, [vocabularyError])

  useEffect(() => {
    if (checkinError) {
      toast.error(checkinError)
    }
  }, [checkinError])

  useEffect(() => {
    if (reflectError) {
      toast.error(reflectError)
    }
  }, [reflectError])

  useEffect(() => {
    if (referralError) {
      toast.error(referralError)
    }
  }, [referralError])

  useEffect(() => {
    if (activityPointError) {
      toast.error(activityPointError)
    }
  }, [activityPointError])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const section = params.get('section')
    const allowed: AdminSection[] = ['course', 'homework', 'exercise', 'lectureNote', 'dailyActivity', 'activityPoints', 'vocabulary', 'speakYourself', 'referral']
    if (section === 'checkin' || section === 'reflect') {
      setActiveSection('dailyActivity')
      return
    }
    if (section && allowed.includes(section as AdminSection)) {
      setActiveSection(section as AdminSection)
    }
  }, [])

  const updateNewExerciseQuestion = (index: number, field: keyof ExerciseQuestionForm, value: string) => {
    setNewExerciseQuestions((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item))
  }

  const updateEditExerciseQuestion = (index: number, field: keyof ExerciseQuestionForm, value: string) => {
    setEditExerciseQuestions((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item))
  }

  const resetNewExerciseForm = () => {
    setNewExerciseTitle('')
    setNewExerciseType('multiple_choice')
    setNewExerciseQuestions(buildEmptyExerciseQuestions())
    setNewExerciseDescription('')
    setNewExerciseSourceFormUrl('')
    setNewExerciseAudioFileUrl(null)
    setNewExerciseAudioFileName('')
    setNewExerciseAttachFileUrl(null)
    setNewExerciseAttachFileName('')
  }

  const uploadExerciseAudio = async (file: File) => {
    const maxAudioSize = 4 * 1024 * 1024
    if (file.size > maxAudioSize) {
      throw new Error('File audio vượt quá 4MB. Vui lòng nén hoặc cắt ngắn file trước khi upload.')
    }

    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/admin/exercises/upload-audio', {
      method: 'POST',
      body: formData
    })

    const data = await parseApiResponse(response)
    if (!response.ok) {
      throw new Error(data?.error || 'Could not upload the audio file.')
    }

    return {
      url: String(data?.url || '').trim(),
      fileName: String(data?.fileName || file.name || '').trim()
    }
  }

  const handleNewExerciseAudioSelected = async (file: File) => {
    try {
      setNewExerciseAudioUploading(true)
      setExerciseError('')
      setExerciseSuccess('')

      const uploaded = await uploadExerciseAudio(file)
      setNewExerciseAudioFileUrl(uploaded.url)
      setNewExerciseAudioFileName(uploaded.fileName)
      setExerciseSuccess('Audio file uploaded successfully.')
    } catch (err) {
      setExerciseError(err instanceof Error ? err.message : 'Could not upload the audio file.')
      setExerciseSuccess('')
    } finally {
      setNewExerciseAudioUploading(false)
    }
  }

  const handleEditExerciseAudioSelected = async (file: File) => {
    try {
      setEditExerciseAudioUploading(true)
      setExerciseError('')
      setExerciseSuccess('')

      const uploaded = await uploadExerciseAudio(file)
      setEditExerciseAudioFileUrl(uploaded.url)
      setEditExerciseAudioFileName(uploaded.fileName)
      setExerciseSuccess('Audio file uploaded successfully.')
    } catch (err) {
      setExerciseError(err instanceof Error ? err.message : 'Could not upload the audio file.')
      setExerciseSuccess('')
    } finally {
      setEditExerciseAudioUploading(false)
    }
  }

  const uploadExerciseAttachment = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/admin/exercises/upload-attachment', {
      method: 'POST',
      body: formData
    })

    const data = await parseApiResponse(response)
    if (!response.ok) {
      throw new Error(data?.error || 'Could not upload the attachment file.')
    }

    return {
      url: String(data?.url || '').trim(),
      fileName: String(data?.fileName || file.name || '').trim()
    }
  }

  const handleNewExerciseAttachSelected = async (file: File) => {
    try {
      setNewExerciseAttachUploading(true)
      setExerciseError('')
      setExerciseSuccess('')

      const uploaded = await uploadExerciseAttachment(file)
      setNewExerciseAttachFileUrl(uploaded.url)
      setNewExerciseAttachFileName(uploaded.fileName)
      setExerciseSuccess('Attachment file uploaded successfully.')
    } catch (err) {
      setExerciseError(err instanceof Error ? err.message : 'Could not upload the attachment file.')
      setExerciseSuccess('')
    } finally {
      setNewExerciseAttachUploading(false)
    }
  }

  const handleEditExerciseAttachSelected = async (file: File) => {
    try {
      setEditExerciseAttachUploading(true)
      setExerciseError('')
      setExerciseSuccess('')

      const uploaded = await uploadExerciseAttachment(file)
      setEditExerciseAttachFileUrl(uploaded.url)
      setEditExerciseAttachFileName(uploaded.fileName)
      setExerciseSuccess('Attachment file uploaded successfully.')
    } catch (err) {
      setExerciseError(err instanceof Error ? err.message : 'Could not upload the attachment file.')
      setExerciseSuccess('')
    } finally {
      setEditExerciseAttachUploading(false)
    }
  }

  const createExercise = async (saveAsDraft: boolean) => {
    if (!newExerciseCourseId) {
      setExerciseError('Please choose a course for the exercise.')
      return
    }

    if (!newExerciseTitle.trim()) {
      setExerciseError('Please enter an exercise title.')
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
          title: newExerciseTitle,
          description: newExerciseDescription,
          exerciseType: newExerciseType,
          audioFileUrl: newExerciseAudioFileUrl,
          attachmentFileUrl: newExerciseAttachFileUrl,
          sourceFormUrl: newExerciseSourceFormUrl,
          isDraft: saveAsDraft,
          questions: newExerciseQuestions
        })
      })
      const data = await parseApiResponse(res)
      if (!res.ok) throw new Error(data?.error || 'Unable to create exercise')

      setExerciseSuccess(saveAsDraft ? 'Exercise draft saved.' : 'New exercise created.')
      setExerciseError('')
      if (saveAsDraft) {
        setShowExerciseBuilder(true)
      } else {
        resetNewExerciseForm()
        setShowExerciseBuilder(false)
      }
      fetchExerciseData()
    } catch (err) {
      setExerciseError(err instanceof Error ? err.message : 'Unable to create exercise')
      setExerciseSuccess('')
    } finally {
      setSavingExerciseDraft(false)
      setPublishingExercise(false)
    }
  }

  const importFromGoogleDocs = async () => {
    if (!newExerciseSourceFormUrl.trim()) {
      setExerciseError('Please enter a Google Docs link before importing.')
      return
    }

    try {
      setImportingForm(true)
      const res = await fetch('/api/admin/exercises/import-google-docs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docsUrl: newExerciseSourceFormUrl })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Unable to import from Google Docs')

      setNewExerciseQuestions(data.questions || buildEmptyExerciseQuestions())
      setNewExerciseTitle(String(data.title || '').trim())
      setNewExerciseDescription(String(data.description || '').trim())
      setNewExerciseType('multiple_choice')
      setNewExerciseAudioFileUrl(null)
      setNewExerciseAudioFileName('')
      setNewExerciseSourceFormUrl(String(data.sourceFormUrl || newExerciseSourceFormUrl).trim())
      setExerciseError('')
      setExerciseSuccess('Data imported from Google Docs. You can edit it before saving.')
      setShowExerciseBuilder(true)
    } catch (err) {
      setExerciseError(err instanceof Error ? err.message : 'Unable to import from Google Docs')
      setExerciseSuccess('')
    } finally {
      setImportingForm(false)
    }
  }

  const importFromDocxFile = async (file: File) => {
    const normalizedName = String(file?.name || '').toLowerCase()
    if (!normalizedName.endsWith('.docx')) {
      setExerciseError('Please choose a .docx file.')
      return
    }

    try {
      setImportingDocx(true)
      setExerciseError('')
      setExerciseSuccess('')

      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/admin/exercises/import-docx', {
        method: 'POST',
        body: formData
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Unable to import from DOCX')

      setNewExerciseQuestions(data.questions || buildEmptyExerciseQuestions())
      setNewExerciseTitle(String(data.title || '').trim())
      setNewExerciseDescription(String(data.description || '').trim())
      setNewExerciseType('multiple_choice')
      setNewExerciseAudioFileUrl(null)
      setNewExerciseAudioFileName('')
      setExerciseSuccess('Data imported from DOCX. You can edit it before saving.')
      setShowExerciseBuilder(true)
    } catch (err) {
      setExerciseError(err instanceof Error ? err.message : 'Unable to import from DOCX')
      setExerciseSuccess('')
    } finally {
      setImportingDocx(false)
    }
  }

  const importFromPptxFile = async (file: File) => {
    const normalizedName = String(file?.name || '').toLowerCase()
    if (!normalizedName.endsWith('.pptx')) {
      setExerciseError('Please choose a .pptx file.')
      return
    }

    try {
      setImportingPptx(true)
      setExerciseError('')
      setExerciseSuccess('')

      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/admin/exercises/import-pptx', {
        method: 'POST',
        body: formData
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Unable to import from PPTX')

      setNewExerciseQuestions(data.questions || buildEmptyExerciseQuestions())
      setNewExerciseTitle(String(data.title || '').trim())
      setNewExerciseDescription(String(data.description || '').trim())
      setNewExerciseType('conversation')
      setNewExerciseAudioFileUrl(null)
      setNewExerciseAudioFileName('')
      setNewExerciseAttachFileUrl(null)
      setNewExerciseAttachFileName('')
      setExerciseSuccess('Data imported from PPTX. You can edit it before saving.')
      setShowExerciseBuilder(true)
    } catch (err) {
      setExerciseError(err instanceof Error ? err.message : 'Unable to import from PPTX')
      setExerciseSuccess('')
    } finally {
      setImportingPptx(false)
    }
  }

  const importFromCourse = async () => {
    if (!importSourceCourseId) {
      setImportFromCourseError('Vui lòng chọn khóa học nguồn')
      return
    }
    if (!importTargetCourseId) {
      setImportFromCourseError('Vui lòng chọn khóa học đích')
      return
    }
    if (importSourceCourseId === importTargetCourseId) {
      setImportFromCourseError('Khóa học nguồn và đích không được trùng nhau')
      return
    }
    if (importSelectedExerciseIds.size === 0) {
      setImportFromCourseError('Vui lòng chọn ít nhất 1 exercise để import')
      return
    }
    try {
      setImportingFromCourse(true)
      setImportFromCourseError('')
      const res = await fetch('/api/admin/exercises/copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exerciseIds: Array.from(importSelectedExerciseIds),
          targetCourseId: importTargetCourseId
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Không thể import exercise')
      const fetched = await fetch('/api/admin/exercises')
      const fetcedData = await fetched.json()
      setExercises(fetcedData.exercises || [])
      setShowImportExerciseModal(false)
      setImportSourceCourseId('')
      setImportTargetCourseId('')
      setImportSelectedExerciseIds(new Set())
      setExerciseSuccess(`Đã import ${data.copied} exercise thành công (trạng thái Draft).`)
    } catch (err) {
      setImportFromCourseError(err instanceof Error ? err.message : 'Không thể import exercise')
    } finally {
      setImportingFromCourse(false)
    }
  }

  const quickCopyToTarget = async () => {
    if (!quickCopyExercise) return
    if (!quickCopyTargetCourseId) {
      setQuickCopyError('Vui lòng chọn khóa học đích')
      return
    }
    if (quickCopyTargetCourseId === quickCopyExercise.courseId) {
      setQuickCopyError('Khóa học đích phải khác khóa học nguồn')
      return
    }
    try {
      setQuickCopyLoading(true)
      setQuickCopyError('')
      const res = await fetch('/api/admin/exercises/copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exerciseIds: [quickCopyExercise.id], targetCourseId: quickCopyTargetCourseId })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Không thể copy exercise')
      const fetched = await fetch('/api/admin/exercises')
      const fetchedData = await fetched.json()
      setExercises(fetchedData.exercises || [])
      setQuickCopyExercise(null)
      setQuickCopyTargetCourseId('')
      setExerciseSuccess(`Đã copy "${getExerciseTitle(quickCopyExercise)}" sang khóa học đích (trạng thái Draft).`)
    } catch (err) {
      setQuickCopyError(err instanceof Error ? err.message : 'Không thể copy exercise')
    } finally {
      setQuickCopyLoading(false)
    }
  }

  const openEditExercise = (exercise: ExerciseItem) => {
    setEditingExercise(exercise)
    setEditExerciseTitle(getExerciseTitle(exercise))
    setEditExerciseDescription(exercise.description || '')
    setEditExerciseType(exercise.exerciseType || 'multiple_choice')
    setEditExerciseAudioFileUrl(exercise.audioFileUrl)
    setEditExerciseAudioFileName(exercise.audioFileUrl ? 'Current audio file' : '')
    setEditExerciseAttachFileUrl(exercise.attachmentFileUrl)
    setEditExerciseAttachFileName(exercise.attachmentFileUrl ? 'Current attachment file' : '')
    setEditExerciseQuestions(exercise.questions.map((question) => ({
      question: question.question,
      optionA: question.optionA,
      optionB: question.optionB,
      optionC: question.optionC,
      optionD: question.optionD || '',
      correctOption: question.correctOption
    })))
    setExerciseError('')
  }

  const saveEditedExercise = async (publishNow = false) => {
    if (!editingExercise) return

    if (!editExerciseTitle.trim()) {
      setExerciseError('Please enter an exercise title.')
      return
    }

    try {
      setSavingExerciseId(editingExercise.id)
      const res = await fetch(`/api/admin/exercises/${editingExercise.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editExerciseTitle,
          description: editExerciseDescription,
          exerciseType: editExerciseType,
          audioFileUrl: editExerciseAudioFileUrl,
          attachmentFileUrl: editExerciseAttachFileUrl,
          isDraft: publishNow ? false : editingExercise.isDraft,
          questions: editExerciseQuestions
        })
      })
      const data = await parseApiResponse(res)
      if (!res.ok) throw new Error(data?.error || 'Unable to update exercise')

      setExerciseSuccess(publishNow ? 'Exercise published.' : 'Exercise updated.')
      setExerciseError('')
      setEditingExercise(null)
      fetchExerciseData()
    } catch (err) {
      setExerciseError(err instanceof Error ? err.message : 'Unable to update exercise')
      setExerciseSuccess('')
    } finally {
      setSavingExerciseId(null)
    }
  }

  const publishDraftExercise = async (exercise: ExerciseItem) => {
    try {
      setSavingExerciseId(exercise.id)
      const res = await fetch(`/api/admin/exercises/${exercise.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: getExerciseTitle(exercise),
          description: exercise.description || '',
          exerciseType: exercise.exerciseType,
          audioFileUrl: exercise.audioFileUrl,
          attachmentFileUrl: exercise.attachmentFileUrl,
          isDraft: false,
          questions: exercise.questions.map((question) => ({
            question: question.question,
            optionA: question.optionA,
            optionB: question.optionB,
            optionC: question.optionC,
            optionD: question.optionD || '',
            correctOption: question.correctOption
          }))
        })
      })
      const data = await parseApiResponse(res)
      if (!res.ok) throw new Error(data?.error || 'Unable to publish draft')

      setExerciseSuccess('Exercise published.')
      setExerciseError('')
      fetchExerciseData()
    } catch (err) {
      setExerciseError(err instanceof Error ? err.message : 'Unable to publish draft')
      setExerciseSuccess('')
    } finally {
      setSavingExerciseId(null)
    }
  }

  const deleteExercise = async (exercise: ExerciseItem) => {
    const confirmed = window.confirm(`Are you sure you want to delete "${getExerciseTitle(exercise)}" from the course "${exercise.course.title}"?`)
    if (!confirmed) return

    try {
      setDeletingExerciseId(exercise.id)
      const res = await fetch(`/api/admin/exercises/${exercise.id}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Could not delete the exercise.')

      setExerciseSuccess(`Exercise "${getExerciseTitle(exercise)}" deleted.`)
      setExerciseError('')
      if (editingExercise?.id === exercise.id) {
        setEditingExercise(null)
      }
      fetchExerciseData()
    } catch (err) {
      setExerciseError(err instanceof Error ? err.message : 'Could not delete the exercise.')
      setExerciseSuccess('')
    } finally {
      setDeletingExerciseId(null)
    }
  }

  const uploadHomeworkAttachment = async (file: File): Promise<string> => {
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/admin/homework/upload-attachment', { method: 'POST', body: fd })
    const data = await res.json()
    if (!res.ok) {
      const detail = typeof data?.details === 'string' && data.details ? ` (${data.details})` : ''
      throw new Error((data?.error || 'Could not upload the attachment.') + detail)
    }
    return data.url as string
  }

  const createHomework = async () => {
    if (!newHomeworkCourseId || !newHomeworkTitle || !newHomeworkDueDate) {
      setHomeworkError('Please enter the course, homework title, and due date.')
      return
    }

    const parsedNewHomeworkDueDate = parseDdMmYyyyToIsoDate(newHomeworkDueDate)
    if (!parsedNewHomeworkDueDate) {
      setHomeworkError('Hạn nộp phải theo định dạng dd/mm/yyyy')
      return
    }

    try {
      setNewHomeworkAttachmentUploading(true)
      let attachmentUrl: string | null = null
      if (newHomeworkAttachment) {
        attachmentUrl = await uploadHomeworkAttachment(newHomeworkAttachment)
      }

      const res = await fetch('/api/admin/homework', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: newHomeworkCourseId,
          title: newHomeworkTitle,
          description: newHomeworkDescription,
          attachmentUrl,
          dueDate: parsedNewHomeworkDueDate
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Could not create the homework.')

      setHomeworkSuccess('New homework created.')
      setHomeworkError('')
      setNewHomeworkTitle('')
      setNewHomeworkDescription('')
      setNewHomeworkDueDate('')
      setNewHomeworkAttachment(null)
      fetchHomeworkData()
      fetchMemberOverview()
    } catch (err) {
      setHomeworkError(err instanceof Error ? err.message : 'Could not create the homework.')
      setHomeworkSuccess('')
    } finally {
      setNewHomeworkAttachmentUploading(false)
    }
  }

  const openEditHomework = (homework: HomeworkItem) => {
    setEditingHomework(homework)
    setEditHomeworkCourseId(homework.courseId)
    setEditHomeworkTitle(homework.title)
    setEditHomeworkDescription(homework.description || '')
    setEditHomeworkDueDate(formatDateToDdMmYyyy(homework.dueDate))
    setEditHomeworkAttachment(null)
    setEditHomeworkAttachmentUrl(homework.attachmentUrl ?? null)
    setHomeworkError('')
  }

  const saveEditedHomework = async () => {
    if (!editingHomework) return
    if (!editHomeworkCourseId || !editHomeworkTitle || !editHomeworkDueDate) {
      setHomeworkError('Please complete all homework fields.')
      return
    }

    const parsedEditHomeworkDueDate = parseDdMmYyyyToIsoDate(editHomeworkDueDate)
    if (!parsedEditHomeworkDueDate) {
      setHomeworkError('Hạn nộp phải theo định dạng dd/mm/yyyy')
      return
    }

    try {
      setSavingHomeworkId(editingHomework.id)
      setEditHomeworkAttachmentUploading(true)
      let attachmentUrl = editHomeworkAttachmentUrl

      if (editHomeworkAttachment) {
        attachmentUrl = await uploadHomeworkAttachment(editHomeworkAttachment)
      }

      const res = await fetch(`/api/admin/homework/${editingHomework.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: editHomeworkCourseId,
          title: editHomeworkTitle,
          description: editHomeworkDescription,
          attachmentUrl,
          dueDate: parsedEditHomeworkDueDate
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Could not update the homework.')

      setHomeworkSuccess('Homework updated.')
      setHomeworkError('')
      setEditingHomework(null)
      setEditHomeworkAttachment(null)
      setEditHomeworkAttachmentUrl(null)
      fetchHomeworkData()
      fetchMemberOverview()
    } catch (err) {
      setHomeworkError(err instanceof Error ? err.message : 'Could not update the homework.')
      setHomeworkSuccess('')
    } finally {
      setSavingHomeworkId(null)
      setEditHomeworkAttachmentUploading(false)
    }
  }

  const deleteHomework = async (homework: HomeworkItem) => {
    const confirmed = window.confirm(`Are you sure you want to delete the homework "${homework.title}"?`)
    if (!confirmed) return

    try {
      setDeletingHomeworkId(homework.id)
      const res = await fetch(`/api/admin/homework/${homework.id}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Could not delete the homework.')

      setHomeworkSuccess('Homework deleted.')
      setHomeworkError('')
      if (editingHomework?.id === homework.id) {
        setEditingHomework(null)
      }
      fetchHomeworkData()
      fetchHomeworkSubmissions()
      fetchMemberOverview()
    } catch (err) {
      setHomeworkError(err instanceof Error ? err.message : 'Could not delete the homework.')
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
      if (!res.ok) throw new Error(data?.error || 'Could not save the feedback.')

      setHomeworkSuccess('Feedback saved for the student submission.')
      setHomeworkError('')
      setHomeworkTeacherComments((current) => ({ ...current, [submissionId]: '' }))
      fetchHomeworkSubmissions()
    } catch (err) {
      setHomeworkError(err instanceof Error ? err.message : 'Could not save the feedback.')
      setHomeworkSuccess('')
    } finally {
      setSavingHomeworkCommentId(null)
    }
  }

  const publishCourse = async () => {
    if (!newCourseTitle || !newDeadline) {
      setCourseError('Please enter the course title and registration deadline.')
      return
    }

    const parsedNewDeadline = parseDdMmYyyyToIsoDate(newDeadline)
    if (!parsedNewDeadline) {
      setCourseError('Registration deadline must use the dd/mm/yyyy format')
      return
    }

    if (!Number.isInteger(newCourseMaxStudents) || newCourseMaxStudents < 1 || newCourseMaxStudents > 10) {
      setCourseError('Số lượng chỗ phải từ 1 đến 10')
      return
    }

    if (!Number.isInteger(newCoursePrice) || newCoursePrice < 0) {
      setCourseError('Học phí phải là số nguyên không âm')
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
          maxStudents: newCourseMaxStudents,
          price: newCoursePrice,
          currency: 'VND'
        })
      })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData?.error || 'Failed to publish course')
      }
      const data = await res.json()
      setCourseSuccess(`Course "${data.title}" has been published.`)
      setNewCourseTitle('')
      setNewCourseDescription('')
      setNewDeadline('')
      setNewCourseMaxStudents(10)
      setNewCoursePrice(4200000)
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
    setEditCoursePrice(course.price || 0)
    setEditCourseCompletedSessions(course.completedSessions || 0)
    setCourseError('')
  }

  const saveEditedCourse = async () => {
    if (!editingCourse) return
    if (!editCourseTitle || !editCourseDeadline) {
      setCourseError('Please enter the course title and registration deadline.')
      return
    }

    const parsedEditDeadline = parseDdMmYyyyToIsoDate(editCourseDeadline)
    if (!parsedEditDeadline) {
      setCourseError('Registration deadline must use the dd/mm/yyyy format')
      return
    }

    if (!Number.isInteger(editCourseMaxStudents) || editCourseMaxStudents < 1 || editCourseMaxStudents > 10) {
      setCourseError('Số lượng chỗ phải từ 1 đến 10')
      return
    }

    if (!Number.isInteger(editCourseCompletedSessions) || editCourseCompletedSessions < 0 || editCourseCompletedSessions > 30) {
      setCourseError('Course progress must be between 0 and 30 sessions.')
      return
    }

    if (!Number.isInteger(editCoursePrice) || editCoursePrice < 0) {
      setCourseError('Học phí phải là số nguyên không âm')
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
          price: editCoursePrice,
          currency: 'VND',
          completedSessions: editCourseCompletedSessions
        })
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error || 'Could not update the course.')
      }

      setCourseSuccess(`Course "${data.title}" updated.`)
      setCourseError('')
      setEditingCourse(null)
      fetchCourses()
    } catch (err) {
      setCourseError(err instanceof Error ? err.message : 'Could not update the course.')
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
        throw new Error(data?.error || 'Could not unpublish the course.')
      }

      setCourseSuccess(`Course "${courseTitle}" has been unpublished.`) 
      setCourseError('')
      setConfirmUnpublish(null)
      fetchCourses()
    } catch (err) {
      setCourseError(err instanceof Error ? err.message : 'Could not unpublish the course.')
      setCourseSuccess('')
    } finally {
      setSavingCourseId(null)
    }
  }

  const republishCourse = async (courseId: string, courseTitle: string) => {
    try {
      setSavingCourseId(courseId)
      const res = await fetch(`/api/admin/courses/${courseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: true })
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error || 'Could not publish the course.')
      }

      setCourseSuccess(`Course "${courseTitle}" is public again.`)
      setCourseError('')
      fetchCourses()
    } catch (err) {
      setCourseError(err instanceof Error ? err.message : 'Could not publish the course.')
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
      setCourseError(err instanceof Error ? err.message : 'Unable to update payment status')
    } finally {
      setUpdatingEnrollmentId(null)
      setConfirmPayment(null)
    }
  }

  const createLectureNote = async () => {
    setLectureError('')
    setLectureSuccess('')

    if (!selectedLectureNoteCourseId || !newLectureSession) {
      setLectureError('Please choose a course and session number.')
      return
    }

    const sessionNum = parseInt(newLectureSession, 10)
    if (isNaN(sessionNum) || sessionNum < 1 || sessionNum > 30) {
      setLectureError('Session number must be between 1 and 30')
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
      setLectureSuccess('Lecture note created successfully!')
      fetchLectureNotes(selectedLectureNoteCourseId)
    } catch (err) {
      setLectureError(err instanceof Error ? err.message : 'Failed to create lecture note')
    }
  }

  const updateLectureNote = async () => {
    if (!editingLectureNote) return

    const sessionNum = parseInt(editLectureSession, 10)
    if (isNaN(sessionNum) || sessionNum < 1 || sessionNum > 30) {
      setLectureError('Session number must be between 1 and 30')
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
      setLectureSuccess('Lecture note updated successfully!')
      fetchLectureNotes(selectedLectureNoteCourseId)
    } catch (err) {
      setLectureError(err instanceof Error ? err.message : 'Failed to update lecture note')
    } finally {
      setSavingLectureId(null)
    }
  }

  const deleteLectureNote = async (lectureId: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this material?')
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

      setLectureSuccess('Material deleted successfully.')
      fetchLectureNotes(selectedLectureNoteCourseId)
    } catch (err) {
      setLectureError(err instanceof Error ? err.message : 'Failed to delete lecture note')
    } finally {
      setDeletingLectureId(null)
    }
  }

  const rejectUser = async (userId: string, label: string) => {
    const confirmed = window.confirm(`Are you sure you want to reject ${label}? The user will be reset and must start again from the beginning.`)
    if (!confirmed) return

    try {
      setRejectingUserId(userId)
      const res = await fetch(`/api/admin/members/${userId}/reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error || 'Could not reject the user.')
      }

      setCourseSuccess('The user has been rejected and reset to the initial state.')
      setCourseError('')
      fetchMemberOverview()
      fetchEnrollments()
      fetchCourses()
      fetchSummary()
    } catch (err) {
      setCourseError(err instanceof Error ? err.message : 'Could not reject the user.')
    } finally {
      setRejectingUserId(null)
    }
  }

  const exerciseResults = buildExerciseResults(exercises)
  const groupedExerciseResults = useMemo(() => {
    const groups = exerciseResults.reduce((accumulator, result) => {
      const courseTitle = result.courseTitle || 'Uncategorized'
      const group = accumulator.get(courseTitle) || []
      group.push(result)
      accumulator.set(courseTitle, group)
      return accumulator
    }, new Map<string, typeof exerciseResults>())

    return Array.from(groups.entries())
      .sort(([left], [right]) => left.localeCompare(right, 'vi'))
      .map(([courseTitle, items]) => ({
        courseTitle,
        items: [...items].sort((left, right) => new Date(right.submittedAt).getTime() - new Date(left.submittedAt).getTime())
      }))
  }, [exerciseResults])

  const groupedSpeakYourselfResults = useMemo(() => {
    const groups = speakYourselfAttempts.reduce((accumulator, attempt) => {
      const courseTitle = attempt.course.title || 'Uncategorized'
      const group = accumulator.get(courseTitle) || []
      group.push(attempt)
      accumulator.set(courseTitle, group)
      return accumulator
    }, new Map<string, SpeakYourselfAttemptItem[]>())

    return Array.from(groups.entries())
      .sort(([left], [right]) => left.localeCompare(right, 'vi'))
      .map(([courseTitle, items]) => ({
        courseTitle,
        items: [...items].sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
      }))
  }, [speakYourselfAttempts])

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
        <div className="mb-8 overflow-x-auto">
          <div className="inline-flex min-w-max items-end gap-1 rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm">
          <button
            type="button"
            onClick={() => setActiveSection('course')}
            className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition-all duration-150 ${activeSection === 'course' ? '-translate-y-1 bg-[#14532d] text-white shadow-sm' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
          >
            1. COURSE
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('homework')}
            className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition-all duration-150 ${activeSection === 'homework' ? '-translate-y-1 bg-[#14532d] text-white shadow-sm' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
          >
            2. HOMEWORK
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('exercise')}
            className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition-all duration-150 ${activeSection === 'exercise' ? '-translate-y-1 bg-[#14532d] text-white shadow-sm' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
          >
            3. EXERCISE
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('lectureNote')}
            className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition-all duration-150 ${activeSection === 'lectureNote' ? '-translate-y-1 bg-[#14532d] text-white shadow-sm' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
          >
            4. LECTURE
          </button>
           <button
             type="button"
             onClick={() => setActiveSection('activityPoints')}
             className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition-all duration-150 ${activeSection === 'activityPoints' ? '-translate-y-1 bg-[#14532d] text-white shadow-sm' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
           >
             5. ACTIVITY POINTS
           </button>
           <button
             type="button"
             onClick={() => setActiveSection('vocabulary')}
             className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition-all duration-150 ${activeSection === 'vocabulary' ? '-translate-y-1 bg-[#14532d] text-white shadow-sm' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
           >
             6. VOCABULARY
           </button>
           <button
             type="button"
             onClick={() => setActiveSection('speakYourself')}
             className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition-all duration-150 ${activeSection === 'speakYourself' ? '-translate-y-1 bg-[#14532d] text-white shadow-sm' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
           >
             7. SPEAK YOURSELF
           </button>
           <button
             type="button"
             onClick={() => setActiveSection('referral')}
             className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition-all duration-150 ${activeSection === 'referral' ? '-translate-y-1 bg-[#14532d] text-white shadow-sm' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
           >
             8. REFERRALS
           </button>
          </div>
        </div>

        <div className="hidden">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Daily Activity</h2>
          <p className="text-sm text-gray-600 mb-5">Track both daily check-ins and reflections in one place.</p>

          <div className="mb-6 rounded-lg border border-[#14532d]/20 bg-[#14532d]/5 px-4 py-3">
            <h3 className="text-lg font-bold text-[#14532d]">CHECK-IN</h3>
            <p className="mt-1 text-sm text-gray-600">Monitor daily greeting responses to evaluate engagement and prepare medal rewards.</p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-6">
            <select
              value={checkinCourseFilter}
              onChange={(e) => setCheckinCourseFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#14532d]"
            >
              <option value="">All active courses</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>{course.title}</option>
              ))}
            </select>

            <div className="rounded border border-[#14532d]/30 bg-[#14532d]/10 px-4 py-2 text-sm text-[#14532d]">
              Total students: <span className="font-bold">{checkinSummary.totalStudents}</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
                Check-ins today: <span className="font-bold">{checkinSummary.checkedInToday}</span>
              </div>
              <button
                onClick={fetchCheckinData}
                className="px-4 py-2 bg-[#14532d] text-white rounded hover:bg-[#166534]"
              >
                {checkinLoading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Today</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">7 days</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Latest check-in</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Latest message</th>
                </tr>
              </thead>
              <tbody>
                {checkinRows.map((row) => (
                  <tr key={row.enrollmentId} className="border-b align-top hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{row.studentName || row.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{row.phone || 'Not updated yet'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{row.courseTitle}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`rounded px-2 py-1 text-xs font-semibold ${row.checkedInToday ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {row.checkedInToday ? 'Checked in' : 'Not checked in'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-[#14532d]">{row.checkinCount7d}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {row.latestUpdatedAt ? (
                        <>
                          {new Date(row.latestUpdatedAt).toLocaleString('en-GB')}
                          {row.latestInputMethod && (
                            <span className="ml-2 rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                              {row.latestInputMethod === 'voice' ? 'voice' : 'text'}
                            </span>
                          )}
                        </>
                      ) : 'No data yet'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {row.latestMessage ? (
                        <p className="max-w-md whitespace-pre-wrap">{row.latestMessage}</p>
                      ) : (
                        <span className="text-gray-400">No content yet</span>
                      )}
                    </td>
                  </tr>
                ))}
                {!checkinLoading && checkinRows.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-3 text-center text-gray-500">No students match the current filter.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className={`bg-white rounded shadow p-6 mb-8 ${activeSection === 'activityPoints' ? '' : 'hidden'}`}>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Activity Points (AP)</h2>
              <p className="mt-1 text-sm text-gray-600">Configure AP for each activity and track member points.</p>
              {activityPointWarning && (
                <p className="mt-2 rounded border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                  {activityPointWarning}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={fetchActivityPointData}
              className="rounded bg-[#14532d] px-4 py-2 text-sm font-medium text-white hover:bg-[#166534]"
            >
              {activityPointLoading ? 'Loading...' : 'Refresh'}
            </button>
          </div>

          <div className="mb-6 overflow-x-auto rounded-lg border border-[#14532d]/20">
            <table className="w-full border-collapse">
              <thead className="bg-[#14532d]/8 border-b border-[#14532d]/20">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#14532d]">Activity</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#14532d]">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#14532d]">Points</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#14532d]">Active</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#14532d]">Action</th>
                </tr>
              </thead>
              <tbody>
                {activityPointRules.map((rule) => (
                  <tr key={rule.activityKey} className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">{rule.label}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{getActivityPointDescription(rule.activityKey)}</td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min={0}
                        max={1000}
                        value={rule.points}
                        onChange={(event) => {
                          const nextPoints = Number(event.target.value)
                          setActivityPointRules((current) =>
                            current.map((item) => item.activityKey === rule.activityKey ? { ...item, points: Number.isNaN(nextPoints) ? 0 : nextPoints } : item)
                          )
                        }}
                        disabled={!isActivityPointDbReady}
                        className="w-24 rounded border border-gray-300 px-2 py-1.5 text-sm outline-none focus:border-[#14532d]"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <label className="inline-flex items-center gap-2 text-xs font-semibold text-gray-700">
                        <input
                          type="checkbox"
                          checked={rule.isActive}
                          onChange={(event) => {
                            void updateActivityPointRule(rule, rule.points, event.target.checked)
                          }}
                          disabled={savingActivityPointKey === rule.activityKey || !isActivityPointDbReady}
                          className="h-4 w-4 rounded border-gray-300 text-[#14532d] focus:ring-[#14532d]"
                        />
                        Active
                      </label>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => {
                          void updateActivityPointRule(rule, Math.max(0, rule.points), rule.isActive)
                        }}
                        disabled={savingActivityPointKey === rule.activityKey || !isActivityPointDbReady}
                        className="rounded bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-600 disabled:opacity-60"
                      >
                        {savingActivityPointKey === rule.activityKey ? 'Saving...' : 'Save AP'}
                      </button>
                    </td>
                  </tr>
                ))}
                {!activityPointLoading && activityPointRules.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-3 text-center text-sm text-gray-500">No AP rules found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mb-4 flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">Lọc theo khóa học:</label>
            <select
              value={apCourseFilter}
              onChange={(e) => setApCourseFilter(e.target.value)}
              className="rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#14532d]"
            >
              <option value="">Tất cả khóa học</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>{course.title}</option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Member</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">AP</th>
                </tr>
              </thead>
              <tbody>
                {activityPointMembers.map((member) => (
                  <tr key={member.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{member.name || 'No name'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{member.email}</td>
                    <td className="px-4 py-3 text-sm font-bold text-amber-600">{member.activityPoints}</td>
                  </tr>
                ))}
                {!activityPointLoading && activityPointMembers.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-3 text-center text-gray-500">No members found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className={`bg-white rounded shadow p-6 mb-8 ${activeSection === 'referral' ? '' : 'hidden'}`}>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Referral Management</h2>
              <p className="mt-1 text-sm text-gray-600">Track who referred whom based on student ID or email entered during course registration.</p>
            </div>
            <button
              type="button"
              onClick={fetchReferralData}
              className="rounded bg-[#14532d] px-4 py-2 text-sm font-medium text-white hover:bg-[#166534]"
            >
              Refresh list
            </button>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Total referrals</p>
              <p className="mt-2 text-3xl font-black text-slate-900">{referralSummary.totalReferrals}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Unique referrers</p>
              <p className="mt-2 text-3xl font-black text-slate-900">{referralSummary.uniqueReferrers}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Referred members</p>
              <p className="mt-2 text-3xl font-black text-slate-900">{referralSummary.referredMembers}</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Referrer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Referrer ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Referred user</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Referred ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registered</th>
                </tr>
              </thead>
              <tbody>
                {referralRows.map((row) => (
                  <tr key={row.referredUserId} className="border-b hover:bg-gray-50 align-top">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <div>{row.referrerName || row.referrerEmail || 'Unknown'}</div>
                      {row.referrerEmail && <div className="text-xs text-gray-500">{row.referrerEmail}</div>}
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-gray-700">{row.referrerStudentId || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <div>{row.referredUserName || row.referredUserEmail}</div>
                      <div className="text-xs text-gray-500">{row.referredUserEmail}</div>
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-gray-700">{row.referredStudentId || 'Pending'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{row.referredCourseTitle || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{new Date(row.registeredAt).toLocaleDateString('en-GB')}</td>
                  </tr>
                ))}
                {!referralLoading && referralRows.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-3 text-center text-gray-500">No referrals recorded yet.</td>
                  </tr>
                )}
                {referralLoading && (
                  <tr>
                    <td colSpan={6} className="px-4 py-3 text-center text-gray-500">Loading referral data...</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className={`bg-white rounded shadow p-6 mb-8 ${activeSection === 'dailyActivity' ? '' : 'hidden'}`}>
          <div className="mb-6 rounded-lg border border-violet-200 bg-violet-50 px-4 py-3">
            <h3 className="text-lg font-bold text-violet-700">REFLECTION</h3>
            <p className="mt-1 text-sm text-gray-600">See which students checked in today and also posted a reflection.</p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-6">
            <select
              value={reflectCourseFilter}
              onChange={(e) => setReflectCourseFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-violet-600"
            >
              <option value="">All active courses</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>{course.title}</option>
              ))}
            </select>
            <div className="rounded border border-[#14532d]/30 bg-[#14532d]/10 px-4 py-2 text-sm text-[#14532d]">
              Total students: <span className="font-bold">{reflectSummary.totalStudents}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded border border-violet-300 bg-violet-50 px-4 py-2 text-sm text-violet-700">
                Reflections today: <span className="font-bold">{reflectSummary.reflectedToday}</span>
              </div>
              <button onClick={fetchReflectData} className="px-4 py-2 bg-violet-700 text-white rounded hover:bg-violet-800">
                {reflectLoading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Today</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Content</th>
                </tr>
              </thead>
              <tbody>
                {reflectRows.map((row) => (
                  <tr key={row.enrollmentId} className="border-b align-top hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{row.studentName || row.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{row.phone || 'Not updated yet'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{row.courseTitle}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`rounded px-2 py-1 text-xs font-semibold ${row.reflectedToday ? 'bg-violet-100 text-violet-700' : 'bg-gray-100 text-gray-500'}`}>
                        {row.reflectedToday ? 'Reflected' : 'Not reflected'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {row.updatedAt ? new Date(row.updatedAt).toLocaleString('en-GB') : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {row.message ? (
                        <p className="max-w-md whitespace-pre-wrap">{row.message}</p>
                      ) : (
                        <span className="text-gray-400">No content yet</span>
                      )}
                    </td>
                  </tr>
                ))}
                {!reflectLoading && reflectRows.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-3 text-center text-gray-500">No data matches the current filter.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className={`bg-white rounded shadow p-6 mb-8 ${activeSection === 'vocabulary' ? '' : 'hidden'}`}>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Student Vocabulary</h2>
          <p className="text-sm text-gray-600 mb-5">Prepare vocabulary by course to display on the homepage for students.</p>

          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded border border-[#14532d]/15 bg-[#14532d]/5 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-[#14532d]">{editingVocabulary ? `Editing: ${editingVocabulary.word}` : 'Add a new vocabulary item'}</p>
              <p className="text-xs text-gray-600">{editingVocabulary ? 'After editing, click update or cancel to return to add mode.' : 'Use this form to add new vocabulary for each course. Display order is auto-generated.'}</p>
            </div>
            {editingVocabulary && (
              <button
                type="button"
                onClick={resetVocabularyForm}
                className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-white"
              >
                Cancel editing
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-6 mb-4">
            <select
              value={newVocabularyCourseId}
              onChange={(e) => setNewVocabularyCourseId(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#14532d]"
            >
              <option value="">Choose a course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>{course.title}</option>
              ))}
            </select>
            <input
              type="text"
              value={newVocabularyWord}
              onChange={(e) => setNewVocabularyWord(e.target.value)}
              placeholder="Word"
              className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#14532d]"
            />
            <input
              type="text"
              value={newVocabularyPhonetic}
              onChange={(e) => setNewVocabularyPhonetic(e.target.value)}
              placeholder="Phonetic (optional)"
              className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#14532d]"
            />
            <input
              type="text"
              value={newVocabularyEnglishDefinition}
              onChange={(e) => setNewVocabularyEnglishDefinition(e.target.value)}
              placeholder="English definition (optional)"
              className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#14532d]"
            />
            <input
              type="text"
              value={newVocabularyMeaning}
              onChange={(e) => setNewVocabularyMeaning(e.target.value)}
              placeholder="Meaning"
              className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#14532d]"
            />
            <button
              onClick={editingVocabulary ? updateVocabulary : createVocabulary}
              disabled={savingVocabulary || Boolean(updatingVocabularyId)}
              className="px-4 py-2 bg-[#14532d] text-white rounded hover:bg-[#166534] disabled:opacity-50"
            >
              {savingVocabulary ? 'Saving...' : updatingVocabularyId ? 'Updating...' : editingVocabulary ? 'Update word' : 'Add word'}
            </button>
          </div>

          <textarea
            value={newVocabularyExample}
            onChange={(e) => setNewVocabularyExample(e.target.value)}
            rows={2}
            placeholder="Usage example (optional)"
            className="w-full mb-6 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#14532d]"
          />

          <div className="mb-6 rounded border border-[#14532d]/25 bg-[#14532d]/5 px-4 py-4">
            <p className="text-sm font-semibold text-[#14532d]">Import vocabulary from Google Docs or DOCX</p>
            <p className="mt-1 text-xs text-gray-600">The imported words will be added to the course selected in the manual form above.</p>
            <p className="mt-1 text-xs text-gray-600">Format: WORD, PHONETIC, PART_OF_SPEECH, ENGLISH_DEFINITION, MEANING, EXAMPLE (WORD + MEANING required).</p>

            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto_auto]">
              <input
                type="url"
                value={vocabularyImportDocsUrl}
                onChange={(e) => setVocabularyImportDocsUrl(e.target.value)}
                placeholder="Paste Google Docs link"
                className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#14532d]"
              />

              <label className="inline-flex cursor-pointer items-center justify-center rounded bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
                {vocabularyImportDocxFile ? 'Change DOCX' : 'Attach DOCX'}
                <input
                  type="file"
                  accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0] || null
                    setVocabularyImportDocxFile(file)
                    event.currentTarget.value = ''
                  }}
                />
              </label>

              <button
                type="button"
                onClick={importVocabularyFromDocsOrFile}
                disabled={importingVocabularyFromFileOrDocs}
                className="px-4 py-2 bg-[#14532d] text-white rounded hover:bg-[#166534] disabled:opacity-50"
              >
                {importingVocabularyFromFileOrDocs ? 'Loading preview...' : 'Preview import'}
              </button>
            </div>

            {vocabularyImportDocxFile && (
              <p className="mt-2 text-xs text-gray-600">Attached file: {vocabularyImportDocxFile.name}</p>
            )}

            {vocabularyImportPreviewItems.length > 0 && (
              <div className="mt-4 rounded border border-amber-300 bg-amber-50/60 p-3">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-amber-900">Review imported rows before saving</p>
                  <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-amber-800 ring-1 ring-amber-200">
                    {vocabularyImportPreviewItems.length} rows
                  </span>
                </div>

                <div className="max-h-80 overflow-auto rounded border border-amber-200 bg-white">
                  <table className="w-full border-collapse">
                    <thead className="sticky top-0 bg-amber-100/90 backdrop-blur border-b border-amber-200">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-amber-900 uppercase">Word</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-amber-900 uppercase">Phonetic</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-amber-900 uppercase">English definition</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-amber-900 uppercase">Meaning</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-amber-900 uppercase">Example</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-amber-900 uppercase">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vocabularyImportPreviewItems.map((item, index) => (
                        <tr key={`preview-${index}`} className="border-b border-amber-100 align-top">
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={item.word}
                              onChange={(event) => updateVocabularyImportPreviewItem(index, 'word', event.target.value)}
                              className="w-36 rounded border border-amber-200 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                              placeholder="Word"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={item.phonetic}
                              onChange={(event) => updateVocabularyImportPreviewItem(index, 'phonetic', event.target.value)}
                              className="w-36 rounded border border-amber-200 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                              placeholder="Phonetic"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={item.englishDefinition}
                              onChange={(event) => updateVocabularyImportPreviewItem(index, 'englishDefinition', event.target.value)}
                              className="w-56 rounded border border-amber-200 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                              placeholder="English definition"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={item.meaning}
                              onChange={(event) => updateVocabularyImportPreviewItem(index, 'meaning', event.target.value)}
                              className="w-48 rounded border border-amber-200 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                              placeholder="Meaning"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={item.example}
                              onChange={(event) => updateVocabularyImportPreviewItem(index, 'example', event.target.value)}
                              className="w-56 rounded border border-amber-200 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                              placeholder="Example"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <button
                              type="button"
                              onClick={() => removeVocabularyImportPreviewItem(index)}
                              className="rounded border border-red-300 px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setVocabularyImportPreviewItems([])}
                    className="rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel preview
                  </button>
                  <button
                    type="button"
                    onClick={confirmVocabularyImportPreview}
                    disabled={confirmingVocabularyImport}
                    className="rounded bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
                  >
                    {confirmingVocabularyImport ? 'Saving...' : 'Confirm and save'}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="mb-6 rounded border border-amber-200 bg-amber-50 px-4 py-4">
            <p className="text-sm font-semibold text-amber-900">Import vocabulary between courses</p>
            <p className="mt-1 text-xs text-amber-800">Copy all words from one course to another. Duplicate words (same word + meaning) will be skipped automatically.</p>
            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_auto]">
              <select
                value={vocabularyImportSourceCourseId}
                onChange={(e) => setVocabularyImportSourceCourseId(e.target.value)}
                className="px-4 py-2 border border-amber-300 bg-white rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">Source course</option>
                {courses.map((course) => (
                  <option key={`source-${course.id}`} value={course.id}>{course.title}</option>
                ))}
              </select>
              <select
                value={vocabularyImportTargetCourseId}
                onChange={(e) => setVocabularyImportTargetCourseId(e.target.value)}
                className="px-4 py-2 border border-amber-300 bg-white rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">Target course</option>
                {courses.map((course) => (
                  <option key={`target-${course.id}`} value={course.id}>{course.title}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={importVocabularyBetweenCourses}
                disabled={importingVocabulary}
                className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 disabled:opacity-50"
              >
                {importingVocabulary ? 'Importing...' : 'Import words'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto] mb-4">
            <select
              value={vocabularyCourseFilter}
              onChange={(e) => setVocabularyCourseFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#14532d]"
            >
              <option value="">All courses</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>{course.title}</option>
              ))}
            </select>
            <button
              onClick={fetchVocabularyData}
              className="px-4 py-2 bg-[#14532d] text-white rounded hover:bg-[#166534]"
            >
              Refresh list
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Word</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phonetic</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">English definition</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Meaning</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Example</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {vocabularyItems.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50 align-top">
                    <td className="px-4 py-3 text-sm text-gray-900">{item.course.title}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{item.displayOrder}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-[#14532d]">{item.word}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{item.phonetic || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{item.englishDefinition || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{item.meaning}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{item.example || '-'}</td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        onClick={() => startEditVocabulary(item)}
                        className="mr-3 text-[#14532d] hover:text-[#166534] hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteVocabulary(item.id)}
                        disabled={deletingVocabularyId === item.id}
                        className="text-red-600 hover:text-red-800 hover:underline disabled:opacity-50"
                      >
                        {deletingVocabularyId === item.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
                {vocabularyItems.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-3 text-center text-gray-500">No vocabulary items match the current filter.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Statistics */}
        <div className={`grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 ${activeSection === 'course' ? '' : 'hidden'}`}>
          <div className="bg-white rounded shadow p-6">
            <h3 className="text-gray-500 text-sm font-medium">Total users</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{summary.totalUsers}</p>
          </div>
          <div className="bg-white rounded shadow p-6">
            <h3 className="text-gray-500 text-sm font-medium">Total students across all courses</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{summary.totalStudents}</p>
          </div>
          <div className="bg-white rounded shadow p-6">
            <h3 className="text-gray-500 text-sm font-medium">Waiting for payment confirmation</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{enrollments.filter((e) => e.status === 'pending').length}</p>
          </div>
          <div className="bg-white rounded shadow p-6 flex flex-col justify-between">
            <h3 className="text-gray-500 text-sm font-medium">Students by course</h3>
            <Link
              href="/admin/course-students"
              className="mt-4 inline-flex items-center justify-center px-4 py-2 bg-[#14532d] text-white rounded hover:bg-[#166534]"
            >
              View details
            </Link>
          </div>
        </div>

        <div className={`mb-8 ${activeSection === 'course' ? '' : 'hidden'}`}>
          {/* Table 1 — User accounts */}
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <button
              type="button"
              onClick={() => setTable1Expanded((v) => !v)}
              className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-base font-bold text-slate-800">User accounts</span>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">{usersOverview.length}</span>
              </div>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full border transition-colors ${
                table1Expanded
                  ? 'border-slate-300 bg-white text-slate-600'
                  : 'border-[#14532d]/30 bg-[#14532d]/5 text-[#14532d]'
              }`}>
                {table1Expanded ? 'Collapse ▲' : 'Expand ▼'}
              </span>
            </button>
            {table1Expanded && (
              <div className="border-t border-slate-100">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Phone</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Created on</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {usersOverview.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 text-sm font-medium text-slate-800">{item.name || item.email}</td>
                          <td className="px-4 py-3 text-sm text-slate-600">{item.phone || <span className="text-slate-400 italic">Not updated yet</span>}</td>
                          <td className="px-4 py-3 text-sm text-slate-500">{new Date(item.createdAt).toLocaleDateString('en-GB')}</td>
                        </tr>
                      ))}
                      {usersOverview.length === 0 && (
                        <tr>
                          <td colSpan={3} className="px-4 py-6 text-center text-sm text-slate-400">No user accounts found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {!table1Expanded && usersOverview.length > 0 && (
              <div className="border-t border-slate-100 px-5 py-3">
                <p className="text-xs text-slate-400">Showing summary — expand to view all {usersOverview.length} accounts.</p>
              </div>
            )}
          </div>

        </div>

        <div className={`bg-white rounded shadow p-6 mb-8 ${activeSection === 'homework' ? '' : 'hidden'}`}>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Homework Management by Course</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <select
              value={newHomeworkCourseId}
              onChange={(e) => setNewHomeworkCourseId(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#14532d]"
            >
              <option value="">Choose a course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>{course.title}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Homework title"
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
          </div>

          <textarea
            placeholder="Homework description"
            value={newHomeworkDescription}
            onChange={(e) => setNewHomeworkDescription(e.target.value)}
            rows={3}
            className="w-full mb-3 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#14532d]"
          />

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Attach a file <span className="text-gray-400 font-normal">(image, audio, PDF, Word, PowerPoint, Excel — max 20 MB)</span>
            </label>
            <input
              type="file"
              accept="image/*,audio/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
              onChange={(e) => setNewHomeworkAttachment(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-gray-600 file:mr-3 file:px-3 file:py-1.5 file:rounded file:border-0 file:bg-[#14532d]/10 file:text-[#14532d] file:font-medium hover:file:bg-[#14532d]/20"
            />
            {newHomeworkAttachment && (
              <p className="mt-1 text-xs text-gray-500">Selected: {newHomeworkAttachment.name}</p>
            )}

            <div className="mt-4">
              <button
                onClick={createHomework}
                disabled={newHomeworkAttachmentUploading}
                className="px-6 py-2 bg-[#14532d] text-white rounded hover:bg-[#166534] font-medium disabled:opacity-50"
              >
                {newHomeworkAttachmentUploading ? 'Uploading...' : 'Create homework'}
              </button>
            </div>
          </div>

          {groupedHomeworks.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 px-4 py-8 text-center text-gray-500">
              No homework has been created yet.
            </div>
          ) : (
            <div className="space-y-5">
              {groupedHomeworks.map((group) => (
                <section key={group.courseTitle} className="overflow-hidden rounded-lg border border-[#14532d]/20">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#14532d]/20 bg-[#14532d]/5 px-4 py-3">
                    <h3 className="text-base font-bold text-[#14532d]">{group.courseTitle}</h3>
                    <div className="flex items-center gap-2 text-xs font-semibold">
                      <span className="rounded-full bg-white px-2.5 py-1 text-slate-600 ring-1 ring-slate-200">
                        {group.items.length} homework
                      </span>
                      <span className="rounded-full bg-white px-2.5 py-1 text-slate-600 ring-1 ring-slate-200">
                        {group.totalSubmissions} submissions
                      </span>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Homework</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attachment</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due date</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submissions</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.items.map((homework) => (
                          <tr key={homework.id} className="border-b hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900">{homework.title}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              <LinkifiedText text={homework.description || 'No description'} />
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {homework.attachmentUrl ? (
                                <a
                                  href={homework.attachmentUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[#14532d] hover:underline"
                                >
                                  📎 Download
                                </a>
                              ) : (
                                <span className="text-gray-400">—</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">{new Date(homework.dueDate).toLocaleDateString('en-GB')}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{homework._count.submissions}</td>
                            <td className="px-4 py-3 text-sm">
                              <div className="flex items-center gap-3">
                                <button onClick={() => openEditHomework(homework)} className="text-[#14532d] hover:underline">Edit</button>
                                <button
                                  onClick={() => deleteHomework(homework)}
                                  disabled={deletingHomeworkId === homework.id}
                                  className="text-red-600 hover:underline disabled:opacity-50"
                                >
                                  {deletingHomeworkId === homework.id ? 'Deleting...' : 'Delete'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>

        <div className={`bg-white rounded shadow p-6 mb-8 ${activeSection === 'homework' ? '' : 'hidden'}`}>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Student Submissions and Teacher Feedback</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <select
              value={homeworkSubmissionCourseFilter}
              onChange={(e) => {
                setHomeworkSubmissionCourseFilter(e.target.value)
                setHomeworkSubmissionHomeworkFilter('')
              }}
              className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#14532d]"
            >
              <option value="">All courses</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>{course.title}</option>
              ))}
            </select>

            <select
              value={homeworkSubmissionHomeworkFilter}
              onChange={(e) => setHomeworkSubmissionHomeworkFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#14532d]"
            >
              <option value="">All homework</option>
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
              Refresh submission list
            </button>
          </div>

          {groupedHomeworkSubmissions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 px-4 py-8 text-center text-gray-500">
              No submissions match the current filter.
            </div>
          ) : (
            <div className="space-y-4">
              {groupedHomeworkSubmissions.map((group, groupIndex) => {
                const style = HOMEWORK_SUBMISSION_GROUP_STYLES[groupIndex % HOMEWORK_SUBMISSION_GROUP_STYLES.length]
                const pendingFeedbackCount = group.items.filter((item) => {
                  const latest = [...(item.messages || [])].reverse()[0]
                  return latest?.senderRole === 'student'
                }).length

                return (
                  <section key={group.homeworkId} className={`overflow-hidden rounded-xl border ${style.wrap}`}>
                    <div className={`flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 ${style.header}`}>
                      <div>
                        <h3 className={`text-sm font-bold sm:text-base ${style.title}`}>{group.homeworkTitle}</h3>
                        <p className="mt-1 text-xs text-gray-600">{group.courseTitle}</p>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-semibold">
                        <span className="rounded-full bg-white px-2.5 py-1 text-slate-600 ring-1 ring-slate-200">
                          {group.items.length} submissions
                        </span>
                        {pendingFeedbackCount > 0 && (
                          <span className="rounded-full bg-amber-100 px-2.5 py-1 text-amber-800">
                            {pendingFeedbackCount} waiting feedback
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse bg-white">
                        <thead className="bg-gray-50 border-b">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Homework</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last message</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted at</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {group.items.map((submission) => {
                            const latestMessage = [...(submission.messages || [])].reverse()[0]
                            const isPendingTeacherFeedback = latestMessage?.senderRole === 'student'

                            return (
                              <tr key={submission.id} className={`border-b hover:bg-gray-50 ${isPendingTeacherFeedback ? 'bg-amber-50/60 font-semibold' : ''}`}>
                                <td className="px-4 py-3 text-sm text-gray-900">
                                  <p className="font-semibold">{submission.user.name || submission.user.email}</p>
                                  <p className="text-xs text-gray-500">{submission.user.phone || 'Not updated yet'}</p>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-700">{submission.homework.course.title}</td>
                                <td className="px-4 py-3 text-sm text-gray-900">{submission.homework.title}</td>
                                <td className="px-4 py-3 text-sm text-gray-700">
                                  {latestMessage ? (
                                    <p className="max-w-xs truncate">
                                      <span className="font-semibold">{latestMessage.senderRole === 'teacher' ? 'Teacher: ' : 'Student: '}</span>
                                      <span>
                                        <LinkifiedText text={latestMessage.content} preserveLineBreaks={false} linkClassName="font-medium text-sky-700 underline underline-offset-2 hover:text-sky-800" />
                                      </span>
                                    </p>
                                  ) : (
                                    <span className="text-gray-500">No messages yet</span>
                                  )}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-500">{new Date(submission.submittedAt).toLocaleString('en-GB')}</td>
                                <td className="px-4 py-3 text-sm">
                                  <button
                                    onClick={() => setHomeworkDetailSubmissionId(submission.id)}
                                    className={`rounded px-3 py-1.5 text-xs font-semibold text-white transition-colors ${isPendingTeacherFeedback ? 'review-attention-button bg-amber-600 hover:bg-amber-700' : 'bg-[#14532d] hover:bg-[#166534]'}`}
                                  >
                                    Review
                                  </button>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </section>
                )
              })}
            </div>
          )}

          {homeworkDetailSubmissionId && (() => {
            const selectedSubmission = homeworkSubmissions.find((item) => item.id === homeworkDetailSubmissionId)
            if (!selectedSubmission) return null

            return (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
                <div className="w-full max-w-3xl rounded-2xl border border-[#14532d]/40 bg-white p-5 shadow-2xl">
                  <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-3">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{selectedSubmission.homework.title}</h3>
                      <p className="mt-1 text-sm text-slate-600">{selectedSubmission.user.name || selectedSubmission.user.email} • {selectedSubmission.user.phone || 'Not updated yet'}</p>
                      <p className="mt-1 text-sm text-slate-500">Course: {selectedSubmission.homework.course.title}</p>
                    </div>
                    <button
                      onClick={() => setHomeworkDetailSubmissionId(null)}
                      className="rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Close
                    </button>
                  </div>

                  <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="max-h-96 space-y-3 overflow-y-auto pr-1">
                      {(selectedSubmission.messages || []).map((message) => {
                        const youtubeVideoId = extractYoutubeVideoIdFromText(message.content)

                        return (
                        <div key={message.id} className={`flex ${message.senderRole === 'student' ? 'justify-end' : 'justify-start'}`}>
                          <div
                            className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
                              message.senderRole === 'student'
                                ? 'rounded-br-md bg-emerald-100 text-emerald-950'
                                : 'rounded-bl-md border border-blue-200 bg-blue-50 text-blue-950'
                            }`}
                          >
                            <p
                              className={`text-[11px] font-bold uppercase tracking-wide ${
                                message.senderRole === 'student' ? 'text-emerald-700' : 'text-blue-700'
                              }`}
                            >
                              {message.senderRole === 'student' ? 'Student' : 'Teacher'}
                            </p>
                            <p
                              className={`mt-1 ${
                                message.senderRole === 'student' ? 'text-emerald-900' : 'text-blue-900'
                              }`}
                            >
                              <LinkifiedText text={message.content} />
                            </p>
                            {youtubeVideoId && (
                              <div className="mt-2 overflow-hidden rounded-lg border border-slate-200 bg-black">
                                <div className="relative w-full pt-[56.25%]">
                                  <iframe
                                    src={`https://www.youtube-nocookie.com/embed/${youtubeVideoId}`}
                                    title="YouTube video preview"
                                    className="absolute inset-0 h-full w-full"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    referrerPolicy="strict-origin-when-cross-origin"
                                    allowFullScreen
                                  />
                                </div>
                              </div>
                            )}
                            <p className="mt-1 text-[11px] text-slate-500">{new Date(message.createdAt).toLocaleString('en-GB')}</p>
                          </div>
                        </div>
                        )
                      })}
                      {(selectedSubmission.messages || []).length === 0 && (
                        <p className="text-sm text-slate-600">No messages yet.</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-semibold text-slate-700">Your reply</label>
                    <textarea
                      value={homeworkTeacherComments[selectedSubmission.id] || ''}
                      onChange={(e) => setHomeworkTeacherComments((current) => ({ ...current, [selectedSubmission.id]: e.target.value }))}
                      rows={3}
                      placeholder="Write your reply to the student..."
                      className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#14532d]"
                    />
                    <button
                      onClick={() => saveHomeworkTeacherComment(selectedSubmission.id)}
                      disabled={savingHomeworkCommentId === selectedSubmission.id}
                      className="mt-3 block rounded bg-[#14532d] px-4 py-2 text-sm font-bold text-white hover:bg-[#166534] disabled:opacity-50"
                    >
                      {savingHomeworkCommentId === selectedSubmission.id ? 'Sending...' : 'Send reply'}
                    </button>
                  </div>
                </div>
              </div>
            )
          })()}
        </div>

        <div className={`bg-white rounded shadow p-6 mb-8 ${activeSection === 'exercise' ? '' : 'hidden'}`}>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Exercises</h2>

          <div className="mb-6 rounded border border-[#14532d]/20 bg-[#14532d]/5 px-4 py-3 text-sm text-[#14532d]">
            Total exercises created: <span className="font-semibold">{exercises.length}</span>
          </div>

          <div className="mb-8 overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exercise</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Questions</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {exercises.map((exercise) => (
                  <tr key={exercise.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{exercise.course.title}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{getExerciseTitle(exercise)}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      <div className="flex flex-col gap-1">
                        <span>{getExerciseTypeLabel(exercise.exerciseType)}</span>
                        {exercise.audioFileUrl && <span className="text-xs text-[#14532d]">Audio attached</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`rounded px-2 py-1 text-xs font-semibold ${exercise.isDraft ? 'bg-amber-100 text-amber-800' : 'bg-[#14532d]/10 text-[#14532d]'}`}>
                        {exercise.isDraft ? 'Draft' : 'Published'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <LinkifiedText text={exercise.description || 'No description yet'} />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{exercise.questions.length}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-3">
                        {exercise.isDraft && (
                          <button
                            onClick={() => publishDraftExercise(exercise)}
                            disabled={savingExerciseId === exercise.id}
                            className="text-blue-700 hover:underline disabled:opacity-50"
                          >
                            {savingExerciseId === exercise.id ? 'Publishing...' : 'Publish'}
                          </button>
                        )}
                        <button onClick={() => openEditExercise(exercise)} className="text-[#14532d] hover:underline">Edit</button>
                        <button
                          onClick={() => {
                            setQuickCopyExercise(exercise)
                            setQuickCopyTargetCourseId('')
                            setQuickCopyError('')
                          }}
                          className="text-indigo-600 hover:underline"
                        >
                          Copy
                        </button>
                        <button
                          onClick={() => deleteExercise(exercise)}
                          disabled={deletingExerciseId === exercise.id}
                          className="text-red-600 hover:underline disabled:opacity-50"
                        >
                          {deletingExerciseId === exercise.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {exercises.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-3 text-center text-gray-500">No exercises yet</td>
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
              {showExerciseBuilder ? 'Hide exercise form' : 'Create exercise'}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowImportExerciseModal(true)
                setImportFromCourseError('')
                setImportSourceCourseId('')
                setImportTargetCourseId('')
                setImportSelectedExerciseIds(new Set())
              }}
              className="px-6 py-2 bg-white border border-[#14532d] text-[#14532d] rounded hover:bg-[#14532d]/5 font-medium"
            >
              Import từ khóa học khác
            </button>

            {showExerciseBuilder && (
              <button
                type="button"
                onClick={() => {
                  resetNewExerciseForm()
                  setExerciseError('')
                }}
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 font-medium"
              >
                Reset form
              </button>
            )}
          </div>

          {showExerciseBuilder && (
            <>
              <div className="mb-6 flex flex-col gap-2 max-w-sm">
                <label className="text-sm font-medium text-gray-700">Course</label>
                <select
                  value={newExerciseCourseId}
                  onChange={(e) => setNewExerciseCourseId(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#14532d]"
                >
                  <option value="">Select course</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>{course.title}</option>
                  ))}
                </select>
              </div>

              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-gray-700">Exercise title</label>
                <input
                  type="text"
                  value={newExerciseTitle}
                  onChange={(e) => setNewExerciseTitle(e.target.value)}
                  placeholder="Example: Week 1 Pronunciation Drill"
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#14532d]"
                />
              </div>

              <div className="mb-6 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Exercise type</label>
                  <select
                    value={newExerciseType}
                    onChange={(e) => setNewExerciseType(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#14532d]"
                  >
                    <option value="multiple_choice">Pronunciation</option>
                    <option value="question_response">Question-Response (Audio)</option>
                    <option value="conversation">Conversation (Audio)</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Audio file</label>
                  <div className="rounded-xl border border-dashed border-gray-300 p-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <label className="inline-flex cursor-pointer items-center rounded bg-[#14532d] px-4 py-2 text-sm font-medium text-white hover:bg-[#166534]">
                        {newExerciseAudioUploading ? 'Uploading audio...' : 'Upload audio'}
                        <input
                          type="file"
                          accept="audio/*,.mp3,.m4a,.wav,.ogg,.webm"
                          className="hidden"
                          disabled={newExerciseAudioUploading}
                          onChange={(event) => {
                            const file = event.target.files?.[0]
                            if (file) {
                              void handleNewExerciseAudioSelected(file)
                            }
                            event.currentTarget.value = ''
                          }}
                        />
                      </label>
                      {newExerciseAudioFileUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            setNewExerciseAudioFileUrl(null)
                            setNewExerciseAudioFileName('')
                          }}
                          className="text-sm text-red-600 hover:underline"
                        >
                          Remove audio
                        </button>
                      )}
                    </div>
                    <p className="mt-3 text-sm text-gray-600">
                      {newExerciseAudioFileUrl ? newExerciseAudioFileName || 'Audio uploaded' : (newExerciseType === 'multiple_choice' ? 'Không cần audio cho loại này.' : 'Bắt buộc cho loại này. Dung lượng tối đa 4MB.')}
                    </p>
                    {newExerciseAudioFileUrl && (
                      <audio controls preload="metadata" className="mt-3 w-full">
                        <source src={newExerciseAudioFileUrl} />
                      </audio>
                    )}
                  </div>
                </div>
              </div>

              {(newExerciseType === 'question_response' || newExerciseType === 'conversation') && (
                <div className="mb-6">
                  <label className="mb-2 block text-sm font-medium text-gray-700">Attachment file <span className="text-gray-400 font-normal">(PPT, DOCX, PDF — vocabulary handout)</span></label>
                  <div className="rounded-xl border border-dashed border-gray-300 p-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <label className="inline-flex cursor-pointer items-center rounded bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800">
                        {newExerciseAttachUploading ? 'Uploading...' : 'Upload file'}
                        <input
                          type="file"
                          accept=".pptx,.ppt,.docx,.doc,.pdf,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword,application/pdf"
                          className="hidden"
                          disabled={newExerciseAttachUploading}
                          onChange={(event) => {
                            const file = event.target.files?.[0]
                            if (file) {
                              void handleNewExerciseAttachSelected(file)
                            }
                            event.currentTarget.value = ''
                          }}
                        />
                      </label>
                      {newExerciseAttachFileUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            setNewExerciseAttachFileUrl(null)
                            setNewExerciseAttachFileName('')
                          }}
                          className="text-sm text-red-600 hover:underline"
                        >
                          Remove file
                        </button>
                      )}
                    </div>
                    <p className="mt-3 text-sm text-gray-600">
                      {newExerciseAttachFileUrl ? newExerciseAttachFileName || 'File uploaded' : 'Tùy chọn — học viên có thể tải về để xem từ vựng.'}
                    </p>
                    {newExerciseAttachFileUrl && (
                      <a href={newExerciseAttachFileUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm text-blue-700 hover:underline">
                        {newExerciseAttachFileName || 'Download attachment'}
                      </a>
                    )}
                  </div>
                </div>
              )}

              {newExerciseType === 'conversation' && (
                <div className="mb-6">
                  <label className="mb-2 block text-sm font-medium text-gray-700">Import conversation from slide</label>
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="inline-flex cursor-pointer items-center px-4 py-2 bg-emerald-700 text-white rounded hover:bg-emerald-800 disabled:opacity-50">
                      {importingPptx ? 'Importing PPTX...' : 'Import Slide (PPTX)'}
                      <input
                        type="file"
                        accept=".pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                        className="hidden"
                        disabled={importingPptx}
                        onChange={(event) => {
                          const file = event.target.files?.[0]
                          if (file) {
                            void importFromPptxFile(file)
                          }
                          event.currentTarget.value = ''
                        }}
                      />
                    </label>
                  </div>
                </div>
              )}

              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-gray-700">Exercise description</label>
                <textarea
                  value={newExerciseDescription}
                  onChange={(e) => setNewExerciseDescription(e.target.value)}
                  rows={3}
                  placeholder="Example: Practice the /th/ sound and compare similar sounds"
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#14532d]"
                />
              </div>

              {newExerciseType === 'multiple_choice' && (
                <div className="mb-6">
                  <label className="mb-2 block text-sm font-medium text-gray-700">Import question set</label>
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="url"
                      value={newExerciseSourceFormUrl}
                      onChange={(e) => setNewExerciseSourceFormUrl(e.target.value)}
                      placeholder="Paste Google Docs link"
                      className="w-80 max-w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#14532d]"
                    />
                    <button
                      type="button"
                      onClick={importFromGoogleDocs}
                      disabled={importingForm}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                      {importingForm ? 'Importing...' : 'Import from Google Docs'}
                    </button>
                    <label className="inline-flex cursor-pointer items-center px-4 py-2 bg-[#14532d] text-white rounded hover:bg-[#166534] disabled:opacity-50">
                      {importingDocx ? 'Importing DOCX...' : 'Import DOCX'}
                      <input
                        type="file"
                        accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        className="hidden"
                        disabled={importingDocx}
                        onChange={(event) => {
                          const file = event.target.files?.[0]
                          if (file) {
                            void importFromDocxFile(file)
                          }
                          event.currentTarget.value = ''
                        }}
                      />
                    </label>
                  </div>
                </div>
              )}

              <p className="mb-4 text-sm text-gray-500">
                {newExerciseType === 'multiple_choice' && 'Pronunciation: để trống đáp án D nếu mỗi câu chỉ có 3 lựa chọn.'}
                {newExerciseType === 'question_response' && 'Question-Response: nội dung câu hỏi là tùy chọn (có thể để trống), dùng 3 đáp án A/B/C. Học viên chỉ thấy số thứ tự câu và 3 lựa chọn.'}
                {newExerciseType === 'conversation' && 'Conversation: nhập nội dung câu hỏi và 4 đáp án A/B/C/D (bắt buộc). Học viên thấy toàn bộ nội dung câu hỏi và đáp án.'}
              </p>

              <div className="space-y-4">
                {newExerciseQuestions.map((question, index) => (
                  <div key={`new-exercise-${index}`} className="rounded-xl border border-gray-200 p-4">
                    <h3 className="font-bold text-[#14532d] mb-3">Question {index + 1}</h3>
                    <div className="space-y-3">
                      <textarea
                        value={question.question}
                        onChange={(e) => updateNewExerciseQuestion(index, 'question', e.target.value)}
                        rows={2}
                        placeholder={newExerciseType === 'question_response' ? 'Question text (optional)' : 'Enter the question'}
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#14532d]"
                      />
                      <input
                        type="text"
                        value={question.optionA}
                        onChange={(e) => updateNewExerciseQuestion(index, 'optionA', e.target.value)}
                        placeholder="Answer A"
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#14532d]"
                      />
                      <input
                        type="text"
                        value={question.optionB}
                        onChange={(e) => updateNewExerciseQuestion(index, 'optionB', e.target.value)}
                        placeholder="Answer B"
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#14532d]"
                      />
                      <input
                        type="text"
                        value={question.optionC}
                        onChange={(e) => updateNewExerciseQuestion(index, 'optionC', e.target.value)}
                        placeholder="Answer C"
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#14532d]"
                      />
                      {newExerciseType !== 'question_response' && (
                        <input
                          type="text"
                          value={question.optionD}
                          onChange={(e) => updateNewExerciseQuestion(index, 'optionD', e.target.value)}
                          placeholder={newExerciseType === 'conversation' ? 'Answer D (bắt buộc)' : 'Answer D (optional)'}
                          className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#14532d]"
                        />
                      )}
                      <select
                        value={question.correctOption}
                        onChange={(e) => updateNewExerciseQuestion(index, 'correctOption', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#14532d]"
                      >
                        <option value="A">Correct answer: A</option>
                        <option value="B">Correct answer: B</option>
                        <option value="C">Correct answer: C</option>
                        {newExerciseType !== 'question_response' && (
                          <option value="D">Correct answer: D</option>
                        )}
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
                {savingExerciseDraft ? 'Saving draft...' : 'Save draft'}
              </button>

              <button
                onClick={() => createExercise(false)}
                disabled={savingExerciseDraft || publishingExercise}
                className="mt-6 px-6 py-2 bg-[#14532d] text-white rounded hover:bg-[#166534] font-medium disabled:opacity-50"
              >
                {publishingExercise ? 'Publishing...' : 'Publish exercise'}
              </button>
            </>
          )}
        </div>

        <div className={`bg-white rounded shadow p-6 mb-8 ${activeSection === 'speakYourself' ? '' : 'hidden'}`}>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Speak Yourself results</h2>

          {groupedSpeakYourselfResults.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 px-4 py-6 text-center text-gray-500">
              No Speak Yourself attempts yet
            </div>
          ) : (
            <div className="space-y-4">
              {groupedSpeakYourselfResults.map((group) => (
                <section key={group.courseTitle} className="overflow-hidden rounded-lg border border-[#14532d]/20">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#14532d]/20 bg-[#14532d]/5 px-4 py-3">
                    <h4 className="text-sm font-bold text-[#14532d]">{group.courseTitle}</h4>
                    <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                      {group.items.length} attempts
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Accuracy</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Result</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recognized text</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attempted at</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.items.map((attempt) => (
                          <tr key={attempt.id} className="border-b hover:bg-gray-50 align-top">
                            <td className="px-4 py-3 text-sm text-gray-900">{attempt.user.name || attempt.user.email}</td>
                            <td className="px-4 py-3 text-sm font-semibold text-gray-900">{attempt.accuracy}%</td>
                            <td className="px-4 py-3 text-sm">
                              <span className={`rounded px-2 py-1 text-xs font-semibold ${attempt.passed ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                {attempt.passed ? 'Pass' : 'Retry'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700">
                              <p className="max-w-xl whitespace-pre-wrap wrap-break-word">{attempt.recognizedText}</p>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">{new Date(attempt.createdAt).toLocaleString('en-GB')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>

        <div className={`bg-white rounded shadow p-6 mb-8 ${activeSection === 'exercise' ? '' : 'hidden'}`}>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Student exercise results</h2>

          {groupedExerciseResults.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 px-4 py-8 text-center text-gray-500">
              No student submissions yet
            </div>
          ) : (
            <div className="space-y-5">
              {groupedExerciseResults.map((group) => (
                <section key={group.courseTitle} className="overflow-hidden rounded-lg border border-[#14532d]/20">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#14532d]/20 bg-[#14532d]/5 px-4 py-3">
                    <h3 className="text-base font-bold text-[#14532d]">{group.courseTitle}</h3>
                    <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                      {group.items.length} submissions
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exercise</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.items.map((result) => (
                          <tr key={result.id} className="border-b hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900">{result.user.name || result.user.email}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{result.exerciseTitle}</td>
                            <td className="px-4 py-3 text-sm font-semibold text-[#14532d]">{result.score}/{result.totalQuestions}</td>
                            <td className="px-4 py-3 text-sm text-gray-700">{formatDuration(result.durationSeconds)}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{new Date(result.submittedAt).toLocaleString('vi-VN')}</td>
                            <td className="px-4 py-3 text-sm">
                              <button onClick={() => setSelectedExerciseResult(result)} className="text-[#14532d] hover:underline">View submission</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>

        <div className={`bg-white rounded shadow p-6 mb-8 ${activeSection === 'lectureNote' ? '' : 'hidden'}`}>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Lecture notes by course</h2>

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
              <option value="">Select course</option>
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
              placeholder="Session number (1-30)"
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
              Add note
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Session</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Google Drive link</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Updated</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
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
                        <>Session {note.sessionNumber}</>
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
                        <span className="text-gray-400">No link yet</span>
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
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingLectureNote(null)
                              setEditLectureSession('')
                              setEditLectureDriveLink('')
                            }}
                            className="px-3 py-1.5 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                          >
                            Cancel
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
                            Edit
                          </button>
                          <button
                            onClick={() => deleteLectureNote(note.id)}
                            disabled={deletingLectureId === note.id}
                            className="px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                          >
                            {deletingLectureId === note.id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {lectureNotes.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-3 text-center text-gray-500">No lecture notes for this course yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="rounded border border-[#14532d]/40 bg-white shadow-lg p-6 max-w-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Confirm student deletion</h3>
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete <strong>{deleteConfirm.name}</strong>? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  disabled={deletingUserId === deleteConfirm.id}
                  className="px-4 py-2 bg-gray-300 text-gray-900 rounded hover:bg-gray-400 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteUserAccount(deleteConfirm.id)}
                  disabled={deletingUserId === deleteConfirm.id}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                >
                  {deletingUserId === deleteConfirm.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Course Management Section */}
        <div className={`mt-12 bg-white rounded shadow p-6 ${activeSection === 'course' ? '' : 'hidden'}`}>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Manage <span className="text-amber-600">Courses</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 mb-4 items-start">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-gray-700">Course title</span>
              <input
                type="text"
                value={newCourseTitle}
                onChange={(e) => setNewCourseTitle(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#14532d]"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-gray-700">Course description (shown in course detail)</span>
              <textarea
                value={newCourseDescription}
                onChange={(e) => setNewCourseDescription(e.target.value)}
                rows={4}
                className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#14532d]"
              />
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setNewCourseDescription(COURSE_DESCRIPTION_TEMPLATE)}
                  className="rounded border border-[#14532d]/30 bg-[#14532d]/5 px-3 py-1.5 text-xs font-medium text-[#14532d] hover:bg-[#14532d]/10"
                >
                  Chèn mẫu 9 mục
                </button>
                <button
                  type="button"
                  onClick={() => setNewCourseDescription('')}
                  className="rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                >
                  Xóa nhanh
                </button>
              </div>
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-gray-700">Registration deadline</span>
              <input
                type="text"
                value={newDeadline}
                onChange={(e) => setNewDeadline(e.target.value)}
                inputMode="numeric"
                className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#14532d]"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-gray-700">Maximum students</span>
              <input
                type="number"
                min={1}
                max={10}
                value={newCourseMaxStudents}
                onChange={(e) => setNewCourseMaxStudents(Math.min(10, Math.max(1, Number(e.target.value) || 1)))}
                className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#14532d]"
              />
              <span className="text-xs text-gray-500">Each course supports up to 10 students.</span>
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-gray-700">Học phí (VND)</span>
              <input
                type="number"
                min={0}
                step={1000}
                value={newCoursePrice}
                onChange={(e) => setNewCoursePrice(Math.max(0, Math.round(Number(e.target.value) || 0)))}
                className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#14532d]"
              />
              <span className="text-xs text-gray-500">Ví dụ: 4200000</span>
            </label>
          </div>

          <div className="mb-6 flex justify-end">
            <button
              onClick={publishCourse}
              className="px-6 py-2 bg-[#14532d] text-white rounded hover:bg-[#166534] font-medium"
            >
              Publish course
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registration deadline</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số chỗ</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Học phí</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progress</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Visibility</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Successful</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Awaiting transfer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{course.title}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      <button
                        type="button"
                        onClick={() => setCourseDetailPreview({ title: course.title, description: course.description })}
                        className="font-semibold text-[#14532d] hover:underline"
                      >
                        Detail
                      </button>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(course.registrationDeadline).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{course.maxStudents}/10</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{course.price.toLocaleString('vi-VN')} {course.currency || 'VND'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <div className="w-40">
                        <div className="mb-1 flex items-center justify-between text-xs text-gray-600">
                          <span>{course.completedSessions}/30 sessions</span>
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
                        {course.isPublished ? 'Public' : 'Unpublished'}
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
                          Edit
                        </button>
                        {course.isPublished && (
                          <button
                            onClick={() => setConfirmUnpublish({ id: course.id, title: course.title })}
                            disabled={savingCourseId === course.id}
                            className="text-red-600 hover:text-red-800 hover:underline disabled:opacity-50"
                          >
                            {savingCourseId === course.id ? 'Processing...' : 'Unpublish'}
                          </button>
                        )}
                        {!course.isPublished && (
                          <button
                            onClick={() => republishCourse(course.id, course.title)}
                            disabled={savingCourseId === course.id}
                            className="text-[#14532d] hover:text-[#166534] hover:underline disabled:opacity-50"
                          >
                            {savingCourseId === course.id ? 'Processing...' : 'Publish'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {courses.length === 0 && (
                  <tr>
                    <td colSpan={11} className="px-4 py-3 text-center text-gray-500">
                      No courses yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {courseDetailPreview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-2xl rounded border border-[#14532d]/40 bg-white p-6 shadow-lg">
              <div className="mb-4 flex items-start justify-between gap-3">
                <h3 className="text-xl font-bold text-gray-900">Course detail: {courseDetailPreview.title}</h3>
                <button
                  type="button"
                  onClick={() => setCourseDetailPreview(null)}
                  className="text-2xl leading-none text-gray-400 hover:text-gray-600"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              <div className="max-h-[65vh] overflow-y-auto rounded border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                <LinkifiedText text={courseDetailPreview.description || 'No description yet'} preserveLineBreaks />
              </div>

              <div className="mt-5 flex justify-end">
                <button
                  type="button"
                  onClick={() => setCourseDetailPreview(null)}
                  className="rounded bg-[#14532d] px-4 py-2 text-white hover:bg-[#166534]"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {editingCourse && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="rounded border border-[#14532d]/40 bg-white shadow-lg p-6 max-w-lg w-full">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Edit course details</h3>

              <div className="space-y-4">
                <input
                  type="text"
                  value={editCourseTitle}
                  onChange={(e) => setEditCourseTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#14532d]"
                />
                <textarea
                  value={editCourseDescription}
                  onChange={(e) => setEditCourseDescription(e.target.value)}
                  rows={10}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#14532d]"
                />
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditCourseDescription(COURSE_DESCRIPTION_TEMPLATE)}
                    className="rounded border border-[#14532d]/30 bg-[#14532d]/5 px-3 py-1.5 text-xs font-medium text-[#14532d] hover:bg-[#14532d]/10"
                  >
                    Chèn mẫu 9 mục
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditCourseDescription('')}
                    className="rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                  >
                    Xóa nhanh
                  </button>
                </div>
                <input
                  type="text"
                  value={editCourseDeadline}
                  onChange={(e) => setEditCourseDeadline(e.target.value)}
                  inputMode="numeric"
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#14532d]"
                />
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-gray-700">Maximum students</span>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={editCourseMaxStudents}
                    onChange={(e) => setEditCourseMaxStudents(Math.min(10, Math.max(1, Number(e.target.value) || 1)))}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#14532d]"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-gray-700">Học phí (VND)</span>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    value={editCoursePrice}
                    onChange={(e) => setEditCoursePrice(Math.max(0, Math.round(Number(e.target.value) || 0)))}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#14532d]"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-gray-700">Completed sessions (0-30)</span>
                  <input
                    type="number"
                    min={0}
                    max={30}
                    value={editCourseCompletedSessions}
                    onChange={(e) => setEditCourseCompletedSessions(Math.min(30, Math.max(0, Number(e.target.value) || 0)))}
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
                  Cancel
                </button>
                <button
                  onClick={saveEditedCourse}
                  disabled={savingCourseId === editingCourse.id}
                  className="px-4 py-2 bg-[#14532d] text-white rounded hover:bg-[#166534] disabled:opacity-50"
                >
                  {savingCourseId === editingCourse.id ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </div>
          </div>
        )}

        {editingHomework && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="rounded border border-[#14532d]/40 bg-white shadow-lg p-6 max-w-lg w-full">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Edit homework</h3>

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
                  placeholder="Homework title"
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#14532d]"
                />
                <textarea
                  value={editHomeworkDescription}
                  onChange={(e) => setEditHomeworkDescription(e.target.value)}
                  rows={3}
                  placeholder="Homework description"
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Attach a file <span className="text-gray-400 font-normal">(image, audio, PDF, Word, PowerPoint, Excel — max 20 MB)</span>
                  </label>
                  {editHomeworkAttachmentUrl && !editHomeworkAttachment && (
                    <div className="mb-2 flex items-center gap-2 text-sm text-gray-600">
                      <span>Current:</span>
                      <a href={editHomeworkAttachmentUrl} target="_blank" rel="noopener noreferrer" className="text-[#14532d] hover:underline truncate max-w-50">
                        📎 {editHomeworkAttachmentUrl.split('/').pop()}
                      </a>
                      <button
                        type="button"
                        onClick={() => setEditHomeworkAttachmentUrl(null)}
                        className="text-red-500 hover:text-red-700 text-xs"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*,audio/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                    onChange={(e) => setEditHomeworkAttachment(e.target.files?.[0] ?? null)}
                    className="block w-full text-sm text-gray-600 file:mr-3 file:px-3 file:py-1.5 file:rounded file:border-0 file:bg-[#14532d]/10 file:text-[#14532d] file:font-medium hover:file:bg-[#14532d]/20"
                  />
                  {editHomeworkAttachment && (
                    <p className="mt-1 text-xs text-gray-500">New file: {editHomeworkAttachment.name}</p>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setEditingHomework(null)}
                  disabled={savingHomeworkId === editingHomework.id || editHomeworkAttachmentUploading}
                  className="px-4 py-2 bg-gray-300 text-gray-900 rounded hover:bg-gray-400 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={saveEditedHomework}
                  disabled={savingHomeworkId === editingHomework.id || editHomeworkAttachmentUploading}
                  className="px-4 py-2 bg-[#14532d] text-white rounded hover:bg-[#166534] disabled:opacity-50"
                >
                  {editHomeworkAttachmentUploading ? 'Uploading...' : savingHomeworkId === editingHomework.id ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </div>
          </div>
        )}

        {editingExercise && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="rounded border border-[#14532d]/40 bg-white shadow-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Edit exercise</h3>

              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-gray-700">Exercise title</label>
                <input
                  type="text"
                  value={editExerciseTitle}
                  onChange={(e) => setEditExerciseTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#14532d]"
                />
              </div>

              <div className="mb-6 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Exercise type</label>
                  <select
                    value={editExerciseType}
                    onChange={(e) => setEditExerciseType(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#14532d]"
                  >
                    <option value="multiple_choice">Pronunciation</option>
                    <option value="question_response">Question-Response (Audio)</option>
                    <option value="conversation">Conversation (Audio)</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Audio file</label>
                  <div className="rounded-xl border border-dashed border-gray-300 p-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <label className="inline-flex cursor-pointer items-center rounded bg-[#14532d] px-4 py-2 text-sm font-medium text-white hover:bg-[#166534]">
                        {editExerciseAudioUploading ? 'Uploading audio...' : 'Replace audio'}
                        <input
                          type="file"
                          accept="audio/*,.mp3,.m4a,.wav,.ogg,.webm"
                          className="hidden"
                          disabled={editExerciseAudioUploading}
                          onChange={(event) => {
                            const file = event.target.files?.[0]
                            if (file) {
                              void handleEditExerciseAudioSelected(file)
                            }
                            event.currentTarget.value = ''
                          }}
                        />
                      </label>
                      {editExerciseAudioFileUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditExerciseAudioFileUrl(null)
                            setEditExerciseAudioFileName('')
                          }}
                          className="text-sm text-red-600 hover:underline"
                        >
                          Remove audio
                        </button>
                      )}
                    </div>
                    <p className="mt-3 text-sm text-gray-600">
                      {editExerciseAudioFileUrl ? editExerciseAudioFileName || 'Audio uploaded' : 'Không có audio được gắn cho exercise này. Dung lượng tối đa 4MB.'}
                    </p>
                    {editExerciseAudioFileUrl && (
                      <audio controls preload="metadata" className="mt-3 w-full">
                        <source src={editExerciseAudioFileUrl} />
                      </audio>
                    )}
                  </div>
                </div>
              </div>

              {(editExerciseType === 'question_response' || editExerciseType === 'conversation') && (
                <div className="mb-6">
                  <label className="mb-2 block text-sm font-medium text-gray-700">Attachment file <span className="text-gray-400 font-normal">(PPT, DOCX, PDF — vocabulary handout)</span></label>
                  <div className="rounded-xl border border-dashed border-gray-300 p-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <label className="inline-flex cursor-pointer items-center rounded bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800">
                        {editExerciseAttachUploading ? 'Uploading...' : (editExerciseAttachFileUrl ? 'Replace file' : 'Upload file')}
                        <input
                          type="file"
                          accept=".pptx,.ppt,.docx,.doc,.pdf,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword,application/pdf"
                          className="hidden"
                          disabled={editExerciseAttachUploading}
                          onChange={(event) => {
                            const file = event.target.files?.[0]
                            if (file) {
                              void handleEditExerciseAttachSelected(file)
                            }
                            event.currentTarget.value = ''
                          }}
                        />
                      </label>
                      {editExerciseAttachFileUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditExerciseAttachFileUrl(null)
                            setEditExerciseAttachFileName('')
                          }}
                          className="text-sm text-red-600 hover:underline"
                        >
                          Remove file
                        </button>
                      )}
                    </div>
                    <p className="mt-3 text-sm text-gray-600">
                      {editExerciseAttachFileUrl ? editExerciseAttachFileName || 'File attached' : 'Tùy chọn — học viên có thể tải về để xem từ vựng.'}
                    </p>
                    {editExerciseAttachFileUrl && (
                      <a href={editExerciseAttachFileUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm text-blue-700 hover:underline">
                        {editExerciseAttachFileName || 'Download attachment'}
                      </a>
                    )}
                  </div>
                </div>
              )}

              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-gray-700">Exercise description</label>
                <textarea
                  value={editExerciseDescription}
                  onChange={(e) => setEditExerciseDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#14532d]"
                />
              </div>

              <p className="mb-4 text-sm text-gray-500">
                {editExerciseType === 'multiple_choice' && 'Để trống đáp án D nếu câu hỏi chỉ có 3 lựa chọn.'}
                {editExerciseType === 'question_response' && 'Question-Response: nội dung câu hỏi là tùy chọn (có thể để trống), dùng 3 đáp án A/B/C. Học viên chỉ thấy số thứ tự câu.'}
                {editExerciseType === 'conversation' && 'Conversation: 4 đáp án A/B/C/D (bắt buộc). Học viên thấy toàn bộ nội dung.'}
              </p>

              <div className="space-y-4">
                {editExerciseQuestions.map((question, index) => (
                  <div key={`edit-exercise-${index}`} className="rounded-xl border border-gray-200 p-4">
                    <h4 className="font-bold text-[#14532d] mb-3">Question {index + 1}</h4>
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
                      {editExerciseType !== 'question_response' && (
                        <input
                          type="text"
                          value={question.optionD}
                          onChange={(e) => updateEditExerciseQuestion(index, 'optionD', e.target.value)}
                          placeholder={editExerciseType === 'conversation' ? 'Answer D (bắt buộc)' : 'Answer D (optional)'}
                          className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#14532d]"
                        />
                      )}
                      <select
                        value={question.correctOption}
                        onChange={(e) => updateEditExerciseQuestion(index, 'correctOption', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#14532d]"
                      >
                        <option value="A">Correct answer: A</option>
                        <option value="B">Correct answer: B</option>
                        <option value="C">Correct answer: C</option>
                        {editExerciseType !== 'question_response' && (
                          <option value="D">Correct answer: D</option>
                        )}
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
                  Cancel
                </button>
                {editingExercise.isDraft && (
                  <button
                    onClick={() => saveEditedExercise(true)}
                    disabled={savingExerciseId === editingExercise.id}
                    className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 disabled:opacity-50"
                  >
                    {savingExerciseId === editingExercise.id ? 'Publishing...' : 'Publish'}
                  </button>
                )}
                <button
                  onClick={() => saveEditedExercise(false)}
                  disabled={savingExerciseId === editingExercise.id}
                  className="px-4 py-2 bg-[#14532d] text-white rounded hover:bg-[#166534] disabled:opacity-50"
                >
                  {savingExerciseId === editingExercise.id ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </div>
          </div>
        )}

        {selectedExerciseResult && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="rounded border border-[#14532d]/40 bg-white shadow-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Exercise submission: {selectedExerciseResult.exerciseTitle}</h3>
                  <p className="text-sm text-gray-600">{selectedExerciseResult.user.name || selectedExerciseResult.user.email} - {selectedExerciseResult.courseTitle}</p>
                  <p className="mt-1 text-sm font-semibold text-[#14532d]">Score: {selectedExerciseResult.score}/{selectedExerciseResult.totalQuestions}</p>
                  <p className="mt-1 text-sm text-gray-600">Time spent: {formatDuration(selectedExerciseResult.durationSeconds)}</p>
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
                        Student selected: {answer.selectedOption}
                      </div>
                      <div className="rounded-lg bg-gray-100 px-4 py-3 text-sm text-gray-700">
                        Correct answer: {answer.question.correctOption}
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
            <div className="rounded border border-[#14532d]/40 bg-white shadow-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Unpublish course</h3>
              <p className="text-gray-700 mb-6">
                Are you sure you want to unpublish <strong>{confirmUnpublish.title}</strong>? Students will no longer see this course publicly.
              </p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setConfirmUnpublish(null)}
                  disabled={savingCourseId === confirmUnpublish.id}
                  className="px-4 py-2 bg-gray-300 text-gray-900 rounded hover:bg-gray-400 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => unpublishCourse(confirmUnpublish.id, confirmUnpublish.title)}
                  disabled={savingCourseId === confirmUnpublish.id}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                >
                  {savingCourseId === confirmUnpublish.id ? 'Processing...' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Enrollments Management Section */}
        <div className={`mt-12 bg-white rounded shadow p-6 ${activeSection === 'course' ? '' : 'hidden'}`}>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            <span className="text-amber-600">Course</span> enrollments
          </h2>

          <div className="flex items-center gap-4 mb-5">
            <input
              type="text"
              placeholder="Search by student, email, phone, course, status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#14532d]"
            />
            <button
              onClick={fetchEnrollments}
              className="px-4 py-2 bg-[#14532d] text-white rounded hover:bg-[#166534]"
            >
              Refresh
            </button>
          </div>
          
          {groupedFilteredEnrollments.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 px-4 py-8 text-center text-gray-500">
              {enrollments.length === 0 ? 'No enrollments yet' : 'No enrollments match the current search'}
            </div>
          ) : (
            <div className="space-y-5">
              {groupedFilteredEnrollments.map((group) => (
                <section key={group.courseTitle} className="overflow-hidden rounded-lg border border-[#14532d]/20">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#14532d]/20 bg-[#14532d]/5 px-4 py-3">
                    <h3 className="text-base font-bold text-[#14532d]">{group.courseTitle}</h3>
                    <div className="flex items-center gap-2 text-xs font-semibold">
                      <span className="rounded-full bg-white px-2.5 py-1 text-slate-600 ring-1 ring-slate-200">
                        {group.items.length} students
                      </span>
                      {group.pendingCount > 0 && (
                        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-amber-800">
                          {group.pendingCount} awaiting payment
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registered</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.items.map((enrollment) => (
                          <tr key={enrollment.id} className="border-b hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900">{enrollment.user.name || enrollment.user.email}</td>
                            <td className="px-4 py-3 text-sm text-gray-700">{enrollment.user.phone || 'Not updated'}</td>
                            <td className="px-4 py-3 text-sm text-gray-500">{enrollment.user.email}</td>
                            <td className="px-4 py-3 text-sm">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                enrollment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-[#14532d]/10 text-[#14532d]'
                              }`}>
                                {enrollment.status === 'pending' ? 'Awaiting payment' : 'Payment received'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">
                              {new Date(enrollment.createdAt).toLocaleDateString('vi-VN')}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <div className="flex flex-wrap gap-2">
                                <Link
                                  href={`/admin/student/${enrollment.user.id}`}
                                  className="text-[#14532d] hover:text-[#14532d] hover:underline"
                                >
                                  Details
                                </Link>
                                <button
                                  onClick={() => setDeleteConfirm({ id: enrollment.user.id, name: enrollment.user.name || enrollment.user.email })}
                                  disabled={deletingUserId === enrollment.user.id}
                                  className="text-red-600 hover:text-red-800 hover:underline disabled:opacity-50"
                                >
                                  {deletingUserId === enrollment.user.id ? 'Deleting...' : 'Delete'}
                                </button>
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
                                    {updatingEnrollmentId === enrollment.id ? 'Updating...' : 'Confirm'}
                                  </button>
                                )}
                                <button
                                  onClick={() => rejectUser(enrollment.user.id, enrollment.user.name || enrollment.user.email)}
                                  disabled={rejectingUserId === enrollment.user.id}
                                  className="text-red-600 hover:text-red-800 hover:underline disabled:opacity-50"
                                >
                                  {rejectingUserId === enrollment.user.id ? 'Processing...' : 'Reject student'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>

        {confirmPayment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="rounded border border-[#14532d]/40 bg-white shadow-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Confirm payment</h3>
              <p className="text-gray-700 mb-2">
                Student: <strong>{confirmPayment.studentName}</strong>
              </p>
              <p className="text-gray-700 mb-4">
                Course: <strong>{confirmPayment.courseTitle}</strong>
              </p>
              <p className="text-gray-800 mb-6">Have you received the payment?</p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setConfirmPayment(null)}
                  disabled={updatingEnrollmentId === confirmPayment.id}
                  className="px-4 py-2 bg-gray-300 text-gray-900 rounded hover:bg-gray-400 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => confirmBankTransfer(confirmPayment.id)}
                  disabled={updatingEnrollmentId === confirmPayment.id}
                  className="px-4 py-2 bg-amber-500 text-white rounded hover:bg-amber-600 disabled:opacity-50"
                >
                  {updatingEnrollmentId === confirmPayment.id ? 'Processing...' : 'OK'}
                </button>
              </div>
            </div>
          </div>
        )}

        {quickCopyExercise && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
              <div className="flex items-center justify-between border-b px-6 py-4">
                <h3 className="text-base font-bold text-gray-900">Copy exercise sang khóa học khác</h3>
                <button
                  type="button"
                  onClick={() => setQuickCopyExercise(null)}
                  className="text-gray-400 hover:text-gray-600 text-xl leading-none"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-4 px-6 py-5">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Exercise đang được copy</p>
                  <p className="font-semibold text-gray-900 text-sm">{getExerciseTitle(quickCopyExercise)}</p>
                  <p className="text-xs text-gray-400">{quickCopyExercise.course.title} · {getExerciseTypeLabel(quickCopyExercise.exerciseType)}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Chọn khóa học đích</label>
                  <select
                    value={quickCopyTargetCourseId}
                    onChange={(e) => { setQuickCopyTargetCourseId(e.target.value); setQuickCopyError('') }}
                    className="rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#14532d]"
                  >
                    <option value="">-- Chọn khóa học --</option>
                    {courses
                      .filter((c) => c.id !== quickCopyExercise.courseId)
                      .map((c) => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                      ))}
                  </select>
                </div>
                {quickCopyError && <p className="text-sm text-red-600">{quickCopyError}</p>}
              </div>
              <div className="flex justify-end gap-3 border-t px-6 py-4">
                <button
                  type="button"
                  onClick={() => setQuickCopyExercise(null)}
                  className="rounded px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={() => void quickCopyToTarget()}
                  disabled={quickCopyLoading}
                  className="rounded bg-[#14532d] px-5 py-2 text-sm font-medium text-white hover:bg-[#166534] disabled:opacity-50"
                >
                  {quickCopyLoading ? 'Đang copy...' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        )}

        {showImportExerciseModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-2xl rounded-lg bg-white shadow-xl">
              <div className="flex items-center justify-between border-b px-6 py-4">
                <h3 className="text-lg font-bold text-gray-900">Import exercise từ khóa học khác</h3>
                <button
                  type="button"
                  onClick={() => setShowImportExerciseModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-xl leading-none"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-5 px-6 py-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">Khóa học nguồn</label>
                    <select
                      value={importSourceCourseId}
                      onChange={(e) => {
                        setImportSourceCourseId(e.target.value)
                        setImportSelectedExerciseIds(new Set())
                        setImportFromCourseError('')
                      }}
                      className="rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#14532d]"
                    >
                      <option value="">-- Chọn khóa học --</option>
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">Khóa học đích</label>
                    <select
                      value={importTargetCourseId}
                      onChange={(e) => {
                        setImportTargetCourseId(e.target.value)
                        setImportFromCourseError('')
                      }}
                      className="rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#14532d]"
                    >
                      <option value="">-- Chọn khóa học --</option>
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {importSourceCourseId && (
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">Chọn exercise để import</label>
                      <button
                        type="button"
                        className="text-xs text-[#14532d] hover:underline"
                        onClick={() => {
                          const ids = exercises
                            .filter((ex) => ex.courseId === importSourceCourseId)
                            .map((ex) => ex.id)
                          setImportSelectedExerciseIds(new Set(ids))
                        }}
                      >
                        Chọn tất cả
                      </button>
                    </div>
                    <div className="max-h-56 overflow-y-auto rounded border border-gray-200 divide-y">
                      {exercises
                        .filter((ex) => ex.courseId === importSourceCourseId)
                        .map((ex) => (
                          <label key={ex.id} className="flex cursor-pointer items-center gap-3 px-4 py-2.5 hover:bg-gray-50">
                            <input
                              type="checkbox"
                              checked={importSelectedExerciseIds.has(ex.id)}
                              onChange={(e) => {
                                setImportSelectedExerciseIds((prev) => {
                                  const next = new Set(prev)
                                  if (e.target.checked) next.add(ex.id)
                                  else next.delete(ex.id)
                                  return next
                                })
                              }}
                              className="h-4 w-4 accent-[#14532d]"
                            />
                            <span className="flex-1 text-sm text-gray-800">{getExerciseTitle(ex)}</span>
                            <span className="text-xs text-gray-400">{getExerciseTypeLabel(ex.exerciseType)}</span>
                          </label>
                        ))}
                      {exercises.filter((ex) => ex.courseId === importSourceCourseId).length === 0 && (
                        <p className="px-4 py-3 text-sm text-gray-500">Không có exercise nào trong khóa học này</p>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Đã chọn {importSelectedExerciseIds.size} exercise</p>
                  </div>
                )}

                {importFromCourseError && (
                  <p className="text-sm text-red-600">{importFromCourseError}</p>
                )}
              </div>

              <div className="flex justify-end gap-3 border-t px-6 py-4">
                <button
                  type="button"
                  onClick={() => setShowImportExerciseModal(false)}
                  className="rounded px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={() => void importFromCourse()}
                  disabled={importingFromCourse}
                  className="rounded bg-[#14532d] px-5 py-2 text-sm font-medium text-white hover:bg-[#166534] disabled:opacity-50"
                >
                  {importingFromCourse ? 'Đang import...' : `Import ${importSelectedExerciseIds.size > 0 ? `(${importSelectedExerciseIds.size})` : ''}`}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

