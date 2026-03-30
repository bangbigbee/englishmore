-- Tạo admin user cho bangdtbk@gmail.com
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
  role = 'admin';

-- Tạo sample courses
INSERT INTO "Course" (id, title, description, "registrationDeadline", "maxStudents", "isPublished", "isActive", code, price, currency, "startDate", "endDate", "totalLessons", method, teacher, "createdAt", "updatedAt")
SELECT 
  'sample-course-1',
  'TOEFL Preparation',
  'Intensive TOEFL preparation course',
  '2026-03-31T23:59:59.999Z',
  30,
  true,
  true,
  'COURSE_001',
  2000000,
  'VND',
  '2026-04-01T00:00:00.000Z',
  '2026-06-30T23:59:59.999Z',
  20,
  'PPF',
  'John Doe',
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM "Course" WHERE id = 'sample-course-1');

INSERT INTO "Course" (id, title, description, "registrationDeadline", "maxStudents", "isPublished", "isActive", code, price, currency, "startDate", "endDate", "totalLessons", method, teacher, "createdAt", "updatedAt")
SELECT
  'sample-course-2',
  'English Conversation',
  'Daily English conversation practice',
  '2026-04-04T23\:59:59.999Z',
  20,
  true,
  true,
  'COURSE_002',
  1500000,
  'VND',
  '2026-04-05T00:00:00.000Z',
  '2026-07-05T23:59:59.999Z',
  30,
  'Beyond',
  'Jane Smith',
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM "Course" WHERE id = 'sample-course-2');

SELECT 'Database seeded successfully!' as result;
