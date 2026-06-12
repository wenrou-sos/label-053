'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useFormState, useFormStatus } from 'react-dom'
import { createGameSession } from '@/lib/actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import type { Game } from '@/types'
import { getDifficultyLabel, getDifficultyColor } from '@/lib/utils'

interface GameOption {
  id: string
  name: string
  minPlayers: number
  maxPlayers: number
  difficulty: string
  coverImage: string
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" loading={pending} size="lg" className="w-full sm:w-auto">
      {pending ? '创建中...' : '创建约局'}
    </Button>
  )
}

export default function CreateSessionPage() {
  const router = useRouter()
  const [games, setGames] = useState<GameOption[]>([])
  const [selectedGame, setSelectedGame] = useState<GameOption | null>(null)
  const [state, formAction] = useFormState(createGameSession, { error: false, message: '' } as any)

  useEffect(() => {
    fetch('/api/games')
      .then(res => res.json())
      .then(data => setGames(data))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if ((state as any).success) {
      router.push('/sessions')
    }
  }, [state, router])

  const gameOptions = [
    { value: '', label: '请选择桌游' },
    ...games.map(g => ({ value: g.id, label: g.name })),
  ]

  const playerOptions = selectedGame
    ? Array.from(
        { length: selectedGame.maxPlayers - Math.max(2, selectedGame.minPlayers) + 1 },
        (_, i) => {
          const value = Math.max(2, selectedGame.minPlayers) + i
          return { value: value.toString(), label: `${value} 人` }
        }
      )
    : [{ value: '', label: '请先选择桌游' }]

  const now = new Date()
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
  const minDateTime = now.toISOString().slice(0, 16)

  const handleGameChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const game = games.find(g => g.id === e.target.value) || null
    setSelectedGame(game)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <Link
          href="/sessions"
          className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors mb-4"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回约局列表
        </Link>
        <h1 className="text-3xl font-bold text-text-primary font-display">
          创建约局
        </h1>
        <p className="text-text-secondary mt-1">
          填写以下信息，创建属于你的桌游约局
        </p>
      </div>

      {state.message && (
        <div className={`mb-6 p-4 rounded-xl border ${
          state.error
            ? 'bg-danger/10 border-danger/30 text-danger'
            : 'bg-success/10 border-success/30 text-success'
        }`}>
          {state.message}
        </div>
      )}

      <form action={formAction} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              选择桌游
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select
              label="桌游"
              name="gameId"
              options={gameOptions}
              required
              onChange={handleGameChange}
            />

            {selectedGame && (
              <div className="flex gap-4 p-4 rounded-xl bg-background border border-border">
                <img
                  src={selectedGame.coverImage}
                  alt={selectedGame.name}
                  className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1">
                  <h4 className="font-bold text-text-primary mb-2">{selectedGame.name}</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">
                      {selectedGame.minPlayers}-{selectedGame.maxPlayers} 人
                    </Badge>
                    <Badge variant="default" className={getDifficultyColor(selectedGame.difficulty)}>
                      {getDifficultyLabel(selectedGame.difficulty)}
                    </Badge>
                  </div>
                  <p className="text-sm text-text-secondary mt-2">
                    约局人数会自动限制在游戏支持的范围内
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              约局信息
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="约局标题"
              name="title"
              placeholder="给约局起个响亮的名字，比如：璀璨宝石新手教学局"
              required
              maxLength={100}
            />

            <Textarea
              label="约局描述（可选）"
              name="description"
              placeholder="介绍一下约局的详细情况，比如是否有新手教学、是否需要自备游戏等"
              rows={4}
              maxLength={500}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="开始时间"
                name="startTime"
                type="datetime-local"
                min={minDateTime}
                required
              />

              <Select
                label="最大人数"
                name="maxPlayers"
                options={playerOptions}
                required
                disabled={!selectedGame}
              />
            </div>

            <Input
              label="约局地点"
              name="location"
              placeholder="例如：阳光桌游吧 - 中关村店"
              required
              maxLength={200}
            />

            <div className="flex items-start gap-3 p-4 rounded-xl bg-background border border-border">
              <input
                type="checkbox"
                id="isPublic"
                name="isPublic"
                defaultChecked
                className="mt-1 w-5 h-5 rounded border-border bg-background text-primary focus:ring-primary/50"
              />
              <div>
                <label htmlFor="isPublic" className="font-medium text-text-primary cursor-pointer">
                  公开约局
                </label>
                <p className="text-sm text-text-secondary mt-1">
                  公开约局会在列表中显示，任何人都可以报名。关闭后为私密约局，只有通过邀请码才能加入。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4 sm:justify-end">
          <Link href="/sessions">
            <Button type="button" variant="outline" className="w-full sm:w-auto">
              取消
            </Button>
          </Link>
          <SubmitButton />
        </div>
      </form>
    </div>
  )
}
