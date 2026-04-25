'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';

export default function AdminPlacementTestConfig() {
    const [config, setConfig] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const res = await fetch('/api/admin/placement-test/config');
                const data = await res.json();
                if (data.success) {
                    setConfig(data.config);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchConfig();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/admin/placement-test/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ config })
            });
            if (res.ok) {
                toast.success('Lưu cấu hình thành công!');
                setIsOpen(false);
            } else {
                toast.error('Lưu cấu hình thất bại');
            }
        } catch (error) {
            toast.error('Lỗi kết nối khi lưu cấu hình');
        } finally {
            setSaving(false);
        }
    };

    if (loading || !config) return null;

    const updateDifficulty = (level: string, diff: string, value: number) => {
        setConfig((prev: any) => ({
            ...prev,
            difficulty: {
                ...prev.difficulty,
                [level]: {
                    ...prev.difficulty[level],
                    [diff]: value
                }
            }
        }));
    };

    const updateSkill = (skill: string, value: number) => {
        setConfig((prev: any) => ({
            ...prev,
            skill: {
                ...prev.skill,
                [skill]: value
            }
        }));
    };

    return (
        <div className="bg-white rounded-xl shadow border border-slate-200 mb-6 overflow-hidden">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full p-4 bg-slate-50 flex justify-between items-center hover:bg-slate-100 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <span className="text-xl">⚙️</span>
                    <h2 className="font-black text-slate-800">Cấu hình Thuật toán Sinh đề (20 câu)</h2>
                </div>
                <svg className={`w-5 h-5 text-slate-500 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="p-6 border-t border-slate-200">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Cấu hình phân bổ độ khó */}
                        <div>
                            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <span className="bg-purple-100 text-purple-700 p-1.5 rounded-lg">📊</span>
                                Phân bổ Độ khó theo Mục tiêu User
                            </h3>
                            <div className="space-y-6">
                                {['BEGINNER', 'INTERMEDIATE', 'ADVANCED'].map(level => {
                                    const total = config.difficulty[level].beginner + config.difficulty[level].intermediate + config.difficulty[level].advanced;
                                    return (
                                        <div key={level} className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                            <div className="flex justify-between items-center mb-3">
                                                <span className="font-bold text-sm text-slate-700">Level: <span className="text-purple-600">{level}</span></span>
                                                <span className={`text-xs font-bold px-2 py-1 rounded ${total === 20 ? 'bg-green-100 text-green-700' : 'bg-rose-100 text-rose-700'}`}>
                                                    Tổng: {total}/20
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-3 gap-3">
                                                <div>
                                                    <label className="block text-xs font-semibold text-slate-500 mb-1">Beginner (Dễ)</label>
                                                    <input type="number" min="0" max="20" value={config.difficulty[level].beginner} onChange={e => updateDifficulty(level, 'beginner', parseInt(e.target.value) || 0)} className="w-full p-2 border rounded text-center font-bold" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-semibold text-slate-500 mb-1">Inter. (Vừa)</label>
                                                    <input type="number" min="0" max="20" value={config.difficulty[level].intermediate} onChange={e => updateDifficulty(level, 'intermediate', parseInt(e.target.value) || 0)} className="w-full p-2 border rounded text-center font-bold" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-semibold text-slate-500 mb-1">Advanced (Khó)</label>
                                                    <input type="number" min="0" max="20" value={config.difficulty[level].advanced} onChange={e => updateDifficulty(level, 'advanced', parseInt(e.target.value) || 0)} className="w-full p-2 border rounded text-center font-bold" />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Cấu hình phân bổ kỹ năng */}
                        <div>
                            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <span className="bg-amber-100 text-amber-700 p-1.5 rounded-lg">🎯</span>
                                Phân bổ Kỹ năng (Áp dụng chung)
                            </h3>
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="font-bold text-sm text-slate-700">Tỉ lệ Phân bổ</span>
                                    {(() => {
                                        const totalSkill = (config.skill.listening || 0) + (config.skill.reading || 0) + (config.skill.pronunciation || 0) + (config.skill.vocabulary || 0);
                                        return (
                                            <span className={`text-xs font-bold px-2 py-1 rounded ${totalSkill === 20 ? 'bg-green-100 text-green-700' : 'bg-rose-100 text-rose-700'}`}>
                                                Tổng: {totalSkill}/20
                                            </span>
                                        );
                                    })()}
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-semibold text-slate-600 w-1/2">🎧 Kỹ năng Nghe hiểu</label>
                                        <input type="number" min="0" max="20" value={config.skill.listening || 0} onChange={e => updateSkill('listening', parseInt(e.target.value) || 0)} className="w-24 p-2 border rounded text-center font-bold" />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-semibold text-slate-600 w-1/2">📖 Kỹ năng Đọc hiểu</label>
                                        <input type="number" min="0" max="20" value={config.skill.reading || 0} onChange={e => updateSkill('reading', parseInt(e.target.value) || 0)} className="w-24 p-2 border rounded text-center font-bold" />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-semibold text-slate-600 w-1/2">🗣️ Phát âm (Pronunciation)</label>
                                        <input type="number" min="0" max="20" value={config.skill.pronunciation || 0} onChange={e => updateSkill('pronunciation', parseInt(e.target.value) || 0)} className="w-24 p-2 border rounded text-center font-bold" />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-semibold text-slate-600 w-1/2">📚 Từ vựng (Vocabulary)</label>
                                        <input type="number" min="0" max="20" value={config.skill.vocabulary || 0} onChange={e => updateSkill('vocabulary', parseInt(e.target.value) || 0)} className="w-24 p-2 border rounded text-center font-bold" />
                                    </div>
                                </div>
                                <p className="text-xs text-slate-500 italic mt-6">
                                    Lưu ý: Hệ thống sẽ cố gắng phân bổ câu hỏi ưu tiên theo <span className="font-bold text-slate-700">Độ khó</span> trước, sau đó bù lấp theo <span className="font-bold text-slate-700">Kỹ năng</span> để đảm bảo luôn ra đủ 20 câu (nếu ngân hàng câu hỏi có đủ dữ liệu).
                                </p>
                            </div>

                            <div className="mt-8 flex justify-end">
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="px-8 py-3 bg-[#581c87] hover:bg-[#6b21a8] text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
                                >
                                    {saving ? 'Đang lưu...' : 'Lưu cấu hình'}
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
