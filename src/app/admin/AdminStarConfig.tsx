'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'

interface StarRule {
  id: string
  activityKey: string
  label: string
  toastMessage: string | null
  points: number
  isActive: boolean
}

export default function AdminStarConfig() {
  const [rules, setRules] = useState<StarRule[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRules()
  }, [])

  const fetchRules = async () => {
    try {
      const res = await fetch('/api/admin/toeic-stars')
      if (!res.ok) throw new Error('Failed to fetch rules')
      const data = await res.json()
      setRules(data)
    } catch (error) {
      toast.error('Lỗi khi tải danh sách Star')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (id: string, newPoints: number, newActive: boolean, newToastMessage: string) => {
    try {
      const res = await fetch('/api/admin/toeic-stars', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, points: newPoints, isActive: newActive, toastMessage: newToastMessage })
      })

      if (!res.ok) throw new Error('Failed to update')
      toast.success('Đã cập nhật cấu hình Star')
      fetchRules() // Refresh
    } catch (error) {
      toast.error('Cập nhật thất bại')
    }
  }

  if (loading) return <div className="p-8 text-center text-slate-500 font-medium">Đang tải...</div>

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="text-secondary-500">⭐</span>
            ToeicMore Star Config
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Cấu hình số điểm Star được thưởng cho học viên khi hoàn thành các hoạt động. (Lưu ý: Mặc định PRO/ULTRA sẽ được nhân hệ số 2x, 3x).
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Hoạt Động</th>
                <th className="px-6 py-4">Mã Key</th>
                <th className="px-6 py-4">Nội dung Toast</th>
                <th className="px-6 py-4">Số Star</th>
                <th className="px-6 py-4">Trạng Thái</th>
                <th className="px-6 py-4">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rules.map(rule => (
                <RuleRow key={rule.id} rule={rule} onSave={handleUpdate} />
              ))}
              {rules.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500 italic">
                    Chưa có cấu hình nào. Hãy truy cập website để trigger tạo tự động.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function RuleRow({ rule, onSave }: { rule: StarRule, onSave: (id: string, p: number, a: boolean, t: string) => void }) {
  const [points, setPoints] = useState(rule.points.toString())
  const [isActive, setIsActive] = useState(rule.isActive)
  const [toastMsg, setToastMsg] = useState(rule.toastMessage || '')
  const [isEditing, setIsEditing] = useState(false)

  const hasChanges = parseInt(points) !== rule.points || isActive !== rule.isActive || toastMsg !== (rule.toastMessage || '')

  const handleSave = () => {
    const parsed = parseInt(points)
    if (isNaN(parsed) || parsed < 0) {
      toast.error('Số sao không hợp lệ')
      return
    }
    if (!label.trim()) {
      toast.error('Nội dung không được để trống')
      return
    }
    onSave(rule.id, parsed, isActive, toastMsg)
    setIsEditing(false)
  }

  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="px-6 py-4 font-bold text-slate-800">
        {rule.label}
      </td>
      <td className="px-6 py-4 text-xs font-mono text-slate-400">
        {rule.activityKey}
      </td>
      <td className="px-6 py-4 text-sm text-slate-600">
        {isEditing ? (
          <input 
            type="text" 
            value={toastMsg}
            onChange={e => setToastMsg(e.target.value)}
            className="w-full min-w-[200px] px-2 py-1 text-sm font-normal border border-slate-300 rounded focus:border-secondary-500 focus:ring-1 focus:ring-secondary-500 outline-none"
            placeholder="Nội dung thông báo / Toast"
          />
        ) : (
          toastMsg || <span className="text-slate-300 italic">Mặc định ({rule.label})</span>
        )}
      </td>
      <td className="px-6 py-4">
        {isEditing ? (
          <input 
            type="number" 
            min="0"
            value={points}
            onChange={e => setPoints(e.target.value)}
            className="w-20 px-2 py-1 border border-slate-300 rounded focus:border-secondary-500 focus:ring-1 focus:ring-secondary-500 outline-none"
          />
        ) : (
          <span className="font-bold text-secondary-600 bg-secondary-50 px-2 py-1 rounded">
            {rule.points} ⭐
          </span>
        )}
      </td>
      <td className="px-6 py-4">
        {isEditing ? (
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              checked={isActive} 
              onChange={e => setIsActive(e.target.checked)}
              className="rounded text-secondary-600 focus:ring-secondary-500 w-4 h-4"
            />
            <span className={isActive ? 'text-primary-600 font-medium' : 'text-slate-400'}>
              {isActive ? 'Bật' : 'Tắt'}
            </span>
          </label>
        ) : (
          <span className={`inline-flex px-2 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${rule.isActive ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 text-slate-500'}`}>
            {rule.isActive ? 'Bật' : 'Tắt'}
          </span>
        )}
      </td>
      <td className="px-6 py-4">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <button 
              onClick={handleSave}
              disabled={!hasChanges}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${hasChanges ? 'bg-secondary-500 text-white hover:bg-secondary-600' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
            >
              Lưu
            </button>
            <button 
              onClick={() => {
                setPoints(rule.points.toString())
                setIsActive(rule.isActive)
                setToastMsg(rule.toastMessage || '')
                setIsEditing(false)
              }}
              className="px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-md transition-colors"
            >
              Hủy
            </button>
          </div>
        ) : (
          <button 
            onClick={() => setIsEditing(true)}
            className="text-primary-600 hover:text-primary-800 font-medium text-sm transition-colors"
          >
            Chỉnh sửa
          </button>
        )}
      </td>
    </tr>
  )
}
