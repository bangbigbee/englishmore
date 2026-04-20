import { prisma } from '@/lib/prisma'
import FooterContentClient from '@/components/FooterContentClient'

export const dynamic = 'force-dynamic'

export default async function ToeicReviewsPage() {
    let items = []
    try {
        const setting = await prisma.systemSetting.findUnique({
            where: { key: 'footer_content' }
        })
        if (setting && setting.value) {
            const val = setting.value as any
            items = val.reviews || []
        }
    } catch (err) {
        console.error(err)
    }

    return (
        <FooterContentClient 
            title="Review Đề TOEIC" 
            items={items} 
            fallbackMessage="Hiện tại chưa có bài review nào. Bạn hãy quay lại sau nhé!" 
        />
    )
}
