import { z } from 'zod'
import type { IAction } from '@fullstackcraftllc/codevideo-types'
import type { AIToolDefinition } from '../types'
import { store } from '@/store'
import { genieActions } from '@/store/genieSlice'
import { actionFields, toValidAction, currentActions } from './_shared'

const schema = z.object({ actions: z.array(z.object(actionFields).strict()) }).strict()

export const appendActions: AIToolDefinition<
  z.infer<typeof schema>,
  { appended: number; total: number }
> = {
  name: 'appendActions',
  description:
    'Append MANY actions to the end of the lesson in one call — use this to BUILD a lesson (or a chunk) from scratch. Validated as a batch: if any action is invalid the whole batch is rejected and nothing is added.',
  schema,
  execute: ({ actions }) => {
    const valid: IAction[] = []
    for (let i = 0; i < actions.length; i++) {
      const v = toValidAction(actions[i])
      if (!v.ok) return { ok: false, error: `action[${i}] ("${actions[i].name}"): ${v.error}` }
      valid.push(v.action)
    }
    store.dispatch(genieActions.appendActions(valid))
    return { ok: true, data: { appended: valid.length, total: currentActions().length } }
  },
}
