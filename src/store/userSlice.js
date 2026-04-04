import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'user',
  initialState: {
    uid: null,
    email: null,
    displayName: null,
    isAuthenticated: false,
    authInitialized: false, // true after first onAuthStateChanged fires
  },
  reducers: {
    setUser(state, { payload }) {
      state.uid             = payload.uid;
      state.email           = payload.email;
      state.displayName     = payload.displayName;
      state.isAuthenticated = true;
      state.authInitialized = true;
    },
    clearUser(state) {
      state.uid             = null;
      state.email           = null;
      state.displayName     = null;
      state.isAuthenticated = false;
      state.authInitialized = true;
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
