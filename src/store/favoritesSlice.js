import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getFavoritesFromFirestore } from '../services/authService';

export const loadFavorites = createAsyncThunk(
  'favorites/load',
  async (uid, { rejectWithValue }) => {
    try {
      return await getFavoritesFromFirestore(uid);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState: {
    items: [],
    status: 'idle',
  },
  reducers: {
    addFavorite(state, { payload }) {
      const exists = state.items.some((r) => r.id === payload.id);
      if (!exists) state.items.push(payload);
    },
    removeFavorite(state, { payload: id }) {
      state.items = state.items.filter((r) => r.id !== id);
    },
    clearFavorites(state) {
      state.items  = [];
      state.status = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadFavorites.pending,   (state) => { state.status = 'loading'; })
      .addCase(loadFavorites.fulfilled, (state, { payload }) => { state.status = 'succeeded'; state.items = payload; })
      .addCase(loadFavorites.rejected,  (state) => { state.status = 'failed'; });
  },
});

export const { addFavorite, removeFavorite, clearFavorites } = favoritesSlice.actions;
export default favoritesSlice.reducer;
