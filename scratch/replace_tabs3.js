const fs = require('fs');
let content = fs.readFileSync('./src/app/toeic-practice/page.tsx', 'utf8');

const regexColors = /function getPartColors\(partId: number\) \{[\s\S]*?function ToeicListeningTab/g;
const replacementColors = `function getPartColors(partId: number) {
    switch (partId) {
        case 1: return { baseHex: '#14532d' };
        case 2: return { baseHex: '#3b7418' };
        case 3: return { baseHex: '#9cb510' };
        case 4: return { baseHex: '#ea980c' };
        case 5: return { baseHex: '#14532d' };
        case 6: return { baseHex: '#719f16' };
        case 7: return { baseHex: '#ea980c' };
        default: return { baseHex: '#475569' };
    }
}

function ToeicListeningTab`;

content = content.replace(regexColors, replacementColors);

const regexTagsListening = /<div className="flex w-full overflow-x-auto gap-3 md:gap-4 mb-10 pb-4 hide-scrollbar snap-x" style=\{\{ scrollbarWidth: 'none', msOverflowStyle: 'none' \}\}>[\s\S]*?<\/div>/;

const getTagsReplacement = () => `<div className="flex w-full overflow-x-auto gap-2.5 md:gap-3 mb-8 pb-3 hide-scrollbar snap-x" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
				{parts.map((p) => {
					const topicsInPart = topics.filter(t => t.part === p.id);
					const totalLessons = topicsInPart.reduce((acc, t) => acc + (t._count?.lessons || 0), 0);
					const isActive = selectedPart === p.id;
					const colors = getPartColors(p.id);
					
					return (
						<button
							key={p.id}
							onClick={() => setSelectedPart(p.id)}
							className={\`group flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-[14px] transition-all duration-300 font-bold text-[12px] md:text-[13px] whitespace-nowrap shrink-0 snap-center border \${isActive ? 'scale-[1.02] border-transparent shadow-md ring-2' : 'border-current/10 hover:border-current/30'}\`}
                            style={{
                                backgroundColor: isActive ? colors.baseHex : \`\${colors.baseHex}14\`,
                                color: isActive ? '#ffffff' : colors.baseHex,
                                boxShadow: isActive ? \`0 4px 14px -4px \${colors.baseHex}66\` : 'none',
                                '--tw-ring-color': \`\${colors.baseHex}40\`
                            } as any}
						>
							<div 
                                className={\`px-2 py-0.5 rounded-[5px] flex items-center justify-center text-[10px] font-black transition-colors uppercase\`}
                                style={{
                                    backgroundColor: isActive ? '#ffffff' : colors.baseHex,
                                    color: isActive ? colors.baseHex : '#ffffff'
                                }}
                            >
								Part {p.id}
							</div>
							{p.subtitle}
							<span 
                                className={\`ml-1 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold transition-colors\`}
                                style={{
                                    backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : '#ffffff',
                                    color: isActive ? '#ffffff' : colors.baseHex,
                                    boxShadow: isActive ? 'none' : '0 1px 2px rgba(0,0,0,0.05)'
                                }}
                            >
								{totalLessons}
							</span>
						</button>
					);
				})}
			</div>`;

content = content.replace(regexTagsListening, getTagsReplacement());
content = content.replace(regexTagsListening, getTagsReplacement());

fs.writeFileSync('./src/app/toeic-practice/page.tsx', content);
console.log('done');
