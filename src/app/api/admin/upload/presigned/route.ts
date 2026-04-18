import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { filename, contentType } = await req.json();

    if (!filename || !contentType) {
      return NextResponse.json({ error: "Filename and contentType are required" }, { status: 400 });
    }

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

    const safeFilename = `toeic-${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, "-")}`;

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: safeFilename,
      ContentType: contentType,
    });

    // Generate Pre-signed URL valid for 1 hour
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    const publicUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${safeFilename}`;

    return NextResponse.json({ success: true, uploadUrl, publicUrl });
  } catch (error) {
    console.error("Presigned URL error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Internal Server Error" 
    }, { status: 500 });
  }
}
