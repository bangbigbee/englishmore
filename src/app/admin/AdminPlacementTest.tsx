'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import AdminPlacementTestConfig from './AdminPlacementTestConfig';

export default function AdminPlacementTest() {
    const [sets, setSets] = useState<any[]>([]);
    const [selectedSet, setSelectedSet] = useState<any | null>(null);
    const [questions, setQuestions] = useState<any[]>([]);
    
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<any>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const fetchSets = async () => {
        try {
            const res = await fetch('/api/admin/placement-test/sets');
            if (res.ok) {
                const data = await res.json();
                setSets(data);
                if (!selectedSet && data.length > 0) {
                    handleSelectSet(data[0]);
                } else if (selectedSet) {
                    const updatedSelected = data.find((s: any) => s.id === selectedSet.id);
                    if (updatedSelected) setSelectedSet(updatedSelected);
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchQuestions = async (setId: string) => {
        try {
            const res = await fetch(`/api/admin/placement-test?setId=${setId}`);
            if (res.ok) {
                const data = await res.json();
                setQuestions(data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchSets();
    }, []);

    const handleSelectSet = (s: any) => {
        setSelectedSet(s);
        setEditingId(null);
        fetchQuestions(s.id);
    };

    const handleCreateSet = async () => {
        const title = prompt('Nhập tên Bộ Đề mới (VD: Đề T4/2026):');
        if (!title) return;
        try {
            const res = await fetch('/api/admin/placement-test/sets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, description: '' })
            });
            if (res.ok) {
                toast.success('Tạo bộ đề thành công');
                fetchSets();
            }
        } catch (error) {
            toast.error('Lỗi khi tạo bộ đề');
        }
    };

    const handleToggleActiveSet = async (setId: string, currentActive: boolean) => {
        try {
            const res = await fetch('/api/admin/placement-test/sets', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: setId, isActive: !currentActive })
            });
            if (res.ok) {
                toast.success(currentActive ? 'Đã tắt bộ đề' : 'Đã kích hoạt bộ đề');
                fetchSets();
            }
        } catch (error) {
            toast.error('Lỗi cập nhật');
        }
    };

    const handleDeleteSet = async (setId: string) => {
        if (!confirm('Xóa bộ đề này sẽ xóa toàn bộ câu hỏi bên trong. Bạn chắc chắn?')) return;
        try {
            const res = await fetch(`/api/admin/placement-test/sets?id=${setId}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success('Đã xóa bộ đề');
                if (selectedSet?.id === setId) setSelectedSet(null);
                fetchSets();
            }
        } catch (error) {
            toast.error('Lỗi xóa bộ đề');
        }
    };

    const handleDocxUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !selectedSet) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('setId', selectedSet.id);

        try {
            const res = await fetch('/api/admin/placement-test/import', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (data.success) {
                toast.success(`Đã import thành công ${data.count} câu hỏi`);
                fetchQuestions(selectedSet.id);
                fetchSets(); // update question count
            } else {
                toast.error(data.error || 'Lỗi import file DOCX');
            }
        } catch (error) {
            toast.error('Lỗi kết nối khi import');
        } finally {
            setIsUploading(false);
            if (e.target) e.target.value = '';
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsSubmitting(true);
        const toastId = toast.loading('Đang tải ảnh lên...');
        
        try {
            // Get presigned URL
            const presignedRes = await fetch('/api/admin/upload/presigned', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filename: file.name, contentType: file.type })
            });
            const presignedData = await presignedRes.json();
            
            if (!presignedData.success) throw new Error(presignedData.error);

            // Upload directly to R2
            const uploadRes = await fetch(presignedData.uploadUrl, {
                method: 'PUT',
                body: file,
                headers: { 'Content-Type': file.type }
            });

            if (!uploadRes.ok) throw new Error('Failed to upload to storage');

            // Update form data
            setFormData({ ...formData, imageUrl: presignedData.publicUrl });
            toast.success('Đã tải ảnh lên thành công!', { id: toastId });
        } catch (error) {
            toast.error('Lỗi khi tải ảnh lên', { id: toastId });
        } finally {
            setIsSubmitting(false);
            if (e.target) e.target.value = '';
        }
    };

    const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsSubmitting(true);
        const toastId = toast.loading('Đang tải âm thanh lên...');
        
        try {
            // Get presigned URL
            const presignedRes = await fetch('/api/admin/upload/presigned', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filename: file.name, contentType: file.type })
            });
            const presignedData = await presignedRes.json();
            
            if (!presignedData.success) throw new Error(presignedData.error);

            // Upload directly to R2
            const uploadRes = await fetch(presignedData.uploadUrl, {
                method: 'PUT',
                body: file,
                headers: { 'Content-Type': file.type }
            });

            if (!uploadRes.ok) throw new Error('Failed to upload to storage');

            // Update form data
            setFormData({ ...formData, audioUrl: presignedData.publicUrl });
            toast.success('Đã tải âm thanh lên thành công!', { id: toastId });
        } catch (error) {
            toast.error('Lỗi khi tải âm thanh lên', { id: toastId });
        } finally {
            setIsSubmitting(false);
            if (e.target) e.target.value = '';
        }
    };

    const handleEdit = (q: any) => {
        setEditingId(q.id);
        setFormData(q);
    };

    const handleCancel = () => {
        setEditingId(null);
        setFormData({});
    };

    const handleAddNew = () => {
        if (!selectedSet) return toast.error('Vui lòng chọn hoặc tạo 1 Bộ Đề trước');
        setEditingId('new');
        setFormData({
            setId: selectedSet.id,
            order: questions.length + 1,
            category: 'Grammar',
            question: '',
            optionA: '',
            optionB: '',
            optionC: '',
            optionD: '',
            correctOption: 'A',
            audioUrl: '',
            imageUrl: '',
            passage: ''
        });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const url = '/api/admin/placement-test';
            const method = editingId === 'new' ? 'POST' : 'PUT';
            
            const payload = { ...formData };
            if (method === 'PUT') payload.id = editingId;
            
            payload.order = parseInt(payload.order) || 0;
            // No parseInt for category as it is a string

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                toast.success('Lưu câu hỏi thành công!');
                setEditingId(null);
                fetchQuestions(selectedSet.id);
                fetchSets();
            } else {
                toast.error('Lưu thất bại');
            }
        } catch (error) {
            toast.error('Lỗi lưu câu hỏi');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Xóa câu hỏi này?')) return;
        try {
            const res = await fetch(`/api/admin/placement-test?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success('Đã xóa');
                fetchQuestions(selectedSet.id);
                fetchSets();
            } else {
                toast.error('Xóa thất bại');
            }
        } catch (error) {
            toast.error('Lỗi xóa câu hỏi');
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500 font-bold">Đang tải...</div>;

    return (
        <div className="flex flex-col gap-6">
            <AdminPlacementTestConfig />
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Sidebar Sets */}
                <div className="w-full lg:w-1/3 bg-white rounded-xl shadow border border-slate-200 overflow-hidden flex flex-col">
                <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                    <h2 className="font-black text-slate-800">Kho Bộ Đề</h2>
                    <button onClick={handleCreateSet} className="text-purple-600 font-bold text-sm hover:text-purple-700 bg-purple-50 px-3 py-1 rounded">
                        + Tạo Bộ Mới
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto max-h-[800px] p-4 space-y-3">
                    {sets.map(s => (
                        <div 
                            key={s.id} 
                            className={`p-4 rounded-xl border-2 transition-all cursor-pointer relative group ${selectedSet?.id === s.id ? 'border-purple-500 bg-purple-50' : 'border-slate-100 hover:border-purple-200'}`}
                            onClick={() => handleSelectSet(s)}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-slate-800">{s.title}</h3>
                                {s.isActive && <span className="bg-green-100 text-green-700 text-[10px] font-black px-2 py-0.5 rounded-full">ACTIVE</span>}
                            </div>
                            <p className="text-xs text-slate-500 mb-3">{s._count?.questions || 0} câu hỏi</p>
                            
                            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-200/50">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleToggleActiveSet(s.id, s.isActive); }}
                                        className={`text-[11px] font-bold flex-1 text-left ${s.isActive ? 'text-rose-500 hover:text-rose-700' : 'text-slate-500 hover:text-green-600'}`}
                                    >
                                        {s.isActive ? 'Tắt bộ đề' : 'Bật bộ đề'}
                                    </button>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleDeleteSet(s.id); }}
                                    className="text-[11px] font-bold text-rose-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity ml-auto"
                                >
                                    Xóa
                                </button>
                            </div>
                        </div>
                    ))}
                    {sets.length === 0 && (
                        <div className="text-center text-slate-400 text-sm py-10">Chưa có bộ đề nào.</div>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="w-full lg:w-2/3 bg-white rounded-xl shadow border border-slate-200 overflow-hidden">
                {!selectedSet ? (
                    <div className="p-10 text-center text-slate-500">
                        Vui lòng chọn hoặc tạo một bộ đề để xem và chỉnh sửa câu hỏi.
                    </div>
                ) : (
                    <>
                        <div className="p-6 border-b border-slate-200 bg-slate-50">
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <h2 className="text-xl font-black text-slate-800">{selectedSet.title}</h2>
                                    <p className="text-sm text-slate-500">Quản lý câu hỏi (Gợi ý: 10 câu cho test 3 phút)</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button 
                                        onClick={async () => {
                                            if (!confirm('Bạn có chắc chắn muốn xóa tất cả câu hỏi trong bộ đề này? Hành động này không thể hoàn tác!')) return;
                                            try {
                                                const res = await fetch(`/api/admin/placement-test?setId=${selectedSet.id}`, { method: 'DELETE' });
                                                if (res.ok) {
                                                    toast.success('Đã xóa tất cả câu hỏi');
                                                    fetchQuestions(selectedSet.id);
                                                    fetchSets();
                                                } else {
                                                    toast.error('Lỗi khi xóa');
                                                }
                                            } catch (error) {
                                                toast.error('Lỗi kết nối');
                                            }
                                        }}
                                        className="px-3 py-2 bg-rose-100 text-rose-600 font-bold rounded-lg hover:bg-rose-200 transition-colors text-sm"
                                    >
                                        Xóa trắng
                                    </button>
                                    <button 
                                        onClick={() => {
                                            alert("HƯỚNG DẪN FORMAT FILE DOCX:\n\n" +
                                                "Sử dụng thẻ [Category] để phân loại Kỹ năng và Cấp độ. Ví dụ:\n" +
                                                "[Listening - Beginner] (Cho các câu nghe tiêu chuẩn)\n" +
                                                "[Listening - Beginner - Pronunciation] (Âm vị học)\n" +
                                                "[Reading - Intermediate - Grammar]\n" +
                                                "[Reading - Advanced - Vocabulary]\n\n" +
                                                "Cấu trúc mỗi câu hỏi:\n" +
                                                "Câu 1: Nội dung câu hỏi...\n" +
                                                "A) Đáp án 1\n" +
                                                "B) Đáp án 2\n" +
                                                "C) Đáp án 3\n" +
                                                "D) Đáp án 4\n" +
                                                "Đáp án: B\n\n" +
                                                "* Chú ý: Dấu ngoặc sau A, B, C, D có thể là ')' hoặc '.'\n" +
                                                "* Các câu dưới thẻ [Category] sẽ tự động mang thuộc tính của Category đó cho đến khi gặp thẻ mới."
                                            );
                                        }}
                                        className="px-3 py-2 text-purple-600 font-bold hover:bg-purple-100 rounded-lg transition-colors text-sm"
                                    >
                                        📄 Xem Format Mẫu
                                    </button>
                                    <label className="px-4 py-2 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-900 transition-colors cursor-pointer flex items-center gap-2 text-sm">
                                        {isUploading ? 'Đang Import...' : 'Import DOCX'}
                                        <input type="file" accept=".docx" className="hidden" onChange={handleDocxUpload} disabled={isUploading} />
                                    </label>
                                    <button onClick={handleAddNew} className="px-4 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors text-sm">
                                        + Thêm Câu Hỏi
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="p-6">
                            {editingId && (
                                <div className="mb-8 p-6 bg-purple-50 rounded-xl border border-purple-200">
                                    <h3 className="font-bold text-lg text-purple-900 mb-4">{editingId === 'new' ? 'Thêm Câu Hỏi' : 'Sửa Câu Hỏi'}</h3>
                                    <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold mb-1">Thứ tự (Câu số mấy)</label>
                                            <input type="number" value={formData.order || ''} onChange={e => setFormData({...formData, order: e.target.value})} className="w-full p-2 border rounded" required />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold mb-1">Thể loại (Category)</label>
                                            <input type="text" value={formData.category || ''} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full p-2 border rounded" placeholder="Grammar, Vocabulary..." required />
                                        </div>
                                        
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-semibold mb-1">Nội dung câu hỏi (Tuỳ chọn)</label>
                                            <textarea value={formData.question || ''} onChange={e => setFormData({...formData, question: e.target.value})} className="w-full p-2 border rounded" rows={2} />
                                        </div>

                                        <div className="md:col-span-2 grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold mb-1">Audio URL (Tuỳ chọn)</label>
                                                <div className="flex gap-2">
                                                    <input type="text" value={formData.audioUrl || ''} onChange={e => setFormData({...formData, audioUrl: e.target.value})} className="flex-1 p-2 border rounded" placeholder="https://..." />
                                                    <label className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-2 rounded cursor-pointer font-bold text-xs flex items-center justify-center whitespace-nowrap">
                                                        Tải lên
                                                        <input type="file" accept="audio/*" className="hidden" onChange={handleAudioUpload} disabled={isSubmitting} />
                                                    </label>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold mb-1">Image URL (Tuỳ chọn)</label>
                                                <div className="flex gap-2">
                                                    <input type="text" value={formData.imageUrl || ''} onChange={e => setFormData({...formData, imageUrl: e.target.value})} className="flex-1 p-2 border rounded" placeholder="https://..." />
                                                    <label className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-2 rounded cursor-pointer font-bold text-xs flex items-center justify-center whitespace-nowrap">
                                                        Tải lên
                                                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isSubmitting} />
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-semibold mb-1">Đoạn văn (Passage - Part 6,7) (Tuỳ chọn)</label>
                                            <textarea value={formData.passage || ''} onChange={e => setFormData({...formData, passage: e.target.value})} className="w-full p-2 border rounded font-mono text-sm" rows={4} placeholder="HTML format is supported" />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold mb-1">Option A</label>
                                            <input type="text" value={formData.optionA || ''} onChange={e => setFormData({...formData, optionA: e.target.value})} className="w-full p-2 border rounded" required />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold mb-1">Option B</label>
                                            <input type="text" value={formData.optionB || ''} onChange={e => setFormData({...formData, optionB: e.target.value})} className="w-full p-2 border rounded" required />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold mb-1">Option C</label>
                                            <input type="text" value={formData.optionC || ''} onChange={e => setFormData({...formData, optionC: e.target.value})} className="w-full p-2 border rounded" required />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold mb-1">Option D (Tuỳ chọn)</label>
                                            <input type="text" value={formData.optionD || ''} onChange={e => setFormData({...formData, optionD: e.target.value})} className="w-full p-2 border rounded" />
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-semibold mb-1 text-green-700">Đáp án đúng</label>
                                            <select value={formData.correctOption || 'A'} onChange={e => setFormData({...formData, correctOption: e.target.value})} className="w-full p-2 border rounded font-bold text-green-700">
                                                <option value="A">A</option>
                                                <option value="B">B</option>
                                                <option value="C">C</option>
                                                <option value="D">D</option>
                                            </select>
                                        </div>

                                        <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                                            <button type="button" onClick={handleCancel} className="px-4 py-2 bg-slate-200 text-slate-700 rounded font-bold hover:bg-slate-300">Hủy</button>
                                            <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-green-600 text-white rounded font-bold hover:bg-green-700 disabled:opacity-50">Lưu</button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-100 text-slate-600 text-sm">
                                            <th className="p-3 border-b font-bold">Câu</th>
                                            <th className="p-3 border-b font-bold">Category</th>
                                            <th className="p-3 border-b font-bold">Preview</th>
                                            <th className="p-3 border-b font-bold">Đáp án</th>
                                            <th className="p-3 border-b font-bold text-right">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {questions.map((q, idx) => (
                                            <tr key={q.id} className="border-b hover:bg-slate-50 transition-colors">
                                                <td className="p-3 font-bold text-slate-800">{q.order}</td>
                                                <td className="p-3"><span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-bold">{q.category}</span></td>
                                                <td className="p-3 text-sm text-slate-600">
                                                    <div className="line-clamp-1 max-w-xs">{q.question || q.passage || (q.audioUrl ? '🎵 Audio' : '📷 Image')}</div>
                                                </td>
                                                <td className="p-3 font-bold text-green-600">{q.correctOption}</td>
                                                <td className="p-3 text-right space-x-2">
                                                    <button onClick={() => handleEdit(q)} className="px-3 py-1 bg-amber-100 text-amber-700 rounded text-xs font-bold hover:bg-amber-200">Sửa</button>
                                                    <button onClick={() => handleDelete(q.id)} className="px-3 py-1 bg-rose-100 text-rose-700 rounded text-xs font-bold hover:bg-rose-200">Xóa</button>
                                                </td>
                                            </tr>
                                        ))}
                                        {questions.length === 0 && (
                                            <tr><td colSpan={5} className="p-8 text-center text-slate-500">Chưa có câu hỏi nào. Hãy thêm câu hỏi hoặc Import DOCX.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>
            </div>
        </div>
    );
}
