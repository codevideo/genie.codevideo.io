import { z } from 'zod'
import type { AIToolDefinition } from '../types'
import { store } from '@/store'
import { genieActions } from '@/store/genieSlice'
import { actionFields, toValidAction, currentActions } from './_shared'

const schema = z.object({ index: z.number().int().nonnegative(), ...actionFields }).strict()

export const editAction: AIToolDefinition<z.infer<typeof schema>, { editedIndex: number }> = {
  name: 'editAction',
  description: 'Replace the action at the given index with a new name/value.',
  schema,
  execute: ({ index, name, value }) => {
    const len = currentActions().length
    if (index >= len) {
      return { ok: false, error: `index ${index} is out of range. Valid range is 0 to ${len - 1}.` }
    }
    const v = toValidAction({ name, value })
    if (!v.ok) return { ok: false, error: v.error }
    store.dispatch(genieActions.editAction({ index, action: v.action }))
    return { ok: true, data: { editedIndex: index } }
  },
}
