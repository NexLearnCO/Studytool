"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Brain, Clock, Target, TrendingUp, Zap, Award, Calendar, BarChart3 } from "lucide-react"

// TypeScript interfaces for WordPress/LearnDash data
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
  }
  lessons: Array<{
    id: number
    title: string
    completed: boolean
    estimated_duration: string
  }>
  quizzes: Array<{
    id: number
    title: string
    completed: boolean
    best_score: number
    passing_score: number
  }>
  instructor: {
    name: string
    avatar: string
  }
  enrollment_date: string
  estimated_completion: string
}

interface DashboardData {
  user_profile: {
    name: string
    avatar: string
    role: string
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
  }
  statistics: {
    weekly_study_time: number
    streak_days: number
    ai_score: number
    knowledge_retention: number
  }
  recent_activity: Array<{
    type: string
    title: string
    date: string
    course_title: string
  }>
  upcoming_deadlines: Array<{
    type: string
    title: string
    deadline: string
    days_remaining: number
  }>
  ai_recommendations: Array<{
    type: string
    title: string
    description: string
    action_url: string
  }>
}

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
    }
  }
}

export function WordPressDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch(`${window.nexlearnConfig.apiUrl}dashboard`, {
        headers: {
          "X-WP-Nonce": window.nexlearnConfig.nonce,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setDashboardData(data)
      } else {
        console.error("Failed to fetch dashboard data:", response.statusText)
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const generateFlashcards = async (courseId: number) => {
    if (!window.nexlearnConfig.userCapabilities.can_create_flashcards) {
      alert("You do not have permission to create flashcards.")
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
        }),
      })

      if (response.ok) {
        const result = await response.json()
        alert(`Successfully generated ${result.count} flashcards!`)
        // Refresh dashboard data
        fetchDashboardData()
      }
    } catch (error) {
      console.error("Error generating flashcards:", error)
      alert("Failed to generate flashcards. Please try again.")
    }
  }

  const getAIInsights = async () => {
    try {
      const response = await fetch(`${window.nexlearnConfig.apiUrl}ai-insights`, {
        headers: {
          "X-WP-Nonce": window.nexlearnConfig.nonce,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const insights = await response.json()
        // Handle AI insights display
        console.log("AI Insights:", insights)
      }
    } catch (error) {
      console.error("Error fetching AI insights:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading your learning dashboard...</p>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="text-center p-8">
        <div className="max-w-md mx-auto">
          <BookOpen className="h-16 w-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Unable to Load Dashboard</h3>
          <p className="text-slate-600 mb-4">
            We couldn't load your learning data. Please make sure you're enrolled in at least one course.
          </p>
          <Button onClick={fetchDashboardData}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img
            src={dashboardData.user_profile.avatar || "/placeholder.svg"}
            alt={dashboardData.user_profile.name}
            className="h-12 w-12 rounded-full"
          />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Welcome back, {dashboardData.user_profile.name}! 👋</h1>
            <p className="text-slate-600">Continue your learning journey with LearnDash</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-500">Study Streak</p>
          <div className="flex items-center gap-1">
            <span className="text-2xl font-bold text-orange-600">{dashboardData.statistics.streak_days}</span>
            <span className="text-sm text-slate-600">days</span>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.progress.total_courses}</div>
            <p className="text-xs text-muted-foreground">{dashboardData.progress.completed_courses} completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(dashboardData.progress.total_study_time / 60)}h</div>
            <p className="text-xs text-muted-foreground">Total learning time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Score</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.statistics.ai_score}%</div>
            <p className="text-xs text-muted-foreground">Learning performance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Certificates</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.progress.certificates_earned}</div>
            <p className="text-xs text-muted-foreground">Earned certificates</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="courses">My Courses</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Activity
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
                    </div>
                    <span className="text-xs text-slate-500">{activity.date}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Upcoming Deadlines */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Upcoming Deadlines
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {dashboardData.upcoming_deadlines.length > 0 ? (
                  dashboardData.upcoming_deadlines.slice(0, 5).map((deadline, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 rounded-lg bg-orange-50 border border-orange-200"
                    >
                      <div>
                        <p className="text-sm font-medium">{deadline.title}</p>
                        <p className="text-xs text-slate-600">{deadline.type}</p>
                      </div>
                      <Badge variant={deadline.days_remaining <= 3 ? "destructive" : "secondary"}>
                        {deadline.days_remaining} days
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-600 text-center py-4">No upcoming deadlines</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* AI Recommendations */}
          {window.nexlearnConfig.settings.ai_enabled && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  AI Recommendations
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
                      <p className="font-medium text-purple-900">{recommendation.title}</p>
                      <p className="text-sm text-purple-700">{recommendation.description}</p>
                    </div>
                    <Button size="sm" variant="outline" asChild>
                      <a href={recommendation.action_url}>Take Action</a>
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
                        className="h-16 w-16 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">{course.title}</h3>
                        <div className="flex items-center gap-2">
                          <Badge variant={course.progress.status === "completed" ? "default" : "secondary"}>
                            {course.progress.status.replace("_", " ")}
                          </Badge>
                          {window.nexlearnConfig.settings.flashcards_enabled && (
                            <Button size="sm" variant="outline" onClick={() => generateFlashcards(course.id)}>
                              <Zap className="h-3 w-3 mr-1" />
                              Generate Cards
                            </Button>
                          )}
                          <Button size="sm" asChild>
                            <a href={course.permalink}>Continue</a>
                          </Button>
                        </div>
                      </div>

                      <p className="text-sm text-slate-600">{course.description}</p>

                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <span>Instructor: {course.instructor.name}</span>
                        <span>•</span>
                        <span>{course.lessons.length} lessons</span>
                        <span>•</span>
                        <span>{course.quizzes.length} quizzes</span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress: {course.progress.percentage}%</span>
                          <span>
                            {course.progress.completed_steps} / {course.progress.total_steps} completed
                          </span>
                        </div>
                        <Progress value={course.progress.percentage} className="h-2" />
                      </div>
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
                    Learning Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Lessons Completed</span>
                      <span className="font-semibold">
                        {dashboardData.progress.completed_lessons} / {dashboardData.progress.total_lessons}
                      </span>
                    </div>
                    <Progress
                      value={(dashboardData.progress.completed_lessons / dashboardData.progress.total_lessons) * 100}
                      className="h-2"
                    />

                    <div className="flex justify-between items-center">
                      <span className="text-sm">Average Quiz Score</span>
                      <span className="font-semibold">{dashboardData.progress.average_score}%</span>
                    </div>
                    <Progress value={dashboardData.progress.average_score} className="h-2" />

                    <div className="flex justify-between items-center">
                      <span className="text-sm">Knowledge Retention</span>
                      <span className="font-semibold">{dashboardData.statistics.knowledge_retention}%</span>
                    </div>
                    <Progress value={dashboardData.statistics.knowledge_retention} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Study Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {dashboardData.statistics.weekly_study_time}h
                      </div>
                      <p className="text-sm text-blue-700">This week's study time</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-lg font-bold text-green-600">{dashboardData.statistics.streak_days}</div>
                        <p className="text-xs text-green-700">Day streak</p>
                      </div>

                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-lg font-bold text-purple-600">{dashboardData.statistics.ai_score}%</div>
                        <p className="text-xs text-purple-700">AI Score</p>
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
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Analytics Not Available</h3>
                <p className="text-slate-600">You don't have permission to view detailed analytics.</p>
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
                    AI-Powered Learning Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Button onClick={getAIInsights} className="w-full">
                      <Brain className="h-4 w-4 mr-2" />
                      Generate AI Insights
                    </Button>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
                        <h4 className="font-semibold text-blue-900 mb-2">Learning Pattern Analysis</h4>
                        <p className="text-sm text-blue-700">
                          AI analysis of your learning patterns and optimal study times.
                        </p>
                      </div>

                      <div className="p-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
                        <h4 className="font-semibold text-green-900 mb-2">Knowledge Gap Detection</h4>
                        <p className="text-sm text-green-700">
                          Identify areas that need more focus based on your performance.
                        </p>
                      </div>

                      <div className="p-4 rounded-lg bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200">
                        <h4 className="font-semibold text-purple-900 mb-2">Personalized Recommendations</h4>
                        <p className="text-sm text-purple-700">
                          Get AI-powered suggestions for your next learning steps.
                        </p>
                      </div>

                      <div className="p-4 rounded-lg bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200">
                        <h4 className="font-semibold text-orange-900 mb-2">Performance Prediction</h4>
                        <p className="text-sm text-orange-700">
                          Predict your success rate in upcoming quizzes and courses.
                        </p>
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
                <h3 className="text-lg font-semibold text-slate-900 mb-2">AI Features Disabled</h3>
                <p className="text-slate-600 mb-4">
                  AI insights are currently disabled. Contact your administrator to enable AI features.
                </p>
                {window.nexlearnConfig.userCapabilities.is_admin && (
                  <Button variant="outline">Enable AI Features</Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default WordPressDashboard
