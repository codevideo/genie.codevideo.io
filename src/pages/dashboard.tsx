import Head from 'next/head'
import Link from 'next/link'
import { useAuth } from '@clerk/nextjs'
import { useUserTier } from '@/hooks/useUserTier'
import { useAppSelector } from '@/hooks/useAppSelector'

const FREE_MONTHLY_LIMIT = 3

export default function Dashboard() {
  const { isSignedIn, isLoaded } = useAuth()
  const { tier, isPro, isLoading: tierLoading } = useUserTier()
  const { generationCount } = useAppSelector(state => state.genie)

  const remainingGenerations = FREE_MONTHLY_LIMIT - generationCount

  if (!isLoaded || tierLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-400">Loading...</div>
      </div>
    )
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Sign in to view your dashboard</h1>
          <Link href="/sign-in" className="btn-primary">
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Dashboard - CodeVideo Genie</title>
      </Head>

      <div className="min-h-screen pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-gray-400 mt-1">
                {isPro ? (
                  <span className="text-purple-400">✨ Pro account</span>
                ) : (
                  <span>Free account · {remainingGenerations} generations left this month</span>
                )}
              </p>
            </div>
            
            {!isPro && (
              <Link href="/pricing" className="btn-primary">
                Upgrade to Pro
              </Link>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <Link
              href="/learn"
              className="group p-6 rounded-xl bg-gradient-to-br from-purple-900/30 to-purple-800/20 border border-purple-500/30 hover:border-purple-500/50 transition-all card-hover"
            >
              <div className="text-4xl mb-4">🎓</div>
              <h2 className="text-xl font-semibold mb-2">Learn Something New</h2>
              <p className="text-gray-400">
                Generate a personalized tutorial on any programming topic
              </p>
              <span className="text-purple-400 mt-4 inline-block group-hover:translate-x-1 transition-transform">
                Start learning →
              </span>
            </Link>

            <Link
              href="/create"
              className="group p-6 rounded-xl bg-gradient-to-br from-pink-900/30 to-pink-800/20 border border-pink-500/30 hover:border-pink-500/50 transition-all card-hover"
            >
              <div className="text-4xl mb-4">🛠️</div>
              <h2 className="text-xl font-semibold mb-2">Create Content</h2>
              <p className="text-gray-400">
                Build courses, tutorials, and educational content
              </p>
              <span className="text-pink-400 mt-4 inline-block group-hover:translate-x-1 transition-transform">
                Start creating →
              </span>
            </Link>
          </div>

          <div className="rounded-xl bg-gray-900/50 border border-gray-700 p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Tutorials</h2>
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-4">📚</div>
              <p>No tutorials yet</p>
              <p className="text-sm mt-2">Your generated tutorials will appear here</p>
              <Link href="/learn" className="btn-secondary inline-block mt-4">
                Generate your first tutorial
              </Link>
            </div>
          </div>

          {!isPro && (
            <div className="mt-8 p-6 rounded-xl bg-gray-900/50 border border-gray-700">
              <h3 className="font-semibold mb-4">Usage This Month</h3>
              <div className="flex items-center gap-4">
                <div className="flex-grow bg-gray-800 rounded-full h-4 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                    style={{ width: `${(generationCount / FREE_MONTHLY_LIMIT) * 100}%` }}
                  />
                </div>
                <span className="text-gray-400 whitespace-nowrap">
                  {generationCount} / {FREE_MONTHLY_LIMIT}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Free accounts get {FREE_MONTHLY_LIMIT} generations per month.{' '}
                <Link href="/pricing" className="text-purple-400 hover:underline">
                  Upgrade for unlimited
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
