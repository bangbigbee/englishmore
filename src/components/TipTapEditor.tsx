'use client'

import React, { useEffect, useState } from 'react'
import { useEditor, EditorContent, Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { TextAlign } from '@tiptap/extension-text-align'
import Image from '@tiptap/extension-image'
import { toast } from 'sonner'

interface TipTapEditorProps {
  content: string
  onChange: (content: string) => void
}

const MenuBar = ({ editor, isFullscreen, toggleFullscreen }: { editor: Editor | null, isFullscreen: boolean, toggleFullscreen: () => void }) => {
  const [uploadingImage, setUploadingImage] = useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  if (!editor) {
    return null
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

      editor.chain().focus().setImage({ src: presignedData.publicUrl }).run()
      toast.success('Chèn ảnh thành công!', { id: toastId })
    } catch (err: any) {
      toast.error(err.message || 'Lỗi upload ảnh', { id: 'editor-media-upload' })
    } finally {
      setUploadingImage(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const promptImageUrl = () => {
    const url = window.prompt('Nhập đường dẫn ảnh (URL):')
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }

  return (
    <div className="border border-gray-300 rounded-t-lg bg-gray-50 flex flex-wrap items-center p-2 gap-2 text-sm text-gray-700">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`px-2 py-1 rounded font-bold ${editor.isActive('bold') ? 'bg-primary-900 text-white' : 'hover:bg-gray-200'}`}
      >
        B
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`px-2 py-1 rounded italic ${editor.isActive('italic') ? 'bg-primary-900 text-white' : 'hover:bg-gray-200'}`}
      >
        I
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={`px-2 py-1 rounded line-through ${editor.isActive('strike') ? 'bg-primary-900 text-white' : 'hover:bg-gray-200'}`}
      >
        S
      </button>
      
      <div className="w-px h-6 bg-gray-300 mx-1"></div>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`px-2 py-1 rounded font-bold ${editor.isActive('heading', { level: 2 }) ? 'bg-primary-900 text-white' : 'hover:bg-gray-200'}`}
      >
        H2
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`px-2 py-1 rounded font-bold ${editor.isActive('heading', { level: 3 }) ? 'bg-primary-900 text-white' : 'hover:bg-gray-200'}`}
      >
        H3
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1"></div>

      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        className={`px-2 py-1 rounded ${editor.isActive({ textAlign: 'left' }) ? 'bg-primary-900 text-white' : 'hover:bg-gray-200'}`}
      >
        Left
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        className={`px-2 py-1 rounded ${editor.isActive({ textAlign: 'center' }) ? 'bg-primary-900 text-white' : 'hover:bg-gray-200'}`}
      >
        Center
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        className={`px-2 py-1 rounded ${editor.isActive({ textAlign: 'right' }) ? 'bg-primary-900 text-white' : 'hover:bg-gray-200'}`}
      >
        Right
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1"></div>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`px-2 py-1 rounded ${editor.isActive('bulletList') ? 'bg-primary-900 text-white' : 'hover:bg-gray-200'}`}
        title="Danh sách dấu chấm"
      >
        • List
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`px-2 py-1 rounded ${editor.isActive('orderedList') ? 'bg-primary-900 text-white' : 'hover:bg-gray-200'}`}
        title="Danh sách đánh số"
      >
        1. List
      </button>
      
      <button
        type="button"
        onClick={() => editor.chain().focus().sinkListItem('listItem').run()}
        disabled={!editor.can().sinkListItem('listItem')}
        className="px-2 py-1 rounded text-gray-600 hover:bg-gray-200 disabled:opacity-30 flex items-center gap-1"
        title="Thụt lề vô trong (Indent)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" y1="12" x2="11" y2="12"></line><line x1="21" y1="6" x2="11" y2="6"></line><line x1="21" y1="18" x2="11" y2="18"></line><polyline points="3 8 7 12 3 16"></polyline></svg>
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().liftListItem('listItem').run()}
        disabled={!editor.can().liftListItem('listItem')}
        className="px-2 py-1 rounded text-gray-600 hover:bg-gray-200 disabled:opacity-30 flex items-center gap-1"
        title="Dịch lề ra ngoài (Outdent)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" y1="12" x2="11" y2="12"></line><line x1="21" y1="6" x2="11" y2="6"></line><line x1="21" y1="18" x2="11" y2="18"></line><polyline points="7 8 3 12 7 16"></polyline></svg>
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1"></div>

      <input
        type="color"
        onInput={(event) => editor.chain().focus().setColor((event.target as HTMLInputElement).value).run()}
        value={editor.getAttributes('textStyle').color || '#000000'}
        className="w-8 h-8 p-0 border-0 rounded cursor-pointer mt-0.5 shadow-sm"
        title="Chọn màu chữ"
      />
      <button
        type="button"
        onClick={() => editor.chain().focus().unsetColor().run()}
        className="px-2 py-1 rounded text-xs text-gray-500 hover:bg-gray-200"
      >
        Clear Color
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1"></div>

      {/* Image Upload */}
      <input 
        type="file" 
        accept="image/*" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleUploadImage} 
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploadingImage}
        className="px-2 py-1 rounded text-gray-600 hover:bg-gray-200 disabled:opacity-50 flex items-center gap-1 font-medium"
        title="Tải ảnh lên"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
        {uploadingImage ? '...' : 'Tải ảnh'}
      </button>
      <button
        type="button"
        onClick={promptImageUrl}
        className="px-2 py-1 rounded text-gray-600 hover:bg-gray-200 flex items-center gap-1 font-medium"
        title="Chèn ảnh từ URL"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
        Link ảnh
      </button>

      <div className="flex-1"></div>
      
      <button
        type="button"
        onClick={toggleFullscreen}
        className="px-3 py-1.5 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 ml-auto font-medium text-xs flex items-center gap-1.5 transition-colors"
        title="Bật/Tắt Toàn màn hình"
      >
        {isFullscreen ? (
           <>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="M21 8h-3a2 2 0 0 1-2-2V3"/><path d="M3 16h3a2 2 0 0 1 2 2v3"/><path d="M16 21v-3a2 2 0 0 1 2-2h3"/></svg>
            Thu nhỏ
           </>
        ) : (
           <>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="M21 3l-7 7"/><path d="M3 21l7-7"/></svg>
            Phóng to
           </>
        )}
      </button>
    </div>
  )
}

