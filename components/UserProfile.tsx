'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useFormState, useFormStatus } from 'react-dom'
import {
  User,
  Users,
  Calendar,
  Star,
  Trophy,
  Heart,
  MessageSquare,
  Clock,
  Gamepad2,
  Award,
  Edit3,
  Save,
  X,
  ChevronLeft,
  Dice6,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Textarea } from '@/components/ui/Input'
import { StarRating } from '@/components/ui/StarRating'
import GameCard from '@/components/GameCard'
import { ReviewCard } from '@/components/ReviewCard'
import { SessionCard } from '@/components/SessionCard'
import { updateProfile } from '@/lib/actions'
import {
  cn,
  formatDate,
  formatDateTime,
  getStatusLabel,
} from '@/lib/utils'
import type {
  User as UserType,
  GameSession,
  Game,
  PlayerReview,
  GameReview,
} from '@/types'

function SaveButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" size="sm" loading={pending}>
      {pending ? '保存中...' : (
        <>
          <Save className="w-4 h-4" />
          保存
        </>
      )}
    </Button>
  )
}

type TabKey = 'sessions' | 'reviews' | 'favorites'

interface UserProfileProps {
  user: UserType
  currentUserId: string | null
  sessions: (GameSession & {
    game: Pick<Game, 'id' | 'name' | 'coverImage'>
    creator: Pick<UserType, 'id' | 'username' | 'avatar'>
    _count?: { registrations: number }
  })[]
  reviewsReceived: (PlayerReview & {
    reviewer: {
      id: string
      username: string
      avatar: string | null
    }
    session: {
      id: string
      title: string
    }
  })[]
  favorites: Game[]
}

