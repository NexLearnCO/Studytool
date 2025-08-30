"use client"

import { useEffect, useRef, useCallback } from 'react'
import { useCreateBlockNote } from "@blocknote/react"
import { BlockNoteView } from "@blocknote/mantine"
import "@blocknote/mantine/style.css"
import { normalizeMarkdown } from "@/src/lib/markdown/normalize"

interface SimpleBlockNoteUnifiedProps {
  initialMarkdown: string
  onChange?: (markdown: string) => void
  editable?: boolean
  className?: string
}

/**
 * Upgrade image blocks - convert ![...](url) paragraphs to image blocks
 */
function upgradeImageBlocks(blocks: any[]): any[] {
  const imgRE = /!\[([^\]]*)\]\(([^)]+)\)/g;
  const out: any[] = [];
  
  for (const block of blocks) {
    if (block.type === "paragraph" && typeof block.content === "string") {
      const text = block.content.trim();
      imgRE.lastIndex = 0; // Reset regex
      const match = imgRE.exec(text);
      
      if (match && match[0] === text) { // Entire paragraph is just an image
        out.push({
          type: "image",
          props: { 
            url: match[2], 
            caption: match[1] || "" 
          }
        });
        continue;
      }
    }
    out.push(block);
  }
  
  return out;
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
  
  const apiBase = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:5000"

  // 初始化內容 - 只在真正需要時執行一次
  useEffect(() => {
    if (initialMarkdown && editor && !isInitialized.current && initialMarkdown !== lastInitialMarkdown.current) {
      const loadContent = async () => {
        try {
          // 1. Normalize markdown (handle frontmatter, LaTeX, static URLs)
          const normalized = normalizeMarkdown(initialMarkdown)
          
          // 2. Parse to blocks
          let blocks = await editor.tryParseMarkdownToBlocks(normalized)
          
          // 3. Upgrade image blocks
          blocks = upgradeImageBlocks(blocks)
          
          // 4. Apply to editor
          editor.replaceBlocks(editor.document, blocks)
          
          // 標記為已初始化
          isInitialized.current = true
          lastInitialMarkdown.current = initialMarkdown
        } catch (error) {
          console.error('Failed to parse markdown:', error)
          // 降級處理：插入為純文本段落
          const normalized = normalizeMarkdown(initialMarkdown)
          editor.replaceBlocks(editor.document, [{
            type: "paragraph",
            content: normalized
          }])
          isInitialized.current = true
          lastInitialMarkdown.current = initialMarkdown
        }
      }
      
      // 簡單延遲確保編輯器準備好
      setTimeout(loadContent, 100)
    }
  }, [initialMarkdown, editor, apiBase])

  // 處理內容變化
  const handleChange = useCallback(async () => {
    if (!onChange || !editor || !isInitialized.current) return
    
    try {
      // 使用官方 API 匯出 Markdown
      const markdown = await editor.blocksToMarkdownLossy()
      console.log('BlockNote onChange triggered, markdown length:', markdown.length)
      onChange(markdown)
    } catch (error) {
      console.error('Failed to export markdown:', error)
    }
  }, [onChange, editor])

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
