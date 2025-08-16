'use client'

import { useEffect, useState } from 'react'
import { 
  $getRoot, 
  $getSelection, 
  EditorState, 
  LexicalEditor, 
  UNDO_COMMAND, 
  REDO_COMMAND,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  $createParagraphNode,
  $createTextNode
} from 'lexical'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { HeadingNode, QuoteNode, $createHeadingNode, $createQuoteNode } from '@lexical/rich-text'
import { ListItemNode, ListNode, INSERT_UNORDERED_LIST_COMMAND, INSERT_ORDERED_LIST_COMMAND } from '@lexical/list'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $convertFromMarkdownString, $convertToMarkdownString, TRANSFORMERS } from '@lexical/markdown'
import { Button } from '@/components/ui/button'
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Undo,
  Redo
} from 'lucide-react'

// Simple Lexical theme
const theme = {
  paragraph: 'mb-3 text-gray-700 leading-relaxed',
  heading: {
    h1: 'text-3xl font-bold mb-4 mt-8 text-gray-900 border-b border-gray-200 pb-2',
    h2: 'text-2xl font-semibold mb-3 mt-6 text-gray-900 border-b border-gray-100 pb-1',
    h3: 'text-xl font-medium mb-2 mt-5 text-gray-900',
    h4: 'text-lg font-medium mb-2 mt-4 text-gray-900',
    h5: 'text-base font-medium mb-1 mt-3 text-gray-900',
    h6: 'text-sm font-medium mb-1 mt-2 text-gray-900'
  },
  list: {
    ol: 'list-decimal list-inside my-4 ml-4',
    ul: 'list-disc list-inside my-4 ml-4',
    listitem: 'my-1'
  },
  quote: 'border-l-4 border-blue-500 pl-4 italic text-gray-600 my-4 bg-blue-50 py-2',
  text: {
    bold: 'font-semibold text-gray-900',
    italic: 'italic text-gray-700',
    code: 'bg-gray-100 px-1 py-0.5 rounded text-sm font-mono text-red-600'
  }
}

// Editor configuration
const editorConfig = {
  theme,
  nodes: [
    HeadingNode,
    ListNode,
    ListItemNode,
    QuoteNode
  ],
  onError: (error: Error) => {
    console.error('Lexical error:', error)
  }
}

// Toolbar Component
function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext()
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection()
        
        // Update undo/redo state
        setCanUndo(editor.getEditorState()._selection !== null)
        setCanRedo(editor.getEditorState()._selection !== null)
        
        // Update format state
        if ($isRangeSelection(selection)) {
          setIsBold(selection.hasFormat('bold'))
          setIsItalic(selection.hasFormat('italic'))
        }
      })
    })
  }, [editor])

  const formatText = (format: 'bold' | 'italic') => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format)
  }

  const insertHeading = (level: 1 | 2 | 3) => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        const heading = $createHeadingNode(`h${level}`)
        const textNode = $createTextNode('新標題')
        heading.append(textNode)
        selection.insertNodes([heading])
      }
    })
  }

  const insertQuote = () => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        const quote = $createQuoteNode()
        const textNode = $createTextNode('引用內容')
        quote.append(textNode)
        selection.insertNodes([quote])
      }
    })
  }

  return (
    <div className="border-b border-gray-200 p-3 bg-gray-50 flex flex-wrap gap-1">
      {/* Undo/Redo */}
      <div className="flex gap-1 mr-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
          disabled={!canUndo}
          title="復原"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
          disabled={!canRedo}
          title="重做"
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      <div className="w-px h-6 bg-gray-300 mx-1"></div>

      {/* Text Formatting */}
      <Button
        variant={isBold ? 'default' : 'outline'}
        size="sm"
        onClick={() => formatText('bold')}
        title="粗體"
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        variant={isItalic ? 'default' : 'outline'}
        size="sm"
        onClick={() => formatText('italic')}
        title="斜體"
      >
        <Italic className="h-4 w-4" />
      </Button>

      <div className="w-px h-6 bg-gray-300 mx-1"></div>

      {/* Headings */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => insertHeading(1)}
        title="標題 1"
      >
        <Heading1 className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => insertHeading(2)}
        title="標題 2"
      >
        <Heading2 className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => insertHeading(3)}
        title="標題 3"
      >
        <Heading3 className="h-4 w-4" />
      </Button>

      <div className="w-px h-6 bg-gray-300 mx-1"></div>

      {/* Lists */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)}
        title="無序列表"
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)}
        title="有序列表"
      >
        <ListOrdered className="h-4 w-4" />
      </Button>

      <div className="w-px h-6 bg-gray-300 mx-1"></div>

      {/* Quote */}
      <Button
        variant="outline"
        size="sm"
        onClick={insertQuote}
        title="引用"
      >
        <Quote className="h-4 w-4" />
      </Button>
    </div>
  )
}

// Markdown synchronization plugin
function MarkdownPlugin({ markdown, onChange }: { markdown: string, onChange: (md: string) => void }) {
  const [editor] = useLexicalComposerContext()
  const [isInitialized, setIsInitialized] = useState(false)

  // Load initial markdown content
  useEffect(() => {
    if (!isInitialized && markdown) {
      editor.update(() => {
        try {
          $convertFromMarkdownString(markdown, TRANSFORMERS)
          setIsInitialized(true)
        } catch (error) {
          console.error('Error converting markdown to editor state:', error)
          // Fallback: create simple paragraph with content
          const root = $getRoot()
          root.clear()
          const paragraph = $createParagraphNode()
          const textNode = $createTextNode(markdown)
          paragraph.append(textNode)
          root.append(paragraph)
          setIsInitialized(true)
        }
      })
    }
  }, [editor, markdown, isInitialized])

  // Handle changes and convert to markdown
  const handleChange = (editorState: EditorState) => {
    editorState.read(() => {
      try {
        const markdownString = $convertToMarkdownString(TRANSFORMERS)
        onChange(markdownString)
      } catch (error) {
        console.error('Error converting editor state to markdown:', error)
        // Fallback: get plain text
        const root = $getRoot()
        const textContent = root.getTextContent()
        onChange(textContent)
      }
    })
  }

  return <OnChangePlugin onChange={handleChange} />
}

interface LexicalWYSIWYGProps {
  markdown: string
  onChange: (markdown: string) => void
  className?: string
}

export default function LexicalWYSIWYG({ markdown, onChange, className = '' }: LexicalWYSIWYGProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <div className={`${className} p-6`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-gray-500">載入 WYSIWYG 編輯器...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <LexicalComposer initialConfig={editorConfig}>
        <ToolbarPlugin />
        <div className="relative min-h-[500px] border border-gray-200">
          <RichTextPlugin
            contentEditable={
              <ContentEditable 
                className="min-h-[500px] p-6 outline-none resize-none focus:outline-none" 
                style={{ userSelect: 'text' }}
                spellCheck={false}
              />
            }
            placeholder={
              <div className="absolute top-6 left-6 text-gray-400 pointer-events-none">
                開始輸入您的內容... (所見即所得模式)
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <MarkdownPlugin markdown={markdown} onChange={onChange} />
          <HistoryPlugin />
        </div>
      </LexicalComposer>
    </div>
  )
}
