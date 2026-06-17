import { z } from 'zod'
import { AllActionStrings } from '@fullstackcraftllc/codevideo-types'
import type { AIToolDefinition } from '../types'

const schema = z.object({}).strict()

export const getValidActionNames: AIToolDefinition<
  z.infer<typeof schema>,
  { actionNames: string[] }
> = {
  name: 'getValidActionNames',
  description:
    'Return every valid CodeVideo action name. Each action\'s "name" must be exactly one of these strings.',
  schema,
  execute: () => ({ ok: true, data: { actionNames: AllActionStrings } }),
}
