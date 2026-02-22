import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/nextauth'
import prisma from '@/lib/prisma'
import Link from 'next/link'
import Image from 'next/image'

export default async function MyTicketsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/auth/signin?callbackUrl=/my-tickets')
  }

  const purchases = await prisma.purchase.findMany({
    where: {
      userId: session.user.id,
      status: 'COMPLETED',
    },
    include: {
      event: {
        include: {
          artist: true,
        },
      },
      ticket: true,
    },
    orderBy: {
      purchasedAt: 'desc',
    },
  })

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">マイチケット</h1>

      {purchases.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">🎫</div>
          <h2 className="text-2xl font-bold mb-4">チケットがありません</h2>
          <p className="text-gray-600 mb-6">
            イベントのチケットを購入すると、ここに表示されます
          </p>
          <Link href="/events" className="btn btn-primary inline-block">
            イベントを探す
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {purchases.map((purchase) => {
            const isExpired = purchase.accessTokenExpiry && purchase.accessTokenExpiry < new Date()
            const eventStatus = purchase.event.status

            return (
              <div key={purchase.id} className="card">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* イベント画像 */}
                  <div className="relative h-48 md:h-auto rounded-lg overflow-hidden">
                    {purchase.event.imageUrl ? (
                      <Image
                        src={purchase.event.imageUrl}
                        alt={purchase.event.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-4xl">🎵</span>
                      </div>
                    )}
                    {eventStatus === 'LIVE' && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center">
                        <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
                        LIVE
                      </div>
                    )}
                  </div>

                  {/* チケット情報 */}
                  <div className="md:col-span-2">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h2 className="text-2xl font-bold mb-2">
                          {purchase.event.title}
                        </h2>
                        <p className="text-gray-600">{purchase.event.artist.name}</p>
                      </div>
                      <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-semibold">
                        {purchase.ticket.name}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <p>
                        📅 開催日時:{' '}
                        {new Date(purchase.event.startDate).toLocaleDateString('ja-JP', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      <p>💰 金額: ¥{purchase.amount.toLocaleString()}</p>
                      <p>
                        🎫 購入日:{' '}
                        {new Date(purchase.purchasedAt).toLocaleDateString('ja-JP')}
                      </p>
                      {purchase.accessTokenExpiry && (
                        <p>
                          ⏰ 有効期限:{' '}
                          {new Date(purchase.accessTokenExpiry).toLocaleDateString('ja-JP')}
                          {isExpired && (
                            <span className="text-red-600 ml-2">(期限切れ)</span>
                          )}
                        </p>
                      )}
                    </div>

                    {/* アクションボタン */}
                    <div className="flex gap-4">
                      {purchase.accessToken && !isExpired ? (
                        <>
                          {eventStatus === 'UPCOMING' && (
                            <span className="text-gray-500 text-sm">
                              配信開始までお待ちください
                            </span>
                          )}
                          {(eventStatus === 'LIVE' || eventStatus === 'ARCHIVED') && (
                            <Link
                              href={`/watch/${purchase.event.slug}?token=${purchase.accessToken}`}
                              className="btn btn-primary"
                            >
                              🎥 視聴ページへ
                            </Link>
                          )}
                          <Link
                            href={`/events/${purchase.event.slug}`}
                            className="btn btn-secondary"
                          >
                            イベント詳細
                          </Link>
                        </>
                      ) : (
                        <span className="text-red-600 text-sm">
                          このチケットの視聴期限が切れています
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
