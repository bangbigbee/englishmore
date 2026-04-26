'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

export default function AdminFloatingNoti() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isActive, setIsActive] = useState(true)
  const [title, setTitle] = useState('Thông báo nhỏ')
  const [message, setMessage] = useState('Hello hello! Hiện tại ToeicMore đang cập nhật các bộ đề thi và nâng cấp bài giảng. Rất mong được đồng hành cùng bạn trong thời gian đến. Chúc bạn học thật tốt nhé!')

  useEffect(() => {
    fetch('/api/admin/settings?key=FLOATING_NOTI_SETTING')
      .then(res => res.json())
      .then(data => {
        if (data && data.value) {
          if (typeof data.value.isActive === 'boolean') setIsActive(data.value.isActive)
          if (data.value.title) setTitle(data.value.title)
          if (data.value.message) setMessage(data.value.message)
        }
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'FLOATING_NOTI_SETTING',
          value: { isActive, title, message }
        })
      })

      if (!res.ok) throw new Error('Failed to save')
      toast.success('Đã lưu cấu hình Floating Noti')
    } catch (e) {
      toast.error('Có lỗi xảy ra khi lưu')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-8 text-center text-slate-500">Đang tải...</div>

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-sm border border-slate-200">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Cấu hình Floating Noti</h2>
          <p className="text-sm text-slate-500 mt-1">
            Điều chỉnh nội dung popup thông báo ở góc dưới màn hình.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-primary-900 hover:bg-primary-900/90 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-sm disabled:opacity-50"
        >
          {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
      </div>

      <div className="p-6 max-w-2xl space-y-6">
        <div>
          <label className="flex items-center gap-3 cursor-pointer p-4 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors">
            <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
              <input 
                type="checkbox" 
                name="toggle" 
                id="toggle" 
                className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer border-slate-300 transform transition-transform duration-300 ease-in-out" 
                style={{ 
                  transform: isActive ? 'translateX(100%)' : 'translateX(0)',
                  borderColor: isActive ? '#10B981' : '#CBD5E1', 
                  backgroundColor: 'white' 
                }}
                checked={isActive} 
                onChange={(e) => setIsActive(e.target.checked)} 
              />
              <label 
                htmlFor="toggle" 
                className="toggle-label block overflow-hidden h-6 rounded-full bg-slate-300 cursor-pointer transition-colors duration-300 ease-in-out" 
                style={{ backgroundColor: isActive ? '#10B981' : '#CBD5E1' }}
              ></label>
            </div>
            <div>
              <div className="font-bold text-slate-800">Trạng thái</div>
              <div className="text-sm text-slate-500">{isActive ? 'Đang hiển thị trên website' : 'Đang TẮT (ẩn)'}</div>
            </div>
          </label>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Tiêu đề (Title)</label>
          <input
            type="text"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-[14px] text-slate-800 outline-none focus:border-primary-900"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="VD: Thông báo nhỏ"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Lời nhắn (Message)</label>
          <textarea
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-[14px] text-slate-800 outline-none focus:border-primary-900 min-h-[120px]"
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Nội dung sẽ chạy animation gõ chữ..."
          />
        </div>
      </div>
    </motion.div>
  )
}
