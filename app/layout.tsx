import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import { cn } from '@/lib/utils'
import Navbar from '@/components/Navbar'
import { AuthProvider } from '@/components/AuthProvider'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

export const metadata: Metadata = {
  title: '桌游约局平台 - 找到你的桌游同好',
  description: '一个专注于桌游社交的平台，轻松约局、发现好游戏、认识同好',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" className={cn(inter.variable, playfair.variable, 'dark')}>
      <body className="bg-background text-text-primary font-sans min-h-screen flex flex-col">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <footer className="border-t border-border py-8 mt-auto">
            <div className="max-w-7xl mx-auto px-4 text-center text-text-muted text-sm">
              <p>© 2024 桌游约局平台 · 让桌游社交更简单</p>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  )
}
