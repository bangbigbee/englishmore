const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.user.findUnique({where: {email: 'bangdtbk@gmail.com'}}).then(console.log).catch(console.error).finally(()=>p.$disconnect());
