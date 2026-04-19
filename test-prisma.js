const { PrismaClient } = require('@prisma/client'); 
const prisma = new PrismaClient(); 

async function main() { 
    try { 
        const res = await prisma.vocabularyTag.findMany({ 
            where: { 
                vocabulary: { 
                    OR: [{ word: { contains: 'hello' } }] 
                } 
            } 
        }); 
        console.log('success', res.length); 
    } catch (e) { 
        console.error('Prisma Error:', e.message); 
    } finally { 
        await prisma.$disconnect(); 
    } 
} 
main();
