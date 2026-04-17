import Link from "next/link";
import { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Về ToeicMore & Founder | Nền tảng luyện TOEIC số 1',
	description: 'Tìm hiểu về Thầy Nguyễn Trí Bằng - Founder ToeicMore với 7 năm công tác tại ĐH Bách Khoa, 5 năm dạy Tiếng Anh và nhiều năm hoạt động tại môi trường quốc tế.',
};

export default function AboutPage() {
	return (
		<div className="min-h-screen bg-slate-50 relative overflow-hidden flex flex-col z-0">
			{/* Decorative Background Elements */}
			<div className="absolute top-0 inset-x-0 h-[450px] bg-gradient-to-b from-green-900 via-[#14532d] to-slate-50 z-[-1]" />
			<div className="absolute top-20 right-0 w-96 h-96 bg-amber-500/10 blur-[100px] rounded-full z-[-1]" />
			<div className="absolute top-40 left-10 w-72 h-72 bg-emerald-500/15 blur-[100px] rounded-full z-[-1]" />

			<div className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-20 pb-20 relative z-10">
				
				{/* Top Breadcrumb & Link */}
				<Link href="/" className="inline-flex items-center gap-2 text-green-100 hover:text-white transition-colors mb-12 group drop-shadow-sm font-semibold">
					<span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
					</span>
					Quay lại Trang Chủ
				</Link>

				{/* Main Card */}
				<main className="bg-white rounded-[32px] shadow-[0_30px_60px_-15px_rgba(20,83,45,0.15)] border border-slate-100 p-8 sm:p-12 relative isolate animate-in slide-in-from-bottom-10 fade-in duration-700">
					
					{/* Profile Banner / Image Section */}
					<div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center md:items-start relative z-10">
						{/* Avatar Frame Container */}
						<div className="relative shrink-0">
							<div className="absolute inset-0 bg-gradient-to-tr from-[#14532d] to-[#ea980c] rounded-full blur-xl opacity-40 scale-90" />
							<div className="w-40 h-40 sm:w-48 sm:h-48 rounded-full border-[6px] border-white shadow-xl overflow-hidden bg-slate-100 relative z-10">
								{/* Placeholder/Initial if real image missing */}
								<div className="absolute inset-0 flex items-center justify-center text-6xl font-black text-[#14532d] opacity-50 bg-slate-100">
									B
								</div>
								{/* User's Avatar */}
								<img 
									src="/avatar.jpg" 
									alt="" 
									className="w-full h-full object-cover relative z-20 text-transparent"
								/>
							</div>
							
							<div className="absolute -bottom-4 right-0 md:right-auto md:-right-4 py-1.5 px-4 rounded-full bg-[#14532d] border-2 border-white shadow-lg text-white font-black text-sm z-30 flex items-center gap-1.5">
								<svg className="w-4 h-4 text-[#ea980c]" viewBox="0 0 24 24" fill="currentColor">
									<path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
								</svg>
								Founder
							</div>
						</div>

						{/* Short Bio Block */}
						<div className="flex-1 text-center md:text-left mt-2 md:mt-6">
							<h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">Thầy Nguyễn Trí Bằng</h1>
							<p className="inline-block text-[#ea980c] font-black text-sm sm:text-base tracking-[0.2em] uppercase bg-amber-50 px-3 py-1 rounded-md mb-6">
								Giám đốc Sáng lập
							</p>
							<p className="text-slate-600 text-lg leading-relaxed max-w-2xl">
								&quot;Gắn liền giáo dục với trải nghiệm thực tiễn và công nghệ lõi. Hướng đến tạo ra những giá trị đích thực và vượt trội cho hàng triệu học viên tại Việt Nam.&quot;
							</p>
						</div>
					</div>

					<hr className="my-12 border-slate-100" />

					{/* Experience Highlights */}
					<h2 className="text-2xl font-black text-slate-800 tracking-tight mb-8 flex items-center gap-3">
						<span className="w-2 h-8 rounded-full bg-[#14532d] block shadow-sm" />
						Hành Trình & Kinh Nghiệm
					</h2>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
						{/* Item 1 */}
						<div className="group bg-slate-50 hover:bg-green-50/50 rounded-3xl p-6 sm:p-8 transition-colors border border-slate-100 hover:border-green-100">
							<div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center shrink-0 text-[#14532d] mb-6 border border-slate-100 group-hover:scale-110 transition-transform duration-500">
								<svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
							</div>
							<h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-[#14532d] transition-colors">7 Năm Công Tác ĐH Bách Khoa</h3>
							<p className="text-slate-600 leading-relaxed text-[15px]">
								Tại Đại học Bách Khoa - ĐH Đà Nẵng trong lĩnh vực khoa học kỹ thuật, làm việc trực tiếp với <strong className="text-slate-800">03 chương trình đào tạo quốc tế</strong> (gồm 02 chương trình tiên tiến Việt - Mỹ, và chương trình Kỹ sư Chất lượng Cao Việt Pháp).
							</p>
						</div>

						{/* Item 2 */}
						<div className="group bg-slate-50 hover:bg-blue-50/50 rounded-3xl p-6 sm:p-8 transition-colors border border-slate-100 hover:border-blue-100">
							<div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center shrink-0 text-blue-600 mb-6 border border-slate-100 group-hover:scale-110 transition-transform duration-500">
								<svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>
							</div>
							<h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-700 transition-colors">5 Năm Dạy Tiếng Anh</h3>
							<p className="text-slate-600 leading-relaxed text-[15px]">
								Hơn nửa thập kỷ gắn bó với bục giảng Tiếng Anh, giúp đỡ và dẫn dắt hàng nghìn học viên vượt qua các rào cản ngoại ngữ, chinh phục các chứng chỉ quốc tế và hoàn thiện kỹ năng giao tiếp thực chiến.
							</p>
						</div>

						{/* Item 3 */}
						<div className="group bg-slate-50 hover:bg-purple-50/50 rounded-3xl p-6 sm:p-8 transition-colors border border-slate-100 hover:border-purple-100">
							<div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center shrink-0 text-purple-600 mb-6 border border-slate-100 group-hover:scale-110 transition-transform duration-500">
								<svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
							</div>
							<h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-purple-700 transition-colors">2 Năm Công Nghệ Blockchain</h3>
							<p className="text-slate-600 leading-relaxed text-[15px]">
								Xông pha và tích luỹ 2 năm kinh nghiệm chinh chiến trong lĩnh vực công nghệ Blockchain - xu hướng công nghệ tiên phong toàn cầu ở thời điểm hiện tại.
							</p>
						</div>

						{/* Item 4 */}
						<div className="group bg-slate-50 hover:bg-amber-50/50 rounded-3xl p-6 sm:p-8 transition-colors border border-slate-100 hover:border-amber-100">
							<div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center shrink-0 text-amber-600 mb-6 border border-slate-100 group-hover:scale-110 transition-transform duration-500">
								<svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
							</div>
							<h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-amber-700 transition-colors">Môi Trường Quốc Tế Đa Chiều</h3>
							<p className="text-slate-600 leading-relaxed text-[15px]">
								Nhiều năm làm việc và cọ xát trong môi trường chuẩn quốc tế. Tham gia các hội nghị, sự kiện quy mô lớn tại các quốc gia như Singapore, Hàn Quốc... mang đến góc nhìn sâu sắc và kinh nghiệm quý báu cho thế hệ sau.
							</p>
						</div>
					</div>

				</main>
			</div>
		</div>
	);
}
