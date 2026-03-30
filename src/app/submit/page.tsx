'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface HomeworkItem {
  id: string
  title: string
  description: string | null
  dueDate: string
  submitted: boolean
}

export default function Submit() {
  const { data: session } = useSession()
  const [homeworks, setHomeworks] = useState<HomeworkItem[]>([])
  const [selectedHomeworkId, setSelectedHomeworkId] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (!session) {
      router.push('/login')
      return
    }

    const fetchHomework = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/member/homework-summary')
        if (!res.ok) {
          setError('Không thể tải danh sách bài tập')
          return
        }
        const data = await res.json()
        const pending = (data.allHomework || []).filter((item: HomeworkItem) => !item.submitted)
        setHomeworks(pending)
        if (pending.length > 0) {
          setSelectedHomeworkId(pending[0].id)
        } else {
          setSelectedHomeworkId('')
        }
      } catch {
        setError('Không thể tải danh sách bài tập')
      } finally {
        setLoading(false)
      }
    }

    fetchHomework()
  }, [session, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedHomeworkId) {
      setError('Vui lòng chọn bài tập')
      return
    }

    const res = await fetch('/api/assignments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ homeworkId: selectedHomeworkId, description })
    })
    if (res.ok) {
      setSuccess('Assignment submitted successfully!')
      setError('')
      setDescription('')
      const remaining = homeworks.filter((item) => item.id !== selectedHomeworkId)
      setHomeworks(remaining)
      setSelectedHomeworkId(remaining[0]?.id || '')
    } else {
      const data = await res.json()
      setSuccess('')
      setError(data.error)
    }
  }

  if (!session) return null

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Đang tải...</div>
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4">Submit Assignment</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {success && <p className="text-[#14532d] mb-4">{success}</p>}
        {homeworks.length === 0 ? (
          <p className="text-[#14532d] mb-4">Tốt lắm, bạn đã hoàn thành tất cả bài tập của mình rồi.</p>
        ) : (
          <select
            value={selectedHomeworkId}
            onChange={(e) => setSelectedHomeworkId(e.target.value)}
            className="w-full p-2 mb-4 border rounded"
            required
          >
            {homeworks.map((homework) => (
              <option key={homework.id} value={homework.id}>
                {homework.title} - Hạn nộp {new Date(homework.dueDate).toLocaleDateString('vi-VN')}
              </option>
            ))}
          </select>
        )}
        <textarea
          placeholder="Ghi chú bài nộp"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
          rows={4}
        />
        <button type="submit" disabled={homeworks.length === 0} className="w-full bg-[#14532d] text-white p-2 rounded disabled:opacity-50">
          Submit
        </button>
      </form>
    </div>
  )
}
