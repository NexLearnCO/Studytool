"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Bell,
  BookOpen,
  Brain,
  Calendar,
  CheckCircle,
  Clock,
  GraduationCap,
  Star,
  Target,
  TrendingUp,
  Zap,
  Award,
  PlayCircle,
  FileText,
  BarChart3,
  Lightbulb,
  Timer,
  Trophy,
} from "lucide-react"
import Link from "next/link"

export default function Dashboard() {
  return (
    <div className="flex flex-col">
      {/* Header */}
      <header className="flex h-16 items-center gap-4 border-b border-slate-200 bg-white px-6">
        <SidebarTrigger />
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-slate-900">儀表板</h1>
        </div>
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>
        <Button asChild>
          <Link href="/ai-tutor">
            <Brain className="mr-2 h-4 w-4" />
            詢問AI導師
          </Link>
        </Button>
      </header>

      {/* Main Content */}
      <div className="flex-1 space-y-6 p-6">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">歡迎回來，小明！👋</h2>
            <p className="text-slate-600">準備好繼續你的學習之旅了嗎？</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-500">目前學習連續天數</p>
            <div className="flex items-center gap-1">
              <span className="text-2xl font-bold text-orange-600">7</span>
              <span className="text-sm text-slate-600">天</span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">進行中課程</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">比上個月增加1門</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">已完成</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">本週課程</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">學習時間</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">42小時</div>
              <p className="text-xs text-muted-foreground">本月</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI評分</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">92%</div>
              <p className="text-xs text-muted-foreground">學習表現</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Today's Tasks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  今日任務
                </CardTitle>
                <CardDescription>完成這些任務以保持學習進度</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                  <div className="flex-1">
                    <p className="font-medium">完成有機化學第三章</p>
                    <p className="text-sm text-slate-600">2小時後到期</p>
                  </div>
                  <Badge variant="secondary">高優先級</Badge>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
                  <div className="h-2 w-2 rounded-full bg-green-600"></div>
                  <div className="flex-1">
                    <p className="font-medium">練習微積分題目</p>
                    <p className="text-sm text-slate-600">剩餘30分鐘</p>
                  </div>
                  <Badge variant="outline">中等</Badge>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="h-2 w-2 rounded-full bg-slate-400"></div>
                  <div className="flex-1">
                    <p className="font-medium">複習AI生成的記憶卡片</p>
                    <p className="text-sm text-slate-600">15分鐘</p>
                  </div>
                  <Badge variant="outline">低優先級</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Course Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  課程進度
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">進階有機化學</p>
                        <p className="text-sm text-slate-600">第3章，共8章</p>
                      </div>
                    </div>
                    <Badge>進行中</Badge>
                  </div>
                  <Progress value={37} className="h-2" />
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>37% 完成</span>
                    <span>預計剩餘2週</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">微積分與分析</p>
                        <p className="text-sm text-slate-600">模組2，共6個模組</p>
                      </div>
                    </div>
                    <Badge>進行中</Badge>
                  </div>
                  <Progress value={65} className="h-2" />
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>65% 完成</span>
                    <span>預計剩餘1週</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  AI學習洞察
                </CardTitle>
                <CardDescription>基於你的學習進度的個人化建議</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3 p-4 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200">
                  <Lightbulb className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-purple-900">學習模式分析</p>
                    <p className="text-sm text-purple-700">
                      你在上午的表現比平均高23%。建議在上午11點前安排困難的主題。
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
                  <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-900">優勢識別</p>
                    <p className="text-sm text-green-700">你的有機化學解題速度本週提升了40%！</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-lg bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200">
                  <Target className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-orange-900">重點領域</p>
                    <p className="text-sm text-orange-700">微積分積分需要注意。建議使用AI導師進行練習。</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  快速操作
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full justify-start bg-transparent" variant="outline">
                  <Link href="/study">
                    <PlayCircle className="mr-2 h-4 w-4" />
                    繼續上次學習
                  </Link>
                </Button>
                <Button asChild className="w-full justify-start bg-transparent" variant="outline">
                  <Link href="/ai-tutor">
                    <Brain className="mr-2 h-4 w-4" />
                    詢問AI導師
                  </Link>
                </Button>
                <Button asChild className="w-full justify-start bg-transparent" variant="outline">
                  <Link href="/flashcards/generator">
                    <FileText className="mr-2 h-4 w-4" />
                    生成記憶卡片
                  </Link>
                </Button>
                <Button asChild className="w-full justify-start bg-transparent" variant="outline">
                  <Link href="/analytics">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    查看分析
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Study Streak */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  學習連續天數
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-2">
                  <div className="text-3xl font-bold text-orange-600">7</div>
                  <p className="text-sm text-slate-600">連續天數</p>
                  <div className="flex justify-center gap-1">
                    {[...Array(7)].map((_, i) => (
                      <div key={i} className="h-3 w-3 rounded-full bg-orange-600"></div>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500">繼續加油！再3天就能創造新紀錄</p>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Deadlines */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  即將到期
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-red-500"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">有機化學作業</p>
                    <p className="text-xs text-slate-600">今天下午6:00到期</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">微積分練習測驗</p>
                    <p className="text-xs text-slate-600">明天到期</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">第四章小測驗</p>
                    <p className="text-xs text-slate-600">3天後到期</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  最近成就
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 p-2 rounded-lg bg-yellow-50">
                  <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                    <Star className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">滿分！</p>
                    <p className="text-xs text-slate-600">有機化學小測驗</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-lg bg-blue-50">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Timer className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">速度大師</p>
                    <p className="text-xs text-slate-600">5分鐘內完成10道題目</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
