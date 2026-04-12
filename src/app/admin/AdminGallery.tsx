'use client'

import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

export interface GalleryImageItem {
  id: string
  originalName: string
  displayOrder: number
  isActive: boolean
  createdAt: string
}

export default function AdminGallery() {
  const [images, setImages] = useState<GalleryImageItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchImages()
  }, [])

  const fetchImages = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/gallery')
      if (!res.ok) throw new Error('Failed to fetch images')
      const data = await res.json()
      setImages(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Loading failed')
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    let successCount = 0
    let errorCount = 0

    for (let i = 0; i < files.length; i++) {
        const file = files[i]

        if (file.size > 4 * 1024 * 1024) {
            toast.error(`File ${file.name} is too large. Limit is 4MB.`)
            errorCount++
            continue
        }

        const formData = new FormData()
        formData.append('file', file)

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
                     if (res.status === 413) errorMessage = 'Dung lượng ảnh quá lớn (Limit: ~4MB)'
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

  if (loading) return <div className="p-8 text-center text-gray-500">Loading gallery...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Manage Gallery</h2>
          <p className="text-sm text-gray-600">Upload and manage images for the landing page gallery section.</p>
        </div>
        <div>
          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleUpload}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="rounded-lg bg-[#14532d] px-4 py-2 font-semibold text-white hover:bg-[#166534] disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : 'Upload Images'}
          </button>
        </div>
      </div>

      {error && <div className="rounded border border-red-200 bg-red-50 p-4 text-red-600">{error}</div>}

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {images.map((image) => (
          <div key={image.id} className="relative group rounded-lg border border-gray-200 bg-white p-2 shadow-sm">
            <div className="aspect-square relative mb-2 overflow-hidden rounded bg-gray-100 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/gallery/${image.id}`}
                alt={image.originalName}
                className="max-h-full max-w-full object-contain"
                loading="lazy"
              />
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
      
      {images.length === 0 && !loading && !error && (
        <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500">No images uploaded yet.</p>
        </div>
      )}
    </div>
  )
}
