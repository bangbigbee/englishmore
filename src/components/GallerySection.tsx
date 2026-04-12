'use client'

import { useEffect, useState } from 'react'

type GalleryImage = {
  id: string
  courseId: string | null
  course?: {
    title: string
    galleryAnimation: string
  }
}

type GroupedGallery = {
  courseId: string | 'general'
  title: string
  animation: string
  images: GalleryImage[]
}

export default function GallerySection() {
  const [groups, setGroups] = useState<GroupedGallery[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await fetch('/api/gallery')
        if (res.ok) {
          const data = await res.json() as GalleryImage[]
          
          const grouped: Record<string, GroupedGallery> = {}
          
          data.forEach(img => {
            const cId = img.courseId || 'general'
            if (!grouped[cId]) {
              grouped[cId] = {
                courseId: cId,
                title: img.course?.title || 'Hoạt Động Chung',
                animation: img.course?.galleryAnimation || 'vertical',
                images: []
              }
            }
            grouped[cId].images.push(img)
          })
          
          setGroups(Object.values(grouped).filter(g => g.images.length > 0))
        }
      } catch (err) {
        console.error('Failed to fetch gallery images', err)
      } finally {
        setLoading(false)
      }
    }
    fetchImages()
  }, [])

  if (loading || groups.length === 0) {
    return null
  }

  return (
    <div className="flex flex-col gap-12 py-20 bg-gray-50 overflow-hidden relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-20 text-center">
        <h2 className="text-3xl font-extrabold text-[#14532d] sm:text-4xl md:text-5xl tracking-tight">
          Khoảnh Khắc
          <span className="text-[#ea980c]"> EnglishMore</span>
        </h2>
        <p className="mt-4 text-xl text-gray-600 font-medium italic">
          Khoảng cách không thể ngăn bạn học tiếng Anh. Mà là Sự Im Lặng.<br/>
          <span className="text-lg">Just turn on your microphone and speak!</span>
        </p>
      </div>

      {groups.map((group, index) => (
        <CourseGalleryBlock key={group.courseId} group={group} index={index} />
      ))}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scrollVerticalDown {
          0% { transform: translateY(-50%); }
          100% { transform: translateY(0%); }
        }
        @keyframes scrollVerticalUp {
          0% { transform: translateY(0%); }
          100% { transform: translateY(-50%); }
        }
        @keyframes scrollHorizontalRight {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0%); }
        }
        @keyframes scrollHorizontalLeft {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }

        .animate-scroll-vertical-down { animation: scrollVerticalDown 30s linear infinite; }
        .animate-scroll-vertical-up { animation: scrollVerticalUp 30s linear infinite; }
        .animate-scroll-horizontal-right { animation: scrollHorizontalRight 30s linear infinite; display: flex; }
        .animate-scroll-horizontal-left { animation: scrollHorizontalLeft 30s linear infinite; display: flex; }

        .animate-scroll-vertical-down:hover, .animate-scroll-vertical-up:hover,
        .animate-scroll-horizontal-right:hover, .animate-scroll-horizontal-left:hover {
          animation-play-state: paused;
        }
      `}} />
    </div>
  )
}

function CourseGalleryBlock({ group, index }: { group: GroupedGallery, index: number }) {
  const images = group.images
  
  // Use all images for every row/column but shifted by an offset so they don't look perfectly identical
  const createRandomizedInfiniteList = (offset: number) => {
    const shifted = [...images.slice(offset % images.length), ...images.slice(0, offset % images.length)]
    return Array(40).fill(shifted).flat()
  }

  // Vertical layout - 6 columns
  if (group.animation === 'vertical') {
    const colConfigurations = [
      { dir: 'down', delay: '0s' },
      { dir: 'up', delay: '-5s' },
      { dir: 'down', delay: '-10s' },
      { dir: 'up', delay: '-2s' },
      { dir: 'down', delay: '-15s' },
      { dir: 'up', delay: '-8s' }
    ]

    return (
      <section className="relative w-full">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-20 mb-6 text-center">
          <h3 className="text-2xl font-bold text-[#14532d] uppercase tracking-wide bg-gray-50 inline-block px-4 py-1 rounded-full border border-gray-200">{group.title}</h3>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50 via-transparent to-gray-50 pointer-events-none z-10" />
        <div className="mx-auto max-w-[1400px] h-[600px] sm:h-[800px] px-2 md:px-4 relative z-0 flex gap-2 md:gap-4 justify-center overflow-hidden">
          {colConfigurations.map((config, colIdx) => (
            <div 
              key={colIdx} 
              className={`${colIdx >= 3 ? 'hidden md:flex' : 'flex'} flex-col w-1/3 md:w-1/6 gap-2 md:gap-4 animate-scroll-vertical-${config.dir}`} 
              style={{ animationDelay: config.delay }}
            >
              {createRandomizedInfiniteList(colIdx).map((image, idx) => (
                <img 
                  key={`v${colIdx}-${idx}`} 
                  src={`/api/gallery/${image.id}`} 
                  alt={group.title} 
                  className="w-full h-auto object-cover rounded-none shadow-sm transition-transform duration-300 hover:scale-[1.02]" 
                  loading="lazy" 
                />
              ))}
            </div>
          ))}
        </div>
      </section>
    )
  }

  // Horizontal layout - 5 rows
  if (group.animation === 'horizontal') {
    const rowConfigurations = [
      { dir: 'right', delay: '0s', offset: '0px' },
      { dir: 'left', delay: '-8s', offset: '-50px' },
      { dir: 'right', delay: '-15s', offset: '-10px' },
      { dir: 'left', delay: '-4s', offset: '-80px' },
      { dir: 'right', delay: '-10s', offset: '0px' }
    ]

    return (
      <section className="relative w-full">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-20 mb-6 text-center">
          <h3 className="text-2xl font-bold text-[#14532d] uppercase tracking-wide bg-gray-50 inline-block px-4 py-1 rounded-full border border-gray-200">{group.title}</h3>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-gray-50 via-transparent to-gray-50 pointer-events-none z-10" />
        <div className="w-full h-[600px] sm:h-[800px] flex flex-col gap-3 md:gap-4 overflow-hidden relative z-0 px-2 justify-center">
          {rowConfigurations.map((config, rowIdx) => (
            <div 
              key={rowIdx} 
              className={`animate-scroll-horizontal-${config.dir} gap-3 md:gap-4 h-24 md:h-32 opacity-95 hover:opacity-100 transition-opacity flex-shrink-0`}
              style={{ animationDelay: config.delay, marginLeft: config.offset }}
            >
               {createRandomizedInfiniteList(rowIdx).map((image, idx) => (
                 <img key={`h${rowIdx}-${idx}`} src={`/api/gallery/${image.id}`} alt={group.title} className="h-full w-auto object-cover rounded-none shadow-sm transition-transform duration-300 hover:scale-[1.02]" loading="lazy" />
               ))}
            </div>
          ))}
        </div>
      </section>
    )
  }

  // Diagonal layout - 6 rows
  if (group.animation === 'diagonal') {
    const rowConfigurations = [
      { dir: 'right', delay: '0s', offset: '0px' },
      { dir: 'left', delay: '-10s', offset: '-100px' },
      { dir: 'right', delay: '-5s', offset: '-50px' },
      { dir: 'left', delay: '-15s', offset: '-200px' },
      { dir: 'right', delay: '-8s', offset: '-150px' },
      { dir: 'left', delay: '-2s', offset: '0px' }
    ]

    return (
      <section className="relative w-full h-[600px] sm:h-[800px] overflow-hidden py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-20 mb-10 text-center">
          <h3 className="text-2xl font-bold text-[#14532d] uppercase tracking-wide bg-gray-50 inline-block px-4 py-1 rounded-full shadow-sm">{group.title}</h3>
        </div>
        <div className="absolute inset-0 pointer-events-none z-10 shadow-[inset_0_0_100px_40px_rgba(249,250,251,1)]" />
        <div className="relative z-0 w-[120%] -ml-[10%] -mt-16 transform -rotate-[8deg] scale-110 flex flex-col gap-3 justify-center h-full">
          {rowConfigurations.map((config, rowIdx) => (
            <div 
              key={rowIdx} 
              className={`animate-scroll-horizontal-${config.dir} gap-3 md:gap-4 h-24 md:h-32 opacity-90 hover:opacity-100 transition-opacity flex-shrink-0`} 
              style={{ animationDelay: config.delay, marginLeft: config.offset }}
            >
              {createRandomizedInfiniteList(rowIdx).map((image, idx) => (
                 <img 
                   key={`d${rowIdx}-${idx}`} 
                   src={`/api/gallery/${image.id}`} 
                   alt={group.title} 
                   className="h-full w-36 md:w-48 object-cover rounded-none shadow-md transition-transform duration-300 hover:scale-105" 
                   loading="lazy" 
                 />
               ))}
            </div>
          ))}
        </div>
      </section>
    )
  }

  return null
}
