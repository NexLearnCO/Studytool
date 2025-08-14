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

export function AITutorChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      type: "ai",
      content: "你好！我係 NexBot，你嘅 AI 學習助教 👋 我見到你而家讀緊化學同數學，有咩唔明可以隨時問我！",
      timestamp: "14:30",
      suggestions: ["化學計算問題", "數學公式解釋", "考試溫習策略"],
    },
    {
      id: "2",
      type: "user",
      content: "哩題點解係咁計？",
      timestamp: "14:32",
      subject: "化學",
    },
    {
      id: "3",
      type: "ai",
      content:
        "我見你係計錯咗 mol 數。記唔記得點樣由 mass 計 mole？我哋一步步嚟：\n\n**第一步：搵出 molar mass**\n- 睇下個 compound 嘅分子式\n- 加埋所有原子嘅 atomic mass\n\n**第二步：用公式**\n- mole = mass ÷ molar mass\n- 記住單位要啱（g 同 g/mol）\n\n你想我詳細解釋邊一步？",
      timestamp: "14:33",
      subject: "化學",
      resources: [
        { title: "Mole 計算互動練習", type: "練習", url: "#", icon: Calculator },
        { title: "化學公式表", type: "PDF", url: "#", icon: FileText },
        { title: "元素週期表", type: "工具", url: "#", icon: Beaker },
      ],
    },
    {
      id: "4",
      type: "user",
      content: "我想睇下個 molar mass 點計",
      timestamp: "14:35",
      subject: "化學",
    },
    {
      id: "5",
      type: "ai",
      content:
        "好！我用 H₂SO₄（硫酸）做例子：\n\n**計算步驟：**\n• H: 1.0 × 2 = 2.0 g/mol\n• S: 32.1 × 1 = 32.1 g/mol  \n• O: 16.0 × 4 = 64.0 g/mol\n\n**總和：** 2.0 + 32.1 + 64.0 = 98.1 g/mol\n\n所以 H₂SO₄ 嘅 molar mass 係 98.1 g/mol 💡\n\n你而家試下計 NaCl 嘅 molar mass？",
      timestamp: "14:36",
      subject: "化學",
      suggestions: ["計算 NaCl molar mass", "更多例子", "做相關練習題"],
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
        timestamp: new Date().toLocaleTimeString("zh-HK", { hour: "2-digit", minute: "2-digit" }),
        subject: selectedSubject !== "全部" ? selectedSubject : undefined,
      }
      setMessages([...messages, newMessage])
      setInputValue("")

      // Simulate AI response
      setTimeout(() => {
        const responses = [
          "好問題！等我諗下點樣解釋得清楚啲...",
          "我明白你嘅疑問，等我幫你分析下...",
          "哩個概念確實有啲複雜，我哋慢慢嚟...",
          "讓我用簡單啲嘅方法解釋俾你聽...",
        ]
        const aiResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: "ai",
          content: responses[Math.floor(Math.random() * responses.length)],
          timestamp: new Date().toLocaleTimeString("zh-HK", { hour: "2-digit", minute: "2-digit" }),
          suggestions: ["需要更多例子", "想做練習題", "解釋其他概念"],
        }
        setMessages((prev) => [...prev, aiResponse])
      }, 1500)
    }
  }

  const quickQuestions = ["解釋哩個概念", "俾啲例子我", "點樣溫習？", "做練習題"]

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
            <h1 className="text-lg font-semibold text-slate-900">NexBot AI 助教</h1>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span className="text-sm text-slate-600">線上中 • 專精理科同語言</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-green-600 border-green-200">
            <Star className="h-3 w-3 mr-1" />
            4.8 評分
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
                    <AvatarFallback>陳同</AvatarFallback>
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
                  placeholder="問我任何學習問題，支援廣東話、中文、英文..."
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
                <span>支援文字、語音、圖片、文件上傳</span>
                {isRecording && (
                  <div className="flex items-center gap-2 text-red-600">
                    <div className="h-2 w-2 rounded-full bg-red-600 animate-pulse"></div>
                    錄音中...
                  </div>
                )}
              </div>
              <span>Enter 發送 • Shift+Enter 換行</span>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 border-l border-slate-200 bg-slate-50 p-6 space-y-6">
          {/* AI Assistant Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Brain className="h-4 w-4" />
                AI 助教資訊
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Beaker className="h-4 w-4 text-blue-600" />
                <span className="text-sm">理科專家：化學、物理、生物</span>
              </div>
              <div className="flex items-center gap-2">
                <Calculator className="h-4 w-4 text-green-600" />
                <span className="text-sm">數學：代數、幾何、微積分</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-purple-600" />
                <span className="text-sm">語言：中文、英文、廣東話</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-600" />
                <span className="text-sm">24/7 即時回應</span>
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
              <CardTitle className="text-sm">快速功能</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                <Target className="h-4 w-4 mr-2" />
                出練習題
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                <BookOpen className="h-4 w-4 mr-2" />
                解釋概念
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                <FileText className="h-4 w-4 mr-2" />
                做筆記
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
                  <p className="font-medium">Mole 計算問題</p>
                  <p className="text-slate-600">化學 • 剛才</p>
                </div>
                <div className="p-2 rounded bg-white border">
                  <p className="font-medium">二次方程解法</p>
                  <p className="text-slate-600">數學 • 1 小時前</p>
                </div>
                <div className="p-2 rounded bg-white border">
                  <p className="font-medium">牛頓定律應用</p>
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
