"use client"

import { useState, useRef } from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Bell,
  Send,
  Mic,
  ImageIcon,
  Paperclip,
  Brain,
  BookOpen,
  Target,
  Clock,
  Star,
  TrendingUp,
  FileText,
  Play,
  Volume2,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Beaker,
  Calculator,
  Globe,
} from "lucide-react"

interface ChatMessage {
  id: string
  type: "user" | "ai"
  content: string
  timestamp: string
  subject?: string
  suggestions?: string[]
  resources?: Array<{
    title: string
    type: string
    url: string
    icon: any
  }>
}

export default function AITutor() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      type: "ai",
      content: "你好！我是NexBot，你的AI學習導師 👋 我看到你目前正在學習化學和數學。今天有什麼可以幫助你的嗎？",
      timestamp: "下午2:30",
      suggestions: ["化學計算", "數學公式解釋", "學習策略"],
    },
    {
      id: "2",
      type: "user",
      content: "我在這個有機化學問題上遇到困難。你能幫我理解反應機制嗎？",
      timestamp: "下午2:32",
      subject: "化學",
    },
    {
      id: "3",
      type: "ai",
      content:
        "我很樂意幫助你理解有機化學機制！讓我逐步分解：\n\n**理解反應機制：**\n\n1. **識別官能團** 參與反應的基團\n2. **確定反應類型** (取代、消除、加成)\n3. **追蹤電子移動** 使用彎曲箭頭\n4. **考慮立體化學** 如果適用\n\n你能分享你正在處理的具體反應嗎？我可以提供詳細的機制分析。",
      timestamp: "下午2:33",
      subject: "化學",
      resources: [
        { title: "有機反應機制指南", type: "互動教材", url: "#", icon: Calculator },
        { title: "化學公式表", type: "PDF", url: "#", icon: FileText },
        { title: "分子可視化工具", type: "工具", url: "#", icon: Beaker },
      ],
    },
  ])

  const [inputValue, setInputValue] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState("全部")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        type: "user",
        content: inputValue,
        timestamp: new Date().toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" }),
        subject: selectedSubject !== "全部" ? selectedSubject : undefined,
      }
      setMessages([...messages, newMessage])
      setInputValue("")

      // Simulate AI response
      setTimeout(() => {
        const responses = [
          "很好的問題！讓我逐步分析...",
          "我理解你的困惑。讓我清楚地解釋這個概念...",
          "這確實是一個複雜的主題。讓我們一起分解...",
          "讓我提供詳細的解釋和例子...",
        ]
        const aiResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: "ai",
          content: responses[Math.floor(Math.random() * responses.length)],
          timestamp: new Date().toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" }),
          suggestions: ["需要更多例子", "想要練習題", "解釋相關概念"],
        }
        setMessages((prev) => [...prev, aiResponse])
      }, 1500)
    }
  }

  const quickQuestions = ["解釋這個概念", "給我例子", "如何解決這個？", "制定學習計劃"]

  const subjects = ["全部", "數學", "化學", "物理", "生物", "英文"]

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="flex h-16 items-center gap-4 border-b border-slate-200 bg-white px-6">
        <SidebarTrigger />
        <div className="flex items-center gap-3 flex-1">
          <Avatar className="h-10 w-10">
            <AvatarImage src="/placeholder.svg?height=40&width=40" />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              <Brain className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-lg font-semibold text-slate-900">NexBot AI導師</h1>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span className="text-sm text-slate-600">線上中 • 數學與科學專家</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-green-600 border-green-200">
            <Star className="h-3 w-3 mr-1" />
            4.9 評分
          </Badge>
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Subject Filter */}
          <div className="px-6 py-3 border-b border-slate-100 bg-slate-50">
            <div className="flex gap-2 overflow-x-auto">
              {subjects.map((subject) => (
                <Button
                  key={subject}
                  variant={selectedSubject === subject ? "default" : "outline"}
                  size="sm"
                  className="whitespace-nowrap rounded-full"
                  onClick={() => setSelectedSubject(subject)}
                >
                  {subject}
                </Button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((message) => (
              <div key={message.id} className={`flex gap-4 ${message.type === "user" ? "flex-row-reverse" : ""}`}>
                <Avatar className="h-8 w-8 flex-shrink-0">
                  {message.type === "ai" ? (
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      <Brain className="h-4 w-4" />
                    </AvatarFallback>
                  ) : (
                    <AvatarFallback>小明</AvatarFallback>
                  )}
                </Avatar>

                <div className={`flex-1 max-w-2xl ${message.type === "user" ? "flex flex-col items-end" : ""}`}>
                  {message.subject && (
                    <Badge variant="secondary" className="mb-2 text-xs">
                      {message.subject}
                    </Badge>
                  )}

                  <div
                    className={`rounded-2xl px-4 py-3 ${
                      message.type === "user" ? "bg-blue-600 text-white" : "bg-white border border-slate-200 shadow-sm"
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-line">{message.content}</p>
                  </div>

                  <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                    <span>{message.timestamp}</span>
                    {message.type === "ai" && (
                      <>
                        <Button variant="ghost" size="sm" className="h-6 px-2">
                          <Volume2 className="h-3 w-3 mr-1" />
                          朗讀
                        </Button>
                        <Button variant="ghost" size="sm" className="h-6 px-2">
                          <Copy className="h-3 w-3 mr-1" />
                          複製
                        </Button>
                        <Button variant="ghost" size="sm" className="h-6 px-2">
                          <ThumbsUp className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-6 px-2">
                          <ThumbsDown className="h-3 w-3" />
                        </Button>
                      </>
                    )}
                  </div>

                  {/* AI Suggestions */}
                  {message.suggestions && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs text-slate-600">建議問題：</p>
                      <div className="flex flex-wrap gap-2">
                        {message.suggestions.map((suggestion, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            className="text-xs h-7 rounded-full bg-transparent"
                            onClick={() => setInputValue(suggestion)}
                          >
                            {suggestion}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Resources */}
                  {message.resources && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs text-slate-600">相關資源：</p>
                      <div className="space-y-2">
                        {message.resources.map((resource, index) => (
                          <Card key={index} className="p-3">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                <resource.icon className="h-4 w-4 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium">{resource.title}</p>
                                <p className="text-xs text-slate-600">{resource.type}</p>
                              </div>
                              <Button size="sm" variant="outline">
                                <Play className="h-3 w-3 mr-1" />
                                開啟
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Questions */}
          <div className="px-6 py-3 border-t border-slate-100">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {quickQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="whitespace-nowrap rounded-full bg-transparent"
                  onClick={() => setInputValue(question)}
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <div className="p-6 border-t border-slate-200 bg-white">
            <div className="flex items-end gap-3">
              <div className="flex-1 relative">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="詢問任何關於學習的問題..."
                  className="pr-12 min-h-[44px]"
                  onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*,.pdf,.doc,.docx" className="hidden" />
              </div>

              <Button
                variant={isRecording ? "destructive" : "outline"}
                size="icon"
                className="h-11 w-11"
                onClick={() => setIsRecording(!isRecording)}
              >
                <Mic className={`h-5 w-5 ${isRecording ? "animate-pulse" : ""}`} />
              </Button>

              <Button onClick={handleSendMessage} disabled={!inputValue.trim()} className="h-11 px-6">
                <Send className="h-4 w-4 mr-2" />
                發送
              </Button>
            </div>

            <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
              <div className="flex items-center gap-4">
                <span>支援文字、語音、圖片和文件</span>
                {isRecording && (
                  <div className="flex items-center gap-2 text-red-600">
                    <div className="h-2 w-2 rounded-full bg-red-600 animate-pulse"></div>
                    錄音中...
                  </div>
                )}
              </div>
              <span>按Enter發送 • Shift+Enter換行</span>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 border-l border-slate-200 bg-slate-50 p-6 space-y-6">
          {/* AI Tutor Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Brain className="h-4 w-4" />
                AI導師資訊
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Beaker className="h-4 w-4 text-blue-600" />
                <span className="text-sm">科學：化學、物理、生物</span>
              </div>
              <div className="flex items-center gap-2">
                <Calculator className="h-4 w-4 text-green-600" />
                <span className="text-sm">數學：代數、微積分、統計</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-purple-600" />
                <span className="text-sm">語言：中文、英文、日文</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-600" />
                <span className="text-sm">24/7即時回應</span>
              </div>
            </CardContent>
          </Card>

          {/* Today's Study Progress */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">今日學習進度</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>化學</span>
                  <span className="text-slate-600">80%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: "80%" }}></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>數學</span>
                  <span className="text-slate-600">65%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: "65%" }}></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>物理</span>
                  <span className="text-slate-600">45%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: "45%" }}></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">快速操作</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                <Target className="h-4 w-4 mr-2" />
                生成練習題
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                <BookOpen className="h-4 w-4 mr-2" />
                解釋概念
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                <FileText className="h-4 w-4 mr-2" />
                創建學習筆記
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                <TrendingUp className="h-4 w-4 mr-2" />
                學習分析
              </Button>
            </CardContent>
          </Card>

          {/* Recent Conversations */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">最近對話</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-xs space-y-2">
                <div className="p-2 rounded bg-white border">
                  <p className="font-medium">有機化學機制</p>
                  <p className="text-slate-600">化學 • 剛剛</p>
                </div>
                <div className="p-2 rounded bg-white border">
                  <p className="font-medium">二次方程式</p>
                  <p className="text-slate-600">數學 • 1小時前</p>
                </div>
                <div className="p-2 rounded bg-white border">
                  <p className="font-medium">牛頓定律</p>
                  <p className="text-slate-600">物理 • 昨天</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
