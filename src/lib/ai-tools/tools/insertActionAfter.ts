import { z } from 'zod'
import type { AIToolDefinition } from '../types'
import { store } from '@/store'
import { genieActions } from '@/store/genieSlice'
import { actionFields, toValidAction, currentActions } from './_shared'

const schema = z.object({ index: z.number().int(), ...actionFields }).strict()

export const insertActionAfter: AIToolDefinition<
  z.infer<typeof schema>,
  { insertedAtIndex: number }
> = {
  name: 'insertActionAfter',
  description:
    'Insert a new action immediately after the action at the given index. Use index -1 to insert at the very front of the lesson.',
  schema,
  execute: ({ index, name, value }) => {
    const len = currentActions().length
    if (index < -1 || index > len - 1) {
      return { ok: false, error: `index ${index} is out of range. Valid range is -1 (front) to ${len - 1}.` }
    }
    const v = toValidAction({ name, value })
    if (!v.ok) return { ok: false, error: v.error }
    store.dispatch(genieActions.insertActionAfter({ index, action: v.action }))
    return { ok: true, data: { insertedAtIndex: index + 1 } }
  },
}
