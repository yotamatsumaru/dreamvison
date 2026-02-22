'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import VideoPlayer from '@/components/VideoPlayer'

interface WatchClientProps {
  slug: string
  token: string
}

interface VerifyData {
  purchase: {
    id: string
    status: string
    purchasedAt: string
  }
  event: {
    id: string
    title: string
    slug: string
    status: string
    eventType: string
    startDate: string
    imageUrl: string | null
  }
  ticket: {
    id: string
    name: string
  }
  user: {
    id: string
    name: string | null
    email: string | null
  }
}

export default function WatchClient({ slug, token }: WatchClientProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [verifyData, setVerifyData] = useState<VerifyData | null>(null)
  const [streamUrl, setStreamUrl] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const verifyToken = async () => {
      try {
        // トークン検証
        const verifyResponse = await fetch('/api/watch/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, eventSlug: slug }),
        })

        if (!verifyResponse.ok) {
          const errorData = await verifyResponse.json()
          throw new Error(errorData.error || 'トークンの検証に失敗しました')
        }

        const verifyResult = await verifyResponse.json()
        setVerifyData(verifyResult.data)

        // ストリームURL取得
        const streamResponse = await fetch('/api/watch/stream-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, eventSlug: slug }),
        })

        if (!streamResponse.ok) {
          const errorData = await streamResponse.json()
          throw new Error(errorData.error || 'ストリームURLの取得に失敗しました')
        }

        const streamResult = await streamResponse.json()
        setStreamUrl(streamResult.data.streamUrl)
      } catch (err: any) {
        console.error('Verification error:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    verifyToken()
  }, [slug, token])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">認証中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto card text-center">
          <div className="text-6xl mb-6">❌</div>
          <h1 className="text-3xl font-bold mb-4">エラー</h1>
          <p className="text-red-600 mb-6">{error}</p>
          <button onClick={() => router.push('/events')} className="btn btn-primary">
            イベント一覧に戻る
          </button>
        </div>
      </div>
    )
  }

  if (!verifyData || !streamUrl) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto card text-center">
          <div className="text-6xl mb-6">🔒</div>
          <h1 className="text-3xl font-bold mb-4">アクセスできません</h1>
          <p className="text-gray-600 mb-6">
            このイベントの視聴権限がありません
          </p>
          <button onClick={() => router.push('/events')} className="btn btn-primary">
            イベント一覧に戻る
          </button>
        </div>
      </div>
    )
  }

  const eventStatusLabels = {
    UPCOMING: '開催前',
    LIVE: '配信中',
    ENDED: '終了',
    ARCHIVED: 'アーカイブ',
  }

  return (
    <div className="bg-black min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* イベント情報 */}
          <div className="bg-gray-900 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  {verifyData.event.title}
                </h1>
                <p className="text-gray-400">
                  {eventStatusLabels[verifyData.event.status as keyof typeof eventStatusLabels]} •{' '}
                  {verifyData.ticket.name}
                </p>
              </div>
              {verifyData.event.status === 'LIVE' && (
                <div className="flex items-center bg-red-500 text-white px-4 py-2 rounded-full">
                  <span className="w-3 h-3 bg-white rounded-full mr-2 animate-pulse"></span>
                  LIVE
                </div>
              )}
            </div>
          </div>

          {/* ビデオプレイヤー */}
          <div className="bg-black rounded-lg overflow-hidden shadow-2xl mb-6">
            {verifyData.event.status === 'UPCOMING' ? (
              <div className="aspect-video bg-gray-900 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="text-6xl mb-4">📅</div>
                  <h2 className="text-2xl font-bold mb-2">配信開始前</h2>
                  <p className="text-gray-400">
                    {new Date(verifyData.event.startDate).toLocaleDateString('ja-JP', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    から配信開始予定
                  </p>
                </div>
              </div>
            ) : (
              <VideoPlayer
                src={streamUrl}
                poster={verifyData.event.imageUrl || undefined}
              />
            )}
          </div>

          {/* 注意事項 */}
          <div className="bg-gray-900 rounded-lg p-6 text-white">
            <h3 className="font-bold mb-4">視聴上の注意</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>• この配信は著作権で保護されています</li>
              <li>• 画面録画・スクリーンショットは禁止されています</li>
              <li>• URLの共有は禁止されています（個人専用です）</li>
              <li>• 安定した視聴には高速なインターネット接続を推奨します</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
