'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'

import { toast } from 'sonner'

type PracticeItem = { id: number; text: string; translation: string; type: 'SENTENCE' | 'QNA' | 'SHORT_TALK' };

const PRACTICE_DATA: Record<'SENTENCE' | 'QNA' | 'SHORT_TALK', PracticeItem[]> = {
  SENTENCE: [
    { id: 1, text: "The new marketing campaign was very successful.", translation: "Chiến dịch tiếp thị mới đã rất thành công.", type: 'SENTENCE' },
    { id: 2, text: "Please send the report to the manager by Friday.", translation: "Vui lòng gửi báo cáo cho người quản lý trước thứ Sáu.", type: 'SENTENCE' },
    { id: 3, text: "Our company is looking for a new software engineer.", translation: "Công ty của chúng tôi đang tìm kiếm một kỹ sư phần mềm mới.", type: 'SENTENCE' },
    { id: 4, text: "The meeting has been rescheduled for next Monday.", translation: "Cuộc họp đã được dời lại vào thứ Hai tuần sau.", type: 'SENTENCE' },
    { id: 5, text: "We need to review the budget for the upcoming quarter.", translation: "Chúng ta cần xem xét ngân sách cho quý sắp tới.", type: 'SENTENCE' }
  ],
  QNA: [
    { id: 101, text: "Question: When is the next train to London? Response: It leaves in ten minutes.", translation: "Hỏi: Chuyến tàu tiếp theo đến London là khi nào? Đáp: Nó khởi hành trong mười phút nữa.", type: 'QNA' },
    { id: 102, text: "Question: Who is presenting the sales report? Response: Mr. Smith will do it.", translation: "Hỏi: Ai sẽ trình bày báo cáo doanh số? Đáp: Ông Smith sẽ làm việc đó.", type: 'QNA' },
    { id: 103, text: "Question: Are you going to the company picnic? Response: Yes, I wouldn't miss it.", translation: "Hỏi: Bạn có đi dã ngoại cùng công ty không? Đáp: Có, tôi sẽ không bỏ lỡ đâu.", type: 'QNA' }
  ],
  SHORT_TALK: [
    { id: 201, text: "Welcome to the annual tech conference. We have a great lineup of speakers today. Please make sure to visit our sponsor booths during the breaks.", translation: "Chào mừng bạn đến với hội nghị công nghệ thường niên. Chúng ta có một đội ngũ diễn giả tuyệt vời ngày hôm nay. Vui lòng đảm bảo ghé thăm các gian hàng tài trợ của chúng tôi trong giờ nghỉ.", type: 'SHORT_TALK' },
    { id: 202, text: "Attention all passengers for flight 789 to Tokyo. Your flight is delayed by two hours due to severe weather conditions. We apologize for the inconvenience.", translation: "Xin thông báo tới tất cả hành khách của chuyến bay 789 đi Tokyo. Chuyến bay của bạn bị hoãn hai giờ do điều kiện thời tiết khắc nghiệt. Chúng tôi xin lỗi vì sự bất tiện này.", type: 'SHORT_TALK' }
  ]
};

const DIFFICULTIES = [
  { label: 'Tân binh', value: 20 },
  { label: 'Cơ bản', value: 40 },
  { label: 'Trung cấp', value: 60 },
  { label: 'Nâng cao', value: 80 },
  { label: 'Hardcore', value: 100 }
]

