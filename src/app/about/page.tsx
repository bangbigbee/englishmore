import Link from "next/link";
import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';

export const revalidate = 0;

export const metadata: Metadata = {
	title: 'Về ToeicMore & Founder | Nền tảng luyện TOEIC số 1',
	description: 'Tìm hiểu về Thầy Nguyễn Trí Bằng - Founder ToeicMore với 7 năm công tác tại ĐH Bách Khoa, 5 năm dạy Tiếng Anh và nhiều năm hoạt động tại môi trường quốc tế.',
};

export default async function AboutPage() {
    const setting = await prisma.systemSetting.findUnique({
        where: { key: 'about_page' }
    });
    const aboutData = setting?.value as { 
        title?: string; subtitle?: string; description?: string;
        grid1Title?: string; grid1Desc?: string;
        grid2Title?: string; grid2Desc?: string;
        grid3Title?: string; grid3Desc?: string;
        grid4Title?: string; grid4Desc?: string;
        fbLink?: string; fbText?: string;
        tiktokLink?: string; tiktokText?: string;
    } | undefined;
    
    const title = aboutData?.title || "Thầy Nguyễn Trí Bằng";
    const subtitle = aboutData?.subtitle || "Giám đốc Sáng lập";
    const description = aboutData?.description || `"Gắn liền giáo dục với trải nghiệm thực tiễn và công nghệ lõi. Hướng đến tạo ra những giá trị đích thực và vượt trội cho hàng triệu học viên tại Việt Nam."`;
    const grid1Title = aboutData?.grid1Title || "7 Năm Công Tác ĐH Bách Khoa";
    const grid1Desc = aboutData?.grid1Desc || "Tại Đại học Bách Khoa - ĐH Đà Nẵng trong lĩnh vực khoa học kỹ thuật, làm việc trực tiếp với 03 chương trình đào tạo quốc tế (gồm 02 chương trình tiên tiến Việt - Mỹ, và chương trình Kỹ sư Chất lượng Cao Việt Pháp).";
    const grid2Title = aboutData?.grid2Title || "5 Năm Dạy Tiếng Anh";
    const grid2Desc = aboutData?.grid2Desc || "Hơn nửa thập kỷ gắn bó với bục giảng Tiếng Anh, giúp đỡ và dẫn dắt hàng nghìn học viên vượt qua các rào cản ngoại ngữ, chinh phục các chứng chỉ quốc tế và hoàn thiện kỹ năng giao tiếp thực chiến.";
    const grid3Title = aboutData?.grid3Title || "2 Năm Công Nghệ Blockchain";
    const grid3Desc = aboutData?.grid3Desc || "Xông pha và tích luỹ 2 năm kinh nghiệm chinh chiến trong lĩnh vực công nghệ Blockchain - xu hướng công nghệ tiên phong toàn cầu ở thời điểm hiện tại.";
    const grid4Title = aboutData?.grid4Title || "Môi Trường Quốc Tế Đa Chiều";
    const grid4Desc = aboutData?.grid4Desc || "Nhiều năm làm việc và cọ xát trong môi trường chuẩn quốc tế. Tham gia các hội nghị, sự kiện quy mô lớn tại các quốc gia như Singapore, Hàn Quốc... mang đến góc nhìn sâu sắc và kinh nghiệm quý báu cho thế hệ sau.";

    const fbLink = aboutData?.fbLink || "https://www.facebook.com/bangbigbee";
    const fbText = aboutData?.fbText || "Facebook Nền Tảng";
    const tiktokLink = aboutData?.tiktokLink || "https://www.tiktok.com/@bangbigbee";
    const tiktokText = aboutData?.tiktokText || "TikTok Giao Tiếp Cơ Bản";

	return (
		<div className="min-h-screen bg-[#FAFAFA] flex flex-col py-12 sm:py-20 px-4 sm:px-6 lg:px-8 relative selection:bg-emerald-100 selection:text-emerald-900 font-sans overflow-hidden">
			
            {/* Extremely subtle ambient background */}
            <div className="fixed top-0 left-0 w-full h-[600px] bg-gradient-to-b from-slate-100 to-transparent pointer-events-none z-0" />
            <div className="fixed top-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none z-0" />
            <div className="fixed bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-slate-200/40 blur-[100px] pointer-events-none z-0" />

			<div className="max-w-4xl mx-auto w-full relative z-10">
				
				{/* Top Link */}
				<div className="mb-12">
                    <Link href="/" className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-emerald-700 transition-colors group">
                        <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center mr-3 shadow-sm border border-slate-100 group-hover:border-emerald-200 transition-colors">
                            <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                            </svg>
                        </span>
                        Trở về Trang Chủ
                    </Link>
                </div>

				{/* Main Profile Card */}
				<div className="bg-white rounded-[2.5rem] p-8 sm:p-12 md:p-16 shadow-[0_8px_40px_rgb(0,0,0,0.03)] border border-slate-100/80 mb-12 animate-in slide-in-from-bottom-8 fade-in duration-700 hover:shadow-[0_8px_50px_rgb(0,0,0,0.05)] transition-shadow">
					
					<div className="flex flex-col md:flex-row gap-10 md:gap-16 items-center md:items-start text-center md:text-left">
						{/* Avatar Frame Container */}
						<div className="relative shrink-0 group perspective-1000">
                            {/* Subtle halo effect */}
                            <div className="absolute inset-0 bg-emerald-100 rounded-full blur-2xl scale-110 opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
                            
							<div className="w-36 h-36 sm:w-48 sm:h-48 rounded-full border-[6px] border-white shadow-[0_8px_30px_rgb(0,0,0,0.08)] overflow-hidden bg-slate-50 relative z-10 transition-transform duration-500 group-hover:scale-[1.03] group-hover:-rotate-2">
								{/* Placeholder */}
								<div className="absolute inset-0 flex items-center justify-center text-5xl font-bold text-slate-300 opacity-50">
									B
								</div>
								{/* User's Avatar */}
								<img 
									src="/avatar.jpg" 
									alt="" 
									className="w-full h-full object-cover relative z-20"
								/>
							</div>
							
                            {/* Founder Badge */}
							<div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-slate-900 border-[3px] border-white shadow-lg text-emerald-300 font-bold text-[10px] sm:text-[11px] tracking-[0.2em] uppercase px-6 py-2 rounded-full z-30 whitespace-nowrap transition-transform duration-500 group-hover:-translate-y-1">
								{subtitle}
							</div>
						</div>

						{/* Short Bio Block */}
						<div className="flex-1 mt-4 md:mt-0 md:pt-2">
							<h1 className="text-3xl sm:text-4xl text-slate-800 tracking-tight font-extrabold mb-5">
                                {title}
                            </h1>
                            <div className="w-12 h-1.5 bg-emerald-500/80 rounded-full mb-6 mx-auto md:mx-0"></div>
							<p className="text-slate-600 text-[16px] sm:text-[18px] leading-[1.8] italic font-light">
								{description}
							</p>

                            {/* Contact Links */}
                            <div className="flex flex-wrap gap-3 sm:gap-4 justify-center md:justify-start mt-10">
                                <a 
                                    href={fbLink} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="flex items-center gap-2.5 px-6 py-3 bg-slate-900 text-white rounded-full font-medium hover:bg-slate-800 transition-all active:scale-95 shadow-md shadow-slate-900/10 text-sm border border-slate-900 hover:shadow-lg"
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2.03998C6.5 2.03998 2 6.52998 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.84998C10.44 7.33998 11.93 5.95998 14.22 5.95998C15.31 5.95998 16.45 6.14998 16.45 6.14998V8.61998H15.19C13.95 8.61998 13.56 9.38998 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96C18.34 21.21 22 17.06 22 12.06C22 6.52998 17.5 2.03998 12 2.03998Z" />
                                    </svg>
                                    {fbText}
                                </a>
                                
                                <a 
                                    href={tiktokLink} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="flex items-center gap-2.5 px-6 py-3 bg-white text-slate-700 hover:text-slate-900 rounded-full font-medium transition-all active:scale-95 shadow-sm border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-sm"
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.12-3.44-3.17-3.64-5.38-.21-2.22.42-4.52 1.83-6.19 1.25-1.47 3.05-2.43 4.96-2.61V13c-.92.11-1.84.45-2.58 1.05-.85.67-1.36 1.73-1.35 2.82.01 1.48 1.15 2.76 2.62 2.92 1.45.14 2.89-.78 3.29-2.18.15-.55.15-1.12.15-1.68-.02-5.32-.01-10.63-.02-15.95Z"/>
                                    </svg>
                                    {tiktokText}
                                </a>
                            </div>
						</div>
					</div>
				</div>

				{/* Experience Highlights */}
                <div className="flex items-center gap-6 mb-10 mt-20 px-2 sm:px-4 md:px-0">
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight shrink-0 uppercase text-[15px] sm:text-[18px] tracking-[0.1em]">
                        Hành Trình & Kinh Nghiệm
                    </h2>
                    <div className="flex-1 h-px bg-slate-200" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 animate-in slide-in-from-bottom-12 fade-in duration-1000">
                    {[
                        { 
                            title: grid1Title, 
                            desc: grid1Desc, 
                            icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /> 
                        },
                        { 
                            title: grid2Title, 
                            desc: grid2Desc, 
                            icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /> 
                        },
                        { 
                            title: grid3Title, 
                            desc: grid3Desc, 
                            icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /> 
                        },
                        { 
                            title: grid4Title, 
                            desc: grid4Desc, 
                            icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /> 
                        }
                    ].map((item, idx) => (
                        <div key={idx} className="group bg-white rounded-[2rem] p-8 sm:p-10 transition-all duration-300 border border-slate-100/80 hover:border-emerald-100 hover:shadow-[0_8px_40px_rgb(0,0,0,0.04)] relative overflow-hidden">
                            {/* Decorative subtle background icon */}
                            <div className="absolute -right-6 -bottom-6 text-slate-50 opacity-40 group-hover:text-emerald-50 transition-colors duration-700 pointer-events-none transform group-hover:scale-110 group-hover:-rotate-12">
                                <svg className="w-48 h-48" fill="none" stroke="currentColor" viewBox="0 0 24 24">{item.icon}</svg>
                            </div>
                            
                            <div className="relative z-10">
                                <div className="w-14 h-14 rounded-[1.25rem] bg-slate-50 text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 flex items-center justify-center mb-6 transition-all duration-300 border border-slate-100 group-hover:border-emerald-100/50 group-hover:shadow-[0_4px_12px_rgba(16,185,129,0.1)]">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">{item.icon}</svg>
                                </div>
                                <h3 className="text-[19px] font-bold text-slate-800 mb-4 group-hover:text-emerald-900 transition-colors">
                                    {item.title}
                                </h3>
                                <p className="text-slate-500 leading-[1.7] text-[15px] whitespace-pre-wrap font-light mix-blend-multiply">
                                    {item.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

			</div>
		</div>
	);
}
