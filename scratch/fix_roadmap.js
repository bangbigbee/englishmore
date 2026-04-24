const fs = require('fs');
let code = fs.readFileSync('src/lib/roadmapGenerator.ts', 'utf8');

code = code.replace(/referencePath:\s*['"]\/toeic-practice\/grammar\/[^'"]+['"]/g, 'referencePath: "/toeic-practice?tab=grammar"');
code = code.replace(/referencePath:\s*['"]\/toeic-practice\/grammar['"]/g, 'referencePath: "/toeic-practice?tab=grammar"');
code = code.replace(/referencePath:\s*['"]\/toeic-practice\/actual-test\/[^'"]+['"]/g, 'referencePath: "/toeic-practice?tab=actual-test"');
code = code.replace(/referencePath:\s*['"]\/toeic-practice\/actual-test['"]/g, 'referencePath: "/toeic-practice?tab=actual-test"');
code = code.replace(/referencePath:\s*['"]\/toeic-practice['"]/g, 'referencePath: "/toeic-practice?tab=listening"'); 

// More generic replacement based on taskType
const taskToTab = {
    'GRAMMAR': 'grammar',
    'VOCAB': 'vocabulary',
    'LISTENING': 'listening',
    'READING': 'reading',
    'TEST': 'actual-test',
    'REVIEW': 'actual-test'
};

const lines = code.split('\n');
const newLines = lines.map(line => {
    if (line.includes('taskType:') && line.includes('referencePath:')) {
        const typeMatch = line.match(/taskType:\s*['"]([^'"]+)['"]/);
        if (typeMatch && typeMatch[1]) {
            const tab = taskToTab[typeMatch[1]];
            if (tab) {
                return line.replace(/referencePath:\s*['"][^'"]+['"]/, `referencePath: "/toeic-practice?tab=${tab}"`);
            }
        }
    }
    return line;
});

fs.writeFileSync('src/lib/roadmapGenerator.ts', newLines.join('\n'));
