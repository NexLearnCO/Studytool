"use client"

import { useEffect, useRef } from 'react'
import { useCreateBlockNote } from "@blocknote/react"
import { BlockNoteView } from "@blocknote/mantine"
import "@blocknote/mantine/style.css"

interface SimpleBlockNoteUnifiedProps {
  initialMarkdown: string
  onChange?: (markdown: string) => void
  editable?: boolean
  className?: string
}

export default function SimpleBlockNoteUnified({
  initialMarkdown,
  onChange,
  editable = true,
  className = ""
}: SimpleBlockNoteUnifiedProps) {
  // 創建編輯器實例 - 使用開箱即用的功能
  const editor = useCreateBlockNote()
  
  // 追蹤是否已經初始化，避免重複載入
  const isInitialized = useRef(false)
  const lastInitialMarkdown = useRef<string>("")

  // 初始化內容 - 只在真正需要時執行一次
  useEffect(() => {
    if (initialMarkdown && editor && !isInitialized.current && initialMarkdown !== lastInitialMarkdown.current) {
      const loadContent = async () => {
        try {
          // 使用官方 API 進行 Markdown 轉換
          const blocks = await editor.tryParseMarkdownToBlocks(initialMarkdown)
          editor.replaceBlocks(editor.document, blocks)
          
          // 標記為已初始化
          isInitialized.current = true
          lastInitialMarkdown.current = initialMarkdown
        } catch (error) {
          console.error('Failed to parse markdown:', error)
          // 降級處理：插入為純文本段落
          editor.replaceBlocks(editor.document, [{
            type: "paragraph",
            content: initialMarkdown
          }])
          isInitialized.current = true
          lastInitialMarkdown.current = initialMarkdown
        }
      }
      
      // 簡單延遲確保編輯器準備好
      setTimeout(loadContent, 100)
    }
  }, [initialMarkdown, editor])

  // 處理內容變化
  const handleChange = async () => {
    if (!onChange || !editor) return
    
    try {
      // 使用官方 API 匯出 Markdown
      const markdown = await editor.blocksToMarkdownLossy()
      onChange(markdown)
    } catch (error) {
      console.error('Failed to export markdown:', error)
    }
  }

  return (
    <div className={`bn-editor ${className}`}>
      <BlockNoteView
        editor={editor}
        editable={editable}
        onChange={handleChange}
        theme="light"
      />
    </div>
  )
}
