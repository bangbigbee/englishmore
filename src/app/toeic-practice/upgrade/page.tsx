'use client'

import { useState, useEffect, Suspense, useRef } from 'react'
import { motion } from 'framer-motion'
import { useSession } from 'next-auth/react'
import LoginModal from '@/components/LoginModal'
import { useRouter } from 'next/navigation'

const IconZap = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" className={className}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
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

const IconX = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

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

export function UpgradeContent() {
  const { data: session } = useSession()
  const router = useRouter()
  const [activeModal, setActiveModal] = useState<'PRO' | 'ULTRA' | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [pendingCheckout, setPendingCheckout] = useState<'PRO' | 'ULTRA' | null>(null)
  const [pricingConfig, setPricingConfig] = useState<any>(null)
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success', title: string, message: string, tier?: 'PRO' | 'ULTRA' } | null>(null)
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
  }, [])

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
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
            
            <div className="flex items-center gap-2 mb-4 text-emerald-600 font-medium text-sm">
                <IconShieldCheck className="w-4 h-4" />
                <span>Thanh toán an toàn & bảo mật 100%</span>
            </div>

            <div className="p-2.5 bg-white rounded-2xl shadow-xl border border-slate-100 mb-2 relative">
                <div className="absolute -top-2 -left-2 w-6 h-6 border-t-2 border-l-2 border-indigo-500 rounded-tl-lg"></div>
                <div className="absolute -top-2 -right-2 w-6 h-6 border-t-2 border-r-2 border-indigo-500 rounded-tr-lg"></div>
                <div className="absolute -bottom-2 -left-2 w-6 h-6 border-b-2 border-l-2 border-indigo-500 rounded-bl-lg"></div>
                <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-2 border-r-2 border-indigo-500 rounded-br-lg"></div>
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
                <span className="text-sm font-bold tracking-wide text-indigo-600">{BANK_ACCOUNT}</span>
                <button 
                  onClick={() => handleCopy(BANK_ACCOUNT, 'account')}
                  className="p-1.5 hover:bg-slate-100 rounded-md transition-colors text-slate-400 hover:text-indigo-600"
                  title="Copy"
                >
                  {copyState === 'account' ? <IconCheck className="w-4 h-4 text-emerald-500" /> : <IconCopy className="w-4 h-4" />}
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
                <span className="text-base font-black text-amber-500">{amount.toLocaleString()} VNĐ</span>
                <button 
                  onClick={() => handleCopy(amount.toString(), 'amount')}
                  className="p-1.5 hover:bg-slate-100 rounded-md transition-colors text-slate-400 hover:text-indigo-600"
                  title="Copy"
                >
                  {copyState === 'amount' ? <IconCheck className="w-4 h-4 text-emerald-500" /> : <IconCopy className="w-4 h-4" />}
                </button>
            </div>
          </div>

          <div className="flex items-center justify-between bg-amber-50/50 p-2.5 rounded-xl border border-amber-100/50">
            <span className="text-sm font-medium text-slate-600 flex-shrink-0">Nội dung <span className="text-red-500">*</span></span>
            <div className="flex items-center gap-2 ml-4 overflow-hidden">
                <span className="text-xs font-mono font-bold text-amber-900 bg-amber-100 px-2.5 py-1 rounded truncate">{ADD_INFO}</span>
                <button 
                  onClick={() => handleCopy(ADD_INFO, 'info')}
                  className="p-1.5 hover:bg-amber-100 rounded-md transition-colors text-amber-600 hover:text-amber-800 shrink-0 bg-white shadow-sm border border-amber-200"
                  title="Copy"
                >
                  {copyState === 'info' ? <IconCheck className="w-4 h-4 text-emerald-600" /> : <IconCopy className="w-4 h-4" />}
                </button>
            </div>
          </div>
        </div>
        
        <div className="mt-4 flex items-center justify-center gap-1.5 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full border border-indigo-100">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
            <span className="text-[10px] font-bold uppercase tracking-wider">Hệ thống tự động duyệt trong 1-2 giờ</span>
        </div>
      </div>
    )
  }

  return (
    <>
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
        callbackUrl={pendingCheckout ? (typeof window !== 'undefined' ? `${window.location.pathname}${window.location.search}${window.location.search ? '&' : '?'}checkout=${pendingCheckout}` : '/toeic-practice/upgrade') : (typeof window !== 'undefined' ? `${window.location.pathname}${window.location.search}` : '/toeic-practice/upgrade')}
      />

      {/* Modal View for Payment and Feedback */}
      {(activeModal || feedback) && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
              <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => {
                      if (feedback) {
                          setFeedback(null)
                          if (feedback.type === 'success') {
                              setActiveModal(null)
                          }
                      } else {
                          setActiveModal(null)
                      }
                  }}
                  className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              />
              
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
                        <div className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm">
                          <IconStar className="w-5 h-5" /> PRO PASS
                        </div>
                      ) : feedback.tier === 'ULTRA' ? (
                        <div className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-900/60 text-purple-300 rounded-full text-xs font-bold uppercase tracking-widest border border-purple-700/30 shadow-sm">
                          <IconZap className="w-5 h-5" /> ULTRA MASTERY
                        </div>
                      ) : (
                        <div className="w-16 h-16 bg-[#14532d]/10 rounded-full flex items-center justify-center">
                          <IconCheck className="w-8 h-8 text-[#14532d]" />
                        </div>
                      )
                    ) : (
                      <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
                        <IconX className="w-8 h-8 text-amber-600" />
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
                      }
                    }}
                    className="w-full font-bold rounded-xl py-3 transition-colors bg-[#14532d] hover:bg-[#166534] text-white shadow-lg shadow-[#14532d]/20 mt-2"
                  >
                    Đã hiểu
                  </button>
                </motion.div>
              ) : activeModal && (
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
      )}

      {/* Main Page Layout */}
      <div className="flex items-center gap-3 mb-6">
          <div className="w-1.5 h-8 bg-[#ea980c] rounded-full"></div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#14532d]">Nâng Cấp Tài Khoản</h1>
      </div>

      <div className="bg-emerald-50 text-emerald-800 rounded-2xl p-6 border border-emerald-100 mb-10 shadow-sm">
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-emerald-200 flex items-center justify-center shrink-0">🌱</span>
              Giai Đoạn Phát Triển Sớm
          </h2>
          <p className="text-sm leading-relaxed mb-4 text-emerald-700">
              ToeicMore hiện đang trong giai đoạn phát triển sớm (Beta) và vẫn cực kỳ cần thiết sự ủng hộ, đồng hành của các bạn để có thể tiếp tục chi trả chi phí server, hoàn thiện sản phẩm và mang lại trải nghiệm tối ưu, cung cấp những tài liệu, phương pháp ôn luyện TOEIC và tiếng Anh thực sự chất lượng, vượt trội.
          </p>
          <p className="text-sm leading-relaxed text-emerald-700 font-medium">
              Chính vì đang trong giai đoạn Beta, mức giá nâng cấp hiện tại đang là <strong className="text-emerald-900 border-b border-emerald-300">mức giá cực kỳ ưu đãi</strong>. Nâng cấp ngay hôm nay để nhận được quyền lợi trọn đời với giá gốc!
          </p>
      </div>

      <div className="mb-10 w-full bg-[#14532d]/[0.02] border border-[#14532d]/10 rounded-3xl p-6 md:p-10 shadow-sm relative overflow-visible">
        
        <div className="text-center mb-16 relative z-10 mt-2">
          <h2 className="text-xl sm:text-2xl font-black tracking-wide text-[#14532d]">
            Lộ trình nâng cấp và đồng hành cùng Toeic<span className="text-[#ea980c]">More</span>
          </h2>
        </div>

        <div className="relative w-[85%] sm:w-[90%] lg:w-[80%] max-w-4xl mx-auto h-1 bg-[#14532d]/10 rounded-full mt-10 mb-16">
            {/* Active progress track */}
            <motion.div 
              initial={{ width: "0%" }}
              animate={{ width: (diagramTier === 'PRO' ? activeProPhaseStr : activeUltraPhaseStr) === 'super_early_bird' ? '15%' : (diagramTier === 'PRO' ? activeProPhaseStr : activeUltraPhaseStr) === 'early_bird' ? '50%' : '85%' }}
              transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
              className="absolute top-0 left-0 h-1 bg-gradient-to-r from-[#14532d] to-[#ea980c] rounded-full shadow-[0_0_8px_rgba(234,152,12,0.5)] flex items-center justify-end" 
            >
              {/* Glowing dot at the end of the track */}
              <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 bg-white border-2 border-amber-500 rounded-full absolute -right-[7px] sm:-right-[8px] flex items-center justify-center shadow-[0_0_10px_rgba(234,152,12,0.8)] z-20">
                 <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></div>
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
                        <div className={`absolute bottom-full mb-3 text-[11px] sm:text-xs font-black transition-all ${isCurrent ? 'text-amber-600 scale-110 drop-shadow-sm' : isPast ? 'text-[#14532d]/60 line-through decoration-[#14532d]/30' : 'text-slate-400'}`}>
                            {priceDisplay}
                        </div>
                        
                        {/* Node Circle */}
                        <div className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border-2 bg-white transition-all duration-500 ${
                            isPast ? 'border-[#14532d] bg-[#14532d]' : 
                            'border-[#14532d]/20'
                        } ${isCurrent ? 'opacity-0' : ''}`}>
                        </div>
                        
                        {/* Name Label */}
                        <div className={`absolute top-full mt-3 text-[9px] sm:text-[10px] uppercase tracking-wider font-bold whitespace-nowrap transition-colors flex flex-col items-center gap-1 ${
                            isCurrent ? 'text-amber-700' : 
                            isPast ? 'text-[#14532d]/80' : 
                            'text-slate-400'
                        }`}>
                            <span>{phase === 'super_early_bird' ? 'Super Early' : phase === 'early_bird' ? 'Early Bird' : 'Giá Gốc'}</span>
                            <span className={`px-2 py-0.5 rounded-full ${isCurrent ? 'bg-amber-100/70 text-amber-900 border border-amber-200' : isPast ? 'text-[#14532d]/70 font-medium normal-case' : 'text-slate-400 font-medium normal-case'}`}>
                                {pricePhase.label || '...'}
                            </span>
                        </div>
                    </div>
                )
            })}
        </div>
      </div>


      <div 
        ref={scrollContainerRef}
        className="flex lg:grid lg:grid-cols-3 gap-6 overflow-x-auto overflow-y-visible pb-6 pt-4 -mt-4 items-stretch green-scrollbar snap-x snap-mandatory px-4 md:px-0"
      >
        {/* FREE Tier */}
        <div className="min-w-[280px] w-[85vw] max-w-[320px] lg:w-auto lg:max-w-none flex-none snap-center bg-emerald-50/50 rounded-2xl p-6 border-2 border-emerald-100/50 flex flex-col relative focus:outline-none">
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
              <IconCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span className="text-slate-600">Truy cập bộ tài liệu cơ bản</span>
            </li>
            <li className="flex items-start gap-3">
              <IconCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span className="text-slate-600">Luyện đề TOEIC với các tính năng cơ bản</span>
            </li>
            <li className="flex items-start gap-3">
              <IconCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
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
            <div className="w-full bg-emerald-100/50 text-emerald-800 font-bold rounded-xl py-3.5 text-center mt-auto text-sm border border-emerald-200/50">Gói Hiện Tại</div>
          )}
          <p className="text-[10px] text-center text-slate-400 mt-3 font-medium invisible">
            Miễn phí gói này nếu bạn đang Đăng ký một khóa học tại EnglishMore.
          </p>
        </div>

        {/* PRO Tier */}
        <div 
          onMouseEnter={() => setDiagramTier('PRO')}
          onClick={() => setDiagramTier('PRO')}
          className={`min-w-[280px] w-[85vw] max-w-[320px] lg:w-auto lg:max-w-none flex-none snap-center bg-gradient-to-b from-amber-50 to-white rounded-2xl p-6 border-2 flex flex-col relative transition-all shadow-lg cursor-pointer hover:-translate-y-1 focus:outline-none ${diagramTier === 'PRO' ? 'border-amber-400 shadow-amber-500/20 shadow-xl opacity-100 ring-0' : 'border-amber-200/50 shadow-amber-500/5 opacity-80'}`}
        >
          <div className="mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4">
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
            <li className="flex items-start gap-3">
              <IconCheck className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span className="text-slate-700 border-b border-amber-200 border-dashed pb-0.5">Mở khoá Sổ Tay Ngữ Pháp & Luyện Đọc</span>
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
                disabled={checkingPending}
                className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-amber-950 font-black rounded-xl py-3.5 transition-all shadow-md active:scale-95 mt-auto disabled:opacity-75 disabled:cursor-wait"
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
          className={`min-w-[280px] w-[85vw] max-w-[320px] lg:w-auto lg:max-w-none flex-none snap-center bg-[#2b0c36] rounded-2xl p-6 border-2 flex flex-col relative text-white shadow-2xl transition-all cursor-pointer hover:-translate-y-1 focus:outline-none ${diagramTier === 'ULTRA' ? 'border-purple-400 shadow-purple-900/60 shadow-2xl opacity-100 ring-0' : 'border-purple-900 border-opacity-80 shadow-purple-900/30 shadow-lg opacity-90'}`}
        >
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
            <h3 className="text-2xl font-black text-white mb-2">ULTRA</h3>
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
              <span className="text-purple-100/90 font-semibold text-amber-200">Truy cập toàn bộ kho tài liệu độc quyền</span>
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
                disabled={checkingPending}
                className="w-full bg-gradient-to-r from-purple-700 to-purple-950 hover:from-purple-800 hover:to-purple-900 text-white font-black rounded-xl py-3.5 transition-all shadow-md shadow-purple-900/50 active:scale-95 border border-purple-800/50 mt-auto disabled:opacity-75 disabled:cursor-wait"
              >
                {checkingPending ? 'Đang tải...' : 'Bứt Phá Cùng ULTRA'}
              </button>
          )}
          <p className="text-[10px] text-center text-slate-400 mt-3 font-medium invisible">
            Miễn phí gói này nếu bạn đang Đăng ký một khóa học tại EnglishMore.
          </p>
        </div>
      </div>

      <div className="border border-slate-200 bg-white rounded-3xl p-8 mb-10 shadow-sm mt-10">
          <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center justify-center gap-3">
              Quy Trình Nâng Cấp Đơn Giản & An Toàn
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
              <div className="bg-slate-50 p-6 rounded-2xl text-center border border-slate-100">
                  <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-black">1</div>
                  <h4 className="font-bold text-slate-800 mb-2">Chọn gói</h4>
                  <p className="text-sm text-slate-500">Ấn nút Tới mục nâng cấp tùy theo nhu cầu học và nhấn vào gói muốn chuyển sang.</p>
              </div>
              <div className="bg-slate-50 p-6 rounded-2xl text-center border border-slate-100">
                  <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-black">2</div>
                  <h4 className="font-bold text-slate-800 mb-2">Thanh toán an toàn</h4>
                  <p className="text-sm text-slate-500">Vui lòng làm theo hướng dẫn chuyển khoản và đợi không quá 1-2 giờ.</p>
              </div>
              <div className="bg-slate-50 p-6 rounded-2xl text-center border border-slate-100">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-black">3</div>
                  <h4 className="font-bold text-slate-800 mb-2">Tận hưởng đặc quyền</h4>
                  <p className="text-sm text-slate-500">Hệ thống sẽ cập nhật trạng thái và bạn có thể tận hưởng những quyền lợi mới</p>
              </div>
          </div>
      </div>
    </>
  )
}

export default function UpgradePage() {
  return (
    <div className="max-w-6xl mx-auto pt-4 pb-16 px-4 sm:px-6">
      <Suspense fallback={<div className="h-40 flex items-center justify-center">Đang tải...</div>}>
        <UpgradeContent />
      </Suspense>
    </div>
  )
}
