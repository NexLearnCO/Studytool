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
        setGeneratedNotes(result.notes)
        setSuccess(true)
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
                      <SelectItem value="GSAT">學測</SelectItem>
                      <SelectItem value="AST">分科測驗</SelectItem>
                      <SelectItem value="TOEFL">TOEFL</SelectItem>
                      <SelectItem value="IELTS">IELTS</SelectItem>
                      <SelectItem value="JLPT">日檢</SelectItem>
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
                      <SelectItem value="chinese">國文</SelectItem>
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
              </div>
            </div>

            {/* Sources */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">學習資源</h3>
              
              <Tabs defaultValue="youtube" className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="youtube" className="text-xs">
                    <Youtube className="h-4 w-4 mr-1" />
                    YouTube
                  </TabsTrigger>
                  <TabsTrigger value="text" className="text-xs">
                    <FileText className="h-4 w-4 mr-1" />
                    文字
                  </TabsTrigger>
                  <TabsTrigger value="webpage" className="text-xs">
                    <Globe className="h-4 w-4 mr-1" />
                    網頁
                  </TabsTrigger>
                  <TabsTrigger value="file" className="text-xs">
                    <Upload className="h-4 w-4 mr-1" />
                    檔案
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="youtube" className="space-y-3">
                  {youtubeUrls.map((url, index) => (
                    <Input
                      key={index}
                      value={url}
                      onChange={(e) => updateYoutubeUrl(index, e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                  ))}
                  <Button variant="outline" size="sm" onClick={addYoutubeUrl}>
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

          {/* Right Column - Preview */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">筆記預覽</h3>
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
            
            <div className="border rounded-lg h-96 overflow-y-auto">
              {generatedNotes ? (
                <div className="p-4 prose prose-slate max-w-none">
                  <pre className="whitespace-pre-wrap font-sans text-sm">
                    {generatedNotes}
                  </pre>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400">
                  <div className="text-center">
                    <FileText className="h-12 w-12 mx-auto mb-3" />
                    <p>筆記內容將在生成後顯示</p>
                    <p className="text-sm mt-1">請先配置參數並提供學習資源</p>
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
