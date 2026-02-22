import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/nextauth'
import SessionProvider from '@/components/SessionProvider'
import Navigation from '@/components/Navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ライブ配信プラットフォーム',
  description: 'OBSを起点としたライブ配信・ストリーミングサービス',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="ja">
      <body className={inter.className}>
        <SessionProvider session={session}>
          <Navigation />
          <main className="min-h-screen">{children}</main>
          <footer className="bg-gray-800 text-white py-8 mt-20">
            <div className="container mx-auto px-4 text-center">
              <p>&copy; 2024 ライブ配信プラットフォーム. All rights reserved.</p>
            </div>
          </footer>
        </SessionProvider>
      </body>
    </html>
  )
}
