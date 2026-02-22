import { NextRequest, NextResponse } from 'next/server'
import stripe from '@/lib/stripe'
import prisma from '@/lib/prisma'
import { generateAccessToken } from '@/lib/auth'
import { headers } from 'next/headers'

// POST /api/stripe/webhook - Stripe Webhook処理
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { success: false, error: 'No signature' },
        { status: 400 }
      )
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET is not configured')
      return NextResponse.json(
        { success: false, error: 'Webhook secret not configured' },
        { status: 500 }
      )
    }

    // Webhook署名検証
    let event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json(
        { success: false, error: 'Invalid signature' },
        { status: 400 }
      )
    }

    // イベント処理
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any

        // 購入完了処理
        const purchase = await prisma.purchase.findUnique({
          where: { stripeSessionId: session.id },
          include: { ticket: true },
        })

        if (purchase) {
          // アクセストークン生成
          const accessToken = generateAccessToken(
            purchase.id,
            purchase.userId,
            purchase.eventId,
            '30d' // 30日間有効
          )

          // 購入ステータス更新
          await prisma.purchase.update({
            where: { id: purchase.id },
            data: {
              status: 'COMPLETED',
              stripePaymentId: session.payment_intent,
              accessToken,
              accessTokenExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
          })

          // チケット販売数更新
          await prisma.ticket.update({
            where: { id: purchase.ticketId },
            data: {
              soldCount: {
                increment: 1,
              },
            },
          })

          console.log(`Purchase completed: ${purchase.id}`)
        }
        break
      }

      case 'charge.refunded': {
        const charge = event.data.object as any

        // 返金処理
        const purchase = await prisma.purchase.findFirst({
          where: { stripePaymentId: charge.id },
        })

        if (purchase) {
          await prisma.purchase.update({
            where: { id: purchase.id },
            data: {
              status: 'REFUNDED',
            },
          })

          // チケット販売数減少
          await prisma.ticket.update({
            where: { id: purchase.ticketId },
            data: {
              soldCount: {
                decrement: 1,
              },
            },
          })

          console.log(`Purchase refunded: ${purchase.id}`)
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ success: true, received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { success: false, error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
