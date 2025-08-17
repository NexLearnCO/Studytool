'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Lock, Unlock, Save } from 'lucide-react'
import SimpleBlockNoteUnified from './simple-blocknote-unified'

interface AINotesViewerSimplifiedProps {
  aiNotes: string
  onNotesChange: (notes: string) => void
  className?: string
}

export default function AINotesViewerSimplified({
  aiNotes,
  onNotesChange,
  className = ''
}: AINotesViewerSimplifiedProps) {
  const [isLocked, setIsLocked] = useState(true) // 預設為鎖定（預覽模式）
  const [currentNotes, setCurrentNotes] = useState(aiNotes)
  const [hasChanges, setHasChanges] = useState(false)

  const handleNotesChange = (newNotes: string) => {
    setCurrentNotes(newNotes)
    setHasChanges(newNotes !== aiNotes)
  }

  const handleSave = () => {
    onNotesChange(currentNotes)
    setHasChanges(false)
  }

  const handleToggleLock = () => {
    if (!isLocked && hasChanges) {
      const confirmToggle = window.confirm('您有未保存的更改，確定要切換模式嗎？')
      if (!confirmToggle) return
    }
    setIsLocked(!isLocked)
  }

  return (
    <div className={`bg-white rounded-lg border ${className}`}>
      {/* 簡化的工具列 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <h3 className="font-medium">AI 筆記</h3>
          {hasChanges && (
            <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded">
              未保存
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleLock}
            className="text-xs px-3 py-1"
          >
            {isLocked ? (
              <>
                <Lock className="h-3 w-3 mr-1" />
                點擊編輯
              </>
            ) : (
              <>
                <Unlock className="h-3 w-3 mr-1" />
                編輯中
              </>
            )}
          </Button>
          
          {!isLocked && hasChanges && (
            <Button
              size="sm"
              onClick={handleSave}
              className="text-xs px-3 py-1"
            >
              <Save className="h-3 w-3 mr-1" />
              保存
            </Button>
          )}
        </div>
      </div>

      {/* 單一 BlockNote 實例 - 用 editable 控制狀態 */}
      <div className="min-h-[500px]">
        <SimpleBlockNoteUnified
          initialMarkdown={aiNotes}
          onChange={handleNotesChange}
          editable={!isLocked}
          className="p-6"
        />
      </div>
    </div>
  )
}
