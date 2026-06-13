'use client'

import { useState, useTransition } from 'react'
import {
  Calendar,
  MapPin,
  Users,
  Copy,
  Check,
  Share2,
  Lock,
  Unlock,
  Clock,
  Play,
  XCircle,
  CheckCircle2,
  ChevronLeft,
  MessageSquare,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { SessionParticipants } from '@/components/SessionParticipants'
import PlayerReviewForm from '@/components/PlayerReviewForm'
import GameReviewForm from '@/components/GameReviewForm'
import { ReviewCard } from '@/components/ReviewCard'
import { SessionMessageList } from '@/components/SessionMessageList'
import { SessionMessageForm } from '@/components/SessionMessageForm'
import {
  joinSession,
  leaveSession,
  cancelSession,
  completeSession,
} from '@/lib/actions'
import {
  formatDateTime,
  cn,
  getStatusLabel,
} from '@/lib/utils'
import type { GameSession, Game, User, PlayerReview, GameReview, SessionMessage } from '@/types'

interface Participant {
  user: {
    id: string
    username: string
    avatar: string | null
    averageRating: number
    totalGames: number
  }
  status: string
  isCreator?: boolean
}

interface SessionDetailProps {
  session: GameSession & {
    game: Game
    creator: Pick<User, 'id' | 'username' | 'avatar'>
    registrations: {
      id: string
      status: string
      user: {
        id: string
        username: string
        avatar: string | null
        averageRating: number
        totalGames: number
      }
    }[]
    playerReviews: (PlayerReview & {
      reviewer: {
        id: string
        username: string
        avatar: string | null
      }
    })[]
    gameReviews: (GameReview & {
      user: {
        id: string
        username: string
        avatar: string | null
      }
    })[]
    messages: (SessionMessage & {
      user: {
        id: string
        username: string
        avatar: string | null
      }
    })[]
  }
  currentUser: User | null
}

export function SessionDetail({ session, currentUser }: SessionDetailProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [inviteCopied, setInviteCopied] = useState(false)
  const [playerReviewsRefreshKey, setPlayerReviewsRefreshKey] = useState(0)
  const [gameReviewsRefreshKey, setGameReviewsRefreshKey] = useState(0)

  const participants: Participant[] = session.registrations.map((r) => ({
    user: r.user,
    status: r.status,
    isCreator: r.user.id === session.creatorId,
  }))

  const approvedParticipants = participants.filter((p) => p.status === 'approved')
  const participantUserIds = approvedParticipants.map((p) => p.user.id)
  const isCreator = currentUser?.id === session.creatorId
  const isParticipant = currentUser ? participantUserIds.includes(currentUser.id) : false
  const isFull = approvedParticipants.length >= session.maxPlayers

  const hasReviewedGame = currentUser
    ? session.gameReviews.some((r) => r.userId === currentUser.id)
    : false

  const reviewedPlayerIds = currentUser
    ? session.playerReviews
        .filter((r) => r.reviewerId === currentUser.id)
        .map((r) => r.revieweeId)
    : []

  const showAction: string | null = (() => {
    if (!currentUser) return 'login'
    if (session.status === 'cancelled') return null
    if (session.status === 'completed') return null
    if (isCreator) return 'creator'
    if (isParticipant) return 'leave'
    if (isFull) return 'full'
    if (!session.isPublic) return 'join_private'
    return 'join'
  })()

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 4000)
  }

  const handleJoin = () => {
    startTransition(async () => {
      const result = await joinSession(session.id)
      if (result.success) {
        showMessage('success', result.message || '报名成功！')
        router.refresh()
      } else {
        showMessage('error', result.message || '报名失败')
      }
    })
  }

  const handleLeave = () => {
    if (!confirm('确定要退出这个约局吗？')) return
    startTransition(async () => {
      const result = await leaveSession(session.id)
      if (result.success) {
        showMessage('success', result.message || '已退出约局')
        router.refresh()
      } else {
        showMessage('error', result.message || '退出失败')
      }
    })
  }

  const handleCancel = () => {
    if (!confirm('确定要取消这个约局吗？所有参与者将收到通知。')) return
    startTransition(async () => {
      const result = await cancelSession(session.id)
      if (result.success) {
        showMessage('success', result.message || '约局已取消')
        router.refresh()
      } else {
        showMessage('error', result.message || '取消失败')
      }
    })
  }

  const handleComplete = () => {
    if (!confirm('确定要结束这个约局吗？结束后可以进行互评。')) return
    startTransition(async () => {
      const result = await completeSession(session.id)
      if (result.success) {
        showMessage('success', result.message || '约局已结束')
        router.refresh()
      } else {
        showMessage('error', result.message || '操作失败')
      }
    })
  }

  const handleCopyInvite = async () => {
    try {
      const url = `${window.location.origin}/sessions/invite/${session.inviteCode}`
      await navigator.clipboard.writeText(url)
      setInviteCopied(true)
      setTimeout(() => setInviteCopied(false), 2000)
    } catch {
      showMessage('error', '复制失败，请手动复制')
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `桌游约局：${session.title}`,
          text: `桌游：${session.game.name}\n时间：${formatDateTime(session.startTime)}\n地点：${session.location}\n邀请码：${session.inviteCode}`,
          url: window.location.href,
        })
      } catch {}
    } else {
      handleCopyInvite()
    }
  }

  const statusBadgeVariant = (() => {
    switch (session.status) {
      case 'upcoming':
        return 'primary' as const
      case 'ongoing':
        return 'success' as const
      case 'completed':
        return 'secondary' as const
      case 'cancelled':
        return 'danger' as const
      default:
        return 'default' as const
    }
  })()

  const participantsForReview = approvedParticipants.map((p) => p.user)
  const availableForPlayerReview = currentUser
    ? participantsForReview.filter(
        (p) => p.id !== currentUser.id && !reviewedPlayerIds.includes(p.id)
      )
    : []

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href="/sessions"
          className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>返回约局列表</span>
        </Link>
      </div>

      {message && (
        <div
          className={cn(
            'mb-6 p-4 rounded-xl border',
            message.type === 'success'
              ? 'bg-success/10 border-success/30 text-success'
              : 'bg-danger/10 border-danger/30 text-danger'
          )}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-1">
          <Card className="overflow-hidden sticky top-20">
            <div className="aspect-[4/3] overflow-hidden">
              <img
                src={session.game.coverImage}
                alt={session.game.name}
                className="w-full h-full object-cover"
              />
            </div>
            <CardContent>
              <Link
                href={`/games/${session.game.id}`}
                className="inline-block mb-3"
              >
                <h3 className="text-lg font-bold text-text-primary hover:text-primary transition-colors">
                  {session.game.name}
                </h3>
              </Link>

              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="primary">
                  {session.game.minPlayers}-{session.game.maxPlayers} 人
                </Badge>
                <Badge variant="secondary">
                  约 {session.game.playTime} 分钟
                </Badge>
              </div>

              {isCreator && session.status === 'upcoming' && (
                <div className="p-4 rounded-xl bg-background border border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <Lock className="w-4 h-4 text-warning" />
                      <span className="text-text-secondary">邀请码</span>
                    </div>
                    <Badge variant="warning" className="font-mono tracking-wider">
                      {session.inviteCode}
                    </Badge>
                  </div>
                  <p className="text-xs text-text-muted">
                    {session.isPublic ? (
                      <>
                        <Unlock className="w-3 h-3 inline mr-1" />
                        当前为公开约局，邀请码可用于私密分享
                      </>
                    ) : (
                      <>
                        <Lock className="w-3 h-3 inline mr-1" />
                        当前为私密约局，仅通过邀请码可加入
                      </>
                    )}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyInvite}
                      className="flex-1"
                    >
                      {inviteCopied ? (
                        <>
                          <Check className="w-4 h-4" />
                          已复制
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          复制链接
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleShare}
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              <div className="mt-4 space-y-3">
                {showAction === 'login' && (
                  <Link href={`/login?callbackUrl=/sessions/${session.id}`} className="block">
                    <Button size="lg" className="w-full">
                      登录后报名
                    </Button>
                  </Link>
                )}
                {showAction === 'join' && (
                  <Button
                    size="lg"
                    className="w-full"
                    onClick={handleJoin}
                    loading={isPending}
                  >
                    <Play className="w-4 h-4" />
                    立即报名
                  </Button>
                )}
                {showAction === 'join_private' && (
                  <div className="space-y-2">
                    <div className="text-sm text-warning flex items-center gap-1.5">
                      <Lock className="w-4 h-4" />
                      这是一个私密约局
                    </div>
                    <p className="text-xs text-text-muted">
                      请向创建者获取邀请链接后加入
                    </p>
                  </div>
                )}
                {showAction === 'leave' && (
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full text-danger hover:text-danger hover:border-danger/50 hover:bg-danger/10"
                    onClick={handleLeave}
                    loading={isPending}
                  >
                    <XCircle className="w-4 h-4" />
                    退出约局
                  </Button>
                )}
                {showAction === 'full' && (
                  <div className="p-4 rounded-xl bg-danger/10 border border-danger/20 text-center">
                    <Users className="w-6 h-6 text-danger mx-auto mb-2" />
                    <p className="text-sm text-danger font-medium">约局已满员</p>
                  </div>
                )}
                {showAction === 'creator' && (
                  <div className="space-y-2">
                    {session.status === 'upcoming' && (
                      <Button
                        variant="success"
                        size="lg"
                        className="w-full"
                        onClick={handleComplete}
                        loading={isPending}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        结束约局
                      </Button>
                    )}
                    <Button
                      variant="danger"
                      size="lg"
                      className="w-full"
                      onClick={handleCancel}
                      loading={isPending}
                    >
                      <XCircle className="w-4 h-4" />
                      取消约局
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                    <Badge variant={statusBadgeVariant}>{getStatusLabel(session.status)}</Badge>
                    {!session.isPublic && <Badge variant="warning">私密约局</Badge>}
                    {isCreator && <Badge variant="success">我创建的</Badge>}
                    {isParticipant && !isCreator && <Badge variant="primary">已报名</Badge>}
                  </div>
                  <h1 className="text-3xl font-bold text-text-primary mb-2 font-display">
                    {session.title}
                  </h1>
                  <div className="flex items-center gap-3 text-text-secondary">
                    <Link
                      href={`/users/${session.creator.id}`}
                      className="flex items-center gap-2 hover:text-primary transition-colors"
                    >
                      <img
                        src={
                          session.creator.avatar ||
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.creator.username}`
                        }
                        alt={session.creator.username}
                        className="w-5 h-5 rounded-full"
                      />
                      <span>{session.creator.username}</span>
                    </Link>
                    <span>·</span>
                    <span className="text-sm">创建者</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={handleShare}>
                    <Share2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {session.description && (
                <div className="mb-6 p-4 rounded-xl bg-background border border-border">
                  <p className="text-text-secondary leading-relaxed whitespace-pre-wrap">
                    {session.description}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-background border border-border">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-text-muted mb-0.5">开始时间</p>
                    <p className="font-medium text-text-primary">
                      {formatDateTime(session.startTime)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-background border border-border">
                  <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm text-text-muted mb-0.5">约局地点</p>
                    <p className="font-medium text-text-primary">{session.location}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-background border border-border">
                  <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="text-sm text-text-muted mb-0.5">参与人数</p>
                    <p className="font-medium text-text-primary">
                      {approvedParticipants.length} / {session.maxPlayers} 人
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <SessionParticipants
                participants={participants}
                maxPlayers={session.maxPlayers}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                局内留言
                <Badge variant="secondary" className="text-xs">
                  {session.messages.length}
                </Badge>
              </CardTitle>
              <p className="text-sm text-text-muted mt-1">
                参与者可以在这里讨论战术、确认时间、分享经验
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <SessionMessageForm
                sessionId={session.id}
                canPost={isParticipant || isCreator}
              />
              <div className="border-t border-border/50 pt-4">
                <SessionMessageList
                  messages={session.messages as any}
                  creatorId={session.creatorId}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {session.status === 'completed' && isParticipant && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-success" />
            约局评价
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {!hasReviewedGame ? (
              <GameReviewForm
                key={`game-review-${gameReviewsRefreshKey}`}
                sessionId={session.id}
                game={{
                  id: session.game.id,
                  name: session.game.name,
                  coverImage: session.game.coverImage,
                }}
                onSuccess={() => {
                  setGameReviewsRefreshKey((k) => k + 1)
                  router.refresh()
                }}
              />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-success">
                    <CheckCircle2 className="w-5 h-5" />
                    桌游评价已完成
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-text-secondary text-sm">
                    感谢你对「{session.game.name}」的评价！
                  </p>
                </CardContent>
              </Card>
            )}

            {availableForPlayerReview.length > 0 ? (
              <PlayerReviewForm
                key={`player-review-${playerReviewsRefreshKey}`}
                sessionId={session.id}
                participants={participantsForReview}
                currentUserId={currentUser!.id}
                onSuccess={() => {
                  setPlayerReviewsRefreshKey((k) => k + 1)
                  router.refresh()
                }}
              />
            ) : reviewedPlayerIds.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-success">
                    <CheckCircle2 className="w-5 h-5" />
                    玩家评价已完成
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-text-secondary text-sm">
                    你已评价过所有玩家，感谢反馈！
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    评价玩家
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-text-secondary text-sm">
                    没有可评价的玩家。
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {(session.playerReviews.length > 0 || session.gameReviews.length > 0) && (
        <div className="space-y-8">
          {session.gameReviews.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-text-primary mb-6">
                桌游评价 ({session.gameReviews.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {session.gameReviews.map((review) => (
                  <ReviewCard
                    key={review.id}
                    review={{
                      ...review,
                      game: {
                        id: session.game.id,
                        name: session.game.name,
                        coverImage: session.game.coverImage,
                      },
                    }}
                    type="game"
                  />
                ))}
              </div>
            </div>
          )}

          {session.playerReviews.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-text-primary mb-6">
                玩家评价 ({session.playerReviews.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {session.playerReviews.map((review) => (
                  <ReviewCard
                    key={review.id}
                    review={{
                      ...review,
                      session: {
                        id: session.id,
                        title: session.title,
                      },
                    }}
                    type="player"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
