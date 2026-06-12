import { Suspense } from 'react'
import { LoginForm } from '@/components/LoginForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '登录 - 桌游约局平台',
  description: '登录你的账号，开始约局之旅',
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
}
