const fs = require('fs');
let content = fs.readFileSync('src/components/InteractiveListeningModal.tsx', 'utf-8');

// 1. Update PracticeItem Type and PRACTICE_DATA
const oldDataBlock = `type PracticeItem = { id: number; text: string; translation: string; type: 'SENTENCE' | 'QNA' | 'SHORT_TALK' };

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
};`;

const newDataBlock = `type PracticeItem = { id: number; text: string; translation: string; type: 'SENTENCE' | 'QNA' | 'SHORT_TALK'; qna?: { q: string, a: string } };

const PRACTICE_DATA: Record<'SENTENCE' | 'QNA' | 'SHORT_TALK', PracticeItem[]> = {
  SENTENCE: [
    { id: 1, text: "The new marketing campaign was very successful.", translation: "Chiến dịch tiếp thị mới đã rất thành công.", type: 'SENTENCE' },
    { id: 2, text: "Please send the report to the manager by Friday.", translation: "Vui lòng gửi báo cáo cho người quản lý trước thứ Sáu.", type: 'SENTENCE' },
    { id: 3, text: "Our company is looking for a new software engineer.", translation: "Công ty của chúng tôi đang tìm kiếm một kỹ sư phần mềm mới.", type: 'SENTENCE' },
    { id: 4, text: "The meeting has been rescheduled for next Monday.", translation: "Cuộc họp đã được dời lại vào thứ Hai tuần sau.", type: 'SENTENCE' },
    { id: 5, text: "We need to review the budget for the upcoming quarter.", translation: "Chúng ta cần xem xét ngân sách cho quý sắp tới.", type: 'SENTENCE' }
  ],
  QNA: [
    { id: 101, text: "When is the next train to London? It leaves in ten minutes.", qna: { q: "When is the next train to London?", a: "It leaves in ten minutes." }, translation: "Hỏi: Chuyến tàu tiếp theo đến London là khi nào? Đáp: Nó khởi hành trong mười phút nữa.", type: 'QNA' },
    { id: 102, text: "Who is presenting the sales report? Mr. Smith will do it.", qna: { q: "Who is presenting the sales report?", a: "Mr. Smith will do it." }, translation: "Hỏi: Ai sẽ trình bày báo cáo doanh số? Đáp: Ông Smith sẽ làm việc đó.", type: 'QNA' },
    { id: 103, text: "Are you going to the company picnic? Yes, I wouldn't miss it.", qna: { q: "Are you going to the company picnic?", a: "Yes, I wouldn't miss it." }, translation: "Hỏi: Bạn có đi dã ngoại cùng công ty không? Đáp: Có, tôi sẽ không bỏ lỡ đâu.", type: 'QNA' }
  ],
  SHORT_TALK: [
    { id: 201, text: "Welcome to the annual tech conference. We have a great lineup of speakers today. Please make sure to visit our sponsor booths during the breaks.", translation: "Chào mừng bạn đến với hội nghị công nghệ thường niên. Chúng ta có một đội ngũ diễn giả tuyệt vời ngày hôm nay. Vui lòng đảm bảo ghé thăm các gian hàng tài trợ của chúng tôi trong giờ nghỉ.", type: 'SHORT_TALK' },
    { id: 202, text: "Attention all passengers for flight 789 to Tokyo. Your flight is delayed by two hours due to severe weather conditions. We apologize for the inconvenience.", translation: "Xin thông báo tới tất cả hành khách của chuyến bay 789 đi Tokyo. Chuyến bay của bạn bị hoãn hai giờ do điều kiện thời tiết khắc nghiệt. Chúng tôi xin lỗi vì sự bất tiện này.", type: 'SHORT_TALK' }
  ]
};`;

content = content.replace(oldDataBlock, newDataBlock);

// 2. Add voiceQ and voiceA
content = content.replace(
  "const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null)",
  "const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null)\n  const [voiceQ, setVoiceQ] = useState<SpeechSynthesisVoice | null>(null)\n  const [voiceA, setVoiceA] = useState<SpeechSynthesisVoice | null>(null)"
);

// 3. Update loadVoices
const oldLoadVoices = `    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices()
      const englishVoices = voices.filter(v => v.lang.startsWith('en-US') || v.lang.startsWith('en-GB'))
      const preferred = englishVoices.find(v => v.name.includes('Google US English')) || englishVoices[0]
      if (preferred) setVoice(preferred)
    }`;

const newLoadVoices = `    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices()
      const englishVoices = voices.filter(v => v.lang.startsWith('en-US') || v.lang.startsWith('en-GB'))
      const preferred = englishVoices.find(v => v.name.includes('Google US English')) || englishVoices[0]
      if (preferred) setVoice(preferred)
      
      const maleVoice = englishVoices.find(v => v.name.toLowerCase().includes('male') || v.name.includes('Alex') || v.name.includes('Google UK English Male')) || englishVoices[1] || englishVoices[0]
      const femaleVoice = englishVoices.find(v => v.name.toLowerCase().includes('female') || v.name.includes('Samantha') || v.name.includes('Google US English')) || englishVoices[0]
      
      if (maleVoice) setVoiceQ(maleVoice)
      if (femaleVoice) setVoiceA(femaleVoice)
    }`;
content = content.replace(oldLoadVoices, newLoadVoices);

// 4. Update playAudio
const oldPlayAudio = `  const playAudio = () => {
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
  }`;

const newPlayAudio = `  const playAudio = () => {
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
  }`;
content = content.replace(oldPlayAudio, newPlayAudio);

// 5. Update Shadowing text UI
const oldShadowingText = `                  <div className="text-center space-y-4 max-w-2xl">
                    <p className="text-2xl md:text-3xl font-bold text-white leading-tight">"{currentSentence.text}"</p>
                    <p className="text-slate-400 font-medium text-lg">{currentSentence.translation}</p>
                  </div>`;

const newShadowingText = `                  <div className="text-center space-y-4 max-w-2xl w-full">
                    {contentType === 'QNA' && currentSentence.qna ? (
                      <div className="space-y-6 text-left max-w-lg mx-auto bg-slate-800/20 p-6 md:p-8 rounded-3xl border border-slate-800/60 shadow-inner">
                        <div className="flex flex-col gap-2">
                          <span className="text-xs font-bold text-secondary-400 uppercase tracking-wider">Question</span>
                          <p className="text-xl md:text-2xl font-bold text-white leading-relaxed">"{currentSentence.qna.q}"</p>
                        </div>
                        <div className="w-full h-px bg-slate-800/60"></div>
                        <div className="flex flex-col gap-2">
                          <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Response</span>
                          <p className="text-xl md:text-2xl font-bold text-slate-300 leading-relaxed">"{currentSentence.qna.a}"</p>
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-800/40">
                          <p className="text-slate-400 font-medium text-sm md:text-base">{currentSentence.translation}</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-2xl md:text-3xl font-bold text-white leading-tight">"{currentSentence.text}"</p>
                        <p className="text-slate-400 font-medium text-lg">{currentSentence.translation}</p>
                      </>
                    )}
                  </div>`;
content = content.replace(oldShadowingText, newShadowingText);

fs.writeFileSync('src/components/InteractiveListeningModal.tsx', content);
console.log('Done rewriting QNA updates');