export function UserProfile({
  user,
  currentUserId,
  sessions,
  reviewsReceived,
  favorites,
}: UserProfileProps) {
  const router = useRouter()
  const isOwnProfile = currentUserId === user.id
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState<TabKey>(
    sessions.length > 0 ? 'sessions' : reviewsReceived.length > 0 ? 'reviews' : 'favorites'
  )
  const [state, formAction] = useFormState(updateProfile, {
    error: false,
    message: '',
  })

  const hostedSessions = sessions.filter((s) => s.creatorId === user.id)
  const participatedSessions = sessions.filter(
    (s) => s.creatorId !== user.id
  )
  const completedSessions = sessions.filter(
    (s) => s.status === 'completed'
  )
  const upcomingSessions = sessions.filter(
    (s) => s.status === 'upcoming' || s.status === 'ongoing'
  )

  const stats = [
    {
      icon: Gamepad2,
      label: '总局数',
      value: user.totalGames,
      color: 'text-primary',
    },
    {
      icon: Trophy,
      label: '创建约局',
      value: hostedSessions.length,
      color: 'text-secondary',
    },
    {
      icon: Calendar,
      label: '参与约局',
      value: sessions.length,
      color: 'text-success',
    },
    {
      icon: Star,
      label: '平均评分',
      value: user.averageRating > 0 ? user.averageRating.toFixed(1) : '-',
      color: 'text-warning',
    },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>返回首页</span>
        </Link>
      </div>

      {state?.message && (
        <div
          className={cn(
            'mb-6 p-4 rounded-xl border',
            state.error
              ? 'bg-danger/10 border-danger/30 text-danger'
              : 'bg-success/10 border-success/30 text-success'
          )}
        >
          {state.message}
        </div>
      )}

      <Card className="mb-8 overflow-hidden">
        <div className="h-32 bg-gradient-to-br from-primary/30 via-background to-secondary/20" />
        <CardContent className="-mt-16">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="relative">
              <img
                src={
                  user.avatar ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`
                }
                alt={user.username}
                className="w-28 h-28 rounded-2xl border-4 border-card bg-background object-cover"
              />
              {isOwnProfile && (
                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-lg">
                  <Award className="w-4 h-4" />
                </div>
              )}
            </div>

            <div className="flex-1 w-full">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl font-bold text-text-primary font-display">
                      {user.username}
                    </h1>
                    {user.averageRating > 0 && (
                      <div className="flex items-center gap-1.5">
                        <StarRating
                          value={Math.round(user.averageRating)}
                          readOnly
                          size="sm"
                        />
                        <span className="text-sm font-medium text-text-primary">
                          {user.averageRating.toFixed(1)}
                        </span>
                        <span className="text-xs text-text-muted">
                          ({reviewsReceived.length}条评价)
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-text-muted mb-2">
                    加入于 {formatDate(user.createdAt)}
                  </p>

                  {isEditing && isOwnProfile ? (
                    <form action={formAction} className="mt-4 space-y-4">
                      <Textarea
                        name="bio"
                        label="个人简介"
                        placeholder="介绍一下你自己，比如喜欢的桌游类型、常去的桌游吧等..."
                        rows={3}
                        maxLength={500}
                        defaultValue={user.bio || ''}
                      />
                      <div className="flex items-center gap-3">
                        <SaveButton />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsEditing(false)}
                        >
                          <X className="w-4 h-4" />
                          取消
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <>
                      {user.bio ? (
                        <p className="text-text-secondary leading-relaxed mt-3 max-w-2xl whitespace-pre-wrap">
                          {user.bio}
                        </p>
                      ) : (
                        isOwnProfile && (
                          <p className="text-text-muted mt-3 text-sm">
                            你还没有填写个人简介，点击编辑按钮介绍一下自己吧~
                          </p>
                        )
                      )}
                    </>
                  )}
                </div>

                {isOwnProfile && !isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit3 className="w-4 h-4" />
                    编辑资料
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-8">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="p-4 rounded-xl bg-background border border-border text-center"
              >
                <stat.icon
                  className={cn('w-6 h-6 mx-auto mb-2', stat.color)}
                />
                <p className="text-2xl font-bold text-text-primary">
                  {stat.value}
                </p>
                <p className="text-xs text-text-muted mt-0.5">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t border-border text-sm">
            <div className="flex items-center gap-2 text-text-secondary">
              <Clock className="w-4 h-4 text-success" />
              <span>
                <span className="font-medium text-success">
                  {upcomingSessions.length}
                </span>{' '}
                场进行中
              </span>
            </div>
            <div className="flex items-center gap-2 text-text-secondary">
              <Trophy className="w-4 h-4 text-secondary" />
              <span>
                <span className="font-medium text-secondary">
                  {completedSessions.length}
                </span>{' '}
                场已完成
              </span>
            </div>
            <div className="flex items-center gap-2 text-text-secondary">
              <Heart className="w-4 h-4 text-danger" />
              <span>
                <span className="font-medium text-danger">
                  {favorites.length}
                </span>{' '}
                款收藏
              </span>
            </div>
            <div className="flex items-center gap-2 text-text-secondary">
              <MessageSquare className="w-4 h-4 text-primary" />
              <span>
                <span className="font-medium text-primary">
                  {reviewsReceived.length}
                </span>{' '}
                条评价
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-1 mb-6 p-1 bg-card rounded-xl border border-border w-fit overflow-x-auto">
        {[
          {
            key: 'sessions' as const,
            label: '约局记录',
            icon: Calendar,
            count: sessions.length,
          },
          {
            key: 'reviews' as const,
            label: '收到的评价',
            icon: MessageSquare,
            count: reviewsReceived.length,
          },
          {
            key: 'favorites' as const,
            label: '收藏的桌游',
            icon: Heart,
            count: favorites.length,
          },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all duration-200',
              activeTab === tab.key
                ? 'bg-primary text-white shadow-sm'
                : 'text-text-secondary hover:text-text-primary hover:bg-background'
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            <Badge
              variant={activeTab === tab.key ? 'default' : 'default'}
              className={cn(
                'text-xs',
                activeTab === tab.key
                  ? 'bg-white/20 text-white'
                  : 'bg-background text-text-muted'
              )}
            >
              {tab.count}
            </Badge>
          </button>
        ))}
      </div>

      {activeTab === 'sessions' && (
        <div>
          {sessions.length === 0 ? (
            <Card className="p-12 text-center">
              <Calendar className="w-16 h-16 text-text-muted mx-auto mb-4 opacity-30" />
              <h3 className="text-xl font-bold text-text-primary mb-2">
                暂无约局记录
              </h3>
              <p className="text-text-secondary mb-6">
                {isOwnProfile
                  ? '快去参加或创建你的第一场桌游约局吧！'
                  : '这位玩家还没有参加过约局'}
              </p>
              {isOwnProfile && (
                <Link href="/sessions/create">
                  <Button>
                    <Dice6 className="w-4 h-4" />
                    创建约局
                  </Button>
                </Link>
              )}
            </Card>
          ) : (
            <div>
              {hostedSessions.length > 0 && (
                <div className="mb-10">
                  <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-secondary" />
                    创建的约局
                    <Badge variant="secondary" className="ml-2">
                      {hostedSessions.length}
                    </Badge>
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {hostedSessions.map((session) => (
                      <SessionCard
                        key={session.id}
                        session={session as any}
                        currentUserId={currentUserId || undefined}
                      />
                    ))}
                  </div>
                </div>
              )}

              {participatedSessions.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    参与的约局
                    <Badge variant="primary" className="ml-2">
                      {participatedSessions.length}
                    </Badge>
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {participatedSessions.map((session) => (
                      <SessionCard
                        key={session.id}
                        session={session as any}
                        currentUserId={currentUserId || undefined}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'reviews' && (
        <div>
          {reviewsReceived.length === 0 ? (
            <Card className="p-12 text-center">
              <MessageSquare className="w-16 h-16 text-text-muted mx-auto mb-4 opacity-30" />
              <h3 className="text-xl font-bold text-text-primary mb-2">
                暂无评价
              </h3>
              <p className="text-text-secondary">
                {isOwnProfile
                  ? '完成更多约局后，小伙伴们会给你评价哦~'
                  : '这位玩家还没有收到过评价'}
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviewsReceived.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review as any}
                  type="player"
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'favorites' && (
        <div>
          {favorites.length === 0 ? (
            <Card className="p-12 text-center">
              <Heart className="w-16 h-16 text-text-muted mx-auto mb-4 opacity-30" />
              <h3 className="text-xl font-bold text-text-primary mb-2">
                还没有收藏
              </h3>
              <p className="text-text-secondary mb-6">
                {isOwnProfile
                  ? '去桌游库看看，收藏你喜欢的桌游吧！'
                  : '这位玩家还没有收藏任何桌游'}
              </p>
              {isOwnProfile && (
                <Link href="/games">
                  <Button>
                    <Gamepad2 className="w-4 h-4" />
                    浏览桌游库
                  </Button>
                </Link>
              )}
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {favorites.map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  isFavorited={true}
                  showFavorite={isOwnProfile}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
