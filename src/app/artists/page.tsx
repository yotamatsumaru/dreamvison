import Link from 'next/link'
import Image from 'next/image'
import prisma from '@/lib/prisma'

export default async function ArtistsPage() {
  const artists = await prisma.artist.findMany({
    include: {
      _count: {
        select: {
          events: true,
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  })

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">アーティスト一覧</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {artists.map((artist) => (
          <Link
            key={artist.id}
            href={`/artists/${artist.slug}`}
            className="card hover:shadow-xl transition-shadow group"
          >
            {artist.imageUrl && (
              <div className="relative h-64 mb-4 rounded-lg overflow-hidden">
                <Image
                  src={artist.imageUrl}
                  alt={artist.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}
            <h2 className="text-2xl font-bold mb-2 group-hover:text-primary-600 transition-colors">
              {artist.name}
            </h2>
            {artist.bio && (
              <p className="text-gray-600 text-sm line-clamp-3 mb-3">
                {artist.bio}
              </p>
            )}
            <div className="flex items-center text-sm text-gray-500">
              <span>🎵 {artist._count.events} イベント</span>
            </div>
          </Link>
        ))}
      </div>

      {artists.length === 0 && (
        <p className="text-center text-gray-500 py-12">
          現在、登録されているアーティストはいません
        </p>
      )}
    </div>
  )
}
