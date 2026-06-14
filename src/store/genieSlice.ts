import { createSlice, PayloadAction } from '@reduxjs/toolkit'

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
  generatedActions: any[] | null
  isGenerating: boolean
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
  generatedActions: null,
  isGenerating: false,
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
    setGeneratedActions(state, action: PayloadAction<any[] | null>) {
      state.generatedActions = action.payload
    },
    setIsGenerating(state, action: PayloadAction<boolean>) {
      state.isGenerating = action.payload
    },
    incrementGenerationCount(state) {
      state.generationCount += 1
    },
    resetGenie(state) {
      state.currentPrompt = ''
      state.generatedActions = null
      state.isGenerating = false
    },
  },
})

export const {
  setUserMode,
  setLearnerProfile,
  setCurrentPrompt,
  setGeneratedActions,
  setIsGenerating,
  incrementGenerationCount,
  resetGenie,
} = genieSlice.actions

export default genieSlice.reducer
