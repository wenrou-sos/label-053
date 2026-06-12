'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Dice6, Mail, Lock, AlertCircle } from 'lucide-react'

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'
  const registered = searchParams.get('registered')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      })

      if (result?.error) {
        setError('邮箱或密码错误')
        setLoading(false)
        return
      }

      if (result?.ok) {
        router.push(callbackUrl)
        router.refresh()
      }
    } catch {
      setError('登录时发生错误，请稍后重试')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md animate-scale-in">
        <CardHeader className="text-center pb-2">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
            <Dice6 className="w-9 h-9 text-primary" />
          </div>
          <CardTitle className="text-2xl font-display">欢迎回来</CardTitle>
          <p className="text-text-secondary text-sm mt-2">
            登录你的账号，开始约局之旅
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          {registered && (
            <div className="mb-5 p-3 rounded-lg bg-success/10 border border-success/20 text-success text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>注册成功！请使用邮箱和密码登录。</span>
            </div>
          )}

          {error && (
            <div className="mb-5 p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="邮箱"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />

            <Input
              label="密码"
              type="password"
              placeholder="请输入密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />

            <Button
              type="submit"
              size="lg"
              loading={loading}
              className="w-full"
            >
              {loading ? '' : (
                <>
                  <Mail className="w-4 h-4" />
                  登录
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-text-secondary">
              还没有账号？{' '}
              <Link
                href="/register"
                className="text-primary hover:text-primary-hover font-medium transition-colors"
              >
                立即注册
              </Link>
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs text-text-muted text-center mb-3">
              演示账号（可直接登录体验）
            </p>
            <div className="text-xs text-text-muted bg-card rounded-lg p-3 space-y-1">
              <p>邮箱：<span className="text-text-secondary">alice@example.com</span></p>
              <p>密码：<span className="text-text-secondary">password123</span></p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
