'use server'

import bcrypt from 'bcryptjs'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { registerSchema, createSessionSchema, playerReviewSchema, gameReviewSchema, sessionMessageSchema } from '@/lib/validations'
import { generateInviteCode } from '@/lib/utils'
import { requireAuth, getCurrentUser } from '@/lib/session'
import { z } from 'zod'

export async function registerUser(prevState: any, formData: FormData) {
  try {
    const rawData = {
      username: formData.get('username') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    }

    const validated = registerSchema.safeParse(rawData)
    if (!validated.success) {
      return {
        error: true,
        message: validated.error.issues[0].message,
      }
    }

    const { username, email, password } = validated.data

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    })

    if (existingUser) {
      return {
        error: true,
        message: '用户名或邮箱已被注册',
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.user.create({
      data: {
        username,
        email,
        passwordHash: hashedPassword,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      },
    })

    return {
      success: true,
      message: '注册成功，请登录',
    }
  } catch (error) {
    console.error('Registration error:', error)
    return {
      error: true,
      message: '注册失败，请稍后重试',
    }
  }
}

export async function createGameSession(prevState: any, formData: FormData) {
  try {
    const user = await requireAuth()

    const rawData = {
      gameId: formData.get('gameId') as string,
      title: formData.get('title') as string,
      description: formData.get('description') as string || undefined,
      startTime: formData.get('startTime') as string,
      location: formData.get('location') as string,
      maxPlayers: parseInt(formData.get('maxPlayers') as string, 10),
      isPublic: formData.get('isPublic') === 'on',
    }

    const validated = createSessionSchema.safeParse(rawData)
    if (!validated.success) {
      return {
        error: true,
        message: validated.error.issues[0].message,
      }
    }

    const { gameId, title, description, startTime, location, maxPlayers, isPublic } = validated.data

    const game = await prisma.game.findUnique({ where: { id: gameId } })
    if (!game) {
      return { error: true, message: '桌游不存在' }
    }

    const actualMaxPlayers = Math.min(maxPlayers, game.maxPlayers)
    const startTimeDate = new Date(startTime)

    let inviteCode = generateInviteCode()
    let existing = await prisma.gameSession.findUnique({ where: { inviteCode } })
    while (existing) {
      inviteCode = generateInviteCode()
      existing = await prisma.gameSession.findUnique({ where: { inviteCode } })
    }

    const session = await prisma.gameSession.create({
      data: {
        gameId,
        creatorId: user.id,
        title,
        description,
        startTime: startTimeDate,
        location,
        maxPlayers: actualMaxPlayers,
        isPublic,
        inviteCode,
        status: 'upcoming',
        registrations: {
          create: {
            userId: user.id,
            status: 'approved',
          },
        },
      },
    })

    revalidatePath('/sessions')
    revalidatePath('/')
    redirect(`/sessions/${session.id}`)
  } catch (error: any) {
    if (error.message === '请先登录') {
      redirect('/login')
    }
    console.error('Create session error:', error)
    return { error: true, message: error.message || '创建失败，请稍后重试' }
  }
}

export async function joinSession(sessionId: string, inviteCode?: string) {
  try {
    const user = await requireAuth()

    const session = await prisma.gameSession.findUnique({
      where: { id: sessionId },
      include: {
        registrations: true,
      },
    })

    if (!session) {
      return { error: true, message: '约局不存在' }
    }

    if (!session.isPublic && inviteCode !== session.inviteCode) {
      return { error: true, message: '邀请码不正确' }
    }

    if (session.status !== 'upcoming') {
      return { error: true, message: '该约局已无法报名' }
    }

    if (session.registrations.some(r => r.userId === user.id)) {
      return { error: true, message: '你已经报名了该约局' }
    }

    if (session.registrations.filter(r => r.status === 'approved').length >= session.maxPlayers) {
      return { error: true, message: '该约局已满员' }
    }

    await prisma.registration.create({
      data: {
        sessionId,
        userId: user.id,
        status: 'approved',
      },
    })

    await prisma.notification.create({
      data: {
        userId: session.creatorId,
        type: 'join',
        content: `${user.username} 报名了你的约局「${session.title}」`,
      },
    })

    revalidatePath(`/sessions/${sessionId}`)
    revalidatePath('/sessions')
    return { success: true, message: '报名成功' }
  } catch (error: any) {
    if (error.message === '请先登录') {
      redirect('/login')
    }
    console.error('Join session error:', error)
    return { error: true, message: error.message || '报名失败，请稍后重试' }
  }
}

