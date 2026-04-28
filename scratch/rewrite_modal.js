const fs = require('fs');

const content = fs.readFileSync('src/components/InteractiveListeningModal.tsx', 'utf-8');

// The file is too big to reliably regex everything. Let's just rebuild the component string.

// Extract the imports and PRACTICE_DATA
const beforeComponent = content.split('export default function InteractiveListeningModal')[0];

const componentNew = `export default function InteractiveListeningModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [difficulty, setDifficulty] = useState(100)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userInput, setUserInput] = useState('')
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null)
  const [voiceQ, setVoiceQ] = useState<SpeechSynthesisVoice | null>(null)
  const [voiceA, setVoiceA] = useState<SpeechSynthesisVoice | null>(null)
  const [hintText, setHintText] = useState('')
  const [speed, setSpeed] = useState(1.0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [revealedWordCount, setRevealedWordCount] = useState(0)
  const [contentType, setContentType] = useState<'SENTENCE' | 'QNA' | 'SHORT_TALK'>('SENTENCE')
  
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

  useEffect(() => {
    // Initialize Web Speech Synthesis Voices
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices()
      const englishVoices = voices.filter(v => v.lang.startsWith('en-US') || v.lang.startsWith('en-GB'))
      const preferred = englishVoices.find(v => v.name.includes('Google US English')) || englishVoices[0]
      if (preferred) setVoice(preferred)
      
      const maleVoice = englishVoices.find(v => v.name.toLowerCase().includes('male') || v.name.includes('Alex') || v.name.includes('Google UK English Male')) || englishVoices[1] || englishVoices[0]
      const femaleVoice = englishVoices.find(v => v.name.toLowerCase().includes('female') || v.name.includes('Samantha') || v.name.includes('Google US English')) || englishVoices[0]
      
      if (maleVoice) setVoiceQ(maleVoice)
      if (femaleVoice) setVoiceA(femaleVoice)
    }
    
    loadVoices()
    if (typeof window !== 'undefined' && window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices
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
      const match = w.match(/^([^a-zA-Z0-9]*)([a-zA-Z0-9'-]+)([^a-zA-Z0-9]*)$/);
      if (match) {
        return match[1] + '___' + match[3];
      }
      return '___';
    })
    
    if (contentType === 'QNA' && currentSentence.qna) {
      const qLength = currentSentence.qna.q.split(' ').length;
      const qHint = hintWords.slice(0, qLength).join(' ');
      const aHint = hintWords.slice(qLength).join(' ');
      setHintText(qHint + '\\n' + aHint);
    } else {
      setHintText(hintWords.join(' '));
    }
  }, [currentIndex, difficulty, revealedWordCount, currentSentence, maxReveals, contentType])

  // Reset state
  useEffect(() => {
    setUserInput('')
    setRevealedWordCount(0)
  }, [currentIndex, difficulty])

  const playAudio = () => {
    if (!('speechSynthesis' in window)) {
      toast.error('Trình duyệt của bạn không hỗ trợ đọc văn bản.')
      return
    }
    window.speechSynthesis.cancel()
    
    if (contentType === 'QNA' && currentSentence.qna) {
      const uQ = new SpeechSynthesisUtterance(currentSentence.qna.q)
      if (voiceQ) uQ.voice = voiceQ
      uQ.rate = speed
      uQ.pitch = 1
      
      const uA = new SpeechSynthesisUtterance(currentSentence.qna.a)
      if (voiceA) uA.voice = voiceA
      uA.rate = speed
      uA.pitch = 1
      
      uQ.onstart = () => setIsPlaying(true)
      
      // Delay response slightly
      uQ.onend = () => {
        setTimeout(() => {
          if (document.visibilityState === 'visible') {
             window.speechSynthesis.speak(uA)
          } else {
             setIsPlaying(false)
          }
        }, 300)
      }
      uA.onend = () => setIsPlaying(false)
      
      uQ.onerror = () => setIsPlaying(false)
      uA.onerror = () => setIsPlaying(false)
      
      window.speechSynthesis.speak(uQ)
    } else {
      const utterance = new SpeechSynthesisUtterance(currentSentence.text)
      if (voice) utterance.voice = voice
      utterance.rate = speed
      utterance.pitch = 1
      utterance.onstart = () => setIsPlaying(true)
      utterance.onend = () => setIsPlaying(false)
      utterance.onerror = () => setIsPlaying(false)
      window.speechSynthesis.speak(utterance)
    }
  }

  const cleanText = (text: string) => {
    return text.toLowerCase().replace(/[^a-z0-9\\s]/g, '').trim()
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
        className="relative w-full h-full flex flex-col text-slate-300"
      >
        {/* Background Effects */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-900/40 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-900/40 blur-[120px]" />
        </div>

        {/* Right Content Area */}
        <div className="flex-1 min-h-0 flex flex-col relative z-10 overflow-y-auto">
          {/* Top Title & Close Button */}
          <div className="w-full flex items-center justify-between p-4 md:px-8 border-b border-slate-800/50 bg-[#0B1120]/50 backdrop-blur-md">
            <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-3 tracking-tight">
              <span className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-secondary-400 to-secondary-600 flex items-center justify-center shadow-lg shadow-secondary-500/30">
                <svg className="w-4 h-4 md:w-5 md:h-5 text-slate-900" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
                </svg>
              </span>
              Phòng Nghe Chép <span className="text-secondary-400">Chính Tả</span>
            </h2>
            <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-[#0B1120] hover:bg-[#111827] shadow-sm rounded-full text-slate-400 transition-all border border-slate-800 hover:rotate-90 cursor-pointer">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          
          <div className="w-full min-h-full max-w-5xl mx-auto p-4 md:p-8 flex flex-col pt-8">
            
            {/* 3 Tabs Selection */}
            <div className="flex justify-center mb-8">
              <div className="inline-flex bg-[#111827] border border-slate-800 p-1.5 rounded-2xl shadow-inner">
                <button 
                  onClick={() => setContentType('SENTENCE')}
                  className={\`px-6 py-2.5 rounded-xl font-bold text-sm transition-all \${contentType === 'SENTENCE' ? 'bg-secondary-500 text-[#020617] shadow-md' : 'text-slate-400 hover:text-slate-200'}\`}
                >
                  Câu đơn
                </button>
                <button 
                  onClick={() => setContentType('QNA')}
                  className={\`px-6 py-2.5 rounded-xl font-bold text-sm transition-all \${contentType === 'QNA' ? 'bg-secondary-500 text-[#020617] shadow-md' : 'text-slate-400 hover:text-slate-200'}\`}
                >
                  Hỏi - Đáp
                </button>
                <button 
                  onClick={() => setContentType('SHORT_TALK')}
                  className={\`px-6 py-2.5 rounded-xl font-bold text-sm transition-all \${contentType === 'SHORT_TALK' ? 'bg-secondary-500 text-[#020617] shadow-md' : 'text-slate-400 hover:text-slate-200'}\`}
                >
                  Bài nói ngắn
                </button>
              </div>
            </div>

            {/* Audio Controls Row */}
            <div className="flex items-center justify-center gap-10 mb-8 w-full max-w-sm mx-auto">
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
                
                <button className={\`relative w-20 h-20 bg-gradient-to-b from-[#111827] to-[#0B1120] border border-slate-800 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl backdrop-blur-sm \${isPlaying ? 'scale-105 border-secondary-500/50' : ''}\`}>
                  <div className={\`w-16 h-16 rounded-full flex items-center justify-center shadow-inner transition-colors \${isPlaying ? 'bg-secondary-400' : 'bg-secondary-500'}\`}>
                    {isPlaying ? (
                      <svg className="w-6 h-6 text-[#020617]" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h12v12H6z" /></svg>
                    ) : (
                      <svg className="w-8 h-8 text-[#020617] ml-1.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                    )}
                  </div>
                </button>
              </div>
            </div>

            {/* Dictation Content Area */}
            <div className="w-full flex-1 flex flex-col justify-center items-center pb-8">
              <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-4xl">
                {/* Difficulty Selector */}
                <div className="flex flex-col items-center gap-4">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Độ khó</span>
                  <div className="flex flex-wrap justify-center gap-2">
                    {DIFFICULTIES.map(d => (
                      <button 
                        key={d.value}
                        onClick={() => setDifficulty(d.value)}
                        className={\`cursor-pointer px-5 py-2.5 md:px-6 md:py-3 rounded-xl text-xs md:text-sm font-bold transition-all border \${difficulty === d.value ? 'bg-slate-800 border-slate-700 text-secondary-400 shadow-sm' : 'bg-[#0B1120] border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-400'}\`}
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
                        className={\`w-6 h-6 relative z-10 transition-colors duration-300 \${revealedWordCount >= maxReveals ? 'text-slate-600' : 'text-secondary-400'}\`} 
                        fill="currentColor" viewBox="0 0 24 24"
                      >
                        <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z" />
                      </svg>
                    </button>
                  </div>

                  {/* Hint Display */}
                  <div className="mb-4 pb-4 border-b border-slate-800 pr-12 min-h-[4rem] flex items-center justify-center">
                    <p className="text-base md:text-lg font-medium leading-relaxed text-slate-300 text-center tracking-wide whitespace-pre-line">
                      {hintText || <span className="text-slate-600 italic">Nhấn vào bóng đèn để nhận gợi ý</span>}
                    </p>
                  </div>

                  <textarea 
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    className="w-full h-24 md:h-40 bg-transparent text-white text-lg md:text-2xl lg:text-3xl font-medium placeholder:text-base md:placeholder:text-lg placeholder-slate-600 focus:outline-none resize-none text-center"
                    placeholder="Gõ đầy đủ câu tiếng Anh ở đây..."
                    spellCheck={false}
                  />
                </div>

                <div className="flex gap-4 justify-center mt-4">
                  <button onClick={handleCheckDictation} className="cursor-pointer bg-secondary-500 hover:bg-secondary-400 text-[#020617] px-10 py-4 rounded-2xl text-lg md:text-xl font-bold shadow-lg shadow-secondary-500/20 transition-all hover:-translate-y-1">Kiểm tra kết quả</button>
                </div>
              </div>
            </div>

            {/* Bottom Navigation */}
            <div className="mt-auto pt-8 pb-4 flex flex-col items-center gap-4 w-full max-w-sm mx-auto">
              <div className="flex items-center gap-2">
                <span className={\`w-2 h-2 rounded-full \${isPlaying ? 'bg-secondary-400 animate-pulse' : 'bg-slate-600'}\`} />
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
        </div>
      </motion.div>
    </div>
  )
}
`

fs.writeFileSync('src/components/InteractiveListeningModal.tsx', beforeComponent + componentNew);
