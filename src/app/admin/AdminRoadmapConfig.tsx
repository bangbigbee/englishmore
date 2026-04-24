'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { ROADMAP_TEMPLATES as DEFAULT_TEMPLATES } from '@/lib/roadmapGenerator'

export default function AdminRoadmapConfig() {
  const [templatesJson, setTemplatesJson] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings?key=toeic_roadmap_templates')
      if (res.ok) {
        const data = await res.json()
        if (data && data.value) {
          setTemplatesJson(JSON.stringify(data.value, null, 2))
        } else {
          // fallback to default
          setTemplatesJson(JSON.stringify(DEFAULT_TEMPLATES, null, 2))
        }
      }
    } catch (err) {
      console.error(err)
      toast.error('Lỗi khi tải dữ liệu lộ trình')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    let parsedObj;
    try {
      parsedObj = JSON.parse(templatesJson)
    } catch (err) {
      toast.error('Định dạng JSON không hợp lệ! Vui lòng kiểm tra lại.')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'toeic_roadmap_templates',
          value: parsedObj,
          description: 'Cấu hình các chặng và nhiệm vụ cho tính năng Lộ Trình Độc Bản'
        })
      })

      if (res.ok) {
        toast.success('Lưu cấu hình thành công!')
      } else {
        toast.error('Lưu thất bại!')
      }
    } catch (err) {
      console.error(err)
      toast.error('Đã xảy ra lỗi khi lưu')
    } finally {
      setSaving(false)
    }
  }

  const formatJson = () => {
    try {
      const parsedObj = JSON.parse(templatesJson)
      setTemplatesJson(JSON.stringify(parsedObj, null, 2))
      toast.success('Đã format JSON')
    } catch (err) {
      toast.error('Định dạng JSON không hợp lệ! Vui lòng kiểm tra lại.')
    }
  }

  const loadDefaults = () => {
    if (confirm('Bạn có chắc muốn khôi phục lại cấu hình gốc? Các thay đổi chưa lưu sẽ bị mất.')) {
      setTemplatesJson(JSON.stringify(DEFAULT_TEMPLATES, null, 2))
      toast.success('Đã khôi phục cấu hình gốc')
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Đang tải cấu hình lộ trình...</div>
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Cấu Hình Lộ Trình TOEIC</h2>
          <p className="text-sm text-slate-500 mt-1">Chỉnh sửa JSON để tùy biến các mức độ, số tuần, và các nhiệm vụ trong Lộ trình Độc bản.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={loadDefaults}
            className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Mặc định
          </button>
          <button 
            onClick={formatJson}
            className="px-4 py-2 text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          >
            Format JSON
          </button>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-lg transition-colors shadow-sm"
          >
            {saving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
          </button>
        </div>
      </div>

      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono text-xs overflow-hidden h-[600px] flex flex-col">
        <textarea 
          value={templatesJson}
          onChange={e => setTemplatesJson(e.target.value)}
          className="w-full h-full bg-transparent border-none outline-none resize-none focus:ring-0 text-slate-700"
          spellCheck={false}
        />
      </div>

      <div className="bg-blue-50 text-blue-800 p-4 rounded-lg text-sm">
        <strong>Lưu ý:</strong>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Cấu trúc JSON cần phải chuẩn. Sử dụng dấu nháy kép <code>""</code> cho khóa (key) và chuỗi (string).</li>
          <li><code>taskType</code> nên là một trong: <code>GRAMMAR, VOCAB, LISTENING, READING, TEST, REVIEW</code>.</li>
          <li>Thay đổi này sẽ chỉ áp dụng cho <strong>các lộ trình được tạo mới</strong> sau này (khi học viên đăng ký hoặc làm lại bài kiểm tra). Học viên cũ sẽ giữ lộ trình cũ.</li>
        </ul>
      </div>
    </div>
  )
}
