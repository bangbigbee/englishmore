'use client'

import { useState, useRef, useEffect } from 'react'
import { toast } from 'sonner'

interface AdminSingleImageUploadProps {
  section: string
  label: string
}

export default function AdminSingleImageUpload({ section, label }: AdminSingleImageUploadProps) {
  const [image, setImage] = useState<{ id: string; originalName: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/admin/gallery')
      .then(res => res.json())
      .then((data: any[]) => {
        if (Array.isArray(data)) {
          const sectionImages = data.filter(img => img.section === section)
          if (sectionImages.length > 0) {
            sectionImages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            setImage(sectionImages[0])
          }
        }
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [section])

  const handleUpload = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File quá lớn (Tối đa 10MB)')
      return
    }
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('section', section)

    try {
      const res = await fetch('/api/admin/gallery', {
        method: 'POST',
        body: formData
      })
      const data = await res.json()
      if (res.ok && data.success) {
        toast.success(`Đã tải lên ảnh thành công`)
        const itemsRes = await fetch('/api/admin/gallery')
        const items = await itemsRes.json()
        const sectionImages = items.filter((img: any) => img.section === section)
        if (sectionImages.length > 0) {
          sectionImages.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          setImage(sectionImages[0])
        }
      } else {
        toast.error(data.error || 'Có lỗi xảy ra')
      }
    } catch (err) {
      toast.error('Lỗi kết nối')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDelete = async () => {
    if (!image) return
    if (!window.confirm('Bạn có chắc xoá ảnh này?')) return

    setIsDeleting(true)
    try {
      const res = await fetch(`/api/admin/gallery/${image.id}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        toast.success('Xoá ảnh thành công')
        setImage(null)
      } else {
        toast.error('Lỗi khi xoá')
      }
    } catch (err) {
      toast.error('Lỗi kết nối')
    } finally {
      setIsDeleting(false)
    }
  }

  if (loading) return <div className="text-sm text-slate-500 py-4 animate-pulse">Đang tải ảnh {label}...</div>

  return (
    <div className="flex flex-col gap-3 p-4 border border-slate-200 rounded-xl bg-white shadow-sm mt-2 relative">
      <div className="flex justify-between w-full items-center mb-1">
         <span className="font-bold text-sm text-slate-800">{label}</span>
         {image && (
             <button 
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-xs bg-red-50 hover:bg-red-100 text-red-600 font-bold px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50"
             >
                {isDeleting ? 'Đang xoá...' : 'Xóa Ảnh'}
             </button>
         )}
      </div>

      {image ? (
        <div className="relative w-full aspect-[4/3] sm:aspect-video rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
            <img src={`/api/gallery/${image.id}`} alt={image.originalName} className="object-cover w-full h-full" />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 bg-slate-50/50 rounded-lg border border-dashed border-slate-300">
            <p className="text-sm text-slate-400 mb-4 font-medium">Chưa có ảnh</p>
        </div>
      )}

      <div className="w-full flex">
        <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={e => {
                if (e.target.files && e.target.files[0]) handleUpload(e.target.files[0])
            }}
        />
        <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full bg-[#581c87]/10 hover:bg-[#581c87]/20 text-[#581c87] font-bold text-sm py-2.5 rounded-lg transition-colors disabled:opacity-50"
        >
            {uploading ? 'Đang tải...' : (image ? 'Thay ảnh khác' : 'Tải lên từ máy')}
        </button>
      </div>
    </div>
  )
}
