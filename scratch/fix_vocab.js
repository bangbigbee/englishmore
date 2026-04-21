const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const questions = await prisma.toeicQuestion.findMany({
    where: { vocabulary: { not: '[]' } }
  })
  
  let updatedCount = 0;
  for (const q of questions) {
    if (!q.vocabulary || !Array.isArray(q.vocabulary) || q.vocabulary.length === 0) continue;
    
    let needsUpdate = false;
    const newVocab = q.vocabulary.map((v) => {
      let word = v.word || '';
      let meaning = v.meaning || '';
      
      if (word.length === 1 && meaning && !meaning.startsWith(' ')) {
        const fullStr = word + meaning;
        let parsedWord = fullStr;
        let parsedMeaning = '';
        
        const match = fullStr.match(/^([^\(:\-]+?)\s*(?:\(([^)]+)\))?\s*[:\-]\s*(.+)$/);
        if (match) {
            parsedWord = match[1].trim();
            if (match[2]) parsedWord += ` (${match[2].trim()})`;
            parsedMeaning = match[3].trim();
        } else if (fullStr.includes(':')) {
            const parts = fullStr.split(':');
            parsedWord = parts[0].trim();
            parsedMeaning = parts.slice(1).join(':').trim();
        } else if (fullStr.includes('-')) {
            const parts = fullStr.split('-');
            parsedWord = parts[0].trim();
            parsedMeaning = parts.slice(1).join('-').trim();
        } else {
            // Unchanged if can't parse
            parsedWord = word;
            parsedMeaning = meaning;
        }
        needsUpdate = true;
        return { word: parsedWord, meaning: parsedMeaning };
      }
      return v;
    });
    
    if (needsUpdate) {
      await prisma.toeicQuestion.update({
        where: { id: q.id },
        data: { vocabulary: newVocab }
      });
      updatedCount++;
    }
  }
  console.log(`Updated ${updatedCount} questions`);
}
main().catch(console.error)
