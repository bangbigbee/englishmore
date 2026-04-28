'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'

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
  const [feedback, setFeedback] = useState<{type: 'success' | 'error' | '', msg: string}>({type: '', msg: ''})
  const [isRecording, setIsRecording] = useState(false)
  const [speechResult, setSpeechResult] = useState('')
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null)
  const [hintText, setHintText] = useState('')
  const [speed, setSpeed] = useState(1.0)
  
  const currentSentence = PRACTICE_SENTENCES[currentIndex]
  
  const recognitionRef = useRef<any>(null)
  const knobRef = useRef<HTMLDivElement>(null)
  const draggingRef = useRef({ isDragging: false, lastAngle: 0, accumulatedAngle: 0, startSpeed: 1.0 })

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
          setFeedback({ type: 'error', msg: 'Không thể nhận diện giọng nói. Vui lòng thử lại.' })
        }
        
        recognitionRef.current.onend = () => {
            setIsRecording(false)
        }
      }
    }
  }, [])

  // Generate Hint
  useEffect(() => {
    if (difficulty === 100) {
      setHintText('___ '.repeat(currentSentence.text.split(' ').length).trim())
      return
    }
    const words = currentSentence.text.split(' ')
    const numToHide = Math.max(1, Math.floor(words.length * (difficulty / 100)))
    
    // Create consistent random blanks based on sentence id so it doesn't jump around
    // Simple deterministic random
    let seed = currentSentence.id + difficulty
    const random = () => {
      const x = Math.sin(seed++) * 10000
      return x - Math.floor(x)
    }

    const hiddenIndices = new Set<number>()
    while(hiddenIndices.size < numToHide && hiddenIndices.size < words.length) {
      hiddenIndices.add(Math.floor(random() * words.length))
    }
    
    const hint = words.map((w, i) => hiddenIndices.has(i) ? '___' : w).join(' ')
    setHintText(hint)
  }, [currentIndex, difficulty])

  // Reset state
  useEffect(() => {
    setUserInput('')
    setFeedback({type: '', msg: ''})
    setSpeechResult('')
  }, [currentIndex, method, difficulty])

  // Knob interaction
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!draggingRef.current.isDragging || !knobRef.current) return;
      const rect = knobRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * 180 / Math.PI;
      
      let deltaAngle = angle - draggingRef.current.lastAngle;
      if (deltaAngle > 180) deltaAngle -= 360;
      if (deltaAngle < -180) deltaAngle += 360;

      draggingRef.current.accumulatedAngle += deltaAngle;
      draggingRef.current.lastAngle = angle;

      const steps = Math.floor(draggingRef.current.accumulatedAngle / 25); // 25 degrees per 0.1 step
      if (Math.abs(steps) >= 1) {
        setSpeed(prev => {
          let newSpeed = prev + steps * 0.1;
          newSpeed = Math.max(0.7, Math.min(1.5, newSpeed));
          newSpeed = Math.round(newSpeed * 10) / 10;
          return newSpeed;
        });
        draggingRef.current.accumulatedAngle -= steps * 25;
      }
    };

    const handlePointerUp = () => {
      draggingRef.current.isDragging = false;
      document.body.style.userSelect = '';
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
    };

    // Attach dragging methods to ref for use in pointer down
    (knobRef as any).currentHandlePointerDown = (e: React.PointerEvent) => {
      if (!knobRef.current) return;
      const rect = knobRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * 180 / Math.PI;
      draggingRef.current = { isDragging: true, lastAngle: angle, accumulatedAngle: 0, startSpeed: speed };
      document.body.style.userSelect = 'none';
      document.addEventListener('pointermove', handlePointerMove);
      document.addEventListener('pointerup', handlePointerUp);
    };

    return () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
      document.body.style.userSelect = '';
    };
  }, [speed]);

  const playAudio = () => {
    if (!('speechSynthesis' in window)) {
      setFeedback({type: 'error', msg: 'Trình duyệt của bạn không hỗ trợ đọc văn bản.'})
      return
    }
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(currentSentence.text)
    if (voice) utterance.voice = voice
    utterance.rate = speed
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
      setFeedback({ type: 'error', msg: 'Chưa chính xác. Hãy nghe kỹ lại nhé!' })
    }
  }

  const handleShadowingCheck = (transcript: string) => {
    const cleanInput = cleanText(transcript)
    const cleanTarget = cleanText(currentSentence.text)
    
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

  return (
    <div className="fixed inset-0 z-[200] isolate flex bg-[#0B0F19] overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full h-full flex flex-col md:flex-row text-slate-200"
      >
        {/* Background Effects */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary-600/10 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px]" />
        </div>

        {/* Left Sidebar */}
        <div className="w-full md:w-[320px] lg:w-[380px] bg-white/5 border-r border-white/10 p-6 lg:p-8 flex flex-col backdrop-blur-xl z-10">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-2xl font-black text-white flex items-center gap-3 tracking-tight">
              <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </span>
              Master<br/><span className="text-primary-400">Listening</span>
            </h2>
            <button onClick={onClose} className="md:hidden w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-colors">✕</button>
          </div>
          
          <div className="space-y-4 flex-1">
            <button 
              onClick={() => setMethod('DICTATION')}
              className={`w-full text-left p-5 rounded-2xl transition-all duration-300 relative overflow-hidden group ${method === 'DICTATION' ? 'bg-primary-500/20 border border-primary-500/50' : 'bg-white/5 border border-white/5 hover:bg-white/10'}`}
            >
              {method === 'DICTATION' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500 rounded-l-2xl" />}
              <h3 className={`text-lg font-bold ${method === 'DICTATION' ? 'text-white' : 'text-slate-300'}`}>Nghe Chép Chính Tả</h3>
              <p className="text-[13px] text-slate-400 mt-2 font-medium">Luyện bắt từ khóa & gõ lại toàn bộ câu với các độ khó khác nhau.</p>
            </button>

            <button 
              onClick={() => setMethod('SHADOWING')}
              className={`w-full text-left p-5 rounded-2xl transition-all duration-300 relative overflow-hidden group ${method === 'SHADOWING' ? 'bg-blue-500/20 border border-blue-500/50' : 'bg-white/5 border border-white/5 hover:bg-white/10'}`}
            >
              {method === 'SHADOWING' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-2xl" />}
              <h3 className={`text-lg font-bold ${method === 'SHADOWING' ? 'text-white' : 'text-slate-300'}`}>Luyện Ngữ Điệu</h3>
              <p className="text-[13px] text-slate-400 mt-2 font-medium">Bắt chước ngữ điệu bản xứ. Trí tuệ nhân tạo sẽ chấm điểm bạn.</p>
            </button>
          </div>
          
          <div className="mt-auto pt-8 border-t border-white/10">
            <button onClick={onClose} className="w-full py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-sm transition-colors border border-white/10 flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Thoát phòng tập
            </button>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 flex flex-col h-full relative z-10">
          <button onClick={onClose} className="absolute top-6 right-6 hidden md:flex w-10 h-10 items-center justify-center bg-white/5 hover:bg-white/10 rounded-full text-slate-300 transition-all border border-white/10 hover:rotate-90 z-50">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          
          <div className="w-full h-full max-w-4xl mx-auto p-6 lg:p-8 flex flex-col">
            
            {/* Header: Progress */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                <span className="text-sm font-bold tracking-[0.2em] uppercase text-primary-400">Sentences</span>
              </div>
              <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-full px-4 py-1.5">
                <span className="text-sm font-bold text-white">{currentIndex + 1} <span className="text-slate-500">/ {PRACTICE_SENTENCES.length}</span></span>
                <div className="w-px h-4 bg-white/10" />
                <button onClick={nextSentence} className="text-sm font-bold text-primary-400 hover:text-primary-300 transition-colors uppercase tracking-wider flex items-center gap-2 group">
                  Next
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </button>
              </div>
            </div>

            {/* Audio Controls Row */}
            <div className="flex items-center justify-center gap-8 mb-6">
              {/* Play Button */}
              <div className="relative group cursor-pointer shrink-0" onClick={playAudio}>
                <div className="absolute inset-0 bg-primary-500 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
                <button className="relative w-20 h-20 bg-gradient-to-b from-white/10 to-white/5 border border-white/20 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-2xl backdrop-blur-sm">
                  <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center shadow-inner">
                    <svg className="w-8 h-8 text-white ml-1.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                  </div>
                </button>
              </div>

              {/* Speed Knob Dial */}
              <div className="flex flex-col items-center shrink-0">
                <div 
                  ref={knobRef}
                  onPointerDown={(e) => (knobRef as any).currentHandlePointerDown?.(e)}
                  className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center relative cursor-grab active:cursor-grabbing group shadow-inner touch-none"
                >
                  {/* Ticks */}
                  <div className="absolute inset-2 rounded-full border-[3px] border-white/5 border-b-transparent border-l-transparent -rotate-45 pointer-events-none" />
                  
                  {/* Rotating Dial */}
                  <div 
                    className="w-10 h-10 rounded-full bg-gradient-to-b from-slate-700 to-slate-900 shadow-xl border border-white/20 relative"
                    style={{ transform: `rotate(${(speed - 0.7) / (1.5 - 0.7) * 270 - 135}deg)` }}
                  >
                    {/* Indicator Dot */}
                    <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-primary-400 rounded-full shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
                  </div>
                  
                  {/* Speed display tooltip on hover */}
                  <div className="absolute -top-8 bg-black/80 text-primary-400 text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    {speed.toFixed(1)}x
                  </div>
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2 select-none">Tốc độ ({speed.toFixed(1)}x)</span>
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
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${difficulty === d.value ? 'bg-primary-500/20 border-primary-500 text-primary-400' : 'bg-transparent border-white/10 text-slate-400 hover:border-white/30 hover:text-white'}`}
                        >
                          {d.label} <span className="opacity-50 ml-1">{d.value}%</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-sm relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 to-blue-500 opacity-50" />
                    
                    {/* Hint Display */}
                    <div className="mb-4 pb-4 border-b border-white/10">
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

                  <div className="flex gap-4 justify-center">
                    <button onClick={handleCheckDictation} className="bg-primary-500 hover:bg-primary-400 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary-500/20 transition-all hover:-translate-y-1">Kiểm tra kết quả</button>
                    <button onClick={() => setUserInput(currentSentence.text)} className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-8 py-3 rounded-xl font-bold transition-all">Gợi ý đáp án</button>
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
                        className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 border-4 ${isRecording ? 'bg-red-500 border-red-400 scale-110' : 'bg-blue-600 border-blue-500/50 hover:bg-blue-500 shadow-xl shadow-blue-500/20'}`}
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

              {/* Feedback Alert */}
              <div className="h-16 w-full flex items-center justify-center mt-4 shrink-0">
                <AnimatePresence>
                  {feedback.msg && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20, scale: 0.95 }} 
                      animate={{ opacity: 1, y: 0, scale: 1 }} 
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={`p-4 rounded-2xl text-sm md:text-base font-bold flex items-center justify-center gap-3 w-full max-w-md shadow-2xl backdrop-blur-md border ${feedback.type === 'success' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}
                    >
                      <span className="text-2xl">{feedback.type === 'success' ? '🎉' : '💡'}</span>
                      {feedback.msg}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
