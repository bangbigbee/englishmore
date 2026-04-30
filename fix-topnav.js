const fs = require('fs');
const path = 'src/components/TopNav.tsx';
let content = fs.readFileSync(path, 'utf8');

// Fix Drawer background
content = content.replace(
    /className=\{\`fixed inset-y-0 left-0 w-\[280px\] bg-white shadow-2xl/g,
    'className={`fixed inset-y-0 left-0 w-[280px] bg-white dark:bg-[#07160d] dark:border-r dark:border-primary-500/20 shadow-2xl'
);

content = content.replace(
    /className=\{\`absolute left-0 top-0 z-10 flex h-screen w-\[min\(20rem,85vw\)\] flex-col border-r border-slate-200 bg-white shadow-2xl/g,
    'className={`absolute left-0 top-0 z-10 flex h-screen w-[min(20rem,85vw)] flex-col border-r border-slate-200 dark:border-primary-500/20 bg-white dark:bg-[#07160d] shadow-2xl'
);

// Fix Menu Items
content = content.replace(
    /const className = \`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all text-left \$\{isActive \? 'bg-primary-50 text-primary-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'\}\`;/g,
    "const className = `w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all text-left ${isActive ? 'bg-primary-50 dark:bg-primary-600/30 text-primary-700 dark:text-primary-100 shadow-sm' : 'text-slate-500 dark:text-white hover:bg-slate-50 dark:hover:bg-primary-950/40 hover:text-slate-900 dark:hover:text-white'}`;"
);

content = content.replace(
    /<div className=\{\`\$\{isActive \? 'text-primary-600' : 'text-slate-400'\}\`\}>/g,
    "<div className={`${isActive ? 'text-primary-600 dark:text-primary-300' : 'text-slate-400 dark:text-white'}`}>"
);

content = content.replace(
    /<span className="text-\[14px\]">\{item.label\}<\/span>/g,
    '<span className="text-[14px]">{item.label}</span>'
); // No need to add dark:text-white since parent is white, but just to be sure... actually the parent className sets text color, so it inherits.

// Fix other specific mobile menu items that use bg-slate-50
content = content.replace(
    /bg-slate-50 border border-slate-100 hover:bg-slate-100/g,
    'bg-slate-50 dark:bg-primary-950/20 border border-slate-100 dark:border-primary-500/20 hover:bg-slate-100 dark:hover:bg-primary-900/30'
);

// Bottom drawer section background
content = content.replace(
    /border-t border-slate-200\/60 bg-white/g,
    'border-t border-slate-200/60 dark:border-primary-500/20 bg-white dark:bg-transparent'
);

content = content.replace(
    /p-2 text-slate-400 hover:text-slate-600 bg-slate-50 rounded-full/g,
    'p-2 text-slate-400 hover:text-slate-600 bg-slate-50 dark:bg-primary-950/20 dark:hover:bg-primary-900/30 rounded-full'
);

// EnglishMore Domain mobile menu
content = content.replace(
    /className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50\/80 shrink-0"/g,
    'className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-primary-500/20 bg-slate-50/80 dark:bg-transparent shrink-0"'
);
content = content.replace(
    /text-slate-700 border border-transparent hover:border-slate-100 hover:bg-slate-50 hover:text-slate-900/g,
    'text-slate-700 dark:text-white border border-transparent hover:border-slate-100 dark:hover:border-primary-500/20 hover:bg-slate-50 dark:hover:bg-primary-950/40 hover:text-slate-900 dark:hover:text-white'
);
content = content.replace(
    /bg-primary-50 text-primary-700 border border-primary-200/g,
    'bg-primary-50 dark:bg-primary-600/30 text-primary-700 dark:text-primary-100 border border-primary-200 dark:border-primary-500/20'
);
content = content.replace(
    /bg-slate-50 text-slate-400 group-hover:bg-slate-100/g,
    'bg-slate-50 dark:bg-primary-900/40 text-slate-400 dark:text-slate-300 group-hover:bg-slate-100 dark:group-hover:bg-primary-800/40'
);

fs.writeFileSync(path, content);
console.log('Fixed TopNav mobile drawer colors');
