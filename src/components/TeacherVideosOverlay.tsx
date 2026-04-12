'use client'

import { useState, useEffect } from 'react'

type VideoItem = {
  id: string
}

export default function TeacherVideosOverlay() {
  const [videos, setVideos] = useState<VideoItem[]>([])

  useEffect(() => {
    fetch('/api/gallery')
      .then(r => r.json())
      .then((data: any[]) => {
        const teacherVids = data.filter(d => d.section === 'teacher' && d.mimeType?.startsWith('video/'))
        setVideos(teacherVids)
      })
      .catch(console.error)
  }, [])

  if (videos.length === 0) return null

  // Function to create infinite loop of videos but strictly limited to prevent browser choking
  const createInfiniteList = (offset: number) => {
    const shifted = [...videos.slice(offset % videos.length), ...videos.slice(0, offset % videos.length)]
    const minCopies = Math.ceil(6 / shifted.length)
    const evenCopies = minCopies % 2 === 0 ? minCopies : minCopies + 1
    return Array(evenCopies).fill(shifted).flat()
  }

  const colConfigurations = [
    { dir: 'down', delay: '0s' },
    { dir: 'up', delay: '-5s' },
    { dir: 'down', delay: '-10s' }
  ]

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg z-10 opacity-90 group-hover:opacity-100 transition-opacity">
      <div className="absolute inset-0 bg-[#14532d]/20 mix-blend-overlay z-0" />
      <div className="relative z-10 w-full h-full flex gap-2 md:gap-3 justify-center px-2 py-2">
        {colConfigurations.map((config, colIdx) => (
          <div 
            key={colIdx} 
            className={`flex-1 flex flex-col gap-2 md:gap-3 animate-teacher-scroll-${config.dir}`}
            style={{ animationDelay: config.delay }}
          >
            {createInfiniteList(colIdx).map((vid, idx) => (
              <video 
                key={`col${colIdx}-${idx}`}
                src={`/api/gallery/${vid.id}`}
                className="w-full h-auto object-cover rounded-md shadow-sm border border-white/20 bg-black/40"
                autoPlay
                muted
                loop
                playsInline
              />
            ))}
          </div>
        ))}
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes teacherScrollDown {
          0% { transform: translateY(-50%); }
          100% { transform: translateY(0%); }
        }
        @keyframes teacherScrollUp {
          0% { transform: translateY(0%); }
          100% { transform: translateY(-50%); }
        }
        .animate-teacher-scroll-down { animation: teacherScrollDown 35s linear infinite; }
        .animate-teacher-scroll-up { animation: teacherScrollUp 35s linear infinite; }
      `}} />
    </div>
  )
}
