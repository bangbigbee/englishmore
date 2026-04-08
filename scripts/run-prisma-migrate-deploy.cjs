const { execSync } = require('node:child_process')

const shouldSkip = process.env.SKIP_PRISMA_MIGRATE === '1'
const databaseUrl = process.env.DATABASE_URL

if (shouldSkip) {
  console.log('Skipping prisma migrate deploy because SKIP_PRISMA_MIGRATE=1')
  process.exit(0)
}

if (!databaseUrl) {
  console.log('Skipping prisma migrate deploy because DATABASE_URL is not set')
  process.exit(0)
}

console.log('Running prisma migrate deploy...')
execSync('npx prisma migrate deploy', { stdio: 'inherit' })
