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
    <div className="flex flex-col gap-24 py-20 bg-gray-50 overflow-hidden relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-20 text-center">
        <h2 className="text-3xl font-extrabold text-[#14532d] sm:text-4xl md:text-5xl uppercase tracking-tight">
          KHOẢNH KHẮC
          <span className="text-[#ea980c]"> ENGLISHMORE</span>
        </h2>
        <p className="mt-4 text-xl text-gray-600 font-medium italic">Học tiếng Anh chưa bao giờ thú vị đến thế.</p>
        <p className="mt-2 text-md text-gray-500 font-medium uppercase tracking-widest text-[#14532d]/60">Gallery</p>
      </div>

      {groups.map((group, index) => (
        <CourseGalleryBlock key={group.courseId} group={group} index={index} />
      ))}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scrollVerticalDown {
          0% { transform: translateY(-33.33%); }
          100% { transform: translateY(0%); }
        }
        @keyframes scrollVerticalUp {
          0% { transform: translateY(0%); }
          100% { transform: translateY(-33.33%); }
        }
        @keyframes scrollHorizontalRight {
          0% { transform: translateX(-33.33%); }
          100% { transform: translateX(0%); }
        }
        @keyframes scrollHorizontalLeft {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-33.33%); }
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
  const createInfiniteList = (list: typeof images) => [...list, ...list, ...list]
  
  const col1Images = images.filter((_, i) => i % 3 === 0)
  const col2Images = images.filter((_, i) => i % 3 === 1)
  const col3Images = images.filter((_, i) => i % 3 === 2)

  // Vertical layout
  if (group.animation === 'vertical') {
    return (
      <section className="relative w-full">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-20 mb-6 text-center">
          <h3 className="text-2xl font-bold text-[#14532d] uppercase tracking-wide">{group.title}</h3>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50 via-transparent to-gray-50 pointer-events-none z-10" />
        <div className="mx-auto max-w-[1400px] h-[500px] sm:h-[600px] px-4 relative z-0 flex gap-4 md:gap-6 justify-center overflow-hidden">
          <div className="w-full sm:w-1/2 md:w-1/3 flex flex-col gap-4 animate-scroll-vertical-down">
            {createInfiniteList(col1Images).map((image, idx) => (
              <img key={`v1-${idx}`} src={`/api/gallery/${image.id}`} alt={group.title} className="w-full h-auto object-cover rounded-2xl shadow-md transition-transform duration-300 hover:scale-[1.02]" loading="lazy" />
            ))}
          </div>
          <div className="hidden sm:flex sm:w-1/2 md:w-1/3 flex-col gap-4 animate-scroll-vertical-up">
            {createInfiniteList(col2Images).map((image, idx) => (
              <img key={`v2-${idx}`} src={`/api/gallery/${image.id}`} alt={group.title} className="w-full h-auto object-cover rounded-2xl shadow-md transition-transform duration-300 hover:scale-[1.02]" loading="lazy" />
            ))}
          </div>
          <div className="hidden md:flex md:w-1/3 flex-col gap-4 animate-scroll-vertical-down" style={{ animationDelay: '-5s' }}>
            {createInfiniteList(col3Images).map((image, idx) => (
              <img key={`v3-${idx}`} src={`/api/gallery/${image.id}`} alt={group.title} className="w-full h-auto object-cover rounded-2xl shadow-md transition-transform duration-300 hover:scale-[1.02]" loading="lazy" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  // Horizontal layout
  if (group.animation === 'horizontal') {
    return (
      <section className="relative w-full">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-20 mb-6 text-center">
          <h3 className="text-2xl font-bold text-[#14532d] uppercase tracking-wide">{group.title}</h3>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-gray-50 via-transparent to-gray-50 pointer-events-none z-10" />
        <div className="w-full flex flex-col gap-4 overflow-hidden relative z-0 px-4">
          <div className="animate-scroll-horizontal-right gap-4 h-64">
             {createInfiniteList(col1Images).map((image, idx) => (
               <img key={`h1-${idx}`} src={`/api/gallery/${image.id}`} alt={group.title} className="h-full w-auto object-cover rounded-2xl shadow-md transition-transform duration-300 hover:scale-[1.02]" loading="lazy" />
             ))}
          </div>
          <div className="animate-scroll-horizontal-left gap-4 h-64">
             {createInfiniteList(col2Images).map((image, idx) => (
               <img key={`h2-${idx}`} src={`/api/gallery/${image.id}`} alt={group.title} className="h-full w-auto object-cover rounded-2xl shadow-md transition-transform duration-300 hover:scale-[1.02]" loading="lazy" />
             ))}
          </div>
        </div>
      </section>
    )
  }

  // Diagonal layout
  if (group.animation === 'diagonal') {
    return (
      <section className="relative w-full overflow-hidden py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-20 mb-12 text-center">
          <h3 className="text-2xl font-bold text-[#14532d] uppercase tracking-wide bg-gray-50 inline-block px-4">{group.title}</h3>
        </div>
        <div className="absolute inset-0 pointer-events-none z-10 shadow-[inset_0_0_100px_40px_rgba(249,250,251,1)]" />
        <div className="relative z-0 w-[120%] -ml-[10%] -mt-10 transform -rotate-6 scale-110 flex flex-col gap-4">
          <div className="animate-scroll-horizontal-right gap-4 h-64 opacity-90 hover:opacity-100 transition-opacity">
            {createInfiniteList(col1Images).map((image, idx) => (
               <img key={`d1-${idx}`} src={`/api/gallery/${image.id}`} alt={group.title} className="h-full w-64 object-cover rounded-xl shadow-lg transition-transform duration-300 hover:scale-105" loading="lazy" />
             ))}
          </div>
          <div className="animate-scroll-horizontal-left gap-4 h-64 opacity-90 hover:opacity-100 transition-opacity" style={{ marginLeft: '-150px' }}>
            {createInfiniteList(col2Images).map((image, idx) => (
               <img key={`d2-${idx}`} src={`/api/gallery/${image.id}`} alt={group.title} className="h-full w-64 object-cover rounded-xl shadow-lg transition-transform duration-300 hover:scale-105" loading="lazy" />
             ))}
          </div>
          <div className="animate-scroll-horizontal-right gap-4 h-64 opacity-90 hover:opacity-100 transition-opacity" style={{ animationDelay: '-5s' }}>
            {createInfiniteList(col3Images).map((image, idx) => (
               <img key={`d3-${idx}`} src={`/api/gallery/${image.id}`} alt={group.title} className="h-full w-64 object-cover rounded-xl shadow-lg transition-transform duration-300 hover:scale-105" loading="lazy" />
             ))}
          </div>
        </div>
      </section>
    )
  }

  return null
}
