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
  setIsGenerating,
  incrementGenerationCount,
  resetGenie,
} = genieSlice.actions

export default genieSlice.reducer
