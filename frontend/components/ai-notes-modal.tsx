"use client"

import { useState } from "react"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Brain,
  FileText,
  Globe,
  Upload,
  Youtube,
  Loader2,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Download,
  Copy,
  Zap,
  X,
  Plus,
} from "lucide-react"

interface AINotesModalProps {
  children?: React.ReactNode
}

export function AINotesModal({ children }: AINotesModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [generatedNotes, setGeneratedNotes] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [step, setStep] = useState<number>(1)
  const [payloadMode, setPayloadMode] = useState<'legacy' | 'tunnel'>('legacy')

  // Form state
  const [title, setTitle] = useState("")
  const [examSystem, setExamSystem] = useState("")
  const [subject, setSubject] = useState("")
  const [topic, setTopic] = useState("")
  const [detailLevel, setDetailLevel] = useState("medium")
  const [language, setLanguage] = useState("zh-tw")
  const [mode, setMode] = useState("hybrid")
  const [expansion, setExpansion] = useState(0)
  
  // Sources
  const [youtubeUrls, setYoutubeUrls] = useState([""])
  const [textInput, setTextInput] = useState("")
  const [webpageUrls, setWebpageUrls] = useState([""])
  const [files, setFiles] = useState<File[]>([])
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [activeSourceTab, setActiveSourceTab] = useState<string | null>(null)

  // Tracking
  const { track } = require("@/src/lib/track")

  const resetForm = () => {
    setTitle("")
    setExamSystem("")
    setSubject("")
    setTopic("")
    setDetailLevel("medium")
    setLanguage("zh-tw")
    setYoutubeUrls([""])
    setTextInput("")
    setWebpageUrls([""])
    setFiles([])
    setSelectedFiles([])
    setActiveSourceTab(null)
    setGeneratedNotes("")
    setError("")
    setSuccess(false)
    setProgress(0)
    setStep(1)
    setPayloadMode('legacy')
  }

  const handleGenerate = async () => {
    setLoading(true)
    setError("")
    setProgress(0)

    // Basic validations
    const MAX_FILES = 8
    const MAX_FILE_MB = 12
    if (selectedFiles.length > MAX_FILES) {
      setError(`一次最多上傳 ${MAX_FILES} 個檔案`)
      setLoading(false)
      return
    }
    for (const f of selectedFiles) {
      if (f.size > MAX_FILE_MB * 1024 * 1024) {
        setError(`檔案 ${f.name} 超過 ${MAX_FILE_MB}MB 限制`)
        setLoading(false)
        return
      }
    }

    track('NOTES_GENERATION_STARTED', {
      sources: {
        youtube: youtubeUrls.filter(u => u.trim()).length,
        text: textInput.trim() ? 1 : 0,
        webpages: webpageUrls.filter(u => u.trim()).length,
        files: selectedFiles.length
      },
      mode, detailLevel, expansion, language
    })

    try {
      // Convert files to base64 for transmission
      const filePromises = selectedFiles.map(async (file) => {
        return new Promise((resolve) => {
          const reader = new FileReader()
          reader.onload = () => {
            resolve({
              name: file.name,
              size: file.size,
              type: file.type,
              data: reader.result
            })
          }
          reader.readAsDataURL(file)
        })
      })

      const processedFiles = await Promise.all(filePromises)

      // Validate required fields in Tunnel mode
      if (payloadMode === 'tunnel') {
        if (!examSystem || !subject || !detailLevel || !language || !mode) {
          setError('請填寫必填欄位（考試制度、科目、詳細程度、語言、模式）')
          setLoading(false)
          return
        }
      }

      // Build request data
      const detailLevelStd = detailLevel === 'medium' ? 'normal' : (detailLevel === 'detailed' ? 'deep' : 'brief')
      let requestData: any
      if (payloadMode === 'tunnel') {
        requestData = {
          title: title || 'AI 生成筆記',
          exam_system: examSystem,
          subject: subject,
          detail_level: detailLevelStd,
          expand_level: expansion,
          language: language,
          mode: mode,
          // For now keep legacy-style sources object to support file uploads until ingest doc_id is ready
          sources: {
            youtube: youtubeUrls.filter(url => url.trim()),
            text: textInput.trim() ? [textInput.trim()] : [],
            webpages: webpageUrls.filter(url => url.trim()),
            files: processedFiles
          },
          options: {
            generate_flashcards: false,
            generate_quiz: false
          }
        }
      } else {
        // Legacy payload
        requestData = {
          title: title || 'AI 生成筆記',
          examSystem: examSystem,
          subject: subject,
          topic: topic,
          detailLevel: detailLevel,
          language: language,
          mode: mode,
          expansion: expansion,
          sources: {
            youtube: youtubeUrls.filter(url => url.trim()),
            text: textInput.trim() ? [textInput.trim()] : [],
            webpages: webpageUrls.filter(url => url.trim()),
            files: processedFiles
          }
        }
      }

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 300)

      // Make API call to Flask backend using unified apiFetch
      const { apiFetch } = await import("@/src/lib/api/client")
      const result = await apiFetch('/api/generate-notes', {
        method: 'POST',
        body: JSON.stringify(requestData)
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (result.success) {
        // Import createNote function for cleaner API usage
        const { createNote } = await import("@/src/lib/api/notes")
        
        // Create draft note directly in backend (no localStorage!)
        const createResult = await createNote({
          title: requestData.title || "AI 生成筆記",
          status: "draft",
          content_md: result.notes,
          content: result.notes, // Legacy fallback
          language: requestData.language,
          exam_system: requestData.exam_system || requestData.examSystem,
          subject: requestData.subject,
          topic: requestData.topic,
          tags: [] // Could be enhanced with AI-extracted tags
        })
        
        if (!createResult.ok) {
          throw new Error("創建草稿筆記失敗")
        }
        
        const newNoteId = createResult.data.id
        track('NOTE_CREATED', { note_id: newNoteId, language, subject, exam_system: examSystem, payload_mode: payloadMode })
        
        // Close modal and redirect to AI result page (preserve the result flow!)
        setOpen(false)
        window.location.href = `/ai-notes/result/${newNoteId}`
      } else {
        throw new Error(result.error || '生成筆記失敗')
      }

    } catch (err) {
      console.error('生成筆記錯誤:', err)
      setError(err instanceof Error ? err.message : "生成筆記時發生錯誤，請稍後再試")
      track('NOTES_GENERATION_FAILED', { message: err instanceof Error ? err.message : String(err) })
    } finally {
      setLoading(false)
    }
  }

  const addYoutubeUrl = () => {
    setYoutubeUrls([...youtubeUrls, ""])
  }

  const removeYoutubeUrl = (index: number) => {
    if (youtubeUrls.length > 1) {
      setYoutubeUrls(youtubeUrls.filter((_, i) => i !== index))
    }
  }

  const updateYoutubeUrl = (index: number, value: string) => {
    const newUrls = [...youtubeUrls]
    newUrls[index] = value
    setYoutubeUrls(newUrls)
  }

  const addWebpageUrl = () => {
    setWebpageUrls([...webpageUrls, ""])
  }

  const updateWebpageUrl = (index: number, value: string) => {
    const newUrls = [...webpageUrls]
    newUrls[index] = value
    setWebpageUrls(newUrls)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      const newFiles = Array.from(files)
      setSelectedFiles(prev => [...prev, ...newFiles])
    }
  }

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const hasValidSources = () => {
    return youtubeUrls.some(url => url.trim()) || 
           textInput.trim() || 
           webpageUrls.some(url => url.trim()) || 
           selectedFiles.length > 0
  }

  const copyNotes = () => {
    navigator.clipboard.writeText(generatedNotes)
  }

  const downloadNotes = () => {
    const blob = new Blob([generatedNotes], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title || 'AI筆記'}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      setOpen(newOpen)
      if (!newOpen) {
        // Reset form when closing
        setTimeout(resetForm, 200)
      }
    }}>
      <DialogTrigger asChild>
        {children || (
          <Button className="w-full justify-start">
            <Zap className="mr-2 h-4 w-4" />
            AI 筆記生成器
            <Badge variant="secondary" className="ml-auto">
              <Sparkles className="h-3 w-3 mr-1" />
              NEW
            </Badge>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-7xl w-[95vw] h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-blue-600" />
            AI 筆記生成器
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              <Sparkles className="h-3 w-3 mr-1" />
              AI 驅動
            </Badge>
          </DialogTitle>
          <DialogDescription>
            使用 AI 將 YouTube 影片、PDF 文件或文本內容轉換為結構化學習筆記
          </DialogDescription>
        </DialogHeader>

        {/* Success Message */}
        {success && !loading && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              筆記生成完成！您可以預覽、複製或下載生成的內容。
            </AlertDescription>
          </Alert>
        )}

        {/* Error Message */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          {/* Payload mode toggle */}
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-slate-600">提交模式：</div>
            <div className="flex items-center gap-2">
              <Button variant={payloadMode==='legacy' ? 'default' : 'outline'} size="sm" onClick={()=>setPayloadMode('legacy')} disabled={loading}>Legacy</Button>
              <Button variant={payloadMode==='tunnel' ? 'default' : 'outline'} size="sm" onClick={()=>setPayloadMode('tunnel')} disabled={loading}>Tunnel</Button>
            </div>
          </div>

          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">基本資訊</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">筆記標題</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="例：機器學習基礎概念"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="exam-system">考試制度</Label>
                  <Select value={examSystem} onValueChange={setExamSystem}>
                    <SelectTrigger>
                      <SelectValue placeholder="選擇考試制度" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HKDSE">🇭🇰 HKDSE</SelectItem>
                      <SelectItem value="IGCSE">🌍 IGCSE/GCSE</SelectItem>
                      <SelectItem value="IAS">📚 IAS/AS</SelectItem>
                      <SelectItem value="IAL">📜 IAL/AL</SelectItem>
                      <SelectItem value="IB">🌍 IB</SelectItem>
                      <SelectItem value="AP">🇺🇸 AP</SelectItem>
                      <SelectItem value="SAT">🇺🇸 SAT</SelectItem>
                      <SelectItem value="IELTS">✈️ IELTS</SelectItem>
                      <SelectItem value="UCAT">🩺 UCAT</SelectItem>
                      <SelectItem value="UCATANZ">🏥 UCATANZ</SelectItem>
                      <SelectItem value="BMAT">⚕️ BMAT</SelectItem>
                      <SelectItem value="other">📋 其他</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">科目</Label>
                  <Select value={subject} onValueChange={setSubject}>
                    <SelectTrigger>
                      <SelectValue placeholder="選擇科目" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="math">數學</SelectItem>
                      <SelectItem value="physics">物理</SelectItem>
                      <SelectItem value="chemistry">化學</SelectItem>
                      <SelectItem value="biology">生物</SelectItem>
                      <SelectItem value="history">歷史</SelectItem>
                      <SelectItem value="geography">地理</SelectItem>
                      <SelectItem value="english">英文</SelectItem>
                      <SelectItem value="chinese">中文</SelectItem>
                      <SelectItem value="cs">資訊科學</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="detail-level">詳細程度</Label>
                  <Select value={detailLevel} onValueChange={setDetailLevel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="brief">簡要</SelectItem>
                      <SelectItem value="medium">中等</SelectItem>
                      <SelectItem value="detailed">詳細</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">語言</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="zh-tw">🇹🇼 繁體中文</SelectItem>
                      <SelectItem value="zh-cn">🇨🇳 简体中文</SelectItem>
                      <SelectItem value="en">🇺🇸 English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mode">生成模式</Label>
                  <Select value={mode} onValueChange={setMode}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hybrid">Hybrid（預設）</SelectItem>
                      <SelectItem value="blueprint">Blueprint-only</SelectItem>
                      <SelectItem value="outline">Outline-only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expansion">擴充程度</Label>
                  <Select value={String(expansion)} onValueChange={(v) => setExpansion(parseInt(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0 - 僅整理（不新增）</SelectItem>
                      <SelectItem value="1">1 - 可補缺漏（需來源）</SelectItem>
                      <SelectItem value="2">2 - 背景補充（標記補充）</SelectItem>
                      <SelectItem value="3">3 - 限課綱內擴展</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            {/* File Upload - Primary Feature */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Upload className="h-5 w-5" />
                上傳學習資料
              </h3>
              
              <div className="border-2 border-dashed border-blue-300 bg-blue-50/50 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                    <Upload className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-blue-900 mb-2">
                      點擊瀏覽或拖放檔案到此處
                    </h4>
                    <p className="text-sm text-blue-700 mb-4">
                      支援文件格式：PDF、DOCX、PPTX、TXT、MD、MP3、M4A、WAV 或圖片
                    </p>
                  </div>
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept=".pdf,.docx,.pptx,.txt,.md,.mp3,.m4a,.wav,.jpg,.jpeg,.png"
                    multiple
                    onChange={handleFileUpload}
                  />
                  <Button 
                    onClick={() => document.getElementById('file-upload')?.click()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
                  >
                    選擇檔案
                  </Button>
                </div>
              </div>
              
              {/* Selected Files Display */}
              {selectedFiles.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-slate-700">已選擇的檔案：</h4>
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-slate-50 p-2 rounded">
                      <span className="text-sm text-slate-600">{file.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Other Sources */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">其他資源</h3>
              <p className="text-sm text-slate-600">或者從其他來源添加學習資料</p>
              
              <div className="grid grid-cols-3 gap-3">
                <Button 
                  variant="outline" 
                  className="h-24 flex-col gap-2"
                  onClick={() => setActiveSourceTab('youtube')}
                >
                  <Youtube className="h-6 w-6 text-red-600" />
                  <span className="text-sm">YouTube</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-24 flex-col gap-2"
                  onClick={() => setActiveSourceTab('webpage')}
                >
                  <Globe className="h-6 w-6 text-blue-600" />
                  <span className="text-sm">網頁</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-24 flex-col gap-2"
                  onClick={() => setActiveSourceTab('text')}
                >
                  <FileText className="h-6 w-6 text-green-600" />
                  <span className="text-sm">文字</span>
                </Button>
              </div>
              
              {/* Dynamic Source Input */}
              {activeSourceTab && (
                <div className="mt-4 p-4 border rounded-lg bg-slate-50">
                  {activeSourceTab === 'youtube' && (
                    <div className="space-y-3">
                      <h4 className="font-medium flex items-center gap-2">
                        <Youtube className="h-4 w-4 text-red-600" />
                        YouTube 連結
                      </h4>
                      {youtubeUrls.map((url, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={url}
                            onChange={(e) => updateYoutubeUrl(index, e.target.value)}
                            placeholder="https://www.youtube.com/watch?v=..."
                            className="flex-1"
                          />
                          {youtubeUrls.length > 1 && (
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => removeYoutubeUrl(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={addYoutubeUrl}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        新增 YouTube 連結
                      </Button>
                    </div>
                  )}
                  
                  {activeSourceTab === 'webpage' && (
                    <div className="space-y-3">
                      <h4 className="font-medium flex items-center gap-2">
                        <Globe className="h-4 w-4 text-blue-600" />
                        網頁連結
                      </h4>
                      {webpageUrls.map((url, index) => (
                        <Input
                          key={index}
                          value={url}
                          onChange={(e) => updateWebpageUrl(index, e.target.value)}
                          placeholder="https://example.com/article"
                        />
                      ))}
                      <Button variant="outline" size="sm" onClick={addWebpageUrl}>
                        新增網頁連結
                      </Button>
                    </div>
                  )}
                  
                  {activeSourceTab === 'text' && (
                    <div className="space-y-3">
                      <h4 className="font-medium flex items-center gap-2">
                        <FileText className="h-4 w-4 text-green-600" />
                        文字內容
                      </h4>
                      <Textarea
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        placeholder="貼上或輸入您的文字內容..."
                        rows={6}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">送出</h3>
              <p className="text-sm text-slate-600">將依序進行：抽取 → 對齊 → 寫稿 → 組稿</p>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={loading || !hasValidSources()}
              className="w-full h-12 text-base"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  AI 正在分析內容...
                </>
              ) : (
                <>
                  <Brain className="mr-2 h-4 w-4" />
                  生成 AI 筆記
                </>
              )}
            </Button>

            {loading && (
              <div className="space-y-2">
                <Progress value={progress} />
                <p className="text-sm text-center text-slate-600">
                  進度: {progress}%
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
