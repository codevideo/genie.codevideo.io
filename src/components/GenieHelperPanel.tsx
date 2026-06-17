import { useEffect, useMemo, useRef, useState } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport, lastAssistantMessageIsCompleteWithToolCalls } from 'ai'
import { useSelector, useDispatch } from 'react-redux'
import { byokStorage, DEFAULT_MODELS } from '@/lib/ai-tools/byokStorage'
import { toolRegistry, type ToolName } from '@/lib/ai-tools/tools'
import type { Provider } from '@/lib/ai-tools/types'
import { store, type RootState, type AppDispatch } from '@/store'
import { setIsGenerating } from '@/store/genieSlice'
import { BYOKSettings } from './BYOKSettings'

const TOOL_EXECUTION_DELAY_MS = 80

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

/**
 * BYOK AI editing helper (chatvideolab-style, client-side tools). The model
 * runs on the user's own key; every tool executes IN THE BROWSER against the
 * Redux store via onToolCall, so edits land in the same actions array the IDE
 * renders. The key is sent only as a request header to the chosen provider.
 */
export default function GenieHelperPanel() {
  const actionCount = useSelector((s: RootState) => s.genie.generatedActions.length)
  const dispatch = useDispatch<AppDispatch>()

  const [provider, setProviderState] = useState<Provider>('anthropic')
  const [model, setModel] = useState<string>(
    () => byokStorage.getModel('anthropic') ?? DEFAULT_MODELS.anthropic
  )
  const [apiKey, setApiKey] = useState<string | null>(() => byokStorage.getKey('anthropic'))
  const [input, setInput] = useState('')
  const lastAutoSubmittedAssistantMessageIdRef = useRef<string | null>(null)
  const streamingStopRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const setProvider = (p: Provider) => {
    setProviderState(p)
    setApiKey(byokStorage.getKey(p))
    setModel(byokStorage.getModel(p) ?? DEFAULT_MODELS[p])
  }
  const refreshKey = () => setApiKey(byokStorage.getKey(provider))
  const handleModelChange = (m: string) => {
    setModel(m)
    byokStorage.setModel(provider, m)
  }

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: '/.netlify/functions/ai-helper',
        headers: () => ({
          'x-byok-provider': provider,
          'x-byok-key': apiKey ?? '',
          'x-byok-model': model,
        }),
        // grounds the model in the current actions at the start of each turn
        body: () => ({
          currentActionsSnapshot: store
            .getState()
            .genie.generatedActions.map((a, index) => ({ index, name: a.name, value: a.value })),
        }),
      }),
    [provider, apiKey, model]
  )

  // tool calls run in strict order with a small delay so the IDE updates aren't
  // too abrupt; each one's debounce is handled by the rewind-to-0 reducers
  const toolExecutionQueueRef = useRef<Promise<void>>(Promise.resolve())
  const lastToolExecutionAtRef = useRef<number>(0)

  const shouldAutoSubmitAfterToolCalls = useMemo(
    () => (args: Parameters<typeof lastAssistantMessageIsCompleteWithToolCalls>[0]) => {
      if (!lastAssistantMessageIsCompleteWithToolCalls(args)) return false
      const lastAssistant = [...args.messages].reverse().find((m) => m.role === 'assistant')
      if (!lastAssistant) return false
      // guard against re-submit loops on an unchanged completed assistant message
      if (lastAutoSubmittedAssistantMessageIdRef.current === lastAssistant.id) return false
      lastAutoSubmittedAssistantMessageIdRef.current = lastAssistant.id
      return true
    },
    []
  )

  const { messages, sendMessage, setMessages, status, addToolOutput, error } = useChat({
    transport,
    // v6 equivalent of maxSteps: re-send once all tool calls on the last
    // assistant message have outputs, so the model can continue the loop
    sendAutomaticallyWhen: shouldAutoSubmitAfterToolCalls,
    onToolCall({ toolCall }) {
      toolExecutionQueueRef.current = toolExecutionQueueRef.current
        .catch((err) => console.error('Recovered from previous tool queue error', err))
        .then(async () => {
          const elapsed = Date.now() - lastToolExecutionAtRef.current
          if (lastToolExecutionAtRef.current > 0 && elapsed < TOOL_EXECUTION_DELAY_MS) {
            await sleep(TOOL_EXECUTION_DELAY_MS - elapsed)
          }

          const submit = (
            payload:
              | { output: unknown; state?: 'output-available'; errorText?: never }
              | { state: 'output-error'; errorText: string; output?: never }
          ) => {
            void Promise.resolve(
              addToolOutput({
                tool: toolCall.toolName as never,
                toolCallId: toolCall.toolCallId,
                ...payload,
              } as never)
            ).catch((err) => console.error('Failed to add tool output', err))
          }

          try {
            const def = toolRegistry[toolCall.toolName as ToolName]
            if (!def) {
              submit({ state: 'output-error', errorText: `Unknown tool: ${toolCall.toolName}` })
              return
            }
            const parsed = def.schema.safeParse(toolCall.input)
            if (!parsed.success) {
              submit({ state: 'output-error', errorText: `Invalid args: ${parsed.error.message}` })
              return
            }
            submit({ output: def.execute(parsed.data as never) })
          } catch (err) {
            submit({
              state: 'output-error',
              errorText: err instanceof Error ? err.message : 'Unexpected tool execution error',
            })
          } finally {
            lastToolExecutionAtRef.current = Date.now()
          }
        })
    },
  })

  const isLoading = status === 'submitted' || status === 'streaming'

  // Mirror the chat turn onto the IDE's streaming flag so built/edited actions
  // play forward, buffer when the model lags, and complete once. Debounced to
  // bridge the brief idle between tool-loop steps (sendAutomaticallyWhen
  // re-submits), so the IDE doesn't flash "complete" mid-build.
  useEffect(() => {
    if (isLoading) {
      if (streamingStopRef.current) {
        clearTimeout(streamingStopRef.current)
        streamingStopRef.current = null
      }
      dispatch(setIsGenerating(true))
    } else {
      if (streamingStopRef.current) clearTimeout(streamingStopRef.current)
      streamingStopRef.current = setTimeout(() => dispatch(setIsGenerating(false)), 800)
    }
  }, [isLoading, dispatch])
  useEffect(
    () => () => {
      if (streamingStopRef.current) clearTimeout(streamingStopRef.current)
    },
    []
  )

  const submitPrompt = () => {
    if (!input.trim() || !apiKey || isLoading) return
    lastAutoSubmittedAssistantMessageIdRef.current = null
    void sendMessage({ text: input })
    setInput('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    submitPrompt()
  }

  const toolCallCount = messages.reduce(
    (acc, m) => acc + m.parts.filter((p) => p.type.startsWith('tool-')).length,
    0
  )

  return (
    <div className="rounded-xl border border-gray-700 bg-gray-900/50 p-5">
      <div className="mb-3">
        <h3 className="text-lg font-semibold">
          Refine with <span className="genie-text">AI</span>
        </h3>
        <p className="text-xs text-gray-400">
          {actionCount === 0
            ? 'Bring your own Anthropic, OpenAI, or Google key and describe a lesson to build — or generate one above first, then refine it here.'
            : 'Bring your own Anthropic, OpenAI, or Google key and ask for changes — rename a file, add a closing summary, make a pause shorter. Edits apply live above.'}
        </p>
      </div>

      <BYOKSettings
        provider={provider}
        onProviderChange={setProvider}
        model={model}
        onModelChange={handleModelChange}
        apiKeyPresent={Boolean(apiKey)}
        onApiKeyChange={refreshKey}
      />

      {!apiKey ? (
        <p className="mt-3 text-xs text-gray-500">
          Add a {provider === 'anthropic' ? 'Anthropic' : provider === 'google' ? 'Google' : 'OpenAI'} key
          above to start building with AI.
        </p>
      ) : (
        <>
          <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                  e.preventDefault()
                  submitPrompt()
                }
              }}
              rows={2}
              placeholder={
                actionCount === 0
                  ? 'e.g. "build a short lesson on Python list comprehensions"'
                  : 'e.g. "rename hello.ts to main.ts and add an intro narration"'
              }
              disabled={isLoading}
              className="textarea-genie flex-1 text-sm"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="self-start rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? 'Thinking…' : 'Edit'}
            </button>
          </form>

          {messages.length > 0 && (
            <button
              type="button"
              onClick={() => {
                lastAutoSubmittedAssistantMessageIdRef.current = null
                setMessages([])
              }}
              disabled={isLoading}
              className="mt-2 rounded-md border border-gray-600 px-2 py-1 text-xs text-gray-400 hover:bg-gray-800 disabled:opacity-50"
            >
              Clear AI history
            </button>
          )}

          {messages.length > 0 && (
            <div className="mt-3 max-h-64 space-y-2 overflow-auto rounded-lg border border-gray-700 bg-gray-950/50 p-3 text-xs">
              {messages.map((m) => (
                <div key={m.id} className="space-y-1">
                  <div className="font-semibold text-gray-300">{m.role === 'user' ? 'You' : 'AI'}</div>
                  {m.parts.map((part, i) => {
                    if (part.type === 'text') {
                      return (
                        <div key={i} className="whitespace-pre-wrap text-gray-300">
                          {part.text}
                        </div>
                      )
                    }
                    if (part.type.startsWith('tool-')) {
                      const tp = part as { type: string; state?: string; input?: unknown }
                      const toolName = tp.type.replace('tool-', '')
                      const args = tp.input
                      const done = tp.state === 'output-available' || tp.state === 'result'
                      return (
                        <div
                          key={i}
                          className="ml-2 border-l-2 border-gray-700 pl-2 font-mono text-[11px] text-gray-500"
                        >
                          <span className="text-gray-300">→ {toolName}</span>
                          {!!args && typeof args === 'object' && Object.keys(args).length > 0 && (
                            <span className="ml-1 text-gray-500">
                              (
                              {Object.entries(args as Record<string, unknown>)
                                .map(
                                  ([k, v]) =>
                                    `${k}: ${
                                      typeof v === 'string'
                                        ? `"${v.length > 40 ? v.slice(0, 40) + '…' : v}"`
                                        : JSON.stringify(v)
                                    }`
                                )
                                .join(', ')}
                              )
                            </span>
                          )}
                          {done && <span className="ml-1 text-green-400">✓</span>}
                        </div>
                      )
                    }
                    return null
                  })}
                </div>
              ))}
            </div>
          )}

          {isLoading && (
            <p className="mt-2 text-xs text-gray-500">
              Processing…{' '}
              {toolCallCount > 0 ? `(${toolCallCount} tool call${toolCallCount !== 1 ? 's' : ''} so far)` : ''}
            </p>
          )}
          {error && <p className="mt-2 text-xs text-red-400">Error: {error.message}</p>}
        </>
      )}
    </div>
  )
}