export async function leaveSession(sessionId: string) {
  try {
    const user = await requireAuth()

    const session = await prisma.gameSession.findUnique({
      where: { id: sessionId },
      include: { registrations: true },
    })

    if (!session) {
      return { error: true, message: '约局不存在' }
    }

    if (session.creatorId === user.id) {
      return { error: true, message: '创建者不能退出自己的约局，可以取消约局' }
    }

    const registration = session.registrations.find(r => r.userId === user.id)
    if (!registration) {
      return { error: true, message: '你没有报名该约局' }
    }

    await prisma.registration.delete({ where: { id: registration.id } })

    revalidatePath(`/sessions/${sessionId}`)
    revalidatePath('/sessions')
    return { success: true, message: '已退出约局' }
  } catch (error: any) {
    if (error.message === '请先登录') {
      redirect('/login')
    }
    console.error('Leave session error:', error)
    return { error: true, message: error.message || '退出失败，请稍后重试' }
  }
}

export async function cancelSession(sessionId: string) {
  try {
    const user = await requireAuth()

    const session = await prisma.gameSession.findUnique({ where: { id: sessionId } })
    if (!session) {
      return { error: true, message: '约局不存在' }
    }

    if (session.creatorId !== user.id) {
      return { error: true, message: '只有创建者可以取消约局' }
    }

    await prisma.gameSession.update({
      where: { id: sessionId },
      data: { status: 'cancelled' },
    })

    const registrations = await prisma.registration.findMany({ where: { sessionId } })
    for (const reg of registrations) {
      if (reg.userId !== user.id) {
        await prisma.notification.create({
          data: {
            userId: reg.userId,
            type: 'cancel',
            content: `约局「${session.title}」已被取消`,
          },
        })
      }
    }

    revalidatePath(`/sessions/${sessionId}`)
    revalidatePath('/sessions')
    return { success: true, message: '约局已取消' }
  } catch (error: any) {
    if (error.message === '请先登录') {
      redirect('/login')
    }
    console.error('Cancel session error:', error)
    return { error: true, message: error.message || '取消失败，请稍后重试' }
  }
}

export async function completeSession(sessionId: string) {
  try {
    const user = await requireAuth()

    const session = await prisma.gameSession.findUnique({ where: { id: sessionId } })
    if (!session) {
      return { error: true, message: '约局不存在' }
    }

    if (session.creatorId !== user.id) {
      return { error: true, message: '只有创建者可以结束约局' }
    }

    await prisma.gameSession.update({
      where: { id: sessionId },
      data: { status: 'completed' },
    })

    const registrations = await prisma.registration.findMany({ where: { sessionId } })
    await prisma.user.updateMany({
      where: {
        id: { in: registrations.map(r => r.userId) },
      },
      data: {
        totalGames: { increment: 1 },
      },
    })

    revalidatePath(`/sessions/${sessionId}`)
    revalidatePath('/sessions')
    return { success: true, message: '约局已结束，请前往评价' }
  } catch (error: any) {
    if (error.message === '请先登录') {
      redirect('/login')
    }
    console.error('Complete session error:', error)
    return { error: true, message: error.message || '操作失败，请稍后重试' }
  }
}

export async function toggleFavorite(gameId: string) {
  try {
    const user = await requireAuth()

    const existing = await prisma.favorite.findUnique({
      where: {
        userId_gameId: {
          userId: user.id,
          gameId,
        },
      },
    })

    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } })
      revalidatePath(`/games/${gameId}`)
      revalidatePath(`/users/${user.id}`)
      return { success: true, isFavorited: false, message: '已取消收藏' }
    } else {
      await prisma.favorite.create({
        data: {
          userId: user.id,
          gameId,
        },
      })
      revalidatePath(`/games/${gameId}`)
      revalidatePath(`/users/${user.id}`)
      return { success: true, isFavorited: true, message: '已收藏' }
    }
  } catch (error: any) {
    if (error.message === '请先登录') {
      redirect('/login')
    }
    console.error('Toggle favorite error:', error)
    return { error: true, message: error.message || '操作失败' }
  }
}

