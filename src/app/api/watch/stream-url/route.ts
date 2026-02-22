import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyAccessToken } from '@/lib/auth'
import { generateSignedUrl } from '@/lib/aws'

// POST /api/watch/stream-url - 署名付きストリームURL取得
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

    // 購入確認
    const purchase = await prisma.purchase.findUnique({
      where: { 
        id: payload.purchaseId,
        accessToken: token,
      },
      include: {
        event: true,
      },
    })

    if (!purchase || purchase.status !== 'COMPLETED') {
      return NextResponse.json(
        { success: false, error: 'Invalid purchase' },
        { status: 403 }
      )
    }

    // イベント確認
    if (eventSlug && purchase.event.slug !== eventSlug) {
      return NextResponse.json(
        { success: false, error: 'Token is not valid for this event' },
        { status: 403 }
      )
    }

    // ストリームURL確認
    const streamUrl = purchase.event.cloudfrontUrl || purchase.event.hlsUrl || purchase.event.streamUrl
    if (!streamUrl) {
      return NextResponse.json(
        { success: false, error: 'Stream URL not configured' },
        { status: 404 }
      )
    }

    // CloudFront署名付きURL生成（24時間有効）
    let signedUrl = streamUrl
    try {
      if (process.env.CLOUDFRONT_PRIVATE_KEY && process.env.CLOUDFRONT_KEY_PAIR_ID) {
        signedUrl = generateSignedUrl(streamUrl, 24 * 60 * 60) // 24時間
      }
    } catch (error) {
      console.warn('Failed to generate signed URL, using original URL:', error)
    }

    return NextResponse.json({
      success: true,
      data: {
        streamUrl: signedUrl,
        eventId: purchase.event.id,
        eventTitle: purchase.event.title,
        eventStatus: purchase.event.status,
        expiresIn: 24 * 60 * 60, // 24時間（秒）
      },
    })
  } catch (error) {
    console.error('Failed to get stream URL:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get stream URL' },
      { status: 500 }
    )
  }
}
