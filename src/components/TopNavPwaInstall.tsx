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
                className="relative flex items-center justify-center p-1.5 sm:p-2 bg-gradient-to-br from-primary-50 to-primary-100 text-primary-700 rounded-full hover:bg-primary-100 transition-all border border-primary-200 shadow-sm overflow-hidden group"
                title="Cài đặt ứng dụng"
            >
                <div className="absolute inset-0 bg-primary-400/20 w-full h-full animate-ping opacity-75 rounded-full"></div>
                <svg className="w-4 h-4 sm:w-5 sm:h-5 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
            </button>

            {showModal && (
                <div className="fixed inset-0 z-[1000] p-4 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-[#111827] text-white rounded-[24px] shadow-2xl p-6 sm:p-8 w-full max-w-lg flex flex-col relative animate-in zoom-in-95 duration-500 border border-slate-800">
                        <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors bg-slate-800/50 hover:bg-slate-800 p-2 rounded-full">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                        
                        <div className="flex flex-col items-center text-center mb-6 mt-2">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-full text-xs font-bold text-sky-400 mb-4 border border-slate-700">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                                Cài đặt miễn phí
                            </div>
                            <h3 className="text-2xl sm:text-3xl font-black mb-3 text-white tracking-tight">Cài đặt ứng dụng <span className="text-sky-400">ToeicMore</span></h3>
                            <p className="text-slate-400 text-sm sm:text-base leading-relaxed px-4">
                                Học mọi lúc mọi nơi — cài ứng dụng miễn phí trực tiếp từ trình duyệt, không cần App Store
                            </p>
                        </div>

                        <div className="flex bg-slate-800/80 rounded-xl p-1 mb-6 border border-slate-700">
                            <button 
                                onClick={() => setActiveTab('chrome')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'chrome' ? 'bg-[#1f2937] text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                Android / Chrome
                            </button>
                            <button 
                                onClick={() => setActiveTab('ios')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'ios' ? 'bg-[#1f2937] text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                                iPhone / iPad
                            </button>
                        </div>

                        <div className="flex flex-col gap-3 mb-6">
                            {activeTab === 'chrome' ? (
                                <>
                                    <div className="flex items-center gap-4 bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                                        <div className="w-8 h-8 rounded-full bg-sky-500 text-white flex items-center justify-center font-bold shrink-0 shadow-lg shadow-sky-500/20">1</div>
                                        <div className="flex items-center gap-3">
                                            <svg className="w-5 h-5 text-sky-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                                            <p className="text-sm sm:text-base text-slate-300">Mở trang web ToeicMore trên trình duyệt Chrome hoặc Safari (trên máy Mac)</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                                        <div className="w-8 h-8 rounded-full bg-sky-500 text-white flex items-center justify-center font-bold shrink-0 shadow-lg shadow-sky-500/20">2</div>
                                        <div className="flex items-center gap-3">
                                            <svg className="w-5 h-5 text-sky-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                            <p className="text-sm sm:text-base text-slate-300">Nhấn vào biểu tượng <strong>"Cài đặt"</strong> trên thanh địa chỉ hoặc menu của trình duyệt</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                                        <div className="w-8 h-8 rounded-full bg-sky-500 text-white flex items-center justify-center font-bold shrink-0 shadow-lg shadow-sky-500/20">3</div>
                                        <div className="flex items-center gap-3">
                                            <svg className="w-5 h-5 text-sky-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            <p className="text-sm sm:text-base text-slate-300">Xác nhận <strong>"Cài đặt"</strong> — ứng dụng sẽ xuất hiện trên màn hình chính</p>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="flex items-center gap-4 bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                                        <div className="w-8 h-8 rounded-full bg-sky-500 text-white flex items-center justify-center font-bold shrink-0 shadow-lg shadow-sky-500/20">1</div>
                                        <div className="flex items-center gap-3">
                                            <svg className="w-5 h-5 text-sky-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                            <p className="text-sm sm:text-base text-slate-300">Mở trang web ToeicMore bằng trình duyệt <strong>Safari</strong> trên iPhone/iPad</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                                        <div className="w-8 h-8 rounded-full bg-sky-500 text-white flex items-center justify-center font-bold shrink-0 shadow-lg shadow-sky-500/20">2</div>
                                        <div className="flex items-center gap-3">
                                            <svg className="w-5 h-5 text-sky-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                            <p className="text-sm sm:text-base text-slate-300">Nhấn vào biểu tượng <strong>"Chia sẻ"</strong> ở cạnh dưới màn hình (hoặc trên cùng bên phải đối với iPad)</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                                        <div className="w-8 h-8 rounded-full bg-sky-500 text-white flex items-center justify-center font-bold shrink-0 shadow-lg shadow-sky-500/20">3</div>
                                        <div className="flex items-center gap-3">
                                            <svg className="w-5 h-5 text-sky-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            <p className="text-sm sm:text-base text-slate-300">Cuộn xuống và chọn <strong>"Thêm vào MH chính"</strong> (Add to Home Screen)</p>
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
                                className="w-full flex items-center justify-center gap-2 py-3.5 bg-sky-500 hover:bg-sky-400 text-white rounded-xl font-bold transition-all shadow-lg shadow-sky-500/25"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                Cài đặt ngay
                            </button>
                        )}
                        {(activeTab === 'ios' || !deferredPrompt) && (
                            <button 
                                onClick={() => setShowModal(false)}
                                className="w-full flex items-center justify-center gap-2 py-3.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all border border-slate-700"
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
