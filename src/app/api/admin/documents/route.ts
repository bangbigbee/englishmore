import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const documents = await prisma.toeicDocument.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, data: documents });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();

    const doc = await prisma.toeicDocument.create({
      data: {
        title: data.title,
        description: data.description,
        content: data.content,
        fileUrl: data.fileUrl,
        fileType: data.fileType,
        fileName: data.fileName,
        fileSize: data.fileSize,
        category: data.category,
        isActive: data.isActive !== undefined ? data.isActive : true
      }
    });

    return NextResponse.json({ success: true, data: doc });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
