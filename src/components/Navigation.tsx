import Link from 'next/link'
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { useUserTier } from '@/hooks/useUserTier'

export default function Navigation() {
  const { tier, isPro } = useUserTier()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-lg border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-2xl">✨</span>
            <span className="text-xl font-bold">
              <span className="genie-text">CodeVideo</span>
              <span className="text-gray-400 ml-1">Genie</span>
            </span>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link 
              href="/pricing" 
              className="text-gray-400 hover:text-white transition-colors"
            >
              Pricing
            </Link>
            <Link 
              href="https://studio.codevideo.io" 
              target="_blank"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Studio
            </Link>
            <Link 
              href="https://codevideo.io" 
              target="_blank"
              className="text-gray-400 hover:text-white transition-colors"
            >
              About
            </Link>
          </div>

          {/* Auth */}
          <div className="flex items-center gap-4">
            <SignedOut>
              <Link href="/sign-in" className="text-gray-400 hover:text-white transition-colors">
                Sign In
              </Link>
              <Link href="/sign-up" className="btn-primary text-sm">
                Get Started
              </Link>
            </SignedOut>
            <SignedIn>
              {isPro && (
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-purple-500 to-pink-500">
                  PRO
                </span>
              )}
              <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">
                Dashboard
              </Link>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </div>
      </div>
    </nav>
  )
}
