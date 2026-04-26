'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import LoginModal from './LoginModal'
const IconShieldCheck = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
    <path d="m9 12 2 2 4-4"/>
  </svg>
)

const IconInfo = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 16v-4"/>
    <path d="M12 8h.01"/>
  </svg>
)

const IconCopy = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
  </svg>
)

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
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success', title: string, message: string, tier?: 'PRO' | 'ULTRA' } | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [checkingPending, setCheckingPending] = useState(false)
  const [copyState, setCopyState] = useState<string>('')
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'lifetime'>('lifetime')
  const [diagramTier, setDiagramTier] = useState<'PRO' | 'ULTRA'>('PRO')

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

  const proConfig = pricingConfig?.PRO
  const ultraConfig = pricingConfig?.ULTRA

  // Fallback map phase -> phase data
  const proPhaseMap = proConfig?.phases || {
    super_early_bird: { monthlyPrice: 49000, lifetimePrice: 299000 },
    early_bird: { monthlyPrice: 69000, lifetimePrice: 399000 },
    regular: { monthlyPrice: 99000, lifetimePrice: 499000 }
  }
  const ultraPhaseMap = ultraConfig?.phases || {
    super_early_bird: { monthlyPrice: 99000, lifetimePrice: 599000, upgradeLifetimePrice: 300000 },
    early_bird: { monthlyPrice: 129000, lifetimePrice: 799000, upgradeLifetimePrice: 400000 },
    regular: { monthlyPrice: 149000, lifetimePrice: 999000, upgradeLifetimePrice: 500000 }
  }

  const activeProPhaseStr = proConfig?.activePhase || 'regular';
  const activeUltraPhaseStr = ultraConfig?.activePhase || 'regular';

  const currentPro = proPhaseMap[activeProPhaseStr as keyof typeof proPhaseMap] || proPhaseMap.regular;
  const currentUltra = ultraPhaseMap[activeUltraPhaseStr as keyof typeof ultraPhaseMap] || ultraPhaseMap.regular;

  const proPrice = billingCycle === 'monthly' ? currentPro.monthlyPrice : currentPro.lifetimePrice;
  const proDuration = billingCycle === 'monthly' ? 1 : 120; // 120 months = lifetime

  const ultraPrice = billingCycle === 'monthly' ? currentUltra.monthlyPrice : currentUltra.lifetimePrice;
  const ultraUpgradePrice = billingCycle === 'monthly' ? currentUltra.monthlyPrice : (currentUltra.upgradeLifetimePrice || currentUltra.lifetimePrice);
  const ultraDuration = billingCycle === 'monthly' ? 1 : 120;

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
        params.delete('checkout')
        const newSearch = params.toString() ? `?${params.toString()}` : ''
        window.history.replaceState({}, '', window.location.pathname + newSearch)
      }
    }
  }, [session])

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024 && scrollContainerRef.current) {
      const el = scrollContainerRef.current;
      const timer = setTimeout(() => {
        el.scrollTo({ left: el.scrollWidth, behavior: 'smooth' });
        setTimeout(() => {
          const proOffset = el.children[1] instanceof HTMLElement ? (el.children[1] as HTMLElement).offsetLeft - 24 : 300;
          el.scrollTo({ left: proOffset, behavior: 'smooth' });
        }, 1000);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen])

  if (!isOpen && !activeModal && !showLoginModal && !feedback) return null;

  const handleUpgrade = async (tier: 'PRO' | 'ULTRA') => {
    if (!session) {
      setPendingCheckout(tier)
      setShowLoginModal(true)
      return
    }

    try {
      setCheckingPending(true)
      const res = await fetch('/api/upgrade')
      const data = await res.json()
      if (data.pending) {
        setFeedback({
          type: 'error',
          title: 'Yêu cầu đang chờ duyệt',
          message: 'Bạn có một yêu cầu nâng cấp đang chờ duyệt. Hãy quay lại sau nhé.'
        })
        return
      }
    } catch (e) {
      console.error(e)
    } finally {
      setCheckingPending(false)
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

    const handleCopy = (text: string, type: string) => {
      navigator.clipboard.writeText(text);
      setCopyState(type);
      setTimeout(() => setCopyState(''), 2000);
    }

    return (
      <div className="flex flex-col items-center p-0">
        <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-5 flex flex-col items-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 via-primary-500 to-primary-500"></div>
            
            <div className="flex items-center gap-2 mb-4 text-primary-600 font-medium text-sm">
                <IconShieldCheck className="w-4 h-4" />
                <span>Thanh toán an toàn & bảo mật 100%</span>
            </div>

            <div className="p-2.5 bg-white rounded-2xl shadow-xl border border-slate-100 mb-2 relative">
                <div className="absolute -top-2 -left-2 w-6 h-6 border-t-2 border-l-2 border-primary-500 rounded-tl-lg"></div>
                <div className="absolute -top-2 -right-2 w-6 h-6 border-t-2 border-r-2 border-primary-500 rounded-tr-lg"></div>
                <div className="absolute -bottom-2 -left-2 w-6 h-6 border-b-2 border-l-2 border-primary-500 rounded-bl-lg"></div>
                <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-2 border-r-2 border-primary-500 rounded-br-lg"></div>
                <img src={qrUrl} alt="VietQR" className="w-40 h-40 sm:w-48 sm:h-48 object-contain rounded-xl relative z-10" />
            </div>
            <p className="text-xs text-slate-500 mt-3 font-medium flex items-center gap-1.5">
                <IconInfo className="w-3.5 h-3.5" />
                Sử dụng app ngân hàng để quét mã
            </p>
        </div>

        <div className="w-full space-y-3 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Ngân hàng</span>
            <span className="text-sm font-bold text-slate-800">Techcombank</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Số tài khoản</span>
            <div className="flex items-center gap-2">
                <span className="text-sm font-bold tracking-wide text-primary-600">{BANK_ACCOUNT}</span>
                <button 
                  onClick={() => handleCopy(BANK_ACCOUNT, 'account')}
                  className="p-1.5 hover:bg-slate-100 rounded-md transition-colors text-slate-400 hover:text-primary-600"
                  title="Copy"
                >
                  {copyState === 'account' ? <IconCheck className="w-4 h-4 text-primary-500" /> : <IconCopy className="w-4 h-4" />}
                </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Chủ tài khoản</span>
            <span className="text-sm font-bold text-slate-800 uppercase">{ACCOUNT_NAME}</span>
          </div>

          <div className="flex items-center justify-between border-t border-dashed border-slate-200 pt-3">
            <span className="text-sm font-medium text-slate-500">Số tiền</span>
            <div className="flex items-center gap-2">
                <span className="text-base font-black text-secondary-500">{amount.toLocaleString()} VNĐ</span>
                <button 
                  onClick={() => handleCopy(amount.toString(), 'amount')}
                  className="p-1.5 hover:bg-slate-100 rounded-md transition-colors text-slate-400 hover:text-primary-600"
                  title="Copy"
                >
                  {copyState === 'amount' ? <IconCheck className="w-4 h-4 text-primary-500" /> : <IconCopy className="w-4 h-4" />}
                </button>
            </div>
          </div>

          <div className="flex items-center justify-between bg-secondary-50/50 p-2.5 rounded-xl border border-secondary-100/50">
            <span className="text-sm font-medium text-slate-600 flex-shrink-0">Nội dung <span className="text-red-500">*</span></span>
            <div className="flex items-center gap-2 ml-4 overflow-hidden">
                <span className="text-xs font-mono font-bold text-secondary-900 bg-secondary-100 px-2.5 py-1 rounded truncate">{ADD_INFO}</span>
                <button 
                  onClick={() => handleCopy(ADD_INFO, 'info')}
                  className="p-1.5 hover:bg-secondary-100 rounded-md transition-colors text-secondary-600 hover:text-secondary-800 shrink-0 bg-white shadow-sm border border-secondary-200"
                  title="Copy"
                >
                  {copyState === 'info' ? <IconCheck className="w-4 h-4 text-primary-600" /> : <IconCopy className="w-4 h-4" />}
                </button>
            </div>
          </div>
        </div>
        
        <div className="mt-4 flex items-center justify-center gap-1.5 bg-primary-50 text-primary-700 px-4 py-2 rounded-full border border-primary-100">
            <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></div>
            <span className="text-[10px] font-bold uppercase tracking-wider">Hệ thống tự động duyệt trong 1-2 giờ</span>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
        callbackUrl={pendingCheckout ? (typeof window !== 'undefined' ? `${window.location.pathname}${window.location.search}${window.location.search ? '&' : '?'}checkout=${pendingCheckout}` : '/upgrade') : (typeof window !== 'undefined' ? `${window.location.pathname}${window.location.search}` : '/upgrade')}
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
              feedback.tier === 'PRO' ? (
                <div className="inline-flex items-center gap-1.5 px-4 py-2 bg-secondary-100 text-secondary-700 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm">
                  <IconStar className="w-5 h-5" /> PRO PASS
                </div>
              ) : feedback.tier === 'ULTRA' ? (
                <div className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-900/60 text-primary-300 rounded-full text-xs font-bold uppercase tracking-widest border border-primary-700/30 shadow-sm">
                  <IconZap className="w-5 h-5" /> ULTRA MASTERY
                </div>
              ) : (
                <div className="w-16 h-16 bg-primary-900/10 rounded-full flex items-center justify-center">
                  <IconCheck className="w-8 h-8 text-primary-900" />
                </div>
              )
            ) : (
              <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center">
                <IconX className="w-8 h-8 text-secondary-600" />
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
            className="w-full font-bold rounded-xl py-3 transition-colors bg-primary-900 hover:bg-primary-800 text-white shadow-lg shadow-primary-900/20 mt-2"
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
                Nâng Tầm Tiếng Anh Cùng <span className="text-primary-900">Toeic</span><span className="text-[#ea980c]">More</span>
              </h2>
              <p className="text-slate-500 text-sm md:text-base mb-8">
                Lựa chọn gói Premium phù hợp để mở khóa toàn bộ kho tàng bài tập độc quyền, giải thích cực kỳ chi tiết và tính năng chấm chữa AI thông minh.
              </p>
            </div>



            <div 
              ref={scrollContainerRef}
              className="flex md:grid md:grid-cols-3 gap-6 overflow-x-auto overflow-y-visible pb-6 pt-4 -mt-4 items-stretch purple-scrollbar snap-x snap-mandatory px-6 -mx-6 md:mx-0 md:px-0 md:overflow-visible"
            >
              {/* FREE Tier */}
              <div className="flex-none w-[85vw] max-w-[320px] md:w-auto md:max-w-none snap-center bg-primary-50/50 rounded-2xl p-6 border-2 border-primary-100/50 flex flex-col relative focus:outline-none">
                <div className="mb-6">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-200 text-slate-600 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4">
                    Mặc định
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 mb-2">BASIC</h3>
                  <p className="text-slate-500 text-sm h-12">Điểm bắt đầu hoàn hảo để làm quen với nền tảng.</p>
                  <div className="text-3xl font-black text-slate-900 mt-4 mb-6">0đ<span className="text-base font-normal text-slate-500">/mãi mãi</span></div>
                </div>
                
                <ul className="space-y-4 mb-8 flex-1 text-sm">
                  <li className="flex items-start gap-3">
                    <IconCheck className="w-4 h-4 text-primary-500 shrink-0 mt-0.5" />
                    <span className="text-slate-600">Truy cập bộ tài liệu cơ bản</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <IconCheck className="w-4 h-4 text-primary-500 shrink-0 mt-0.5" />
                    <span className="text-slate-600">Luyện đề TOEIC với các tính năng cơ bản</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <IconCheck className="w-4 h-4 text-primary-500 shrink-0 mt-0.5" />
                    <span className="text-slate-600">Xem điểm tổng và đáp án đúng sai</span>
                  </li>
                  <li className="flex items-start gap-3 opacity-40">
                    <IconX className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <span className="text-slate-500 line-through">Xem đầy đủ giải thích chi tiết mẹo TOEIC</span>
                  </li>
                  <li className="flex items-start gap-3 opacity-40">
                    <IconX className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <span className="text-slate-500 line-through">Đề thi Độc quyền mức độ Khó</span>
                  </li>
                </ul>
                {effectiveTier === 'FREE' && (
                  <div className="w-full bg-primary-100/50 text-primary-800 font-bold rounded-xl py-3.5 text-center mt-auto text-sm border border-primary-200/50">Gói Hiện Tại</div>
                )}
                <p className="text-[10px] text-center text-slate-400 mt-3 font-medium invisible">
                  Miễn phí gói này nếu bạn đang Đăng ký một khóa học tại EnglishMore.
                </p>
              </div>

              {/* PRO Tier */}
              <div 
                onMouseEnter={() => setDiagramTier('PRO')}
                onClick={() => setDiagramTier('PRO')}
                className={`flex-none w-[85vw] max-w-[320px] md:w-auto md:max-w-none snap-center bg-gradient-to-b from-secondary-50 to-white rounded-2xl p-6 border-2 flex flex-col relative transition-all cursor-pointer hover:-translate-y-1 hover:shadow-xl focus:outline-none ${diagramTier === 'PRO' ? 'border-secondary-400 shadow-secondary-500/20 shadow-xl opacity-100 ring-0 z-10' : 'border-secondary-200/50 shadow-secondary-500/5 opacity-80'} ${effectiveTier === 'FREE' ? 'transform md:-translate-y-2' : ''}`}
              >
                <div className="mb-6">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-secondary-100 text-secondary-700 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4">
                    <IconStar className="w-4 h-4" /> PRO Pass
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-2">PRO</h3>
                  <p className="text-slate-500 text-sm h-12">Dành cho người thật sự muốn nâng cao điểm số hiệu quả.</p>
                  <div className="text-3xl font-black text-slate-900 mt-4 mb-6">
                    {formatPrice(proPrice)}<span className="text-base font-normal text-slate-400">/{formatDuration(proDuration)}</span>
                  </div>
                </div>
                
                <ul className="space-y-4 mb-8 flex-1 text-sm">
                  <li className="flex items-start gap-3">
                    <IconCheck className="w-4 h-4 text-secondary-500 shrink-0 mt-0.5" />
                    <span className="text-slate-800 font-semibold">Mọi tính năng của gói FREE</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <IconCheck className="w-4 h-4 text-secondary-500 shrink-0 mt-0.5" />
                    <span className="text-slate-700">Làm TOEIC <strong className="text-secondary-600">Không Giới Hạn</strong></span>
                  </li>
                  <li className="flex items-start gap-3">
                    <IconCheck className="w-4 h-4 text-secondary-500 shrink-0 mt-0.5" />
                    <span className="text-slate-700">Mở khóa Giải thích Ngoại lệ & Ngữ pháp chi tiết</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <IconCheck className="w-4 h-4 text-secondary-500 shrink-0 mt-0.5" />
                    <span className="text-slate-700">Nhân đôi Activity Points (x2)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <IconCheck className="w-4 h-4 text-secondary-500 shrink-0 mt-0.5" />
                    <span className="text-slate-700 border-b border-secondary-200 border-dashed pb-0.5">Mở khoá Sổ Tay Ngữ Pháp & Luyện Đọc</span>
                  </li>
                  <li className="flex items-start gap-3 opacity-40">
                    <IconX className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <span className="text-slate-500 line-through">Chữa Speaking/Writing 1-1 AI</span>
                  </li>
                </ul>
                {effectiveTier === 'PRO' ? (
                   <div className="py-3 text-center text-secondary-600 text-xs font-bold uppercase tracking-widest border-t border-secondary-200/60 mt-auto">Gói Hiện Tại</div>
                ) : effectiveTier === 'ULTRA' ? (
                   <div className="w-full bg-slate-100 text-slate-400 font-bold rounded-xl py-3.5 text-center mt-auto cursor-not-allowed text-sm border border-slate-200">Đã Bao Gồm</div>
                ) : (
                   <button 
                     onClick={() => handleUpgrade('PRO')}
                     disabled={checkingPending}
                     className="w-full bg-gradient-to-r from-secondary-400 to-secondary-500 hover:from-secondary-500 hover:to-secondary-600 text-secondary-950 font-black rounded-xl py-3.5 transition-all shadow-md active:scale-95 mt-auto disabled:opacity-75 disabled:cursor-wait"
                   >
                     {checkingPending ? 'Đang tải...' : 'Nâng Cấp PRO Ngay'}
                   </button>
                )}
                <p className="text-[10px] text-center text-slate-400 mt-3 font-medium">
                  Miễn phí gói này nếu bạn đang Đăng ký một khóa học tại EnglishMore.
                </p>
              </div>

              {/* ULTRA Tier */}
              <div 
                onMouseEnter={() => setDiagramTier('ULTRA')}
                onClick={() => setDiagramTier('ULTRA')}
                className={`flex-none w-[85vw] max-w-[320px] md:w-auto md:max-w-none snap-center bg-[#2b0c36] rounded-2xl p-6 border-2 flex flex-col relative text-white shadow-2xl transition-all cursor-pointer hover:-translate-y-1 focus:outline-none ${diagramTier === 'ULTRA' ? 'border-primary-400 shadow-primary-900/60 shadow-2xl opacity-100 ring-0 z-10' : 'border-primary-900 border-opacity-80 shadow-primary-900/30 opacity-90'} ${effectiveTier === 'PRO' || effectiveTier === 'ULTRA' ? 'transform md:-translate-y-2' : ''}`}
              >
                {(effectiveTier === 'PRO' || effectiveTier === 'ULTRA') && (
                  <div className="absolute top-0 right-6 transform -translate-y-1/2">
                    <span className="bg-gradient-to-r from-primary-600 to-primary-800 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-md">
                      Nâng Cấp
                    </span>
                  </div>
                )}
                <div className="mb-6">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-900/60 text-primary-300 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4 border border-primary-700/30">
                    <IconZap className="w-4 h-4 text-primary-600" /> ULTRA Mastery
                  </div>
                  <h3 className="text-2xl font-black text-white mb-2">ULTRA</h3>
                  <p className="text-primary-100/70 text-sm h-12">Kho tri thức độc quyền. Học thả ga mọi lúc.</p>
                  <div className="text-3xl font-black text-white mt-4 mb-6">
                    {effectiveTier === 'PRO' ? (
                      <div className="flex flex-col items-start gap-1">
                        <div className="flex items-baseline gap-2">
                          <span className="text-xl line-through text-primary-300/60 font-medium">{formatPrice(ultraPrice)}</span>
                          <span>{formatPrice(ultraUpgradePrice)}</span>
                        </div>
                        <div className="text-[10px] text-secondary-300 mt-0.5 uppercase tracking-wider font-bold bg-secondary-900/40 inline-flex px-2 py-0.5 rounded border border-secondary-500/30">Đặc quyền nâng cấp cho PRO</div>
                      </div>
                    ) : (
                      <>
                        {formatPrice(ultraPrice)}<span className="text-base font-normal text-primary-100/50">/{formatDuration(ultraDuration)}</span>
                      </>
                    )}
                  </div>
                </div>
                
                <ul className="space-y-4 mb-8 flex-1 text-sm">
                  <li className="flex items-start gap-3">
                    <IconCheck className="w-4 h-4 text-primary-600 shrink-0 mt-0.5" />
                    <span className="text-primary-50 font-semibold">Tất cả tính năng ưu việt của gói PRO</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <IconCheck className="w-4 h-4 text-primary-600 shrink-0 mt-0.5" />
                    <span className="text-primary-100/90 font-semibold text-secondary-200">Truy cập toàn bộ kho tài liệu độc quyền</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <IconCheck className="w-4 h-4 text-primary-600 shrink-0 mt-0.5" />
                    <span className="text-primary-100/90">Truy cập bộ Đề Thi TOEIC Độc Quyền (Khó)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <IconCheck className="w-4 h-4 text-primary-600 shrink-0 mt-0.5" />
                    <span className="text-primary-100/90">Nhân ba Activity Points (x3)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <IconCheck className="w-4 h-4 text-primary-600 shrink-0 mt-0.5" />
                    <span className="text-primary-100/90">Ưu tiên hỗ trợ từ Admin</span>
                  </li>
                </ul>
                {effectiveTier === 'ULTRA' ? (
                   <div className="py-3 text-center text-primary-300 text-xs font-bold uppercase tracking-widest border-t border-primary-950/60 mt-auto">Gói Hiện Tại</div>
                ) : (
                   <button 
                     onClick={() => handleUpgrade('ULTRA')}
                     disabled={checkingPending}
                     className="w-full bg-gradient-to-r from-primary-700 to-primary-950 hover:from-primary-800 hover:to-primary-900 text-white font-black rounded-xl py-3.5 transition-all shadow-md shadow-primary-900/50 active:scale-95 border border-primary-800/50 mt-auto disabled:opacity-75 disabled:cursor-wait"
                   >
                     {checkingPending ? 'Đang tải...' : 'Bứt Phá Cùng ULTRA'}
                   </button>
                )}
                <p className="text-[10px] text-center text-slate-400 mt-3 font-medium invisible">
                  Miễn phí gói này nếu bạn đang Đăng ký một khóa học tại EnglishMore.
                </p>
              </div>
            </div>

      <div className="mt-12 mb-2 w-full bg-primary-900/[0.02] border border-primary-900/10 rounded-3xl p-6 md:p-10 shadow-sm relative overflow-visible">
        
        <div className="text-center mb-16 relative z-10 mt-2">
          <h2 className="text-xl sm:text-2xl font-black tracking-wide text-primary-900">
            Lộ trình nâng cấp và đồng hành cùng Toeic<span className="text-[#ea980c]">More</span>
          </h2>
        </div>

        <div className="relative w-[85%] sm:w-[90%] lg:w-[80%] mx-auto h-1 bg-primary-900/10 rounded-full mt-10 mb-16">
            {/* Active progress track */}
            <motion.div 
              initial={{ width: "0%" }}
              animate={{ width: (diagramTier === 'PRO' ? activeProPhaseStr : activeUltraPhaseStr) === 'super_early_bird' ? '15%' : (diagramTier === 'PRO' ? activeProPhaseStr : activeUltraPhaseStr) === 'early_bird' ? '50%' : '85%' }}
              transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
              className="absolute top-0 left-0 h-1 bg-gradient-to-r from-primary-900 to-[#ea980c] rounded-full shadow-[0_0_8px_rgba(234,152,12,0.5)] flex items-center justify-end" 
            >
              {/* Glowing dot at the end of the track */}
              <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 bg-white border-2 border-secondary-500 rounded-full absolute -right-[7px] sm:-right-[8px] flex items-center justify-center shadow-[0_0_10px_rgba(234,152,12,0.8)] z-20">
                 <div className="w-1.5 h-1.5 bg-secondary-500 rounded-full animate-pulse"></div>
              </div>
            </motion.div>
            
            {/* Steps */}
            {(['super_early_bird', 'early_bird', 'regular'] as const).map((phase, idx) => {
                const phaseConfigMap = diagramTier === 'PRO' ? proPhaseMap : ultraPhaseMap;
                const activePhaseStrForDiagram = diagramTier === 'PRO' ? activeProPhaseStr : activeUltraPhaseStr;

                const isCurrent = activePhaseStrForDiagram === phase;
                const isPast = (activePhaseStrForDiagram === 'early_bird' && idx === 0) || (activePhaseStrForDiagram === 'regular' && idx < 2);
                const pricePhase = phaseConfigMap[phase] || phaseConfigMap.regular;
                const priceDisplay = billingCycle === 'monthly' ? formatPrice(pricePhase.monthlyPrice) : formatPrice(pricePhase.lifetimePrice);
                
                const leftPos = idx === 0 ? '15%' : idx === 1 ? '50%' : '85%';
                
                return (
                    <div key={phase} className="absolute top-1/2 flex flex-col items-center z-10" style={{ left: leftPos, transform: 'translate(-50%, -50%)' }}>
                        {/* Price Label */}
                        <div className={`absolute bottom-full mb-3 text-[11px] sm:text-xs font-black transition-all ${isCurrent ? 'text-secondary-600 scale-110 drop-shadow-sm' : isPast ? 'text-primary-900/60 line-through decoration-primary-900/30' : 'text-slate-400'}`}>
                            {priceDisplay}
                        </div>
                        
                        {/* Node Circle */}
                        <div className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border-2 bg-white transition-all duration-500 ${
                            isPast ? 'border-primary-900 bg-primary-900' : 
                            'border-primary-900/20'
                        } ${isCurrent ? 'opacity-0' : ''}`}>
                        </div>
                        
                        {/* Name Label */}
                        <div className={`absolute top-full mt-3 text-[9px] sm:text-[10px] uppercase tracking-wider font-bold whitespace-nowrap transition-colors flex flex-col items-center gap-1 ${
                            isCurrent ? 'text-secondary-700' : 
                            isPast ? 'text-primary-900/80' : 
                            'text-slate-400'
                        }`}>
                            <span>{phase === 'super_early_bird' ? 'Super Early' : phase === 'early_bird' ? 'Early Bird' : 'Giá Gốc'}</span>
                            <span className={`px-2 py-0.5 rounded-full ${isCurrent ? 'bg-secondary-100/70 text-secondary-900 border border-secondary-200' : isPast ? 'text-primary-900/70 font-medium normal-case' : 'text-slate-400 font-medium normal-case'}`}>
                                {pricePhase.label || '...'}
                            </span>
                        </div>
                    </div>
                )
            })}
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
              Chuyển khoản <span className={activeModal === 'PRO' ? 'text-secondary-500' : 'text-primary-800'}>{activeModal}</span>
            </h2>
            <p className="text-slate-500 text-sm mt-1.5 font-medium mb-2">
              Hoàn tất thanh toán để nhận ngay đặc quyền.
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
                    message: data.error || 'Bạn có một yêu cầu nâng cấp đang chờ duyệt. Hãy quay lại sau nhé.'
                  })
                  return
                }
                
                window.dispatchEvent(new Event('upgrade_order_created'))
                
                setFeedback({
                  type: 'success',
                  title: 'Gửi yêu cầu thành công',
                  message: 'Yêu cầu nâng cấp phân quyền của bạn đã được ghi nhận. Quản trị viên sẽ đối soát và kích hoạt trong vòng 1-2 giờ làm việc.',
                  tier: activeModal as 'PRO' | 'ULTRA'
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
