'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import LoginModal from './LoginModal'
import { useEffect } from 'react'

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
  const [submitting, setSubmitting] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [pendingCheckout, setPendingCheckout] = useState<'PRO' | 'ULTRA' | null>(null)
  const [pricingConfig, setPricingConfig] = useState<any>(null)
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success', title: string, message: string } | null>(null)

  const getEffectiveTier = () => {
    if (!session) return 'FREE'
    if (session.user?.role === 'admin') return 'ULTRA'
    if (session.user?.tier === 'ULTRA') return 'ULTRA'
    if (session.user?.tier === 'PRO' || session.user?.role === 'member') return 'PRO'
    return 'FREE'
  }
  const effectiveTier = getEffectiveTier()

  useEffect(() => {
    fetch('/api/public/settings?key=subscription_pricing')
      .then(res => res.json())
      .then(data => {
        if (data && data.value) {
          setPricingConfig(data.value)
        }
      })
      .catch(console.error)
  }, [])

  const proPrice = pricingConfig?.PRO?.price ?? 299000
  const proDuration = pricingConfig?.PRO?.durationMonths ?? 6
  const ultraPrice = pricingConfig?.ULTRA?.price ?? 899000
  const ultraUpgradePrice = pricingConfig?.ULTRA?.upgradePrice ?? 599000
  const ultraDuration = pricingConfig?.ULTRA?.durationMonths ?? 120

  const currentUltraPrice = effectiveTier === 'PRO' ? ultraUpgradePrice : ultraPrice

  const formatPrice = (price: number) => {
    if (price === 0) return 'Miễn phí'
    if (price >= 1000 && price % 1000 === 0) return `${price / 1000}k`
    return price.toLocaleString('vi-VN') + 'đ'
  }

  const formatDuration = (months: number) => {
    if (months >= 99) return 'trọn đời'
    return `${months} tháng`
  }

  useEffect(() => {
    if (typeof window !== 'undefined' && session) {
      const params = new URLSearchParams(window.location.search)
      const checkout = params.get('checkout')
      if (checkout === 'PRO' || checkout === 'ULTRA') {
        setActiveModal(checkout as 'PRO' | 'ULTRA')
        window.history.replaceState({}, '', window.location.pathname)
      }
    }
  }, [session])

  if (!isOpen && !activeModal && !showLoginModal && !feedback) return null;

  const handleUpgrade = (tier: 'PRO' | 'ULTRA') => {
    if (!session) {
      setPendingCheckout(tier)
      setShowLoginModal(true)
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
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
        callbackUrl={pendingCheckout ? `${typeof window !== 'undefined' ? window.location.pathname : '/upgrade'}?checkout=${pendingCheckout}` : (typeof window !== 'undefined' ? window.location.pathname : '/upgrade')}
      />
      {!showLoginModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            if (feedback) {
              setFeedback(null)
              if (feedback.type === 'success') {
                setActiveModal(null)
                onClose()
              }
            } else {
              onClose()
            }
          }}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />
      )}
      
      {feedback ? (
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl overflow-hidden text-center"
        >
          <div className="mb-6 flex justify-center">
            {feedback.type === 'success' ? (
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <IconCheck className="w-8 h-8 text-green-600" />
              </div>
            ) : (
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <IconX className="w-8 h-8 text-red-600" />
              </div>
            )}
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">
            {feedback.title}
          </h2>
          <p className="text-slate-500 text-sm mb-8 leading-relaxed">
            {feedback.message}
          </p>
          <button 
            onClick={() => {
              setFeedback(null)
              if (feedback.type === 'success') {
                setActiveModal(null)
                onClose()
              }
            }}
            className={`w-full font-bold rounded-xl py-3 transition-colors ${feedback.type === 'success' ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20' : 'bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/20'}`}
          >
            Đã hiểu
          </button>
        </motion.div>
      ) : !activeModal ? (
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
                {effectiveTier === 'FREE' && (
                  <div className="py-3 text-center text-slate-400 text-xs font-bold uppercase tracking-widest border-t border-slate-200/60 mt-auto">Gói Hiện Tại</div>
                )}
              </div>

              {/* PRO Tier */}
              <div className={`bg-gradient-to-b from-amber-50 to-white rounded-2xl p-6 border-2 border-amber-300 flex flex-col relative transition-transform ${effectiveTier === 'FREE' ? 'transform md:-translate-y-2 shadow-xl shadow-amber-500/10' : 'shadow-md'}`}>
                {effectiveTier === 'FREE' && (
                  <div className="absolute top-0 right-6 transform -translate-y-1/2">
                    <span className="bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-md">
                      Nâng Cấp
                    </span>
                  </div>
                )}
                <div className="mb-6">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4">
                    <IconStar className="w-4 h-4" /> PRO Pass
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-2">Học Viên Lớp</h3>
                  <p className="text-slate-500 text-sm h-12">Dành cho người thật sự muốn nâng cao điểm số hiệu quả.</p>
                  <div className="text-3xl font-black text-slate-900 mt-4 mb-6">
                    {formatPrice(proPrice)}<span className="text-base font-normal text-slate-400">/{formatDuration(proDuration)}</span>
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
                {effectiveTier === 'PRO' ? (
                   <div className="py-3 text-center text-amber-600 text-xs font-bold uppercase tracking-widest border-t border-amber-200/60 mt-auto">Gói Hiện Tại</div>
                ) : effectiveTier === 'ULTRA' ? (
                   <div className="w-full bg-slate-100 text-slate-400 font-bold rounded-xl py-3.5 text-center mt-auto cursor-not-allowed text-sm border border-slate-200">Đã Bao Gồm</div>
                ) : (
                   <button 
                     onClick={() => handleUpgrade('PRO')}
                     className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-amber-950 font-black rounded-xl py-3.5 transition-all shadow-md active:scale-95 mt-auto"
                   >
                     Nâng Cấp PRO Ngay
                   </button>
                )}
                <p className="text-[10px] text-center text-slate-400 mt-3 font-medium">
                  Miễn phí gói này nếu bạn đang Đăng ký một khóa học tại EnglishMore.
                </p>
              </div>

              {/* ULTRA Tier */}
              <div className={`bg-[#2b0c36] rounded-2xl p-6 border border-purple-900 flex flex-col relative text-white shadow-2xl transition-transform ${effectiveTier === 'PRO' || effectiveTier === 'ULTRA' ? 'transform md:-translate-y-2' : ''}`}>
                {(effectiveTier === 'PRO' || effectiveTier === 'ULTRA') && (
                  <div className="absolute top-0 right-6 transform -translate-y-1/2">
                    <span className="bg-gradient-to-r from-purple-600 to-purple-800 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-md">
                      Nâng Cấp
                    </span>
                  </div>
                )}
                <div className="mb-6">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-900/60 text-purple-300 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4 border border-purple-700/30">
                    <IconZap className="w-4 h-4 text-purple-600" /> ULTRA Mastery
                  </div>
                  <h3 className="text-2xl font-black text-white mb-2">Trọn Đời (ULTRA)</h3>
                  <p className="text-purple-100/70 text-sm h-12">Kho tri thức độc quyền. Học thả ga mọi lúc.</p>
                  <div className="text-3xl font-black text-white mt-4 mb-6">
                    {effectiveTier === 'PRO' ? (
                      <div className="flex flex-col items-start gap-1">
                        <div className="flex items-baseline gap-2">
                          <span className="text-xl line-through text-purple-300/60 font-medium">{formatPrice(ultraPrice)}</span>
                          <span>{formatPrice(ultraUpgradePrice)}</span>
                        </div>
                        <div className="text-[10px] text-amber-300 mt-0.5 uppercase tracking-wider font-bold bg-amber-900/40 inline-flex px-2 py-0.5 rounded border border-amber-500/30">Đặc quyền nâng cấp cho PRO</div>
                      </div>
                    ) : (
                      <>
                        {formatPrice(ultraPrice)}<span className="text-base font-normal text-purple-100/50">/{formatDuration(ultraDuration)}</span>
                      </>
                    )}
                  </div>
                </div>
                
                <ul className="space-y-4 mb-8 flex-1 text-sm">
                  <li className="flex items-start gap-3">
                    <IconCheck className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                    <span className="text-purple-50 font-semibold">Tất cả tính năng ưu việt của gói PRO</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <IconCheck className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                    <span className="text-purple-100/90">Truy cập bộ Đề Thi TOEIC Độc Quyền (Khó)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <IconCheck className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                    <span className="text-purple-100/90">Nhân ba Activity Points (x3)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <IconCheck className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                    <span className="text-purple-100/90">Ưu tiên hỗ trợ từ Admin</span>
                  </li>
                </ul>
                {effectiveTier === 'ULTRA' ? (
                   <div className="py-3 text-center text-purple-300 text-xs font-bold uppercase tracking-widest border-t border-purple-950/60 mt-auto">Gói Hiện Tại</div>
                ) : (
                   <button 
                     onClick={() => handleUpgrade('ULTRA')}
                     className="w-full bg-gradient-to-r from-purple-700 to-purple-950 hover:from-purple-800 hover:to-purple-900 text-white font-black rounded-xl py-3.5 transition-all shadow-md shadow-purple-900/50 active:scale-95 border border-purple-800/50 mt-auto"
                   >
                     Bứt Phá Cùng ULTRA
                   </button>
                )}
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
              Chuyển khoản <span className={activeModal === 'PRO' ? 'text-amber-500' : 'text-purple-800'}>{activeModal}</span>
            </h2>
            <p className="text-slate-500 text-sm mt-1.5 font-medium">
              Quét mã QR dưới đây bằng App Ngân hàng
            </p>
          </div>

          {renderVietQR(activeModal === 'PRO' ? proPrice : currentUltraPrice, activeModal)}

          <div className="mt-6">
            <button 
              disabled={submitting}
              onClick={async () => {
                try {
                  setSubmitting(true)
                  const res = await fetch('/api/upgrade', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      targetTier: activeModal,
                      durationMonths: activeModal === 'PRO' ? proDuration : ultraDuration,
                      price: activeModal === 'PRO' ? proPrice : currentUltraPrice,
                    })
                  })
                  
                  const data = await res.json()
                  if (!res.ok) {
                    setFeedback({
                      type: 'error',
                      title: 'Có lỗi xảy ra',
                      message: data.error || 'Bạn có thể đang có một yêu cầu khác đang chờ duyệt. Vui lòng kiểm tra lại.'
                    })
                    return
                  }
                  
                  setFeedback({
                    type: 'success',
                    title: 'Gửi yêu cầu thành công',
                    message: 'Yêu cầu nâng cấp phân quyền của bạn đã được ghi nhận. Quản trị viên sẽ đối soát và kích hoạt trong vòng 1-2 giờ làm việc.'
                  })
                } catch (err) {
                  setFeedback({
                    type: 'error',
                    title: 'Lỗi kết nối',
                    message: 'Không thể kết nối đến máy chủ lúc này. Vui lòng thử lại sau ít phút.'
                  })
                } finally {
                  setSubmitting(false)
                }
              }}
              className="w-full bg-slate-900 text-white font-bold rounded-xl py-3.5 hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-lg shadow-slate-900/20 flex items-center justify-center"
            >
              {submitting ? 'Đang gửi yêu cầu...' : 'Tôi đã chuyển khoản xong'}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
