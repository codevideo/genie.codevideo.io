import React, { useEffect, useState } from 'react'
import Confetti from 'react-confetti'
import Link from 'next/link'
import { useAppDispatch } from '@/hooks/useAppDispatch'
import { setShowSignInOverlay, signalTokenRefresh } from '@/store/authSlice'

interface PaymentSuccessContentProps {
  tier: 'pro' | 'pro-lifetime'
}

export const PaymentSuccessContent = ({ tier }: PaymentSuccessContentProps) => {
  const dispatch = useAppDispatch()
  const [loading, setLoading] = useState(true)
  const [verified, setVerified] = useState(false)
  const [email, setEmail] = useState<string | null>(null)
  const [tempPassword, setTempPassword] = useState<string | null>(null)
  const [passwordCopied, setPasswordCopied] = useState(false)

  const verifyPayment = async (stripeSessionId: string, product: string) => {
    try {
      const res = await fetch('/.netlify/functions/stripeSuccess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stripeSessionId, product }),
      })

      if (!res.ok) {
        throw new Error(`Payment verification failed: ${res.status}`)
      }

      const data = await res.json()
      setVerified(true)
      if (data.email) setEmail(data.email)
      if (data.tempPassword) setTempPassword(data.tempPassword)
      return data
    } catch (error) {
      console.error('Error verifying payment:', error)
      throw error
    }
  }

  useEffect(() => {
    if (typeof window === 'undefined') return

    const searchParams = new URLSearchParams(window.location.search)
    const stripeSessionId = searchParams.get('session_id')

    if (!stripeSessionId) {
      setLoading(false)
      return
    }

    const handleVerification = async () => {
      try {
        await verifyPayment(stripeSessionId, tier)
        dispatch(signalTokenRefresh())
      } catch (error) {
        // Error already logged
      } finally {
        setLoading(false)
      }
    }

    handleVerification()
  }, [tier, dispatch])

  const formatTierName = () => {
    return tier === 'pro-lifetime' ? 'Pro Lifetime' : 'Pro'
  }

  const onClickCopyPassword = () => {
    if (typeof window !== 'undefined' && tempPassword) {
      navigator.clipboard.writeText(tempPassword)
      setPasswordCopied(true)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center pt-16">
      <div className="text-center max-w-md mx-auto px-4">
        {loading && (
          <div className="space-y-4">
            <div className="text-4xl animate-pulse">✨</div>
            <p className="text-lg text-gray-400">Verifying your payment...</p>
          </div>
        )}

        {!loading && verified && (
          <>
            <Confetti
              numberOfPieces={500}
              recycle={false}
              colors={['#8b5cf6', '#ec4899', '#06b6d4']}
            />
            
            <div className="text-6xl mb-6">🎉</div>
            <h1 className="text-3xl font-bold mb-4">Welcome to Pro!</h1>
            
            {tempPassword ? (
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-700 mb-6">
                <p className="text-gray-300 mb-4">
                  Your <span className="text-purple-400 font-semibold">{formatTierName()}</span> subscription 
                  for <span className="text-white">{email}</span> is now active!
                </p>
                <p className="text-yellow-400 text-sm mb-4">
                  Your temporary password: <code className="bg-gray-800 px-2 py-1 rounded">{tempPassword}</code>
                </p>
                <button
                  onClick={onClickCopyPassword}
                  className="btn-primary w-full mb-3"
                >
                  {passwordCopied ? 'Copied!' : 'Copy Password'}
                </button>
                {passwordCopied && (
                  <p className="text-sm text-gray-400">
                    Sign in and change your password for security.
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-300 mb-6">
                Your <span className="text-purple-400 font-semibold">{formatTierName()}</span> subscription is now active!
              </p>
            )}

            <Link href="/learn" className="btn-primary inline-block">
              Start Creating
            </Link>
          </>
        )}

        {!loading && !verified && (
          <div className="space-y-6">
            <div className="text-6xl">😕</div>
            <h1 className="text-2xl font-bold">Something went wrong</h1>
            <p className="text-gray-400">
              We couldn&apos;t verify your payment. Please contact us at{' '}
              <a href="mailto:hi@fullstackcraft.com" className="text-purple-400 hover:underline">
                hi@fullstackcraft.com
              </a>
            </p>
            <Link href="/pricing" className="btn-secondary inline-block">
              Back to Pricing
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
