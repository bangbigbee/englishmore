'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'

type PracticeItem = { id: number; text: string; translation: string; type: 'SENTENCE' | 'QNA' | 'SHORT_TALK'; qna?: { q: string, a: string } };

type PracticeSet = { id: string; name: string; items: PracticeItem[] };

const PRACTICE_DATA: Record<'SENTENCE' | 'QNA' | 'SHORT_TALK', PracticeSet[]> = {
  SENTENCE: [
    {
      id: 'set-s1',
      name: 'Bộ 1: Giao tiếp Văn phòng',
      items: [
        { id: 1, text: "The new marketing campaign was very successful.", translation: "Chiến dịch tiếp thị mới đã rất thành công.", type: 'SENTENCE' },
        { id: 2, text: "Please send the report to the manager by Friday.", translation: "Vui lòng gửi báo cáo cho người quản lý trước thứ Sáu.", type: 'SENTENCE' },
        { id: 3, text: "Our company is looking for a new software engineer.", translation: "Công ty của chúng tôi đang tìm kiếm một kỹ sư phần mềm mới.", type: 'SENTENCE' },
        { id: 4, text: "The meeting has been rescheduled for next Monday.", translation: "Cuộc họp đã được dời lại vào thứ Hai tuần sau.", type: 'SENTENCE' },
        { id: 5, text: "We need to review the budget for the upcoming quarter.", translation: "Chúng ta cần xem xét ngân sách cho quý sắp tới.", type: 'SENTENCE' }
      ]
    },
    {
      id: 'set-s2',
      name: 'Bộ 2: Dịch vụ Khách hàng',
      items: [
        { id: 6, text: "Your order will be shipped within two business days.", translation: "Đơn hàng của bạn sẽ được giao trong vòng hai ngày làm việc.", type: 'SENTENCE' },
        { id: 7, text: "We apologize for the delay in processing your request.", translation: "Chúng tôi xin lỗi vì sự chậm trễ trong việc xử lý yêu cầu của bạn.", type: 'SENTENCE' },
        { id: 8, text: "Please contact our support team if you have any questions.", translation: "Vui lòng liên hệ nhóm hỗ trợ của chúng tôi nếu bạn có bất kỳ câu hỏi nào.", type: 'SENTENCE' },
        { id: 9, text: "The warranty covers parts and labor for one year.", translation: "Bảo hành bao gồm các bộ phận và nhân công trong một năm.", type: 'SENTENCE' },
        { id: 10, text: "Thank you for choosing our services.", translation: "Cảm ơn bạn đã lựa chọn dịch vụ của chúng tôi.", type: 'SENTENCE' }
      ]
    },
    {
      id: 'set-s3',
      name: 'Bộ 3: Du lịch & Khách sạn',
      items: [
        { id: 11, text: "I would like to book a double room for three nights.", translation: "Tôi muốn đặt một phòng đôi trong ba đêm.", type: 'SENTENCE' },
        { id: 12, text: "Is breakfast included in the price of the room?", translation: "Bữa sáng có được bao gồm trong giá phòng không?", type: 'SENTENCE' },
        { id: 13, text: "The flight to Paris will depart from gate number four.", translation: "Chuyến bay tới Paris sẽ khởi hành từ cổng số bốn.", type: 'SENTENCE' },
        { id: 14, text: "Please fasten your seatbelt and return your seat to the upright position.", translation: "Vui lòng thắt dây an toàn và đưa ghế về vị trí thẳng đứng.", type: 'SENTENCE' },
        { id: 15, text: "Can you recommend a good restaurant near the hotel?", translation: "Bạn có thể giới thiệu một nhà hàng tốt gần khách sạn không?", type: 'SENTENCE' }
      ]
    }
  ],
  QNA: [
    {
      id: 'set-q1',
      name: 'Bộ 1: Lịch trình & Thời gian',
      items: [
        { id: 101, text: "When is the next train to London? It leaves in ten minutes.", qna: { q: "When is the next train to London?", a: "It leaves in ten minutes." }, translation: "Hỏi: Chuyến tàu tiếp theo đến London là khi nào? Đáp: Nó khởi hành trong mười phút nữa.", type: 'QNA' },
        { id: 102, text: "Who is presenting the sales report? Mr. Smith will do it.", qna: { q: "Who is presenting the sales report?", a: "Mr. Smith will do it." }, translation: "Hỏi: Ai sẽ trình bày báo cáo doanh số? Đáp: Ông Smith sẽ làm việc đó.", type: 'QNA' },
        { id: 103, text: "Are you going to the company picnic? Yes, I wouldn't miss it.", qna: { q: "Are you going to the company picnic?", a: "Yes, I wouldn't miss it." }, translation: "Hỏi: Bạn có đi dã ngoại cùng công ty không? Đáp: Có, tôi sẽ không bỏ lỡ đâu.", type: 'QNA' },
        { id: 104, text: "When will the repairs be finished? By tomorrow afternoon.", qna: { q: "When will the repairs be finished?", a: "By tomorrow afternoon." }, translation: "Hỏi: Khi nào việc sửa chữa sẽ hoàn tất? Đáp: Vào chiều ngày mai.", type: 'QNA' },
        { id: 105, text: "How long does the flight take? About three hours.", qna: { q: "How long does the flight take?", a: "About three hours." }, translation: "Hỏi: Chuyến bay kéo dài bao lâu? Đáp: Khoảng ba giờ.", type: 'QNA' }
      ]
    },
    {
      id: 'set-q2',
      name: 'Bộ 2: Trao đổi Công việc',
      items: [
        { id: 106, text: "Where did you put the file? It is on your desk.", qna: { q: "Where did you put the file?", a: "It is on your desk." }, translation: "Hỏi: Bạn đã để tập tin ở đâu? Đáp: Nó ở trên bàn của bạn.", type: 'QNA' },
        { id: 107, text: "Why is the office so cold? The heater is broken.", qna: { q: "Why is the office so cold?", a: "The heater is broken." }, translation: "Hỏi: Tại sao văn phòng lại lạnh như vậy? Đáp: Lò sưởi bị hỏng.", type: 'QNA' },
        { id: 108, text: "Can you help me with this project? Sure, I have some free time.", qna: { q: "Can you help me with this project?", a: "Sure, I have some free time." }, translation: "Hỏi: Bạn có thể giúp tôi dự án này không? Đáp: Chắc chắn rồi, tôi có thời gian rảnh.", type: 'QNA' },
        { id: 109, text: "Did you talk to the client? Yes, I called them this morning.", qna: { q: "Did you talk to the client?", a: "Yes, I called them this morning." }, translation: "Hỏi: Bạn đã nói chuyện với khách hàng chưa? Đáp: Rồi, tôi đã gọi cho họ sáng nay.", type: 'QNA' },
        { id: 110, text: "How much does this laptop cost? It is around eight hundred dollars.", qna: { q: "How much does this laptop cost?", a: "It is around eight hundred dollars." }, translation: "Hỏi: Chiếc máy tính xách tay này giá bao nhiêu? Đáp: Nó khoảng tám trăm đô la.", type: 'QNA' }
      ]
    }
  ],
  SHORT_TALK: [
    {
      id: 'set-st1',
      name: 'Bộ 1: Thông báo & Sự kiện',
      items: [
        { id: 201, text: "Welcome to the annual tech conference. We have a great lineup of speakers today. Please make sure to visit our sponsor booths during the breaks.", translation: "Chào mừng bạn đến với hội nghị công nghệ thường niên. Chúng ta có một đội ngũ diễn giả tuyệt vời ngày hôm nay. Vui lòng đảm bảo ghé thăm các gian hàng tài trợ của chúng tôi trong giờ nghỉ.", type: 'SHORT_TALK' },
        { id: 202, text: "Attention all passengers for flight 789 to Tokyo. Your flight is delayed by two hours due to severe weather conditions. We apologize for the inconvenience.", translation: "Xin thông báo tới tất cả hành khách của chuyến bay 789 đi Tokyo. Chuyến bay của bạn bị hoãn hai giờ do điều kiện thời tiết khắc nghiệt. Chúng tôi xin lỗi vì sự bất tiện này.", type: 'SHORT_TALK' }
      ]
    },
    {
      id: 'set-st2',
      name: 'Bộ 2: Tin tức & Báo cáo',
      items: [
        { id: 203, text: "Good morning and welcome to the local news. Today, city officials will open the new public library downtown. The opening ceremony begins at noon.", translation: "Chào buổi sáng và chào mừng đến với bản tin địa phương. Hôm nay, các quan chức thành phố sẽ khai trương thư viện công cộng mới ở trung tâm. Lễ khai trương bắt đầu vào buổi trưa.", type: 'SHORT_TALK' },
        { id: 204, text: "This is a reminder for all employees. The fire alarm testing will take place tomorrow at ten o'clock. You do not need to evacuate the building.", translation: "Đây là lời nhắc nhở đối với tất cả nhân viên. Việc kiểm tra báo cháy sẽ diễn ra vào ngày mai lúc mười giờ. Bạn không cần phải sơ tán khỏi tòa nhà.", type: 'SHORT_TALK' }
      ]
    }
  ]
};

