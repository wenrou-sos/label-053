export interface Game {
  id: string
  name: string
  coverImage: string
  description: string
  rules: string
  minPlayers: number
  maxPlayers: number
  playTime: number
  difficulty: string
  category: string
  avgRating: number
  avgStrategy: number
  avgFun: number
  avgInteraction: number
  avgLuck: number
  totalRatings: number
  createdAt: Date
}

export interface GameSession {
  id: string
  gameId: string
  creatorId: string
  title: string
  description: string | null
  startTime: Date
  location: string
  maxPlayers: number
  isPublic: boolean
  inviteCode: string
  status: string
  createdAt: Date
}

export interface User {
  id: string
  username: string
  email: string
  avatar: string | null
  bio: string | null
  averageRating: number
  totalGames: number
  createdAt: Date
}

export interface PlayerReview {
  id: string
  sessionId: string
  reviewerId: string
  revieweeId: string
  punctuality: number
  ruleKnowledge: number
  sportsmanship: number
  comment: string | null
  createdAt: Date
}

export interface GameReview {
  id: string
  sessionId: string
  gameId: string
  userId: string
  overallRating: number
  strategy: number
  fun: number
  interaction: number
  luck: number
  comment: string | null
  createdAt: Date
}
