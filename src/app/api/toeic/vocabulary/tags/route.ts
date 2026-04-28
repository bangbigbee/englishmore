import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function GET(req: NextRequest) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.email) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const user = await prisma.user.findUnique({
			where: { email: session.user.email },
			select: { id: true },
		});

		if (!user) {
			return NextResponse.json({ error: 'User not found' }, { status: 404 });
		}

		const tags = await prisma.vocabularyTag.findMany({
			where: { userId: user.id },
		});

		return NextResponse.json({ tags });
	} catch (error) {
		console.error('Error fetching vocabulary tags:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

export async function POST(req: NextRequest) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.email) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const user = await prisma.user.findUnique({
			where: { email: session.user.email },
			select: { id: true },
		});

		if (!user) {
			return NextResponse.json({ error: 'User not found' }, { status: 404 });
		}

		const body = await req.json();
		const { vocabId, isLearned, isHard, isBookmarked, topicToMaster } = body;

		if (topicToMaster) {
			const vocabItems = await prisma.vocabularyItem.findMany({
				where: { topic: topicToMaster },
				select: { id: true }
			});

			if (vocabItems.length > 0) {
				const promises = vocabItems.map(v => 
					prisma.vocabularyTag.upsert({
						where: { userId_vocabId: { userId: user.id, vocabId: v.id } },
						update: { isLearned: true },
						create: { userId: user.id, vocabId: v.id, isLearned: true }
					})
				);
				await prisma.$transaction(promises);
			}

			revalidatePath('/toeic-progress');
			return NextResponse.json({ success: true, count: vocabItems.length });
		}

		if (!vocabId) {
			return NextResponse.json({ error: 'Missing vocabId' }, { status: 400 });
		}

		const updateData: any = {};
		if (isLearned !== undefined) updateData.isLearned = isLearned;
		if (isHard !== undefined) updateData.isHard = isHard;
		if (isBookmarked !== undefined) updateData.isBookmarked = isBookmarked;

		const tag = await prisma.vocabularyTag.upsert({
			where: {
				userId_vocabId: {
					userId: user.id,
					vocabId: vocabId,
				},
			},
			update: updateData,
			create: {
				userId: user.id,
				vocabId: vocabId,
				isLearned: isLearned || false,
				isHard: isHard || false,
				isBookmarked: isBookmarked || false,
			},
		});

		revalidatePath('/toeic-progress');

		return NextResponse.json({ tag });
	} catch (error) {
		console.error('Error upserting vocabulary tag:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

export async function DELETE(req: NextRequest) {
	try {
        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type') || 'all';

		const session = await getServerSession(authOptions);
		if (!session?.user?.email) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const user = await prisma.user.findUnique({
			where: { email: session.user.email },
			select: { id: true },
		});

		if (!user) {
			return NextResponse.json({ error: 'User not found' }, { status: 404 });
		}

		if (type === 'all') {
            await prisma.vocabularyTag.deleteMany({
                where: { userId: user.id },
            });
        } else if (type === 'learned') {
            await prisma.vocabularyTag.updateMany({
                where: { userId: user.id, isLearned: true },
                data: { isLearned: false }
            });
        } else if (type === 'hard') {
            await prisma.vocabularyTag.updateMany({
                where: { userId: user.id, isHard: true },
                data: { isHard: false }
            });
        } else if (type === 'bookmarked') {
            await prisma.vocabularyTag.updateMany({
                where: { userId: user.id, isBookmarked: true },
                data: { isBookmarked: false }
            });
        }

		revalidatePath('/toeic-progress');

		return NextResponse.json({ success: true, message: `Vocabulary ${type} reset successfully` });
	} catch (error) {
		console.error('Error resetting vocabulary tags:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
