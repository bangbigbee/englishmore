const fs = require('fs');
const pagePath = 'src/app/toeic-practice/page.tsx';
let page = fs.readFileSync(pagePath, 'utf8');

// Fix invalid classes
page = page.replace(/dark:bg-primary-950\/30\/80/g, 'dark:bg-primary-950/30');
page = page.replace(/dark:bg-primary-950\/30\/90/g, 'dark:bg-primary-950/30');

// Fix "Danh sách bài luyện thực chiến" cards
page = page.replace(
    /className="group relative bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer"/g,
    'className="group relative bg-white dark:bg-primary-950/20 rounded-xl border border-slate-200 dark:border-primary-500/20 overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer"'
);

page = page.replace(
    /<div className="absolute inset-0 bg-gradient-to-br from-transparent to-slate-50 group-hover:to-slate-100 transition-colors pointer-events-none"><\/div>/g,
    '<div className="absolute inset-0 bg-gradient-to-br from-transparent to-slate-50 dark:to-transparent group-hover:to-slate-100 dark:group-hover:to-primary-900/10 transition-colors pointer-events-none"></div>'
);

page = page.replace(
    /<h3 className="text-\[17px\] font-black text-primary-900 transition-colors">\{lesson\.title\}<\/h3>/g,
    '<h3 className="text-[17px] font-black text-primary-900 dark:text-[#f8fafc] transition-colors">{lesson.title}</h3>'
);

page = page.replace(
    /<span className="text-\[11px\] font-bold text-slate-400">Chưa làm<\/span>/g,
    '<span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">Chưa làm</span>'
);

// Fix speed challenge section (Line 2819)
page = page.replace(
    /<div id="speed-challenge-section" className="mt-8 bg-white border border-slate-200 rounded-2xl/g,
    '<div id="speed-challenge-section" className="mt-8 bg-white dark:bg-primary-950/20 border border-slate-200 dark:border-primary-500/20 rounded-2xl'
);

// Fix Actual Test generic list cards
page = page.replace(
    /className="bg-white rounded-3xl/g,
    'className="bg-white dark:bg-primary-950/20 rounded-3xl'
);
page = page.replace(
    /border border-secondary-200/g,
    'border border-secondary-200 dark:border-primary-500/20'
);

// Fix Profile Sidebar card
page = page.replace(
    /className=\{\`flex-1 flex items-center gap-3 px-2 py-2 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors min-w-0 \$\{isSidebarCollapsed \? 'justify-center' : 'text-left'\}\`\}/g,
    "className={`flex-1 flex items-center gap-3 px-2 py-2 rounded-xl bg-slate-50 dark:bg-primary-950/20 border border-slate-100 dark:border-primary-500/20 hover:bg-slate-100 dark:hover:bg-primary-900/30 transition-colors min-w-0 ${isSidebarCollapsed ? 'justify-center' : 'text-left'}`}"
);

page = page.replace(
    /<p className="text-\[13px\] font-bold text-slate-900 truncate">\{session\?\.user\?\.name\}<\/p>/g,
    '<p className="text-[13px] font-bold text-slate-900 dark:text-[#f8fafc] truncate">{session?.user?.name}</p>'
);

page = page.replace(
    /<p className="text-\[11px\] font-medium text-slate-500 truncate mt-0\.5">\{session\?\.user\?\.email\}<\/p>/g,
    '<p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate mt-0.5">{session?.user?.email}</p>'
);

fs.writeFileSync(pagePath, page);
console.log('Fixed more white backgrounds in page.tsx');
