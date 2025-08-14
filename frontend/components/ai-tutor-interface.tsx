"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Brain, Send, Mic, Lightbulb, BookOpen, Target } from "lucide-react"

export function AITutorInterface() {
  const [message, setMessage] = useState("")
  const [isRecording, setIsRecording] = useState(false)

  const recentTopics = [
    { topic: "Organic Chemistry Mechanisms", subject: "Chemistry", time: "2 hours ago" },
    { topic: "Calculus Integration", subject: "Mathematics", time: "1 day ago" },
    { topic: "Cell Division Process", subject: "Biology", time: "2 days ago" },
  ]

  const quickQuestions = ["Explain this concept", "Give me examples", "Create practice problems", "Help me study"]

  return (
    <div className="space-y-6">
      {/* AI Tutor Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src="/placeholder.svg?height=64&width=64" />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xl">
                <Brain className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-slate-900">NexBot AI Tutor</h3>
              <p className="text-slate-600 mb-3">Your personal AI learning assistant, available 24/7</p>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-green-600 border-green-200">
                  Online
                </Badge>
                <Badge variant="outline">Expert in Math & Sciences</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Ask Your AI Tutor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Ask me anything about your studies..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1"
            />
            <Button
              variant={isRecording ? "destructive" : "outline"}
              size="icon"
              onClick={() => setIsRecording(!isRecording)}
            >
              <Mic className={`h-4 w-4 ${isRecording ? "animate-pulse" : ""}`} />
            </Button>
            <Button>
              <Send className="h-4 w-4" />
            </Button>
          </div>

          {/* Quick Questions */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700">Quick questions:</p>
            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs rounded-full bg-transparent"
                  onClick={() => setMessage(question)}
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Conversations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Recent Conversations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentTopics.map((topic, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">{topic.topic}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {topic.subject}
                  </Badge>
                  <span className="text-xs text-slate-500">{topic.time}</span>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* AI Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            AI Tutor Features
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <Target className="h-4 w-4 text-blue-600" />
            <span className="text-sm">Personalized explanations</span>
          </div>
          <div className="flex items-center gap-3">
            <BookOpen className="h-4 w-4 text-green-600" />
            <span className="text-sm">Step-by-step problem solving</span>
          </div>
          <div className="flex items-center gap-3">
            <Brain className="h-4 w-4 text-purple-600" />
            <span className="text-sm">Adaptive learning recommendations</span>
          </div>
          <div className="flex items-center gap-3">
            <Lightbulb className="h-4 w-4 text-orange-600" />
            <span className="text-sm">Study strategy optimization</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
