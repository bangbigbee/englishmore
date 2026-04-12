'use client'

import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

export interface GalleryImageItem {
  id: string
  courseId: string | null
  originalName: string
  displayOrder: number
  isActive: boolean
  createdAt: string
  section?: string
  mimeType?: string
}

interface CourseItem {
  id: string
  title: string
  galleryAnimation: string
}

export default function AdminGallery() {
  const [images, setImages] = useState<GalleryImageItem[]>([])
  const [courses, setCourses] = useState<CourseItem[]>([])
  const [selectedCourseId, setSelectedCourseId] = useState<string>('')
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [resImages, resCourses] = await Promise.all([
        fetch('/api/admin/gallery'),
        fetch('/api/admin/courses')
      ])
      
      if (!resImages.ok || !resCourses.ok) throw new Error('Failed to fetch data')
      
      const [dataImages, dataCourses] = await Promise.all([
        resImages.json(),
        resCourses.json()
      ])
      
      setImages(dataImages)
      setCourses(Array.isArray(dataCourses) ? dataCourses.map((c: any) => ({
        id: c.id,
        title: c.title,
        galleryAnimation: c.galleryAnimation || 'vertical'
      })) : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Loading failed')
    } finally {
      setLoading(false)
    }
  }

  const fetchImages = async () => {
    try {
      const res = await fetch('/api/admin/gallery')
      if (res.ok) setImages(await res.json())
    } catch (err) {}
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    let successCount = 0
    let errorCount = 0

    for (let i = 0; i < files.length; i++) {
        const file = files[i]

        if (file.size > 50 * 1024 * 1024) {
            toast.error(`File ${file.name} is too large. Limit is 50MB.`)
            errorCount++
            continue
        }

        const formData = new FormData()
        formData.append('file', file)
        if (selectedCourseId === 'teacher') {
          formData.append('section', 'teacher')
        } else if (selectedCourseId) {
          formData.append('courseId', selectedCourseId)
          formData.append('section', 'course')
        } else {
          formData.append('section', 'course') 
        }

        try {
            const res = await fetch('/api/admin/gallery', {
                method: 'POST',
                body: formData
            })
            if (!res.ok) {
                let errorMessage = 'Upload failed'
                try {
                    const errorData = await res.json()
                    errorMessage = errorData.error || errorMessage
                } catch {
                     if (res.status === 413) errorMessage = 'Dung lượng file quá lớn (Nếu deploy trên Next.js Vercel bị giới hạn cứng 4.5MB/request mặc định)'
                     else errorMessage = `Upload failed with status ${res.status}`
                }
                throw new Error(errorMessage)
            }
            successCount++
        } catch (err) {
            toast.error(`${file.name}: ${err instanceof Error ? err.message : 'Upload failed'}`)
            errorCount++
        }
    }

    if (successCount > 0) {
        toast.success(`Successfully uploaded ${successCount} image(s)`)
        fetchImages()
    }
    
    if (fileInputRef.current) {
        fileInputRef.current.value = ''
    }
    setUploading(false)
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return

    try {
      const res = await fetch(`/api/admin/gallery/${id}`, {
        method: 'DELETE'
      })
      if (!res.ok) throw new Error('Delete failed')
      toast.success('Image deleted')
      fetchImages()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  const handleUpdate = async (id: string, updates: { isActive?: boolean; displayOrder?: number }) => {
    try {
      const res = await fetch(`/api/admin/gallery/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      if (!res.ok) throw new Error('Update failed')
      fetchImages()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Update failed')
    }
  }

  const handleUpdateCourseAnimation = async (courseId: string, animation: string) => {
    try {
      const res = await fetch(`/api/admin/courses/${courseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ galleryAnimation: animation })
      })
      if (!res.ok) throw new Error('Cập nhật animation thất bại')
      setCourses(courses.map(c => c.id === courseId ? { ...c, galleryAnimation: animation } : c))
      toast.success('Đã lưu cài đặt Animation')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Update failed')
    }
  }

  if (loading) return <div className="p-8 text-center text-gray-500">Loading gallery...</div>

  // Lọc hình ảnh theo mục được chọn
  const displayingImages = selectedCourseId === 'teacher'
    ? images.filter(img => img.section === 'teacher')
    : selectedCourseId 
      ? images.filter(img => img.courseId === selectedCourseId && img.section !== 'teacher')
      : images.filter(img => !img.courseId && img.section !== 'teacher')

  const selectedCourseDetails = selectedCourseId !== 'teacher' ? courses.find(c => c.id === selectedCourseId) : null

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Manage Gallery</h2>
          <p className="text-sm text-gray-600">Upload and manage images for each course's gallery section.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#14532d] focus:outline-none focus:ring-1 focus:ring-[#14532d]"
          >
            <option value="teacher">🔥 -- Video Teacher Gallery --</option>
            <option value="">-- Hình ảnh chung (Không khóa học) --</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>

          <input
            type="file"
            multiple
            accept="image/*,video/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleUpload}
          />
          <button
            onClick={() => {
                fileInputRef.current?.click()
            }}
            disabled={uploading}
            className="whitespace-nowrap rounded-lg bg-[#14532d] px-4 py-2 font-semibold text-white hover:bg-[#166534] disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : 'Upload Files'}
          </button>
        </div>
      </div>

      {selectedCourseId && selectedCourseDetails && (
        <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-blue-900">Animation Style</h3>
            <p className="text-xs text-blue-700">Chọn cách thức hiển thị ảnh động cho khóa học này trên trang chủ.</p>
          </div>
          <select
            value={selectedCourseDetails.galleryAnimation}
            onChange={(e) => handleUpdateCourseAnimation(selectedCourseId, e.target.value)}
            className="rounded bg-white border border-blue-300 px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="vertical">Dọc (Vertical Scroll)</option>
            <option value="horizontal">Ngang (Horizontal Scroll)</option>
            <option value="diagonal">Chéo (Diagonal Floating)</option>
          </select>
        </div>
      )}

      {error && <div className="rounded border border-red-200 bg-red-50 p-4 text-red-600">{error}</div>}

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {displayingImages.map((image) => (
          <div key={image.id} className="relative group rounded-lg border border-gray-200 bg-white p-2 shadow-sm">
            <div className="aspect-square relative mb-2 overflow-hidden rounded bg-gray-100 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {image.mimeType?.startsWith('video/') ? (
                <video
                  src={`/api/gallery/${image.id}`}
                  className="max-h-full max-w-full object-contain"
                  controls
                  muted
                />
              ) : (
                <img
                  src={`/api/gallery/${image.id}`}
                  alt={image.originalName}
                  className="max-h-full max-w-full object-contain"
                  loading="lazy"
                />
              )}
            </div>
            <div className="flex flex-col gap-2">
              <div className="text-xs text-gray-500 truncate" title={image.originalName}>
                {image.originalName}
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={image.isActive}
                    onChange={(e) => handleUpdate(image.id, { isActive: e.target.checked })}
                    className="h-3 w-3 rounded border-gray-300 text-[#14532d] focus:ring-[#14532d]"
                  />
                  Active
                </label>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-400">Order:</span>
                  <input
                    type="number"
                    min="0"
                    value={image.displayOrder}
                    onChange={(e) => handleUpdate(image.id, { displayOrder: parseInt(e.target.value) || 0 })}
                    className="w-12 rounded border border-gray-300 px-1 py-0.5 text-xs focus:border-[#14532d] focus:outline-none focus:ring-1 focus:ring-[#14532d]"
                  />
                </div>
              </div>
              <button
                onClick={() => handleDelete(image.id)}
                className="w-full rounded bg-red-50 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-100 transition"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {displayingImages.length === 0 && !loading && !error && (
        <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500">Chưa có hình ảnh nào cho mục này.</p>
        </div>
      )}
    </div>
  )
}
