import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'

interface ToeicStartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ToeicStartModal({ isOpen, onClose }: ToeicStartModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleSelect = (tab: string) => {
    onClose();
    router.push(`/toeic-practice?tab=${tab}`);
  };

  const options = [
    { id: 'vocabulary', label: 'Học từ vựng', icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>, color: 'text-primary-600', bg: 'bg-primary-50 dark:bg-primary-900/20' },
    { id: 'grammar', label: 'Học ngữ pháp', icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 15h4.498" /></svg>, color: 'text-secondary-500', bg: 'bg-secondary-50 dark:bg-secondary-900/20' },
    { id: 'listening', label: 'Luyện nghe', icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>, color: 'text-fuchsia-500', bg: 'bg-fuchsia-50 dark:bg-fuchsia-900/20' },
    { id: 'reading', label: 'Luyện đọc', icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { id: 'actual-test', label: 'Luyện đề', icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/20' },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-[28px] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800"
        >
          <div className="p-6 sm:p-8">
            <button 
              onClick={onClose}
              className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            
            <div className="text-center mb-8 px-4">
              <h2 className="text-[26px] sm:text-3xl font-extrabold text-primary-900 dark:text-white mb-2.5 tracking-tight">Sẵn sàng chinh phục?</h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium">Hôm nay bạn muốn bắt đầu với kỹ năng nào?</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {options.map((opt, idx) => (
                <button
                  key={opt.id}
                  onClick={() => handleSelect(opt.id)}
                  className={`group relative flex items-center gap-4 p-4 rounded-[20px] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-primary-200 dark:hover:border-primary-800 hover:shadow-[0_8px_20px_rgba(0,0,0,0.04)] transition-all duration-300 text-left overflow-hidden ${idx === 4 ? 'sm:col-span-2 sm:justify-center bg-slate-50/50 dark:bg-slate-800/30' : ''}`}
                >
                  <div className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center ${opt.bg} ${opt.color} group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                    {opt.icon}
                  </div>
                  <span className="font-bold text-[17px] text-slate-800 dark:text-slate-200 group-hover:text-primary-900 dark:group-hover:text-white transition-colors">
                    {opt.label}
                  </span>
                  
                  {/* Subtle right arrow on hover */}
                  <div className={`absolute right-4 sm:right-6 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary-400 ${idx === 4 ? 'right-6 sm:right-8' : ''}`}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
