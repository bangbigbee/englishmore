'use client'

import React, { useState, useEffect, use } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { toast } from 'sonner'

interface ToeicQuestion {
  id: string
  question: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string | null
  correctOption: string
  explanation: string | null
}

interface ToeicLesson {
  id: string
  title: string
  order: number
  content: string | null
  questions: ToeicQuestion[]
}

interface ToeicTopic {
  id: string
  title: string
  subtitle: string | null
  slug: string
  lessons: ToeicLesson[]
}

export default function ToeicGrammarPracticePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [topic, setTopic] = useState<ToeicTopic | null>(null)
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Quiz states
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({})
  const [showResults, setShowResults] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const fetchTopic = async () => {
      try {
        const res = await fetch(`/api/toeic/grammar/${slug}`)
        if (!res.ok) throw new Error('Could not fetch topic')
        const data = await res.json()
        setTopic(data)
        if (data.lessons && data.lessons.length > 0) {
          setSelectedLessonId(data.lessons[0].id)
        }
      } catch (error) {
        console.error(error)
        toast.error('Không thể tải nội dung bài học.')
      } finally {
        setLoading(false)
      }
    }
    fetchTopic()
  }, [slug])

  const currentLesson = topic?.lessons.find(l => l.id === selectedLessonId)

  const handleSelectOption = (questionId: string, option: string) => {
    if (showResults[questionId]) return
    setUserAnswers(prev => ({ ...prev, [questionId]: option }))
  }

  const handleCheckAnswer = (questionId: string) => {
    if (!userAnswers[questionId]) {
      toast.warning('Vui lòng chọn một đáp án!')
      return
    }
    setShowResults(prev => ({ ...prev, [questionId]: true }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#14532d] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600 font-medium">Đang tải bài học...</p>
        </div>
      </div>
    )
  }

  if (!topic) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Oops! Không tìm thấy bài học này.</h1>
          <Link href="/toeic-practice" className="text-[#14532d] hover:underline">Quay lại trang chính</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/toeic-practice"
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="font-bold text-slate-900 line-clamp-1">{topic.title}</h1>
              <p className="text-xs text-slate-500">{topic.subtitle}</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-4">
            <div className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-100 uppercase tracking-wider">
              Grammar Practice
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row min-h-[calc(100vh-64px)]">
        {/* Sidebar */}
        <aside className="w-full md:w-80 bg-white border-r border-slate-200 sticky top-16 h-fit md:h-[calc(100vh-64px)] overflow-y-auto">
          <div className="p-4 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Danh sách bài học</h2>
          </div>
          <nav className="p-2 space-y-1">
            {topic.lessons.map((lesson) => (
              <button
                key={lesson.id}
                onClick={() => {
                  setSelectedLessonId(lesson.id)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                className={`w-full text-left p-4 rounded-xl transition-all duration-200 group flex items-start gap-4 ${
                  selectedLessonId === lesson.id
                    ? 'bg-[#14532d] text-white shadow-lg shadow-[#14532d]/20 ring-1 ring-[#14532d]'
                    : 'hover:bg-slate-100 text-slate-700 hover:translate-x-1'
                }`}
              >
                <div className={`w-8 h-8 shrink-0 flex items-center justify-center rounded-lg font-bold text-sm ${
                  selectedLessonId === lesson.id ? 'bg-white/20' : 'bg-slate-100 text-slate-500 group-hover:bg-[#14532d]/10'
                }`}>
                  {lesson.order}
                </div>
                <div className="min-w-0">
                  <div className={`font-bold text-sm leading-tight ${selectedLessonId === lesson.id ? 'text-white' : 'text-slate-800'}`}>
                    {lesson.title}
                  </div>
                  <div className={`text-[11px] mt-1 ${selectedLessonId === lesson.id ? 'text-white/60' : 'text-slate-500'}`}>
                    {lesson.questions.length} câu hỏi luyện tập
                  </div>
                </div>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 lg:p-12">
          <div className="max-w-3xl mx-auto">
            <AnimatePresence mode="wait">
              {currentLesson ? (
                <motion.div
                  key={currentLesson.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Lesson Content */}
                  <div className="mb-12">
                    <div className="mb-8 flex items-baseline gap-3">
                      <span className="text-4xl font-black text-[#14532d]/10 select-none">#{currentLesson.order}</span>
                      <h2 className="text-3xl font-black text-slate-900 leading-tight">{currentLesson.title}</h2>
                    </div>
                    
                    <div className="prose prose-slate max-w-none prose-headings:font-black prose-p:text-slate-600 prose-p:leading-relaxed prose-li:text-slate-600">
                      <div className="whitespace-pre-wrap text-slate-700 leading-relaxed font-medium">
                        {currentLesson.content || 'Nội dung đang được cập nhật...'}
                      </div>
                    </div>
                  </div>

                  {/* Quiz Section */}
                  {currentLesson.questions.length > 0 && (
                    <section className="mt-16 pt-16 border-t border-slate-200">
                      <div className="mb-10 text-center">
                        <span className="inline-block py-1 px-3 bg-[#14532d]/5 text-[#14532d] text-xs font-black uppercase tracking-widest rounded-full mb-4">
                          Practice Quiz
                        </span>
                        <h3 className="text-2xl font-black text-slate-900">Kiểm tra kiến thức</h3>
                        <p className="text-slate-500 mt-2 italic text-sm">Chọn đáp án đúng nhất cho mỗi câu hỏi bên dưới.</p>
                      </div>

                      <div className="space-y-12">
                        {currentLesson.questions.map((q, qIndex) => {
                          const isShowingResult = showResults[q.id]
                          const selectedOption = userAnswers[q.id]
                          const isCorrect = selectedOption === q.correctOption

                          return (
                            <div key={q.id} className="relative">
                              <div className="flex items-start gap-4 mb-6">
                                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500 text-sm">
                                  {qIndex + 1}
                                </span>
                                <p className="text-lg font-bold text-slate-800 pt-0.5">{q.question}</p>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-12">
                                {[
                                  { label: 'A', value: q.optionA },
                                  { label: 'B', value: q.optionB },
                                  { label: 'C', value: q.optionC },
                                  { label: 'D', value: q.optionD },
                                ].map((opt) => {
                                  if (opt.label === 'D' && !opt.value) return null
                                  
                                  let buttonClass = "flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 "
                                  
                                  if (isShowingResult) {
                                    if (opt.label === q.correctOption) {
                                      buttonClass += "bg-emerald-50 border-emerald-500 text-emerald-900"
                                    } else if (opt.label === selectedOption) {
                                      buttonClass += "bg-rose-50 border-rose-500 text-rose-900"
                                    } else {
                                      buttonClass += "bg-white border-slate-100 opacity-50"
                                    }
                                  } else {
                                    if (selectedOption === opt.label) {
                                      buttonClass += "bg-[#14532d]/5 border-[#14532d] text-[#14532d]"
                                    } else {
                                      buttonClass += "bg-white border-slate-200 hover:border-[#14532d]/40 hover:bg-slate-50"
                                    }
                                  }

                                  return (
                                    <button
                                      key={opt.label}
                                      onClick={() => handleSelectOption(q.id, opt.label)}
                                      disabled={isShowingResult}
                                      className={buttonClass}
                                    >
                                      <span className={`w-8 h-8 shrink-0 flex items-center justify-center rounded-lg font-bold text-sm ${
                                        selectedOption === opt.label ? 'bg-[#14532d] text-white' : 'bg-slate-100 text-slate-500'
                                      }`}>
                                        {opt.label}
                                      </span>
                                      <span className="font-semibold text-sm">{opt.value}</span>
                                    </button>
                                  )
                                })}
                              </div>

                              <div className="mt-6 flex justify-end pl-12">
                                {!isShowingResult ? (
                                  <button
                                    onClick={() => handleCheckAnswer(q.id)}
                                    className="px-6 py-2 bg-[#14532d] text-white font-bold rounded-lg hover:bg-[#166534] shadow-md transition-all hover:-translate-y-0.5"
                                  >
                                    Kiểm tra
                                  </button>
                                ) : (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="w-full"
                                  >
                                    <div className={`p-6 rounded-2xl border-2 ${isCorrect ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                                      <div className="flex items-center gap-2 mb-3">
                                        {isCorrect ? (
                                          <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                          </svg>
                                        ) : (
                                          <svg className="w-5 h-5 text-rose-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                          </svg>
                                        )}
                                        <span className={`font-black uppercase text-xs tracking-widest ${isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
                                          {isCorrect ? 'Chính xác!' : 'Chưa đúng rồi!'}
                                        </span>
                                      </div>
                                      <div className="text-sm font-bold text-slate-800 mb-2">
                                        Đáp án đúng: <span className="text-emerald-700 uppercase">{q.correctOption}</span>
                                      </div>
                                      {q.explanation && (
                                        <div className="text-sm text-slate-600 leading-relaxed italic border-t border-emerald-200/50 pt-2">
                                          {q.explanation}
                                        </div>
                                      )}
                                    </div>
                                  </motion.div>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </section>
                  )}
                </motion.div>
              ) : (
                <div className="h-64 flex items-center justify-center text-slate-400 italic">
                  Chọn bài học để bắt đầu luyện tập.
                </div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  )
}
