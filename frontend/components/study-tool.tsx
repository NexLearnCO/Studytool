"use client"

import { useState, useRef } from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Upload,
  FileText,
  Video,
  Globe,
  Brain,
  Sparkles,
  BookOpen,
  Target,
  BarChart3,
  Clock,
  CheckCircle,
  ArrowRight,
  Share,
  Download,
  Edit,
  ImportIcon as Translate,
  MessageSquare,
  X,
  Lightbulb,
  TrendingUp,
} from "lucide-react"

interface UploadedFile {
  id: string
  name: string
  type: string
  size: string
  status: "uploading" | "processing" | "completed" | "error"
  progress: number
}

interface GeneratedNote {
  id: string
  title: string
  subject: string
  course: string
  keyTopics: string[]
  difficulty: string
  estimatedReadTime: number
  content: {
    summary: string
    mainSections: Array<{
      title: string
      content: string
      keyPoints: string[]
    }>
  }
  aiInsights: {
    strengthAreas: string[]
    suggestedReview: string[]
    relatedTopics: string[]
    practiceQuestions: number
  }
  platformIntegration: {
    dashboardUpdate: boolean
    aiTutorContext: boolean
    practiceQuestionsGenerated: boolean
    flashcardsCreated: boolean
  }
}

export function StudyTool() {
  const [activeTab, setActiveTab] = useState<"upload" | "processing" | "notes">("upload")
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [noteTitle, setNoteTitle] = useState("")
  const [selectedCourse, setSelectedCourse] = useState("")
  const [outputLanguage, setOutputLanguage] = useState("zh-TW")
  const [detailLevel, setDetailLevel] = useState("detailed")
  const [webUrl, setWebUrl] = useState("")
  const [youtubeUrl, setYoutubeUrl] = useState("")
  const [pastedText, setPastedText] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [generatedNote] = useState<GeneratedNote>({
    id: "note_001",
    title: "右側大腦中動脈中風 - 翻身至未受影響側",
    subject: "物理治療",
    course: "PHTY3140",
    keyTopics: ["中風復健", "翻身技巧", "神經可塑性", "功能訓練"],
    difficulty: "進階",
    estimatedReadTime: 12,
    content: {
      summary:
        "68歲男性患者，右側大腦中動脈梗塞（1週前），目標是改善翻身至未受影響側（左→右）的能力。目前狀態需要上肢和下肢協助。",
      mainSections: [
        {
          title: "實際示範",
          content: "治療方法：3級介入",
          keyPoints: ["第1級：基於損傷的部分練習", "第2級：組件訓練的部分練習", "第3級：功能訓練的整體練習"],
        },
        {
          title: "神經解剖病理學與病理生理學",
          content: "主要運動皮質（M1）：左側無力，體感皮質：左側感覺減退，視輻射：偏盲，頂葉：感覺忽視",
          keyPoints: [
            "缺血性梗塞 → MCA區域細胞死亡",
            "皮質脊髓束受損 → 對側偏癱",
            "感覺通路受損 → 本體感覺和觸覺減退",
            "急性神經可塑性窗口（中風後1週）→ 介入的最佳時機",
          ],
        },
      ],
    },
    aiInsights: {
      strengthAreas: ["理論理解", "解剖知識"],
      suggestedReview: ["實際操作技巧", "患者評估方法"],
      relatedTopics: ["神經可塑性", "運動學習", "中風復健協議"],
      practiceQuestions: 8,
    },
    platformIntegration: {
      dashboardUpdate: true,
      aiTutorContext: true,
      practiceQuestionsGenerated: true,
      flashcardsCreated: true,
    },
  })

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return

    Array.from(files).forEach((file) => {
      const newFile: UploadedFile = {
        id: Date.now().toString() + Math.random(),
        name: file.name,
        type: file.type,
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        status: "uploading",
        progress: 0,
      }

      setUploadedFiles((prev) => [...prev, newFile])

      // 模擬上傳進度
      const interval = setInterval(() => {
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === newFile.id
              ? {
                  ...f,
                  progress: Math.min(f.progress + Math.random() * 30, 100),
                  status: f.progress >= 100 ? "processing" : "uploading",
                }
              : f,
          ),
        )
      }, 500)

      setTimeout(() => {
        clearInterval(interval)
        setUploadedFiles((prev) =>
          prev.map((f) => (f.id === newFile.id ? { ...f, status: "completed", progress: 100 } : f)),
        )
      }, 3000)
    })
  }

  const handleCreateNote = () => {
    setIsProcessing(true)
    setActiveTab("processing")

    // 模擬 AI 處理過程
    setTimeout(() => {
      setActiveTab("notes")
      setIsProcessing(false)

      // 平台數據整合 - 這些數據會被其他功能使用
      const integrationData = {
        noteId: generatedNote.id,
        userId: "user_123",
        subject: generatedNote.subject,
        course: generatedNote.course,
        topics: generatedNote.keyTopics,
        difficulty: generatedNote.difficulty,
        studyTime: generatedNote.estimatedReadTime,
        createdAt: new Date().toISOString(),
        // 這些數據會更新到：
        // 1. 儀表板 - 顯示學習進度和主題掌握度
        // 2. AI 導師 - 提供個人化建議和答疑上下文
        // 3. 練習工具 - 生成相關練習題
        // 4. 學習分析 - 追蹤學習模式和效果
      }

      console.log("平台數據整合:", integrationData)
    }, 4000)
  }

  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId))
  }

  const courses = [
    { value: "PHTY3140", label: "PHTY3140 - 神經物理治療" },
    { value: "CHEM2001", label: "CHEM2001 - 有機化學" },
    { value: "MATH2001", label: "MATH2001 - 微積分" },
    { value: "BIOL3001", label: "BIOL3001 - 分子生物學" },
  ]

  if (activeTab === "processing") {
    return (
      <div className="flex flex-col h-screen">
        <header className="flex h-16 items-center gap-4 border-b border-slate-200 bg-white px-6">
          <SidebarTrigger />
          <h1 className="text-xl font-semibold text-slate-900">AI 筆記生成中...</h1>
        </header>

        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="w-full max-w-2xl">
            <CardContent className="p-8 text-center space-y-6">
              <div className="h-16 w-16 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <Brain className="h-8 w-8 text-white animate-pulse" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">AI 正在分析你的內容</h2>
                <p className="text-slate-600">我們的 AI 正在將你的材料轉換成結構化筆記...</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>內容解析完成</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span>AI 結構化處理中...</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-400">
                  <div className="h-5 w-5 border-2 border-slate-300 rounded-full" />
                  <span>生成學習建議</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-400">
                  <div className="h-5 w-5 border-2 border-slate-300 rounded-full" />
                  <span>整合平台數據</span>
                </div>
              </div>

              <Progress value={65} className="h-2" />
              <p className="text-sm text-slate-500">預計還需要 30 秒...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (activeTab === "notes") {
    return (
      <div className="flex flex-col h-screen">
        <header className="flex h-16 items-center gap-4 border-b border-slate-200 bg-white px-6">
          <SidebarTrigger />
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-slate-900">{generatedNote.title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Share className="h-4 w-4 mr-2" />
              分享
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              匯出
            </Button>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              編輯
            </Button>
            <Button variant="outline" size="sm">
              <Translate className="h-4 w-4 mr-2" />
              翻譯
            </Button>
            <Button>
              <MessageSquare className="h-4 w-4 mr-2" />
              新對話
            </Button>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Note Header */}
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{generatedNote.course}</Badge>
                    <Badge variant="outline">{generatedNote.subject}</Badge>
                    <Badge variant="outline">{generatedNote.difficulty}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-600">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>預計閱讀 {generatedNote.estimatedReadTime} 分鐘</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      <span>{generatedNote.keyTopics.length} 個主要主題</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Topics */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    關鍵主題
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {generatedNote.keyTopics.map((topic, index) => (
                      <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Summary */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    案例摘要
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="leading-relaxed text-slate-700">{generatedNote.content.summary}</p>
                </CardContent>
              </Card>

              {/* Main Sections */}
              {generatedNote.content.mainSections.map((section, index) => (
                <Card key={index}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{section.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="leading-relaxed text-slate-700">{section.content}</p>
                    <div className="space-y-2">
                      <h4 className="font-medium text-slate-900">重點整理：</h4>
                      <ul className="space-y-2">
                        {section.keyPoints.map((point, pointIndex) => (
                          <li key={pointIndex} className="flex items-start gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
                            <span className="text-slate-700">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Platform Integration Status */}
              <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2 text-green-800">
                    <Sparkles className="h-5 w-5" />
                    平台整合狀態
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-sm">儀表板已更新</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-sm">AI 導師上下文已建立</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-sm">已生成 {generatedNote.aiInsights.practiceQuestions} 道練習題</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-sm">記憶卡片已創建</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="w-80 border-l border-slate-200 bg-slate-50 p-6 space-y-6">
            {/* AI Insights */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  AI 學習洞察
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-green-700 mb-2">優勢領域</h4>
                  <div className="space-y-1">
                    {generatedNote.aiInsights.strengthAreas.map((area, index) => (
                      <div key={index} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        {area}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-orange-700 mb-2">建議複習</h4>
                  <div className="space-y-1">
                    {generatedNote.aiInsights.suggestedReview.map((item, index) => (
                      <div key={index} className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">快速操作</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                  <Target className="h-4 w-4 mr-2" />
                  生成練習題 ({generatedNote.aiInsights.practiceQuestions})
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                  <Brain className="h-4 w-4 mr-2" />
                  詢問 AI 導師
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  查看學習分析
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                  <BookOpen className="h-4 w-4 mr-2" />
                  創建記憶卡片
                </Button>
              </CardContent>
            </Card>

            {/* Related Topics */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">相關主題</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {generatedNote.aiInsights.relatedTopics.map((topic, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-xs h-8 bg-transparent"
                    >
                      <ArrowRight className="h-3 w-3 mr-2" />
                      {topic}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="flex h-16 items-center gap-4 border-b border-slate-200 bg-white px-6">
        <SidebarTrigger />
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-slate-900">AI 智能筆記工具</h1>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-6 space-y-6">
        {/* Header Card */}
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">創建智能筆記</h2>
                <p className="text-slate-600">上傳任何學習材料，AI 會自動轉換成結構化筆記並整合到你的學習平台</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload Options */}
          <div className="lg:col-span-2 space-y-6">
            {/* Note Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  筆記設定
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">筆記標題</label>
                    <Input
                      placeholder="輸入筆記標題..."
                      value={noteTitle}
                      onChange={(e) => setNoteTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">課程</label>
                    <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                      <SelectTrigger>
                        <SelectValue placeholder="選擇課程" />
                      </SelectTrigger>
                      <SelectContent>
                        {courses.map((course) => (
                          <SelectItem key={course.value} value={course.value}>
                            {course.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">輸出語言</label>
                    <Select value={outputLanguage} onValueChange={setOutputLanguage}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="zh-TW">繁體中文</SelectItem>
                        <SelectItem value="zh-CN">簡體中文</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="ja">日本語</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">詳細程度</label>
                    <Select value={detailLevel} onValueChange={setDetailLevel}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="summary">摘要</SelectItem>
                        <SelectItem value="detailed">詳細</SelectItem>
                        <SelectItem value="comprehensive">全面</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* File Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  上傳檔案
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                  <p className="text-lg font-medium text-purple-600 mb-2">點擊瀏覽或拖放檔案</p>
                  <p className="text-sm text-slate-500">支援格式：PDF, DOCX, PPTX, TXT, MD, MP3, M4A, MAV 或圖片</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.docx,.pptx,.txt,.md,.mp3,.m4a,.wav,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileUpload(e.target.files)}
                    className="hidden"
                  />
                </div>

                {/* Uploaded Files */}
                {uploadedFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {uploadedFiles.map((file) => (
                      <div key={file.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <FileText className="h-5 w-5 text-slate-600" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{file.name}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => removeFile(file.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-slate-500">{file.size}</span>
                            <Badge
                              variant={
                                file.status === "completed"
                                  ? "default"
                                  : file.status === "error"
                                    ? "destructive"
                                    : "secondary"
                              }
                              className="text-xs"
                            >
                              {file.status === "uploading"
                                ? "上傳中"
                                : file.status === "processing"
                                  ? "處理中"
                                  : file.status === "completed"
                                    ? "完成"
                                    : "錯誤"}
                            </Badge>
                          </div>
                          {file.status !== "completed" && <Progress value={file.progress} className="h-1 mt-2" />}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Other Sources */}
            <Card>
              <CardHeader>
                <CardTitle>其他來源</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full h-20 flex-col gap-2 bg-transparent">
                      <Globe className="h-6 w-6" />
                      <span className="text-sm">網頁</span>
                    </Button>
                    <Input
                      placeholder="輸入網址..."
                      value={webUrl}
                      onChange={(e) => setWebUrl(e.target.value)}
                      className="text-xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full h-20 flex-col gap-2 bg-transparent">
                      <Video className="h-6 w-6 text-red-600" />
                      <span className="text-sm">YouTube</span>
                    </Button>
                    <Input
                      placeholder="YouTube 連結..."
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      className="text-xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full h-20 flex-col gap-2 bg-transparent">
                      <FileText className="h-6 w-6 text-green-600" />
                      <span className="text-sm">貼上文字</span>
                    </Button>
                  </div>
                </div>

                {/* Text Area for Paste Text */}
                <Textarea
                  placeholder="貼上文字內容..."
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  className="min-h-[100px]"
                />
              </CardContent>
            </Card>

            {/* Create Button */}
            <Button
              onClick={handleCreateNote}
              disabled={uploadedFiles.length === 0 && !webUrl && !youtubeUrl && !pastedText.trim()}
              className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Sparkles className="h-5 w-5 mr-2" />
              創建 AI 筆記
            </Button>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* AI Features */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  AI 功能特色
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm">智能內容結構化</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">關鍵概念提取</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm">學習建議生成</span>
                </div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-purple-600" />
                  <span className="text-sm">平台數據整合</span>
                </div>
              </CardContent>
            </Card>

            {/* Platform Integration */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">平台整合</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">儀表板更新</span>
                    <Checkbox checked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">AI 導師上下文</span>
                    <Checkbox checked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">練習題生成</span>
                    <Checkbox checked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">記憶卡片創建</span>
                    <Checkbox checked />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Notes */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">最近筆記</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-xs space-y-2">
                  <div className="p-2 rounded bg-white border">
                    <p className="font-medium">有機化學反應機制</p>
                    <p className="text-slate-600">CHEM2001 • 2 小時前</p>
                  </div>
                  <div className="p-2 rounded bg-white border">
                    <p className="font-medium">微積分極限概念</p>
                    <p className="text-slate-600">MATH2001 • 昨天</p>
                  </div>
                  <div className="p-2 rounded bg-white border">
                    <p className="font-medium">細胞分裂過程</p>
                    <p className="text-slate-600">BIOL3001 • 3 天前</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
