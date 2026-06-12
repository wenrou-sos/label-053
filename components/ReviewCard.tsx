'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { StarRating } from '@/components/ui/StarRating'
import { Badge } from '@/components/ui/Badge'
import { Calendar, User, Gamepad2, Clock, Users, BookOpen, Heart } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PlayerReviewData {
  id: string
  punctuality: number
  ruleKnowledge: number
  sportsmanship: number
  comment: string | null
  createdAt: Date
  reviewer: {
    id: string
    username: string
    avatar: string | null
  }
  session?: {
    id: string
    title: string
  }
}

interface GameReviewData {
  id: string
  overallRating: number
  strategy: number
  fun: number
  interaction: number
  luck: number
  comment: string | null
  createdAt: Date
  user: {
    id: string
    username: string
    avatar: string | null
  }
  game?: {
    id: string
    name: string
    coverImage: string
  }
  session?: {
    id: string
    title: string
  }
}

interface ReviewCardProps {
  review: PlayerReviewData | GameReviewData
  type: 'player' | 'game'
  className?: string
}

export function ReviewCard({ review, type, className }: ReviewCardProps) {
  if (type === 'player') {
    const r = review as PlayerReviewData
    const avgRating = (r.punctuality + r.ruleKnowledge + r.sportsmanship) / 3

    return (
      <Card className={cn('animate-fade-in', className)}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Link href={`/users/${r.reviewer.id}`} className="shrink-0 hover:opacity-80 transition-opacity">
                <img
                  src={r.reviewer.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${r.reviewer.username}`}
                  alt={r.reviewer.username}
                  className="w-10 h-10 rounded-full bg-card"
                />
              </Link>
              <div>
                <Link
                  href={`/users/${r.reviewer.id}`}
                  className="font-medium text-text-primary hover:text-primary transition-colors"
                >
                  {r.reviewer.username}
                </Link>
                <div className="flex items-center gap-2 mt-0.5">
                  <StarRating value={Math.round(avgRating)} readOnly size="sm" />
                  <span className="text-sm text-text-muted">{avgRating.toFixed(1)}</span>
                </div>
              </div>
            </div>
            {r.session && (
              <Link href={`/sessions/${r.session.id}`}>
                <Badge variant="primary" className="shrink-0">
                  {r.session.title}
                </Badge>
              </Link>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-background rounded-lg p-3 text-center">
              <Clock className="w-4 h-4 mx-auto text-text-muted mb-1" />
              <p className="text-xs text-text-muted mb-1">准时</p>
              <StarRating value={r.punctuality} readOnly size="sm" />
            </div>
            <div className="bg-background rounded-lg p-3 text-center">
              <BookOpen className="w-4 h-4 mx-auto text-text-muted mb-1" />
              <p className="text-xs text-text-muted mb-1">规则</p>
              <StarRating value={r.ruleKnowledge} readOnly size="sm" />
            </div>
            <div className="bg-background rounded-lg p-3 text-center">
              <Heart className="w-4 h-4 mx-auto text-text-muted mb-1" />
              <p className="text-xs text-text-muted mb-1">态度</p>
              <StarRating value={r.sportsmanship} readOnly size="sm" />
            </div>
          </div>
          {r.comment && (
            <p className="text-text-secondary text-sm leading-relaxed">{r.comment}</p>
          )}
          <div className="flex items-center gap-1.5 mt-3 text-xs text-text-muted">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(r.createdAt).toLocaleDateString('zh-CN')}
          </div>
        </CardContent>
      </Card>
    )
  }

  const r = review as GameReviewData

  return (
    <Card className={cn('animate-fade-in', className)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Link href={`/users/${r.user.id}`} className="shrink-0 hover:opacity-80 transition-opacity">
              <img
                src={r.user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${r.user.username}`}
                alt={r.user.username}
                className="w-10 h-10 rounded-full bg-card"
              />
            </Link>
            <div>
              <Link
                href={`/users/${r.user.id}`}
                className="font-medium text-text-primary hover:text-primary transition-colors"
              >
                {r.user.username}
              </Link>
              <div className="flex items-center gap-2 mt-0.5">
                <StarRating value={r.overallRating} readOnly size="sm" />
                <span className="text-sm text-text-muted">{r.overallRating.toFixed(1)}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {r.session && (
              <Link href={`/sessions/${r.session.id}`}>
                <Badge variant="secondary" className="shrink-0">
                  {r.session.title}
                </Badge>
              </Link>
            )}
            {r.game && (
              <Link href={`/games/${r.game.id}`}>
                <Badge variant="primary" className="shrink-0">
                  <Gamepad2 className="w-3 h-3 mr-1" />
                  {r.game.name}
                </Badge>
              </Link>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="bg-background rounded-lg p-3 text-center">
            <Gamepad2 className="w-4 h-4 mx-auto text-text-muted mb-1" />
            <p className="text-xs text-text-muted mb-1">策略</p>
            <StarRating value={r.strategy} readOnly size="sm" />
          </div>
          <div className="bg-background rounded-lg p-3 text-center">
            <Heart className="w-4 h-4 mx-auto text-text-muted mb-1" />
            <p className="text-xs text-text-muted mb-1">趣味</p>
            <StarRating value={r.fun} readOnly size="sm" />
          </div>
          <div className="bg-background rounded-lg p-3 text-center">
            <Users className="w-4 h-4 mx-auto text-text-muted mb-1" />
            <p className="text-xs text-text-muted mb-1">互动</p>
            <StarRating value={r.interaction} readOnly size="sm" />
          </div>
          <div className="bg-background rounded-lg p-3 text-center">
            <User className="w-4 h-4 mx-auto text-text-muted mb-1" />
            <p className="text-xs text-text-muted mb-1">运气</p>
            <StarRating value={r.luck} readOnly size="sm" />
          </div>
        </div>
        {r.comment && (
          <p className="text-text-secondary text-sm leading-relaxed">{r.comment}</p>
        )}
        <div className="flex items-center gap-1.5 mt-3 text-xs text-text-muted">
          <Calendar className="w-3.5 h-3.5" />
          {new Date(r.createdAt).toLocaleDateString('zh-CN')}
        </div>
      </CardContent>
    </Card>
  )
}

export default ReviewCard
