import fs from 'fs';
import path from 'path';

const targetPath = path.join(process.cwd(), 'src/components/InteractiveListeningModal.tsx');
let content = fs.readFileSync(targetPath, 'utf8');

// Replacements

// Main Background
content = content.replace(
  /bg-\[#020617\]/g,
  'bg-white'
);
content = content.replace(
  /rgba\(2,6,23,0\.7\), rgba\(2,6,23,0\.95\)/g,
  'rgba(255,255,255,0.8), rgba(255,255,255,0.95)'
);
content = content.replace(
  /\/images\/dictation-bg\.png/g,
  '/images/dictation-bg-light.png'
);

// Colors
content = content.replace(/bg-\[#0B1120\]/g, 'bg-white');
content = content.replace(/bg-\[#111827\]/g, 'bg-slate-50');
content = content.replace(/border-slate-800\/50/g, 'border-slate-200/50');
content = content.replace(/border-slate-800/g, 'border-slate-200');
content = content.replace(/border-slate-700/g, 'border-slate-200');
content = content.replace(/border-white\/50/g, 'border-primary-500/50');
content = content.replace(/text-slate-200/g, 'text-slate-800');
content = content.replace(/text-slate-300/g, 'text-slate-600');
content = content.replace(/text-slate-400/g, 'text-slate-500');
content = content.replace(/text-slate-500/g, 'text-slate-400');
content = content.replace(/text-white/g, 'text-primary-900');
content = content.replace(/hover:bg-slate-800/g, 'hover:bg-slate-100');
content = content.replace(/hover:text-white/g, 'hover:text-primary-900');
content = content.replace(/bg-slate-800/g, 'bg-slate-100');
content = content.replace(/bg-\[\#020617\]/g, 'bg-white');

// Specifics
content = content.replace(/from-\[#111827\] to-\[#0B1120\]/g, 'from-white to-slate-50');
content = content.replace(/bg-\[\#020617\]\/80/g, 'bg-slate-900/40');
content = content.replace(/text-slate-600 font-bold/g, 'text-slate-400 font-bold');

// Speed masks (before:from-[#020617] -> before:from-white)
content = content.replace(/from-\[#020617\]/g, 'from-white');

fs.writeFileSync(targetPath, content, 'utf8');
console.log('Successfully applied light mode to dictation modal');
