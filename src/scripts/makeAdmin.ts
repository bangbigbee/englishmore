import { prisma } from '@/lib/prisma'

// Script to make a user admin by email
// Usage: npx ts-node-dev src/scripts/makeAdmin.ts email@example.com

async function makeAdmin(email: string) {
  if (!email) {
    console.error('Please provide an email address')
    process.exit(1)
  }

  try {
    const user = await prisma.user.update({
      where: { email },
      data: { role: 'admin' },
      select: { id: true, email: true, name: true, role: true }
    })

    console.log(`✓ User ${user.email} (${user.name}) is now an admin`)
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : 'Unknown error')
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

const email = process.argv[2]
makeAdmin(email)
