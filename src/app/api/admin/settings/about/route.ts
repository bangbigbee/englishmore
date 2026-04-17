import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
    const setting = await prisma.systemSetting.findUnique({
        where: { key: 'about_page' }
    });
    return NextResponse.json(setting?.value || {});
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    const body = await req.json();
    
    await prisma.systemSetting.upsert({
        where: { key: 'about_page' },
        update: { value: body },
        create: { key: 'about_page', value: body, description: 'About Page Content' }
    });

    return NextResponse.json({ success: true });
}
