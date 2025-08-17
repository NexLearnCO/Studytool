"use client"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Sparkles,
  Zap,
  RefreshCcw,
  Brain,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  XCircle,
  Lightbulb
} from "lucide-react"

// 簡化的Quiz數據結構
interface QuizQuestion {
  question: string
  options: string[]
  correct: string // "A", "B", "C", "D"  
  explanation: string
}

interface QuizData {
  quiz: QuizQuestion[]
  title: string
  lastGenerated: string
}

interface QuizGenerationTabProps {
  noteContent: string
  noteTitle: string
  savedData?: any
  onDataChange?: (data: any) => void
}

export default function QuizGenerationTab({
  noteContent,
  noteTitle,
  savedData,
  onDataChange
}: QuizGenerationTabProps) {
  // 基本狀態
  const [step, setStep] = useState<"config" | "generating" | "preview" | "test" | "results">("config")
  const [quizData, setQuizData] = useState<QuizData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // 測驗狀態
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<{[key: number]: string}>({})
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(0)
  const [isInitialized, setIsInitialized] = useState(false)

  // 初始化數據
  useEffect(() => {
    if (savedData) {
      setStep(savedData.step || "config")
      setQuizData(savedData.quizData || null)
      setCurrentIndex(savedData.currentIndex || 0)
      setAnswers(savedData.answers || {})
      setSubmitted(savedData.submitted || false)
      setScore(savedData.score || 0)
    }
    // 標記為已初始化
    setIsInitialized(true)
  }, [savedData])

  // 保存狀態 - 簡化版本避免無限循環
  useEffect(() => {
    if (isInitialized && onDataChange) {
      const timeoutId = setTimeout(() => {
        onDataChange({
          step,
          quizData,
          currentIndex,
          answers,
          submitted,
          score,
          lastSaved: new Date().toISOString()
        })
      }, 0)
      
      return () => clearTimeout(timeoutId)
    }
  }, [isInitialized, step, currentIndex, submitted, score])

  // 生成Quiz
  const generateQuiz = async () => {
    setLoading(true)
    setError(null)
    setStep("generating")
    
    try {
      const response = await fetch("http://localhost:5000/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notes: noteContent,
          language: "zh-tw"
        }),
      })

      if (!response.ok) {
        throw new Error("生成失敗")
      }

      const data = await response.json()
      
      if (data.success && data.quiz) {
        const newQuizData: QuizData = {
          quiz: data.quiz,
          title: `${noteTitle} - 測驗`,
          lastGenerated: new Date().toISOString()
        }
        
        setQuizData(newQuizData)
        setStep("preview")
        resetTest()
        
        // 調試信息
        console.log("Quiz generated:", newQuizData)
        console.log("First question correct answer:", newQuizData.quiz[0]?.correct)
      } else {
        throw new Error(data.error || "生成失敗")
      }
    } catch (err: any) {
      setError(err.message)
      setStep("config")
    } finally {
      setLoading(false)
    }
  }

  // 重置測驗
  const resetTest = () => {
    setCurrentIndex(0)
    setAnswers({})
    setSubmitted(false)
    setScore(0)
  }

  // 開始測驗
  const startTest = () => {
    resetTest()
    setStep("test")
  }

  // 選擇答案
  const selectAnswer = (option: string) => {
    if (submitted) return
    
    setAnswers(prev => ({
      ...prev,
      [currentIndex]: option
    }))
    
    // 調試信息
    const currentQuestion = quizData?.quiz[currentIndex]
    if (currentQuestion) {
      const selectedText = currentQuestion.options[option.charCodeAt(0) - 65]
      console.log(`Q${currentIndex + 1}: Selected "${option}" (${selectedText}), Correct "${currentQuestion.correct}"`)
      console.log(`Letter match: ${option === currentQuestion.correct}`)
      console.log(`Text match: ${selectedText === currentQuestion.correct}`)
    }
  }

  // 下一題
  const nextQuestion = () => {
    if (!quizData) return
    
    if (currentIndex < quizData.quiz.length - 1) {
      setCurrentIndex(prev => prev + 1)
    } else {
      finishTest()
    }
  }

  // 上一題
  const prevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
    }
  }

  // 完成測驗
  const finishTest = () => {
    if (!quizData) return
    
    let correctCount = 0
    quizData.quiz.forEach((question, index) => {
      const userAnswer = answers[index]
      const correctAnswer = question.correct
      
      // 支持兩種比較方式：字母匹配 或 文本匹配
      let isCorrect = false
      
      if (userAnswer) {
        // 方式1: 直接字母匹配
        const letterMatch = userAnswer === correctAnswer
        
        // 方式2: 將用戶選擇的字母轉換為對應的答案文本進行匹配
        const userAnswerText = question.options[userAnswer.charCodeAt(0) - 65]
        const textMatch = userAnswerText === correctAnswer
        
        isCorrect = letterMatch || textMatch
        
        console.log(`Q${index + 1}: User "${userAnswer}" (${userAnswerText}) vs Correct "${correctAnswer}"`)
        console.log(`Letter match: ${letterMatch}, Text match: ${textMatch}, Final: ${isCorrect}`)
      }
      
      if (isCorrect) {
        correctCount++
      }
    })
    
    setScore(Math.round((correctCount / quizData.quiz.length) * 100))
    setSubmitted(true)
    setStep("results")
    
    console.log(`Final Score: ${correctCount}/${quizData.quiz.length} = ${Math.round((correctCount / quizData.quiz.length) * 100)}%`)
  }

  // 重置所有
  const resetAll = () => {
    setStep("config")
    setQuizData(null)
    setError(null)
    resetTest()
  }

  // 渲染配置階段
  if (step === "config") {
    return (
      <div className="h-96 bg-slate-50 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <Brain className="h-16 w-16 mx-auto mb-4 text-slate-400" />
          <h3 className="font-medium text-lg mb-2">智能測驗生成</h3>
          <p className="text-sm text-slate-600 mb-4">基於筆記內容自動生成測驗題目</p>
          <Button onClick={generateQuiz} disabled={loading}>
            <Sparkles className="h-4 w-4 mr-2" />
            生成測驗
          </Button>
          {error && (
            <Alert variant="destructive" className="mt-4 max-w-md">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    )
  }

  // 渲染生成中
  if (step === "generating") {
    return (
      <div className="h-96 flex flex-col items-center justify-center bg-slate-50 rounded-lg">
        <Sparkles className="h-16 w-16 text-blue-500 animate-pulse mb-4" />
        <p className="text-lg text-blue-700 mb-4">AI 正在生成測驗題目...</p>
        <Progress value={50} className="w-1/2" />
      </div>
    )
  }

  // 渲染預覽
  if (step === "preview" && quizData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-lg">測驗預覽</h3>
            <p className="text-sm text-gray-500">共 {quizData.quiz.length} 題</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={resetAll}>
              <RefreshCcw className="h-4 w-4 mr-2" />
              重新生成
            </Button>
            <Button onClick={startTest}>
              <Zap className="h-4 w-4 mr-2" />
              開始測驗
            </Button>
          </div>
        </div>

        <div className="grid gap-4">
          {quizData.quiz.map((question, index) => (
            <Card key={index}>
              <CardHeader className="pb-3">
                <Badge variant="outline" className="w-fit">Q{index + 1}</Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="font-medium">{question.question}</div>
                  <div className="space-y-1">
                    {question.options.map((option, optIndex) => {
                      const letter = String.fromCharCode(65 + optIndex)
                      return (
                        <div key={optIndex} className="p-2 bg-gray-50 rounded text-sm">
                          <span className="font-medium mr-2">{letter}.</span>
                          {option}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // 渲染測驗
  if (step === "test" && quizData) {
    const currentQuestion = quizData.quiz[currentIndex]
    const progress = ((currentIndex + 1) / quizData.quiz.length) * 100
    const userAnswer = answers[currentIndex]

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-lg">測驗進行中</h3>
            <p className="text-sm text-gray-500">題目 {currentIndex + 1} / {quizData.quiz.length}</p>
          </div>
          <Button variant="outline" onClick={() => setStep("preview")}>
            返回預覽
          </Button>
        </div>

        <Progress value={progress} className="w-full" />

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{currentQuestion.question}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {currentQuestion.options.map((option, index) => {
                const letter = String.fromCharCode(65 + index)
                const isSelected = userAnswer === letter
                
                return (
                  <div
                    key={index}
                    className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer border ${
                      isSelected 
                        ? "bg-blue-50 border-blue-200" 
                        : "hover:bg-gray-50 border-gray-200"
                    }`}
                    onClick={() => selectAnswer(letter)}
                  >
                    <input
                      type="radio"
                      name={`question-${currentIndex}`}
                      value={letter}
                      checked={isSelected}
                      onChange={() => selectAnswer(letter)}
                      className="w-4 h-4"
                    />
                    <div className="flex-1">
                      <span className="font-medium mr-2">{letter}.</span>
                      {option}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-6 flex justify-between">
              <Button
                variant="outline"
                onClick={prevQuestion}
                disabled={currentIndex === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                上一題
              </Button>
              
              <Button
                onClick={nextQuestion}
                disabled={!userAnswer}
              >
                {currentIndex === quizData.quiz.length - 1 ? "完成測驗" : "下一題"}
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 渲染結果
  if (step === "results" && quizData) {
    const correctCount = quizData.quiz.filter((q, index) => {
      const userAnswer = answers[index]
      if (!userAnswer) return false
      
      // 支持字母匹配或文本匹配
      const letterMatch = userAnswer === q.correct
      const userAnswerText = q.options[userAnswer.charCodeAt(0) - 65]
      const textMatch = userAnswerText === q.correct
      
      return letterMatch || textMatch
    }).length
    
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="font-medium text-lg mb-2">測驗結果</h3>
          <div className="text-3xl font-bold text-blue-600 mb-2">{score}%</div>
          <p className="text-gray-600">你答對了 {correctCount} 題，總共 {quizData.quiz.length} 題</p>
        </div>

        {score < 60 && (
          <Alert>
            <Lightbulb className="h-4 w-4" />
            <AlertDescription>
              建議你再複習一下筆記內容以加深理解。
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2 justify-center">
          <Button onClick={startTest}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            重新測驗
          </Button>
          <Button variant="outline" onClick={resetAll}>
            重新生成
          </Button>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium">答案詳情</h4>
          {quizData.quiz.map((question, index) => {
            const userAnswer = answers[index]
            let isCorrect = false
            
            if (userAnswer) {
              const letterMatch = userAnswer === question.correct
              const userAnswerText = question.options[userAnswer.charCodeAt(0) - 65]
              const textMatch = userAnswerText === question.correct
              isCorrect = letterMatch || textMatch
            }
            
            return (
              <Card key={index} className={`border ${isCorrect ? 'border-green-200' : 'border-red-200'}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Q{index + 1}</Badge>
                    {isCorrect ? (
                      <Badge className="bg-green-100 text-green-700">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        正確
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <XCircle className="h-3 w-3 mr-1" />
                        錯誤
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="font-medium mb-2">{question.question}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-1">你的答案</div>
                    <div className={`text-sm p-2 rounded ${isCorrect ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                      {userAnswer ? `${userAnswer}. ${question.options[userAnswer.charCodeAt(0) - 65]}` : "未作答"}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-1">正確答案</div>
                    <div className="text-sm p-2 rounded bg-green-50 text-green-800 border border-green-200">
                      {/* 檢查正確答案是字母還是文本 */}
                      {question.correct.length === 1 && question.correct >= 'A' && question.correct <= 'D' 
                        ? `${question.correct}. ${question.options[question.correct.charCodeAt(0) - 65]}`
                        : `${question.options.findIndex(opt => opt === question.correct) >= 0 
                            ? String.fromCharCode(65 + question.options.findIndex(opt => opt === question.correct)) + '. ' 
                            : ''}${question.correct}`
                      }
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-1">解釋</div>
                    <div className="text-sm p-2 rounded bg-blue-50 text-blue-800">
                      {question.explanation}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    )
  }

  return null
}
