const fs = require('fs');

const tempContent = fs.readFileSync('temp.tsx', 'utf8');
const startMatch = tempContent.indexOf('<div className="mb-10 w-full bg-[#581c87]/[0.02]');
const endMatch = tempContent.indexOf('<div className="border border-slate-200 bg-white rounded-3xl p-8 mb-10 shadow-sm mt-10">');

let roadmapBlock = tempContent.substring(startMatch, endMatch);

// We need to add the 2 deadlines for Super Early Bird and Early Bird
// The user wants clear milestones/deadlines on the UI for Super Early Bird and Early Bird.
// Super Early Bird ends on say, 31/05/2026. Early Bird ends on 31/08/2026.
// Let's modify the roadmapBlock to include deadlines.

// The original map:
/*
                        <div className={`absolute top-full mt-3 text-[9px] sm:text-[10px] uppercase tracking-wider font-bold whitespace-nowrap transition-colors flex flex-col items-center gap-1 ${
                            isCurrent ? 'text-amber-700' : 
                            isPast ? 'text-[#581c87]/80' : 
                            'text-slate-400'
                        }`}>
                            <span>{phase === 'super_early_bird' ? 'Super Early' : phase === 'early_bird' ? 'Early Bird' : 'Giá Gốc'}</span>
                            <span className={`px-2 py-0.5 rounded-full ${isCurrent ? 'bg-amber-100/70 text-amber-900 border border-amber-200' : isPast ? 'text-[#581c87]/70 font-medium normal-case' : 'text-slate-400 font-medium normal-case'}`}>
                                {pricePhase.label || '...'}
                            </span>
                        </div>
*/

// Let's inject a new span for the deadline
const replacementText = `
                        <div className={\`absolute top-full mt-3 text-[9px] sm:text-[10px] uppercase tracking-wider font-bold whitespace-nowrap transition-colors flex flex-col items-center gap-1 \${
                            isCurrent ? 'text-amber-700' : 
                            isPast ? 'text-[#581c87]/80' : 
                            'text-slate-400'
                        }\`}>
                            <span>{phase === 'super_early_bird' ? 'Super Early' : phase === 'early_bird' ? 'Early Bird' : 'Giá Gốc'}</span>
                            {phase === 'super_early_bird' && <span className="text-[9px] text-red-500/80 normal-case -mt-1 font-medium bg-red-50 px-1.5 rounded-sm">Hết hạn: 31/05/2026</span>}
                            {phase === 'early_bird' && <span className="text-[9px] text-red-500/80 normal-case -mt-1 font-medium bg-red-50 px-1.5 rounded-sm">Hết hạn: 31/08/2026</span>}
                            <span className={\`px-2 py-0.5 rounded-full \${isCurrent ? 'bg-amber-100/70 text-amber-900 border border-amber-200' : isPast ? 'text-[#581c87]/70 font-medium normal-case' : 'text-slate-400 font-medium normal-case'}\`}>
                                {pricePhase.label || '...'}
                            </span>
                        </div>
`;

roadmapBlock = roadmapBlock.replace(/<div className={`absolute top-full mt-3[\s\S]*?<\/div>/, replacementText);
// But wait, the map phase is dynamic so the replace above will only replace the first occurrence if we are not careful.
// Wait, the original code had the map inside JSX, so it's a string literal replacement.
// Let's do it cleanly using a string replace on the exact snippet.
`;

let content = fs.readFileSync('src/app/toeic-practice/upgrade/page.tsx', 'utf8');

content = content.replace(
  '<div className="border border-slate-200 bg-white rounded-3xl p-8 mb-10 shadow-sm mt-10">',
  roadmapBlock + '\n\n      <div className="border border-slate-200 bg-white rounded-3xl p-8 mb-10 shadow-sm mt-10">'
);

// We need to do the dynamic replacement inside roadmapBlock properly first
const targetMapStr = `<div className={\`absolute top-full mt-3 text-[9px] sm:text-[10px] uppercase tracking-wider font-bold whitespace-nowrap transition-colors flex flex-col items-center gap-1 \${
                            isCurrent ? 'text-amber-700' : 
                            isPast ? 'text-[#581c87]/80' : 
                            'text-slate-400'
                        }\`}>
                            <span>{phase === 'super_early_bird' ? 'Super Early' : phase === 'early_bird' ? 'Early Bird' : 'Giá Gốc'}</span>
                            <span className={\`px-2 py-0.5 rounded-full \${isCurrent ? 'bg-amber-100/70 text-amber-900 border border-amber-200' : isPast ? 'text-[#581c87]/70 font-medium normal-case' : 'text-slate-400 font-medium normal-case'}\`}>
                                {pricePhase.label || '...'}
                            </span>
                        </div>`;

const newMapStr = `<div className={\`absolute top-full mt-3 text-[9px] sm:text-[10px] uppercase tracking-wider font-bold whitespace-nowrap transition-colors flex flex-col items-center gap-1 \${
                            isCurrent ? 'text-amber-700' : 
                            isPast ? 'text-[#581c87]/80' : 
                            'text-slate-400'
                        }\`}>
                            <span>{phase === 'super_early_bird' ? 'Super Early' : phase === 'early_bird' ? 'Early Bird' : 'Giá Gốc'}</span>
                            {phase === 'super_early_bird' && <span className="text-[9px] text-red-500/80 normal-case -mt-0.5 font-semibold bg-red-50 px-1.5 rounded">Hết hạn: 31/05/2026</span>}
                            {phase === 'early_bird' && <span className="text-[9px] text-red-500/80 normal-case -mt-0.5 font-semibold bg-red-50 px-1.5 rounded">Hết hạn: 31/08/2026</span>}
                            <span className={\`px-2 py-0.5 rounded-full mt-1 \${isCurrent ? 'bg-amber-100/70 text-amber-900 border border-amber-200' : isPast ? 'text-[#581c87]/70 font-medium normal-case' : 'text-slate-400 font-medium normal-case'}\`}>
                                {pricePhase.label || '...'}
                            </span>
                        </div>`;

roadmapBlock = roadmapBlock.replace(targetMapStr, newMapStr);

let pageContent = fs.readFileSync('src/app/toeic-practice/upgrade/page.tsx', 'utf8');
pageContent = pageContent.replace(
  '<div className="border border-slate-200 bg-white rounded-3xl p-8 mb-10 shadow-sm mt-10">',
  roadmapBlock + '\n\n      <div className="border border-slate-200 bg-white rounded-3xl p-8 mb-10 shadow-sm mt-10">'
);

fs.writeFileSync('src/app/toeic-practice/upgrade/page.tsx', pageContent);
console.log('Restored roadmap diagram with deadlines');
