'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface PurchaseButtonProps {
  ticketId: string
  eventSlug: string
  disabled?: boolean
}

export default function PurchaseButton({
  ticketId,
  eventSlug,
  disabled = false,
}: PurchaseButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handlePurchase = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticketId,
          eventSlug,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'チケットの購入に失敗しました')
      }

      // Stripe Checkoutページにリダイレクト
      if (data.data.url) {
        window.location.href = data.data.url
      }
    } catch (err: any) {
      console.error('Purchase error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-2 text-sm">
          {error}
        </div>
      )}
      <button
        onClick={handlePurchase}
        disabled={disabled || loading}
        className="btn btn-primary w-full"
      >
        {loading ? '処理中...' : disabled ? '売り切れ' : '購入する'}
      </button>
    </div>
  )
}
