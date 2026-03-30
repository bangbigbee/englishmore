import { PrismaClient, UserRole } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function seed() {
  try {
    // Tạo admin user bằng raw SQL để tránh lỗi enum
    await prisma.$executeRawUnsafe(`
      INSERT INTO "User" (id, email, name, role, "emailVerified", "createdAt", "updatedAt")
      VALUES (
        gen_random_uuid()::text,
        'bangdtbk@gmail.com',
        'Admin',
        'admin',
        NOW(),
        NOW(),
        NOW()
      )
      ON CONFLICT (email) DO UPDATE SET 
        name = 'Admin',
        role = 'admin'
    `)

    console.log('✅ Admin user created/updated successfully!')
    console.log(`📧 Email: bangdtbk@gmail.com`)
    console.log(`👤 Name: Admin`)
    console.log(`🔐 Role: admin`)

    // Create sample courses with raw SQL
    await prisma.$executeRawUnsafe(`
      INSERT INTO "Course" (id, title, description, "registrationDeadline", "maxStudents", "isPublished", "isActive", code, price, currency, "startDate", "endDate", "totalLessons", method, teacher, "createdAt", "updatedAt")
      SELECT 
        'sample-course-1',
        'TOEFL Preparation',
        'Intensive TOEFL preparation course',
        '2026-03-31T23:59:59.999Z'::TIMESTAMP,
        30,
        true,
        true,
        'COURSE_001',
        3800000,
        'VND',
        '2026-04-01T00:00:00.000Z'::TIMESTAMP,
        '2026-06-30T23:59:59.999Z'::TIMESTAMP,
        20,
        'PPF',
        'John Doe',
        NOW(),
        NOW()
      WHERE NOT EXISTS (SELECT 1 FROM "Course" WHERE id = 'sample-course-1')
    `)

    await prisma.$executeRawUnsafe(`
      INSERT INTO "Course" (id, title, description, "registrationDeadline", "maxStudents", "isPublished", "isActive", code, price, currency, "startDate", "endDate", "totalLessons", method, teacher, "createdAt", "updatedAt")
      SELECT
        'sample-course-2',
        'English Conversation',
        'Daily English conversation practice',
        '2026-04-04T23:59:59.999Z'::TIMESTAMP,
        20,
        true,
        true,
        'COURSE_002',
        3800000,
        'VND',
        '2026-04-05T00:00:00.000Z'::TIMESTAMP,
        '2026-07-05T23:59:59.999Z'::TIMESTAMP,
        30,
        'Beyond',
        'Jane Smith',
        NOW(),
        NOW()
      WHERE NOT EXISTS (SELECT 1 FROM "Course" WHERE id = 'sample-course-2')
    `)

    console.log('\n✅ Sample courses created!')
    console.log(`📚 Course 1: TOEFL Preparation (COURSE_001) - 3.800.000đ`)
    console.log(`📚 Course 2: English Conversation (COURSE_002) - 3.800.000đ`)

    // Show all data in database
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true }
    })
    const courses = await prisma.course.findMany({
      select: { id: true, code: true, title: true, price: true, maxStudents: true }
    })

    console.log('\n📋 All users:')
    console.table(users)
    
    console.log('\n📚 All courses:')
    console.table(courses)
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

seed()
