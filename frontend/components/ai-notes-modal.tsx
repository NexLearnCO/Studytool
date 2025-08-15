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

  // Form state
  const [title, setTitle] = useState("")
  const [examSystem, setExamSystem] = useState("")
  const [subject, setSubject] = useState("")
  const [topic, setTopic] = useState("")
  const [detailLevel, setDetailLevel] = useState("medium")
  const [language, setLanguage] = useState("zh-tw")
  
  // Sources
  const [youtubeUrls, setYoutubeUrls] = useState([""])
  const [textInput, setTextInput] = useState("")
  const [webpageUrls, setWebpageUrls] = useState([""])
  const [files, setFiles] = useState<File[]>([])

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
    setGeneratedNotes("")
    setError("")
    setSuccess(false)
    setProgress(0)
  }

  const handleGenerate = async () => {
    setLoading(true)
    setError("")
    setProgress(0)

    try {
      // Build request data to match backend API
      const requestData = {
        title: title || "AI 生成筆記",
        examSystem: examSystem,
        subject: subject,
        topic: topic,
        detailLevel: detailLevel,
        language: language,
        sources: {
          youtube: youtubeUrls.filter(url => url.trim()),
          text: textInput.trim() ? [textInput.trim()] : [],
          webpages: webpageUrls.filter(url => url.trim()),
          files: [] // files will be handled separately if needed
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

      // Make API call to Flask backend
      const response = await fetch('http://localhost:5000/api/generate-notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        // Save to session storage for result page
        const resultData = {
          id: Date.now().toString(),
          title: requestData.title,
          notes: result.notes,
          config: requestData,
          timestamp: new Date().toISOString(),
          wordCount: result.wordCount || result.notes.length,
          processingTime: result.processingTime || 'N/A'
        }
        
        sessionStorage.setItem('aiNotesResult', JSON.stringify(resultData))
        
        // Close modal and redirect to result page
        setOpen(false)
        window.location.href = `/ai-notes/result/${resultData.id}`
      } else {
        throw new Error(result.error || '生成筆記失敗')
      }

    } catch (err) {
      console.error('生成筆記錯誤:', err)
      setError(err instanceof Error ? err.message : "生成筆記時發生錯誤，請稍後再試")
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

  const hasValidSources = () => {
    return youtubeUrls.some(url => url.trim()) || 
           textInput.trim() || 
           webpageUrls.some(url => url.trim()) || 
           files.length > 0
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

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column - Configuration */}
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
              </div>
            </div>

            {/* Sources */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">學習資源</h3>
              
              <Tabs defaultValue="file" className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="file" className="text-xs">
                    <Upload className="h-4 w-4 mr-1" />
                    檔案
                  </TabsTrigger>
                  <TabsTrigger value="youtube" className="text-xs">
                    <Youtube className="h-4 w-4 mr-1" />
                    YouTube
                  </TabsTrigger>
                  <TabsTrigger value="webpage" className="text-xs">
                    <Globe className="h-4 w-4 mr-1" />
                    網頁
                  </TabsTrigger>
                  <TabsTrigger value="text" className="text-xs">
                    <FileText className="h-4 w-4 mr-1" />
                    文字
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="youtube" className="space-y-3">
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
                </TabsContent>

                <TabsContent value="text">
                  <Textarea
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="貼上或輸入您的文字內容..."
                    rows={6}
                  />
                </TabsContent>

                <TabsContent value="webpage" className="space-y-3">
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
                </TabsContent>

                <TabsContent value="file">
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 mx-auto text-slate-400 mb-2" />
                    <p className="text-sm text-slate-600 mb-2">拖放檔案或點擊上傳</p>
                    <Button variant="outline" size="sm">選擇檔案</Button>
                    <p className="text-xs text-slate-500 mt-2">支援 PDF、DOC、TXT 格式</p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Generate Button */}
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

          {/* Right Column - Multi-View Output */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">流程說明</h3>
              {generatedNotes && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={copyNotes}>
                    <Copy className="h-4 w-4 mr-1" />
                    複製
                  </Button>
                  <Button variant="outline" size="sm" onClick={downloadNotes}>
                    <Download className="h-4 w-4 mr-1" />
                    下載
                  </Button>
                </div>
              )}
            </div>
            
            <div className="border rounded-lg h-96">
              {generatedNotes ? (
                <Tabs defaultValue="notes" className="h-full">
                  <TabsList className="grid w-full grid-cols-4 rounded-t-lg rounded-b-none">
                    <TabsTrigger value="notes" className="text-xs">
                      <FileText className="h-4 w-4 mr-1" />
                      筆記
                    </TabsTrigger>
                    <TabsTrigger value="mindmap" className="text-xs">
                      <Brain className="h-4 w-4 mr-1" />
                      思維導圖
                    </TabsTrigger>
                    <TabsTrigger value="flashcards" className="text-xs">
                      <Sparkles className="h-4 w-4 mr-1" />
                      記憶卡片
                    </TabsTrigger>
                    <TabsTrigger value="quiz" className="text-xs">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      測驗
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="notes" className="h-80 overflow-y-auto p-4 m-0">
                    <div className="prose prose-slate max-w-none">
                      <div 
                        className="whitespace-pre-wrap font-sans text-sm leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: generatedNotes.replace(/\n/g, '<br/>') }}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="mindmap" className="h-80 p-4 m-0">
                    <div className="h-full bg-slate-50 rounded flex items-center justify-center">
                      <div className="text-center text-slate-500">
                        <Brain className="h-12 w-12 mx-auto mb-3" />
                        <p className="font-medium">思維導圖功能</p>
                        <p className="text-sm mt-1 mb-3">基於生成的筆記創建可視化思維導圖</p>
                        <Button variant="outline" size="sm">
                          <Brain className="h-4 w-4 mr-1" />
                          生成思維導圖
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="flashcards" className="h-80 p-4 m-0">
                    <div className="h-full bg-slate-50 rounded flex items-center justify-center">
                      <div className="text-center text-slate-500">
                        <Sparkles className="h-12 w-12 mx-auto mb-3" />
                        <p className="font-medium">記憶卡片生成</p>
                        <p className="text-sm mt-1 mb-3">從筆記內容提取關鍵概念生成記憶卡片</p>
                        <Button variant="outline" size="sm">
                          <Sparkles className="h-4 w-4 mr-1" />
                          生成記憶卡片
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="quiz" className="h-80 p-4 m-0">
                    <div className="h-full bg-slate-50 rounded flex items-center justify-center">
                      <div className="text-center text-slate-500">
                        <CheckCircle className="h-12 w-12 mx-auto mb-3" />
                        <p className="font-medium">智能測驗生成</p>
                        <p className="text-sm mt-1 mb-3">基於筆記內容自動生成測驗題目</p>
                        <Button variant="outline" size="sm">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          生成測驗
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400">
                  <div className="text-center">
                    <FileText className="h-12 w-12 mx-auto mb-3" />
                    <p>學習內容將在生成後顯示</p>
                    <p className="text-sm mt-1">請先配置參數並提供學習資源</p>
                    <div className="flex gap-2 mt-4 justify-center">
                      <Badge variant="outline">📝 筆記</Badge>
                      <Badge variant="outline">🧠 思維導圖</Badge>
                      <Badge variant="outline">🃏 記憶卡片</Badge>
                      <Badge variant="outline">❓ 測驗</Badge>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
