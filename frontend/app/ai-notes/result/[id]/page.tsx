"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { 
  Brain,
  FileText,
  Zap,
  BookOpen,
  Eye,
  Save,
  Download,
  Copy,
  ArrowLeft,
  Loader2,
  CheckCircle,
  AlertCircle,
  Sparkles
} from "lucide-react"
import { getNote, type Note } from "@/src/lib/api/notes"
import { 
  createArtifact, 
  listArtifacts, 
  generateFlashcardsFromNote,
  generateQuizFromNote,
  type Artifact 
} from "@/src/lib/api/artifacts"
import { track } from "@/src/lib/track"
import MarkmapViewer from "@/components/markmap-viewer"

export default function AIResultPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  
  const [note, setNote] = useState<Note | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  
  // Generated content states
  const [flashcards, setFlashcards] = useState<any[] | null>(null)
  const [quiz, setQuiz] = useState<any | null>(null)
  const [savedArtifacts, setSavedArtifacts] = useState<Artifact[]>([])
  
  // Loading states
  const [generatingCards, setGeneratingCards] = useState(false)
  const [generatingQuiz, setGeneratingQuiz] = useState(false)
  const [savingCards, setSavingCards] = useState(false)
  const [savingQuiz, setSavingQuiz] = useState(false)

  // Load note and existing artifacts
  useEffect(() => {
    if (!id) return
    
    const loadData = async () => {
      try {
        setLoading(true)
        setError("")
        
        // Load note
        const noteResponse = await getNote(id)
        if (!noteResponse.ok) {
          throw new Error("筆記不存在或已被刪除")
        }
        
        setNote(noteResponse.data)
        
        // Load existing artifacts
        const artifactsResponse = await listArtifacts(id)
        if (artifactsResponse.ok) {
          setSavedArtifacts(artifactsResponse.data)
        }
        
        await track('AI_RESULT_PAGE_VIEWED', { note_id: id })
        
      } catch (err) {
        console.error('Failed to load AI result data:', err)
        setError(err instanceof Error ? err.message : "載入失敗")
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [id])

  // Generate flashcards
  const handleGenerateFlashcards = async () => {
    if (!note) return
    
    try {
      setGeneratingCards(true)
      setError("")
      
      const response = await generateFlashcardsFromNote(id)
      if (!response.ok) {
        throw new Error("生成閃卡失敗")
      }
      
      setFlashcards(response.data.cards || [])
      await track('FLASHCARDS_GENERATED', { note_id: id, count: response.data.cards?.length || 0 })
      
    } catch (err) {
      console.error('Failed to generate flashcards:', err)
      setError(err instanceof Error ? err.message : "生成閃卡失敗")
    } finally {
      setGeneratingCards(false)
    }
  }

  // Save flashcards as artifact
  const handleSaveFlashcards = async () => {
    if (!flashcards || flashcards.length === 0) return
    
    try {
      setSavingCards(true)
      setError("")
      
      await createArtifact(id, {
        kind: 'flashcards',
        data_json: { cards: flashcards },
        status: 'active'
      })
      
      // Reload artifacts
      const artifactsResponse = await listArtifacts(id)
      if (artifactsResponse.ok) {
        setSavedArtifacts(artifactsResponse.data)
      }
      
      await track('FLASHCARDS_SAVED', { note_id: id, count: flashcards.length })
      
    } catch (err) {
      console.error('Failed to save flashcards:', err)
      setError(err instanceof Error ? err.message : "保存閃卡失敗")
    } finally {
      setSavingCards(false)
    }
  }

  // Generate quiz
  const handleGenerateQuiz = async () => {
    if (!note) return
    
    try {
      setGeneratingQuiz(true)
      setError("")
      
      const response = await generateQuizFromNote(id)
      if (!response.ok) {
        throw new Error("生成測驗失敗")
      }
      
      setQuiz(response.data)
      await track('QUIZ_GENERATED', { note_id: id, count: response.data.questions?.length || 0 })
      
    } catch (err) {
      console.error('Failed to generate quiz:', err)
      setError(err instanceof Error ? err.message : "生成測驗失敗")
    } finally {
      setGeneratingQuiz(false)
    }
  }

  // Save quiz as artifact
  const handleSaveQuiz = async () => {
    if (!quiz) return
    
    try {
      setSavingQuiz(true)
      setError("")
      
      await createArtifact(id, {
        kind: 'quiz',
        data_json: quiz,
        status: 'active'
      })
      
      // Reload artifacts
      const artifactsResponse = await listArtifacts(id)
      if (artifactsResponse.ok) {
        setSavedArtifacts(artifactsResponse.data)
      }
      
      await track('QUIZ_SAVED', { note_id: id, count: quiz.questions?.length || 0 })
      
    } catch (err) {
      console.error('Failed to save quiz:', err)
      setError(err instanceof Error ? err.message : "保存測驗失敗")
    } finally {
      setSavingQuiz(false)
    }
  }

  // Copy content to clipboard
  const handleCopyContent = async () => {
    if (!note?.content_md) return
    
    try {
      await navigator.clipboard.writeText(note.content_md)
      await track('CONTENT_COPIED', { note_id: id })
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  // Download as markdown
  const handleDownloadMarkdown = () => {
    if (!note?.content_md) return
    
    const blob = new Blob([note.content_md], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${note.title || 'AI筆記'}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    track('CONTENT_DOWNLOADED', { note_id: id, format: 'markdown' })
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>載入 AI 結果中...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error && !note) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="flex-1 flex items-center justify-center">
          <Alert className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  const markdown = note?.content_md || note?.content || ""
  const hasFlashcardsArtifact = savedArtifacts.some(a => a.kind === 'flashcards')
  const hasQuizArtifact = savedArtifacts.some(a => a.kind === 'quiz')

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push('/notes')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              我的筆記
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                <Brain className="h-5 w-5 text-blue-600" />
                {note?.title || "AI 生成結果"}
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI Studio
                </Badge>
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleCopyContent}>
              <Copy className="mr-2 h-4 w-4" />
              複製
            </Button>
            <Button variant="outline" onClick={handleDownloadMarkdown}>
              <Download className="mr-2 h-4 w-4" />
              下載
            </Button>
            <Button onClick={() => router.push(`/notes/${id}`)}>
              <Eye className="mr-2 h-4 w-4" />
              編輯筆記
            </Button>
          </div>
        </div>
      </header>

      {/* Error Alert */}
      {error && (
        <div className="px-6 pt-4">
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 p-6 space-y-6">
        {/* Mindmap Section */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              思維導圖
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] border rounded-lg bg-white">
              <MarkmapViewer markdown={markdown} className="w-full h-full" />
            </div>
          </CardContent>
        </Card>

        {/* AI Tools Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Flashcards */}
          <Card className="shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-600" />
                  閃卡生成
                  {hasFlashcardsArtifact && (
                    <Badge variant="default" className="bg-green-100 text-green-700">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      已保存
                    </Badge>
                  )}
                </CardTitle>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleGenerateFlashcards}
                    disabled={generatingCards}
                  >
                    {generatingCards ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                    {generatingCards ? '生成中...' : '生成'}
                  </Button>
                  {flashcards && (
                    <Button 
                      size="sm"
                      onClick={handleSaveFlashcards}
                      disabled={savingCards || hasFlashcardsArtifact}
                    >
                      {savingCards ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      {savingCards ? '保存中...' : hasFlashcardsArtifact ? '已保存' : '保存'}
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {!flashcards ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto mb-3 text-slate-400" />
                  <p className="text-slate-500 mb-4">
                    {generatingCards ? '正在從筆記內容生成閃卡...' : '點擊「生成」創建學習閃卡'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {flashcards.map((card, index) => (
                    <div key={index} className="p-3 border rounded-lg bg-slate-50">
                      <div className="font-medium text-slate-900 mb-1">
                        Q: {card.front}
                      </div>
                      <div className="text-slate-600 text-sm">
                        A: {card.back}
                      </div>
                      {card.tags && (
                        <div className="flex gap-1 mt-2">
                          {card.tags.map((tag: string, i: number) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quiz */}
          <Card className="shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-green-600" />
                  測驗生成
                  {hasQuizArtifact && (
                    <Badge variant="default" className="bg-green-100 text-green-700">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      已保存
                    </Badge>
                  )}
                </CardTitle>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleGenerateQuiz}
                    disabled={generatingQuiz}
                  >
                    {generatingQuiz ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                    {generatingQuiz ? '生成中...' : '生成'}
                  </Button>
                  {quiz && (
                    <Button 
                      size="sm"
                      onClick={handleSaveQuiz}
                      disabled={savingQuiz || hasQuizArtifact}
                    >
                      {savingQuiz ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      {savingQuiz ? '保存中...' : hasQuizArtifact ? '已保存' : '保存'}
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {!quiz ? (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 mx-auto mb-3 text-slate-400" />
                  <p className="text-slate-500 mb-4">
                    {generatingQuiz ? '正在從筆記內容生成測驗...' : '點擊「生成」創建練習測驗'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {quiz.questions?.map((question: any, index: number) => (
                    <div key={index} className="p-3 border rounded-lg bg-slate-50">
                      <div className="font-medium text-slate-900 mb-2">
                        {index + 1}. {question.stem}
                      </div>
                      {question.choices && (
                        <div className="space-y-1 mb-2">
                          {question.choices.map((choice: string, i: number) => (
                            <div key={i} className="text-sm text-slate-600">
                              {String.fromCharCode(65 + i)}. {choice}
                            </div>
                          ))}
                        </div>
                      )}
                      {question.explain && (
                        <div className="text-xs text-slate-500 mt-2 p-2 bg-blue-50 rounded">
                          <strong>解釋：</strong>{question.explain}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Summary */}
        {savedArtifacts.length > 0 && (
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                已保存的學習工具
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                {savedArtifacts.map((artifact) => (
                  <Badge key={artifact.id} variant="outline" className="bg-green-50 text-green-700">
                    {artifact.kind === 'flashcards' && '閃卡'}
                    {artifact.kind === 'quiz' && '測驗'}
                    {artifact.kind === 'markmap' && '思維導圖'}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}