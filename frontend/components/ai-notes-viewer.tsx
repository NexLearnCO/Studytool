'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Edit, Eye, Save, X } from 'lucide-react'
import PreviewMode from './preview-mode'
import EditMode from './edit-mode'

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
  const [mode, setMode] = useState<'preview' | 'edit'>('preview')
  const [editingNotes, setEditingNotes] = useState(aiNotes)

  const handleEditStart = () => {
    setEditingNotes(aiNotes)
    setMode('edit')
  }

  const handleEditCancel = () => {
    setEditingNotes(aiNotes) // Reset to original
    setMode('preview')
  }

  const handleSaveEdit = () => {
    onNotesChange(editingNotes) // Save the edited notes
    setMode('preview')
  }

  const handleNotesChange = (notes: string) => {
    setEditingNotes(notes)
  }

  return (
    <div className={`bg-white rounded-lg border ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-sm text-gray-500">
            {mode === 'preview' ? (
              <>
                <Eye className="h-4 w-4" />
                預覽模式
              </>
            ) : (
              <>
                <Edit className="h-4 w-4" />
                編輯模式
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {mode === 'preview' ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleEditStart}
              className="text-blue-600 border-blue-600 hover:bg-blue-50"
            >
              <Edit className="h-4 w-4 mr-1" />
              編輯
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleEditCancel}
                className="text-gray-600"
              >
                <X className="h-4 w-4 mr-1" />
                取消
              </Button>
              <Button
                size="sm"
                onClick={handleSaveEdit}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Save className="h-4 w-4 mr-1" />
                保存
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="min-h-[500px]">
        {mode === 'preview' ? (
          <div className="p-6">
            <PreviewMode markdown={aiNotes} />
          </div>
        ) : (
          <EditMode 
            markdown={editingNotes}
            onChange={handleNotesChange}
          />
        )}
      </div>
    </div>
  )
}
