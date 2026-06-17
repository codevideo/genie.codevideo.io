import { z } from 'zod'
import { isValidAction } from '@fullstackcraftllc/codevideo-types'
import type { IAction } from '@fullstackcraftllc/codevideo-types'
import { store } from '@/store'

// name + value are the only two fields of an IAction; reused by every tool
// that accepts a literal action. (Kept as a plain string here — isValidAction
// narrows to the AllActions literal union below.)
export const actionFields = {
  name: z.string(),
  value: z.string(),
}

export type ActionCandidate = { name: string; value: string }

/** The actions the IDE is currently rendering. */
export const currentActions = (): IAction[] => store.getState().genie.generatedActions

export type ValidatedAction = { ok: true; action: IAction } | { ok: false; error: string }

/**
 * Validate a raw {name,value} from the model. isValidAction is a type guard
 * that rejects unknown names (not in AllActionStrings) and empty values, and
 * narrows the candidate to a properly-typed IAction on success — exactly the
 * gate we want before dispatching a mutation.
 */
export const toValidAction = (candidate: ActionCandidate): ValidatedAction => {
  if (isValidAction(candidate)) {
    return { ok: true, action: candidate }
  }
  return {
    ok: false,
    error: `"${candidate.name}" is not a valid action name or its value is empty. Call getValidActionNames for the allowed names; every action needs a non-empty value.`,
  }
}
