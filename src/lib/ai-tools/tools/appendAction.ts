import { z } from 'zod'
import type { AIToolDefinition } from '../types'
import { store } from '@/store'
import { genieActions } from '@/store/genieSlice'
import { actionFields, toValidAction, currentActions } from './_shared'

const schema = z.object(actionFields).strict()

export const appendAction: AIToolDefinition<z.infer<typeof schema>, { appendedIndex: number }> = {
  name: 'appendAction',
  description: 'Append a new action to the end of the lesson.',
  schema,
  execute: ({ name, value }) => {
    const v = toValidAction({ name, value })
    if (!v.ok) return { ok: false, error: v.error }
    store.dispatch(genieActions.appendAction(v.action))
    return { ok: true, data: { appendedIndex: currentActions().length - 1 } }
  },
}
