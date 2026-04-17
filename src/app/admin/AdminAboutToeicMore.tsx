'use client';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export default function AdminAboutToeicMore() {
    const [title, setTitle] = useState('Thầy Nguyễn Trí Bằng');
    const [subtitle, setSubtitle] = useState('Giám đốc Sáng lập');
    const [description, setDescription] = useState('"Gắn liền giáo dục với trải nghiệm thực tiễn và công nghệ lõi. Hướng đến tạo ra những giá trị đích thực và vượt trội cho hàng triệu học viên tại Việt Nam."');
    
    const [grid1Title, setGrid1Title] = useState('7 Năm Công Tác ĐH Bách Khoa');
    const [grid1Desc, setGrid1Desc] = useState('Tại Đại học Bách Khoa - ĐH Đà Nẵng trong lĩnh vực khoa học kỹ thuật, làm việc trực tiếp với 03 chương trình đào tạo quốc tế (gồm 02 chương trình tiên tiến Việt - Mỹ, và chương trình Kỹ sư Chất lượng Cao Việt Pháp).');
    const [grid2Title, setGrid2Title] = useState('5 Năm Dạy Tiếng Anh');
    const [grid2Desc, setGrid2Desc] = useState('Hơn nửa thập kỷ gắn bó với bục giảng Tiếng Anh, giúp đỡ và dẫn dắt hàng nghìn học viên vượt qua các rào cản ngoại ngữ, chinh phục các chứng chỉ quốc tế và hoàn thiện kỹ năng giao tiếp thực chiến.');
    const [grid3Title, setGrid3Title] = useState('2 Năm Công Nghệ Blockchain');
    const [grid3Desc, setGrid3Desc] = useState('Xông pha và tích luỹ 2 năm kinh nghiệm chinh chiến trong lĩnh vực công nghệ Blockchain - xu hướng công nghệ tiên phong toàn cầu ở thời điểm hiện tại.');
    const [grid4Title, setGrid4Title] = useState('Môi Trường Quốc Tế Đa Chiều');
    const [grid4Desc, setGrid4Desc] = useState('Nhiều năm làm việc và cọ xát trong môi trường chuẩn quốc tế. Tham gia các hội nghị, sự kiện quy mô lớn tại các quốc gia như Singapore, Hàn Quốc... mang đến góc nhìn sâu sắc và kinh nghiệm quý báu cho thế hệ sau.');

    const [fbLink, setFbLink] = useState('https://www.facebook.com/bangbigbee');
    const [fbText, setFbText] = useState('Facebook Nền Tảng');
    const [tiktokLink, setTiktokLink] = useState('https://www.tiktok.com/@bangbigbee');
    const [tiktokText, setTiktokText] = useState('TikTok Giao Tiếp Cơ Bản');

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/settings/about')
            .then(res => res.json())
            .then(data => {
                if (data.title) setTitle(data.title);
                if (data.subtitle) setSubtitle(data.subtitle);
                if (data.description) setDescription(data.description);
                if (data.grid1Title) setGrid1Title(data.grid1Title);
                if (data.grid1Desc) setGrid1Desc(data.grid1Desc);
                if (data.grid2Title) setGrid2Title(data.grid2Title);
                if (data.grid2Desc) setGrid2Desc(data.grid2Desc);
                if (data.grid3Title) setGrid3Title(data.grid3Title);
                if (data.grid3Desc) setGrid3Desc(data.grid3Desc);
                if (data.grid4Title) setGrid4Title(data.grid4Title);
                if (data.grid4Desc) setGrid4Desc(data.grid4Desc);
                if (data.fbLink) setFbLink(data.fbLink);
                if (data.fbText) setFbText(data.fbText);
                if (data.tiktokLink) setTiktokLink(data.tiktokLink);
                if (data.tiktokText) setTiktokText(data.tiktokText);
            })
            .finally(() => setIsLoading(false));
    }, []);

    const handleSave = async () => {
        const loading = toast.loading('Đang lưu...');
        try {
            const res = await fetch('/api/admin/settings/about', {
                method: 'POST',
                body: JSON.stringify({ 
                    title, subtitle, description,
                    grid1Title, grid1Desc,
                    grid2Title, grid2Desc,
                    grid3Title, grid3Desc,
                    grid4Title, grid4Desc,
                    fbLink, fbText,
                    tiktokLink, tiktokText
                })
            });
            if (res.ok) {
                toast.success('Lưu thành công!', { id: loading });
            } else {
                toast.error('Có lỗi xảy ra', { id: loading });
            }
        } catch (error) {
            toast.error('Lỗi kết nối', { id: loading });
        }
    };

    if (isLoading) return <div className="p-8">Đang tải...</div>;

    return (
        <div className="p-6 md:p-8 max-w-4xl mx-auto animate-in fade-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-8">
				<div>
					<h2 className="text-3xl font-black text-slate-800 tracking-tight">Về ToeicMore</h2>
					<p className="text-slate-500 font-medium mt-1">Cấu hình thông tin giới thiệu Profile tại About ToeicMore</p>
				</div>
			</div>
            
            <div className="space-y-6 bg-white p-6 rounded-2xl shadow-[0_15px_40px_-15px_rgba(0,0,0,0.05)] border border-slate-200">
                <div>
                    <label className="block text-sm font-bold mb-2 text-slate-700">Tên Founder</label>
                    <input 
                        type="text" 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)} 
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:border-[#ea980c] focus:ring-1 focus:ring-[#ea980c] transition-all"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold mb-2 text-slate-700">Chức danh</label>
                    <input 
                        type="text" 
                        value={subtitle} 
                        onChange={(e) => setSubtitle(e.target.value)} 
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:border-[#ea980c] focus:ring-1 focus:ring-[#ea980c] transition-all"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold mb-2 text-slate-700">Đoạn trích (Quote giới thiệu)</label>
                    <textarea 
                        rows={4}
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)} 
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:border-[#ea980c] focus:ring-1 focus:ring-[#ea980c] transition-all"
                    />
                </div>

                <div className="pt-8 pb-4">
                    <h3 className="text-xl font-bold text-slate-800 border-b border-slate-200 pb-2">Hành Trình & Kinh Nghiệm</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Item 1 */}
                    <div className="p-4 bg-slate-50 rounded-xl space-y-4 border border-slate-200">
                        <label className="block text-sm font-bold text-slate-700">Khối 1: Tiêu đề</label>
                        <input type="text" value={grid1Title} onChange={(e) => setGrid1Title(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-[#ea980c]"/>
                        <label className="block text-sm font-bold text-slate-700">Khối 1: Nội dung</label>
                        <textarea rows={4} value={grid1Desc} onChange={(e) => setGrid1Desc(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-[#ea980c]"/>
                    </div>
                    {/* Item 2 */}
					<div className="p-4 bg-slate-50 rounded-xl space-y-4 border border-slate-200">
                        <label className="block text-sm font-bold text-slate-700">Khối 2: Tiêu đề</label>
                        <input type="text" value={grid2Title} onChange={(e) => setGrid2Title(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-[#ea980c]"/>
                        <label className="block text-sm font-bold text-slate-700">Khối 2: Nội dung</label>
                        <textarea rows={4} value={grid2Desc} onChange={(e) => setGrid2Desc(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-[#ea980c]"/>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Item 3 */}
					<div className="p-4 bg-slate-50 rounded-xl space-y-4 border border-slate-200">
                        <label className="block text-sm font-bold text-slate-700">Khối 3: Tiêu đề</label>
                        <input type="text" value={grid3Title} onChange={(e) => setGrid3Title(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-[#ea980c]"/>
                        <label className="block text-sm font-bold text-slate-700">Khối 3: Nội dung</label>
                        <textarea rows={4} value={grid3Desc} onChange={(e) => setGrid3Desc(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-[#ea980c]"/>
                    </div>
                    {/* Item 4 */}
					<div className="p-4 bg-slate-50 rounded-xl space-y-4 border border-slate-200">
                        <label className="block text-sm font-bold text-slate-700">Khối 4: Tiêu đề</label>
                        <input type="text" value={grid4Title} onChange={(e) => setGrid4Title(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-[#ea980c]"/>
                        <label className="block text-sm font-bold text-slate-700">Khối 4: Nội dung</label>
                        <textarea rows={4} value={grid4Desc} onChange={(e) => setGrid4Desc(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-[#ea980c]"/>
                    </div>
                </div>

                <div className="pt-8 pb-4">
                    <h3 className="text-xl font-bold text-slate-800 border-b border-slate-200 pb-2">Liên Hệ</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-slate-50 rounded-xl space-y-4 border border-slate-200">
                        <label className="block text-sm font-bold text-slate-700">Facebook: Text hiển thị</label>
                        <input type="text" value={fbText} onChange={(e) => setFbText(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-[#ea980c]"/>
                        <label className="block text-sm font-bold text-slate-700">Facebook: Đường dẫn (Link)</label>
                        <input type="text" value={fbLink} onChange={(e) => setFbLink(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-[#ea980c]"/>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl space-y-4 border border-slate-200">
                        <label className="block text-sm font-bold text-slate-700">TikTok: Text hiển thị</label>
                        <input type="text" value={tiktokText} onChange={(e) => setTiktokText(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-[#ea980c]"/>
                        <label className="block text-sm font-bold text-slate-700">TikTok: Đường dẫn (Link)</label>
                        <input type="text" value={tiktokLink} onChange={(e) => setTiktokLink(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-[#ea980c]"/>
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <button onClick={handleSave} className="bg-[#ea980c] hover:bg-amber-600 shadow-lg shadow-amber-500/20 text-white px-8 py-3 rounded-xl font-black transition-all">
                        Lưu Cấu Hình
                    </button>
                </div>
            </div>
        </div>
    );
}
