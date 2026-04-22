const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const setting = await prisma.systemSetting.findUnique({
        where: { key: 'footer_content' }
    })
    console.log(JSON.stringify(setting, null, 2))
}
main().catch(console.error).finally(() => prisma.$disconnect())
