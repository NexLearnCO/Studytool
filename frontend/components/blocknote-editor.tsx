'use client'

import { useEffect, useState } from 'react'
import "@blocknote/core/fonts/inter.css"
import { useCreateBlockNote } from "@blocknote/react"
import { BlockNoteView } from "@blocknote/mantine"
import "@blocknote/mantine/style.css"

interface BlockNoteEditorProps {
  markdown: string
  onChange: (markdown: string) => void
  className?: string
}

export default function BlockNoteEditor({ 
  markdown, 
  onChange, 
  className = '' 
}: BlockNoteEditorProps) {
  // 創建一個基本的 BlockNote 編輯器實例
  const editor = useCreateBlockNote()

  // 處理內容變化 - 暫時簡化，後續添加 Markdown 轉換
  const handleChange = () => {
    // TODO: 實現 BlockNote 到 Markdown 的轉換
    // 暫時傳回空字符串，確保編輯器能正常載入
    onChange('')
  }

  // 暫時注釋掉 Markdown 相關邏輯，先讓編輯器能正常載入
  // useEffect(() => {
  //   // TODO: 實現 Markdown 到 BlockNote 的轉換
  // }, [markdown, editor])

  return (
    <div className={`blocknote-editor ${className}`}>
      <BlockNoteView
        editor={editor}
        onChange={handleChange}
        theme="light"
      />
    </div>
  )
}
