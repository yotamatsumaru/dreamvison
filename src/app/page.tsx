import Link from 'next/link'
import prisma from '@/lib/prisma'
import Image from 'next/image'

export default async function HomePage() {
  const upcomingEvents = await prisma.event.findMany({
    where: {
      status: 'UPCOMING',
    },
    include: {
      artist: true,
      _count: {
        select: {
          tickets: true,
        },
      },
    },
    orderBy: {
      startDate: 'asc',
    },
    take: 6,
  })

  const liveEvents = await prisma.event.findMany({
    where: {
      status: 'LIVE',
    },
    include: {
      artist: true,
    },
    take: 3,
  })

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">
            ライブ配信プラットフォーム
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            高品質なライブ配信とアーカイブ視聴で、
            <br />
            お気に入りのアーティストを応援しよう
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/events"
              className="btn btn-primary bg-white text-primary-700 hover:bg-gray-100 text-lg px-8 py-3"
            >
              イベントを探す
            </Link>
            <Link
              href="/artists"
              className="btn bg-primary-700 text-white hover:bg-primary-600 text-lg px-8 py-3"
            >
              アーティスト一覧
            </Link>
          </div>
        </div>
      </section>

      {/* Live Now Section */}
      {liveEvents.length > 0 && (
        <section className="py-16 bg-red-50">
          <div className="container mx-auto px-4">
            <div className="flex items-center mb-8">
              <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-3 animate-pulse"></span>
              <h2 className="text-3xl font-bold text-gray-900">
                現在配信中
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {liveEvents.map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.slug}`}
                  className="card hover:shadow-xl transition-shadow"
                >
                  {event.imageUrl && (
                    <div className="relative h-48 mb-4 rounded-lg overflow-hidden">
                      <Image
                        src={event.imageUrl}
                        alt={event.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center">
                        <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
                        LIVE
                      </div>
                    </div>
                  )}
                  <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                  <p className="text-gray-600">{event.artist.name}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Upcoming Events Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-gray-900">
            開催予定のイベント
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map((event) => (
              <Link
                key={event.id}
                href={`/events/${event.slug}`}
                className="card hover:shadow-xl transition-shadow"
              >
                {event.imageUrl && (
                  <div className="relative h-48 mb-4 rounded-lg overflow-hidden">
                    <Image
                      src={event.imageUrl}
                      alt={event.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                <p className="text-gray-600 mb-2">{event.artist.name}</p>
                <p className="text-sm text-gray-500">
                  {new Date(event.startDate).toLocaleDateString('ja-JP', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </Link>
            ))}
          </div>
          {upcomingEvents.length === 0 && (
            <p className="text-center text-gray-500 py-12">
              現在、開催予定のイベントはありません
            </p>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center text-gray-900">
            サービスの特徴
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card text-center">
              <div className="text-4xl mb-4">🎥</div>
              <h3 className="text-xl font-bold mb-2">高品質配信</h3>
              <p className="text-gray-600">
                AWS MediaLiveを使用した安定した高品質ライブ配信
              </p>
            </div>
            <div className="card text-center">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-bold mb-2">セキュア視聴</h3>
              <p className="text-gray-600">
                DRM保護とCloudFront署名付きURLによる安全な配信
              </p>
            </div>
            <div className="card text-center">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-xl font-bold mb-2">マルチデバイス対応</h3>
              <p className="text-gray-600">
                PC、スマートフォン、タブレットで視聴可能
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
