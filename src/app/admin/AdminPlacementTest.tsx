'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';

export default function AdminPlacementTest() {
    const [questions, setQuestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<any>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchQuestions = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/placement-test');
            if (res.ok) {
                const data = await res.json();
                setQuestions(data);
            }
        } catch (error) {
            console.error(error);
            toast.error('Lỗi tải danh sách câu hỏi');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuestions();
    }, []);

    const handleEdit = (q: any) => {
        setEditingId(q.id);
        setFormData(q);
    };

    const handleCancel = () => {
        setEditingId(null);
        setFormData({});
    };

    const handleAddNew = () => {
        setEditingId('new');
        setFormData({
            order: questions.length + 1,
            part: 5,
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
            
            // convert order to int
            payload.order = parseInt(payload.order) || 0;
            payload.part = parseInt(payload.part) || 5;

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                toast.success('Lưu câu hỏi thành công!');
                setEditingId(null);
                fetchQuestions();
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
                fetchQuestions();
            } else {
                toast.error('Xóa thất bại');
            }
        } catch (error) {
            toast.error('Lỗi xóa câu hỏi');
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Đang tải...</div>;

    return (
        <div className="bg-white rounded-xl shadow border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <div>
                    <h2 className="text-xl font-black text-slate-800">Quản lý bài Test Năng Lực (Placement Test)</h2>
                    <p className="text-sm text-slate-500">Thêm, sửa, xóa các câu hỏi cho bài test đầu vào. (Gợi ý: nên có 25 câu)</p>
                </div>
                <button onClick={handleAddNew} className="px-4 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors">
                    + Thêm Câu Hỏi Mới
                </button>
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
                                <label className="block text-sm font-semibold mb-1">Part (1-7)</label>
                                <input type="number" value={formData.part || ''} onChange={e => setFormData({...formData, part: e.target.value})} className="w-full p-2 border rounded" required />
                            </div>
                            
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold mb-1">Nội dung câu hỏi (Tuỳ chọn)</label>
                                <textarea value={formData.question || ''} onChange={e => setFormData({...formData, question: e.target.value})} className="w-full p-2 border rounded" rows={2} />
                            </div>

                            <div className="md:col-span-2 grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Audio URL (Tuỳ chọn)</label>
                                    <input type="text" value={formData.audioUrl || ''} onChange={e => setFormData({...formData, audioUrl: e.target.value})} className="w-full p-2 border rounded" placeholder="https://..." />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Image URL (Tuỳ chọn)</label>
                                    <input type="text" value={formData.imageUrl || ''} onChange={e => setFormData({...formData, imageUrl: e.target.value})} className="w-full p-2 border rounded" placeholder="https://..." />
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
                                <label className="block text-sm font-semibold mb-1">Option D (Tuỳ chọn cho Part 2)</label>
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
                                <th className="p-3 border-b font-bold">Part</th>
                                <th className="p-3 border-b font-bold">Preview</th>
                                <th className="p-3 border-b font-bold">Đáp án</th>
                                <th className="p-3 border-b font-bold text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {questions.map((q, idx) => (
                                <tr key={q.id} className="border-b hover:bg-slate-50 transition-colors">
                                    <td className="p-3 font-bold text-slate-800">{q.order}</td>
                                    <td className="p-3"><span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-bold">Part {q.part}</span></td>
                                    <td className="p-3 text-sm text-slate-600">
                                        <div className="line-clamp-1 max-w-xs">{q.question || q.passage || (q.audioUrl ? '🎵 Audio Question' : '📷 Image Question')}</div>
                                    </td>
                                    <td className="p-3 font-bold text-green-600">{q.correctOption}</td>
                                    <td className="p-3 text-right space-x-2">
                                        <button onClick={() => handleEdit(q)} className="px-3 py-1 bg-amber-100 text-amber-700 rounded text-xs font-bold hover:bg-amber-200">Sửa</button>
                                        <button onClick={() => handleDelete(q.id)} className="px-3 py-1 bg-rose-100 text-rose-700 rounded text-xs font-bold hover:bg-rose-200">Xóa</button>
                                    </td>
                                </tr>
                            ))}
                            {questions.length === 0 && (
                                <tr><td colSpan={5} className="p-8 text-center text-slate-500">Chưa có câu hỏi nào. Hãy thêm câu hỏi mới.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
