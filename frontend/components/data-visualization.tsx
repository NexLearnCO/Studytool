"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { BarChart3, TrendingUp, Target, Clock } from "lucide-react"

export function DataVisualization() {
  const studyData = [
    { subject: "Chemistry", progress: 85, time: 120, streak: 7 },
    { subject: "Mathematics", progress: 72, time: 95, streak: 5 },
    { subject: "Physics", progress: 68, time: 80, streak: 3 },
    { subject: "Biology", progress: 91, time: 110, streak: 9 },
  ]

  const weeklyProgress = [
    { day: "Mon", value: 85 },
    { day: "Tue", value: 92 },
    { day: "Wed", value: 78 },
    { day: "Thu", value: 88 },
    { day: "Fri", value: 95 },
    { day: "Sat", value: 82 },
    { day: "Sun", value: 90 },
  ]

  return (
    <div className="space-y-6">
      {/* Subject Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Subject Progress Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {studyData.map((subject) => (
            <div key={subject.subject} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-medium">{subject.subject}</span>
                  <Badge variant="outline" className="text-xs">
                    {subject.streak} day streak
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{subject.time}min</span>
                  </div>
                  <span className="font-medium">{subject.progress}%</span>
                </div>
              </div>
              <Progress value={subject.progress} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Weekly Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Weekly Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between h-32 gap-2">
            {weeklyProgress.map((day) => (
              <div key={day.day} className="flex flex-col items-center gap-2 flex-1">
                <div
                  className="w-full bg-blue-500 rounded-t-sm transition-all hover:bg-blue-600"
                  style={{ height: `${day.value}%` }}
                ></div>
                <span className="text-xs text-slate-600">{day.day}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
            <span>Average: 87%</span>
            <span className="flex items-center gap-1 text-green-600">
              <TrendingUp className="h-3 w-3" />
              +5% from last week
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Learning Goals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Learning Goals Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Complete Organic Chemistry Course</span>
              <span className="font-medium">75%</span>
            </div>
            <Progress value={75} className="h-2" />
            <p className="text-xs text-slate-500">Target: End of semester</p>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Master 500 Flashcards</span>
              <span className="font-medium">62%</span>
            </div>
            <Progress value={62} className="h-2" />
            <p className="text-xs text-slate-500">310 of 500 cards mastered</p>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Maintain 30-day Study Streak</span>
              <span className="font-medium">23%</span>
            </div>
            <Progress value={23} className="h-2" />
            <p className="text-xs text-slate-500">7 of 30 days completed</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
