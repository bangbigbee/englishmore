const fs = require('fs');
const content = fs.readFileSync('src/components/InteractiveListeningModal.tsx', 'utf-8');
const lines = content.split('\n');

const newLayout = `          <div className="w-full min-h-full max-w-5xl mx-auto p-4 md:p-8 flex flex-col pt-16">

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

            {/* Content Based on Method - Flex-1 to push everything centrally */}
            <div className="w-full flex-1 flex flex-col justify-center items-center pb-8">
              
              {method === 'DICTATION' && (
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
                <div className="w-full space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700 flex flex-col items-center">
                  <div className="text-center space-y-4 max-w-2xl">
                    <p className="text-2xl md:text-3xl font-bold text-white leading-tight">"{currentSentence.text}"</p>
                    <p className="text-slate-400 font-medium text-lg">{currentSentence.translation}</p>
                  </div>

                  <div className="flex flex-col items-center gap-6">
                    <div className="relative group">
                      {isRecording && <div className="absolute inset-0 bg-red-500 rounded-full blur-2xl opacity-40 animate-pulse" />}
                      <button 
                        onMouseDown={startRecording}
                        onMouseUp={stopRecording}
                        onTouchStart={startRecording}
                        onTouchEnd={stopRecording}
                        className={\`cursor-pointer relative w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 border-4 \${isRecording ? 'bg-red-500 border-red-400 scale-110' : 'bg-secondary-500 border-secondary-500/50 hover:bg-secondary-400 shadow-xl shadow-secondary-500/20'}\`}
                      >
                        <svg className={\`w-12 h-12 \${isRecording ? 'text-white' : 'text-[#020617]'} transition-transform \${isRecording ? 'scale-110' : ''}\`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                      </button>
                    </div>
                    
                    <div className="text-center">
                      <span className={\`text-sm font-bold uppercase tracking-widest \${isRecording ? 'text-red-400 animate-pulse' : 'text-slate-500'}\`}>
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
          </div>`;

// Find where <div className="w-full min-h-full starts
let startIndex = -1;
let endIndex = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('className="w-full min-h-full w-full max-w-[100vw] mx-auto')) {
    startIndex = i;
  }
  // Find the matching end div for the layout. It's right before `</motion.div>`
  if (lines[i].includes('</motion.div>')) {
    endIndex = i - 2; // the div wrapper is closed at i - 1
    break;
  }
}

if (startIndex !== -1 && endIndex !== -1) {
  lines.splice(startIndex, endIndex - startIndex + 1, newLayout);
  fs.writeFileSync('src/components/InteractiveListeningModal.tsx', lines.join('\n'));
  console.log('Replaced successfully');
} else {
  console.log('Could not find bounds', startIndex, endIndex);
}
