"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
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
  Sparkles,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Play,
  Edit,
  Trash2,
  Plus,
  X
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
import SimpleBlockNoteUnified from "@/components/simple-blocknote-unified"

export default function AIResultPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const searchParams = useSearchParams()
  
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
  // Generation options
  const [flashcardCount, setFlashcardCount] = useState<number>(10)
  const [quizCount, setQuizCount] = useState<number>(5)
  const [flashcardDifficulty, setFlashcardDifficulty] = useState<string>("medium")
  const [flashcardTypes, setFlashcardTypes] = useState<string[]>(["definition", "example"]) 
  const [showQuizExplanations, setShowQuizExplanations] = useState<boolean>(true)
  const [savingCards, setSavingCards] = useState(false)
  const [savingQuiz, setSavingQuiz] = useState(false)

  // Quiz interaction states
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<{[key: number]: string}>({})
  const [showResults, setShowResults] = useState(false)
  const [quizStarted, setQuizStarted] = useState(false)

  // Flashcard editing states
  const [editingCardId, setEditingCardId] = useState<string | null>(null)
  const [editingCard, setEditingCard] = useState<any | null>(null)
  const [isAddingNewCard, setIsAddingNewCard] = useState(false)
  const [newCard, setNewCard] = useState({ front: '', back: '', tags: [] })

  // Tab management
  const currentView = (searchParams.get("view") ?? "note") as "note"|"mindmap"|"flashcards"|"quiz"
  
  const setView = (v: string) => {
    router.replace(`/ai-notes/result/${id}?view=${v}`, { scroll: false })
  }

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

  // Auto-load latest saved artifacts into local states on initial load
  useEffect(() => {
    if (!savedArtifacts || savedArtifacts.length === 0) return

    // Load flashcards if not already set
    if (!flashcards) {
      const latestFlashcards = savedArtifacts.find(a => a.kind === 'flashcards')
      const cards = (latestFlashcards as any)?.data_json?.cards
      if (Array.isArray(cards) && cards.length > 0) {
        setFlashcards(cards)
      }
    }

    // Load quiz if not already set
    if (!quiz) {
      const latestQuiz = savedArtifacts.find(a => a.kind === 'quiz')
      const data = (latestQuiz as any)?.data_json
      if (data) {
        let questions = data.questions || data || []
        if (Array.isArray(questions)) {
          questions = questions.map((q: any) => ({
            stem: q.stem || q.question || q.text || 'No question',
            choices: q.choices || q.options || q.answers || [],
            answer: q.answer || q.correct || 0,
            explain: q.explain || q.explanation || ''
          }))
          setQuiz({ questions })
        }
      }
    }
  }, [savedArtifacts])

  // Generate flashcards
  const handleGenerateFlashcards = async () => {
    if (!note) return
    
    try {
      setGeneratingCards(true)
      setError("")
      
      const response = await generateFlashcardsFromNote(id, {
        count: flashcardCount,
        difficulty: flashcardDifficulty,
        types: flashcardTypes
      })
      console.log('Flashcards response:', response)
      
      if (!response.ok) {
        throw new Error("生成閃卡失敗")
      }
      
      // Handle different response formats and normalize to {front, back} structure
      let cards = response.data?.cards || (response as any).data?.flashcards || (response as any).flashcards || []
      console.log('Extracted cards:', cards)
      
      // Normalize card format: OpenAI returns {question, answer}, we need {front, back}
      cards = cards.map((card: any) => ({
        front: card.front || card.question || card.Q || 'No question',
        back: card.back || card.answer || card.A || 'No answer',
        tags: card.tags || []
      }))
      
      setFlashcards(cards)
      await track('FLASHCARDS_GENERATED', { note_id: id, count: cards.length })
      
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
      
      const response = await generateQuizFromNote(id, { count: quizCount })
      console.log('Quiz response:', response)
      
      if (!response.ok) {
        throw new Error("生成測驗失敗")
      }
      
      // Handle different response formats for quiz
      let quizData = response.data || (response as any).quiz || {}
      let questions = quizData.questions || quizData || []
      console.log('Extracted quiz questions:', questions)
      
      // Normalize question format if needed
      if (Array.isArray(questions)) {
        questions = questions.map((q: any) => ({
          stem: q.stem || q.question || q.text || 'No question',
          choices: q.choices || q.options || q.answers || [],
          answer: q.answer || q.correct || 0,
          explain: q.explain || q.explanation || ''
        }))
      }
      
      setQuiz({ questions })
      await track('QUIZ_GENERATED', { note_id: id, count: questions.length })
      
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

  // Quiz interaction functions
  const handleSelectAnswer = (questionIndex: number, answer: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }))
  }

  const handleStartQuiz = () => {
    setQuizStarted(true)
    setCurrentQuestionIndex(0)
    setSelectedAnswers({})
    setShowResults(false)
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  const handleFinishQuiz = () => {
    setShowResults(true)
  }

  const calculateScore = () => {
    if (!quiz?.questions) return 0
    let correct = 0
    quiz.questions.forEach((question: any, index: number) => {
      const userAnswer = selectedAnswers[index]
      if (userAnswer && question.answer !== undefined) {
        // Handle both letter (A, B, C) and number (0, 1, 2) answers
        const correctAnswer = typeof question.answer === 'number' 
          ? String.fromCharCode(65 + question.answer)  // Convert 0->A, 1->B, etc.
          : question.answer
        if (userAnswer === correctAnswer) {
          correct++
        }
      }
    })
    return Math.round((correct / quiz.questions.length) * 100)
  }

  // Flashcard editing functions
  const handleEditCard = (card: any, index: number) => {
    setEditingCardId(`${index}`)
    setEditingCard({ ...card, index })
  }

  const handleSaveCardEdit = () => {
    if (!editingCard || !flashcards) return
    
    const updatedCards = [...flashcards]
    updatedCards[editingCard.index] = {
      front: editingCard.front,
      back: editingCard.back,
      tags: editingCard.tags || []
    }
    
    setFlashcards(updatedCards)
    setEditingCardId(null)
    setEditingCard(null)
  }

  const handleCancelEdit = () => {
    setEditingCardId(null)
    setEditingCard(null)
  }

  const handleDeleteCard = (index: number) => {
    if (!flashcards) return
    
    const updatedCards = flashcards.filter((_, i) => i !== index)
    setFlashcards(updatedCards)
  }

  const handleAddNewCard = () => {
    if (!newCard.front.trim() || !newCard.back.trim()) return
    
    const updatedCards = flashcards ? [...flashcards] : []
    updatedCards.push({
      front: newCard.front.trim(),
      back: newCard.back.trim(),
      tags: newCard.tags
    })
    
    setFlashcards(updatedCards)
    setNewCard({ front: '', back: '', tags: [] })
    setIsAddingNewCard(false)
  }

  const updateEditingCard = (field: string, value: any) => {
    if (!editingCard) return
    setEditingCard({ ...editingCard, [field]: value })
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
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <Button variant="ghost" onClick={() => router.push('/notes')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                我的筆記
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
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
              {savedArtifacts.length > 0 && (
                <div className="flex gap-2 mr-4">
                  {savedArtifacts.map((artifact) => (
                    <Badge key={artifact.id} variant="outline" className="bg-green-50 text-green-700">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {artifact.kind === 'flashcards' && '閃卡'}
                      {artifact.kind === 'quiz' && '測驗'}
                      {artifact.kind === 'markmap' && '思維導圖'}
                    </Badge>
                  ))}
                </div>
              )}
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
        </div>
      </header>

      {/* Error Alert */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-blue-600" />
                AI 生成內容
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs value={currentView} onValueChange={setView} className="w-full">
                <TabsList className="grid w-full grid-cols-4 rounded-none border-b">
                  <TabsTrigger value="note" className="text-sm">
                    <FileText className="h-4 w-4 mr-1" />
                    筆記
                  </TabsTrigger>
                  <TabsTrigger value="mindmap" className="text-sm">
                    <Brain className="h-4 w-4 mr-1" />
                    思維導圖
                  </TabsTrigger>
                  <TabsTrigger value="flashcards" className="text-sm">
                    <Sparkles className="h-4 w-4 mr-1" />
                    閃卡
                  </TabsTrigger>
                  <TabsTrigger value="quiz" className="text-sm">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    測驗
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="note" className="p-0 m-0">
                  <div className="bg-white">
                    <div className="p-4 border-b">
                      <h3 className="font-medium text-lg flex items-center gap-2">
                        <FileText className="h-5 w-5 text-slate-700" />
                        筆記內容
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        您可以在這裡預覽筆記內容
                      </p>
                    </div>
                    <div className="p-0">
                      <div className="min-h-[700px]">
                        <SimpleBlockNoteUnified 
                          initialMarkdown={markdown}
                          editable={false}
                          className="h-full"
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="mindmap" className="p-0 m-0">
                  <div className="bg-white h-[calc(100vh-200px)] flex flex-col">
                    <div className="p-4 border-b flex-shrink-0">
                      <h3 className="font-medium text-lg flex items-center gap-2">
                        <Brain className="h-5 w-5 text-purple-600" />
                        智能思維導圖
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        基於您的筆記內容自動生成的可交互思維導圖
                      </p>
                    </div>
                    <div className="flex-1 p-0">
                      <MarkmapViewer 
                        markdown={markdown} 
                        className="w-full h-full"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="flashcards" className="p-0 m-0">
                  <div className="bg-white h-[calc(100vh-300px)] flex flex-col">
                    <div className="p-4 border-b flex-shrink-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-lg flex items-center gap-2">
                            <Zap className="h-5 w-5 text-yellow-600" />
                            閃卡生成
                            {hasFlashcardsArtifact && (
                              <Badge variant="default" className="bg-green-100 text-green-700">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                已保存
                              </Badge>
                            )}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            從筆記內容智能生成記憶卡片，支持編輯和自定義
                          </p>
                        </div>
                        <div className="flex gap-2 items-center">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <span>數量</span>
                            <select
                              className="h-8 border rounded px-2 text-sm"
                              value={flashcardCount}
                              onChange={(e) => setFlashcardCount(Number(e.target.value))}
                            >
                              {[5,10,15,20,25,30,35,40].map(n => (
                                <option key={n} value={n}>{n}</option>
                              ))}
                            </select>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <span>難度</span>
                            <select
                              className="h-8 border rounded px-2 text-sm"
                              value={flashcardDifficulty}
                              onChange={(e) => setFlashcardDifficulty(e.target.value)}
                            >
                              <option value="easy">簡單</option>
                              <option value="medium">中等</option>
                              <option value="hard">困難</option>
                            </select>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <span>類型</span>
                            <div className="flex gap-2">
                              {[
                                { key: "definition", label: "定義" },
                                { key: "example", label: "例子" },
                                { key: "application", label: "應用" },
                                { key: "comparison", label: "比較" }
                              ].map(t => (
                                <label key={t.key} className="flex items-center gap-1">
                                  <input
                                    type="checkbox"
                                    className="h-3 w-3"
                                    checked={flashcardTypes.includes(t.key)}
                                    onChange={(e) => {
                                      const checked = e.target.checked
                                      setFlashcardTypes(prev => checked ? Array.from(new Set([...prev, t.key])) : prev.filter(x => x !== t.key))
                                    }}
                                  />
                                  <span>{t.label}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={handleGenerateFlashcards}
                            disabled={generatingCards}
                          >
                            {generatingCards ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                            {generatingCards ? '生成中...' : '生成'}
                          </Button>
                          {flashcards && (
                            <>
                              <Button variant="outline" size="sm" onClick={() => setIsAddingNewCard(true)}>
                                <Plus className="h-4 w-4 mr-1" />
                                新增
                              </Button>
                              <Button 
                                size="sm"
                                onClick={handleSaveFlashcards}
                                disabled={savingCards || hasFlashcardsArtifact}
                              >
                                {savingCards ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                {savingCards ? '保存中...' : hasFlashcardsArtifact ? '已保存' : '保存'}
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-6">
                      {!flashcards ? (
                        <div className="text-center h-full flex flex-col justify-center">
                          <FileText className="h-16 w-16 mx-auto mb-4 text-slate-400" />
                          <p className="text-slate-500 mb-4 text-lg">
                            {generatingCards ? '正在從筆記內容生成閃卡...' : '點擊「生成」創建學習閃卡'}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {flashcards.map((card, index) => (
                            <Card key={index} className="relative group hover:shadow-md transition-shadow">
                              <CardContent className="p-4">
                                {editingCardId === `${index}` ? (
                                  // 編輯模式
                                  <div className="space-y-4">
                                    <div>
                                      <label className="text-sm font-medium text-gray-700 mb-2 block">問題 (正面)</label>
                                      <Textarea
                                        value={editingCard?.front || ''}
                                        onChange={(e) => updateEditingCard('front', e.target.value)}
                                        placeholder="輸入問題..."
                                        className="min-h-[60px]"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-700 mb-2 block">答案 (背面)</label>
                                      <Textarea
                                        value={editingCard?.back || ''}
                                        onChange={(e) => updateEditingCard('back', e.target.value)}
                                        placeholder="輸入答案..."
                                        className="min-h-[60px]"
                                      />
                                    </div>
                                    <div className="flex gap-2">
                                      <Button size="sm" onClick={handleSaveCardEdit}>
                                        <CheckCircle className="h-4 w-4 mr-1" />
                                        保存
                                      </Button>
                                      <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                                        <X className="h-4 w-4 mr-1" />
                                        取消
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  // 顯示模式
                                  <>
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                      <Button 
                                        size="sm" 
                                        variant="ghost" 
                                        onClick={() => handleEditCard(card, index)}
                                        className="h-8 w-8 p-0"
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button 
                                        size="sm" 
                                        variant="ghost" 
                                        onClick={() => handleDeleteCard(index)}
                                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                    
                                    <div className="space-y-3 pr-16">
                                      <div>
                                        <div className="text-sm font-medium text-gray-600 mb-1">問題</div>
                                        <div className="text-slate-900 font-medium">{card.front}</div>
                                      </div>
                                      
                                      <div>
                                        <div className="text-sm font-medium text-gray-600 mb-1">答案</div>
                                        <div className="text-slate-700">{card.back}</div>
                                      </div>
                                      
                                      {card.tags && card.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                          {card.tags.map((tag: string, i: number) => (
                                            <Badge key={i} variant="outline" className="text-xs">
                                              {tag}
                                            </Badge>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                          
                          {/* 新增閃卡表單 */}
                          {isAddingNewCard && (
                            <Card className="border-dashed border-2 border-blue-300">
                              <CardContent className="p-4">
                                <div className="space-y-4">
                                  <div>
                                    <label className="text-sm font-medium text-gray-700 mb-2 block">問題 (正面)</label>
                                    <Textarea
                                      value={newCard.front}
                                      onChange={(e) => setNewCard({ ...newCard, front: e.target.value })}
                                      placeholder="輸入問題..."
                                      className="min-h-[60px]"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-700 mb-2 block">答案 (背面)</label>
                                    <Textarea
                                      value={newCard.back}
                                      onChange={(e) => setNewCard({ ...newCard, back: e.target.value })}
                                      placeholder="輸入答案..."
                                      className="min-h-[60px]"
                                    />
                                  </div>
                                  <div className="flex gap-2">
                                    <Button size="sm" onClick={handleAddNewCard}>
                                      <Plus className="h-4 w-4 mr-1" />
                                      新增
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => setIsAddingNewCard(false)}>
                                      <X className="h-4 w-4 mr-1" />
                                      取消
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="quiz" className="p-0 m-0">
                  <div className="bg-white">
                    <div className="p-4 border-b">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-lg flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-green-600" />
                            測驗生成
                            {hasQuizArtifact && (
                              <Badge variant="default" className="bg-green-100 text-green-700">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                已保存
                              </Badge>
                            )}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            從筆記內容智能生成練習測驗
                          </p>
                        </div>
                        <div className="flex gap-2 items-center">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <span>題數</span>
                            <select
                              className="h-8 border rounded px-2 text-sm"
                              value={quizCount}
                              onChange={(e) => setQuizCount(Number(e.target.value))}
                            >
                              {[5,10,15,20].map(n => (
                                <option key={n} value={n}>{n}</option>
                              ))}
                            </select>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                className="h-3 w-3"
                                checked={showQuizExplanations}
                                onChange={(e) => setShowQuizExplanations(e.target.checked)}
                              />
                              <span>顯示解析</span>
                            </label>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={handleGenerateQuiz}
                            disabled={generatingQuiz}
                          >
                            {generatingQuiz ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                            {generatingQuiz ? '生成中...' : '生成'}
                          </Button>
                          {quiz && (
                            <Button 
                              size="sm"
                              onClick={handleSaveQuiz}
                              disabled={savingQuiz || hasQuizArtifact}
                            >
                              {savingQuiz ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                              {savingQuiz ? '保存中...' : hasQuizArtifact ? '已保存' : '保存'}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="p-0 h-[calc(100vh-300px)]">
                      {!quiz ? (
                        <div className="text-center py-12 h-full flex flex-col justify-center">
                          <BookOpen className="h-16 w-16 mx-auto mb-4 text-slate-400" />
                          <p className="text-slate-500 mb-4 text-lg">
                            {generatingQuiz ? '正在從筆記內容生成測驗...' : '點擊「生成」創建練習測驗'}
                          </p>
                        </div>
                      ) : !quizStarted ? (
                        <div className="p-6 h-full flex flex-col justify-center text-center">
                          <BookOpen className="h-16 w-16 mx-auto mb-4 text-green-600" />
                          <h3 className="text-xl font-semibold mb-2">測驗已準備好</h3>
                          <p className="text-slate-600 mb-6">共 {quiz.questions?.length || 0} 題</p>
                          <div className="flex gap-4 justify-center">
                            <Button onClick={handleStartQuiz} className="bg-green-600 hover:bg-green-700">
                              <Play className="h-4 w-4 mr-2" />
                              開始測驗
                            </Button>
                          </div>
                        </div>
                      ) : showResults ? (
                        <div className="p-6 h-full overflow-y-auto">
                          <div className="text-center mb-6">
                            <h3 className="text-2xl font-bold mb-2">測驗完成！</h3>
                            <div className="text-4xl font-bold text-green-600 mb-2">{calculateScore()}%</div>
                            <p className="text-slate-600">您答對了 {quiz.questions?.length || 0} 題中的 {Math.round((calculateScore() / 100) * (quiz.questions?.length || 0))} 題</p>
                          </div>
                          
                          <div className="space-y-4">
                            {quiz.questions?.map((question: any, index: number) => {
                              const userAnswer = selectedAnswers[index]
                              
                              // Normalize the correct answer to letter format
                              let correctAnswer = question.answer
                              if (typeof correctAnswer === 'number') {
                                correctAnswer = String.fromCharCode(65 + correctAnswer)  // 0->A, 1->B, etc.
                              }
                              
                              const isCorrect = userAnswer === correctAnswer
                              
                              // Safe function to get choice text by letter
                              const getChoiceText = (letter: string) => {
                                if (!letter || !question.choices) return ''
                                const index = letter.charCodeAt(0) - 65  // A->0, B->1, etc.
                                return question.choices[index] || ''
                              }
                              
                              return (
                                <div key={index} className="border rounded-lg p-4">
                                  <div className="font-medium mb-3">
                                    {index + 1}. {question.stem}
                                  </div>
                                  
                                  <div className="mb-3">
                                    <div className="text-sm font-medium text-gray-700 mb-2">您的答案：</div>
                                    <div className={`p-2 rounded ${isCorrect ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                                      {userAnswer ? `${userAnswer}. ${getChoiceText(userAnswer)}` : "未作答"}
                                    </div>
                                  </div>
                                  
                                  {!isCorrect && (
                                    <div className="mb-3">
                                      <div className="text-sm font-medium text-gray-700 mb-2">正確答案：</div>
                                      <div className="p-2 rounded bg-green-50 text-green-800">
                                        {correctAnswer}. {getChoiceText(correctAnswer)}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {showQuizExplanations && question.explain && (
                                    <div className="text-sm p-3 bg-blue-50 rounded border-l-4 border-blue-200">
                                      <strong className="text-blue-800">解釋：</strong>{question.explain}
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                          
                          <div className="text-center mt-6">
                            <Button onClick={() => { setQuizStarted(false); setShowResults(false); }} variant="outline">
                              <RotateCcw className="h-4 w-4 mr-2" />
                              重新測驗
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="h-full flex flex-col">
                          {/* Quiz Progress */}
                          <div className="p-4 border-b bg-slate-50">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium">題目 {currentQuestionIndex + 1} / {quiz.questions?.length || 0}</span>
                              <span className="text-xs text-slate-500">
                                已答題：{Object.keys(selectedAnswers).length} / {quiz.questions?.length || 0}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                                style={{ width: `${((currentQuestionIndex + 1) / (quiz.questions?.length || 1)) * 100}%` }}
                              />
                            </div>
                          </div>
                          
                          {/* Current Question */}
                          <div className="flex-1 p-6 overflow-y-auto">
                            {quiz.questions?.[currentQuestionIndex] && (
                              <div>
                                <h3 className="text-lg font-medium mb-6">
                                  {quiz.questions[currentQuestionIndex].stem}
                                </h3>
                                
                                <div className="space-y-3">
                                  {quiz.questions[currentQuestionIndex].choices?.map((choice: string, i: number) => {
                                    const optionLetter = String.fromCharCode(65 + i)
                                    const isSelected = selectedAnswers[currentQuestionIndex] === optionLetter
                                    
                                    return (
                                      <div 
                                        key={i}
                                        onClick={() => handleSelectAnswer(currentQuestionIndex, optionLetter)}
                                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                                          isSelected 
                                            ? 'border-green-500 bg-green-50' 
                                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                        }`}
                                      >
                                        <div className="flex items-start gap-3">
                                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                                            isSelected 
                                              ? 'border-green-500 bg-green-500 text-white' 
                                              : 'border-gray-300'
                                          }`}>
                                            {optionLetter}
                                          </div>
                                          <div className="flex-1 text-sm">{choice}</div>
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {/* Navigation */}
                          <div className="p-4 border-t bg-white flex justify-between items-center">
                            <Button 
                              onClick={handlePrevQuestion}
                              disabled={currentQuestionIndex === 0}
                              variant="outline"
                            >
                              <ChevronLeft className="h-4 w-4 mr-2" />
                              上一題
                            </Button>
                            
                            <div className="flex gap-2">
                              {currentQuestionIndex === (quiz.questions?.length || 1) - 1 ? (
                                <Button 
                                  onClick={handleFinishQuiz}
                                  className="bg-green-600 hover:bg-green-700"
                                  disabled={Object.keys(selectedAnswers).length === 0}
                                >
                                  完成測驗
                                </Button>
                              ) : (
                                <Button 
                                  onClick={handleNextQuestion}
                                  disabled={currentQuestionIndex === (quiz.questions?.length || 1) - 1}
                                >
                                  下一題
                                  <ChevronRight className="h-4 w-4 ml-2" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}