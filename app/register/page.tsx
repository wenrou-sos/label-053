import { Suspense } from 'react'
import { RegisterForm } from '@/components/RegisterForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '注册 - 桌游约局平台',
  description: '创建账号，加入桌游爱好者社区',
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  )
}
