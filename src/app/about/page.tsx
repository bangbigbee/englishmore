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
    const imagesResult = await prisma.landingGalleryImage.findMany({
        where: { section: { startsWith: 'about_toeicmore_' } },
        orderBy: { createdAt: 'desc' }
    });
    
    // Sort logic to just get the newest per section
    const latestImages = imagesResult.reduce((acc, img) => {
        if (!acc[img.section]) acc[img.section] = img.id;
        return acc;
    }, {} as Record<string, string>);

    const avatarUrl = latestImages['about_toeicmore_avatar'] ? `/api/gallery/${latestImages['about_toeicmore_avatar']}` : '/avatar.jpg';
    const grid1Img = latestImages['about_toeicmore_grid1'] ? `/api/gallery/${latestImages['about_toeicmore_grid1']}` : null;
    const grid2Img = latestImages['about_toeicmore_grid2'] ? `/api/gallery/${latestImages['about_toeicmore_grid2']}` : null;
    const grid3Img = latestImages['about_toeicmore_grid3'] ? `/api/gallery/${latestImages['about_toeicmore_grid3']}` : null;
    const grid4Img = latestImages['about_toeicmore_grid4'] ? `/api/gallery/${latestImages['about_toeicmore_grid4']}` : null;

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
		<div className="min-h-screen bg-slate-50 relative overflow-hidden flex flex-col z-0">
			{/* Decorative Background Elements */}
			<div className="absolute top-0 inset-x-0 h-[450px] bg-gradient-to-b from-purple-900 via-[#581c87] to-slate-50 z-[-1]" />
			<div className="absolute top-20 right-0 w-96 h-96 bg-amber-500/10 blur-[100px] rounded-full z-[-1]" />
			<div className="absolute top-40 left-10 w-72 h-72 bg-purple-500/15 blur-[100px] rounded-full z-[-1]" />

			<div className="flex-1 w-full max-w-5xl mx-auto pt-8 sm:pt-16 pb-20 relative z-10 px-4 sm:px-6 lg:px-8">
				
                {/* Profile Banner */}
                <div className="flex flex-col md:flex-row items-center md:items-end gap-10 relative z-10 w-full mb-12 animate-in fade-in slide-in-from-bottom-5 duration-700">
                    {/* Left Avatar Card */}
                    <div className="relative shrink-0 w-64 h-64 sm:w-[320px] sm:h-[320px] rounded-3xl bg-white p-2 sm:p-2.5 shadow-2xl border border-white z-10 transition-transform group-hover:-translate-y-1">
                        <div className="w-full h-full rounded-[20px] overflow-hidden bg-slate-100 relative shadow-inner">
                            <img 
                                src={avatarUrl} 
                                alt="" 
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>

                    {/* Right Info Section */}
                    <div className="flex-1 text-center md:text-left md:pb-6">
                        <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-black text-white tracking-tight mb-4 drop-shadow-md">
                            {title}
                        </h1>
                        <p className="text-base sm:text-lg text-purple-50 font-medium leading-relaxed max-w-xl mb-8 drop-shadow-sm">
                            {description}
                        </p>
                        
                        {/* Contact Links */}
                        <div className="flex flex-wrap gap-4 justify-center md:justify-start items-center">
                            <a 
                                href={fbLink} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white text-white hover:text-[#1877F2] rounded-xl font-bold transition-all text-sm sm:text-base border border-white/20 backdrop-blur-sm"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M9.19795 21.5H13.198V13.4901H16.8021L17.198 9.50977H13.198V7.5C13.198 6.94772 13.6457 6.5 14.198 6.5H17.198V2.5H14.198C11.4365 2.5 9.19795 4.73858 9.19795 7.5V9.50977H7.19795L6.80206 13.4901H9.19795V21.5Z"/>
                                </svg>
                                {fbText}
                            </a>
                            
                            <a 
                                href={tiktokLink} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-black text-white rounded-xl font-bold transition-all text-sm sm:text-base border border-white/20 backdrop-blur-sm"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.12-3.44-3.17-3.64-5.38-.21-2.22.42-4.52 1.83-6.19 1.25-1.47 3.05-2.43 4.96-2.61V13c-.92.11-1.84.45-2.58 1.05-.85.67-1.36 1.73-1.35 2.82.01 1.48 1.15 2.76 2.62 2.92 1.45.14 2.89-.78 3.29-2.18.15-.55.15-1.12.15-1.68-.02-5.32-.01-10.63-.02-15.95Z"/>
                                </svg>
                                {tiktokText}
                            </a>
                            
                            <div className="flex items-center gap-2 px-5 py-2.5 bg-black/20 text-white rounded-xl font-bold text-sm sm:text-base border border-white/10 backdrop-blur-sm">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                                0915 091 093
                            </div>
                        </div>
                    </div>
                </div>

				{/* Main Card */}
				<main className="bg-white rounded-[40px] shadow-[0_30px_60px_-15px_rgba(88, 28, 135,0.08)] border border-slate-100 p-8 sm:p-12 md:p-16 relative isolate animate-in slide-in-from-bottom-10 fade-in duration-700">


					{/* Experience Highlights */}
					<h2 className="text-2xl font-black text-slate-800 tracking-tight mb-8 flex items-center gap-3">
						<span className="w-2 h-8 rounded-full bg-[#581c87] block shadow-sm" />
						Hành Trình & Kinh Nghiệm
					</h2>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
						{/* Item 1 */}
						<div className="group bg-[#f4faef] hover:bg-[#eaf5e1] rounded-[24px] overflow-hidden transition-colors border-2 border-white shadow-sm hover:shadow-md flex flex-col">
							<div className="p-6 sm:p-7 pb-4 flex items-center gap-4">
								<div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0 text-[#581c87] border-2 border-[#581c87]/20 group-hover:scale-110 transition-transform duration-500">
									<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
								</div>
								<h3 className="text-xl font-bold text-slate-800 leading-tight">{grid1Title}</h3>
							</div>
							
							{grid1Img && (
								<a href={grid1Img} target="_blank" rel="noopener noreferrer" className="w-full aspect-[16/9] border-y border-black/5 bg-white overflow-hidden relative cursor-pointer group-hover:block">
									<img src={grid1Img} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
									<div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center pointer-events-none">
										<svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 drop-shadow-md transition-opacity duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
									</div>
								</a>
							)}
							
							<div className="p-6 sm:p-7 pt-5 flex-1">
                                <p className="text-slate-600 leading-relaxed text-[14.5px] whitespace-pre-wrap">
                                    {grid1Desc}
                                </p>
                            </div>
						</div>

						{/* Item 2 */}
						<div className="group bg-[#f4faef] hover:bg-[#eaf5e1] rounded-[24px] overflow-hidden transition-colors border-2 border-white shadow-sm hover:shadow-md flex flex-col">
							<div className="p-6 sm:p-7 pb-4 flex items-center gap-4">
								<div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0 text-[#581c87] border-2 border-[#581c87]/20 group-hover:scale-110 transition-transform duration-500">
									<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>
								</div>
								<h3 className="text-xl font-bold text-slate-800 leading-tight">{grid2Title}</h3>
							</div>
							
							{grid2Img && (
								<a href={grid2Img} target="_blank" rel="noopener noreferrer" className="w-full aspect-[16/9] border-y border-black/5 bg-white overflow-hidden relative cursor-pointer group-hover:block">
									<img src={grid2Img} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
									<div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center pointer-events-none">
										<svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 drop-shadow-md transition-opacity duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
									</div>
								</a>
							)}
							
							<div className="p-6 sm:p-7 pt-5 flex-1">
                                <p className="text-slate-600 leading-relaxed text-[14.5px] whitespace-pre-wrap">
                                    {grid2Desc}
                                </p>
                            </div>
						</div>

						{/* Item 3 */}
						<div className="group bg-[#f4faef] hover:bg-[#eaf5e1] rounded-[24px] overflow-hidden transition-colors border-2 border-white shadow-sm hover:shadow-md flex flex-col">
							<div className="p-6 sm:p-7 pb-4 flex items-center gap-4">
								<div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0 text-[#581c87] border-2 border-[#581c87]/20 group-hover:scale-110 transition-transform duration-500">
									<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
								</div>
								<h3 className="text-xl font-bold text-slate-800 leading-tight">{grid3Title}</h3>
							</div>
							
							{grid3Img && (
								<a href={grid3Img} target="_blank" rel="noopener noreferrer" className="w-full aspect-[16/9] border-y border-black/5 bg-white overflow-hidden relative cursor-pointer group-hover:block">
									<img src={grid3Img} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
									<div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center pointer-events-none">
										<svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 drop-shadow-md transition-opacity duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
									</div>
								</a>
							)}
							
							<div className="p-6 sm:p-7 pt-5 flex-1">
                                <p className="text-slate-600 leading-relaxed text-[14.5px] whitespace-pre-wrap">
                                    {grid3Desc}
                                </p>
                            </div>
						</div>

						{/* Item 4 */}
						<div className="group bg-[#f4faef] hover:bg-[#eaf5e1] rounded-[24px] overflow-hidden transition-colors border-2 border-white shadow-sm hover:shadow-md flex flex-col">
							<div className="p-6 sm:p-7 pb-4 flex items-center gap-4">
								<div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0 text-[#581c87] border-2 border-[#581c87]/20 group-hover:scale-110 transition-transform duration-500">
									<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
								</div>
								<h3 className="text-xl font-bold text-slate-800 leading-tight">{grid4Title}</h3>
							</div>
							
							{grid4Img && (
								<a href={grid4Img} target="_blank" rel="noopener noreferrer" className="w-full aspect-[16/9] border-y border-black/5 bg-white overflow-hidden relative cursor-pointer group-hover:block">
									<img src={grid4Img} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
									<div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center pointer-events-none">
										<svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 drop-shadow-md transition-opacity duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
									</div>
								</a>
							)}
							
							<div className="p-6 sm:p-7 pt-5 flex-1">
                                <p className="text-slate-600 leading-relaxed text-[14.5px] whitespace-pre-wrap">
                                    {grid4Desc}
                                </p>
                            </div>
						</div>
					</div>

				</main>
			</div>
		</div>
	);
}
