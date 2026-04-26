const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src');

const replacements = [
  // Hex to semantic
  { regex: /\[#581c87\]/g, replacement: 'primary-900' },
  { regex: /\[#6b21a8\]/g, replacement: 'primary-800' },
  { regex: /\[#7e22ce\]/g, replacement: 'primary-700' },
  { regex: /\[#9333ea\]/g, replacement: 'primary-600' },
  { regex: /\[#a855f7\]/g, replacement: 'primary-500' },
  { regex: /\[#c084fc\]/g, replacement: 'primary-400' },
  { regex: /\[#d8b4fe\]/g, replacement: 'primary-300' },
  { regex: /\[#e9d5ff\]/g, replacement: 'primary-200' },
  { regex: /\[#f3e8ff\]/g, replacement: 'primary-100' },
  { regex: /\[#faf5ff\]/g, replacement: 'primary-50' },
  
  { regex: /\[#451a03\]/g, replacement: 'secondary-950' },
  { regex: /\[#78350f\]/g, replacement: 'secondary-900' },
  { regex: /\[#92400e\]/g, replacement: 'secondary-800' },
  { regex: /\[#b45309\]/g, replacement: 'secondary-700' },
  { regex: /\[#d97706\]/g, replacement: 'secondary-600' },
  { regex: /\[#f59e0b\]/g, replacement: 'secondary-500' },
  { regex: /\[#fbbf24\]/g, replacement: 'secondary-400' },
  { regex: /\[#fcd34d\]/g, replacement: 'secondary-300' },
  { regex: /\[#fde68a\]/g, replacement: 'secondary-200' },
  { regex: /\[#fef3c7\]/g, replacement: 'secondary-100' },
  { regex: /\[#fffbeb\]/g, replacement: 'secondary-50' },

  // Tailwind classes to semantic
  { regex: /\bpurple-950\b/g, replacement: 'primary-950' },
  { regex: /\bpurple-900\b/g, replacement: 'primary-900' },
  { regex: /\bpurple-800\b/g, replacement: 'primary-800' },
  { regex: /\bpurple-700\b/g, replacement: 'primary-700' },
  { regex: /\bpurple-600\b/g, replacement: 'primary-600' },
  { regex: /\bpurple-500\b/g, replacement: 'primary-500' },
  { regex: /\bpurple-400\b/g, replacement: 'primary-400' },
  { regex: /\bpurple-300\b/g, replacement: 'primary-300' },
  { regex: /\bpurple-200\b/g, replacement: 'primary-200' },
  { regex: /\bpurple-100\b/g, replacement: 'primary-100' },
  { regex: /\bpurple-50\b/g, replacement: 'primary-50' },

  { regex: /\bamber-950\b/g, replacement: 'secondary-950' },
  { regex: /\bamber-900\b/g, replacement: 'secondary-900' },
  { regex: /\bamber-800\b/g, replacement: 'secondary-800' },
  { regex: /\bamber-700\b/g, replacement: 'secondary-700' },
  { regex: /\bamber-600\b/g, replacement: 'secondary-600' },
  { regex: /\bamber-500\b/g, replacement: 'secondary-500' },
  { regex: /\bamber-400\b/g, replacement: 'secondary-400' },
  { regex: /\bamber-300\b/g, replacement: 'secondary-300' },
  { regex: /\bamber-200\b/g, replacement: 'secondary-200' },
  { regex: /\bamber-100\b/g, replacement: 'secondary-100' },
  { regex: /\bamber-50\b/g, replacement: 'secondary-50' },
];

// Keep raw hex values inside CSS or inline styles if they are not in a tailwind arbitrary value `[...]`.
// But we also need to replace standalone hex values. Wait, replacing standalone #581c87 inside strings or standard CSS might break things or is exactly what we want.
// Let's also replace raw hex codes.
const rawHexReplacements = [
  { regex: /#581c87/gi, replacement: 'var(--primary-900)' },
  { regex: /#6b21a8/gi, replacement: 'var(--primary-800)' },
  { regex: /#7e22ce/gi, replacement: 'var(--primary-700)' },
  { regex: /#9333ea/gi, replacement: 'var(--primary-600)' },
  { regex: /#a855f7/gi, replacement: 'var(--primary-500)' },
  { regex: /#c084fc/gi, replacement: 'var(--primary-400)' },
  { regex: /#d8b4fe/gi, replacement: 'var(--primary-300)' },
  { regex: /#e9d5ff/gi, replacement: 'var(--primary-200)' },
  { regex: /#f3e8ff/gi, replacement: 'var(--primary-100)' },
  { regex: /#faf5ff/gi, replacement: 'var(--primary-50)' },
  
  { regex: /#451a03/gi, replacement: 'var(--secondary-950)' },
  { regex: /#78350f/gi, replacement: 'var(--secondary-900)' },
  { regex: /#92400e/gi, replacement: 'var(--secondary-800)' },
  { regex: /#b45309/gi, replacement: 'var(--secondary-700)' },
  { regex: /#d97706/gi, replacement: 'var(--secondary-600)' },
  { regex: /#f59e0b/gi, replacement: 'var(--secondary-500)' },
  { regex: /#fbbf24/gi, replacement: 'var(--secondary-400)' },
  { regex: /#fcd34d/gi, replacement: 'var(--secondary-300)' },
  { regex: /#fde68a/gi, replacement: 'var(--secondary-200)' },
  { regex: /#fef3c7/gi, replacement: 'var(--secondary-100)' },
  { regex: /#fffbeb/gi, replacement: 'var(--secondary-50)' },
];

function processDirectory(directory) {
  const files = fs.readdirSync(directory);

  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (stat.isFile() && (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.css'))) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;

      // First apply tailwind replacements
      for (const { regex, replacement } of replacements) {
        content = content.replace(regex, replacement);
      }

      // Then apply raw hex replacements, but BE CAREFUL not to replace if it's already inside a string like `var(--primary-900)`. 
      // Actually, if we apply tailwind replacements first, `[#581c87]` is already gone. So the remaining `#581c87` are standalone (in styles or objects).
      for (const { regex, replacement } of rawHexReplacements) {
        content = content.replace(regex, replacement);
      }

      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

processDirectory(srcDir);
console.log('Refactoring complete.');