export default function InteractiveListeningModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [method, setMethod] = useState<'DICTATION' | 'SHADOWING'>('DICTATION')
  const [difficulty, setDifficulty] = useState(100)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userInput, setUserInput] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [speechResult, setSpeechResult] = useState('')
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null)
  const [hintText, setHintText] = useState('')
  const [speed, setSpeed] = useState(1.0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [revealedWordCount, setRevealedWordCount] = useState(0)
  const [contentType, setContentType] = useState<'SENTENCE' | 'QNA' | 'SHORT_TALK'>('SENTENCE')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  
  const currentData = PRACTICE_DATA[contentType]
  const currentSentence = currentData[currentIndex] || currentData[0]
  const targetWords = currentSentence.text.split(' ')
  const maxReveals = difficulty === 100 ? targetWords.length : Math.max(1, Math.floor(targetWords.length * (difficulty / 100)))
  
  // Reset index when content type changes
  useEffect(() => {
    setCurrentIndex(0)
    setRevealedWordCount(0)
    setHintText('')
    setUserInput('')
    setIsPlaying(false)
  }, [contentType])
  
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    // Initialize Web Speech Synthesis Voices
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices()
      const englishVoices = voices.filter(v => v.lang.startsWith('en-US') || v.lang.startsWith('en-GB'))
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
          toast.error('Không thể nhận diện giọng nói. Vui lòng thử lại.', { position: 'top-center' })
        }
        
        recognitionRef.current.onend = () => {
            setIsRecording(false)
        }
      }
    }
  }, [])

  // Generate Hint
  useEffect(() => {
    // Create consistent random blanks based on sentence id so it doesn't jump around
    // Simple deterministic random
    let seed = currentSentence.id + difficulty
    const random = () => {
      const x = Math.sin(seed++) * 10000
      return x - Math.floor(x)
    }

    const hiddenIndices = new Set<number>()
    while(hiddenIndices.size < maxReveals && hiddenIndices.size < targetWords.length) {
      hiddenIndices.add(Math.floor(random() * targetWords.length))
    }
    
    const hiddenIndicesArray = Array.from(hiddenIndices).sort((a, b) => a - b);
    const indicesToReveal = new Set(hiddenIndicesArray.slice(0, revealedWordCount));

    const hintWords = targetWords.map((w, i) => {
      // If word wasn't hidden to begin with, show it
      if (!hiddenIndices.has(i)) return w;
      // If word was hidden but is now revealed by clicking, show it
      if (indicesToReveal.has(i)) return w;
      // Otherwise keep it hidden
      return '___';
    })
    setHintText(hintWords.join(' '))
  }, [currentIndex, difficulty, revealedWordCount, currentSentence, maxReveals])

  // Reset state
  useEffect(() => {
    setUserInput('')
    setSpeechResult('')
    setRevealedWordCount(0)
  }, [currentIndex, method, difficulty])

  const playAudio = () => {
    if (!('speechSynthesis' in window)) {
      toast.error('Trình duyệt của bạn không hỗ trợ đọc văn bản.')
      return
    }
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(currentSentence.text)
    if (voice) utterance.voice = voice
    utterance.rate = speed
    utterance.pitch = 1
    utterance.onstart = () => setIsPlaying(true)
    utterance.onend = () => setIsPlaying(false)
    utterance.onerror = () => setIsPlaying(false)
    window.speechSynthesis.speak(utterance)
  }

  const startRecording = () => {
    if (!recognitionRef.current) {
      toast.error('Trình duyệt không hỗ trợ nhận diện giọng nói.')
      return
    }
    setSpeechResult('')
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
      toast.success('Chính xác hoàn toàn! +2 ⭐', { position: 'top-center' })
    } else {
      toast.error('Chưa chính xác. Hãy nghe kỹ lại nhé!', { position: 'top-center' })
    }
  }

  const handleShadowingCheck = (transcript: string) => {
    const cleanInput = cleanText(transcript)
    const cleanTarget = cleanText(currentSentence.text)
    
    if (!cleanInput) {
      toast.error('Hệ thống chưa nghe rõ. Bạn vui lòng thử lại nhé!', { position: 'top-center' })
      return
    }

    if (cleanInput === cleanTarget) {
      toast.success('Tuyệt đỉnh! Phát âm chuẩn 100% như người bản xứ! +5 ⭐', { position: 'top-center' })
      return
    }

    // Fuzzy matching by words
    const inputWords = cleanInput.split(' ')
    const targetWordsArr = cleanTarget.split(' ')
    const targetWords = new Set(targetWordsArr)
    
    let matchCount = 0
    const matchedWords = new Set()
    
    inputWords.forEach(word => {
      // Allow minor plurals/tenses mismatch by checking partial word? No, let's keep it simple for now
      if (targetWords.has(word) && !matchedWords.has(word)) {
        matchCount++
        matchedWords.add(word)
      }
    })
    
    const matchPercentage = matchCount / targetWords.size
    
    if (matchPercentage >= 0.8) {
      toast.success('Rất xuất sắc! Ngữ điệu của bạn cực kỳ tự nhiên! +4 ⭐', { position: 'top-center' })
    } else if (matchPercentage >= 0.5) {
      toast.success('Khá tốt! Cố gắng luyện thêm một chút nữa nhé! +2 ⭐', { position: 'top-center' })
    } else {
      toast.error('Chưa sát lắm. Hãy nghe lại ngữ điệu và thử lại nhé!', { position: 'top-center' })
    }
  }

  const nextSentence = () => {
    if (currentIndex < currentData.length - 1) {
      setCurrentIndex(prev => prev + 1)
    } else {
      setCurrentIndex(0)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[200] isolate flex bg-[#020617] overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full h-full flex flex-col md:flex-row text-slate-300"
      >
        {/* Background Effects */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-900/40 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-900/40 blur-[120px]" />
        </div>

        {/* Left Sidebar Overlay */}
        {isSidebarOpen && (
          <div 
            className="absolute inset-0 bg-slate-900/20 z-40 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsSidebarOpen(false)} 
          />
        )}

        {/* Left Sidebar Drawer */}
        <div className={`absolute top-0 left-0 h-full w-[300px] sm:w-[340px] bg-[#0B1120] border-r border-slate-800 p-6 flex flex-col z-50 shadow-[4px_0_24px_rgba(0,0,0,0.5)] transition-transform duration-300 overflow-y-auto ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-white flex items-center gap-3 tracking-tight">
              <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-secondary-400 to-secondary-600 flex items-center justify-center shadow-lg shadow-secondary-500/30">
                <svg className="w-5 h-5 text-slate-900" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
                </svg>
              </span>
              Master<br/><span className="text-secondary-400">Listening</span>
            </h2>
            <button onClick={() => setIsSidebarOpen(false)} className="w-8 h-8 flex items-center justify-center bg-slate-800 hover:bg-slate-700 rounded-full transition-colors cursor-pointer text-slate-300 text-sm">✕</button>
          </div>
          
          <div className="flex space-y-6 flex-1 flex-col">
            
            {/* Content Type Selection */}
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Nội dung luyện tập</h3>
              <div className="space-y-2">
                <button 
                  onClick={() => { setContentType('SENTENCE'); setIsSidebarOpen(false); }}
                  className={`w-full cursor-pointer text-left p-3 rounded-xl transition-all duration-300 relative overflow-hidden group ${contentType === 'SENTENCE' ? 'bg-slate-800/50 border border-slate-700 shadow-sm' : 'bg-transparent border border-transparent hover:bg-slate-800/30'}`}
                >
                  {contentType === 'SENTENCE' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary-400 rounded-l-xl" />}
                  <h4 className={`text-sm font-bold ${contentType === 'SENTENCE' ? 'text-secondary-400' : 'text-slate-400'}`}>Câu đơn</h4>
                </button>
                <button 
                  onClick={() => { setContentType('QNA'); setIsSidebarOpen(false); }}
                  className={`w-full cursor-pointer text-left p-3 rounded-xl transition-all duration-300 relative overflow-hidden group ${contentType === 'QNA' ? 'bg-slate-800/50 border border-slate-700 shadow-sm' : 'bg-transparent border border-transparent hover:bg-slate-800/30'}`}
                >
                  {contentType === 'QNA' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary-400 rounded-l-xl" />}
                  <h4 className={`text-sm font-bold ${contentType === 'QNA' ? 'text-secondary-400' : 'text-slate-400'}`}>Hỏi & Đáp</h4>
                </button>
                <button 
                  onClick={() => { setContentType('SHORT_TALK'); setIsSidebarOpen(false); }}
                  className={`w-full cursor-pointer text-left p-3 rounded-xl transition-all duration-300 relative overflow-hidden group ${contentType === 'SHORT_TALK' ? 'bg-slate-800/50 border border-slate-700 shadow-sm' : 'bg-transparent border border-transparent hover:bg-slate-800/30'}`}
                >
                  {contentType === 'SHORT_TALK' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary-400 rounded-l-xl" />}
                  <h4 className={`text-sm font-bold ${contentType === 'SHORT_TALK' ? 'text-secondary-400' : 'text-slate-400'}`}>Bài nói ngắn</h4>
                </button>
              </div>
            </div>
            
            <div className="w-full h-px bg-slate-800/50" />
            
            {/* Method Selection */}
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Phương pháp học</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => { setMethod('DICTATION'); setIsSidebarOpen(false); }}
                  className={`w-full cursor-pointer text-left p-4 rounded-2xl transition-all duration-300 relative overflow-hidden group ${method === 'DICTATION' ? 'bg-slate-800/50 border border-slate-700 shadow-sm' : 'bg-[#0B1120] border border-slate-800 hover:bg-slate-800/50'}`}
                >
                  {method === 'DICTATION' && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-secondary-400 rounded-l-2xl" />}
                  <h3 className={`text-lg font-bold ${method === 'DICTATION' ? 'text-secondary-400' : 'text-slate-300'}`}>Nghe Chép Chính Tả</h3>
                  <p className="text-[13px] text-slate-500 mt-1 font-medium">Luyện bắt từ khóa & gõ lại toàn bộ câu với các độ khó khác nhau.</p>
                </button>

                <button 
                  onClick={() => { setMethod('SHADOWING'); setIsSidebarOpen(false); }}
                  className={`w-full cursor-pointer text-left p-4 rounded-2xl transition-all duration-300 relative overflow-hidden group ${method === 'SHADOWING' ? 'bg-slate-800/50 border border-slate-700 shadow-sm' : 'bg-[#0B1120] border border-slate-800 hover:bg-slate-800/50'}`}
                >
                  {method === 'SHADOWING' && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-secondary-400 rounded-l-2xl" />}
                  <h3 className={`text-lg font-bold ${method === 'SHADOWING' ? 'text-secondary-400' : 'text-slate-300'}`}>Luyện Ngữ Điệu</h3>
                  <p className="text-[13px] text-slate-500 mt-1 font-medium">Bắt chước ngữ điệu bản xứ. Trí tuệ nhân tạo sẽ chấm điểm bạn.</p>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 min-h-0 flex flex-col relative z-10 overflow-y-auto">
          {/* Top Actions */}
          <div className="absolute top-4 left-4 z-30">
            <button onClick={() => setIsSidebarOpen(true)} className="w-10 h-10 flex items-center justify-center bg-[#0B1120] hover:bg-[#111827] shadow-sm rounded-full text-secondary-400 transition-all border border-slate-800 cursor-pointer">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
          </div>
          <div className="absolute top-4 right-4 z-30 flex gap-2">
            <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-[#0B1120] hover:bg-[#111827] shadow-sm rounded-full text-slate-400 transition-all border border-slate-800 hover:rotate-90 cursor-pointer">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          
          <div className="w-full min-h-full w-full max-w-[100vw] mx-auto p-4 md:px-12 flex flex-col lg:flex-row gap-8 lg:gap-16 pt-24 pb-8 items-center justify-center">
            
            {/* Left Column: Audio & Context */}
            <div className="w-full lg:w-[35%] flex flex-col justify-center items-center space-y-12">
              
              {/* Audio Controls */}
              <div className="flex items-center justify-center gap-8 w-full max-w-sm">
                {/* Speed Slider Control */}
                <div className="flex flex-col flex-1 items-start">
                  <div className="flex items-center justify-between w-full mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Speed</span>
                    <span className="text-xs font-bold text-secondary-400">{speed.toFixed(1)}x</span>
                  </div>
                  <input 
                    type="range" 
                    min="0.6" max="1.4" step="0.1" 
                    value={speed} 
                    onChange={(e) => setSpeed(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-secondary-400"
                  />
                </div>

                {/* Play Button */}
                <div className="relative group cursor-pointer shrink-0" onClick={playAudio}>
                  {isPlaying && (
                    <>
                      <div className="absolute inset-0 bg-secondary-500 rounded-full blur-xl opacity-40 animate-pulse" />
                      <div className="absolute -inset-4 border-2 border-secondary-500/30 rounded-full animate-ping" />
                    </>
                  )}
                  {!isPlaying && <div className="absolute inset-0 bg-secondary-500 rounded-full blur-xl opacity-10 group-hover:opacity-20 transition-opacity duration-500" />}
                  
                  <button className={`relative w-20 h-20 bg-gradient-to-b from-[#111827] to-[#0B1120] border border-slate-800 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl backdrop-blur-sm ${isPlaying ? 'scale-105 border-secondary-500/50' : ''}`}>
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-inner transition-colors ${isPlaying ? 'bg-secondary-400' : 'bg-secondary-500'}`}>
                      {isPlaying ? (
                        <svg className="w-6 h-6 text-[#020617]" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h12v12H6z" /></svg>
                      ) : (
                        <svg className="w-8 h-8 text-[#020617] ml-1.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                      )}
                    </div>
                  </button>
                </div>
              </div>

              {/* Context Display */}
              <div className="text-center space-y-4 max-w-md w-full min-h-[120px] flex flex-col justify-center">
                {method === 'SHADOWING' ? (
                  <>
                    <p className="text-2xl md:text-3xl font-bold text-white leading-tight">"{currentSentence.text}"</p>
                    <p className="text-slate-400 font-medium text-lg">{currentSentence.translation}</p>
                  </>
                ) : (
                  <div className="p-6 bg-slate-800/30 border border-slate-800 rounded-2xl shadow-inner">
                    <p className="text-slate-400 text-sm font-medium leading-relaxed">Hãy tập trung lắng nghe đoạn audio và nhập lại chính xác những gì bạn nghe được vào ô bên phải. Có thể sử dụng biểu tượng bóng đèn để nhận gợi ý nếu gặp khó khăn.</p>
                  </div>
                )}
              </div>

              {/* Bottom Navigation */}
              <div className="flex flex-col items-center gap-4 w-full max-w-sm pt-4">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-secondary-400 animate-pulse' : 'bg-slate-600'}`} />
                  <span className="text-xs font-bold tracking-[0.2em] uppercase text-secondary-400">
                    {contentType === 'SENTENCE' ? 'Câu đơn' : contentType === 'QNA' ? 'Hỏi & Đáp' : 'Bài nói ngắn'}
                  </span>
                </div>
                <div className="flex items-center justify-between w-full bg-[#111827] border border-slate-800 shadow-sm rounded-full p-1.5">
                  <button 
                    onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentIndex === 0}
                    className="cursor-pointer text-sm font-bold text-slate-400 hover:bg-slate-800 hover:text-secondary-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all uppercase tracking-wider flex items-center justify-center w-24 h-10 rounded-full group"
                  >
                    <svg className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Prev
                  </button>
                  
                  <span className="text-sm font-bold text-slate-200">{currentIndex + 1} <span className="text-slate-500">/ {currentData.length}</span></span>
                  
                  <button 
                    onClick={nextSentence} 
                    className="cursor-pointer text-sm font-bold text-[#020617] bg-secondary-500 hover:bg-secondary-400 transition-all uppercase tracking-wider flex items-center justify-center w-24 h-10 rounded-full group shadow-md shadow-secondary-500/20"
                  >
                    Next
                    <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Interaction Area */}
            <div className="w-full lg:w-[65%] flex flex-col justify-center items-center">
              
              {method === 'DICTATION' && (
                <div className="w-full space-y-6 animate-in fade-in slide-in-from-right-8 duration-700 max-w-3xl">
                  {/* Difficulty Selector */}
                  <div className="flex flex-col items-center gap-4">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Độ khó</span>
                    <div className="flex flex-wrap justify-center gap-2">
                      {DIFFICULTIES.map(d => (
                        <button 
                          key={d.value}
                          onClick={() => setDifficulty(d.value)}
                          className={`cursor-pointer px-5 py-2.5 md:px-6 md:py-3 rounded-xl text-xs md:text-sm font-bold transition-all border ${difficulty === d.value ? 'bg-slate-800 border-slate-700 text-secondary-400 shadow-sm' : 'bg-[#0B1120] border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-400'}`}
                        >
                          {d.label} <span className="opacity-50 ml-1">{d.value}%</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="w-full bg-[#111827] border border-slate-800 rounded-3xl p-6 md:p-8 backdrop-blur-sm relative overflow-hidden shadow-xl">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-secondary-400 to-secondary-600 opacity-50" />
                    
                    {/* Progressive Hint Lightbulb */}
                    <div className="absolute top-4 right-4 z-20">
                      <button 
                        onClick={() => {
                          if (revealedWordCount < maxReveals) {
                            setRevealedWordCount(prev => prev + 1);
                          }
                        }}
                        disabled={revealedWordCount >= maxReveals}
                        className="group cursor-pointer disabled:cursor-not-allowed relative flex items-center justify-center p-2 rounded-full transition-all"
                      >
                        {revealedWordCount < maxReveals && (
                          <div 
                            className="absolute inset-0 bg-secondary-400 rounded-full blur-md transition-opacity duration-300"
                            style={{ opacity: 0.6 * (1 - revealedWordCount / maxReveals) }}
                          />
                        )}
                        <svg 
                          className={`w-6 h-6 relative z-10 transition-colors duration-300 ${revealedWordCount >= maxReveals ? 'text-slate-600' : 'text-secondary-400'}`} 
                          fill="currentColor" viewBox="0 0 24 24"
                        >
                          <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z" />
                        </svg>
                      </button>
                    </div>

                    {/* Hint Display */}
                    <div className="mb-4 pb-4 border-b border-slate-800 pr-12 min-h-[4rem] flex items-center justify-center">
                      <p className="text-base md:text-lg font-medium leading-relaxed text-slate-300 text-center tracking-wide">
                        {hintText || <span className="text-slate-600 italic">Nhấn vào bóng đèn để nhận gợi ý</span>}
                      </p>
                    </div>

                    <textarea 
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      className="w-full h-24 md:h-40 bg-transparent text-white text-lg md:text-2xl lg:text-3xl font-medium placeholder-slate-600 focus:outline-none resize-none text-center"
                      placeholder="Gõ tiếng Anh vào đây..."
                      spellCheck={false}
                    />
                  </div>

                  <div className="flex gap-4 justify-center mt-4">
                    <button onClick={handleCheckDictation} className="cursor-pointer bg-secondary-500 hover:bg-secondary-400 text-[#020617] px-10 py-4 rounded-2xl text-lg md:text-xl font-bold shadow-lg shadow-secondary-500/20 transition-all hover:-translate-y-1">Kiểm tra kết quả</button>
                  </div>
                </div>
              )}

              {method === 'SHADOWING' && (
                <div className="w-full space-y-10 animate-in fade-in slide-in-from-right-8 duration-700 flex flex-col items-center">
                  <div className="flex flex-col items-center gap-6">
                    <div className="relative group">
                      {isRecording && <div className="absolute inset-0 bg-red-500 rounded-full blur-2xl opacity-40 animate-pulse" />}
                      <button 
                        onMouseDown={startRecording}
                        onMouseUp={stopRecording}
                        onTouchStart={startRecording}
                        onTouchEnd={stopRecording}
                        className={`cursor-pointer relative w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 border-4 ${isRecording ? 'bg-red-500 border-red-400 scale-110' : 'bg-secondary-500 border-secondary-500/50 hover:bg-secondary-400 shadow-xl shadow-secondary-500/20'}`}
                      >
                        <svg className={`w-12 h-12 ${isRecording ? 'text-white' : 'text-[#020617]'} transition-transform ${isRecording ? 'scale-110' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                      </button>
                    </div>
                    
                    <div className="text-center">
                      <span className={`text-sm font-bold uppercase tracking-widest ${isRecording ? 'text-red-400 animate-pulse' : 'text-slate-500'}`}>
                        {isRecording ? 'Hệ thống đang nghe...' : 'Nhấn giữ để phát âm'}
                      </span>
                    </div>
                    
                    {speechResult && (
                      <div className="mt-4 p-5 bg-[#111827] border border-slate-800 shadow-sm rounded-2xl text-center max-w-md w-full backdrop-blur-sm">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Trí tuệ nhân tạo nghe được:</span>
                        <p className="text-lg font-medium text-slate-200">"{speechResult}"</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
          </div>
        </div>
      </motion.div>
    </div>
  )
}
