import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ recordId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const resolvedParams = await params;
        const record = await prisma.toeicTestRecord.findUnique({
            where: { id: resolvedParams.recordId }
        });

        if (!record) {
            return NextResponse.json({ success: false, error: 'Record not found' }, { status: 404 });
        }

        if (record.userId !== session.user.id) {
            return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
        }

        return NextResponse.json({ success: true, record });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
