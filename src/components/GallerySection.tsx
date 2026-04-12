'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export default function GallerySection() {
  const [images, setImages] = useState<{ id: string }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await fetch('/api/gallery')
        if (res.ok) {
          const data = await res.json()
          setImages(data || [])
        }
      } catch (err) {
        console.error('Failed to fetch gallery images', err)
      } finally {
        setLoading(false)
      }
    }
    fetchImages()
  }, [])

  if (loading || images.length === 0) {
    return null
  }

  // Split images into 3 columns for desktop, 2 for tablet, 1 for mobile (handled via CSS/flex)
  // For the vertical sliding effect, we can duplicate the images in each column to create an infinite scroll effect.
  
  const col1Images = images.filter((_, i) => i % 3 === 0)
  const col2Images = images.filter((_, i) => i % 3 === 1)
  const col3Images = images.filter((_, i) => i % 3 === 2)
  
  // Combine all combinations just to make sure there's enough content to scroll
  const createInfiniteList = (list: typeof images) => [...list, ...list, ...list]

  return (
    <section className="bg-gray-50 py-20 overflow-hidden relative" id="gallery-section">
      <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-white pointer-events-none z-10" />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-20 mb-10 text-center">
        <h2 className="text-3xl font-extrabold text-[#14532d] sm:text-4xl md:text-5xl uppercase tracking-tight">
          KHOẢNH KHẮC
          <span className="text-[#ea980c]"> ENGLISHMORE</span>
        </h2>
        <p className="mt-4 text-xl text-gray-600 font-medium italic">Học tiếng Anh chưa bao giờ thú vị đến thế.</p>
        <p className="mt-2 text-md text-gray-500 font-medium uppercase tracking-widest text-[#14532d]/60">Gallery</p>
      </div>

      <div className="mx-auto max-w-[1400px] h-[600px] sm:h-[800px] px-4 md:px-8 relative z-0 flex gap-4 md:gap-6 lg:gap-8 justify-center overflow-hidden">
        
        {/* Column 1 - Scrolling Down */}
        <div className="w-full sm:w-1/2 md:w-1/3 flex flex-col gap-4 md:gap-6 animate-scroll-vertical-down">
          {createInfiniteList(col1Images).map((image, idx) => (
            <div key={`col1-${idx}`} className="relative group w-full rounded-2xl overflow-hidden shadow-lg transition-transform duration-300 hover:scale-[1.02]">
              <img 
                src={`/api/gallery/${image.id}`} 
                alt="EnglishMore Gallery" 
                className="w-full h-auto object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ))}
        </div>

        {/* Column 2 - Scrolling Up (Hidden on smallest screens) */}
        <div className="hidden sm:flex sm:w-1/2 md:w-1/3 flex-col gap-4 md:gap-6 animate-scroll-vertical-up">
          {createInfiniteList(col2Images).map((image, idx) => (
            <div key={`col2-${idx}`} className="relative group w-full rounded-2xl overflow-hidden shadow-lg transition-transform duration-300 hover:scale-[1.02]">
              <img 
                src={`/api/gallery/${image.id}`} 
                alt="EnglishMore Gallery" 
                className="w-full h-auto object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ))}
        </div>

        {/* Column 3 - Scrolling Down (Hidden on tablets/mobiles) */}
        <div className="hidden md:flex md:w-1/3 flex-col gap-4 md:gap-6 animate-scroll-vertical-down" style={{ animationDelay: '-5s' }}>
          {createInfiniteList(col3Images).map((image, idx) => (
            <div key={`col3-${idx}`} className="relative group w-full rounded-2xl overflow-hidden shadow-lg transition-transform duration-300 hover:scale-[1.02]">
              <img 
                src={`/api/gallery/${image.id}`} 
                alt="EnglishMore Gallery" 
                className="w-full h-auto object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ))}
        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scrollVerticalDown {
          0% { transform: translateY(-33.33%); }
          100% { transform: translateY(0%); }
        }
        @keyframes scrollVerticalUp {
          0% { transform: translateY(0%); }
          100% { transform: translateY(-33.33%); }
        }
        .animate-scroll-vertical-down {
          animation: scrollVerticalDown 30s linear infinite;
        }
        .animate-scroll-vertical-up {
          animation: scrollVerticalUp 30s linear infinite;
        }
        .animate-scroll-vertical-down:hover,
        .animate-scroll-vertical-up:hover {
          animation-play-state: paused;
        }
      `}} />
    </section>
  )
}
