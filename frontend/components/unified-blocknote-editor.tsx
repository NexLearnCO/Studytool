"use client"

import { useEffect, useState } from 'react'
import "@blocknote/core/fonts/inter.css"
import { useCreateBlockNote } from "@blocknote/react"
import { BlockNoteView } from "@blocknote/mantine"
import "@blocknote/mantine/style.css"

interface UnifiedBlockNoteEditorProps {
  markdown: string
  onChange: (markdown: string) => void
  readOnly?: boolean
  className?: string
}

export default function UnifiedBlockNoteEditor({ 
  markdown, 
  onChange, 
  readOnly = false,
  className = '' 
}: UnifiedBlockNoteEditorProps) {
  // 創建 BlockNote 編輯器實例
  const editor = useCreateBlockNote({
    // 暫時使用簡單的初始內容，後續實現 Markdown 轉換
    initialContent: markdown ? [
      {
        type: "paragraph",
        content: [{ type: "text", text: markdown }]
      }
    ] : undefined
  })

  // 處理內容變化（僅在非只讀模式）
  const handleChange = () => {
    if (readOnly) return
    
    // TODO: 實現 BlockNote → Markdown 轉換
    // 暫時傳回簡單文本
    const textContent = editor.getHTML() || ''
    onChange(textContent)
  }

  return (
    <div className={`unified-blocknote-editor ${className}`}>
      <BlockNoteView
        editor={editor}
        onChange={handleChange}
        editable={!readOnly}
        theme="light"
      />
      
      {/* 只讀模式提示 */}
      {readOnly && (
        <div className="absolute top-2 right-2 text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
          預覽模式 - 點擊編輯按鈕開始編輯
        </div>
      )}
    </div>
  )
}
