'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function PwaInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showPopup, setShowPopup] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isIos, setIsIos] = useState(false);
    const [showIosInstruction, setShowIosInstruction] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        // Only run on client
        const checkMobile = () => {
            const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
            if (/android/i.test(userAgent) || /iPad|iPhone|iPod/.test(userAgent)) {
                return true;
            }
            // Check for small screen as fallback
            return window.innerWidth <= 768;
        };
        
        setIsMobile(checkMobile());
        
        const checkIos = () => {
            const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
            return /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
        };
        const ios = checkIos();
        setIsIos(ios);

        // Check if already installed
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;
        const hasDismissed = localStorage.getItem('pwa_install_dismissed');

        // iOS doesn't support beforeinstallprompt, so we just show the popup if not installed
        if (ios && !isStandalone && !hasDismissed) {
            setTimeout(() => setShowPopup(true), 2500);
        }

        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').catch(err => {
                console.log('Service Worker registration failed:', err);
            });
        }

        const handleBeforeInstallPrompt = (e: Event) => {
            // Prevent Chrome 67 and earlier from automatically showing the prompt
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e);
            
            // Check if user has previously dismissed or installed
            const hasDismissed = localStorage.getItem('pwa_install_dismissed');
            if (!hasDismissed) {
                setShowPopup(true);
            }
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Cleanup
        return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }, []);

    const handleInstallClick = async () => {
        if (isIos) {
            setShowIosInstruction(true);
            return;
        }

        setShowPopup(false);
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                console.log('User accepted the A2HS prompt');
            } else {
                console.log('User dismissed the A2HS prompt');
            }
            setDeferredPrompt(null);
        }
    };

    const handleClose = () => {
        setShowPopup(false);
        localStorage.setItem('pwa_install_dismissed', 'true');
    };

    // We only want to show this on mobile devices when the prompt is available (or on iOS)
    if (!showPopup || !isMobile || (!deferredPrompt && !isIos)) return null;

    if (showIosInstruction) {
        return (
            <div className="fixed inset-0 z-[1000] p-4 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
                <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 w-full max-w-sm flex flex-col items-center text-center relative animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-500">
                    <button onClick={handleClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-100 p-2 rounded-full">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                        <img src="/toeicmoreicon.svg?v=2" alt="App Icon" className="w-12 h-12 object-cover rounded-xl shadow-sm" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Cài đặt ToeicMore</h3>
                    <p className="text-sm text-slate-600 mb-6">Làm theo 2 bước sau để đưa ứng dụng ra màn hình chính:</p>
                    
                    <div className="flex flex-col gap-4 text-left w-full mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-900 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">1</div>
                            <p className="text-sm text-slate-700">Nhấn vào biểu tượng <span className="inline-block bg-white shadow-sm border border-slate-200 px-1.5 py-0.5 rounded text-primary-600 mx-1"><svg className="w-4 h-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg> Chia sẻ</span> ở dưới thanh công cụ Safari.</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-900 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">2</div>
                            <p className="text-sm text-slate-700">Chọn <span className="font-semibold text-slate-900 mx-1">Thêm vào MH chính</span> (Add to Home Screen).</p>
                        </div>
                    </div>
                    
                    <button 
                        onClick={handleClose}
                        className="w-full py-3.5 rounded-xl font-bold text-white bg-primary-900 hover:bg-[#4c1d95] active:scale-95 transition-all shadow-md"
                    >
                        Đã hiểu
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[1000] p-4 animate-in slide-in-from-bottom-full duration-500">
            <div className="bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] border border-primary-900/10 p-4 sm:p-5 flex flex-col sm:flex-row gap-4 items-center max-w-md mx-auto">
                
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <img src="/toeicmoreicon.svg?v=2" alt="App Icon" className="w-14 h-14 object-cover rounded-[14px] shadow-sm bg-slate-50 border border-slate-100" />
                    <div className="flex-1 text-left">
                        <h4 className="font-bold text-slate-800 text-[15px]">ToeicMore</h4>
                        <p className="text-[12px] text-slate-500 mt-0.5">Cài đặt ToeicMore để học tiếng Anh mỗi ngày</p>
                    </div>
                </div>

                <div className="flex w-full sm:w-auto gap-2 sm:gap-3 shrink-0">
                    <button 
                        onClick={handleClose}
                        className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl font-semibold text-[13px] text-slate-500 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 transition-colors"
                    >
                        Để sau
                    </button>
                    <button 
                        onClick={handleInstallClick}
                        className="flex-1 flex sm:flex-none items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl font-bold text-[13px] text-white bg-primary-900 hover:bg-[#4c1d95] active:bg-[#3b0764] shadow-md transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        Cài đặt
                    </button>
                </div>
                
            </div>
        </div>
    );
}
