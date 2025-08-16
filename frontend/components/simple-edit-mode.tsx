'use client'

import { useState, useEffect, useRef } from 'react'
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
  Undo,
  Redo,
  Eye,
  Edit
} from 'lucide-react'
import { marked } from 'marked'

interface SimpleEditModeProps {
  markdown: string
  onChange: (markdown: string) => void
  className?: string
}

export default function SimpleEditMode({ markdown, onChange, className = '' }: SimpleEditModeProps) {
  const [content, setContent] = useState(markdown)
  const [isPreview, setIsPreview] = useState(false)
  const [htmlContent, setHtmlContent] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [history, setHistory] = useState<string[]>([markdown])
  const [historyIndex, setHistoryIndex] = useState(0)

  // Update content when markdown prop changes
  useEffect(() => {
    if (markdown !== content) {
      setContent(markdown)
      setHistory([markdown])
      setHistoryIndex(0)
    }
  }, [markdown])

  // Convert markdown to HTML for preview
  useEffect(() => {
    if (isPreview) {
      marked.setOptions({
        breaks: true,
        gfm: true
      })
      
      marked.parse(content).then(html => {
        setHtmlContent(html)
      }).catch(err => {
        console.error('Error parsing markdown:', err)
        setHtmlContent(content)
      })
    }
  }, [content, isPreview])

  const handleContentChange = (newContent: string) => {
    setContent(newContent)
    onChange(newContent)
    
    // Add to history (limit to last 50 entries)
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(newContent)
    if (newHistory.length > 50) {
      newHistory.shift()
    }
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      const newContent = history[newIndex]
      setContent(newContent)
      onChange(newContent)
      setHistoryIndex(newIndex)
    }
  }

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      const newContent = history[newIndex]
      setContent(newContent)
      onChange(newContent)
      setHistoryIndex(newIndex)
    }
  }

  const insertText = (before: string, after: string = '', placeholder: string = '') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)
    const textToInsert = selectedText || placeholder
    
    const newContent = content.substring(0, start) + before + textToInsert + after + content.substring(end)
    
    handleContentChange(newContent)
    
    // Set cursor position
    setTimeout(() => {
      if (selectedText) {
        textarea.setSelectionRange(start + before.length, start + before.length + textToInsert.length)
      } else {
        textarea.setSelectionRange(start + before.length, start + before.length + placeholder.length)
      }
      textarea.focus()
    }, 0)
  }

  const insertAtLineStart = (prefix: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const beforeCursor = content.substring(0, start)
    const afterCursor = content.substring(start)
    
    // Find the start of the current line
    const lineStart = beforeCursor.lastIndexOf('\n') + 1
    const lineEnd = afterCursor.indexOf('\n')
    const currentLine = beforeCursor.substring(lineStart) + (lineEnd === -1 ? afterCursor : afterCursor.substring(0, lineEnd))
    
    // Check if line already has the prefix
    if (currentLine.startsWith(prefix)) {
      // Remove the prefix
      const newContent = content.substring(0, lineStart) + currentLine.substring(prefix.length) + content.substring(lineStart + currentLine.length)
      handleContentChange(newContent)
      setTimeout(() => {
        textarea.setSelectionRange(start - prefix.length, start - prefix.length)
        textarea.focus()
      }, 0)
    } else {
      // Add the prefix
      const newContent = content.substring(0, lineStart) + prefix + content.substring(lineStart)
      handleContentChange(newContent)
      setTimeout(() => {
        textarea.setSelectionRange(start + prefix.length, start + prefix.length)
        textarea.focus()
      }, 0)
    }
  }

  const insertTable = () => {
    const tableMarkdown = `
| 標題1 | 標題2 | 標題3 |
|-------|-------|-------|
| 內容1 | 內容2 | 內容3 |
| 內容4 | 內容5 | 內容6 |
`
    insertText(tableMarkdown)
  }

  return (
    <div className={`${className}`}>
      {/* Toolbar */}
      <div className="border-b border-gray-200 p-3 bg-gray-50 flex flex-wrap gap-1">
        {/* Mode Toggle */}
        <div className="flex gap-1 mr-2">
          <Button
            variant={!isPreview ? 'default' : 'outline'}
            size="sm"
            onClick={() => setIsPreview(false)}
            title="編輯模式"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant={isPreview ? 'default' : 'outline'}
            size="sm"
            onClick={() => setIsPreview(true)}
            title="預覽模式"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Undo/Redo */}
        <div className="flex gap-1 mr-2">
          <Button
            variant="outline"
            size="sm"
            onClick={undo}
            disabled={historyIndex <= 0}
            title="復原"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            title="重做"
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Formatting */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => insertText('**', '**', '粗體文字')}
          title="粗體"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => insertText('*', '*', '斜體文字')}
          title="斜體"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => insertText('`', '`', '代碼')}
          title="行內代碼"
        >
          <Code className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Headings */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => insertAtLineStart('# ')}
          title="標題 1"
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => insertAtLineStart('## ')}
          title="標題 2"
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => insertAtLineStart('### ')}
          title="標題 3"
        >
          <Heading3 className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Lists */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => insertAtLineStart('- ')}
          title="無序列表"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => insertAtLineStart('1. ')}
          title="有序列表"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => insertAtLineStart('> ')}
          title="引用"
        >
          <Quote className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Table */}
        <Button
          variant="outline"
          size="sm"
          onClick={insertTable}
          title="插入表格"
        >
          <TableIcon className="h-4 w-4" />
        </Button>
      </div>

      {/* Content Area */}
      <div className="relative">
        {isPreview ? (
          /* Preview Mode */
          <div className="p-6 min-h-[500px] prose prose-sm max-w-none
            prose-headings:text-gray-900 prose-headings:font-semibold
            prose-h1:text-3xl prose-h1:mb-4 prose-h1:mt-8 prose-h1:border-b prose-h1:border-gray-200 prose-h1:pb-2
            prose-h2:text-2xl prose-h2:mb-3 prose-h2:mt-6 prose-h2:border-b prose-h2:border-gray-100 prose-h2:pb-1
            prose-h3:text-xl prose-h3:mb-2 prose-h3:mt-5
            prose-h4:text-lg prose-h4:mb-2 prose-h4:mt-4
            prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
            prose-ul:my-4 prose-ol:my-4 prose-li:my-1
            prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600
            prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-code:text-red-600
            prose-pre:bg-gray-100 prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto
            prose-table:border-collapse prose-table:border prose-table:border-gray-300 prose-table:w-full
            prose-th:border prose-th:border-gray-300 prose-th:bg-gray-100 prose-th:px-4 prose-th:py-2 prose-th:text-left prose-th:font-semibold
            prose-td:border prose-td:border-gray-300 prose-td:px-4 prose-td:py-2
            prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
            prose-strong:text-gray-900 prose-strong:font-semibold
            prose-em:text-gray-700 prose-em:italic"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        ) : (
          /* Edit Mode */
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            className="w-full min-h-[500px] p-6 border-0 resize-none focus:outline-none focus:ring-0 font-mono text-sm leading-relaxed"
            placeholder="在此處輸入您的 Markdown 內容..."
            style={{ fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Inconsolata, "Liberation Mono", "Courier New", monospace' }}
          />
        )}
      </div>
    </div>
  )
}
