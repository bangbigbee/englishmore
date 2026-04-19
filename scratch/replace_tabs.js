const fs = require('fs');
let content = fs.readFileSync('./src/app/toeic-practice/page.tsx', 'utf8');

const regex = /<div className="flex w-full overflow-x-auto gap-2 md:gap-3 mb-8 pb-4 border-b border-gray-100 hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>[\s\S]*?<\/div>\n\t\t\t\n\t\t\t<div className="grid/g;

const replacement = `<div className="flex w-full overflow-x-auto gap-3 md:gap-4 mb-8 pb-4 hide-scrollbar snap-x" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
				{parts.map((p) => {
					const topicsInPart = topics.filter(t => t.part === p.id);
					const totalLessons = topicsInPart.reduce((acc, t) => acc + (t._count?.lessons || 0), 0);
					const isActive = selectedPart === p.id;
					const shortTitle = p.title.replace(\`Part \${p.id}: \`, '');
					const colors = getPartColors(p.id);
					
					return (
						<button
							key={p.id}
							onClick={() => setSelectedPart(p.id)}
							className={\`group flex items-center gap-2.5 px-4 md:px-5 py-2.5 md:py-3 rounded-2xl transition-all duration-300 font-bold text-[13px] md:text-[14px] whitespace-nowrap shrink-0 snap-center \${
								isActive ? colors.activeBg : colors.bg
							}\`}
						>
							<div className={\`px-2 py-1 rounded-[6px] flex items-center justify-center text-[10px] sm:text-[11px] font-black transition-colors uppercase \${isActive ? colors.badgeActiveBg : colors.badgeBg}\`}>
								Part {p.id}
							</div>
							{p.subtitle}
							<span className={\`ml-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-colors \${isActive ? colors.countActiveBg : colors.countBg}\`}>
								{totalLessons}
							</span>
						</button>
					);
				})}
			</div>
			
			<div className="grid`;

content = content.replace(regex, replacement);

fs.writeFileSync('./src/app/toeic-practice/page.tsx', content);
console.log('done');
