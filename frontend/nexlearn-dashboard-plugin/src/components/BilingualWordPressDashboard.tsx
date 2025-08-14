"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookOpen, Brain, Clock, Target, TrendingUp, Zap, Award, Calendar, BarChart3, Globe } from "lucide-react"

// 雙語界面類型定義 / Bilingual interface type definitions
interface BilingualText {
  en: string
  zh: string
}

interface LearnDashCourse {
  id: number
  title: string
  description: string
  permalink: string
  featured_image: string
  progress: {
    percentage: number
    completed_steps: number
    total_steps: number
    status: "not_started" | "in_progress" | "completed"
    last_activity: string // 最後活動 / Last activity
  }
  lessons: Array<{
    id: number
    title: string
    completed: boolean
    estimated_duration: string
    actual_duration: number // 實際時長 / Actual duration
    difficulty_rating: number // 難度評級 / Difficulty rating
    has_video: boolean // 是否有視頻 / Has video
    has_materials: boolean // 是否有材料 / Has materials
    notes_count: number // 筆記數量 / Notes count
    bookmarked: boolean // 是否收藏 / Bookmarked
  }>
  quizzes: Array<{
    id: number
    title: string
    completed: boolean
    attempts: number // 嘗試次數 / Attempts count
    max_attempts: number // 最大嘗試次數 / Max attempts
    best_score: number // 最佳分數 / Best score
    latest_score: number // 最新分數 / Latest score
    passing_score: number // 及格分數 / Passing score
    time_limit: number // 時間限制 / Time limit
    question_count: number // 問題數量 / Question count
    retake_allowed: boolean // 允許重考 / Retake allowed
  }>
  instructor: {
    name: string
    avatar: string
    bio: string // 個人簡介 / Bio
    expertise: string // 專業領域 / Expertise
    rating: number // 評分 / Rating
    total_students: number // 學生總數 / Total students
  }
  enrollment_date: string // 註冊日期 / Enrollment date
  estimated_completion: string // 預計完成時間 / Estimated completion
  study_time: number // 學習時間 / Study time
  ai_insights: Array<{
    type: string
    message: BilingualText
    priority: number
  }>
}

interface DashboardData {
  user_profile: {
    name: string
    avatar: string
    role: string
    preferences: {
      language: string
      timezone: string
      notifications: boolean
    }
  }
  courses: LearnDashCourse[]
  progress: {
    total_courses: number
    completed_courses: number
    in_progress_courses: number
    total_lessons: number
    completed_lessons: number
    average_score: number
    total_study_time: number
    certificates_earned: number
    learning_streak: number // 學習連續天數 / Learning streak
    weekly_progress: Array<{
      date: string
      day_name: string
      activities: number
      lessons_completed: number
      study_time: number
    }>
    monthly_progress: {
      total_activities: number
      active_days: number
      consistency_rate: number // 一致性率 / Consistency rate
    }
  }
  statistics: {
    weekly_study_time: number
    streak_days: number
    ai_score: number
    knowledge_retention: number
    learning_velocity: number // 學習速度 / Learning velocity
  }
  recent_activity: Array<{
    type: string
    title: string
    date: string
    course_title: string
    score?: number
    duration?: number
  }>
  upcoming_deadlines: Array<{
    type: string
    title: string
    deadline: string
    days_remaining: number
    priority: number // 優先級 / Priority
    completion_percentage?: number
  }>
  ai_recommendations: Array<{
    type: string
    title: BilingualText
    description: BilingualText
    action_url: string
    priority: number
  }>
  language: string // 當前語言 / Current language
  translations: Record<string, string> // 翻譯 / Translations
}

// 全局配置接口 / Global config interface
declare global {
  interface Window {
    nexlearnConfig: {
      apiUrl: string
      nonce: string
      userId: number
      pluginUrl: string
      learndashData: any
      userCapabilities: {
        can_create_flashcards: boolean
        can_view_analytics: boolean
        is_instructor: boolean
        is_admin: boolean
      }
      settings: {
        ai_enabled: boolean
        flashcards_enabled: boolean
        analytics_enabled: boolean
        theme_mode: string
        language: string
      }
      translations: Record<string, string>
    }
  }
}

