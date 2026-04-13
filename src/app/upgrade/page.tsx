'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
const CheckCircle2 = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/>
  </svg>
)

const Star = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
)

const Zap = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
)

const X = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)
import TopNav from '@/components/TopNav'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

export default function UpgradePage() {
	const { data: session } = useSession()
	const [activeModal, setActiveModal] = useState<'PRO' | 'ULTRA' | null>(null)

	const handleUpgrade = (tier: 'PRO' | 'ULTRA') => {
		if (!session) {
			alert('Vui lòng đăng nhập trước khi nâng cấp!')
			return
		}
		setActiveModal(tier)
	}

	const renderVietQR = (amount: number, tier: string) => {
		// Bạn có thể thay đổi thông tin ngân hàng của bạn ở đây
		const BANK_BIN = 'TCB' // Techcombank
		const BANK_ACCOUNT = '19033113602011'
		const ACCOUNT_NAME = 'NGUYEN TRI BANG'
		const userId = session?.user?.email?.split('@')[0] || session?.user?.id || 'USER'
		const ADD_INFO = `UPGRADE ${tier} ${userId}`

		const qrUrl = `https://img.vietqr.io/image/${BANK_BIN}-${BANK_ACCOUNT}-compact.png?amount=${amount}&addInfo=${encodeURIComponent(ADD_INFO)}&accountName=${encodeURIComponent(ACCOUNT_NAME)}`

		return (
			<div className="flex flex-col items-center p-6 bg-white rounded-xl shadow-inner border border-gray-100">
				<img src={qrUrl} alt="VietQR" className="w-64 h-64 object-contain rounded-lg" />
				<div className="mt-4 w-full space-y-3 text-sm text-gray-700">
					<div className="flex justify-between border-b pb-2">
						<span className="font-medium">Ngân hàng:</span>
						<span>Techcombank</span>
					</div>
					<div className="flex justify-between border-b pb-2">
						<span className="font-medium">Số tài khoản:</span>
						<span className="font-bold text-[#14532d]">{BANK_ACCOUNT}</span>
					</div>
					<div className="flex justify-between border-b pb-2">
						<span className="font-medium">Chủ tài khoản:</span>
						<span>{ACCOUNT_NAME}</span>
					</div>
					<div className="flex justify-between border-b pb-2">
						<span className="font-medium">Số tiền:</span>
						<span className="font-bold text-[#b49b5c]">{amount.toLocaleString()} VNĐ</span>
					</div>
					<div className="flex justify-between border-b pb-2">
						<span className="font-medium">Nội dung (BẮT BUỘC):</span>
						<span className="font-mono bg-yellow-100 px-2 py-1 rounded text-red-600 font-bold">{ADD_INFO}</span>
					</div>
				</div>
				<p className="mt-4 text-xs text-center text-gray-500 italic">
					Hệ thống sẽ tự động duyệt hoặc vui lòng chờ Admin kích hoạt trong vòng 1-2 giờ làm việc sau khi thanh toán thành công.
				</p>
			</div>
		)
	}

	return (
		<main className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-[#e8f5e9]">
			<TopNav />
			<div className="pt-28 pb-20 px-4 max-w-7xl mx-auto">
				<div className="text-center max-w-3xl mx-auto mb-16">
					<motion.h1 
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight"
					>
						Bứt phá giới hạn, <br />
						<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#14532d] to-[#2ecc71]">giỏi Tiếng Anh nhanh hơn</span>
					</motion.h1>
					<motion.p 
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.1 }}
						className="text-lg text-gray-600"
					>
						Lựa chọn gói Premium phù hợp để mở khóa toàn bộ kho tàng bài tập độc quyền, giải thích cực kỳ chi tiết và tính năng chấm chữa AI thông minh.
					</motion.p>
				</div>

				<div className="grid md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
					{/* FREE Tier */}
					<motion.div 
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.2 }}
						className="bg-white rounded-3xl p-8 border border-gray-200 flex flex-col justify-between"
					>
						<div>
							<div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-sm font-medium text-gray-600 mb-6">
								Mặc định
							</div>
							<h3 className="text-2xl font-bold text-gray-900 mb-2">Basic (FREE)</h3>
							<p className="text-gray-500 mb-6 h-12">Điểm bắt đầu hoàn hảo để làm quen với nền tảng.</p>
							<div className="text-4xl font-bold text-gray-900 mb-8">0đ<span className="text-lg font-normal text-gray-500">/mãi mãi</span></div>
							
							<ul className="space-y-4 mb-8">
								<li className="flex items-start gap-3">
									<CheckCircle2 className="w-5 h-5 text-[#2ecc71] shrink-0 mt-0.5" />
									<span className="text-gray-700">Truy cập bộ tài liệu cơ bản</span>
								</li>
								<li className="flex items-start gap-3">
									<CheckCircle2 className="w-5 h-5 text-[#2ecc71] shrink-0 mt-0.5" />
									<span className="text-gray-700">Luyện đề TOEIC (Giới hạn 1 đề/ngày)</span>
								</li>
								<li className="flex items-start gap-3">
									<CheckCircle2 className="w-5 h-5 text-[#2ecc71] shrink-0 mt-0.5" />
									<span className="text-gray-700">Xem điểm tổng và đáp án đúng sai</span>
								</li>
								<li className="flex items-start gap-3 opacity-40">
									<X className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
									<span className="text-gray-500 line-through">Xem giải thích chi tiết cấu trúc TOEIC</span>
								</li>
								<li className="flex items-start gap-3 opacity-40">
									<X className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
									<span className="text-gray-500 line-through">Đề thi Độc quyền mức độ Khó</span>
								</li>
							</ul>
						</div>
						<div className="p-3 text-center text-gray-500 font-medium">Bạn đang sử dụng gói này</div>
					</motion.div>

					{/* PRO Tier */}
					<motion.div 
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.3 }}
						className="bg-white rounded-3xl p-8 border-2 border-[#14532d] shadow-2xl relative flex flex-col justify-between transform md:-translate-y-4"
					>
						<div className="absolute top-0 right-8 transform -translate-y-1/2">
							<span className="bg-gradient-to-r from-[#b49b5c] to-[#d4c391] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
								Khuyên Dùng
							</span>
						</div>
						<div>
							<div className="inline-flex items-center gap-2 px-3 py-1 bg-[#14532d]/10 text-[#14532d] rounded-full text-sm font-bold mb-6">
								<Star className="w-4 h-4" /> PRO Pass
							</div>
							<h3 className="text-2xl font-bold text-gray-900 mb-2">Học Viên Đặc Quyền</h3>
							<p className="text-gray-500 mb-6 h-12">Dành cho người thật sự muốn nâng cao điểm số hiệu quả.</p>
							<div className="text-4xl font-bold text-gray-900 mb-8">
								299k<span className="text-lg font-normal text-gray-500">/6 tháng</span>
							</div>
							
							<ul className="space-y-4 mb-8">
								<li className="flex items-start gap-3">
									<CheckCircle2 className="w-5 h-5 text-[#b49b5c] shrink-0 mt-0.5" />
									<span className="text-gray-900 font-medium">Mọi tính năng của gói FREE</span>
								</li>
								<li className="flex items-start gap-3">
									<CheckCircle2 className="w-5 h-5 text-[#14532d] shrink-0 mt-0.5" />
									<span className="text-gray-700">Làm TOEIC <strong className="text-[#14532d]">Không Giới Hạn</strong></span>
								</li>
								<li className="flex items-start gap-3">
									<CheckCircle2 className="w-5 h-5 text-[#14532d] shrink-0 mt-0.5" />
									<span className="text-gray-700">Mở khóa <strong className="text-blue-600">Giải thích Ngoại lệ & Ngữ pháp</strong> chi tiết</span>
								</li>
								<li className="flex items-start gap-3">
									<CheckCircle2 className="w-5 h-5 text-[#14532d] shrink-0 mt-0.5" />
									<span className="text-gray-700">Nhân đôi Activity Points (x2)</span>
								</li>
								<li className="flex items-start gap-3 opacity-40">
									<X className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
									<span className="text-gray-500 line-through">Chữa Speaking/Writing 1-1 AI</span>
								</li>
							</ul>
						</div>
						<div className="space-y-3">
							<button 
								onClick={() => handleUpgrade('PRO')}
								className="w-full bg-[#14532d] hover:bg-[#0f4022] text-white font-bold rounded-xl py-4 transition-colors flex items-center justify-center gap-2"
							>
								Nâng Cấp PRO Ngay
							</button>
							<p className="text-xs text-center text-gray-500">
								* Miễn phí gói này nếu bạn đang Đăng ký một <Link href="/" className="text-[#14532d] underline">khóa học</Link> tại EnglishMore.
							</p>
						</div>
					</motion.div>

					{/* ULTRA Tier */}
					<motion.div 
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.4 }}
						className="bg-gray-900 rounded-3xl p-8 border border-gray-800 flex flex-col justify-between text-white"
					>
						<div>
							<div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-900/50 text-purple-300 rounded-full text-sm font-bold mb-6">
								<Zap className="w-4 h-4 text-purple-400" /> ULTRA Mastery
							</div>
							<h3 className="text-2xl font-bold text-white mb-2">Trọn Đời (ULTRA)</h3>
							<p className="text-gray-400 mb-6 h-12">Kho tri thức độc quyền. Học thả ga mọi lúc.</p>
							<div className="text-4xl font-bold text-white mb-8">
								899k<span className="text-lg font-normal text-gray-500">/trọn đời</span>
							</div>
							
							<ul className="space-y-4 mb-8">
								<li className="flex items-start gap-3">
									<CheckCircle2 className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
									<span className="text-gray-300">Tất cả tính năng ưu việt của gói PRO</span>
								</li>
								<li className="flex items-start gap-3">
									<CheckCircle2 className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
									<span className="text-gray-100 font-medium">Truy cập bộ Đề Thi TOEIC Độc Quyền (Khó)</span>
								</li>
								<li className="flex items-start gap-3">
									<CheckCircle2 className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
									<span className="text-gray-100 font-medium">Nhân ba Activity Points (x3)</span>
								</li>
								<li className="flex items-start gap-3">
									<CheckCircle2 className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
									<span className="text-gray-100 font-medium">Ưu tiên hỗ trợ từ Admin</span>
								</li>
							</ul>
						</div>
						<button 
							onClick={() => handleUpgrade('ULTRA')}
							className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl py-4 transition-all hover:scale-[1.02]"
						>
							Bứt Phá Cùng ULTRA
						</button>
					</motion.div>
				</div>
			</div>

			{/* Payment Modal */}
			<AnimatePresence>
				{activeModal && (
					<>
						<motion.div 
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							onClick={() => setActiveModal(null)}
							className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
						>
							<motion.div 
								initial={{ scale: 0.95, opacity: 0, y: 20 }}
								animate={{ scale: 1, opacity: 1, y: 0 }}
								exit={{ scale: 0.95, opacity: 0, y: 20 }}
								onClick={(e) => e.stopPropagation()}
								className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl relative"
							>
								<button 
									onClick={() => setActiveModal(null)}
									className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 bg-gray-100 rounded-full p-1"
								>
									<X className="w-5 h-5" />
								</button>
								
								<div className="text-center mb-6">
									<h2 className="text-2xl font-bold text-gray-800">
										Nâng Cấp <span className={activeModal === 'PRO' ? 'text-[#14532d]' : 'text-purple-600'}>{activeModal}</span>
									</h2>
									<p className="text-gray-500 text-sm mt-1">
										Sử dụng app ngân hàng hoặc Momo để quét mã QR bên dưới.
									</p>
								</div>

								{renderVietQR(activeModal === 'PRO' ? 299000 : 899000, activeModal)}

								<div className="mt-6">
									<button 
										onClick={() => {
											alert('Sau khi hệ thống kiểm tra đối soát, tài khoản của bạn sẽ được tự động kích hoạt. Cảm ơn bạn!')
											setActiveModal(null)
										}}
										className="w-full bg-[#14532d] text-white font-bold rounded-lg py-3 hover:bg-[#0f4022]"
									>
										Tôi đã chuyển khoản
									</button>
								</div>
							</motion.div>
						</motion.div>
					</>
				)}
			</AnimatePresence>
		</main>
	)
}
