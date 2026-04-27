const fs = require('fs');
const file = '/Users/admin/englishmore/src/app/toeic-practice/grammar/[slug]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Find the start of the !lessonStarted block
const startIdx = content.indexOf('{!lessonStarted ? (');
if (startIdx === -1) {
    console.log("Could not find start");
    process.exit(1);
}

// Find the end of it (the first `) : (` before `isPlayingDirections ?`)
const isPlayingIdx = content.indexOf('{isPlayingDirections ? (', startIdx);
if (isPlayingIdx === -1) {
    console.log("Could not find isPlayingDirections");
    process.exit(1);
}

// The block ends around here
const middleIdx = content.lastIndexOf(') : (', isPlayingIdx);

// We need the content inside {!lessonStarted ? (  ... ) : (
const sansangContentRaw = content.substring(startIdx + '{!lessonStarted ? ('.length, middleIdx).trim();

// Now we want to remove the !lessonStarted block and its wrapping `) : (` and `</>`
// Wait, the structure is:
/*
                      {!lessonStarted ? (
                        <div ...>
                           ...
                        </div>
                      ) : (
                        <>
                          {isPlayingDirections ? (
*/

// Let's replace the whole structure.
const newContent1 = content.replace(content.substring(startIdx, isPlayingIdx), '');

// Now we need to insert the sansang content inside the motion.div
const motionDivIdx = newContent1.indexOf('className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 p-5 md:p-8 relative overflow-hidden h-full flex flex-col"');
if (motionDivIdx === -1) {
    console.log("Could not find motion div");
    process.exit(1);
}
const motionDivCloseIdx = newContent1.indexOf('>', motionDivIdx);

const overlayStr = `
                                        {!lessonStarted && (
                                            <div className="absolute inset-0 z-50 bg-white/60 backdrop-blur-md flex flex-col items-center justify-center p-4">
                                                <div className="w-full max-w-xl mx-auto shadow-2xl shadow-slate-200/50 rounded-3xl bg-white border border-slate-100 overflow-hidden transform transition-all">
                                                    \${sansangContentRaw}
                                                </div>
                                            </div>
                                        )}
`;

// Inject it
let newContent2 = newContent1.substring(0, motionDivCloseIdx + 1) + overlayStr.replace('${sansangContentRaw}', sansangContentRaw) + newContent1.substring(motionDivCloseIdx + 1);

// We also need to remove the closing tags of the removed block
// Look for `</AnimatePresence>`
const animateIdx = newContent2.lastIndexOf('</AnimatePresence>');
// Wait, the closing of `) : (` is at the very end of the `{!lessonStarted` block.
// The structure was:
/*
                      {!lessonStarted ? ( ... ) : (
                        <>
                          {isPlayingDirections ? ( ... ) : (
                            <>
                               <AnimatePresence mode="wait"> ... </AnimatePresence>
                            </>
                          )}
                        </>
                      )}
*/
// Let's fix the bottom closures.
// The easiest way is to use regex or string replace at the end.
newContent2 = newContent2.replace(/<\/AnimatePresence>\s*<\/>\s*\)}\s*<\/>\s*\)}/, '</AnimatePresence>\n                          )}\n                        </>');

fs.writeFileSync(file, newContent2);
console.log("Done");
