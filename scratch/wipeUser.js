const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.user.deleteMany({where: {email: 'bangdtbk@gmail.com'}}).then(console.log).catch(console.error).finally(()=>prisma.$disconnect());
