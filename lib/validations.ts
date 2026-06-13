import { z } from 'zod'

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, '用户名至少3个字符')
    .max(20, '用户名最多20个字符')
    .regex(/^[a-zA-Z0-9_]+$/, '用户名只能包含字母、数字和下划线'),
  email: z.string().email('请输入有效的邮箱地址'),
  password: z
    .string()
    .min(6, '密码至少6个字符')
    .max(50, '密码最多50个字符'),
})

export const loginSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(1, '请输入密码'),
})

export const createSessionSchema = z.object({
  gameId: z.string().min(1, '请选择桌游'),
  title: z
    .string()
    .min(2, '标题至少2个字符')
    .max(100, '标题最多100个字符'),
  description: z.string().max(500, '描述最多500个字符').optional(),
  startTime: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), '请选择有效的时间'),
  location: z
    .string()
    .min(2, '请输入地点')
    .max(200, '地点最多200个字符'),
  maxPlayers: z
    .number()
    .min(2, '至少需要2名玩家')
    .max(20, '最多20名玩家'),
  isPublic: z.boolean().default(true),
})

export const playerReviewSchema = z.object({
  revieweeId: z.string().min(1, '请选择评价对象'),
  punctuality: z.number().int().min(1).max(5),
  ruleKnowledge: z.number().int().min(1).max(5),
  sportsmanship: z.number().int().min(1).max(5),
  comment: z.string().max(500, '评论最多500个字符').optional(),
})

export const gameReviewSchema = z.object({
  overallRating: z.number().int().min(1).max(5),
  strategy: z.number().int().min(1).max(5),
  fun: z.number().int().min(1).max(5),
  interaction: z.number().int().min(1).max(5),
  luck: z.number().int().min(1).max(5),
  comment: z.string().max(500, '评论最多500个字符').optional(),
})

export const sessionMessageSchema = z.object({
  content: z
    .string()
    .min(1, '留言内容不能为空')
    .max(1000, '留言最多1000个字符'),
})
