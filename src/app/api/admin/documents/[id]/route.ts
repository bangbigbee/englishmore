import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const data = await req.json();

    const doc = await prisma.toeicDocument.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        content: data.content,
        fileUrl: data.fileUrl,
        fileType: data.fileType,
        fileName: data.fileName,
        fileSize: data.fileSize,
        category: data.category,
        isActive: data.isActive
      }
    });

    return NextResponse.json({ success: true, data: doc });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    await prisma.toeicDocument.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
