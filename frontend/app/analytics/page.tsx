"use client"

import { useState } from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Brain,
  BarChart3,
  TrendingUp,
  Target,
  Clock,
  BookOpen,
  Zap,
  Lightbulb,
  Users,
  Award,
  AlertCircle,
  CheckCircle,
  ArrowUp,
  GitBranch,
  FileText,
  Play,
} from "lucide-react"

interface LearningData {
  notes: {
    total: number
    thisWeek: number
    subjects: Record<string, number>
    avgReadTime: number
    keyTopicsExtracted: number
  }
  mindMaps: {
    total: number
    thisWeek: number
    avgNodesPerMap: number
    conceptConnections: number
  }
  flashcards: {
    totalDecks: number
    totalCards: number
    masteredCards: number
    studyStreak: number
    avgAccuracy: number
    totalStudyTime: number
  }
  aiInteractions: {
    totalQuestions: number
    topicsDiscussed: string[]
    avgResponseTime: number
    satisfactionRate: number
  }
}

export default function AILearningAnalytics() {
  const [timeRange, setTimeRange] = useState("week")
  const [selectedSubject, setSelectedSubject] = useState("all")

  const learningData: LearningData = {
    notes: {
      total: 24,
      thisWeek: 6,
      subjects: {
        化學: 8,
        數學: 7,
        生物: 5,
        英文: 4,
      },
      avgReadTime: 12,
      keyTopicsExtracted: 156,
    },
    mindMaps: {
      total: 12,
      thisWeek: 3,
      avgNodesPerMap: 18,
      conceptConnections: 89,
    },
    flashcards: {
      totalDecks: 8,
      totalCards: 234,
      masteredCards: 156,
      studyStreak: 12,
      avgAccuracy: 87,
      totalStudyTime: 1240, // 分鐘
    },
    aiInteractions: {
      totalQuestions: 89,
      topicsDiscussed: ["氧化還原反應", "微積分極限", "細胞生物學", "雅思寫作"],
      avgResponseTime: 1.8,
      satisfactionRate: 94,
    },
  }

  const knowledgeGraph = [
    {
      subject: "化學",
      topics: [
        { name: "氧化還原反應", mastery: 85, connections: 12, lastStudied: "2 小時前" },
        { name: "有機化學", mastery: 72, connections: 8, lastStudied: "1 天前" },
        { name: "熱力學", mastery: 45, connections: 6, lastStudied: "3 天前" },
      ],
    },
    {
      subject: "數學",
      topics: [
        { name: "微積分極限", mastery: 78, connections: 15, lastStudied: "1 天前" },
        { name: "導數", mastery: 82, connections: 10, lastStudied: "2 天前" },
        { name: "積分", mastery: 35, connections: 4, lastStudied: "1 週前" },
      ],
    },
    {
      subject: "生物",
      topics: [
        { name: "細胞結構", mastery: 90, connections: 14, lastStudied: "3 小時前" },
        { name: "代謝", mastery: 65, connections: 9, lastStudied: "2 天前" },
        { name: "遺傳學", mastery: 40, connections: 5, lastStudied: "5 天前" },
      ],
    },
  ]

  const learningPatterns = {
    bestStudyTime: "上午 10:00-11:00",
    avgSessionLength: 25,
    preferredDifficulty: "中等-困難",
    strongestSubject: "化學",
    improvementNeeded: "數學積分",
    learningStyle: "視覺 + 練習",
  }

  const aiRecommendations = [
    {
      type: "urgent",
      title: "數學積分需要加強",
      description: "你在積分概念上的掌握度只有 35%，建議優先複習基礎概念",
      action: "開始積分基礎練習",
      priority: "high",
    },
    {
      type: "opportunity",
      title: "化學優勢可以擴展",
      description: "你在化學方面表現優秀，可以嘗試更進階的有機化學主題",
      action: "探索進階有機化學",
      priority: "medium",
    },
    {
      type: "habit",
      title: "學習時間優化",
      description: "數據顯示你在上午 10-11 點學習效率最高，建議安排重要內容",
      action: "調整學習時間表",
      priority: "low",
    },
    {
      type: "social",
      title: "協作學習機會",
      description: "發現 3 位同學在學習相同的微積分內容，可以組成學習小組",
      action: "加入學習小組",
      priority: "medium",
    },
  ]

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600"
    if (percentage >= 60) return "text-blue-600"
    if (percentage >= 40) return "text-yellow-600"
    return "text-red-600"
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-red-200 bg-red-50"
      case "medium":
        return "border-yellow-200 bg-yellow-50"
      case "low":
        return "border-green-200 bg-green-50"
      default:
        return "border-slate-200 bg-slate-50"
    }
  }

  const getPriorityIcon = (type: string) => {
    switch (type) {
      case "urgent":
        return <AlertCircle className="h-4 w-4 text-red-600" />
      case "opportunity":
        return <TrendingUp className="h-4 w-4 text-blue-600" />
      case "habit":
        return <Clock className="h-4 w-4 text-green-600" />
      case "social":
        return <Users className="h-4 w-4 text-purple-600" />
      default:
        return <Lightbulb className="h-4 w-4 text-slate-600" />
    }
  }

  return (
    <div className="flex flex-col h-screen">
      {/* 標題欄 */}
      <header className="flex h-16 items-center gap-4 border-b border-slate-200 bg-white px-6">
        <SidebarTrigger />
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-slate-900">AI 學習分析</h1>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">本週</SelectItem>
              <SelectItem value="month">本月</SelectItem>
              <SelectItem value="semester">本學期</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            匯出報告
          </Button>
        </div>
      </header>

      {/* 主要內容 */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* AI 洞察標題 */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">AI 深度學習分析</h2>
                <p className="text-slate-600">
                  基於你的筆記、思維導圖、記憶卡片和 AI 互動數據，提供個人化學習洞察和建議
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">94%</div>
                <div className="text-sm text-slate-600">整體學習效率</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">總覽</TabsTrigger>
            <TabsTrigger value="knowledge">知識圖譜</TabsTrigger>
            <TabsTrigger value="patterns">學習模式</TabsTrigger>
            <TabsTrigger value="recommendations">AI 建議</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* 學習數據流 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GitBranch className="h-5 w-5" />
                  學習數據流分析
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-6">
                  {/* 筆記 */}
                  <div className="text-center space-y-3">
                    <div className="h-16 w-16 mx-auto rounded-2xl bg-blue-100 flex items-center justify-center">
                      <FileText className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{learningData.notes.total}</div>
                      <div className="text-sm text-slate-600">筆記數量</div>
                    </div>
                    <div className="space-y-1 text-xs text-slate-500">
                      <div>本週新增：{learningData.notes.thisWeek}</div>
                      <div>平均閱讀：{learningData.notes.avgReadTime}分鐘</div>
                      <div>提取主題：{learningData.notes.keyTopicsExtracted}</div>
                    </div>
                  </div>

                  {/* 思維導圖 */}
                  <div className="text-center space-y-3">
                    <div className="h-16 w-16 mx-auto rounded-2xl bg-green-100 flex items-center justify-center">
                      <GitBranch className="h-8 w-8 text-green-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{learningData.mindMaps.total}</div>
                      <div className="text-sm text-slate-600">思維導圖</div>
                    </div>
                    <div className="space-y-1 text-xs text-slate-500">
                      <div>本週創建：{learningData.mindMaps.thisWeek}</div>
                      <div>平均節點：{learningData.mindMaps.avgNodesPerMap}</div>
                      <div>概念連結：{learningData.mindMaps.conceptConnections}</div>
                    </div>
                  </div>

                  {/* 記憶卡片 */}
                  <div className="text-center space-y-3">
                    <div className="h-16 w-16 mx-auto rounded-2xl bg-purple-100 flex items-center justify-center">
                      <Zap className="h-8 w-8 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{learningData.flashcards.totalCards}</div>
                      <div className="text-sm text-slate-600">記憶卡片</div>
                    </div>
                    <div className="space-y-1 text-xs text-slate-500">
                      <div>已掌握：{learningData.flashcards.masteredCards}</div>
                      <div>正確率：{learningData.flashcards.avgAccuracy}%</div>
                      <div>連續：{learningData.flashcards.studyStreak}天</div>
                    </div>
                  </div>

                  {/* AI 互動 */}
                  <div className="text-center space-y-3">
                    <div className="h-16 w-16 mx-auto rounded-2xl bg-orange-100 flex items-center justify-center">
                      <Brain className="h-8 w-8 text-orange-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{learningData.aiInteractions.totalQuestions}</div>
                      <div className="text-sm text-slate-600">AI 互動</div>
                    </div>
                    <div className="space-y-1 text-xs text-slate-500">
                      <div>回應時間：{learningData.aiInteractions.avgResponseTime}秒</div>
                      <div>滿意度：{learningData.aiInteractions.satisfactionRate}%</div>
                      <div>討論主題：{learningData.aiInteractions.topicsDiscussed.length}</div>
                    </div>
                  </div>
                </div>

                {/* 數據流程視覺化 */}
                <div className="mt-8 p-4 bg-slate-50 rounded-lg">
                  <div className="text-center text-sm text-slate-600 mb-4">數據整合流程</div>
                  <div className="flex items-center justify-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                      <span className="text-xs">筆記內容</span>
                    </div>
                    <ArrowUp className="h-4 w-4 text-slate-400" />
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-green-500"></div>
                      <span className="text-xs">概念提取</span>
                    </div>
                    <ArrowUp className="h-4 w-4 text-slate-400" />
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-purple-500"></div>
                      <span className="text-xs">卡片生成</span>
                    </div>
                    <ArrowUp className="h-4 w-4 text-slate-400" />
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-orange-500"></div>
                      <span className="text-xs">學習分析</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 科目表現 */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    科目表現分析
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(learningData.notes.subjects).map(([subject, count]) => {
                    const percentage = Math.round((count / learningData.notes.total) * 100)
                    return (
                      <div key={subject} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{subject}</span>
                          <span className="font-medium">
                            {count} 筆記 ({percentage}%)
                          </span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    )
                  })}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    學習效率趨勢
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-lg font-bold text-green-600">
                        {Math.round(learningData.flashcards.totalStudyTime / 60)}h
                      </div>
                      <div className="text-sm text-green-700">總學習時間</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-lg font-bold text-blue-600">{learningData.flashcards.avgAccuracy}%</div>
                      <div className="text-sm text-blue-700">平均正確率</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>記憶保持率</span>
                      <span className="flex items-center gap-1 text-green-600">
                        <ArrowUp className="h-3 w-3" />
                        +12%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>學習速度</span>
                      <span className="flex items-center gap-1 text-blue-600">
                        <ArrowUp className="h-3 w-3" />
                        +8%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>概念理解深度</span>
                      <span className="flex items-center gap-1 text-purple-600">
                        <ArrowUp className="h-3 w-3" />
                        +15%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="knowledge" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  個人化知識圖譜
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {knowledgeGraph.map((subject) => (
                  <div key={subject.subject} className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      {subject.subject}
                    </h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      {subject.topics.map((topic) => (
                        <Card key={topic.name} className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">{topic.name}</h4>
                              <Badge variant="outline" className={getProgressColor(topic.mastery)}>
                                {topic.mastery}%
                              </Badge>
                            </div>
                            <Progress value={topic.mastery} className="h-2" />
                            <div className="flex justify-between text-xs text-slate-500">
                              <span>{topic.connections} 個連結</span>
                              <span>{topic.lastStudied}</span>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="patterns" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    學習模式分析
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">最佳學習時間</span>
                      <span className="font-medium">{learningPatterns.bestStudyTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">平均學習時長</span>
                      <span className="font-medium">{learningPatterns.avgSessionLength} 分鐘</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">偏好難度</span>
                      <span className="font-medium">{learningPatterns.preferredDifficulty}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">最強科目</span>
                      <span className="font-medium text-green-600">{learningPatterns.strongestSubject}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">需要改進</span>
                      <span className="font-medium text-red-600">{learningPatterns.improvementNeeded}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">學習風格</span>
                      <span className="font-medium">{learningPatterns.learningStyle}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    學習成就
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                      <Award className="h-6 w-6 text-yellow-600" />
                      <div>
                        <div className="font-medium">學習連續王</div>
                        <div className="text-sm text-slate-600">連續學習 12 天</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <CheckCircle className="h-6 w-6 text-blue-600" />
                      <div>
                        <div className="font-medium">記憶大師</div>
                        <div className="text-sm text-slate-600">掌握 156 張卡片</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-green-600" />
                      <div>
                        <div className="font-medium">進步之星</div>
                        <div className="text-sm text-slate-600">本週效率提升 15%</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6">
            <div className="space-y-4">
              {aiRecommendations.map((rec, index) => (
                <Card key={index} className={`border-l-4 ${getPriorityColor(rec.priority)}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {getPriorityIcon(rec.type)}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">{rec.title}</h3>
                          <Badge variant="outline" className="capitalize">
                            {rec.priority === "high" ? "高" : rec.priority === "medium" ? "中" : "低"}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600">{rec.description}</p>
                        <Button size="sm" variant="outline">
                          <Play className="h-3 w-3 mr-2" />
                          {rec.action}
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
