import type { Provider } from './types'

// BYOK = bring your own key. The key lives ONLY in the browser's localStorage
// and is sent as a request header to the user's chosen provider via our thin
// transport. We never persist it server-side.
const KEY_PREFIX = 'codevideo-genie:byok'

const keyFor = (p: Provider) => `${KEY_PREFIX}:${p}`
const modelKeyFor = (p: Provider) => `${KEY_PREFIX}:${p}:model`

export const byokStorage = {
  getKey(provider: Provider): string | null {
    if (typeof window === 'undefined') return null
    return window.localStorage.getItem(keyFor(provider))
  },
  setKey(provider: Provider, value: string) {
    window.localStorage.setItem(keyFor(provider), value)
  },
  clearKey(provider: Provider) {
    window.localStorage.removeItem(keyFor(provider))
  },
  getModel(provider: Provider): string | null {
    if (typeof window === 'undefined') return null
    return window.localStorage.getItem(modelKeyFor(provider))
  },
  setModel(provider: Provider, model: string) {
    window.localStorage.setItem(modelKeyFor(provider), model)
  },
  clearAll() {
    ;(['anthropic', 'openai', 'google'] as Provider[]).forEach((p) => {
      window.localStorage.removeItem(keyFor(p))
      window.localStorage.removeItem(modelKeyFor(p))
    })
  },
}

export const DEFAULT_MODELS: Record<Provider, string> = {
  anthropic: 'claude-sonnet-4-6',
  openai: 'gpt-5.2',
  google: 'gemini-2.5-pro',
}

export const MODEL_CHOICES: Record<Provider, { value: string; label: string }[]> = {
  anthropic: [
    { value: 'claude-opus-4-6', label: 'Claude Opus 4.6 (most capable)' },
    { value: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6 (default, fast)' },
    { value: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5 (cheapest)' },
  ],
  openai: [
    { value: 'gpt-5.2', label: 'GPT-5.2 (default)' },
    { value: 'gpt-5', label: 'GPT-5' },
    { value: 'gpt-4.1', label: 'GPT-4.1' },
  ],
  google: [
    { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro (default)' },
    { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (fast, cheap)' },
  ],
}
