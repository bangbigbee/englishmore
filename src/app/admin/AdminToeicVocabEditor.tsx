'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import TipTapEditor from '@/components/TipTapEditor'

interface AdminToeicVocabEditorProps {
  topic: string
  onClose: () => void
}

export default function AdminToeicVocabEditor({ topic, onClose }: AdminToeicVocabEditorProps) {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<any>({})
  const [saving, setSaving] = useState(false)

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/vocabulary?category=TOEIC`)
      if (res.ok) {
        const data = await res.json()
        const topicItems = (data.items || []).filter((i: any) => i.topic === topic)
        setItems(topicItems.sort((a: any, b: any) => a.displayOrder - b.displayOrder || new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()))
      }
    } catch {
      toast.error('Không thể tải dữ liệu từ vựng')
    } finally {
      setLoading(false)
    }
  }, [topic])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const startEdit = (item: any) => {
    setEditingId(item.id)
    setFormData({
      word: item.word || '',
      phonetic: item.phonetic || '',
      englishDefinition: item.englishDefinition || '',
      meaning: item.meaning || '',
      example: item.example || '',
      exampleVi: item.exampleVi || '',
      synonyms: item.synonyms || '',
      antonyms: item.antonyms || '',
      collocations: item.collocations || '',
      toeicTrap: item.toeicTrap || '',
      topic: item.topic || topic,
      displayOrder: item.displayOrder || 1
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setFormData({})
  }

  const handleUpdate = async () => {
    if (!formData.word || !formData.meaning) {
      toast.error('Word và Meaning là bắt buộc')
      return
    }

    setSaving(true)
    try {
      const res = await fetch(`/api/admin/vocabulary/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, category: 'TOEIC' })
      })
      if (res.ok) {
        toast.success('Đã cập nhật từ vựng!')
        setEditingId(null)
        fetchItems()
      } else {
        const d = await res.json()
        toast.error(d.error || 'Cập nhật thất bại')
      }
    } catch {
      toast.error('Lỗi khi cập nhật')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-[95vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-xl font-bold text-amber-900">Chỉnh sửa bộ từ vựng TOEIC</h2>
            <p className="text-sm text-slate-600 font-medium">Chủ đề: <span className="text-amber-700">{topic}</span></p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto bg-slate-50 flex-1">
          {loading ? (
            <div className="py-20 text-center text-slate-500">Đang tải...</div>
          ) : items.length === 0 ? (
            <div className="py-20 text-center text-slate-500 italic">Chưa có từ vựng nào trong chủ đề này.</div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {items.map(item => (
                <div key={item.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm transition-shadow hover:shadow-md">
                  {editingId === item.id ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Word *</label>
                          <input className="w-full border rounded p-2 text-sm focus:border-amber-500 focus:ring-amber-500" value={formData.word} onChange={e => setFormData({ ...formData, word: e.target.value })} />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Meaning *</label>
                          <input className="w-full border rounded p-2 text-sm focus:border-amber-500 focus:ring-amber-500" value={formData.meaning} onChange={e => setFormData({ ...formData, meaning: e.target.value })} />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Phonetic</label>
                          <input className="w-full border rounded p-2 text-sm focus:border-amber-500 focus:ring-amber-500" value={formData.phonetic} onChange={e => setFormData({ ...formData, phonetic: e.target.value })} />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">English Definition</label>
                          <input className="w-full border rounded p-2 text-sm focus:border-amber-500 focus:ring-amber-500" value={formData.englishDefinition} onChange={e => setFormData({ ...formData, englishDefinition: e.target.value })} />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Example</label>
                          <input className="w-full border rounded p-2 text-sm focus:border-amber-500 focus:ring-amber-500" value={formData.example} onChange={e => setFormData({ ...formData, example: e.target.value })} />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Example (Vi)</label>
                          <input className="w-full border rounded p-2 text-sm focus:border-amber-500 focus:ring-amber-500" value={formData.exampleVi} onChange={e => setFormData({ ...formData, exampleVi: e.target.value })} />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Synonyms</label>
                          <input className="w-full border rounded p-2 text-sm focus:border-amber-500 focus:ring-amber-500" value={formData.synonyms} onChange={e => setFormData({ ...formData, synonyms: e.target.value })} />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Antonyms</label>
                          <input className="w-full border rounded p-2 text-sm focus:border-amber-500 focus:ring-amber-500" value={formData.antonyms} onChange={e => setFormData({ ...formData, antonyms: e.target.value })} />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold text-slate-700 mb-1">Collocations</label>
                          <textarea rows={2} className="w-full border rounded p-2 text-sm focus:border-amber-500 focus:ring-amber-500" value={formData.collocations} onChange={e => setFormData({ ...formData, collocations: e.target.value })} />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold text-slate-700 mb-1">TOEIC Trap / Tips (Hỗ trợ định dạng HTML)</label>
                          <div className="border rounded">
                            <TipTapEditor content={formData.toeicTrap} onChange={(html) => setFormData({ ...formData, toeicTrap: html })} />
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <button onClick={cancelEdit} className="px-4 py-2 text-sm rounded bg-slate-100 text-slate-600 font-semibold hover:bg-slate-200">Hủy</button>
                        <button onClick={handleUpdate} disabled={saving} className="px-4 py-2 text-sm rounded bg-[#14532d] text-white font-semibold hover:bg-[#166534] disabled:opacity-50">
                          {saving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0 pr-4">
                        <div className="flex items-baseline gap-3 mb-1">
                          <h4 className="font-bold text-lg text-slate-800">{item.word}</h4>
                          <span className="text-sm font-medium text-amber-700">{item.phonetic}</span>
                        </div>
                        <p className="text-sm text-slate-700"><strong>Nghĩa:</strong> {item.meaning}</p>
                        {item.englishDefinition && <p className="text-sm text-slate-600 mt-1"><strong>EN:</strong> {item.englishDefinition}</p>}
                        
                        <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-500">
                          {item.example && <span title={item.example} className="truncate max-w-[200px]"><strong>Ex:</strong> {item.example}</span>}
                          {item.synonyms && <span title={item.synonyms} className="truncate max-w-[150px]"><strong>Syn:</strong> {item.synonyms}</span>}
                          {item.antonyms && <span title={item.antonyms} className="truncate max-w-[150px]"><strong>Ant:</strong> {item.antonyms}</span>}
                          {item.collocations && <span title={item.collocations} className="truncate max-w-[200px]"><strong>Colloc:</strong> {item.collocations}</span>}
                          {item.toeicTrap && <span className="text-amber-600 font-semibold italic">Có TOEIC Trap</span>}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 shrink-0">
                        <button onClick={() => startEdit(item)} className="px-3 py-1.5 bg-amber-100 text-amber-800 text-xs font-bold rounded hover:bg-amber-200 transition-colors">
                          Chỉnh sửa
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
