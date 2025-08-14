"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
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

export function DashboardContent() {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Welcome back, John! 👋</h2>
          <p className="text-slate-600">Ready to continue your learning journey?</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-500">Current study streak</p>
          <div className="flex items-center gap-1">
            <span className="text-2xl font-bold text-orange-600">7</span>
            <span className="text-sm text-slate-600">days</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">+1 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">lessons this week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42h</div>
            <p className="text-xs text-muted-foreground">this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Score</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92%</div>
            <p className="text-xs text-muted-foreground">learning performance</p>
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
                Today's Tasks
              </CardTitle>
              <CardDescription>Complete these tasks to maintain your learning progress</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                <div className="flex-1">
                  <p className="font-medium">Complete Organic Chemistry Chapter 3</p>
                  <p className="text-sm text-slate-600">Due in 2 hours</p>
                </div>
                <Badge variant="secondary">High Priority</Badge>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
                <div className="h-2 w-2 rounded-full bg-green-600"></div>
                <div className="flex-1">
                  <p className="font-medium">Practice Calculus Problems</p>
                  <p className="text-sm text-slate-600">30 minutes remaining</p>
                </div>
                <Badge variant="outline">Medium</Badge>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="h-2 w-2 rounded-full bg-slate-400"></div>
                <div className="flex-1">
                  <p className="font-medium">Review AI-generated flashcards</p>
                  <p className="text-sm text-slate-600">15 minutes</p>
                </div>
                <Badge variant="outline">Low Priority</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Course Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Course Progress
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
                      <p className="font-medium">Advanced Organic Chemistry</p>
                      <p className="text-sm text-slate-600">Chapter 3 of 8</p>
                    </div>
                  </div>
                  <Badge>In Progress</Badge>
                </div>
                <Progress value={37} className="h-2" />
                <div className="flex justify-between text-sm text-slate-600">
                  <span>37% complete</span>
                  <span>Est. 2 weeks remaining</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Calculus & Analysis</p>
                      <p className="text-sm text-slate-600">Module 2 of 6</p>
                    </div>
                  </div>
                  <Badge>In Progress</Badge>
                </div>
                <Progress value={65} className="h-2" />
                <div className="flex justify-between text-sm text-slate-600">
                  <span>65% complete</span>
                  <span>Est. 1 week remaining</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Learning Insights
              </CardTitle>
              <CardDescription>Personalized recommendations based on your learning progress</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3 p-4 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200">
                <Lightbulb className="h-5 w-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="font-medium text-purple-900">Learning Pattern Analysis</p>
                  <p className="text-sm text-purple-700">
                    Your performance is 23% higher in the morning. Consider scheduling difficult topics before 11 AM.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
                <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-green-900">Strength Identification</p>
                  <p className="text-sm text-green-700">
                    Your organic chemistry problem-solving speed improved by 40% this week!
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200">
                <Target className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <p className="font-medium text-orange-900">Focus Areas</p>
                  <p className="text-sm text-orange-700">
                    Calculus integration needs attention. Consider using the AI tutor for practice.
                  </p>
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
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full justify-start bg-transparent" variant="outline">
                <Link href="/study">
                  <PlayCircle className="mr-2 h-4 w-4" />
                  Continue Last Session
                </Link>
              </Button>
              <Button asChild className="w-full justify-start bg-transparent" variant="outline">
                <Link href="/ai-tutor">
                  <Brain className="mr-2 h-4 w-4" />
                  Ask AI Tutor
                </Link>
              </Button>
              <Button asChild className="w-full justify-start bg-transparent" variant="outline">
                <Link href="/flashcards/generator">
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Flashcards
                </Link>
              </Button>
              <Button asChild className="w-full justify-start bg-transparent" variant="outline">
                <Link href="/analytics">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  View Analytics
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Study Streak */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Study Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-2">
                <div className="text-3xl font-bold text-orange-600">7</div>
                <p className="text-sm text-slate-600">consecutive days</p>
                <div className="flex justify-center gap-1">
                  {[...Array(7)].map((_, i) => (
                    <div key={i} className="h-3 w-3 rounded-full bg-orange-600"></div>
                  ))}
                </div>
                <p className="text-xs text-slate-500">Keep going! 3 more days for a new record</p>
              </div>
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
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-red-500"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Organic Chemistry Assignment</p>
                  <p className="text-xs text-slate-600">Due today at 6:00 PM</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Calculus Practice Test</p>
                  <p className="text-xs text-slate-600">Due tomorrow</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Chapter 4 Quiz</p>
                  <p className="text-xs text-slate-600">Due in 3 days</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Recent Achievements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 p-2 rounded-lg bg-yellow-50">
                <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                  <Star className="h-4 w-4 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Perfect Score!</p>
                  <p className="text-xs text-slate-600">Organic Chemistry Quiz</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg bg-blue-50">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Timer className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Speed Master</p>
                  <p className="text-xs text-slate-600">Completed 10 problems in 5 minutes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
