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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 isolate">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm cursor-pointer"
            onClick={onClose}
          />
          
          {/* Modal Container */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 300, duration: 0.2 }}
            className="relative w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 sm:p-8 shadow-2xl"
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
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-500 shadow-inner">
                <span className="text-3xl drop-shadow-sm">⭐</span>
              </div>
              
              <h2 className="text-2xl font-black tracking-tight text-slate-900" style={{fontFamily: 'var(--font-inter, sans-serif)'}}>
                Toeic Stars là gì?
              </h2>
              <p className="mt-2 text-sm text-slate-600 font-medium">
                Bạn đang có: <strong className="text-amber-600 text-lg">{currentStars} ⭐</strong>
              </p>
            </div>

            <div className="space-y-6">
              {/* Ý nghĩa */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs">ℹ️</span>
                  Giới thiệu chung
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed font-medium">
                  <strong>Toeic Stars (⭐)</strong> là điểm thưởng rèn luyện độc quyền của hệ thống ToeicMore, dùng để ghi nhận nỗ lực học tập và sự đóng góp của bạn vào cộng đồng.
                </p>
              </div>

              {/* Cách nhận */}
              <div>
                <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-600 text-xs">🎯</span>
                  Cách tích luỹ Sao
                </h3>
                <ul className="space-y-2 text-sm text-slate-700 font-medium ml-2">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span><strong>Học tập mỗi ngày:</strong> Đăng nhập, duy trì chuỗi học (streak), hoàn thành bài thi thử (Actual Test).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span><strong>Thành tích xuất sắc:</strong> Trả lời nhanh đúng (Speed Challenge), lọt Top bảng xếp hạng tuần.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">🔥</span>
                    <span><strong>Giới thiệu bạn bè:</strong> Mời bạn bè đăng ký và làm bài thi thử đầu tiên để nhận <strong className="text-amber-600">100 ⭐ / lượt</strong>. Bạn của bạn cũng nhận <strong className="text-amber-600">50 ⭐</strong>. (Copy link giới thiệu ở màn hình Luyện Thi).</span>
                  </li>
                </ul>
              </div>

              {/* Công dụng */}
              <div>
                <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 text-purple-600 text-xs">🎁</span>
                  Đặc quyền của Sao
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-3 rounded-lg border border-amber-100">
                    <p className="text-sm font-bold text-amber-900 mb-1">👑 Nâng cấp tài khoản</p>
                    <p className="text-xs text-amber-700 font-medium">Sử dụng sao để quy đổi lấy các đặc quyền VIP (PRO / ULTRA) miễn phí.</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-100">
                    <p className="text-sm font-bold text-blue-900 mb-1">🔓 Mở khóa nội dung</p>
                    <p className="text-xs text-blue-700 font-medium">Truy cập các bộ đề thi độc quyền và bí kíp nâng điểm chuyên sâu.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <button
                onClick={onClose}
                className="w-full rounded-xl bg-slate-900 px-4 py-3.5 text-sm font-bold text-white transition-all hover:bg-slate-800 shadow-md hover:shadow-lg cursor-pointer"
              >
                Đã hiểu, đóng lại
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
