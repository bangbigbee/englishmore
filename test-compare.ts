import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const existingItems = await prisma.vocabularyItem.findMany({
    where: { category: 'TOEIC' },
    select: { word: true, meaning: true }
  });
  
  const myWords = [
    'Menu',       'Waiter / Waitress',
    'Beverage',   'Reservation',
    'Ingredient', 'Bill',
    'Service',    'Order',
    'Dessert',    'Chef',
    'Appetizer',  'Recipe',
    'Flavor',     'Buffet',
    'Cuisine'
  ];
  
  const presentWords = myWords.filter(mw => 
    existingItems.some(ei => ei.word.toLowerCase() === mw.toLowerCase())
  );
  console.log('Words that exist:', presentWords);
}
main().finally(() => prisma.$disconnect());
