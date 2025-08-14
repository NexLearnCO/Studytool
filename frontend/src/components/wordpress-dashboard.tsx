"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookOpen, Brain, Clock, GraduationCap, Target, TrendingUp, Zap, Award } from "lucide-react"

// WordPress/LearnDash 數據接口
interface LearnDashCourse {
  course_id: number
  title: string
  progress: {
    percentage: number
    completed: number
    total: number
  }
  completed: boolean
  lessons_completed: number
  total_lessons: number
}

interface WordPressDashboardData {
  courses: LearnDashCourse[]
  stats: {
    total_courses: number
    completed_courses: number
    study_time: number
    streak_days: number
    ai_score: number
  }
  recent_activity: any[]
  upcoming_deadlines: any[]
}

declare global {
  interface Window {
    nexlearnData: {
      apiUrl: string
      nonce: string
      userId: number
      userCourses: number[]
      learningProgress: Record<number, any>
    }
  }
}

export function WordPressDashboard() {
  const [dashboardData, setDashboardData] = useState<WordPressDashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch(`${window.nexlearnData.apiUrl}dashboard-data`, {
        headers: {
          "X-WP-Nonce": window.nexlearnData.nonce,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setDashboardData(data)
      }
    } catch (error) {
      console.error("獲取儀表板數據失敗:", error)
    } finally {
      setLoading(false)
    }
  }

  const generateFlashcards = async (courseId: number) => {
    try {
      const response = await fetch(`${window.nexlearnData.apiUrl}flashcards`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-WP-Nonce": window.nexlearnData.nonce,
        },
        body: JSON.stringify({
          course_id: courseId,
          action: "generate",
        }),
      })

      if (response.ok) {
        const result = await response.json()
        alert(`成功生成 ${result.count} 張記憶卡片！`)
      }
    } catch (error) {
      console.error("生成記憶卡片失敗:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-slate-600">載入中...</p>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="text-center p-8">
        <p className="text-slate-600">無法載入儀表板數據</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* 歡迎區域 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">學習儀表板 👋</h2>
          <p className="text-slate-600">繼續你的 LearnDash 學習之旅</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-500">學習連續天數</p>
          <div className="flex items-center gap-1">
            <span className="text-2xl font-bold text-orange-600">{dashboardData.stats.streak_days}</span>
            <span className="text-sm text-slate-600">天</span>
          </div>
        </div>
      </div>

      {/* 統計卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">進行中課程</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.stats.total_courses}</div>
            <p className="text-xs text-muted-foreground">已完成 {dashboardData.stats.completed_courses} 門</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">學習時間</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(dashboardData.stats.study_time / 60)}h</div>
            <p className="text-xs text-muted-foreground">總學習時間</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI 評分</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.stats.ai_score}%</div>
            <p className="text-xs text-muted-foreground">學習表現</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">連續天數</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.stats.streak_days}</div>
            <p className="text-xs text-muted-foreground">學習連續</p>
          </CardContent>
        </Card>
      </div>

      {/* 課程進度 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            課程進度
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {dashboardData.courses.map((course) => (
            <div key={course.course_id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">{course.title}</p>
                    <p className="text-sm text-slate-600">
                      {course.lessons_completed} / {course.total_lessons} 課程
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={course.completed ? "default" : "secondary"}>
                    {course.completed ? "已完成" : "進行中"}
                  </Badge>
                  <Button size="sm" variant="outline" onClick={() => generateFlashcards(course.course_id)}>
                    <Zap className="h-3 w-3 mr-1" />
                    生成卡片
                  </Button>
                </div>
              </div>
              <Progress value={course.progress.percentage} className="h-2" />
              <div className="flex justify-between text-sm text-slate-600">
                <span>{course.progress.percentage}% 完成</span>
                <span>
                  {course.progress.completed} / {course.progress.total} 完成
                </span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* AI 洞察 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI 學習洞察
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3 p-4 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200">
            <Target className="h-5 w-5 text-purple-600 mt-0.5" />
            <div>
              <p className="font-medium text-purple-900">學習建議</p>
              <p className="text-sm text-purple-700">
                基於你的 LearnDash 學習數據，建議每天保持 30 分鐘的學習時間以維持進度。
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
            <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-medium text-green-900">進步分析</p>
              <p className="text-sm text-green-700">你的學習速度比平均快 15%，繼續保持這個節奏！</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
