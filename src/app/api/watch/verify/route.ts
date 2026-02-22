import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyAccessToken } from '@/lib/auth'

// POST /api/watch/verify - アクセストークン検証
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, eventSlug } = body

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token is required' },
        { status: 400 }
      )
    }

    // トークン検証
    const payload = verifyAccessToken(token)
    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // 購入情報確認
    const purchase = await prisma.purchase.findUnique({
      where: { 
        id: payload.purchaseId,
        accessToken: token,
      },
      include: {
        event: true,
        ticket: true,
        user: true,
      },
    })

    if (!purchase) {
      return NextResponse.json(
        { success: false, error: 'Purchase not found' },
        { status: 404 }
      )
    }

    if (purchase.status !== 'COMPLETED') {
      return NextResponse.json(
        { success: false, error: 'Purchase is not completed' },
        { status: 403 }
      )
    }

    // イベントslugの検証
    if (eventSlug && purchase.event.slug !== eventSlug) {
      return NextResponse.json(
        { success: false, error: 'Token is not valid for this event' },
        { status: 403 }
      )
    }

    // アクセストークン有効期限確認
    if (purchase.accessTokenExpiry && purchase.accessTokenExpiry < new Date()) {
      return NextResponse.json(
        { success: false, error: 'Token has expired' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        purchase: {
          id: purchase.id,
          status: purchase.status,
          purchasedAt: purchase.purchasedAt,
        },
        event: {
          id: purchase.event.id,
          title: purchase.event.title,
          slug: purchase.event.slug,
          status: purchase.event.status,
          eventType: purchase.event.eventType,
          startDate: purchase.event.startDate,
          imageUrl: purchase.event.imageUrl,
        },
        ticket: {
          id: purchase.ticket.id,
          name: purchase.ticket.name,
        },
        user: {
          id: purchase.user.id,
          name: purchase.user.name,
          email: purchase.user.email,
        },
      },
    })
  } catch (error) {
    console.error('Token verification failed:', error)
    return NextResponse.json(
      { success: false, error: 'Token verification failed' },
      { status: 500 }
    )
  }
}
