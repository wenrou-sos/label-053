import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { StarRating } from '@/components/ui/StarRating'
import { cn, formatDateTime, getDifficultyColor, getDifficultyLabel, getStatusColor, getStatusLabel } from '@/lib/utils'
import { Dice6, Users, Trophy, Calendar, MapPin, User, ArrowRight, Sparkles, TrendingUp, Gamepad2, Clock } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [hotGames, recentSessions, stats] = await Promise.all([
    prisma.game.findMany({
      orderBy: [
        { totalRatings: 'desc' },
        { avgRating: 'desc' },
      ],
      take: 6,
    }),
    prisma.gameSession.findMany({
      where: {
        status: 'upcoming',
      },
      orderBy: {
        startTime: 'asc',
      },
      take: 4,
      include: {
        game: true,
        creator: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            registrations: true,
          },
        },
      },
    }),
    Promise.all([
      prisma.user.count(),
      prisma.game.count(),
      prisma.gameSession.count({ where: { status: 'upcoming' } }),
      prisma.gameSession.count(),
    ]),
  ])

  const [userCount, gameCount, upcomingSessionCount, totalSessionCount] = stats

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-secondary/10" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/30 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="text-center max-w-4xl mx-auto animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              <span>发现桌游，遇见同好</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold mb-6 leading-tight">
              <span className="text-text-primary">轻松约局</span>
              <br />
              <span className="gradient-text">玩转桌游世界</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-text-secondary mb-10 max-w-2xl mx-auto leading-relaxed">
              汇聚优质桌游，连接桌游爱好者。
              无论是策略深度的德式游戏，还是欢乐热闹的聚会桌游，
              都能在这里找到你的玩伴。
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/sessions"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-medium text-base transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-primary/25"
              >
                <Users className="w-5 h-5" />
                浏览约局广场
              </Link>
              <Link
                href="/games"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-card hover:bg-card-hover text-text-primary rounded-xl font-medium text-base border border-border transition-all duration-200 hover:scale-105"
              >
                <Gamepad2 className="w-5 h-5" />
                探索桌游库
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          
          <div className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto animate-slide-up">
            {[
              { icon: Users, label: '注册玩家', value: userCount, color: 'text-primary' },
              { icon: Gamepad2, label: '收录桌游', value: gameCount, color: 'text-secondary' },
              { icon: Calendar, label: '进行中约局', value: upcomingSessionCount, color: 'text-success' },
              { icon: Trophy, label: '累计约局', value: totalSessionCount, color: 'text-warning' },
            ].map((item, index) => (
              <div key={index} className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-5 text-center">
                <item.icon className={cn('w-7 h-7 mx-auto mb-2', item.color)} />
                <p className="text-2xl sm:text-3xl font-bold text-text-primary mb-1">{item.value}</p>
                <p className="text-sm text-text-muted">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-text-primary mb-2 flex items-center gap-3">
              <TrendingUp className="w-7 h-7 text-primary" />
              热门桌游
            </h2>
            <p className="text-text-secondary">玩家们最爱的桌游，评分与口碑俱佳</p>
          </div>
          <Link
            href="/games"
            className="hidden sm:inline-flex items-center gap-1 text-primary hover:text-primary-hover text-sm font-medium transition-colors"
          >
            查看全部
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {hotGames.map((game) => (
            <Link
              key={game.id}
              href={`/games/${game.id}`}
              className="group"
            >
              <Card className="h-full overflow-hidden card-hover">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={game.coverImage}
                    alt={game.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                  <div className="absolute top-3 left-3">
                    <Badge variant="primary">{game.category.split(',')[0]}</Badge>
                  </div>
                  <div className="absolute top-3 right-3">
                    <Badge className={cn(getDifficultyColor(game.difficulty), 'bg-background/80 backdrop-blur-sm')}>
                      {getDifficultyLabel(game.difficulty)}
                    </Badge>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="flex items-center gap-2 mb-1">
                      <StarRating value={Math.round(game.avgRating)} readOnly size="sm" />
                      <span className="text-sm text-text-primary font-medium">{game.avgRating.toFixed(1)}</span>
                      <span className="text-xs text-text-muted">({game.totalRatings}评价)</span>
                    </div>
                  </div>
                </div>
                <CardContent>
                  <h3 className="text-lg font-bold text-text-primary mb-2 group-hover:text-primary transition-colors">
                    {game.name}
                  </h3>
                  <p className="text-sm text-text-secondary line-clamp-2 mb-4">
                    {game.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-text-muted">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {game.minPlayers}-{game.maxPlayers}人
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {game.playTime}分钟
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="mt-6 sm:hidden">
          <Link
            href="/games"
            className="flex items-center justify-center gap-1 w-full py-3 bg-card hover:bg-card-hover text-text-secondary rounded-xl border border-border transition-colors"
          >
            查看全部桌游
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-border">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-text-primary mb-2 flex items-center gap-3">
              <Calendar className="w-7 h-7 text-secondary" />
              近期约局
            </h2>
            <p className="text-text-secondary">即将开始的桌游约局，加入你的第一场局</p>
          </div>
          <Link
            href="/sessions"
            className="hidden sm:inline-flex items-center gap-1 text-primary hover:text-primary-hover text-sm font-medium transition-colors"
          >
            查看全部
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {recentSessions.length === 0 ? (
          <Card className="p-12 text-center">
            <Dice6 className="w-16 h-16 text-text-muted mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-bold text-text-primary mb-2">暂无约局</h3>
            <p className="text-text-secondary mb-6">成为第一个发起约局的人吧！</p>
            <Link
              href="/sessions/create"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
              发起约局
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recentSessions.map((session) => (
              <Link
                key={session.id}
                href={`/sessions/${session.id}`}
                className="group"
              >
                <Card className="h-full card-hover">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-28 h-28 rounded-xl overflow-hidden">
                        <img
                          src={session.game.coverImage}
                          alt={session.game.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="text-lg font-bold text-text-primary truncate group-hover:text-primary transition-colors">
                            {session.title}
                          </h3>
                          <Badge className={cn(getStatusColor(session.status), 'flex-shrink-0')}>
                            {getStatusLabel(session.status)}
                          </Badge>
                        </div>
                        <p className="text-sm text-text-secondary mb-3">
                          {session.game.name}
                        </p>
                        <div className="space-y-1.5 text-sm text-text-muted">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-primary" />
                            <span>{formatDateTime(session.startTime)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-secondary" />
                            <span className="truncate">{session.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-success" />
                            <span>
                              {session._count.registrations}
                              {' / '}
                              {session.maxPlayers}人
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={session.creator.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.creator.username}`}
                          alt={session.creator.username}
                          className="w-6 h-6 rounded-full bg-card"
                        />
                        <span className="text-sm text-text-secondary">
                          <User className="w-3.5 h-3.5 inline mr-1" />
                          {session.creator.username}
                        </span>
                      </div>
                      <span className="text-sm text-primary font-medium group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                        查看详情
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-6 sm:hidden">
          <Link
            href="/sessions"
            className="flex items-center justify-center gap-1 w-full py-3 bg-card hover:bg-card-hover text-text-secondary rounded-xl border border-border transition-colors"
          >
            查看全部约局
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-border">
        <div className="bg-gradient-to-br from-primary/10 via-card to-secondary/10 rounded-3xl border border-border p-8 sm:p-12 text-center">
          <Dice6 className="w-16 h-16 text-primary mx-auto mb-6" />
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-text-primary mb-4">
            准备好开启你的桌游之旅了吗？
          </h2>
          <p className="text-text-secondary mb-8 max-w-2xl mx-auto">
            加入我们，发现精彩桌游，认识志同道合的朋友，
            一起创造难忘的桌游时光。
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-medium text-base transition-all duration-200 hover:scale-105"
            >
              立即注册
            </Link>
            <Link
              href="/games/ranking"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-background hover:bg-card text-text-primary rounded-xl font-medium text-base border border-border transition-all duration-200"
            >
              <Trophy className="w-5 h-5 text-secondary" />
              查看排行榜
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
