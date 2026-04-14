'use client'

import React, { useEffect, useState } from 'react'
import { useEditor, EditorContent, Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { TextAlign } from '@tiptap/extension-text-align'

interface TipTapEditorProps {
  content: string
  onChange: (content: string) => void
}

const MenuBar = ({ editor, isFullscreen, toggleFullscreen }: { editor: Editor | null, isFullscreen: boolean, toggleFullscreen: () => void }) => {
  if (!editor) {
    return null
  }

  return (
    <div className="border border-gray-300 rounded-t-lg bg-gray-50 flex flex-wrap items-center p-2 gap-2 text-sm text-gray-700">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`px-2 py-1 rounded font-bold ${editor.isActive('bold') ? 'bg-[#14532d] text-white' : 'hover:bg-gray-200'}`}
      >
        B
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`px-2 py-1 rounded italic ${editor.isActive('italic') ? 'bg-[#14532d] text-white' : 'hover:bg-gray-200'}`}
      >
        I
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={`px-2 py-1 rounded line-through ${editor.isActive('strike') ? 'bg-[#14532d] text-white' : 'hover:bg-gray-200'}`}
      >
        S
      </button>
      
      <div className="w-px h-6 bg-gray-300 mx-1"></div>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`px-2 py-1 rounded font-bold ${editor.isActive('heading', { level: 2 }) ? 'bg-[#14532d] text-white' : 'hover:bg-gray-200'}`}
      >
        H2
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`px-2 py-1 rounded font-bold ${editor.isActive('heading', { level: 3 }) ? 'bg-[#14532d] text-white' : 'hover:bg-gray-200'}`}
      >
        H3
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1"></div>

      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        className={`px-2 py-1 rounded ${editor.isActive({ textAlign: 'left' }) ? 'bg-[#14532d] text-white' : 'hover:bg-gray-200'}`}
      >
        Left
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        className={`px-2 py-1 rounded ${editor.isActive({ textAlign: 'center' }) ? 'bg-[#14532d] text-white' : 'hover:bg-gray-200'}`}
      >
        Center
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        className={`px-2 py-1 rounded ${editor.isActive({ textAlign: 'right' }) ? 'bg-[#14532d] text-white' : 'hover:bg-gray-200'}`}
      >
        Right
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1"></div>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`px-2 py-1 rounded ${editor.isActive('bulletList') ? 'bg-[#14532d] text-white' : 'hover:bg-gray-200'}`}
      >
        • List
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`px-2 py-1 rounded ${editor.isActive('orderedList') ? 'bg-[#14532d] text-white' : 'hover:bg-gray-200'}`}
      >
        1. List
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
        className: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[300px] border border-gray-300 rounded-b-lg p-4 max-w-none bg-white',
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
