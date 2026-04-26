import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const resolvedParams = await params;
        const id = resolvedParams.id;
        
        // Documents are stored in SystemSetting under key 'footer_content'
        const setting = await prisma.systemSetting.findUnique({
            where: { key: 'footer_content' }
        });

        if (!setting || !setting.value) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        const data: any = setting.value;
        let updated = false;

        if (data.documents && Array.isArray(data.documents)) {
            data.documents = data.documents.map((doc: any) => {
                if (doc.id === id) {
                    updated = true;
                    return {
                        ...doc,
                        downloadCount: (doc.downloadCount || 0) + 1
                    };
                }
                return doc;
            });
        }

        if (updated) {
            await prisma.systemSetting.update({
                where: { key: 'footer_content' },
                data: { value: data }
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[POST /api/public/documents/[id]/download] Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
