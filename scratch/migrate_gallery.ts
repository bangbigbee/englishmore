import { PrismaClient } from '@prisma/client'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

const prisma = new PrismaClient()

const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

async function run() {
  console.log('Starting migration...')
  const images = await prisma.landingGalleryImage.findMany()
  console.log(`Found ${images.length} images`)
  
  for (const img of images) {
    if (img.data && img.data.length > 10) {
      console.log(`Uploading ${img.id}...`)
      try {
        await s3Client.send(new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: `landing-gallery/${img.id}`,
            Body: img.data,
            ContentType: img.mimeType
        }))
        console.log(`Uploaded ${img.id}`)
        
        await prisma.landingGalleryImage.update({
            where: { id: img.id },
            data: { data: Buffer.alloc(0) }
        })
        console.log(`Cleared DB data for ${img.id}`)
      } catch(e) {
        console.error(`Failed to upload ${img.id}`, e)
      }
    } else {
        console.log(`Skipping ${img.id} (already empty or invalid)`)
    }
  }
  
  console.log('Done migration')
}

run().catch(console.error).finally(() => prisma.$disconnect())
