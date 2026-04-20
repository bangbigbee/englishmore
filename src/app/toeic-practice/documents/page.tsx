import { prisma } from '@/lib/prisma'
import FooterContentClient from '@/components/FooterContentClient'

export const dynamic = 'force-dynamic'

export default async function ToeicDocumentsPage() {
    let items = []
    try {
        const setting = await prisma.systemSetting.findUnique({
            where: { key: 'footer_content' }
        })
        if (setting && setting.value) {
            const val = setting.value as any
            items = val.documents || []
        }
    } catch (err) {
        console.error(err)
    }

    return (
        <FooterContentClient 
            title="Kho Tài Liệu" 
            items={items} 
            fallbackMessage="Hiện tại chưa có tài liệu nào được chia sẻ. Bạn hãy quay lại sau nhé!" 
        />
    )
}
