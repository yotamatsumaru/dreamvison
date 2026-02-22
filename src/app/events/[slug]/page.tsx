import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/nextauth'
import PurchaseButton from '@/components/PurchaseButton'

interface PageProps {
  params: { slug: string }
}

export default async function EventDetailPage({ params }: PageProps) {
  const session = await getServerSession(authOptions)

  const event = await prisma.event.findUnique({
    where: { slug: params.slug },
    include: {
      artist: true,
      tickets: {
        orderBy: {
          price: 'asc',
        },
      },
    },
  })

  if (!event) {
    notFound()
  }

  // ユーザーが購入済みか確認
  let userPurchase = null
  if (session?.user?.id) {
    userPurchase = await prisma.purchase.findFirst({
      where: {
        userId: session.user.id,
        eventId: event.id,
        status: 'COMPLETED',
      },
    })
  }

  const statusInfo = {
    LIVE: { label: '配信中', color: 'bg-red-500', icon: '🔴' },
    UPCOMING: { label: '開催予定', color: 'bg-blue-500', icon: '📅' },
    ENDED: { label: '終了', color: 'bg-gray-500', icon: '✓' },
    ARCHIVED: { label: 'アーカイブ', color: 'bg-purple-500', icon: '📼' },
  }

  const info = statusInfo[event.status]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative h-96 bg-gray-900">
        {event.imageUrl && (
          <Image
            src={event.imageUrl}
            alt={event.title}
            fill
            className="object-cover opacity-60"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="container mx-auto">
            <div className={`inline-flex items-center ${info.color} text-white px-4 py-2 rounded-full mb-4`}>
              <span className="mr-2">{info.icon}</span>
              {info.label}
            </div>
            <h1 className="text-5xl font-bold text-white mb-4">{event.title}</h1>
            <Link
              href={`/artists/${event.artist.slug}`}
              className="text-2xl text-white hover:text-primary-300 transition-colors"
            >
              {event.artist.name}
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* メインコンテンツ */}
          <div className="lg:col-span-2">
            {/* 購入済みの場合、視聴ボタン表示 */}
            {userPurchase && (
              <div className="card bg-green-50 border-2 border-green-500 mb-8">
                <h3 className="text-xl font-bold text-green-800 mb-4">
                  ✓ チケット購入済み
                </h3>
                <p className="text-gray-700 mb-4">
                  このイベントのチケットを購入済みです。視聴ページでライブ配信をお楽しみください。
                </p>
                <Link
                  href={`/watch/${event.slug}?token=${userPurchase.accessToken}`}
                  className="btn btn-primary inline-block"
                >
                  視聴ページへ
                </Link>
              </div>
            )}

            {/* イベント情報 */}
            <div className="card mb-8">
              <h2 className="text-2xl font-bold mb-4">イベント情報</h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <span className="text-gray-600 w-32">開催日時</span>
                  <span className="font-medium">
                    {new Date(event.startDate).toLocaleDateString('ja-JP', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                {event.endDate && (
                  <div className="flex items-start">
                    <span className="text-gray-600 w-32">終了日時</span>
                    <span className="font-medium">
                      {new Date(event.endDate).toLocaleDateString('ja-JP', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                )}
                <div className="flex items-start">
                  <span className="text-gray-600 w-32">配信形式</span>
                  <span className="font-medium">
                    {event.eventType === 'LIVE' ? 'ライブ配信' : 'アーカイブ配信'}
                  </span>
                </div>
              </div>
            </div>

            {/* 説明 */}
            {event.description && (
              <div className="card mb-8">
                <h2 className="text-2xl font-bold mb-4">イベント詳細</h2>
                <div className="prose max-w-none">
                  <p className="whitespace-pre-wrap text-gray-700">
                    {event.description}
                  </p>
                </div>
              </div>
            )}

            {/* アーティスト情報 */}
            <div className="card">
              <h2 className="text-2xl font-bold mb-4">アーティスト</h2>
              <Link
                href={`/artists/${event.artist.slug}`}
                className="flex items-center hover:bg-gray-50 p-4 rounded-lg transition-colors"
              >
                {event.artist.imageUrl && (
                  <div className="relative w-20 h-20 rounded-full overflow-hidden mr-4">
                    <Image
                      src={event.artist.imageUrl}
                      alt={event.artist.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-bold">{event.artist.name}</h3>
                  {event.artist.bio && (
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {event.artist.bio}
                    </p>
                  )}
                </div>
              </Link>
            </div>
          </div>

          {/* サイドバー - チケット購入 */}
          <div className="lg:col-span-1">
            <div className="card sticky top-4">
              <h2 className="text-2xl font-bold mb-6">チケット</h2>
              
              {!session ? (
                <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 mb-4">
                  <p className="text-sm text-yellow-800 mb-2">
                    チケットを購入するにはログインが必要です
                  </p>
                  <Link href="/auth/signin" className="btn btn-primary w-full">
                    ログイン
                  </Link>
                </div>
              ) : userPurchase ? (
                <div className="bg-green-50 border border-green-300 rounded-lg p-4">
                  <p className="text-sm text-green-800 font-medium">
                    ✓ 購入済み
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {event.tickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold">{ticket.name}</h3>
                        <span className="text-xl font-bold text-primary-600">
                          ¥{ticket.price.toLocaleString()}
                        </span>
                      </div>
                      {ticket.description && (
                        <p className="text-sm text-gray-600 mb-3">
                          {ticket.description}
                        </p>
                      )}
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm text-gray-600">
                          残り {ticket.stock - ticket.soldCount} 枚
                        </span>
                        <span className="text-sm text-gray-500">
                          {ticket.soldCount} 人が購入
                        </span>
                      </div>
                      <PurchaseButton
                        ticketId={ticket.id}
                        eventSlug={event.slug}
                        disabled={ticket.soldCount >= ticket.stock}
                      />
                    </div>
                  ))}
                  {event.tickets.length === 0 && (
                    <p className="text-center text-gray-500 py-4">
                      チケットの販売がありません
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
