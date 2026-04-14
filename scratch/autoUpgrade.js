const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  await prisma.systemSetting.upsert({
    where: { key: 'subscription_pricing' },
    update: {},
    create: {
      key: 'subscription_pricing',
      description: 'Pricing and duration for PRO and ULTRA subscriptions',
      value: {
         PRO: { name: 'PRO', price: 199000, durationMonths: 6 },
         ULTRA: { name: 'ULTRA', price: 499000, durationMonths: 12 }
      }
    }
  });
  console.log('Seeded settings');
}
main().finally(() => prisma.$disconnect());
