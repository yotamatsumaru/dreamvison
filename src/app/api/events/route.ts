import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/events - イベント一覧取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const artistSlug = searchParams.get('artist')

    const events = await prisma.event.findMany({
      where: {
        ...(status && { status: status as any }),
        ...(artistSlug && { artist: { slug: artistSlug } }),
      },
      include: {
        artist: {
          select: {
            id: true,
            name: true,
            slug: true,
            imageUrl: true,
          },
        },
        tickets: true,
        _count: {
          select: {
            purchases: true,
          },
        },
      },
      orderBy: {
        startDate: 'desc',
      },
    })

    return NextResponse.json({ success: true, data: events })
  } catch (error) {
    console.error('Failed to fetch events:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch events' },
      { status: 500 }
    )
  }
}
