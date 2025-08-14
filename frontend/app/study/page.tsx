"use client"

import { useState } from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  FileText,
  Upload,
  Mic,
  Brain,
  Download,
  Share,
  Lightbulb,
  Target,
  Sparkles,
  Square,
  Volume2,
  Eye,
  Edit,
  Trash2,
  Plus,
} from "lucide-react"

export default function StudyTool() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [inputText, setInputText] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [generatedNote, setGeneratedNote] = useState("")
  const [activeTab, setActiveTab] = useState("input")

  const handleGenerate = async () => {
    setIsGenerating(true)
    setActiveTab("output")

    // Simulate AI processing
    setTimeout(() => {
      setGeneratedNote(`# 進階有機化學：反應機制

## 概述
有機反應機制描述化學反應發生的逐步過程。理解這些機制對於預測反應結果和設計合成路徑至關重要。

## 關鍵概念

### 1. 親核取代反應 (SN1 & SN2)
- **SN2機制**: 協同的一步過程
  - 親核試劑從背面攻擊
  - 立體化學反轉
  - 反應速率取決於基質和親核試劑濃度

- **SN1機制**: 兩步過程
  - 形成碳陽離子中間體
  - 立體中心外消旋化
  - 反應速率僅取決於基質濃度

### 2. 消除反應 (E1 & E2)
- **E2機制**: 協同消除
  - 需要反式共平面幾何
  - 需要強鹼
  - 遵循Zaitsev規則

- **E1機制**: 兩步消除
  - 碳陽離子中間體
  - 與SN1競爭
  - 立體特異性較低

## 練習題

1. **題目1**: 預測2-溴-2-甲基丙烷與甲醇反應的主要產物。
   - *答案*: SN1機制，形成叔丁基甲基醚

2. **題目2**: 解釋為什麼一級烷基鹵化物偏向SN2而非SN1。
   - *答案*: 一級碳陽離子極不穩定

## 學習技巧
- 畫出機制的每一步
- 練習識別反應條件
- 使用分子模型視覺化立體化學
- 將機制與反應動力學聯繫

## 相關主題
- 立體化學
- 碳陽離子穩定性
- 離去基團能力
- 親核試劑強度`)
      setIsGenerating(false)
    }, 3000)
  }

  const recentNotes = [
    {
      id: 1,
      title: "有機化學機制",
      subject: "化學",
      date: "2小時前",
      progress: 100,
      type: "AI生成",
    },
    {
      id: 2,
      title: "微積分積分方法",
      subject: "數學",
      date: "1天前",
      progress: 85,
      type: "手動",
    },
    {
      id: 3,
      title: "物理：波的性質",
      subject: "物理",
      date: "2天前",
      progress: 60,
      type: "AI生成",
    },
  ]

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="flex h-16 items-center gap-4 border-b border-slate-200 bg-white px-6">
        <SidebarTrigger />
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-slate-900">學習工具</h1>
        </div>
        <Button variant="outline">
          <Share className="h-4 w-4 mr-2" />
          分享
        </Button>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <div className="flex items-center justify-between mb-6">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="input">輸入</TabsTrigger>
              <TabsTrigger value="output">生成筆記</TabsTrigger>
              <TabsTrigger value="library">筆記庫</TabsTrigger>
            </TabsList>

            {activeTab === "output" && generatedNote && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  匯出PDF
                </Button>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  編輯
                </Button>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  創建記憶卡片
                </Button>
              </div>
            )}
          </div>

          {/* Input Tab */}
          <TabsContent value="input" className="space-y-6 h-full">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
              {/* Input Methods */}
              <div className="lg:col-span-2 space-y-6">
                {/* Header Card */}
                <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                        <FileText className="h-8 w-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">AI學習筆記生成器</h2>
                        <p className="text-slate-600">透過AI協助將你的學習材料轉換成全面、結構化的筆記</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Text Input */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      文字輸入
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      placeholder="貼上你的學習材料、課堂筆記或教科書內容..."
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      className="min-h-[200px] resize-none"
                    />
                    <div className="flex items-center justify-between text-sm text-slate-500">
                      <span>{inputText.length} 字元</span>
                      <span>支援最多 10,000 字元</span>
                    </div>
                  </CardContent>
                </Card>

                {/* File Upload */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="h-5 w-5" />
                      檔案上傳
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                      <Upload className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                      <p className="text-lg font-medium text-slate-700 mb-2">拖放檔案到此處或點擊上傳</p>
                      <p className="text-sm text-slate-500 mb-4">支援 PDF、DOCX、TXT 和圖片檔案 (JPG、PNG)</p>
                      <Button variant="outline">
                        <Upload className="h-4 w-4 mr-2" />
                        選擇檔案
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Voice Input */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mic className="h-5 w-5" />
                      語音輸入
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center p-8 bg-slate-50 rounded-lg">
                      <div className="text-center space-y-4">
                        <Button
                          size="lg"
                          variant={isRecording ? "destructive" : "default"}
                          className="h-16 w-16 rounded-full"
                          onClick={() => setIsRecording(!isRecording)}
                        >
                          {isRecording ? <Square className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                        </Button>
                        <div>
                          <p className="font-medium">{isRecording ? "錄音中..." : "點擊開始錄音"}</p>
                          <p className="text-sm text-slate-500">說出你的課堂筆記或學習材料</p>
                        </div>
                        {isRecording && (
                          <div className="flex items-center justify-center gap-2 text-red-600">
                            <div className="h-2 w-2 rounded-full bg-red-600 animate-pulse"></div>
                            <span className="text-sm">00:45</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Generation Settings */}
              <div className="space-y-6">
                {/* AI Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5" />
                      AI生成設定
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">科目</label>
                      <Input placeholder="例如：有機化學" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">年級</label>
                      <Input placeholder="例如：12年級、大學" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">筆記風格</label>
                      <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" size="sm" className="bg-blue-50 border-blue-200">
                          詳細
                        </Button>
                        <Button variant="outline" size="sm">
                          摘要
                        </Button>
                        <Button variant="outline" size="sm">
                          大綱
                        </Button>
                        <Button variant="outline" size="sm">
                          問答格式
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">包含</label>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" defaultChecked className="rounded" />
                          練習題
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" defaultChecked className="rounded" />
                          關鍵定義
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" className="rounded" />
                          視覺圖表
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" className="rounded" />
                          記憶輔助
                        </label>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Generate Button */}
                <Button
                  className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                  onClick={handleGenerate}
                  disabled={!inputText.trim() || isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      生成筆記中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 mr-2" />
                      生成學習筆記
                    </>
                  )}
                </Button>

                {/* Quick Tips */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Lightbulb className="h-4 w-4" />
                      快速提示
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p>• 包含具體主題以獲得更好結果</p>
                    <p>• 上傳清晰、可讀的文件</p>
                    <p>• 使用語音輸入時請清楚說話</p>
                    <p>• 指定你的學習目標</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Generated Notes Tab */}
          <TabsContent value="output" className="h-full">
            {isGenerating ? (
              <div className="flex items-center justify-center h-96">
                <div className="text-center space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <div>
                    <p className="text-lg font-medium">正在生成你的學習筆記...</p>
                    <p className="text-sm text-slate-600">這可能需要幾分鐘時間</p>
                  </div>
                  <div className="w-64 mx-auto">
                    <Progress value={65} className="h-2" />
                    <p className="text-xs text-slate-500 mt-2">分析內容並結構化筆記中...</p>
                  </div>
                </div>
              </div>
            ) : generatedNote ? (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
                {/* Generated Note Content */}
                <div className="lg:col-span-3">
                  <Card className="h-full">
                    <CardHeader className="border-b">
                      <div className="flex items-center justify-between">
                        <CardTitle>生成的學習筆記</CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-green-600">
                            <Brain className="h-3 w-3 mr-1" />
                            AI生成
                          </Badge>
                          <Button variant="ghost" size="sm">
                            <Volume2 className="h-4 w-4 mr-2" />
                            朗讀
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 overflow-y-auto">
                      <div className="prose max-w-none">
                        <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{generatedNote}</pre>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Note Actions */}
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">筆記操作</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                        <Download className="h-4 w-4 mr-2" />
                        匯出PDF
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                        <Share className="h-4 w-4 mr-2" />
                        分享筆記
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                        <Plus className="h-4 w-4 mr-2" />
                        創建記憶卡片
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                        <Target className="h-4 w-4 mr-2" />
                        生成測驗
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">學習統計</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>閱讀時間</span>
                        <span className="font-medium">~8分鐘</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>字數</span>
                        <span className="font-medium">1,247字</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>難度等級</span>
                        <Badge variant="outline" className="text-blue-600">
                          進階
                        </Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>關鍵概念</span>
                        <span className="font-medium">已識別12個</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">AI洞察</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="font-medium text-blue-900">重點領域</p>
                        <p className="text-blue-700">機制理解和立體化學概念需要額外關注</p>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <p className="font-medium text-green-900">優勢</p>
                        <p className="text-green-700">反應類型和條件涵蓋良好</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-96">
                <div className="text-center space-y-4">
                  <FileText className="h-16 w-16 mx-auto text-slate-300" />
                  <div>
                    <p className="text-lg font-medium text-slate-600">尚未生成筆記</p>
                    <p className="text-sm text-slate-500">前往輸入頁面創建你的第一份學習筆記</p>
                  </div>
                  <Button onClick={() => setActiveTab("input")}>
                    <Plus className="h-4 w-4 mr-2" />
                    創建新筆記
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Note Library Tab */}
          <TabsContent value="library" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">筆記庫</h2>
                <p className="text-slate-600">管理和整理你的學習筆記</p>
              </div>
              <Button onClick={() => setActiveTab("input")}>
                <Plus className="h-4 w-4 mr-2" />
                新筆記
              </Button>
            </div>

            <div className="grid gap-4">
              {recentNotes.map((note) => (
                <Card key={note.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <FileText className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900">{note.title}</h3>
                          <div className="flex items-center gap-3 mt-1">
                            <Badge variant="outline">{note.subject}</Badge>
                            <Badge variant="secondary">{note.type}</Badge>
                            <span className="text-sm text-slate-500">{note.date}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right mr-4">
                          <div className="text-sm font-medium">{note.progress}% 完成</div>
                          <Progress value={note.progress} className="w-24 h-2 mt-1" />
                        </div>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
