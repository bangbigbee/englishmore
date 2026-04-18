const { S3Client, PutBucketCorsCommand } = require('@aws-sdk/client-s3');

const rawEndpoint = process.env.R2_ENDPOINT || '';
const endpoint = rawEndpoint.includes('http') ? new URL(rawEndpoint).origin : rawEndpoint;

const s3Client = new S3Client({
  region: "auto",
  endpoint: endpoint,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

async function main() {
  try {
    const corsCommand = new PutBucketCorsCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedHeaders: ["*"],
            AllowedMethods: ["GET", "PUT", "POST", "DELETE", "HEAD"],
            AllowedOrigins: ["*"],
            ExposeHeaders: ["ETag"],
            MaxAgeSeconds: 3000
          }
        ]
      }
    });
    
    await s3Client.send(corsCommand);
    console.log('CORS configured successfully for bucket:', process.env.R2_BUCKET_NAME);
  } catch(e) {
    console.error('Error configuring CORS:', e);
  }
}
main();
