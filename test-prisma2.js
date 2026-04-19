const { PrismaClient } = require('@prisma/client'); 
const prisma = new PrismaClient(); 

async function main() { 
    try { 
        const allUserTags = await prisma.vocabularyTag.findMany({
            include: { vocabulary: { select: { topic: true } } }
        });
        
        let nullVocabs = 0;
        for (const tag of allUserTags) {
            if (!tag.vocabulary) nullVocabs++;
        }
        console.log('Total tags:', allUserTags.length, 'null vocabs:', nullVocabs);

        // Test the main query
        const tags = await prisma.vocabularyTag.findMany({
            where: {
                vocabulary: {
                    OR: [
                        { word: { contains: 'test' } },
                        { meaning: { contains: 'test' } }
                    ]
                }
            }
        });
        console.log('Main query success:', tags.length);
    } catch (e) { 
        console.error('Prisma Error:', e.message); 
    } finally { 
        await prisma.$disconnect(); 
    } 
} 
main();
