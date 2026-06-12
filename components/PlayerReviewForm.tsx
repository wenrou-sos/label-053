'use client'

import { useState, useTransition, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { StarRating } from '@/components/ui/StarRating'
import { Textarea, Select } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { submitPlayerReview } from '@/lib/actions'
import { Users, Clock, BookOpen, Heart, Send, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Participant {
  id: string
  username: string
  avatar: string | null
}

interface PlayerReviewFormProps {
  sessionId: string
  participants: Participant[]
  currentUserId: string
  className?: string
  onSuccess?: () => void
}

export function PlayerReviewForm({ sessionId, participants, currentUserId, className, onSuccess }: PlayerReviewFormProps) {
  const availableParticipants = participants.filter(p => p.id !== currentUserId)
  const [selectedReviewee, setSelectedReviewee] = useState<string>('')
  const [punctuality, setPunctuality] = useState(5)
  const [ruleKnowledge, setRuleKnowledge] = useState(5)
  const [sportsmanship, setSportsmanship] = useState(5)
  const [submitted, setSubmitted] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [state, setState] = useState<{ error?: boolean; message?: string; success?: boolean } | null>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.set('revieweeId', selectedReviewee)
    formData.set('punctuality', punctuality.toString())
    formData.set('ruleKnowledge', ruleKnowledge.toString())
    formData.set('sportsmanship', sportsmanship.toString())

    startTransition(async () => {
      const result = await submitPlayerReview(sessionId, formData)
      setState(result)
    })
  }

  useEffect(() => {
    if (state?.success && !submitted) {
      setSubmitted(true)
      onSuccess?.()
    }
  }, [state, submitted, onSuccess])

  if (availableParticipants.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="py-8 text-center">
          <Users className="w-12 h-12 mx-auto mb-3 text-text-muted opacity-30" />
          <p className="text-text-muted text-sm">没有可评价的玩家</p>
        </CardContent>
      </Card>
    )
  }

  const selectedParticipant = availableParticipants.find(p => p.id === selectedReviewee)

  return (
    <Card className={cn('animate-fade-in', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          评价玩家
        </CardTitle>
      </CardHeader>
      <CardContent>
        {submitted ? (
          <div className="text-center py-8">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-success" />
            <p className="text-text-primary font-medium mb-1">评价已提交</p>
            <p className="text-text-muted text-sm mb-4">感谢你的反馈！</p>
            <Button
              variant="outline"
              onClick={() => {
                setSubmitted(false)
                setSelectedReviewee('')
                setPunctuality(5)
                setRuleKnowledge(5)
                setSportsmanship(5)
              }}
            >
              评价其他玩家
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                选择评价对象
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-3">
                {availableParticipants.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedReviewee(p.id)}
                    className={cn(
                      'flex items-center gap-2 p-2.5 rounded-xl border transition-all duration-200 text-left',
                      selectedReviewee === p.id
                        ? 'border-primary bg-primary/10'
                        : 'border-border bg-background hover:border-primary/50'
                    )}
                  >
                    <img
                      src={p.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.username}`}
                      alt={p.username}
                      className="w-8 h-8 rounded-full shrink-0"
                    />
                    <span className={cn(
                      'text-sm truncate',
                      selectedReviewee === p.id ? 'text-primary font-medium' : 'text-text-primary'
                    )}>
                      {p.username}
                    </span>
                  </button>
                ))}
              </div>
              <input type="hidden" name="revieweeId" value={selectedReviewee} />
              {!selectedReviewee && state?.error && (
                <p className="text-sm text-danger">请选择要评价的玩家</p>
              )}
            </div>

            {selectedParticipant && (
              <div className="bg-background rounded-xl p-4 border border-border animate-scale-in">
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={selectedParticipant.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedParticipant.username}`}
                    alt={selectedParticipant.username}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <p className="font-medium text-text-primary">{selectedParticipant.username}</p>
                    <Badge variant="primary" className="mt-0.5">待评价</Badge>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-text-muted" />
                      <span className="text-sm text-text-secondary">准时守时</span>
                    </div>
                    <StarRating
                      value={punctuality}
                      onChange={setPunctuality}
                      size="md"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-text-muted" />
                      <span className="text-sm text-text-secondary">熟悉规则</span>
                    </div>
                    <StarRating
                      value={ruleKnowledge}
                      onChange={setRuleKnowledge}
                      size="md"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-text-muted" />
                      <span className="text-sm text-text-secondary">游戏态度</span>
                    </div>
                    <StarRating
                      value={sportsmanship}
                      onChange={setSportsmanship}
                      size="md"
                    />
                  </div>
                </div>
              </div>
            )}

            <Textarea
              name="comment"
              label="评论（可选）"
              placeholder="分享你的游戏体验..."
              rows={3}
              maxLength={500}
            />

            {state?.error && (
              <div className="p-3 rounded-lg bg-danger/10 border border-danger/30 text-danger text-sm">
                {state.message}
              </div>
            )}

            <Button
              type="submit"
              disabled={!selectedReviewee || isPending}
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

export default PlayerReviewForm
