import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getMealPlanFromFirestore } from '../services/authService';
import { emptyWeek } from '../utils/weekUtils';

export const loadMealPlan = createAsyncThunk(
  'mealPlan/load',
  async ({ uid, weekId }, { rejectWithValue }) => {
    try {
      const data = await getMealPlanFromFirestore(uid, weekId);
      return data ?? emptyWeek();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const mealPlanSlice = createSlice({
  name: 'mealPlan',
  initialState: {
    week: emptyWeek(),
    status: 'idle',
  },
  reducers: {
    addToMealPlan(state, { payload: { day, recipe } }) {
      const exists = state.week[day].some((r) => r.id === recipe.id);
      if (!exists) state.week[day].push(recipe);
    },
    removeFromMealPlan(state, { payload: { day, recipeId } }) {
      state.week[day] = state.week[day].filter((r) => r.id !== recipeId);
    },
    moveRecipe(state, { payload: { from, to, recipeId } }) {
      const idx = state.week[from].findIndex((r) => r.id === recipeId);
      if (idx === -1) return;
      const [recipe] = state.week[from].splice(idx, 1);
      const exists = state.week[to].some((r) => r.id === recipeId);
      if (!exists) state.week[to].push(recipe);
    },
    setWeek(state, { payload }) {
      state.week = payload;
    },
    clearMealPlan(state) {
      state.week   = emptyWeek();
      state.status = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadMealPlan.pending,   (state) => { state.status = 'loading'; })
      .addCase(loadMealPlan.fulfilled, (state, { payload }) => {
        state.status = 'succeeded';
        const { weekId, ...days } = payload;
        state.week = { ...emptyWeek(), ...days };
      })
      .addCase(loadMealPlan.rejected,  (state) => { state.status = 'failed'; });
  },
});

export const { addToMealPlan, removeFromMealPlan, moveRecipe, setWeek, clearMealPlan } = mealPlanSlice.actions;
export default mealPlanSlice.reducer;
