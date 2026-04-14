'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'

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

export default function GlobalUpgradePoller() {
  const { data: session, update } = useSession()
  const [showSuccess, setShowSuccess] = useState<{ tier: string } | null>(null)

  useEffect(() => {
    if (!session?.user) return
    
    let intervalId: NodeJS.Timeout | null = null

    const checkStatus = async () => {
      try {
        const res = await fetch('/api/upgrade')
        if (!res.ok) return
        const data = await res.json()
        
        // 1. Alert users if their order was recently approved
        const latestOrder = data.latestOrder
        if (latestOrder && latestOrder.status === 'approved') {
          const key = 'notified_upgrade_id'
          if (localStorage.getItem(key) !== latestOrder.id) {
             localStorage.setItem(key, latestOrder.id)
             await update() // Refresh session tier in background
             setShowSuccess({ tier: latestOrder.targetTier }) // Show the modal
          }
        }

        // 2. Control polling based on pending status
        if (data.pending) {
            if (!intervalId) {
                intervalId = setInterval(checkStatus, 15000)
            }
        } else {
            if (intervalId) {
                clearInterval(intervalId)
                intervalId = null
            }
        }
      } catch (e) {
         // ignore
      }
    }

    // Do an initial check immediately
    checkStatus()

    // Listen to upgrade tracking events from other components
    const onUpgradeCreated = () => checkStatus()
    window.addEventListener('upgrade_order_created', onUpgradeCreated)

    return () => {
       if (intervalId) clearInterval(intervalId)
       window.removeEventListener('upgrade_order_created', onUpgradeCreated)
    }
  }, [session?.user, update])

  return (
    <AnimatePresence>
      {showSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setShowSuccess(null)}
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl overflow-hidden text-center z-10"
          >
            <div className="mb-6 flex justify-center">
              {showSuccess.tier === 'PRO' ? (
                <div className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm">
                  <IconStar className="w-5 h-5" /> PRO PASS
                </div>
              ) : showSuccess.tier === 'ULTRA' ? (
                <div className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-900/60 text-purple-300 rounded-full text-xs font-bold uppercase tracking-widest border border-purple-700/30 shadow-sm">
                  <IconZap className="w-5 h-5" /> ULTRA MASTERY
                </div>
              ) : (
                <div className="w-16 h-16 bg-[#14532d]/10 rounded-full flex items-center justify-center">
                  <IconCheck className="w-8 h-8 text-[#14532d]" />
                </div>
              )}
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-2">
              Nâng cấp thành công
            </h2>
            <p className="text-slate-500 text-sm mb-8 leading-relaxed">
              Tuyệt vời! Yêu cầu nâng cấp lên gói {showSuccess.tier} của bạn đã được Admin phê duyệt. Bạn đã có thể sử dụng tất cả tính năng cao cấp ngay bây giờ.
            </p>
            <button 
              onClick={() => {
                setShowSuccess(null)
                // Optionally reload the page for everything to take effect deeply
                window.location.reload()
              }}
              className="w-full font-bold rounded-xl py-3 mt-2 transition-colors bg-[#14532d] hover:bg-[#166534] text-white shadow-lg shadow-[#14532d]/20"
            >
              Bắt đầu Trải nghiệm
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
