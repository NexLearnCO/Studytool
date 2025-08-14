"use client"

import { useState } from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Zap,
  Upload,
  FileText,
  Brain,
  Settings,
  Download,
  Share,
  Plus,
  Eye,
  Edit,
  Trash2,
  RotateCcw,
  BookOpen,
  Target,
  Sparkles,
} from "lucide-react"

interface Flashcard {
  id: string
  front: string
  back: string
  difficulty: "簡單" | "中等" | "困難"
  type: "基礎" | "填空" | "圖片" | "反向"
}

export default function FlashcardGenerator() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [inputText, setInputText] = useState("")
  const [generatedCards, setGeneratedCards] = useState<Flashcard[]>([])
  const [activeTab, setActiveTab] = useState("input")
  const [selectedCardType, setSelectedCardType] = useState("基礎")
  const [selectedDifficulty, setSelectedDifficulty] = useState("混合")
  const [numberOfCards, setNumberOfCards] = useState("10")

  const handleGenerate = async () => {
    setIsGenerating(true)
    setActiveTab("generated")

    // 模擬AI處理
    setTimeout(() => {
      const sampleCards: Flashcard[] = [
        {
          id: "1",
          front: "什麼是SN2反應的機制？",
          back: "SN2反應通過協同機制進行，親核試劑從背面攻擊，導致立體化學反轉。反應速率同時依賴於底物和親核試劑的濃度。",
          difficulty: "中等",
          type: "基礎",
        },
        {
          id: "2",
          front: "一級碳陽離子比三級碳陽離子_____穩定。",
          back: "較不",
          difficulty: "簡單",
          type: "填空",
        },
        {
          id: "3",
          front: "哪些因素有利於SN1而非SN2反應？",
          back: "1. 三級底物（更穩定的碳陽離子）\n2. 極性質子溶劑\n3. 弱親核試劑\n4. 較高溫度",
          difficulty: "困難",
          type: "基礎",
        },
        {
          id: "4",
          front: "定義親核試劑",
          back: "親核試劑是富電子的物質，能夠提供電子對形成化學鍵。例如OH⁻、NH₃和H₂O。",
          difficulty: "簡單",
          type: "基礎",
        },
        {
          id: "5",
          front: "SN反應中的離去基團必須是_____鹼。",
          back: "弱",
          difficulty: "中等",
          type: "填空",
        },
      ]
      setGeneratedCards(sampleCards)
      setIsGenerating(false)
    }, 3000)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "簡單":
        return "text-green-600 bg-green-50 border-green-200"
      case "中等":
        return "text-blue-600 bg-blue-50 border-blue-200"
      case "困難":
        return "text-red-600 bg-red-50 border-red-200"
      default:
        return "text-slate-600 bg-slate-50 border-slate-200"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "基礎":
        return <FileText className="h-4 w-4" />
      case "填空":
        return <Target className="h-4 w-4" />
      case "圖片":
        return <Eye className="h-4 w-4" />
      case "反向":
        return <RotateCcw className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  return (
    <div className="flex flex-col h-screen">
      {/* 標題欄 */}
      <header className="flex h-16 items-center gap-4 border-b border-slate-200 bg-white px-6">
        <SidebarTrigger />
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-slate-900">記憶卡片生成器</h1>
        </div>
        <Button variant="outline">
          <Share className="h-4 w-4 mr-2" />
          分享
        </Button>
      </header>

      {/* 主要內容 */}
      <div className="flex-1 p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <div className="flex items-center justify-between mb-6">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="input">輸入與設定</TabsTrigger>
              <TabsTrigger value="generated">生成的卡片</TabsTrigger>
            </TabsList>

            {activeTab === "generated" && generatedCards.length > 0 && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  匯出牌組
                </Button>
                <Button size="sm">
                  <BookOpen className="h-4 w-4 mr-2" />
                  開始學習
                </Button>
              </div>
            )}
          </div>

          {/* 輸入標籤 */}
          <TabsContent value="input" className="space-y-6 h-full">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 輸入方法 */}
              <div className="lg:col-span-2 space-y-6">
                {/* 標題卡片 */}
                <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                        <Zap className="h-8 w-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">AI 記憶卡片生成器</h2>
                        <p className="text-slate-600">透過智能AI分析，將你的學習材料轉換為高效的記憶卡片</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 文字輸入 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      學習材料輸入
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      placeholder="在此貼上你的學習材料、課堂筆記、教科書內容或任何學習資料..."
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      className="min-h-[250px] resize-none"
                    />
                    <div className="flex items-center justify-between text-sm text-slate-500">
                      <span>{inputText.length} 字元</span>
                      <span>建議範圍：500-5,000 字元</span>
                    </div>
                  </CardContent>
                </Card>

                {/* 檔案上傳 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="h-5 w-5" />
                      上傳學習材料
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors">
                      <Upload className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                      <p className="text-lg font-medium text-slate-700 mb-2">拖放檔案到此處或點擊上傳</p>
                      <p className="text-sm text-slate-500 mb-4">支援 PDF、DOCX、TXT 和圖片檔案</p>
                      <Button variant="outline">
                        <Upload className="h-4 w-4 mr-2" />
                        選擇檔案
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 生成設定 */}
              <div className="space-y-6">
                {/* AI 設定 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      生成設定
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">卡片數量</label>
                      <Select value={numberOfCards} onValueChange={setNumberOfCards}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5 張卡片</SelectItem>
                          <SelectItem value="10">10 張卡片</SelectItem>
                          <SelectItem value="15">15 張卡片</SelectItem>
                          <SelectItem value="20">20 張卡片</SelectItem>
                          <SelectItem value="25">25 張卡片</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">卡片類型</label>
                      <Select value={selectedCardType} onValueChange={setSelectedCardType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="基礎">基礎 (問答)</SelectItem>
                          <SelectItem value="填空">填空題</SelectItem>
                          <SelectItem value="反向">反向卡片</SelectItem>
                          <SelectItem value="混合">混合類型</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">難度等級</label>
                      <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="簡單">簡單</SelectItem>
                          <SelectItem value="中等">中等</SelectItem>
                          <SelectItem value="困難">困難</SelectItem>
                          <SelectItem value="混合">混合難度</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">科目</label>
                      <Input placeholder="例如：有機化學" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">重點領域</label>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" defaultChecked className="rounded" />
                          關鍵定義
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" defaultChecked className="rounded" />
                          重要概念
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" className="rounded" />
                          公式與方程式
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" className="rounded" />
                          例題與應用
                        </label>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 生成按鈕 */}
                <Button
                  className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  onClick={handleGenerate}
                  disabled={!inputText.trim() || isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      正在生成卡片...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 mr-2" />
                      生成記憶卡片
                    </>
                  )}
                </Button>

                {/* AI 提示 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Brain className="h-4 w-4" />
                      AI 生成提示
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p>• 包含清晰、結構化的內容</p>
                    <p>• 指定重要術語和概念</p>
                    <p>• 添加上下文以便更好理解</p>
                    <p>• 使用標題來組織主題</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* 生成的卡片標籤 */}
          <TabsContent value="generated" className="h-full">
            {isGenerating ? (
              <div className="flex items-center justify-center h-96">
                <div className="text-center space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                  <div>
                    <p className="text-lg font-medium">正在生成你的記憶卡片...</p>
                    <p className="text-sm text-slate-600">AI 正在分析你的內容並創建最佳卡片</p>
                  </div>
                  <div className="w-64 mx-auto">
                    <Progress value={75} className="h-2" />
                    <p className="text-xs text-slate-500 mt-2">處理內容並生成問題中...</p>
                  </div>
                </div>
              </div>
            ) : generatedCards.length > 0 ? (
              <div className="space-y-6">
                {/* 統計標題 */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-purple-600">{generatedCards.length}</div>
                      <div className="text-sm text-slate-600">總卡片數</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {generatedCards.filter((c) => c.difficulty === "簡單").length}
                      </div>
                      <div className="text-sm text-slate-600">簡單</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {generatedCards.filter((c) => c.difficulty === "中等").length}
                      </div>
                      <div className="text-sm text-slate-600">中等</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {generatedCards.filter((c) => c.difficulty === "困難").length}
                      </div>
                      <div className="text-sm text-slate-600">困難</div>
                    </CardContent>
                  </Card>
                </div>

                {/* 卡片網格 */}
                <div className="grid gap-4">
                  {generatedCards.map((card, index) => (
                    <Card key={card.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-500">卡片 {index + 1}</span>
                            <Badge variant="outline" className={getDifficultyColor(card.difficulty)}>
                              {card.difficulty}
                            </Badge>
                            <Badge variant="secondary" className="flex items-center gap-1">
                              {getTypeIcon(card.type)}
                              {card.type}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1">
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

                        <div className="grid md:grid-cols-2 gap-6">
                          {/* 正面 */}
                          <div>
                            <div className="text-sm font-medium text-slate-700 mb-2">正面</div>
                            <div className="p-4 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
                              <p className="text-sm leading-relaxed">{card.front}</p>
                            </div>
                          </div>

                          {/* 背面 */}
                          <div>
                            <div className="text-sm font-medium text-slate-700 mb-2">背面</div>
                            <div className="p-4 bg-blue-50 rounded-lg border-2 border-dashed border-blue-200">
                              <p className="text-sm leading-relaxed whitespace-pre-line">{card.back}</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* 操作按鈕 */}
                <div className="flex justify-center gap-4 pt-6">
                  <Button variant="outline" size="lg">
                    <Download className="h-5 w-5 mr-2" />
                    匯出牌組
                  </Button>
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    <BookOpen className="h-5 w-5 mr-2" />
                    開始學習
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-96">
                <div className="text-center space-y-4">
                  <Zap className="h-16 w-16 mx-auto text-slate-300" />
                  <div>
                    <p className="text-lg font-medium text-slate-600">尚未生成記憶卡片</p>
                    <p className="text-sm text-slate-500">前往輸入與設定來創建你的第一個牌組</p>
                  </div>
                  <Button onClick={() => setActiveTab("input")}>
                    <Plus className="h-4 w-4 mr-2" />
                    生成記憶卡片
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
