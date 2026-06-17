import { convertToModelMessages, stepCountIs, streamText, tool } from 'ai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createOpenAI } from '@ai-sdk/openai'
import { z } from 'zod'
import { AllActionStrings } from '@fullstackcraftllc/codevideo-types'

// ─── BYOK transport for the genie AI editing helper ──────────────────
// Thin bridge: the user's key arrives as a request header, is used for this
// one request, and is NEVER logged or persisted. The model calls tools whose
// schemas are declared here; the ACTUAL execution happens client-side in the
// browser (src/lib/ai-tools/tools) against the Redux store. These schemas must
// mirror that client registry 1:1.

type Provider = 'anthropic' | 'openai' | 'google'

const DEFAULT_MODELS: Record<Provider, string> = {
  anthropic: 'claude-sonnet-4-6',
  openai: 'gpt-5.2',
  google: 'gemini-2.5-pro',
}

// ─── System prompt: teaches the CodeVideo action vocabulary ──────────
const SYSTEM_PROMPT = `You are the CodeVideo lesson assistant. You build and refine a CodeVideo lesson: an ordered array of actions, each a simple JSON object { "name": string, "value": string }. You work ENTIRELY by calling tools; the live IDE re-renders as you go.

If the lesson is empty (or the user asks for a new lesson), BUILD it: emit the whole sequence with appendActions (preferred) or repeated appendAction — open and close with an author-speak-before action and interleave narration with the code/terminal steps. If it already has actions, make small surgical edits (insert/edit/delete/move) rather than rebuilding, unless the user asks to start over.

You do NOT write the actions as text — you call tools. Available tools:
- getCurrentActions() — the current actions with their indices. Indices shift after inserts/deletes/moves, so call this to re-ground before a follow-up edit.
- getValidActionNames() — every legal action "name".
- isRepeatableActionName({name}) — whether an action's value is a numeric repeat count.
- validateActions({actions}) — dry-run validate a proposed list before committing.
- appendActions({actions}) — append MANY actions at once; the primary way to build a lesson.
- appendAction({name, value}) — add a single action to the end.
- insertActionAfter({index, name, value}) — insert after an index (use -1 to insert at the front).
- editAction({index, name, value}) — replace the action at an index.
- deleteAction({index}) — remove the action at an index.
- moveAction({from, to}) — reorder.

CRITICAL RULES:
1. Reference actions by INDEX, never by content. After any insert/delete/move the indices shift — re-read with getCurrentActions if unsure.
2. Every action's "value" MUST be non-empty. "Repeatable" actions (e.g. editor-enter, editor-arrow-down) take a numeric string value — almost always "1", representing how many times to repeat. Check with isRepeatableActionName when unsure.
3. The ONLY narration action is "author-speak-before". Use it for everything the narrator says. Keep each speech to 2–3 sentences; split longer narration into multiple author-speak-before actions.
4. Do NOT use "file-explorer-create-file", "file-explorer-set-working-directory", or "file-explorer-set-file-contents" — those are internal. To CREATE a file, emit this exact click-flow: mouse-move-file-explorer ("1") → mouse-right-click ("1") → mouse-move-file-explorer-context-menu-new-file ("1") → mouse-left-click ("1") → file-explorer-type-new-file-input (the filename) → file-explorer-enter-new-file-input ("1"). To OPEN an existing file: mouse-move-file-explorer-file (the filename) → file-explorer-open-file ("1").
5. Prefer surgical edits (edit/insert/delete/move) over regenerating. Do not rebuild the whole lesson unless the user explicitly asks.
6. Emit ALL of your tool calls for a request in ONE response — do not call one tool and wait.
7. If a tool returns ok:false, read the error and adapt (e.g. call getValidActionNames after an unknown-name error, or getCurrentActions after an out-of-range index).
8. You may write one short sentence of preamble before your tool calls. Keep it brief.

The complete list of valid action names:
${AllActionStrings.map((a) => `- ${a}`).join('\n')}`

