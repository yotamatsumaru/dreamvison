import Link from 'next/link'
import Image from 'next/image'
import prisma from '@/lib/prisma'

export default async function EventsPage() {
  const events = await prisma.event.findMany({
    include: {
      artist: {
        select: {
          id: true,
          name: true,
          slug: true,
          imageUrl: true,
        },
      },
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
  })

  const groupedEvents = {
    live: events.filter((e) => e.status === 'LIVE'),
    upcoming: events.filter((e) => e.status === 'UPCOMING'),
    ended: events.filter((e) => e.status === 'ENDED'),
    archived: events.filter((e) => e.status === 'ARCHIVED'),
  }

  const statusLabels = {
    live: { label: '配信中', color: 'bg-red-500' },
    upcoming: { label: '開催予定', color: 'bg-blue-500' },
    ended: { label: '終了', color: 'bg-gray-500' },
    archived: { label: 'アーカイブ', color: 'bg-purple-500' },
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">イベント一覧</h1>

      {/* 配信中 */}
      {groupedEvents.live.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center mb-6">
            <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-3 animate-pulse"></span>
            <h2 className="text-2xl font-bold">現在配信中</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groupedEvents.live.map((event) => (
              <EventCard key={event.id} event={event} status="live" />
            ))}
          </div>
        </section>
      )}

      {/* 開催予定 */}
      {groupedEvents.upcoming.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">開催予定</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groupedEvents.upcoming.map((event) => (
              <EventCard key={event.id} event={event} status="upcoming" />
            ))}
          </div>
        </section>
      )}

      {/* アーカイブ */}
      {groupedEvents.archived.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">アーカイブ配信</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groupedEvents.archived.map((event) => (
              <EventCard key={event.id} event={event} status="archived" />
            ))}
          </div>
        </section>
      )}

      {events.length === 0 && (
        <p className="text-center text-gray-500 py-12">
          現在、イベントはありません
        </p>
      )}
    </div>
  )
}

function EventCard({ event, status }: { event: any; status: keyof typeof statusLabels }) {
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
      <p className="text-gray-600 mb-2">{event.artist.name}</p>
      <p className="text-sm text-gray-500 mb-3">
        {new Date(event.startDate).toLocaleDateString('ja-JP', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })}
      </p>
      {event._count.tickets > 0 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">チケット販売中</span>
          <span className="text-primary-600 font-semibold">
            {event._count.purchases}人が購入
          </span>
        </div>
      )}
    </Link>
  )
}
