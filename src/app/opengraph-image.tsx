import { ImageResponse } from 'next/og'
 
export const runtime = 'edge'
export const alt = 'EnglishMore - English Learning Platform'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
 
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(to bottom right, #f8fafc, #f1f5f9)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', fontSize: 130, fontWeight: 900, letterSpacing: '-0.05em' }}>
          <span style={{ color: '#581c87' }}>English</span>
          <span style={{ color: '#ea980c' }}>More</span>
        </div>
        <div style={{ marginTop: 40, fontSize: 40, color: '#475569', fontWeight: 600 }}>
          Hệ thống học tập và điểm số thông minh
        </div>
      </div>
    ),
    { ...size }
  )
}
