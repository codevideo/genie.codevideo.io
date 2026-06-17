import { useState } from 'react'
import { byokStorage, DEFAULT_MODELS, MODEL_CHOICES } from '@/lib/ai-tools/byokStorage'
import type { Provider } from '@/lib/ai-tools/types'

type BYOKSettingsProps = {
  provider: Provider
  onProviderChange: (p: Provider) => void
  model: string
  onModelChange: (m: string) => void
  apiKeyPresent: boolean
  onApiKeyChange: () => void
}

const providerLabel = (p: Provider) =>
  p === 'anthropic' ? 'Anthropic' : p === 'google' ? 'Google' : 'OpenAI'

/**
 * Provider/model picker + API-key input for the BYOK AI helper. The key is
 * written to localStorage only (byokStorage) and never sent anywhere except as
 * a request header to the user's chosen provider.
 */
export function BYOKSettings({
  provider,
  onProviderChange,
  model,
  onModelChange,
  apiKeyPresent,
  onApiKeyChange,
}: BYOKSettingsProps) {
  const [keyInput, setKeyInput] = useState('')
  // when no key is stored, force the editor open; otherwise the user toggles it
  const [userEditing, setUserEditing] = useState(false)
  const editing = !apiKeyPresent || userEditing

  const handleSave = () => {
    if (!keyInput.trim()) return
    byokStorage.setKey(provider, keyInput.trim())
    setKeyInput('')
    setUserEditing(false)
    onApiKeyChange()
  }

  const handleClear = () => {
    byokStorage.clearKey(provider)
    setKeyInput('')
    setUserEditing(true)
    onApiKeyChange()
  }

  return (
    <div className="rounded-lg border border-gray-700 bg-gray-900/60 p-3">
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="block text-xs font-medium text-gray-300">
          Provider
          <select
            value={provider}
            onChange={(e) => onProviderChange(e.target.value as Provider)}
            className="mt-1 w-full rounded-md border border-gray-700 bg-gray-800 px-2 py-1 text-xs text-gray-200"
          >
            <option value="anthropic">Anthropic (Claude)</option>
            <option value="openai">OpenAI (GPT)</option>
            <option value="google">Google (Gemini)</option>
          </select>
        </label>
        <label className="block text-xs font-medium text-gray-300">
          Model
          <select
            value={model}
            onChange={(e) => onModelChange(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-700 bg-gray-800 px-2 py-1 text-xs text-gray-200"
          >
            {MODEL_CHOICES[provider].map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-2">
        {editing ? (
          <div className="flex gap-2">
            <input
              type="password"
              autoComplete="off"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder={`${provider === 'anthropic' ? 'sk-ant-…' : 'sk-…'} (kept in your browser)`}
              className="flex-1 rounded-md border border-gray-700 bg-gray-800 px-2 py-1 text-xs text-gray-200"
            />
            <button
              type="button"
              onClick={handleSave}
              disabled={!keyInput.trim()}
              className="rounded-md bg-purple-600 px-3 py-1 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Save key
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2 text-xs text-gray-400">
            <span>
              ✅ {providerLabel(provider)} key saved (model:{' '}
              <code className="rounded bg-gray-800 px-1 text-gray-300">
                {model || DEFAULT_MODELS[provider]}
              </code>
              )
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setUserEditing(true)}
                className="rounded-md border border-gray-600 px-2 py-1 text-xs text-gray-300 hover:bg-gray-800"
              >
                Replace
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="rounded-md border border-red-500/50 px-2 py-1 text-xs text-red-400 hover:bg-red-500/10"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      <p className="mt-2 text-[11px] text-gray-500">
        Your key never leaves your browser except as a direct request to {providerLabel(provider)}.
        You pay your provider directly for AI edits.
      </p>
    </div>
  )
}
