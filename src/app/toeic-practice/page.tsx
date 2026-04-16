"use client";
import { useState, useEffect, Suspense, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import UpgradeModal from "@/components/UpgradeModal";
import Link from "next/link";

const TABS = [
	{ 
		key: "home", 
		label: "Trang chủ", 
		icon: (
			<svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill="#0ea5e9" fillOpacity="0.2"/>
				<path d="M9 22V12h6v10" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
				<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
			</svg>
		) 
	},
	{ 
		key: "grammar", 
		label: "Grammar", 
		icon: (
			<svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path d="M4 19.5C4 18.837 4.53726 18.3 5.2 18.3H19C19.5523 18.3 20 18.7477 20 19.3V19.3C20 19.8523 19.5523 20.3 19 20.3H5.2C4.53726 20.3 4 19.763 4 19.1V19.5Z" fill="#10B981" fillOpacity="0.2"/>
				<path d="M4 19.5V5.2C4 4.53726 4.53726 4 5.2 4H19C19.5523 4 20 4.44772 20 5V19.5M4 19.5C4 18.837 4.53726 18.3 5.2 18.3H19M4 19.5C4 20.163 4.53726 20.7 5.2 20.7H19C19.5523 20.7 20 20.2523 20 19.7V18.3" stroke="#10B981" strokeWidth="2" strokeLinecap="round"/>
				<path d="M12 4V18.3" stroke="#10B981" strokeWidth="2" strokeLinecap="round"/>
			</svg>
		) 
	},
	{ 
		key: "vocabulary", 
		label: "Vocabulary", 
		icon: (
			<svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path d="M4 19C4 19.8284 4.67157 20.5 5.5 20.5H18.5C19.3284 20.5 20 19.8284 20 19V17.5H4V19Z" fill="#3B82F6"/>
				<path d="M4 17.5V4C4 2.89543 4.89543 2 6 2H20V17.5H4Z" fill="#3B82F6" fillOpacity="0.15" stroke="#3B82F6" strokeWidth="2"/>
				<path d="M7 6L8.5 10M10 6L8.5 10M7.5 8.5H9.5" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
				<path d="M13 6H17M13 8H17" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round"/>
				<path d="M7 12H11M7 14H11" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round"/>
				<path d="M14 12H18L14 16H18" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
			</svg>
		)
	},
	{ 
		key: "listening", 
		label: "Listening", 
		icon: (
			<svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path d="M19 14V16C19 18.2091 17.2091 20 15 20H14V14H19Z" fill="#F43F5E" fillOpacity="0.2"/>
				<path d="M5 14V16C5 18.2091 6.79086 20 9 20H10V14H5Z" fill="#F43F5E" fillOpacity="0.2"/>
				<path d="M10 20H9C6.79086 20 5 18.2091 5 16V12C5 8.13401 8.13401 5 12 5C15.866 5 19 8.13401 19 12V16C19 18.2091 17.2091 20 15 20H14" stroke="#F43F5E" strokeWidth="2" strokeLinecap="round"/>
				<path d="M10 14V20H9C7.89543 20 7 19.1046 7 18V16C7 14.8954 7.89543 14 9 14H10Z" stroke="#F43F5E" strokeWidth="2" strokeLinecap="round"/>
				<path d="M14 14V20H15C16.1046 20 17 19.1046 17 18V16C17 14.8954 16.1046 14 15 14H14Z" stroke="#F43F5E" strokeWidth="2" strokeLinecap="round"/>
			</svg>
		)
	},
	{ 
		key: "reading", 
		label: "Reading", 
		icon: (
			<svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path d="M14 3V7C14 7.55228 14.4477 8 15 8H19" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round"/>
				<path d="M14 3L19 8V19C19 20.1046 18.1046 21 17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H14Z" fill="#F59E0B" fillOpacity="0.15" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round"/>
				<path d="M9 13H15M9 17H13" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round"/>
			</svg>
		)
	},
	{ 
		key: "actual-test", 
		label: "Actual Test", 
		icon: (
			<svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
				<rect x="6" y="4" width="12" height="18" rx="2" fill="#8B5CF6" fillOpacity="0.15" stroke="#8B5CF6" strokeWidth="2"/>
				<path d="M9 4V3C9 2.44772 9.44772 2 10 2H14C14.5523 2 15 2.44772 15 3V4" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round"/>
				<path d="M9 12L11 14L15 10" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
			</svg>
		)
	},
];

const TOEIC_TOPICS_VI: Record<string, string> = {
	"Contracts": "Hợp đồng",
	"Marketing": "Tiếp thị",
	"Warranties": "Bảo hành",
	"Business Planning": "Lập kế hoạch kinh doanh",
	"Conferences": "Hội nghị",
	"Computers": "Máy tính",
	"Office Technology": "Công nghệ văn phòng",
	"Office Procedures": "Quy trình văn phòng",
	"Electronics": "Điện tử",
	"Correspondence": "Thư tín",
	"Job Advertising and Recruiting": "Quảng cáo việc làm và tuyển dụng",
	"Applying and Interviewing": "Ứng tuyển và phỏng vấn",
	"Hiring and Training": "Tuyển dụng và đào tạo",
	"Salaries and Benefits": "Lương và phúc lợi",
	"Promotions, Pensions, and Awards": "Thăng tiến, lương hưu và giải thưởng",
	"Shopping": "Mua sắm",
	"Ordering Supplies": "Đặt hàng vật tư",
	"Shipping": "Vận chuyển",
	"Invoices": "Hóa đơn",
	"Inventory": "Hàng tồn kho",
	"Banking": "Ngân hàng",
	"Accounting": "Kế toán",
	"Investments": "Đầu tư",
	"Taxes": "Thuế",
	"Financial Statements": "Báo cáo tài chính",
	"Property and Departments": "Tài sản và các phòng ban",
	"Board Meetings and Committees": "Họp hội đồng và ủy ban",
	"Quality Control": "Kiểm soát chất lượng",
	"Product Development": "Phát triển sản phẩm",
	"Renting and Leasing": "Thuê và cho thuê",
	"Selecting a Restaurant": "Chọn nhà hàng",
	"Eating Out": "Ăn ngoài",
	"Ordering Lunch": "Đặt bữa trưa",
	"Cooking as a Career": "Nghề nấu ăn",
	"Events": "Sự kiện",
	"General Travel": "Du lịch tổng quan",
	"Airlines": "Hàng không",
	"Trains": "Tàu hỏa",
	"Hotels": "Khách sạn",
	"Car Rentals": "Thuê xe ô tô",
	"Movies": "Phim ảnh",
	"Theater": "Nhà hát",
	"Music": "Âm nhạc",
	"Museums": "Bảo tàng",
	"Media": "Truyền thông",
	"Doctor's Office": "Phòng khám bác sĩ",
	"Dentist's Office": "Phòng khám nha khoa",
	"Health Insurance": "Bảo hiểm y tế",
	"Hospitals": "Bệnh viện",
	"Pharmacy": "Hiệu thuốc",
	"WarmUp": "Khởi động",
	"REVIEW 1": "Ôn tập 1",
	"REVIEW 2": "Ôn tập 2",
	"REVIEW 3": "Ôn tập 3",
	"CUSTOMER SERVICE & COMMUNICATION": "Dịch vụ khách hàng & Giao tiếp",
	"Customer Service & Communication": "Dịch vụ khách hàng & Giao tiếp"
};

const getTopicVietnamese = (en: string): string => {
	// If it already contains a hyphen like "En - Vi", return the "Vi" part
	if (en.includes(' - ')) {
		return en.split(' - ')[1].trim();
	}
	const upper = en.toUpperCase();
	for (const key of Object.keys(TOEIC_TOPICS_VI)) {
		if (key.toUpperCase() === upper) return TOEIC_TOPICS_VI[key];
	}
	return "";
};

const TopicCard = ({ title, subtitle, badgeText, onClick, type = 'grammar' }: any) => {
	const displaySubtitle = type === 'vocabulary' && !subtitle ? getTopicVietnamese(title) : subtitle;
	const displayTitle = type === 'vocabulary' && title.includes(' - ') ? title.split(' - ')[0].trim() : title;
	
	const minHeightClass = type === 'vocabulary' ? 'min-h-[170px]' : 'min-h-[220px]';
	const paddingClass = type === 'vocabulary' ? 'p-6' : 'p-8';

	return (
		<div
			onClick={onClick}
			className={`relative group bg-white rounded-xl ${paddingClass} transition-transform duration-500 cursor-pointer overflow-hidden shadow-[10px_30px_70px_rgba(0,0,0,0.12)] -translate-y-2 flex flex-col justify-start ${minHeightClass} border border-slate-200 hover:-translate-y-4 hover:shadow-[10px_40px_80px_rgba(234,152,12,0.15)]`}
		>
			<div className="relative z-10 flex-1">
				<h3 className="font-bold text-[22px] text-black leading-snug mb-1 group-hover:text-[#14532d] transition-colors duration-300 flex items-center gap-3">
					<span className={`w-[30px] h-[30px] rounded-[8px] bg-green-700 text-white flex items-center justify-center text-[15px] font-black shrink-0 shadow-md transition-transform duration-300 group-hover:rotate-0 leading-none pb-[2px] ${title.charCodeAt(0) % 2 === 0 ? '-rotate-6' : 'rotate-6'}`}>
						{(type === 'vocabulary' ? displayTitle : title).charAt(0).toLowerCase()}
					</span>
					<span>{type === 'vocabulary' ? displayTitle : title}</span>
				</h3>

				{(type === 'vocabulary' ? displaySubtitle : subtitle) && (
					<p className="text-[15px] text-slate-500 font-medium mb-4">
						{type === 'vocabulary' ? displaySubtitle : subtitle}
					</p>
				)}

				{badgeText && (
					<div className="text-[11px] font-black uppercase tracking-[0.2em] text-[#14532d] mt-2 opacity-80">
						{badgeText}
					</div>
				)}
			</div>

			{type === 'grammar' ? (
				<div className="relative z-10 mt-auto pt-6 flex justify-end overflow-visible">
					<div className="w-16 h-16 shrink-0 rounded-full bg-white shadow-[0_15px_40px_-5px_rgba(0,0,0,0.2)] flex items-center justify-center text-green-600 transition-transform duration-300 group-hover:scale-110 border border-slate-50">
						<svg className="w-7 h-7 ml-0.5 opacity-0 -translate-x-6 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] delay-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
						</svg>
					</div>
				</div>
			) : (
				<div className="relative z-10 mt-auto pt-6 flex justify-end overflow-visible">
					<div className="perspective-[1000px] w-[116px] h-[38px]">
						<div className="relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
							<div className="absolute inset-0 w-full h-full bg-[#20633b] shadow-md flex items-center justify-center [backface-visibility:hidden]">
								<span className="text-white font-semibold text-[13px]">Học ngay</span>
							</div>
							<div className="absolute inset-0 w-full h-full bg-[#f59e0b] shadow-[0_10px_20px_-5px_rgba(0,0,0,0.2)] flex items-center justify-center gap-1.5 [backface-visibility:hidden] [transform:rotateY(180deg)] overflow-hidden">
								<span className="text-white font-bold text-[13px] opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 delay-100">Học ngay</span>
								<svg className="w-4 h-4 text-white opacity-0 -translate-x-6 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] delay-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
								</svg>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

function ToeicPracticeContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const pathname = usePathname();
	const { data: session } = useSession();

	const tabFromUrl = searchParams.get('tab') || 'home';
	const [tab, setTab] = useState(tabFromUrl);

	useEffect(() => {
		const t = searchParams.get('tab');
		if (t && TABS.some(item => item.key === t)) setTab(t);
	}, [searchParams]);

	const openLoginModal = (destination?: string, allowGuest = true) => {
		const params = new URLSearchParams(searchParams.toString());
		params.set('login', 'true');
		if (allowGuest) {
			params.set('allowGuest', 'true');
		} else {
			params.delete('allowGuest');
		}
		params.set('subtitle', 'Đăng nhập để lưu và theo dõi tiến độ học tập');
		params.set('callbackUrl', destination || pathname);
		router.push(`${pathname}?${params.toString()}`, { scroll: false });
	};

	const handleTabChange = (newTab: string) => {
		setTab(newTab);
		const params = new URLSearchParams(searchParams.toString());
		params.set('tab', newTab);
		params.delete('topic'); // clear topic when switching tabs
		router.push(`${pathname}?${params.toString()}`, { scroll: false });
	};

	return (
		<div className="min-h-screen bg-slate-50/50">
			<div className="max-w-6xl mx-auto py-8 px-4 sm:px-6">

			
			<div className="flex justify-between items-center mb-10 pb-4 overflow-x-auto scrollbar-hide">
				<div className="flex gap-4 sm:gap-8 pr-4">
					{TABS.map((t) => (
						<button
							key={t.key}
							className={`flex items-center gap-2 group transition-all duration-300 focus:outline-none cursor-pointer whitespace-nowrap`}
							onClick={() => handleTabChange(t.key)}
						>
							<span className={`text-xl transition-transform duration-300 ${tab === t.key ? "scale-110" : "opacity-60 scale-100 group-hover:opacity-100"}`}>
								{t.icon}
							</span>
							<span className={`text-sm font-bold tracking-tight transition-all ${
								tab === t.key 
									? "text-[#14532d] scale-105" 
									: "text-slate-400 group-hover:text-slate-600"
							}`}>
								{t.label}
							</span>
						</button>
					))}
				</div>
				<Link href="/toeic-progress" className="hidden md:flex items-center gap-2 group transition-all duration-300 focus:outline-none cursor-pointer whitespace-nowrap shrink-0">
					<span className="text-xl transition-transform duration-300 opacity-60 scale-100 group-hover:opacity-100">
						📈
					</span>
					<span className="text-sm font-bold tracking-tight transition-all text-slate-400 group-hover:text-slate-600">
						Tiến Độ Của Tôi
					</span>
				</Link>
			</div>
			<div className="mt-6">
				 {tab === "home" && <ToeicHomeTab onTabClick={handleTabChange} />}
				 {tab === "grammar" && <ToeicGrammarTab onPracticeClick={(slug) => {
					 if (!session) {
						 openLoginModal(slug ? `/toeic-practice/grammar/${slug}` : undefined);
					 } else if (slug) {
						 router.push(`/toeic-practice/grammar/${slug}`);
					 }
				 }} />}
				{tab === "vocabulary" && <ToeicVocabularyTab 
					onPracticeClick={(topic, allowGuest = true) => {
					 if (!session) {
						const params = new URLSearchParams(searchParams.toString());
						params.set('tab', 'vocabulary');
						if (topic) params.set('topic', topic);
						openLoginModal(`${pathname}?${params.toString()}`, allowGuest);
					 }
				 }} />}
				{tab === "listening" && <ToeicListeningTab onPracticeClick={() => {
					 if (!session) openLoginModal(`${pathname}?tab=listening`);
				 }} />}
				{tab === "reading" && <ToeicReadingTab onPracticeClick={(slug) => {
					 if (!session) {
						 openLoginModal(slug ? `/toeic-practice/grammar/${slug}` : undefined);
					 } else if (slug) {
						 router.push(`/toeic-practice/grammar/${slug}`);
					 }
				 }} />}
				{tab === "actual-test" && <ToeicActualTestTab onPracticeClick={() => {
					 if (!session) openLoginModal(`${pathname}?tab=actual-test`);
				 }} />}
			</div>
		</div>
	</div>
	);
}

function ToeicHomeTab({ onTabClick }: { onTabClick: (tab: string) => void }) {
	const [stats, setStats] = useState({ users: 24, grammarTopics: 30, vocabularies: 1540 });

	useEffect(() => {
		fetch('/api/toeic/stats').then(res => res.json()).then(data => setStats(data)).catch(console.error);
	}, []);

	return (
		<div className="py-8 pb-20">
			{/* Hero Section */}
			<div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-8 mb-24 max-w-6xl mx-auto rounded-[40px] bg-white p-8 sm:p-12 shadow-sm border border-slate-100 overflow-hidden relative">
				
				{/* Background abstract decorations */}
				<div className="absolute top-0 right-[20%] w-[500px] h-[500px] bg-slate-50 rounded-full blur-[80px] -z-10"></div>
				<div className="absolute bottom-0 left-[-10%] w-[300px] h-[300px] bg-green-50 rounded-full blur-[80px] -z-10"></div>

				{/* Left Content */}
				<div className="w-full lg:w-[55%] z-10 shrink-0">
					<h1 className="text-[2.8rem] sm:text-5xl md:text-6xl lg:text-[72px] font-black tracking-tight leading-[1.1] mb-6 drop-shadow-sm flex flex-col">
						<span className="text-[#14532d] block whitespace-nowrap">Chinh phục TOEIC</span>
						<span className="text-[#ea980c] block whitespace-nowrap mt-2" style={{ WebkitTextStroke: '1.5px #ea980c', color: 'transparent', textShadow: '4px 4px 0px rgba(234, 152, 12, 0.15)' }}>Dễ Dàng & Thú Vị!</span>
					</h1>
					<p className="text-slate-500 text-lg md:text-xl max-w-xl mb-10 leading-relaxed font-medium">
						Hệ thống luyện thi TOEIC theo phương pháp đặc biệt — thực chiến, hỗ trợ sát sao, và mang lại hiệu quả cao.
					</p>

					<div className="space-y-6 mb-12">
						<div className="flex gap-4 group">
							<div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0 group-hover:bg-green-600 group-hover:text-white transition-colors shadow-sm">
								<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
							</div>
							<div>
								<h3 className="font-bold text-slate-800 text-lg mb-1">Cá nhân hóa lộ trình</h3>
								<p className="text-slate-500 text-sm leading-relaxed">Hệ thống bài tập thiết kế dựa theo trình độ và mục tiêu của riêng bạn.</p>
							</div>
						</div>
						<div className="flex gap-4 group">
							<div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0 group-hover:bg-green-600 group-hover:text-white transition-colors shadow-sm">
								<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
							</div>
							<div>
								<h3 className="font-bold text-slate-800 text-lg mb-1">Thực chiến chuyên sâu</h3>
								<p className="text-slate-500 text-sm leading-relaxed">Nhận chấm điểm và phân tích lập tức với độ chính xác cao.</p>
							</div>
						</div>
						<div className="flex gap-4 group">
							<div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0 group-hover:bg-green-600 group-hover:text-white transition-colors shadow-sm">
								<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
							</div>
							<div>
								<h3 className="font-bold text-slate-800 text-lg mb-1">Flashcard thông minh</h3>
								<p className="text-slate-500 text-sm leading-relaxed">Ôn tập từ vựng, ngữ pháp theo thuật toán Spaced-repetition.</p>
							</div>
						</div>
					</div>

					<div className="flex flex-wrap items-center gap-4">
						<button onClick={() => onTabClick('reading')} className="brand-cta brand-cta-register !text-lg !px-8 !py-4 !rounded-xl group">
							<span>Bắt đầu luyện tập</span>
							<span aria-hidden="true" className="brand-cta-arrow transition-transform group-hover:translate-x-1">→</span>
						</button>
						<button onClick={() => onTabClick('actual-test')} className="flex items-center gap-3 px-6 py-4 bg-[#f8f9fa] hover:bg-slate-100 text-slate-700 rounded-xl font-bold text-lg border border-slate-200 transition-all hover:border-[#14532d] hover:text-[#14532d]">
							<div className="w-8 h-8 bg-[#14532d] rounded-lg text-white flex items-center justify-center shadow-md">
								<svg className="w-4 h-4 ml-0.5" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
							</div>
							Thi thử TOEIC
						</button>
					</div>
				</div>

				{/* Right Cards Area */}
				<div className="w-full lg:w-[45%] relative h-[450px] flex items-center justify-center mt-10 lg:mt-0 z-10 mx-auto max-w-[400px]">
					{/* Abstract Shape Behind */}
					<div className="absolute inset-0 bg-[#fde68a]/40 rounded-[60px] transform rotate-3 -z-10 shadow-sm overflow-hidden flex items-center justify-center">
					    <div className="absolute bottom-[-10%] left-[-20%] w-[250px] h-[250px] bg-[#14532d]/80 rounded-full blur-[2px]"></div>
					    <div className="absolute top-[-10%] right-[-10%] w-[200px] h-[200px] bg-amber-500/80 rounded-full blur-[2px]"></div>
					</div>

					<div className="flex flex-col gap-6 w-[80%] z-20">
						{/* Badge 1 */}
						<div className="bg-white/95 backdrop-blur-sm px-6 py-5 rounded-[24px] shadow-xl flex items-center justify-between border border-white hover:-translate-y-1 transition duration-300 transform -rotate-2">
							<div className="flex gap-4 items-center">
								<div className="w-12 h-12 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center shadow-inner shrink-0">
									<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
								</div>
								<div>
									<div className="text-slate-500 font-bold text-[11px] uppercase tracking-wider mb-1">Chủ đề Ngữ pháp</div>
									<div className="font-black text-slate-800 text-xl leading-none">{stats.grammarTopics}+</div>
								</div>
							</div>
						</div>

						{/* Badge 2 */}
						<div className="bg-white/95 backdrop-blur-sm px-6 py-5 rounded-[24px] shadow-xl flex items-center justify-between border border-white hover:-translate-y-1 transition duration-300 transform rotate-1 translate-x-6">
							<div className="flex gap-4 items-center">
								<div className="w-12 h-12 border-4 border-red-500 bg-red-50 rounded-full flex items-center justify-center shadow-inner shrink-0 leading-none">
									<svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24"><path d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"></path></svg>
								</div>
								<div>
									<div className="text-slate-500 font-bold text-[11px] uppercase tracking-wider mb-1">Từ vựng TOEIC</div>
									<div className="font-black text-slate-800 text-xl leading-none">{stats.vocabularies}+</div>
								</div>
							</div>
						</div>

						{/* Badge 3 */}
						<div className="bg-white/95 backdrop-blur-sm px-6 py-5 rounded-[24px] shadow-xl flex items-center justify-between border border-white hover:-translate-y-1 transition duration-300 transform -rotate-1">
							<div className="flex gap-4 items-center">
								<div className="w-12 h-12 bg-[#14532d]/10 text-[#14532d] rounded-full flex flex-col items-center justify-center shrink-0">
									<svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
								</div>
								<div>
									<div className="text-slate-500 font-bold text-[11px] uppercase tracking-wider mb-1">Học viên gia nhập</div>
									<div className="font-black text-slate-800 text-xl leading-none flex items-center gap-2">
										{stats.users}
										<div className="flex -space-x-1.5 ml-1">
											<div className="w-5 h-5 rounded-full bg-blue-100 border border-white"></div>
											<div className="w-5 h-5 rounded-full bg-green-100 border border-white"></div>
											<div className="w-5 h-5 rounded-full bg-rose-100 border border-white"></div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Features Section */}
			<div className="text-center mb-12">
				<h2 className="text-3xl md:text-4xl font-black text-slate-800 mb-4">
					Trên <span className="text-[#14532d]">TOEICMORE</span> bạn luyện được gì?
				</h2>
				<p className="text-slate-500">Hệ thống luyện tập toàn diện, từ ngữ pháp đến luyện nghe, từ vựng đến luyện đề</p>
			</div>
			
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				{/* Ngữ pháp */}
				<div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative">
					<div className="w-3 h-3 rounded-full bg-emerald-400 absolute top-6 right-6"></div>
					<div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
						<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
					</div>
					<h3 className="text-lg font-bold text-slate-800 mb-2">Ngữ pháp</h3>
					<p className="text-slate-500 text-sm mb-6 min-h-[60px]">Chinh phục TOEIC với hệ thống bài học và luyện tập toàn diện.</p>
					<button onClick={() => onTabClick('grammar')} className="text-blue-600 font-bold text-sm flex items-center gap-1 hover:text-blue-700">
						Bắt đầu →
					</button>
				</div>
				
				{/* Luyện nghe */}
				<div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative">
					<div className="w-3 h-3 rounded-full bg-emerald-400 absolute top-6 right-6"></div>
					<div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-6">
						<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>
					</div>
					<h3 className="text-lg font-bold text-slate-800 mb-2">Reading</h3>
					<p className="text-slate-500 text-sm mb-6 min-h-[60px]">Luyện Reading Part 5, 6, 7 giải thích cặn kẽ từng câu.</p>
					<button onClick={() => onTabClick('reading')} className="text-indigo-600 font-bold text-sm flex items-center gap-1 hover:text-indigo-700">
						Bắt đầu →
					</button>
				</div>

				{/* Từ vựng */}
				<div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative">
					<div className="w-3 h-3 rounded-full bg-emerald-400 absolute top-6 right-6"></div>
					<div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
						<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"></path></svg>
					</div>
					<h3 className="text-lg font-bold text-slate-800 mb-2">Từ vựng</h3>
					<p className="text-slate-500 text-sm mb-6 min-h-[60px]">Học từ vựng TOEIC theo chủ đề với flashcard thẻ học xịn xò.</p>
					<button onClick={() => onTabClick('vocabulary')} className="text-blue-600 font-bold text-sm flex items-center gap-1 hover:text-blue-700">
						Bắt đầu →
					</button>
				</div>

				{/* Luyện đề */}
				<div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative">
					<div className="w-3 h-3 rounded-full bg-emerald-400 absolute top-6 right-6"></div>
					<div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center mb-6">
						<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
					</div>
					<h3 className="text-lg font-bold text-slate-800 mb-2">Luyện đề</h3>
					<p className="text-slate-500 text-sm mb-6 min-h-[60px]">Luyện các đề ETS TOEIC full test với chấm điểm và phân tích chi tiết.</p>
					<button onClick={() => onTabClick('actual-test')} className="text-sky-600 font-bold text-sm flex items-center gap-1 hover:text-sky-700">
						Bắt đầu →
					</button>
				</div>
			</div>
		</div>
	);
}

function ToeicGrammarTab({ onPracticeClick }: { onPracticeClick: (slug?: string) => void }) {
	const [topics, setTopics] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const { data: session } = useSession();

	useEffect(() => {
		const fetchTopics = async () => {
			try {
				const res = await fetch('/api/toeic/grammar');
				if (res.ok) {
					const data = await res.json();
					setTopics(data);
				}
			} catch (error) {
				console.error('Failed to fetch topics:', error);
			} finally {
				setLoading(false);
			}
		};
		fetchTopics();
	}, []);

	if (loading) {
		return <div className="py-12 text-center text-gray-500 italic">Đang tải các chủ đề...</div>;
	}

	return (
		<div>
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
				{topics.length === 0 ? (
					<div className="col-span-full py-16 text-center text-slate-400 border-2 border-dashed border-slate-100 rounded-3xl">
						Chưa có chủ đề nào được cập nhật.
					</div>
				) : (
					topics.map((topic) => (
						<TopicCard
							key={topic.id}
							type="grammar"
							title={topic.title}
							subtitle={topic.subtitle || 'Ngữ pháp TOEIC'}
							badgeText={`${topic._count?.lessons || 0} Lessons`}
							onClick={() => onPracticeClick(topic.slug)}
						/>
					))
				)}
			</div>
		</div>
	);
}

const normalizePronunciationText = (value: string) =>
	value
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-z0-9\s]/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();

const calculateLevenshteinDistance = (left: string, right: string) => {
	const rows = left.length + 1;
	const cols = right.length + 1;
	const matrix = Array.from({ length: rows }, () => Array.from({ length: cols }, () => 0));
	for (let row = 0; row < rows; row += 1) matrix[row][0] = row;
	for (let col = 0; col < cols; col += 1) matrix[0][col] = col;
	for (let row = 1; row < rows; row += 1) {
		for (let col = 1; col < cols; col += 1) {
			const substitutionCost = left[row - 1] === right[col - 1] ? 0 : 1;
			matrix[row][col] = Math.min(matrix[row - 1][col] + 1, matrix[row][col - 1] + 1, matrix[row - 1][col - 1] + substitutionCost);
		}
	}
	return matrix[left.length][right.length];
};

const calculateSimilarityScore = (target: string, candidate: string) => {
	if (!target && !candidate) return 100;
	const maxLength = Math.max(target.length, candidate.length);
	if (maxLength === 0) return 0;
	const distance = calculateLevenshteinDistance(target, candidate);
	return Math.max(0, Math.round((1 - distance / maxLength) * 100));
};

const getBestPronunciationCandidate = (target: string, transcript: string) => {
	const normalizedTarget = normalizePronunciationText(target);
	const normalizedTranscript = normalizePronunciationText(transcript);
	if (!normalizedTarget || !normalizedTranscript) return { candidate: normalizedTranscript, score: 0 };
	const targetTokenCount = normalizedTarget.split(' ').length;
	const transcriptTokens = normalizedTranscript.split(' ');
	const candidates = new Set<string>([normalizedTranscript]);
	transcriptTokens.forEach((token) => { if (token) candidates.add(token); });
	for (let windowSize = Math.max(1, targetTokenCount - 1); windowSize <= Math.min(transcriptTokens.length, targetTokenCount + 1); windowSize += 1) {
		for (let index = 0; index <= transcriptTokens.length - windowSize; index += 1) {
			candidates.add(transcriptTokens.slice(index, index + windowSize).join(' '));
		}
	}
	let bestCandidate = normalizedTranscript;
	let bestScore = 0;
	candidates.forEach((candidate) => {
		const score = calculateSimilarityScore(normalizedTarget, candidate);
		if (score > bestScore) {
			bestScore = score;
			bestCandidate = candidate;
		}
	});
	return { candidate: bestCandidate, score: bestScore };
};

const buildPronunciationFeedback = (score: number, candidate: string, target: string) => {
	if (score >= 95) return `Excellent. Your pronunciation matched "${target}" very closely.`;
	if (score >= 80) return `Good job. We heard "${candidate}", which is close to "${target}".`;
	if (score >= 60) return `Pretty close. We heard "${candidate}". Try slowing down and stressing each syllable more clearly.`;
	return `We heard "${candidate || 'something different'}". Listen again and repeat the word "${target}" more clearly.`;
};

const UltraTag = () => (
	<span className="inline-flex items-center gap-0.5 px-1.5 py-[2px] rounded border border-purple-600/50 bg-linear-to-r from-purple-900 via-purple-800 to-indigo-900 text-[8px] font-black text-purple-100 shadow-[0_0_8px_rgba(88,28,135,0.5)]">
		<svg className="w-2.5 h-2.5 fill-amber-400" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
		ULTRA
	</span>
);

const ProTag = () => (
	<span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-linear-to-r from-amber-500 via-amber-400 to-orange-500 text-[9px] font-black text-white shadow-[0_0_8px_rgba(245,158,11,0.3)] border border-amber-300/50">
		<svg className="w-2.5 h-2.5 fill-white" viewBox="0 0 24 24"><path d="M12 17.27l4.15 2.51c.76.46 1.69-.22 1.49-1.08l-1.1-4.72 3.67-3.18c.67-.58.31-1.68-.57-1.75l-4.83-.41-1.89-4.46c-.34-.81-1.5-.81-1.84 0L9.19 8.6l-4.83.41c-.88.07-1.24 1.17-.57 1.75l3.67 3.18-1.1 4.72c-.2.86.73 1.54 1.49 1.08l4.15-2.5z"/></svg>
		PRO
	</span>
);

function ToeicVocabularyTab({ onPracticeClick }: { onPracticeClick: (topic?: string, allowGuest?: boolean) => void }) {
	const { data: session } = useSession();
	const searchParams = useSearchParams();
	const pathname = usePathname();
	const router = useRouter();

	const [topics, setTopics] = useState<{ topic: string; wordCount: number }[]>([]);
	const [loading, setLoading] = useState(true);
	const [subTab, setSubTab] = useState<'practice' | 'progress'>('practice');

	const initialTopic = searchParams.get('topic');
	const [selectedTopic, setSelectedTopic] = useState<string | null>(initialTopic);
	const [vocabItems, setVocabItems] = useState<any[]>([]);
	const [isUltra, setIsUltra] = useState(false);
	const [isPro, setIsPro] = useState(false);
	const [topicProFields, setTopicProFields] = useState<string[]>([]);
	const [topicUltraFields, setTopicUltraFields] = useState<string[]>([]);
	const [totalWords, setTotalWords] = useState(0);
	const [vocabLoading, setVocabLoading] = useState(false);
	const [cardIndex, setCardIndex] = useState(0);
	const [isFlipped, setIsFlipped] = useState(false);
	const [showUpgrade, setShowUpgrade] = useState(false);
	const [showExampleVi, setShowExampleVi] = useState(false);
	const [speechSupported, setSpeechSupported] = useState(false);

	const [vocabTags, setVocabTags] = useState<Record<string, { learned?: boolean, hard?: boolean, bookmarked?: boolean }>>({});
	// Speed Challenge State
	const [challengeExpanded, setChallengeExpanded] = useState(false);
	const [challengePreCtd, setChallengePreCtd] = useState<number | null>(null);
	const [challengeActive, setChallengeActive] = useState(false);
	const [challengeWords, setChallengeWords] = useState<any[]>([]);
	const [challengeRound, setChallengeRound] = useState(0);
	const [challengeOptions, setChallengeOptions] = useState<string[]>([]);
	const [challengeScore, setChallengeScore] = useState(0);
	const [challengeTimeLeft, setChallengeTimeLeft] = useState(3);
	const [challengeResult, setChallengeResult] = useState<{show: boolean, score: number, total: number}>({show: false, score: 0, total: 0});

	const [isPronunciationListening, setIsPronunciationListening] = useState(false);
	const [pronunciationStatus, setPronunciationStatus] = useState('');
	const [pronunciationFeedback, setPronunciationFeedback] = useState('');
	const [pronunciationTranscript, setPronunciationTranscript] = useState('');
	const [pronunciationScore, setPronunciationScore] = useState<number | null>(null);
	const pronunciationScoringTimeoutRef = useRef<number | null>(null);
	const pronunciationListeningTimeoutRef = useRef<number | null>(null);
	const pronunciationFinalizeTimeoutRef = useRef<number | null>(null);
	const pronunciationRecognitionRef = useRef<any>(null);
	const pronunciationDoneAudioRef = useRef<HTMLAudioElement | null>(null);
	const pronunciationRewardAudioRef = useRef<HTMLAudioElement | null>(null);

	useEffect(() => {
		if (session) {
			const fetchTags = async () => {
				try {
					const res = await fetch('/api/toeic/vocabulary/tags');
					if (res.ok) {
						const data = await res.json();
						if (data.tags) {
							const tagsMap: Record<string, { learned?: boolean, hard?: boolean, bookmarked?: boolean }> = {};
							data.tags.forEach((t: any) => {
								tagsMap[t.vocabId] = { learned: t.isLearned, hard: t.isHard, bookmarked: t.isBookmarked };
							});
							setVocabTags(tagsMap);
						}
					}
				} catch (e) {
					console.error('Failed to fetch vocab tags', e);
				}
			};
			fetchTags();
		}
	}, [session]);

	useEffect(() => {
		if (typeof window === 'undefined') return;
		const win = window as any;
		setSpeechSupported(Boolean(win.SpeechRecognition || win.webkitSpeechRecognition));

		pronunciationDoneAudioRef.current = new Audio('/audio/tingsound.mp3');
		pronunciationDoneAudioRef.current.preload = 'auto';
		pronunciationDoneAudioRef.current.load();

		pronunciationRewardAudioRef.current = new Audio('/audio/amazing-reward-sound.mp3');
		pronunciationRewardAudioRef.current.preload = 'auto';
		pronunciationRewardAudioRef.current.load();

		return () => {
			if (pronunciationDoneAudioRef.current) pronunciationDoneAudioRef.current.pause();
			if (pronunciationRewardAudioRef.current) pronunciationRewardAudioRef.current.pause();
		};
	}, []);

	const playPronunciationDoneChime = () => {
		if (typeof window !== 'undefined' && pronunciationDoneAudioRef.current) {
			try {
				pronunciationDoneAudioRef.current.pause();
				pronunciationDoneAudioRef.current.currentTime = 0;
				void pronunciationDoneAudioRef.current.play().catch(() => {});
			} catch {}
		}
	};

	const playPronunciationRewardChime = () => {
		if (typeof window !== 'undefined' && pronunciationRewardAudioRef.current) {
			try {
				pronunciationRewardAudioRef.current.pause();
				pronunciationRewardAudioRef.current.currentTime = 0;
				void pronunciationRewardAudioRef.current.play().catch(() => {});
			} catch {}
		}
	};

	const clearPronunciationTimeouts = () => {
		if (typeof window === 'undefined') return;
		[pronunciationScoringTimeoutRef, pronunciationListeningTimeoutRef, pronunciationFinalizeTimeoutRef].forEach(ref => {
			if (ref.current) {
				window.clearTimeout(ref.current);
				ref.current = null;
			}
		});
	};

	useEffect(() => {
		return () => clearPronunciationTimeouts();
	}, []);

	const stopRecognition = () => {
		if (pronunciationRecognitionRef.current) {
			try {
				pronunciationRecognitionRef.current.stop();
			} catch {}
			pronunciationRecognitionRef.current = null;
		}
		setIsPronunciationListening(false);
	};

	const startVoicePractice = () => {
		const currentWord = vocabItems[cardIndex]?.word;
		if (!currentWord || typeof window === 'undefined') return;

		const win = window as any;
		const RecognitionCtor = win.SpeechRecognition || win.webkitSpeechRecognition;
		if (!RecognitionCtor) return;

		setPronunciationStatus('Đang lắng nghe... Hãy đọc từ vựng ngay.');
		setPronunciationFeedback('');
		setPronunciationTranscript('');
		setPronunciationScore(null);
		setIsPronunciationListening(true);
		clearPronunciationTimeouts();
		stopRecognition();

		// Prime audio
		try {
			if (pronunciationDoneAudioRef.current) {
				pronunciationDoneAudioRef.current.muted = true;
				void pronunciationDoneAudioRef.current.play().then(() => {
					if (pronunciationDoneAudioRef.current) {
						pronunciationDoneAudioRef.current.pause();
						pronunciationDoneAudioRef.current.currentTime = 0;
						pronunciationDoneAudioRef.current.muted = false;
					}
				}).catch(() => { if (pronunciationDoneAudioRef.current) pronunciationDoneAudioRef.current.muted = false; });
			}
			if (pronunciationRewardAudioRef.current) {
				pronunciationRewardAudioRef.current.muted = true;
				void pronunciationRewardAudioRef.current.play().then(() => {
					if (pronunciationRewardAudioRef.current) {
						pronunciationRewardAudioRef.current.pause();
						pronunciationRewardAudioRef.current.currentTime = 0;
						pronunciationRewardAudioRef.current.muted = false;
					}
				}).catch(() => { if (pronunciationRewardAudioRef.current) pronunciationRewardAudioRef.current.muted = false; });
			}
		} catch {}

		const recognition = new RecognitionCtor();
		pronunciationRecognitionRef.current = recognition;
		recognition.lang = 'en-US';
		recognition.interimResults = true;
		recognition.continuous = false;

		let hasHandledFinal = false;

		const finalize = (transcript: string) => {
			if (hasHandledFinal) return;
			hasHandledFinal = true;
			stopRecognition();
			const { candidate, score } = getBestPronunciationCandidate(currentWord, transcript);
			setPronunciationTranscript(transcript);
			setPronunciationStatus('Đã nhận giọng nói. Đang đánh giá...');
			playPronunciationDoneChime();
			
			pronunciationScoringTimeoutRef.current = window.setTimeout(() => {
				setPronunciationScore(score);
				setPronunciationFeedback(buildPronunciationFeedback(score, candidate, currentWord));
				setPronunciationStatus(score >= 80 ? 'Rất tốt! Hãy tiếp tục phát huy.' : 'Hãy thử lại một lần nữa nhé.');
				if (score === 100) {
					playPronunciationRewardChime();
				}
			}, 500);
		};

		recognition.onresult = (event: any) => {
			const transcript = Array.from(event.results).map((r: any) => r[0].transcript).join(' ').trim();
			setPronunciationTranscript(transcript);
			if (event.results[0].isFinal) {
				finalize(transcript);
			} else {
				if (pronunciationFinalizeTimeoutRef.current) window.clearTimeout(pronunciationFinalizeTimeoutRef.current);
				pronunciationFinalizeTimeoutRef.current = window.setTimeout(() => finalize(transcript), 1000);
			}
		};

		recognition.onerror = () => {
			stopRecognition();
			setPronunciationStatus('Không thể nhận dạng giọng nói. Hãy thử lại nơi yên tĩnh hơn.');
		};

		recognition.onend = () => setIsPronunciationListening(false);
		recognition.start();

		// Timeout if no result within 7s
		pronunciationListeningTimeoutRef.current = window.setTimeout(() => {
			if (isPronunciationListening) {
				stopRecognition();
				setPronunciationStatus('Hết thời gian chờ. Xin hãy thử lại.');
			}
		}, 7000);
	};

	useEffect(() => {
		const fetchTopics = async () => {
			try {
				const res = await fetch('/api/toeic/vocabulary/topics');
				if (res.ok) {
					const data = await res.json();
					setTopics(data.topics || []);
				}
			} catch (e) {
				console.error(e);
			} finally {
				setLoading(false);
			}
		};
		fetchTopics();
	}, []);

	// Handle initialTopic from URL or back Navigation
	useEffect(() => {
		const topicFromUrl = searchParams.get('topic');
		const tabFromUrl = searchParams.get('tab');
		if (tabFromUrl === 'vocabulary' && topicFromUrl && topicFromUrl !== selectedTopic) {
			loadTopic(topicFromUrl);
		} else if (!topicFromUrl && selectedTopic) {
			setSelectedTopic(null);
		}
	}, [searchParams]);

	const openTopic = async (topic: string) => {
		if (!session) { onPracticeClick(topic); return; }
		
		// Update URL to reflect current topic
		const params = new URLSearchParams(searchParams.toString());
		params.set('topic', topic);
		params.set('tab', 'vocabulary');
		router.push(`${pathname}?${params.toString()}`, { scroll: false });
		
		loadTopic(topic);
	};

	const loadTopic = async (topic: string) => {
		setSelectedTopic(topic);
		setVocabLoading(true);
		setCardIndex(0);
		setIsFlipped(false);
		setShowExampleVi(false);
		setChallengeResult({ show: false, score: 0, total: 0 });
		setChallengeActive(false);
		setChallengeExpanded(false);
		setChallengePreCtd(null);

		let localTags: Record<number, any> = {};
		if (typeof window !== 'undefined') {
			try {
				const stored = localStorage.getItem(`vocab-tags-${session?.user?.id || 'guest'}`);
				if (stored) localTags = JSON.parse(stored);
				setVocabTags(localTags);
			} catch {}
		}

		try {
			const res = await fetch(`/api/toeic/vocabulary?topic=${encodeURIComponent(topic)}`);
			if (res.ok) {
				const data = await res.json();
				const rawItems = data.items || [];
				const filteredItems = rawItems.filter((w: any) => !localTags[w.id]?.learned);
				
				setVocabItems(filteredItems.length > 0 ? filteredItems : rawItems);
				setIsUltra(data.isUltra ?? false);
				setIsPro(data.isPro ?? false);
				try {
					setTopicProFields(JSON.parse(data.topicConfig?.proFields || "[]"));
					setTopicUltraFields(JSON.parse(data.topicConfig?.ultraFields || "[]"));
				} catch {
					setTopicProFields([]);
					setTopicUltraFields([]);
				}
				setTotalWords(data.total ?? 0);
			}
		} catch (e) {
			console.error(e);
		} finally {
			setVocabLoading(false);
		}
	};

	const moveCard = (dir: 'prev' | 'next') => {
		setIsFlipped(false);
		setShowExampleVi(false);
		setPronunciationStatus('');
		setPronunciationScore(null);
		setPronunciationFeedback('');
		stopRecognition();
		setTimeout(() => {
			setCardIndex((prev) =>
				dir === 'next'
					? Math.min(prev + 1, vocabItems.length - 1)
					: Math.max(prev - 1, 0)
			);
		}, 150);
	};

	const toggleTag = async (wordId: string, tag: 'learned' | 'hard' | 'bookmarked') => {
		if (!session) {
			onPracticeClick(selectedTopic || undefined, false);
			return;
		}
		
		// Optimistic UI update
		let updatedState = false;
		let updatedTagData: any = {};
		
		setVocabTags(prev => {
			const current = prev[wordId] || {};
			const newTags = { ...prev, [wordId]: { ...current, [tag]: !current[tag] } };
			if (tag === 'learned' && newTags[wordId].learned) newTags[wordId].hard = false;
			if (tag === 'hard' && newTags[wordId].hard) newTags[wordId].learned = false;
			
			updatedState = newTags[wordId][tag] as boolean;
			updatedTagData = newTags[wordId];
			
			return newTags;
		});

		// Backend sync
		try {
			await fetch('/api/toeic/vocabulary/tags', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					vocabId: wordId,
					isLearned: updatedTagData.learned,
					isHard: updatedTagData.hard,
					isBookmarked: updatedTagData.bookmarked,
				}),
			});
		} catch (error) {
			console.error('Failed to sync tag', error);
		}
	};

	const setupChallengeRound = (roundIdx: number, wList = challengeWords) => {
		if (roundIdx >= wList.length) {
			setChallengeActive(false);
			setChallengeResult({ show: true, score: challengeScore, total: wList.length });
			return;
		}
		const tWord = wList[roundIdx];
		const pool = vocabItems.filter(w => w.id !== tWord.id);
		const wOpts = [...pool].sort(() => 0.5 - Math.random()).slice(0, 2).map(w => w.meaning);
		const opts = [tWord.meaning, ...wOpts].sort(() => 0.5 - Math.random());
		setChallengeOptions(opts);
		setChallengeTimeLeft(3);
	};

	const startChallenge = () => {
		if (vocabItems.length < 3) return;
		const shuffled = [...vocabItems].sort(() => 0.5 - Math.random());
		setChallengeWords(shuffled);
		setChallengeRound(0);
		setChallengeScore(0);
		setChallengeResult({ show: false, score: 0, total: 0 });
		setupChallengeRound(0, shuffled);
		setChallengeActive(true);
	};

	const handleStartChallenge = () => {
		let plays: number[] = [];
		const storageKey = `speed-challenge-plays-${session?.user?.id || 'guest'}`;
		if (typeof window !== 'undefined') {
			try { plays = JSON.parse(localStorage.getItem(storageKey) || '[]'); } catch {}
		}
		const now = Date.now();
		plays = plays.filter(time => now - time < 24 * 60 * 60 * 1000);
		
		let allowed = false;
		if (!session) {
			allowed = plays.length < 1;
		} else {
			if (isPro || isUltra) allowed = true;
			else allowed = plays.length < 2;
		}

		if (!allowed) {
			if (!session) {
				onPracticeClick(selectedTopic || undefined, false); // prompt login for guest
			} else {
				setShowUpgrade(true); // prompt upgrade for normal user
			}
			return;
		}

		plays.push(now);
		if (typeof window !== 'undefined') {
			localStorage.setItem(storageKey, JSON.stringify(plays));
		}

		setChallengeExpanded(false);
		setChallengePreCtd(3);
	};

	useEffect(() => {
		if (challengePreCtd !== null) {
			if (challengePreCtd > 0) {
				const timer = setTimeout(() => setChallengePreCtd(c => c! - 1), 1000);
				return () => clearTimeout(timer);
			} else {
				setChallengePreCtd(null);
				startChallenge();
			}
		}
	}, [challengePreCtd]);

	useEffect(() => {
		if (!challengeActive) return;
		if (challengeTimeLeft <= 0) {
			const nextRound = challengeRound + 1;
			setChallengeRound(nextRound);
			setupChallengeRound(nextRound);
			return;
		}
		const timer = setTimeout(() => setChallengeTimeLeft(pr => pr - 1), 1000);
		return () => clearTimeout(timer);
	}, [challengeTimeLeft, challengeActive, challengeRound]);

	const handleChallengeAnswer = (answer: string) => {
		if (answer === challengeWords[challengeRound].meaning) {
			setChallengeScore(s => s + 1);
		}
		const nextRound = challengeRound + 1;
		setChallengeRound(nextRound);
		setupChallengeRound(nextRound);
	};

	const playPronunciation = (e: React.MouseEvent, word: string) => {
		e.stopPropagation();
		if (typeof window === 'undefined' || !window.speechSynthesis) return;

		window.speechSynthesis.cancel();
		const utterance = new SpeechSynthesisUtterance(word);
		utterance.lang = 'en-US';
		utterance.rate = 0.9;
		
		const voices = window.speechSynthesis.getVoices();
		const preferredVoiceNames = ['Samantha', 'Daniel', 'Alex', 'Google', 'Jenny', 'Guy', 'Christopher', 'Eric', 'Aria', 'Davis', 'Roger', 'Joey', 'Matthew', 'Salli', 'Ivy', 'Kevin'];
		const americanVoice = voices.find((voice) => voice.name === 'Google US English' && voice.lang.toLowerCase() === 'en-us') ||
							  voices.find((voice) => voice.name.toLowerCase().includes('google') && voice.lang.toLowerCase() === 'en-us') ||
							  voices.find((voice) => voice.lang.toLowerCase() === 'en-us' && preferredVoiceNames.some((name) => voice.name.includes(name))) ||
							  voices.find((voice) => voice.lang.toLowerCase() === 'en-us');
		if (americanVoice) {
			utterance.voice = americanVoice;
		}
		window.speechSynthesis.speak(utterance);
	};

	const isFieldLocked = (field: string) => {
		if (topicUltraFields.includes(field) && !isUltra) return 'ULTRA';
		if (topicProFields.includes(field) && !isPro && !isUltra) return 'PRO';
		return null;
	};

	const fieldLabelsVi: Record<string, string> = {
		meaning: 'Nghĩa của từ',
		phonetic: 'Phiên âm',
		englishDefinition: 'English Definition',
		example: 'Example',
		exampleVi: 'Dịch câu ví dụ',
		synonyms: 'Synonyms',
		antonyms: 'Antonyms',
		collocations: 'Collocations',
		toeicTrap: 'TOEIC Tip',
	};

	const LockedFieldView = ({ tier, label }: { tier: 'PRO' | 'ULTRA', label: string }) => (
		<div 
			onClick={(e) => { e.stopPropagation(); setShowUpgrade(true); }}
			className="inline-flex items-center gap-1 cursor-pointer group my-0.5 opacity-80 hover:opacity-100 transition-opacity"
		>
			{tier === 'ULTRA' ? (
				<>
					<svg className="w-3.5 h-3.5 fill-amber-300 drop-shadow-sm" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
					<span className="text-[11px] font-bold text-slate-400 group-hover:text-purple-700 transition-colors">{fieldLabelsVi[label] || label}</span>
				</>
			) : (
				<>
					<svg className="w-3.5 h-3.5 fill-amber-500 drop-shadow-sm" viewBox="0 0 24 24"><path d="M12 17.27l4.15 2.51c.76.46 1.69-.22 1.49-1.08l-1.1-4.72 3.67-3.18c.67-.58.31-1.68-.57-1.75l-4.83-.41-1.89-4.46c-.34-.81-1.5-.81-1.84 0L9.19 8.6l-4.83.41c-.88.07-1.24 1.17-.57 1.75l3.67 3.18-1.1 4.72c-.2.86.73 1.54 1.49 1.08l4.15-2.5z"/></svg>
					<span className="text-[11px] font-bold text-slate-400 group-hover:text-amber-600 transition-colors">{fieldLabelsVi[label] || label}</span>
				</>
			)}
		</div>
	);

	const LockedValueBadge = ({ tier }: { tier: 'PRO' | 'ULTRA' }) => (
		<span 
			onClick={(e) => { e.stopPropagation(); setShowUpgrade(true); }}
			className="inline-flex items-center justify-center cursor-pointer group mt-[1px] transition-colors"
			title={`Nâng cấp ${tier} để xem`}
		>
			{tier === 'ULTRA' ? (
				<svg className="w-3 h-3 text-purple-600 group-hover:text-purple-800 transition-colors" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
			) : (
				<svg className="w-3 h-3 text-amber-500 group-hover:text-amber-600 transition-colors" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
			)}
		</span>
	);

	const backToTopics = () => {
		const params = new URLSearchParams(searchParams.toString());
		params.delete('topic');
		router.push(`${pathname}?${params.toString()}`, { scroll: false });
		setSelectedTopic(null);
		setVocabItems([]);
	};

	// ── Topic list ──────────────────────────────────────────
	if (!selectedTopic) {
		return (
			<div>
				<div className="flex justify-between items-center mb-6 border-b border-slate-200 pb-3">
					<h3 className="text-[17px] font-bold text-green-800">
						Luyện tập theo chủ đề
					</h3>
					<Link 
						href="/toeic-progress"
						className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 transition-colors bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg"
					>
						<span>Sổ từ vựng</span>
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
					</Link>
				</div>

				<>
						{loading ? (
							<div className="py-12 text-center text-slate-400 italic font-medium">Đang tải chủ đề...</div>
						) : topics.length === 0 ? (
							<div className="py-16 text-center text-slate-400 border-2 border-dashed border-slate-100 rounded-3xl">
								Chưa có chủ đề từ vựng nào. Admin cần import từ tab TOEIC.
							</div>
						) : (
							<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
								{topics.map((t) => (
									<TopicCard
										key={t.topic}
										type="vocabulary"
										title={t.topic}
										badgeText={`${t.wordCount} từ`}
										onClick={() => openTopic(t.topic)}
									/>
								))}
							</div>
						)}
					</>
			</div>
		);
	}

	// ── Flashcard view ──────────────────────────────────────
	const currentItem = vocabItems[cardIndex];
	const lockedCount = totalWords - vocabItems.length;
	const hasPremium = currentItem && (currentItem.collocations || currentItem.synonyms || currentItem.antonyms || currentItem.toeicTrap);

	return (
		<div>
			{/* Header */}
			<div className="flex flex-wrap items-center gap-3 mb-6">
				<button
					onClick={backToTopics}
					className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-1"
				>
					← Quay lại
				</button>
				<h2 className="text-base font-bold text-green-900">📙 {selectedTopic}</h2>

			</div>

			{vocabLoading ? (
				<div className="py-12 text-center text-gray-400 italic">Đang tải từ vựng...</div>
			) : vocabItems.length === 0 ? (
				<div className="py-12 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">Không có từ vựng nào.</div>
			) : (
				<div className="space-y-5">
					{/* 3D Flip Card — same structure as homepage */}
					{currentItem && (
						<div className="relative w-full h-[360px] sm:h-[480px] [perspective:1200px]">
							<div
								className={`relative h-full w-full rounded-2xl shadow-lg transition-transform duration-500 ease-out [transform-style:preserve-3d] cursor-pointer ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}
								onClick={() => setIsFlipped(!isFlipped)}
							>
								{/* ── FRONT FACE ── */}
								<div className="absolute inset-0 h-full w-full rounded-2xl [backface-visibility:hidden] bg-linear-to-br from-[#14532d] via-[#115e3b] to-[#064e3b] p-6 text-white flex flex-col items-center justify-center">
									<span className="absolute top-4 right-5 text-[9px] font-semibold uppercase tracking-wider text-white/50 bg-white/10 px-3 py-1 rounded-full pointer-events-none">
										Nhấn để lật
									</span>
									<p className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight drop-shadow-sm text-center">
										{currentItem.word}
									</p>
									{currentItem.phonetic && (
										<p className="mt-4 text-lg text-white/60 font-medium">{currentItem.phonetic.replaceAll('.', '')}</p>
									)}

									{/* Voice Practice Controls */}
									<div className="flex items-center gap-4 mt-8">
										<button
											type="button"
											onClick={(e) => playPronunciation(e, currentItem.word)}
											className="rounded-full bg-white/10 p-3.5 text-white shadow-sm ring-1 ring-white/20 transition-all hover:bg-white/25 hover:scale-110 active:scale-95"
											title="Nghe phát âm"
										>
											<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
												<path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.49 9.49 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 11-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06z" />
												<path d="M15.932 7.757a.75.75 0 011.061 0 6 6 0 010 8.486.75.75 0 01-1.06-1.061 4.5 4.5 0 000-6.364.75.75 0 010-1.06z" />
											</svg>
										</button>

										{speechSupported && (
											<button
												type="button"
												onClick={(e) => { e.stopPropagation(); startVoicePractice(); }}
												disabled={isPronunciationListening}
												className={`flex items-center justify-center gap-2 shadow-sm ring-1 ring-white/20 transition-all duration-300 overflow-hidden ${
													isPronunciationListening 
														? 'rounded-full bg-[#75967b] px-5 py-2.5 opacity-95 pointer-events-none'
														: 'rounded-full bg-white/10 p-3.5 hover:bg-white/25 hover:scale-110 active:scale-95'
												}`}
												title="Luyện tập phát âm"
											>
												{isPronunciationListening ? (
													<svg className="w-5 h-5 text-white shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path className="animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite] origin-bottom duration-1000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 4a4.992 4.992 0 00-1.5 3.5m9.5-3.5A4.992 4.992 0 0117.5 7.5" />
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 14a3 3 0 003-3V7a3 3 0 00-6 0v4a3 3 0 003 3z" />
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 10v1a7 7 0 01-14 0v-1M12 18v4m-3 0h6" />
													</svg>
												) : (
													<svg className="w-6 h-6 text-white shrink-0" fill="currentColor" viewBox="0 0 24 24">
														<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
														<path d="M19 10v1a7 7 0 0 1-14 0v-1H3v1a9 9 0 0 0 8 8.94V22h2v-2.06A9 9 0 0 0 21 11v-1h-2z" />
													</svg>
												)}
												{isPronunciationListening && (
													<span className="text-white font-bold text-sm tracking-wide whitespace-nowrap animate-pulse">Listening...</span>
												)}
											</button>
										)}
									</div>

									{/* Practice Status Overlay */}
									{(pronunciationStatus || pronunciationScore !== null) && (
										<div className="absolute bottom-16 left-0 right-0 px-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
											<div className="bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-xl border border-white/20 text-slate-800">
												<p className="text-[11px] font-bold text-[#14532d] mb-1">{pronunciationStatus}</p>
												{pronunciationScore !== null && (
													<div className="space-y-1">
														{pronunciationTranscript && (
															<p className="text-[10px] text-slate-500 italic truncate italic">&quot;{pronunciationTranscript}&quot;</p>
														)}
														<div className="flex items-center gap-2">
															<div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
																<div 
																	className={`h-full transition-all duration-700 ${pronunciationScore >= 80 ? 'bg-green-500' : pronunciationScore >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
																	style={{ width: `${pronunciationScore}%` }}
																/>
															</div>
															<span className="text-[10px] font-black text-slate-700">{pronunciationScore}%</span>
														</div>
														{pronunciationFeedback && (
															<p className="text-[9px] font-medium text-slate-600 leading-tight line-clamp-2">{pronunciationFeedback}</p>
														)}
													</div>
												)}
											</div>
										</div>
									)}

									<p className="mt-8 text-xs text-white/50 font-medium tracking-wide">
										Chủ đề: {selectedTopic}
									</p>
								</div>

								{/* ── BACK FACE ── */}
								<div className="absolute inset-0 h-full w-full rounded-2xl [backface-visibility:hidden] [transform:rotateY(180deg)] bg-white border-2 border-[#14532d]/20 p-5 sm:p-7 text-slate-800 flex flex-col shadow-[inset_0_0_20px_rgba(20,83,45,0.02)] overflow-y-auto overflow-x-hidden">
									<span className="absolute top-4 right-5 text-[9px] font-semibold uppercase tracking-wider text-[#14532d]/50 bg-[#14532d]/5 px-3 py-1 rounded-full pointer-events-none">
										Nhấn để lật
									</span>

									{/* Basic info — always visible */}
									<div className="flex-1 flex flex-col items-center justify-start text-center w-full pt-1">
										<p className="text-2xl sm:text-3xl font-bold text-[#14532d] leading-none mb-1">{currentItem.word}</p>
										{currentItem.phonetic && (
											isFieldLocked('phonetic') ? <LockedFieldView tier={isFieldLocked('phonetic')!} label="phonetic" /> :
											<p className="text-[13px] text-slate-400">{currentItem.phonetic.replaceAll('.', '')}</p>
										)}

										<div className="mt-2.5 mb-2.5 w-10 h-0.5 bg-[#14532d]/20 rounded-full mx-auto shrink-0" />

										{isFieldLocked('meaning') ? <LockedFieldView tier={isFieldLocked('meaning')!} label="meaning" /> : (
											<p className="text-lg sm:text-xl font-bold text-slate-800 leading-tight">{currentItem.meaning}</p>
										)}

										{currentItem.englishDefinition && (
											isFieldLocked('englishDefinition') ? <LockedFieldView tier={isFieldLocked('englishDefinition')!} label="englishDefinition" /> :
											<p className="mt-1.5 text-[11px] text-slate-500 font-medium px-2 italic leading-relaxed">{currentItem.englishDefinition}</p>
										)}

										{currentItem.example && (
											isFieldLocked('example') ? <LockedFieldView tier={isFieldLocked('example')!} label="example" /> :
											<div className="mt-3.5 w-full rounded-xl bg-slate-50 p-3 border border-slate-200 flex-shrink-0 relative overflow-hidden text-center flex flex-col items-center">
												<div className="absolute left-0 top-0 bottom-0 w-1 bg-[#14532d]/40" />
												<p className="text-[13px] italic text-slate-700 font-medium tracking-tight">
													<span className="font-bold text-slate-900 not-italic mr-1.5">Example:</span>
													{currentItem.example}
												</p>
												{currentItem.exampleVi && (
													isFieldLocked('exampleVi') ? (
														<div className="mt-2">
															<LockedFieldView tier={isFieldLocked('exampleVi')!} label="exampleVi" />
														</div>
													) : (
														<>
															<button
																type="button"
																onClick={(e) => { e.stopPropagation(); setShowExampleVi(v => !v); }}
																className="mt-1.5 flex items-center justify-center gap-1 text-[#ea980c] hover:text-[#c47c08] transition-colors"
																title="Dịch nghĩa"
															>
																<span className="text-[9px] font-bold tracking-tight">Dịch nghĩa</span>
																<svg
																	className={`w-3 h-3 transition-transform duration-200 ${showExampleVi ? 'rotate-180' : ''}`}
																	fill="none" stroke="currentColor" viewBox="0 0 24 24"
																>
																	<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
																</svg>
															</button>
															{showExampleVi && (
																<p className="mt-1 text-[12px] italic text-[#ea980c] font-medium text-center leading-relaxed">
																	{currentItem.exampleVi}
																</p>
															)}
														</>
													)
												)}
											</div>
										)}

										{/* ── PREMIUM ZONE ── */}
										{hasPremium && (
											<div className="mt-3.5 w-full flex-shrink-0 space-y-2 text-[11px] text-center border-t border-slate-100 pt-3 flex flex-col items-center">
												{currentItem.synonyms && (
													<div className="w-full text-left flex items-start gap-1">
														<span className="font-bold text-[#14532d] flex items-center gap-1 text-[10px] shrink-0 mt-[1px]">
															<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
															Synonyms:
														</span>
														{isFieldLocked('synonyms') ? <LockedValueBadge tier={isFieldLocked('synonyms')!} /> : (
															<span className="text-slate-700 font-medium leading-relaxed">{currentItem.synonyms}</span>
														)}
													</div>
												)}
												{currentItem.antonyms && (
													<div className="w-full text-left flex items-start gap-1">
														<span className="font-bold text-[#14532d] flex items-center gap-1 text-[10px] shrink-0 mt-[1px]">
															<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
															Antonyms:
														</span>
														{isFieldLocked('antonyms') ? <LockedValueBadge tier={isFieldLocked('antonyms')!} /> : (
															<span className="text-slate-700 font-medium leading-relaxed">{currentItem.antonyms}</span>
														)}
													</div>
												)}
												{currentItem.collocations && (
													<div className="w-full text-left flex items-start gap-1">
														<span className="font-bold text-purple-700 flex items-center gap-1 text-[10px] shrink-0 mt-[1px]">
															<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
															Collocations:
														</span>
														{isFieldLocked('collocations') ? <LockedValueBadge tier={isFieldLocked('collocations')!} /> : (
															<span className="text-slate-700 font-medium leading-relaxed">{currentItem.collocations}</span>
														)}
													</div>
												)}
												{currentItem.toeicTrap && (
													<div className="rounded-md bg-amber-50 border border-amber-200 p-2 w-full text-left flex flex-col sm:flex-row sm:items-start gap-1 mt-1 transition-colors">
														<span className="font-bold text-amber-600 flex items-center gap-1 text-[10px] shrink-0 mt-[1px]">
															<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
															TOEIC Tip:
														</span>
														{isFieldLocked('toeicTrap') ? <LockedValueBadge tier={isFieldLocked('toeicTrap')!} /> : (
															<span className="text-slate-700 font-medium leading-relaxed">{currentItem.toeicTrap}</span>
														)}
													</div>
												)}
											</div>
										)}
										{(!isUltra || !isPro) && (topicProFields.length > 0 || topicUltraFields.length > 0) && (
											<button
												type="button"
												onClick={(e) => { e.stopPropagation(); setShowUpgrade(true); }}
												className="mt-6 text-[10px] font-bold text-purple-700 hover:text-purple-800 transition cursor-pointer flex items-center gap-1.5 justify-center"
											>
												Nâng cấp <UltraTag /> để xem đầy đủ Collocations, Synonyms, Antonyms &amp; Bẫy TOEIC
											</button>
										)}
									</div>
								</div>
							</div>
						</div>
					)}

					{/* Nav controls */}
					<div className="flex items-center justify-between gap-2 rounded-xl bg-slate-100 p-2 border border-slate-200 shadow-sm">
						<button
							type="button"
							onClick={() => moveCard('prev')}
							disabled={cardIndex === 0}
							className="group flex items-center justify-center gap-1.5 rounded-lg bg-white shadow-xs px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-green-50 hover:text-green-800 focus:outline-none cursor-pointer disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed"
						>
							<svg className="w-4 h-4 text-green-600 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"/></svg>
							Prev
						</button>

						<div className="flex flex-col items-center gap-0.5">
							<span className="text-sm font-semibold text-slate-600">
								{cardIndex + 1} / {totalWords}
							</span>
						</div>

						<button
							type="button"
							onClick={() => moveCard('next')}
							disabled={cardIndex >= vocabItems.length - 1}
							className="group flex items-center justify-center gap-1.5 rounded-lg bg-white shadow-xs px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-green-50 hover:text-green-800 focus:outline-none cursor-pointer disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed"
						>
							Next
							<svg className="w-4 h-4 text-green-600 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"/></svg>
						</button>
					</div>

					{/* Tags Action Bar */}
					{currentItem && !challengeActive && !challengeResult.show && (
						<div className="flex flex-wrap items-center justify-center gap-2 mt-4 animate-in fade-in slide-in-from-top-2">
							<button onClick={() => toggleTag(currentItem.id, 'learned')} className={`px-3 py-1.5 rounded-full font-medium text-[13px] transition-all duration-300 border shadow-sm hover:-translate-y-0.5 hover:shadow-md ${vocabTags[currentItem.id]?.learned ? 'bg-green-100 text-green-700 border-green-300 hover:brightness-105' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}>
								{vocabTags[currentItem.id]?.learned ? '✓ Đã thuộc' : '○ Đánh dấu đã thuộc'}
							</button>
							<button onClick={() => toggleTag(currentItem.id, 'hard')} className={`px-3 py-1.5 rounded-full font-medium text-[13px] transition-all duration-300 border shadow-sm hover:-translate-y-0.5 hover:shadow-md ${vocabTags[currentItem.id]?.hard ? 'bg-red-100 text-red-700 border-red-300 hover:brightness-105' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}>
								{vocabTags[currentItem.id]?.hard ? '🔥 Khó' : 'Thấy từ này khó?'}
							</button>
							<button onClick={() => toggleTag(currentItem.id, 'bookmarked')} className={`px-3 py-1.5 flex items-center justify-center gap-1.5 rounded-full font-medium text-[13px] transition-all duration-300 border shadow-sm hover:-translate-y-0.5 hover:shadow-md ${vocabTags[currentItem.id]?.bookmarked ? 'bg-amber-100 text-amber-600 border-amber-300 hover:brightness-105' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`} title="Bookmark">
								<svg className="w-3.5 h-3.5" fill={vocabTags[currentItem.id]?.bookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg>
								{vocabTags[currentItem.id]?.bookmarked ? 'Đã lưu' : 'Lưu lại từ này'}
							</button>
						</div>
					)}

					{/* Pre Countdown UI */}
					{challengePreCtd !== null && (
						<div className="mt-8 bg-indigo-600 rounded-3xl p-16 text-center shadow-xl flex flex-col items-center justify-center animate-in zoom-in-95 duration-300">
							<span className="text-white text-xl font-bold mb-4 opacity-80 uppercase tracking-widest">Chuẩn bị...</span>
							<h3 className="text-8xl font-black text-white drop-shadow-lg animate-pulse">{challengePreCtd}</h3>
						</div>
					)}

					{/* Speed Challenge Intro Section */}
					{vocabItems.length >= 3 && !challengeActive && !challengeResult.show && challengePreCtd === null && (
						<div className="mt-8 bg-white border border-indigo-100 rounded-3xl overflow-hidden shadow-sm transition-all duration-300">
							<button onClick={() => setChallengeExpanded(!challengeExpanded)} className="w-full flex items-center justify-between p-6 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer focus:outline-none">
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
										<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
									</div>
									<h3 className="text-lg font-black text-slate-800">Speed Challenge</h3>
								</div>
								<svg className={`w-6 h-6 text-slate-400 transition-transform duration-300 ${challengeExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
							</button>

							{challengeExpanded && (
								<div className="p-8 text-center border-t border-indigo-50 animate-in slide-in-from-top-4 duration-300">
									<h3 className="text-xl font-black text-slate-800 mb-2">Bạn đã tự tin nhớ bao nhiêu % từ vựng ở đây?</h3>
									<p className="text-slate-500 mb-6 font-medium">Tham gia Speed Challenge này nhé? Bạn có trung bình 3 giây để nhìn nhanh ý nghĩa của mỗi từ.</p>
									<p className="text-[12px] text-slate-400 font-medium mb-6 bg-slate-50 p-3 rounded-xl inline-block border border-slate-100">
										{!session ? "Lưu ý: Bạn đang là khách nên chỉ được tham gia 1 lần / 24 giờ. Vui lòng đăng nhập để có thêm lượt." : (!isPro && !isUltra) ? "Lưu ý: Bạn được tham gia 2 lần / 24 giờ. Nâng cấp tài khoản để làm lại không giới hạn." : "Tài khoản cao cấp: Bạn được tham gia thử thách không giới hạn."}
									</p>
									<div className="block">
										<button onClick={handleStartChallenge} className="bg-indigo-600 text-white font-bold text-lg px-8 py-3.5 rounded-full hover:bg-indigo-700 hover:shadow-lg transition-all active:scale-95 cursor-pointer">
											Bắt đầu thử thách ngay
										</button>
									</div>
								</div>
							)}
						</div>
					)}

					{/* Active Speed Challenge UI */}
					{challengeActive && challengeWords[challengeRound] && challengePreCtd === null && (
						<div className="mt-6 bg-white border-2 border-indigo-500 rounded-3xl p-8 shadow-xl animate-in fade-in slide-in-from-bottom-6 duration-300">
							<div className="flex justify-between items-center mb-6">
								<span className="font-bold text-slate-500">Từ {challengeRound + 1} / {challengeWords.length}</span>
							</div>
							
							<div className="text-center mb-10">
								<h4 className="text-5xl font-black text-slate-800 tracking-tight drop-shadow-sm mb-4">
									{challengeWords[challengeRound].word}
								</h4>
								{challengeWords[challengeRound].phonetic && (
									<p className="text-slate-400 font-medium">{challengeWords[challengeRound].phonetic.replaceAll('.', '')}</p>
								)}
							</div>

							<div className="flex justify-start mb-3">
								<div className="flex items-center gap-1.5 text-rose-500 font-bold bg-rose-50 px-3 py-1.5 rounded-full text-sm">
									<svg className="w-4 h-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
									{challengeTimeLeft}s
								</div>
							</div>

							<div className="grid grid-cols-1 gap-3">
								{challengeOptions.map((opt, i) => (
									<button key={i} onClick={() => handleChallengeAnswer(opt)} className="bg-slate-50 border-2 border-slate-200 p-4 rounded-xl text-lg font-bold text-slate-700 hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700 transition-all text-left cursor-pointer">
										{opt}
									</button>
								))}
							</div>
						</div>
					)}

					{/* Challenge Result */}
					{challengeResult.show && (
						<div className="mt-8 bg-indigo-600 text-white rounded-3xl p-10 text-center shadow-xl animate-in zoom-in-95 duration-500">
							<h3 className="text-3xl font-black mb-4 tracking-tight">🎉 Thử Thách Hoàn Tất!</h3>
							<p className="text-indigo-200 text-lg mb-8 font-medium">Bạn đã trả lời đúng <span className="text-white font-bold text-2xl mx-1">{challengeResult.score} / {challengeResult.total}</span> từ vựng.</p>
							
							<div className="flex flex-col sm:flex-row items-center justify-center gap-4">
								<button onClick={handleStartChallenge} className="bg-white text-indigo-700 font-black px-8 py-3.5 rounded-full hover:shadow-lg transition-all w-full sm:w-auto cursor-pointer">
									Làm Lại
								</button>
								<button onClick={() => { setChallengeResult({ show: false, score: 0, total: 0 }); setChallengeExpanded(false); }} className="bg-indigo-800 text-white font-bold px-8 py-3.5 rounded-full hover:bg-indigo-900 transition-all w-full sm:w-auto cursor-pointer">
									Quay Lại Học Từ
								</button>
							</div>
						</div>
					)}

				</div>
			)}

			{showUpgrade && <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} />}
		</div>
	);
}

function ToeicListeningTab({ onPracticeClick }: { onPracticeClick: () => void }) {
	const topics = [
		{ title: "Part 1: Photographs", subtitle: "Mô tả tranh", count: "10 bài" },
		{ title: "Part 2: Question-Response", subtitle: "Hỏi đáp", count: "10 bài" },
		{ title: "Part 3: Conversations", subtitle: "Hội thoại ngắn", count: "10 bài" },
		{ title: "Part 4: Short Talks", subtitle: "Bài nói ngắn", count: "10 bài" },
	];
	return (
		<div>
			<h2 className="text-lg font-bold mb-4 text-green-900 flex items-center gap-2">
				<span className="inline-block w-5 h-5 text-green-700">🎧</span>
				Các phần thi Listening
			</h2>
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
				{topics.map((t) => (
					<TopicCard
						key={t.title}
						title={t.title}
						subtitle={t.subtitle}
						badgeText={t.count.replace(' bài', ' SESSIONS')}
						onClick={onPracticeClick}
					/>
				))}
			</div>
		</div>
	);
}

function ToeicReadingTab({ onPracticeClick }: { onPracticeClick: (slug?: string) => void }) {
	const [topics, setTopics] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedPart, setSelectedPart] = useState<number | null>(null);

	useEffect(() => {
		const fetchTopics = async () => {
			try {
				const res = await fetch('/api/toeic/grammar?type=READING');
				if (res.ok) {
					const data = await res.json();
					setTopics(data);
				}
			} catch (error) {
				console.error('Failed to fetch reading topics:', error);
			} finally {
				setLoading(false);
			}
		};
		fetchTopics();
	}, []);

	if (loading) {
		return <div className="py-12 text-center text-gray-500 italic">Đang tải các chủ đề...</div>;
	}

	const parts = [
		{ id: 5, title: "Part 5: Incomplete Sentences", subtitle: "Hoàn thành câu" },
		{ id: 6, title: "Part 6: Text Completion", subtitle: "Hoàn thành đoạn văn" },
		{ id: 7, title: "Part 7: Reading Comprehension", subtitle: "Đọc hiểu văn bản" },
	];

	if (selectedPart) {
		const filteredTopics = topics.filter(t => t.part === selectedPart);
		const currentPartInfo = parts.find(p => p.id === selectedPart);

		return (
			<div>
				<div className="flex items-center gap-3 mb-6">
					<button
						onClick={() => setSelectedPart(null)}
						className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-1"
					>
						← Quay lại
					</button>
					<h2 className="text-lg font-bold text-green-900 flex items-center gap-2">
						{currentPartInfo?.title}
					</h2>
				</div>
				
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
					{filteredTopics.length === 0 ? (
						<div className="col-span-full py-16 text-center text-slate-400 border-2 border-dashed border-slate-100 rounded-3xl">
							Chưa có chủ đề nào trong phần này được cập nhật.
						</div>
					) : (
						filteredTopics.map((topic) => (
							<TopicCard
								key={topic.id}
								title={topic.title}
								subtitle={topic.subtitle}
								badgeText={`${topic._count?.lessons || 0} SESSIONS`}
								onClick={() => onPracticeClick(topic.slug)}
							/>
						))
					)}
				</div>
			</div>
		);
	}

	return (
		<div>
			<h2 className="text-lg font-bold mb-4 text-green-900 flex items-center gap-2">
				<span className="inline-block w-5 h-5 text-green-700">📖</span>
				Các phần thi Reading
			</h2>
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
				{parts.map((p) => {
					const topicsInPart = topics.filter(t => t.part === p.id);
					const totalLessons = topicsInPart.reduce((acc, t) => acc + (t._count?.lessons || 0), 0);
					
					return (
						<TopicCard
							key={p.id}
							title={p.title}
							subtitle={p.subtitle}
							badgeText={`${totalLessons} SESSIONS`}
							onClick={() => setSelectedPart(p.id)}
						/>
					);
				})}
			</div>
		</div>
	);
}

function ToeicActualTestTab({ onPracticeClick }: { onPracticeClick: () => void }) {
	const testPacks = [
		{ title: "ETS 2024", subtitle: "Bộ đề thi thực tế mới nhất 2024", count: "10 bài test" },
		{ title: "ETS 2023", subtitle: "Bộ đề thi thực tế năm 2023", count: "10 bài test" },
		{ title: "Hackers TOEIC", subtitle: "Bộ đề luyện tập nâng cao", count: "10 bài test" },
	];
	return (
		<div>
			<h2 className="text-lg font-bold mb-4 text-green-900 flex items-center gap-2">
				<span className="inline-block w-5 h-5 text-green-700">🎓</span>
				Đề thi thực tế (Actual Test)
			</h2>
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
				{testPacks.map((test) => (
					<TopicCard
						key={test.title}
						title={test.title}
						subtitle={test.subtitle}
						badgeText={test.count.replace(' bài test', ' TESTS')}
						onClick={onPracticeClick}
					/>
				))}
			</div>
		</div>
	);
}

export default function ToeicHomePage() {
	return (
		<Suspense fallback={null}>
			<ToeicPracticeContent />
		</Suspense>
	);
}

