import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const images = await prisma.landingGalleryImage.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
      select: {
        id: true,
        courseId: true,
        section: true,
        mimeType: true,
        course: { select: { title: true, galleryAnimation: true } }
      }
    })
    const generalSettings = await prisma.course.findUnique({
      where: { id: 'general_gallery_settings' },
      select: { galleryAnimation: true }
    });

    const formatImages = images.map(img => {
      if (!img.courseId) {
         return {
           ...img,
           course: {
             title: '',
             galleryAnimation: generalSettings?.galleryAnimation || 'vertical'
           }
         }
      }
      return img;
    });

    return NextResponse.json(formatImages)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}
