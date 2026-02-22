import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')

  // 管理者アカウント作成
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: adminPassword,
      name: '管理者',
    },
  })
  console.log('Created admin:', admin.email)

  // アーティスト作成
  const artist1 = await prisma.artist.upsert({
    where: { slug: 'sample-artist' },
    update: {},
    create: {
      name: 'Sample Artist',
      slug: 'sample-artist',
      bio: 'サンプルアーティストのプロフィールです。素晴らしい音楽を届けます。',
      imageUrl: 'https://via.placeholder.com/600x400?text=Sample+Artist',
    },
  })
  console.log('Created artist:', artist1.name)

  const artist2 = await prisma.artist.upsert({
    where: { slug: 'test-band' },
    update: {},
    create: {
      name: 'Test Band',
      slug: 'test-band',
      bio: 'テストバンドのプロフィールです。ロックミュージックを演奏します。',
      imageUrl: 'https://via.placeholder.com/600x400?text=Test+Band',
    },
  })
  console.log('Created artist:', artist2.name)

  // イベント作成
  const event1 = await prisma.event.upsert({
    where: { slug: 'sample-live-concert-2024' },
    update: {},
    create: {
      title: 'Sample Live Concert 2024',
      slug: 'sample-live-concert-2024',
      description: 'サンプルアーティストの最新ライブコンサートです。最高のパフォーマンスをお届けします！',
      imageUrl: 'https://via.placeholder.com/1200x630?text=Sample+Live+Concert',
      status: 'UPCOMING',
      eventType: 'LIVE',
      startDate: new Date('2024-12-31T19:00:00Z'),
      endDate: new Date('2024-12-31T21:00:00Z'),
      streamUrl: 'https://example.cloudfront.net/sample/index.m3u8',
      artistId: artist1.id,
    },
  })
  console.log('Created event:', event1.title)

  const event2 = await prisma.event.upsert({
    where: { slug: 'archive-concert' },
    update: {},
    create: {
      title: 'Archive Concert',
      slug: 'archive-concert',
      description: '過去のライブコンサートのアーカイブ配信です。いつでも視聴可能です。',
      imageUrl: 'https://via.placeholder.com/1200x630?text=Archive+Concert',
      status: 'ARCHIVED',
      eventType: 'ARCHIVE',
      startDate: new Date('2024-06-01T18:00:00Z'),
      endDate: new Date('2024-06-01T20:00:00Z'),
      streamUrl: 'https://example.cloudfront.net/archive/index.m3u8',
      artistId: artist1.id,
    },
  })
  console.log('Created event:', event2.title)

  const event3 = await prisma.event.upsert({
    where: { slug: 'test-band-live' },
    update: {},
    create: {
      title: 'Test Band Live',
      slug: 'test-band-live',
      description: 'テストバンドのライブ配信です。ロックンロールな夜をお楽しみください！',
      imageUrl: 'https://via.placeholder.com/1200x630?text=Test+Band+Live',
      status: 'UPCOMING',
      eventType: 'LIVE',
      startDate: new Date('2024-11-15T19:00:00Z'),
      endDate: new Date('2024-11-15T21:30:00Z'),
      streamUrl: 'https://example.cloudfront.net/testband/index.m3u8',
      artistId: artist2.id,
    },
  })
  console.log('Created event:', event3.title)

  // チケット作成
  const ticket1 = await prisma.ticket.create({
    data: {
      name: '通常チケット',
      description: '一般視聴チケット',
      price: 3000,
      stock: 1000,
      soldCount: 0,
      eventId: event1.id,
    },
  })
  console.log('Created ticket:', ticket1.name)

  const ticket2 = await prisma.ticket.create({
    data: {
      name: 'プレミアムチケット',
      description: '特典付きプレミアムチケット',
      price: 5000,
      stock: 500,
      soldCount: 0,
      eventId: event1.id,
    },
  })
  console.log('Created ticket:', ticket2.name)

  const ticket3 = await prisma.ticket.create({
    data: {
      name: 'アーカイブ視聴チケット',
      description: 'アーカイブ配信視聴チケット',
      price: 2000,
      stock: 10000,
      soldCount: 0,
      eventId: event2.id,
    },
  })
  console.log('Created ticket:', ticket3.name)

  const ticket4 = await prisma.ticket.create({
    data: {
      name: '早割チケット',
      description: '早期購入特典チケット',
      price: 2500,
      stock: 300,
      soldCount: 0,
      eventId: event3.id,
    },
  })
  console.log('Created ticket:', ticket4.name)

  console.log('Seeding finished.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
