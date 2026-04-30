'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function TopNavPwaInstall() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isInstallable, setIsInstallable] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [isIos, setIsIos] = useState(false);
    const [isMacSafari, setIsMacSafari] = useState(false);
    const [activeTab, setActiveTab] = useState<'chrome' | 'ios'>('chrome');

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
            // If not installed, it's installable via instruction at least
            setIsInstallable(true);
        }

        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setIsInstallable(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        
        // Also listen for appinstalled event to hide the icon
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
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                setIsInstallable(false);
            }
            setDeferredPrompt(null);
        } else {
            // Set default tab based on device
            setActiveTab(isIos || isMacSafari ? 'ios' : 'chrome');
            setShowModal(true);
        }
    };

    if (!isInstallable) return null;

    return (
        <>
            <button
                onClick={handleClick}
                className="relative flex shrink-0 items-center justify-center p-1.5 sm:p-2 bg-gradient-to-br from-primary-50 to-primary-100 text-primary-700 rounded-full hover:bg-primary-100 transition-all border border-primary-200 shadow-sm overflow-hidden group"
                title="Cài đặt ứng dụng"
            >
                <div className="absolute inset-0 bg-primary-400/20 w-full h-full animate-ping opacity-75 rounded-full"></div>
                <svg className="w-4 h-4 sm:w-5 sm:h-5 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
            </button>

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
