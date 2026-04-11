const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.course.findMany().then(c => console.log('Courses:', c.map(x => ({ id: x.id, title: x.title, isPublished: x.isPublished })))).catch(console.error).finally(() => p.$disconnect());
