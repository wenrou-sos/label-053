'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'
import { Dice6, Menu, X, User, Bell, Search, Plus, LogOut, Trophy, Users, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: '首页', icon: Home },
  { href: '/sessions', label: '约局广场', icon: Users },
  { href: '/games', label: '桌游库', icon: Dice6 },
  { href: '/games/ranking', label: '排行榜', icon: Trophy },
]

export default function Navbar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [inviteCode, setInviteCode] = useState('')

  const handleInviteCode = (e: React.FormEvent) => {
    e.preventDefault()
    if (inviteCode.trim()) {
      router.push(`/sessions/invite/${inviteCode.trim()}`)
    }
  }

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Dice6 className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-display font-bold text-text-primary hidden sm:block">
              桌游约局
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  pathname === item.href
                    ? 'bg-primary/10 text-primary'
                    : 'text-text-secondary hover:text-text-primary hover:bg-card'
                )}
              >
                <item.icon className="w-4 h-4 inline mr-2" />
                {item.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <form onSubmit={handleInviteCode} className="relative">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  placeholder="输入邀请码"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  className="pl-9 pr-4 py-2 w-36 bg-card border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                />
              </div>
            </form>

            {session ? (
              <>
                <Link
                  href="/sessions/create"
                  className="flex items-center gap-1 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden xl:inline">发起约局</span>
                </Link>

                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-card transition-colors"
                  >
                    <img
                      src={session.user?.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user?.username}`}
                      alt="avatar"
                      className="w-8 h-8 rounded-full bg-card"
                    />
                  </button>

                  {showUserMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowUserMenu(false)}
                      />
                      <div className="absolute right-0 mt-2 w-56 py-2 bg-card border border-border rounded-xl shadow-xl z-50 animate-scale-in">
                        <div className="px-4 py-3 border-b border-border">
                          <p className="font-medium text-text-primary">{session.user?.username}</p>
                          <p className="text-xs text-text-muted truncate">{session.user?.email}</p>
                        </div>
                        <Link
                          href={`/users/${session.user?.id}`}
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-text-secondary hover:bg-card-hover hover:text-text-primary transition-colors"
                        >
                          <User className="w-4 h-4" />
                          个人主页
                        </Link>
                        <button
                          onClick={() => {
                            setShowUserMenu(false)
                            signOut({ callbackUrl: '/' })
                          }}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-danger hover:bg-card-hover transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          退出登录
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-text-secondary hover:text-text-primary text-sm font-medium transition-colors"
                >
                  登录
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-medium transition-colors"
                >
                  注册
                </Link>
              </div>
            )}
          </div>

          <button
            className="lg:hidden p-2 rounded-lg hover:bg-card transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-text-primary" />
            ) : (
              <Menu className="w-6 h-6 text-text-primary" />
            )}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-border animate-slide-up">
            <div className="space-y-1 mb-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                    pathname === item.href
                      ? 'bg-primary/10 text-primary'
                      : 'text-text-secondary hover:text-text-primary hover:bg-card'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              ))}
            </div>

            <form onSubmit={handleInviteCode} className="px-4 mb-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  placeholder="输入邀请码加入约局"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-card border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </form>

            {session ? (
              <div className="space-y-1 px-4">
                <Link
                  href="/sessions/create"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-3 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-medium transition-colors mb-3"
                >
                  <Plus className="w-4 h-4" />
                  发起约局
                </Link>
                <Link
                  href={`/users/${session.user?.id}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-text-secondary hover:text-text-primary hover:bg-card transition-colors"
                >
                  <img
                    src={session.user?.image || ''}
                    alt=""
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="font-medium">{session.user?.username}</span>
                </Link>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false)
                    signOut({ callbackUrl: '/' })
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-danger hover:bg-card-hover transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  退出登录
                </button>
              </div>
            ) : (
              <div className="flex gap-2 px-4">
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex-1 py-3 text-center text-text-secondary hover:text-text-primary text-sm font-medium border border-border rounded-lg transition-colors"
                >
                  登录
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex-1 py-3 text-center bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg transition-colors"
                >
                  注册
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
