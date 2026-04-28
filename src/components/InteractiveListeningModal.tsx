'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'

const PRACTICE_SENTENCES = [
  { id: 1, text: "The new marketing campaign was very successful.", translation: "Chiến dịch tiếp thị mới đã rất thành công.", missingWord: "marketing" },
  { id: 2, text: "Please send the report to the manager by Friday.", translation: "Vui lòng gửi báo cáo cho người quản lý trước thứ Sáu.", missingWord: "report" },
  { id: 3, text: "Our company is looking for a new software engineer.", translation: "Công ty của chúng tôi đang tìm kiếm một kỹ sư phần mềm mới.", missingWord: "software" },
  { id: 4, text: "The meeting has been rescheduled for next Monday.", translation: "Cuộc họp đã được dời lại vào thứ Hai tuần sau.", missingWord: "rescheduled" },
  { id: 5, text: "We need to review the budget for the upcoming quarter.", translation: "Chúng ta cần xem xét ngân sách cho quý sắp tới.", missingWord: "budget" }
];

export default function InteractiveListeningModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [method, setMethod] = useState<'DICTATION' | 'GAP_FILL' | 'SHADOWING'>('DICTATION')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userInput, setUserInput] = useState('')
  const [feedback, setFeedback] = useState<{type: 'success' | 'error' | '', msg: string}>({type: '', msg: ''})
  const [isRecording, setIsRecording] = useState(false)
  const [speechResult, setSpeechResult] = useState('')
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null)
  
  const currentSentence = PRACTICE_SENTENCES[currentIndex]
  
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    // Initialize Web Speech Synthesis Voices
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices()
      const englishVoices = voices.filter(v => v.lang.startsWith('en-US') || v.lang.startsWith('en-GB'))
      // Prefer Google US English or standard en-US
      const preferred = englishVoices.find(v => v.name.includes('Google US English')) || englishVoices[0]
      if (preferred) setVoice(preferred)
    }
    
    loadVoices()
    if (typeof window !== 'undefined' && window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices
    }

    // Initialize Web Speech Recognition
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = false
        recognitionRef.current.interimResults = false
        recognitionRef.current.lang = 'en-US'

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript
          setSpeechResult(transcript)
          handleShadowingCheck(transcript)
          setIsRecording(false)
        }

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error', event.error)
          setIsRecording(false)
          setFeedback({ type: 'error', msg: 'Không thể nhận diện giọng nói. Vui lòng thử lại.' })
        }
        
        recognitionRef.current.onend = () => {
            setIsRecording(false)
        }
      }
    }
  }, [])

  // Reset state when changing sentence or method
  useEffect(() => {
    setUserInput('')
    setFeedback({type: '', msg: ''})
    setSpeechResult('')
  }, [currentIndex, method])

  const playAudio = (rate: number = 1.0) => {
    if (!('speechSynthesis' in window)) {
      setFeedback({type: 'error', msg: 'Trình duyệt của bạn không hỗ trợ đọc văn bản.'})
      return
    }
    window.speechSynthesis.cancel() // Stop any current speech
    const utterance = new SpeechSynthesisUtterance(currentSentence.text)
    if (voice) utterance.voice = voice
    utterance.rate = rate
    utterance.pitch = 1
    window.speechSynthesis.speak(utterance)
  }

  const startRecording = () => {
    if (!recognitionRef.current) {
      setFeedback({ type: 'error', msg: 'Trình duyệt không hỗ trợ nhận diện giọng nói.' })
      return
    }
    setSpeechResult('')
    setFeedback({ type: '', msg: '' })
    setIsRecording(true)
    try {
        recognitionRef.current.start()
    } catch(e) {
        setIsRecording(false)
    }
  }

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop()
      setIsRecording(false)
    }
  }

  const cleanText = (text: string) => {
    return text.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim()
  }

  const handleCheckDictation = () => {
    const cleanInput = cleanText(userInput)
    const cleanTarget = cleanText(currentSentence.text)
    
    if (cleanInput === cleanTarget) {
      setFeedback({ type: 'success', msg: 'Chính xác hoàn toàn! Bạn nghe rất tốt. 🎉' })
    } else {
      // Basic diff could be added, but for now simple check
      setFeedback({ type: 'error', msg: 'Chưa chính xác. Hãy nghe kỹ lại nhé!' })
    }
  }

  const handleCheckGapFill = () => {
    if (cleanText(userInput) === cleanText(currentSentence.missingWord)) {
      setFeedback({ type: 'success', msg: 'Chính xác! 🎉' })
    } else {
      setFeedback({ type: 'error', msg: 'Sai rồi. Từ này khá quan trọng đấy!' })
    }
  }

  const handleShadowingCheck = (transcript: string) => {
    const cleanInput = cleanText(transcript)
    const cleanTarget = cleanText(currentSentence.text)
    
    // Simple similarity check (could be Levenshtein in real app)
    if (cleanInput === cleanTarget || cleanTarget.includes(cleanInput)) {
      setFeedback({ type: 'success', msg: 'Tuyệt vời! Phát âm chuẩn như người bản xứ! 🌟' })
    } else {
      setFeedback({ type: 'error', msg: 'Chưa sát lắm. Hãy nghe lại ngữ điệu và thử lại nhé!' })
    }
  }

  const nextSentence = () => {
    if (currentIndex < PRACTICE_SENTENCES.length - 1) {
      setCurrentIndex(prev => prev + 1)
    } else {
      setCurrentIndex(0)
    }
  }

  if (!isOpen) return null

  // Helper to render gap fill text
  const renderGapFillText = () => {
    const parts = currentSentence.text.split(new RegExp(`\\b${currentSentence.missingWord}\\b`, 'i'))
    if (parts.length < 2) return currentSentence.text // Fallback
    
    return (
      <div className="text-xl font-medium leading-relaxed text-slate-800 flex flex-wrap items-center justify-center gap-2">
        <span>{parts[0]}</span>
        <input 
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCheckGapFill()}
          className="w-32 border-b-2 border-slate-400 bg-slate-50 text-center text-primary-900 font-bold focus:outline-none focus:border-primary-600 px-2 py-1 transition-colors"
          placeholder="..."
          autoFocus
        />
        <span>{parts[1]}</span>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[200] overflow-y-auto isolate flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-4xl bg-white rounded-[24px] shadow-2xl overflow-hidden flex flex-col md:flex-row h-[600px] max-h-[90vh]"
      >
        {/* Left Sidebar: Methods */}
        <div className="w-full md:w-1/3 bg-slate-50 p-6 flex flex-col border-r border-slate-200">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black text-primary-900 flex items-center gap-2">
              <span className="bg-primary-100 text-primary-700 p-2 rounded-xl">🎧</span>
              Interactive<br/>Listening
            </h2>
            <button onClick={onClose} className="md:hidden w-8 h-8 flex items-center justify-center bg-slate-200 rounded-full text-slate-600">✕</button>
          </div>
          
          <p className="text-sm font-medium text-slate-500 mb-4">Chọn phương pháp luyện tập:</p>
          
          <div className="space-y-3 flex-1">
            <button 
              onClick={() => setMethod('DICTATION')}
              className={`w-full text-left p-4 rounded-2xl transition-all border-2 ${method === 'DICTATION' ? 'border-primary-500 bg-white shadow-md' : 'border-transparent hover:bg-slate-100'}`}
            >
              <h3 className={`font-bold ${method === 'DICTATION' ? 'text-primary-900' : 'text-slate-700'}`}>1. Nghe chép chính tả</h3>
              <p className="text-[12px] text-slate-500 mt-1">Luyện nghe chi tiết từng từ một. Rất tốt cho Beginner.</p>
            </button>

            <button 
              onClick={() => setMethod('GAP_FILL')}
              className={`w-full text-left p-4 rounded-2xl transition-all border-2 ${method === 'GAP_FILL' ? 'border-secondary-500 bg-white shadow-md' : 'border-transparent hover:bg-slate-100'}`}
            >
              <h3 className={`font-bold ${method === 'GAP_FILL' ? 'text-secondary-600' : 'text-slate-700'}`}>2. Điền từ (Gap Fill)</h3>
              <p className="text-[12px] text-slate-500 mt-1">Luyện phản xạ bắt Keyword (từ khóa chính).</p>
            </button>

            <button 
              onClick={() => setMethod('SHADOWING')}
              className={`w-full text-left p-4 rounded-2xl transition-all border-2 ${method === 'SHADOWING' ? 'border-blue-500 bg-white shadow-md' : 'border-transparent hover:bg-slate-100'}`}
            >
              <h3 className={`font-bold ${method === 'SHADOWING' ? 'text-blue-600' : 'text-slate-700'}`}>3. Nghe & Nhại lại</h3>
              <p className="text-[12px] text-slate-500 mt-1">Shadowing giúp cải thiện ngữ điệu và phát âm chuẩn xác.</p>
            </button>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="w-full md:w-2/3 p-8 flex flex-col h-full bg-white relative">
          <button onClick={onClose} className="absolute top-6 right-6 hidden md:flex w-8 h-8 items-center justify-center bg-slate-100 hover:bg-slate-200 rounded-full text-slate-600 transition-colors">✕</button>
          
          <div className="flex items-center justify-between mb-8">
            <span className="text-xs font-bold tracking-widest uppercase text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg">Câu {currentIndex + 1} / {PRACTICE_SENTENCES.length}</span>
            <button onClick={nextSentence} className="text-sm font-bold text-primary-600 hover:text-primary-800 flex items-center gap-1">Chuyển câu <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></button>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center relative">
            
            {/* Audio Controls */}
            <div className="flex items-center gap-4 mb-10">
              <button 
                onClick={() => playAudio(1.0)}
                className="w-16 h-16 bg-primary-900 text-white rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg hover:shadow-primary-900/30"
              >
                <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              </button>
              <button 
                onClick={() => playAudio(0.7)}
                className="w-12 h-12 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-full flex items-center justify-center hover:scale-105 transition-all text-xs font-bold"
                title="Nghe chậm"
              >
                0.7x
              </button>
            </div>

            {/* Content Based on Method */}
            <div className="w-full max-w-lg text-center space-y-6">
              
              {method === 'DICTATION' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <p className="text-sm text-slate-500 font-medium">Lắng nghe và gõ lại chính xác câu bạn vừa nghe:</p>
                  <textarea 
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    className="w-full h-32 p-4 border-2 border-slate-200 rounded-2xl focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all resize-none text-lg text-slate-800"
                    placeholder="Type what you hear..."
                  />
                  <div className="flex gap-3 justify-center">
                    <button onClick={handleCheckDictation} className="bg-primary-900 text-white px-6 py-2.5 rounded-xl font-bold shadow-md hover:bg-primary-800 transition-colors">Kiểm tra</button>
                    <button onClick={() => setUserInput(currentSentence.text)} className="bg-slate-100 text-slate-600 px-6 py-2.5 rounded-xl font-bold hover:bg-slate-200 transition-colors">Xem đáp án</button>
                  </div>
                </div>
              )}

              {method === 'GAP_FILL' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <p className="text-sm text-slate-500 font-medium">Lắng nghe và điền từ còn thiếu vào chỗ trống:</p>
                  <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 shadow-inner">
                    {renderGapFillText()}
                  </div>
                  <div className="flex gap-3 justify-center">
                    <button onClick={handleCheckGapFill} className="bg-secondary-500 text-white px-6 py-2.5 rounded-xl font-bold shadow-md hover:bg-secondary-600 transition-colors">Kiểm tra</button>
                    <button onClick={() => setUserInput(currentSentence.missingWord)} className="bg-slate-100 text-slate-600 px-6 py-2.5 rounded-xl font-bold hover:bg-slate-200 transition-colors">Gợi ý</button>
                  </div>
                </div>
              )}

              {method === 'SHADOWING' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <p className="text-sm text-slate-500 font-medium">Nghe câu sau đó nhấn giữ Micro để nhại lại ngữ điệu:</p>
                  <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                    <p className="text-xl font-medium text-slate-800">{currentSentence.text}</p>
                    <p className="text-sm text-slate-500 mt-2">{currentSentence.translation}</p>
                  </div>
                  
                  <div className="flex flex-col items-center gap-3">
                    <button 
                      onMouseDown={startRecording}
                      onMouseUp={stopRecording}
                      onTouchStart={startRecording}
                      onTouchEnd={stopRecording}
                      className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-red-500 scale-110 shadow-[0_0_20px_rgba(239,68,68,0.5)] animate-pulse' : 'bg-blue-600 hover:bg-blue-700 shadow-lg'}`}
                    >
                      <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                    </button>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{isRecording ? 'Đang nghe...' : 'Nhấn giữ để nói'}</span>
                    
                    {speechResult && (
                      <div className="mt-4 p-3 bg-slate-50 rounded-lg text-sm text-slate-600 w-full">
                        <span className="font-semibold">Bạn nói: </span>"{speechResult}"
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Feedback Alert */}
              <AnimatePresence>
                {feedback.msg && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className={`p-4 rounded-xl text-sm font-bold flex items-center gap-2 text-left ${feedback.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}
                  >
                    {feedback.type === 'success' ? '✅' : '❌'} {feedback.msg}
                  </motion.div>
                )}
              </AnimatePresence>
              
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
