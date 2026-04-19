'use client';

import { useState, useRef, useEffect } from 'react';

export default function PersonalNoteUI({ tagId, initialNote }: { tagId: string, initialNote: string | null }) {
    const [note, setNote] = useState(initialNote || '');
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-focus logic when editing starts
    useEffect(() => {
        if (isEditing && textareaRef.current) {
            textareaRef.current.focus();
            // Put cursor at the end
            textareaRef.current.setSelectionRange(textareaRef.current.value.length, textareaRef.current.value.length);
        }
    }, [isEditing]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await fetch('/api/toeic/vocabulary/notes', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tagId, note: note.trim() })
            });
            if (res.ok) {
                setIsEditing(false);
            } else {
                alert('Có lỗi xảy ra khi lưu ghi chú. Vui lòng thử lại.');
            }
        } catch (error) {
            console.error('Lỗi khi lưu ghi chú:', error);
            alert('Lỗi kết nối. Vui lòng thử lại.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setNote(initialNote || '');
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div 
                className="w-full text-left p-2 rounded-lg bg-green-50 border border-green-200 shadow-inner group/note relative"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            >
                <div className="flex items-center gap-1.5 mb-1.5">
                    <svg className="w-3 h-3 text-[#14532d]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    <span className="text-[10px] font-bold text-[#14532d] uppercase tracking-wider">Viết ghi chú</span>
                </div>
                <textarea
                    ref={textareaRef}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Mẹo nhớ từ, cách dùng đặc biệt..."
                    disabled={isSaving}
                    rows={2}
                    className="w-full text-[12px] p-2 rounded-md border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent bg-white resize-none text-slate-700 disabled:opacity-50"
                />
                <div className="flex justify-end gap-2 mt-2">
                    <button 
                        onClick={handleCancel}
                        disabled={isSaving}
                        className="px-2 py-1 text-[11px] font-bold text-slate-500 hover:text-slate-700 transition-colors disabled:opacity-50"
                    >
                        Hủy
                    </button>
                    <button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-3 py-1 text-[11px] font-bold bg-[#14532d] text-white rounded cursor-pointer hover:bg-green-800 transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSaving && <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>}
                        Lưu
                    </button>
                </div>
            </div>
        );
    }

    const hasNote = note.trim().length > 0;

    return (
        <div
            role="button"
            tabIndex={0}
            title="Sửa ghi chú"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsEditing(true); }}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setIsEditing(true); } }}
            className={`w-full text-left p-2 rounded-lg transition-colors group/note relative ${hasNote ? 'bg-amber-50/70 border border-amber-100/70 hover:bg-amber-50' : 'bg-green-50/50 border border-green-100/50 hover:bg-green-50'}`}
        >
            <div className="flex items-center justify-between mb-1 opacity-80 group-hover/note:opacity-100 transition-opacity">
                <div className="flex items-center gap-1.5">
                    <svg className={`w-3 h-3 ${hasNote ? 'text-amber-600' : 'text-[#14532d]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${hasNote ? 'text-amber-700' : 'text-[#14532d]'}`}>Ghi chú cá nhân</span>
                </div>
                {hasNote && (
                    <svg className="w-3.5 h-3.5 text-amber-500 hover:text-amber-700 transition-colors opacity-0 group-hover/note:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                )}
            </div>
            
            {hasNote ? (
                <div className="text-[12px] font-medium text-amber-900 whitespace-pre-wrap leading-relaxed line-clamp-3">
                    {note}
                </div>
            ) : (
                <div className="text-[12px] font-medium text-slate-400 italic">
                    Chạm để thêm ghi chú...
                </div>
            )}
        </div>
    );
}
