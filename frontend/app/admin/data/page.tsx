"use client"

import { useState, useEffect } from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Database,
  FileText,
  Activity,
  Trash2,
  RefreshCw,
  Calendar,
  User,
  Tag
} from "lucide-react"
import { listNotes, deleteNote, type Note } from "@/src/lib/api/notes"
import { apiFetch } from "@/src/lib/api/client"

type Event = {
  id: string
  user_id: string
  org_id?: string
  event: string
  target_type?: string
  target_id?: string
  ts: number
  props: Record<string, any>
}

export default function AdminDataPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState({ notes: false, events: false })
  const [error, setError] = useState("")

  // Load notes
  const loadNotes = async () => {
    try {
      setLoading(prev => ({ ...prev, notes: true }))
      const response = await listNotes({ limit: 100 })
      if (response.ok) {
        setNotes(response.data.items)
      }
    } catch (err) {
      console.error('Failed to load notes:', err)
      setError("載入筆記失敗")
    } finally {
      setLoading(prev => ({ ...prev, notes: false }))
    }
  }

  // Load events
  const loadEvents = async () => {
    try {
      setLoading(prev => ({ ...prev, events: true }))
      const response = await apiFetch('/api/v1/events')
      if (response.ok) {
        setEvents(response.data.items)
      }
    } catch (err) {
      console.error('Failed to load events:', err)
      setError("載入事件失敗")
    } finally {
      setLoading(prev => ({ ...prev, events: false }))
    }
  }

  useEffect(() => {
    loadNotes()
    loadEvents()
  }, [])

  // Delete note
  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('確定要刪除這個筆記嗎？此操作不可撤銷。')) return
    
    try {
      await deleteNote(noteId)
      loadNotes() // Reload
    } catch (err) {
      console.error('Failed to delete note:', err)
      setError("刪除筆記失敗")
    }
  }

  // Format timestamp
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-TW')
  }

  // Format JSON
  const formatJson = (obj: any) => {
    return JSON.stringify(obj, null, 2)
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="flex h-16 items-center gap-4 border-b border-slate-200 bg-white px-6">
        <SidebarTrigger />
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
            <Database className="h-5 w-5" />
            數據瀏覽器
          </h1>
        </div>
        <Button 
          variant="outline" 
          onClick={() => {
            loadNotes()
            loadEvents()
          }}
          disabled={loading.notes || loading.events}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          刷新數據
        </Button>
      </header>

      {/* Error Alert */}
      {error && (
        <div className="px-6 pt-4">
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 p-6">
        <Tabs defaultValue="notes" className="space-y-6">
          <TabsList>
            <TabsTrigger value="notes" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              筆記 ({notes.length})
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              事件 ({events.length})
            </TabsTrigger>
          </TabsList>

          {/* Notes Tab */}
          <TabsContent value="notes">
            <Card>
              <CardHeader>
                <CardTitle>筆記數據</CardTitle>
              </CardHeader>
              <CardContent>
                {loading.notes ? (
                  <div className="text-center py-8">載入中...</div>
                ) : notes.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">暫無筆記數據</div>
                ) : (
                  <div className="space-y-4">
                    {notes.map((note) => (
                      <div key={note.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-slate-900 mb-1">
                              {note.title}
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-600">
                              <div>
                                <span className="font-medium">ID:</span> {note.id}
                              </div>
                              <div>
                                <span className="font-medium">狀態:</span>{" "}
                                <Badge variant="outline" className="text-xs">
                                  {note.status}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(note.created_at)}
                              </div>
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {note.org_id || 'N/A'} / {note.course_id || 'N/A'}
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteNote(note.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Tags */}
                        {note.tags && note.tags.length > 0 && (
                          <div className="flex items-center gap-2">
                            <Tag className="h-3 w-3 text-slate-400" />
                            {note.tags.map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* Content Preview */}
                        {note.content_md && (
                          <details className="text-sm">
                            <summary className="cursor-pointer text-slate-600 hover:text-slate-900">
                              內容預覽
                            </summary>
                            <pre className="mt-2 p-2 bg-slate-50 rounded text-xs overflow-x-auto max-h-32">
                              {note.content_md.substring(0, 500)}
                              {note.content_md.length > 500 ? '...' : ''}
                            </pre>
                          </details>
                        )}

                        {/* JSON Data */}
                        {note.content_json && (
                          <details className="text-sm">
                            <summary className="cursor-pointer text-slate-600 hover:text-slate-900">
                              JSON 數據
                            </summary>
                            <pre className="mt-2 p-2 bg-slate-50 rounded text-xs overflow-x-auto max-h-32">
                              {formatJson(note.content_json)}
                            </pre>
                          </details>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events">
            <Card>
              <CardHeader>
                <CardTitle>事件日誌</CardTitle>
              </CardHeader>
              <CardContent>
                {loading.events ? (
                  <div className="text-center py-8">載入中...</div>
                ) : events.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">暫無事件數據</div>
                ) : (
                  <div className="space-y-3">
                    {events.map((event) => (
                      <div key={event.id} className="border rounded-lg p-3">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-2 text-sm">
                          <div>
                            <span className="font-medium text-slate-900">
                              {event.event}
                            </span>
                          </div>
                          <div className="text-slate-600">
                            {event.target_type && (
                              <span>{event.target_type}:{event.target_id}</span>
                            )}
                          </div>
                          <div className="text-slate-600">
                            用戶: {event.user_id}
                          </div>
                          <div className="text-slate-600">
                            {formatDate(event.ts)}
                          </div>
                          <div>
                            {Object.keys(event.props).length > 0 && (
                              <details className="text-xs">
                                <summary className="cursor-pointer text-slate-500">
                                  屬性
                                </summary>
                                <pre className="mt-1 p-1 bg-slate-50 rounded overflow-x-auto">
                                  {formatJson(event.props)}
                                </pre>
                              </details>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
