const { execSync } = require('node:child_process')

const shouldSkip = process.env.SKIP_PRISMA_MIGRATE === '1'
const databaseUrl = process.env.DATABASE_URL
const directUrl = process.env.DIRECT_URL

function looksLikePooledPostgresUrl(value) {
  const normalized = String(value || '').toLowerCase()
  return normalized.includes('pgbouncer') || normalized.includes('pooler') || normalized.includes('pool.')
}

if (shouldSkip) {
  console.log('Skipping prisma migrate deploy because SKIP_PRISMA_MIGRATE=1')
  process.exit(0)
}

if (!databaseUrl) {
  console.log('Skipping prisma migrate deploy because DATABASE_URL is not set')
  process.exit(0)
}

if (!directUrl && looksLikePooledPostgresUrl(databaseUrl)) {
  console.log('Skipping prisma migrate deploy because DATABASE_URL looks like a pooled connection and DIRECT_URL is not set')
  console.log('Set DIRECT_URL to a direct Postgres connection string so production migrations can run during deploy')
  process.exit(0)
}

console.log('Running prisma migrate deploy...')

try {
  execSync('npx prisma migrate deploy', {
    stdio: 'inherit',
    env: {
      ...process.env,
      DATABASE_URL: directUrl || databaseUrl
    }
  })
} catch (error) {
  console.log('prisma migrate deploy failed during build; continuing without blocking deployment')
  if (!directUrl) {
    console.log('Hint: set DIRECT_URL in the deployment environment to a direct Postgres connection string for migrations')
  }
}
