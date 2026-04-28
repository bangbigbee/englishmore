'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'

import { toast } from 'sonner'

const PRACTICE_SENTENCES = [
  { id: 1, text: "The new marketing campaign was very successful.", translation: "Chiến dịch tiếp thị mới đã rất thành công." },
  { id: 2, text: "Please send the report to the manager by Friday.", translation: "Vui lòng gửi báo cáo cho người quản lý trước thứ Sáu." },
  { id: 3, text: "Our company is looking for a new software engineer.", translation: "Công ty của chúng tôi đang tìm kiếm một kỹ sư phần mềm mới." },
  { id: 4, text: "The meeting has been rescheduled for next Monday.", translation: "Cuộc họp đã được dời lại vào thứ Hai tuần sau." },
  { id: 5, text: "We need to review the budget for the upcoming quarter.", translation: "Chúng ta cần xem xét ngân sách cho quý sắp tới." }
];

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  const currentSentence = PRACTICE_SENTENCES[currentIndex]
  const targetWords = currentSentence.text.split(' ')
  const maxReveals = difficulty === 100 ? targetWords.length : Math.max(1, Math.floor(targetWords.length * (difficulty / 100)))
  
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
    if (currentIndex < PRACTICE_SENTENCES.length - 1) {
      setCurrentIndex(prev => prev + 1)
    } else {
      setCurrentIndex(0)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[200] isolate flex bg-slate-950 overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full h-full flex flex-col md:flex-row text-slate-200"
      >
        {/* Background Effects */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-900/10 blur-[120px]" />
        </div>

        {/* Left Sidebar */}
        <div className="w-full md:w-[320px] lg:w-[380px] bg-white/5 border-r border-white/10 p-4 md:p-6 lg:p-8 flex flex-col backdrop-blur-xl z-10">
          <div className="flex items-center justify-between mb-6 md:mb-12">
            <h2 className="text-2xl font-black text-white flex items-center gap-3 tracking-tight">
              <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </span>
              Master<br/><span className="text-blue-500">Listening</span>
            </h2>
            <div className="flex items-center gap-2 md:hidden">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-colors cursor-pointer text-white">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} /></svg>
              </button>
              <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-colors cursor-pointer text-sm">✕</button>
            </div>
          </div>
          
          <div className={`${isMobileMenuOpen ? 'flex' : 'hidden'} md:flex space-y-4 flex-1 flex-col`}>
            <button 
              onClick={() => { setMethod('DICTATION'); setIsMobileMenuOpen(false); }}
              className={`w-full cursor-pointer text-left p-4 md:p-5 rounded-2xl transition-all duration-300 relative overflow-hidden group ${method === 'DICTATION' ? 'bg-blue-500/15 border border-blue-500/40' : 'bg-white/5 border border-white/5 hover:bg-white/10'}`}
            >
              {method === 'DICTATION' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-2xl" />}
              <h3 className={`text-lg font-bold ${method === 'DICTATION' ? 'text-white' : 'text-slate-300'}`}>Nghe Chép Chính Tả</h3>
              <p className="text-[13px] text-slate-400 mt-2 font-medium">Luyện bắt từ khóa & gõ lại toàn bộ câu với các độ khó khác nhau.</p>
            </button>

            <button 
              onClick={() => { setMethod('SHADOWING'); setIsMobileMenuOpen(false); }}
              className={`w-full cursor-pointer text-left p-4 md:p-5 rounded-2xl transition-all duration-300 relative overflow-hidden group ${method === 'SHADOWING' ? 'bg-blue-500/15 border border-blue-500/40' : 'bg-white/5 border border-white/5 hover:bg-white/10'}`}
            >
              {method === 'SHADOWING' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-2xl" />}
              <h3 className={`text-lg font-bold ${method === 'SHADOWING' ? 'text-white' : 'text-slate-300'}`}>Luyện Ngữ Điệu</h3>
              <p className="text-[13px] text-slate-400 mt-2 font-medium">Bắt chước ngữ điệu bản xứ. Trí tuệ nhân tạo sẽ chấm điểm bạn.</p>
            </button>
          </div>
          
          <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:block mt-4 md:mt-auto pt-6 md:pt-8 border-t border-white/10`}>
            <button onClick={onClose} className="w-full cursor-pointer py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-sm transition-colors border border-white/10 flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Thoát phòng tập
            </button>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 min-h-0 flex flex-col relative z-10 overflow-y-auto">
          <button onClick={onClose} className="absolute top-6 right-6 hidden md:flex w-10 h-10 items-center justify-center bg-white/5 hover:bg-white/10 rounded-full text-slate-300 transition-all border border-white/10 hover:rotate-90 z-50 cursor-pointer">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          
          <div className="w-full min-h-full max-w-4xl mx-auto p-6 lg:p-8 flex flex-col">
            
            {/* Header: Progress */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-blue-500 animate-pulse' : 'bg-slate-500'}`} />
                <span className="text-sm font-bold tracking-[0.2em] uppercase text-blue-400">Sentences</span>
              </div>
              <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-full px-4 py-1.5">
                <span className="text-sm font-bold text-white">{currentIndex + 1} <span className="text-slate-500">/ {PRACTICE_SENTENCES.length}</span></span>
                <div className="w-px h-4 bg-white/10" />
                <button onClick={nextSentence} className="cursor-pointer text-sm font-bold text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-wider flex items-center gap-2 group">
                  Next
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </button>
              </div>
            </div>

            {/* Audio Controls Row */}
            <div className="flex items-center justify-center gap-10 mb-6 w-full max-w-sm mx-auto">
              
              {/* Speed Slider Control */}
              <div className="flex flex-col flex-1 items-start">
                <div className="flex items-center justify-between w-full mb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Speed</span>
                  <span className="text-xs font-bold text-blue-400">{speed.toFixed(1)}x</span>
                </div>
                <input 
                  type="range" 
                  min="0.6" max="1.4" step="0.1" 
                  value={speed} 
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              {/* Play Button */}
              <div className="relative group cursor-pointer shrink-0" onClick={playAudio}>
                {isPlaying && (
                  <>
                    <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-40 animate-pulse" />
                    <div className="absolute -inset-4 border-2 border-blue-500/30 rounded-full animate-ping" />
                  </>
                )}
                {!isPlaying && <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-10 group-hover:opacity-30 transition-opacity duration-500" />}
                
                <button className={`relative w-20 h-20 bg-gradient-to-b from-white/10 to-white/5 border border-white/20 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-2xl backdrop-blur-sm ${isPlaying ? 'scale-105 border-blue-500/50' : ''}`}>
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-inner transition-colors ${isPlaying ? 'bg-blue-600' : 'bg-blue-500'}`}>
                    {isPlaying ? (
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h12v12H6z" /></svg>
                    ) : (
                      <svg className="w-8 h-8 text-white ml-1.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                    )}
                  </div>
                </button>
              </div>
            </div>

            {/* Content Based on Method - Flex-1 to push everything centrally */}
            <div className="w-full flex-1 flex flex-col justify-center items-center pb-8">
              
              {method === 'DICTATION' && (
                <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                  
                  {/* Difficulty Selector */}
                  <div className="flex flex-col items-center gap-4">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Độ khó</span>
                    <div className="flex flex-wrap justify-center gap-2">
                      {DIFFICULTIES.map(d => (
                        <button 
                          key={d.value}
                          onClick={() => setDifficulty(d.value)}
                          className={`cursor-pointer px-4 py-2 rounded-xl text-xs font-bold transition-all border ${difficulty === d.value ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'bg-transparent border-white/10 text-slate-400 hover:border-white/30 hover:text-white'}`}
                        >
                          {d.label} <span className="opacity-50 ml-1">{d.value}%</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-sm relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-50" />
                    
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
                            className="absolute inset-0 bg-yellow-400 rounded-full blur-md transition-opacity duration-300"
                            style={{ opacity: 0.6 * (1 - revealedWordCount / maxReveals) }}
                          />
                        )}
                        <svg 
                          className={`w-6 h-6 relative z-10 transition-colors duration-300 ${revealedWordCount >= maxReveals ? 'text-slate-600' : 'text-yellow-400'}`} 
                          fill="currentColor" viewBox="0 0 24 24"
                        >
                          <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z" />
                        </svg>
                      </button>
                    </div>

                    {/* Hint Display */}
                    <div className="mb-4 pb-4 border-b border-white/10 pr-12">
                      <p className="text-base md:text-lg font-medium leading-relaxed text-slate-300 text-center tracking-wide">
                        {hintText}
                      </p>
                    </div>

                    <textarea 
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      className="w-full h-24 md:h-32 bg-transparent text-white text-lg md:text-2xl font-medium placeholder-white/20 focus:outline-none resize-none text-center"
                      placeholder="Gõ toàn bộ câu tiếng Anh vào đây..."
                      spellCheck={false}
                    />
                  </div>

                  <div className="flex gap-4 justify-center mt-4">
                    <button onClick={handleCheckDictation} className="cursor-pointer bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-1">Kiểm tra kết quả</button>
                  </div>
                </div>
              )}

              {method === 'SHADOWING' && (
                <div className="w-full space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700 flex flex-col items-center">
                  
                  <div className="text-center space-y-4 max-w-2xl">
                    <p className="text-2xl md:text-3xl font-bold text-white leading-tight">"{currentSentence.text}"</p>
                    <p className="text-slate-400 font-medium text-lg">{currentSentence.translation}</p>
                  </div>
                  
                  <div className="flex flex-col items-center gap-6 mt-8">
                    <div className="relative group">
                      {isRecording && <div className="absolute inset-0 bg-red-500 rounded-full blur-2xl opacity-40 animate-pulse" />}
                      <button 
                        onMouseDown={startRecording}
                        onMouseUp={stopRecording}
                        onTouchStart={startRecording}
                        onTouchEnd={stopRecording}
                        className={`cursor-pointer relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 border-4 ${isRecording ? 'bg-red-500 border-red-400 scale-110' : 'bg-blue-600 border-blue-500/50 hover:bg-blue-500 shadow-xl shadow-blue-500/20'}`}
                      >
                        <svg className={`w-10 h-10 text-white transition-transform ${isRecording ? 'scale-110' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
                      <div className="mt-4 p-5 bg-white/5 border border-white/10 rounded-2xl text-center max-w-md w-full backdrop-blur-sm">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Trí tuệ nhân tạo nghe được:</span>
                        <p className="text-lg font-medium text-white">"{speechResult}"</p>
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
