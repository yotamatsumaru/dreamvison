import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/nextauth'
import prisma from '@/lib/prisma'
import stripe from '@/lib/stripe'

// POST /api/stripe/checkout - Checkoutセッション作成
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { ticketId, eventSlug } = body

    // チケット情報取得
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        event: true,
      },
    })

    if (!ticket) {
      return NextResponse.json(
        { success: false, error: 'Ticket not found' },
        { status: 404 }
      )
    }

    // 在庫確認
    if (ticket.soldCount >= ticket.stock) {
      return NextResponse.json(
        { success: false, error: 'Ticket sold out' },
        { status: 400 }
      )
    }

    // Stripe Checkoutセッション作成
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'jpy',
            product_data: {
              name: `${ticket.event.title} - ${ticket.name}`,
              description: ticket.description || undefined,
              images: ticket.event.imageUrl ? [ticket.event.imageUrl] : undefined,
            },
            unit_amount: ticket.price,
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXTAUTH_URL}/events/${eventSlug}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/events/${eventSlug}`,
      metadata: {
        userId: session.user.id,
        ticketId: ticket.id,
        eventId: ticket.eventId,
      },
    })

    // 購入レコード作成（PENDING状態）
    await prisma.purchase.create({
      data: {
        userId: session.user.id,
        eventId: ticket.eventId,
        ticketId: ticket.id,
        stripeSessionId: checkoutSession.id,
        amount: ticket.price,
        status: 'PENDING',
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        sessionId: checkoutSession.id,
        url: checkoutSession.url,
      },
    })
  } catch (error) {
    console.error('Failed to create checkout session:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
