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
		<div className="space-y-6 mb-8">
			{/* Topic Chips */}
			<div>
				<label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-1">Hiển thị theo chủ đề</label>
				<div className="flex flex-nowrap overflow-x-auto gap-2 pb-3 custom-scrollbar">
					<button 
						onClick={() => updateFilters('all', currentTag)}
						className={`px-4 py-2 rounded-xl text-sm font-bold transition-all shrink-0 whitespace-nowrap shadow-sm border ${currentTopic === 'all' ? 'bg-[#14532d] text-white border-[#14532d] shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
					>
						Tất cả chủ đề
					</button>
					{topics.map(t => (
						<button 
							key={t}
							onClick={() => updateFilters(t, currentTag)}
							className={`px-4 py-2 rounded-xl text-sm font-bold transition-all shrink-0 whitespace-nowrap shadow-sm border ${currentTopic === t ? 'bg-[#14532d] text-white border-[#14532d] shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
						>
							{t}
						</button>
					))}
				</div>
			</div>

			{/* Tag Chips */}
			<div>
				<label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-1">Lọc theo tag đã chọn</label>
				<div className="flex flex-nowrap overflow-x-auto gap-2 pb-3 custom-scrollbar">
					{[
						{ id: 'all', label: 'Tất cả trạng thái', icon: '🌈', activeClass: 'bg-slate-800 text-white' },
						{ id: 'bookmarked', label: '⭐ Câu đã lưu', icon: '⭐', activeClass: 'bg-[#ea980c] text-white' },
						{ id: 'hard', label: '● Từ khó', icon: '●', activeClass: 'bg-rose-600 text-white' },
						{ id: 'learned', label: '✓ Đã thuộc', icon: '✓', activeClass: 'bg-green-600 text-white' }
					].map(tag => (
						<button 
							key={tag.id}
							onClick={() => updateFilters(currentTopic, tag.id)}
							className={`px-4 py-2 rounded-xl text-sm font-bold transition-all shrink-0 whitespace-nowrap shadow-sm border flex items-center gap-2 ${currentTag === tag.id ? tag.activeClass + ' border-transparent shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
						>
							{tag.label}
						</button>
					))}
				</div>
			</div>
		</div>
	);
}
