import { EventStatus, EventType, PurchaseStatus, UserRole } from '@prisma/client'

// イベント型
export interface EventWithRelations {
  id: string
  title: string
  slug: string
  description: string | null
  imageUrl: string | null
  status: EventStatus
  eventType: EventType
  startDate: Date
  endDate: Date | null
  streamUrl: string | null
  hlsUrl: string | null
  mediaLiveId: string | null
  mediaPackageId: string | null
  cloudfrontUrl: string | null
  artist: {
    id: string
    name: string
    slug: string
    imageUrl: string | null
  }
  tickets: TicketWithEvent[]
}

// チケット型
export interface TicketWithEvent {
  id: string
  name: string
  description: string | null
  price: number
  stripePriceId: string | null
  stock: number
  soldCount: number
  eventId: string
}

// 購入型
export interface PurchaseWithRelations {
  id: string
  userId: string
  eventId: string
  ticketId: string
  stripeSessionId: string
  stripePaymentId: string | null
  amount: number
  status: PurchaseStatus
  accessToken: string | null
  accessTokenExpiry: Date | null
  purchasedAt: Date
  event: {
    id: string
    title: string
    slug: string
    imageUrl: string | null
  }
  ticket: {
    id: string
    name: string
    price: number
  }
  user: {
    id: string
    name: string | null
    email: string | null
  }
}

// アーティスト型
export interface ArtistWithEvents {
  id: string
  name: string
  slug: string
  bio: string | null
  imageUrl: string | null
  events: EventWithRelations[]
}

// AWS MediaLive Channel
export interface MediaLiveChannel {
  id: string
  name: string
  state: string
  inputAttachments?: {
    inputId?: string
  }[]
  destinations?: {
    id?: string
    url?: string
  }[]
}

// CloudFront署名付きURL設定
export interface SignedUrlConfig {
  url: string
  dateLessThan: Date
  privateKey: string
  keyPairId: string
}

// Stripe Checkout セッション作成パラメータ
export interface CreateCheckoutSessionParams {
  ticketId: string
  eventSlug: string
  successUrl: string
  cancelUrl: string
}

// APIレスポンス型
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// 統計データ型
export interface DashboardStats {
  totalRevenue: number
  totalPurchases: number
  totalEvents: number
  totalArtists: number
  recentPurchases: PurchaseWithRelations[]
  topEvents: {
    eventId: string
    eventTitle: string
    totalSales: number
    purchaseCount: number
  }[]
}
