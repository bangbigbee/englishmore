import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const documents = await prisma.toeicDocument.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, data: documents });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
