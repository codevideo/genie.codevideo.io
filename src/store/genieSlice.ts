import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { IAction } from '@fullstackcraftllc/codevideo-types'

export type UserMode = 'learner' | 'creator'
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced'
export type LearningStyle = 'detailed' | 'concise' | 'project-based'

interface LearnerProfile {
  experienceLevel: ExperienceLevel
  learningStyle: LearningStyle
  knownLanguages: string[]
  interests: string[]
}

interface GenieState {
  userMode: UserMode | null
  learnerProfile: LearnerProfile
  currentPrompt: string
  lessonName: string
  lessonDescription: string
  generatedActions: IAction[]
  // index the IDE is replaying; the parent advances it as each action finishes
  currentActionIndex: number
  isGenerating: boolean
  isComplete: boolean
  generationCount: number // for free tier tracking
}

const initialState: GenieState = {
  userMode: null,
  learnerProfile: {
    experienceLevel: 'intermediate',
    learningStyle: 'concise',
    knownLanguages: [],
    interests: [],
  },
  currentPrompt: '',
  lessonName: '',
  lessonDescription: '',
  generatedActions: [],
  currentActionIndex: 0,
  isGenerating: false,
  isComplete: false,
  generationCount: 0,
}

const genieSlice = createSlice({
  name: 'genie',
  initialState,
  reducers: {
    setUserMode(state, action: PayloadAction<UserMode>) {
      state.userMode = action.payload
    },
    setLearnerProfile(state, action: PayloadAction<Partial<LearnerProfile>>) {
      state.learnerProfile = { ...state.learnerProfile, ...action.payload }
    },
    setCurrentPrompt(state, action: PayloadAction<string>) {
      state.currentPrompt = action.payload
    },
    // --- streaming lifecycle ---
    // clear previous output and arm playback before a new generation
    startGeneration(state, action: PayloadAction<string>) {
      state.currentPrompt = action.payload
      state.lessonName = ''
      state.lessonDescription = ''
      state.generatedActions = []
      state.currentActionIndex = 0
      state.isGenerating = true
      state.isComplete = false
    },
    setLessonName(state, action: PayloadAction<string>) {
      state.lessonName = action.payload
    },
    setLessonDescription(state, action: PayloadAction<string>) {
      state.lessonDescription = action.payload
    },
    // append one streamed action (the append-stable contract the IDE guarantees)
    appendLessonAction(state, action: PayloadAction<IAction>) {
      state.generatedActions.push(action.payload)
    },
    // the IDE calls actionFinishedCallback once an action's animation completes
    advanceActionIndex(state) {
      state.currentActionIndex += 1
    },
    // stream closed: flip isGenerating off so a starved playback completes
    finishGeneration(state) {
      state.isGenerating = false
    },
    markComplete(state) {
      state.isComplete = true
    },
    // used by the import-JSON flow (whole project at once)
    setGeneratedActions(state, action: PayloadAction<IAction[]>) {
      state.generatedActions = action.payload
      state.currentActionIndex = 0
      state.isGenerating = false
      state.isComplete = false
    },

    // --- BYOK helper: build + edit the generated actions ---
    // appendAction / appendActions stream FORWARD like the WS path (no rewind),
    // so the helper can BUILD a lesson live, not just edit one. The surgical
    // edits below (insert/edit/delete/move) instead rewind playback to 0 and
    // clear isComplete: a non-append change bumps the IDE's actionsEpoch, and
    // rewinding makes it replay the *corrected* lesson from the top (the index-0
    // path's 1s start delay debounces a multi-tool batch into one clean replay).
    // Bounds are guarded defensively even though the tools validate first.
    appendAction(state, action: PayloadAction<IAction>) {
      state.generatedActions.push(action.payload)
      state.isComplete = false
    },
    appendActions(state, action: PayloadAction<IAction[]>) {
      state.generatedActions.push(...action.payload)
      state.isComplete = false
    },
    insertActionAfter(state, action: PayloadAction<{ index: number; action: IAction }>) {
      const { index, action: newAction } = action.payload
      // index -1 inserts at the front; clamp into [-1, length-1]
      const at = Math.min(Math.max(index, -1), state.generatedActions.length - 1)
      state.generatedActions.splice(at + 1, 0, newAction)
      state.currentActionIndex = 0
      state.isComplete = false
    },
    editAction(state, action: PayloadAction<{ index: number; action: IAction }>) {
      const { index, action: newAction } = action.payload
      if (index >= 0 && index < state.generatedActions.length) {
        state.generatedActions[index] = newAction
        state.currentActionIndex = 0
        state.isComplete = false
      }
    },
    deleteAction(state, action: PayloadAction<number>) {
      const index = action.payload
      if (index >= 0 && index < state.generatedActions.length) {
        state.generatedActions.splice(index, 1)
        state.currentActionIndex = 0
        state.isComplete = false
      }
    },
    moveAction(state, action: PayloadAction<{ from: number; to: number }>) {
      const { from, to } = action.payload
      const len = state.generatedActions.length
      if (from >= 0 && from < len) {
        const [moved] = state.generatedActions.splice(from, 1)
        const dest = Math.min(Math.max(to, 0), state.generatedActions.length)
        state.generatedActions.splice(dest, 0, moved)
        state.currentActionIndex = 0
        state.isComplete = false
      }
    },
    setIsGenerating(state, action: PayloadAction<boolean>) {
      state.isGenerating = action.payload
    },
    incrementGenerationCount(state) {
      state.generationCount += 1
    },
    resetGenie(state) {
      state.currentPrompt = ''
      state.lessonName = ''
      state.lessonDescription = ''
      state.generatedActions = []
      state.currentActionIndex = 0
      state.isGenerating = false
      state.isComplete = false
    },
  },
})

export const {
  setUserMode,
  setLearnerProfile,
  setCurrentPrompt,
  startGeneration,
  setLessonName,
  setLessonDescription,
  appendLessonAction,
  advanceActionIndex,
  finishGeneration,
  markComplete,
  setGeneratedActions,
  appendAction,
  appendActions,
  insertActionAfter,
  editAction,
  deleteAction,
  moveAction,
  setIsGenerating,
  incrementGenerationCount,
  resetGenie,
} = genieSlice.actions

// namespace export so the BYOK tool registry can dispatch without colliding
// with same-named tool functions (e.g. the editAction tool vs the editAction
// action creator)
export const genieActions = genieSlice.actions

export default genieSlice.reducer
