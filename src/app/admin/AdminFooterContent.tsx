import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import TipTapEditor from '@/components/TipTapEditor'

export interface FooterContentItem {
  id: string
  title: string
  description: string
  imageUrl: string
  content: string // HTML or detail text
  createdAt: number
  fileUrl?: string
  fileName?: string
  fileType?: string
}

interface FooterContentData {
  reviews: FooterContentItem[]
  experiences: FooterContentItem[]
  documents: FooterContentItem[]
}

const DEFAULT_DATA: FooterContentData = { reviews: [], experiences: [], documents: [] }

export default function AdminFooterContent() {
  const [data, setData] = useState<FooterContentData>(DEFAULT_DATA)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'reviews' | 'experiences' | 'documents'>('reviews')
  
  const [editingItem, setEditingItem] = useState<FooterContentItem | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  useEffect(() => {
    fetch('/api/public/settings?key=footer_content', { cache: 'no-store' })
      .then(res => res.json())
      .then(res => {
        if (res && res.value) {
          let val = res.value
          if (typeof val === 'string') {
            try { val = JSON.parse(val) } catch(e) {}
          }
          setData({
            reviews: val.reviews || [],
            experiences: val.experiences || [],
            documents: val.documents || []
          })
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleSaveData = async (newData: FooterContentData) => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'footer_content', value: newData })
      })
      if (!res.ok) throw new Error('Failed to save settings')
      setData(newData)
      toast.success('Đã lưu thành công!')
    } catch (err) {
      console.error(err)
      toast.error('Lỗi khi lưu dữ liệu.')
    } finally {
      setSaving(false)
    }
  }

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size > 5MB!')
      return
    }

    try {
      setUploadingImage(true)
      const toastId = toast.loading('Đang upload ảnh...')
      const presignedRes = await fetch('/api/admin/upload/presigned', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: file.name, contentType: file.type })
      })
      const presignedData = await presignedRes.json()
      if (!presignedRes.ok) throw new Error(presignedData.error || 'Presigned failed')

      const uploadRes = await fetch(presignedData.uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': file.type },
          body: file
      })
      
      if (!uploadRes.ok) throw new Error('Upload to R2 failed')

      setEditingItem(prev => prev ? { ...prev, imageUrl: presignedData.publicUrl } : null)
      toast.success('Upload thành công!', { id: toastId })
    } catch (err: any) {
      toast.error(err.message || 'Lỗi upload', { id: 'media-upload' })
    } finally {
      setUploadingImage(false)
    }
  }

  const [uploadingFile, setUploadingFile] = useState(false)

  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 50MB limit for documents/audio
    if (file.size > 50 * 1024 * 1024) {
      toast.error('File size > 50MB!')
      return
    }

    try {
      setUploadingFile(true)
      const toastId = toast.loading('Đang upload tài liệu...')
      const presignedRes = await fetch('/api/admin/upload/presigned', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: file.name, contentType: file.type || 'application/octet-stream' })
      })
      const presignedData = await presignedRes.json()
      if (!presignedRes.ok) throw new Error(presignedData.error || 'Presigned failed')

      const uploadRes = await fetch(presignedData.uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': file.type || 'application/octet-stream' },
          body: file
      })
      
      if (!uploadRes.ok) throw new Error('Upload to R2 failed')

      setEditingItem(prev => prev ? { ...prev, fileUrl: presignedData.publicUrl, fileName: file.name, fileType: file.type } : null)
      toast.success('Upload tài liệu thành công!', { id: toastId })
    } catch (err: any) {
      toast.error(err.message || 'Lỗi upload tài liệu', { id: 'doc-upload' })
    } finally {
      setUploadingFile(false)
    }
  }

  const openNewItem = () => {
    setEditingItem({
      id: Date.now().toString(),
      title: '',
      description: '',
      imageUrl: '',
      content: '',
      createdAt: Date.now()
    })
    setIsModalOpen(true)
  }

  const saveItem = () => {
    if (!editingItem || !editingItem.title) {
        toast.error('Vui lòng nhập tiêu đề!')
        return
    }

    let items = [...(data[activeTab] || [])]
    const existingIndex = items.findIndex(x => x.id === editingItem.id)
    if (existingIndex >= 0) {
        items[existingIndex] = editingItem
    } else {
        items.unshift(editingItem)
    }

    const newData = { ...data, [activeTab]: items }
    handleSaveData(newData)
    setIsModalOpen(false)
  }

  const deleteItem = (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa mục này?')) return
    const items = [...(data[activeTab] || [])].filter(x => x.id !== id)
    const newData = { ...data, [activeTab]: items }
    handleSaveData(newData)
  }

  const getTabLabel = (tab: string) => {
      if (tab === 'reviews') return 'Review đề TOEIC'
      if (tab === 'experiences') return 'Kinh nghiệm Học & Thi'
      return 'Kho tài liệu'
  }

  if (loading) return <div className="text-center py-20">Loading...</div>

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
      <div className="mb-6 pb-6 border-b border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800">Quản Lý Footer</h2>
        <p className="text-slate-500 mt-1">Quản lý nội dung động cho các mục ở footer.</p>
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-8">
        {(['reviews', 'experiences', 'documents'] as const).map(tab => (
            <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${activeTab === tab ? 'bg-primary-900 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
                {getTabLabel(tab)} ({data[tab]?.length || 0})
            </button>
        ))}
      </div>

      <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-slate-800">Danh sách {getTabLabel(activeTab)}</h3>
          <button 
              onClick={openNewItem}
              className="bg-secondary-500 hover:bg-secondary-600 text-white px-5 py-2 rounded-xl text-sm font-bold shadow transition-colors"
          >
              + Thêm mới
          </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(data[activeTab] || []).map(item => (
              <div key={item.id} className="border border-slate-200 rounded-2xl overflow-hidden hover:shadow-md transition-shadow bg-slate-50 flex flex-col">
                  {item.imageUrl ? (
                      <div className="h-40 w-full overflow-hidden bg-slate-200">
                          <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                      </div>
                  ) : (
                      <div className="h-40 w-full bg-slate-200 flex items-center justify-center text-slate-400">
                          No Image
                      </div>
                  )}
                  <div className="p-5 flex-1 flex flex-col">
                      <h4 className="font-bold text-slate-800 mb-2 line-clamp-2">{item.title}</h4>
                      <p className="text-sm text-slate-500 line-clamp-3 flex-1 mb-4">{item.description}</p>
                      
                      <div className="flex items-center gap-3 mt-auto pt-4 border-t border-slate-200 border-dashed">
                          {activeTab === 'documents' && item.fileUrl && (
                              <span className="flex-1 text-xs text-primary-600 font-bold truncate">📁 {item.fileName}</span>
                          )}
                          <button 
                              onClick={() => { setEditingItem(item); setIsModalOpen(true) }}
                              className={`${activeTab !== 'documents' || !item.fileUrl ? 'flex-1' : 'px-4'} py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-bold rounded-lg transition-colors`}
                          >
                              Sửa
                          </button>
                          <button 
                              onClick={() => deleteItem(item.id)}
                              className="py-2 px-4 bg-red-100 hover:bg-red-200 text-red-600 text-sm font-bold rounded-lg transition-colors"
                          >
                              Xóa
                          </button>
                      </div>
                  </div>
              </div>
          ))}
          {(!data[activeTab] || data[activeTab].length === 0) && (
              <div className="col-span-full py-16 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  Chưa có bài viết nào!
              </div>
          )}
      </div>

      {/* Editor Modal */}
      <AnimatePresence>
          {isModalOpen && editingItem && (
              <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
              >
                  <motion.div 
                      initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                      className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                  >
                      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                          <h3 className="text-xl font-bold text-slate-800">
                              {editingItem.id === Date.now().toString() || !data[activeTab].find(x => x.id === editingItem.id) ? 'Thêm mới' : 'Chỉnh sửa'} {getTabLabel(activeTab)}
                          </h3>
                          <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
                      </div>

                      <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
                          <div>
                              <label className="block text-sm font-bold text-slate-700 mb-2">Tiêu đề bài viết</label>
                              <input 
                                  className="w-full border-slate-300 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-900"
                                  value={editingItem.title}
                                  onChange={e => setEditingItem({ ...editingItem, title: e.target.value })}
                                  placeholder="Nhập tiêu đề ấn tượng..."
                              />
                          </div>

                          <div>
                              <label className="block text-sm font-bold text-slate-700 mb-2">Mô tả ngắn</label>
                              <textarea 
                                  className="w-full border-slate-300 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-900 h-24 resize-none"
                                  value={editingItem.description}
                                  onChange={e => setEditingItem({ ...editingItem, description: e.target.value })}
                                  placeholder="Đoạn mô tả ngắn gọn giới thiệu nội dung (khoảng 2-3 câu)..."
                              />
                          </div>

                          <div>
                              <label className="block text-sm font-bold text-slate-700 mb-2">Ảnh bìa (Tùy chọn)</label>
                              <div className="flex items-start gap-4">
                                  {editingItem.imageUrl && (
                                      <img src={editingItem.imageUrl} alt="preview" className="w-32 h-32 object-cover rounded-xl border border-slate-200" />
                                  )}
                                  <div className="flex-1">
                                      <input 
                                          type="file" 
                                          accept="image/*"
                                          onChange={handleUploadImage}
                                          disabled={uploadingImage}
                                          className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 mb-3"
                                      />
                                      {uploadingImage && <span className="text-sm text-primary-600">Đang upload ảnh...</span>}
                                      <p className="text-xs text-slate-400">Hoặc dán URL ảnh có sẵn:</p>
                                      <input 
                                          className="w-full mt-1 border-slate-300 rounded-lg px-3 py-2 text-sm bg-slate-50"
                                          value={editingItem.imageUrl}
                                          onChange={e => setEditingItem({ ...editingItem, imageUrl: e.target.value })}
                                          placeholder="https://..."
                                      />
                                  </div>
                              </div>
                          </div>

                          {activeTab === 'documents' && (
                              <div className="p-4 bg-primary-50 rounded-xl border border-primary-100">
                                  <label className="block text-sm font-bold text-primary-900 mb-2">File Tài Liệu Đính Kèm</label>
                                  <div className="flex items-center gap-4">
                                      <input 
                                          type="file" 
                                          accept=".pdf,.doc,.docx,.ppt,.pptx,.mp3,.mp4,.png,.jpg,.jpeg,.zip,.rar"
                                          onChange={handleUploadFile}
                                          disabled={uploadingFile}
                                          className="block flex-1 text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-600 file:text-white hover:file:bg-primary-700"
                                      />
                                  </div>
                                  {uploadingFile && <span className="text-sm text-primary-600 font-medium block mt-2">Đang upload tài liệu...</span>}
                                  
                                  {editingItem.fileUrl && (
                                      <div className="mt-4 p-3 bg-white rounded-lg border border-primary-200 flex items-center justify-between">
                                          <div className="flex items-center gap-2 overflow-hidden">
                                              <span className="text-xl">📁</span>
                                              <span className="text-sm font-bold text-slate-700 truncate">{editingItem.fileName || 'Tài liệu đã upload'}</span>
                                          </div>
                                          <button 
                                              onClick={() => setEditingItem({ ...editingItem, fileUrl: '', fileName: '', fileType: '' })}
                                              className="text-red-500 hover:text-red-700 text-xs font-bold px-2 py-1 bg-red-50 rounded"
                                          >
                                              Xóa File
                                          </button>
                                      </div>
                                  )}
                                  <div className="mt-3">
                                      <p className="text-xs text-slate-400 mb-1">Hoặc dán URL file có sẵn:</p>
                                      <input 
                                          className="w-full border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
                                          value={editingItem.fileUrl || ''}
                                          onChange={e => setEditingItem({ ...editingItem, fileUrl: e.target.value })}
                                          placeholder="https://..."
                                      />
                                  </div>
                              </div>
                          )}

                          <div>
                              <label className="block text-sm font-bold text-slate-700 mb-2">Nội dung chi tiết</label>
                              <div className="border border-slate-200 rounded-xl overflow-hidden min-h-[300px]">
                                  <TipTapEditor 
                                      content={editingItem.content}
                                      onChange={(html) => setEditingItem({ ...editingItem, content: html })}
                                  />
                              </div>
                              <p className="text-xs text-slate-500 mt-2">Phần nội dung này sẽ hiển thị dưới dạng pop-up khi học viên bấm "Xem chi tiết".</p>
                          </div>
                      </div>

                      <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                          <button 
                              onClick={() => setIsModalOpen(false)}
                              className="px-6 py-3 font-bold text-slate-600 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50"
                          >
                              Hủy
                          </button>
                          <button 
                              onClick={saveItem}
                              disabled={saving}
                              className="px-8 py-3 font-bold text-white bg-primary-900 hover:bg-primary-800 rounded-xl shadow shadow-primary-900/30"
                          >
                              {saving ? 'Đang lưu...' : 'Lưu lại'}
                          </button>
                      </div>
                  </motion.div>
              </motion.div>
          )}
      </AnimatePresence>
    </div>
  )
}