export async function submitPlayerReview(sessionId: string, formData: FormData) {
  try {
    const user = await requireAuth()

    const rawData = {
      revieweeId: formData.get('revieweeId') as string,
      punctuality: parseInt(formData.get('punctuality') as string, 10),
      ruleKnowledge: parseInt(formData.get('ruleKnowledge') as string, 10),
      sportsmanship: parseInt(formData.get('sportsmanship') as string, 10),
      comment: formData.get('comment') as string || undefined,
    }

    const validated = playerReviewSchema.safeParse(rawData)
    if (!validated.success) {
      return { error: true, message: validated.error.issues[0].message }
    }

    const { revieweeId, punctuality, ruleKnowledge, sportsmanship, comment } = validated.data

    if (revieweeId === user.id) {
      return { error: true, message: '不能评价自己' }
    }

    const session = await prisma.gameSession.findUnique({
      where: { id: sessionId },
      include: { registrations: true },
    })

    if (!session || session.status !== 'completed') {
      return { error: true, message: '约局不存在或未结束' }
    }

    const isParticipant = session.registrations.some(r => r.userId === user.id)
    const isRevieweeParticipant = session.registrations.some(r => r.userId === revieweeId)
    if (!isParticipant || !isRevieweeParticipant) {
      return { error: true, message: '只有参与者可以互相评价' }
    }

    const existing = await prisma.playerReview.findUnique({
      where: {
        sessionId_reviewerId_revieweeId: {
          sessionId,
          reviewerId: user.id,
          revieweeId,
        },
      },
    })

    if (existing) {
      return { error: true, message: '你已经评价过该玩家了' }
    }

    await prisma.playerReview.create({
      data: {
        sessionId,
        reviewerId: user.id,
        revieweeId,
        punctuality,
        ruleKnowledge,
        sportsmanship,
        comment,
      },
    })

    const reviews = await prisma.playerReview.findMany({ where: { revieweeId } })
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + (r.punctuality + r.ruleKnowledge + r.sportsmanship) / 3, 0) / reviews.length
      : 0

    await prisma.user.update({
      where: { id: revieweeId },
      data: { averageRating: Math.round(avgRating * 100) / 100 },
    })

    revalidatePath(`/sessions/${sessionId}`)
    revalidatePath(`/users/${revieweeId}`)
    return { success: true, message: '评价已提交' }
  } catch (error: any) {
    if (error.message === '请先登录') {
      redirect('/login')
    }
    console.error('Submit player review error:', error)
    return { error: true, message: error.message || '评价失败' }
  }
}

