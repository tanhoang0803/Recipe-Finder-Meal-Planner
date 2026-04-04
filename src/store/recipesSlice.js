import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { searchRecipes, getRecipeById, searchByIngredients, searchRecipeImage } from '../services/recipeService';
import { suggestRecipes } from '../services/aiService';
import { isCacheValid, makeCacheKey } from '../utils/cacheUtils';

export const fetchRecipes = createAsyncThunk(
  'recipes/fetchRecipes',
  async ({ query, options = {} }, { getState, rejectWithValue }) => {
    const key = makeCacheKey(query, options);
    const cached = getState().recipes.cache[key];
    if (cached && isCacheValid(cached.timestamp)) {
      return { results: cached.data, cacheKey: key, fromCache: true };
    }
    try {
      const results = await searchRecipes(query, options);
      return { results, cacheKey: key, fromCache: false };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchRecipeById = createAsyncThunk(
  'recipes/fetchRecipeById',
  async (id, { rejectWithValue }) => {
    try {
      return await getRecipeById(id);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchByIngredients = createAsyncThunk(
  'recipes/fetchByIngredients',
  async (ingredients, { rejectWithValue }) => {
    try {
      return await searchByIngredients(ingredients);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchAISuggestions = createAsyncThunk(
  'recipes/fetchAISuggestions',
  async (ingredients, { rejectWithValue }) => {
    try {
      const suggestions = await suggestRecipes(ingredients);
      const withImages = await Promise.all(
        suggestions.map(async (recipe) => {
          const image = await searchRecipeImage(recipe.title);
          return { ...recipe, image };
        })
      );
      return withImages;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const recipesSlice = createSlice({
  name: 'recipes',
  initialState: {
    results: [],
    selectedRecipe: null,
    status: 'idle',
    error: null,
    cache: {},
  },
  reducers: {
    setSelectedRecipe(state, { payload }) {
      state.selectedRecipe = payload;
    },
    clearResults(state) {
      state.results = [];
      state.status  = 'idle';
      state.error   = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchRecipes
      .addCase(fetchRecipes.pending,    (state) => { state.status = 'loading'; state.error = null; })
      .addCase(fetchRecipes.fulfilled,  (state, { payload }) => {
        state.status  = 'succeeded';
        state.results = payload.results;
        if (!payload.fromCache) {
          state.cache[payload.cacheKey] = { data: payload.results, timestamp: Date.now() };
        }
      })
      .addCase(fetchRecipes.rejected,   (state, { payload }) => { state.status = 'failed'; state.error = payload; })
      // fetchRecipeById
      .addCase(fetchRecipeById.fulfilled, (state, { payload }) => { state.selectedRecipe = payload; })
      // fetchByIngredients
      .addCase(fetchByIngredients.pending,   (state) => { state.status = 'loading'; state.error = null; })
      .addCase(fetchByIngredients.fulfilled, (state, { payload }) => { state.status = 'succeeded'; state.results = payload; })
      .addCase(fetchByIngredients.rejected,  (state, { payload }) => { state.status = 'failed'; state.error = payload; })
      // fetchAISuggestions
      .addCase(fetchAISuggestions.pending,   (state) => { state.status = 'loading'; state.error = null; })
      .addCase(fetchAISuggestions.fulfilled, (state, { payload }) => { state.status = 'succeeded'; state.results = payload; })
      .addCase(fetchAISuggestions.rejected,  (state, { payload }) => { state.status = 'failed'; state.error = payload; });
  },
});

export const { setSelectedRecipe, clearResults } = recipesSlice.actions;
export default recipesSlice.reducer;
