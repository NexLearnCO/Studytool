"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Sparkles,
  Zap,
  Edit,
  Trash2,
  Plus,
  Save,
  CheckCircle,
  Clock,
  BookOpen,
  Brain
} from "lucide-react"

// 統一的閃卡數據結構 (基於 Claude 建議)
interface Flashcard {
  id: string
  source: 'note' | 'direct' | 'manual'
  sourceId?: string
  
  // 卡片內容
  question: string
  answer: string
  
  // 可選增強內容
  hint?: string
  explanation?: string
  tags?: string[]
  difficulty?: 1 | 2 | 3 | 4 | 5
  
  // 元數據
  createdAt: Date
  updatedAt: Date
  reviewCount: number
  isSelected: boolean
}

interface FlashcardDeck {
  id: string
  name: string
  description?: string
  cards: Flashcard[]
  
  // 統計
  stats: {
    total: number
    new: number
    learning: number
    due: number
  }
  
  createdAt: Date
  updatedAt: Date
}

interface FlashcardGenerationTabProps {
  noteContent: string
  noteTitle: string
}

export default function FlashcardGenerationTab({ 
  noteContent, 
  noteTitle 
}: FlashcardGenerationTabProps) {
  const [generationStep, setGenerationStep] = useState<"configure" | "generating" | "review">("configure")
  const [generatedCards, setGeneratedCards] = useState<Flashcard[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [deckName, setDeckName] = useState(`${noteTitle} - 閃卡`)
  const [cardCount, setCardCount] = useState("10")
  const [difficulty, setDifficulty] = useState("mixed")
  const [success, setSuccess] = useState(false)

  const generateFlashcards = async () => {
    setIsGenerating(true)
    setGenerationStep("generating")
    
    try {
      // 調用後端 API 生成閃卡
      const response = await fetch('/api/generate-flashcards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: noteContent,
          title: noteTitle,
          cardCount: parseInt(cardCount),
          difficulty: difficulty
        })
      })

      if (!response.ok) {
        throw new Error('生成失敗')
      }

      const data = await response.json()
      
      // 轉換為統一格式
      const cards: Flashcard[] = data.flashcards.map((card: any, index: number) => ({
        id: `card_${Date.now()}_${index}`,
        source: 'note' as const,
        sourceId: noteTitle,
        question: card.question,
        answer: card.answer,
        hint: card.hint,
        difficulty: card.difficulty || 3,
        tags: card.tags || [],
        createdAt: new Date(),
        updatedAt: new Date(),
        reviewCount: 0,
        isSelected: true
      }))

      setGeneratedCards(cards)
      setGenerationStep("review")
      
    } catch (error) {
      console.error('生成閃卡失敗:', error)
      alert('生成閃卡失敗，請稍後再試')
    } finally {
      setIsGenerating(false)
    }
  }

  const toggleCardSelection = (cardId: string) => {
    setGeneratedCards(cards => 
      cards.map(card => 
        card.id === cardId 
          ? { ...card, isSelected: !card.isSelected }
          : card
      )
    )
  }

  const editCard = (cardId: string, updates: Partial<Flashcard>) => {
    setGeneratedCards(cards =>
      cards.map(card =>
        card.id === cardId
          ? { ...card, ...updates, updatedAt: new Date() }
          : card
      )
    )
  }

  const deleteCard = (cardId: string) => {
    setGeneratedCards(cards => cards.filter(card => card.id !== cardId))
  }

  const saveDeck = () => {
    const selectedCards = generatedCards.filter(card => card.isSelected)
    
    if (selectedCards.length === 0) {
      alert('請至少選擇一張卡片')
      return
    }

    const deck: FlashcardDeck = {
      id: `deck_${Date.now()}`,
      name: deckName,
      description: `Generated from note: ${noteTitle}`,
      cards: selectedCards,
      stats: {
        total: selectedCards.length,
        new: selectedCards.length,
        learning: 0,
        due: 0
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // 保存到 localStorage
    const existingDecks = JSON.parse(localStorage.getItem('flashcard_decks') || '[]')
    existingDecks.push(deck)
    localStorage.setItem('flashcard_decks', JSON.stringify(existingDecks))

    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  const resetGeneration = () => {
    setGenerationStep("configure")
    setGeneratedCards([])
    setIsGenerating(false)
  }

  if (generationStep === "configure") {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <Sparkles className="h-16 w-16 mx-auto mb-4 text-blue-500" />
          <h3 className="font-medium text-lg mb-2">記憶卡片生成</h3>
          <p className="text-sm text-gray-500 mb-6">
            AI 將分析您的筆記內容，提取關鍵概念生成高質量的記憶卡片
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Brain className="h-5 w-5" />
              生成設置
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">卡組名稱</label>
                <Input
                  value={deckName}
                  onChange={(e) => setDeckName(e.target.value)}
                  placeholder="輸入卡組名稱"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">卡片數量</label>
                <Select value={cardCount} onValueChange={setCardCount}>
                  <SelectTrigger>
                    <SelectValue placeholder="選擇數量" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 張</SelectItem>
                    <SelectItem value="10">10 張</SelectItem>
                    <SelectItem value="15">15 張</SelectItem>
                    <SelectItem value="20">20 張</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">難度設定</label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger>
                  <SelectValue placeholder="選擇難度" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">簡單 - 基礎概念</SelectItem>
                  <SelectItem value="mixed">混合 - 各種難度</SelectItem>
                  <SelectItem value="hard">困難 - 深度理解</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="pt-4">
              <Button 
                onClick={generateFlashcards}
                className="w-full"
                size="lg"
              >
                <Zap className="h-4 w-4 mr-2" />
                生成記憶卡片
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (generationStep === "generating") {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="font-medium text-lg mb-2">AI 正在分析筆記內容</h3>
          <p className="text-sm text-gray-500 mb-4">
            正在提取關鍵概念並生成記憶卡片...
          </p>
          <Progress value={75} className="w-full max-w-md mx-auto" />
        </div>
      </div>
    )
  }

  if (generationStep === "review") {
    const selectedCount = generatedCards.filter(card => card.isSelected).length
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-lg">生成結果</h3>
            <p className="text-sm text-gray-500">
              生成了 {generatedCards.length} 張卡片，已選擇 {selectedCount} 張
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={resetGeneration}>
              重新生成
            </Button>
            <Button onClick={saveDeck} disabled={selectedCount === 0}>
              <Save className="h-4 w-4 mr-2" />
              保存卡組 ({selectedCount})
            </Button>
          </div>
        </div>

        <div className="grid gap-4">
          {generatedCards.map((card, index) => (
            <Card key={card.id} className={`${card.isSelected ? 'ring-2 ring-blue-500' : 'opacity-60'}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={card.isSelected}
                      onCheckedChange={() => toggleCardSelection(card.id)}
                    />
                    <Badge variant="outline">#{index + 1}</Badge>
                    {card.difficulty && (
                      <Badge variant={card.difficulty <= 2 ? "default" : card.difficulty <= 4 ? "secondary" : "destructive"}>
                        難度 {card.difficulty}
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => {}}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => deleteCard(card.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">問題</div>
                  <div className="text-sm bg-blue-50 p-3 rounded">{card.question}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">答案</div>
                  <div className="text-sm bg-gray-50 p-3 rounded">{card.answer}</div>
                </div>
                {card.hint && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-1">提示</div>
                    <div className="text-sm bg-yellow-50 p-3 rounded text-yellow-800">{card.hint}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              閃卡組已成功保存！您可以在閃卡頁面中找到並開始學習。
            </AlertDescription>
          </Alert>
        )}
      </div>
    )
  }

  return null
}
