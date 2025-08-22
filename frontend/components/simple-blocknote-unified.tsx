"use client"

import { useEffect } from 'react'
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

  // 初始化內容 - 簡化版本
  useEffect(() => {
    if (initialMarkdown && editor) {
      const loadContent = async () => {
        try {
          // 使用官方 API 進行 Markdown 轉換
          const blocks = await editor.tryParseMarkdownToBlocks(initialMarkdown)
          editor.replaceBlocks(editor.document, blocks)
        } catch (error) {
          console.error('Failed to parse markdown:', error)
          // 降級處理：插入為純文本段落
          editor.replaceBlocks(editor.document, [{
            type: "paragraph",
            content: initialMarkdown
          }])
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
