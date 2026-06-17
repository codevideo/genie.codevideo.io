import { z } from 'zod'
import type { AIToolDefinition } from '../types'
import { store } from '@/store'
import { genieActions } from '@/store/genieSlice'
import { currentActions } from './_shared'

const schema = z.object({ index: z.number().int().nonnegative() }).strict()

export const deleteAction: AIToolDefinition<
  z.infer<typeof schema>,
  { deletedIndex: number; newCount: number }
> = {
  name: 'deleteAction',
  description: 'Delete the action at the given index.',
  schema,
  execute: ({ index }) => {
    const len = currentActions().length
    if (index >= len) {
      return { ok: false, error: `index ${index} is out of range. Valid range is 0 to ${len - 1}.` }
    }
    store.dispatch(genieActions.deleteAction(index))
    return { ok: true, data: { deletedIndex: index, newCount: len - 1 } }
  },
}
