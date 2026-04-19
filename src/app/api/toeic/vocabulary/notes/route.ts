import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { tagId, note } = body;

        if (!tagId) {
            return NextResponse.json({ error: "tagId is required" }, { status: 400 });
        }

        // Verify ownership
        const tag = await prisma.vocabularyTag.findUnique({
            where: { id: tagId },
            select: { userId: true }
        });

        if (!tag) {
            return NextResponse.json({ error: "Tag not found" }, { status: 404 });
        }

        if (tag.userId !== session.user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Update note
        await prisma.vocabularyTag.update({
            where: { id: tagId },
            data: { personalNote: note || null }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating personal note:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
