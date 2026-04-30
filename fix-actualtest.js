const fs = require('fs');
const pagePath = 'src/app/toeic-practice/page.tsx';
let page = fs.readFileSync(pagePath, 'utf8');

page = page.replace(
    /className="group relative bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer hover:border-primary-200"/g,
    'className="group relative bg-white dark:bg-primary-950/20 rounded-xl border border-slate-200 dark:border-white/20 overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer hover:border-primary-200 dark:hover:border-primary-500/30"'
);

page = page.replace(
    /<div className="absolute inset-0 bg-gradient-to-br from-transparent to-primary-50\/40 group-hover:to-primary-100\/50 transition-colors pointer-events-none"><\/div>/g,
    '<div className="absolute inset-0 bg-gradient-to-br from-transparent to-primary-50/40 dark:to-transparent group-hover:to-primary-100/50 dark:group-hover:to-primary-900/10 transition-colors pointer-events-none"></div>'
);

page = page.replace(
    /<h3 className="text-xl font-black text-primary-900 transition-colors">\{test.title\}<\/h3>/g,
    '<h3 className="text-xl font-black text-primary-900 dark:text-white transition-colors">{test.title}</h3>'
);

page = page.replace(
    /<div className="text-\[12px\] font-bold text-slate-500">Các phần thi có sẵn<\/div>/g,
    '<div className="text-[12px] font-bold text-slate-500 dark:text-slate-300">Các phần thi có sẵn</div>'
);

page = page.replace(
    /\$\{isActive \? 'bg-primary-50 text-primary-600 border border-primary-200 shadow-sm' : 'bg-slate-50 text-slate-300 border border-slate-100'\}/g,
    "${isActive ? 'bg-primary-50 dark:bg-primary-900/40 text-primary-600 dark:text-primary-300 border border-primary-200 dark:border-primary-700/50 shadow-sm' : 'bg-slate-50 dark:bg-primary-950/20 text-slate-300 dark:text-slate-500 border border-slate-100 dark:border-primary-500/20'}"
);

page = page.replace(
    /className="flex-1 py-2\.5 rounded-xl focus:outline-none border border-primary-200 bg-primary-50\/50 text-primary-700 font-bold text-xs hover:bg-primary-100 hover:border-primary-300 transition-colors shadow-sm cursor-pointer"/g,
    'className="flex-1 py-2.5 rounded-xl focus:outline-none border border-primary-200 dark:border-primary-700/50 bg-primary-50/50 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 font-bold text-xs hover:bg-primary-100 dark:hover:bg-primary-800/60 hover:border-primary-300 transition-colors shadow-sm cursor-pointer"'
);

page = page.replace(
    /className="flex-1 py-2\.5 rounded-xl focus:outline-none border border-slate-200 bg-white text-slate-600 font-bold text-xs hover:bg-slate-100 hover:border-slate-300 hover:text-slate-800 transition-colors cursor-pointer"/g,
    'className="flex-1 py-2.5 rounded-xl focus:outline-none border border-slate-200 dark:border-primary-500/20 bg-white dark:bg-primary-950/20 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-primary-900/40 hover:border-slate-300 dark:hover:border-primary-500/40 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"'
);

fs.writeFileSync(pagePath, page);
console.log('Fixed actual test cards in page.tsx');
