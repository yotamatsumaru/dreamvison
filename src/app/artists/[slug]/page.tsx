import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import prisma from '@/lib/prisma'

interface PageProps {
  params: { slug: string }
}

export default async function ArtistDetailPage({ params }: PageProps) {
  const artist = await prisma.artist.findUnique({
    where: { slug: params.slug },
    include: {
      events: {
        include: {
          _count: {
            select: {
              tickets: true,
              purchases: true,
            },
          },
        },
        orderBy: {
          startDate: 'desc',
        },
      },
    },
  })

  if (!artist) {
    notFound()
  }

  const upcomingEvents = artist.events.filter((e) => e.status === 'UPCOMING' || e.status === 'LIVE')
  const pastEvents = artist.events.filter((e) => e.status === 'ENDED' || e.status === 'ARCHIVED')

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative h-96 bg-gradient-to-r from-primary-600 to-primary-800">
        {artist.imageUrl && (
          <Image
            src={artist.imageUrl}
            alt={artist.name}
            fill
            className="object-cover opacity-40"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="container mx-auto">
            <h1 className="text-6xl font-bold text-white mb-4">{artist.name}</h1>
            {artist.bio && (
              <p className="text-xl text-white/90 max-w-3xl">{artist.bio}</p>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* 開催予定・配信中のイベント */}
        {upcomingEvents.length > 0 && (
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">開催予定・配信中</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </section>
        )}

        {/* 過去のイベント */}
        {pastEvents.length > 0 && (
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">過去のイベント</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </section>
        )}

        {artist.events.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              このアーティストのイベントはまだありません
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function EventCard({ event }: { event: any }) {
  const statusInfo = {
    LIVE: { label: '配信中', color: 'bg-red-500' },
    UPCOMING: { label: '開催予定', color: 'bg-blue-500' },
    ENDED: { label: '終了', color: 'bg-gray-500' },
    ARCHIVED: { label: 'アーカイブ', color: 'bg-purple-500' },
  }

  const info = statusInfo[event.status as keyof typeof statusInfo]

  return (
    <Link
      href={`/events/${event.slug}`}
      className="card hover:shadow-xl transition-shadow group"
    >
      {event.imageUrl && (
        <div className="relative h-48 mb-4 rounded-lg overflow-hidden">
          <Image
            src={event.imageUrl}
            alt={event.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className={`absolute top-2 right-2 ${info.color} text-white px-3 py-1 rounded-full text-sm font-bold`}>
            {event.status === 'LIVE' && (
              <span className="inline-block w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
            )}
            {info.label}
          </div>
        </div>
      )}
      <h3 className="text-xl font-bold mb-2 group-hover:text-primary-600 transition-colors">
        {event.title}
      </h3>
      <p className="text-sm text-gray-500 mb-3">
        {new Date(event.startDate).toLocaleDateString('ja-JP', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })}
      </p>
      {event._count.purchases > 0 && (
        <p className="text-sm text-primary-600 font-semibold">
          {event._count.purchases}人が購入
        </p>
      )}
    </Link>
  )
}