export default function TipTapEditor({ content, onChange }: TipTapEditorProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      Image.configure({
        inline: false,
        HTMLAttributes: {
          class: 'rounded-xl border border-slate-200 max-w-full my-4 shadow-sm'
        }
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        className: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[300px] border border-gray-300 rounded-b-lg p-4 max-w-none bg-white prose-ul:list-disc prose-ol:list-decimal prose-ul:ml-5 prose-ol:ml-5 prose-li:my-1 prose-li:marker:text-gray-800 marker:font-bold',
      },
    },
  })

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  return (
    <div className={`w-full flex flex-col ${isFullscreen ? 'fixed inset-0 z-[99999] bg-slate-900/40 backdrop-blur-sm md:p-10 p-2' : ''}`}>
      <div className={`flex flex-col w-full h-full flex-1 ${isFullscreen ? 'max-w-6xl mx-auto shadow-2xl rounded-xl overflow-hidden bg-white' : ''}`}>
        <MenuBar editor={editor} isFullscreen={isFullscreen} toggleFullscreen={() => setIsFullscreen(!isFullscreen)} />
        <div className={`w-full flex flex-col ${isFullscreen ? 'flex-1 overflow-y-auto' : ''}`}>
          <EditorContent 
            editor={editor} 
            className={`w-full ${isFullscreen ? 'flex-1 [&>div.ProseMirror]:min-h-full [&>div.ProseMirror]:border-none [&>div.ProseMirror]:rounded-none [&>div.ProseMirror]:border-t-0 [&>div.ProseMirror]:shadow-inner' : ''}`} 
          />
        </div>
      </div>
    </div>
  )
}
