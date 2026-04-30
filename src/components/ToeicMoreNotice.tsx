'use client';

import { useState, useRef, useEffect } from 'react';

export default function ToeicMoreNotice({ config }: { config: { title: string, message: string } }) {
  const [isOpen, setIsOpen] = useState(false);
  const [displayText, setDisplayText] = useState('');
  const [isWiggling, setIsWiggling] = useState(false);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Only render on Toeic domains
  const [isToeic, setIsToeic] = useState(false);
  
  // PWA states
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isMacSafari, setIsMacSafari] = useState(false);
  const [activeTab, setActiveTab] = useState<'chrome' | 'ios'>('chrome');

  useEffect(() => {
    setIsToeic(window.location.hostname.includes('toeicmore.com') || window.location.hostname.includes('localhost'));
    
    // Periodic animation to attract attention
    const intervalId = setInterval(() => {
      setIsWiggling(true);
      setTimeout(() => setIsWiggling(false), 1500); // wiggle for 1.5s
    }, 12000); // every 12 seconds
    
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
      // Check platform
      const checkIos = () => {
          const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
          return /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
      };
      setIsIos(checkIos());

      const checkMacSafari = () => {
          const userAgent = navigator.userAgent;
          return /^((?!chrome|android).)*safari/i.test(userAgent) && /Macintosh/i.test(userAgent);
      };
      setIsMacSafari(checkMacSafari());

      // Check if already installed
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;
      
      if (!isStandalone) {
          setIsInstallable(true);
      }

      const handleBeforeInstallPrompt = (e: Event) => {
          e.preventDefault();
          setDeferredPrompt(e);
          setIsInstallable(true);
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      
      const handleAppInstalled = () => {
          setIsInstallable(false);
          setDeferredPrompt(null);
          setShowModal(false);
      };
      window.addEventListener('appinstalled', handleAppInstalled);

      return () => {
          window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
          window.removeEventListener('appinstalled', handleAppInstalled);
      };
  }, []);

  const handleClick = async () => {
    if (isInstallable) {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                setIsInstallable(false);
            }
            setDeferredPrompt(null);
        } else {
            setActiveTab(isIos || isMacSafari ? 'ios' : 'chrome');
            setShowModal(true);
        }
        return;
    }

    // Normal Notice Logic
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
    <>
        <div className="fixed bottom-3 sm:bottom-6 right-3 sm:right-6 z-[100] flex flex-col items-end gap-2 sm:gap-3 pointer-events-none">
          
          {/* Popover Message */}
          <div
            className={`pointer-events-auto transform transition-all duration-500 ease-out origin-bottom-right ${
              isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-90 opacity-0 translate-y-4 pointer-events-none'
            } max-w-[290px] sm:max-w-[320px] w-[calc(100vw-1.5rem)] bg-white/95 backdrop-blur-xl border border-primary-900/10 p-4 sm:p-5 rounded-[20px] sm:rounded-[24px] shadow-[0_20px_40px_-15px_rgba(88, 28, 135,0.15)] ring-1 ring-black/5 relative`}
          >
            <button
              onClick={handleClose}
              className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors focus:outline-none"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h4 className="text-[13px] sm:text-sm font-bold text-primary-900 mb-1.5 sm:mb-2 flex items-center gap-1.5">
              {config?.title || 'Thông báo nhỏ'}
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary-500"></span>
              </span>
            </h4>
            <div className="text-[12.5px] sm:text-[13.5px] leading-relaxed text-slate-700 font-medium">
              {displayText}
              {isOpen && <span className="inline-block w-1 h-3.5 sm:h-4 ml-0.5 bg-secondary-500 animate-pulse align-middle"></span>}
            </div>
          </div>

          {/* Floating Action Button */}
          <div className="relative pointer-events-auto">
              {isInstallable && (
                  <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white z-10 animate-pulse"></div>
              )}
              <button
                onClick={handleClick}
                className={`shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden bg-linear-to-tr from-secondary-50 to-primary-50 border border-primary-100/50 flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all focus:outline-none ${isOpen ? 'ring-2 ring-primary-300 ring-offset-2' : ''} ${isWiggling && !isOpen ? 'animate-bounce' : ''}`}
                title={isInstallable ? "Cài đặt ứng dụng ToeicMore" : "Thông báo ToeicMore"}
              >
                <img src="/toeicmoreicon.svg?v=2" alt="ToeicMore Notice" className="w-full h-full object-cover drop-shadow-sm theme-classic-hide" />
                <img src="/toeicmoreiconGreen.svg?v=2" alt="ToeicMore Notice" className="w-full h-full object-cover drop-shadow-sm theme-classic-show" />
              </button>
          </div>

        </div>

        {/* Install Modal */}
        {showModal && (
            <div className="fixed inset-0 z-[1000] p-4 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                <div className="bg-white text-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 w-full max-w-md flex flex-col relative animate-in zoom-in-95 duration-500 border border-slate-100">
                    <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors bg-slate-100 hover:bg-slate-200 p-2 rounded-full">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                    
                    <div className="flex flex-col items-center text-center mb-6 mt-2">
                        <h3 className="text-xl sm:text-2xl font-black mb-2 text-primary-900 tracking-tight">Cài đặt ứng dụng ToeicMore</h3>
                        <p className="text-slate-500 text-sm leading-relaxed px-2">
                            Học miễn phí mọi lúc mọi nơi không cần tải app từ Store
                        </p>
                    </div>

                    <div className="flex bg-slate-100 rounded-xl p-1 mb-6 border border-slate-200">
                        <button 
                            onClick={() => setActiveTab('chrome')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'chrome' ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                            Chrome
                        </button>
                        <button 
                            onClick={() => setActiveTab('ios')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'ios' ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                            iOS/macOS
                        </button>
                    </div>

                    <div className="flex flex-col gap-3 mb-6">
                        {activeTab === 'chrome' ? (
                            <>
                                <div className="flex items-center gap-3.5 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                                    <div className="w-7 h-7 rounded-full bg-primary-500 text-white flex items-center justify-center font-bold shrink-0 shadow-sm">1</div>
                                    <div className="flex items-center gap-2.5">
                                        <p className="text-sm text-slate-600 leading-tight">Từ menu cài đặt có dấu 3 chấm, chọn <strong>"Thêm vào màn hình chính"</strong></p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3.5 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                                    <div className="w-7 h-7 rounded-full bg-primary-500 text-white flex items-center justify-center font-bold shrink-0 shadow-sm">2</div>
                                    <div className="flex items-center gap-2.5">
                                        <p className="text-sm text-slate-600 leading-tight">Xác nhận <strong>"Cài đặt"</strong> để thêm ứng dụng ra màn hình chính</p>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex items-center gap-3.5 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                                    <div className="w-7 h-7 rounded-full bg-primary-500 text-white flex items-center justify-center font-bold shrink-0 shadow-sm">1</div>
                                    <div className="flex items-center gap-2.5">
                                        <p className="text-sm text-slate-600 leading-tight">Nhấn biểu tượng <strong>"Chia sẻ"</strong> trên thanh công cụ Safari</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3.5 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                                    <div className="w-7 h-7 rounded-full bg-primary-500 text-white flex items-center justify-center font-bold shrink-0 shadow-sm">2</div>
                                    <div className="flex items-center gap-2.5">
                                        <p className="text-sm text-slate-600 leading-tight">Chọn <strong>"Thêm vào MH chính"</strong> (Add to Home Screen)</p>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {activeTab === 'chrome' && deferredPrompt && (
                        <button 
                            onClick={async () => {
                                deferredPrompt.prompt();
                                const { outcome } = await deferredPrompt.userChoice;
                                if (outcome === 'accepted') {
                                    setIsInstallable(false);
                                    setShowModal(false);
                                }
                                setDeferredPrompt(null);
                            }}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-bold transition-all shadow-md shadow-primary-500/20"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            Cài đặt ngay
                        </button>
                    )}
                    {(activeTab === 'ios' || !deferredPrompt) && (
                        <button 
                            onClick={() => setShowModal(false)}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all"
                        >
                            Đã hiểu, đóng lại
                        </button>
                    )}
                </div>
            </div>
        )}
    </>
  );
}
