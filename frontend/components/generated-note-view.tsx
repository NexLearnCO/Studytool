"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Share,
  Download,
  Edit,
  BookOpen,
  Clock,
  Target,
  Brain,
  FileText,
  CheckCircle,
  ArrowRight,
  Volume2,
  Sparkles,
} from "lucide-react"

interface GeneratedNote {
  id: string
  title: string
  subject: string
  course: string
  keyTopics: string[]
  difficulty: string
  estimatedReadTime: number
  content: {
    summary: string
    mainSections: Array<{
      title: string
      content: string
      keyPoints: string[]
    }>
  }
  aiInsights: {
    strengthAreas: string[]
    suggestedReview: string[]
    relatedTopics: string[]
    practiceQuestions: number
  }
}

export function GeneratedNoteView() {
  const generatedNote: GeneratedNote = {
    id: "note_001",
    title: "進階有機化學：反應機制",
    subject: "化學",
    course: "CHEM3001",
    keyTopics: ["SN1/SN2反應", "消除反應", "立體化學", "碳陽離子穩定性"],
    difficulty: "進階",
    estimatedReadTime: 15,
    content: {
      summary: "有機反應機制的全面概述，包括親核取代和消除反應，重點關注立體化學結果和機制路徑。",
      mainSections: [
        {
          title: "親核取代機制",
          content:
            "親核取代反應通過兩種主要機制發生：SN1和SN2。這些機制之間的選擇取決於幾個因素，包括基質結構、親核試劑強度、離去基團能力和溶劑效應。",
          keyPoints: [
            "SN2：協同機制，背面攻擊",
            "SN1：通過碳陽離子中間體的兩步機制",
            "機制間立體化學結果不同",
            "基質結構決定機制偏好",
          ],
        },
        {
          title: "消除反應（E1和E2）",
          content:
            "消除反應與取代反應競爭，遵循類似的機制模式。E2反應是協同的，需要反式共平面幾何，而E1反應通過碳陽離子中間體進行。",
          keyPoints: [
            "E2：需要特定幾何的協同消除",
            "E1：通過碳陽離子的兩步消除",
            "Zaitsev規則預測主要產物",
            "鹼強度和基質結構影響機制",
          ],
        },
        {
          title: "立體化學考慮",
          content:
            "理解立體化學對於預測反應結果至關重要。SN2反應導致構型反轉，而SN1反應由於平面碳陽離子中間體導致外消旋化。",
          keyPoints: [
            "SN2反應：立體化學完全反轉",
            "SN1反應：反應中心外消旋化",
            "E2反應：反式消除要求",
            "手性中心及其在反應中的行為",
          ],
        },
      ],
    },
    aiInsights: {
      strengthAreas: ["機制識別", "立體化學概念"],
      suggestedReview: ["碳陽離子穩定性因素", "溶劑對反應的影響"],
      relatedTopics: ["反應動力學", "熱力學vs動力學控制", "保護基團"],
      practiceQuestions: 12,
    },
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900">{generatedNote.title}</h1>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{generatedNote.course}</Badge>
            <Badge variant="outline">{generatedNote.subject}</Badge>
            <Badge variant="outline">{generatedNote.difficulty}</Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-600">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>預計閱讀時間：{generatedNote.estimatedReadTime} 分鐘</span>
            </div>
            <div className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              <span>{generatedNote.keyTopics.length} 個關鍵主題</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Share className="h-4 w-4 mr-2" />
            分享
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            匯出
          </Button>
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            編輯
          </Button>
          <Button>
            <Brain className="h-4 w-4 mr-2" />
            詢問 AI 導師
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Key Topics */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5" />
                關鍵主題
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {generatedNote.keyTopics.map((topic, index) => (
                  <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                    {topic}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                摘要
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="leading-relaxed text-slate-700">{generatedNote.content.summary}</p>
            </CardContent>
          </Card>

          {/* Main Sections */}
          {generatedNote.content.mainSections.map((section, index) => (
            <Card key={index}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{section.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="leading-relaxed text-slate-700">{section.content}</p>
                <div className="space-y-2">
                  <h4 className="font-medium text-slate-900">重點：</h4>
                  <ul className="space-y-2">
                    {section.keyPoints.map((point, pointIndex) => (
                      <li key={pointIndex} className="flex items-start gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
                        <span className="text-slate-700">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* AI Integration Status */}
          <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-green-800">
                <Sparkles className="h-5 w-5" />
                平台整合狀態
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm">儀表板已更新</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm">AI 導師上下文已建立</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm">已生成 {generatedNote.aiInsights.practiceQuestions} 道練習題</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm">記憶卡片已創建</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* AI Insights */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Brain className="h-4 w-4" />
                AI 學習洞察
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-green-700 mb-2">優勢領域</h4>
                <div className="space-y-1">
                  {generatedNote.aiInsights.strengthAreas.map((area, index) => (
                    <div key={index} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      {area}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-orange-700 mb-2">建議複習</h4>
                <div className="space-y-1">
                  {generatedNote.aiInsights.suggestedReview.map((item, index) => (
                    <div key={index} className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                      {item}
                    </div>
                  ))}
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
                生成練習題 ({generatedNote.aiInsights.practiceQuestions})
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                <Brain className="h-4 w-4 mr-2" />
                詢問 AI 導師
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                <FileText className="h-4 w-4 mr-2" />
                創建記憶卡片
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                <Volume2 className="h-4 w-4 mr-2" />
                朗讀
              </Button>
            </CardContent>
          </Card>

          {/* Related Topics */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">相關主題</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {generatedNote.aiInsights.relatedTopics.map((topic, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-xs h-8 bg-transparent"
                  >
                    <ArrowRight className="h-3 w-3 mr-2" />
                    {topic}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Study Progress */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">學習進度</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>閱讀進度</span>
                  <span className="font-medium">0%</span>
                </div>
                <Progress value={0} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>概念掌握</span>
                  <span className="font-medium">75%</span>
                </div>
                <Progress value={75} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>練習完成</span>
                  <span className="font-medium">40%</span>
                </div>
                <Progress value={40} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