export async function submitGameReview(sessionId: string, formData: FormData) {
  try {
    const user = await requireAuth()

    const rawData = {
      overallRating: parseInt(formData.get('overallRating') as string, 10),
      strategy: parseInt(formData.get('strategy') as string, 10),
      fun: parseInt(formData.get('fun') as string, 10),
      interaction: parseInt(formData.get('interaction') as string, 10),
      luck: parseInt(formData.get('luck') as string, 10),
      comment: formData.get('comment') as string || undefined,
    }

    const validated = gameReviewSchema.safeParse(rawData)
    if (!validated.success) {
      return { error: true, message: validated.error.issues[0].message }
    }

    const { overallRating, strategy, fun, interaction, luck, comment } = validated.data

    const session = await prisma.gameSession.findUnique({
      where: { id: sessionId },
      include: { registrations: true },
    })

    if (!session || session.status !== 'completed') {
      return { error: true, message: '约局不存在或未结束' }
    }

    const isParticipant = session.registrations.some(r => r.userId === user.id)
    if (!isParticipant) {
      return { error: true, message: '只有参与者可以评价游戏' }
    }

    const existing = await prisma.gameReview.findUnique({
      where: {
        sessionId_userId: {
          sessionId,
          userId: user.id,
        },
      },
    })

    if (existing) {
      return { error: true, message: '你已经评价过这次约局的游戏了' }
    }

    await prisma.gameReview.create({
      data: {
        sessionId,
        gameId: session.gameId,
        userId: user.id,
        overallRating,
        strategy,
        fun,
        interaction,
        luck,
        comment,
      },
    })

    const reviews = await prisma.gameReview.findMany({ where: { gameId: session.gameId } })
    if (reviews.length > 0) {
      const total = reviews.length
      const updates = {
        avgRating: Math.round(reviews.reduce((s, r) => s + r.overallRating, 0) / total * 100) / 100,
        avgStrategy: Math.round(reviews.reduce((s, r) => s + r.strategy, 0) / total * 100) / 100,
        avgFun: Math.round(reviews.reduce((s, r) => s + r.fun, 0) / total * 100) / 100,
        avgInteraction: Math.round(reviews.reduce((s, r) => s + r.interaction, 0) / total * 100) / 100,
        avgLuck: Math.round(reviews.reduce((s, r) => s + r.luck, 0) / total * 100) / 100,
        totalRatings: total,
      }
      await prisma.game.update({
        where: { id: session.gameId },
        data: updates,
      })
    }

    revalidatePath(`/sessions/${sessionId}`)
    revalidatePath(`/games/${session.gameId}`)
    revalidatePath('/games')
    return { success: true, message: '评价已提交' }
  } catch (error: any) {
    if (error.message === '请先登录') {
      redirect('/login')
    }
    console.error('Submit game review error:', error)
    return { error: true, message: error.message || '评价失败' }
  }
}

export async function markNotificationRead(notificationId: string) {
  try {
    const user = await requireAuth()

    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    })

    if (!notification || notification.userId !== user.id) {
      return { error: true, message: '通知不存在' }
    }

    await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    })

    revalidatePath('/')
    revalidatePath(`/users/${user.id}`)
    return { success: true }
  } catch (error: any) {
    console.error('Mark notification read error:', error)
    return { error: true, message: '操作失败' }
  }
}

export async function updateProfile(prevState: any, formData: FormData) {
  try {
    const user = await requireAuth()

    const bio = formData.get('bio') as string

    if (bio && bio.length > 500) {
      return { error: true, message: '个人简介不能超过500字' }
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { bio: bio || null },
    })

    revalidatePath(`/users/${user.id}`)
    return { success: true, message: '资料已更新' }
  } catch (error: any) {
    if (error.message === '请先登录') {
      redirect('/login')
    }
    console.error('Update profile error:', error)
    return { error: true, message: '更新失败' }
  }
}

export async function joinSessionByInviteCode(inviteCode: string) {
  try {
    const session = await prisma.gameSession.findUnique({
      where: { inviteCode: inviteCode.toUpperCase() },
    })

    if (!session) {
      return { error: true, message: '邀请码无效' }
    }

    redirect(`/sessions/${session.id}`)
  } catch (error) {
    console.error('Join by invite code error:', error)
    return { error: true, message: '查找失败' }
  }
}

export async function createSessionMessage(sessionId: string, content: string) {
  try {
    const user = await requireAuth()

    const validated = sessionMessageSchema.safeParse({ content })
    if (!validated.success) {
      return {
        error: true,
        message: validated.error.issues[0].message,
      }
    }

    const session = await prisma.gameSession.findUnique({
      where: { id: sessionId },
      include: {
        registrations: true,
      },
    })

    if (!session) {
      return { error: true, message: '约局不存在' }
    }

    const isParticipant = session.registrations.some(
      (r) => r.userId === user.id && r.status === 'approved'
    )
    const isCreator = session.creatorId === user.id

    if (!isParticipant && !isCreator) {
      return { error: true, message: '只有约局参与者才能留言' }
    }

    const message = await prisma.sessionMessage.create({
      data: {
        sessionId,
        userId: user.id,
        content: validated.data.content,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    })

    revalidatePath(`/sessions/${sessionId}`)

    return {
      error: false,
      message: '留言成功',
      data: message,
    }
  } catch (error) {
    console.error('Create session message error:', error)
    return { error: true, message: '留言失败' }
  }
}
