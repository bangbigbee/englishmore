"use client";
import { useState, useEffect, Suspense, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { signIn, useSession } from 'next-auth/react';
import ToeicWarriorLeaderboard from '@/components/ToeicWarriorLeaderboard';
import UpgradeModal from "@/components/UpgradeModal";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import ToeicOnboardingModal from "@/components/ToeicOnboardingModal";
import ToeicRoadmapTab from "./ToeicRoadmapTab";

const playSound = (soundFileName: string) => {
	try {
		const audio = new Audio(`/audio/${soundFileName}`);
		audio.play().catch(e => console.log('Audio error:', e));
	} catch (e) {
		console.log(e);
	}
};

const TABS = [
	{ 
		key: "home", 
		label: "Trang chủ", 
		icon: (
			<svg className="w-[18px] h-[18px] fill-primary-900" viewBox="0 0 24 24">
				<path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
			</svg>
		) 
	},
	{
		key: "roadmap",
		label: "Lộ trình",
		icon: (
			<svg className="w-5 h-5 text-secondary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
				<path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
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
				<path d="M4 19C4 19.8284 4.67157 20.5 5.5 20.5H18.5C19.3284 20.5 20 19.8284 20 19V17.5H4V19Z" fill="var(--primary-500)"/>
				<path d="M4 17.5V4C4 2.89543 4.89543 2 6 2H20V17.5H4Z" fill="var(--primary-500)" fillOpacity="0.15" stroke="var(--primary-500)" strokeWidth="2"/>
				<path d="M7 6L8.5 10M10 6L8.5 10M7.5 8.5H9.5" stroke="var(--primary-500)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
				<path d="M13 6H17M13 8H17" stroke="var(--primary-500)" strokeWidth="1.5" strokeLinecap="round"/>
				<path d="M7 12H11M7 14H11" stroke="var(--primary-500)" strokeWidth="1.5" strokeLinecap="round"/>
				<path d="M14 12H18L14 16H18" stroke="var(--primary-500)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
			</svg>
		)
	},
	{ 
		key: "listening", 
		label: "Luyện Nghe", 
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
		label: "Luyện Đọc", 
		icon: (
			<svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path d="M14 3V7C14 7.55228 14.4477 8 15 8H19" stroke="var(--secondary-500)" strokeWidth="2" strokeLinecap="round"/>
				<path d="M14 3L19 8V19C19 20.1046 18.1046 21 17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H14Z" fill="var(--secondary-500)" fillOpacity="0.15" stroke="var(--secondary-500)" strokeWidth="2" strokeLinecap="round"/>
				<path d="M9 13H15M9 17H13" stroke="var(--secondary-500)" strokeWidth="2" strokeLinecap="round"/>
			</svg>
		)
	},
	{ 
		key: "actual-test", 
		label: "Luyện Đề", 
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

const translatePackage = (pkg?: string) => {
	if (!pkg || pkg.toUpperCase() === 'FREE' || pkg.toUpperCase() === 'BASIC') return 'Cơ bản';
	if (pkg.toUpperCase() === 'ADVANCED') return 'Nâng cao';
	if (pkg.toUpperCase() === 'MIXED') return 'Hỗn hợp';
	return pkg;
};

const translateDifficulty = (diff?: string) => {
	if (!diff) return '';
	if (diff.toUpperCase() === 'EXTREME') return 'Cực cao';
	if (diff.toUpperCase() === 'HIGH') return 'Cao';
	return diff;
};

const PackageBadge = ({ pkg, className = "" }: { pkg?: string, className?: string }) => {
	if (pkg === 'BASIC' || pkg === 'FREE') return (<span className={`inline-flex items-center px-2 py-[3px] bg-primary-50 text-primary-600 text-[10px] font-medium border border-primary-100 ${className}`}>Cơ bản</span>);
	if (pkg === 'ADVANCED') return (<span className={`inline-flex items-center px-2 py-[3px] bg-primary-50 text-primary-800 text-[10px] font-medium border border-primary-200 ${className}`}>Nâng cao</span>);
	if (pkg === 'MIXED') return (<span className={`inline-flex items-center px-2 py-[3px] bg-primary-50 text-primary-700 text-[10px] font-medium border border-primary-200 ${className}`}>Hỗn hợp</span>);
	return null;
}

export const getPartIcon = (partId: number) => {
    switch (partId) {
        case 1:
            return (
                <svg className="w-[16px] h-[16px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            );
        case 2:
            return (
                <svg className="w-[16px] h-[16px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
            );
        case 3:
            return (
                <svg className="w-[16px] h-[16px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
            );
        case 4:
            return (
                <svg className="w-[14px] h-[14px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
            );
        case 5:
            return (
                <svg className="w-[16px] h-[16px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
            );
        case 6:
            return (
                <svg className="w-[16px] h-[16px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            );
        case 7:
            return (
                <svg className="w-[16px] h-[16px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
            );
        default:
            return (
                <svg className="w-[16px] h-[16px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
            );
    }
}

const TopicCard = ({ title, subtitle, badgeText, onClick, onReset, type = 'grammar', progress, packageType, disableFlip, customIcon }: any) => {
	const isCompactType = ['vocabulary', 'grammar', 'reading', 'listening', 'test'].includes(type);
    const isTestTopic = type === 'test';
	const displaySubtitle = type === 'vocabulary' && !subtitle ? getTopicVietnamese(title) : subtitle;
	const displayTitle = type === 'vocabulary' && title.includes(' - ') ? title.split(' - ')[0].trim() : title;
	
	const minHeightClass = isCompactType ? 'min-h-[95px] sm:min-h-[105px]' : 'min-h-[220px]';
	const paddingClass = isCompactType ? 'p-4 sm:p-5' : 'p-8';

    const isBasic = packageType === 'BASIC' || packageType === 'FREE';
    const isAdvanced = packageType === 'ADVANCED';
    const isMixed = packageType === 'MIXED';
    const isTopicMastered = progress && progress.total > 0 && progress.learned >= progress.total;

    const theme = {
        iconBg: isBasic ? 'bg-primary-600' : isAdvanced ? 'bg-primary-800' : isMixed ? 'bg-primary-600' : 'bg-primary-700',
        titleHover: isBasic ? 'group-hover:text-primary-600' : isAdvanced ? 'group-hover:text-primary-900 dark:group-hover:text-white' : isMixed ? 'group-hover:text-primary-700' : 'group-hover:text-primary-700 dark:group-hover:text-white',
        title: isBasic ? 'text-primary-600 dark:text-primary-400' : isAdvanced ? 'text-primary-900 dark:text-white' : isMixed ? 'text-primary-700 dark:text-primary-300' : 'text-primary-900 dark:text-white',
        backIconBg: isBasic ? 'bg-primary-500' : isAdvanced ? 'bg-primary-700' : isMixed ? 'bg-primary-500' : 'bg-secondary-500',
        subtitle: isBasic ? 'text-primary-500 dark:text-primary-400' : isAdvanced ? 'text-primary-700 dark:text-primary-300' : isMixed ? 'text-primary-600 dark:text-primary-300' : 'text-primary-900/70 dark:text-slate-400',
        progressBg: isBasic ? 'bg-primary-100/60 dark:bg-primary-900/40' : isAdvanced ? 'bg-primary-100/60 dark:bg-primary-900/40' : isMixed ? 'bg-primary-100/60 dark:bg-primary-900/40' : 'bg-slate-100 dark:bg-slate-800',
        progressFill: isBasic ? 'bg-primary-500' : isAdvanced ? 'bg-primary-600' : isMixed ? 'bg-primary-500' : (progress?.learned >= progress?.total ? 'bg-primary-500' : 'bg-linear-to-r from-[#ea980c] to-secondary-500'),
        progressText: isBasic ? 'text-primary-600 dark:text-primary-400' : isAdvanced ? 'text-primary-700 dark:text-primary-300' : isMixed ? 'text-primary-600 dark:text-primary-400' : (progress?.learned >= progress?.total ? 'text-primary-600 dark:text-primary-400' : 'text-[#ea980c]'),
    };

	return (
		<div
			onClick={onClick}
			className={`relative w-full group bg-white dark:bg-slate-900 rounded-xl ${paddingClass} transition-transform duration-500 cursor-pointer overflow-hidden shadow-[10px_20px_60px_rgba(0,0,0,0.08)] sm:shadow-[10px_30px_70px_rgba(0,0,0,0.12)] dark:shadow-none flex flex-col justify-start ${minHeightClass} border border-slate-200 dark:border-slate-800 hover:-translate-y-2 hover:shadow-[10px_30px_80px_rgba(88,28,135,0.12)] dark:hover:border-slate-700`}
		>
            {isTestTopic && displaySubtitle && (
                <div className="absolute top-0 right-0 rounded-bl-[14px] px-3 py-1 bg-primary-900/5 text-primary-900 text-[10px] sm:text-[11px] font-bold border-b border-l border-primary-900/10 shadow-sm z-20 pointer-events-none uppercase tracking-wide">
                    {displaySubtitle.replace('Thuộc bộ đề: ', '')}
                </div>
            )}
			<div className="relative z-10 flex-1 mt-2 flex flex-col">
                {isCompactType ? (
					<div className={`perspective-[1000px] mb-2 w-full flex-1 flex flex-col justify-center ${isTestTopic ? 'mt-3 sm:mt-1' : ''}`}>
						<div className={`relative w-full transition-transform duration-700 [transform-style:preserve-3d] ${(displaySubtitle && !disableFlip) ? 'group-hover:[transform:rotateX(-180deg)]' : ''}`}>
                            {/* Front side (English/Main) */}
							<div className="flex flex-col gap-2 [backface-visibility:hidden]">
								<div className="flex items-center gap-2.5">
                                    {customIcon ? (
                                        <span className={`w-[28px] sm:w-[32px] shrink-0 h-[28px] sm:h-[32px] rounded-[6px] sm:rounded-[8px] text-white flex items-center justify-center text-[12px] shadow-sm transition-all duration-300 group-hover:rotate-0 leading-none ${theme.iconBg} ${title.charCodeAt(0) % 2 === 0 ? '-rotate-3' : 'rotate-3'}`}>
                                            {customIcon}
                                        </span>
                                    ) : (!isTestTopic && (
                                        <span className={`w-[24px] shrink-0 h-[24px] rounded-[6px] text-white flex items-center justify-center text-[12px] font-black shadow-sm transition-all duration-300 group-hover:rotate-0 leading-none pb-[1px] ${theme.iconBg} ${title.charCodeAt(0) % 2 === 0 ? '-rotate-6' : 'rotate-6'}`}>
                                            {(type === 'vocabulary' ? displayTitle : title).charAt(0).toLowerCase()}
                                        </span>
                                    ))}
                                    <h3 className={`font-bold ${isTestTopic ? 'text-[15px] sm:text-[16px] text-slate-800 dark:text-white' : 'text-[14px] sm:text-[15px]'} transition-colors duration-300 ${theme.titleHover} pr-1 leading-snug shrink ${theme.title}`}>
                                        {type === 'vocabulary' ? displayTitle : title}
                                    </h3>
                                </div>
                                {disableFlip && displaySubtitle && !isTestTopic && (
                                    <p className="text-[12px] text-slate-500 dark:text-slate-400 font-medium ml-[34px] line-clamp-1 group-hover:text-primary-900 dark:group-hover:text-primary-100 transition-colors">
                                        {displaySubtitle}
                                    </p>
                                )}
							</div>

                            {/* Back side (Vietnamese/Subtitle) */}
							{displaySubtitle && !disableFlip && (
								<div className="absolute inset-0 flex items-center gap-2.5 [backface-visibility:hidden] [transform:rotateX(180deg)] text-black dark:text-white">
									<span className={`w-[24px] shrink-0 h-[24px] rounded-[6px] ${theme.backIconBg} text-white flex items-center justify-center text-[12px] font-black shadow-sm transition-transform duration-300 group-hover:rotate-0 leading-none pb-[1px] ${title.charCodeAt(0) % 2 === 0 ? 'rotate-6' : '-rotate-6'}`}>
										{displaySubtitle.charAt(0).toLowerCase()}
									</span>
									<h3 className={`font-bold text-[13px] sm:text-[14px] ${theme.subtitle} pr-1 leading-snug shrink`}>
										{displaySubtitle}
									</h3>
								</div>
							)}
						</div>
					</div>
                ) : (
                    <>
                        <h3 className={`font-bold text-[22px] leading-snug mb-1 transition-colors duration-300 ${theme.titleHover} flex items-center gap-3 ${theme.title}`}>
                            <span className={`w-[30px] h-[30px] rounded-[8px] text-white flex items-center justify-center text-[15px] font-black shrink-0 shadow-md transition-all duration-300 group-hover:rotate-0 leading-none pb-[2px] ${theme.iconBg} ${title.charCodeAt(0) % 2 === 0 ? '-rotate-6' : 'rotate-6'}`}>
                                {title.charAt(0).toLowerCase()}
                            </span>
                            <span>{title}</span>
                        </h3>

                        {subtitle && (
                            <p className="text-[15px] text-slate-500 font-medium mb-4">
                                {subtitle}
                            </p>
                        )}
                    </>
                )}

				{badgeText && !progress && (
					<div className={`mt-auto w-full flex items-center justify-between gap-3 text-[12px] font-medium text-primary-900/80 dark:text-primary-100/80 ${isCompactType ? 'pt-3 md:pt-4 border-t border-slate-100/60 dark:border-slate-800' : 'mt-2 pt-3 border-t border-slate-100/60 dark:border-slate-800'}`}>
						<span className="flex items-center gap-1.5 font-bold text-slate-500 dark:text-slate-400">
                            {isTestTopic ? (
                                <svg className="w-3.5 h-3.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            ) : null}
                            {badgeText}
                        </span>
                        
                        {isTestTopic && (
                            <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider text-primary-600 bg-primary-50 px-2 py-0.5 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">Practice &rarr;</span>
                        )}
					</div>
				)}

				{progress && (
					<div className={`mt-auto w-full flex flex-col gap-1.5 ${isCompactType ? 'pt-4 border-t border-slate-100/50' : 'pt-3'}`}>
                        <div className="flex justify-between items-center text-[10px] sm:text-[11px] font-bold">
                            <div className="flex items-center gap-1.5 flex-wrap">
                                {packageType && !isTestTopic && (
                                    <PackageBadge pkg={packageType} className="rounded" />
                                )}
                                {isTopicMastered ? (
                                    <>
                                        <span className="inline-flex items-center px-2 py-[3px] bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-[10px] font-medium border border-primary-100 dark:border-primary-800 rounded">Đã hoàn thành</span>
                                        {onReset && (
                                            <button onClick={(e) => { e.stopPropagation(); onReset(); }} className="p-0.5 rounded-full hover:bg-primary-50 dark:hover:bg-slate-800 text-slate-400 hover:text-primary-600 transition-colors" title="Làm lại bộ từ vựng">
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                </svg>
                                            </button>
                                        )}
                                    </>
                                ) : (
                                    <span className="inline-flex items-center px-2 py-[3px] bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-medium border border-slate-200 dark:border-slate-700 rounded">{progress.learned > 0 ? 'Đang học' : 'Chưa học'}</span>
                                )}
                            </div>
                            <span className={`font-bold tabular-nums tracking-widest shrink-0 ${theme.progressText}`}>
                                {progress.learned} <span className="opacity-60 text-[10px]">/</span> {progress.total}
                            </span>
                        </div>
						<div className={`w-full h-1.5 ${theme.progressBg} rounded-full overflow-hidden shadow-inner`}>
							<div 
								className={`h-full transition-all duration-700 ${theme.progressFill} ${isTopicMastered ? 'animate-loading-bar' : ''}`}
								style={isTopicMastered ? undefined : { width: `${Math.max(2, Math.min(100, Math.round((progress.learned / progress.total) * 100)))}%` }} 
							/>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

function ToeicPracticeContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const pathname = usePathname();
	const { data: session, status } = useSession();

	const tabFromUrl = searchParams.get('tab') || 'home';
	const [tab, setTab] = useState(tabFromUrl);
	const [toeicLevel, setToeicLevel] = useState<string | null>(null);
	const [toeicScore, setToeicScore] = useState<string | null>(null);

	useEffect(() => {
		const level = localStorage.getItem('toeicLevel');
		if (level) setToeicLevel(level);
		const score = localStorage.getItem('toeicPlacementScore');
		if (score) setToeicScore(score);
	}, []);

	useEffect(() => {
		const t = searchParams.get('tab');
		if (t && TABS.some(item => item.key === t)) {
            if (tab !== t) {
                setTab(t);
                // Force scroll to top after render, essential for mobile flow
                setTimeout(() => window.scrollTo(0, 0), 10);
            }
        } else if (!t) {
            setTab('home');
        }
        
		const ref = searchParams.get('ref');
		if (ref && typeof document !== 'undefined') {
			// expires in 30 days
			document.cookie = `toeic_ref=${ref}; path=/; max-age=2592000`;
		}
	}, [searchParams]);

	useEffect(() => {
		if (status === 'authenticated') {
			// Sync guest level/score if needed
			const guestLevel = localStorage.getItem('toeicLevel');
			const guestScore = localStorage.getItem('toeicPlacementScore');
			
			// We can fire-and-forget sync to backend
			if (guestLevel || guestScore) {
				fetch('/api/user/toeic-onboarding', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ level: guestLevel, score: guestScore })
				}).catch(console.error);
			}

			fetch('/api/toeic/daily-login', { method: 'POST' })
				.then(res => res.json())
				.then(data => {
					if (data.success && data.awardedStars > 0) {
						setTimeout(() => {
							playSound('amazing-reward-sound.mp3');
							toast.success(data.awardReason || `Chúc mừng! Bạn nhận được ${data.awardedStars} ⭐.`, { 
								position: 'top-center', 
								duration: 7000, 
								style: { background: 'var(--secondary-100)', color: 'var(--secondary-800)', border: '1px solid var(--secondary-300)' } 
							});
						}, 1000);
					}
				})
				.catch(console.error);
		}
	}, [status]);

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
		const params = newSearchParams(searchParams);
		params.set('tab', newTab);
		params.delete('topic'); // clear topic when switching tabs
		router.push(`${pathname}?${params.toString()}`);
		window.scrollTo({ top: 0, behavior: 'instant' });
	};

	// Fallback helper for search params
	const newSearchParams = (sp: any) => new URLSearchParams(sp.toString());

	return (
		<div className="min-h-screen bg-background">
			<ToeicOnboardingModal onComplete={(level) => {
				setToeicLevel(level);
				if (level === 'MOCK_TEST_ONLY') {
					handleTabChange('actual-test');
				} else if (tab === 'home') {
					handleTabChange('roadmap');
				}
			}} />
			<div className="max-w-6xl mx-auto pt-4 pb-8 px-4 sm:px-6">
			<div className="mt-2 md:mt-4">
				 {tab === "home" && <ToeicHomeTab onTabClick={handleTabChange} />}
				 {tab === "roadmap" && <ToeicRoadmapTab level={toeicLevel} score={toeicScore} onPracticeClick={(path) => router.push(path)} onTabClick={handleTabChange} />}
				 {tab === "grammar" && <ToeicGrammarTab onPracticeClick={(slug) => {
					 if (!session) {
						 openLoginModal(slug ? `/toeic-practice/grammar/${slug}` : undefined);
					 } else if (slug) {
						 router.push(`/toeic-practice/grammar/${slug}`);
						 window.scrollTo({ top: 0, behavior: 'instant' });
					 }
				 }} />}
				{tab === "vocabulary" && <ToeicVocabularyTab 
					openLoginModal={openLoginModal}
					onPracticeClick={(topic, allowGuest = true) => {
					 if (!session) {
						const params = new URLSearchParams(searchParams.toString());
						params.set('tab', 'vocabulary');
						if (topic) params.set('topic', topic);
						openLoginModal(`${pathname}?${params.toString()}`, allowGuest);
					 }
				 }} />}
				{tab === "listening" && <ToeicListeningTab onPracticeClick={(slug) => {
					 if (!session) {
						 openLoginModal(slug ? `/toeic-practice/grammar/${slug}` : undefined);
					 } else if (slug) {
						 router.push(`/toeic-practice/grammar/${slug}`);
						 window.scrollTo({ top: 0, behavior: 'instant' });
					 }
				 }} />}
				{tab === "reading" && <ToeicReadingTab onPracticeClick={(slug) => {
					 if (!session) {
						 openLoginModal(slug ? `/toeic-practice/grammar/${slug}` : undefined);
					 } else if (slug) {
						 router.push(`/toeic-practice/grammar/${slug}`);
						 window.scrollTo({ top: 0, behavior: 'instant' });
					 }
				 }} />}
				{tab === "actual-test" && <ToeicActualTestTab onPracticeClick={() => {
					 if (!session) openLoginModal(`${pathname}?tab=actual-test`);
				 }} />}
			</div>

            {tab === "home" && <SpeedChallengeLeaderboard onPlayClick={() => handleTabChange('vocabulary')} />}

			<footer className="mt-20 pt-10 pb-6 border-t border-slate-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-8 mb-10 text-left">
                    {/* Brand Column */}
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-4">
							<div className="w-8 h-8 rounded shrink-0 bg-primary-900 flex items-center justify-center -rotate-6 shadow-sm">
								<span className="text-white font-black text-sm rotate-6">t</span>
							</div>
                            <span className="font-black text-xl text-primary-900">Toeic<span className="text-[#ea980c]">More</span></span>
                        </div>
                        <p className="text-[12px] text-slate-500 font-medium leading-relaxed max-w-[200px]">
                            Đồng hành cùng bạn chinh phục TOEIC nhanh và hiệu quả hơn.
                        </p>
                    </div>

                    {/* Column 1 for links */}
                    <div className="flex flex-col">
                        <h4 className="font-bold text-primary-900 mb-4 text-[14px]">Sản phẩm</h4>
                        <ul className="space-y-3 text-[13px] text-slate-500 font-medium whitespace-nowrap">
                            <li><button onClick={() => handleTabChange('vocabulary')} className="hover:text-primary-900 hover:translate-x-1 transition-all duration-200 block text-left">Học từ vựng</button></li>
                            <li><button onClick={() => handleTabChange('grammar')} className="hover:text-primary-900 hover:translate-x-1 transition-all duration-200 block text-left">Luyện ngữ pháp</button></li>
                            <li><button onClick={() => handleTabChange('listening')} className="hover:text-primary-900 hover:translate-x-1 transition-all duration-200 block text-left">Luyện Listening</button></li>
                            <li><button onClick={() => handleTabChange('reading')} className="hover:text-primary-900 hover:translate-x-1 transition-all duration-200 block text-left">Luyện Reading</button></li>
                        </ul>
                    </div>

                    {/* Column 2 for links */}
                    <div className="flex flex-col">
                        <h4 className="font-bold text-primary-900 mb-4 text-[14px]">Tài nguyên</h4>
                        <ul className="space-y-3 text-[13px] text-slate-500 font-medium whitespace-nowrap">
                            <li><a href="#" className="hover:text-primary-900 hover:translate-x-1 transition-all duration-200 block">Sổ tay học tập</a></li>
                            <li><Link href="/toeic-practice/documents" className="hover:text-primary-900 hover:translate-x-1 transition-all duration-200 block text-left">Kho tài liệu</Link></li>
                            <li><button onClick={() => handleTabChange('home')} className="hover:text-primary-900 hover:translate-x-1 transition-all duration-200 block text-left">Bảng xếp hạng</button></li>
                        </ul>
                    </div>

                    {/* Column Default - Học tập trọn đời */}
                    <div className="flex flex-col">
                        <h4 className="font-bold text-primary-900 mb-4 text-[14px]">Học tập trọn đời</h4>
                        <ul className="space-y-3 text-[13px] text-slate-500 font-medium whitespace-nowrap">
                            <li><button onClick={() => handleTabChange('roadmap')} className="hover:text-primary-900 hover:translate-x-1 transition-all duration-200 block text-left">Lộ trình học của tôi</button></li>
                            <li><Link href="/toeic-practice/upgrade" className="hover:text-primary-900 hover:translate-x-1 transition-all duration-200 block text-left">Nâng cấp tài khoản</Link></li>
                        </ul>
                    </div>

                    {/* Column 3 for links (Chia sẻ) */}
                    <div className="flex flex-col">
                        <h4 className="font-bold text-primary-900 mb-4 text-[14px]">Chia sẻ</h4>
                        <ul className="space-y-3 text-[13px] text-slate-500 font-medium whitespace-nowrap">
                            <li><a href="https://englishmore.bigbee.ltd" target="_blank" rel="noopener noreferrer" className="hover:text-primary-900 hover:translate-x-1 transition-all duration-200 block">Luyện Speaking</a></li>
                            <li><Link href="/toeic-practice/reviews" className="hover:text-primary-900 hover:translate-x-1 transition-all duration-200 block text-left">Review đề TOEIC</Link></li>
                            <li><Link href="/toeic-practice/experience" className="hover:text-primary-900 hover:translate-x-1 transition-all duration-200 block text-left">Kinh nghiệm Học & Thi</Link></li>
                        </ul>
                    </div>

                    {/* Column 4 for links */}
                    <div className="flex flex-col">
                        <h4 className="font-bold text-primary-900 mb-4 text-[14px]">Hỗ trợ</h4>
                        <ul className="space-y-3 text-[13px] text-slate-500 font-medium whitespace-nowrap">
                            <li><Link href="/about" className="hover:text-primary-900 hover:translate-x-1 transition-all duration-200 block text-left">About ToeicMore</Link></li>
                            <li><a href="#" className="hover:text-primary-900 hover:translate-x-1 transition-all duration-200 block">Liên hệ</a></li>
                            <li><a href="https://www.facebook.com/ninhdaik" target="_blank" rel="noopener noreferrer" className="hover:text-primary-900 hover:translate-x-1 transition-all duration-200 block">Cộng đồng</a></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-6 border-t border-slate-200/60 flex flex-col md:flex-row items-center justify-between gap-4 text-[12px] font-medium text-slate-500 opacity-80 mt-auto">
                    <p>&copy; {new Date().getFullYear()} ToeicMore. Bản quyền được bảo lưu.</p>
				    <p>Powered by <a href="https://englishmore.bigbee.ltd" target="_blank" rel="noopener noreferrer" className="font-bold hover:underline transition-colors text-primary-900">Tiếng Anh giao tiếp <span className="text-primary-900">English</span><span className="text-[#ea980c]">More</span></a></p>
                </div>
			</footer>
		</div>
	</div>
	);
}

function SpeedChallengeLeaderboard({ onPlayClick }: { onPlayClick?: () => void }) {
    const [leaders, setLeaders] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/toeic/speed-challenge').then(res => res.json()).then(data => {
            setLeaders(Array.isArray(data) ? data : []);
            setLoading(false);
        }).catch(err => setLoading(false));
    }, []);

    if (loading) return null;

    return (
        <div className="mt-16 mb-8 w-full animate-in fade-in duration-500">
            <div className="flex flex-col items-center justify-center text-center gap-1 mb-8">
                <h3 className="text-2xl font-black bg-gradient-to-r from-secondary-500 to-primary-600 bg-clip-text text-transparent flex items-center justify-center gap-3 mb-1.5">
                    Bảng xếp hạng Kiện Tướng Từ Vựng
                </h3>
                <button 
                    onClick={onPlayClick} 
                    className="text-[14px] font-bold cursor-pointer transition-colors active:scale-95 flex items-center justify-center gap-2 mt-2 group"
                >
                    <span className="bg-slate-100 text-primary-900 px-4 py-1.5 rounded-xl font-black text-[13px] md:text-[14px] inline-flex items-center gap-1.5 shadow-sm border border-slate-200 group-hover:bg-slate-200 transition-colors tracking-tight">
                        Speed Challenge <span className="drop-shadow-sm text-[16px] leading-none text-secondary-500">⚡</span>
                    </span>
                </button>
            </div>
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-secondary-200 overflow-hidden relative">
                {/* Decorative background elements matching the gold/green theme */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-secondary-100 rounded-bl-full opacity-50 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary-50 rounded-tr-full opacity-50 pointer-events-none"></div>
                
                {leaders.length === 0 ? (
                    <div className="relative z-10 flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-20 h-20 bg-secondary-50 rounded-full flex items-center justify-center mb-4 border-4 border-secondary-100/50">
                            <span className="text-4xl">🏆</span>
                        </div>
                        <h4 className="text-lg font-bold text-primary-900 mb-2">Chưa có kỷ lục nào được thiết lập</h4>
                        <p className="text-slate-500 font-medium text-sm max-w-sm mb-6">Hãy là người đầu tiên tham gia Speed Challenge và ghi tên mình lên Bảng Vàng danh giá này nhé!</p>
                        {onPlayClick && (
                            <button onClick={onPlayClick} className="bg-secondary-400 hover:bg-secondary-300 text-primary-900 px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer">
                                <span className="text-xl">🔥</span>
                                Chơi Ngay
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto relative z-10 hidden md:block">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b-2 border-slate-100 text-primary-900/70 font-semibold">
                                        <th className="pb-4 px-4 text-center w-16 uppercase tracking-wider text-[11px]">Hạng</th>
                                        <th className="pb-4 px-4 uppercase tracking-wider text-[11px]">Họ tên</th>
                                        <th className="pb-4 px-4 text-center uppercase tracking-wider text-[11px]">Điểm số</th>
                                        <th className="pb-4 px-4 text-right uppercase tracking-wider text-[11px]">Thời gian hoàn thành</th>
                                        <th className="pb-4 px-4 text-right uppercase tracking-wider text-[11px]" title="Trung bình giây / 1 từ">Tốc độ (s/từ)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leaders.map((leader, idx) => (
                                        <tr 
                                            key={leader.id || idx}
                                            className={`border-b border-slate-50 transition-colors group ${idx === 0 ? 'bg-secondary-50/30' : 'hover:bg-slate-50/50'}`}
                                        >
                                            <td className="py-4 px-4 text-center">
                                                {idx === 0 ? <span className="text-2xl drop-shadow-sm" title="Top 1">🥇</span> : 
                                                idx === 1 ? <span className="text-2xl drop-shadow-sm" title="Top 2">🥈</span> : 
                                                idx === 2 ? <span className="text-2xl drop-shadow-sm" title="Top 3">🥉</span> : 
                                                <span className="font-semibold text-primary-900/60">#{idx + 1}</span>}
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className={`text-primary-900 ${idx < 3 ? 'font-bold text-[15px]' : 'font-medium'}`}>{leader.user?.name || leader.guestName || "Ẩn danh"}</div>
                                            </td>
                                            <td className="py-4 px-4 text-center text-primary-900">
                                                <span className="font-semibold">{leader.score}</span>
                                                <span className="text-primary-900/40 text-xs mx-1">/</span>
                                                <span className="font-medium text-primary-900/70 text-sm">{leader.total}</span>
                                            </td>
                                            <td className="py-4 px-4 text-right">
                                                <div className={`text-primary-900 ${idx < 3 ? 'font-bold' : 'font-medium'}`}>{(leader.timeMs / 1000).toFixed(2)}s</div>
                                            </td>
                                            <td className="py-4 px-4 text-right">
                                                <div className={`text-primary-900 font-mono tracking-tighter ${idx < 3 ? 'font-bold text-[15px]' : 'font-semibold'}`}>{(leader.total > 0 ? (leader.timeMs / 1000) / leader.total : 0).toFixed(2)}s</div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile View */}
                        <div className="md:hidden space-y-3 relative z-10 mt-2">
                            {leaders.map((leader, idx) => (
                                <div 
                                    key={leader.id || idx}
                                    className={`flex items-center gap-3 border p-3 rounded-2xl ${idx === 0 ? 'bg-secondary-50/50 border-secondary-200 shadow-sm relative' : 'bg-slate-50 border-slate-100'}`}
                                >
                                    <div className="w-10 h-10 shrink-0 flex items-center justify-center bg-white rounded-full shadow-sm font-black text-slate-400">
                                        {idx === 0 ? <span className="text-2xl">🥇</span> : 
                                        idx === 1 ? <span className="text-2xl">🥈</span> : 
                                        idx === 2 ? <span className="text-2xl">🥉</span> : 
                                        `#${idx + 1}`}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className={`truncate text-[15px] mb-0.5 text-primary-900 ${idx < 3 ? 'font-bold' : 'font-medium'}`}>
                                            {leader.user?.name || leader.guestName || "Ẩn danh"}
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <div className="text-[13px] font-semibold text-primary-900">{leader.score}<span className="text-[10px] text-primary-900/60 font-medium ml-0.5">/{leader.total}</span></div>
                                        <div className="text-[12px] text-primary-900 mt-0.5">{(leader.timeMs / 1000).toFixed(2)}s ({((leader.timeMs / 1000) / Math.max(1, leader.total)).toFixed(2)}s/từ)</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

function GrammarFeatureCard({ onClick, onMouseEnter, onMouseLeave, icon, isActive }: any) {
	return (
		<div className={`w-[260px] sm:w-[280px] lg:w-full lg:flex-1 shrink-0 lg:shrink h-[160px] cursor-pointer border border-slate-200 dark:border-slate-700/50 rounded-[20px] transition-all relative overflow-hidden bg-white dark:bg-slate-900 ${isActive ? 'shadow-xl dark:shadow-primary-900/10' : 'shadow-sm hover:shadow-md dark:shadow-none'}`} onClick={onClick} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
			<div className="p-6 h-full flex flex-col relative z-10 w-full transition-opacity duration-300">
				<div className="w-full flex items-center gap-4 z-20 bg-white dark:bg-slate-900 relative pb-1">
					<div className={`w-12 h-12 shrink-0 bg-slate-50 dark:bg-slate-800 text-primary-900 dark:text-primary-100 rounded-xl flex items-center justify-center transition-transform ${isActive ? 'scale-110' : ''}`}>
						{icon}
					</div>
					<h3 className="text-xl font-bold text-primary-900 dark:text-white">Ngữ pháp</h3>
				</div>
				<div className="relative flex-1 mt-2">
					<p className={`text-slate-500 dark:text-slate-400 font-medium text-sm text-left w-full absolute inset-0 transition-opacity duration-300 ${isActive ? 'opacity-0' : 'opacity-100'}`}>
						Hệ thống bài học và luyện tập toàn diện.
					</p>
					<div className={`absolute inset-0 transition-opacity duration-300 pointer-events-none mt-7 ml-[2px] ${isActive ? 'opacity-100' : 'opacity-0'}`}>
						<div className="h-[2px] bg-secondary-400 rounded-full animate-[drawLine_2.5s_infinite_ease-out]" style={{ width: '100%' }} />
						
						{/* Typed text above the line */}
						<div className="absolute -top-[20px] left-0 text-primary-900 dark:text-primary-100 font-semibold text-[11.5px] tracking-wide leading-none animate-[fadeInText_2.5s_infinite_ease-out] whitespace-nowrap">
							Lưu lại câu hay xem sau
						</div>

						{/* Cây viết */}
						<svg className="w-5 h-5 text-primary-900 dark:text-primary-100 absolute -top-4 -ml-1 animate-[moveWritingPen_2.5s_infinite_ease-out] origin-bottom-left" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
						</svg>
					</div>
				</div>
			</div>

			{/* Overlay Button on Hover */}
			<div className={`absolute top-4 right-4 transition-opacity z-30 ${isActive ? 'opacity-100' : 'opacity-0'}`}>
				<div className="bg-primary-900 text-secondary-400 p-2 rounded-full shadow-md pointer-events-auto hover:scale-105 transition-transform">
					<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
				</div>
			</div>
		</div>
	);
}

function ReadingFeatureCard({ onClick, onMouseEnter, onMouseLeave, icon, isActive }: any) {
	const [activePage, setActivePage] = useState(0);
	const pages = ["Part 5", "Part 6", "Part 7", "Giải thích chi tiết"];

	useEffect(() => {
		let int: NodeJS.Timeout;
		if (isActive) {
			int = setInterval(() => {
				setActivePage((p) => (p + 1) % 4);
			}, 1250);
		} else {
			setActivePage(0);
		}
		return () => clearInterval(int);
	}, [isActive]);

	return (
		<div className={`w-[260px] sm:w-[280px] lg:w-full lg:flex-1 shrink-0 lg:shrink h-[160px] cursor-pointer border border-primary-900/10 dark:border-slate-700/50 rounded-[20px] transition-all relative overflow-hidden bg-white dark:bg-slate-900 ${isActive ? 'shadow-xl dark:shadow-primary-900/10' : 'shadow-sm hover:shadow-md dark:shadow-none'}`} onClick={onClick} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
			{/* Front/Default view */}
			<div className={`p-6 h-full flex flex-col relative z-10 w-full transition-opacity duration-300 ${isActive ? 'opacity-0' : 'opacity-100'}`}>
				<div className="w-full flex items-center gap-4 z-20 bg-white dark:bg-slate-900 relative pb-1">
					<div className="w-12 h-12 shrink-0 bg-slate-50 dark:bg-slate-800 text-primary-900 dark:text-primary-100 rounded-xl flex items-center justify-center">
						{icon}
					</div>
					<h3 className="text-xl font-bold text-primary-900 dark:text-white">Reading</h3>
				</div>
				<div className="relative flex-1 mt-2">
					<p className="text-slate-500 dark:text-slate-400 font-medium text-sm text-left w-full absolute inset-0">
						Luyện Part 5, 6, 7 giải thích cặn kẽ chi tiết.
					</p>
				</div>
			</div>

			{/* Full Card Book Flip View */}
			<div className={`absolute inset-0 z-20 pointer-events-none perspective-[1200px] flex ${isActive ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300 bg-[#f8fafc] dark:bg-slate-900`}>
				{/* Book Spine Center line */}
				<div className="absolute left-1/2 top-0 bottom-0 w-[2px] -ml-[1px] bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 z-30 shadow-[0_0_5px_rgba(0,0,0,0.1)] border-x border-primary-900/10 dark:border-slate-800" />

				{/* Left half (static background under flipped page) */}
				<div className="w-1/2 h-full bg-white dark:bg-slate-800/80 flex flex-col items-center justify-center border-r-[1px] border-slate-100 dark:border-slate-700 shadow-[inset_-8px_0_15px_rgba(0,0,0,0.03)] pr-4 pl-2" />

				{/* Right half (background of upcoming page side) */}
				<div className="w-1/2 h-full bg-slate-50 dark:bg-slate-800 shadow-[inset_8px_0_15px_rgba(0,0,0,0.03)] flex flex-col items-center justify-center pl-4 pr-2">
					<div className="w-10 h-10 text-primary-900/30 dark:text-primary-100/30 mb-1">
						{icon}
					</div>
					<span className="font-bold text-primary-900/40 dark:text-primary-100/40 text-[9px] uppercase tracking-wider text-center mt-1">Giải thích<br/>chi tiết</span>
				</div>

				{/* Animated Pages Flipping */}
				<div className="absolute inset-0 z-40 flex">
                    <div className="w-1/2 h-full" /> 
                    <div className="w-1/2 h-full relative">
                        <AnimatePresence>
                            <motion.div 
                                key={activePage}
                                initial={{ rotateY: 0, zIndex: 10 }}
                                animate={{ rotateY: -180, zIndex: 20 }}
                                exit={{ opacity: 0, transition: {duration: 0} }}
                                transition={{ duration: 0.8, ease: "easeInOut" }}
                                style={{ transformOrigin: 'left center' }}
                                className="absolute inset-0 bg-white dark:bg-slate-800 border-l border-slate-100 dark:border-slate-700 shadow-[2px_0_10px_rgba(0,0,0,0.05)] dark:shadow-[2px_0_10px_rgba(0,0,0,0.3)] [transform-style:preserve-3d]"
                            >
                                {/* Front face (starts on the right edge) */}
                                <div className="absolute inset-0 flex items-center justify-center p-3 [backface-visibility:hidden] bg-slate-50 dark:bg-slate-800 border-r border-primary-900/10 dark:border-slate-700 rounded-r-[20px]">
                                </div>
                                {/* Back face (when flipped to the left) */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 [backface-visibility:hidden] [transform:rotateY(180deg)] bg-white dark:bg-slate-800/90 shadow-[inset_-8px_0_20px_rgba(88, 28, 135,0.03)] rounded-l-[10px]">
                                    <span className="font-bold text-primary-900 dark:text-white text-sm uppercase tracking-wider text-center drop-shadow-sm leading-tight">
                                        {pages[activePage]}
                                    </span>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
				</div>
			</div>

			<div className={`absolute top-4 right-4 transition-opacity z-50 ${isActive ? 'opacity-100' : 'opacity-0'}`}>
				<div className="bg-primary-900 text-secondary-400 p-2 rounded-full shadow-md pointer-events-auto hover:scale-105 transition-transform">
					<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
				</div>
			</div>
		</div>
	);
}

function ActualTestFeatureCard({ onClick, onMouseEnter, onMouseLeave, icon, isActive }: any) {
	const [timeLeft, setTimeLeft] = useState(720000);

	useEffect(() => {
		let int: NodeJS.Timeout;
		if (isActive) {
			int = setInterval(() => {
				setTimeLeft((prev) => (prev > 0 ? prev - 17 : 0));
			}, 20);
		} else {
			setTimeLeft(720000);
		}
		return () => clearInterval(int);
	}, [isActive]);

	const formatTime = (time: number) => {
		const m = Math.floor(time / 6000).toString().padStart(2, '0');
		const s = Math.floor((time % 6000) / 100).toString().padStart(2, '0');
		const ms = (time % 100).toString().padStart(2, '0');
		return `${m}:${s}:${ms}`;
	};

	return (
		<div className={`w-[260px] sm:w-[280px] lg:w-full lg:flex-1 shrink-0 lg:shrink h-[160px] cursor-pointer border border-slate-200 dark:border-slate-700/50 rounded-[20px] transition-all relative overflow-hidden bg-white dark:bg-slate-900 ${isActive ? 'shadow-xl dark:shadow-primary-900/10' : 'shadow-sm hover:shadow-md dark:shadow-none'}`} onClick={onClick} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
			<div className="p-6 h-full flex flex-col relative z-10 w-full">
				<div className="w-full flex items-center gap-4 z-20 bg-white dark:bg-slate-900 relative pb-1">
					<div className={`w-12 h-12 shrink-0 bg-slate-50 dark:bg-slate-800 text-primary-900 dark:text-primary-100 rounded-xl flex items-center justify-center transition-transform ${isActive ? 'scale-110' : ''}`}>
						{icon}
					</div>
					<h3 className="text-xl font-bold text-primary-900 dark:text-white">Luyện đề</h3>
				</div>
				<div className="relative flex-1 mt-2">
					<p className={`text-slate-500 dark:text-slate-400 font-medium text-sm text-left w-full transition-opacity duration-300 absolute inset-0 ${isActive ? 'opacity-0' : 'opacity-100'}`}>
						Luyện đề thi thử bám sát cấu trúc đề thi thực.
					</p>
					<div className={`absolute inset-0 transition-opacity duration-300 flex items-center delay-100 ${isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
						<div className="flex items-center space-x-0 text-secondary-500 font-mono font-bold text-sm bg-red-50/50 dark:bg-red-500/10 px-2 py-1.5 rounded-lg border border-red-100/50 dark:border-red-500/20 shadow-inner dark:shadow-none">
                            <svg className="w-4 h-4 text-secondary-500 dark:text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10V9a9 9 0 0118 0v1m-18 0v5a2 2 0 002 2h2V10H3zm18 0v5a2 2 0 01-2 2h-2V10h4z" /></svg>
							<div className="flex items-center space-x-1.5 mx-1.5 px-1.5 border-x border-red-200/50 dark:border-red-500/20">
                                <svg className="w-3.5 h-3.5 animate-pulse text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <span className="text-red-500 tracking-wider text-left min-w-[72px] sm:min-w-[76px] lg:min-w-[80px]">{formatTime(timeLeft)}</span>
                            </div>
                            <svg className="w-4 h-4 text-primary-900 dark:text-primary-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
						</div>
					</div>
				</div>
			</div>
			<div className={`absolute top-4 right-4 transition-opacity z-30 ${isActive ? 'opacity-100' : 'opacity-0'}`}>
				<div className="bg-primary-900 text-secondary-400 p-2 rounded-full shadow-md">
					<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
				</div>
			</div>
		</div>
	);
}

function VocabFeatureCard({ onClick }: any) {
    return (
		<div className="relative w-full max-w-[260px] sm:max-w-[280px] h-[90px] cursor-pointer shrink-0 rounded-[20px] shadow-sm hover:shadow-md transition-shadow group overflow-hidden bg-white border border-primary-900/20 flex items-center justify-between px-4 sm:px-5 focus:outline-none" onClick={onClick}>
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[#f8fafc]/50 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />
            
            <div className="relative z-10 flex flex-col text-left">
                <div className="text-primary-900 font-bold text-[15px] sm:text-[17px] leading-none tracking-tight">vocabulary</div>
                <div className="opacity-80 text-[11px] sm:text-xs text-slate-500 font-medium mt-1">/vəˈkæbjələri/</div>
            </div>
            
            <button className="bg-secondary-500 text-primary-900 px-3.5 sm:px-4 py-2 flex items-center gap-1 shrink-0 rounded-full text-[13px] font-black shadow-md hover:scale-105 transition-transform focus:outline-none relative z-10 overflow-hidden whitespace-nowrap">
                <span className="relative z-10">Học từ vựng</span>
                <svg className="w-3.5 h-3.5 ml-0.5 relative z-10 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                {/* Button Shimmer */}
                <div className="absolute top-0 -inset-full h-full w-[150%] block bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none animate-shimmer-sweep" />
            </button>
        </div>
    )
}

function ListeningFeatureCard({ onClick, onMouseEnter, onMouseLeave, icon, isActive }: any) {
    const [selectedLetter, setSelectedLetter] = useState<string | null>(null);

    useEffect(() => {
        let int: NodeJS.Timeout;
        if (isActive) {
            const letters = ['A', 'B', 'C', 'D'];
            int = setInterval(() => {
                const random = letters[Math.floor(Math.random() * letters.length)];
                setSelectedLetter(random);
            }, 750);
        } else {
            setSelectedLetter(null);
        }
        return () => clearInterval(int);
    }, [isActive]);

    return (
		<div className="perspective-[1000px] w-[260px] sm:w-[280px] lg:w-full lg:flex-1 shrink-0 lg:shrink h-[160px] cursor-pointer" onClick={onClick} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
            <div className={`relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] rounded-[20px] ${isActive ? '[transform:rotateY(180deg)] shadow-xl dark:shadow-primary-900/10' : 'shadow-sm hover:shadow-md dark:shadow-none'}`}>
                {/* Front side */}
                <div className="absolute inset-0 w-full h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/50 rounded-[20px] p-6 flex flex-col [backface-visibility:hidden]">
                    <div className="w-full flex items-center gap-4 pb-1">
                        <div className="w-12 h-12 shrink-0 bg-slate-50 dark:bg-slate-800 text-primary-900 dark:text-primary-100 rounded-xl flex items-center justify-center">
                            {icon}
                        </div>
                        <h3 className="text-xl font-bold text-primary-900 dark:text-white">Listening</h3>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-sm text-left w-full mt-2">
                        Luyện nghe với audio sắc nét và transcript chi tiết.
                    </p>
                </div>
                {/* Back side */}
                <div className="absolute inset-0 w-full h-full bg-white dark:bg-slate-900 border-2 border-primary-900/20 dark:border-slate-700 rounded-[20px] flex items-center justify-center [backface-visibility:hidden] [transform:rotateY(180deg)] overflow-hidden">
                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50/80 dark:bg-slate-800 p-6 relative">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="text-primary-900 dark:text-primary-100 bg-white dark:bg-slate-700 p-2.5 rounded-full shadow-sm border border-slate-100 dark:border-slate-600 flex-shrink-0">
                                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"></path><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path></svg>
                            </div>
                            <div className="flex gap-2 z-10 w-full justify-center">
                                {['A', 'B', 'C', 'D'].map((letter) => (
                                    <span 
                                        key={letter} 
                                        className={`flex items-center justify-center w-7 h-7 rounded-full text-[11px] font-black shadow-sm transition-all duration-300 ${
                                            selectedLetter === letter 
                                            ? 'bg-primary-900 text-white border-transparent scale-110 ring-2 ring-primary-900/30 ring-offset-1' 
                                            : 'bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-primary-900 dark:text-white'
                                        }`}
                                    >
                                        {letter}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <button className="bg-primary-900 text-white px-6 py-2 rounded-full text-sm font-black shadow-md hover:scale-105 transition-transform flex items-center gap-2 z-10 mt-1">
                            Luyện nghe <svg className="w-4 h-4 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

function ToeicHomeTab({ onTabClick }: { onTabClick: (tab: string) => void }) {
	const [stats, setStats] = useState({ users: 24, grammarTopics: 30, vocabularies: 1540, readingTopics: 10, vocabTopics: 50, detailedQuestions: 1200 });
	const [activeCardIndex, setActiveCardIndex] = useState(0);
	const [hoveredCardIndex, setHoveredCardIndex] = useState<number | null>(null);

	useEffect(() => {
		fetch('/api/toeic/stats').then(res => res.json()).then(data => setStats(data)).catch(console.error);
		
		const int = setInterval(() => {
			setActiveCardIndex((prev) => (prev + 1) % 5);
		}, 5000);
		return () => clearInterval(int);
	}, []);

	return (
		<div className="py-8 pb-20">
			{/* Hero Section */}
			<section className="flex flex-col items-center text-center mt-8 mb-24 max-w-5xl mx-auto px-4 sm:px-6">
				<h1 className="font-extrabold leading-[1.1] tracking-tight mb-4" style={{fontFamily: 'var(--font-inter, sans-serif)'}}>
					<span className="text-[2.5rem] sm:text-[3.5rem] md:text-6xl lg:text-[68px] text-primary-900 block break-words">
					Chinh phục <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-900 to-secondary-500">TOEIC</span>
				</span>
					<span className="text-[1.75rem] sm:text-[2.25rem] md:text-4xl lg:text-[48px] block break-words mt-1 lg:mt-2">
						<span className="text-secondary-500">dễ dàng</span> <span className="text-primary-900">và hiệu quả hơn</span>
					</span>
				</h1>
				<p className="mt-3 max-w-2xl text-base sm:text-lg font-medium text-primary-900 leading-relaxed mx-auto opacity-90">
					Học từ vựng siêu hiệu quả và nhớ lâu. Giải thích ngữ pháp và mẹo làm bài chi tiết. Giúp bạn nâng cao điểm số TOEIC và hơn thế nữa
				</p>

				<div className="mt-8 flex justify-center w-full px-4 relative z-20">
					<VocabFeatureCard onClick={() => onTabClick('vocabulary')} />
				</div>

				<div 
					className="w-full max-w-4xl mx-auto mt-7 overflow-hidden relative"
					style={{
						WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
						maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)'
					}}
				>
					<style dangerouslySetInnerHTML={{
						__html: `
						@keyframes marquee {
							0% { transform: translateX(0); }
							100% { transform: translateX(calc(-50% - 1rem)); } 
						}
						@keyframes shimmerSweep {
							0% { transform: translateX(-150%) skewX(-15deg); }
							100% { transform: translateX(300%) skewX(-15deg); }
						}
						.animate-shimmer-sweep {
							animation: shimmerSweep 3s infinite;
						}
						.hide-scrollbar::-webkit-scrollbar { display: none; }
						.hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
						@keyframes marquee-features {
							0% { transform: translateX(-50%); }
							100% { transform: translateX(0); } 
						}
						@keyframes drawLine {
							0% { width: 0%; opacity: 0; }
							1% { opacity: 1; }
							100% { width: 100%; opacity: 1; }
						}
						@keyframes fadeInText {
							0% { opacity: 0; clip-path: inset(0 100% 0 0); }
							20% { opacity: 1; clip-path: inset(0 100% 0 0); }
							80% { opacity: 1; clip-path: inset(0 0 0 0); }
							100% { opacity: 1; clip-path: inset(0 0 0 0); }
						}
						@keyframes moveWritingPen {
							0% { left: 0%; transform: rotate(0deg); opacity:0; }
							1% { opacity: 1; }
							25% { transform: rotate(10deg); }
							50% { transform: rotate(-5deg); }
							75% { transform: rotate(10deg); }
							99% { opacity: 1; }
							100% { left: calc(100% - 20px); transform: rotate(0deg); opacity: 0; }
						}
						.animate-marquee {
							animation: marquee 25s linear infinite;
						}
						`
					}} />
					<div className="flex animate-marquee items-center gap-x-8 text-[13px] font-medium text-slate-500 w-max hover:[animation-play-state:paused]">
						{[
							{ label: 'Chủ đề Ngữ pháp', value: stats.grammarTopics },
							{ label: 'Bộ đề Reading', value: stats.readingTopics },
							{ label: 'Chủ đề từ vựng', value: stats.vocabTopics },
							{ label: 'Từ vựng TOEIC', value: stats.vocabularies },
							{ label: 'Giải thích chi tiết', value: stats.detailedQuestions },
							{ label: 'học viên đang học', value: stats.users },
							{ label: 'Chủ đề Ngữ pháp', value: stats.grammarTopics },
							{ label: 'Bộ đề Reading', value: stats.readingTopics },
							{ label: 'Chủ đề từ vựng', value: stats.vocabTopics },
							{ label: 'Từ vựng TOEIC', value: stats.vocabularies },
							{ label: 'Giải thích chi tiết', value: stats.detailedQuestions },
							{ label: 'học viên đang học', value: stats.users },
						].map((stat, idx) => (
							<div key={idx} className="flex items-center shrink-0">
								<span><strong className="text-primary-900 text-[15px]">{stat.value.toLocaleString()}+</strong> <span className="ml-[2px]">{stat.label}</span></span>
							</div>
						))}
					</div>
				</div>
			</section>

			<div className="w-full max-w-6xl mx-auto mb-4 px-4 mt-3 pb-2">
				<div className="flex flex-col lg:flex-row lg:flex-nowrap justify-center items-center lg:items-stretch gap-4 lg:gap-6 py-2 px-2 hide-scrollbar overflow-hidden lg:overflow-x-auto">
					<GrammarFeatureCard onMouseEnter={() => setHoveredCardIndex(1)} onMouseLeave={() => setHoveredCardIndex(null)} isActive={hoveredCardIndex === 1 || (hoveredCardIndex === null && activeCardIndex === 1)} onClick={() => onTabClick('grammar')} icon={<svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>} />
					<ListeningFeatureCard onMouseEnter={() => setHoveredCardIndex(2)} onMouseLeave={() => setHoveredCardIndex(null)} isActive={hoveredCardIndex === 2 || (hoveredCardIndex === null && activeCardIndex === 2)} onClick={() => onTabClick('listening')} icon={<svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"></path><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path></svg>} />
					<ReadingFeatureCard onMouseEnter={() => setHoveredCardIndex(3)} onMouseLeave={() => setHoveredCardIndex(null)} isActive={hoveredCardIndex === 3 || (hoveredCardIndex === null && activeCardIndex === 3)} onClick={() => onTabClick('reading')} icon={<svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>} />
					<ActualTestFeatureCard onMouseEnter={() => setHoveredCardIndex(4)} onMouseLeave={() => setHoveredCardIndex(null)} isActive={hoveredCardIndex === 4 || (hoveredCardIndex === null && activeCardIndex === 4)} onClick={() => onTabClick('actual-test')} icon={<svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>} />
				</div>
			</div>

            {/* Quick Links Section */}
            <div className="w-full max-w-6xl mx-auto mt-8 mb-4 px-4">
                <div className="flex flex-wrap justify-center items-center gap-4 py-3">
                    {[
                        { title: 'Review Đề TOEIC', href: '/toeic-practice/reviews', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg> },
                        { title: 'Kinh nghiệm Học & Thi', href: '/toeic-practice/experience', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg> },
                        { title: 'Lộ Trình Học Của Tôi', href: '/toeic-practice?tab=roadmap', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path></svg> },
                        { title: 'Nâng Cấp Học Trọn Đời', href: '/toeic-practice/upgrade', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path></svg> },
                        { title: 'Kho Tài Liệu', href: '/toeic-practice/documents', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg> },
                        { title: 'Về ToeicMore', href: '/about', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg> },
                    ].map((item, idx) => (
                        <Link 
                            key={idx} 
                            href={item.href}
                            className="bg-white/90 dark:bg-slate-900 backdrop-blur-sm border border-primary-900/10 dark:border-slate-700/80 px-6 py-3.5 rounded-[16px] shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-primary-900/20 dark:hover:border-slate-600 transition-all duration-300 flex items-center gap-3 group shrink-0 min-w-[200px]"
                        >
                            <span className="text-[#ea980c] dark:text-secondary-500 group-hover:scale-110 transition-transform">{item.icon}</span>
                            <span className="text-[13px] font-bold text-slate-700 dark:text-white group-hover:text-primary-900 dark:group-hover:text-primary-100 transition-colors">{item.title}</span>
                        </Link>
                    ))}
                </div>
            </div>

			<ToeicWarriorLeaderboard />
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

	const levels = [
		{ id: 'Cơ Bản', title: 'Level 1: Ngữ Pháp Cơ Bản', color: 'bg-green-500' },
		{ id: 'Trung Cấp', title: 'Level 2: Ngữ Pháp Trung Cấp', color: 'bg-blue-500' },
		{ id: 'Nâng Cao', title: 'Level 3: Ngữ Pháp Nâng Cao', color: 'bg-purple-500' }
	];

	return (
		<div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-12">
			{topics.length === 0 ? (
				<div className="py-16 text-center text-slate-400 border-2 border-dashed border-slate-100 rounded-3xl">
					Chưa có chủ đề nào được cập nhật.
				</div>
			) : (
				levels.map(level => {
					const levelTopics = topics.filter(t => (t.level || 'Cơ Bản') === level.id);
					if (levelTopics.length === 0) return null;
					return (
						<div key={level.id} className="relative">
							<h2 className="text-xl sm:text-[22px] font-black text-primary-900 mb-6 flex items-center gap-2.5 tracking-tight px-1">
								<span className={`w-1.5 h-6 rounded-full ${level.id === 'Cơ Bản' ? 'bg-[#ea980c]' : level.id === 'Trung Cấp' ? 'bg-primary-500' : 'bg-secondary-500'} block shadow-sm`}></span>
								{level.title}
							</h2>
							<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
								{levelTopics.map((topic) => (
									<TopicCard
										key={topic.id}
										type="grammar"
										title={topic.title}
										subtitle={topic.subtitle || 'Ngữ pháp TOEIC'}
										badgeText={`${topic._count?.lessons || 0} Bài tập`}
										onClick={() => onPracticeClick(topic.slug)}
									/>
								))}
							</div>
						</div>
					);
				})
			)}
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
	<span className="inline-flex items-center gap-0.5 px-1.5 py-[2px] rounded border border-primary-600/50 bg-linear-to-r from-primary-900 via-primary-800 to-primary-900 text-[8px] font-black text-primary-100 shadow-[0_0_8px_rgba(88,28,135,0.5)]">
		<svg className="w-2.5 h-2.5 fill-secondary-400" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
		ULTRA
	</span>
);

const ProTag = () => (
	<span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-linear-to-r from-secondary-500 via-secondary-400 to-orange-500 text-[9px] font-black text-white shadow-[0_0_8px_rgba(245,158,11,0.3)] border border-secondary-300/50">
		<svg className="w-2.5 h-2.5 fill-white" viewBox="0 0 24 24"><path d="M12 17.27l4.15 2.51c.76.46 1.69-.22 1.49-1.08l-1.1-4.72 3.67-3.18c.67-.58.31-1.68-.57-1.75l-4.83-.41-1.89-4.46c-.34-.81-1.5-.81-1.84 0L9.19 8.6l-4.83.41c-.88.07-1.24 1.17-.57 1.75l3.67 3.18-1.1 4.72c-.2.86.73 1.54 1.49 1.08l4.15-2.5z"/></svg>
		PRO
	</span>
);

function ToeicVocabularyTab({ onPracticeClick, openLoginModal }: { onPracticeClick: (topic?: string, allowGuest?: boolean) => void, openLoginModal?: (destination?: string, allowGuest?: boolean) => void }) {
	const { data: session, update } = useSession();
	const searchParams = useSearchParams();
	const pathname = usePathname();
	const router = useRouter();

	const [topics, setTopics] = useState<{ topic: string; wordCount: number, learnedCount?: number, packageType?: string }[]>([]);
	const [loading, setLoading] = useState(true);
	const [subTab, setSubTab] = useState<'practice' | 'progress'>('practice');
	const [activePackage, setActivePackage] = useState<string>('ALL');

	const initialTopic = searchParams.get('topic');
	const [selectedTopic, setSelectedTopic] = useState<string | null>(initialTopic);
	const loadedTopicRef = useRef<string | null>(null);
	const [vocabItems, setVocabItems] = useState<any[]>([]);
	const [isUltra, setIsUltra] = useState(false);
	const [isPro, setIsPro] = useState(false);
	const [topicProFields, setTopicProFields] = useState<string[]>([]);
	const [topicUltraFields, setTopicUltraFields] = useState<string[]>([]);
	const [totalWords, setTotalWords] = useState(0);
	const [vocabLoading, setVocabLoading] = useState(!!initialTopic);
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
	const [challengeTimeLeft, setChallengeTimeLeft] = useState(4);
	const [challengeResult, setChallengeResult] = useState<{show: boolean, score: number, total: number, timeMs?: number}>({show: false, score: 0, total: 0, timeMs: 0});
	const [challengeDifficulty, setChallengeDifficulty] = useState<'high' | 'extreme'>('extreme');
	const [copySuccess, setCopySuccess] = useState(false);
    const [challengeStartTime, setChallengeStartTime] = useState(0);
    const [guestName, setGuestName] = useState("");

	const [isPronunciationListening, setIsPronunciationListening] = useState(false);
	const [pronunciationStatus, setPronunciationStatus] = useState('');
	const [pronunciationFeedback, setPronunciationFeedback] = useState('');
	const [pronunciationTranscript, setPronunciationTranscript] = useState('');
	const [pronunciationScore, setPronunciationScore] = useState<number | null>(null);
	const [pronunciationStreak, setPronunciationStreak] = useState(0);
	const [correctlyPronouncedIds, setCorrectlyPronouncedIds] = useState<string[]>([]);
	const pronunciationScoringTimeoutRef = useRef<number | null>(null);
	const pronunciationListeningTimeoutRef = useRef<number | null>(null);
	const pronunciationFinalizeTimeoutRef = useRef<number | null>(null);
	const pronunciationRecognitionRef = useRef<any>(null);
	const pronunciationDoneAudioRef = useRef<HTMLAudioElement | null>(null);
	const pronunciationRewardAudioRef = useRef<HTMLAudioElement | null>(null);

	useEffect(() => {
		if ((searchParams.get('playChallenge') === 'true' || searchParams.get('chal') === '1') && vocabItems.length >= 3) {
			const diff = searchParams.get('diff');
			if (diff === 'high' || diff === 'extreme') setChallengeDifficulty(diff);
            setChallengeExpanded(true);
            setTimeout(() => {
                const el = document.getElementById('speed-challenge-section');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 500);
            
            if (typeof window !== 'undefined') {
                const newUrl = new URL(window.location.href);
                newUrl.searchParams.delete('playChallenge');
                newUrl.searchParams.delete('chal');
                newUrl.searchParams.delete('diff');
                window.history.replaceState({}, '', newUrl.toString());
            }
        }
	}, [searchParams, vocabItems.length]);

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
				
				if (score === 100) {
					const wordId = vocabItems[cardIndex]?.id || currentWord;
					
					setPronunciationStatus('Chúc mừng bạn đã phát âm rất tốt.');
					
					const newStreak = pronunciationStreak + 1;
					const newIds = correctlyPronouncedIds.includes(wordId) ? correctlyPronouncedIds : [...correctlyPronouncedIds, wordId];
					const isTopicComplete = newIds.length > 0 && newIds.length === vocabItems.length;

					setPronunciationStreak(newStreak);
					setCorrectlyPronouncedIds(newIds);
					
					fetch('/api/toeic/vocabulary/pronunciation-reward', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ wordId, streak: newStreak, isTopicComplete })
					}).then(res => res.json()).then(data => {
						if (data.awardReason) {
							playPronunciationRewardChime();
							toast.success(data.awardReason, { id: 'pronunciation-reward', icon: '⭐' });
							if (session && data.awardedStars > 0) update?.();
						} else if (!session && (newStreak === 1 || newStreak === 3 || newStreak === 10 || isTopicComplete)) {
							playPronunciationRewardChime();
							toast.success('Bạn phát âm tốt lắm!', { id: 'pronunciation-good', icon: '⭐' });
						}

						if (!session && (newStreak === 2 || newStreak === 5)) {
							toast.success(newStreak === 2 ? 'Hay lắm! 2 từ liên tiếp rồi, đăng nhập để lưu tiến độ nhé!' : 'Bạn đang làm rất tốt! Đăng nhập để lưu tiến độ nhé!', { id: `streak-toast-${newStreak}` });
							openLoginModal?.(`${pathname}?${searchParams.toString()}`);
						}
					}).catch(() => {});
				} else {
					setPronunciationStreak(0);
					setPronunciationStatus(score >= 80 ? 'Rất tốt! Hãy tiếp tục phát huy.' : 'Hãy thử lại một lần nữa nhé.');
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

		recognition.onerror = (event: any) => {
			stopRecognition();
			if (event.error === 'no-speech') {
				setPronunciationStatus('Chưa nghe thấy gì. Hãy nhấn lại và đọc to hơn nhé.');
			} else if (event.error === 'not-allowed' || event.error === 'audio-capture') {
				setPronunciationStatus('Chưa cấp quyền Micro! Vui lòng cấp quyền cho trình duyệt.');
			} else if (event.error === 'network') {
				setPronunciationStatus('Lỗi kết nối mạng. Không thể tải bộ nhận dạng giọng nói của Google.');
			} else {
				setPronunciationStatus(`Lỗi nhận dạng (${event.error}). Vui lòng dùng trình duyệt Chrome chuẩn!`);
			}
		};

		recognition.onend = () => {
			setIsPronunciationListening(false);
		};
		
		recognition.onstart = () => {
			setIsPronunciationListening(true);
		};

		try {
			recognition.start();
		} catch (e: any) {
			console.error("SpeechRecognition start error:", e);
			stopRecognition();
			setPronunciationStatus(`Lỗi khởi động Micro: ${e.message || 'Không rõ nguyên nhân'}`);
			return;
		}

		// Timeout if no result within 10s
		pronunciationListeningTimeoutRef.current = window.setTimeout(() => {
			if (isPronunciationListening) {
				stopRecognition();
				setPronunciationStatus('Hết thời gian chờ. Xin hãy thử lại.');
			}
		}, 10000);
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
		const wordIdFromUrl = searchParams.get('wordId');
        const playChal = searchParams.get('playChallenge') === 'true' || searchParams.get('chal') === '1' ? 'true' : null;
		const slugFromUrl = searchParams.get('slug');

        let matchedTopicName = topicFromUrl;
        
        // Match slug to a full topic name if slug is parsed
        if (slugFromUrl && topics.length > 0 && !matchedTopicName) {
            const matched = topics.find(t => t.topic.split('-')[0].trim().toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-') === slugFromUrl);
            if (matched) matchedTopicName = matched.topic;
        }
		
		if (tabFromUrl === 'vocabulary' && matchedTopicName && (matchedTopicName !== loadedTopicRef.current || wordIdFromUrl)) {
            if (playChal === 'true' && !session && searchParams.get('login') !== 'true') {
                onPracticeClick(matchedTopicName, false);
            }
            loadedTopicRef.current = matchedTopicName;
			loadTopic(matchedTopicName, wordIdFromUrl);

            if (slugFromUrl && typeof window !== 'undefined') {
                const params = new URLSearchParams(searchParams.toString());
                params.delete('slug');
                params.set('topic', matchedTopicName);
                window.history.replaceState({}, '', `${pathname}?${params.toString()}`);
            }
		} else if (!matchedTopicName && selectedTopic && selectedTopic !== 'GLOBAL') {
            loadedTopicRef.current = null;
			setSelectedTopic(null);
		}
	}, [searchParams, session, selectedTopic, topics]);

	const openTopic = async (topic: string) => {
		if (!session) { onPracticeClick(topic); return; }
		
		// Update URL to reflect current topic seamlessly without triggering Next.js re-render
		const params = new URLSearchParams(searchParams.toString());
		params.set('topic', topic);
		params.set('tab', 'vocabulary');
		params.delete('wordId'); // Clear specific cross-linking wordId when normally opening a topic
		if (typeof window !== 'undefined') {
			window.history.pushState({}, '', `${pathname}?${params.toString()}`);
            window.scrollTo({ top: 0, behavior: 'smooth' });
		}
		
		loadTopic(topic);
	};

	const loadTopic = async (topic: string, specificWordId?: string | null, autoStartChallenge = false) => {
		setSelectedTopic(topic);
		setVocabLoading(true);
		setCardIndex(0);
		setIsFlipped(false);
		setShowExampleVi(false);
		setChallengeResult({ show: false, score: 0, total: 0 });
		setChallengeActive(false);
		setChallengeExpanded(topic === 'GLOBAL' && !autoStartChallenge);
		setChallengePreCtd(null);
        if (topic === 'GLOBAL') setChallengeDifficulty('extreme');

		try {
            if (topic === 'GLOBAL') {
				const vocabRes = await fetch('/api/toeic/speed-challenge/words');
				if (vocabRes.ok) {
					const data = await vocabRes.json();
					setVocabItems(data.items || []);
				}
                setVocabLoading(false);
                
                if (autoStartChallenge) {
                    setChallengeExpanded(false);
                    playSound('countdown321.mp3');
                    setChallengePreCtd(3);
                }
                return;
            }

			const [vocabRes, tagsRes] = await Promise.all([
				fetch(`/api/toeic/vocabulary?topic=${encodeURIComponent(topic)}`),
				session ? fetch('/api/toeic/vocabulary/tags') : Promise.resolve(null)
			]);

			let currentTags: Record<string, any> = {};
			if (tagsRes && tagsRes.ok) {
				const tagsData = await tagsRes.json();
				if (tagsData.tags) {
					tagsData.tags.forEach((t: any) => {
						currentTags[t.vocabId] = { learned: t.isLearned, hard: t.isHard, bookmarked: t.isBookmarked };
					});
					setVocabTags(currentTags);
				}
			}

			if (vocabRes.ok) {
				const data = await vocabRes.json();
				const rawItems = data.items || [];
				const filteredItems = rawItems.filter((w: any) => !currentTags[w.id]?.learned);
				
				const finalItems = filteredItems.length > 0 ? filteredItems : rawItems;
				setVocabItems(finalItems);
				
				if (specificWordId) {
					const idx = finalItems.findIndex((w: any) => w.id === specificWordId);
					if (idx !== -1) setCardIndex(idx);
				}
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
			} else {
                const errData = await vocabRes.json().catch(() => ({}));
                console.error("Vocabulary load failed", errData);
            }
		} catch (e) {
			console.error(e);
		} finally {
			setVocabLoading(false);
		}
	};

	const moveCard = (dir: 'prev' | 'next') => {
		playSound('bubble.mp3');
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

	const vocabBankBtnRef = useRef<HTMLAnchorElement>(null);
	const bookmarkBtnRef = useRef<HTMLButtonElement>(null);
	const [flyingStars, setFlyingStars] = useState<{ id: number, startX: number, startY: number, endX: number, endY: number }[]>([]);

	const toggleTag = async (wordId: string, tag: 'learned' | 'hard' | 'bookmarked') => {
		if (!session) {
			onPracticeClick(selectedTopic || undefined, false);
			return;
		}
		
		playSound(
			tag === 'bookmarked' ? 'bookmark-sound.mp3' : 'bubble.mp3'
		);
		
		const current = vocabTags[wordId] || {};
		const isEnabling = !current[tag];
		const newTagData = { ...current, [tag]: isEnabling };
		
		if (tag === 'learned' && newTagData.learned) newTagData.hard = false;
		if (tag === 'hard' && newTagData.hard) newTagData.learned = false;

		// Star Animation Trigger
		if (tag === 'bookmarked' && isEnabling && bookmarkBtnRef.current && vocabBankBtnRef.current) {
			const startRect = bookmarkBtnRef.current.getBoundingClientRect();
			const endRect = vocabBankBtnRef.current.getBoundingClientRect();
			
			const newStar = {
				id: Date.now(),
				startX: startRect.left + startRect.width / 2,
				startY: startRect.top + startRect.height / 2,
				endX: endRect.left + endRect.width / 2,
				endY: endRect.top + endRect.height / 2
			};
			
			setFlyingStars(prev => [...prev, newStar]);
			setTimeout(() => {
				setFlyingStars(prev => prev.filter(s => s.id !== newStar.id));
			}, 1000);
		}

		// Optimistic UI update
		setVocabTags(prev => ({
			...prev,
			[wordId]: newTagData
		}));

		// Backend sync
		try {
			await fetch('/api/toeic/vocabulary/tags', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					vocabId: wordId,
					isLearned: newTagData.learned,
					isHard: newTagData.hard,
					isBookmarked: newTagData.bookmarked,
				}),
			});
		} catch (error) {
			console.error('Failed to sync tag', error);
		}
	};

	const setupChallengeRound = (roundIdx: number, currentScore: number, wList = challengeWords) => {
		if (roundIdx >= wList.length) {
			setChallengeActive(false);
            const timeMs = challengeStartTime > 0 ? Date.now() - challengeStartTime : 0;
			setChallengeResult({ show: true, score: currentScore, total: wList.length, timeMs });
            
            // Only autosubmit score for the exact GLOBAL speed challenge
            if (selectedTopic === 'GLOBAL') {
				if (!session || session.user?.role === 'guest') {
                    const savePending = () => {
                        localStorage.setItem('pending-speed-challenge-score', JSON.stringify({
                            score: currentScore,
                            total: wList.length,
                            timeMs,
                            difficulty: challengeDifficulty
                        }));
                    }
                    savePending();
				} else {
					const saveRecord = async () => {
						try {
							await fetch('/api/toeic/speed-challenge', {
								method: 'POST',
								headers: { 'Content-Type': 'application/json' },
								body: JSON.stringify({
									guestName: null,
									topicTitle: 'Kiện Tướng Từ Vựng',
									topicSlug: 'GLOBAL',
									topicPackage: 'MIXED',
									difficulty: challengeDifficulty,
									score: currentScore,
									total: wList.length,
									timeMs
								})
							});
						} catch(e) {}
					};
					saveRecord();
				}
            } else if (currentScore === wList.length && selectedTopic) {
                if (session && session.user?.role !== 'guest') {
                    fetch('/api/toeic/vocabulary/tags', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ topicToMaster: selectedTopic })
                    }).then(() => {
                        const newTags = { ...vocabTags };
                        vocabItems.forEach(item => {
                            newTags[item.id] = { ...newTags[item.id], learned: true };
                        });
                        setVocabTags(newTags);
                        setTopics(prev => prev.map(t => t.topic === selectedTopic ? { ...t, learnedCount: t.wordCount } : t));
                        toast.success('Xuất sắc! Chủ đề này đã được đánh dấu là Đã thuộc!', { icon: '🎓' });
                    }).catch(() => {});
                } else {
                    toast.success('Đăng nhập để lưu tiến độ hoàn thành bộ từ vựng này nhé!', { icon: '🎓' });
                }
            }
            
			return;
		}
		const tWord = wList[roundIdx];
		const pool = vocabItems.filter(w => w.id !== tWord.id);
		const wOpts = [...pool].sort(() => 0.5 - Math.random()).slice(0, 2).map(w => w.meaning);
		const opts = [tWord.meaning, ...wOpts].sort(() => 0.5 - Math.random());
		setChallengeOptions(opts);
		setChallengeTimeLeft(challengeDifficulty === 'high' ? 5 : 4);
	};

	const startChallenge = () => {
		if (vocabItems.length < 3) return;
		const shuffled = [...vocabItems].sort(() => 0.5 - Math.random());
		setChallengeWords(shuffled);
		setChallengeRound(0);
		setChallengeScore(0);
		setChallengeResult({ show: false, score: 0, total: 0, timeMs: 0 });
        setChallengeStartTime(Date.now());
		setupChallengeRound(0, 0, shuffled);
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
			else allowed = plays.length < 3;
		}

		if (!allowed) {
			if (!session) {
				alert("Bạn đã dùng hết lượt trải nghiệm miễn phí hôm nay. Vui lòng đăng nhập để có thêm lượt chơi!");
				onPracticeClick(selectedTopic || undefined, false);
			} else {
				alert("Bạn đã thực hiện hết 3 lượt thử thách miễn phí hôm nay. Hãy nâng cấp tài khoản để chơi thả ga không giới hạn nhé!");
				setShowUpgrade(true);
			}
			return;
		}

		if (typeof window !== 'undefined') {
			const isPremium = session?.user?.role === 'admin' || session?.user?.tier === 'PRO' || session?.user?.tier === 'ULTRA';
			if (!isPremium) {
				plays.push(now);
				localStorage.setItem(storageKey, JSON.stringify(plays));
			}
		}

		setChallengeExpanded(false);
		playSound('countdown321.mp3');
		setChallengePreCtd(3);
	};

    const handleStartGlobalSpeedChallenge = async () => {
		let plays: number[] = [];
		const storageKey = `speed-challenge-plays-${session?.user?.id || 'guest'}`;
		if (typeof window !== 'undefined') {
			try { plays = JSON.parse(localStorage.getItem(storageKey) || '[]'); } catch {}
		}
		const now = Date.now();
		plays = plays.filter(time => now - time < 24 * 60 * 60 * 1000);
		
		let allowed = false;
		const isPremiumBySession = session?.user?.role === 'admin' || session?.user?.tier === 'PRO' || session?.user?.tier === 'ULTRA';
		if (!session) {
			allowed = plays.length < 1;
		} else {
			if (isPro || isUltra || isPremiumBySession) allowed = true;
			else allowed = plays.length < 3;
		}

		if (!allowed) {
			if (!session) {
				alert("Bạn đã dùng hết lượt trải nghiệm miễn phí hôm nay. Vui lòng đăng nhập để có thêm lượt chơi!");
				onPracticeClick(selectedTopic || undefined, false);
			} else {
				alert("Bạn đã thực hiện hết 3 lượt thử thách miễn phí hôm nay. Hãy nâng cấp tài khoản để chơi thả ga không giới hạn nhé!");
				setShowUpgrade(true);
			}
			return;
		}
		
		if (typeof window !== 'undefined') {
			if (!isPremiumBySession) {
				plays.push(now);
				localStorage.setItem(storageKey, JSON.stringify(plays));
			}
		}

		if (typeof window !== 'undefined') {
			const params = new URLSearchParams(searchParams.toString());
			params.set('topic', 'GLOBAL');
			params.set('tab', 'vocabulary');
			params.delete('wordId');
			window.history.pushState({}, '', `${pathname}?${params.toString()}`);
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}
		loadTopic('GLOBAL', null, true);
    };

	useEffect(() => {
		if (session && session.user?.role !== 'guest' && searchParams.get('savePending') === '1') {
			const pending = localStorage.getItem('pending-speed-challenge-score');
			if (pending) {
				try {
					const data = JSON.parse(pending);
					fetch('/api/toeic/speed-challenge', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({
							guestName: null,
							topicTitle: 'Kiện Tướng Từ Vựng',
							topicSlug: 'GLOBAL',
							topicPackage: 'MIXED',
							difficulty: data.difficulty,
							score: data.score,
							total: data.total,
							timeMs: data.timeMs
						})
					}).then(() => {
						localStorage.removeItem('pending-speed-challenge-score');
						alert("Tuyệt vời! Kết quả của bạn đã được lưu lên Bảng Vàng!");
						if (typeof window !== 'undefined') {
							const params = new URLSearchParams(searchParams.toString());
							params.delete('savePending');
							params.delete('topic');
							params.set('tab', 'home');
							window.history.replaceState({}, '', `${pathname}?${params.toString()}`);
                            router.replace(`${pathname}?${params.toString()}`, { scroll: false });
						}
					});
				} catch(e) {}
			}
		}
	}, [session, searchParams, pathname]);

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
			setupChallengeRound(nextRound, challengeScore);
			return;
		}
		const timer = setTimeout(() => setChallengeTimeLeft(pr => pr - 1), 1000);
		return () => clearTimeout(timer);
	}, [challengeTimeLeft, challengeActive, challengeRound, challengeScore]);

	const handleChallengeAnswer = (answer: string) => {
        const isCorrect = answer === challengeWords[challengeRound].meaning;
        const nextScore = challengeScore + (isCorrect ? 1 : 0);
		if (isCorrect) {
			setChallengeScore(nextScore);
		}
		const nextRound = challengeRound + 1;
		setChallengeRound(nextRound);
		setupChallengeRound(nextRound, nextScore);
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
					<svg className="w-3.5 h-3.5 fill-secondary-300 drop-shadow-sm" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
					<span className="text-[11px] font-bold text-slate-400 group-hover:text-primary-700 transition-colors">{fieldLabelsVi[label] || label}</span>
				</>
			) : (
				<>
					<svg className="w-3.5 h-3.5 fill-secondary-500 drop-shadow-sm" viewBox="0 0 24 24"><path d="M12 17.27l4.15 2.51c.76.46 1.69-.22 1.49-1.08l-1.1-4.72 3.67-3.18c.67-.58.31-1.68-.57-1.75l-4.83-.41-1.89-4.46c-.34-.81-1.5-.81-1.84 0L9.19 8.6l-4.83.41c-.88.07-1.24 1.17-.57 1.75l3.67 3.18-1.1 4.72c-.2.86.73 1.54 1.49 1.08l4.15-2.5z"/></svg>
					<span className="text-[11px] font-bold text-slate-400 group-hover:text-secondary-600 transition-colors">{fieldLabelsVi[label] || label}</span>
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
				<svg className="w-3 h-3 text-primary-600 group-hover:text-primary-800 transition-colors" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
			) : (
				<svg className="w-3 h-3 text-secondary-500 group-hover:text-secondary-600 transition-colors" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
			)}
		</span>
	);

	const backToTopics = () => {
		const params = new URLSearchParams(searchParams.toString());
		params.delete('topic');
		router.push(`${pathname}?${params.toString()}`, { scroll: false });
		setSelectedTopic(null);
		setVocabItems([]);
		setPronunciationStreak(0);
		setCorrectlyPronouncedIds([]);
		setPronunciationStatus('');
		setPronunciationScore(null);
		setPronunciationTranscript('');
		setPronunciationFeedback('');
	};

	// ── Topic list ──────────────────────────────────────────
	if (!selectedTopic) {
		return (
			<div>
				<div className="mb-6 bg-gradient-to-br from-[#4a044e] to-[#2e1065] rounded-2xl overflow-hidden shadow-md border border-[#701a75]/40 transition-all duration-300">
                    <button onClick={() => setChallengeExpanded(!challengeExpanded)} className="w-full flex items-center justify-between py-3 px-4 sm:px-5 bg-transparent hover:bg-white/5 transition-colors cursor-pointer focus:outline-none group">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-secondary-500/10 text-secondary-500 rounded-lg flex items-center justify-center border border-secondary-500/20 shadow-[0_0_10px_rgba(245,158,11,0.2)] group-hover:scale-110 transition-transform">
                                <span className="text-lg leading-none pt-[1px]">⚡</span>
                            </div>
                            <h3 className="text-[15px] sm:text-base font-black text-secondary-500 uppercase tracking-wider mt-[1px]">Speed Challenge</h3>
                        </div>
                        <svg className={`w-5 h-5 text-secondary-500/70 transition-transform duration-300 ${challengeExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
                    </button>

                    {challengeExpanded && (
                        <div className="p-5 sm:p-6 text-center border-t border-primary-800/50 animate-in slide-in-from-top-2 duration-300">
                            <h3 className="text-lg sm:text-xl text-secondary-500 font-black mb-1.5 tracking-tight">Thử thách Bảng Vàng</h3>
                            <p className="text-primary-200/80 mb-5 font-medium text-sm sm:text-base max-w-lg mx-auto">
                                Làm bài test tốc độ với <b className="text-secondary-500">30 từ vựng ngẫu nhiên</b>. Thời gian <b className="text-secondary-500">4 giây/từ</b>. Đăng nhập để ghi danh kết quả vào Bảng vàng.
                            </p>
                            
                            {!session && (
                                <div className="max-w-sm mx-auto mb-5">
                                    <input type="text" placeholder="Nhập tên của bạn (khách)" value={guestName} onChange={e => setGuestName(e.target.value)} maxLength={20} className="w-full text-center px-4 py-2.5 rounded-xl border border-primary-500/30 bg-primary-900/50 text-white placeholder-primary-300/50 focus:outline-none focus:ring-2 focus:ring-secondary-500/50 font-bold" />
                                </div>
                            )}

                            <button onClick={() => {
                                if (!session && guestName.trim().length < 2) {
                                    alert("Vui lòng nhập tên của bạn (ít nhất 2 ký tự) để ghi danh Bảng Vàng!");
                                    return;
                                }
                                handleStartGlobalSpeedChallenge();
                            }} className="relative overflow-hidden bg-secondary-500 hover:bg-secondary-400 text-primary-950 font-black px-8 py-3 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all cursor-pointer active:scale-95 group">
                                BẮT ĐẦU NGAY
                                <div className="absolute inset-0 -left-[100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-25deg] group-hover:animate-[metallic-shine-sweep_1.5s_ease-in-out_infinite] animate-[metallic-shine-sweep_3s_ease-in-out_infinite]"></div>
                            </button>
                        </div>
                    )}
                </div>

				<>
						{loading ? (
							<div className="py-12 text-center text-slate-400 italic font-medium">Đang tải chủ đề...</div>
						) : topics.length === 0 ? (
							<div className="py-16 text-center text-slate-400 border-2 border-dashed border-slate-100 rounded-3xl">
								Chưa có chủ đề từ vựng nào. Admin cần import từ tab TOEIC.
							</div>
						) : (
                            <>
                                <div className="inline-flex flex-wrap gap-1.5 sm:gap-2 mb-6 p-1.5 bg-slate-100/80 rounded-[14px]">
                                    {(['ALL', 'BASIC', 'ADVANCED', 'MIXED']).map(pkg => {
                                        const isActive = activePackage === pkg;
                                        
                                        const colorClass = isActive ? 'text-white' : 'text-slate-600 dark:text-slate-400';
                                        
                                        const activeBg = 'bg-linear-to-r from-primary-900 to-primary-800 shadow-md shadow-primary-900/20 ring-1 ring-primary-900';
                                                         
                                        const inactiveBg = 'hover:bg-white/80 dark:hover:bg-slate-800 hover:text-primary-900 dark:hover:text-primary-300 transition-colors';

                                        return (
                                            <button
                                                key={pkg}
                                                onClick={() => setActivePackage(pkg)}
                                                className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-[10px] text-[13px] sm:text-sm font-bold transition-all duration-300 ${colorClass} ${isActive ? activeBg : inactiveBg}`}
                                            >
                                                {pkg === 'ALL' ? 'Tất cả' : pkg === 'BASIC' ? 'Cơ bản' : pkg === 'ADVANCED' ? 'Nâng cao' : 'Hỗn hợp'}
                                            </button>
                                        )
                                    })}
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                    {topics.filter(t => activePackage === 'ALL' || t.packageType === activePackage).map((t) => (
                                        <TopicCard
                                            key={t.topic}
                                            type="vocabulary"
                                            title={t.topic.replace(/\s*-\s*(Cơ bản|Nâng cao|Hỗn hợp)\s*$/i, '').replace(/\s*\(\s*(Cơ bản|Nâng cao|Hỗn hợp)\s*\)\s*$/i, '')}
                                            badgeText={`${t.wordCount} từ`}
                                            onClick={() => openTopic(t.topic)}
                                            progress={{ learned: t.learnedCount || 0, total: t.wordCount }}
                                            packageType={t.packageType}
                                        />
                                    ))}
                                </div>
                            </>
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
		<div className="relative">
			{/* Flying Stars Animation Overlay */}
			<AnimatePresence>
				{flyingStars.map(star => (
					<motion.div
						key={star.id}
						initial={{ x: star.startX - 10, y: star.startY - 10, opacity: 1, scale: 1.2, rotate: 0 }}
						animate={{ x: star.endX - 10, y: star.endY - 10, opacity: 1, scale: 0.5, rotate: 360 }}
						exit={{ opacity: 0, scale: 0 }}
						transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
						className="fixed z-[9999] pointer-events-none text-xl drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]"
						style={{ left: 0, top: 0 }}
					>
						⭐
					</motion.div>
				))}
			</AnimatePresence>
			{/* Header */}
			<div className="flex flex-wrap items-center justify-between gap-3 mb-6">
				<div className="flex items-center gap-3">
					<button
						onClick={backToTopics}
						className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-primary-700 transition-colors"
						title="Quay lại"
					>
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
					</button>
					<div className="flex flex-col">
						<h2 className="text-base sm:text-lg font-black text-slate-800 leading-tight">
							{selectedTopic.replace(/^Chủ đề:\s*/i, '').split(' - ')[0]}
						</h2>
						{selectedTopic.includes(' - ') && (
							<p className="text-[11px] sm:text-xs font-bold text-slate-400">
								{selectedTopic.split(' - ')[1]}
							</p>
						)}
					</div>
				</div>
			</div>

			{vocabLoading ? (
				<div className="py-12 text-center text-gray-400 italic">Đang tải từ vựng...</div>
			) : vocabItems.length === 0 ? (
				<div className="py-12 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">Không có từ vựng nào.</div>
			) : (
				<div className="space-y-5">
					{/* 3D Flip Card — same structure as homepage */}
					{currentItem && !challengeActive && !challengeResult.show && challengePreCtd === null && selectedTopic !== 'GLOBAL' && (
						<div className="relative w-full h-[360px] sm:h-[480px] [perspective:1200px]">
							<div
								className={`relative h-full w-full rounded-2xl shadow-lg transition-transform duration-500 ease-out [transform-style:preserve-3d] cursor-pointer ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}
								onClick={() => setIsFlipped(!isFlipped)}
							>
								{/* ── FRONT FACE ── */}
								<div className="absolute inset-0 h-full w-full rounded-2xl overflow-hidden [backface-visibility:hidden] bg-gradient-to-br from-primary-900 via-[#4c1d95] to-[#2e1065] p-6 text-white flex flex-col items-center justify-center">
									<div className="absolute top-0 left-0 z-20 pointer-events-none flex leading-none">
										<PackageBadge pkg={topics.find(t=>t.topic === selectedTopic)?.packageType} className="rounded-br-[14px] rounded-tl-none border-b border-r border-white/20 text-white/90 bg-white/10 backdrop-blur-sm m-0" />
									</div>
									<span className="absolute top-4 right-5 text-white/50 bg-white/10 p-1.5 rounded-full pointer-events-none">
										<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
									</span>
									<div className={`flex flex-col items-center transition-transform duration-500 ease-out w-full ${(pronunciationStatus || pronunciationScore !== null) ? '-translate-y-16 sm:-translate-y-12' : ''}`}>
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
															? 'rounded-full bg-red-500 animate-pulse px-5 py-2.5 opacity-100 shadow-[0_0_15px_rgba(239,68,68,0.8)] pointer-events-none'
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
									</div>

									{/* Practice Status Overlay */}
									{(pronunciationStatus || pronunciationScore !== null) && (
										<div className="absolute bottom-16 left-0 right-0 px-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
											<div className="bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-xl border border-primary-900/10 text-slate-800">
												{pronunciationStatus && (
													<p className="text-[11px] sm:text-xs font-bold text-primary-900 mb-1">{pronunciationStatus}</p>
												)}
												{pronunciationScore !== null && (
													<div className="space-y-1.5 mt-1">
														{pronunciationTranscript && (
															<p className="text-[10px] text-slate-700 italic truncate italic">
																<span className="text-slate-500 font-medium text-[9px] uppercase mr-1">Đã nghe:</span>
																&quot;{pronunciationTranscript}&quot;
															</p>
														)}
														{pronunciationFeedback && (
															<p className="text-[9px] font-bold text-primary-900 leading-tight line-clamp-2">{pronunciationFeedback}</p>
														)}
														<div className="flex items-center gap-2 pt-1 border-t border-primary-900/10">
															<span className="text-[9px] font-semibold text-slate-500">Score:</span>
															<div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
																<div 
																	className={`h-full rounded-full transition-all duration-1000 ${pronunciationScore >= 80 ? 'bg-primary-500' : pronunciationScore >= 50 ? 'bg-secondary-400' : 'bg-red-400'}`}
																	style={{ width: `${pronunciationScore}%` }}
																/>
															</div>
															<span className="text-[10px] font-black text-slate-700 min-w-6 text-right">{pronunciationScore}%</span>
														</div>
													</div>
												)}
											</div>
										</div>
									)}

									{/* Topic text removed for better focus */}

									{/* Front Face Nav */}
									<div className="absolute inset-x-0 px-4 bottom-1 sm:bottom-3 flex items-center justify-between pointer-events-auto" onClick={e => e.stopPropagation()}>
										<button onClick={(e) => { e.stopPropagation(); moveCard('prev'); }} disabled={cardIndex === 0} className="group flex items-center justify-center p-2 text-white/80 transition hover:text-white disabled:opacity-30 disabled:cursor-not-allowed">
											<svg className="w-6 h-6 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"/></svg>
										</button>
										<span className="text-[10px] sm:text-[11px] font-bold text-white/30 tracking-widest">{cardIndex + 1} / {vocabItems.length}</span>
										<button onClick={(e) => { e.stopPropagation(); moveCard('next'); }} disabled={cardIndex >= vocabItems.length - 1} className="group flex items-center justify-center p-2 text-white/80 transition hover:text-white disabled:opacity-30 disabled:cursor-not-allowed">
											<svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"/></svg>
										</button>
									</div>
								</div>

								{/* ── BACK FACE ── */}
								<div className="absolute inset-0 h-full w-full rounded-2xl [backface-visibility:hidden] [transform:rotateY(180deg)] bg-white border-2 border-primary-900/20 py-5 sm:py-7 text-slate-800 flex flex-col shadow-[inset_0_0_20px_rgba(88, 28, 135,0.02)] overflow-hidden">
									
									<div className="flex-1 overflow-y-auto px-5 sm:px-7 pb-20">
										<span className="absolute top-4 right-5 text-primary-900/50 bg-primary-900/5 p-1.5 rounded-full pointer-events-none">
											<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
										</span>

									{/* Basic info — always visible */}
									<div className="flex-1 flex flex-col items-center justify-start text-center w-full pt-1">
										<p className="text-2xl sm:text-3xl font-bold text-primary-900 leading-none mb-1">{currentItem.word}</p>
										{currentItem.phonetic && (
											isFieldLocked('phonetic') ? <LockedFieldView tier={isFieldLocked('phonetic')!} label="phonetic" /> :
											<p className="text-[13px] text-slate-400">{currentItem.phonetic.replaceAll('.', '')}</p>
										)}

										<div className="mt-2.5 mb-2.5 w-10 h-0.5 bg-primary-900/20 rounded-full mx-auto shrink-0" />

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
												<div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-900/40" />
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
											<div className="mt-3.5 w-full flex-shrink-0 space-y-2 text-[13px] text-center border-t border-slate-100 pt-3 flex flex-col items-center">
												{currentItem.synonyms && (
													<div className="w-full text-left flex items-start gap-1">
														<span className="font-bold text-primary-900 flex items-center gap-1 text-[12px] shrink-0 mt-[1px]">
															<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
															Synonyms:
														</span>
														{isFieldLocked('synonyms') ? <LockedValueBadge tier={isFieldLocked('synonyms')!} /> : (
															<span className="text-slate-700 font-medium leading-relaxed">{currentItem.synonyms.replace(/\(Blank\)/gi, 'N/A')}</span>
														)}
													</div>
												)}
												{currentItem.antonyms && (
													<div className="w-full text-left flex items-start gap-1">
														<span className="font-bold text-primary-900 flex items-center gap-1 text-[12px] shrink-0 mt-[1px]">
															<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
															Antonyms:
														</span>
														{isFieldLocked('antonyms') ? <LockedValueBadge tier={isFieldLocked('antonyms')!} /> : (
															<span className="text-slate-700 font-medium leading-relaxed">{currentItem.antonyms.replace(/\(Blank\)/gi, 'N/A')}</span>
														)}
													</div>
												)}
												{currentItem.collocations && (
													<div className="w-full text-left flex items-start gap-1">
														<span className="font-bold text-primary-700 flex items-center gap-1 text-[12px] shrink-0 mt-[1px]">
															<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
															Collocations:
														</span>
														{isFieldLocked('collocations') ? <LockedValueBadge tier={isFieldLocked('collocations')!} /> : (
															<span className="text-slate-700 font-medium leading-relaxed">{currentItem.collocations.replace(/\(Blank\)/gi, 'N/A')}</span>
														)}
													</div>
												)}
												{currentItem.toeicTrap && (
													<div className="rounded-md bg-secondary-50 border border-secondary-200 p-2 w-full text-left flex flex-col sm:flex-row sm:items-start gap-1 mt-1 transition-colors">
														<span className="font-bold text-secondary-600 flex items-center gap-1 text-[12px] shrink-0 mt-[1px]">
															<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
															TOEIC Tip:
														</span>
														{isFieldLocked('toeicTrap') ? <LockedValueBadge tier={isFieldLocked('toeicTrap')!} /> : (
															<span className="text-slate-700 font-medium leading-relaxed">{currentItem.toeicTrap.replace(/\(Blank\)/gi, 'N/A')}</span>
														)}
													</div>
												)}
											</div>
										)}
										{(!isUltra || !isPro) && (topicProFields.length > 0 || topicUltraFields.length > 0) && (
											<button
												type="button"
												onClick={(e) => { e.stopPropagation(); setShowUpgrade(true); }}
												className="mt-6 text-[10px] font-bold text-primary-700 hover:text-primary-800 transition cursor-pointer flex items-center gap-1.5 justify-center pb-4"
											>
												Nâng cấp <UltraTag /> để xem đầy đủ Collocations, Synonyms, Antonyms &amp; Bẫy TOEIC
											</button>
										)}
									</div>
									</div>

									{/* Back Face Nav */}
									<div className="absolute inset-x-0 px-4 bottom-1 sm:bottom-3 flex items-center justify-between pointer-events-auto z-50 bg-gradient-to-t from-white via-white to-transparent pt-8 pb-1" onClick={e => e.stopPropagation()}>
										<button onClick={(e) => { e.stopPropagation(); moveCard('prev'); }} disabled={cardIndex === 0} className="group flex items-center justify-center p-2 text-primary-600 transition hover:text-primary-800 disabled:opacity-30 disabled:cursor-not-allowed">
											<svg className="w-6 h-6 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"/></svg>
										</button>
										<span className="text-[10px] sm:text-[11px] font-bold text-slate-300 tracking-widest">{cardIndex + 1} / {vocabItems.length}</span>
										<button onClick={(e) => { e.stopPropagation(); moveCard('next'); }} disabled={cardIndex >= vocabItems.length - 1} className="group flex items-center justify-center p-2 text-primary-600 transition hover:text-primary-800 disabled:opacity-30 disabled:cursor-not-allowed">
											<svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"/></svg>
										</button>
									</div>
								</div>
							</div>
						</div>
					)}

					{/* Tags Action Bar */}
					{currentItem && !challengeActive && !challengeResult.show && challengePreCtd === null && selectedTopic !== 'GLOBAL' && (
						<div className="flex flex-wrap items-center justify-center gap-2 mt-4 animate-in fade-in slide-in-from-top-2">
							<button onClick={() => toggleTag(currentItem.id, 'learned')} className={`px-3 py-1.5 rounded-full font-medium text-[13px] transition-all duration-300 border shadow-sm hover:-translate-y-0.5 hover:shadow-md ${vocabTags[currentItem.id]?.learned ? 'bg-primary-100 text-primary-700 border-primary-300 hover:brightness-105' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}>
								{vocabTags[currentItem.id]?.learned ? '✓ Đã thuộc' : '○ Đánh dấu đã thuộc'}
							</button>
							<button onClick={() => toggleTag(currentItem.id, 'hard')} className={`px-3 py-1.5 rounded-full font-medium text-[13px] transition-all duration-300 border shadow-sm hover:-translate-y-0.5 hover:shadow-md ${vocabTags[currentItem.id]?.hard ? 'bg-red-100 text-red-700 border-red-300 hover:brightness-105' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}>
								{vocabTags[currentItem.id]?.hard ? '🔥 Khó' : 'Thấy từ này khó?'}
							</button>
							<button 
								ref={bookmarkBtnRef}
								onClick={() => toggleTag(currentItem.id, 'bookmarked')} 
								className={`px-3 py-1.5 flex items-center justify-center gap-1.5 rounded-full font-medium text-[13px] transition-all duration-300 border shadow-sm hover:-translate-y-0.5 hover:shadow-md ${vocabTags[currentItem.id]?.bookmarked ? 'bg-secondary-100 text-secondary-600 border-secondary-300 hover:brightness-105' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`} 
								title="Bookmark"
							>
								<svg className="w-3.5 h-3.5" fill={vocabTags[currentItem.id]?.bookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg>
								{vocabTags[currentItem.id]?.bookmarked ? 'Đã lưu' : 'Lưu lại từ này'}
							</button>

							<div className="w-full flex justify-center mt-3 mb-1">
								<Link 
									ref={vocabBankBtnRef}
									href="/toeic-progress?tab=vocabulary-bank"
									className="group px-4 py-2 rounded-full font-bold text-[13px] bg-primary-50 text-primary-900 border border-primary-200 hover:bg-primary-100 hover:border-primary-300 transition-all flex items-center justify-center gap-2 shadow-xs"
								>
									<span className="flex items-center justify-center w-5 h-5 bg-white rounded-full text-[10px] shadow-xs group-hover:scale-110 transition-transform">📚</span>
									Sổ từ vựng của tôi
								</Link>
							</div>
						</div>
					)}

					{/* Pre Countdown UI */}
					{challengePreCtd !== null && (
						<div className="mt-8 bg-primary-600 rounded-3xl p-16 text-center shadow-xl flex flex-col items-center justify-center animate-in zoom-in-95 duration-300">
							<span className="text-white text-xl font-bold mb-4 opacity-80 uppercase tracking-widest">Chuẩn bị...</span>
							<h3 className="text-8xl font-black text-white drop-shadow-lg animate-pulse">{challengePreCtd}</h3>
						</div>
					)}

					{/* Speed Challenge Intro Section */}
					{vocabItems.length >= 3 && !challengeActive && !challengeResult.show && challengePreCtd === null && (
						<div id="speed-challenge-section" className="mt-8 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm transition-all duration-300">
							<button onClick={() => setChallengeExpanded(!challengeExpanded)} className="w-full flex items-center justify-between py-3 px-5 hover:bg-slate-50 transition-colors cursor-pointer focus:outline-none">
								<div className="flex items-center gap-2.5">
									<div className="text-primary-600 flex items-center justify-center">
										<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
									</div>
									<h3 className="text-[14px] font-bold text-slate-700">{selectedTopic === 'GLOBAL' ? 'Speed Challenge' : 'Kiểm tra trí nhớ'}</h3>
								</div>
								<svg className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${challengeExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
							</button>

							{challengeExpanded && (
								<div className="p-8 text-center border-t border-primary-50 animate-in slide-in-from-top-4 duration-300">
									<h3 className="text-xl font-black text-slate-800 mb-2">Hãy chuẩn bị kỹ trước khi tham gia!</h3>
									<p className="text-slate-500 mb-6 font-medium">
                                        {selectedTopic === 'GLOBAL' ? 'Thời gian hoàn thành sẽ được lưu vào Bảng Vàng nếu bạn không đăng xuất.' : 'Chọn tốc độ ghi nhớ phù hợp với khả năng của bạn trước khi bắt đầu.'}
                                    </p>
									
                                    {selectedTopic !== 'GLOBAL' && (
                                        <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
                                            <button 
                                                onClick={() => setChallengeDifficulty('high')}
                                                className={`flex-1 min-w-[160px] max-w-[200px] px-4 py-3 border-2 rounded-2xl font-bold transition-all ${challengeDifficulty === 'high' ? 'bg-primary-50 border-primary-500 text-primary-700 shadow-md scale-[1.02]' : 'bg-white border-slate-200 text-slate-500 hover:border-primary-300 hover:text-primary-500'}`}
                                            >
                                                <div className="mb-0.5">Áp lực cao</div>
                                                <div className="text-[12px] opacity-80 font-medium">(5 giây / từ)</div>
                                            </button>
                                            <button 
                                                onClick={() => setChallengeDifficulty('extreme')}
                                                className={`flex-1 min-w-[160px] max-w-[200px] px-4 py-3 border-2 rounded-2xl font-bold transition-all ${challengeDifficulty === 'extreme' ? 'bg-rose-50 border-rose-500 text-rose-700 shadow-md scale-[1.02]' : 'bg-white border-slate-200 text-slate-500 hover:border-rose-300 hover:text-rose-500'}`}
                                            >
                                                <div className="mb-0.5">Áp lực cực cao</div>
                                                <div className="text-[12px] opacity-80 font-medium">(4 giây / từ)</div>
                                            </button>
                                        </div>
                                    )}

                                    {selectedTopic === 'GLOBAL' && !session && (
                                        <div className="max-w-sm mx-auto mb-6">
                                            <input 
                                                type="text" 
                                                value={guestName} 
                                                onChange={e => setGuestName(e.target.value)} 
                                                placeholder="Nhập tên của bạn để lên bảng vàng" 
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-700 font-medium text-center focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all bg-white"
                                            />
                                        </div>
                                    )}

									<div className="block mb-5">
										<button type="button" onClick={handleStartChallenge} className="bg-primary-600 text-white font-bold text-lg px-8 py-3.5 rounded-full md:hover:bg-primary-700 md:hover:shadow-lg transition-all active:scale-95 active:bg-primary-800 cursor-pointer focus:outline-none touch-manipulation select-none">
											Bắt Đầu Ngay
										</button>
									</div>

									<p className="text-[12px] text-slate-400 font-medium bg-slate-50 p-3 rounded-xl inline-block border border-slate-100">
										{!session ? "Lưu ý: Bạn đang là khách nên chỉ được tham gia 1 lần / 24 giờ. Vui lòng đăng nhập để có thêm lượt." : (!isPro && !isUltra) ? "Lưu ý: Bạn được tham gia 3 lần / 24 giờ. Nâng cấp tài khoản để Challenge không giới hạn." : "Tài khoản cao cấp: Bạn được tham gia thử thách không giới hạn."}
									</p>
								</div>
							)}
						</div>
					)}

					{/* Active Speed Challenge UI */}
					{challengeActive && challengeWords[challengeRound] && challengePreCtd === null && (
						<div className="mt-6 bg-white border-2 border-primary-500 rounded-3xl p-8 shadow-xl animate-in fade-in slide-in-from-bottom-6 duration-300">
							<div className="flex justify-between items-center mb-6">
								<span className="font-bold text-slate-500">Từ {challengeRound + 1} / {challengeWords.length}</span>
							</div>
							
							<div className="text-center mb-10 w-full overflow-hidden">
								<h4 className="text-3xl sm:text-5xl font-black text-slate-800 tracking-tight drop-shadow-sm mb-3 sm:mb-4 break-words">
									{challengeWords[challengeRound].word}
								</h4>
								{challengeWords[challengeRound].phonetic && (
									<p className="text-sm sm:text-base text-slate-400 font-medium">{challengeWords[challengeRound].phonetic.replaceAll('.', '')}</p>
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
									<button key={i} type="button" onClick={() => handleChallengeAnswer(opt)} className="bg-slate-50 border-2 border-slate-200 p-3 sm:p-4 rounded-xl text-base sm:text-lg font-bold text-slate-700 active:border-primary-400 active:bg-primary-50 active:text-primary-700 md:hover:border-primary-400 md:hover:bg-primary-50 md:hover:text-primary-700 transition-all text-left cursor-pointer break-words focus:outline-none select-none touch-manipulation">
										{opt}
									</button>
								))}
							</div>
						</div>
					)}

					{/* Challenge Result */}
					{challengeResult.show && (
						<div className="mt-8 bg-primary-600 text-white rounded-3xl p-10 text-center shadow-xl animate-in zoom-in-95 duration-500">
							<h3 className="text-3xl font-black mb-4 tracking-tight">🎉 Thử Thách Hoàn Tất!</h3>
							<p className="text-primary-200 text-lg mb-8 font-medium">Bạn đúng <span className="text-white font-bold text-2xl mx-1">{challengeResult.score} / {challengeResult.total}</span> từ.</p>
							
                            {selectedTopic === 'GLOBAL' ? (
                                challengeResult.score / Math.max(1, challengeResult.total) >= 0.8 ? (
                                    <div className="mb-8 p-6 bg-white/10 rounded-2xl border border-white/20">
                                        <h4 className="text-xl font-bold text-secondary-300 mb-2">Bạn quá xuất sắc quá! Cố gắng giữ đỉnh bảng nhé!</h4>
                                        <p className="text-primary-100 text-sm mb-5">Chia sẻ kết quả này để thách đấu cùng bạn bè nhé.</p>
                                        <div className="flex flex-col gap-3 max-w-sm mx-auto">
                                            <button 
                                                onClick={() => {
                                                    const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/toeic-practice?tab=vocabulary&topic=GLOBAL&chal=1${session?.user?.id ? `&ref=${session.user.id.slice(-10)}` : ''}`;
                                                    navigator.clipboard.writeText(url);
                                                    setCopySuccess(true);
                                                    setTimeout(() => setCopySuccess(false), 2000);
                                                }} 
                                                className="w-full bg-secondary-400 hover:bg-secondary-300 text-primary-900 px-4 py-3.5 rounded-xl text-base font-black transition-colors cursor-pointer shadow-lg active:scale-95"
                                            >
                                                {copySuccess ? 'Đã Copy Link' : 'Copy Link Thách Đấu'}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mb-8">
                                        <h4 className="text-xl font-bold text-secondary-300">Bạn đã rất nỗ lực rồi! Hãy thử lại để ghi danh nhé!</h4>
                                    </div>
                                )
                            ) : (
                                <div className="mb-8">
                                    <h4 className="text-xl font-bold text-secondary-300">Bạn đã rất nỗ lực rồi! Chúc mừng bạn nhé!</h4>
                                </div>
                            )}

                            {selectedTopic === 'GLOBAL' && (!session || session.user?.role === 'guest') && (
                                <div className="mb-8 p-6 bg-gradient-to-r from-secondary-500/20 to-orange-500/20 rounded-2xl border border-secondary-400/30">
                                    <h4 className="text-xl font-black text-secondary-300 mb-2">Bạn có muốn lưu thành tích?</h4>
                                    <p className="text-primary-50 text-sm mb-5 font-medium">Ghi danh điểm số của bạn lên Bảng Vàng để thách đấu cùng mọi người nha!</p>
                                    <button 
                                        onClick={() => {
                                            const dest = `${typeof window !== 'undefined' ? window.location.origin : ''}${pathname}?tab=vocabulary&topic=GLOBAL&savePending=1`;
                                            if (openLoginModal) openLoginModal(dest, false);
                                        }} 
                                        className="bg-gradient-to-r from-secondary-400 to-orange-400 text-slate-900 font-black px-8 py-3.5 rounded-xl shadow-lg hover:from-secondary-300 hover:to-orange-300 transition-all w-full sm:w-auto cursor-pointer"
                                    >
                                        Đăng nhập Ghi danh
                                    </button>
                                </div>
                            )}

							<div className="flex flex-col sm:flex-row items-center justify-center gap-4">
								<button onClick={selectedTopic === 'GLOBAL' ? handleStartGlobalSpeedChallenge : handleStartChallenge} className="bg-white text-primary-700 font-black px-8 py-3.5 rounded-full hover:shadow-lg transition-all w-full sm:w-auto cursor-pointer">
									Làm Lại
								</button>
								<button onClick={() => { setChallengeResult({ show: false, score: 0, total: 0, timeMs: 0 }); setChallengeExpanded(false); if (selectedTopic === 'GLOBAL') { backToTopics(); } }} className="bg-primary-800 text-white font-bold px-8 py-3.5 rounded-full hover:bg-primary-900 transition-all w-full sm:w-auto cursor-pointer">
									Quay Lại Học Từ
								</button>
							</div>
						</div>
					)}

				</div>
			)}
			<UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} />
		</div>
	);
}

function getPartColors(partId: number) {
    return { baseHex: 'var(--primary-900)' };
}

function ToeicListeningTab({ onPracticeClick }: { onPracticeClick: (slug?: string) => void }) {
	const searchParams = useSearchParams();
	const partParam = searchParams.get('part');
	const initialPart = partParam ? parseInt(partParam) : 1;

	const [topics, setTopics] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedPart, setSelectedPart] = useState<number>(initialPart);

	useEffect(() => {
		const fetchTopics = async () => {
			try {
				const res = await fetch('/api/toeic/grammar?type=LISTENING');
				if (res.ok) {
					let data = await res.json();
					try {
						const stored = localStorage.getItem('toeic_guest_progress');
						if (stored) {
							const localData = JSON.parse(stored);
							data = data.map((t: any) => ({
								...t,
								lessons: t.lessons.map((l: any) => {
									if (localData[l.id]) {
										const lessonAns = localData[l.id];
										let answered = 0;
										let correct = 0;
										Object.values(lessonAns).forEach((ans: any) => {
											answered++;
											if (ans.isCorrect) correct++;
										});
										return { ...l, progress: { answered, correct } };
									}
									return l;
								})
							}));
						}
					} catch (e) {}
					setTopics(data);
				}
			} catch (error) {
				console.error('Failed to fetch listening topics:', error);
			} finally {
				setLoading(false);
			}
		};
		fetchTopics();
	}, []);

	if (loading) {
		return <div className="py-12 text-center text-gray-500 italic">Đang tải các bài nghe...</div>;
	}

	const parts = [
		{ id: 1, title: "Part 1: Photographs", subtitle: "Mô tả tranh" },
		{ id: 2, title: "Part 2: Question-Response", subtitle: "Hỏi đáp" },
		{ id: 3, title: "Part 3: Conversations", subtitle: "Hội thoại ngắn" },
		{ id: 4, title: "Part 4: Short Talks", subtitle: "Bài nói ngắn" },
	];

	const filteredTopics = topics.filter(t => t.part === selectedPart);
	const groupedLessons = filteredTopics.reduce((acc, topic) => {
		const match = topic.title.match(/(ETS)\s*(\d{4})/i);
		const collectionName = match ? `${match[1].toUpperCase()} ${match[2]}` : 'Khác';
		if (!acc[collectionName]) acc[collectionName] = [];
		const lessons = (topic.lessons || []).map((l: any) => ({
			...l,
			topicTitle: topic.title,
			topicSlug: topic.slug
		}));
		acc[collectionName].push(...lessons);
		return acc;
	}, {} as Record<string, any[]>);

    const sortedCollections = Object.entries(groupedLessons).sort((a, b) => {
        if (a[0] === 'Khác') return 1;
        if (b[0] === 'Khác') return -1;
        return b[0].localeCompare(a[0]);
    });

	return (
		<div>
			<h2 className="text-xl sm:text-[22px] font-black text-primary-900 mb-6 flex items-center gap-2.5 tracking-tight px-1">
				<span className="w-1.5 h-6 rounded-full bg-[#ea980c] block shadow-sm"></span>
				Các Phần Thi Listening
			</h2>

			<div className="flex w-full overflow-x-auto gap-2.5 md:gap-3 mb-8 pb-3 hide-scrollbar snap-x" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
				{parts.map((p) => {
					const isActive = selectedPart === p.id;
					const colors = getPartColors(p.id);
					
					return (
						<button
							key={p.id}
							onClick={() => setSelectedPart(p.id)}
							className={`group flex items-center gap-2 px-4 md:px-5 py-2 md:py-2.5 rounded-[14px] transition-all duration-300 font-bold text-[13px] md:text-[14px] whitespace-nowrap shrink-0 snap-center border ${isActive ? 'scale-[1.02] border-transparent shadow-md ring-2' : 'border-current/10 hover:border-current/30'}`}
                            style={{
                                backgroundColor: isActive ? colors.baseHex : `${colors.baseHex}10`,
                                color: isActive ? '#ffffff' : colors.baseHex,
                                boxShadow: isActive ? `0 4px 14px -4px ${colors.baseHex}66` : 'none',
                                '--tw-ring-color': `${colors.baseHex}40`
                            } as any}
						>
							Part {p.id} - {p.subtitle}
						</button>
					);
				})}
			</div>
			
			<div className="flex flex-col gap-10 relative z-10 w-full mt-2">
				{sortedCollections.length === 0 ? (
					<div className="col-span-full py-16 text-center text-slate-400 border-2 border-dashed border-slate-200 bg-white/50 rounded-3xl font-medium">
						Chưa có bài tập nào trong phần này.
					</div>
				) : (
                    sortedCollections.map(([collectionName, lessons]: [string, any]) => (
                        <div key={collectionName}>
                            <h3 className="text-xl font-bold text-slate-300 mb-6 flex items-center gap-4">
                                <span className="text-primary-900 font-black bg-primary-50 px-4 py-1 rounded-full border border-primary-200 text-sm tracking-wide shadow-sm">
                                    {collectionName} - PART {selectedPart}
                                </span>
                                <div className="h-px bg-slate-200 flex-1"></div>
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                                {lessons.map((lesson: any) => (
                                    <div
                                        key={lesson.id}
                                        onClick={() => onPracticeClick(`${lesson.topicSlug}?lessonId=${lesson.id}`)}
                                        className="group relative bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-slate-50 group-hover:to-slate-100 transition-colors pointer-events-none"></div>
                                        <div className="p-4 sm:p-5 flex-1 flex flex-col relative z-10">
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="w-10 h-10 rounded-lg bg-primary-900/10 group-hover:bg-primary-900/20 flex flex-shrink-0 items-center justify-center text-primary-900 transition-colors shadow-sm">
                                                    {getPartIcon(selectedPart)}
                                                </div>
                                                <h3 className="text-[17px] font-black text-primary-900 transition-colors">{lesson.title}</h3>
                                            </div>
                                            <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between gap-2 text-[13px] font-bold text-slate-500">
                                                <div className="flex items-center gap-1.5 text-slate-500 transition-colors">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                                                    {lesson._count?.questions || 0} Câu hỏi
                                                </div>
                                                {lesson.progress ? (
                                                   <div className="flex items-center gap-2">
                                                     <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full border border-primary-100">{lesson.progress.correct}/{lesson._count?.questions || 0} đúng</span>
                                                     <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center transition-colors duration-300 group-hover:bg-primary-900 group-hover:text-white" title="Làm lại">
                                                         <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                                     </div>
                                                   </div>
                                                ) : (
                                                   <div className="flex items-center gap-2">
                                                     <span className="text-[11px] font-bold text-slate-400">Chưa làm</span>
                                                     <div className="w-7 h-7 rounded-full bg-primary-900 text-white flex items-center justify-center transition-colors duration-300" title="Làm ngay">
                                                         <svg className="w-3.5 h-3.5 translate-x-px" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
                                                     </div>
                                                   </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
			</div>
		</div>
	);
}

function ToeicReadingTab({ onPracticeClick }: { onPracticeClick: (slug?: string) => void }) {
	const searchParams = useSearchParams();
	const partParam = searchParams.get('part');
	const initialPart = partParam ? parseInt(partParam) : 5;

	const [topics, setTopics] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedPart, setSelectedPart] = useState<number>(initialPart);

	useEffect(() => {
		const fetchTopics = async () => {
			try {
				const res = await fetch('/api/toeic/grammar?type=READING');
				if (res.ok) {
					let data = await res.json();
					try {
						const stored = localStorage.getItem('toeic_guest_progress');
						if (stored) {
							const localData = JSON.parse(stored);
							data = data.map((t: any) => ({
								...t,
								lessons: t.lessons.map((l: any) => {
									if (localData[l.id]) {
										const lessonAns = localData[l.id];
										let answered = 0;
										let correct = 0;
										Object.values(lessonAns).forEach((ans: any) => {
											answered++;
											if (ans.isCorrect) correct++;
										});
										return { ...l, progress: { answered, correct } };
									}
									return l;
								})
							}));
						}
					} catch (e) {}
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

	const filteredTopics = topics.filter(t => t.part === selectedPart);
	const groupedLessons = filteredTopics.reduce((acc, topic) => {
		const match = topic.title.match(/(ETS)\s*(\d{4})/i);
		const collectionName = match ? `${match[1].toUpperCase()} ${match[2]}` : 'Khác';
		if (!acc[collectionName]) acc[collectionName] = [];
		const lessons = (topic.lessons || []).map((l: any) => ({
			...l,
			topicTitle: topic.title,
			topicSlug: topic.slug
		}));
		acc[collectionName].push(...lessons);
		return acc;
	}, {} as Record<string, any[]>);

    const sortedCollections = Object.entries(groupedLessons).sort((a, b) => {
        if (a[0] === 'Khác') return 1;
        if (b[0] === 'Khác') return -1;
        return b[0].localeCompare(a[0]);
    });

	return (
		<div>
			<h2 className="text-xl sm:text-[22px] font-black text-primary-900 mb-6 flex items-center gap-2.5 tracking-tight px-1">
				<span className="w-1.5 h-6 rounded-full bg-primary-900 block shadow-sm"></span>
				Các Phần Thi Reading
			</h2>

			<div className="flex w-full overflow-x-auto gap-2.5 md:gap-3 mb-8 pb-3 hide-scrollbar snap-x" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
				{parts.map((p) => {
					const isActive = selectedPart === p.id;
					const colors = getPartColors(p.id);
					
					return (
						<button
							key={p.id}
							onClick={() => setSelectedPart(p.id)}
							className={`group flex items-center gap-2 px-4 md:px-5 py-2 md:py-2.5 rounded-[14px] transition-all duration-300 font-bold text-[13px] md:text-[14px] whitespace-nowrap shrink-0 snap-center border ${isActive ? 'scale-[1.02] border-transparent shadow-md ring-2' : 'border-current/10 hover:border-current/30'}`}
                            style={{
                                backgroundColor: isActive ? colors.baseHex : `${colors.baseHex}10`,
                                color: isActive ? '#ffffff' : colors.baseHex,
                                boxShadow: isActive ? `0 4px 14px -4px ${colors.baseHex}66` : 'none',
                                '--tw-ring-color': `${colors.baseHex}40`
                            } as any}
						>
							Part {p.id} - {p.subtitle}
						</button>
					);
				})}
			</div>
			
			<div className="flex flex-col gap-10 relative z-10 w-full mt-2">
				{sortedCollections.length === 0 ? (
					<div className="col-span-full py-16 text-center text-slate-400 border-2 border-dashed border-slate-200 bg-white/50 rounded-3xl font-medium">
						Chưa có bài tập nào trong phần này.
					</div>
				) : (
                    sortedCollections.map(([collectionName, lessons]: [string, any]) => (
                        <div key={collectionName}>
                            <h3 className="text-xl font-bold text-slate-300 mb-6 flex items-center gap-4">
                                <span className="text-primary-900 font-black bg-primary-50 px-4 py-1 rounded-full border border-primary-200 text-sm tracking-wide shadow-sm">
                                    {collectionName} - PART {selectedPart}
                                </span>
                                <div className="h-px bg-slate-200 flex-1"></div>
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                                {lessons.map((lesson: any) => (
                                    <div
                                        key={lesson.id}
                                        onClick={() => onPracticeClick(`${lesson.topicSlug}?lessonId=${lesson.id}`)}
                                        className="group relative bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-slate-50 group-hover:to-slate-100 transition-colors pointer-events-none"></div>
                                        <div className="p-4 sm:p-5 flex-1 flex flex-col relative z-10">
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="w-10 h-10 rounded-lg bg-primary-900/10 group-hover:bg-primary-900/20 flex flex-shrink-0 items-center justify-center text-primary-900 transition-colors shadow-sm">
                                                    {getPartIcon(selectedPart)}
                                                </div>
                                                <h3 className="text-[17px] font-black text-primary-900 transition-colors">{lesson.title}</h3>
                                            </div>
                                            <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between gap-2 text-[13px] font-bold text-slate-400">
                                                <div className="flex items-center gap-1.5 text-primary-900 transition-colors">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                                                    {lesson._count?.questions || 0} Câu hỏi
                                                </div>
                                                {lesson.progress ? (
                                                   <div className="flex items-center gap-2">
                                                     <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full border border-primary-100">{lesson.progress.correct}/{lesson._count?.questions || 0} đúng</span>
                                                     <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center transition-colors duration-300 group-hover:bg-primary-900 group-hover:text-white" title="Làm lại">
                                                         <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                                     </div>
                                                   </div>
                                                ) : (
                                                   <div className="flex items-center gap-2">
                                                     <span className="text-[11px] font-bold text-slate-400">Chưa làm</span>
                                                     <div className="w-7 h-7 rounded-full bg-primary-900 text-white flex items-center justify-center transition-colors duration-300" title="Làm ngay">
                                                         <svg className="w-3.5 h-3.5 translate-x-px" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
                                                     </div>
                                                   </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
			</div>
		</div>
	);
}

function ToeicActualTestTab({ onPracticeClick }: { onPracticeClick: (route: string) => void }) {
	const router = useRouter();
	const [collections, setCollections] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchCollections = async () => {
			try {
				const res = await fetch('/api/toeic/actual-test');
				if (res.ok) {
					const data = await res.json();
					setCollections(data);
				}
			} catch (error) {
				console.error('Failed to fetch actual tests:', error);
			} finally {
				setLoading(false);
			}
		};
		fetchCollections();
	}, []);

	if (loading) {
		return <div className="py-12 text-center text-gray-500 italic">Đang tải bộ đề thi...</div>;
	}

	return (
		<div className="flex flex-col gap-10">
			{collections.map((col, cIdx) => (
				<div key={cIdx}>
					<h2 className="text-xl sm:text-[22px] font-black text-primary-900 mb-6 flex items-center gap-2.5 tracking-tight px-1">
						<span className="w-1.5 h-6 rounded-full bg-[#8B5CF6] block shadow-sm"></span>
						Bộ Đề {col.collection}
					</h2>
					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
						{col.tests.map((test: any) => {
                            const testParts = Array.from(new Set(test.parts.map((p: any) => Number(p.partId || p.part)))).sort((a: any, b: any) => a - b);
                            const DEFAULT_TIMES: Record<number, number> = { 1: 4, 2: 10, 3: 17, 4: 15, 5: 12, 6: 8, 7: 55 };
                            const computedTime = testParts.reduce((sum: number, p: any) => sum + (DEFAULT_TIMES[Number(p)] || 0), 0) || 120;
                            const partsParam = testParts.length > 0 ? testParts.join(',') : '1,2,3,4,5,6,7';
                            return (
							<div
								key={test.id}
								className="group relative bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer hover:border-primary-200"
                                onClick={() => router.push(`/toeic-practice/actual-test/${test.id}`)}
							>
                                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-primary-50/40 group-hover:to-primary-100/50 transition-colors pointer-events-none"></div>
                                <div className="p-4 sm:p-5 flex-1 flex flex-col relative z-10">
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="text-xl font-black text-[#4c1d95] transition-colors">{test.title}</h3>
                                        <div className="w-7 h-7 rounded-lg bg-primary-100/50 group-hover:bg-primary-100 flex items-center justify-center text-primary-700 transition-colors flex-shrink-0 group-hover:shadow-sm">
                                            <svg className="w-3.5 h-3.5 translate-x-px group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col gap-2 mb-4 flex-1">
                                        <div className="text-[12px] font-bold text-slate-500">Các phần thi có sẵn</div>
                                        <div className="flex gap-1.5">
                                            {[1, 2, 3, 4, 5, 6, 7].map((pNum) => {
                                                const isActive = testParts.includes(pNum);
                                                return (
                                                    <div 
                                                        key={pNum} 
                                                        className={`w-6 h-6 rounded flex items-center justify-center font-bold text-[11px] transition-colors ${isActive ? 'bg-primary-50 text-primary-600 border border-primary-200 shadow-sm' : 'bg-slate-50 text-slate-300 border border-slate-100'}`}
                                                    >
                                                        {pNum}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2.5 mt-auto pt-4 border-t border-slate-100">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); router.push(`/toeic-practice/actual-test/${test.id}`); }}
                                            className="flex-1 py-2.5 rounded-xl focus:outline-none border border-primary-200 bg-primary-50/50 text-primary-700 font-bold text-xs hover:bg-primary-100 hover:border-primary-300 transition-colors shadow-sm cursor-pointer"
                                        >
                                            Luyện tập
                                        </button>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); router.push(`/toeic-practice/actual-test/${test.id}/take?mode=actual&parts=${partsParam}&time=${computedTime}`); }}
                                            className="flex-1 py-2.5 rounded-xl focus:outline-none border border-slate-200 bg-white text-slate-600 font-bold text-xs hover:bg-slate-100 hover:border-slate-300 hover:text-slate-800 transition-colors cursor-pointer"
                                        >
                                            Thi thử
                                        </button>
                                    </div>
                                </div>
							</div>
						)})}
					</div>
				</div>
			))}
			
			{collections.length === 0 && (
				<div className="col-span-full py-16 text-center text-slate-400 border-2 border-dashed border-slate-200 bg-white/50 rounded-3xl font-medium">
					Chưa có bộ đề thi nào được tạo.
				</div>
			)}
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

