'use client';

import { useState, useRef, useEffect } from 'react';

export default function ToeicMoreNotice({ config }: { config: { title: string, message: string } }) {
  const [isOpen, setIsOpen] = useState(false);
  const [displayText, setDisplayText] = useState('');
  const [isWiggling, setIsWiggling] = useState(false);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Only render on Toeic domains
  const [isToeic, setIsToeic] = useState(false);
  
  useEffect(() => {
    setIsToeic(window.location.hostname.includes('toeicmore.com') || window.location.hostname.includes('localhost'));
    
    // Periodic animation to attract attention
    const intervalId = setInterval(() => {
      setIsWiggling(true);
      setTimeout(() => setIsWiggling(false), 1500); // wiggle for 1.5s
    }, 12000); // every 12 seconds
    
    return () => clearInterval(intervalId);
  }, []);

  const handleClick = () => {
    if (isOpen) {
      handleClose();
    } else {
      setIsOpen(true);
      startTyping();
    }
  };

  const startTyping = () => {
    setDisplayText('');
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    let i = 0;
    const message = config?.message || '';
    
    const typeNextChar = () => {
      if (i < message.length) {
        setDisplayText(message.substring(0, i + 1));
        i++;
        typingTimerRef.current = setTimeout(typeNextChar, 40 + Math.random() * 30);
      }
    };
    
    typingTimerRef.current = setTimeout(typeNextChar, 300);
  };

  const handleClose = () => {
    setIsOpen(false);
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
  };

  if (!isToeic) return null;

  return (
    <div className="fixed bottom-3 sm:bottom-6 right-3 sm:right-6 z-[100] flex flex-col items-end gap-2 sm:gap-3 pointer-events-none">
      
      {/* Popover Message */}
      <div
        className={`pointer-events-auto transform transition-all duration-500 ease-out origin-bottom-right ${
          isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-90 opacity-0 translate-y-4 pointer-events-none'
        } max-w-[290px] sm:max-w-[320px] w-[calc(100vw-1.5rem)] bg-white/95 backdrop-blur-xl border border-[#581c87]/10 p-4 sm:p-5 rounded-[20px] sm:rounded-[24px] shadow-[0_20px_40px_-15px_rgba(88, 28, 135,0.15)] ring-1 ring-black/5 relative`}
      >
        <button
          onClick={handleClose}
          className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors focus:outline-none"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h4 className="text-[13px] sm:text-sm font-bold text-[#581c87] mb-1.5 sm:mb-2 flex items-center gap-1.5">
          {config?.title || 'Thông báo nhỏ'}
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
        </h4>
        <div className="text-[12.5px] sm:text-[13.5px] leading-relaxed text-slate-700 font-medium">
          {displayText}
          {isOpen && <span className="inline-block w-1 h-3.5 sm:h-4 ml-0.5 bg-amber-500 animate-pulse align-middle"></span>}
        </div>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={handleClick}
        className={`pointer-events-auto shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-linear-to-tr from-amber-50 to-purple-50 border border-purple-100/50 flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all focus:outline-none ${isOpen ? 'ring-2 ring-purple-300 ring-offset-2' : ''} ${isWiggling && !isOpen ? 'animate-bounce' : ''}`}
        title="Thông báo ToeicMore"
      >
        <img src="/toeicmoreicon.svg" alt="ToeicMore Notice" className="w-6 h-6 sm:w-7 sm:h-7 object-contain drop-shadow-sm" />
      </button>

    </div>
  );
}
