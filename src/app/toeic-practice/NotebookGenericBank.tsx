"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getNotebookBank } from "./actions";
import ZoomableImage from "@/components/ZoomableImage";
import PartFilterBank from "@/app/toeic-progress/PartFilterBank";

const parseTranslation = (text: string | null) => {
    if (!text) return null;
    let question = text;
    let a = '', b = '', c = '', d = '';
    
    const aIndex = text.indexOf('(A)');
    const bIndex = text.indexOf('(B)');
    const cIndex = text.indexOf('(C)');
    const dIndex = text.indexOf('(D)');
    
    if (aIndex !== -1) {
        question = text.substring(0, aIndex).trim();
        a = text.substring(aIndex + 3, bIndex !== -1 ? bIndex : text.length).trim();
        if (bIndex !== -1) {
            b = text.substring(bIndex + 3, cIndex !== -1 ? cIndex : text.length).trim();
        }
        if (cIndex !== -1) {
            c = text.substring(cIndex + 3, dIndex !== -1 ? dIndex : text.length).trim();
        }
        if (dIndex !== -1) {
            d = text.substring(dIndex + 3).trim();
        }
        return { question, a, b, c, d };
    }
    return { question: text };
}

const hideTranscript = (text: string | null) => {
    if (!text) return null;
    const idx = text.indexOf('[Transcript]');
    if (idx !== -1) {
        const nextIdx = text.indexOf('[Dịch nghĩa]', idx);
        if (nextIdx !== -1) {
            return text.substring(0, idx) + text.substring(nextIdx);
        }
        const nextIdx2 = text.indexOf('[Giải thích]', idx);
        if (nextIdx2 !== -1) {
            return text.substring(0, idx) + text.substring(nextIdx2);
        }
    }
    return text;
}

