import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')

  console.log('Clearing existing data...')
  await prisma.notification.deleteMany()
  await prisma.favorite.deleteMany()
  await prisma.playerReview.deleteMany()
  await prisma.gameReview.deleteMany()
  await prisma.registration.deleteMany()
  await prisma.gameSession.deleteMany()
  await prisma.game.deleteMany()
  await prisma.user.deleteMany()

  const hashedPassword = await bcrypt.hash('password123', 10)

  const users = await Promise.all([
    prisma.user.create({
      data: {
        username: 'alice',
        email: 'alice@example.com',
        passwordHash: hashedPassword,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
        bio: '桌游爱好者，喜欢策略类游戏',
      },
    }),
    prisma.user.create({
      data: {
        username: 'bob',
        email: 'bob@example.com',
        passwordHash: hashedPassword,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob',
        bio: '资深桌游玩家，擅长德式策略',
      },
    }),
    prisma.user.create({
      data: {
        username: 'charlie',
        email: 'charlie@example.com',
        passwordHash: hashedPassword,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=charlie',
        bio: '新手玩家，正在学习各种桌游',
      },
    }),
    prisma.user.create({
      data: {
        username: 'diana',
        email: 'diana@example.com',
        passwordHash: hashedPassword,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=diana',
        bio: '桌游店主，组织过很多场桌游局',
      },
    }),
  ])

  console.log('Created users:', users.length)

  const games = await Promise.all([
    prisma.game.create({
      data: {
        id: 'game-001',
        name: '璀璨宝石',
        coverImage: 'https://images.unsplash.com/photo-1606166325683-e6deb68077fa?w=400&h=300&fit=crop',
        description: '简单上手的宝石收集策略游戏，玩家扮演文艺复兴时期的富商，通过收集宝石、购买发展卡来获取声望点数。',
        rules: '每回合玩家可以选择三种行动之一：拿取三种不同颜色的宝石、拿取两颗相同颜色的宝石（该颜色至少剩4颗）、或购买一张发展卡。发展卡提供永久宝石加成和声望点数。达到15声望点的玩家获胜。',
        minPlayers: 2,
        maxPlayers: 4,
        playTime: 30,
        difficulty: 'easy',
        category: '策略,经济',
      },
    }),
    prisma.game.create({
      data: {
        id: 'game-002',
        name: '展翅翱翔',
        coverImage: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=400&h=300&fit=crop',
        description: '鸟类主题的引擎构筑游戏，玩家在各自的自然保护区中吸引和饲养鸟类，获取食物和蛋来扩展鸟群。',
        rules: '每回合玩家从手牌中打出一只鸟到对应的栖息地，或从栖息地获取食物/蛋/抽牌。游戏共进行4轮，每轮结束时根据目标卡牌计分。最终总分最高者获胜。',
        minPlayers: 1,
        maxPlayers: 5,
        playTime: 75,
        difficulty: 'medium',
        category: '策略,引擎构筑',
      },
    }),
    prisma.game.create({
      data: {
        id: 'game-003',
        name: '山屋惊魂',
        coverImage: 'https://images.unsplash.com/photo-1509248961895-40c8db5480f1?w=400&h=300&fit=crop',
        description: '探索恐怖宅邸的合作/背叛游戏，玩家们起初合作探索鬼屋，直到有人触发背叛剧情，其中一名玩家变成反派。',
        rules: '游戏分为探索阶段和背叛阶段。探索阶段玩家轮流探索房间、收集物品和触发事件。当预兆卡数量达到一定值时触发背叛，随机选出叛徒并开始对应剧本。',
        minPlayers: 3,
        maxPlayers: 6,
        playTime: 90,
        difficulty: 'medium',
        category: '冒险,剧情',
      },
    }),
    prisma.game.create({
      data: {
        id: 'game-004',
        name: '风声：黑名单',
        coverImage: 'https://images.unsplash.com/photo-1511193311914-0346f16efe90?w=400&h=300&fit=crop',
        description: '一款谍战题材的身份推理桌游，玩家分为潜伏战线和军情局两大阵营，通过传递情报来完成任务。',
        rules: '每位玩家有秘密身份。回合内玩家抽取卡牌，然后可以打出功能牌或传递情报牌。传递的情报经过其他玩家时可能被截获。完成各自阵营的胜利条件即获胜。',
        minPlayers: 3,
        maxPlayers: 9,
        playTime: 60,
        difficulty: 'medium',
        category: '策略,推理',
      },
    }),
    prisma.game.create({
      data: {
        id: 'game-005',
        name: '卡卡颂',
        coverImage: 'https://images.unsplash.com/photo-1569701813229-33284b643e3c?w=400&h=300&fit=crop',
        description: '经典的版图放置游戏，玩家通过放置地形板块和随从来建造城市、道路、修道院和农田，获取分数。',
        rules: '每回合玩家抽取并放置一块地形板块，然后可以选择放置一个随从在板块上。当城市、道路或修道院完成时，放置了随从的玩家获得分数。游戏结束时计算农田分数，总分最高者胜。',
        minPlayers: 2,
        maxPlayers: 5,
        playTime: 45,
        difficulty: 'easy',
        category: '策略,家庭',
      },
    }),
    prisma.game.create({
      data: {
        id: 'game-006',
        name: '冷战热斗',
        coverImage: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=400&h=300&fit=crop',
        description: '以冷战为背景的两人策略游戏，玩家分别扮演美国和苏联，在全球范围内争夺影响力和控制区域。',
        rules: '游戏分为10回合，每回合玩家抽取手牌并出牌。卡牌可以用于增加影响力、发动政变、或触发事件。玩家争夺区域控制权来获得胜利点数。最终胜利点数高的一方获胜。',
        minPlayers: 2,
        maxPlayers: 2,
        playTime: 120,
        difficulty: 'hard',
        category: '策略,战棋',
      },
    }),
    prisma.game.create({
      data: {
        id: 'game-007',
        name: '诺丁汉警长',
        coverImage: 'https://images.unsplash.com/photo-1607435656672-3ce21b55df89?w=400&h=300&fit=crop',
        description: '一款谈判和欺骗类桌游，玩家轮流担任警长，其他玩家试图走私违禁品进入城市获取利润。',
        rules: '每位玩家每轮选择物品放入袋子，然后向警长申报袋中物品。警长可以选择放行或检查。如果撒谎被发现，违禁品被没收；如果检查不实，警长需要赔偿。游戏结束时金钱最多者获胜。',
        minPlayers: 3,
        maxPlayers: 6,
        playTime: 60,
        difficulty: 'medium',
        category: '聚会,谈判',
      },
    }),
    prisma.game.create({
      data: {
        id: 'game-008',
        name: '权力的游戏',
        coverImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=300&fit=crop',
        description: '基于冰与火之歌小说的策略版图游戏，玩家扮演维斯特洛大陆的各大贵族家族，争夺铁王座。',
        rules: '游戏共进行10轮。每轮玩家分配指令令牌到地图上，执行集结、进军、防守、突袭等行动。通过争夺区域、获得权力标记、赢得战斗来积累优势。最终控制最多城堡和要塞的家族获胜。',
        minPlayers: 3,
        maxPlayers: 6,
        playTime: 180,
        difficulty: 'hard',
        category: '策略,战棋',
      },
    }),
  ])

  console.log('Created games:', games.length)

  const now = new Date()
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)

  const sessions = await Promise.all([
    prisma.gameSession.create({
      data: {
        gameId: 'game-001',
        creatorId: users[0].id,
        title: '璀璨宝石新手教学局',
        description: '欢迎新手参加，我们会详细讲解规则，轻松愉快的游戏体验',
        startTime: tomorrow,
        location: '阳光桌游吧 - 中关村店',
        maxPlayers: 4,
        isPublic: true,
        inviteCode: 'BRIGHT001',
        status: 'upcoming',
      },
    }),
    prisma.gameSession.create({
      data: {
        gameId: 'game-002',
        creatorId: users[1].id,
        title: '展翅翱翔周末局',
        description: '周末下午一起玩鸟，轻松策略游戏，欢迎新手',
        startTime: nextWeek,
        location: '桌游森林咖啡馆',
        maxPlayers: 5,
        isPublic: true,
        inviteCode: 'WING002',
        status: 'upcoming',
      },
    }),
    prisma.gameSession.create({
      data: {
        gameId: 'game-003',
        creatorId: users[3].id,
        title: '山屋惊魂剧本局',
        description: '一起来鬼屋探险，胆小勿入！会玩多个剧本',
        startTime: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        location: '神秘桌游吧',
        maxPlayers: 6,
        isPublic: true,
        inviteCode: 'BETRAY03',
        status: 'upcoming',
      },
    }),
    prisma.gameSession.create({
      data: {
        gameId: 'game-004',
        creatorId: users[2].id,
        title: '风声谍战夜',
        description: '多人身份推理游戏，考验演技和推理能力',
        startTime: yesterday,
        location: '谍影桌游俱乐部',
        maxPlayers: 7,
        isPublic: true,
        inviteCode: 'SPY0004',
        status: 'completed',
      },
    }),
  ])

  console.log('Created sessions:', sessions.length)

  await prisma.registration.createMany({
    data: [
      { sessionId: sessions[0].id, userId: users[0].id, status: 'approved' },
      { sessionId: sessions[0].id, userId: users[2].id, status: 'approved' },
      { sessionId: sessions[1].id, userId: users[1].id, status: 'approved' },
      { sessionId: sessions[1].id, userId: users[0].id, status: 'approved' },
      { sessionId: sessions[1].id, userId: users[3].id, status: 'approved' },
      { sessionId: sessions[2].id, userId: users[3].id, status: 'approved' },
      { sessionId: sessions[2].id, userId: users[1].id, status: 'approved' },
      { sessionId: sessions[3].id, userId: users[2].id, status: 'approved' },
      { sessionId: sessions[3].id, userId: users[0].id, status: 'approved' },
      { sessionId: sessions[3].id, userId: users[1].id, status: 'approved' },
      { sessionId: sessions[3].id, userId: users[3].id, status: 'approved' },
    ],
  })

  console.log('Created registrations')

  await prisma.gameReview.createMany({
    data: [
      {
        sessionId: sessions[3].id,
        gameId: 'game-004',
        userId: users[0].id,
        overallRating: 4,
        strategy: 4,
        fun: 5,
        interaction: 5,
        luck: 3,
        comment: '非常有趣的身份推理游戏，玩得很开心！',
      },
      {
        sessionId: sessions[3].id,
        gameId: 'game-004',
        userId: users[1].id,
        overallRating: 5,
        strategy: 5,
        fun: 5,
        interaction: 4,
        luck: 2,
        comment: '经典谍战游戏，推理和演技并重',
      },
    ],
  })

  console.log('Created game reviews')

  await prisma.playerReview.createMany({
    data: [
      {
        sessionId: sessions[3].id,
        reviewerId: users[0].id,
        revieweeId: users[1].id,
        punctuality: 5,
        ruleKnowledge: 5,
        sportsmanship: 4,
        comment: '非常专业的玩家，规则很熟',
      },
      {
        sessionId: sessions[3].id,
        reviewerId: users[1].id,
        revieweeId: users[0].id,
        punctuality: 4,
        ruleKnowledge: 3,
        sportsmanship: 5,
        comment: '游戏态度很好，新手但学得快',
      },
      {
        sessionId: sessions[3].id,
        reviewerId: users[0].id,
        revieweeId: users[2].id,
        punctuality: 5,
        ruleKnowledge: 4,
        sportsmanship: 5,
        comment: '人很好，组织能力强',
      },
    ],
  })

  console.log('Created player reviews')

  await prisma.favorite.createMany({
    data: [
      { userId: users[0].id, gameId: 'game-001' },
      { userId: users[0].id, gameId: 'game-002' },
      { userId: users[1].id, gameId: 'game-002' },
      { userId: users[1].id, gameId: 'game-006' },
      { userId: users[3].id, gameId: 'game-003' },
    ],
  })

  console.log('Created favorites')

  await prisma.game.updateMany({
    where: { id: { in: ['game-001', 'game-002', 'game-003', 'game-004'] } },
    data: {
      avgRating: 4.5,
      avgStrategy: 4.2,
      avgFun: 4.7,
      avgInteraction: 4.4,
      avgLuck: 3.5,
      totalRatings: 10,
    },
  })

  console.log('Updated game ratings')

  console.log('Seeding finished!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
