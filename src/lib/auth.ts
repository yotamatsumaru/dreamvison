import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret'

export interface AccessTokenPayload {
  purchaseId: string
  userId: string
  eventId: string
  exp?: number
}

// アクセストークン生成（視聴用）
export function generateAccessToken(
  purchaseId: string,
  userId: string,
  eventId: string,
  expiresIn: string = '7d'
): string {
  return jwt.sign(
    {
      purchaseId,
      userId,
      eventId,
    },
    JWT_SECRET,
    { expiresIn }
  )
}

// アクセストークン検証
export function verifyAccessToken(token: string): AccessTokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AccessTokenPayload
    return decoded
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

// トークンのデコード（検証なし）
export function decodeAccessToken(token: string): AccessTokenPayload | null {
  try {
    const decoded = jwt.decode(token) as AccessTokenPayload
    return decoded
  } catch (error) {
    console.error('Token decode failed:', error)
    return null
  }
}
