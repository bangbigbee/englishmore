const fs = require('fs');
let content = fs.readFileSync('./src/app/toeic-practice/page.tsx', 'utf8');

const regexFix = /\s*\{p\.subtitle\}\s*<span className=\{`ml-1 px-2\.5 py-0\.5 rounded-full text-\[11px\] font-bold transition-colors \$\{isActive \? colors\.countActiveBg : colors\.countBg\}`\}>\s*\{totalLessons\}\s*<\/span>\s*<\/button>\s*\);\s*\}\)}\s*<\/div>/g;

content = content.replace(regexFix, '');

fs.writeFileSync('./src/app/toeic-practice/page.tsx', content);
console.log('done');
