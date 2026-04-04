'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import LinkifiedText from '@/components/LinkifiedText'

interface Course {
  id: string
  title: string
  description?: string
  price?: number
  currency?: string
  isActive?: boolean
  registrationDeadline: string
  enrolledCount: number
  maxStudents: number
  successfulCount: number
  pendingCount: number
}

interface Enrollment {
  id: string
  courseId: string
  status: string
  referenceCode?: string | null
  userId?: string
  course?: {
    title?: string
    price?: number
  }
  createdAt: string
}

interface PaymentInstruction {
  bankName: string
  accountNumber: string
  accountName: string
  amount: number
  transferContent: string
}

interface PendingReferralCourse {
  id: string
  title: string
}

const COURSE_DETAIL_SECTIONS = [
  {
    title: '1. Khóa học này dành cho ai?',
    points: [
      'Sinh viên, người đi làm đã học tiếng Anh nhiều lần nhưng chưa tự tin khi giao tiếp.',
      'Những bạn muốn nâng cao khả năng phát âm, thực hành các tình huống thực tế để sử dụng trong giao tiếp, công việc.'
    ]
  },
  {
    title: '2. Khóa học có gì đặc biệt?',
    points: [
      'Học viên sẽ được rèn luyện phát âm đúng ngay từ đầu để tự tin nghe và nói về sau.',
      'Chương trình học không nặng ngữ pháp, tập trung vào giao tiếp nghe - nói hiệu quả, giúp bạn áp dụng ngay vào công việc và cuộc sống. Ngữ pháp sẽ được bổ túc và hoàn thiện song song trong và sau quá trình học.',
      'Môi trường rèn luyện liên tục: bên cạnh giờ học trên lớp, bạn sẽ được luyện tập thêm 1-1 với giáo viên để duy trì động lực và đảm bảo đầu ra khóa học.',
      'Bên cạnh ngôn ngữ, bạn còn học được kỹ năng giao tiếp, tư duy phát triển bản thân và những kinh nghiệm, trải nghiệm trong nhiều lĩnh vực khác.'
    ]
  },
  {
    title: '3. Ai là người giảng dạy?',
    points: [
      'Thầy Nguyễn Trí Bằng, 7 năm công tác tại Đại học Bách Khoa - ĐH Đà Nẵng trong lĩnh vực khoa học kỹ thuật, làm việc với 03 chương trình đào tạo quốc tế (02 chương trình tiên tiến Việt - Mỹ, chương trình đào tạo Kỹ sư Chất lượng Cao Việt Pháp).',
      '5 năm kinh nghiệm dạy tiếng Anh.',
      '2 năm kinh nghiệm trong lĩnh vực công nghệ Blockchain.',
      'Nhiều năm kinh nghiệm làm việc trong môi trường quốc tế, tham gia các hội nghị và sự kiện tại Singapore, Hàn Quốc, giúp mang đến góc nhìn và trải nghiệm thực tế cho học viên.'
    ]
  },
  {
    title: '4. Lịch học và thời lượng như thế nào?',
    points: [
      'Học trực tuyến qua Zoom, linh hoạt thời gian mà vẫn đảm bảo tương tác như lớp học trực tiếp.',
      '02 phiên/tuần, 02 giờ/phiên.',
      'Thời lượng: 25-30 phiên.',
      'Lịch học dự kiến: Thứ Hai + Thứ Năm, 19:30 - 21:30 (sẽ thống nhất lại vào buổi học đầu tiên).'
    ]
  },
  {
    title: '6. Tôi chưa từng học tiếng Anh bài bản, có theo kịp không?',
    points: [
      'Hoàn toàn có thể. Khóa học được thiết kế cho cả người mới bắt đầu nên bạn sẽ được hướng dẫn từng bước một.',
      'Mỗi học viên đều được hỗ trợ thực hành, sửa lỗi 1-1 để tiến bộ nhanh nhất.'
    ]
  },
  {
    title: '7. Sau khi hoàn thành khóa học này, tôi có thể đạt được những kỹ năng gì?',
    points: [
      'Phát âm chuẩn.',
      'Tự tin sử dụng tiếng Anh để đọc hiểu tài liệu và giao tiếp cơ bản khi làm việc, phỏng vấn, du lịch nước ngoài, gặp gỡ đối tác quốc tế.',
      'Biết giới thiệu bản thân, thuyết trình các bài phát biểu ngắn, giao tiếp các tình huống thường ngày khi đi công tác, trên máy bay, nghỉ dưỡng...',
      'Biết được phương pháp học tiếng Anh phù hợp với bản thân để tiếp tục rèn luyện trong tương lai.'
    ]
  },
  {
    title: '8. Tôi có thể đăng ký và bắt đầu học như thế nào?',
    points: [
      'Tham gia khóa học bằng cách điền thông tin vào mẫu bên dưới.',
      'Sau khi đăng ký, bạn sẽ được hướng dẫn tham gia lớp và các thông tin liên quan.'
    ]
  },
  {
    title: '9. Tôi cần chuẩn bị gì khi tham gia khóa học?',
    points: [
      'Laptop, máy tính cá nhân có microphone, camera.',
      'Internet ổn định.',
      'Bút, sổ tay ghi chép.',
      'Kênh Youtube để đăng bài tập.'
    ]
  }
] as const

