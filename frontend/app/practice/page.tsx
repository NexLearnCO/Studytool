"use client"

import { useState } from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Settings, BookOpen, Target, Search, X, Sparkles, HelpCircle } from "lucide-react"

interface Topic {
  id: string
  name: string
  checked: boolean
}

export default function PracticeTool() {
  const [questionType, setQuestionType] = useState("僅選擇題")
  const [syllabus, setSyllabus] = useState("劍橋國際")
  const [grade, setGrade] = useState("12")
  const [subject, setSubject] = useState("化學")
  const [difficultyRange, setDifficultyRange] = useState([41, 100])
  const [searchTopic, setSearchTopic] = useState("")

  const [topics, setTopics] = useState<Topic[]>([
    { id: "organic", name: "有機化學", checked: true },
    { id: "inorganic", name: "無機化學", checked: false },
    { id: "physical", name: "物理化學", checked: false },
    { id: "analytical", name: "分析化學", checked: false },
    { id: "biochemistry", name: "生物化學", checked: false },
    { id: "thermodynamics", name: "熱力學", checked: false },
    { id: "kinetics", name: "化學動力學", checked: false },
    { id: "equilibrium", name: "化學平衡", checked: false },
    { id: "electrochemistry", name: "電化學", checked: false },
  ])

  const filteredTopics = topics.filter((topic) => topic.name.toLowerCase().includes(searchTopic.toLowerCase()))

  const handleTopicChange = (topicId: string, checked: boolean) => {
    setTopics(topics.map((topic) => (topic.id === topicId ? { ...topic, checked } : topic)))
  }

  const handleSelectAll = () => {
    const allChecked = filteredTopics.every((topic) => topic.checked)
    setTopics(
      topics.map((topic) => ({
        ...topic,
        checked: filteredTopics.some((ft) => ft.id === topic.id) ? !allChecked : topic.checked,
      })),
    )
  }

  const clearParameters = () => {
    setQuestionType("僅選擇題")
    setSyllabus("")
    setGrade("")
    setSubject("")
    setTopics(topics.map((topic) => ({ ...topic, checked: false })))
    setDifficultyRange([0, 100])
  }

  const applyRecommendation = () => {
    setDifficultyRange([0, 20])
  }

  const getDifficultyLevel = (range: number[]) => {
    const avg = (range[0] + range[1]) / 2
    if (avg <= 40) return "簡單"
    if (avg <= 80) return "中等"
    return "進階"
  }

  const getDifficultyColor = (range: number[]) => {
    const avg = (range[0] + range[1]) / 2
    if (avg <= 40) return "text-green-600"
    if (avg <= 80) return "text-blue-600"
    return "text-red-600"
  }

  const getDifficultyDescription = (range: number[]) => {
    const avg = (range[0] + range[1]) / 2
    if (avg <= 40) return "建立基礎理解，透過直接問題強化核心概念"
    if (avg <= 80) return "應用知識解決問題，測試對概念的深層理解"
    return "挑戰複雜問題，以精密和創新的方式呈現概念"
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="flex h-16 items-center gap-4 border-b border-slate-200 bg-white px-6">
        <SidebarTrigger />
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-slate-900">練習工具</h1>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-6 space-y-6">
        {/* Header Card */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">AI驅動練習工具</h2>
                <p className="text-slate-600">根據難度要求和學習目標生成個人化練習題</p>
              </div>
              <Button variant="outline" size="icon">
                <HelpCircle className="h-5 w-5" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Question Parameters */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  題目參數
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={clearParameters}>
                  清除全部
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Question Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium">題目類型</label>
                <Select value={questionType} onValueChange={setQuestionType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="僅選擇題">僅選擇題</SelectItem>
                    <SelectItem value="簡答題">簡答題</SelectItem>
                    <SelectItem value="長答題">長答題</SelectItem>
                    <SelectItem value="混合類型">混合類型</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Syllabus */}
              <div className="space-y-2">
                <label className="text-sm font-medium">課程大綱</label>
                <div className="relative">
                  <Select value={syllabus} onValueChange={setSyllabus}>
                    <SelectTrigger>
                      <SelectValue placeholder="選擇課程大綱" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="劍橋國際">劍橋國際</SelectItem>
                      <SelectItem value="國際文憑">國際文憑</SelectItem>
                      <SelectItem value="進階先修">進階先修</SelectItem>
                      <SelectItem value="愛德思">愛德思</SelectItem>
                    </SelectContent>
                  </Select>
                  {syllabus && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-8 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                      onClick={() => setSyllabus("")}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Grade */}
              <div className="space-y-2">
                <label className="text-sm font-medium">年級</label>
                <div className="relative">
                  <Select value={grade} onValueChange={setGrade}>
                    <SelectTrigger>
                      <SelectValue placeholder="選擇年級" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10年級</SelectItem>
                      <SelectItem value="11">11年級</SelectItem>
                      <SelectItem value="12">12年級</SelectItem>
                    </SelectContent>
                  </Select>
                  {grade && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-8 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                      onClick={() => setGrade("")}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Subject */}
              <div className="space-y-2">
                <label className="text-sm font-medium">科目</label>
                <div className="relative">
                  <Select value={subject} onValueChange={setSubject}>
                    <SelectTrigger>
                      <SelectValue placeholder="選擇科目" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="化學">化學</SelectItem>
                      <SelectItem value="物理">物理</SelectItem>
                      <SelectItem value="生物">生物</SelectItem>
                      <SelectItem value="數學">數學</SelectItem>
                    </SelectContent>
                  </Select>
                  {subject && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-8 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                      onClick={() => setSubject("")}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Recommended Difficulty */}
              <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-sm font-medium text-blue-900">建議難度範圍</div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">平均難度 - 60</div>
                  <div className="text-sm text-slate-600 mt-1">基於你的表現 - 難度 0-20</div>
                </div>
                <Button variant="outline" size="sm" className="w-full bg-transparent" onClick={applyRecommendation}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  應用建議
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Topics */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  主題
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={handleSelectAll}>
                  {filteredTopics.every((topic) => topic.checked) ? "取消全選" : "全選"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filter Topics */}
              <div className="space-y-2">
                <label className="text-sm font-medium">篩選主題</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="搜尋主題..."
                    value={searchTopic}
                    onChange={(e) => setSearchTopic(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Topics List */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredTopics.map((topic) => (
                  <div key={topic.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-50">
                    <Checkbox
                      id={topic.id}
                      checked={topic.checked}
                      onCheckedChange={(checked) => handleTopicChange(topic.id, checked as boolean)}
                    />
                    <label
                      htmlFor={topic.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                    >
                      {topic.name}
                    </label>
                  </div>
                ))}
              </div>

              {filteredTopics.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">找不到主題</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Difficulty Configuration */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                難度設定
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Difficulty Range */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">
                    題目難度範圍: {difficultyRange[0]} - {difficultyRange[1]}
                  </label>
                </div>

                <div className="px-2">
                  <Slider
                    value={difficultyRange}
                    onValueChange={setDifficultyRange}
                    max={100}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-2">
                    <span>0</span>
                    <span>20</span>
                    <span>40</span>
                    <span>60</span>
                    <span>80</span>
                    <span>100</span>
                  </div>
                </div>
              </div>

              {/* Difficulty Levels */}
              <div className="space-y-4">
                {/* Easy */}
                <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-green-600 border-green-300">
                      簡單 (0-40)
                    </Badge>
                  </div>
                  <p className="text-sm text-green-700">建立基礎理解，透過直接問題強化核心概念</p>
                </div>

                {/* Moderate */}
                <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-blue-600 border-blue-300">
                      中等 (40-80)
                    </Badge>
                  </div>
                  <p className="text-sm text-blue-700">應用知識解決問題，測試對概念的深層理解</p>
                </div>

                {/* Advanced */}
                <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-red-600 border-red-300">
                      進階 (80-100)
                    </Badge>
                  </div>
                  <p className="text-sm text-red-700">挑戰複雜問題，以精密方式呈現概念</p>
                </div>
              </div>

              {/* Current Selection */}
              <div
                className={`p-4 rounded-lg border-2 ${
                  getDifficultyLevel(difficultyRange) === "簡單"
                    ? "bg-green-50 border-green-300"
                    : getDifficultyLevel(difficultyRange) === "中等"
                      ? "bg-blue-50 border-blue-300"
                      : "bg-red-50 border-red-300"
                }`}
              >
                <div className="text-center">
                  <div className={`text-lg font-bold ${getDifficultyColor(difficultyRange)}`}>
                    目前選擇: {getDifficultyLevel(difficultyRange)}
                  </div>
                  <p className={`text-sm mt-2 ${getDifficultyColor(difficultyRange)}`}>
                    {getDifficultyDescription(difficultyRange)}
                  </p>
                </div>
              </div>

              {/* Generate Button */}
              <Button className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Target className="h-5 w-5 mr-2" />
                生成題目
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
