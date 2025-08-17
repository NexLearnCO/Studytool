'use client'

import AINotesViewerSimplified from './ai-notes-viewer-simplified'

interface AINotesViewerProps {
  aiNotes: string
  onNotesChange: (notes: string) => void
  className?: string
}

export default function AINotesViewer({ 
  aiNotes, 
  onNotesChange, 
  className = '' 
}: AINotesViewerProps) {
  // 簡化：直接使用統一的 BlockNote 編輯器
  return (
    <AINotesViewerSimplified
      aiNotes={aiNotes}
      onNotesChange={onNotesChange}
      className={className}
    />
  )
}