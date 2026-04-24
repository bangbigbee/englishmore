'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function PwaInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showPopup, setShowPopup] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
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

    // We only want to show this on mobile devices when the prompt is available
    if (!showPopup || !isMobile || !deferredPrompt) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[1000] p-4 animate-in slide-in-from-bottom-full duration-500">
            <div className="bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] border border-[#581c87]/10 p-4 sm:p-5 flex flex-col sm:flex-row gap-4 items-center max-w-md mx-auto">
                
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <img src="/toeicmoreicon.svg?v=2" alt="App Icon" className="w-14 h-14 object-cover rounded-[14px] shadow-sm bg-slate-50 border border-slate-100" />
                    <div className="flex-1 text-left">
                        <h4 className="font-bold text-slate-800 text-[15px]">ToeicMore</h4>
                        <p className="text-[12px] text-slate-500 mt-0.5">Cài đặt ứng dụng vào màn hình chính để học tiếng Anh mỗi ngày.</p>
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
                        className="flex-1 flex sm:flex-none items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl font-bold text-[13px] text-white bg-[#581c87] hover:bg-[#4c1d95] active:bg-[#3b0764] shadow-md transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        Cài đặt
                    </button>
                </div>
                
            </div>
        </div>
    );
}