export function BilingualWordPressDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [currentLanguage, setCurrentLanguage] = useState<string>("en")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // 初始化語言設置 / Initialize language settings
    const savedLanguage = localStorage.getItem("nexlearn-language") || window.nexlearnConfig?.settings?.language || "en"
    setCurrentLanguage(savedLanguage)
    fetchDashboardData(savedLanguage)
  }, [])

  // 獲取儀表板數據 / Fetch dashboard data
  const fetchDashboardData = async (language: string = currentLanguage) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`${window.nexlearnConfig.apiUrl}dashboard?lang=${language}`, {
        headers: {
          "X-WP-Nonce": window.nexlearnConfig.nonce,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setDashboardData(data)
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      setError(error instanceof Error ? error.message : "Unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  // 切換語言 / Switch language
  const switchLanguage = async (newLanguage: string) => {
    setCurrentLanguage(newLanguage)
    localStorage.setItem("nexlearn-language", newLanguage)

    // 更新用戶偏好 / Update user preferences
    try {
      await fetch(`${window.nexlearnConfig.apiUrl}update-preferences`, {
        method: "POST",
        headers: {
          "X-WP-Nonce": window.nexlearnConfig.nonce,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          language: newLanguage,
        }),
      })
    } catch (error) {
      console.error("Error updating language preference:", error)
    }

    // 重新獲取數據 / Refetch data
    await fetchDashboardData(newLanguage)
  }

  // 生成閃卡 / Generate flashcards
  const generateFlashcards = async (courseId: number) => {
    if (!window.nexlearnConfig.userCapabilities.can_create_flashcards) {
      alert(getTranslation("no_permission_flashcards"))
      return
    }

    try {
      const response = await fetch(`${window.nexlearnConfig.apiUrl}flashcards`, {
        method: "POST",
        headers: {
          "X-WP-Nonce": window.nexlearnConfig.nonce,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          course_id: courseId,
          action: "generate_from_course",
          language: currentLanguage,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        alert(getTranslation("flashcards_generated_success").replace("%d", result.count))
        fetchDashboardData()
      } else {
        throw new Error("Failed to generate flashcards")
      }
    } catch (error) {
      console.error("Error generating flashcards:", error)
      alert(getTranslation("flashcards_generated_error"))
    }
  }

  // 獲取AI洞察 / Get AI insights
  const getAIInsights = async () => {
    try {
      const response = await fetch(`${window.nexlearnConfig.apiUrl}ai-insights?lang=${currentLanguage}`, {
        headers: {
          "X-WP-Nonce": window.nexlearnConfig.nonce,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const insights = await response.json()
        // 處理AI洞察顯示 / Handle AI insights display
        console.log("AI Insights:", insights)
        // 這裡可以添加模態框或其他UI來顯示洞察 / Add modal or other UI to display insights
      }
    } catch (error) {
      console.error("Error fetching AI insights:", error)
    }
  }

  // 獲取翻譯文本 / Get translation text
  const getTranslation = (key: string): string => {
    if (dashboardData?.translations?.[key]) {
      return dashboardData.translations[key]
    }
    return window.nexlearnConfig?.translations?.[key] || key
  }

  // 格式化日期 / Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }

    const locale = currentLanguage === "zh" ? "zh-CN" : "en-US"
    return date.toLocaleDateString(locale, options)
  }

  // 格式化持續時間 / Format duration
  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return currentLanguage === "zh" ? `${minutes}分鐘` : `${minutes} min`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    if (currentLanguage === "zh") {
      return remainingMinutes > 0 ? `${hours}小時${remainingMinutes}分鐘` : `${hours}小時`
    }
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
  }

  // 獲取狀態顏色 / Get status color
  const getStatusColor = (status: string): string => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      case "not_started":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // 獲取優先級顏色 / Get priority color
  const getPriorityColor = (priority: number): string => {
    if (priority >= 4) return "bg-red-100 text-red-800 border-red-200"
    if (priority >= 3) return "bg-orange-100 text-orange-800 border-orange-200"
    if (priority >= 2) return "bg-yellow-100 text-yellow-800 border-yellow-200"
    return "bg-green-100 text-green-800 border-green-200"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">{getTranslation("loading")}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <div className="max-w-md mx-auto">
          <div className="h-16 w-16 text-red-400 mx-auto mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">{getTranslation("error_loading")}</h3>
          <p className="text-slate-600 mb-4">{error}</p>
          <Button onClick={() => fetchDashboardData()}>{getTranslation("try_again")}</Button>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="text-center p-8">
        <div className="max-w-md mx-auto">
          <BookOpen className="h-16 w-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">{getTranslation("no_data_title")}</h3>
          <p className="text-slate-600 mb-4">{getTranslation("no_data_message")}</p>
          <Button onClick={() => fetchDashboardData()}>{getTranslation("try_again")}</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* 頭部區域 / Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img
            src={dashboardData.user_profile.avatar || "/placeholder.svg"}
            alt={dashboardData.user_profile.name}
            className="h-12 w-12 rounded-full"
          />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {getTranslation("welcome_back")}, {dashboardData.user_profile.name}! 👋
            </h1>
            <p className="text-slate-600">
              {currentLanguage === "zh" ? "繼續您的學習之旅" : "Continue your learning journey with LearnDash"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* 語言切換器 / Language switcher */}
          <Select value={currentLanguage} onValueChange={switchLanguage}>
            <SelectTrigger className="w-32">
              <Globe className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="zh">中文</SelectItem>
            </SelectContent>
          </Select>

          {/* 學習連續天數 / Study streak */}
          <div className="text-right">
            <p className="text-sm text-slate-500">{getTranslation("learning_streak")}</p>
            <div className="flex items-center gap-1">
              <span className="text-2xl font-bold text-orange-600">{dashboardData.statistics.streak_days}</span>
              <span className="text-sm text-slate-600">{currentLanguage === "zh" ? "天" : "days"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 統計卡片 / Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{getTranslation("active_courses")}</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.progress.total_courses}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardData.progress.completed_courses} {getTranslation("completed")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{getTranslation("study_time")}</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(dashboardData.progress.total_study_time)}</div>
            <p className="text-xs text-muted-foreground">
              {currentLanguage === "zh" ? "總學習時間" : "Total learning time"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{currentLanguage === "zh" ? "AI 分數" : "AI Score"}</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.statistics.ai_score}%</div>
            <p className="text-xs text-muted-foreground">
              {currentLanguage === "zh" ? "學習表現" : "Learning performance"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{getTranslation("certificates_earned")}</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.progress.certificates_earned}</div>
            <p className="text-xs text-muted-foreground">
              {currentLanguage === "zh" ? "獲得證書" : "Earned certificates"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 主要內容標籤 / Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">{getTranslation("overview")}</TabsTrigger>
          <TabsTrigger value="courses">{getTranslation("my_courses")}</TabsTrigger>
          <TabsTrigger value="analytics">{getTranslation("analytics")}</TabsTrigger>
          <TabsTrigger value="ai-insights">{getTranslation("ai_insights")}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* 最近活動 / Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  {getTranslation("recent_activity")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {dashboardData.recent_activity.slice(0, 5).map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-slate-50">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      {activity.type === "lesson_completed" && <BookOpen className="h-4 w-4 text-blue-600" />}
                      {activity.type === "quiz_completed" && <Target className="h-4 w-4 text-green-600" />}
                      {activity.type === "course_completed" && <Award className="h-4 w-4 text-purple-600" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-slate-600">{activity.course_title}</p>
                      {activity.score && (
                        <p className="text-xs text-green-600">
                          {currentLanguage === "zh" ? "分數" : "Score"}: {activity.score}%
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-500">{formatDate(activity.date)}</span>
                      {activity.duration && (
                        <p className="text-xs text-slate-400">{formatDuration(activity.duration)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* 即將到來的截止日期 / Upcoming Deadlines */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {getTranslation("upcoming_deadlines")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {dashboardData.upcoming_deadlines.length > 0 ? (
                  dashboardData.upcoming_deadlines.slice(0, 5).map((deadline, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 rounded-lg border ${getPriorityColor(deadline.priority)}`}
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium">{deadline.title}</p>
                        <p className="text-xs opacity-75">
                          {currentLanguage === "zh" ? "類型" : "Type"}: {deadline.type}
                        </p>
                        {deadline.completion_percentage !== undefined && (
                          <div className="mt-1">
                            <Progress value={deadline.completion_percentage} className="h-1" />
                            <p className="text-xs opacity-75 mt-1">
                              {deadline.completion_percentage}% {getTranslation("completed")}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="text-right ml-3">
                        <Badge variant={deadline.days_remaining <= 3 ? "destructive" : "secondary"}>
                          {deadline.days_remaining} {currentLanguage === "zh" ? "天" : "days"}
                        </Badge>
                        <p className="text-xs opacity-75 mt-1">{formatDate(deadline.deadline)}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-600 text-center py-4">
                    {currentLanguage === "zh" ? "沒有即將到來的截止日期" : "No upcoming deadlines"}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 週進度圖表 / Weekly Progress Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                {currentLanguage === "zh" ? "本週學習進度" : "Weekly Learning Progress"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {dashboardData.progress.weekly_progress.map((day, index) => (
                  <div key={index} className="text-center">
                    <div className="text-xs text-slate-500 mb-1">
                      {currentLanguage === "zh" ? day.day_name.substring(0, 1) : day.day_name.substring(0, 3)}
                    </div>
                    <div
                      className="bg-blue-100 rounded-lg p-2 relative"
                      style={{ height: `${Math.max(20, (day.activities / 10) * 60)}px` }}
                    >
                      <div
                        className="absolute inset-0 bg-blue-500 rounded-lg opacity-75"
                        style={{ height: `${(day.activities / 10) * 100}%`, bottom: 0 }}
                      ></div>
                      <div className="relative z-10 text-xs font-medium text-blue-900">{day.activities}</div>
                    </div>
                    <div className="text-xs text-slate-400 mt-1">{formatDuration(day.study_time)}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI 推薦 / AI Recommendations */}
          {window.nexlearnConfig.settings.ai_enabled && dashboardData.ai_recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  {getTranslation("ai_recommendations")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {dashboardData.ai_recommendations.map((recommendation, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-4 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200"
                  >
                    <Target className="h-5 w-5 text-purple-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-purple-900">
                        {recommendation.title[currentLanguage as keyof BilingualText] || recommendation.title.en}
                      </p>
                      <p className="text-sm text-purple-700">
                        {recommendation.description[currentLanguage as keyof BilingualText] ||
                          recommendation.description.en}
                      </p>
                    </div>
                    <Button size="sm" variant="outline" asChild>
                      <a href={recommendation.action_url}>{currentLanguage === "zh" ? "採取行動" : "Take Action"}</a>
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="courses" className="space-y-4">
          <div className="grid gap-4">
            {dashboardData.courses.map((course) => (
              <Card key={course.id}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {course.featured_image && (
                      <img
                        src={course.featured_image || "/placeholder.svg"}
                        alt={course.title}
                        className="h-20 w-20 rounded-lg object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">{course.title}</h3>
                          <p className="text-sm text-slate-600 mt-1">{course.description}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge className={getStatusColor(course.progress.status)}>
                            {currentLanguage === "zh"
                              ? course.progress.status === "completed"
                                ? "已完成"
                                : course.progress.status === "in_progress"
                                  ? "進行中"
                                  : "未開始"
                              : course.progress.status.replace("_", " ")}
                          </Badge>
                          {window.nexlearnConfig.settings.flashcards_enabled && (
                            <Button size="sm" variant="outline" onClick={() => generateFlashcards(course.id)}>
                              <Zap className="h-3 w-3 mr-1" />
                              {currentLanguage === "zh" ? "生成卡片" : "Generate Cards"}
                            </Button>
                          )}
                          <Button size="sm" asChild>
                            <a href={course.permalink}>{currentLanguage === "zh" ? "繼續" : "Continue"}</a>
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-600">
                        <div>
                          <span className="font-medium">{currentLanguage === "zh" ? "講師" : "Instructor"}:</span>
                          <div className="flex items-center gap-2 mt-1">
                            <img
                              src={course.instructor.avatar || "/placeholder.svg"}
                              alt={course.instructor.name}
                              className="h-6 w-6 rounded-full"
                            />
                            <span>{course.instructor.name}</span>
                          </div>
                        </div>
                        <div>
                          <span className="font-medium">{currentLanguage === "zh" ? "課程" : "Lessons"}:</span>
                          <p>
                            {course.lessons.length} {currentLanguage === "zh" ? "課" : "lessons"}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium">{currentLanguage === "zh" ? "測驗" : "Quizzes"}:</span>
                          <p>
                            {course.quizzes.length} {currentLanguage === "zh" ? "個" : "quizzes"}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium">{currentLanguage === "zh" ? "學習時間" : "Study Time"}:</span>
                          <p>{formatDuration(course.study_time)}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>
                            {currentLanguage === "zh" ? "進度" : "Progress"}: {course.progress.percentage}%
                          </span>
                          <span>
                            {course.progress.completed_steps} / {course.progress.total_steps}{" "}
                            {getTranslation("completed")}
                          </span>
                        </div>
                        <Progress value={course.progress.percentage} className="h-2" />
                        {course.progress.last_activity && (
                          <p className="text-xs text-slate-500">
                            {currentLanguage === "zh" ? "最後活動" : "Last activity"}:{" "}
                            {formatDate(course.progress.last_activity)}
                          </p>
                        )}
                      </div>

                      {/* AI 洞察 / AI Insights */}
                      {course.ai_insights && course.ai_insights.length > 0 && (
                        <div className="bg-blue-50 rounded-lg p-3">
                          <h4 className="text-sm font-medium text-blue-900 mb-2">
                            {currentLanguage === "zh" ? "AI 洞察" : "AI Insights"}
                          </h4>
                          {course.ai_insights.slice(0, 2).map((insight, index) => (
                            <p key={index} className="text-sm text-blue-700">
                              • {insight.message[currentLanguage as keyof BilingualText] || insight.message.en}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          {window.nexlearnConfig.userCapabilities.can_view_analytics ? (
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    {currentLanguage === "zh" ? "學習進度" : "Learning Progress"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">{currentLanguage === "zh" ? "已完成課程" : "Lessons Completed"}</span>
                      <span className="font-semibold">
                        {dashboardData.progress.completed_lessons} / {dashboardData.progress.total_lessons}
                      </span>
                    </div>
                    <Progress
                      value={(dashboardData.progress.completed_lessons / dashboardData.progress.total_lessons) * 100}
                      className="h-2"
                    />

                    <div className="flex justify-between items-center">
                      <span className="text-sm">
                        {currentLanguage === "zh" ? "平均測驗分數" : "Average Quiz Score"}
                      </span>
                      <span className="font-semibold">{dashboardData.progress.average_score}%</span>
                    </div>
                    <Progress value={dashboardData.progress.average_score} className="h-2" />

                    <div className="flex justify-between items-center">
                      <span className="text-sm">{currentLanguage === "zh" ? "知識保持率" : "Knowledge Retention"}</span>
                      <span className="font-semibold">{dashboardData.statistics.knowledge_retention}%</span>
                    </div>
                    <Progress value={dashboardData.statistics.knowledge_retention} className="h-2" />

                    <div className="flex justify-between items-center">
                      <span className="text-sm">
                        {currentLanguage === "zh" ? "學習一致性" : "Learning Consistency"}
                      </span>
                      <span className="font-semibold">{dashboardData.progress.monthly_progress.consistency_rate}%</span>
                    </div>
                    <Progress value={dashboardData.progress.monthly_progress.consistency_rate} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    {currentLanguage === "zh" ? "學習統計" : "Study Statistics"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {formatDuration(dashboardData.statistics.weekly_study_time)}
                      </div>
                      <p className="text-sm text-blue-700">
                        {currentLanguage === "zh" ? "本週學習時間" : "This week's study time"}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-lg font-bold text-green-600">{dashboardData.statistics.streak_days}</div>
                        <p className="text-xs text-green-700">{currentLanguage === "zh" ? "連續天數" : "Day streak"}</p>
                      </div>

                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-lg font-bold text-purple-600">{dashboardData.statistics.ai_score}%</div>
                        <p className="text-xs text-purple-700">{currentLanguage === "zh" ? "AI 分數" : "AI Score"}</p>
                      </div>

                      <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <div className="text-lg font-bold text-orange-600">
                          {dashboardData.progress.monthly_progress.active_days}
                        </div>
                        <p className="text-xs text-orange-700">
                          {currentLanguage === "zh" ? "活躍天數" : "Active days"}
                        </p>
                      </div>

                      <div className="text-center p-3 bg-indigo-50 rounded-lg">
                        <div className="text-lg font-bold text-indigo-600">
                          {dashboardData.statistics.learning_velocity}x
                        </div>
                        <p className="text-xs text-indigo-700">
                          {currentLanguage === "zh" ? "學習速度" : "Learning velocity"}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">
                        {currentLanguage === "zh" ? "月度總結" : "Monthly Summary"}
                      </h4>
                      <div className="text-sm text-slate-600 space-y-1">
                        <div className="flex justify-between">
                          <span>{currentLanguage === "zh" ? "總活動數" : "Total Activities"}:</span>
                          <span>{dashboardData.progress.monthly_progress.total_activities}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{currentLanguage === "zh" ? "活躍天數" : "Active Days"}:</span>
                          <span>{dashboardData.progress.monthly_progress.active_days}/30</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{currentLanguage === "zh" ? "一致性率" : "Consistency Rate"}:</span>
                          <span>{dashboardData.progress.monthly_progress.consistency_rate}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <BarChart3 className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {currentLanguage === "zh" ? "分析不可用" : "Analytics Not Available"}
                </h3>
                <p className="text-slate-600">
                  {currentLanguage === "zh"
                    ? "您沒有查看詳細分析的權限。"
                    : "You don't have permission to view detailed analytics."}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="ai-insights" className="space-y-4">
          {window.nexlearnConfig.settings.ai_enabled ? (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    {currentLanguage === "zh" ? "AI 驅動的學習洞察" : "AI-Powered Learning Insights"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Button onClick={getAIInsights} className="w-full">
                      <Brain className="h-4 w-4 mr-2" />
                      {currentLanguage === "zh" ? "生成 AI 洞察" : "Generate AI Insights"}
                    </Button>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
                        <h4 className="font-semibold text-blue-900 mb-2">
                          {currentLanguage === "zh" ? "學習模式分析" : "Learning Pattern Analysis"}
                        </h4>
                        <p className="text-sm text-blue-700">
                          {currentLanguage === "zh"
                            ? "AI 分析您的學習模式和最佳學習時間。"
                            : "AI analysis of your learning patterns and optimal study times."}
                        </p>
                      </div>

                      <div className="p-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
                        <h4 className="font-semibold text-green-900 mb-2">
                          {currentLanguage === "zh" ? "知識差距檢測" : "Knowledge Gap Detection"}
                        </h4>
                        <p className="text-sm text-green-700">
                          {currentLanguage === "zh"
                            ? "根據您的表現識別需要更多關注的領域。"
                            : "Identify areas that need more focus based on your performance."}
                        </p>
                      </div>

                      <div className="p-4 rounded-lg bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200">
                        <h4 className="font-semibold text-purple-900 mb-2">
                          {currentLanguage === "zh" ? "個性化推薦" : "Personalized Recommendations"}
                        </h4>
                        <p className="text-sm text-purple-700">
                          {currentLanguage === "zh"
                            ? "獲得 AI 驅動的下一步學習建議。"
                            : "Get AI-powered suggestions for your next learning steps."}
                        </p>
                      </div>

                      <div className="p-4 rounded-lg bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200">
                        <h4 className="font-semibold text-orange-900 mb-2">
                          {currentLanguage === "zh" ? "表現預測" : "Performance Prediction"}
                        </h4>
                        <p className="text-sm text-orange-700">
                          {currentLanguage === "zh"
                            ? "預測您在即將到來的測驗和課程中的成功率。"
                            : "Predict your success rate in upcoming quizzes and courses."}
                        </p>
                      </div>
                    </div>

                    {/* 智能學習建議 / Smart Learning Suggestions */}
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-200">
                      <h4 className="font-semibold text-indigo-900 mb-3">
                        {currentLanguage === "zh" ? "智能學習建議" : "Smart Learning Suggestions"}
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-start gap-3">
                          <div className="h-2 w-2 bg-indigo-500 rounded-full mt-2"></div>
                          <p className="text-sm text-indigo-800">
                            {currentLanguage === "zh"
                              ? "基於您的學習模式，建議在上午 9-11 點進行複雜概念學習。"
                              : "Based on your learning patterns, complex concepts are best studied between 9-11 AM."}
                          </p>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="h-2 w-2 bg-indigo-500 rounded-full mt-2"></div>
                          <p className="text-sm text-indigo-800">
                            {currentLanguage === "zh"
                              ? "您在視頻課程中的參與度比文本材料高 23%。"
                              : "Your engagement with video lessons is 23% higher than text materials."}
                          </p>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="h-2 w-2 bg-indigo-500 rounded-full mt-2"></div>
                          <p className="text-sm text-indigo-800">
                            {currentLanguage === "zh"
                              ? "建議每 25 分鐘休息 5 分鐘以提高學習效率。"
                              : "Consider taking 5-minute breaks every 25 minutes for optimal learning efficiency."}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* 學習成就預測 / Learning Achievement Predictions */}
                    <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-lg p-4 border border-green-200">
                      <h4 className="font-semibold text-green-900 mb-3">
                        {currentLanguage === "zh" ? "學習成就預測" : "Learning Achievement Predictions"}
                      </h4>
                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="bg-white rounded-lg p-3 border border-green-100">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-green-800">
                              {currentLanguage === "zh" ? "下次測驗預期分數" : "Next Quiz Expected Score"}
                            </span>
                            <span className="text-lg font-bold text-green-600">87%</span>
                          </div>
                          <Progress value={87} className="h-2" />
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-green-100">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-green-800">
                              {currentLanguage === "zh" ? "課程完成概率" : "Course Completion Probability"}
                            </span>
                            <span className="text-lg font-bold text-green-600">94%</span>
                          </div>
                          <Progress value={94} className="h-2" />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Brain className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {currentLanguage === "zh" ? "AI 功能已禁用" : "AI Features Disabled"}
                </h3>
                <p className="text-slate-600 mb-4">
                  {currentLanguage === "zh"
                    ? "AI 洞察功能目前已禁用。請聯繫您的管理員以啟用 AI 功能。"
                    : "AI insights are currently disabled. Contact your administrator to enable AI features."}
                </p>
                {window.nexlearnConfig.userCapabilities.is_admin && (
                  <Button variant="outline">{currentLanguage === "zh" ? "啟用 AI 功能" : "Enable AI Features"}</Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default BilingualWordPressDashboard
