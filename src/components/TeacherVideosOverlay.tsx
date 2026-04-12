'use client'

import { useState, useEffect } from 'react'

type VideoItem = {
  id: string
}

type ActiveVideo = {
  id: string
  vid: VideoItem
  left: string
  top: string
  rotate: string
  scale: string
  zIndex: number
}

export default function TeacherVideosOverlay() {
  const [videos, setVideos] = useState<VideoItem[]>([])
  const [activeVideos, setActiveVideos] = useState<ActiveVideo[]>([])

  useEffect(() => {
    fetch('/api/gallery')
      .then(r => r.json())
      .then((data: any[]) => {
        const teacherVids = data.filter(d => d.section === 'teacher' && d.mimeType?.startsWith('video/'))
        setVideos(teacherVids)
      })
      .catch(console.error)
  }, [])

  useEffect(() => {
    if (videos.length === 0) return

    const addRandomVideo = () => {
      const randomVid = videos[Math.floor(Math.random() * videos.length)]
      const newActive: ActiveVideo = {
        id: Math.random().toString(36).substring(7),
        vid: randomVid,
        left: `${Math.floor(Math.random() * 60) + 10}%`,
        top: `${Math.floor(Math.random() * 20) - 10}%`,
        rotate: `rotate(${Math.floor(Math.random() * 20) - 10}deg)`,
        scale: `scale(${Math.random() * 0.2 + 0.9})`,
        zIndex: Math.floor(Math.random() * 10) + 10
      }

      setActiveVideos(prev => [...prev, newActive])

      // Xóa video sau 7 giây
      setTimeout(() => {
        setActiveVideos(prev => prev.filter(v => v.id !== newActive.id))
      }, 7000)
    }

    addRandomVideo()
    const interval = setInterval(addRandomVideo, 3000)

    return () => clearInterval(interval)
  }, [videos])

  if (videos.length === 0) return null

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
      <div className="absolute inset-0 bg-[#14532d]/30 mix-blend-overlay" />
      {activeVideos.map(active => (
        <div 
          key={active.id}
          className="absolute w-32 h-56 sm:w-40 sm:h-72 animate-fade-in-out"
          style={{
            left: active.left,
            top: active.top,
            zIndex: active.zIndex
          }}
        >
          <video 
            src={`/api/gallery/${active.vid.id}`}
            className="w-full h-full object-cover rounded-xl shadow-2xl border-2 border-white/30 bg-black/40"
            style={{
              transform: `${active.rotate} ${active.scale}`,
            }}
            autoPlay
            muted
            loop
            playsInline
          />
        </div>
      ))}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateY(20px); }
          15% { opacity: 1; transform: translateY(0px); }
          85% { opacity: 1; transform: translateY(0px); }
          100% { opacity: 0; transform: translateY(-20px); }
        }
        .animate-fade-in-out {
          animation: fadeInOut 7s ease-in-out forwards;
        }
      `}} />
    </div>
  )
}
