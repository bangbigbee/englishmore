"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getVocabularyBank } from "./actions";
import Link from "next/link";
import VocabularyFilter from "@/app/toeic-progress/VocabularyFilter";
import PersonalNoteUI from "@/app/toeic-progress/PersonalNoteUI";
import NotebookGenericBank from "./NotebookGenericBank";

const BANK_TABS = [
	{ id: 'vocabulary-bank', label: 'Từ vựng', icon: '📔' },
	{ id: 'grammar-bank', label: 'Ngữ pháp', icon: '📝' },
	{ id: 'listening-bank', label: 'Luyện nghe', icon: '🎧' },
	{ id: 'reading-bank', label: 'Luyện đọc', icon: '📖' },
	{ id: 'actual-test-bank', label: 'Luyện đề', icon: '🎓' },
];

export default function NotebookTab({ subtab = 'vocabulary-bank', topic, tagFilter, query, partFilter }: { subtab?: string, topic?: string, tagFilter?: string, query?: string, partFilter?: string }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const [data, setData] = useState<{tags: any[], uniqueTopics: string[]} | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentSubTab, setCurrentSubTab] = useState(subtab);
    const [genericFilter, setGenericFilter] = useState('mistakes');

    // Sync state if URL subtab changes
    useEffect(() => {
        if (subtab && subtab !== currentSubTab) {
            setCurrentSubTab(subtab);
        }
    }, [subtab]);

    const handleSubTabChange = (newSubTab: string) => {
        setCurrentSubTab(newSubTab);
        setGenericFilter('mistakes');
        const params = new URLSearchParams(searchParams?.toString() || '');
        params.set('subtab', newSubTab);
        params.delete('part');
        params.delete('topic');
        params.delete('tag');
        router.push(`?${params.toString()}`, { scroll: false });
    };

    useEffect(() => {
        if (currentSubTab !== 'vocabulary-bank') return;
        setLoading(true);
        getVocabularyBank(topic, tagFilter, query).then((res) => {
            setData(res);
            setLoading(false);
        }).catch((err) => {
            console.error(err);
            setLoading(false);
        });
    }, [topic, tagFilter, query, currentSubTab]);

    const renderNav = () => (
        <div className="mb-6 flex flex-col gap-4">
            <div className="flex gap-2 p-1 bg-slate-100/80 rounded-xl overflow-x-auto custom-scrollbar border border-slate-200">
                {BANK_TABS.map(t => (
                    <button
                        key={t.id}
                        onClick={() => handleSubTabChange(t.id)}
                        className={`flex-1 min-w-max px-4 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center gap-2 whitespace-nowrap ${currentSubTab === t.id ? 'bg-white text-primary-900 shadow-sm ring-1 ring-primary-100' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                    >
                        <span>{t.icon}</span> {t.label}
                    </button>
                ))}
            </div>
            
            {currentSubTab !== 'vocabulary-bank' && (
                <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-1">
                    <button onClick={() => setGenericFilter('mistakes')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${genericFilter === 'mistakes' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>Câu làm sai</button>
                    <button onClick={() => setGenericFilter('bookmarks')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${genericFilter === 'bookmarks' ? 'bg-secondary-100 text-secondary-800' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>Câu đã lưu</button>
                    {currentSubTab === 'actual-test-bank' && (
                        <button onClick={() => setGenericFilter('history')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${genericFilter === 'history' ? 'bg-primary-100 text-primary-800' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>Lịch sử thi</button>
                    )}
                </div>
            )}
        </div>
    );

    if (currentSubTab !== 'vocabulary-bank') {
        const typeMap: Record<string, string> = {
            'grammar-bank': 'GRAMMAR',
            'listening-bank': 'LISTENING',
            'reading-bank': 'READING',
            'actual-test-bank': 'ACTUAL_TEST'
        };
        return (
            <div className="w-full max-w-6xl mx-auto pb-10">
                {renderNav()}
                <NotebookGenericBank type={typeMap[currentSubTab]} filter={genericFilter} partFilter={partFilter} />
            </div>
        );
    }

    if (loading) {
        return <div className="flex h-32 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600"></div></div>;
    }

    if (!data) return null;

    const { tags, uniqueTopics } = data;

    if (tags.length === 0 && !topic && !tagFilter && !query) {
        return (
            <div className="text-center py-20 px-6 bg-white rounded-2xl border border-slate-200">
                <h3 className="text-2xl font-black text-slate-800 mb-4">Chưa có từ vựng nào</h3>
                <p className="text-slate-500 mb-8 max-w-md mx-auto leading-relaxed">
                    Bạn chưa đánh dấu từ vựng nào trong quá trình luyện tập. Hãy quay lại phần luyện tập và chọn đánh dấu các từ vựng bạn muốn lưu lại nhé!
                </p>
                <Link href="/toeic-practice?tab=vocabulary" className="inline-flex items-center justify-center rounded-xl bg-primary-900 px-8 py-3 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-1 hover:bg-primary-800 hover:shadow-xl">
                    Trở lại luyện từ
                </Link>
            </div>
        );
    }

    return (
        <div className="w-full max-w-6xl mx-auto pb-10">
            {renderNav()}
            <VocabularyFilter topics={uniqueTopics} />

            {tags.length === 0 ? (
                <div className="text-center py-12 px-6 bg-yellow-50/50 rounded-2xl border border-yellow-100 border-dashed">
                    <p className="text-slate-500 font-medium">Không tìm thấy từ vựng nào khớp với bộ lọc điều kiện trên.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tags.map(tag => (
                        <Link 
                            key={tag.id} 
                            href={`/toeic-practice?tab=vocabulary&topic=${encodeURIComponent(tag.vocabulary.topic)}&wordId=${tag.vocabId}`}
                            className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col group hover:shadow-md hover:border-primary-300 transition-all cursor-pointer relative"
                        >
                            <div className="p-4 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary-50 text-primary-700 uppercase tracking-wider line-clamp-1 max-w-[180px]" title={tag.vocabulary.topic}>
                                        {tag.vocabulary.topic.split('-')[0].split('(')[0].trim()}
                                    </span>
                                    <div className="flex gap-1">
                                        {tag.isHard && (
                                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-rose-50 text-rose-600 border border-rose-100 shadow-sm" title="Từ khó">
                                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_4px_rgba(244,63,94,0.3)]" />
                                            </span>
                                        )}
                                        {tag.isBookmarked && <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-secondary-50 text-[#ea980c] border border-secondary-100 text-[10px] shadow-sm" title="Câu đã lưu">⭐</span>}
                                        {tag.isLearned && <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary-50 text-primary-600 border border-primary-100 text-[10px] uppercase font-black shadow-sm" title="Đã thuộc">✓</span>}
                                    </div>
                                </div>
                                <div className="flex items-baseline gap-2.5 mb-1.5 flex-wrap">
                                    <h3 className="text-[19px] font-black text-slate-800">{tag.vocabulary.word}</h3>
                                    {tag.vocabulary.phonetic && <span className="text-[13px] text-slate-500 font-medium font-mono">{tag.vocabulary.phonetic}</span>}
                                </div>
                                <p className="font-semibold text-slate-700 text-[13px] leading-relaxed">{tag.vocabulary.meaning}</p>
                                {tag.vocabulary.example && (
                                    <p className="mt-2 text-[12px] text-slate-600 italic bg-slate-50 p-2.5 rounded-lg border border-slate-100">{tag.vocabulary.example}</p>
                                )}

                                {/* Personal Notes UI */}
                                <div className="mt-auto pt-2 border-t border-slate-100 relative z-10">
                                    <PersonalNoteUI tagId={tag.id} initialNote={tag.personalNote} />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
