import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'
import { useUserTier } from '@/hooks/useUserTier'

// Stripe payment links - replace with your actual links
const PRO_MONTHLY_STRIPE_LINK = process.env.NODE_ENV === 'development' 
  ? 'https://buy.stripe.com/test_pro_monthly' 
  : 'https://buy.stripe.com/pro_monthly'
const PRO_LIFETIME_STRIPE_LINK = process.env.NODE_ENV === 'development' 
  ? 'https://buy.stripe.com/test_pro_lifetime' 
  : 'https://buy.stripe.com/pro_lifetime'

export default function Pricing() {
  const [isLifetime, setIsLifetime] = useState(false)
  const { tier, isPro, isLoading } = useUserTier()

  return (
    <>
      <Head>
        <title>Pricing - CodeVideo Genie</title>
        <meta name="description" content="Simple, transparent pricing for CodeVideo Genie. Start free, upgrade when ready." />
      </Head>

      <div className="min-h-screen pt-24 pb-16">
        {/* Header */}
        <section className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Simple, <span className="genie-text">transparent</span> pricing
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Start free with 3 generations per month. Upgrade to Pro for unlimited access.
          </p>
        </section>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <span className={`text-lg font-medium ${!isLifetime ? 'text-white' : 'text-gray-500'}`}>
            Monthly
          </span>
          <button
            onClick={() => setIsLifetime(!isLifetime)}
            aria-label={`Switch to ${isLifetime ? 'monthly' : 'lifetime'} billing`}
            className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-black ${
              isLifetime ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                isLifetime ? 'translate-x-8' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={`text-lg font-medium ${isLifetime ? 'text-white' : 'text-gray-500'}`}>
            Lifetime
          </span>
          {isLifetime && (
            <span className="px-3 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-purple-500 to-pink-500">
              Save 80%+
            </span>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Free Tier */}
            <div className="relative p-8 rounded-2xl bg-gray-900/50 border border-gray-700">
              <h2 className="text-2xl font-bold mb-2">Free</h2>
              <div className="text-4xl font-bold mb-6">
                $0
                <span className="text-lg text-gray-500 font-normal">/month</span>
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <span className="text-purple-400 mt-1">✓</span>
                  <span className="text-gray-300">3 tutorial generations per month</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-400 mt-1">✓</span>
                  <span className="text-gray-300">Interactive step-through player</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-400 mt-1">✓</span>
                  <span className="text-gray-300">Basic export formats (Markdown)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-gray-600 mt-1">✗</span>
                  <span className="text-gray-500">Video export</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-gray-600 mt-1">✗</span>
                  <span className="text-gray-500">PDF export</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-gray-600 mt-1">✗</span>
                  <span className="text-gray-500">Premium TTS voices</span>
                </li>
              </ul>

              {isPro ? (
                <button 
                  disabled 
                  className="w-full py-3 rounded-lg font-semibold bg-gray-700 text-gray-400 cursor-not-allowed"
                >
                  You have Pro
                </button>
              ) : (
                <Link 
                  href="/learn" 
                  className="block w-full py-3 rounded-lg font-semibold text-center bg-gray-700 hover:bg-gray-600 transition-colors"
                >
                  Get Started Free
                </Link>
              )}
            </div>

            {/* Pro Tier */}
            <div className="relative p-8 rounded-2xl bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-2 border-purple-500/50">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="px-4 py-1 text-sm font-bold rounded-full bg-gradient-to-r from-purple-500 to-pink-500">
                  Most Popular
                </span>
              </div>

              <h2 className="text-2xl font-bold mb-2">Pro</h2>
              <div className="text-4xl font-bold mb-6">
                {isLifetime ? (
                  <>
                    $99
                    <span className="text-lg text-gray-500 font-normal"> one-time</span>
                  </>
                ) : (
                  <>
                    $19
                    <span className="text-lg text-gray-500 font-normal">/month</span>
                  </>
                )}
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <span className="text-purple-400 mt-1">✓</span>
                  <span className="text-gray-300"><strong>Unlimited</strong> tutorial generations</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-400 mt-1">✓</span>
                  <span className="text-gray-300">Interactive step-through player</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-400 mt-1">✓</span>
                  <span className="text-gray-300">All export formats (Markdown, HTML, PDF)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-400 mt-1">✓</span>
                  <span className="text-gray-300"><strong>Video export</strong> with TTS narration</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-400 mt-1">✓</span>
                  <span className="text-gray-300">Premium TTS voices</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-400 mt-1">✓</span>
                  <span className="text-gray-300">Priority generation queue</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-400 mt-1">✓</span>
                  <span className="text-gray-300">Edit in CodeVideo Studio</span>
                </li>
              </ul>

              {isPro ? (
                <button 
                  disabled 
                  className="w-full py-3 rounded-lg font-semibold bg-gray-700 text-gray-400 cursor-not-allowed"
                >
                  You have Pro
                </button>
              ) : (
                <Link 
                  href={isLifetime ? PRO_LIFETIME_STRIPE_LINK : PRO_MONTHLY_STRIPE_LINK}
                  className="block w-full py-3 rounded-lg font-semibold text-center btn-primary"
                >
                  {isLifetime ? 'Get Pro Lifetime' : 'Get Pro'}
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* FAQ */}
        <section className="max-w-4xl mx-auto px-4 mt-24">
          <h2 className="text-3xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-6">
            <div className="p-6 rounded-xl bg-gray-900/50 border border-gray-700">
              <h3 className="text-lg font-semibold mb-2">What counts as a "generation"?</h3>
              <p className="text-gray-400">
                Each time you ask Genie to create a tutorial from a prompt, that&apos;s one generation. 
                Regenerating or editing an existing tutorial doesn&apos;t count as a new generation.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-gray-900/50 border border-gray-700">
              <h3 className="text-lg font-semibold mb-2">Can I cancel anytime?</h3>
              <p className="text-gray-400">
                Yes! Monthly subscriptions can be cancelled at any time. You&apos;ll keep access until the end of your billing period.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-gray-900/50 border border-gray-700">
              <h3 className="text-lg font-semibold mb-2">What&apos;s included in the lifetime plan?</h3>
              <p className="text-gray-400">
                Everything in Pro, forever. One payment, lifetime access. This includes all future features we add to Pro.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-gray-900/50 border border-gray-700">
              <h3 className="text-lg font-semibold mb-2">Is the code open source?</h3>
              <p className="text-gray-400">
                Yes! CodeVideo is fully open source. You can self-host if you prefer, or use our hosted version 
                for convenience. Check out our <a href="https://github.com/codevideo" target="_blank" rel="noreferrer" className="text-purple-400 hover:underline">GitHub</a>.
              </p>
            </div>
          </div>
        </section>

        {/* Contact */}
        <div className="text-center mt-16">
          <p className="text-gray-400">
            Questions? <a href="mailto:hi@fullstackcraft.com" className="text-purple-400 hover:underline">Contact us</a>
          </p>
        </div>
      </div>
    </>
  )
}
