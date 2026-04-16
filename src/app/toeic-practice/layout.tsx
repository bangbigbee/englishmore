import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ToeicMore - Chinh phục TOEIC',
  description: 'Hệ thống luyện thi TOEIC thực chiến, hỗ trợ sát sao, và mang lại hiệu quả cao nhất dành cho bạn.',
  openGraph: {
    title: 'ToeicMore - Chinh phục TOEIC',
    description: 'Hệ thống luyện thi TOEIC thực chiến, hỗ trợ sát sao, và mang lại hiệu quả cao nhất dành cho bạn.',
    url: 'https://toeicmore.com',
    siteName: 'ToeicMore',
    locale: 'vi_VN',
    type: 'website',
  },
}

export default function ToeicPracticeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
