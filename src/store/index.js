import { configureStore, createListenerMiddleware } from '@reduxjs/toolkit';
import recipesReducer  from './recipesSlice';
import favoritesReducer, { addFavorite, removeFavorite } from './favoritesSlice';
import mealPlanReducer, { addToMealPlan, removeFromMealPlan, moveRecipe, setWeek, clearMealPlan } from './mealPlanSlice';
import userReducer from './userSlice';
import { saveFavoritesToFirestore, saveMealPlanToFirestore } from '../services/authService';
import { getWeekId } from '../utils/weekUtils';

const listener = createListenerMiddleware();

// Persist favorites to Firestore whenever they change (user must be authenticated)
const FAVORITES_ACTIONS = [addFavorite.type, removeFavorite.type];
FAVORITES_ACTIONS.forEach((type) => {
  listener.startListening({
    type,
    effect: async (_action, api) => {
      const { user, favorites } = api.getState();
      if (!user.isAuthenticated) return;
      try {
        await saveFavoritesToFirestore(user.uid, favorites.items);
      } catch {
        // non-fatal — local state is still correct
      }
    },
  });
});

// Persist meal plan to Firestore whenever it changes
const MEALPLAN_ACTIONS = [addToMealPlan.type, removeFromMealPlan.type, moveRecipe.type, setWeek.type, clearMealPlan.type];
MEALPLAN_ACTIONS.forEach((type) => {
  listener.startListening({
    type,
    effect: async (_action, api) => {
      const { user, mealPlan } = api.getState();
      if (!user.isAuthenticated) return;
      try {
        await saveMealPlanToFirestore(user.uid, getWeekId(), mealPlan.week);
      } catch {
        // non-fatal
      }
    },
  });
});

export const store = configureStore({
  reducer: {
    recipes:  recipesReducer,
    favorites: favoritesReducer,
    mealPlan: mealPlanReducer,
    user:     userReducer,
  },
  middleware: (getDefault) =>
    getDefault().prepend(listener.middleware),
});
