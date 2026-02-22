import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/events/[slug] - イベント詳細取得
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const event = await prisma.event.findUnique({
      where: { slug: params.slug },
      include: {
        artist: {
          select: {
            id: true,
            name: true,
            slug: true,
            imageUrl: true,
            bio: true,
          },
        },
        tickets: {
          orderBy: {
            price: 'asc',
          },
        },
        _count: {
          select: {
            purchases: true,
          },
        },
      },
    })

    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: event })
  } catch (error) {
    console.error('Failed to fetch event:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch event' },
      { status: 500 }
    )
  }
}
