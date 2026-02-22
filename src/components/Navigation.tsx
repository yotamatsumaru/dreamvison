'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'

export default function Navigation() {
  const { data: session, status } = useSession()

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold text-primary-600">
              ライブ配信
            </Link>
            <div className="hidden md:flex space-x-6">
              <Link
                href="/events"
                className="text-gray-700 hover:text-primary-600 transition-colors"
              >
                イベント
              </Link>
              <Link
                href="/artists"
                className="text-gray-700 hover:text-primary-600 transition-colors"
              >
                アーティスト
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {status === 'loading' ? (
              <div className="text-gray-500">読込中...</div>
            ) : session ? (
              <>
                <Link
                  href="/my-tickets"
                  className="text-gray-700 hover:text-primary-600 transition-colors"
                >
                  マイチケット
                </Link>
                {session.user?.role === 'ADMIN' && (
                  <Link
                    href="/admin"
                    className="text-gray-700 hover:text-primary-600 transition-colors"
                  >
                    管理画面
                  </Link>
                )}
                <span className="text-gray-600">{session.user?.name}</span>
                <button
                  onClick={() => signOut()}
                  className="btn btn-secondary text-sm"
                >
                  ログアウト
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/signin" className="btn btn-primary text-sm">
                  ログイン
                </Link>
                <Link href="/auth/signup" className="btn btn-secondary text-sm">
                  新規登録
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
