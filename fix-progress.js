const fs = require('fs');
const pagePath = 'src/app/toeic-practice/page.tsx';
let page = fs.readFileSync(pagePath, 'utf8');

page = page.replace(
    /text-primary-600 bg-primary-50 px-2 py-0\.5 rounded-full border border-primary-100/g,
    'text-primary-600 dark:text-primary-300 bg-primary-50 dark:bg-primary-900/40 px-2 py-0.5 rounded-full border border-primary-100 dark:border-primary-700/50'
);

page = page.replace(
    /bg-slate-100 text-slate-500 flex items-center justify-center transition-colors duration-300/g,
    'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-300 flex items-center justify-center transition-colors duration-300'
);

fs.writeFileSync(pagePath, page);
console.log('Fixed progress pill in cards');
