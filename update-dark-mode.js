const fs = require('fs');

const pagePath = 'src/app/toeic-practice/page.tsx';
let page = fs.readFileSync(pagePath, 'utf8');

page = page.replace(/dark:bg-slate-900/g, 'dark:bg-primary-950/40 backdrop-blur-sm');
page = page.replace(/dark:border-slate-700\/50/g, 'dark:border-primary-500/20');
page = page.replace(/dark:border-slate-700\/80/g, 'dark:border-primary-500/20');
page = page.replace(/dark:border-slate-800/g, 'dark:border-primary-500/20');
page = page.replace(/dark:bg-slate-800/g, 'dark:bg-primary-900/40');
page = page.replace(/dark:border-slate-700/g, 'dark:border-primary-500/20');

fs.writeFileSync(pagePath, page);
console.log('Updated page.tsx');
