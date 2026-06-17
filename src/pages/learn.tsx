import Head from 'next/head'
import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import { useUserTier } from '@/hooks/useUserTier'
import { useAppSelector } from '@/hooks/useAppSelector'
import { useAppDispatch } from '@/hooks/useAppDispatch'
import {
  setLearnerProfile,
  ExperienceLevel,
  LearningStyle
} from '@/store/genieSlice'
import { useGenieStream } from '@/hooks/useGenieStream'
import GenieResult from '@/components/GenieResult'
import GenieHelperPanel from '@/components/GenieHelperPanel'
import Link from 'next/link'

const FREE_MONTHLY_LIMIT = 3

export default function Learn() {
  const { isSignedIn } = useAuth()
  const { tier, isPro, isLoading: tierLoading } = useUserTier()
  const { learnerProfile, generationCount, isGenerating } = useAppSelector(state => state.genie)
  const dispatch = useAppDispatch()
  const { generate, connected, error } = useGenieStream()

  const [prompt, setPrompt] = useState('')
  const [showOnboarding, setShowOnboarding] = useState(true)

  const remainingGenerations = FREE_MONTHLY_LIMIT - generationCount
  const canGenerate = isPro || remainingGenerations > 0

  const handleGenerate = () => {
    if (!canGenerate) return
    generate(prompt)
  }

  const examplePrompts = [
    "How do I use async/await in Python?",
    "Explain React hooks with examples",
    "Build a REST API with Express.js",
    "Introduction to Rust ownership",
    "CSS Grid layout tutorial",
  ]

  return (
    <>
      <Head>
        <title>Learn - CodeVideo Genie</title>
        <meta name="description" content="Generate personalized programming tutorials with AI" />
      </Head>

      <div className="min-h-screen pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4">
          
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              What do you want to <span className="genie-text">learn</span>?
            </h1>
            <p className="text-gray-400 text-lg">
              Describe any programming concept and get a personalized tutorial
            </p>
          </div>

          {/* Onboarding (collapsible) */}
          {showOnboarding && (
            <div className="mb-8 p-6 rounded-xl bg-gray-900/50 border border-gray-700">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-lg font-semibold">Personalize your experience</h2>
                <button 
                  onClick={() => setShowOnboarding(false)}
                  className="text-gray-500 hover:text-white"
                >
                  ✕
                </button>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Experience Level */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Experience Level</label>
                  <div className="flex gap-2">
                    {(['beginner', 'intermediate', 'advanced'] as ExperienceLevel[]).map(level => (
                      <button
                        key={level}
                        onClick={() => dispatch(setLearnerProfile({ experienceLevel: level }))}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          learnerProfile.experienceLevel === level
                            ? 'bg-purple-500 text-white'
                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                        }`}
                      >
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Learning Style */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Learning Style</label>
                  <div className="flex gap-2">
                    {([
                      { value: 'detailed', label: 'Detailed' },
                      { value: 'concise', label: 'Concise' },
                      { value: 'project-based', label: 'Project' },
                    ] as { value: LearningStyle; label: string }[]).map(({ value, label }) => (
                      <button
                        key={value}
                        onClick={() => dispatch(setLearnerProfile({ learningStyle: value }))}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          learnerProfile.learningStyle === value
                            ? 'bg-purple-500 text-white'
                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main Input */}
          <div className="relative mb-6">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., How do I handle errors in Rust?"
              className="textarea-genie min-h-[120px] text-lg pr-24"
              disabled={isGenerating}
            />
            <button
              onClick={handleGenerate}
              disabled={!prompt.trim() || !canGenerate || isGenerating || !connected}
              className={`absolute bottom-4 right-4 px-6 py-2 rounded-lg font-semibold transition-all ${
                !prompt.trim() || !canGenerate || isGenerating || !connected
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'btn-primary'
              }`}
            >
              {isGenerating ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">✨</span>
                  Generating...
                </span>
              ) : (
                'Generate ✨'
              )}
            </button>
          </div>

          {/* Usage info */}
          <div className="flex items-center justify-between text-sm mb-8">
            <div className="text-gray-500">
              {isPro ? (
                <span className="text-purple-400">✨ Pro: Unlimited generations</span>
              ) : (
                <span>
                  {remainingGenerations} of {FREE_MONTHLY_LIMIT} free generations remaining
                </span>
              )}
            </div>
            {!isPro && (
              <Link href="/pricing" className="text-purple-400 hover:underline">
                Upgrade to Pro →
              </Link>
            )}
          </div>

          {!connected && (
            <p className="text-sm text-yellow-500 mb-4">Connecting to the generator…</p>
          )}
          {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

          {/* live streaming IDE */}
          <div className="mb-8">
            <GenieResult />
          </div>

          {/* BYOK AI editing helper */}
          <div className="mb-8">
            <GenieHelperPanel />
          </div>

          {/* Example prompts */}
          <div>
            <h3 className="text-sm text-gray-500 mb-3">Try an example:</h3>
            <div className="flex flex-wrap gap-2">
              {examplePrompts.map((example, i) => (
                <button
                  key={i}
                  onClick={() => setPrompt(example)}
                  className="px-4 py-2 rounded-full text-sm bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          {/* Not signed in prompt */}
          {!isSignedIn && (
            <div className="mt-12 p-6 rounded-xl bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/30 text-center">
              <p className="text-gray-300 mb-4">
                Sign in to save your tutorials and track your learning progress
              </p>
              <Link href="/sign-in" className="btn-primary inline-block">
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
