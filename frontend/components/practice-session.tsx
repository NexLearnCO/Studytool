"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle, X, Clock, Target, Brain, ArrowRight, RotateCcw, BookOpen, Award, TrendingUp } from "lucide-react"

interface Question {
  id: string
  type: "multiple-choice" | "short-answer" | "long-answer"
  question: string
  options?: string[]
  correctAnswer: string
  explanation: string
  difficulty: "Easy" | "Medium" | "Hard"
  topic: string
  points: number
}

export function PracticeSession() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState("")
  const [shortAnswer, setShortAnswer] = useState("")
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [sessionComplete, setSessionComplete] = useState(false)

  const questions: Question[] = [
    {
      id: "q1",
      type: "multiple-choice",
      question: "What is the oxidation state of sulfur in H₂SO₄?",
      options: ["+2", "+4", "+6", "+8"],
      correctAnswer: "+6",
      explanation:
        "In H₂SO₄, hydrogen has +1 and oxygen has -2. Since the compound is neutral: 2(+1) + S + 4(-2) = 0, so S = +6.",
      difficulty: "Medium",
      topic: "Oxidation States",
      points: 10,
    },
    {
      id: "q2",
      type: "short-answer",
      question: "What is the molecular formula for glucose?",
      correctAnswer: "C₆H₁₂O₆",
      explanation:
        "Glucose is a simple sugar with the molecular formula C₆H₁₂O₆, containing 6 carbon atoms, 12 hydrogen atoms, and 6 oxygen atoms.",
      difficulty: "Easy",
      topic: "Biochemistry",
      points: 5,
    },
    {
      id: "q3",
      type: "multiple-choice",
      question: "Which of the following is NOT a characteristic of SN2 reactions?",
      options: [
        "Backside attack mechanism",
        "Inversion of stereochemistry",
        "Formation of carbocation intermediate",
        "Concerted mechanism",
      ],
      correctAnswer: "Formation of carbocation intermediate",
      explanation:
        "SN2 reactions proceed through a concerted mechanism without forming carbocation intermediates. Carbocation formation is characteristic of SN1 reactions.",
      difficulty: "Hard",
      topic: "Organic Chemistry",
      points: 15,
    },
  ]

  const currentQuestion = questions[currentQuestionIndex]

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleSubmitAnswer = () => {
    const userAnswer = currentQuestion.type === "short-answer" ? shortAnswer : selectedAnswer
    const isCorrect = userAnswer.toLowerCase().trim() === currentQuestion.correctAnswer.toLowerCase().trim()

    if (isCorrect) {
      setScore((prev) => prev + currentQuestion.points)
    }

    setShowResult(true)
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
      setSelectedAnswer("")
      setShortAnswer("")
      setShowResult(false)
    } else {
      setSessionComplete(true)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-100 text-green-800 border-green-200"
      case "Medium":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "Hard":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-slate-100 text-slate-800 border-slate-200"
    }
  }

  if (sessionComplete) {
    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0)
    const percentage = Math.round((score / totalPoints) * 100)

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="text-center">
          <CardContent className="p-8">
            <div className="h-16 w-16 mx-auto mb-4 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center">
              <Award className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Practice Session Complete!</h2>
            <p className="text-slate-600 mb-6">Great job on completing your practice session</p>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{score}</div>
                <div className="text-sm text-blue-700">Points Earned</div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{percentage}%</div>
                <div className="text-sm text-green-700">Accuracy</div>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{formatTime(timeElapsed)}</div>
                <div className="text-sm text-purple-700">Time Taken</div>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                <TrendingUp className="h-4 w-4 mr-2" />
                View Detailed Analysis
              </Button>
              <Button variant="outline">
                <RotateCcw className="h-4 w-4 mr-2" />
                Practice Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress Header */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Badge variant="outline" className={getDifficultyColor(currentQuestion.difficulty)}>
                {currentQuestion.difficulty}
              </Badge>
              <Badge variant="secondary">{currentQuestion.topic}</Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-600">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{formatTime(timeElapsed)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Target className="h-4 w-4" />
                <span>
                  {currentQuestionIndex + 1}/{questions.length}
                </span>
              </div>
            </div>
          </div>
          <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} className="h-2" />
        </CardContent>
      </Card>

      {/* Question Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Question {currentQuestionIndex + 1}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-lg leading-relaxed">{currentQuestion.question}</div>

          {!showResult && (
            <div className="space-y-4">
              {currentQuestion.type === "multiple-choice" && currentQuestion.options && (
                <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
                  {currentQuestion.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-slate-50">
                      <RadioGroupItem value={option} id={`option-${index}`} />
                      <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {currentQuestion.type === "short-answer" && (
                <Textarea
                  placeholder="Enter your answer here..."
                  value={shortAnswer}
                  onChange={(e) => setShortAnswer(e.target.value)}
                  className="min-h-[100px]"
                />
              )}

              <Button onClick={handleSubmitAnswer} disabled={!selectedAnswer && !shortAnswer.trim()} className="w-full">
                Submit Answer
              </Button>
            </div>
          )}

          {showResult && (
            <div className="space-y-4">
              <div
                className={`p-4 rounded-lg border-2 ${
                  (currentQuestion.type === "short-answer" ? shortAnswer : selectedAnswer).toLowerCase().trim() ===
                  currentQuestion.correctAnswer.toLowerCase().trim()
                    ? "bg-green-50 border-green-200"
                    : "bg-red-50 border-red-200"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {(currentQuestion.type === "short-answer" ? shortAnswer : selectedAnswer).toLowerCase().trim() ===
                  currentQuestion.correctAnswer.toLowerCase().trim() ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <X className="h-5 w-5 text-red-600" />
                  )}
                  <span className="font-medium">
                    {(currentQuestion.type === "short-answer" ? shortAnswer : selectedAnswer).toLowerCase().trim() ===
                    currentQuestion.correctAnswer.toLowerCase().trim()
                      ? "Correct!"
                      : "Incorrect"}
                  </span>
                </div>
                <p className="text-sm">
                  <strong>Correct Answer:</strong> {currentQuestion.correctAnswer}
                </p>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-900">Explanation</span>
                </div>
                <p className="text-sm text-blue-800">{currentQuestion.explanation}</p>
              </div>

              <Button onClick={handleNextQuestion} className="w-full">
                {currentQuestionIndex < questions.length - 1 ? (
                  <>
                    Next Question
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                ) : (
                  "Complete Session"
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Score Display */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Current Score</span>
            <span className="font-bold text-lg">{score} points</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
