const fs = require('fs');

let code = fs.readFileSync('src/app/vocabulary/page.tsx', 'utf-8');

// Rename HomeContent to VocabularyContent
code = code.replace(/function HomeContent\(\) \{/, 'export default function VocabularyContent() {');

// We can remove LeaderboardSection import and usage
code = code.replace(/import LeaderboardSection from '@\/components\/LeaderboardSection'/g, '');
code = code.replace(/<LeaderboardSection \/>/g, '');

// We can just return ONLY the vocabulary section inside the main container
// The vocabulary section starts with <div className="rounded-lg border border-primary-900\/20 bg-white p-6 shadow-lg sm:p-8">
// and ends after the <section> closing tag.

const returnStartMatch = code.match(/return \(\s*<div className="min-h-screen bg-slate-50 text-slate-900">\s*<main/);
if (returnStartMatch) {
    const returnStartIndex = returnStartMatch.index;
    const returnPrefix = code.slice(0, returnStartIndex);

    // Find the vocabulary section
    const vocabStartStr = '<h2 className="text-2xl font-bold text-primary-900">Vocabulary</h2>';
    const vocabStartIdx = code.indexOf(vocabStartStr);
    
    // It's inside a <div className="rounded-lg border border-primary-900/20 bg-white p-6 shadow-lg sm:p-8">
    // let's grab that whole div.
    
    const divStartIdx = code.lastIndexOf('<div className="rounded-lg border border-primary-900/20 bg-white p-6 shadow-lg sm:p-8">', vocabStartIdx);
    
    // Very hacky but we can just use the original return and strip out the check-in and courses
}

fs.writeFileSync('src/app/vocabulary/page.tsx', code);
