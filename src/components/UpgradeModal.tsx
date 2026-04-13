'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

const IconCheck = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/>
  </svg>
)

const IconStar = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
)

const IconZap = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" className={className}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
)

const IconX = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

export default function UpgradeModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { data: session } = useSession()
  const [activeModal, setActiveModal] = useState<'PRO' | 'ULTRA' | null>(null)

  if (!isOpen && !activeModal) return null;

  const handleUpgrade = (tier: 'PRO' | 'ULTRA') => {
    if (!session) {
      alert('Vui lòng đăng nhập trước khi nâng cấp!')
      return
    }
    setActiveModal(tier)
  }

  const renderVietQR = (amount: number, tier: string) => {
    const BANK_BIN = 'TCB'
    const BANK_ACCOUNT = '19033113602011'
    const ACCOUNT_NAME = 'NGUYEN TRI BANG'
    const userId = session?.user?.email?.split('@')[0] || session?.user?.id || 'USER'
    const ADD_INFO = `UPGRADE ${tier} ${userId}`

    const qrUrl = `https://img.vietqr.io/image/${BANK_BIN}-${BANK_ACCOUNT}-compact.png?amount=${amount}&addInfo=${encodeURIComponent(ADD_INFO)}&accountName=${encodeURIComponent(ACCOUNT_NAME)}`

    return (
      <div className="flex flex-col items-center p-6 bg-slate-50/50 rounded-2xl border border-slate-100">
        <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 mb-4">
          <img src={qrUrl} alt="VietQR" className="w-56 h-56 object-contain rounded-lg" />
        </div>
        <div className="w-full space-y-2 text-sm text-slate-700">
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="font-medium text-slate-500">Ngân hàng</span>
            <span className="font-bold">Techcombank</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="font-medium text-slate-500">Số tài khoản</span>
            <span className="font-bold text-blue-600">{BANK_ACCOUNT}</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="font-medium text-slate-500">Chủ tài khoản</span>
            <span className="font-bold uppercase">{ACCOUNT_NAME}</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="font-medium text-slate-500">Số tiền</span>
            <span className="font-black text-amber-500 text-base">{amount.toLocaleString()} VNĐ</span>
          </div>
          <div className="flex justify-between items-center pt-1">
            <span className="font-medium text-slate-500">Nội dung <span className="text-red-500">*</span></span>
            <span className="font-mono bg-amber-100 text-amber-900 px-3 py-1.5 rounded-md font-bold tracking-wider">{ADD_INFO}</span>
          </div>
        </div>
        <p className="mt-5 text-[11px] text-center text-slate-400 font-medium">
          Hệ thống sẽ tự động duyệt trong vòng 1-2 giờ làm việc.
        </p>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />
      
      {!activeModal ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors"
          >
            <IconX className="w-5 h-5" />
          </button>

          <div className="overflow-y-auto custom-scrollbar p-6 md:p-10">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
                Nâng Tầm Tiếng Anh Cùng <span className="text-[#14532d]">English</span><span className="text-[#ea980c]">More</span>
              </h2>
              <p className="text-slate-500 text-sm md:text-base">
                Lựa chọn gói Premium phù hợp để mở khóa toàn bộ kho tàng bài tập độc quyền, giải thích cực kỳ chi tiết và tính năng chấm chữa AI thông minh.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 items-stretch">
              {/* FREE Tier */}
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 flex flex-col relative">
                <div className="mb-6">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-200 text-slate-600 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4">
                    Mặc định
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 mb-2">Basic (FREE)</h3>
                  <p className="text-slate-500 text-sm h-12">Điểm bắt đầu hoàn hảo để làm quen với nền tảng.</p>
                  <div className="text-3xl font-black text-slate-900 mt-4 mb-6">0đ<span className="text-base font-normal text-slate-500">/mãi mãi</span></div>
                </div>
                
                <ul className="space-y-4 mb-8 flex-1 text-sm">
                  <li className="flex items-start gap-3">
                    <IconCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-slate-600">Truy cập bộ tài liệu cơ bản</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <IconCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-slate-600">Luyện đề TOEIC (Giới hạn 1 đề/ngày)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <IconCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-slate-600">Xem điểm tổng và đáp án đúng sai</span>
                  </li>
                  <li className="flex items-start gap-3 opacity-40">
                    <IconX className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <span className="text-slate-500 line-through">Xem giải thích chi tiết cấu trúc TOEIC</span>
                  </li>
                  <li className="flex items-start gap-3 opacity-40">
                    <IconX className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <span className="text-slate-500 line-through">Đề thi Độc quyền mức độ Khó</span>
                  </li>
                </ul>
                <div className="py-3 text-center text-slate-400 text-xs font-bold uppercase tracking-widest border-t border-slate-200/60">Gói Hiện Tại</div>
              </div>

              {/* PRO Tier */}
              <div className="bg-gradient-to-b from-amber-50 to-white rounded-2xl p-6 border-2 border-amber-300 shadow-xl shadow-amber-500/10 flex flex-col relative transform md:-translate-y-2">
                <div className="absolute top-0 right-6 transform -translate-y-1/2">
                  <span className="bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-md">
                    Khuyên Dùng
                  </span>
                </div>
                <div className="mb-6">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4">
                    <IconStar className="w-4 h-4" /> PRO Pass
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-2">Học Viên Lớp</h3>
                  <p className="text-slate-500 text-sm h-12">Dành cho người thật sự muốn nâng cao điểm số hiệu quả.</p>
                  <div className="text-3xl font-black text-slate-900 mt-4 mb-6">
                    299k<span className="text-base font-normal text-slate-400">/6 tháng</span>
                  </div>
                </div>
                
                <ul className="space-y-4 mb-8 flex-1 text-sm">
                  <li className="flex items-start gap-3">
                    <IconCheck className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span className="text-slate-800 font-semibold">Mọi tính năng của gói FREE</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <IconCheck className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span className="text-slate-700">Làm TOEIC <strong className="text-amber-600">Không Giới Hạn</strong></span>
                  </li>
                  <li className="flex items-start gap-3">
                    <IconCheck className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span className="text-slate-700">Mở khóa Giải thích Ngoại lệ & Ngữ pháp chi tiết</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <IconCheck className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span className="text-slate-700">Nhân đôi Activity Points (x2)</span>
                  </li>
                  <li className="flex items-start gap-3 opacity-40">
                    <IconX className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <span className="text-slate-500 line-through">Chữa Speaking/Writing 1-1 AI</span>
                  </li>
                </ul>
                <button 
                  onClick={() => handleUpgrade('PRO')}
                  className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-amber-950 font-black rounded-xl py-3.5 transition-all shadow-md active:scale-95"
                >
                  Nâng Cấp PRO Ngay
                </button>
                <p className="text-[10px] text-center text-slate-400 mt-3 font-medium">
                  Miễn phí gói này nếu bạn đang Đăng ký một khóa học tại EnglishMore.
                </p>
              </div>

              {/* ULTRA Tier */}
              <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700 flex flex-col relative text-white">
                <div className="mb-6">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-900/40 text-purple-300 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4 border border-purple-500/20">
                    <IconZap className="w-4 h-4 text-purple-400" /> ULTRA Mastery
                  </div>
                  <h3 className="text-2xl font-black text-white mb-2">Trọn Đời (ULTRA)</h3>
                  <p className="text-slate-400 text-sm h-12">Kho tri thức độc quyền. Học thả ga mọi lúc.</p>
                  <div className="text-3xl font-black text-white mt-4 mb-6">
                    899k<span className="text-base font-normal text-slate-500">/trọn đời</span>
                  </div>
                </div>
                
                <ul className="space-y-4 mb-8 flex-1 text-sm">
                  <li className="flex items-start gap-3">
                    <IconCheck className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <span className="text-slate-200 font-semibold">Tất cả tính năng ưu việt của gói PRO</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <IconCheck className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <span className="text-slate-300">Truy cập bộ Đề Thi TOEIC Độc Quyền (Khó)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <IconCheck className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <span className="text-slate-300">Nhân ba Activity Points (x3)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <IconCheck className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <span className="text-slate-300">Ưu tiên hỗ trợ từ Admin</span>
                  </li>
                </ul>
                <button 
                  onClick={() => handleUpgrade('ULTRA')}
                  className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-black rounded-xl py-3.5 transition-all shadow-md shadow-purple-500/20 active:scale-95"
                >
                  Bứt Phá Cùng ULTRA
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl overflow-hidden"
        >
          <button 
            onClick={() => setActiveModal(null)}
            className="absolute top-4 right-4 text-slate-400 hover:bg-slate-100 p-2 rounded-full transition-colors"
          >
            <IconX className="w-5 h-5" />
          </button>
          
          <div className="text-center mb-6 pt-2">
            <h2 className="text-2xl font-black text-slate-800">
              Chuyển khoản <span className={activeModal === 'PRO' ? 'text-amber-500' : 'text-purple-600'}>{activeModal}</span>
            </h2>
            <p className="text-slate-500 text-sm mt-1.5 font-medium">
              Quét mã QR dưới đây bằng App Ngân hàng
            </p>
          </div>

          {renderVietQR(activeModal === 'PRO' ? 299000 : 899000, activeModal)}

          <div className="mt-6">
            <button 
              onClick={() => {
                alert('Sau khi đối soát, admin sẽ kích hoạt tài khoản của bạn (1-2 tiếng).')
                setActiveModal(null)
                onClose()
              }}
              className="w-full bg-slate-900 text-white font-bold rounded-xl py-3.5 hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20"
            >
              Tôi đã chuyển khoản xong
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
