import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Cấu hình S3 Client cho Cloudflare R2
const rawEndpoint = process.env.R2_ENDPOINT || '';
const endpoint = rawEndpoint.includes('http') ? new URL(rawEndpoint).origin : rawEndpoint;

const s3Client = new S3Client({
  region: "auto", // R2 yêu cầu "auto"
  endpoint: endpoint,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function POST(req: NextRequest) {
  try {
    // 1. Kiểm tra xác thực Admin
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Lấy file từ req
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // 3. Chuẩn bị file đẩy lên R2
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Đổi tên file (ví dụ: toeic-168123123-audio-part1.mp3)
    const fileName = `toeic-${Date.now()}-${file.name.replace(/\s+/g, "-")}`;

    // 4. Upload lên R2
    const uploadCommand = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: fileName,
      Body: buffer,
      ContentType: file.type
    });

    await s3Client.send(uploadCommand);

    // 5. Trả về link R2 cho frontend lưu vào DB
    const publicUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${fileName}`;

    return NextResponse.json({ 
      success: true, 
      url: publicUrl 
    });
    
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Internal Server Error" 
    }, { status: 500 });
  }
}
