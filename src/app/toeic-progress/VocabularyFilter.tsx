'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export default function VocabularyFilter({ topics }: { topics: string[] }) {
	const router = useRouter();
	const searchParams = useSearchParams();
	
	const currentTopic = searchParams.get('topic') || 'all';
	const currentTag = searchParams.get('tag') || 'all';

	const updateFilters = (newTopic: string, newTag: string) => {
		const params = new URLSearchParams(searchParams.toString());
		params.set('tab', 'vocabulary-bank');
		
		if (newTopic === 'all') params.delete('topic');
		else params.set('topic', newTopic);
		
		if (newTag === 'all') params.delete('tag');
		else params.set('tag', newTag);
		
		router.push(`?${params.toString()}`);
	};

	return (
		<div className="flex flex-col sm:flex-row gap-4 mb-6">
			<div className="flex-1">
				<label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Chủ đề</label>
				<select 
					value={currentTopic}
					onChange={(e) => updateFilters(e.target.value, currentTag)}
					className="w-full bg-white border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-green-500 focus:border-green-500 block p-2.5 font-medium shadow-sm transition-shadow outline-none"
				>
					<option value="all">Tất cả chủ đề</option>
					{topics.map(t => (
						<option key={t} value={t}>{t}</option>
					))}
				</select>
			</div>
			<div className="flex-1">
				<label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Trạng thái tag</label>
				<select 
					value={currentTag}
					onChange={(e) => updateFilters(currentTopic, e.target.value)}
					className="w-full bg-white border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-green-500 focus:border-green-500 block p-2.5 font-medium shadow-sm transition-shadow outline-none"
				>
					<option value="all">Tất cả trạng thái</option>
					<option value="bookmarked">⭐ Đã lưu (Bookmarked)</option>
					<option value="hard">🔥 Từ khó (Hard)</option>
					<option value="learned">✓ Đã thuộc (Learned)</option>
				</select>
			</div>
		</div>
	);
}
