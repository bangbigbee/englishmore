'use client'

import React, { useState, useEffect } from 'react'
import { toast } from 'sonner'

export default function AdminMasterConfig() {
  const [config, setConfig] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/admin/master-config')
      if (res.ok) {
        const data = await res.json()
        // Ensure defaults are merged in case structural fields are missing
        const grammar = data.grammar || { theoryAccessTier: 'FREE', explanationAccessTier: 'FREE', translationAccessTier: 'FREE', grammarBookmarkAccessTier: 'PRO', readingBookmarkAccessTier: 'PRO' }
        if (!grammar.grammarBookmarkAccessTier) grammar.grammarBookmarkAccessTier = grammar.bookmarkAccessTier || 'PRO'
        if (!grammar.readingBookmarkAccessTier) grammar.readingBookmarkAccessTier = grammar.bookmarkAccessTier || 'PRO'
        delete grammar.bookmarkAccessTier
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
    <div className="bg-white rounded-xl shadow border border-secondary-200 mb-8 overflow-hidden">
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 bg-secondary-50/50 hover:bg-secondary-100/50 transition-colors border-b border-secondary-100"
      >
        <div className="flex items-center gap-3 text-left">
          <div className="p-2 bg-secondary-100 text-secondary-600 rounded-lg">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-black text-secondary-900">Master Configuration</h2>
            <p className="text-sm text-secondary-700/80 mt-0.5">
              Cấu hình quyền mặc định cho khóa luyện thi TOEIC (Flashcard, Grammar).
            </p>
          </div>
        </div>
        <svg className={`w-6 h-6 text-secondary-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>

      {isOpen && (
        <div className="p-6 bg-white animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-end mb-6">
            <div className="flex gap-3">
              <button
                onClick={handleReset}
                disabled={resetting}
                title="Thay đổi này sẽ áp dụng cấu hình và ghi đè toàn bộ Flashcard / Grammar Quiz về trạng thái của Master Config này"
                className="px-4 py-2 bg-secondary-100 text-secondary-700 font-bold rounded-lg hover:bg-secondary-200 transition-colors disabled:opacity-50"
              >
                {resetting ? 'Đang Xử Lý...' : 'Apply All'}
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2 bg-gradient-to-r from-secondary-500 to-[#ea980c] text-white font-bold rounded-lg hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50"
              >
                {saving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
              </button>
            </div>
          </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* TOEIC GRAMMAR */}
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
          <h3 className="font-bold text-lg text-slate-800 mb-6 flex items-center gap-2">
            <span className="bg-primary-100 text-primary-800 w-8 h-8 rounded-lg flex items-center justify-center">1</span>
            Mặc định Quiz Grammar
          </h3>
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Quyền xem Kiến thức cần nhớ</label>
              <select
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-900 focus:border-primary-900"
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
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-900 focus:border-primary-900"
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
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-900 focus:border-primary-900"
                value={config.grammar.translationAccessTier}
                onChange={(e) => setConfig({ ...config, grammar: { ...config.grammar, translationAccessTier: e.target.value } })}
              >
                <option value="FREE">Free</option>
                <option value="PRO">Pro</option>
                <option value="ULTRA">Ultra</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Quyền Sổ Tay Ngữ Pháp</label>
              <select
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-900 focus:border-primary-900"
                value={config.grammar.grammarBookmarkAccessTier}
                onChange={(e) => setConfig({ ...config, grammar: { ...config.grammar, grammarBookmarkAccessTier: e.target.value } })}
              >
                <option value="FREE">Free</option>
                <option value="PRO">Pro</option>
                <option value="ULTRA">Ultra</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Quyền Sổ Tay Luyện Đọc</label>
              <select
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-900 focus:border-primary-900"
                value={config.grammar.readingBookmarkAccessTier}
                onChange={(e) => setConfig({ ...config, grammar: { ...config.grammar, readingBookmarkAccessTier: e.target.value } })}
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
            <span className="bg-primary-100 text-primary-800 w-8 h-8 rounded-lg flex items-center justify-center">2</span>
            Mặc định Từ vựng / Flashcard
          </h3>
          
          <div className="space-y-4">
            {vocabFieldsConfig.map((field) => {
              const isPro = config.vocabulary.proFields.includes(field.value)
              const isUltra = config.vocabulary.ultraFields.includes(field.value)

              return (
                <div key={field.value} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg hover:border-primary-200 transition-colors">
                  <span className="text-sm font-semibold text-slate-700">{field.label}</span>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isPro}
                        onChange={() => handleVocabToggle(field.value, 'proFields')}
                        className="w-4 h-4 rounded border-secondary-300 text-secondary-500 focus:ring-secondary-500"
                      />
                      <span className="text-xs font-bold text-secondary-600 block w-10">PRO</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isUltra}
                        onChange={() => handleVocabToggle(field.value, 'ultraFields')}
                        className="w-4 h-4 rounded border-primary-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-xs font-bold text-primary-700 block w-10">ULTRA</span>
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
      )}
    </div>
  )
}
