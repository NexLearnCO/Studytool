"use client"

import { useState } from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  BookOpen,
  Brain,
  BarChart3,
  Play,
  Edit,
  Trash2,
  Share,
  Download,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Clock,
  Target,
  TrendingUp,
  Calendar,
  Users,
  CheckCircle,
} from "lucide-react"

interface FlashcardDeck {
  id: string
  name: string
  description: string
  subject: string
  course: string
  totalCards: number
  masteredCards: number
  learningCards: number
  newCards: number
  lastStudied: string
  createdFrom: {
    type: "note" | "manual" | "import"
    source: string
    noteId?: string
  }
  difficulty: "Easy" | "Medium" | "Hard" | "Mixed"
  tags: string[]
  studyStreak: number
  averageScore: number
  totalStudyTime: number
  isShared: boolean
  collaborators: number
}

export function FlashcardCollection() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterSubject, setFilterSubject] = useState("all")
  const [sortBy, setSortBy] = useState("recent")

  const [flashcardDecks] = useState<FlashcardDeck[]>([
    {
      id: "deck_001",
      name: "Chemistry - Redox Reactions",
      description: "從化學氧化還原筆記自動生成的記憶卡片，包含基礎概念和實際應用",
      subject: "Chemistry",
      course: "CHEM2001",
      totalCards: 24,
      masteredCards: 18,
      learningCards: 4,
      newCards: 2,
      lastStudied: "2 小時前",
      createdFrom: {
        type: "note",
        source: "Chemical Redox Reactions - Fundamentals",
        noteId: "note_chem_redox_001",
      },
      difficulty: "Mixed",
      tags: ["oxidation", "reduction", "electrochemistry", "balancing"],
      studyStreak: 7,
      averageScore: 87,
      totalStudyTime: 145,
      isShared: false,
      collaborators: 0,
    },
    {
      id: "deck_002",
      name: "Calculus - Limits & Derivatives",
      description: "微積分基礎概念，從課堂筆記和教科書內容生成",
      subject: "Mathematics",
      course: "MATH2001",
      totalCards: 32,
      masteredCards: 20,
      learningCards: 8,
      newCards: 4,
      lastStudied: "昨天",
      createdFrom: {
        type: "note",
        source: "Calculus Fundamentals",
        noteId: "note_math_calc_001",
      },
      difficulty: "Hard",
      tags: ["limits", "derivatives", "continuity", "applications"],
      studyStreak: 12,
      averageScore: 92,
      totalStudyTime: 230,
      isShared: true,
      collaborators: 3,
    },
    {
      id: "deck_003",
      name: "Cell Biology Essentials",
      description: "細胞生物學核心概念，結合思維導圖生成的結構化卡片",
      subject: "Biology",
      course: "BIOL3001",
      totalCards: 28,
      masteredCards: 15,
      learningCards: 10,
      newCards: 3,
      lastStudied: "3 天前",
      createdFrom: {
        type: "note",
        source: "Cell Structure and Function",
        noteId: "note_bio_cell_001",
      },
      difficulty: "Medium",
      tags: ["organelles", "membrane", "metabolism", "division"],
      studyStreak: 5,
      averageScore: 78,
      totalStudyTime: 180,
      isShared: false,
      collaborators: 0,
    },
    {
      id: "deck_004",
      name: "IELTS Writing Task 1",
      description: "雅思寫作任務一的圖表描述技巧和常用表達",
      subject: "English",
      course: "IELTS Prep",
      totalCards: 45,
      masteredCards: 30,
      learningCards: 12,
      newCards: 3,
      lastStudied: "1 週前",
      createdFrom: {
        type: "manual",
        source: "手動創建",
      },
      difficulty: "Medium",
      tags: ["writing", "graphs", "vocabulary", "structures"],
      studyStreak: 0,
      averageScore: 85,
      totalStudyTime: 320,
      isShared: true,
      collaborators: 8,
    },
  ])

  const filteredDecks = flashcardDecks.filter((deck) => {
    const matchesSearch =
      deck.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deck.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deck.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesSubject = filterSubject === "all" || deck.subject === filterSubject
    return matchesSearch && matchesSubject
  })

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-100 text-green-800 border-green-200"
      case "Medium":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "Hard":
        return "bg-red-100 text-red-800 border-red-200"
      case "Mixed":
        return "bg-purple-100 text-purple-800 border-purple-200"
      default:
        return "bg-slate-100 text-slate-800 border-slate-200"
    }
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return "bg-green-500"
    if (percentage >= 60) return "bg-blue-500"
    if (percentage >= 40) return "bg-yellow-500"
    return "bg-red-500"
  }

  const totalStats = {
    totalDecks: flashcardDecks.length,
    totalCards: flashcardDecks.reduce((sum, deck) => sum + deck.totalCards, 0),
    masteredCards: flashcardDecks.reduce((sum, deck) => sum + deck.masteredCards, 0),
    averageScore: Math.round(flashcardDecks.reduce((sum, deck) => sum + deck.averageScore, 0) / flashcardDecks.length),
    totalStudyTime: flashcardDecks.reduce((sum, deck) => sum + deck.totalStudyTime, 0),
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="flex h-16 items-center gap-4 border-b border-slate-200 bg-white px-6">
        <SidebarTrigger />
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-slate-900">記憶卡片集</h1>
        </div>
        <Button className="bg-gradient-to-r from-purple-600 to-blue-600">
          <Plus className="h-4 w-4 mr-2" />
          新增卡片集
        </Button>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-6 space-y-6">
        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">卡片集</span>
              </div>
              <div className="text-2xl font-bold mt-2">{totalStats.totalDecks}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">總卡片</span>
              </div>
              <div className="text-2xl font-bold mt-2">{totalStats.totalCards}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium">已掌握</span>
              </div>
              <div className="text-2xl font-bold mt-2">{totalStats.masteredCards}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium">平均分</span>
              </div>
              <div className="text-2xl font-bold mt-2">{totalStats.averageScore}%</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium">學習時間</span>
              </div>
              <div className="text-2xl font-bold mt-2">{Math.round(totalStats.totalStudyTime / 60)}h</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="搜尋卡片集..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterSubject} onValueChange={setFilterSubject}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">所有科目</SelectItem>
              <SelectItem value="Chemistry">化學</SelectItem>
              <SelectItem value="Mathematics">數學</SelectItem>
              <SelectItem value="Biology">生物</SelectItem>
              <SelectItem value="English">英文</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">最近學習</SelectItem>
              <SelectItem value="name">名稱排序</SelectItem>
              <SelectItem value="progress">學習進度</SelectItem>
              <SelectItem value="score">平均分數</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Deck Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredDecks.map((deck) => {
            const masteryPercentage = Math.round((deck.masteredCards / deck.totalCards) * 100)
            return (
              <Card key={deck.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg leading-tight">{deck.name}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{deck.course}</Badge>
                        <Badge variant="outline" className={getDifficultyColor(deck.difficulty)}>
                          {deck.difficulty}
                        </Badge>
                        {deck.isShared && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {deck.collaborators}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          編輯
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Share className="h-4 w-4 mr-2" />
                          分享
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="h-4 w-4 mr-2" />
                          匯出
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          刪除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-slate-600 line-clamp-2">{deck.description}</p>

                  {/* Source Info */}
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    {deck.createdFrom.type === "note" && (
                      <>
                        <BookOpen className="h-3 w-3" />
                        <span>來自筆記: {deck.createdFrom.source}</span>
                      </>
                    )}
                    {deck.createdFrom.type === "manual" && (
                      <>
                        <Edit className="h-3 w-3" />
                        <span>手動創建</span>
                      </>
                    )}
                  </div>

                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>掌握進度</span>
                      <span className="font-medium">{masteryPercentage}%</span>
                    </div>
                    <Progress value={masteryPercentage} className="h-2" />
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>已掌握: {deck.masteredCards}</span>
                      <span>學習中: {deck.learningCards}</span>
                      <span>新卡片: {deck.newCards}</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 text-center text-sm">
                    <div>
                      <div className="font-medium text-blue-600">{deck.averageScore}%</div>
                      <div className="text-xs text-slate-500">平均分</div>
                    </div>
                    <div>
                      <div className="font-medium text-green-600">{deck.studyStreak}</div>
                      <div className="text-xs text-slate-500">連續天數</div>
                    </div>
                    <div>
                      <div className="font-medium text-purple-600">{Math.round(deck.totalStudyTime / 60)}h</div>
                      <div className="text-xs text-slate-500">學習時間</div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {deck.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {deck.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{deck.tags.length - 3}
                      </Badge>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button className="flex-1" size="sm">
                      <Play className="h-4 w-4 mr-2" />
                      開始學習
                    </Button>
                    <Button variant="outline" size="sm">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      分析
                    </Button>
                  </div>

                  {/* Last Studied */}
                  <div className="text-xs text-slate-500 text-center pt-2 border-t">最後學習: {deck.lastStudied}</div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* AI Insights */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Brain className="h-5 w-5" />
              AI 學習洞察
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-white rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">學習趨勢</span>
                </div>
                <p className="text-sm text-green-700">你的化學卡片掌握度提升了 23%，建議繼續保持每日學習習慣。</p>
              </div>
              <div className="p-4 bg-white rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">重點改進</span>
                </div>
                <p className="text-sm text-blue-700">數學微積分的極限概念需要加強，建議增加相關練習。</p>
              </div>
              <div className="p-4 bg-white rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-800">學習建議</span>
                </div>
                <p className="text-sm text-purple-700">建議在上午 10-11 點學習新卡片，下午複習已學內容。</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
