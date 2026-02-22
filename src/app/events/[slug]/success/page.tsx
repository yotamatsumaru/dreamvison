import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/nextauth'
import prisma from '@/lib/prisma'

interface PageProps {
  params: { slug: string }
  searchParams: { session_id?: string }
}

export default async function PurchaseSuccessPage({ params, searchParams }: PageProps) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id || !searchParams.session_id) {
    notFound()
  }

  const event = await prisma.event.findUnique({
    where: { slug: params.slug },
    include: { artist: true },
  })

  if (!event) {
    notFound()
  }

  const purchase = await prisma.purchase.findFirst({
    where: {
      stripeSessionId: searchParams.session_id,
      userId: session.user.id,
      eventId: event.id,
    },
    include: {
      ticket: true,
    },
  })

  if (!purchase) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="card text-center">
          <div className="text-6xl mb-6">✅</div>
          <h1 className="text-3xl font-bold mb-4">購入が完了しました！</h1>
          <p className="text-gray-600 mb-8">
            チケットの購入ありがとうございます。
            <br />
            以下のリンクから視聴ページにアクセスできます。
          </p>

          <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
            <h2 className="font-bold mb-2">{event.title}</h2>
            <p className="text-sm text-gray-600 mb-1">
              アーティスト: {event.artist.name}
            </p>
            <p className="text-sm text-gray-600 mb-1">
              チケット: {purchase.ticket.name}
            </p>
            <p className="text-sm text-gray-600 mb-1">
              金額: ¥{purchase.amount.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">
              購入日時:{' '}
              {new Date(purchase.purchasedAt).toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>

          {purchase.accessToken && (
            <div className="space-y-4">
              <Link
                href={`/watch/${event.slug}?token=${purchase.accessToken}`}
                className="btn btn-primary inline-block text-lg px-8 py-3"
              >
                🎥 視聴ページへ
              </Link>
              <div className="text-sm text-gray-600">
                <p>
                  ※ このリンクは{' '}
                  {purchase.accessTokenExpiry
                    ? new Date(purchase.accessTokenExpiry).toLocaleDateString('ja-JP')
                    : '30日間'}
                  まで有効です
                </p>
                <p>マイチケットページからもアクセスできます</p>
              </div>
            </div>
          )}

          <div className="mt-8 pt-8 border-t">
            <div className="flex gap-4 justify-center">
              <Link href="/my-tickets" className="btn btn-secondary">
                マイチケット
              </Link>
              <Link href="/events" className="btn btn-secondary">
                イベント一覧
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="font-bold mb-2">📧 購入確認メール</h3>
          <p className="text-sm text-gray-700">
            登録されたメールアドレスに購入確認メールと視聴URLを送信しました。
            <br />
            メールが届いていない場合は、迷惑メールフォルダをご確認ください。
          </p>
        </div>
      </div>
    </div>
  )
}
