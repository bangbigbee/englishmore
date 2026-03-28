import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function seed() {
  try {
    // Check if admin exists
    const adminUser = await prisma.user.findFirst({
      where: { role: 'admin' }
    })

    if (!adminUser) {
      // Create default admin user
      const hashedPassword = await bcrypt.hash('admin@123', 10)
      const admin = await prisma.user.create({
        data: {
          email: 'admin@englishmore.com',
          name: 'Admin',
          password: hashedPassword,
          role: 'admin'
        }
      })

      console.log('Admin user created successfully!')
      console.log(`Email: ${admin.email}`)
      console.log(`Password: admin@123`)
    } else {
      console.log('Admin user already exists.')
    }

    // Show all users and their roles
    const allUsers = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true }
    })
    console.log('\nAll users in database:')
    console.table(allUsers)
  } catch (error) {
    console.error('Error seeding database:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seed()
