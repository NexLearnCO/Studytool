'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Table } from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableHeader from '@tiptap/extension-table-header'
import TableCell from '@tiptap/extension-table-cell'
import { marked } from 'marked'
import { useEffect, useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Table as TableIcon,
  Quote,
  Code,
  Minus,
  Undo,
  Redo
} from 'lucide-react'

// Dynamic import for client-side only
let TurndownService: any = null
let turndownPluginGfm: any = null

if (typeof window !== 'undefined') {
  try {
    const turndownModule = require('turndown')
    const gfmModule = require('turndown-plugin-gfm')
    
    // Handle different export formats
    TurndownService = turndownModule.default || turndownModule
    turndownPluginGfm = gfmModule.default || gfmModule
  } catch (error) {
    console.warn('Failed to load Turndown modules:', error)
  }
}

interface EditModeProps {
  markdown: string
  onChange: (markdown: string) => void
  className?: string
}

export default function EditMode({ markdown, onChange, className = '' }: EditModeProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [isConverting, setIsConverting] = useState(false)
  const turndownRef = useRef<any>(null)
  const lastMarkdownRef = useRef<string>(markdown)

  // Initialize Turndown service
  useEffect(() => {
    if (typeof window !== 'undefined' && TurndownService) {
      const turndownService = new TurndownService({
        headingStyle: 'atx',
        bulletListMarker: '-',
        codeBlockStyle: 'fenced',
        fence: '```',
        emDelimiter: '*',
        strongDelimiter: '**',
        linkStyle: 'inlined',
        preformattedCode: true
      })

      // Add GFM support (tables, strikethrough, etc.)
      if (turndownPluginGfm) {
        turndownService.use(turndownPluginGfm.gfm)
      }

      // Custom rules for better conversion
      turndownService.addRule('lineBreak', {
        filter: 'br',
        replacement: function () {
          return '\n'
        }
      })

      turndownRef.current = turndownService
    }
  }, [])

  // Convert markdown to HTML for Tiptap
  const markdownToHtml = async (md: string): Promise<string> => {
    try {
      // Configure marked for better output
      marked.setOptions({
        breaks: true,
        gfm: true,
        mangle: false
      })

      const html = await marked.parse(md)
      return html
    } catch (error) {
      console.error('Error converting markdown to HTML:', error)
      return md
    }
  }

  // Convert HTML back to markdown using Turndown
  const htmlToMarkdown = (html: string): string => {
    try {
      if (turndownRef.current) {
        // Clean up the HTML before conversion
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = html
        
        // Remove empty paragraphs
        const emptyParagraphs = tempDiv.querySelectorAll('p:empty')
        emptyParagraphs.forEach(p => p.remove())
        
        const markdown = turndownRef.current.turndown(tempDiv.innerHTML)
        
        // Clean up the markdown
        return markdown
          .replace(/\n{3,}/g, '\n\n') // Remove excessive newlines
          .replace(/^\s+|\s+$/g, '') // Trim whitespace
      } else {
        // Fallback to simple conversion if Turndown not available
        return html
          .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
          .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
          .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
          .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
          .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
          .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
          .replace(/<br\s*\/?>/gi, '\n')
          .replace(/<[^>]*>/g, '')
          .replace(/\n{3,}/g, '\n\n')
          .trim()
      }
    } catch (error) {
      console.error('Error converting HTML to markdown:', error)
      return html
    }
  }

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6]
        }
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: '',
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      if (!isConverting) {
        const html = editor.getHTML()
        const md = htmlToMarkdown(html)
        lastMarkdownRef.current = md
        onChange(md)
      }
    },
  })

  // Initial content setup
  useEffect(() => {
    const setupContent = async () => {
      if (editor && markdown && markdown !== lastMarkdownRef.current) {
        setIsConverting(true)
        const html = await markdownToHtml(markdown)
        editor.commands.setContent(html)
        lastMarkdownRef.current = markdown
        setTimeout(() => setIsConverting(false), 100)
      }
    }
    setupContent()
  }, [editor, markdown])

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted || !editor) {
    return (
      <div className={`${className} p-6`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-gray-500">載入編輯器...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`${className}`}>
      {/* Enhanced Toolbar */}
      <div className="border-b border-gray-200 p-3 bg-gray-50 flex flex-wrap gap-1">
        {/* Undo/Redo */}
        <div className="flex gap-1 mr-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="復原"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="重做"
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Text formatting */}
        <Button
          variant={editor.isActive('bold') ? 'default' : 'outline'}
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="粗體"
        >
          <Bold className="h-4 w-4" />
        </Button>
        
        <Button
          variant={editor.isActive('italic') ? 'default' : 'outline'}
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="斜體"
        >
          <Italic className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Headings */}
        <Button
          variant={editor.isActive('heading', { level: 1 }) ? 'default' : 'outline'}
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          title="標題 1"
        >
          <Heading1 className="h-4 w-4" />
        </Button>

        <Button
          variant={editor.isActive('heading', { level: 2 }) ? 'default' : 'outline'}
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          title="標題 2"
        >
          <Heading2 className="h-4 w-4" />
        </Button>

        <Button
          variant={editor.isActive('heading', { level: 3 }) ? 'default' : 'outline'}
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          title="標題 3"
        >
          <Heading3 className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Lists */}
        <Button
          variant={editor.isActive('bulletList') ? 'default' : 'outline'}
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="無序列表"
        >
          <List className="h-4 w-4" />
        </Button>

        <Button
          variant={editor.isActive('orderedList') ? 'default' : 'outline'}
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="有序列表"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Other formatting */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
          title="插入表格"
        >
          <TableIcon className="h-4 w-4" />
        </Button>

        <Button
          variant={editor.isActive('blockquote') ? 'default' : 'outline'}
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          title="引用"
        >
          <Quote className="h-4 w-4" />
        </Button>

        <Button
          variant={editor.isActive('code') ? 'default' : 'outline'}
          size="sm"
          onClick={() => editor.chain().focus().toggleCode().run()}
          title="行內程式碼"
        >
          <Code className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="分隔線"
        >
          <Minus className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor Content */}
      <div className="p-6">
        <EditorContent 
          editor={editor} 
          className="prose prose-slate max-w-none min-h-[500px] focus:outline-none [&_.ProseMirror]:min-h-[500px] [&_.ProseMirror]:outline-none"
        />
      </div>

      {/* Table Controls (when table is selected) */}
      {editor.isActive('table') && (
        <div className="border-t border-gray-200 p-3 bg-gray-50 flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => editor.chain().focus().addColumnBefore().run()}
          >
            加入欄位 (前)
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => editor.chain().focus().addColumnAfter().run()}
          >
            加入欄位 (後)
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => editor.chain().focus().deleteColumn().run()}
          >
            刪除欄位
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => editor.chain().focus().addRowBefore().run()}
          >
            加入列 (前)
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => editor.chain().focus().addRowAfter().run()}
          >
            加入列 (後)
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => editor.chain().focus().deleteRow().run()}
          >
            刪除列
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => editor.chain().focus().deleteTable().run()}
          >
            刪除表格
          </Button>
        </div>
      )}

      {/* Status Bar */}
      <div className="border-t border-gray-200 px-3 py-2 bg-gray-50 flex justify-between text-xs text-gray-500">
        <div>
          {editor.storage.characterCount?.characters() || 0} 字元
        </div>
        <div>
          {isConverting ? '同步中...' : '已同步'}
        </div>
      </div>
    </div>
  )
}