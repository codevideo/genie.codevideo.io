import { z } from 'zod'
import { isValidActions } from '@fullstackcraftllc/codevideo-types'
import type { IAction } from '@fullstackcraftllc/codevideo-types'
import type { AIToolDefinition } from '../types'
import { actionFields } from './_shared'

const schema = z.object({ actions: z.array(z.object(actionFields).strict()) }).strict()

export const validateActions: AIToolDefinition<
  z.infer<typeof schema>,
  { isValid: boolean; errors: { message: string; actionIndex: number }[] }
> = {
  name: 'validateActions',
  description:
    'Validate a proposed list of actions WITHOUT applying them. Returns isValid plus per-action errors. Use it to check a plan before committing edits.',
  schema,
  execute: ({ actions }) => {
    // IAction[] is a valid Project; isValidActions returns { isValid, errors }
    const result = isValidActions(actions as IAction[])
    return { ok: true, data: result }
  },
}
