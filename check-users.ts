import { prisma } from './src/lib/prisma'

async function checkUsers() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true }
  })
  console.table(users)
  process.exit(0)
}

checkUsers().catch(console.error)