// ─── Tool schemas (server-side only — no execute) ────────────────────
const actionFields = {
  name: z.string().describe('One of the valid CodeVideo action names.'),
  value: z.string().min(1).describe('Non-empty. Literal content, OR a numeric string for repeatable actions.'),
}

const toolDefs = {
  getCurrentActions: tool({
    description:
      'Read the current actions with their indices. Indices shift after edits — call this to re-ground on a follow-up request.',
    inputSchema: z.object({}).strict(),
  }),
  getValidActionNames: tool({
    description: 'Return every valid CodeVideo action name. An action\'s "name" must be one of these.',
    inputSchema: z.object({}).strict(),
  }),
  isRepeatableActionName: tool({
    description:
      'Check whether an action name is repeatable — i.e. its value is a numeric repeat count rather than literal content.',
    inputSchema: z.object({ name: z.string() }).strict(),
  }),
  validateActions: tool({
    description:
      'Validate a proposed list of actions WITHOUT applying them. Returns isValid plus per-action errors.',
    inputSchema: z.object({ actions: z.array(z.object(actionFields).strict()) }).strict(),
  }),
  appendAction: tool({
    description: 'Append a single new action to the end of the lesson.',
    inputSchema: z.object(actionFields).strict(),
  }),
  appendActions: tool({
    description:
      'Append MANY actions at once to BUILD a lesson (or a chunk) from scratch. Validated as a batch.',
    inputSchema: z.object({ actions: z.array(z.object(actionFields).strict()) }).strict(),
  }),
  insertActionAfter: tool({
    description:
      'Insert a new action immediately after the action at the given index. Use index -1 to insert at the very front.',
    inputSchema: z.object({ index: z.number().int(), ...actionFields }).strict(),
  }),
  editAction: tool({
    description: 'Replace the action at the given index with a new name/value.',
    inputSchema: z.object({ index: z.number().int().nonnegative(), ...actionFields }).strict(),
  }),
  deleteAction: tool({
    description: 'Delete the action at the given index.',
    inputSchema: z.object({ index: z.number().int().nonnegative() }).strict(),
  }),
  moveAction: tool({
    description: 'Move the action at index `from` to index `to`, shifting the others.',
    inputSchema: z.object({ from: z.number().int().nonnegative(), to: z.number().int().nonnegative() }).strict(),
  }),
}

const json = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })

const handler = async (request: Request): Promise<Response> => {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204 })
  }
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405)
  }

  const provider = request.headers.get('x-byok-provider') as Provider | null
  const apiKey = request.headers.get('x-byok-key')
  const requestedModel = request.headers.get('x-byok-model')

  if (!apiKey || (provider !== 'anthropic' && provider !== 'openai' && provider !== 'google')) {
    return json({ error: 'Missing or invalid BYOK headers (x-byok-provider, x-byok-key).' }, 400)
  }

  let body: { messages?: unknown; currentActionsSnapshot?: unknown }
  try {
    body = await request.json()
  } catch {
    return json({ error: 'Invalid JSON body' }, 400)
  }

  const modelId = requestedModel?.trim() || DEFAULT_MODELS[provider]
  const model =
    provider === 'anthropic'
      ? createAnthropic({ apiKey })(modelId)
      : provider === 'google'
        ? createGoogleGenerativeAI({ apiKey })(modelId)
        : createOpenAI({ apiKey })(modelId)

  const system =
    body.currentActionsSnapshot != null
      ? `${SYSTEM_PROMPT}\n\nCurrent actions (snapshot at the start of this turn):\n${JSON.stringify(body.currentActionsSnapshot, null, 2)}`
      : SYSTEM_PROMPT

  const result = streamText({
    model,
    system,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    messages: await convertToModelMessages((body.messages ?? []) as any),
    tools: toolDefs,
    stopWhen: stepCountIs(12),
  })

  return result.toUIMessageStreamResponse()
}

export default handler
