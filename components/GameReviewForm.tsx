'use client'

import { useState, useTransition, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { StarRating } from '@/components/ui/StarRating'
import { Textarea } from '@/components/ui/Input'
import { submitGameReview } from '@/lib/actions'
import { Dice6, Gamepad2, Heart, Users, User, Send, CheckCircle2, Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface GameInfo {
  id: string
  name: string
  coverImage: string
}

interface GameReviewFormProps {
  sessionId: string
  game: GameInfo
  className?: string
  onSuccess?: () => void
}

export function GameReviewForm({ sessionId, game, className, onSuccess }: GameReviewFormProps) {
  const [overallRating, setOverallRating] = useState(5)
  const [strategy, setStrategy] = useState(5)
  const [fun, setFun] = useState(5)
  const [interaction, setInteraction] = useState(5)
  const [luck, setLuck] = useState(3)
  const [submitted, setSubmitted] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [state, setState] = useState<{ error?: boolean; message?: string; success?: boolean } | null>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.set('overallRating', overallRating.toString())
    formData.set('strategy', strategy.toString())
    formData.set('fun', fun.toString())
    formData.set('interaction', interaction.toString())
    formData.set('luck', luck.toString())

    startTransition(async () => {
      const result = await submitGameReview(sessionId, formData)
      setState(result)
    })
  }

  useEffect(() => {
    if (state?.success && !submitted) {
      setSubmitted(true)
      onSuccess?.()
    }
  }, [state, submitted, onSuccess])

  return (
    <Card className={cn('animate-fade-in', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Dice6 className="w-5 h-5 text-primary" />
          评价桌游
        </CardTitle>
      </CardHeader>
      <CardContent>
        {submitted ? (
          <div className="text-center py-8">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-success" />
            <p className="text-text-primary font-medium mb-1">评价已提交</p>
            <p className="text-text-muted text-sm mb-4">感谢你对「{game.name}」的反馈！</p>
            <Button
              variant="outline"
              onClick={() => {
                setSubmitted(false)
                setOverallRating(5)
                setStrategy(5)
                setFun(5)
                setInteraction(5)
                setLuck(3)
              }}
            >
              修改评价
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex items-center gap-4 p-4 bg-background rounded-xl border border-border">
              <img
                src={game.coverImage}
                alt={game.name}
                className="w-20 h-28 object-cover rounded-lg shrink-0"
              />
              <div className="flex-1">
                <h4 className="font-semibold text-text-primary text-lg mb-2">{game.name}</h4>
                <div className="flex items-center gap-2 mb-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-sm text-text-secondary">综合评分</span>
                </div>
                <StarRating
                  value={overallRating}
                  onChange={setOverallRating}
                  size="lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-background rounded-xl p-4 border border-border">
                <div className="flex items-center gap-2 mb-3">
                  <Gamepad2 className="w-4 h-4 text-text-muted" />
                  <span className="text-sm font-medium text-text-secondary">策略深度</span>
                </div>
                <StarRating
                  value={strategy}
                  onChange={setStrategy}
                  size="md"
                />
              </div>
              <div className="bg-background rounded-xl p-4 border border-border">
                <div className="flex items-center gap-2 mb-3">
                  <Heart className="w-4 h-4 text-text-muted" />
                  <span className="text-sm font-medium text-text-secondary">趣味性</span>
                </div>
                <StarRating
                  value={fun}
                  onChange={setFun}
                  size="md"
                />
              </div>
              <div className="bg-background rounded-xl p-4 border border-border">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4 text-text-muted" />
                  <span className="text-sm font-medium text-text-secondary">互动性</span>
                </div>
                <StarRating
                  value={interaction}
                  onChange={setInteraction}
                  size="md"
                />
              </div>
              <div className="bg-background rounded-xl p-4 border border-border">
                <div className="flex items-center gap-2 mb-3">
                  <User className="w-4 h-4 text-text-muted" />
                  <span className="text-sm font-medium text-text-secondary">运气成分</span>
                </div>
                <StarRating
                  value={luck}
                  onChange={setLuck}
                  size="md"
                />
              </div>
            </div>

            <Textarea
              name="comment"
              label="评论（可选）"
              placeholder="分享你对这款桌游的体验和建议..."
              rows={4}
              maxLength={500}
            />

            {state?.error && (
              <div className="p-3 rounded-lg bg-danger/10 border border-danger/30 text-danger text-sm">
                {state.message}
              </div>
            )}

            <Button
              type="submit"
              disabled={isPending}
              loading={isPending}
              className="w-full"
            >
              <Send className="w-4 h-4" />
              提交评价
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  )
}

export default GameReviewForm
