import { z } from 'zod'

/** Every tool returns this discriminated result so the model can self-correct. */
export type ToolResult<T = unknown> =
  | { ok: true; data: T }
  | { ok: false; error: string }

/**
 * A client-side tool: a zod-validated schema plus a browser-side `execute`
 * that mutates the Redux store. The Netlify transport only ships the schema +
 * description to the model; execution happens here via onToolCall.
 */
export type AIToolDefinition<TInput = unknown, TOutput = unknown> = {
  name: string
  description: string
  schema: z.ZodType<TInput>
  execute: (input: TInput) => ToolResult<TOutput>
}

export type Provider = 'anthropic' | 'openai' | 'google'
