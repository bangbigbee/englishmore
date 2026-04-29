import fs from 'fs';
import path from 'path';

const targetPath = path.join(process.cwd(), 'src/components/InteractiveListeningModal.tsx');
let content = fs.readFileSync(targetPath, 'utf8');

// Gradient opacity adjust to make image more visible
content = content.replace(
  /rgba\(255,255,255,0\.8\), rgba\(255,255,255,0\.95\)/g,
  'rgba(255,255,255,0.4), rgba(255,255,255,0.85)'
);

// Amber buttons -> Secondary theme (yellow)
content = content.replace(/bg-amber-400/g, 'bg-secondary-500');
content = content.replace(/bg-amber-300/g, 'bg-secondary-400');
content = content.replace(/text-\[\#020617\]/g, 'text-primary-900');
content = content.replace(/text-amber-400/g, 'text-secondary-500');
content = content.replace(/text-amber-300/g, 'text-secondary-400');
content = content.replace(/rgba\(251,191,36/g, 'rgba(234,152,12'); // secondary-500 approx RGB

// Text fix
// In tabs, when active it was "text-[#020617]". Replaced above with primary-900.
// But some text colors are text-slate-800, maybe I should ensure the title and important texts are primary-900.
content = content.replace(/text-slate-800/g, 'text-primary-900');

fs.writeFileSync(targetPath, content, 'utf8');
console.log('Successfully applied theme colors to dictation modal');
