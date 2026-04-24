const fs = require('fs');
let code = fs.readFileSync('src/app/toeic-practice/upgrade/page.tsx', 'utf8');
code = code.replace(/\\\$\{/g, '${');
fs.writeFileSync('src/app/toeic-practice/upgrade/page.tsx', code);
console.log('Fixed literal \\${');
