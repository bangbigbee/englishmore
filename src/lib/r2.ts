import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3"

export async function deleteFileFromR2(publicUrl: string | null) {
  if (!publicUrl) return;
  
  try {
     const urlParts = publicUrl.split('/');
     const key = urlParts[urlParts.length - 1]; 
     if (!key) return;

     const rawEndpoint = process.env.R2_ENDPOINT || '';
     const endpoint = rawEndpoint.includes('http') ? new URL(rawEndpoint).origin : rawEndpoint;

     const s3Client = new S3Client({
      region: "auto",
      endpoint: endpoint,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });

    await s3Client.send(new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key
    }));
    console.log(`[R2 Cleanup] Successfully deleted: ${key}`);
  } catch(e) {
    console.error(`[R2 Cleanup] Failed to delete: ${publicUrl}`, e);
  }
}
