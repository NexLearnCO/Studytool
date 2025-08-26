"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  FileText, 
  Plus, 
  Search, 
  Calendar,
  Tag,
  Trash2,
  Eye
} from "lucide-react"
import { listNotes, createNote, deleteNote, type Note } from "@/src/lib/api/notes"
import { track } from "@/src/lib/track"

export default function NotesPage() {
  const router = useRouter()
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [creating, setCreating] = useState(false)

  // Load notes
  const loadNotes = async () => {
    try {
      setLoading(true)
      const response = await listNotes({ limit: 50 })
      if (response.ok) {
        setNotes(response.data.items)
      }
    } catch (error) {
      console.error('Failed to load notes:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNotes()
  }, [])

  // Create new note
  const handleCreateNote = async () => {
    try {
      setCreating(true)
      const response = await createNote({ 
        title: '未命名筆記',
        status: 'draft'
      })
      
      if (response.ok) {
        await track('NOTE_CREATED', { source: 'manual', note_id: response.data.id })
        router.push(`/notes/${response.data.id}`)
      }
    } catch (error) {
      console.error('Failed to create note:', error)
    } finally {
      setCreating(false)
    }
  }

  // Delete note
  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('確定要刪除這個筆記嗎？')) return
    
    try {
      await deleteNote(noteId)
      await track('NOTE_DELETED', { note_id: noteId })
      loadNotes() // Reload list
    } catch (error) {
      console.error('Failed to delete note:', error)
    }
  }

  // Filter notes by search query
  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (note.tags || []).some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  // Format timestamp with relative time
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) return '今天'
    if (days === 1) return '昨天'
    if (days < 7) return `${days} 天前`
    
    return date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="flex h-16 items-center gap-4 border-b border-slate-200 bg-white px-6">
        <SidebarTrigger />
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-slate-900">我的筆記</h1>
        </div>
        <Button onClick={handleCreateNote} disabled={creating}>
          <Plus className="mr-2 h-4 w-4" />
          {creating ? '創建中...' : '新建筆記'}
        </Button>
      </header>

      {/* Main Content */}
      <div className="flex-1 space-y-6 p-6">
        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="搜尋筆記標題或標籤..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Notes List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-slate-500">載入中...</div>
          </div>
        ) : filteredNotes.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">
                  {searchQuery ? '未找到匹配的筆記' : '還沒有筆記'}
                </h3>
                <p className="text-slate-500 mb-4">
                  {searchQuery ? '請嘗試不同的搜尋關鍵字' : '開始創建您的第一個筆記'}
                </p>
                {!searchQuery && (
                  <Button onClick={handleCreateNote} disabled={creating}>
                    <Plus className="mr-2 h-4 w-4" />
                    創建第一個筆記
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredNotes.map((note) => (
              <Card key={note.id} className="group hover:shadow-lg hover:shadow-blue-100 transition-all duration-200 border-l-4 border-l-transparent hover:border-l-blue-500 cursor-pointer">
                <CardHeader className="pb-3" onClick={() => router.push(`/notes/${note.id}`)}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-blue-700 transition-colors">
                        {note.title}
                      </CardTitle>
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(note.updated_at)}
                        </div>
                        <Badge 
                          variant={note.status === 'draft' ? 'secondary' : note.status === 'active' ? 'default' : 'outline'} 
                          className="text-xs font-medium"
                        >
                          {note.status === 'draft' ? '草稿' : note.status === 'active' ? '已發布' : note.status}
                        </Badge>
                        {note.exam_system && (
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                            {note.exam_system}
                          </Badge>
                        )}
                        {note.subject && (
                          <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                            {note.subject}
                          </Badge>
                        )}
                      </div>
                      {/* Preview snippet */}
                      {note.content_md && (
                        <p className="text-sm text-slate-600 mt-2 line-clamp-2">
                          {note.content_md.slice(0, 120).replace(/[#*`]/g, '')}...
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/notes/${note.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteNote(note.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                {(note.tags && note.tags.length > 0) && (
                  <CardContent className="pt-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Tag className="h-3 w-3 text-slate-400" />
                      {note.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
