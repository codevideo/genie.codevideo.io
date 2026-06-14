import Head from 'next/head'
import { useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { useSelector } from 'react-redux'
import { useUserTier } from '@/hooks/useUserTier'
import { useGenieStream } from '@/hooks/useGenieStream'
import GenieResult from '@/components/GenieResult'
import type { RootState } from '@/store'
import Link from 'next/link'

type CreatorMode = 'ai-generate' | 'from-scratch' | 'import'
type ProjectType = 'tutorial' | 'lesson' | 'course'

export default function Create() {
  const { isSignedIn } = useAuth()
  const { isPro } = useUserTier()
  
  const [mode, setMode] = useState<CreatorMode | null>(null)
  const [projectType, setProjectType] = useState<ProjectType>('tutorial')
  const [prompt, setPrompt] = useState('')

  const { generate, connected, error } = useGenieStream()
  const isGenerating = useSelector((s: RootState) => s.genie.isGenerating)

  const handleGenerate = () => generate(prompt)

  if (!mode) {
    return (
      <>
        <Head>
          <title>Create - CodeVideo Genie</title>
        </Head>

        <div className="min-h-screen pt-24 pb-16">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                How do you want to <span className="genie-text">create</span>?
              </h1>
              <p className="text-gray-400 text-lg">
                Choose your starting point
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* AI Generate */}
              <button
                onClick={() => setMode('ai-generate')}
                className="group p-6 rounded-xl bg-gray-900/50 border border-gray-700 hover:border-purple-500/50 transition-all text-left card-hover"
              >
                <div className="text-4xl mb-4">✨</div>
                <h3 className="text-xl font-semibold mb-2">AI Generate</h3>
                <p className="text-gray-400 text-sm">
                  Describe what you want to teach and let AI create the structure
                </p>
              </button>

              {/* From Scratch */}
              <button
                onClick={() => window.open('https://studio.codevideo.io', '_blank')}
                className="group p-6 rounded-xl bg-gray-900/50 border border-gray-700 hover:border-pink-500/50 transition-all text-left card-hover"
              >
                <div className="text-4xl mb-4">📝</div>
                <h3 className="text-xl font-semibold mb-2">From Scratch</h3>
                <p className="text-gray-400 text-sm">
                  Build step-by-step in CodeVideo Studio with full control
                </p>
                <span className="text-xs text-gray-500 mt-2 block">Opens Studio →</span>
              </button>

              {/* Import */}
              <button
                onClick={() => setMode('import')}
                className="group p-6 rounded-xl bg-gray-900/50 border border-gray-700 hover:border-cyan-500/50 transition-all text-left card-hover"
              >
                <div className="text-4xl mb-4">📂</div>
                <h3 className="text-xl font-semibold mb-2">Import</h3>
                <p className="text-gray-400 text-sm">
                  Import existing CodeVideo JSON or convert from other formats
                </p>
              </button>
            </div>
          </div>
        </div>
      </>
    )
  }

  if (mode === 'import') {
    return (
      <>
        <Head>
          <title>Import - CodeVideo Genie</title>
        </Head>

        <div className="min-h-screen pt-24 pb-16">
          <div className="max-w-2xl mx-auto px-4">
            <button 
              onClick={() => setMode(null)}
              className="text-gray-400 hover:text-white mb-6 flex items-center gap-2"
            >
              ← Back
            </button>

            <h1 className="text-3xl font-bold mb-8">Import Project</h1>

            <div className="space-y-4">
              <div className="p-6 rounded-xl bg-gray-900/50 border border-gray-700">
                <h3 className="font-semibold mb-2">Paste JSON</h3>
                <textarea
                  placeholder="Paste your CodeVideo actions JSON here..."
                  className="textarea-genie min-h-[200px] font-mono text-sm"
                />
                <button className="btn-primary mt-4">
                  Import & Preview
                </button>
              </div>

              <div className="text-center text-gray-500">or</div>

              <div className="p-6 rounded-xl bg-gray-900/50 border border-gray-700 border-dashed text-center">
                <p className="text-gray-400 mb-2">Drag & drop a .json file here</p>
                <p className="text-sm text-gray-500">or click to browse</p>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  // AI Generate mode
  return (
    <>
      <Head>
        <title>Create with AI - CodeVideo Genie</title>
      </Head>

      <div className="min-h-screen pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-4">
          <button 
            onClick={() => setMode(null)}
            className="text-gray-400 hover:text-white mb-6 flex items-center gap-2"
          >
            ← Back
          </button>

          <h1 className="text-3xl font-bold mb-8">
            Create with <span className="genie-text">AI</span>
          </h1>

          {/* Project Type */}
          <div className="mb-6">
            <label className="block text-sm text-gray-400 mb-2">Project Type</label>
            <div className="flex gap-3">
              {([
                { value: 'tutorial', label: 'Quick Tutorial', desc: '< 10 min' },
                { value: 'lesson', label: 'Lesson', desc: '10-30 min' },
                { value: 'course', label: 'Full Course', desc: 'Multiple lessons' },
              ] as const).map(({ value, label, desc }) => (
                <button
                  key={value}
                  onClick={() => setProjectType(value)}
                  className={`flex-1 p-4 rounded-xl border transition-all ${
                    projectType === value
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-gray-700 bg-gray-900/50 hover:border-gray-600'
                  }`}
                >
                  <div className="font-semibold">{label}</div>
                  <div className="text-sm text-gray-500">{desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Audience */}
          <div className="mb-6">
            <label className="block text-sm text-gray-400 mb-2">Target Audience</label>
            <div className="flex gap-2">
              {['Beginner', 'Intermediate', 'Advanced'].map(level => (
                <button
                  key={level}
                  className="px-4 py-2 rounded-lg text-sm bg-gray-800 text-gray-400 hover:bg-gray-700"
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Main prompt */}
          <div className="mb-6">
            <label className="block text-sm text-gray-400 mb-2">
              What do you want to teach?
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., Build a REST API with FastAPI, including project setup with Poetry, SQLAlchemy models, CRUD endpoints, and JWT authentication"
              className="textarea-genie min-h-[150px]"
            />
          </div>

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating || !connected}
            className={`w-full py-4 rounded-xl font-semibold text-lg transition-all ${
              !prompt.trim() || isGenerating || !connected
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'btn-primary'
            }`}
          >
            {isGenerating ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">✨</span>
                Generating your {projectType}...
              </span>
            ) : (
              `Generate ${projectType.charAt(0).toUpperCase() + projectType.slice(1)} ✨`
            )}
          </button>

          <p className="text-center text-sm text-gray-500 mt-4">
            Generation typically takes 30-60 seconds depending on complexity
          </p>

          {!connected && (
            <p className="text-center text-sm text-yellow-500 mt-2">
              Connecting to the generator…
            </p>
          )}
          {error && <p className="text-center text-sm text-red-500 mt-2">{error}</p>}

          {/* live streaming IDE */}
          <div className="mt-8">
            <GenieResult />
          </div>
        </div>
      </div>
    </>
  )
}
