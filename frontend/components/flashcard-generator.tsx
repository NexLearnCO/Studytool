"use client"

import { useState } from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Zap,
  BookOpen,
  Brain,
  Target,
  CheckCircle,
  Edit,
  Trash2,
  Plus,
  Sparkles,
  Clock,
  BarChart3,
  FileText,
} from "lucide-react"

interface FlashCard {
  id: string
  front: string
  back: string
  topic: string
  difficulty: "Easy" | "Medium" | "Hard"
  type: "Definition" | "Concept" | "Formula" | "Example"
  tags: string[]
  source: string
  isSelected: boolean
}

export function FlashcardGenerator() {
  const [generationStep, setGenerationStep] = useState<"configure" | "generating" | "review">("configure")
  const [selectedSource, setSelectedSource] = useState("note_chem_redox_001")
  const [cardType, setCardType] = useState("all")
  const [difficulty, setDifficulty] = useState("all")
  const [maxCards, setMaxCards] = useState("20")
  const [deckName, setDeckName] = useState("Chemistry - Redox Reactions")

  const [generatedCards, setGeneratedCards] = useState<FlashCard[]>([
    {
      id: "card_001",
      front: "What is oxidation?",
      back: "Oxidation is the loss of electrons. Remember: OIL (Oxidation Is Loss)",
      topic: "Basic Concepts",
      difficulty: "Easy",
      type: "Definition",
      tags: ["oxidation", "electrons", "basic"],
      source: "Chemical Redox Reactions - Fundamentals",
      isSelected: true,
    },
    {
      id: "card_002",
      front: "What is reduction?",
      back: "Reduction is the gain of electrons. Remember: RIG (Reduction Is Gain)",
      topic: "Basic Concepts",
      difficulty: "Easy",
      type: "Definition",
      tags: ["reduction", "electrons", "basic"],
      source: "Chemical Redox Reactions - Fundamentals",
      isSelected: true,
    },
    {
      id: "card_003",
      front: "What is an oxidizing agent?",
      back: "An oxidizing agent causes oxidation in other substances and gets reduced itself. It accepts electrons.",
      topic: "Basic Concepts",
      difficulty: "Medium",
      type: "Concept",
      tags: ["oxidizing agent", "electron transfer"],
      source: "Chemical Redox Reactions - Fundamentals",
      isSelected: true,
    },
    {
      id: "card_004",
      front: "Balance this redox equation:\nZn + Cu²⁺ → ?",
      back: "Zn + Cu²⁺ → Zn²⁺ + Cu\n\nZn is oxidized (loses 2e⁻)\nCu²⁺ is reduced (gains 2e⁻)",
      topic: "Balancing Equations",
      difficulty: "Hard",
      type: "Example",
      tags: ["balancing", "half-reactions", "practice"],
      source: "Chemical Redox Reactions - Fundamentals",
      isSelected: true,
    },
    {
      id: "card_005",
      front: "List the 6 steps of the half-reaction method",
      back: "1. Identify oxidation and reduction half-reactions\n2. Balance atoms other than H and O\n3. Balance oxygen using H₂O\n4. Balance hydrogen using H⁺\n5. Balance charge using electrons\n6. Equalize electrons and combine",
      topic: "Balancing Equations",
      difficulty: "Hard",
      type: "Formula",
      tags: ["half-reaction method", "balancing", "steps"],
      source: "Chemical Redox Reactions - Fundamentals",
      isSelected: true,
    },
    {
      id: "card_006",
      front: "Give an example of a combustion reaction",
      back: "C + O₂ → CO₂\n\nCarbon is oxidized (loses electrons)\nOxygen is reduced (gains electrons)",
      topic: "Common Examples",
      difficulty: "Medium",
      type: "Example",
      tags: ["combustion", "examples", "everyday"],
      source: "Chemical Redox Reactions - Fundamentals",
      isSelected: true,
    },
  ])

  const handleGenerate = () => {
    setGenerationStep("generating")
    setTimeout(() => {
      setGenerationStep("review")
    }, 3000)
  }

  const handleSelectAll = () => {
    const allSelected = generatedCards.every((card) => card.isSelected)
    setGeneratedCards((cards) => cards.map((card) => ({ ...card, isSelected: !allSelected })))
  }

  const handleCardSelect = (cardId: string) => {
    setGeneratedCards((cards) =>
      cards.map((card) => (card.id === cardId ? { ...card, isSelected: !card.isSelected } : card)),
    )
  }

  const handleEditCard = (cardId: string, field: "front" | "back", value: string) => {
    setGeneratedCards((cards) => cards.map((card) => (card.id === cardId ? { ...card, [field]: value } : card)))
  }

  const handleCreateDeck = () => {
    const selectedCards = generatedCards.filter((card) => card.isSelected)
    console.log("Creating deck with cards:", selectedCards)
    // 這裡會整合到學習系統
    alert(`成功創建牌組 "${deckName}"，包含 ${selectedCards.length} 張卡片！`)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-100 text-green-800"
      case "Medium":
        return "bg-blue-100 text-blue-800"
      case "Hard":
        return "bg-red-100 text-red-800"
      default:
        return "bg-slate-100 text-slate-800"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Definition":
        return <BookOpen className="h-3 w-3" />
      case "Concept":
        return <Brain className="h-3 w-3" />
      case "Formula":
        return <Target className="h-3 w-3" />
      case "Example":
        return <FileText className="h-3 w-3" />
      default:
        return <BookOpen className="h-3 w-3" />
    }
  }

  if (generationStep === "generating") {
    return (
      <div className="flex flex-col h-screen">
        <header className="flex h-16 items-center gap-4 border-b border-slate-200 bg-white px-6">
          <SidebarTrigger />
          <h1 className="text-xl font-semibold text-slate-900">AI 正在生成記憶卡片...</h1>
        </header>

        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="w-full max-w-2xl">
            <CardContent className="p-8 text-center space-y-6">
              <div className="h-16 w-16 mx-auto bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center">
                <Zap className="h-8 w-8 text-white animate-pulse" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">AI 正在分析筆記內容</h2>
                <p className="text-slate-600">根據你的設定生成個人化記憶卡片...</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>分析筆記結構</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>提取關鍵概念</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="h-5 w-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                  <span>生成問答對</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-400">
                  <div className="h-5 w-5 border-2 border-slate-300 rounded-full" />
                  <span>優化卡片內容</span>
                </div>
              </div>

              <Progress value={75} className="h-2" />
              <p className="text-sm text-slate-500">預計還需要 15 秒...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (generationStep === "review") {
    return (
      <div className="flex flex-col h-screen">
        <header className="flex h-16 items-center gap-4 border-b border-slate-200 bg-white px-6">
          <SidebarTrigger />
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-slate-900">檢視生成的記憶卡片</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleSelectAll}>
              {generatedCards.every((card) => card.isSelected) ? "取消全選" : "全選"}
            </Button>
            <Button onClick={handleCreateDeck} className="bg-gradient-to-r from-purple-600 to-pink-600">
              <Plus className="h-4 w-4 mr-2" />
              創建牌組 ({generatedCards.filter((card) => card.isSelected).length})
            </Button>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Deck Configuration */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    牌組設定
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">牌組名稱</label>
                      <Input
                        value={deckName}
                        onChange={(e) => setDeckName(e.target.value)}
                        placeholder="輸入牌組名稱..."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">學習目標</label>
                      <Select defaultValue="mastery">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="review">快速複習</SelectItem>
                          <SelectItem value="mastery">深度掌握</SelectItem>
                          <SelectItem value="exam">考試準備</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Generated Cards */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">生成的卡片 ({generatedCards.length})</h2>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <span>已選擇: {generatedCards.filter((card) => card.isSelected).length}</span>
                  </div>
                </div>

                <div className="grid gap-4">
                  {generatedCards.map((card) => (
                    <Card
                      key={card.id}
                      className={`transition-all ${card.isSelected ? "ring-2 ring-purple-500 bg-purple-50" : ""}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <Checkbox
                            checked={card.isSelected}
                            onCheckedChange={() => handleCardSelect(card.id)}
                            className="mt-1"
                          />

                          <div className="flex-1 space-y-4">
                            {/* Card Header */}
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={getDifficultyColor(card.difficulty)}>
                                {card.difficulty}
                              </Badge>
                              <Badge variant="outline" className="flex items-center gap-1">
                                {getTypeIcon(card.type)}
                                {card.type}
                              </Badge>
                              <Badge variant="secondary">{card.topic}</Badge>
                            </div>

                            {/* Card Content */}
                            <div className="grid md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">正面 (問題)</label>
                                <Textarea
                                  value={card.front}
                                  onChange={(e) => handleEditCard(card.id, "front", e.target.value)}
                                  className="min-h-[80px] resize-none"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">背面 (答案)</label>
                                <Textarea
                                  value={card.back}
                                  onChange={(e) => handleEditCard(card.id, "back", e.target.value)}
                                  className="min-h-[80px] resize-none"
                                />
                              </div>
                            </div>

                            {/* Card Tags */}
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-slate-600">標籤:</span>
                              <div className="flex flex-wrap gap-1">
                                {card.tags.map((tag, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col gap-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="w-80 border-l border-slate-200 bg-slate-50 p-6 space-y-6">
            {/* Generation Summary */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  生成摘要
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>總卡片數</span>
                  <span className="font-medium">{generatedCards.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>已選擇</span>
                  <span className="font-medium text-purple-600">
                    {generatedCards.filter((card) => card.isSelected).length}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>簡單</span>
                    <span className="text-green-600">
                      {generatedCards.filter((card) => card.difficulty === "Easy").length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>中等</span>
                    <span className="text-blue-600">
                      {generatedCards.filter((card) => card.difficulty === "Medium").length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>困難</span>
                    <span className="text-red-600">
                      {generatedCards.filter((card) => card.difficulty === "Hard").length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card Types */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">卡片類型分布</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {["Definition", "Concept", "Formula", "Example"].map((type) => {
                  const count = generatedCards.filter((card) => card.type === type).length
                  const percentage = (count / generatedCards.length) * 100
                  return (
                    <div key={type} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="flex items-center gap-1">
                          {getTypeIcon(type)}
                          {type}
                        </span>
                        <span>{count}</span>
                      </div>
                      <Progress value={percentage} className="h-1" />
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            {/* Learning Tips */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  學習建議
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-blue-800">建議每天學習 15-20 張新卡片，複習時間約 10-15 分鐘。</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-green-800">使用間隔重複算法，困難卡片會更頻繁出現。</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-purple-800">結合 AI 導師功能，遇到困難可以立即求助。</p>
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
                  <Plus className="h-4 w-4 mr-2" />
                  添加自定義卡片
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                  <FileText className="h-4 w-4 mr-2" />
                  匯入現有卡片
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                  <Target className="h-4 w-4 mr-2" />
                  設定學習目標
                </Button>
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
          <h1 className="text-xl font-semibold text-slate-900">AI 記憶卡片生成器</h1>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-6 space-y-6">
        {/* Header Card */}
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">智能記憶卡片生成</h2>
                <p className="text-slate-600">從你的筆記自動生成個人化記憶卡片，使用間隔重複算法優化學習效果</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuration Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Source Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  選擇來源內容
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">筆記來源</label>
                  <Select value={selectedSource} onValueChange={setSelectedSource}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="note_chem_redox_001">Chemical Redox Reactions - Fundamentals</SelectItem>
                      <SelectItem value="note_math_calc_001">Calculus - Limits and Derivatives</SelectItem>
                      <SelectItem value="note_bio_cell_001">Cell Biology - Structure and Function</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">已選擇筆記預覽</span>
                  </div>
                  <p className="text-sm text-blue-800">Chemical Redox Reactions - Fundamentals and Applications</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      化學
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      CHEM2001
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      5 個主題
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Generation Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  生成設定
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">卡片類型</label>
                    <Select value={cardType} onValueChange={setCardType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">所有類型</SelectItem>
                        <SelectItem value="definition">定義卡片</SelectItem>
                        <SelectItem value="concept">概念卡片</SelectItem>
                        <SelectItem value="formula">公式卡片</SelectItem>
                        <SelectItem value="example">例題卡片</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">難度等級</label>
                    <Select value={difficulty} onValueChange={setDifficulty}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">所有難度</SelectItem>
                        <SelectItem value="easy">簡單</SelectItem>
                        <SelectItem value="medium">中等</SelectItem>
                        <SelectItem value="hard">困難</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">最大卡片數</label>
                    <Select value={maxCards} onValueChange={setMaxCards}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10 張</SelectItem>
                        <SelectItem value="20">20 張</SelectItem>
                        <SelectItem value="50">50 張</SelectItem>
                        <SelectItem value="100">100 張</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">語言</label>
                    <Select defaultValue="mixed">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mixed">中英混合</SelectItem>
                        <SelectItem value="zh">繁體中文</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">進階選項</label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="include-images" defaultChecked />
                      <label htmlFor="include-images" className="text-sm">
                        包含圖片和圖表
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="include-formulas" defaultChecked />
                      <label htmlFor="include-formulas" className="text-sm">
                        包含數學公式
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="auto-tags" defaultChecked />
                      <label htmlFor="auto-tags" className="text-sm">
                        自動生成標籤
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="difficulty-adaptive" defaultChecked />
                      <label htmlFor="difficulty-adaptive" className="text-sm">
                        根據學習表現調整難度
                      </label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Sparkles className="h-5 w-5 mr-2" />
              生成記憶卡片
            </Button>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* AI Features */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  AI 智能特色
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">自動提取關鍵概念</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">智能問答對生成</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">難度自動分級</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">個人化學習路徑</span>
                </div>
              </CardContent>
            </Card>

            {/* Learning Statistics */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  學習統計
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>總卡片數</span>
                  <span className="font-medium">156</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>已掌握</span>
                  <span className="font-medium text-green-600">89</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>學習中</span>
                  <span className="font-medium text-blue-600">45</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>待學習</span>
                  <span className="font-medium text-slate-600">22</span>
                </div>
                <Progress value={67} className="h-2 mt-3" />
                <p className="text-xs text-slate-500 text-center">整體掌握度: 67%</p>
              </CardContent>
            </Card>

            {/* Recent Decks */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">最近牌組</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-xs space-y-2">
                  <div className="p-2 rounded bg-white border">
                    <p className="font-medium">有機化學反應</p>
                    <p className="text-slate-600">45 張卡片 • 2 天前</p>
                  </div>
                  <div className="p-2 rounded bg-white border">
                    <p className="font-medium">微積分基礎</p>
                    <p className="text-slate-600">32 張卡片 • 1 週前</p>
                  </div>
                  <div className="p-2 rounded bg-white border">
                    <p className="font-medium">細胞生物學</p>
                    <p className="text-slate-600">28 張卡片 • 2 週前</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Tips */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  學習小貼士
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs space-y-2">
                <p className="text-slate-600">• 每天固定時間學習，建立習慣</p>
                <p className="text-slate-600">• 困難卡片會自動增加複習頻率</p>
                <p className="text-slate-600">• 使用標籤系統組織不同主題</p>
                <p className="text-slate-600">• 結合 AI 導師獲得即時解答</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
