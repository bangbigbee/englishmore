import { prisma } from '@/lib/prisma'
import FooterContentClient from '@/components/FooterContentClient'

export const dynamic = 'force-dynamic'

export default async function ToeicExperiencePage() {
    let items = []
    try {
        const setting = await prisma.systemSetting.findUnique({
            where: { key: 'footer_content' }
        })
        if (setting && setting.value) {
            const val = setting.value as any
            items = val.experiences || []
        }
    } catch (err) {
        console.error(err)
    }

    return (
        <FooterContentClient 
            title="Kinh Nghiệm Học & Thi" 
            items={items} 
            fallbackMessage="Hiện tại chưa có bài chia sẻ trải nghiệm nào. Bạn hãy quay lại sau nhé!" 
        />
    )
}
