import { getCurrentActions } from './getCurrentActions'
import { getValidActionNames } from './getValidActionNames'
import { isRepeatableActionName } from './isRepeatableActionName'
import { validateActions } from './validateActions'
import { appendAction } from './appendAction'
import { appendActions } from './appendActions'
import { insertActionAfter } from './insertActionAfter'
import { editAction } from './editAction'
import { deleteAction } from './deleteAction'
import { moveAction } from './moveAction'
import type { AIToolDefinition } from '../types'

// One file per tool, registered here. Adding a tool = one new file + one entry.
// The server transport (functions/ai-helper.ts) carries matching schemas so the
// model knows what it can call; execution happens here in the browser.
export const toolRegistry: Record<string, AIToolDefinition<never, unknown>> = {
  getCurrentActions: getCurrentActions as unknown as AIToolDefinition<never, unknown>,
  getValidActionNames: getValidActionNames as unknown as AIToolDefinition<never, unknown>,
  isRepeatableActionName: isRepeatableActionName as unknown as AIToolDefinition<never, unknown>,
  validateActions: validateActions as unknown as AIToolDefinition<never, unknown>,
  appendAction: appendAction as unknown as AIToolDefinition<never, unknown>,
  appendActions: appendActions as unknown as AIToolDefinition<never, unknown>,
  insertActionAfter: insertActionAfter as unknown as AIToolDefinition<never, unknown>,
  editAction: editAction as unknown as AIToolDefinition<never, unknown>,
  deleteAction: deleteAction as unknown as AIToolDefinition<never, unknown>,
  moveAction: moveAction as unknown as AIToolDefinition<never, unknown>,
}

export type ToolName = keyof typeof toolRegistry
