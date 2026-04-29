import { MetadataRoute } from 'next';
import { headers } from 'next/headers';

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const headersList = await headers();
  const host = headersList.get('host') || '';
  const isToeicDomain = host.includes('toeicmore');

  if (isToeicDomain) {
    return {
      name: 'ToeicMore',
      short_name: 'ToeicMore',
      description: 'Hệ thống luyện thi TOEIC thực chiến, hỗ trợ sát sao, và mang lại hiệu quả cao nhất dành cho bạn.',
      start_url: '/',
      display: 'standalone',
      background_color: '#ffffff',
      theme_color: '#4c1d95',
      icons: [
        {
          src: '/toeicmoreicon.svg',
          sizes: 'any',
          type: 'image/svg+xml',
          purpose: 'maskable',
        },
      ],
    };
  }

  return {
    name: 'EnglishMore',
    short_name: 'EnglishMore',
    description: 'English Learning Platform',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#4c1d95',
    icons: [
      {
        src: '/favicon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
}
