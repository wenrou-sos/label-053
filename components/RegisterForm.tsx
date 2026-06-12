'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useFormState, useFormStatus } from 'react-dom'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { registerUser } from '@/lib/actions'
import { Dice6, Mail, Lock, User as UserIcon, AlertCircle } from 'lucide-react'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" size="lg" loading={pending} className="w-full">
      {pending ? '' : (
        <>
          <UserIcon className="w-4 h-4" />
          创建账号
        </>
      )}
    </Button>
  )
}

export function RegisterForm() {
  const router = useRouter()
  const [state, formAction] = useFormState(registerUser, { error: false, message: '' })
  const [successMessage, setSuccessMessage] = useState('')

  if (state?.success && !successMessage) {
    setSuccessMessage(state.message || '注册成功')
    setTimeout(() => {
      router.push('/login?registered=true')
    }, 1500)
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md animate-scale-in">
        <CardHeader className="text-center pb-2">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
            <Dice6 className="w-9 h-9 text-primary" />
          </div>
          <CardTitle className="text-2xl font-display">创建账号</CardTitle>
          <p className="text-text-secondary text-sm mt-2">
            加入我们，开启你的桌游社交之旅
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          {successMessage && (
            <div className="mb-5 p-3 rounded-lg bg-success/10 border border-success/20 text-success text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{successMessage} 正在跳转到登录页...</span>
            </div>
          )}

          {state?.error && !successMessage && (
            <div className="mb-5 p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{state.message}</span>
            </div>
          )}

          <form action={formAction} className="space-y-5">
            <Input
              label="用户名"
              name="username"
              placeholder="3-20个字母、数字或下划线"
              required
              maxLength={20}
              autoComplete="username"
            />

            <Input
              label="邮箱"
              name="email"
              type="email"
              placeholder="your@email.com"
              required
              autoComplete="email"
            />

            <Input
              label="密码"
              name="password"
              type="password"
              placeholder="至少6个字符"
              required
              minLength={6}
              maxLength={50}
              autoComplete="new-password"
            />

            <SubmitButton />
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-text-secondary">
              已有账号？{' '}
              <Link
                href="/login"
                className="text-primary hover:text-primary-hover font-medium transition-colors"
              >
                立即登录
              </Link>
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs text-text-muted text-center leading-relaxed">
              注册即表示你同意我们的服务条款和隐私政策。
              <br />
              我们将保护你的个人信息安全。
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
