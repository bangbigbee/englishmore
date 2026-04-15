'use client'

import React, { useState, useEffect } from 'react'
import { toast } from 'sonner'

export default function AdminMasterConfig() {
  const [config, setConfig] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [resetting, setResetting] = useState(false)

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/admin/master-config')
      if (res.ok) {
        const data = await res.json()
        // Ensure defaults are merged in case structural fields are missing
        const grammar = data.grammar || { theoryAccessTier: 'FREE', explanationAccessTier: 'FREE', translationAccessTier: 'FREE' }
        const vocabulary = data.vocabulary || { proFields: [], ultraFields: [] }
        setConfig({ grammar, vocabulary })
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchConfig()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/master-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      })
      if (res.ok) {
        toast.success('Lưu cấu hình mặc định thành công!')
      } else {
        toast.error('Lưu cấu hình thất bại!')
      }
    } catch (err) {
      toast.error('Lưu cấu hình thất bại!')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = async () => {
    if (!confirm('Bạn có chắc chắn muốn reset toàn bộ các bài Grammar, Vocabulary hiện có về Master Config này không? Thao tác này không thể hoàn tác.')) return
    setResetting(true)
    try {
      const res = await fetch('/api/admin/master-config/reset', { method: 'POST' })
      if (res.ok) {
        toast.success('Đã cấu hình các hạng mục về chuẩn chung thành công!')
      } else {
        toast.error('Reset thất bại!')
      }
    } catch (err) {
      toast.error('Reset thất bại!')
    } finally {
      setResetting(false)
    }
  }

  const handleVocabToggle = (field: string, tier: 'proFields' | 'ultraFields') => {
    const isChecked = config.vocabulary[tier].includes(field)
    let newArr = [...config.vocabulary[tier]]
    if (isChecked) {
      newArr = newArr.filter(f => f !== field)
    } else {
      newArr.push(field)
    }
    setConfig({
      ...config,
      vocabulary: {
        ...config.vocabulary,
        [tier]: newArr
      }
    })
  }

  if (loading || !config) return <div className="p-8 text-center text-gray-500">Đang tải cấu hình...</div>

  const vocabFieldsConfig = [
    { label: 'Định nghĩa TA (englishDefinition)', value: 'englishDefinition' },
    { label: 'Ví dụ TA (example)', value: 'example' },
    { label: 'Ví dụ TV (exampleVi)', value: 'exampleVi' },
    { label: 'Phiên âm (phonetic)', value: 'phonetic' },
    { label: 'Từ đồng nghĩa (synonyms)', value: 'synonyms' },
    { label: 'Từ trái nghĩa (antonyms)', value: 'antonyms' },
    { label: 'Collocations', value: 'collocations' },
    { label: 'TOEIC Tip', value: 'toeicTrap' },
  ]

  return (
    <div className="bg-white rounded-xl shadow p-6 flex flex-col h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Master Configuration</h2>
          <p className="text-sm text-slate-500 mt-1">
            Cấu hình phân quyền mặc định cho các học liệu (Grammar Quiz, Vocabulary Flashcard).
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleReset}
            disabled={resetting}
            className="px-4 py-2 bg-rose-100 text-rose-700 font-medium rounded-lg hover:bg-rose-200 transition-colors disabled:opacity-50"
          >
            {resetting ? 'Đang Reset...' : 'Reset Tất Cả'}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-[#14532d] text-white font-medium rounded-lg hover:bg-[#166534] transition-colors shadow-lg shadow-[#14532d]/20 disabled:opacity-50"
          >
            {saving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* TOEIC GRAMMAR */}
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
          <h3 className="font-bold text-lg text-slate-800 mb-6 flex items-center gap-2">
            <span className="bg-emerald-100 text-emerald-800 w-8 h-8 rounded-lg flex items-center justify-center">1</span>
            Mặc định Quiz Grammar
          </h3>
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Quyền xem Lý thuyết</label>
              <select
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#14532d] focus:border-[#14532d]"
                value={config.grammar.theoryAccessTier}
                onChange={(e) => setConfig({ ...config, grammar: { ...config.grammar, theoryAccessTier: e.target.value } })}
              >
                <option value="FREE">Free</option>
                <option value="PRO">Pro</option>
                <option value="ULTRA">Ultra</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Quyền xem Giải thích</label>
              <select
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#14532d] focus:border-[#14532d]"
                value={config.grammar.explanationAccessTier}
                onChange={(e) => setConfig({ ...config, grammar: { ...config.grammar, explanationAccessTier: e.target.value } })}
              >
                <option value="FREE">Free</option>
                <option value="PRO">Pro</option>
                <option value="ULTRA">Ultra</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Quyền xem Dịch nghĩa</label>
              <select
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#14532d] focus:border-[#14532d]"
                value={config.grammar.translationAccessTier}
                onChange={(e) => setConfig({ ...config, grammar: { ...config.grammar, translationAccessTier: e.target.value } })}
              >
                <option value="FREE">Free</option>
                <option value="PRO">Pro</option>
                <option value="ULTRA">Ultra</option>
              </select>
            </div>
          </div>
        </div>

        {/* VOCABULARY */}
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
          <h3 className="font-bold text-lg text-slate-800 mb-6 flex items-center gap-2">
            <span className="bg-emerald-100 text-emerald-800 w-8 h-8 rounded-lg flex items-center justify-center">2</span>
            Mặc định Từ vựng / Flashcard
          </h3>
          
          <div className="space-y-4">
            {vocabFieldsConfig.map((field) => {
              const isPro = config.vocabulary.proFields.includes(field.value)
              const isUltra = config.vocabulary.ultraFields.includes(field.value)

              return (
                <div key={field.value} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg hover:border-emerald-200 transition-colors">
                  <span className="text-sm font-semibold text-slate-700">{field.label}</span>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isPro}
                        onChange={() => handleVocabToggle(field.value, 'proFields')}
                        className="w-4 h-4 rounded border-amber-300 text-amber-500 focus:ring-amber-500"
                      />
                      <span className="text-xs font-bold text-amber-600 block w-10">PRO</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isUltra}
                        onChange={() => handleVocabToggle(field.value, 'ultraFields')}
                        className="w-4 h-4 rounded border-purple-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-xs font-bold text-purple-700 block w-10">ULTRA</span>
                    </label>
                  </div>
                </div>
              )
            })}
          </div>
          <p className="mt-4 text-xs italic text-slate-500">* Chọn cả PRO và ULTRA nếu muốn khóa hoàn toàn với tài khoản FREE.</p>
        </div>
      </div>
    </div>
  )
}
