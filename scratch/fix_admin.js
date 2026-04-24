const fs = require('fs');

try {
  let content = fs.readFileSync('src/app/admin/page.tsx', 'utf8');

  // We find the exact line to replace using regex to avoid whitespace issues
  const navMatch = content.match(/17\. STAR CONFIG<\/button>\s*<\/nav>/);
  if (navMatch) {
    const navReplacement = "17. STAR CONFIG</button>\n             <button onClick={() => setActiveSection('placementTest')} className={`flex w-full text-left px-4 py-2.5 text-sm font-semibold rounded-lg transition-colors ${activeSection === 'placementTest' ? 'bg-[#581c87]/10 text-[#581c87]' : 'text-slate-600 hover:bg-slate-50'}`}>18. PLACEMENT TEST</button>\n          </nav>";
    content = content.replace(navMatch[0], navReplacement);
    console.log("Replaced nav match");
  } else {
    console.log("Could not find nav match");
  }

  const renderMatch = content.match(/<AdminStarConfig \/>\s*\)\s*}/);
  if (renderMatch) {
    const renderReplacement = "<AdminStarConfig />\n          )}\\n\\n          {activeSection === 'placementTest' && (\n            <AdminPlacementTest />\n          )}";
    content = content.replace(renderMatch[0], renderReplacement.replace(/\\n/g, '\n'));
    console.log("Replaced render match");
  } else {
    console.log("Could not find render match");
  }

  fs.writeFileSync('src/app/admin/page.tsx', content);
} catch (e) {
    console.error(e);
}
