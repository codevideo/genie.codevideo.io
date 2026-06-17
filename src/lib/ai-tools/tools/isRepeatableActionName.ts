import { z } from 'zod'
import { isRepeatableAction } from '@fullstackcraftllc/codevideo-types'
import type { IAction } from '@fullstackcraftllc/codevideo-types'
import type { AIToolDefinition } from '../types'

const schema = z.object({ name: z.string() }).strict()

export const isRepeatableActionName: AIToolDefinition<
  z.infer<typeof schema>,
  { name: string; repeatable: boolean }
> = {
  name: 'isRepeatableActionName',
  description:
    'Check whether an action name is "repeatable" — i.e. its value is a numeric repeat count (how many times to perform it) rather than literal content like text or code.',
  schema,
  // isRepeatableAction reads action.name, so pass a well-formed IAction
  execute: ({ name }) => ({
    ok: true,
    data: { name, repeatable: isRepeatableAction({ name, value: '1' } as IAction) },
  }),
}
