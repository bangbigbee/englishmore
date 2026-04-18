const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

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
    const uploadCommand = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: 'test-file.txt',
      Body: 'Hello World',
      ContentType: 'text/plain'
    });
    
    console.log('Endpoint:', endpoint);
    console.log('Bucket:', process.env.R2_BUCKET_NAME);
    
    await s3Client.send(uploadCommand);
    console.log('Upload success');
  } catch(e) {
    console.error('Error:', e);
  }
}
main();
