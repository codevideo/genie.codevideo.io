import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'
import genieReducer from './genieSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    genie: genieReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
