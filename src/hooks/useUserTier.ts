import { useAuth, useUser } from '@clerk/nextjs'
import { useState, useEffect } from 'react'

export type UserTier = 'free' | 'pro' | 'pro-lifetime'

export interface UseUserTierResult {
  tier: UserTier
  isLoading: boolean
  isPro: boolean
}

export const useUserTier = (): UseUserTierResult => {
  const { isSignedIn, isLoaded: authLoaded } = useAuth()
  const { user, isLoaded: userLoaded } = useUser()
  const [userTier, setUserTier] = useState<UserTier>('free')
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    if (!authLoaded || !userLoaded) {
      setIsLoading(true)
      return
    }

    if (!isSignedIn || !user) {
      setUserTier('free')
      setIsLoading(false)
      return
    }

    const tier = user.publicMetadata?.tier as UserTier
    
    if (tier && ['pro', 'pro-lifetime'].includes(tier)) {
      setUserTier(tier)
    } else {
      setUserTier('free')
    }
    
    setIsLoading(false)
  }, [authLoaded, userLoaded, isSignedIn, user])

  const isPro = ['pro', 'pro-lifetime'].includes(userTier)

  return { tier: userTier, isLoading, isPro }
}

export const useHasProAccess = (): boolean => {
  const { tier } = useUserTier()
  return ['pro', 'pro-lifetime'].includes(tier)
}
