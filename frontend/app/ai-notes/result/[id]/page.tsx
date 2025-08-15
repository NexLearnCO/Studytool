"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Brain,
  FileText,
  Sparkles,
  CheckCircle,
  Share,
  Download,
  Copy,
  Edit,
  Save,
  ArrowLeft,
  BookOpen,
  Clock,
  FileCode,
  Languages,
  TrendingUp
} from "lucide-react"

interface ResultData {
  id: string
  title: string
  notes: string
  config: any
  timestamp: string
  wordCount: number
  processingTime: string
}

export default function AINotesResultPage() {
  const params = useParams()
  const router = useRouter()
  const [resultData, setResultData] = useState<ResultData | null>(null)
  const [editableNotes, setEditableNotes] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState("notes")
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    // Load result data from session storage
    const stored = sessionStorage.getItem('aiNotesResult')
    if (stored) {
      const data = JSON.parse(stored)
      setResultData(data)
      setEditableNotes(data.notes)
    } else {
      // Redirect back if no data
      router.push('/')
    }
  }, [router])

  const handleSaveEdit = () => {
    if (resultData) {
      const updatedData = {
        ...resultData,
        notes: editableNotes,
        lastEdited: new Date().toISOString()
      }
      setResultData(updatedData)
      sessionStorage.setItem('aiNotesResult', JSON.stringify(updatedData))
      setIsEditing(false)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2000)
    }
  }

  const copyNotes = async () => {
    try {
      await navigator.clipboard.writeText(editableNotes)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2000)
    } catch (err) {
      console.error("複製失敗")
    }
  }

  const downloadNotes = () => {
    if (!resultData) return
    
    const element = document.createElement("a")
    const file = new Blob([editableNotes], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = `${resultData.title}.md`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const saveToLibrary = () => {
    // TODO: Implement save to personal notes library
    console.log("保存到筆記庫功能待實現")
    setSuccess(true)
    setTimeout(() => setSuccess(false), 2000)
  }

  if (!resultData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">載入中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/')}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{resultData.title}</h1>
                <p className="text-sm text-gray-500">
                  生成於 {new Date(resultData.timestamp).toLocaleString('zh-TW')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={copyNotes}>
                <Copy className="h-4 w-4 mr-1" />
                複製
              </Button>
              <Button variant="outline" size="sm" onClick={downloadNotes}>
                <Download className="h-4 w-4 mr-1" />
                下載
              </Button>
              <Button variant="outline" size="sm" onClick={() => {}}>
                <Share className="h-4 w-4 mr-1" />
                分享
              </Button>
              <Button onClick={saveToLibrary} className="bg-blue-600 hover:bg-blue-700">
                <BookOpen className="h-4 w-4 mr-1" />
                收入筆記庫
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Metadata */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">筆記資訊</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <div>
                    <div className="text-sm font-medium">處理時間</div>
                    <div className="text-xs text-gray-500">{resultData.processingTime}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <FileCode className="h-4 w-4 text-gray-500" />
                  <div>
                    <div className="text-sm font-medium">字數統計</div>
                    <div className="text-xs text-gray-500">{resultData.wordCount.toLocaleString()} 字</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Languages className="h-4 w-4 text-gray-500" />
                  <div>
                    <div className="text-sm font-medium">語言</div>
                    <div className="text-xs text-gray-500">{resultData.config.language || '繁體中文'}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-gray-500" />
                  <div>
                    <div className="text-sm font-medium">詳細程度</div>
                    <div className="text-xs text-gray-500">{resultData.config.detailLevel || '適中'}</div>
                  </div>
                </div>

                {resultData.config.examSystem && (
                  <div>
                    <div className="text-sm font-medium">考試系統</div>
                    <Badge variant="outline" className="mt-1">
                      {resultData.config.examSystem}
                    </Badge>
                  </div>
                )}

                {resultData.config.subject && (
                  <div>
                    <div className="text-sm font-medium">科目</div>
                    <Badge variant="outline" className="mt-1">
                      {resultData.config.subject}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-blue-600" />
                      AI 生成內容
                    </CardTitle>
                    <CardDescription>
                      您可以編輯內容後保存到筆記庫
                    </CardDescription>
                  </div>
                  <Button
                    variant={isEditing ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      if (isEditing) {
                        handleSaveEdit()
                      } else {
                        setIsEditing(true)
                      }
                    }}
                  >
                    {isEditing ? (
                      <>
                        <Save className="h-4 w-4 mr-1" />
                        保存編輯
                      </>
                    ) : (
                      <>
                        <Edit className="h-4 w-4 mr-1" />
                        編輯
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-4 rounded-none border-b">
                    <TabsTrigger value="notes" className="text-sm">
                      <FileText className="h-4 w-4 mr-1" />
                      筆記
                    </TabsTrigger>
                    <TabsTrigger value="mindmap" className="text-sm">
                      <Brain className="h-4 w-4 mr-1" />
                      思維導圖
                    </TabsTrigger>
                    <TabsTrigger value="flashcards" className="text-sm">
                      <Sparkles className="h-4 w-4 mr-1" />
                      記憶卡片
                    </TabsTrigger>
                    <TabsTrigger value="quiz" className="text-sm">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      測驗
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="notes" className="p-6 m-0">
                    {isEditing ? (
                      <Textarea
                        value={editableNotes}
                        onChange={(e) => setEditableNotes(e.target.value)}
                        className="min-h-[500px] text-sm leading-relaxed font-mono"
                        placeholder="編輯您的筆記內容..."
                      />
                    ) : (
                      <div className="prose prose-slate max-w-none min-h-[500px]">
                        <div 
                          className="whitespace-pre-wrap text-sm leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: editableNotes.replace(/\n/g, '<br/>') }}
                        />
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="mindmap" className="p-6 m-0">
                    <div className="h-96 bg-slate-50 rounded flex items-center justify-center">
                      <div className="text-center text-slate-500">
                        <Brain className="h-16 w-16 mx-auto mb-4 text-slate-400" />
                        <h3 className="font-medium text-lg mb-2">思維導圖生成</h3>
                        <p className="text-sm mb-4">基於您的筆記內容自動生成思維導圖</p>
                        <Button variant="outline">
                          <Brain className="h-4 w-4 mr-2" />
                          生成思維導圖
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="flashcards" className="p-6 m-0">
                    <div className="h-96 bg-slate-50 rounded flex items-center justify-center">
                      <div className="text-center text-slate-500">
                        <Sparkles className="h-16 w-16 mx-auto mb-4 text-slate-400" />
                        <h3 className="font-medium text-lg mb-2">記憶卡片生成</h3>
                        <p className="text-sm mb-4">從筆記內容提取關鍵概念生成記憶卡片</p>
                        <Button variant="outline">
                          <Sparkles className="h-4 w-4 mr-2" />
                          生成記憶卡片
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="quiz" className="p-6 m-0">
                    <div className="h-96 bg-slate-50 rounded flex items-center justify-center">
                      <div className="text-center text-slate-500">
                        <CheckCircle className="h-16 w-16 mx-auto mb-4 text-slate-400" />
                        <h3 className="font-medium text-lg mb-2">智能測驗生成</h3>
                        <p className="text-sm mb-4">基於筆記內容自動生成測驗題目</p>
                        <Button variant="outline">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          生成測驗
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Success Message */}
            {success && (
              <Alert className="mt-4 border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">
                  操作成功完成！
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
