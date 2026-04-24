'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'

interface ToeicStarInfoModalProps {
  isOpen: boolean
  onClose: () => void
  currentStars: number
}

export default function ToeicStarInfoModal({ isOpen, onClose, currentStars }: ToeicStarInfoModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] overflow-y-auto isolate">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm cursor-pointer"
            onClick={onClose}
          />
          
          <div className="flex min-h-full items-center justify-center p-4 sm:p-6 pointer-events-none">
            {/* Modal Container */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 300, duration: 0.2 }}
              className="relative w-full max-w-lg transform rounded-2xl bg-white p-6 sm:p-8 shadow-2xl pointer-events-auto"
            >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 outline-none cursor-pointer"
              aria-label="Close modal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>

            <div className="text-center mb-6">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-500 shadow-inner">
                <span className="text-2xl drop-shadow-sm">⭐</span>
              </div>
              
              <h2 className="text-xl font-black tracking-tight text-slate-900" style={{fontFamily: 'var(--font-inter, sans-serif)'}}>
                Toeic Stars là gì?
              </h2>
              <p className="mt-2 text-[13px] text-slate-600 font-medium">
                Bạn đang có: <strong className="text-amber-600 text-base">{currentStars} ⭐</strong>
              </p>
            </div>

            <div className="space-y-5">
              {/* Ý nghĩa */}
              <div className="bg-[#581c87]/5 p-4 rounded-xl border border-[#581c87]/10 flex items-start gap-2">
                <svg className="w-4 h-4 text-[#581c87] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p className="text-[13px] text-slate-700 leading-relaxed font-medium">
                  <strong className="text-[#581c87]">Toeic Stars</strong> là điểm thưởng rèn luyện độc quyền của hệ thống ToeicMore, dùng để ghi nhận nỗ lực học tập và sự đóng góp của bạn vào cộng đồng.
                </p>
              </div>

              {/* Cách nhận */}
              <div>
                <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-3 text-sm">
                  <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                  Cách tích luỹ Sao
                </h3>
                <ul className="space-y-2 text-[13px] text-slate-600 font-medium ml-1">
                  <li className="flex items-start gap-2">
                    <svg className="w-3.5 h-3.5 text-[#581c87] mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    <span><strong>Học tập mỗi ngày:</strong> Đăng nhập, duy trì chuỗi học, làm bài thi thử.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-3.5 h-3.5 text-[#581c87] mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    <span><strong>Thành tích xuất sắc:</strong> Lọt Top bảng xếp hạng tuần.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                    <span><strong>Giới thiệu bạn bè:</strong> Mời bạn bè tham gia làm bài thi thử để nhận <strong className="text-amber-600">100 ⭐ / lượt</strong>. Bạn của bạn cũng nhận 50 ⭐.</span>
                  </li>
                </ul>
              </div>

              {/* Công dụng */}
              <div>
                <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-3 text-sm">
                  <svg className="w-4 h-4 text-[#581c87]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Đặc quyền của Sao
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-amber-50/50 p-3 rounded-lg border border-amber-100">
                    <p className="text-[13px] font-bold text-amber-900 mb-1">Nâng cấp tài khoản</p>
                    <p className="text-[11px] text-amber-700 font-medium">Sử dụng sao để quy đổi lấy các đặc quyền VIP (PRO / ULTRA) miễn phí.</p>
                  </div>
                  <div className="bg-[#581c87]/5 p-3 rounded-lg border border-[#581c87]/10">
                    <p className="text-[13px] font-bold text-[#581c87] mb-1">Mở khóa nội dung</p>
                    <p className="text-[11px] text-[#581c87]/80 font-medium">Truy cập các bộ đề thi độc quyền và bí kíp nâng điểm chuyên sâu.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <button
                onClick={onClose}
                className="w-full rounded-xl bg-[#581c87] px-4 py-3 text-[13px] font-bold text-white transition-all hover:bg-[#6b21a8] shadow-md hover:shadow-lg cursor-pointer outline-none focus:ring-2 focus:ring-[#581c87] focus:ring-offset-2"
              >
                Đã hiểu
              </button>
            </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}
