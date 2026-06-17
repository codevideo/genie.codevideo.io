import { z } from 'zod'
import type { AIToolDefinition } from '../types'
import { currentActions } from './_shared'

const schema = z.object({}).strict()

type ActionRow = { index: number; name: string; value: string }

export const getCurrentActions: AIToolDefinition<
  z.infer<typeof schema>,
  { count: number; actions: ActionRow[] }
> = {
  name: 'getCurrentActions',
  description:
    'Read the current list of CodeVideo actions with their indices. Actions are referenced by index, and indices shift after inserts/deletes/moves — call this to re-ground before a follow-up edit.',
  schema,
  execute: () => {
    const actions = currentActions()
    return {
      ok: true,
      data: {
        count: actions.length,
        actions: actions.map((a, index) => ({ index, name: a.name, value: a.value })),
      },
    }
  },
}
