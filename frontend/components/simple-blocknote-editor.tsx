"use client" // 標記為客戶端組件

import { useEffect, useRef, useCallback } from 'react'
import "@blocknote/core/fonts/inter.css"
import { useCreateBlockNote } from "@blocknote/react"
import { BlockNoteView } from "@blocknote/mantine"
import "@blocknote/mantine/style.css"

interface SimpleBlockNoteEditorProps {
  markdown: string
  onChange: (markdown: string) => void
  readOnly?: boolean
  className?: string
}

// 修復版本：避免初始化衝突和內容丟失
export default function SimpleBlockNoteEditor({ 
  markdown, 
  onChange, 
  readOnly = false,
  className = '' 
}: SimpleBlockNoteEditorProps) {
  const isInitialized = useRef(false)
  const lastMarkdown = useRef('')
  const isUpdating = useRef(false)
  
  // 創建編輯器實例
  const editor = useCreateBlockNote()

  // 安全的內容轉換函數
  const extractMarkdown = useCallback(() => {
    try {
      const blocks = editor.document
      let markdownContent = ''
      
      blocks.forEach(block => {
        if (block.type === 'paragraph') {
          // 提取段落文本
          if (block.content && Array.isArray(block.content)) {
            const text = block.content.map(item => {
              if (typeof item === 'string') return item
              if (item && typeof item === 'object' && 'text' in item) return item.text
              return ''
            }).join('')
            if (text.trim()) {
              markdownContent += text + '\n\n'
            }
          }
        } else if (block.type === 'heading') {
          // 處理標題
          const level = block.props?.level || 1
          const prefix = '#'.repeat(level) + ' '
          if (block.content && Array.isArray(block.content)) {
            const text = block.content.map(item => {
              if (typeof item === 'string') return item
              if (item && typeof item === 'object' && 'text' in item) return item.text
              return ''
            }).join('')
            if (text.trim()) {
              markdownContent += prefix + text + '\n\n'
            }
          }
        }
      })
      
      return markdownContent.trim()
    } catch (error) {
      console.error('Error extracting markdown:', error)
      return ''
    }
  }, [editor])

  // 處理內容變化 - 防抖和防循環
  const handleChange = useCallback(async () => {
    if (readOnly || !isInitialized.current || isUpdating.current) return
    
    const currentMarkdown = extractMarkdown()
    
    // 避免循環更新
    if (currentMarkdown !== lastMarkdown.current) {
      lastMarkdown.current = currentMarkdown
      onChange(currentMarkdown)
    }
  }, [readOnly, extractMarkdown, onChange])

  // 初始化內容 - 只執行一次
  useEffect(() => {
    let mounted = true
    
    const initializeContent = async () => {
      if (!markdown || !editor || isInitialized.current) return
      
      isUpdating.current = true
      
      try {
        // 使用官方 API: pasteMarkdown
        await editor.pasteMarkdown(markdown)
        lastMarkdown.current = markdown
        
        if (mounted) {
          isInitialized.current = true
        }
      } catch (error) {
        console.error('Error loading markdown:', error)
        
        // 降級處理：創建基本段落
        try {
          const lines = markdown.split('\n').filter(line => line.trim())
          if (lines.length > 0) {
            // 先確保編輯器有基本內容
            for (const line of lines.slice(0, 3)) { // 限制前3行避免過多內容
              editor.insertBlocks([{
                type: "paragraph",
                content: line.trim()
              }], editor.document[editor.document.length - 1]?.id, "after")
            }
          }
          
          if (mounted) {
            isInitialized.current = true
            lastMarkdown.current = markdown
          }
        } catch (fallbackError) {
          console.error('Fallback also failed:', fallbackError)
          if (mounted) {
            isInitialized.current = true
          }
        }
      } finally {
        if (mounted) {
          isUpdating.current = false
        }
      }
    }

    // 延遲初始化，確保編輯器準備就緒
    const timer = setTimeout(initializeContent, 200)
    
    return () => {
      mounted = false
      clearTimeout(timer)
    }
  }, [editor]) // 只依賴 editor，不依賴 markdown

  return (
    <div className={`simple-blocknote-editor ${className}`}>
      <BlockNoteView
        editor={editor}
        onChange={handleChange}
        editable={!readOnly}
        theme="light"
      />
    </div>
  )
}
