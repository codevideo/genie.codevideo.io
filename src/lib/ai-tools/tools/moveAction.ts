import { z } from 'zod'
import type { AIToolDefinition } from '../types'
import { store } from '@/store'
import { genieActions } from '@/store/genieSlice'
import { currentActions } from './_shared'

const schema = z.object({ from: z.number().int().nonnegative(), to: z.number().int().nonnegative() }).strict()

export const moveAction: AIToolDefinition<z.infer<typeof schema>, { from: number; to: number }> = {
  name: 'moveAction',
  description: 'Move the action at index `from` to index `to`, shifting the others.',
  schema,
  execute: ({ from, to }) => {
    const len = currentActions().length
    if (from >= len) {
      return { ok: false, error: `from ${from} is out of range. Valid range is 0 to ${len - 1}.` }
    }
    if (to >= len) {
      return { ok: false, error: `to ${to} is out of range. Valid range is 0 to ${len - 1}.` }
    }
    store.dispatch(genieActions.moveAction({ from, to }))
    return { ok: true, data: { from, to } }
  },
}