export default function CoursesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [errorModal, setErrorModal] = useState<string | null>(null)
  const [registering, setRegistering] = useState<string | null>(null)
  const [paymentInstruction, setPaymentInstruction] = useState<PaymentInstruction | null>(null)
  const [pendingReferralCourse, setPendingReferralCourse] = useState<PendingReferralCourse | null>(null)
  const [referrerInput, setReferrerInput] = useState('')
  const [selectedCourseId, setSelectedCourseId] = useState<string>('')
  const [hoveredCourseId, setHoveredCourseId] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      if (session?.user?.role === 'admin') {
        router.push('/admin')
        return
      }
      fetchCourses()
      fetchEnrollments()
    }
  }, [status, router, session?.user?.role])

  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error])

  useEffect(() => {
    if (errorModal) {
      toast.error(errorModal)
      setErrorModal(null)
    }
  }, [errorModal])

  useEffect(() => {
    if (courses.length === 0) {
      setSelectedCourseId('')
      return
    }

    if (!selectedCourseId || !courses.some((course) => course.id === selectedCourseId)) {
      setSelectedCourseId(courses[0].id)
    }
  }, [courses, selectedCourseId])

  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/courses')
      if (!res.ok) throw new Error('Failed to fetch courses')
      const data = await res.json()
      setCourses(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const fetchEnrollments = async () => {
    try {
      const res = await fetch('/api/user/enrollments')
      if (!res.ok) return
      const data = await res.json()
      setEnrollments(data)
    } catch (err) {
      console.error(err)
    }
  }

  const registerCourse = async (courseId: string, referrer?: string) => {
    try {
      setRegistering(courseId)
      const res = await fetch(`/api/courses/${courseId}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ referrer: referrer || '' })
      })
      const data = await res.json()
      if (!res.ok) {
        setErrorModal(data.error || 'Failed to register')
        setPendingReferralCourse(null)
      } else {
        setError('')
        setErrorModal(null)
        toast.success('Đăng ký thành công. Vui lòng chuyển khoản theo hướng dẫn để được xác nhận.')
        setPaymentInstruction(data.paymentInstruction || null)
        setPendingReferralCourse(null)
        setReferrerInput('')
        fetchEnrollments()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setRegistering(null)
    }
  }

  const getEnrollmentStatus = (courseId: string) => {
    const enrollment = enrollments.find(e => e.courseId === courseId)
    return enrollment
  }

  // Check if user has any active enrollment (not counting dropped)
  const hasExistingEnrollment = enrollments.some(e => {
    return ['pending', 'active', 'completed', 'suspended'].includes(e.status)
  })

  const getQrUrl = (instruction: PaymentInstruction) =>
    `https://img.vietqr.io/image/TCB-${instruction.accountNumber}-compact2.png` +
    `?amount=${instruction.amount}&addInfo=${encodeURIComponent(instruction.transferContent)}` +
    `&accountName=${encodeURIComponent(instruction.accountName)}`

  const getCourseTuition = (course?: Course) => {
    if (typeof course?.price === 'number' && course.price > 0) {
      return course.price
    }

    const matchedEnrollment = course ? enrollments.find((item) => item.courseId === course.id) : undefined
    if (typeof matchedEnrollment?.course?.price === 'number' && matchedEnrollment.course.price > 0) {
      return matchedEnrollment.course.price
    }

    return 4200000
  }

  const formatVnd = (amount: number) => `${amount.toLocaleString('vi-VN')} VND`

  const buildInstructionFromEnrollment = (course?: Course): PaymentInstruction => {
    return {
      bankName: 'Techcombank',
      accountNumber: '19033113602011',
      accountName: 'Nguyen Tri Bang',
      amount: getCourseTuition(course),
      transferContent: 'Your Full Name - Phone Number'
    }
  }

  const openPaymentInfo = (course?: Course) => {
    setPaymentInstruction(buildInstructionFromEnrollment(course))
  }

  const handleOpenReferral = (course: Course) => {
    setPendingReferralCourse({ id: course.id, title: course.title })
    setReferrerInput('')
    setErrorModal(null)
  }

  const getAvailabilityText = (course: Course) => (course.enrolledCount >= course.maxStudents ? 'Đã đầy chỗ' : 'Vẫn còn chỗ')

  const activeCourseId = hoveredCourseId || selectedCourseId
  const selectedCourse = courses.find((course) => course.id === activeCourseId) || null

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Available Courses</h1>
          <p className="mt-2 text-xs sm:text-sm text-gray-600">Choose the course you want to join.</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] lg:overflow-y-auto lg:pr-1">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#14532d]">Danh sách khóa học</h2>
              <span className="text-xs text-slate-500">{courses.length} khóa</span>
            </div>

            {loading ? (
              <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500">Đang tải danh sách khóa học...</div>
            ) : courses.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500">Chưa có khóa học đang mở.</div>
            ) : (
              <div className={`space-y-4 ${hoveredCourseId ? 'course-list-has-hover' : ''}`} onMouseLeave={() => setHoveredCourseId(null)}>
                {courses.map((course) => {
                  const isSelected = activeCourseId === course.id
                  const isMuted = Boolean(hoveredCourseId) && hoveredCourseId !== course.id
                  const isHovered = hoveredCourseId === course.id
                  return (
                    <article
                      key={course.id}
                      onMouseEnter={() => setHoveredCourseId(course.id)}
                      className={`course-select-card ${isSelected ? 'is-active' : ''} ${isMuted ? 'is-muted' : ''} ${isHovered ? 'is-hovered-right' : ''}`}
                    >
                      <div className="course-select-card-inner">
                        <p className="text-sm font-bold text-[#14532d]">{course.title}</p>
                        <p className="mt-2 text-xs text-slate-600">
                          Hạn đăng ký: {new Date(course.registrationDeadline).toLocaleDateString('vi-VN')}
                        </p>
                        <p className={`mt-1 text-xs font-semibold ${course.enrolledCount >= course.maxStudents ? 'text-red-600' : 'text-emerald-600'}`}>{getAvailabilityText(course)}</p>
                        <button
                          type="button"
                          onClick={() => setSelectedCourseId(course.id)}
                          className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-orange-600 hover:text-orange-700"
                        >
                          {isSelected ? 'Đang xem' : 'Xem thêm'}
                          <span aria-hidden="true">→</span>
                        </button>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </aside>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            {!selectedCourse ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
                Chọn một khóa học ở cột bên trái để xem thông tin chi tiết.
              </div>
            ) : (
              (() => {
                const enrollment = getEnrollmentStatus(selectedCourse.id)
                const isFull = selectedCourse.enrolledCount >= selectedCourse.maxStudents
                const blockedByExistingEnrollment = !enrollment && hasExistingEnrollment
                const tuition = getCourseTuition(selectedCourse)
                const courseCurrency = selectedCourse.currency || 'VND'

                return (
                  <div>
                    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-4">
                      <div>
                        <h2 className="text-2xl font-bold text-[#14532d]">{selectedCourse.title}</h2>
                        <p className="mt-2 text-sm text-slate-600">
                          <LinkifiedText text={selectedCourse.description || 'Khóa học giao tiếp thực hành, tối ưu cho người cần dùng tiếng Anh trong học tập và công việc.'} />
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleOpenReferral(selectedCourse)}
                        disabled={registering === selectedCourse.id || selectedCourse.enrolledCount >= selectedCourse.maxStudents || (!getEnrollmentStatus(selectedCourse.id) && hasExistingEnrollment)}
                        className="rounded-full border border-orange-200 px-4 py-2 text-sm font-semibold text-orange-700 hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {registering === selectedCourse.id ? 'Đang đăng ký...' : 'Đăng Ký Ngay'}
                      </button>
                    </div>

                    <div className="mt-5 rounded-xl border border-[#14532d]/20 bg-[#14532d]/5 p-4">
                      <p className="text-sm text-slate-700">
                        <strong>Hạn đăng ký:</strong> {new Date(selectedCourse.registrationDeadline).toLocaleDateString('vi-VN')}
                      </p>
                      <p className={`mt-1 text-sm font-semibold ${selectedCourse.enrolledCount >= selectedCourse.maxStudents ? 'text-red-700' : 'text-emerald-700'}`}>
                        {getAvailabilityText(selectedCourse)}
                      </p>
                    </div>

                    <div className="mt-5 space-y-5 text-slate-700">
                      {COURSE_DETAIL_SECTIONS.slice(0, 4).map((section) => (
                        <div key={section.title}>
                          <h3 className="text-lg font-semibold text-[#14532d]">{section.title}</h3>
                          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm">
                            {section.points.map((point) => (
                              <li key={point}>{point}</li>
                            ))}
                          </ul>
                        </div>
                      ))}

                      <div>
                        <h3 className="text-lg font-semibold text-[#14532d]">5. Học phí</h3>
                        <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm">
                          <li>Toàn bộ khóa học: {courseCurrency === 'VND' ? formatVnd(tuition) : `${tuition.toLocaleString('vi-VN')} ${courseCurrency}`}</li>
                          <li>Có ưu đãi học phí 10% nếu đăng ký nhóm từ 2 bạn trở lên.</li>
                          <li>Sau phiên học thứ 3, nếu cảm thấy phù hợp với khóa học: chuyển học phí về số tài khoản 19033113602011 - Techcombank - Nguyen Tri Bang.</li>
                        </ul>
                      </div>

                      {COURSE_DETAIL_SECTIONS.slice(4).map((section) => (
                        <div key={section.title}>
                          <h3 className="text-lg font-semibold text-[#14532d]">{section.title}</h3>
                          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm">
                            {section.points.map((point) => (
                              <li key={point}>{point}</li>
                            ))}
                          </ul>
                        </div>
                      ))}

                      <p className="text-sm text-slate-600">
                        Mọi thông tin thêm, vui lòng liên hệ Mr. Nguyễn Trí Bằng qua số điện thoại 0915091093. Hoặc nhắn tin về Facebook:
                        <a href="https://www.facebook.com/bangbigbee" target="_blank" rel="noreferrer" className="ml-1 text-amber-700 hover:underline">https://www.facebook.com/bangbigbee</a>
                      </p>
                    </div>

                    <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
                      {isFull ? (
                        <div className="rounded border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">Khóa học này đã đủ số lượng học viên.</div>
                      ) : enrollment ? (
                        <div className="rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                          {enrollment.status === 'pending' ? (
                            <p>Đang chờ xác nhận vào lớp <strong>&quot;{enrollment.course?.title}&quot;</strong>.</p>
                          ) : (
                            <p><strong>Trạng thái:</strong> Đăng ký thành công.</p>
                          )}
                          <button
                            onClick={() => openPaymentInfo(selectedCourse)}
                            className="mt-3 inline-block rounded border border-[#14532d]/30 bg-white px-3 py-1.5 text-xs text-[#14532d] hover:bg-[#14532d]/10"
                          >
                            Xem thông tin chuyển khoản
                          </button>
                        </div>
                      ) : blockedByExistingEnrollment ? (
                        <div className="rounded border border-gray-200 bg-gray-50 p-3 text-sm text-gray-600">
                          Bạn đã có khóa học đang xử lý. Vui lòng chờ xác nhận trước khi đăng ký thêm.
                        </div>
                      ) : (
                        <button
                          onClick={() => handleOpenReferral(selectedCourse)}
                          disabled={registering === selectedCourse.id}
                          className="w-full rounded bg-[#14532d] px-4 py-3 font-semibold text-white hover:bg-[#166534] disabled:opacity-50"
                        >
                          {registering === selectedCourse.id ? 'Đang đăng ký...' : 'Đăng Ký Ngay'}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })()
            )}
          </section>
        </div>

        {paymentInstruction && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="rounded-lg border border-[#14532d]/40 bg-white shadow-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-[#14532d]">Payment Details</h3>
                <button
                  onClick={() => setPaymentInstruction(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none"
                >
                  ×
                </button>
              </div>

              <p className="text-green-700 bg-green-50 border border-green-200 rounded p-3 text-sm mb-4">
                Please use the exact transfer message below so the admin can confirm your payment.
              </p>

              <div className="flex justify-center mb-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getQrUrl(paymentInstruction)}
                  alt="Bank transfer QR code"
                  className="w-56 h-56 rounded border border-gray-200"
                />
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-600">Bank:</span>
                  <span className="font-semibold">{paymentInstruction.bankName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-600">Account number:</span>
                  <span className="font-mono font-semibold">{paymentInstruction.accountNumber}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-600">Account name:</span>
                  <span className="font-semibold">{paymentInstruction.accountName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-semibold text-red-600">{paymentInstruction.amount.toLocaleString('vi-VN')} VND</span>
                </div>
                <div className="py-2">
                  <p className="text-gray-600 mb-1">Transfer message:</p>
                  <div className="rounded border-2 border-[#14532d] bg-green-50 p-3 text-center">
                    <span className="font-mono text-sm font-normal tracking-wider text-[#14532d]">
                      <LinkifiedText text={paymentInstruction.transferContent} preserveLineBreaks={false} linkClassName="break-all font-medium text-[#14532d] underline underline-offset-2 hover:text-[#166534]" />
                    </span>
                  </div>
                  <p className="text-sm text-[#14532d] font-semibold mt-1">Example: Nguyen Van A - 0934567890</p>
                </div>
              </div>

              <button
                onClick={() => setPaymentInstruction(null)}
                className="mt-4 w-full px-4 py-2 bg-[#14532d] text-white rounded hover:bg-[#166534]"
              >
                Got it, close
              </button>
            </div>
          </div>
        )}

        {pendingReferralCourse && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-lg border-2 border-orange-400 bg-white p-6 shadow-[0_18px_48px_rgba(234,88,12,0.22)]">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-orange-700">Ai đã giới thiệu khóa học này cho bạn?</h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPendingReferralCourse(null)
                    setReferrerInput('')
                  }}
                  className="text-2xl leading-none text-orange-300 hover:text-orange-600"
                >
                  ×
                </button>
              </div>

              <label className="block text-sm font-medium text-orange-700">Mã học viên hoặc email người giới thiệu</label>
              <input
                type="text"
                value={referrerInput}
                onChange={(event) => setReferrerInput(event.target.value)}
                placeholder="Không bắt buộc"
                className="mt-2 block w-full rounded-lg border border-orange-200 px-4 py-2 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              />
              <p className="mt-2 text-xs text-gray-500">Để trống nếu bạn không được ai giới thiệu.</p>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setPendingReferralCourse(null)
                    setReferrerInput('')
                  }}
                  className="rounded bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-300"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={() => registerCourse(pendingReferralCourse.id, referrerInput)}
                  disabled={registering === pendingReferralCourse.id}
                  className="rounded bg-[#14532d] px-4 py-2 text-sm font-medium text-white hover:bg-[#166534] disabled:opacity-50"
                >
                  {registering === pendingReferralCourse.id ? 'Đang đăng ký...' : 'Tiếp tục'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
