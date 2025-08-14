"use client"

import { useState, useEffect } from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  RotateCcw,
  Brain,
  Clock,
  Target,
  CheckCircle,
  X,
  BarChart3,
  Pause,
  Play,
  SkipForward,
  Volume2,
  Eye,
  EyeOff,
  Lightbulb,
} from "lucide-react"

interface StudyCard {
  id: string
  front: string
  back: string
  topic: string
  difficulty: "簡單" | "中等" | "困難"
  type: string
  tags: string[]
  interval: number
  easeFactor: number
  repetitions: number
  nextReview: Date
}

export default function FlashcardStudy() {
  const [currentCard, setCurrentCard] = useState<StudyCard>({
    id: "card_001",
    front: "什麼是氧化？",
    back: "氧化是失去電子的過程。記住：OIL（氧化失去電子）\n\n例子：Zn → Zn²⁺ + 2e⁻\n鋅失去2個電子，所以被氧化。",
    topic: "基本概念",
    difficulty: "簡單",
    type: "定義",
    tags: ["氧化", "電子", "基礎"],
    interval: 1,
    easeFactor: 2.5,
    repetitions: 0,
    nextReview: new Date(),
  })

  const [isFlipped, setIsFlipped] = useState(false)
  const [studyStats, setStudyStats] = useState({
    totalCards: 20,
    currentIndex: 1,
    correct: 0,
    incorrect: 0,
    timeElapsed: 0,
    cardsRemaining: 19,
  })
  const [isPaused, setIsPaused] = useState(false)
  const [showHint, setShowHint] = useState(false)

  // 計時器
  useEffect(() => {
    if (!isPaused) {
      const timer = setInterval(() => {
        setStudyStats((prev) => ({ ...prev, timeElapsed: prev.timeElapsed + 1 }))
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [isPaused])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
  }

  const handleAnswer = (difficulty: "again" | "hard" | "good" | "easy") => {
    // Anki風格的間隔重複算法
    let newInterval = currentCard.interval
    let newEaseFactor = currentCard.easeFactor
    let newRepetitions = currentCard.repetitions

    switch (difficulty) {
      case "again":
        newInterval = 1
        newRepetitions = 0
        newEaseFactor = Math.max(1.3, currentCard.easeFactor - 0.2)
        setStudyStats((prev) => ({ ...prev, incorrect: prev.incorrect + 1 }))
        break
      case "hard":
        newInterval = Math.max(1, Math.round(currentCard.interval * 1.2))
        newEaseFactor = Math.max(1.3, currentCard.easeFactor - 0.15)
        newRepetitions = currentCard.repetitions + 1
        setStudyStats((prev) => ({ ...prev, correct: prev.correct + 1 }))
        break
      case "good":
        if (currentCard.repetitions === 0) {
          newInterval = 1
        } else if (currentCard.repetitions === 1) {
          newInterval = 6
        } else {
          newInterval = Math.round(currentCard.interval * currentCard.easeFactor)
        }
        newRepetitions = currentCard.repetitions + 1
        setStudyStats((prev) => ({ ...prev, correct: prev.correct + 1 }))
        break
      case "easy":
        newInterval = Math.round(currentCard.interval * currentCard.easeFactor * 1.3)
        newEaseFactor = currentCard.easeFactor + 0.15
        newRepetitions = currentCard.repetitions + 1
        setStudyStats((prev) => ({ ...prev, correct: prev.correct + 1 }))
        break
    }

    // 更新卡片數據
    setCurrentCard((prev) => ({
      ...prev,
      interval: newInterval,
      easeFactor: newEaseFactor,
      repetitions: newRepetitions,
      nextReview: new Date(Date.now() + newInterval * 24 * 60 * 60 * 1000),
    }))

    // 載入下一張卡片
    loadNextCard()
  }

  const loadNextCard = () => {
    setIsFlipped(false)
    setShowHint(false)
    setStudyStats((prev) => ({
      ...prev,
      currentIndex: prev.currentIndex + 1,
      cardsRemaining: prev.cardsRemaining - 1,
    }))

    // 模擬載入下一張卡片
    const nextCards = [
      {
        id: "card_002",
        front: "什麼是還原？",
        back: "還原是獲得電子的過程。記住：RIG（還原獲得電子）\n\n例子：Cu²⁺ + 2e⁻ → Cu\n銅離子獲得2個電子，所以被還原。",
        topic: "基本概念",
        difficulty: "簡單" as const,
        type: "定義",
        tags: ["還原", "電子", "基礎"],
        interval: 1,
        easeFactor: 2.5,
        repetitions: 0,
        nextReview: new Date(),
      },
      {
        id: "card_003",
        front: "平衡這個氧化還原方程式：\nZn + Cu²⁺ → ?",
        back: "Zn + Cu²⁺ → Zn²⁺ + Cu\n\n步驟：\n1. Zn → Zn²⁺ + 2e⁻ (氧化)\n2. Cu²⁺ + 2e⁻ → Cu (還原)\n3. 電子平衡 (各2e⁻)",
        topic: "方程式平衡",
        difficulty: "困難" as const,
        type: "例題",
        tags: ["平衡", "練習", "方程式"],
        interval: 1,
        easeFactor: 2.5,
        repetitions: 0,
        nextReview: new Date(),
      },
    ]

    const nextCard = nextCards[Math.floor(Math.random() * nextCards.length)]
    setCurrentCard(nextCard)
  }

  const handleAIHelp = () => {
    alert("AI 導師將為你詳細解釋這個概念！")
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "簡單":
        return "bg-green-100 text-green-800 border-green-200"
      case "中等":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "困難":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-slate-100 text-slate-800 border-slate-200"
    }
  }

  const getButtonStyle = (type: string) => {
    switch (type) {
      case "again":
        return "bg-red-600 hover:bg-red-700 text-white"
      case "hard":
        return "bg-orange-600 hover:bg-orange-700 text-white"
      case "good":
        return "bg-green-600 hover:bg-green-700 text-white"
      case "easy":
        return "bg-blue-600 hover:bg-blue-700 text-white"
      default:
        return ""
    }
  }

  if (studyStats.cardsRemaining === 0) {
    return (
      <div className="flex flex-col h-screen">
        <header className="flex h-16 items-center gap-4 border-b border-slate-200 bg-white px-6">
          <SidebarTrigger />
          <h1 className="text-xl font-semibold text-slate-900">學習完成！</h1>
        </header>

        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="w-full max-w-2xl">
            <CardContent className="p-8 text-center space-y-6">
              <div className="h-16 w-16 mx-auto bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">恭喜完成今日學習！</h2>
                <p className="text-slate-600">你已經完成了本次學習的所有記憶卡片</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{studyStats.correct}</div>
                  <div className="text-sm text-green-700">正確</div>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{studyStats.incorrect}</div>
                  <div className="text-sm text-red-700">需要複習</div>
                </div>
              </div>

              <div className="text-center">
                <div className="text-lg font-semibold">學習時間：{formatTime(studyStats.timeElapsed)}</div>
                <div className="text-sm text-slate-600">
                  正確率：{Math.round((studyStats.correct / (studyStats.correct + studyStats.incorrect)) * 100)}%
                </div>
              </div>

              <div className="flex gap-3 justify-center">
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  查看詳細分析
                </Button>
                <Button variant="outline">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  再次學習
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen">
      {/* 標題欄 */}
      <header className="flex h-16 items-center gap-4 border-b border-slate-200 bg-white px-6">
        <SidebarTrigger />
        <div className="flex items-center gap-2">
          <Badge variant="secondary">化學 - 氧化還原反應</Badge>
          <Badge variant="outline" className={getDifficultyColor(currentCard.difficulty)}>
            {currentCard.difficulty}
          </Badge>
          <Badge variant="outline">{currentCard.type}</Badge>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Clock className="h-4 w-4" />
            <span>{formatTime(studyStats.timeElapsed)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Target className="h-4 w-4" />
            <span>
              {studyStats.currentIndex}/{studyStats.totalCards}
            </span>
          </div>
          <Button variant="outline" size="sm" onClick={() => setIsPaused(!isPaused)}>
            {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* 主要學習區域 */}
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="w-full max-w-2xl space-y-6">
            {/* 進度條 */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-slate-600">
                <span>學習進度</span>
                <span>
                  {studyStats.currentIndex}/{studyStats.totalCards}
                </span>
              </div>
              <Progress value={(studyStats.currentIndex / studyStats.totalCards) * 100} className="h-2" />
            </div>

            {/* 記憶卡片 */}
            <div className="relative">
              <Card
                className={`w-full h-96 cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                  isFlipped ? "bg-blue-50 border-blue-200" : "bg-white border-slate-200"
                }`}
                onClick={handleFlip}
              >
                <CardContent className="p-8 h-full flex flex-col justify-center">
                  <div className="text-center space-y-4">
                    <div className="flex items-center justify-center gap-2 mb-4">
                      {isFlipped ? (
                        <EyeOff className="h-5 w-5 text-blue-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-slate-600" />
                      )}
                      <span className="text-sm font-medium text-slate-600">{isFlipped ? "答案" : "問題"}</span>
                    </div>

                    <div className="text-lg leading-relaxed whitespace-pre-line">
                      {isFlipped ? currentCard.back : currentCard.front}
                    </div>

                    {!isFlipped && <div className="mt-6 text-sm text-slate-500">點擊卡片查看答案</div>}
                  </div>
                </CardContent>
              </Card>

              {/* 卡片資訊 */}
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {currentCard.topic}
                </Badge>
                {currentCard.tags.slice(0, 2).map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* 操作按鈕 */}
            <div className="space-y-4">
              {!isFlipped ? (
                <div className="flex justify-center gap-3">
                  <Button onClick={handleFlip} size="lg" className="px-8">
                    <Eye className="h-4 w-4 mr-2" />
                    顯示答案
                  </Button>
                  <Button variant="outline" onClick={() => setShowHint(!showHint)}>
                    <Lightbulb className="h-4 w-4 mr-2" />
                    提示
                  </Button>
                  <Button variant="outline" onClick={handleAIHelp}>
                    <Brain className="h-4 w-4 mr-2" />
                    AI 解釋
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-center text-sm text-slate-600 mb-4">根據你的掌握程度選擇：</div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Button onClick={() => handleAnswer("again")} className={getButtonStyle("again")} size="lg">
                      <X className="h-4 w-4 mr-2" />
                      重來
                      <div className="text-xs opacity-75 mt-1">{"<1分鐘"}</div>
                    </Button>
                    <Button onClick={() => handleAnswer("hard")} className={getButtonStyle("hard")} size="lg">
                      困難
                      <div className="text-xs opacity-75 mt-1">{"<6分鐘"}</div>
                    </Button>
                    <Button onClick={() => handleAnswer("good")} className={getButtonStyle("good")} size="lg">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      良好
                      <div className="text-xs opacity-75 mt-1">{"<10分鐘"}</div>
                    </Button>
                    <Button onClick={() => handleAnswer("easy")} className={getButtonStyle("easy")} size="lg">
                      簡單
                      <div className="text-xs opacity-75 mt-1">4天</div>
                    </Button>
                  </div>
                  <div className="flex justify-center gap-3 mt-4">
                    <Button variant="outline" onClick={handleAIHelp}>
                      <Brain className="h-4 w-4 mr-2" />
                      AI 詳細解釋
                    </Button>
                    <Button variant="outline">
                      <Volume2 className="h-4 w-4 mr-2" />
                      朗讀
                    </Button>
                  </div>
                </div>
              )}

              {/* 提示 */}
              {showHint && (
                <Card className="bg-yellow-50 border-yellow-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-800">提示</span>
                    </div>
                    <p className="text-sm text-yellow-700">記住 OIL RIG：氧化失去電子，還原獲得電子</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>

        {/* 右側邊欄 */}
        <div className="w-80 border-l border-slate-200 bg-slate-50 p-6 space-y-6">
          {/* 學習統計 */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-4 flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                本次學習統計
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">正確</span>
                  <span className="text-sm font-medium text-green-600">{studyStats.correct}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">錯誤</span>
                  <span className="text-sm font-medium text-red-600">{studyStats.incorrect}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">剩餘</span>
                  <span className="text-sm font-medium">{studyStats.cardsRemaining}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">用時</span>
                  <span className="text-sm font-medium">{formatTime(studyStats.timeElapsed)}</span>
                </div>
                {studyStats.correct + studyStats.incorrect > 0 && (
                  <div className="pt-2 border-t">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">正確率</span>
                      <span className="text-sm font-medium text-blue-600">
                        {Math.round((studyStats.correct / (studyStats.correct + studyStats.incorrect)) * 100)}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 當前卡片資訊 */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-4">當前卡片資訊</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">主題</span>
                  <span className="font-medium">{currentCard.topic}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">難度</span>
                  <Badge variant="outline" className={getDifficultyColor(currentCard.difficulty)}>
                    {currentCard.difficulty}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">類型</span>
                  <span className="font-medium">{currentCard.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">複習次數</span>
                  <span className="font-medium">{currentCard.repetitions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">間隔天數</span>
                  <span className="font-medium">{currentCard.interval}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 快速操作 */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-4">快速操作</h3>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                  <SkipForward className="h-4 w-4 mr-2" />
                  跳過此卡片
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                  <Brain className="h-4 w-4 mr-2" />
                  標記為困難
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                  <Target className="h-4 w-4 mr-2" />
                  加入複習清單
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 學習建議 */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-4 flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                學習建議
              </h3>
              <div className="space-y-3 text-sm">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-blue-800">誠實評估自己的掌握程度，這樣 AI 才能更好地安排複習。</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-green-800">遇到困難時使用 AI 導師功能獲得即時解釋。</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