export default function NotebookGenericBank({ type, filter, partFilter }: { type: string, filter: string, partFilter?: string }) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        getNotebookBank(type, filter, partFilter).then((res) => {
            setData(res);
            setLoading(false);
        }).catch((err) => {
            console.error(err);
            setLoading(false);
        });
    }, [type, filter, partFilter]);

    if (loading) {
        return <div className="flex h-32 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600"></div></div>;
    }

    const { items, records } = data || { items: [], records: [] };
    const isMistakes = filter === 'mistakes';
    const isHistory = filter === 'history';

    if (isHistory && records.length === 0) {
        return (
			<div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
				<div className="w-16 h-16 bg-slate-50 text-slate-500 rounded-full flex items-center justify-center text-2xl mx-auto mb-4 border border-slate-100">
					<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
				</div>
				<h3 className="text-xl font-bold text-slate-800 mb-2">Chưa có lịch sử thi</h3>
                <p className="text-slate-500 max-w-sm mx-auto">
                    Bạn chưa thực hiện bài thi thử nào. Hãy làm một bài thi và quay lại đây nhé.
				</p>
			</div>
		);
    }

    if (isHistory) {
        return (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm">
                <h3 className="text-xl font-bold text-slate-800 mb-2">Lịch sử thi (Tóm tắt)</h3>
                <p className="text-slate-500 mb-4">Bạn có {records.length} bản ghi thi thử.</p>
                <Link href="/toeic-progress?tab=actual-test-bank&filter=history" className="text-primary-600 font-bold hover:underline">
                    Xem chi tiết trong Tiến Độ Luyện Đề
                </Link>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="space-y-4">
                {(type === 'LISTENING' || type === 'READING') && <PartFilterBank type={type.toLowerCase() as any} activePart={partFilter} />}
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
				<div className="w-16 h-16 bg-slate-50 text-slate-500 rounded-full flex items-center justify-center text-2xl mx-auto mb-4 border border-slate-100">
					<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
				</div>
				<h3 className="text-xl font-bold text-slate-800 mb-2">
                    {isMistakes ? "Tuyệt vời! Bạn chưa có câu làm sai nào" : "Chưa có dữ liệu nào được lưu"}
                </h3>
				<p className="text-slate-500 max-w-sm mx-auto">
                    {isMistakes 
                        ? "Hệ thống sẽ tự động lưu lại những câu bạn làm sai để tiện ôn tập lại sau này." 
                        : "Hãy bấm vào icon Bookmark trong quá trình học để lưu lại những câu khó hoặc hay nhé."}
				</p>
			    </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-10">
            {(type === 'LISTENING' || type === 'READING') && <PartFilterBank type={type.toLowerCase() as any} activePart={partFilter} />}
            {items.map((item: any) => {
                const q = item.question;
                const parsedTrans = parseTranslation(q.translation);
                
                const typePathMap: Record<string, string> = {
                    'GRAMMAR': 'grammar',
                    'LISTENING': 'listening',
                    'READING': 'reading',
                    'ACTUAL_TEST': 'actual-test'
                };
                const typePath = typePathMap[type] || 'grammar';

                const Wrapper = type === 'ACTUAL_TEST' ? 'div' : Link;
                const wrapperProps = type === 'ACTUAL_TEST' 
                    ? { key: q.id, className: "block bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-primary-200 transition-all group relative cursor-default" }
                    : { key: q.id, href: `/toeic-practice/${typePath}/${q.lesson.topic.slug}?lessonId=${q.lesson.id}&reviewId=${q.id}`, className: "block bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-primary-200 transition-all group relative cursor-pointer" };

                return (
                    <Wrapper {...wrapperProps as any}>
                        {isMistakes && item.selectedOption && (
                            <div className="absolute top-4 right-4 text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 opacity-90 text-[10px] font-bold">
                                CÂU SAI
                            </div>
                        )}
                        {!isMistakes && (
                            <div className="absolute top-4 right-4 text-primary-500 bg-primary-50 p-1.5 rounded-lg border border-primary-200 opacity-80 group-hover:opacity-100 transition-opacity">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>
                            </div>
                        )}
                        
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-xs font-black px-2.5 py-1 bg-primary-600 text-white rounded-md whitespace-nowrap shadow-sm">
                                {q.lesson.topic.title}
                            </span>
                            <span className="text-xs font-bold px-2.5 py-1 bg-slate-700 text-white rounded-md whitespace-nowrap shadow-sm">
                                {q.lesson.title}
                            </span>
                        </div>
                        
                        <div className="mb-4 pr-8">
                            {q.imageUrl && (
                                <ZoomableImage src={q.imageUrl} className="w-[150px] object-cover rounded shadow-sm border border-slate-200 mb-3" />
                            )}
                            {q.audioUrl && (
                                <audio src={q.audioUrl} controls className="h-10 w-full max-w-sm mb-3" />
                            )}
                            <p className="text-lg font-black text-slate-800 line-clamp-2 leading-snug">
                                {q.question}
                            </p>
                            {parsedTrans?.question && (
                                <p className="text-[13px] italic text-primary-700/80 mt-1 line-clamp-2 leading-snug font-medium">
                                    {parsedTrans.question}
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 text-sm font-medium">
                            <div className={`p-2.5 rounded-lg border flex flex-col gap-1.5 ${q.correctOption === 'A' ? 'bg-primary-50 border-primary-200 text-primary-800' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>
                                <div><span className="font-black mr-2 opacity-60">A</span> {q.optionA}</div>
                                {parsedTrans?.a && <div className="text-[12px] italic text-primary-700/70 font-normal leading-snug">{parsedTrans.a}</div>}
                            </div>
                            <div className={`p-2.5 rounded-lg border flex flex-col gap-1.5 ${q.correctOption === 'B' ? 'bg-primary-50 border-primary-200 text-primary-800' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>
                                <div><span className="font-black mr-2 opacity-60">B</span> {q.optionB}</div>
                                {parsedTrans?.b && <div className="text-[12px] italic text-primary-700/70 font-normal leading-snug">{parsedTrans.b}</div>}
                            </div>
                            <div className={`p-2.5 rounded-lg border flex flex-col gap-1.5 ${q.correctOption === 'C' ? 'bg-primary-50 border-primary-200 text-primary-800' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>
                                <div><span className="font-black mr-2 opacity-60">C</span> {q.optionC}</div>
                                {parsedTrans?.c && <div className="text-[12px] italic text-primary-700/70 font-normal leading-snug">{parsedTrans.c}</div>}
                            </div>
                            {q.optionD && (
                            <div className={`p-2.5 rounded-lg border flex flex-col gap-1.5 ${q.correctOption === 'D' ? 'bg-primary-50 border-primary-200 text-primary-800' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>
                                <div><span className="font-black mr-2 opacity-60">D</span> {q.optionD}</div>
                                {parsedTrans?.d && <div className="text-[12px] italic text-primary-700/70 font-normal leading-snug">{parsedTrans.d}</div>}
                            </div>
                            )}
                        </div>
                        
                        {(q.explanation) && (
                            <div className="mt-4 pt-3 border-t border-slate-100/60">
                                {hideTranscript(q.explanation) && (
                                    <div className="text-[13px] font-medium text-slate-600 whitespace-pre-wrap">{hideTranscript(q.explanation)}</div>
                                )}
                            </div>
                        )}
                    </Wrapper>
                );
            })}
        </div>
    );
}
