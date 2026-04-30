"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

export default function StartLearningAction() {
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSelect = (tab: string) => {
    if (pathname.startsWith('/toeic-practice') || pathname === '/') {
        const params = new URLSearchParams(searchParams.toString());
        params.set('tab', tab);
        params.delete('topic');
        router.push(`/toeic-practice?${params.toString()}`);
        window.scrollTo({ top: 0, behavior: 'instant' });
    } else {
        router.push(`/toeic-practice?tab=${tab}`);
    }
  };

  const options = [
    { id: 'vocabulary', label: 'Từ vựng', icon: <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>, color: 'text-primary-600 dark:text-primary-400', bg: 'bg-primary-50 dark:bg-primary-900/30' },
    { id: 'grammar', label: 'Ngữ pháp', icon: <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 15h4.498" /></svg>, color: 'text-secondary-500 dark:text-secondary-400', bg: 'bg-secondary-50 dark:bg-secondary-900/30' },
    { id: 'listening', label: 'Nghe', icon: <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>, color: 'text-fuchsia-500 dark:text-fuchsia-400', bg: 'bg-fuchsia-50 dark:bg-fuchsia-900/30' },
    { id: 'reading', label: 'Đọc', icon: <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>, color: 'text-blue-500 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/30' },
    { id: 'actual-test', label: 'Luyện đề', icon: <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, color: 'text-rose-500 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-900/30' },
  ];

  return (
    <div className="relative w-full max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[120px]">
      <AnimatePresence mode="wait">
        {!isExpanded ? (
          <motion.div
            key="button"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex justify-center w-full"
          >
            <button
              onClick={() => setIsExpanded(true)}
              className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-secondary-500 px-8 py-4 sm:px-16 sm:py-6 font-extrabold text-primary-900 shadow-xl transition-all duration-300 hover:scale-105 hover:bg-secondary-400 hover:shadow-2xl ring-4 ring-secondary-500/20"
            >
              <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-100%)] group-hover:duration-1000 group-hover:[transform:skew(-12deg)_translateX(100%)]">
                <div className="relative h-full w-10 bg-white/30" />
              </div>
              <span className="relative text-lg sm:text-3xl tracking-wide uppercase whitespace-nowrap">Bắt Đầu Học Ngay</span>
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="cards"
            initial={{ opacity: 0, scale: 0.8, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 30 }}
            transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
            className="w-full"
          >
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4 p-2">
              {options.map((opt, idx) => (
                <motion.button
                  key={opt.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1, type: "spring" }}
                  onClick={() => handleSelect(opt.id)}
                  className={`group relative flex flex-col items-center justify-center gap-3 p-4 sm:p-5 rounded-2xl sm:rounded-3xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-xl transition-all duration-300 overflow-hidden ${idx === 4 ? 'col-span-2 md:col-span-1' : ''}`}
                >
                  <div className={`w-12 h-12 sm:w-16 sm:h-16 shrink-0 rounded-[1.25rem] flex items-center justify-center ${opt.bg} ${opt.color} group-hover:scale-110 transition-transform duration-300 shadow-inner`}>
                    {opt.icon}
                  </div>
                  <span className="font-extrabold text-[13px] sm:text-[15px] text-slate-700 dark:text-slate-200 group-hover:text-primary-700 dark:group-hover:text-primary-300 transition-colors uppercase text-center leading-tight">
                    {opt.label}
                  </span>
                  <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-b from-white/50 to-transparent dark:from-white/5" />
                </motion.button>
              ))}
            </div>
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              onClick={() => setIsExpanded(false)}
              className="mt-6 text-sm font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center gap-1 mx-auto transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              Đóng
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
