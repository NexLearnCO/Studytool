"use client"

import { useState } from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
  Eye,
} from "lucide-react"

export default function AINotesPage() {
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
  const [mode, setMode] = useState("hybrid") // hybrid | blueprint | outline
  const [expansion, setExpansion] = useState(0) // 0..3
  
  // Sources
  const [youtubeUrls, setYoutubeUrls] = useState([""])
  const [textInput, setTextInput] = useState("")
  const [webpageUrls, setWebpageUrls] = useState([""])
  const [files, setFiles] = useState<File[]>([])

  const removeFileAt = (idx: number) => {
    setFiles(prev => prev.filter((_, i) => i !== idx))
  }

  const readFilesAsDataUrls = (fileList: File[]): Promise<Array<{ name: string; size: number; type: string; data: string }>> => {
    return Promise.all(fileList.map(file => new Promise<{ name: string; size: number; type: string; data: string }>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve({ name: file.name, size: file.size, type: file.type || "application/octet-stream", data: String(reader.result) })
      reader.onerror = reject
      reader.readAsDataURL(file)
    })))
  }

  const handleGenerate = async () => {
    setLoading(true)
    setError("")
    setProgress(0)
    try {
      setProgress(10)
      const filePayload = await readFilesAsDataUrls(files)
      setProgress(20)

      const payload = {
        title: title || "AI 筆記",
        examSystem: examSystem,
        subject: subject,
        topic: topic,
        detailLevel: detailLevel,
        language: language,
        mode: mode,
        expansion: expansion,
        sources: {
          youtube: youtubeUrls.filter(u => u && u.trim()),
          text: textInput.trim() ? [textInput] : [],
          webpages: webpageUrls.filter(u => u && u.trim()),
          files: filePayload
        }
      }

      setProgress(40)
      const res = await fetch("http://localhost:5000/api/unified-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
      setProgress(70)
      if (!res.ok) {
        const txt = await res.text().catch(() => "")
        throw new Error(txt || `HTTP ${res.status}`)
      }
      const data = await res.json()
      setProgress(90)
      const md = data?.notes || ""
      if (!md) throw new Error("後端未返回筆記內容")
      setGeneratedNotes(md)
      setSuccess(true)
      setProgress(100)
    } catch (err: any) {
      setError(err?.message || "生成筆記時發生錯誤，請稍後再試")
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

  const removeYoutubeUrl = (index: number) => {
    setYoutubeUrls(urls => urls.filter((_, i) => i !== index))
  }

  const addWebpageUrl = () => {
    setWebpageUrls([...webpageUrls, ""])
  }

  const updateWebpageUrl = (index: number, value: string) => {
    const newUrls = [...webpageUrls]
    newUrls[index] = value
    setWebpageUrls(newUrls)
  }

  const removeWebpageUrl = (index: number) => {
    setWebpageUrls(urls => urls.filter((_, i) => i !== index))
  }

  const hasValidSources = () => {
    return youtubeUrls.some(url => url.trim()) || 
           textInput.trim() || 
           webpageUrls.some(url => url.trim()) || 
           files.length > 0
  }

  return (
    <div className="flex flex-col">
      {/* Header */}
      <header className="flex h-16 items-center gap-4 border-b border-slate-200 bg-white px-6">
        <SidebarTrigger />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-blue-600" />
            <h1 className="text-xl font-semibold text-slate-900">AI 筆記生成器</h1>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              <Sparkles className="h-3 w-3 mr-1" />
              AI 驅動
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-6 space-y-6">
        {/* Success Message */}
        {success && !loading && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              筆記生成完成！您可以預覽、編輯或下載生成的內容。
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

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Configuration */}
          <div className="lg:col-span-1 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">基本資訊</CardTitle>
                <CardDescription>設置筆記的基本參數</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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

                <div className="space-y-2">
                  <Label htmlFor="language">語言</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="zh-tw">繁體中文</SelectItem>
                      <SelectItem value="zh-cn">簡體中文</SelectItem>
                      <SelectItem value="en">English</SelectItem>
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
              </CardContent>
            </Card>

            {/* Sources */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">學習資源</CardTitle>
                <CardDescription>提供要轉換為筆記的資源</CardDescription>
              </CardHeader>
              <CardContent>
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
                      <div key={index} className="flex gap-2">
                        <Input
                          value={url}
                          onChange={(e) => updateYoutubeUrl(index, e.target.value)}
                          placeholder="https://www.youtube.com/watch?v=..."
                        />
                        <Button variant="outline" size="sm" onClick={() => removeYoutubeUrl(index)}>刪除</Button>
                      </div>
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
                      <div key={index} className="flex gap-2">
                        <Input
                          value={url}
                          onChange={(e) => updateWebpageUrl(index, e.target.value)}
                          placeholder="https://example.com/article"
                        />
                        <Button variant="outline" size="sm" onClick={() => removeWebpageUrl(index)}>刪除</Button>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={addWebpageUrl}>
                      新增網頁連結
                    </Button>
                  </TabsContent>

                  <TabsContent value="file">
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 mx-auto text-slate-400 mb-2" />
                      <p className="text-sm text-slate-600 mb-2">拖放檔案或點擊上傳</p>
                      <input
                        type="file"
                        multiple
                        className="hidden"
                        id="ai-notes-file-input"
                        onChange={(e) => {
                          const list = e.target.files ? Array.from(e.target.files) : []
                          setFiles(prev => [...prev, ...list])
                        }}
                      />
                      <Button variant="outline" size="sm" onClick={() => document.getElementById("ai-notes-file-input")?.click()}>選擇檔案</Button>
                      <p className="text-xs text-slate-500 mt-2">支援 PDF、DOC、TXT 格式</p>
                    </div>
                    {files.length > 0 && (
                      <div className="mt-4 text-left space-y-2">
                        {files.map((f, i) => (
                          <div key={i} className="flex items-center justify-between border rounded p-2 text-sm">
                            <span className="truncate mr-2">{f.name} <span className="text-slate-400">({Math.round(f.size/1024)} KB)</span></span>
                            <Button variant="outline" size="sm" onClick={() => removeFileAt(i)}>移除</Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

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
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">筆記預覽</CardTitle>
                    <CardDescription>
                      {generatedNotes ? "AI 生成的筆記內容" : "生成的筆記將在這裡顯示"}
                    </CardDescription>
                  </div>
                  {generatedNotes && (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Copy className="h-4 w-4 mr-1" />
                        複製
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        下載
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        全螢幕
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {generatedNotes ? (
                  <div className="prose prose-slate max-w-none">
                    <pre className="whitespace-pre-wrap font-sans text-sm">
                      {generatedNotes}
                    </pre>
                  </div>
                ) : (
                  <div className="h-96 flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-lg">
                    <div className="text-center">
                      <FileText className="h-12 w-12 mx-auto mb-3" />
                      <p>筆記內容將在生成後顯示</p>
                      <p className="text-sm mt-1">請先配置參數並提供學習資源</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