const DIFFICULTIES = [
  { label: 'Beginner', value: 20 },
  { label: 'Cơ bản', value: 40 },
  { label: 'Trung cấp', value: 60 },
  { label: 'Nâng cao', value: 80 },
  { label: 'Hardcore', value: 100 }
]

type HintWord = { word: string; highlighted: boolean; isQnaBreak?: boolean };

export default function InteractiveListeningModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [difficulty, setDifficulty] = useState(40)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userInputs, setUserInputs] = useState<Record<string, string>>({})
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null)
  const [voiceQ, setVoiceQ] = useState<SpeechSynthesisVoice | null>(null)
  const [voiceA, setVoiceA] = useState<SpeechSynthesisVoice | null>(null)
  const [hintWordsList, setHintWordsList] = useState<HintWord[]>([])
  const gearSoundRef = useRef<HTMLAudioElement | null>(null)
  const [speed, setSpeed] = useState(1.0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [revealedWordCount, setRevealedWordCount] = useState(0)
  const [showHintModal, setShowHintModal] = useState(false)
  const [showResultModal, setShowResultModal] = useState(false)
  const [setScore, setSetScore] = useState({ correct: 0, total: 0 })
  const [completedSentences, setCompletedSentences] = useState<Set<string>>(new Set())
  const [contentType, setContentType] = useState<'SENTENCE' | 'QNA' | 'SHORT_TALK'>('SENTENCE')
  const [selectedSetId, setSelectedSetId] = useState<string>('set-s1')
  const audioRefs = useRef<{qAudio: HTMLAudioElement | null, aAudio: HTMLAudioElement | null, timeout: NodeJS.Timeout | null}>({ qAudio: null, aAudio: null, timeout: null })
  const speedScrollRef = useRef<HTMLDivElement>(null)
  const difficultyScrollRef = useRef<HTMLDivElement>(null)
  
  // Scroll to active values on render
  useEffect(() => {
    if (isOpen && !isReady) {
      setTimeout(() => {
        if (speedScrollRef.current) {
          const activeSpeed = speedScrollRef.current.querySelector(`[data-value="${speed}"]`);
          if (activeSpeed) activeSpeed.scrollIntoView({ behavior: 'auto', block: 'center' });
        }
        if (difficultyScrollRef.current) {
          const activeDifficulty = difficultyScrollRef.current.querySelector(`[data-value="${difficulty}"]`);
          if (activeDifficulty) activeDifficulty.scrollIntoView({ behavior: 'auto', inline: 'center', block: 'nearest' });
        }
      }, 50);
    }
  }, [isOpen, isReady])
  
  const currentCategorySets = PRACTICE_DATA[contentType]
  const currentSet = currentCategorySets.find(s => s.id === selectedSetId) || currentCategorySets[0]
  const currentData = currentSet.items
  const currentSentence = currentData[currentIndex] || currentData[0]
  const currentInputKey = `${selectedSetId}-${currentIndex}`
  const userInput = userInputs[currentInputKey] || ''
  const setUserInput = (val: string) => setUserInputs(prev => ({ ...prev, [currentInputKey]: val }))
  
  const targetWords = currentSentence.text.split(' ')
  const maxReveals = difficulty === 100 ? targetWords.length : Math.max(1, Math.floor(targetWords.length * (difficulty / 100)))
  
  // Reset index when content type changes
  useEffect(() => {
    setCurrentIndex(0)
    setRevealedWordCount(0)
    setHintWordsList([])
    setIsPlaying(false)
    setIsReady(false)
    setSelectedSetId(PRACTICE_DATA[contentType][0].id)
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
    if (typeof Audio !== 'undefined') {
      gearSoundRef.current = new Audio('/audio/gear-click.wav');
      gearSoundRef.current.volume = 0.4;
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
      if (!hiddenIndices.has(i)) return { word: w, highlighted: false };
      // If word was hidden but is now revealed by clicking, show it
      if (indicesToReveal.has(i)) return { word: w, highlighted: true };
      // Otherwise keep it hidden
      const match = w.match(/^([^a-zA-Z0-9]*)([a-zA-Z0-9'-]+)([^a-zA-Z0-9]*)$/);
      if (match) {
        return { word: match[1] + '___' + match[3], highlighted: false };
      }
      return { word: '___', highlighted: false };
    })
    
    if (contentType === 'QNA' && currentSentence.qna) {
      const qLength = currentSentence.qna.q.split(' ').length;
      setHintWordsList([
        ...hintWords.slice(0, qLength),
        { word: '', highlighted: false, isQnaBreak: true },
        ...hintWords.slice(qLength)
      ]);
    } else {
      setHintWordsList(hintWords);
    }
  }, [currentIndex, difficulty, revealedWordCount, currentSentence, maxReveals, contentType])

  // Reset state and stop audio
  useEffect(() => {
    setRevealedWordCount(0)
    
    // Cleanup any playing audio when switching sentence
    window.speechSynthesis.cancel()
    if (audioRefs.current.timeout) {
      clearTimeout(audioRefs.current.timeout)
    }
    setIsPlaying(false)
    
    return () => {
      window.speechSynthesis.cancel()
      if (audioRefs.current.timeout) clearTimeout(audioRefs.current.timeout)
    }
  }, [currentIndex, difficulty, contentType])

  const playAudio = () => {
    if (!('speechSynthesis' in window)) {
      toast.error('Trình duyệt của bạn không hỗ trợ đọc văn bản.')
      return
    }
    window.speechSynthesis.cancel()
    if (audioRefs.current.timeout) {
      clearTimeout(audioRefs.current.timeout)
    }
    
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
        audioRefs.current.timeout = setTimeout(() => {
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
    return text.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim()
  }

  const handleCheckDictation = async () => {
    const cleanInput = cleanText(userInput)
    const cleanTarget = cleanText(currentSentence.text)
    
    if (cleanInput === cleanTarget) {
      toast.success('Chính xác hoàn toàn! +2 ⭐', { position: 'top-center' })
      try {
        await fetch('/api/toeic/dictation/reward', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'sentence', referenceId: `${selectedSetId}-${currentSentence.id}` })
        })
      } catch (err) {}
    } else {
      toast.error('Chưa chính xác. Hãy nghe kỹ lại nhé!', { position: 'top-center' })
    }
  }

  const handleFinishSet = async () => {
    let correctCount = 0;
    currentData.forEach((item, index) => {
       const inputKey = `${selectedSetId}-${index}`
       const input = userInputs[inputKey] || ''
       if (cleanText(input) === cleanText(item.text)) correctCount++;
    });
    
    setSetScore({ correct: correctCount, total: currentData.length });
    setShowResultModal(true);

    const percent = correctCount / currentData.length;
    if (percent >= 0.6) {
      const finishKey = `${selectedSetId}-${difficulty}`
      if (!completedSentences.has(finishKey)) {
        setCompletedSentences(prev => new Set(prev).add(finishKey))
        try {
          await fetch('/api/toeic/dictation/reward', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'complete', referenceId: finishKey })
          })
        } catch (err) {}
      }
    }
  }

  const nextSentence = async () => {
    if (currentIndex < currentData.length - 1) {
      setCurrentIndex(prev => prev + 1)
    } else {
      await handleFinishSet()
    }
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-[200] isolate flex bg-[#020617] overflow-hidden overscroll-none touch-none bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: 'linear-gradient(to bottom, rgba(2,6,23,0.7), rgba(2,6,23,0.95)), url(/images/dictation-bg.png)' }}
    >
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
        <div className={`flex-1 min-h-0 flex flex-col relative z-10 overscroll-none touch-pan-y ${isReady ? 'overflow-y-auto' : 'overflow-hidden'}`}>
          {/* Top Title & Close Button */}
          <div className="w-full flex items-center justify-between p-4 md:px-8 border-b border-slate-800/50 bg-[#0B1120]/50 backdrop-blur-md">
            <h2 className="text-lg md:text-2xl font-black text-white flex items-center gap-3 tracking-tight">
              <span className="w-8 h-8 md:w-10 md:h-10 shrink-0 rounded-xl bg-gradient-to-br from-slate-200 to-white flex items-center justify-center shadow-lg shadow-white/20">
                <svg className="w-4 h-4 md:w-5 md:h-5 text-slate-900" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
                </svg>
              </span>
              <span className="flex flex-wrap leading-tight gap-x-1.5">Phòng Nghe Chép <span className="text-white">Chính Tả</span></span>
            </h2>
            <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-[#0B1120] hover:bg-[#111827] shadow-sm rounded-full text-slate-400 transition-all border border-slate-800 hover:rotate-90 cursor-pointer">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          
          <div className={`w-full max-w-5xl mx-auto p-4 md:p-8 flex flex-col ${isReady ? 'min-h-full pt-8' : 'h-full justify-center pt-2'}`}>
            
            {/* 3 Tabs Selection */}
            <div className={`flex justify-center shrink-0 ${isReady ? 'mb-8' : 'mb-4'}`}>
              <div className="inline-flex bg-[#111827] border border-slate-800 p-1.5 rounded-2xl shadow-inner overflow-x-auto w-full md:w-auto custom-scrollbar">
                <button 
                  onClick={() => setContentType('SENTENCE')}
                  className={`flex-1 md:flex-none whitespace-nowrap px-3 md:px-6 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all ${contentType === 'SENTENCE' ? 'bg-white text-[#020617] shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  Câu đơn
                </button>
                <button 
                  onClick={() => setContentType('QNA')}
                  className={`flex-1 md:flex-none whitespace-nowrap px-3 md:px-6 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all ${contentType === 'QNA' ? 'bg-white text-[#020617] shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  Hỏi - Đáp
                </button>
                <button 
                  onClick={() => setContentType('SHORT_TALK')}
                  className={`flex-1 md:flex-none whitespace-nowrap px-3 md:px-6 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all ${contentType === 'SHORT_TALK' ? 'bg-white text-[#020617] shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  Bài nói ngắn
                </button>
              </div>
            </div>

            {!isReady ? (
              <div className="w-full flex-1 flex flex-col items-center justify-center space-y-6 md:space-y-10 animate-in fade-in zoom-in-95 duration-500">
                <div className="text-center w-full max-w-sm">
                  <h3 className="text-white text-xl md:text-2xl font-black mb-6 md:mb-8 tracking-wide">Cài đặt bài nghe</h3>
                  
                  {/* Set Selector */}
                  <div className="w-full flex flex-col items-center mb-6 md:mb-8">
                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3">Bộ Đề (Tập)</span>
                    <select 
                      value={selectedSetId}
                      onChange={(e) => setSelectedSetId(e.target.value)}
                      className="w-full md:w-3/4 bg-[#0B1120] border border-slate-700 text-white font-bold text-sm md:text-base px-4 py-3.5 rounded-xl shadow-inner focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/50 appearance-none text-center cursor-pointer transition-colors hover:border-slate-600"
                    >
                      {currentCategorySets.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex flex-col md:flex-row items-center justify-center md:gap-12 w-full mb-6 md:mb-10">
                    {/* Speed Picker (Vertical iOS style) */}
                    <div className="flex flex-col items-center mb-6 md:mb-0">
                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-4">Tốc độ (Speed)</span>
                    <div className="relative w-40 h-36 overflow-hidden flex justify-center before:absolute before:inset-x-0 before:top-0 before:h-12 before:bg-gradient-to-b before:from-[#020617] before:to-transparent before:z-10 after:absolute after:inset-x-0 after:bottom-0 after:h-12 after:bg-gradient-to-t after:from-[#020617] after:to-transparent after:z-10 rounded-xl bg-[#0B1120] border border-slate-800 shadow-inner">
                      <div className="absolute top-1/2 -mt-6 h-12 inset-x-2 rounded-lg border-y-2 border-primary-500/50 bg-primary-900/10 pointer-events-none shadow-[0_0_15px_rgba(59,130,246,0.1)]" />
                      <div 
                        ref={speedScrollRef}
                        className="overflow-y-auto snap-y snap-mandatory h-full w-full scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] overscroll-contain touch-pan-y"
                        onScroll={(e) => {
                          const el = e.currentTarget;
                          const center = el.scrollTop + el.clientHeight / 2;
                          const children = Array.from(el.children);
                          children.forEach((child: any) => {
                            if (child.dataset.value) {
                              const childCenter = child.offsetTop + child.clientHeight / 2 - el.offsetTop;
                              if (Math.abs(childCenter - center) < 24) { // h-12 is 48px
                                const val = parseFloat(child.dataset.value);
                                if (speed !== val) {
                                  setSpeed(val);
                                  if (gearSoundRef.current) {
                                    gearSoundRef.current.currentTime = 0;
                                    gearSoundRef.current.play().catch(() => {});
                                  }
                                }
                              }
                            }
                          });
                        }}
                      >
                        <div className="h-[48px] shrink-0" />
                        {[0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4].map(s => (
                          <div 
                            key={s} 
                            data-value={s} 
                            onClick={(e) => { setSpeed(s); e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'center' }); }} 
                            className={`h-[48px] flex items-center justify-center snap-center cursor-pointer transition-all duration-300 ${speed === s ? 'text-white font-black text-2xl scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'text-slate-600 font-bold text-lg'}`}
                          >
                            {s.toFixed(1)}x
                          </div>
                        ))}
                        <div className="h-[48px] shrink-0" />
                      </div>
                    </div>
                  </div>

                    {/* Difficulty Picker (Horizontal Swipe) */}
                    <div className="flex flex-col items-center w-full max-w-[280px]">
                      <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-4">Độ khó</span>
                      <div className="w-full relative flex justify-center overflow-hidden">
                         <div 
                           ref={difficultyScrollRef}
                           className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] overscroll-contain w-full h-32 items-center touch-pan-x"
                           onScroll={(e) => {
                             const el = e.currentTarget;
                             const center = el.scrollLeft + el.clientWidth / 2;
                             const children = Array.from(el.children);
                             children.forEach((child: any) => {
                               if (child.dataset.value) {
                                 const childCenter = child.offsetLeft + child.clientWidth / 2 - el.offsetLeft;
                                 if (Math.abs(childCenter - center) < 40) { 
                                   const val = parseInt(child.dataset.value);
                                   if (difficulty !== val) {
                                     setDifficulty(val);
                                     if (gearSoundRef.current) {
                                       gearSoundRef.current.currentTime = 0;
                                       gearSoundRef.current.play().catch(() => {});
                                     }
                                   }
                                 }
                               }
                             });
                           }}
                         >
                           <div className="w-[calc(50%-4.5rem)] shrink-0" />
                           {DIFFICULTIES.map(d => (
                             <div 
                               key={d.value}
                               data-value={d.value}
                               onClick={(e) => { setDifficulty(d.value); e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' }); }}
                               className={`snap-center shrink-0 w-36 h-24 mx-2 flex flex-col items-center justify-center rounded-2xl cursor-pointer transition-all duration-300 ${difficulty === d.value ? 'bg-slate-800 border border-slate-500 text-white shadow-xl scale-110 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]' : 'bg-[#0B1120] border border-slate-800 text-slate-600 scale-90 opacity-60 hover:opacity-80 hover:bg-[#111827]'}`}
                             >
                               <span className="text-[16px] font-bold">{d.label}</span>
                               <span className="opacity-70 text-[11px] bg-black/20 px-3 py-0.5 rounded-full mt-2 font-bold">{d.value}%</span>
                             </div>
                           ))}
                           <div className="w-[calc(50%-4.5rem)] shrink-0" />
                         </div>
                      </div>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setIsReady(true)}
                  className="px-12 py-4 rounded-full font-black uppercase tracking-widest text-sm text-[#020617] bg-white hover:bg-slate-200 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] hover:-translate-y-1 active:translate-y-0"
                >
                  Sẵn sàng
                </button>
              </div>
            ) : (
              <div className="w-full flex-1 flex flex-col justify-center items-center pb-8 animate-in fade-in duration-700">
                {/* Audio Controls Row */}
                <div className="flex items-center justify-center gap-6 md:gap-10 mb-8 w-full max-w-sm mx-auto px-4">
                  {/* Speed Badge */}
                  <div className="flex flex-col items-center bg-[#0B1120] px-4 py-2 rounded-xl border border-slate-800 cursor-pointer hover:bg-slate-800 transition-colors" onClick={() => setIsReady(false)}>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Speed</span>
                    <span className="text-sm font-black text-white">{speed.toFixed(1)}x</span>
                  </div>

                  {/* Play Button */}
                  <div className="relative group cursor-pointer shrink-0" onClick={playAudio}>
                    {isPlaying && (
                      <>
                        <div className="absolute inset-0 bg-white rounded-full blur-xl opacity-40 animate-pulse" />
                        <div className="absolute -inset-4 border-2 border-white/30 rounded-full animate-ping" />
                      </>
                    )}
                    {!isPlaying && <div className="absolute inset-0 bg-white rounded-full blur-xl opacity-10 group-hover:opacity-20 transition-opacity duration-500" /> }
                    
                    <button className={`relative w-20 h-20 bg-gradient-to-b from-[#111827] to-[#0B1120] border border-slate-800 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl backdrop-blur-sm ${isPlaying ? 'scale-105 border-white/50' : ''}`}>
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-inner transition-colors ${isPlaying ? 'bg-slate-200' : 'bg-white'}`}>
                        {isPlaying ? (
                          <svg className="w-6 h-6 text-[#020617]" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h12v12H6z" /></svg>
                        ) : (
                          <svg className="w-8 h-8 text-[#020617] ml-1.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                        )}
                      </div>
                    </button>
                  </div>
                  
                  {/* Difficulty Badge */}
                  <div className="flex flex-col items-center bg-[#0B1120] px-4 py-2 rounded-xl border border-slate-800 cursor-pointer hover:bg-slate-800 transition-colors" onClick={() => setIsReady(false)}>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Level</span>
                    <span className="text-sm font-black text-white">{DIFFICULTIES.find(d => d.value === difficulty)?.label}</span>
                  </div>
                </div>

                <div className="w-full space-y-8 max-w-4xl">
                  <div className="w-full bg-[#111827] border border-slate-800 rounded-3xl p-6 md:p-8 backdrop-blur-sm relative overflow-hidden shadow-xl">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-slate-400 to-white opacity-50" />
                    
                    {/* Progressive Hint Lightbulb & Check Result */}
                    <div className="absolute top-4 right-3 md:right-4 z-20 flex items-center gap-2 md:gap-4">
                      <button 
                        onClick={handleCheckDictation}
                        className="cursor-pointer text-xs md:text-sm font-black text-[#020617] uppercase tracking-widest transition-all bg-amber-400 hover:bg-amber-300 px-4 md:px-6 py-2 rounded-xl shadow-[0_0_15px_rgba(251,191,36,0.3)] hover:scale-105 active:scale-95"
                      >
                        Kiểm tra
                      </button>
                      <button 
                        onClick={() => {
                          if (revealedWordCount < maxReveals) {
                            setShowHintModal(true);
                          }
                        }}
                        disabled={revealedWordCount >= maxReveals}
                        className="group cursor-pointer disabled:cursor-not-allowed relative flex items-center justify-center p-2 rounded-full transition-all bg-[#0B1120] border border-slate-800 hover:bg-slate-800"
                      >
                        {revealedWordCount < maxReveals && (
                          <div 
                            className="absolute inset-0 bg-white rounded-full blur-md transition-opacity duration-300"
                            style={{ opacity: 0.6 * (1 - revealedWordCount / maxReveals) }}
                          />
                        )}
                        <svg 
                          className={`w-6 h-6 relative z-10 transition-colors duration-300 ${revealedWordCount >= maxReveals ? 'text-slate-600' : 'text-amber-400 group-hover:text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]'}`} 
                          fill="currentColor" viewBox="0 0 24 24"
                        >
                          <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z" />
                        </svg>
                      </button>
                    </div>

                    {/* Hint Display */}
                    <div className="mt-12 md:mt-0 mb-4 pb-4 border-b border-slate-800 pr-0 md:pr-40 min-h-[4rem] flex items-center justify-center">
                      <p className="text-base md:text-lg font-medium leading-relaxed text-slate-300 text-center tracking-wide px-2">
                        {hintWordsList.length > 0 ? hintWordsList.map((hw, i) => (
                          hw.isQnaBreak ? <br key={`br-${i}`} className="my-2 block" /> : 
                          <span key={i} className={hw.highlighted ? "text-amber-400 font-bold drop-shadow-[0_0_10px_rgba(251,191,36,0.4)] transition-colors duration-500" : ""}>
                            {hw.word}{' '}
                          </span>
                        )) : <span className="text-slate-600 italic">Nhấn vào bóng đèn để nhận gợi ý</span>}
                      </p>
                    </div>

                    <textarea 
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      className="w-full h-24 md:h-40 bg-transparent text-white text-lg md:text-xl lg:text-2xl font-medium placeholder:text-sm md:placeholder:text-base placeholder-slate-600 focus:outline-none resize-none text-center custom-scrollbar"
                      placeholder="Gõ đầy đủ câu tiếng Anh ở đây. Phương pháp này đòi hỏi bạn phải gõ đầy đủ câu mới có hiệu quả. Cố gắng lên bạn nhé"
                      spellCheck={false}
                    />
                  </div>

                  {/* Bottom Navigation */}
                  <div className="flex justify-center mt-6 w-full max-w-sm mx-auto">
                    <div className="flex items-center justify-between w-full bg-[#111827] border border-slate-800 shadow-sm rounded-full p-1.5">
                      <button 
                        onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                        disabled={currentIndex === 0}
                        className="cursor-pointer text-sm font-bold text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all uppercase tracking-wider flex items-center justify-center w-24 h-10 rounded-full group"
                      >
                        <svg className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Prev
                      </button>
                      
                      <span className="text-sm font-bold text-slate-200">{currentIndex + 1} <span className="text-slate-500">/ {currentData.length}</span></span>
                      
                      <button 
                        onClick={nextSentence} 
                        className="cursor-pointer text-sm font-bold text-[#020617] bg-white hover:bg-slate-200 transition-all uppercase tracking-wider flex items-center justify-center w-24 h-10 rounded-full group shadow-md shadow-white/20"
                      >
                        Next
                        <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Hint Modal */}
        <AnimatePresence>
          {showHintModal && (
            <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-[#020617]/80 backdrop-blur-md" onClick={() => setShowHintModal(false)} />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative bg-[#111827] border border-slate-700 rounded-3xl p-6 md:p-8 w-full max-w-sm text-center shadow-2xl"
              >
                {revealedWordCount === 0 ? (
                  <>
                    <div className="text-5xl mb-4">💡</div>
                    <h3 className="text-xl md:text-2xl font-black text-white mb-3">Gợi ý từ đầu tiên</h3>
                    <p className="text-slate-300 text-sm md:text-base mb-8 leading-relaxed">
                      Mình sẽ giúp bạn mở từ đầu tiên! Cố gắng tập trung nghe ở lần tiếp theo nha!
                    </p>
                    <button 
                      onClick={() => { setRevealedWordCount(prev => prev + 1); setShowHintModal(false); }}
                      className="w-full bg-amber-400 hover:bg-amber-300 text-[#020617] font-black py-4 rounded-xl shadow-lg transition-all active:scale-95 text-lg"
                    >
                      Lật từ
                    </button>
                  </>
                ) : (
                  <>
                    <div className="text-5xl mb-4">🥺</div>
                    <h3 className="text-xl md:text-2xl font-black text-white mb-3">Đừng bỏ cuộc nhé!</h3>
                    <p className="text-slate-300 text-sm md:text-base mb-8 leading-relaxed">
                      Bạn cố gắng nghe thêm vài lần nữa rồi hãy nhờ trợ giúp nhé?
                    </p>
                    <div className="flex flex-col gap-3">
                      <button 
                        onClick={() => { playAudio(); setShowHintModal(false); }}
                        className="w-full bg-[#0B1120] border border-slate-700 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition-all active:scale-95"
                      >
                        🔊 Nghe lại
                      </button>
                      <button 
                        onClick={() => { setRevealedWordCount(prev => prev + 1); setShowHintModal(false); }}
                        className="w-full bg-amber-400 hover:bg-amber-300 text-[#020617] font-black py-3.5 rounded-xl shadow-lg transition-all active:scale-95"
                      >
                        Lật từ
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Result Modal */}
        <AnimatePresence>
          {showResultModal && (
            <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-[#020617]/80 backdrop-blur-md" onClick={() => setShowResultModal(false)} />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative bg-[#111827] border border-slate-700 rounded-3xl p-6 md:p-8 w-full max-w-sm text-center shadow-2xl overflow-hidden"
              >
                <button 
                  onClick={() => setShowResultModal(false)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                
                <div className="text-6xl mb-4">
                  {setScore.correct / setScore.total >= 0.6 ? '🏆' : '💪'}
                </div>
                <h3 className="text-xl md:text-2xl font-black text-white mb-2">
                  {setScore.correct / setScore.total >= 0.6 ? 'Hoàn thành xuất sắc!' : 'Hãy cố gắng hơn nhé!'}
                </h3>
                
                <div className="bg-[#0B1120] border border-slate-800 rounded-2xl p-4 mb-6 mt-4">
                  <p className="text-slate-400 text-sm mb-1 uppercase tracking-wider font-bold">Kết quả của bạn</p>
                  <p className="text-4xl font-black text-amber-400">
                    {setScore.correct} <span className="text-xl text-slate-500">/ {setScore.total}</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-2 px-2">
                    {setScore.correct / setScore.total >= 0.6 
                      ? 'Bạn đã đạt đủ điều kiện nhận thưởng sao (≥ 60%)!' 
                      : 'Cần đúng ít nhất 60% để nhận phần thưởng sao.'}
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <button 
                    onClick={() => { 
                      setCurrentIndex(0); 
                      // Clear inputs for this set
                      const newInputs = { ...userInputs };
                      for (let i = 0; i < currentData.length; i++) delete newInputs[`${selectedSetId}-${i}`];
                      setUserInputs(newInputs);
                      setShowResultModal(false); 
                    }}
                    className="w-full bg-amber-400 hover:bg-amber-300 text-[#020617] font-black py-3.5 rounded-xl shadow-lg transition-all active:scale-95"
                  >
                    🔄 Làm lại từ đầu
                  </button>
                  <button 
                    onClick={() => { setIsReady(false); setShowResultModal(false); }}
                    className="w-full bg-[#0B1120] border border-slate-700 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition-all active:scale-95"
                  >
                    📚 Chọn chủ đề khác
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
