'use client';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export default function AdminAboutToeicMore() {
    const [title, setTitle] = useState('Thầy Nguyễn Trí Bằng');
    const [subtitle, setSubtitle] = useState('Giám đốc Sáng lập');
    const [description, setDescription] = useState('"Gắn liền giáo dục với trải nghiệm thực tiễn và công nghệ lõi. Hướng đến tạo ra những giá trị đích thực và vượt trội cho hàng triệu học viên tại Việt Nam."');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/settings/about')
            .then(res => res.json())
            .then(data => {
                if (data.title) setTitle(data.title);
                if (data.subtitle) setSubtitle(data.subtitle);
                if (data.description) setDescription(data.description);
            })
            .finally(() => setIsLoading(false));
    }, []);

    const handleSave = async () => {
        const loading = toast.loading('Đang lưu...');
        try {
            const res = await fetch('/api/admin/settings/about', {
                method: 'POST',
                body: JSON.stringify({ title, subtitle, description })
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

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <button onClick={handleSave} className="bg-[#ea980c] hover:bg-amber-600 shadow-lg shadow-amber-500/20 text-white px-8 py-3 rounded-xl font-black transition-all">
                        Lưu Cấu Hình
                    </button>
                </div>
            </div>
        </div>
    );
}
