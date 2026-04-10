'use client'

import { signIn } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

const ERROR_MESSAGES: Record<string, string> = {
  Callback: 'Google callback error. Check NEXTAUTH_URL and make sure the Google redirect URI matches the current domain.',
  OAuthCallback: 'Google OAuth callback failed. Please verify the client ID, client secret, and redirect URI. (OAuthCallback)',
  Configuration: 'There is a NextAuth configuration error. Please check the environment variables.',
  AccessDenied: 'Sign-in permission was denied.',
  OAuthSignin: 'Could not connect to Google. Please try again.',
  OAuthAccountNotLinked: 'This email is already linked to another account.',
  EmailInUse: 'This email is already registered. Please use another email or sign in with your existing account.',
  DisallowedUserAgentZalo: 'Google sign-in is blocked inside the Zalo in-app browser. Please open this website in Safari or Chrome to continue.',
  '': ''
}

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  callbackUrl?: string
  allowGuest?: boolean
  onGuest?: () => void
  subtitle?: string
}

export default function LoginModal({ isOpen, onClose, callbackUrl = '/', allowGuest = false, onGuest, subtitle }: LoginModalProps) {
  const [googleLoading, setGoogleLoading] = useState(false)
  const isZaloInAppBrowser = typeof navigator !== 'undefined' && /zalo/i.test(navigator.userAgent || '')

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

  const handleGoogleSignIn = async () => {
    if (isZaloInAppBrowser) {
      toast.error(ERROR_MESSAGES.DisallowedUserAgentZalo)
      return
    }

    setGoogleLoading(true)
    try {
      await signIn('google', { callbackUrl })
    } catch {
      toast.error('Google sign in failed')
      setGoogleLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 isolate">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Modal Container */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ 
              type: "spring", 
              damping: 25, 
              stiffness: 300,
              duration: 0.2
            }}
            className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-8 shadow-2xl"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 outline-none"
              aria-label="Close modal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-[#14532d]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              
              <h2 className="text-2xl font-bold tracking-tight text-slate-900" style={{fontFamily: 'var(--font-outfit, sans-serif)'}}>
                Chào mừng bạn đến với <span className="text-[#14532d]">English</span><span className="text-amber-500">More</span>
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                {subtitle || 'Vui lòng đăng nhập để tiếp tục quá trình học tập của bạn.'}
              </p>
            </div>

            <div className="mt-8 space-y-4">
              <button
                onClick={handleGoogleSignIn}
                disabled={googleLoading || isZaloInAppBrowser}
                className={`group relative flex w-full items-center justify-center gap-3 rounded-xl px-4 py-3.5 text-sm font-bold border-2 transition-all duration-200 ${
                  googleLoading || isZaloInAppBrowser
                    ? 'border-slate-100 bg-slate-50 text-slate-400 cursor-not-allowed'
                    : 'border-amber-500 bg-amber-500 text-white hover:bg-white hover:text-amber-600 shadow-md hover:shadow-lg'
                }`}
              >
                {googleLoading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                )}
                <span>{googleLoading ? 'Đang kết nối...' : 'Tiếp tục với Google'}</span>
              </button>

              {allowGuest && (
                <button
                  onClick={onGuest}
                  className="flex w-full items-center justify-center rounded-xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900 border border-slate-200"
                >
                  Tiếp tục mà không đăng nhập
                </button>
              )}

              {isZaloInAppBrowser && (
                <div className="rounded-lg bg-blue-50 p-3 text-xs leading-relaxed text-blue-800 border border-blue-200">
                  <p className="font-bold mb-1">⚠️ Cảnh báo trình duyệt:</p>
                  Bạn đang mở trong ứng dụng Zalo. Vui lòng nhấn vào dấu ba chấm <strong>(...)</strong> và chọn <strong>"Mở bằng trình duyệt"</strong> (Safari hoặc Chrome) để có thể đăng nhập bằng Google.
                </div>
              )}
            </div>

            <div className="mt-8 text-center">
              <p className="text-xs text-slate-400">
                Bằng việc tiếp tục, bạn đồng ý với Điều khoản và Chính sách của chúng tôi.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
