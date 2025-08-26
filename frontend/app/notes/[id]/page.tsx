"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  ArrowLeft, 
  Save, 
  Eye,
  Calendar,
  Tag,
  CheckCircle,
  AlertCircle,
  Loader2,
  Brain,
  Zap,
  BookOpen,
  ExternalLink
} from "lucide-react"
import { getNote, updateNote, type Note } from "@/src/lib/api/notes"
import { listArtifacts, type Artifact } from "@/src/lib/api/artifacts"
import { track } from "@/src/lib/track"
import SimpleBlockNoteUnified from "@/components/simple-blocknote-unified"
import MarkmapViewer from "@/components/markmap-viewer"

export default function NoteEditorPage() {
  const params = useParams()
  const router = useRouter()
  const noteId = params.id as string
  
  const [note, setNote] = useState<Note | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [showPreview, setShowPreview] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  
  // Artifacts state
  const [artifacts, setArtifacts] = useState<Artifact[]>([])
  const [loadingArtifacts, setLoadingArtifacts] = useState(false)

  // 用於編輯器的穩定初始內容 - 避免重建編輯器
  const initialContentRef = useRef<string>("")

  // Debounced autosave
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout>()

  // Load note
  const loadNote = async () => {
    try {
      setLoading(true)
      setError("")
      const response = await getNote(noteId)
      
      if (response.ok) {
        const noteData = response.data
        setNote(noteData)
        setTitle(noteData.title)
        
        // Use content_md if available, fallback to legacy content
        const initialContent = noteData.content_md || noteData.content || ""
        initialContentRef.current = initialContent // 穩定的初始內容，只設定一次
        setContent(initialContent)
      } else {
        setError("筆記不存在或已被刪除")
      }
    } catch (err) {
      console.error('Failed to load note:', err)
      setError("載入筆記失敗")
    } finally {
      setLoading(false)
    }
  }

  // Load artifacts
  const loadArtifacts = async () => {
    if (!noteId) return
    
    try {
      setLoadingArtifacts(true)
      const response = await listArtifacts(noteId)
      if (response.ok) {
        setArtifacts(response.data)
      }
    } catch (err) {
      console.error('Failed to load artifacts:', err)
    } finally {
      setLoadingArtifacts(false)
    }
  }

  useEffect(() => {
    if (noteId) {
      loadNote()
      loadArtifacts()
    }
  }, [noteId])

  // Debounced save function
  const debouncedSave = useCallback((updates: Partial<Note>) => {
    if (saveTimeout) {
      clearTimeout(saveTimeout)
    }

    const timeout = setTimeout(async () => {
      try {
        setSaving(true)
        await updateNote(noteId, updates)
        setSuccess(true)
        setTimeout(() => setSuccess(false), 2000)
      } catch (err) {
        console.error('Autosave failed:', err)
        setError("自動保存失敗")
      } finally {
        setSaving(false)
      }
    }, 500)

    setSaveTimeout(timeout)
  }, [noteId, saveTimeout])

  // Handle title change
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle)
    debouncedSave({ title: newTitle })
  }

  // Handle content change from BlockNote
  const handleContentChange = (markdown: string) => {
    setContent(markdown)
    // Save both markdown and track content_json would be available from BlockNote
    debouncedSave({ 
      content_md: markdown,
      content: markdown // Legacy fallback
    })
  }

  // Manual save
  const handleSave = async () => {
    try {
      setSaving(true)
      await updateNote(noteId, {
        title,
        content_md: content,
        content: content
      })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2000)
      
      await track('NOTE_SAVED', { note_id: noteId, manual: true })
    } catch (err) {
      console.error('Save failed:', err)
      setError("保存失敗")
    } finally {
      setSaving(false)
    }
  }

  // Format timestamp
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <header className="flex h-16 items-center gap-4 border-b border-slate-200 bg-white px-6">
          <SidebarTrigger />
          <div className="flex-1">
            <div className="h-6 bg-slate-200 rounded w-32 animate-pulse"></div>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>載入筆記中...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error && !note) {
    return (
      <div className="flex flex-col min-h-screen">
        <header className="flex h-16 items-center gap-4 border-b border-slate-200 bg-white px-6">
          <SidebarTrigger />
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-slate-900">筆記不存在</h1>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <Alert className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="flex h-16 items-center gap-4 border-b border-slate-200 bg-white px-6">
        <SidebarTrigger />
        <Button variant="ghost" onClick={() => router.push('/notes')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          我的筆記
        </Button>
        <div className="flex-1">
          <Input
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="text-xl font-semibold border-none bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            placeholder="輸入筆記標題..."
          />
        </div>
        
        {/* Status indicators - 右上角浮動膠囊 */}
        <div className="flex items-center gap-2">
          {saving && (
            <div className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 text-sm rounded-full border border-blue-200">
              <Loader2 className="h-3 w-3 animate-spin" />
              保存中...
            </div>
          )}
          {success && (
            <div className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 text-sm rounded-full border border-green-200">
              <CheckCircle className="h-3 w-3" />
              已保存
            </div>
          )}
        </div>

        <Button variant="outline" onClick={() => setShowPreview(!showPreview)}>
          <Eye className="mr-2 h-4 w-4" />
          {showPreview ? '隱藏' : '預覽'}導圖
        </Button>
        
        <Button onClick={handleSave} disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          保存
        </Button>
      </header>

      {/* Meta info */}
      {note && (
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-3">
          <div className="flex items-center gap-6 text-sm text-slate-600">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              創建於 {formatDate(note.created_at)}
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              更新於 {formatDate(note.updated_at)}
            </div>
            <Badge variant="outline" className="text-xs">
              {note.status}
            </Badge>
            {note.tags && note.tags.length > 0 && (
              <div className="flex items-center gap-2">
                <Tag className="h-3 w-3" />
                {note.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error alert */}
      {error && (
        <div className="px-6 pt-4">
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
          <div className="min-w-0">
            {showPreview ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-16rem)]">
            {/* Editor */}
            <Card className="h-full shadow-sm overflow-hidden">
              <CardHeader className="border-b bg-slate-50/50 flex-shrink-0">
                <CardTitle className="text-lg font-semibold text-slate-800">✏️ 編輯器</CardTitle>
              </CardHeader>
              <CardContent className="h-[calc(100%-4rem)] overflow-auto p-4">
                <SimpleBlockNoteUnified
                  key={noteId} 
                  initialMarkdown={initialContentRef.current}
                  onChange={handleContentChange}
                  className="h-full"
                />
              </CardContent>
            </Card>

            {/* Mindmap Preview */}
            <Card className="h-full shadow-sm overflow-hidden">
              <CardHeader className="border-b bg-slate-50/50 flex-shrink-0">
                <CardTitle className="text-lg font-semibold text-slate-800">🧠 思維導圖預覽</CardTitle>
              </CardHeader>
              <CardContent className="h-[calc(100%-4rem)] p-4 overflow-hidden">
                <div className="h-full rounded-lg border bg-white overflow-hidden">
                  <MarkmapViewer 
                    markdown={content} 
                    className="w-full h-full"
                  />
                </div>
              </CardContent>
            </Card>
              </div>
            ) : (
              /* Full Editor */
              <Card className="h-[calc(100vh-12rem)] shadow-sm overflow-hidden">
                <CardContent className="p-6 h-full overflow-auto">
                  <SimpleBlockNoteUnified
                    key={noteId}
                    initialMarkdown={initialContentRef.current}
                    onChange={handleContentChange}
                    className="h-full"
                  />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Sidebar - Learning Tools (Artifacts) */}
          <aside className="space-y-4">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-blue-600" />
                  學習工具
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {loadingArtifacts && (
                  <div className="text-sm text-slate-500 flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    載入中...
                  </div>
                )}
                
                {!loadingArtifacts && artifacts.length === 0 && (
                  <div className="text-sm text-slate-500 text-center py-4">
                    <p className="mb-2">尚未保存任何工具</p>
                    <p className="text-xs">到「AI Studio」生成並保存閃卡或測驗</p>
                  </div>
                )}

                {artifacts.map(artifact => (
                  <div key={artifact.id} className="flex items-center justify-between rounded-lg border p-3 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-2">
                      {artifact.kind === "flashcards" && <Zap className="h-4 w-4 text-yellow-600" />}
                      {artifact.kind === "quiz" && <BookOpen className="h-4 w-4 text-green-600" />}
                      {artifact.kind === "markmap" && <Brain className="h-4 w-4 text-purple-600" />}
                      <span className="text-sm font-medium">
                        {artifact.kind === "flashcards" ? "閃卡" : 
                         artifact.kind === "quiz" ? "測驗" : "思維導圖"}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => 
                        router.push(`/ai-notes/result/${noteId}?view=${artifact.kind === "flashcards" ? "flashcards" : artifact.kind}`)
                      }
                      className="h-8 px-2"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      查看
                    </Button>
                  </div>
                ))}

                <Button 
                  className="w-full" 
                  variant="secondary" 
                  onClick={() => router.push(`/ai-notes/result/${noteId}?view=note`)}
                >
                  <Brain className="h-4 w-4 mr-2" />
                  前往 AI Studio
                </Button>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  )
}
