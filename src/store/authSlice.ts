import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface AuthState {
  tokenRefreshSignal: number
  showSignInOverlay: boolean
}

const initialState: AuthState = {
  tokenRefreshSignal: 0,
  showSignInOverlay: false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    signalTokenRefresh(state) {
      state.tokenRefreshSignal += 1
    },
    setShowSignInOverlay(state, action: PayloadAction<boolean>) {
      state.showSignInOverlay = action.payload
    },
  },
})

export const { signalTokenRefresh, setShowSignInOverlay } = authSlice.actions
export default authSlice.reducer
